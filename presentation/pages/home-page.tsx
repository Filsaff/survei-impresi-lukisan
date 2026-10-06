"use client";

import {
  ArrowRight,
  Clock3,
  Layers3,
  LockKeyhole,
} from "lucide-react";

import { PageShell } from "@/presentation/layout/site-layout";
import { useSurveyNavigation } from "@/presentation/navigation/use-survey-navigation";

import SplitText from "@/components/react-bits/split-text";
import AnimatedContent from "@/components/react-bits/animated-content";

import { Button } from "@/components/ui/button";
import { BrushStrokes } from "@/components/decorations/brush-strokes";

export function HomePage() {
  const { goToSurvey } = useSurveyNavigation();

  return (
    <PageShell active="home">
      <main className="relative min-h-screen overflow-hidden bg-white">
        <BrushStrokes animated />

        <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-24 pt-32 text-center">

          {/* Eyebrow */}
          <AnimatedContent
            distance={30}
            direction="vertical"
            reverse={false}
            duration={0.7}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={1}
            threshold={0.1}
          >
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-8 bg-red-900/30" />

              <p className="text-xs font-semibold tracking-[0.25em] text-red-800">
                STUDI PENELITIAN BUDAYA
              </p>

              <span className="h-px w-8 bg-red-900/30" />
            </div>
          </AnimatedContent>

          {/* Title */}
          <h1 className="max-w-5xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-neutral-900 md:text-7xl">
            <SplitText
              text="Survei Impresi Lukisan Budaya Indonesia"
              className="inline"
              delay={100}
              duration={0.7}
              ease="power3.out"
              splitType="words"
              highlightWords={["Indonesia"]}
              from={{
                opacity: 0,
                y: 50,
              }}
              to={{
                opacity: 1,
                y: 0,
              }}
            />
          </h1>

          {/* Description */}
          <AnimatedContent
            distance={35}
            direction="vertical"
            reverse={false}
            duration={0.8}
            delay={0.45}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={0.98}
            threshold={0.1}
          >
            <p className="mt-8 max-w-3xl text-base leading-8 text-neutral-500 md:text-lg">
              Kami mengundang Anda untuk berpartisipasi dalam penelitian
              akademis ini. Anda akan diminta untuk mengevaluasi dan memberikan
              impresi terhadap 20 karya lukis yang merepresentasikan kekayaan
              budaya Indonesia.
            </p>
          </AnimatedContent>

          {/* Information Cards */}
          <div className="relative mt-12 grid w-full max-w-3xl gap-4 md:grid-cols-2">

            {/* Ambient glow */}
            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                -z-10
                h-48
                w-[80%]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(153,27,27,0.06)_0%,transparent_70%)]
              "
            />

            {/* Time Card */}
            <AnimatedContent
              distance={45}
              direction="horizontal"
              reverse={true}
              duration={0.75}
              delay={0.7}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={0.96}
              threshold={0.1}
            >
              <div
                className="
                  group
                  relative
                  flex
                  items-center
                  gap-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/60
                  bg-white/70
                  p-6
                  text-left
                  shadow-[0_12px_40px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)]
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:bg-white/85
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_3px_rgba(255,255,255,1)]
                  active:scale-[0.98]
                "
              >
                {/* Liquid surface */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-white/50
                    via-white/[0.08]
                    to-red-100/[0.08]
                    opacity-80
                  "
                />

                {/* Reflection */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-[10%]
                    right-[10%]
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-white/90
                    to-transparent
                  "
                />

                {/* Icon */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    size-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/80
                    bg-white/70
                    text-red-800
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]
                    transition-all
                    duration-500
                    group-hover:scale-105
                    group-hover:bg-white/90
                  "
                >
                  <Clock3 size={24} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold tracking-widest text-neutral-500">
                    ESTIMASI WAKTU
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-900">
                    ± 10 Menit
                  </p>
                </div>
              </div>
            </AnimatedContent>

            {/* Task Card */}
            <AnimatedContent
              distance={45}
              direction="horizontal"
              reverse={false}
              duration={0.75}
              delay={0.82}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={0.96}
              threshold={0.1}
            >
              <div
                className="
                  group
                  relative
                  flex
                  items-center
                  gap-5
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/60
                  bg-white/70
                  p-6
                  text-left
                  shadow-[0_12px_40px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)]
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:bg-white/85
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_3px_rgba(255,255,255,1)]
                  active:scale-[0.98]
                "
              >
                {/* Liquid surface */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-br
                    from-white/50
                    via-white/[0.08]
                    to-red-100/[0.08]
                    opacity-80
                  "
                />

                {/* Reflection */}
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-[10%]
                    right-[10%]
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-white/90
                    to-transparent
                  "
                />

                {/* Icon */}
                <div
                  className="
                    relative
                    z-10
                    flex
                    size-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/80
                    bg-white/70
                    text-red-800
                    shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]
                    transition-all
                    duration-500
                    group-hover:scale-105
                    group-hover:bg-white/90
                  "
                >
                  <Layers3 size={24} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <p className="text-xs font-semibold tracking-widest text-neutral-500">
                    TUGAS UTAMA
                  </p>

                  <p className="mt-1 text-lg font-semibold text-neutral-900">
                    Evaluasi 20 Lukisan
                  </p>
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* CTA */}
          <AnimatedContent
            distance={30}
            direction="vertical"
            reverse={false}
            duration={0.7}
            delay={1.05}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={0.96}
            threshold={0.1}
          >
            <Button
              type="button"
              variant="glassRed2"
              size="lg"
              className="group mt-10 px-9 text-base"
              onClick={goToSurvey}
            >
              Mulai Survei

              <ArrowRight
                size={20}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </Button>
          </AnimatedContent>

          {/* Consent */}
          <AnimatedContent
            distance={20}
            direction="vertical"
            reverse={false}
            duration={0.7}
            delay={1.25}
            ease="power3.out"
            initialOpacity={0}
            animateOpacity
            scale={1}
            threshold={0.1}
          >
            <div className="mt-7 flex items-start justify-center gap-3 text-sm leading-6 text-neutral-400">
              <LockKeyhole size={16} className="mt-1 shrink-0" />

              <p>
                Dengan menekan tombol di atas, Anda menyetujui persyaratan
                penelitian. Partisipasi Anda bersifat anonim.
              </p>
            </div>
          </AnimatedContent>

        </section>
      </main>
    </PageShell>
  );
}