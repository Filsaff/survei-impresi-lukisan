import * as React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SurveyBottomBarProps {
  current: number
  total: number
  canProceed: boolean
  isSaving?: boolean
  onBack: () => void
  onNext: () => void
}

export const SurveyBottomBar = React.memo(function SurveyBottomBar({
  current,
  total,
  canProceed,
  isSaving = false,
  onBack,
  onNext,
}: SurveyBottomBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <>
      {/* Floating Curatorial Saving Alert Capsule */}
      {isSaving && (
        <div
          role="status"
          aria-live="polite"
          className="
            fixed
            bottom-24
            sm:bottom-28
            left-1/2
            -translate-x-1/2
            z-40
            flex
            items-center
            gap-3
            rounded-full
            border
            border-red-900/15
            bg-white/95
            px-5
            py-2.5
            shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.04)]
            backdrop-blur-md
            animate-in
            fade-in
            slide-in-from-bottom-3
            duration-200
          "
        >
          <div className="size-4 rounded-full border-2 border-red-900/25 border-t-red-900 animate-spin shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-800">
            Menyimpan penilaian & menyiapkan lukisan berikutnya...
          </span>
        </div>
      )}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-30
          border-t
          border-neutral-200/70
          bg-white/95
          px-6
          py-3.5
          shadow-[0_-8px_30px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)]
        "
      >
        {/* Top Accent Progress Line spanning the entire viewport width */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-neutral-200/60 overflow-hidden">
          <div
            className={`h-full bg-red-800 transition-all duration-500 ease-out ${
              isSaving ? 'animate-pulse opacity-85' : ''
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="
            mx-auto
            flex
            flex-col
            gap-3.5
            sm:flex-row
            sm:items-center
            sm:justify-between
            max-w-7xl
          "
        >
          {/* Left Side: Curatorial Progress Readout */}
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.16em] text-neutral-600 uppercase">
              LUKISAN <span className="font-bold text-neutral-900">{String(current).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" aria-hidden="true" />
            <span className="inline-flex items-center rounded-full border border-red-900/15 bg-red-900/[0.07] px-3 py-0.5 text-xs sm:text-xs font-bold tracking-wider text-red-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              {Math.round(progress)}% SELESAI
            </span>
          </div>

          {/* Right Side: Action Navigation Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
            {current > 1 && (
              <Button
                type="button"
                variant="glass"
                disabled={isSaving}
                onClick={onBack}
                className="min-w-28 sm:min-w-36 md:min-w-44 flex-1 sm:flex-initial"
              >
                <ArrowLeft size={16} />
                Kembali
              </Button>
            )}

            <Button
              type="button"
              variant="glassRed2"
              disabled={!canProceed || isSaving}
              onClick={onNext}
              className="min-w-28 sm:min-w-36 md:min-w-44 flex-1 sm:flex-initial transition-all duration-200"
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                  <span>Menyimpan...</span>
                </span>
              ) : current === total ? (
                'Selesai'
              ) : (
                <>
                  Selanjutnya
                  <ArrowRight size={17} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
})
