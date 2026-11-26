'use client'

import * as React from 'react'
import {
  X,
  Search,
  BookOpen,
  GitCompare,
  Check,
  Plus,
  Info,
  Tag,
  ChevronDown,
} from 'lucide-react'
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_IMPRESSIONS,
  WORD_COMPARISONS,
  type ImpressionCategory,
  type ImpressionGlossaryItem,
} from '@/domain/impression-glossary'

export interface CuratorialGlossaryDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedImpressionIds: string[]
  onToggleImpression: (impressionId: string) => void
}

export function CuratorialGlossaryDrawer({
  isOpen,
  onClose,
  selectedImpressionIds,
  onToggleImpression,
}: CuratorialGlossaryDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<'meanings' | 'comparisons'>(
    'meanings',
  )
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] =
    React.useState<ImpressionCategory>('semua')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  // Handle escape key to close drawer
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

  // Prevent background scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Set of selected IDs for fast O(1) lookup
  const selectedSet = React.useMemo(
    () => new Set(selectedImpressionIds),
    [selectedImpressionIds],
  )

  // Filtered impressions
  const filteredImpressions = React.useMemo(() => {
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

  // Filtered comparisons
  const filteredComparisons = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return WORD_COMPARISONS
    return WORD_COMPARISONS.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.wordA.toLowerCase().includes(q) ||
        c.wordB.toLowerCase().includes(q) ||
        c.descA.toLowerCase().includes(q) ||
        c.descB.toLowerCase().includes(q),
    )
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panduan Makna Impresi"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop (Dark tint, zero heavy blur for 60fps performance) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/50 transition-opacity animate-in fade-in-0 duration-200"
      />

      {/* Drawer Container: Slide from right on desktop, Bottom Sheet on mobile */}
      <div
        className="
          relative
          z-10
          flex
          h-[88vh]
          w-full
          flex-col
          rounded-t-[28px]
          border-t
          border-neutral-200
          bg-white
          shadow-[0_-10px_40px_rgba(0,0,0,0.15)]
          animate-in
          slide-in-from-bottom
          duration-300
          mt-auto
          lg:mt-0
          lg:h-full
          lg:w-[480px]
          lg:rounded-none
          lg:rounded-l-[28px]
          lg:border-l
          lg:border-t-0
          lg:shadow-[0_0_50px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)]
          lg:slide-in-from-right
        "
      >
        {/* Mobile drag handle */}
        <div className="pt-3 pb-1 lg:hidden">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-300" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-900/10 text-red-900">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Panduan Makna Impresi
              </h2>
              <p className="text-xs text-neutral-500">
                Telaah makna & pilih kata langsung untuk lukisan ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            className="
              flex
              size-10
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
            <X size={20} />
          </button>
        </div>

        {/* Tab switchers: 38 Makna vs Beda Kata Mirip */}
        <div className="border-b border-neutral-100 bg-neutral-50/60 px-6 py-2.5">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-200/70 bg-neutral-200/50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('meanings')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'meanings'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BookOpen size={14} />
              <span>38 Makna Kata</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comparisons')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'comparisons'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <GitCompare size={14} />
              <span>Beda Kata Serupa</span>
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="border-b border-neutral-100 px-6 py-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'meanings'
                  ? 'Cari nama atau arti impresi...'
                  : 'Cari kata perbandingan...'
              }
              className="
                w-full
                rounded-xl
                border
                border-neutral-200
                bg-neutral-50/50
                py-2
                pl-9
                pr-8
                text-xs
                text-neutral-900
                outline-none
                placeholder:text-neutral-400
                focus:border-red-900/40
                focus:bg-white
                focus:ring-2
                focus:ring-red-900/10
              "
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category filter pills for meanings tab */}
          {activeTab === 'meanings' && (
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {GLOSSARY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-red-900 text-white shadow-xs'
                      : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          {/* TAB 1: 38 MEANINGS */}
          {activeTab === 'meanings' && (
            <div className="space-y-3">
              {filteredImpressions.map((item) => {
                const isSelected = selectedSet.has(item.id)
                const isExpanded = expandedId === item.id

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-red-900/30 bg-red-900/[0.03] shadow-xs'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-red-900/60 font-mono">
                            #{item.number}
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900">
                            {item.name}
                          </h4>
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">
                          {item.meaning}
                        </p>
                      </div>

                      {/* Pick / Unpick Action Button */}
                      <button
                        type="button"
                        onClick={() => onToggleImpression(item.id)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                          isSelected
                            ? 'border border-red-900/20 bg-red-900/10 text-red-900 hover:bg-red-900/20'
                            : 'border border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-red-900/30 hover:bg-red-50 hover:text-red-900'
                        }`}
                        title={isSelected ? 'Hapus pilihan kata' : 'Pilih kata untuk lukisan ini'}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} className="stroke-[2.5]" />
                            <span>Dipilih</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} className="stroke-[2.5]" />
                            <span>Pilih</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Keywords preview */}
                    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-neutral-100 pt-2.5">
                      <Tag size={11} className="text-neutral-400 mr-1" />
                      {item.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-[11px] text-neutral-500 font-normal"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}

              {filteredImpressions.length === 0 && (
                <div className="py-12 text-center text-xs text-neutral-400">
                  Tidak ada kata impresi yang sesuai dengan &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORD COMPARISONS */}
          {activeTab === 'comparisons' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 text-xs text-blue-900">
                <p className="font-semibold mb-0.5">Panduan Membedakan Rasa</p>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Beberapa kata impresi memiliki kemiripan getaran rasa. Gunakan
                  perbandingan di bawah ini untuk menentukan kata yang paling tepat
                  mewakili karya lukis.
                </p>
              </div>

              {filteredComparisons.map((c, idx) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-xs"
                >
                  <div className="mb-2.5 flex items-center justify-between border-b border-neutral-100 pb-2">
                    <span className="text-xs font-bold text-red-900">
                      {c.title}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-2.5">
                      <p className="text-xs font-bold text-neutral-900">
                        {c.wordA}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-600 leading-relaxed">
                        {c.descA}
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-900/10 bg-red-900/[0.03] p-2.5">
                      <p className="text-xs font-bold text-red-900">
                        {c.wordB}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-600 leading-relaxed">
                        {c.descB}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredComparisons.length === 0 && (
                <div className="py-12 text-center text-xs text-neutral-400">
                  Tidak ada perbandingan kata yang cocok dengan &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Status */}
        <div className="border-t border-neutral-200/80 bg-neutral-50 px-6 py-3 text-xs text-neutral-500">
          <div className="flex items-center justify-between">
            <span>
              Terpilih:{' '}
              <strong className="text-neutral-900">
                {selectedImpressionIds.length} kata
              </strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-red-900 hover:underline"
            >
              Selesai Menelaah
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
