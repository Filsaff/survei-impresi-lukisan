'use client'

import { PageShell } from '@/presentation/layout/site-layout'

import BlurText from '@/components/react-bits/blur-text'
import ShinyText from '@/components/react-bits/shiny-text'

export function ThankYouPage() {
  return (
    <PageShell active="survey">
      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-6 py-20">

        {/* Background ornament */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-1/2 top-1/2
            h-[420px] w-[420px]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-[var(--accent)]
            opacity-[0.035]
            blur-3xl
          "
        />

        {/* Decorative lines */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-0 top-1/2
            h-px w-[18vw]
            bg-gradient-to-r
            from-transparent
            to-[var(--accent)]
            opacity-20
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute right-0 top-1/2
            h-px w-[18vw]
            bg-gradient-to-l
            from-transparent
            to-[var(--accent)]
            opacity-20
          "
        />

        <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">

          {/* Geometric mark */}
          <div
            className="
              mb-9
              flex h-16 w-16
              rotate-45
              items-center justify-center
              border border-[var(--foreground)]/15
              animate-[spin_12s_linear_infinite]
            "
          >
            <span
              className="
                -rotate-45
                text-2xl font-light
                text-[var(--accent)]
              "
            >
              △
            </span>
          </div>

          {/* Kicker */}
          <ShinyText
            text="SESI SELESAI"
            speed={3}
            className="
              mb-5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.3em]
              !text-[var(--accent)]
            "
          />

          {/* Main title */}
          <BlurText
            text="Terima Kasih."
            delay={100}
            animateBy="words"
            direction="top"
            className="
              justify-center
              text-center
              text-5xl
              font-medium
              tracking-[-0.055em]
              text-[var(--foreground)]
              sm:text-7xl
              md:text-8xl
            "
          />

          {/* Description */}
          <p
            className="
              mt-8
              max-w-lg
              text-sm
              leading-7
              text-[var(--foreground)]/60
              sm:text-[15px]
            "
          >
            Kontribusi Anda sangat berharga bagi penelitian
            seni dan budaya Indonesia. Seluruh jawaban Anda
            telah berhasil kami rekam.
          </p>

          {/* Divider */}
          <div className="my-10 flex w-32 items-center justify-center">
            <div className="h-px w-full bg-[var(--foreground)]/10" />

            <div
              className="
                absolute
                h-px w-10
                bg-[var(--accent)]
                shadow-[0_0_12px_var(--accent)]
              "
            />
          </div>

          {/* Status */}
          <div
            className="
              flex
              items-center
              gap-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[var(--foreground)]/40
            "
          >
            <span
              className="
                relative
                flex h-2 w-2
              "
            >
              <span
                className="
                  absolute
                  inline-flex
                  h-full w-full
                  animate-ping
                  rounded-full
                  bg-[var(--accent)]
                  opacity-50
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2 w-2
                  rounded-full
                  bg-[var(--accent)]
                "
              />
            </span>

            <span>SESI BERAKHIR</span>
          </div>

        </section>
      </main>
    </PageShell>
  )
}
