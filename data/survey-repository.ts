import {
  impressions,
  mockSurvey,
} from '@/data/mock-survey'

import {
  type ActiveSurveySession,
  type CompleteSurveyInput,
  type CompleteSurveyResult,
  type ISurveyRepository,
  type Respondent,
  type SaveAnswerInput,
  type SaveAnswerResult,
  type StartSurveyResult,
  type SurveySession,
  type SurveySubmissionResult,
  SurveyApiError,
} from '@/domain/survey'

/**
 * Helper to execute client HTTP fetches with unified network error & API error handling
 */
async function safeFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (err: any) {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      throw new SurveyApiError(
        'Koneksi internet Anda terputus. Mohon periksa sambungan internet Anda dan coba lagi.',
        'NETWORK_OFFLINE',
        'Koneksi Internet Terputus',
        'RETRY'
      )
    }
    throw new SurveyApiError(
      'Gagal menghubungi server. Mohon periksa koneksi internet Anda atau coba beberapa saat lagi.',
      'NETWORK_ERROR',
      'Gagal Terhubung ke Server',
      'RETRY'
    )
  }

  let data: any
  try {
    data = await response.json()
  } catch {
    throw new SurveyApiError(
      'Respon dari server tidak valid.',
      'INVALID_SERVER_RESPONSE',
      'Terjadi Kesalahan Server',
      'RETRY'
    )
  }

  if (!response.ok) {
    throw new SurveyApiError(
      data.error || 'Terjadi kesalahan sistem.',
      data.code || 'API_ERROR',
      data.title || 'Pemberitahuan Sistem',
      data.action
    )
  }

  return data as T
}

export const surveyRepository: ISurveyRepository = {
  getSurvey: () => mockSurvey,

  getPaintings: () => mockSurvey.paintings,

  getPainting: (position: number) =>
    mockSurvey.paintings.find(
      (painting) => painting.position === position,
    ),

  getImpressions: () => impressions,

  startSurvey: async (
    respondent: Respondent,
  ): Promise<SurveySession> => {
    const data = await safeFetchJson<StartSurveyResult>('/api/survey/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(respondent),
    })

    const activeSession: ActiveSurveySession = data.session

    return {
      respondent: {
        ...respondent,
        id: activeSession.respondentId,
      },
      survey: {
        id: activeSession.id,
        totalPaintings: activeSession.totalPaintings,
        paintings: activeSession.paintings.map((p) => ({
          position: p.displayOrder,
          id: p.paintingId,
          sessionPaintingId: p.sessionPaintingId,
          imageKey: p.imageKey,
          title: p.title,
          detail: p.detail,
          image: p.imageUrl,
          isAnswered: p.isAnswered,
        })),
      },
      answers: activeSession.paintings
        .filter((p) => p.isAnswered && p.selectedImpressionIds.length > 0)
        .map((p) => ({
          paintingId: p.paintingId,
          impressionIds: p.selectedImpressionIds,
        })),
    }
  },

  getCurrentSession: async (sessionId: string): Promise<ActiveSurveySession> => {
    const data = await safeFetchJson<{
      success: boolean
      completed: boolean
      session: ActiveSurveySession
    }>(`/api/survey/session/current?sessionId=${encodeURIComponent(sessionId)}`)

    return data.session
  },

  saveAnswer: async (
    input: SaveAnswerInput,
  ): Promise<SaveAnswerResult> => {
    const data = await safeFetchJson<SaveAnswerResult>('/api/survey/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    return data
  },

  completeSurvey: async (
    input: CompleteSurveyInput,
  ): Promise<CompleteSurveyResult> => {
    const data = await safeFetchJson<CompleteSurveyResult>(
      '/api/survey/complete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    )

    return data
  },

  submitSurvey: async (
    session: SurveySession,
  ): Promise<SurveySubmissionResult> => {
    if (session.survey?.id) {
      try {
        await surveyRepository.completeSurvey({ sessionId: session.survey.id })
        return {
          success: true,
          respondentId: session.respondent.id || '',
        }
      } catch (err: any) {
        console.warn('Fallback to legacy submission:', err?.message)
      }
    }

    const data = await safeFetchJson<any>('/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    })

    return {
      success: true,
      respondentId: data.respondentId,
    }
  },
}