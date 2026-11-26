'use client'

import {
  useCallback,
  useEffect,
  useRef,
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
  CuratorialAlertModal,
  type CuratorialAlertType,
} from '@/presentation/components/survey'

import {
  useSurveyStore,
} from '@/presentation/stores/survey-store'

import { surveyRepository } from '@/data/survey-repository'
import { submitSurveyUseCase } from '@/application/use-cases/submit-survey'

const preloadedImageUrls = new Set<string>()
const preloadedImageCache = new Map<string, HTMLImageElement>()

function preloadImage(url?: string | null) {
  if (!url || typeof window === 'undefined') return
  if (preloadedImageUrls.has(url)) return
  preloadedImageUrls.add(url)
  const img = new window.Image()
  img.src = url
  preloadedImageCache.set(url, img)
}

interface AlertModalState {
  isOpen: boolean
  title: string
  message: string
  type: CuratorialAlertType
  primaryText: string
  secondaryText?: string
  onPrimary: () => void
  onSecondary?: () => void
}

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

  const goToPainting =
    useSurveyStore(
      (state) =>
        state.goToPainting,
    )

  const syncServerAnswers =
    useSurveyStore(
      (state) =>
        state.syncServerAnswers,
    )

  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    primaryText: 'Mengerti',
    onPrimary: () => {},
  })

  const closeAlertModal = useCallback(() => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }))
  }, [])

  // Tracks the last saved impression IDs per painting to optimize "Next" clicks
  const lastSavedAnswersRef = useRef<Map<string, Set<string>>>(new Map())
  const initializedSessionIdRef = useRef<string | null>(null)
  const isSavingRef = useRef(false)
  const isVerifyingSessionRef = useRef(false)
  const sessionVerifiedRef = useRef(false)

  // Initialize cached saved impressions ONLY once when session is loaded or resumed from server
  useEffect(() => {
    if (!session?.survey?.id) return
    if (initializedSessionIdRef.current === session.survey.id) return

    initializedSessionIdRef.current = session.survey.id
    const map = new Map<string, Set<string>>()

    // Populate only paintings confirmed answered on the server
    const answeredPaintingIds = new Set(
      session.survey.paintings
        ?.filter((p) => p.isAnswered)
        .map((p) => p.id) ?? [],
    )

    if (session.answers) {
      for (const ans of session.answers) {
        if (answeredPaintingIds.has(ans.paintingId)) {
          map.set(ans.paintingId, new Set(ans.impressionIds))
        }
      }
    }

    lastSavedAnswersRef.current = map
  }, [session?.survey?.id, session?.survey?.paintings, session?.answers])

  // Verify session validity with server on initial hydration
  useEffect(() => {
    if (
      !hydrated ||
      !session?.survey?.id ||
      sessionVerifiedRef.current ||
      isVerifyingSessionRef.current ||
      submitting
    ) {
      return
    }

    isVerifyingSessionRef.current = true
    surveyRepository
      .getCurrentSession(session.survey.id)
      .then((serverSession) => {
        sessionVerifiedRef.current = true
        if (serverSession?.status === 'COMPLETED') {
          setAlertModal({
            isOpen: true,
            title: 'Survei Telah Selesai',
            message:
              'Sesi survei ini telah diselesaikan sebelumnya. Terima kasih atas partisipasi Anda.',
            type: 'info',
            primaryText: 'Halaman Selesai',
            onPrimary: () => {
              closeAlertModal()
              clearProgress()
              if (typeof window !== 'undefined') {
                localStorage.removeItem('survey-progress')
              }
              router.push('/thank-you')
            },
          })
        }
      })
      .catch((err: any) => {
        console.error('Session validation error:', err)
        if (
          err?.code === 'SESSION_NOT_FOUND' ||
          err?.code === 'SESSION_EXPIRED' ||
          err?.action === 'RESET_SESSION'
        ) {
          setAlertModal({
            isOpen: true,
            title: err?.title || 'Sesi Survei Tidak Valid',
            message:
              err?.message ||
              'Sesi survei Anda tidak ditemukan di server atau telah kedaluwarsa. Anda akan diarahkan ke halaman responden.',
            type: 'error',
            primaryText: 'Kembali ke Responden',
            onPrimary: () => {
              closeAlertModal()
              clearProgress()
              if (typeof window !== 'undefined') {
                localStorage.removeItem('survey-progress')
              }
              router.replace('/respondent')
            },
          })
        }
      })
      .finally(() => {
        isVerifyingSessionRef.current = false
      })
  }, [hydrated, session?.survey?.id, submitting, clearProgress, router, closeAlertModal])

  const handleSubmitSurvey = async () => {
    if (!session) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      // Safety net: ensure all 20 paintings have their latest selected answers saved to DB
      if (session.survey?.paintings && session.survey.id) {
        for (const painting of session.survey.paintings) {
          if (!painting.sessionPaintingId) continue
          const selected = getSelectedImpressions(painting.id)
          const lastSavedSet = lastSavedAnswersRef.current.get(painting.id)
          const isUnchanged =
            lastSavedSet !== undefined &&
            lastSavedSet.size === selected.length &&
            selected.every((id) => lastSavedSet.has(id))

          if (!isUnchanged && selected.length > 0) {
            await surveyRepository.saveAnswer({
              sessionId: session.survey.id,
              sessionPaintingId: painting.sessionPaintingId,
              impressionIds: selected,
            })
            lastSavedAnswersRef.current.set(painting.id, new Set(selected))
          }
        }
      }

      if (session.survey?.id) {
        await surveyRepository.completeSurvey({ sessionId: session.survey.id })
      } else {
        await submitSurveyUseCase(surveyRepository, session)
      }
      clearProgress()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('survey-progress')
      }
      router.push('/thank-you')
    } catch (err: any) {
      console.error('Error submitting survey:', err)
      setSubmitting(false)

      if (
        err?.code === 'SESSION_NOT_FOUND' ||
        err?.code === 'SESSION_EXPIRED' ||
        err?.action === 'RESET_SESSION' ||
        err?.message?.includes('kedaluwarsa')
      ) {
        setConfirming(false)
        setAlertModal({
          isOpen: true,
          title: err?.title || 'Sesi Survei Tidak Valid',
          message:
            err?.message ||
            'Sesi survei Anda tidak ditemukan di server atau telah kedaluwarsa. Silakan mulai sesi survei baru.',
          type: 'error',
          primaryText: 'Kembali ke Responden',
          onPrimary: () => {
            closeAlertModal()
            clearProgress()
            if (typeof window !== 'undefined') {
              localStorage.removeItem('survey-progress')
            }
            router.push('/respondent')
          },
        })
        return
      }

      const isOffline =
        err?.code === 'NETWORK_OFFLINE' ||
        err?.code === 'NETWORK_ERROR' ||
        !navigator.onLine ||
        err?.action === 'RETRY'

      if (isOffline) {
        setConfirming(false)
        setAlertModal({
          isOpen: true,
          title: err?.title || 'Koneksi Internet Terputus',
          message:
            err?.message ||
            'Gagal mengirimkan survei karena sambungan internet terputus. Pilihan Anda tetap aman. Silakan periksa jaringan dan coba lagi.',
          type: 'offline',
          primaryText: 'Coba Lagi',
          secondaryText: 'Tutup',
          onPrimary: () => {
            closeAlertModal()
            handleSubmitSurvey()
          },
          onSecondary: () => {
            closeAlertModal()
            setConfirming(true)
          },
        })
        return
      }

      setSubmitError(
        err?.message || 'Terjadi kesalahan koneksi. Silakan coba submit kembali.',
      )
    }
  }

  useEffect(() => {
    if (
      hydrated &&
      !session &&
      !submitting &&
      !alertModal.isOpen
    ) {
      router.replace('/respondent')
    }
  }, [
    hydrated,
    session,
    submitting,
    alertModal.isOpen,
    router,
  ])

  // Proactive background preloading & caching of survey painting images
  useEffect(() => {
    const paintings = session?.survey?.paintings
    if (!paintings || paintings.length === 0) return

    // 1. High-priority preloading for current, next 2, and previous painting
    const immediatePositions = [
      currentPainting,
      currentPainting + 1,
      currentPainting + 2,
      currentPainting - 1,
    ]

    immediatePositions.forEach((pos) => {
      const p = paintings.find((item) => item.position === pos)
      if (p?.image) {
        preloadImage(p.image)
      }
    })

    // 2. Background queue: quietly preload all remaining survey paintings with staggered intervals
    const timer = setTimeout(() => {
      paintings.forEach((p, idx) => {
        setTimeout(() => {
          preloadImage(p.image)
        }, idx * 100)
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [currentPainting, session?.survey?.paintings])

  // Reset window scroll ke paling atas setiap kali nomor lukisan berganti (Next, Back, Jump)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      })
    }
  }, [currentPainting])

  const handleFinish = useCallback(async () => {
    if (!session || isSavingRef.current) return

    const currentItem = session.survey.paintings.find(
      (item) => item.position === currentPainting,
    )
    if (!currentItem) return

    const selected = getSelectedImpressions(currentItem.id)
    const lastSavedSet = lastSavedAnswersRef.current.get(currentItem.id)

    // Compare impression IDs by normalized set/value, not array reference or order
    const isUnchanged =
      lastSavedSet !== undefined &&
      lastSavedSet.size === selected.length &&
      selected.every((id) => lastSavedSet.has(id))

    const isLastPainting =
      currentPainting === session.survey.totalPaintings

    // Only call POST /api/survey/answer if never saved or impression IDs differ
    if (!isUnchanged && currentItem.sessionPaintingId) {
      try {
        isSavingRef.current = true
        const saveResult = await surveyRepository.saveAnswer({
          sessionId: session.survey.id,
          sessionPaintingId: currentItem.sessionPaintingId,
          impressionIds: selected,
        })

        // 1. Mark current answer as saved
        lastSavedAnswersRef.current.set(currentItem.id, new Set(selected))

        // 2. Authoritative sync with server snapshot
        if (saveResult.serverAnswers && saveResult.serverAnswers.length > 0) {
          for (const sa of saveResult.serverAnswers) {
            if (sa.isAnswered && sa.impressionIds.length > 0) {
              lastSavedAnswersRef.current.set(sa.paintingId, new Set(sa.impressionIds))
            }
          }
          syncServerAnswers(saveResult.serverAnswers)
        }

        // 3. If all 20 paintings are now answered across all devices
        if (saveResult.isSessionCompleted || saveResult.nextUnansweredPosition === null) {
          setConfirming(true)
          return
        }

        // 4. If another device answered intermediate paintings, jump ahead directly
        if (
          saveResult.nextUnansweredPosition !== undefined &&
          saveResult.nextUnansweredPosition !== null &&
          saveResult.nextUnansweredPosition > currentPainting + 1
        ) {
          goToPainting(saveResult.nextUnansweredPosition)
          return
        }
      } catch (err: any) {
        console.error('Error saving answer:', err)

        const isOffline =
          err?.code === 'NETWORK_OFFLINE' ||
          err?.code === 'NETWORK_ERROR' ||
          !navigator.onLine ||
          err?.action === 'RETRY'

        if (isOffline) {
          setAlertModal({
            isOpen: true,
            title: err?.title || 'Koneksi Internet Terputus',
            message:
              err?.message ||
              'Gagal menyimpan penilaian karena sambungan internet terputus. Pilihan Anda tetap aman. Silakan periksa jaringan dan coba lagi.',
            type: 'offline',
            primaryText: 'Coba Lagi',
            secondaryText: 'Tutup',
            onPrimary: () => {
              closeAlertModal()
              handleFinish()
            },
            onSecondary: () => {
              closeAlertModal()
            },
          })
          return
        }

        if (
          err?.code === 'SESSION_NOT_FOUND' ||
          err?.code === 'SESSION_EXPIRED' ||
          err?.action === 'RESET_SESSION' ||
          err?.message?.includes('kedaluwarsa')
        ) {
          setAlertModal({
            isOpen: true,
            title: err?.title || 'Sesi Survei Tidak Valid',
            message:
              err?.message ||
              'Sesi survei Anda tidak ditemukan di server atau telah kedaluwarsa. Silakan mulai sesi survei baru.',
            type: 'error',
            primaryText: 'Kembali ke Responden',
            onPrimary: () => {
              closeAlertModal()
              clearProgress()
              if (typeof window !== 'undefined') {
                localStorage.removeItem('survey-progress')
              }
              router.push('/respondent')
            },
          })
          return
        }

        if (
          err?.code === 'SESSION_ALREADY_COMPLETED' ||
          err?.message?.includes('selesai') ||
          err?.message?.includes('COMPLETED')
        ) {
          setAlertModal({
            isOpen: true,
            title: err?.title || 'Survei Telah Selesai',
            message:
              err?.message ||
              'Sesi survei ini telah diselesaikan sebelumnya.',
            type: 'info',
            primaryText: 'Halaman Selesai',
            onPrimary: () => {
              closeAlertModal()
              clearProgress()
              if (typeof window !== 'undefined') {
                localStorage.removeItem('survey-progress')
              }
              router.push('/thank-you')
            },
          })
          return
        }

        setAlertModal({
          isOpen: true,
          title: err?.title || 'Gagal Menyimpan Jawaban',
          message:
            err?.message ||
            'Terjadi kendala saat menyimpan jawaban Anda. Silakan coba lagi.',
          type: 'error',
          primaryText: 'Coba Lagi',
          secondaryText: 'Tutup',
          onPrimary: () => {
            closeAlertModal()
            handleFinish()
          },
          onSecondary: () => {
            closeAlertModal()
          },
        })
        return
      } finally {
        isSavingRef.current = false
      }
    }

    if (isLastPainting) {
      setConfirming(true)
      return
    }

    goNext()
  }, [
    currentPainting,
    getSelectedImpressions,
    goToPainting,
    syncServerAnswers,
    goNext,
    session,
    clearProgress,
    router,
    closeAlertModal,
  ])

  const handleBack = useCallback(() => {
    if (currentPainting > 1) {
      goPrevious()
    }
  }, [currentPainting, goPrevious])

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
    return alertModal.isOpen ? (
      <CuratorialAlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryButtonText={alertModal.primaryText}
        secondaryButtonText={alertModal.secondaryText}
        onPrimaryClick={alertModal.onPrimary}
        onSecondaryClick={alertModal.onSecondary}
      />
    ) : null
  }

  const painting =
    session.survey.paintings.find(
      (item) =>
        item.position ===
        currentPainting,
    )

  if (!painting) {
    return alertModal.isOpen ? (
      <CuratorialAlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryButtonText={alertModal.primaryText}
        secondaryButtonText={alertModal.secondaryText}
        onPrimaryClick={alertModal.onPrimary}
        onSecondaryClick={alertModal.onSecondary}
      />
    ) : null
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

      <CuratorialAlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        primaryButtonText={alertModal.primaryText}
        secondaryButtonText={alertModal.secondaryText}
        onPrimaryClick={alertModal.onPrimary}
        onSecondaryClick={alertModal.onSecondary}
      />
    </>
  )
}
