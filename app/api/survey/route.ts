import { NextResponse } from 'next/server'
import { getClient } from '@/lib/db'
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

      return NextResponse.json({
        success: true,
        respondentId,
      })
    } catch (dbError: any) {
      await client.query('ROLLBACK')
      console.error('Database transaction error:', dbError)
      return NextResponse.json(
        { error: `Gagal menyimpan data ke database: ${dbError.message}` },
        { status: 500 },
      )
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Unexpected error in survey API:', error)
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan internal pada server.' },
      { status: 500 },
    )
  }
}
