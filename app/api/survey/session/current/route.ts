import { NextResponse } from 'next/server'
import { surveyDbRepository } from '@/data/survey-db-repository'
import { query } from '@/lib/db'
import { isValidUuid, validateEmail } from '@/lib/sanitizer'
import { rateLimitSurveySession } from '@/lib/rate-limiter'

export async function GET(request: Request) {
  try {
    // 1. Rate limiting check (max 30 requests per 60s per IP)
    const rateLimit = rateLimitSurveySession(request)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Terlalu Banyak Permintaan',
          error: `Batas pemuatan sesi terlampaui. Silakan tunggu ${rateLimit.retryAfterSeconds} detik sebelum mencoba kembali.`,
          action: 'RETRY',
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfterSeconds.toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const rawSessionId = searchParams.get('sessionId')
    const rawEmail = searchParams.get('email')

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Kredensial database (DATABASE_URL) belum dikonfigurasi.' },
        { status: 500 }
      )
    }

    let targetSessionId = rawSessionId ? rawSessionId.trim() : null

    // Validate sessionId if provided
    if (targetSessionId && !isValidUuid(targetSessionId)) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_SESSION_ID',
          title: 'Format Sesi Tidak Valid',
          error: 'Format parameter sessionId tidak valid (harus berupa UUID v4).',
          action: 'RESET_SESSION',
        },
        { status: 400 }
      )
    }

    // Lookup session by email if sessionId not provided
    if (!targetSessionId && rawEmail) {
      const emailValidation = validateEmail(rawEmail)
      if (!emailValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            code: emailValidation.code,
            title: 'Email Tidak Valid',
            error: emailValidation.error,
            action: 'RESET_SESSION',
          },
          { status: 400 }
        )
      }

      const respRes = await query(
        `
        SELECT ss.id
        FROM survey_sessions ss
        JOIN respondents r ON r.id = ss.respondent_id
        WHERE LOWER(r.email) = LOWER($1)
          AND ss.status = 'IN_PROGRESS'
          AND ss.expires_at > CURRENT_TIMESTAMP
        ORDER BY ss.created_at DESC
        LIMIT 1;
        `,
        [emailValidation.data]
      )
      if (respRes.rows.length > 0) {
        targetSessionId = respRes.rows[0].id
      }
    }

    if (!targetSessionId) {
      return NextResponse.json(
        { error: 'Parameter sessionId atau email yang valid diperlukan.' },
        { status: 400 }
      )
    }

    const result = await surveyDbRepository.getCurrentSession(targetSessionId)

    if (result.expired) {
      return NextResponse.json(
        {
          success: false,
          code: 'SESSION_EXPIRED',
          title: 'Sesi Survei Kedaluwarsa',
          error:
            'Sesi survei telah kedaluwarsa (melebihi batas waktu 24 jam). Silakan mulai survei baru.',
          action: 'RESET_SESSION',
        },
        { status: 410 }
      )
    }

    if (!result.session) {
      return NextResponse.json(
        {
          success: false,
          code: 'SESSION_NOT_FOUND',
          title: 'Sesi Survei Tidak Ditemukan',
          error:
            'Sesi survei tidak ditemukan di sistem. Anda akan dialihkan kembali ke formulir responden.',
          action: 'RESET_SESSION',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      completed: result.completed,
      session: result.session,
    })
  } catch (error: any) {
    console.error('Error getting current survey session:', error)
    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'SESSION_LOAD_FAILED',
        title: error?.title || 'Gagal Memuat Sesi Survei',
        error: error?.message || 'Terjadi kesalahan saat memuat sesi survei.',
        action: error?.action || 'RESET_SESSION',
      },
      { status: 500 }
    )
  }
}
