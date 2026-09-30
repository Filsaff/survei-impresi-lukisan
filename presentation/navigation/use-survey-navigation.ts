'use client'

import { useRouter } from 'next/navigation'

import {
  useSurveyStore,
} from '@/presentation/stores/survey-store'

export function useSurveyNavigation() {
  const router = useRouter()
  const hydrated =
    useSurveyStore(
      (state) => state.hydrated,
    )
  const session =
    useSurveyStore(
      (state) => state.session,
    )
  const goToSurvey = () => {
    if (!hydrated) {
      return
    }
    if (session) {
      router.push('/survey')
      return
    }
    router.push('/respondent')
  }

  return {
    goToSurvey,
  }
}