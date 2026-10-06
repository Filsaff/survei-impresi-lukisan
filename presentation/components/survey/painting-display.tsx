import * as React from 'react'
import type { SurveyPainting } from '@/domain/survey'

export interface PaintingDisplayProps {
  painting: SurveyPainting
}

export const PaintingDisplay = React.memo(function PaintingDisplay({
  painting,
}: PaintingDisplayProps) {
  return (
    <section className="flex flex-col items-center">
      <div
        className="
          relative
          w-full
          max-w-xl
          overflow-hidden
          rounded-[2rem]
          border
          border-neutral-200/70
          bg-neutral-200/60
          p-3
          shadow-[0_20px_60px_rgba(0,0,0,0.07),inset_0_1px_2px_rgba(255,255,255,0.9)]
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[1.5rem]
            bg-white
          "
        >
          <img
            src={painting.image}
            alt={painting.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="
              block
              aspect-[4/3]
              w-full
              object-contain
            "
          />
        </div>
      </div>

      <div className="mt-6 w-full max-w-xl text-left">
        <h2
          className="
            font-serif
            text-2xl
            font-medium
            tracking-tight
            text-neutral-900
            md:text-3xl
          "
        >
          {painting.title}
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-7
            text-neutral-500
          "
        >
          {painting.detail}
        </p>
      </div>
    </section>
  )
})
