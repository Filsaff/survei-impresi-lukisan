'use client'

import * as React from 'react'

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  X,
} from 'lucide-react'

import type {
  SurveyPainting,
} from '@/domain/survey'

import { useRouter } from 'next/navigation'
import { surveyRepository } from '@/data/survey-repository'

import { PageShell } from '@/presentation/layout/site-layout'

import { Button } from '@/components/ui/button'
import BrushStrokes from '@/components/decorations/brush-strokes'

export const SurveyPage = React.memo(function SurveyPage({
  current,
  total,
  painting,
  selected,
  onToggle,
  onBack,
  onFinish,
}: {
  current: number
  total: number
  painting: SurveyPainting
  selected: string[]
  onToggle: (impressionId: string) => void
  onBack: () => void
  onFinish: () => void
}) {
  const [query, setQuery] = React.useState('')

  const allImpressions = React.useMemo(
    () => surveyRepository.getImpressions(),
    [],
  )

  const [showTip, setShowTip] = React.useState(false)

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

  const progress =
    (current / total) * 100

  return (
    <PageShell
      active="survey"
      footer={false}
    >
      <main className="relative min-h-screen top-20 overflow-hidden bg-white">

        {/* Ambient background */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[45%]
            -z-0
            h-[600px]
            w-[900px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-red-900/[0.035]
            blur-[120px]
          "
        />
        <BrushStrokes/>

        {/* Progress */}
        <div
          className="
            sticky
            z-40
            border-b
            border-neutral-200/60
            bg-white/70
            backdrop-blur-xl
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

        {/* Main content */}
        <section
          className="
            relative
            z-10
            mx-auto
            grid
            max-w-7xl
            items-start
            gap-10
            px-6
            py-10
            pb-32

            lg:grid-cols-[1fr_1fr]
            lg:gap-16
          "
        >

          {/* Painting */}
          <section className="flex flex-col items-center">

          <div
              className="
                group
                relative
                w-full
                max-w-xl
                overflow-hidden

                rounded-[2rem]
                border
                border-neutral-200/70

                bg-neutral-300/[0.55]

                p-3

                backdrop-blur-xs

                shadow-[0_20px_60px_rgba(0,0,0,0.07),inset_0_1px_2px_rgba(255,255,255,0.9)]

                transition-all
                duration-500
                ease-out

                hover:-translate-y-1
                hover:shadow-[0_28px_70px_rgba(0,0,0,0.10),inset_0_1px_3px_rgba(255,255,255,1)]
              "
            >
              {/* Glass reflective shine */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-[-100%]
                  rotate-12
                  bg-gradient-to-r
                  from-transparent
                  via-white/20
                  to-transparent
                  translate-x-[-100%]
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:translate-x-[100%]
                "
              />

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
                    transition-transform
                    duration-300
                    group-hover:scale-[1.015]
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

          <section
            className="
              group
              relative
              overflow-hidden

              rounded-[2rem]
      
              border-white/80

              bg-neutral-300/[0.55]

              p-7
              md:p-9

              backdrop-blur-xs

              shadow-[0_20px_60px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)]

              transition-all
              duration-500
              ease-out

              hover:-translate-y-1
              hover:shadow-[0_28px_70px_rgba(0,0,0,0.08),inset_0_1px_3px_rgba(255,255,255,1)]
            "
          >
           {/* Glass shine */}
           <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-[-100%]
                rotate-12
                bg-gradient-to-r
                from-transparent
                via-white/20
                to-transparent
                translate-x-[-100%]
                transition-transform
                duration-700
                ease-out
                group-hover:translate-x-[100%]
              "
            />

            <div className="relative z-10">

              {/* Header */}
              <div className="flex items-center justify-between">
              {/* Label */}
              <p
                className="
                  text-xs
                  font-semibold
                  tracking-[0.2em]
                  text-red-800
                "
              >
                KATA IMPRESI
              </p>

              {/* Mobile / Tablet tip */}
              <div className="relative lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowTip((prev) => !prev)}
                  aria-label="Tips memilih impresi"
                  aria-expanded={showTip}
                  className="
                    group/tip
                    flex
                    size-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-neutral-300/70
                    bg-white/[0.45]
                    text-[11px]
                    font-bold
                    text-neutral-500
                    shadow-[0_3px_10px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.9)]
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:border-neutral-400
                    hover:bg-white/[0.7]
                    hover:text-neutral-800
                    active:scale-90
                  "
                >
                  ?
                </button>

                {/* Floating tip */}
                {showTip && (
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
                      bg-neutral-950/[0.90]
                      p-4
                      text-left
                      shadow-[0_18px_45px_rgba(0,0,0,0.18),inset_0_1px_2px_rgba(255,255,255,0.15)]
                      backdrop-blur-xl
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
                      Pilih semua kata sifat yang menurut Anda
                      paling mewakili nuansa dan emosi dari
                      karya seni di samping.
                    </p>
                  </div>
                )}
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
                  text-neutral-
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
                Pilih semua kata sifat yang menurut Anda
                paling mewakili nuansa dan emosi dari karya
                seni di samping.
              </p>
              

              {/* Selected */}
              {selected.length > 0 && (
                <div className="mt-7">

                  <p
                    className="
                      mb-3
                      text-[10px]
                      font-semibold
                      tracking-[0.2em]
                      text-neutral-400
                    "
                  >
                    PILIHAN ANDA
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {selected.map((impressionId) => {
                      const impression =
                        allImpressions.find(
                          (item) =>
                            item.id === impressionId,
                        )

                      if (!impression) {
                        return null
                      }

                      return (
                        <button
                          key={impression.id}
                          type="button"
                          onClick={() =>
                            onToggle(impression.id)
                          }
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

                            transition-all
                            duration-200

                            hover:bg-red-900/[0.13]
                            active:scale-95
                          "
                        >
                          {impression.name}

                          <X
                            size={13}
                            className="
                              opacity-50
                              transition-opacity
                              group-hover/chip:opacity-100
                            "
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

                  bg-white/[0.55]

                  px-4

                  backdrop-blur-md

                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]

                  transition-all

                  focus-within:border-neutral-300
                  focus-within:bg-white/[0.70]
                "
              >

                <Search
                  size={18}
                  className="shrink-0 text-neutral-400"
                />

                <input
                  aria-label="Cari impresi"
                  placeholder="Cari Impresi..."
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
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

              {/* Words */}
              <div className="mt-5 flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1 pt-2">

                {impressions.map((impression) => {
                  const isSelected =
                    selected.includes(impression.id)

                  return (
                    <button
                      key={impression.id}
                      type="button"
                      onClick={() =>
                        onToggle(impression.id)
                      }
                      className={`
                      rounded-full
                      border
                      px-3.5
                      py-2
                      text-sm
                      font-medium
                      transition-all
                      duration-200

                        ${
                          isSelected
                          ? `
                          border-red-900/30
                          bg-red-900
                          text-white
                          shadow-[0_5px_15px_rgba(127,29,29,0.15)]
                        `
                        : `
                          border-white/80
                          bg-white/[0.42]
                          text-neutral-600
                          backdrop-blur-sm
                          hover:-translate-y-0.5
                          hover:bg-white/[0.70]
                          hover:text-neutral-900
                        `
                    }

                    active:scale-95
                  `}
                    >
                      {impression.name}
                    </button>
                  )
                })}

              </div>

              {impressions.length === 0 && (
                <p
                  className="
                    py-8
                    text-center
                    text-sm
                    text-neutral-400
                  "
                >
                  Tidak ada kata yang cocok.
                </p>
              )}

            </div>
          </section>

        </section>

        {/* Bottom actions */}
        <div
          className="
            fixed
            inset-x-0
            bottom-0
            z-30

            border-t
            border-neutral-200/60

            bg-white/70

            px-6
            py-4

            backdrop-blur-xl
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
              disabled={!selected.length}
              onClick={onFinish}
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

      </main>
    </PageShell>
  )
})

export function ConfirmationDialog({
  onBack,
  onSubmit,
  submitting = false,
  error = null,
}: {
  onBack: () => void
  onSubmit: () => void
  submitting?: boolean
  error?: string | null
}) {
  return (
    
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-neutral-950/20
        px-6

        backdrop-blur-md
      "
      role="presentation"
    >
      <div
        className="
          relative
          w-full
          max-w-lg
          overflow-hidden

          rounded-[2rem]
          border
          border-white/80

          bg-white/[0.78]

          p-8

          backdrop-blur-2xl

          shadow-[0_30px_100px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.95)]
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >

        {/* Reflection */}
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-10
            top-0
            h-px
            bg-white
            blur-[1px]
          "
        />

        {/* Icon */}
        <div
          className="
            flex
            size-12
            items-center
            justify-center

            rounded-full

            border
            border-red-900/15

            bg-red-900/[0.08]

            text-red-800
          "
        >
          <Check size={22} />
        </div>

        <h2
          id="confirm-title"
          className="
            mt-6
            font-serif
            text-2xl
            font-medium
            leading-tight
            text-neutral-900
          "
        >
          Sudah selesai menilai seluruh lukisan?
        </h2>

        <p
          className="
            mt-4
            text-sm
            leading-7
            text-neutral-500
          "
        >
          Anda telah memberikan impresi untuk seluruh
          20 lukisan.
          {' '}
          <b className="font-semibold text-neutral-700">
            Jawaban Anda akan dikirim ke arsip riset
            dan tidak dapat diubah setelah disubmit.
          </b>
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 lg:justify-center">

          <Button
            type="button"
            variant="glass"
            disabled={submitting}
            onClick={onBack}
            className="md:min-w-55 min-w-28"
          >
            KEMBALI
          </Button>

          <Button
            type="button"
            variant="glassRed2"
            disabled={submitting}
            onClick={onSubmit}
            className="md:min-w-55 min-w-28"
          >
            {submitting ? 'MENGIRIM...' : 'SUBMIT'}
            {!submitting && <ArrowRight size={17} />}
          </Button>

        </div>

      </div>
    </div>
  )
}
