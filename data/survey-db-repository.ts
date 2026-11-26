import { getClient, query } from '@/lib/db'
import type {
  ActiveSurveySession,
  AllocatedPainting,
  CompleteSurveyInput,
  CompleteSurveyResult,
  Respondent,
  SaveAnswerInput,
  SaveAnswerResult,
  ServerPaintingAnswer,
  StartSurveyResult,
  SurveySession,
} from '@/domain/survey'
import { resolvePaintingImageUrl } from '@/domain/survey'

export interface ISurveyDbRepository {
  startOrResumeSession(respondent: Respondent): Promise<StartSurveyResult>
  getCurrentSession(sessionId: string): Promise<{ session: ActiveSurveySession | null; expired: boolean; completed: boolean }>
  saveAnswer(input: SaveAnswerInput): Promise<SaveAnswerResult>
  completeSurvey(input: CompleteSurveyInput): Promise<CompleteSurveyResult>
  saveSurveyResult(session: SurveySession): Promise<{ respondentId: string }>
}

export const surveyDbRepository: ISurveyDbRepository = {
  /**
   * 1. Start or Resume Survey Session with Atomic Painting Allocation
   * Concurrency strategy: Transaction-scoped PostgreSQL Advisory Lock (pg_advisory_xact_lock)
   */
  async startOrResumeSession(respondent: Respondent): Promise<StartSurveyResult> {
    const client = await getClient()

    try {
      await client.query('BEGIN ISOLATION LEVEL READ COMMITTED')

      // 1. Acquire transaction-level advisory lock to serialize the allocation step across concurrent users.
      // Automatically released when the transaction is committed or rolled back.
      await client.query("SELECT pg_advisory_xact_lock(hashtext('survey_allocation_lock'))")

      // 2. Upsert respondent by LOWER(email)
      const inputAge = respondent.age ? Number(respondent.age) : 20
      const isAdultEligible = Boolean(respondent.allowAdultContent && inputAge >= 18)

      const respondentUpsertQuery = `
        INSERT INTO respondents (name, email, gender, age, education, allow_adult_content, created_at, updated_at)
        VALUES ($1, LOWER($2), $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (LOWER(email))
        DO UPDATE SET
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          age = EXCLUDED.age,
          education = EXCLUDED.education,
          allow_adult_content = EXCLUDED.allow_adult_content,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, age, allow_adult_content;
      `
      const respondentResult = await client.query(respondentUpsertQuery, [
        respondent.name.trim(),
        respondent.email.trim(),
        respondent.gender || 'Laki-laki',
        inputAge,
        respondent.education || 'S1',
        isAdultEligible,
      ])
      const respondentId = respondentResult.rows[0].id
      const respondentAge = Number(respondentResult.rows[0].age)
      const allowAdultContent = Boolean(respondentResult.rows[0].allow_adult_content)

      // 3. Check for existing active IN_PROGRESS session that has NOT expired
      const activeSessionCheck = await client.query(
        `
        SELECT id, respondent_id, status, started_at, expires_at
        FROM survey_sessions
        WHERE respondent_id = $1
          AND status = 'IN_PROGRESS'
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1;
        `,
        [respondentId]
      )

      if (activeSessionCheck.rows.length > 0) {
        const activeSessionRow = activeSessionCheck.rows[0]
        const session = await hydrateSession(client, activeSessionRow.id, respondentId, activeSessionRow.status, activeSessionRow.started_at, activeSessionRow.expires_at)
        await client.query('COMMIT')
        return {
          success: true,
          resumed: true,
          session,
        }
      }

      // 4. Lazy-expire any past IN_PROGRESS session that already expired (expires_at <= CURRENT_TIMESTAMP)
      await client.query(
        `
        UPDATE survey_sessions
        SET status = 'ABANDONED', updated_at = CURRENT_TIMESTAMP
        WHERE respondent_id = $1
          AND status = 'IN_PROGRESS'
          AND expires_at <= CURRENT_TIMESTAMP;
        `,
        [respondentId]
      )

      // 5. Create new session with 24-hour expiration
      const newSessionResult = await client.query(
        `
        INSERT INTO survey_sessions (respondent_id, status, allow_adult_content, started_at, expires_at)
        VALUES ($1, 'IN_PROGRESS', $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '24 hours')
        RETURNING id, status, started_at, expires_at;
        `,
        [respondentId, allowAdultContent]
      )
      const newSessionRow = newSessionResult.rows[0]
      const sessionId = newSessionRow.id

      // 6. Allocation Query:
      // - Score: answered_count (1.0) + reserved_count (0.5)
      // - Exclude paintings already answered by this respondent
      // - Adult content filter: Only included if respondent is >= 18 AND opted-in (allowAdultContent = TRUE)
      // - Soft penalty ordering (lowest score first) + RANDOM() tie-breaker
      const allocationQuery = `
        WITH active_reserved AS (
            SELECT ssp.painting_id, COUNT(*)::int AS reserved_count
            FROM survey_session_paintings ssp
            JOIN survey_sessions ss ON ss.id = ssp.session_id
            LEFT JOIN survey_answers sa ON sa.session_painting_id = ssp.id
            WHERE ss.status = 'IN_PROGRESS'
              AND ss.expires_at > CURRENT_TIMESTAMP
              AND sa.id IS NULL
            GROUP BY ssp.painting_id
        ),
        globally_answered AS (
            SELECT ssp.painting_id, COUNT(sa.id)::int AS answered_count
            FROM survey_session_paintings ssp
            JOIN survey_answers sa ON sa.session_painting_id = ssp.id
            GROUP BY ssp.painting_id
        ),
        respondent_answered AS (
            SELECT DISTINCT ssp.painting_id
            FROM survey_session_paintings ssp
            JOIN survey_answers sa ON sa.session_painting_id = ssp.id
            JOIN survey_sessions ss ON ss.id = ssp.session_id
            WHERE ss.respondent_id = $1
        ),
        scored_candidates AS (
            SELECT 
                p.id,
                p.title,
                p.detail,
                p.image_key,
                (COALESCE(ga.answered_count, 0) * 1.0 + COALESCE(ar.reserved_count, 0) * 0.5) AS coverage_score
            FROM paintings p
            LEFT JOIN globally_answered ga ON ga.painting_id = p.id
            LEFT JOIN active_reserved ar ON ar.painting_id = p.id
            WHERE 
                p.id NOT IN (SELECT painting_id FROM respondent_answered)
                AND (($2 >= 18 AND $3 = TRUE) OR p.is_adult_content = FALSE)
        )
        SELECT id, title, detail, image_key, coverage_score
        FROM scored_candidates
        ORDER BY coverage_score ASC, RANDOM()
        LIMIT 20;
      `
      const candidateResult = await client.query(allocationQuery, [
        respondentId,
        respondentAge,
        allowAdultContent,
      ])

      if (candidateResult.rows.length === 0) {
        const answeredCountRes = await client.query(
          `
          SELECT COUNT(DISTINCT ssp.painting_id)::int AS total_answered
          FROM survey_session_paintings ssp
          JOIN survey_answers sa ON sa.session_painting_id = ssp.id
          JOIN survey_sessions ss ON ss.id = ssp.session_id
          WHERE ss.respondent_id = $1;
          `,
          [respondentId]
        )
        const totalAnswered = answeredCountRes.rows[0]?.total_answered || 0
        if (totalAnswered > 0) {
          const err: any = new Error(
            `Email ${respondent.email.trim()} sudah melakukan survei dan menilai seluruh koleksi lukisan yang tersedia dalam penelitian ini. Terima kasih banyak atas dedikasi dan kontribusi berharga Anda!`
          )
          err.code = 'ALL_PAINTINGS_EVALUATED'
          err.title = 'Seluruh Lukisan Telah Dinilai'
          err.action = 'GO_HOME'
          throw err
        }

        const err: any = new Error('Tidak ada lukisan kandidat yang tersedia untuk responden ini.')
        err.code = 'NO_PAINTINGS_AVAILABLE'
        err.title = 'Koleksi Belum Tersedia'
        err.action = 'GO_HOME'
        throw err
      }

      // 7. Insert allocations into survey_session_paintings
      const paintingsToAllocate = candidateResult.rows
      for (let i = 0; i < paintingsToAllocate.length; i++) {
        const painting = paintingsToAllocate[i]
        await client.query(
          `
          INSERT INTO survey_session_paintings (session_id, painting_id, display_order, assigned_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          `,
          [sessionId, painting.id, i + 1]
        )
      }

      const session = await hydrateSession(client, sessionId, respondentId, newSessionRow.status, newSessionRow.started_at, newSessionRow.expires_at)
      await client.query('COMMIT')

      return {
        success: true,
        resumed: false,
        session,
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  /**
   * 2. Get Current Session with Passive Expiration Handling
   */
  async getCurrentSession(sessionId: string): Promise<{ session: ActiveSurveySession | null; expired: boolean; completed: boolean }> {
    const client = await getClient()

    try {
      const sessionResult = await client.query(
        `
        SELECT id, respondent_id, status, started_at, expires_at, completed_at
        FROM survey_sessions
        WHERE id = $1
        `,
        [sessionId]
      )

      if (sessionResult.rows.length === 0) {
        return { session: null, expired: false, completed: false }
      }

      const row = sessionResult.rows[0]
      const isExpired = new Date(row.expires_at).getTime() <= Date.now()

      if (row.status === 'IN_PROGRESS' && isExpired) {
        // Lazy-abandon expired session
        await client.query(
          `
          UPDATE survey_sessions
          SET status = 'ABANDONED', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          `,
          [sessionId]
        )
        return { session: null, expired: true, completed: false }
      }

      if (row.status === 'COMPLETED') {
        const session = await hydrateSession(client, row.id, row.respondent_id, row.status, row.started_at, row.expires_at)
        return { session, expired: false, completed: true }
      }

      if (row.status === 'ABANDONED') {
        return { session: null, expired: true, completed: false }
      }

      const session = await hydrateSession(client, row.id, row.respondent_id, row.status, row.started_at, row.expires_at)
      return { session, expired: false, completed: false }
    } finally {
      client.release()
    }
  },

  /**
   * 3. Save Answer with Idempotency and Session Validation
   */
  async saveAnswer(input: SaveAnswerInput): Promise<SaveAnswerResult> {
    const { sessionId, sessionPaintingId, impressionIds } = input
    const client = await getClient()

    try {
      await client.query('BEGIN')

      // Validate session is IN_PROGRESS and unexpired
      const sessionCheck = await client.query(
        `
        SELECT id, status, expires_at
        FROM survey_sessions
        WHERE id = $1
        FOR UPDATE;
        `,
        [sessionId]
      )

      if (sessionCheck.rows.length === 0) {
        const err: any = new Error('Sesi survei tidak ditemukan di sistem.')
        err.code = 'SESSION_NOT_FOUND'
        err.title = 'Sesi Survei Tidak Ditemukan'
        err.action = 'RESET_SESSION'
        throw err
      }

      const sessionRow = sessionCheck.rows[0]
      if (sessionRow.status === 'COMPLETED') {
        const err: any = new Error('Sesi survei sudah selesai dan tidak dapat diubah.')
        err.code = 'SESSION_ALREADY_COMPLETED'
        err.title = 'Survei Telah Selesai'
        err.action = 'REDIRECT_THANK_YOU'
        throw err
      }

      if (sessionRow.status !== 'IN_PROGRESS' || new Date(sessionRow.expires_at).getTime() <= Date.now()) {
        await client.query(
          `
          UPDATE survey_sessions
          SET status = 'ABANDONED', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1;
          `,
          [sessionId]
        )
        const err: any = new Error('Sesi survei telah kedaluwarsa (melebihi batas waktu 24 jam).')
        err.code = 'SESSION_EXPIRED'
        err.title = 'Sesi Survei Kedaluwarsa'
        err.action = 'RESET_SESSION'
        throw err
      }

      // Validate session_painting belongs to this session
      const paintingCheck = await client.query(
        `
        SELECT id
        FROM survey_session_paintings
        WHERE id = $1 AND session_id = $2;
        `,
        [sessionPaintingId, sessionId]
      )

      if (paintingCheck.rows.length === 0) {
        throw new Error('Lukisan tidak terdaftar pada sesi survei ini.')
      }

      // Validate impression IDs
      if (!Array.isArray(impressionIds) || impressionIds.length === 0) {
        throw new Error('Pilihan impresi tidak boleh kosong.')
      }

      const impressionValidate = await client.query(
        `
        SELECT id FROM impressions WHERE id = ANY($1::text[]);
        `,
        [impressionIds]
      )

      if (impressionValidate.rows.length !== new Set(impressionIds).size) {
        throw new Error('Satu atau lebih ID impresi tidak valid.')
      }

      // Upsert into survey_answers
      const answerUpsert = await client.query(
        `
        INSERT INTO survey_answers (session_painting_id, answered_at, updated_at)
        VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (session_painting_id)
        DO UPDATE SET
          answered_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id;
        `,
        [sessionPaintingId]
      )
      const answerId = answerUpsert.rows[0].id

      // Sync impressions idempotently
      await client.query(
        `
        DELETE FROM survey_answer_impressions WHERE answer_id = $1;
        `,
        [answerId]
      )

      for (const impId of Array.from(new Set(impressionIds))) {
        await client.query(
          `
          INSERT INTO survey_answer_impressions (answer_id, impression_id, created_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (answer_id, impression_id) DO NOTHING;
          `,
          [answerId, impId]
        )
      }

      // Compute session-wide status and authoritative snapshot of all paintings
      const statusResult = await client.query(
        `
        SELECT 
          ssp.id AS session_painting_id,
          ssp.painting_id,
          ssp.display_order,
          sa.id AS answer_id,
          CASE WHEN sa.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_answered,
          COALESCE(
            ARRAY_AGG(sai.impression_id) FILTER (WHERE sai.impression_id IS NOT NULL),
            '{}'
          ) AS impression_ids
        FROM survey_session_paintings ssp
        LEFT JOIN survey_answers sa ON sa.session_painting_id = ssp.id
        LEFT JOIN survey_answer_impressions sai ON sai.answer_id = sa.id
        WHERE ssp.session_id = $1
        GROUP BY ssp.id, ssp.painting_id, ssp.display_order, sa.id
        ORDER BY ssp.display_order ASC;
        `,
        [sessionId]
      )

      const totalPaintings = statusResult.rows.length
      let answeredCount = 0
      let nextUnansweredPosition: number | null = null

      const serverAnswers: ServerPaintingAnswer[] = statusResult.rows.map((row: any) => {
        const isAnswered = Boolean(row.is_answered)
        if (isAnswered) {
          answeredCount++
        } else if (nextUnansweredPosition === null) {
          nextUnansweredPosition = Number(row.display_order)
        }

        return {
          paintingId: row.painting_id,
          sessionPaintingId: row.session_painting_id,
          displayOrder: Number(row.display_order),
          isAnswered,
          impressionIds: row.impression_ids || [],
        }
      })

      const isSessionCompleted = answeredCount >= totalPaintings
      if (isSessionCompleted) {
        nextUnansweredPosition = null
      }

      await client.query('COMMIT')

      return {
        success: true,
        sessionPaintingId,
        answeredCount,
        totalPaintings,
        isSessionCompleted,
        nextUnansweredPosition,
        serverAnswers,
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  /**
   * 4. Complete Survey Session
   */
  async completeSurvey(input: CompleteSurveyInput): Promise<CompleteSurveyResult> {
    const { sessionId } = input
    const client = await getClient()

    try {
      await client.query('BEGIN')

      const sessionCheck = await client.query(
        `
        SELECT id, status, expires_at
        FROM survey_sessions
        WHERE id = $1
        FOR UPDATE;
        `,
        [sessionId]
      )

      if (sessionCheck.rows.length === 0) {
        const err: any = new Error('Sesi survei tidak ditemukan di sistem.')
        err.code = 'SESSION_NOT_FOUND'
        err.title = 'Sesi Survei Tidak Ditemukan'
        err.action = 'RESET_SESSION'
        throw err
      }

      const sessionRow = sessionCheck.rows[0]
      if (sessionRow.status === 'COMPLETED') {
        await client.query('COMMIT')
        return { success: true, completedAt: new Date().toISOString() }
      }

      if (sessionRow.status !== 'IN_PROGRESS' || new Date(sessionRow.expires_at).getTime() <= Date.now()) {
        const err: any = new Error('Sesi survei telah kedaluwarsa.')
        err.code = 'SESSION_EXPIRED'
        err.title = 'Sesi Survei Kedaluwarsa'
        err.action = 'RESET_SESSION'
        throw err
      }

      // Verify all paintings are answered
      const countResult = await client.query(
        `
        SELECT 
          COUNT(ssp.id)::int AS total_paintings,
          COUNT(sa.id)::int AS answered_count
        FROM survey_session_paintings ssp
        LEFT JOIN survey_answers sa ON sa.session_painting_id = ssp.id
        WHERE ssp.session_id = $1;
        `,
        [sessionId]
      )

      const totalPaintings = countResult.rows[0].total_paintings
      const answeredCount = countResult.rows[0].answered_count

      if (answeredCount < totalPaintings) {
        throw new Error(`Belum semua lukisan dijawab (${answeredCount}/${totalPaintings}).`)
      }

      const updateResult = await client.query(
        `
        UPDATE survey_sessions
        SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING completed_at;
        `,
        [sessionId]
      )

      await client.query('COMMIT')

      return {
        success: true,
        completedAt: updateResult.rows[0].completed_at.toISOString(),
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  /**
   * Legacy method for backward compatibility
   */
  async saveSurveyResult(session: SurveySession): Promise<{ respondentId: string }> {
    const startResult = await this.startOrResumeSession(session.respondent)
    const { session: activeSession } = startResult

    for (const answer of session.answers) {
      const match = activeSession.paintings.find(p => p.paintingId === answer.paintingId)
      if (match) {
        await this.saveAnswer({
          sessionId: activeSession.id,
          sessionPaintingId: match.sessionPaintingId,
          impressionIds: answer.impressionIds,
        })
      }
    }

    if (session.answers.length >= activeSession.totalPaintings) {
      await this.completeSurvey({ sessionId: activeSession.id })
    }

    return { respondentId: activeSession.respondentId }
  },
}

/**
 * Helper to hydrate a full ActiveSurveySession with allocated paintings, answers, and impressions
 */
async function hydrateSession(
  client: any,
  sessionId: string,
  respondentId: string,
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED',
  startedAt: Date | string,
  expiresAt: Date | string
): Promise<ActiveSurveySession> {
  const paintingsQuery = `
    SELECT 
      ssp.id AS session_painting_id,
      ssp.painting_id,
      ssp.display_order,
      p.title,
      p.detail,
      p.image_key,
      sa.id AS answer_id,
      CASE WHEN sa.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_answered,
      COALESCE(
        ARRAY_AGG(sai.impression_id) FILTER (WHERE sai.impression_id IS NOT NULL),
        '{}'
      ) AS selected_impression_ids
    FROM survey_session_paintings ssp
    JOIN paintings p ON p.id = ssp.painting_id
    LEFT JOIN survey_answers sa ON sa.session_painting_id = ssp.id
    LEFT JOIN survey_answer_impressions sai ON sai.answer_id = sa.id
    WHERE ssp.session_id = $1
    GROUP BY ssp.id, ssp.painting_id, ssp.display_order, p.title, p.detail, p.image_key, sa.id
    ORDER BY ssp.display_order ASC;
  `
  const result = await client.query(paintingsQuery, [sessionId])

  let answeredCount = 0
  let nextOrder = 1
  const paintings: AllocatedPainting[] = result.rows.map((row: any) => {
    const isAnswered = Boolean(row.is_answered)
    if (isAnswered) {
      answeredCount++
    }
    return {
      sessionPaintingId: row.session_painting_id,
      paintingId: row.painting_id,
      displayOrder: row.display_order,
      title: row.title,
      detail: row.detail || '',
      imageKey: row.image_key,
      imageUrl: resolvePaintingImageUrl(row.image_key),
      isAnswered,
      selectedImpressionIds: row.selected_impression_ids || [],
    }
  })

  const firstUnanswered = paintings.find(p => !p.isAnswered)
  if (firstUnanswered) {
    nextOrder = firstUnanswered.displayOrder
  } else {
    nextOrder = paintings.length
  }

  return {
    id: sessionId,
    respondentId,
    status,
    startedAt: new Date(startedAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    totalPaintings: paintings.length,
    answeredCount,
    nextOrder,
    paintings,
  }
}
