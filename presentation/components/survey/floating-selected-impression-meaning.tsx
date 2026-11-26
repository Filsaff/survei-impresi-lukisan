'use client'

import * as React from 'react'
import {
  X,
  BookOpen,
  Info,
  Sparkles,
  Tag,
  Trash2,
  GitCompare,
  ChevronDown,
} from 'lucide-react'
import type { Impression } from '@/domain/survey'
import {
  GLOSSARY_IMPRESSIONS,
  WORD_COMPARISONS,
  type ImpressionGlossaryItem,
  type WordComparison,
} from '@/domain/impression-glossary'
import { Button } from '@/components/ui/button'

export interface FloatingSelectedImpressionMeaningProps {
  isOpen: boolean
  onClose: () => void
  selectedImpressionIds: string[]
  allImpressions: Impression[]
  onToggleImpression: (impressionId: string) => void
}

export function FloatingSelectedImpressionMeaning({
  isOpen,
  onClose,
  selectedImpressionIds,
  allImpressions,
  onToggleImpression,
}: FloatingSelectedImpressionMeaningProps) {
  const [expandedComparisons, setExpandedComparisons] = React.useState<
    Record<string, boolean>
  >({})

  const toggleComparison = (id: string) => {
    setExpandedComparisons((prev) => ({ ...prev, [id]: !prev[id] }))
  }
  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Map impression IDs or names to glossary items
  const selectedGlossaryItems = React.useMemo(() => {
    if (!selectedImpressionIds.length) return []

    // Build fast lookup by ID and by lowercased name
    const idMap = new Map<string, ImpressionGlossaryItem>()
    const nameMap = new Map<string, ImpressionGlossaryItem>()
    for (const item of GLOSSARY_IMPRESSIONS) {
      idMap.set(item.id, item)
      nameMap.set(item.name.toLowerCase(), item)
    }

    // Build impression name lookup from survey
    const surveyNameMap = new Map<string, string>()
    for (const imp of allImpressions) {
      surveyNameMap.set(imp.id, imp.name)
    }

    const result: ImpressionGlossaryItem[] = []
    for (const id of selectedImpressionIds) {
      let found = idMap.get(id)
      if (!found) {
        const surveyName = surveyNameMap.get(id)
        if (surveyName) {
          found = nameMap.get(surveyName.toLowerCase())
        }
      }
      if (found) {
        result.push(found)
      } else {
        // Fallback placeholder if not matched
        const surveyName = surveyNameMap.get(id) || id
        result.push({
          id,
          number: 0,
          name: surveyName,
          meaning: 'Kesan emosional dan visual terhadap karya seni lukis.',
          category: 'suasana',
          categoryLabel: 'Kesan Visual',
          keywords: ['impresi', 'lukisan', 'budaya'],
        })
      }
    }
    return result
  }, [selectedImpressionIds, allImpressions])

  // Detect if any selected words have active comparative pairs (Confusion Matrix)
  const activeComparisons = React.useMemo(() => {
    if (selectedGlossaryItems.length < 2) return []
    const selectedNames = new Set(
      selectedGlossaryItems.map((item) => item.name.toLowerCase()),
    )

    const matches: WordComparison[] = []
    for (const comp of WORD_COMPARISONS) {
      if (
        selectedNames.has(comp.wordA.toLowerCase()) &&
        selectedNames.has(comp.wordB.toLowerCase())
      ) {
        matches.push(comp)
      }
    }
    return matches
  }, [selectedGlossaryItems])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Makna Impresi Terpilih"
      className="fixed inset-0 z-40 pointer-events-none"
    >
      {/* Backdrop (Clicks close modal, zero heavy blur for 60fps) */}
      <div
        onClick={onClose}
        className="fixed inset-0 pointer-events-auto bg-neutral-900/30 transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Floating Card: Strictly bounded between top-20 and bottom-24 so top navbar and bottom bar are NEVER covered */}
      <div
        className="
          pointer-events-auto
          fixed
          z-40
          top-20
          bottom-24
          md:top-24
          md:bottom-28
          inset-x-4
          mx-auto
          max-w-md
          lg:inset-x-auto
          lg:right-8
          lg:w-[440px]
          flex
          flex-col
          rounded-3xl
          border
          border-neutral-200/90
          bg-white/95
          shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.95)]
          animate-in
          fade-in-0
          zoom-in-95
          duration-200
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-red-900/10 text-red-900">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Makna Impresi Terpilih
              </h2>
              <p className="text-[11px] text-neutral-500">
                {selectedImpressionIds.length > 0
                  ? `${selectedImpressionIds.length} kata dipilih untuk lukisan ini`
                  : 'Belum ada impresi dipilih'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup penjelasan makna"
            className="
              flex
              size-8
              items-center
              justify-center
              rounded-full
              text-neutral-400
              transition-colors
              hover:bg-neutral-100
              hover:text-neutral-800
              active:scale-95
            "
          >
            <X size={17} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* EMPTY STATE */}
          {selectedGlossaryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60">
                <Sparkles size={22} />
              </div>

              <h3 className="text-base font-bold text-neutral-900">
                Kamu belum memilih impresi
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-neutral-500 max-w-xs">
                Pilih satu atau beberapa kata impresi pada daftar di samping terlebih dahulu untuk melihat penjelasannya di sini.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  min-h-[44px]
                  px-5
                  py-2.5
                  rounded-2xl
                  border
                  border-neutral-300
                  bg-white
                  text-sm
                  font-semibold
                  text-neutral-800
                  shadow-xs
                  transition-all
                  duration-150
                  hover:bg-neutral-50
                  hover:border-neutral-400
                  active:scale-[0.98]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-900/30
                "
              >
                Mulai Memilih Impresi
              </button>
            </div>
          ) : (
            <>
              {/* COMPARISON CALLOUT (If user selected confusing pair) */}
              {activeComparisons.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 shadow-xs">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <GitCompare size={14} className="text-amber-700" />
                    <span>Perbedaan Antara Kata yang Anda Pilih</span>
                  </div>
                  {activeComparisons.map((c) => (
                    <div key={c.id} className="mt-2 text-[11px] leading-relaxed text-amber-900/90 space-y-1">
                      <p className="font-semibold">{c.title}:</p>
                      <p>
                        • <strong>{c.wordA}</strong>: {c.descA}
                      </p>
                      <p>
                        • <strong>{c.wordB}</strong>: {c.descB}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* LIST OF SELECTED IMPRESSIONS */}
              <div className="space-y-3">
                {selectedGlossaryItems.map((item) => (
                  <div
                    key={item.id}
                    className="
                      rounded-2xl
                      border
                      border-neutral-200/80
                      bg-neutral-50/50
                      p-4
                      shadow-xs
                      transition-all
                      hover:border-neutral-300
                      hover:bg-white
                    "
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.number > 0 && (
                          <span className="font-mono text-[10px] font-bold text-red-900/60">
                            #{item.number}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-neutral-900">
                          {item.name}
                        </h4>
                        <span className="rounded bg-neutral-200/60 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Unpick Button */}
                      <button
                        type="button"
                        onClick={() => onToggleImpression(item.id)}
                        className="
                          group/unpick
                          inline-flex
                          items-center
                          gap-1
                          rounded-lg
                          px-2
                          py-1
                          text-[11px]
                          font-medium
                          text-neutral-400
                          hover:bg-red-50
                          hover:text-red-700
                          transition-colors
                        "
                        title={`Hapus pilihan kata "${item.name}"`}
                      >
                        <Trash2 size={12} />
                        <span>Batal</span>
                      </button>
                    </div>

                    {/* Meaning Card */}
                    <div className="mt-2.5 rounded-xl border border-neutral-100 bg-white p-3">
                      <p className="text-[10px] font-semibold tracking-wider text-neutral-400 mb-0.5">
                        MAKNA KURATORIAL:
                      </p>
                      <p className="text-xs leading-relaxed text-neutral-800">
                        {item.meaning}
                      </p>
                    </div>

                    {/* Keywords */}
                    {item.keywords?.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1">
                        <Tag size={10} className="text-neutral-400 mr-0.5" />
                        {item.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-md border border-neutral-200/70 bg-white px-2 py-0.5 text-[10px] text-neutral-500"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Button untuk Melihat Perbandingan Kata yang Mirip (vs) */}
                    {(() => {
                      const lowerName = item.name.toLowerCase()
                      const comparisons = WORD_COMPARISONS.filter(
                        (c) =>
                          c.wordA.toLowerCase() === lowerName ||
                          c.wordB.toLowerCase() === lowerName,
                      )
                      if (comparisons.length === 0) return null

                      const isExpanded = !!expandedComparisons[item.id]
                      const partnerNames = comparisons
                        .map((c) =>
                          c.wordA.toLowerCase() === lowerName
                            ? c.wordB
                            : c.wordA,
                        )
                        .join(', ')

                      return (
                        <div className="mt-3 border-t border-neutral-200/60 pt-2.5">
                          <button
                            type="button"
                            onClick={() => toggleComparison(item.id)}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-xl
                              border
                              border-amber-300/80
                              bg-amber-50/90
                              px-2.5
                              py-1
                              text-[11px]
                              font-semibold
                              text-amber-900
                              hover:bg-amber-100
                              transition-colors
                            "
                          >
                            <GitCompare size={12} className="text-amber-700" />
                            <span>
                              {isExpanded
                                ? 'Tutup Perbandingan'
                                : `Lihat Perbedaan (vs ${partnerNames})`}
                            </span>
                            <ChevronDown
                              size={12}
                              className={`transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 space-y-2 rounded-xl border border-amber-200/90 bg-amber-50/80 p-3 text-[11px] text-amber-950 animate-in fade-in-0 duration-150">
                              {comparisons.map((c) => (
                                <div key={c.id} className="space-y-1">
                                  <p className="font-bold text-amber-900">
                                    {c.title}:
                                  </p>
                                  <p className="leading-relaxed">
                                    • <strong className="text-neutral-900">{c.wordA}</strong>: {c.descA}
                                  </p>
                                  <p className="leading-relaxed">
                                    • <strong className="text-neutral-900">{c.wordB}</strong>: {c.descB}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 bg-neutral-50/80 px-6 py-3.5 flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-600">
            {selectedGlossaryItems.length > 0 ? (
              <>
                <strong className="text-neutral-900 font-semibold">
                  {selectedGlossaryItems.length} kata
                </strong>{' '}
                dipilih
              </>
            ) : (
              'Belum ada kata terpilih'
            )}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="
              inline-flex
              items-center
              justify-center
              min-h-[44px]
              px-5
              py-2.5
              rounded-full
              bg-red-900
              text-sm
              text-white
              shadow-[0_4px_14px_rgba(153,27,27,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]
              transition-all
              duration-150
              hover:bg-red-800
              hover:shadow-[0_6px_20px_rgba(153,27,27,0.35)]
              active:scale-[0.98]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-900/40
            "
          >
            Selesai Membaca
          </button>
        </div>
      </div>
    </div>
  )
}
