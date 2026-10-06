import * as React from 'react'

export interface SurveyProgressBarProps {
  current: number
  total: number
}

export const SurveyProgressBar = React.memo(function SurveyProgressBar({
  current,
  total,
}: SurveyProgressBarProps) {
  const progress = (current / total) * 100

  return (
    <div
      className="
        sticky
        z-40
        border-b
        border-neutral-200/60
        bg-white/95
        shadow-[0_2px_8px_rgba(0,0,0,0.02)]
      "
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span
            className="
              text-[11px]
              font-semibold
              tracking-[0.18em]
              text-neutral-400
            "
          >
            LUKISAN {current} / {total}
          </span>

          <span
            className="
              text-[11px]
              font-semibold
              tracking-[0.12em]
              text-red-800
            "
          >
            {Math.round(progress)}% SELESAI
          </span>
        </div>

        <div
          className="
            h-1
            overflow-hidden
            rounded-full
            bg-neutral-100
          "
        >
          <div
            className="
              h-full
              rounded-full
              bg-red-800
              transition-all
              duration-500
              ease-out
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
})
