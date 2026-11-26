import { NextResponse } from 'next/server'
import { surveyDbRepository } from '@/data/survey-db-repository'
import { isPayloadTooLarge, validateSaveAnswerInput } from '@/lib/sanitizer'
import { rateLimitSurveyAnswer } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    // 1. Guard against payload DoS
    if (isPayloadTooLarge(request)) {
      return NextResponse.json(
        { error: 'Ukuran payload melebihi batas maksimal (32KB).' },
        { status: 413 }
      )
    }

    // 2. Rate limiting check (max 60 saves per 60s per IP)
    const rateLimit = rateLimitSurveyAnswer(request)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Terlalu Banyak Permintaan',
          error: `Batas pengiriman jawaban terlampaui. Silakan tunggu ${rateLimit.retryAfterSeconds} detik sebelum mencoba kembali.`,
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

    // 3. Strict UUID and impression array validation
    const validation = validateSaveAnswerInput(rawBody)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          code: validation.code,
          title: 'Format Jawaban Tidak Valid',
          error: validation.error,
          action: 'RETRY',
        },
        { status: 400 }
      )
    }

    const result = await surveyDbRepository.saveAnswer(validation.data)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error saving survey answer:', error)
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
              : 'SAVE_ANSWER_FAILED'),
        title:
          error?.title ||
          (isExpired
            ? 'Sesi Survei Kedaluwarsa'
            : isNotFound
              ? 'Sesi Survei Tidak Ditemukan'
              : 'Gagal Menyimpan Jawaban'),
        error: error?.message || 'Gagal menyimpan jawaban survei.',
        action:
          error?.action ||
          (isExpired || isNotFound ? 'RESET_SESSION' : 'RETRY'),
      },
      { status: statusCode }
    )
  }
}
