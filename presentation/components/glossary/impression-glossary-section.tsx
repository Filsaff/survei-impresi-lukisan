'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Tag,
  Sparkles,
  X,
  Search,
  Filter,
} from 'lucide-react'
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_IMPRESSIONS,
  GLOSSARY_PRINCIPLES,
  WORD_COMPARISONS,
  type ImpressionCategory,
  type ImpressionGlossaryItem,
} from '@/domain/impression-glossary'
import { ImpressionButton } from '@/components/ui/impression-button'
import { PainterlyCanvasBackground } from './painterly-canvas-background'

export function ImpressionGlossarySection() {
  const [selectedImpressionId, setSelectedImpressionId] =
    React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] =
    React.useState<ImpressionCategory>('semua')
  const [searchQuery, setSearchQuery] = React.useState('')

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
  }, [selectedCategory, searchQuery])

  // Selected impression item
  const selectedImpression = React.useMemo(() => {
    if (!selectedImpressionId) return null
    return (
      GLOSSARY_IMPRESSIONS.find((item) => item.id === selectedImpressionId) ||
      null
    )
  }, [selectedImpressionId])

  // Related comparison pairs for selected impression
  const relatedComparisons = React.useMemo(() => {
    if (!selectedImpression) return []
    const name = selectedImpression.name.toLowerCase()
    return WORD_COMPARISONS.filter(
      (c) =>
        c.wordA.toLowerCase() === name || c.wordB.toLowerCase() === name,
    )
  }, [selectedImpression])

  // Toggle selection
  const handleToggle = (id: string) => {
    setSelectedImpressionId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="panduan-makna" className="relative w-full overflow-hidden bg-[#FAF8F5]">
      {/* 
        Painterly Watercolor Brush Transition (Top)
        Smooth, feathered gradient wash from landing page white (#FFFFFF) into warm gallery ivory (#FAF8F5)
      */}
      <div className="relative z-10 -mt-1 h-36 md:h-48 w-full overflow-hidden pointer-events-none select-none bg-gradient-to-b from-white via-[#FAF8F5]/80 to-[#FAF8F5]">
        {/* Soft painterly organic brush sweep SVG */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-24 md:h-32 opacity-75 text-[#FAF8F5]"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Layer 1: Diffused watercolor under-wash */}
          <path
            d="M0,35 C240,10 480,65 720,30 C960,-5 1200,55 1440,20 L1440,120 L0,120 Z"
            fill="currentColor"
            opacity="0.3"
          />
          {/* Layer 2: Expressive sweeping brush feather */}
          <path
            d="M0,60 C180,40 360,85 640,55 C920,25 1160,75 1440,50 L1440,120 L0,120 Z"
            fill="currentColor"
            opacity="0.65"
          />
          {/* Layer 3: Solid wash base */}
          <path
            d="M0,85 C320,75 680,100 1040,82 C1240,72 1380,90 1440,85 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Dynamic Painterly Canvas Background: Living flowing pigments & brush sweeps behind buttons */}
      <PainterlyCanvasBackground />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 md:pb-20 pt-2">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="h-px w-6 bg-red-900/30" />
            <p className="text-xs font-semibold tracking-[0.25em] text-red-800">
              KHAZANAH MAKNA & PANDUAN
            </p>
            <span className="h-px w-6 bg-red-900/30" />
          </div>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Panduan Makna Impresi Lukisan
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Glosarium impresi untuk penelitian Survei Impresi Lukisan Budaya Indonesia.
            Pilih impresi tertentu untuk membaca makna kuratorial, kata kunci asosiasi visual,
            serta perbedaannya dengan kata yang serupa.
          </p>

          {/* 3 Guidance Principles Cards */}
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            {GLOSSARY_PRINCIPLES.map((principle, index) => (
              <div
                key={principle.id}
                className="group relative rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,0.95)] transition-all duration-300 hover:border-red-900/20 hover:bg-white"
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-full bg-red-900/10 text-xs font-bold text-red-900">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {principle.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-neutral-600">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 
          KEADAAN B — DETAIL PANEL 
          Sesuai panduan tata letak: Saat impresi dipilih, panel detail muncul di ATAS daftar impresi!
          Dengan animasi masuk dan keluar (pop/fade/height expand & collapse) yang buttery smooth.
        */}
        <AnimatePresence initial={false}>
          {selectedImpression && (
            <motion.div
              key="panel-detail-impresi-wrapper"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
                marginBottom: 40,
                transition: {
                  height: {
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  marginBottom: {
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: {
                    duration: 0.28,
                    ease: 'easeOut',
                  },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0,
                transition: {
                  height: {
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  marginBottom: {
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: {
                    duration: 0.2,
                    ease: 'easeIn',
                  },
                },
              }}
              className="overflow-hidden"
            >
              <motion.div
                id="panel-detail-impresi"
                initial={{ y: -16, scale: 0.985 }}
                animate={{
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                exit={{
                  y: -12,
                  scale: 0.985,
                  transition: {
                    duration: 0.28,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-neutral-200
                  bg-white
                  p-6
                  sm:p-8
                  shadow-[0_12px_40px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,1)]
                "
              >
                {/* Top decorative accent */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-800 via-red-600 to-amber-600 opacity-70" />

                {/* Inner content cross-fade between impressions */}
                <motion.div
                  key={selectedImpression.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {/* Header Detail: Kategori di kiri atas, Nomor di kanan atas, Tombol tutup */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                      [ {selectedImpression.categoryLabel} ]
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold tracking-wider text-neutral-400">
                        IMPRESI #{selectedImpression.number}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedImpressionId(null)}
                        aria-label="Tutup detail impresi"
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
                        title="Tutup detail"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Judul Nama Impresi Berukuran Besar Serif */}
                  <h3 className="mt-4 font-serif text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl md:text-5xl">
                    {selectedImpression.name}
                  </h3>

                  {/* 2-Column Content Layout on Desktop (Side-by-side as specified) */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                    {/* Kolom Utama (Kiri): Makna Kuratorial + Kata Kunci */}
                    <div className="space-y-5">
                      {/* Kartu Makna Kuratorial */}
                      <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-5">
                        <p className="text-xs font-bold tracking-wider text-neutral-500 mb-2">
                          MAKNA KURATORIAL:
                        </p>
                        <p className="text-sm leading-relaxed text-neutral-800 sm:text-base">
                          {selectedImpression.meaning}
                        </p>
                      </div>

                      {/* Kata Kunci & Asosiasi Visual */}
                      <div>
                        <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold tracking-wider text-neutral-500">
                          <Tag size={13} className="text-neutral-400" />
                          <span>KATA KUNCI & ASOSIASI VISUAL:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedImpression.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-xs"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Kolom Samping (Kanan pada Desktop, Bawah pada Mobile): Kartu Perbedaan dengan Kata Serupa */}
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 shadow-xs">
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-amber-900">
                        <Sparkles size={15} className="text-amber-700" />
                        <span>Perbedaan dengan Kata Serupa:</span>
                      </div>

                      {relatedComparisons.length > 0 ? (
                        <div className="space-y-4">
                          {relatedComparisons.map((c) => (
                            <div key={c.id} className="text-xs text-neutral-700 space-y-1.5">
                              <h4 className="text-sm font-bold text-neutral-900">
                                {c.title}
                              </h4>
                              <p className="text-xs leading-relaxed text-neutral-800">
                                • <strong className="text-neutral-900">{c.wordA}</strong>: {c.descA}
                              </p>
                              <p className="text-xs leading-relaxed text-neutral-800">
                                • <strong className="text-neutral-900">{c.wordB}</strong>: {c.descB}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-700">
                          <h4 className="text-sm font-bold text-neutral-900 mb-1">
                            Karakter Makna Khas
                          </h4>
                          <p className="text-xs leading-relaxed text-neutral-700">
                            Kata <strong className="text-neutral-900">{selectedImpression.name}</strong> memiliki
                            karakteristik rasa yang khas dan tidak memiliki padanan ambigu langsung
                            pada daftar 13 pasang komparasi kuratorial.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
          BAGIAN UTAMA: "Impresi pada penelitian ini"
          Sesuai panduan tata letak:
          - Judul harus persis "Impresi pada penelitian ini"
          - Menampilkan seluruh 38 tombol glass button sebagai bubble alami tanpa pembungkus kartu putih
          - Berada di bawah panel detail saat panel detail aktif
        */}
        <div className="mt-8">
          {/* Header Bagian */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-300/60 pb-5">
            <div>
              <h3 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 sm:text-3xl">
                Impresi pada penelitian ini
              </h3>
              <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                Ketuk tombol untuk membuka atau menutup penjelasan makna kuratorial
              </p>
            </div>

            {/* Live Search Filter */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari impresi..."
                className="w-full rounded-2xl border border-neutral-300/80 bg-white/90 py-2.5 pl-9 pr-8 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:border-red-900/40 focus:bg-white focus:ring-2 focus:ring-red-900/10"
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
          </div>

          {/* Category Filter Pills */}
          <div className="mb-6 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
              <Filter size={12} />
              <span>Kategori:</span>
            </span>
            {GLOSSARY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-red-900 text-white shadow-sm'
                    : 'border border-neutral-300/70 bg-white/80 text-neutral-700 hover:border-neutral-400 hover:bg-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 
            Daftar Seluruh Impresi sebagai Glass Bubbles
            Mengalir langsung di atas kanvas #FAF8F5 tanpa pembungkus kartu putih
          */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {filteredImpressions.map((imp) => {
              const isSelected = selectedImpressionId === imp.id
              return (
                <ImpressionButton
                  key={imp.id}
                  id={imp.id}
                  name={imp.name}
                  isSelected={isSelected}
                  onToggle={handleToggle}
                />
              )
            })}
          </div>

          {filteredImpressions.length === 0 && (
            <p className="py-12 text-center text-sm text-neutral-400">
              Tidak ada kata impresi yang cocok dengan &quot;{searchQuery}&quot;.
            </p>
          )}
        </div>
      </div>

      {/* 
        Painterly Watercolor Brush Transition (Bottom)
        Smooth, feathered gradient wash from warm gallery ivory (#FAF8F5) into clean white (#FFFFFF)
      */}
      <div className="relative z-10 -mb-1 h-36 md:h-48 w-full overflow-hidden pointer-events-none select-none bg-gradient-to-b from-transparent via-white/80 to-white">
        {/* Soft painterly organic brush sweep SVG transitioning into pure white */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-24 md:h-32 text-white"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Layer 1: Diffused watercolor under-wash */}
          <path
            d="M0,30 C240,55 480,10 720,45 C960,80 1200,20 1440,55 L1440,120 L0,120 Z"
            fill="currentColor"
            opacity="0.35"
          />
          {/* Layer 2: Expressive sweeping brush feather */}
          <path
            d="M0,58 C180,78 360,38 640,68 C920,95 1160,48 1440,72 L1440,120 L0,120 Z"
            fill="currentColor"
            opacity="0.75"
          />
          {/* Layer 3: Solid wash base to guarantee pure white boundary */}
          <path
            d="M0,85 C320,75 680,98 1040,82 C1240,72 1380,88 1440,84 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  )
}
