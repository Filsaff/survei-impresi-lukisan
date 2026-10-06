import { getClient } from '@/lib/db'
import type { SurveySession } from '@/domain/survey'

export interface ISurveyDbRepository {
  saveSurveyResult(session: SurveySession): Promise<{ respondentId: string }>
}

export const surveyDbRepository: ISurveyDbRepository = {
  async saveSurveyResult(session: SurveySession): Promise<{ respondentId: string }> {
    const { respondent, answers } = session
    const client = await getClient()

    try {
      await client.query('BEGIN')

      // 1. Simpan responden ke tabel respondents
      const respondentInsertQuery = `
        INSERT INTO respondents (name, email, gender, age, education)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `
      const respondentResult = await client.query(respondentInsertQuery, [
        respondent.name,
        respondent.email,
        respondent.gender || null,
        respondent.age ? Number(respondent.age) : null,
        respondent.education || null,
      ])

      const respondentId = respondentResult.rows[0].id

      // 2. Simpan seluruh jawaban ke tabel survey_answers
      const answerInsertQuery = `
        INSERT INTO survey_answers (respondent_id, painting_id, impression_ids)
        VALUES ($1, $2, $3)
      `

      for (const answer of answers) {
        await client.query(answerInsertQuery, [
          respondentId,
          answer.paintingId,
          answer.impressionIds,
        ])
      }

      await client.query('COMMIT')

      return { respondentId }
    } catch (dbError) {
      await client.query('ROLLBACK')
      throw dbError
    } finally {
      client.release()
    }
  },
}
