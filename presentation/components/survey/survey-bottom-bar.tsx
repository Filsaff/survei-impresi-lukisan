import * as React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SurveyBottomBarProps {
  current: number
  total: number
  canProceed: boolean
  onBack: () => void
  onNext: () => void
}

export const SurveyBottomBar = React.memo(function SurveyBottomBar({
  current,
  total,
  canProceed,
  onBack,
  onNext,
}: SurveyBottomBarProps) {
  return (
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
        py-4
        shadow-[0_-4px_20px_rgba(0,0,0,0.04)]
      "
    >
      <div
        className="
          mx-auto
          flex
          items-center
          justify-center
          lg:justify-end
          gap-4
          max-w-7xl
          px-6
        "
      >
        <Button
          type="button"
          variant="glass"
          onClick={onBack}
          className="md:min-w-55 min-w-28"
        >
          <ArrowLeft size={17} />
          Kembali
        </Button>

        <Button
          type="button"
          variant="glassRed2"
          disabled={!canProceed}
          onClick={onNext}
          className="md:min-w-55 min-w-28"
        >
          {current === total ? (
            'Selesai'
          ) : (
            <>
              Selanjutnya
              <ArrowRight size={19} />
            </>
          )}
        </Button>
      </div>
    </div>
  )
})
