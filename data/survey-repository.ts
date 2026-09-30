import {
  impressions,
  mockAnswers,
  mockRespondent,
  mockSurvey,
} from '@/data/mock-survey'

import type {
  Respondent,
  SurveyAnswer,
  SurveySession,
} from '@/domain/survey'

export const surveyRepository = {
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
}