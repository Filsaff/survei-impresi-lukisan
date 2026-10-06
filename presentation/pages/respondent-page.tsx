'use client'

import * as React from 'react'
import type { Respondent } from '@/domain/survey'
import { PageShell } from '@/presentation/layout/site-layout'
import BrushStrokes from '@/components/decorations/brush-strokes'
import { RespondentForm } from '@/presentation/components/respondent'

export interface RespondentPageProps {
  value: Respondent
  onChange: (value: Respondent) => void
  onStart: () => void
}

export function RespondentPage({
  value,
  onChange,
  onStart,
}: RespondentPageProps) {
  return (
    <PageShell active="survey">
      <main className="relative min-h-screen overflow-hidden bg-white">
        {/* Ambient background */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            -z-0
            h-[500px]
            w-[700px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(ellipse_at_center,rgba(245,245,245,0.8)_0%,transparent_70%)]
          "
        />
        <BrushStrokes animated />

        <section
          className="
            relative z-10
            mx-auto
            grid
            min-h-screen
            max-w-6xl
            items-center
            gap-12
            px-6
            py-28
            md:grid-cols-[0.8fr_1.2fr]
            md:gap-20
          "
        >
          {/* Intro */}
          <div className="max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-red-900/30" />
              <p className="text-xs font-semibold tracking-[0.25em] text-red-800">
                SEBELUM MEMULAI
              </p>
            </div>

            <h1
              className="
                font-serif
                text-5xl
                font-medium
                leading-[1.05]
                tracking-tight
                text-neutral-900
                md:text-6xl
              "
            >
              Informasi
              <br />
              Responden
            </h1>

            <p
              className="
                mt-7
                max-w-md
                text-base
                leading-8
                text-neutral-500
              "
            >
              Silakan lengkapi data diri Anda sebelum memulai
              survei. Informasi ini dijaga kerahasiaannya dan
              hanya digunakan untuk keperluan analisis riset.
            </p>

            <div className="mt-8 h-px w-16 bg-red-900/20" />
          </div>

          {/* Form */}
          <RespondentForm
            value={value}
            onChange={onChange}
            onSubmit={onStart}
          />
        </section>

        {/* Note */}
        <div
          className="
            relative z-10
            mx-auto
            max-w-3xl
            px-6
            pb-10
            text-center
          "
        >
          <p className="text-xs leading-6 text-neutral-400">
            Data Anda hanya digunakan untuk kepentingan penelitian akademis.
            Partisipasi bersifat sukarela dan Anda dapat berhenti kapan saja.
          </p>
        </div>
      </main>
    </PageShell>
  )
}