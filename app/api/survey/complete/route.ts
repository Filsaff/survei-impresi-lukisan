import { NextResponse } from 'next/server'
import { surveyDbRepository } from '@/data/survey-db-repository'
import { isPayloadTooLarge, validateCompleteSurveyInput } from '@/lib/sanitizer'
import { rateLimitSurveyComplete } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    // 1. Guard against payload DoS
    if (isPayloadTooLarge(request)) {
      return NextResponse.json(
        { error: 'Ukuran payload melebihi batas maksimal (32KB).' },
        { status: 413 }
      )
    }

    // 2. Rate limiting check (max 5 completes per 60s per IP)
    const rateLimit = rateLimitSurveyComplete(request)
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Kredensial database (DATABASE_URL) belum dikonfigurasi.' },
        { status: 500 }
      )
    }

    const rawBody = await request.json()

    // 3. Strict UUID validation
    const validation = validateCompleteSurveyInput(rawBody)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          code: validation.code,
          title: 'Format Sesi Tidak Valid',
          error: validation.error,
          action: 'RETRY',
        },
        { status: 400 }
      )
    }

    const result = await surveyDbRepository.completeSurvey(validation.data)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error completing survey:', error)
    const isExpired =
      error?.code === 'SESSION_EXPIRED' ||
      error?.message?.includes('kedaluwarsa')
    const isNotFound =
      error?.code === 'SESSION_NOT_FOUND' ||
      error?.message?.includes('tidak ditemukan')
    const statusCode = isExpired ? 410 : isNotFound ? 404 : 400

    return NextResponse.json(
      {
        success: false,
        code:
          error?.code ||
          (isExpired
            ? 'SESSION_EXPIRED'
            : isNotFound
              ? 'SESSION_NOT_FOUND'
              : 'COMPLETE_SURVEY_FAILED'),
        title:
          error?.title ||
          (isExpired
            ? 'Sesi Survei Kedaluwarsa'
            : isNotFound
              ? 'Sesi Survei Tidak Ditemukan'
              : 'Gagal Menyelesaikan Survei'),
        error: error?.message || 'Gagal menyelesaikan survei.',
        action:
          error?.action ||
          (isExpired || isNotFound ? 'RESET_SESSION' : 'RETRY'),
      },
      { status: statusCode }
    )
  }
}
