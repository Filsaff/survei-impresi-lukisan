'use client'

import * as React from 'react'
import type { SurveyPainting } from '@/domain/survey'
import { surveyRepository } from '@/data/survey-repository'
import { PageShell } from '@/presentation/layout/site-layout'
import BrushStrokes from '@/components/decorations/brush-strokes'
import {
  PaintingDisplay,
  ImpressionPicker,
  SurveyBottomBar,
  SurveyConfirmationModal,
  ConfirmationDialog,
} from '@/presentation/components/survey'

export interface SurveyPageProps {
  current: number
  total: number
  painting: SurveyPainting
  selected: string[]
  onToggle: (impressionId: string) => void
  onBack: () => void
  onFinish: () => void
}

export const SurveyPage = React.memo(function SurveyPage({
  current,
  total,
  painting,
  selected,
  onToggle,
  onBack,
  onFinish,
}: SurveyPageProps) {
  const allImpressions = React.useMemo(
    () => surveyRepository.getImpressions(),
    [],
  )

  return (
    <PageShell active="survey" footer={false}>
      <main className="relative min-h-screen top-20 overflow-hidden bg-white">
        {/* Ambient background */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[45%]
            -z-0
            h-[600px]
            w-[900px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(ellipse_at_center,rgba(153,27,27,0.035)_0%,transparent_70%)]
          "
        />
        <BrushStrokes animated />

        {/* Main content grid */}
        <section
          className="
            relative
            z-10
            mx-auto
            grid
            max-w-7xl
            items-start
            gap-10
            px-6
            py-8
            pb-36
            lg:grid-cols-[1fr_1fr]
            lg:gap-16
          "
        >
          {/* Painting Display */}
          <PaintingDisplay painting={painting} />

          {/* Impression Picker */}
          <ImpressionPicker
            allImpressions={allImpressions}
            selected={selected}
            onToggle={onToggle}
          />
        </section>

        {/* Bottom actions bar */}
        <SurveyBottomBar
          current={current}
          total={total}
          canProceed={selected.length > 0}
          onBack={onBack}
          onNext={onFinish}
        />
      </main>
    </PageShell>
  )
})

export { ConfirmationDialog, SurveyConfirmationModal }
