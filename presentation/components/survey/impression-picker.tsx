import * as React from 'react'
import { Search, X } from 'lucide-react'
import type { Impression } from '@/domain/survey'
import { ImpressionButton } from '@/components/ui/impression-button'
import { ImpressionTipPopover } from './impression-tip-popover'

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
          <p className="text-xs font-semibold tracking-[0.2em] text-red-800">
            KATA IMPRESI
          </p>

          <ImpressionTipPopover
            isOpen={showTip}
            onToggle={() => setShowTip((prev) => !prev)}
          />
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
          Pilih semua kata sifat yang menurut Anda paling mewakili nuansa dan emosi dari karya seni di samping.
        </p>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-neutral-400">
              PILIHAN ANDA
            </p>

            <div className="flex flex-wrap gap-2">
              {selected.map((impressionId) => {
                const impression = impressionMap.get(impressionId)
                if (!impression) return null

                return (
                  <button
                    key={impression.id}
                    type="button"
                    onClick={() => onToggle(impression.id)}
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
            />
          ))}
        </div>

        {impressions.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Tidak ada kata yang cocok.
          </p>
        )}
      </div>
    </section>
  )
})
