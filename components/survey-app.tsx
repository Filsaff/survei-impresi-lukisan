// 'use client'

// import { useState } from 'react'
// import { HomePage } from '@/presentation/pages/home-page'
// import { RespondentPage } from '@/presentation/pages/respondent-page'
// import { ConfirmationDialog, SurveyPage } from '@/presentation/pages/survey-page'
// import { ThankYouPage } from '@/presentation/pages/thank-you-page'
// import { useSurveyFlow } from '@/presentation/hooks/use-survey-flow'

// export default function SurveyApp() {
//   const flow = useSurveyFlow()
//   const [confirming, setConfirming] = useState(false)
//   if (flow.route === 'home') return <HomePage onStart={() => flow.go('respondent')}/>
//   if (flow.route === 'respondent') return <RespondentPage value={flow.respondent} onChange={flow.setRespondent} onStart={() => flow.go('survey')}/>
//   if (flow.route === 'thanks') return <ThankYouPage/>
//   return <><SurveyPage current={flow.currentPainting} selected={flow.selected} onToggle={flow.toggleImpression} onBack={() => flow.go('respondent')} onFinish={() => setConfirming(true)}/>{confirming && <ConfirmationDialog onBack={() => setConfirming(false)} onSubmit={() => { setConfirming(false); flow.go('thanks') }}/>}</>
// }