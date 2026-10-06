import {
  impressions,
  mockAnswers,
  mockRespondent,
  mockSurvey,
} from '@/data/mock-survey'

import type {
  ISurveyRepository,
  Respondent,
  SurveySession,
  SurveySubmissionResult,
} from '@/domain/survey'

export const surveyRepository: ISurveyRepository = {
  getSurvey: () => mockSurvey,

  getPaintings: () => mockSurvey.paintings,

  getPainting: (position: number) =>
    mockSurvey.paintings.find(
      (painting) =>
        painting.position === position,
    ),

  getImpressions: () => impressions,

  startSurvey: async (
    respondent: Respondent,
  ): Promise<SurveySession> => {
    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    )

    const existingUser =
      respondent.email.toLowerCase() ===
      mockRespondent.email.toLowerCase()

    if (existingUser) {
      return {
        respondent: mockRespondent,
        survey: mockSurvey,
        answers: mockAnswers,
      }
    }

    return {
      respondent: {
        ...respondent,
        id: `respondent-${Date.now()}`,
      },

      survey: {
        ...mockSurvey,
        id: `survey-${Date.now()}`,
      },

      answers: [],
    }
  },

  submitSurvey: async (
    session: SurveySession,
  ): Promise<SurveySubmissionResult> => {
    const response = await fetch('/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Gagal menyimpan data survei.')
    }

    return {
      success: true,
      respondentId: data.respondentId,
    }
  },
}