import * as React from 'react'
import { BookOpen, Search, X } from 'lucide-react'
import type { Impression } from '@/domain/survey'
import { ImpressionButton } from '@/components/ui/impression-button'
import { ImpressionTipPopover } from './impression-tip-popover'
import { HoverImpressionMeaningPopover } from './hover-impression-meaning-popover'
import { MobileImpressionMeaningSheet } from './mobile-impression-meaning-sheet'

export interface ImpressionPickerProps {
  allImpressions: Impression[]
  selected: string[]
  onToggle: (impressionId: string) => void
}

export const ImpressionPicker = React.memo(function ImpressionPicker({
  allImpressions,
  selected,
  onToggle,
}: ImpressionPickerProps) {
  const [query, setQuery] = React.useState('')
  const [showTip, setShowTip] = React.useState(false)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false)

  // Hover popover state (desktop only, triggered after 1.5 seconds)
  const [activePopover, setActivePopover] = React.useState<{
    targetRect: DOMRect
    name: string
  } | null>(null)

  const hoverTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, name: string) => {
      // Strictly disabled on mobile / touch devices
      if (
        typeof window !== 'undefined' &&
        (window.innerWidth < 1024 ||
          window.matchMedia('(pointer: coarse)').matches)
      ) {
        return
      }

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }

      const rect = e.currentTarget.getBoundingClientRect()
      hoverTimerRef.current = setTimeout(() => {
        setActivePopover({
          targetRect: rect,
          name,
        })
      }, 1500) // 1.5 seconds delay
    },
    [],
  )

  const handleMouseLeave = React.useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    // Grace period allows moving cursor into the popover itself
    closeTimerRef.current = setTimeout(() => {
      setActivePopover(null)
    }, 200)
  }, [])

  const handlePopoverMouseEnter = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handlePopoverMouseLeave = React.useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setActivePopover(null)
    }, 150)
  }, [])

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const impressionMap = React.useMemo(() => {
    const map = new Map<string, Impression>()
    for (const item of allImpressions) {
      map.set(item.id, item)
    }
    return map
  }, [allImpressions])

  const selectedSet = React.useMemo(
    () => new Set(selected),
    [selected],
  )

  React.useEffect(() => {
    if (!showTip) return
    const timer = window.setTimeout(() => {
      setShowTip(false)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [showTip])

  const impressions = React.useMemo(() => {
    if (!query.trim()) return allImpressions
    const lower = query.toLowerCase()
    return allImpressions.filter((impression) =>
      impression.name.toLowerCase().includes(lower),
    )
  }, [allImpressions, query])

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[2rem]
        border
        border-neutral-200/70
        bg-neutral-200/60
        p-7
        md:p-9
        shadow-[0_20px_60px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)]
      "
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <p className="text-xs font-semibold tracking-[0.2em] text-red-800">
              KATA IMPRESI
            </p>
            {/* Desktop hint badge */}
            <span className="hidden lg:inline-flex items-center rounded-full bg-red-900/10 px-2.5 py-0.5 text-[10px] font-medium text-red-900">
              Hover 1.5 detik untuk makna
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Sheet Trigger Button (Only shown on mobile where hover is impractical) */}
            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(true)}
              className="
                lg:hidden
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-neutral-300/80
                bg-white/95
                px-3
                py-1.5
                text-xs
                font-semibold
                text-neutral-800
                shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)]
                active:scale-95
                transition-transform
              "
              title="Buka Panduan Makna Impresi"
            >
              <BookOpen size={13} className="text-red-900" />
              <span>Makna Impresi</span>
              {selected.length > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-red-900 text-[10px] font-bold text-white">
                  {selected.length}
                </span>
              )}
            </button>

            <ImpressionTipPopover
              isOpen={showTip}
              onToggle={() => setShowTip((prev) => !prev)}
            />
          </div>
        </div>

        <h1
          className="
            mt-5
            font-serif
            text-4xl
            font-medium
            leading-[1.08]
            tracking-tight
            text-neutral-900
            hidden
            lg:block
            md:text-5xl
          "
        >
          Bagaimana kesan
          <br />
          Anda terhadap
          <br />
          lukisan ini?
        </h1>

        {/* Desktop instruction */}
        <p
          className="
            mt-5
            hidden
            max-w-xl
            text-sm
            leading-7
            text-neutral-500
            lg:block
          "
        >
          Pilih semua kata sifat yang paling mewakili emosi lukisan.
          Arahkan kursor selama 1.5 detik pada kata apa pun untuk membaca makna dan perbedaannya.
        </p>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400">
                PILIHAN ANDA
              </p>
              {/* Mobile quick link to open sheet and review chosen impressions */}
              <button
                type="button"
                onClick={() => setIsMobileSheetOpen(true)}
                className="lg:hidden text-[11px] font-medium text-red-900 hover:text-red-950 underline underline-offset-2"
              >
                Baca arti pilihan ({selected.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.map((impressionId) => {
                const impression = impressionMap.get(impressionId)
                if (!impression) return null

                return (
                  <button
                    key={impression.id}
                    type="button"
                    onClick={() => onToggle(impression.id)}
                    onMouseEnter={(e) => handleMouseEnter(e, impression.name)}
                    onMouseLeave={handleMouseLeave}
                    className="
                      group/chip
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-red-900/20
                      bg-red-900/[0.08]
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-red-900
                      transition-colors
                      duration-100
                      hover:bg-red-900/[0.15]
                    "
                  >
                    {impression.name}
                    <X
                      size={13}
                      className="opacity-50 transition-opacity group-hover/chip:opacity-100"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div
          className="
            relative
            mt-7
            flex
            h-12
            items-center
            rounded-xl
            border
            border-white/80
            bg-white/70
            px-4
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]
            transition-all
            focus-within:border-neutral-300
            focus-within:bg-white/[0.70]
          "
        >
          <Search size={18} className="shrink-0 text-neutral-400" />

          <input
            aria-label="Cari impresi"
            placeholder="Cari Impresi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              ml-3
              h-full
              min-w-0
              flex-1
              bg-transparent
              text-sm
              text-neutral-900
              outline-none
              placeholder:text-neutral-400
            "
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Hapus pencarian"
              className="
                rounded-full
                p-1
                text-neutral-400
                transition-colors
                hover:bg-neutral-100
                hover:text-neutral-700
              "
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Impression tags grid */}
        <div className="mt-5 flex max-h-52 flex-wrap gap-2 overflow-y-auto overscroll-contain pr-1 pt-2">
          {impressions.map((impression) => (
            <ImpressionButton
              key={impression.id}
              id={impression.id}
              name={impression.name}
              isSelected={selectedSet.has(impression.id)}
              onToggle={onToggle}
              onMouseEnter={(e) => handleMouseEnter(e, impression.name)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {impressions.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Tidak ada kata yang cocok.
          </p>
        )}
      </div>

      {/* Desktop: Floating 1.5s Hover Meaning Popover (Always upward, clamped safe zone) */}
      <HoverImpressionMeaningPopover
        targetRect={activePopover?.targetRect || null}
        impressionName={activePopover?.name || null}
        isOpen={Boolean(activePopover)}
        onMouseEnterPopover={handlePopoverMouseEnter}
        onMouseLeavePopover={handlePopoverMouseLeave}
        onClose={() => setActivePopover(null)}
      />

      {/* Mobile: Ergonomic Bottom Sheet Drawer (Non-intrusive, leaves painting visible) */}
      <MobileImpressionMeaningSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        selectedIds={selected}
        allImpressions={allImpressions}
        onToggleImpression={onToggle}
      />
    </section>
  )
})
