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

  const handleStart = async () => {
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
  }

  return (
    <RespondentPage
      value={respondent}
      onChange={setRespondent}
      onStart={handleStart}
    />
  )
}