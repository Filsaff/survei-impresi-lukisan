'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  ConfirmationDialog,
  SurveyPage,
} from '@/presentation/pages/survey-page'

import {
  useSurveyStore,
} from '@/presentation/stores/survey-store'

import { surveyRepository } from '@/data/survey-repository'
import { submitSurveyUseCase } from '@/application/use-cases/submit-survey'

export default function Page() {
  const router = useRouter()

  const hydrated =
    useSurveyStore(
      (state) =>
        state.hydrated,
    )

  const session =
    useSurveyStore(
      (state) =>
        state.session,
    )

  const currentPainting =
    useSurveyStore(
      (state) =>
        state.currentPainting,
    )

  const getSelectedImpressions =
    useSurveyStore(
      (state) =>
        state.getSelectedImpressions,
    )

  const toggleImpression =
    useSurveyStore(
      (state) =>
        state.toggleImpression,
    )

  const goNext =
    useSurveyStore(
      (state) =>
        state.goNext,
    )

  const goPrevious =
    useSurveyStore(
      (state) =>
        state.goPrevious,
    )

  const clearProgress =
    useSurveyStore(
      (state) =>
        state.clearProgress,
    )

  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitSurvey = async () => {
    if (!session) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      await submitSurveyUseCase(surveyRepository, session)
      clearProgress()
      router.push('/thank-you')
    } catch (err: any) {
      console.error('Error submitting survey:', err)
      setSubmitError(
        err.message || 'Terjadi kesalahan koneksi. Silakan coba submit kembali.',
      )
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (
      hydrated &&
      !session &&
      !submitting
    ) {
      router.replace('/respondent')
    }
  }, [
    hydrated,
    session,
    submitting,
    router,
  ])

  // Preload 1 lukisan berikutnya secara bertahap agar saat klik 'Next' langsung muncul tanpa lag
  useEffect(() => {
    if (!session?.survey?.paintings) return

    const nextPainting = session.survey.paintings.find(
      (item) => item.position === currentPainting + 1,
    )

    if (nextPainting?.image) {
      const img = new window.Image()
      img.src = nextPainting.image
    }
  }, [currentPainting, session?.survey?.paintings])

  const handleFinish = useCallback(() => {
    if (!session) return
    const isLastPainting =
      currentPainting ===
      session.survey.totalPaintings

    if (isLastPainting) {
      setConfirming(true)
      return
    }

    goNext()
  }, [currentPainting, goNext, session])

  const handleBack = useCallback(() => {
    if (currentPainting > 1) {
      goPrevious()
      return
    }

    router.push('/respondent')
  }, [currentPainting, goPrevious, router])

  const currentPaintingId = session?.survey?.paintings.find(
    (item) => item.position === currentPainting,
  )?.id

  const handleToggle = useCallback(
    (impressionId: string) => {
      if (currentPaintingId) {
        toggleImpression(currentPaintingId, impressionId)
      }
    },
    [currentPaintingId, toggleImpression],
  )

  if (!hydrated) {
    return null
  }

  if (!session) {
    return null
  }

  const painting =
    session.survey.paintings.find(
      (item) =>
        item.position ===
        currentPainting,
    )

  if (!painting) {
    return null
  }

  const selected =
    getSelectedImpressions(
      painting.id,
    )

  return (
    <>
      <SurveyPage
        current={
          currentPainting
        }
        total={
          session.survey.totalPaintings
        }
        painting={painting}
        selected={selected}
        onToggle={handleToggle}
        onBack={
          handleBack
        }
        onFinish={
          handleFinish
        }
      />

      {confirming && (
        <ConfirmationDialog
          submitting={submitting}
          error={submitError}
          onBack={() => {
            if (!submitting) {
              setConfirming(false)
              setSubmitError(null)
            }
          }}
          onSubmit={handleSubmitSurvey}
        />
      )}
    </>
  )
}
