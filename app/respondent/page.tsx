'use client'

import {
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  emptyRespondent,
  type Respondent,
} from '@/domain/survey'

import {
  surveyRepository,
} from '@/data/survey-repository'

import {
  startSurveyUseCase,
} from '@/application/use-cases/start-survey'

import {
  RespondentPage,
} from '@/presentation/pages/respondent-page'

import {
  CuratorialAlertModal,
  type CuratorialAlertType,
} from '@/presentation/components/survey'

import {
  useSurveyStore,
} from '@/presentation/stores/survey-store'

export default function Page() {
  const router = useRouter()

  const loadSession =
    useSurveyStore(
      (state) =>
        state.loadSession,
    )

  const [
    respondent,
    setRespondent,
  ] = useState<Respondent>(
    emptyRespondent,
  )

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: CuratorialAlertType
    primaryText: string
    secondaryText?: string
    onPrimary: () => void
    onSecondary?: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    primaryText: 'Mengerti',
    onPrimary: () => {},
  })

  const [submitting, setSubmitting] = useState(false)

  const handleStart = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      const session =
        await startSurveyUseCase(
          surveyRepository,
          respondent,
        )

      loadSession(
        session,
      )

      router.push(
        '/survey',
      )
    } catch (err: any) {
      console.error('Error starting survey:', err)

      if (err?.code === 'ALL_PAINTINGS_EVALUATED') {
        setAlertModal({
          isOpen: true,
          title: err?.title || 'Apresiasi Penuh Selesai',
          message:
            err?.message ||
            `Email "${respondent.email}" telah memberikan apresiasi untuk seluruh lukisan dalam penelitian ini. Terima kasih banyak atas kontribusi Anda.`,
          type: 'info',
          primaryText: 'Mengerti',
          onPrimary: () => {
            setAlertModal((prev) => ({ ...prev, isOpen: false }))
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
        setAlertModal({
          isOpen: true,
          title: err?.title || 'Koneksi Internet Terputus',
          message:
            err?.message ||
            'Gagal memulai survei karena sambungan internet terputus. Silakan periksa jaringan Anda dan coba lagi.',
          type: 'offline',
          primaryText: 'Coba Lagi',
          secondaryText: 'Tutup',
          onPrimary: () => {
            setAlertModal((prev) => ({ ...prev, isOpen: false }))
            handleStart()
          },
          onSecondary: () => {
            setAlertModal((prev) => ({ ...prev, isOpen: false }))
          },
        })
        return
      }

      setAlertModal({
        isOpen: true,
        title: err?.title || 'Gagal Memulai Survei',
        message:
          err?.message ||
          'Terjadi kendala saat memulai sesi survei. Silakan periksa kembali data Anda atau coba beberapa saat lagi.',
        type: 'error',
        primaryText: 'Mengerti',
        onPrimary: () => {
          setAlertModal((prev) => ({ ...prev, isOpen: false }))
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <RespondentPage
        value={respondent}
        onChange={setRespondent}
        onStart={handleStart}
      />

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