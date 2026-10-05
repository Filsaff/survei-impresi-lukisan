'use client'

import { ArrowRight } from 'lucide-react'

import {
  isRespondentValid,
  type Respondent,
} from '@/domain/survey'

import { PageShell } from '@/presentation/layout/site-layout'

import { Button } from '@/components/ui/button'
import BrushStrokes from '@/components/decorations/brush-strokes'

export function RespondentPage({
  value,
  onChange,
  onStart,
}: {
  value: Respondent
  onChange: (value: Respondent) => void
  onStart: () => void
}) {
  const update = <K extends keyof Respondent>(
    key: K,
    next: Respondent[K],
  ) => {
    onChange({
      ...value,
      [key]: next,
    })
  }

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
            bg-neutral-100/70
            blur-3xl
          "
        />
        <BrushStrokes/>

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
          <form
            className="
            group
            relative
            overflow-hidden
        
            rounded-[2rem]
            border border-gray-200/80
        
            bg-neutral-100/[0.1]
            p-8
        
          
        
            shadow-[0_20px_60px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1.5)]
        
            transition-all
            duration-500
            ease-out
        
            hover:-translate-y-1
            hover:scale-[1.01]
        
            hover:shadow-[0_28px_70px_rgba(0,0,0,0.09),inset_0_1px_3px_rgba(255,255,255,1)]
        
            md:p-10
          "
            onSubmit={(event) => {
              event.preventDefault()

              if (isRespondentValid(value)) {
                onStart()
              }
            }}
          >

            {/* Glass reflection */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-8
                top-0
                h-px
                bg-white
                blur-[0.5px]
              "
            />

            {/* Form header */}
            <div className="relative z-10 mb-8">
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-400">
                DATA RESPONDEN
              </p>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Lengkapi informasi berikut untuk melanjutkan.
              </p>
            </div>

            <div className="relative z-10 space-y-6">

              {/* Nama */}
              <label className="block"
              >
                <span className="text-xs font-semibold tracking-widest text-neutral-500">
                  NAMA LENGKAP
                </span>

                <input
                  required
                  placeholder="Masukkan nama Anda"
                  value={value.name}
                  onChange={(e) =>
                    update('name', e.target.value)
                  }
                  className="
                    mt-2
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-white/70
                    bg-white/40
                    px-4
                    text-sm
                    text-neutral-900
                    outline-none
                    backdrop-blur-md
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
                    transition-colors
                    placeholder:text-neutral-400
                    focus:border-white
                    focus:bg-white/65
                    focus:ring-2
                    focus:ring-red-900/10
                  "
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="text-xs font-semibold tracking-widest text-neutral-500">
                  ALAMAT EMAIL
                </span>

                <input
                  required
                  type="email"
                  placeholder="nama@email.com"
                  value={value.email}
                  onChange={(e) =>
                    update('email', e.target.value)
                  }
                  className="
                    mt-2
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-white/70
                    bg-white/40
                    px-4
                    text-sm
                    text-neutral-900
                    outline-none
                    backdrop-blur-md
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
                    transition-colors
                    placeholder:text-neutral-400
                    focus:border-white
                    focus:bg-white/65
                    focus:ring-2
                    focus:ring-red-900/10
                  "
                />
              </label>

              {/* Gender + Age */}
              <div className="grid gap-6 md:grid-cols-2">

                <fieldset>
                  <legend className="text-xs font-semibold tracking-widest text-neutral-500">
                    JENIS KELAMIN
                  </legend>

                  <div className="mt-3 flex gap-5">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                      <input
                        required
                        type="radio"
                        name="gender"
                        checked={value.gender === 'Laki-laki'}
                        onChange={() =>
                          update('gender', 'Laki-laki')
                        }
                        className="accent-red-800 size-5 border-neutral-200/80"
                      />

                      Laki-laki
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                      <input
                        type="radio"
                        name="gender"
                        checked={value.gender === 'Perempuan'}
                        onChange={() =>
                          update('gender', 'Perempuan')
                        }
                        className="accent-red-800 size-5 border-neutral-200/80"
                      />

                      Perempuan
                    </label>
                  </div>
                </fieldset>

                <label className="block">
                  <span className="text-xs font-semibold tracking-widest text-neutral-500">
                    UMUR
                  </span>

                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Contoh: 25"
                    value={value.age ?? ''}
                    onChange={(e) =>
                      update(
                        'age',
                        e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      )
                    }
                    className="
                      mt-2
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-white/70
                      bg-white/40
                      px-4
                      text-sm
                      text-neutral-900
                      outline-none
                      backdrop-blur-md
                      shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
                      transition-colors
                      placeholder:text-neutral-400
                      focus:border-white
                      focus:bg-white/65
                      focus:ring-2
                      focus:ring-red-900/10
                    "
                  />
                </label>

              </div>

              {/* Education */}
              <label className="block">
                <span className="text-xs font-semibold tracking-widest text-neutral-500">
                  PENDIDIKAN TERAKHIR
                </span>

                <select
                  required
                  value={value.education ?? ''}
                  onChange={(e) =>
                    update(
                      'education',
                      e.target.value as Respondent['education'],
                    )
                  }
                  className="
                    mt-2
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-white/70
                    bg-white/40
                    px-4
                    text-sm
                    text-neutral-900
                    outline-none
                    backdrop-blur-md
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
                    transition-colors
                    focus:border-white
                    focus:bg-white/65
                    focus:ring-2
                    focus:ring-red-900/10
                  "
                >
                  <option value="">
                    Pilih tingkat pendidikan
                  </option>

                  <option>SMA / sederajat</option>
                  <option>D3</option>
                  <option>S1</option>
                  <option>S2 / S3</option>
                </select>
              </label>

              {/* CTA */}
              <Button
                type="submit"
                variant="glassRed2"
                disabled={!isRespondentValid(value)}
                className="mt-2 w-full"
              >
                Mulai Survei

                <ArrowRight
                  size={20}
                  className="
                    transition-transform
                    duration-300
                    group-hover/button:translate-x-1
                  "
                />
              </Button>

            </div>
          </form>
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
            text-sm
            leading-6
            text-neutral-400
          "
        >
          Data Anda hanya digunakan untuk kepentingan penelitian
          dan tidak dibagikan kepada pihak lain.
        </div>

      </main>
    </PageShell>
  )
}