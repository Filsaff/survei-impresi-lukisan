import * as React from 'react'

export interface ImpressionTipPopoverProps {
  isOpen: boolean
  onToggle: () => void
}

export const ImpressionTipPopover = React.memo(function ImpressionTipPopover({
  isOpen,
  onToggle,
}: ImpressionTipPopoverProps) {
  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Tips memilih impresi"
        aria-expanded={isOpen}
        className="
          group/tip
          flex
          size-7
          items-center
          justify-center
          rounded-full
          border
          border-neutral-300/70
          bg-white/85
          text-[11px]
          font-bold
          text-neutral-600
          shadow-[0_3px_10px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)]
          transition-all
          duration-300
          hover:border-neutral-400
          hover:bg-white
          hover:text-neutral-900
          active:scale-90
        "
      >
        ?
      </button>

      {/* Floating tip */}
      {isOpen && (
        <div
          className="
            absolute
            right-0
            top-10
            z-50
            w-[min(16rem,calc(100vw-3rem))]
            origin-top-right
            animate-in
            fade-in-0
            zoom-in-95
            slide-in-from-top-2
            rounded-2xl
            border
            border-white/20
            bg-neutral-950/95
            p-4
            text-left
            shadow-[0_18px_45px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15)]
          "
        >
          {/* Top reflection */}
          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-6
              right-6
              top-0
              h-px
              bg-white/40
              blur-[1px]
            "
          />

          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/50">
            TIPS MEMILIH
          </p>

          <p className="mt-2 text-xs leading-6 text-white/80">
            Pilih semua kata sifat yang menurut Anda paling mewakili nuansa dan emosi dari karya seni di samping.
          </p>
        </div>
      )}
    </div>
  )
})
