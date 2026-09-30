'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  emptyRespondent,
  type Respondent,
  type Survey,
  type SurveyAnswer,
} from '@/domain/survey'

const STORAGE_KEY = 'survey-progress'

type SurveyProgress = {
  respondent: Respondent
  survey: Survey | null
  answers: SurveyAnswer[]
  currentPainting: number
}

export function useSurveyFlow() {
  const [respondent, setRespondent] =
    useState<Respondent>(
      emptyRespondent,
    )

  const [survey, setSurvey] =
    useState<Survey | null>(null)

  const [answers, setAnswers] =
    useState<SurveyAnswer[]>([])

  const [currentPainting, setCurrentPainting] =
    useState(1)

  const [hydrated, setHydrated] =
    useState(false)

  // =========================
  // RESTORE DARI LOCAL STORAGE
  // =========================

  useEffect(() => {
    const saved =
      localStorage.getItem(
        STORAGE_KEY,
      )

    if (saved) {
      try {
        const progress: SurveyProgress =
          JSON.parse(saved)

        setRespondent(
          progress.respondent,
        )

        setSurvey(
          progress.survey,
        )

        setAnswers(
          progress.answers,
        )

        setCurrentPainting(
          progress.currentPainting,
        )
      } catch {
        localStorage.removeItem(
          STORAGE_KEY,
        )
      }
    }

    setHydrated(true)
  }, [])

  // =========================
  // SIMPAN KE LOCAL STORAGE
  // =========================

  useEffect(() => {
    if (!hydrated) return

    const progress: SurveyProgress = {
      respondent,
      survey,
      answers,
      currentPainting,
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress),
    )
  }, [
    hydrated,
    respondent,
    survey,
    answers,
    currentPainting,
  ])

  // =========================
  // LOAD SURVEY DARI API
  // =========================

  const loadSurvey = ({
    respondent,
    survey,
    answers,
  }: {
    respondent: Respondent
    survey: Survey
    answers: SurveyAnswer[]
  }) => {
    const answeredPaintingIds =
      answers.map(
        (answer) =>
          answer.paintingId,
      )
  
    const firstUnansweredPainting =
      survey.paintings.find(
        (painting) =>
          !answeredPaintingIds.includes(
            painting.id,
          ),
      )
  
    const nextCurrentPainting =
      firstUnansweredPainting?.position ??
      survey.totalPaintings
  
    const progress: SurveyProgress = {
      respondent,
      survey,
      answers,
      currentPainting:
        nextCurrentPainting,
    }
  
    // Simpan SEKARANG
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress),
    )
  
    setRespondent(respondent)
    setSurvey(survey)
    setAnswers(answers)
  
    setCurrentPainting(
      nextCurrentPainting,
    )
  }

  // =========================
  // GET JAWABAN LUKISAN
  // =========================

  const getSelectedImpressions = (
    paintingId: string,
  ) => {
    const answer =
      answers.find(
        (answer) =>
          answer.paintingId ===
          paintingId,
      )

    return (
      answer?.impressionIds ?? []
    )
  }

  // =========================
  // TOGGLE IMPRESSION
  // =========================

  const toggleImpression = (
    paintingId: string,
    impressionId: string,
  ) => {
    setAnswers(
      (currentAnswers) => {
        const existingAnswer =
          currentAnswers.find(
            (answer) =>
              answer.paintingId ===
              paintingId,
          )

        if (!existingAnswer) {
          return [
            ...currentAnswers,
            {
              paintingId,
              impressionIds: [
                impressionId,
              ],
            },
          ]
        }

        return currentAnswers.map(
          (answer) => {
            if (
              answer.paintingId !==
              paintingId
            ) {
              return answer
            }

            const exists =
              answer.impressionIds.includes(
                impressionId,
              )

            return {
              ...answer,

              impressionIds: exists
                ? answer.impressionIds.filter(
                    (id) =>
                      id !==
                      impressionId,
                  )
                : [
                    ...answer.impressionIds,
                    impressionId,
                  ],
            }
          },
        )
      },
    )
  }

  // =========================
  // NEXT
  // =========================

  const goNext = () => {
    if (!survey) return

    if (
      currentPainting <
      survey.totalPaintings
    ) {
      setCurrentPainting(
        (current) =>
          current + 1,
      )
    }
  }

  // =========================
  // PREVIOUS
  // =========================

  const goPrevious = () => {
    if (currentPainting > 1) {
      setCurrentPainting(
        (current) =>
          current - 1,
      )
    }
  }

  // =========================
  // ACTIVE SURVEY
  // =========================

  const hasActiveSurvey =
    survey !== null

  // =========================
  // CLEAR
  // =========================

  const clearProgress = () => {
    localStorage.removeItem(
      STORAGE_KEY,
    )

    setRespondent(
      emptyRespondent,
    )

    setSurvey(null)

    setAnswers([])

    setCurrentPainting(1)
  }

  return {
    respondent,
    setRespondent,

    survey,
    answers,

    currentPainting,
    setCurrentPainting,

    hydrated,

    hasActiveSurvey,

    loadSurvey,

    getSelectedImpressions,

    toggleImpression,

    goNext,

    goPrevious,

    clearProgress,
  }
}