'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useSurveyNavigation } from '../navigation/use-survey-navigation'
import { Button } from '@/components/ui/button'

export function SiteHeader({
  active = 'home',
}: {
  active?: 'home' | 'survey'
}) {
  const { goToSurvey } = useSurveyNavigation()

  const [visible, setVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY

          if (currentScrollY <= 20) {
            setAtTop(true)
            setVisible(true)
          } else {
            setAtTop(false)
            if (currentScrollY > lastScrollY) {
              setVisible(false)
            } else if (currentScrollY < lastScrollY) {
              setVisible(true)
            }
          }

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={`
        fixed inset-x-0 top-4 z-50
        transition-transform duration-300 ease-out
        ${
          visible
            ? 'translate-y-0'
            : '-translate-y-[150%]'
        }
      `}
    >
      <div
        className={`
          mx-auto flex h-16 max-w-7xl
          items-center justify-between
          gap-6
          rounded-full
          px-3 pl-5
          transition-colors duration-200

          ${
            atTop
              ? `
                border border-neutral-200/80
                bg-white
                shadow-[0_8px_30px_rgba(0,0,0,0.06)]
              `
              : `
                border border-neutral-200/60
                bg-white/95
                shadow-[0_10px_40px_rgba(0,0,0,0.04)]
              `
          }
        `}
      >

        {/* Brand */}
        <Link
          href="/"
          aria-label="Kembali ke Beranda"
          className="group flex items-center gap-3"
        >
          {/* Logo */}
          <div
            className="
              relative flex size-10 shrink-0
              items-center justify-center
              overflow-hidden
              rounded-full
              border border-neutral-200/80
              bg-white
              shadow-sm
              transition-all duration-300
              group-hover:rotate-[-3deg]
              group-hover:scale-105
            "
          >
            <Image
              src="/logo.png"
              alt="Logo Abstract S"
              width={40}
              height={40}
              className="size-full object-cover"
              priority
            />
          </div>

          {/* Brand Text */}
          <div className="hidden sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-800">
              STUDI PENELITIAN
            </p>

            <p className="mt-0.5 text-sm font-medium tracking-tight text-neutral-800">
              Survei Impresi Lukisan Budaya Indonesia
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          aria-label="Navigasi utama"
          className="
            flex items-center gap-1
            rounded-full
            border border-neutral-200/60
            bg-white/80
            p-1
          "
        >

          {/* Beranda */}
          <Link
            href="/"
            className={`
              relative overflow-hidden
              rounded-full
              border border-transparent
              px-5 py-2
              text-sm font-medium
              transition-all duration-300

              ${
                active === 'home'
                  ? `
                    border-white/30
                    bg-white/25
                    text-neutral-950
                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]
                  `
                  : `
                    text-neutral-500
                    hover:bg-white/20
                    hover:text-neutral-900
                  `
              }

              active:scale-[0.96]
            `}
          >
            Beranda
          </Link>

          {/* Survei */}
          <Button
  type="button"
  variant="glassRed"
  onClick={goToSurvey}
>
  Survei
  <ArrowUpRight
    size={15}
    className="
      transition-transform duration-300
      group-hover/button:translate-x-0.5
      group-hover/button:-translate-y-0.5
    "
  />
</Button>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-white px-6 pb-8 pt-8">

      {/* Ambient glow */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          left-1/2
          h-64
          w-150
          -translate-x-1/2
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(153,27,27,0.04)_0%,transparent_70%)]
        "
      />

      {/* Glass container */}
      <div
        className="
          relative mx-auto max-w-7xl
          overflow-hidden
          rounded-[2rem]
          border border-neutral-200/60
          bg-neutral-50/80
          p-8
          shadow-[0_15px_50px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.9)]
          md:p-10
        "
      >

        {/* Glass reflection */}
        <span
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-br
            from-white/40
            via-transparent
            to-red-50/20
          "
        />

        <div className="relative z-10">

          {/* Top section */}
          <div className="flex flex-col justify-between gap-10 md:flex-row">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">

                <div
                  className="
                    relative flex size-10 shrink-0
                    items-center justify-center
                    overflow-hidden
                    rounded-full
                    border border-neutral-200/80
                    bg-white
                    shadow-sm
                  "
                >
                  <Image
                    src="/logo.png"
                    alt="Logo Abstract S"
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-800">
                    STUDI PENELITIAN
                  </p>

                  <h3 className="mt-1 font-serif text-xl text-neutral-900">
                    Survei Impresi Lukisan Budaya Indonesia
                  </h3>
                </div>

              </div>

              <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-500">
                Penelitian mengenai impresi masyarakat terhadap lukisan bertema
                budaya Indonesia.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">

              <div className="flex flex-col gap-3">
                <b className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-400">
                  TAUTAN
                </b>

                <Link
                  href="/"
                  className="text-sm text-neutral-600 transition-colors hover:text-red-800"
                >
                  Beranda
                </Link>

                <Link
                  href="/survey"
                  className="text-sm text-neutral-600 transition-colors hover:text-red-800"
                >
                  Survei
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <b className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-neutral-400">
                  KONTAK
                </b>

                <a
                  href="https://instagram.com/filsafaelang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 transition-colors hover:text-red-800"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
          {/* Divider */}
          <div className="my-8 h-px bg-neutral-200/60" />
          {/* Bottom */}
          <div className="flex flex-col justify-between gap-3 text-xs text-neutral-400 md:flex-row">
            <p>
              © 2026 Penelitian Akademis.
            </p>

            <p>
              Partisipasi Anda bersifat anonim.
            </p>

          </div>

        </div>
      </div>
    </footer>
  )
}

export function PageShell({
  children,
  active,
  footer = true,
}: {
  children: ReactNode
  active?: 'home' | 'survey'
  footer?: boolean
}) {
  return (
    <>
      <SiteHeader active={active} />
      {children}
      {footer && <SiteFooter />}
    </>
  )
}