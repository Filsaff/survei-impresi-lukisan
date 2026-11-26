'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  BookOpen,
  Search,
  Sparkles,
  Tag,
  Check,
  GitCompare,
  Trash2,
} from 'lucide-react'
import type { Impression } from '@/domain/survey'
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_IMPRESSIONS,
  WORD_COMPARISONS,
  type ImpressionCategory,
  type ImpressionGlossaryItem,
} from '@/domain/impression-glossary'

export interface MobileImpressionMeaningSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  allImpressions: Impression[]
  onToggleImpression: (id: string) => void
}

export function MobileImpressionMeaningSheet({
  isOpen,
  onClose,
  selectedIds,
  allImpressions,
  onToggleImpression,
}: MobileImpressionMeaningSheetProps) {
  const [mounted, setMounted] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'selected' | 'all'>('selected')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] =
    React.useState<ImpressionCategory>('semua')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-switch to 'all' if opened with 0 selected
  React.useEffect(() => {
    if (isOpen) {
      if (selectedIds.length === 0) {
        setActiveTab('all')
      } else {
        setActiveTab('selected')
      }
    }
  }, [isOpen, selectedIds.length])

  // Lock body scroll when open
  React.useEffect(() => {
    if (!isOpen) return
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [isOpen])

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])

  // Map selected IDs to glossary items
  const selectedGlossaryItems = React.useMemo(() => {
    return selectedIds
      .map((id) => {
        const imp = allImpressions.find((item) => item.id === id)
        const name = imp?.name || id
        const glossary = GLOSSARY_IMPRESSIONS.find(
          (g) => g.name.toLowerCase() === name.toLowerCase() || g.id === id,
        )
        if (glossary) return glossary
        return {
          id,
          number: 0,
          name,
          meaning: `Kesan emosional dan visual ${name} yang dirasakan pada lukisan.`,
          category: 'suasana' as ImpressionCategory,
          categoryLabel: 'Kesan Visual',
          keywords: [name.toLowerCase()],
        }
      })
      .filter(Boolean) as ImpressionGlossaryItem[]
  }, [selectedIds, allImpressions])

  // Filtered 38 impressions for "Cari Semua" tab
  const filteredAll = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return GLOSSARY_IMPRESSIONS.filter((item) => {
      const matchCat =
        selectedCategory === 'semua' || item.category === selectedCategory
      if (!matchCat) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [searchQuery, selectedCategory])

  // Find comparison for a given word
  const getComparison = React.useCallback((wordName: string) => {
    const lower = wordName.toLowerCase()
    return (
      WORD_COMPARISONS.find(
        (c) => c.wordA.toLowerCase() === lower || c.wordB.toLowerCase() === lower,
      ) || null
    )
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="
              relative
              z-10
              flex
              max-h-[82vh]
              w-full
              flex-col
              rounded-t-[2rem]
              border-t
              border-neutral-200
              bg-white
              shadow-2xl
              overflow-hidden
            "
          >
            {/* Grab handle indicator */}
            <div className="pt-3 pb-1 flex justify-center">
              <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-red-900/10 text-red-900">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-neutral-900">
                    Panduan Makna Impresi
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Penjelasan makna kuratorial & asosiasi visual
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup laci makna"
                className="
                  flex
                  size-8
                  items-center
                  justify-center
                  rounded-full
                  text-neutral-400
                  hover:bg-neutral-100
                  hover:text-neutral-800
                  transition-colors
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex px-5 pt-3 gap-2 border-b border-neutral-100 pb-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('selected')}
                className={`
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  py-2
                  text-xs
                  font-semibold
                  transition-all
                  ${
                    activeTab === 'selected'
                      ? 'bg-red-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }
                `}
              >
                <span>Pilihan Anda</span>
                <span
                  className={`
                    rounded-full
                    px-1.5
                    py-0.2
                    text-[10px]
                    font-bold
                    ${
                      activeTab === 'selected'
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 text-neutral-700'
                    }
                  `}
                >
                  {selectedIds.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  py-2
                  text-xs
                  font-semibold
                  transition-all
                  ${
                    activeTab === 'all'
                      ? 'bg-red-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                  }
                `}
              >
                <span>Cari Semua (38)</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* TAB 1: Pilihan Anda */}
              {activeTab === 'selected' && (
                <div>
                  {selectedGlossaryItems.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                        <BookOpen size={20} />
                      </div>
                      <p className="text-sm font-semibold text-neutral-700">
                        Belum ada kata yang dipilih
                      </p>
                      <p className="mt-1 text-xs text-neutral-500 max-w-xs mx-auto">
                        Pilih kata impresi pada daftar di bawah lukisan, atau buka tab &quot;Cari Semua&quot; untuk melihat 38 kata impresi.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white active:scale-95 transition-transform"
                      >
                        Buka Glosarium 38 Impresi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedGlossaryItems.map((item) => {
                        const comp = getComparison(item.name)
                        return (
                          <div
                            key={item.id}
                            className="
                              rounded-2xl
                              border
                              border-neutral-200/80
                              bg-neutral-50/60
                              p-4
                              shadow-xs
                            "
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="rounded bg-neutral-200/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                                [ {item.categoryLabel} ]
                              </span>

                              <button
                                type="button"
                                onClick={() => onToggleImpression(item.id)}
                                className="flex items-center gap-1 text-[11px] font-medium text-red-800 hover:text-red-950 p-1"
                                title="Hapus dari pilihan"
                              >
                                <Trash2 size={13} />
                                <span>Hapus</span>
                              </button>
                            </div>

                            <h4 className="font-serif text-lg font-bold text-neutral-900">
                              {item.name}
                            </h4>

                            <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">
                              {item.meaning}
                            </p>

                            {/* Keywords */}
                            {item.keywords && item.keywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                                <Tag size={11} className="text-neutral-400 shrink-0" />
                                {item.keywords.map((kw) => (
                                  <span
                                    key={kw}
                                    className="rounded bg-white border border-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600"
                                  >
                                    #{kw}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Comparison */}
                            {comp && (
                              <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-2.5 text-[11px] text-amber-900">
                                <div className="flex items-center gap-1 font-bold text-amber-800 mb-1">
                                  <GitCompare size={12} className="text-amber-700" />
                                  <span>Perbedaan vs {comp.wordA.toLowerCase() === item.name.toLowerCase() ? comp.wordB : comp.wordA}:</span>
                                </div>
                                <p className="leading-snug text-neutral-800 text-[11px]">
                                  • <strong>{comp.wordA}</strong>: {comp.descA}
                                </p>
                                <p className="leading-snug text-neutral-800 text-[11px] mt-0.5">
                                  • <strong>{comp.wordB}</strong>: {comp.descB}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Cari Semua 38 Impresi */}
              {activeTab === 'all' && (
                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="relative flex items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 shadow-xs">
                    <Search size={15} className="text-neutral-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari arti kata impresi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ml-2 w-full bg-transparent text-xs text-neutral-900 outline-none placeholder:text-neutral-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-neutral-400 hover:text-neutral-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {GLOSSARY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[11px]
                          font-medium
                          transition-all
                          ${
                            selectedCategory === cat.id
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }
                        `}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Impresi List with Toggle Button */}
                  <div className="space-y-2.5 pt-1">
                    {filteredAll.map((item) => {
                      const isSelected = selectedSet.has(item.id)
                      const comp = getComparison(item.name)

                      return (
                        <div
                          key={item.id}
                          className="
                            rounded-2xl
                            border
                            border-neutral-200
                            bg-white
                            p-3.5
                            shadow-xs
                          "
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                                  [ {item.categoryLabel} ]
                                </span>
                                <span className="font-mono text-[10px] font-bold text-neutral-400">
                                  #{item.number}
                                </span>
                              </div>
                              <h4 className="font-serif text-base font-bold text-neutral-900">
                                {item.name}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleImpression(item.id)}
                              className={`
                                flex
                                items-center
                                gap-1
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                transition-all
                                active:scale-95
                                ${
                                  isSelected
                                    ? 'bg-red-900 text-white shadow-xs'
                                    : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                                }
                              `}
                            >
                              {isSelected ? (
                                <>
                                  <Check size={12} />
                                  <span>Dipilih</span>
                                </>
                              ) : (
                                <span>Pilih</span>
                              )}
                            </button>
                          </div>

                          <p className="mt-2 text-xs leading-relaxed text-neutral-700">
                            {item.meaning}
                          </p>

                          {comp && (
                            <div className="mt-2 rounded-lg bg-amber-50/70 border border-amber-200/60 p-2 text-[10.5px] text-amber-900">
                              <span className="font-semibold text-amber-800">
                                vs {comp.wordA.toLowerCase() === item.name.toLowerCase() ? comp.wordB : comp.wordA}:
                              </span>{' '}
                              <span className="text-neutral-700">
                                {comp.wordA.toLowerCase() === item.name.toLowerCase() ? comp.descA : comp.descB}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {filteredAll.length === 0 && (
                      <p className="py-8 text-center text-xs text-neutral-400">
                        Tidak ada kata impresi yang cocok dengan pencarian.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Action */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/70">
              <button
                type="button"
                onClick={onClose}
                className="
                  w-full
                  rounded-2xl
                  bg-neutral-900
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-xs
                  transition-transform
                  active:scale-[0.98]
                "
              >
                Selesai Membaca & Lanjutkan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
