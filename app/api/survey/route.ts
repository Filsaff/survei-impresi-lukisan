import { NextResponse } from 'next/server'
import { surveyDbRepository } from '@/data/survey-db-repository'
import type { SurveySession } from '@/domain/survey'

export async function POST(request: Request) {
  try {
    const body: SurveySession = await request.json()
    const { respondent, answers } = body

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            'Kredensial database (DATABASE_URL) belum dikonfigurasi di file .env.local atau environment variable.',
        },
        { status: 500 },
      )
    }

    if (!respondent || !respondent.name || !respondent.email) {
      return NextResponse.json(
        { error: 'Data responden tidak lengkap (nama dan email wajib diisi).' },
        { status: 400 },
      )
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Jawaban survei tidak boleh kosong.' },
        { status: 400 },
      )
    }

    try {
      const { respondentId } = await surveyDbRepository.saveSurveyResult(body)

      return NextResponse.json({
        success: true,
        respondentId,
      })
    } catch (dbError: any) {
      console.error('Database transaction error:', dbError)
      return NextResponse.json(
        { error: `Gagal menyimpan data ke database: ${dbError.message}` },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error('Unexpected error in survey API:', error)
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan internal pada server.' },
      { status: 500 },
    )
  }
}
