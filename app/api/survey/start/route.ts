import { NextResponse } from 'next/server'
import { surveyDbRepository } from '@/data/survey-db-repository'
import {
  isPayloadTooLarge,
  validateRespondentInput,
} from '@/lib/sanitizer'
import { rateLimitSurveyStart } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    // 1. Guard against payload-bombing DoS (max 32KB)
    if (isPayloadTooLarge(request)) {
      return NextResponse.json(
        { error: 'Ukuran payload melebihi batas maksimal (32KB).' },
        { status: 413 }
      )
    }

    // 2. Rate limiting check (max 5 requests per 60s per IP)
    const rateLimit = rateLimitSurveyStart(request)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Terlalu Banyak Permintaan',
          error: `Batas pengiriman terlampaui. Silakan tunggu ${rateLimit.retryAfterSeconds} detik sebelum mencoba kembali.`,
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

    // 3. Database configuration verification
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Kredensial database (DATABASE_URL) belum dikonfigurasi.' },
        { status: 500 }
      )
    }

    const rawBody = await request.json()

    // 4. Strict input validation, honeypot bot trap check, and sanitization
    const validation = validateRespondentInput(rawBody)
    if (!validation.valid) {
      const isBot = validation.code === 'BOT_DETECTED'
      return NextResponse.json(
        {
          success: false,
          code: validation.code,
          title: isBot ? 'Permintaan Ditolak' : 'Data Responden Tidak Valid',
          error: validation.error,
          action: isBot ? 'GO_HOME' : 'RETRY',
        },
        { status: 400 }
      )
    }

    // 5. Execute session start / resume with sanitized data
    const result = await surveyDbRepository.startOrResumeSession(validation.data)

    return NextResponse.json(result, { status: result.resumed ? 200 : 201 })
  } catch (error: any) {
    console.error('Error starting/resuming survey session:', error)
    const statusCode = error?.code === 'ALL_PAINTINGS_EVALUATED' ? 409 : 400

    return NextResponse.json(
      {
        success: false,
        code: error?.code || 'START_SURVEY_FAILED',
        title: error?.title || 'Gagal Memulai Survei',
        error: error?.message || 'Terjadi kesalahan saat memulai sesi survei.',
        action: error?.action || 'GO_HOME',
      },
      { status: statusCode }
    )
  }
}
