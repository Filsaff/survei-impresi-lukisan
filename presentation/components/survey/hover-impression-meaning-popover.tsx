'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Tag, GitCompare } from 'lucide-react'
import {
  GLOSSARY_IMPRESSIONS,
  WORD_COMPARISONS,
  type ImpressionGlossaryItem,
} from '@/domain/impression-glossary'

export interface HoverImpressionMeaningPopoverProps {
  targetRect: DOMRect | null
  impressionName: string | null
  isOpen: boolean
  onMouseEnterPopover?: () => void
  onMouseLeavePopover?: () => void
  onClose?: () => void
}

export function HoverImpressionMeaningPopover({
  targetRect,
  impressionName,
  isOpen,
  onMouseEnterPopover,
  onMouseLeavePopover,
  onClose,
}: HoverImpressionMeaningPopoverProps) {
  const [mounted, setMounted] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current device is a desktop with fine pointer (mouse)
  const isDesktopPointer = React.useCallback(() => {
    if (typeof window === 'undefined') return true
    return (
      window.innerWidth >= 1024 &&
      !window.matchMedia('(pointer: coarse)').matches
    )
  }, [])

  // Find glossary item
  const glossaryItem = React.useMemo<ImpressionGlossaryItem | null>(() => {
    if (!impressionName) return null
    const lower = impressionName.toLowerCase().trim()
    const found = GLOSSARY_IMPRESSIONS.find(
      (item) => item.name.toLowerCase() === lower,
    )
    if (found) return found

    return {
      id: `custom-${lower}`,
      number: 0,
      name: impressionName,
      meaning: `Kesan emosional dan visual ${impressionName} yang dirasakan pengamat terhadap lukisan.`,
      category: 'suasana',
      categoryLabel: 'Kesan Visual',
      keywords: [impressionName.toLowerCase()],
    }
  }, [impressionName])

  // Find comparison if exists
  const comparison = React.useMemo(() => {
    if (!glossaryItem) return null
    const name = glossaryItem.name.toLowerCase()
    return (
      WORD_COMPARISONS.find(
        (c) => c.wordA.toLowerCase() === name || c.wordB.toLowerCase() === name,
      ) || null
    )
  }, [glossaryItem])

  // Dynamic layout positioning
  const [coords, setCoords] = React.useState<{
    top: number
    left: number
    arrowLeft: number
  }>({
    top: 0,
    left: 0,
    arrowLeft: 160,
  })

  // Calculate layout: ALWAYS position ABOVE the target button
  const updatePosition = React.useCallback(() => {
    if (!targetRect) return

    const viewportWidth = window.innerWidth
    const popoverWidth = Math.min(350, viewportWidth - 32)
    const popoverHeight = popoverRef.current
      ? popoverRef.current.offsetHeight
      : comparison
        ? 230
        : 175

    const gap = 12
    const padding = 16
    const minTopBound = 76 // Below top navbar

    // ALWAYS position ABOVE the target button (never downwards into bottom bar)
    let top = targetRect.top - popoverHeight - gap

    // Clamp to ensure it never gets pushed off top edge
    if (top < minTopBound) {
      top = minTopBound
    }

    // Horizontal centering relative to button
    const buttonCenter = targetRect.left + targetRect.width / 2
    let left = buttonCenter - popoverWidth / 2

    // Clamp horizontally within viewport
    if (left < padding) {
      left = padding
    } else if (left + popoverWidth > viewportWidth - padding) {
      left = viewportWidth - popoverWidth - padding
    }

    // Arrow relative to popover left
    const arrowLeft = Math.max(
      24,
      Math.min(popoverWidth - 24, buttonCenter - left),
    )

    setCoords({ top, left, arrowLeft })
  }, [targetRect, comparison])

  React.useLayoutEffect(() => {
    if (isOpen && targetRect) {
      updatePosition()
    }
  }, [isOpen, targetRect, updatePosition])

  // Dismiss on scroll to avoid detached popovers
  React.useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      if (onClose) onClose()
    }

    window.addEventListener('scroll', handleScrollOrResize, {
      passive: true,
      capture: true,
    })
    window.addEventListener('resize', handleScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, {
        capture: true,
      })
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, onClose])

  // If not mounted or mobile device, do not render hover popover
  if (!mounted || !isDesktopPointer()) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && glossaryItem && targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          onMouseEnter={onMouseEnterPopover}
          onMouseLeave={onMouseLeavePopover}
        >
          <motion.div
            ref={popoverRef}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 6,
            }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              relative
              w-[min(350px,calc(100vw-32px))]
              max-h-[min(320px,calc(100vh-170px))]
              overflow-y-auto
              rounded-2xl
              border
              border-neutral-200/90
              bg-white/95
              p-4
              shadow-[0_20px_50px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)]
              backdrop-blur-xl
              select-none
            "
          >
            {/* Top decorative accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-red-800 via-red-600 to-amber-600 opacity-60" />

            {/* Header: Category Badge & Number */}
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                [ {glossaryItem.categoryLabel} ]
              </span>

              {glossaryItem.number > 0 && (
                <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-400">
                  #{glossaryItem.number}
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="mt-1.5 font-serif text-lg font-bold tracking-tight text-neutral-900">
              {glossaryItem.name}
            </h4>

            {/* Curatorial Meaning */}
            <div className="mt-2 rounded-xl border border-neutral-200/70 bg-neutral-50/80 p-2.5">
              <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-0.5">
                Makna Kuratorial:
              </p>
              <p className="text-xs leading-relaxed text-neutral-800">
                {glossaryItem.meaning}
              </p>
            </div>

            {/* Keywords */}
            {glossaryItem.keywords && glossaryItem.keywords.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <Tag size={10} className="text-neutral-400 shrink-0" />
                {glossaryItem.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded bg-white border border-neutral-200 px-1.5 py-0.5 text-[9.5px] font-medium text-neutral-600"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* Confusing Word Comparison Callout (if available) */}
            {comparison && (
              <div className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-2 text-[10.5px] text-amber-900">
                <div className="flex items-center gap-1 font-bold text-amber-800 mb-0.5">
                  <GitCompare size={11} className="text-amber-700" />
                  <span>
                    vs{' '}
                    {comparison.wordA.toLowerCase() ===
                    glossaryItem.name.toLowerCase()
                      ? comparison.wordB
                      : comparison.wordA}
                    :
                  </span>
                </div>
                <div className="space-y-0.5 text-[10px] leading-snug text-neutral-800">
                  <p>
                    • <strong>{comparison.wordA}</strong>: {comparison.descA}
                  </p>
                  <p>
                    • <strong>{comparison.wordB}</strong>: {comparison.descB}
                  </p>
                </div>
              </div>
            )}

            {/* Pointer arrow diamond (firmly at the bottom pointing down to button) */}
            <span
              aria-hidden="true"
              style={{ left: `${coords.arrowLeft}px` }}
              className="
                pointer-events-none
                absolute
                -bottom-1.5
                size-3
                -translate-x-1/2
                rotate-45
                border-b
                border-r
                border-neutral-200/90
                bg-white
              "
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
