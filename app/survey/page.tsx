'use client'

import {
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

  const handleFinish = () => {
    const isLastPainting =
      currentPainting ===
      session.survey.totalPaintings

    if (isLastPainting) {
      setConfirming(true)

      return
    }

    goNext()
  }

  const handleBack = () => {
    if (
      currentPainting > 1
    ) {
      goPrevious()

      return
    }

    router.push(
      '/respondent',
    )
  }

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
        onToggle={(
          impressionId,
        ) =>
          toggleImpression(
            painting.id,
            impressionId,
          )
        }
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
