'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ImpressionButtonProps {
  id: string
  name: string
  isSelected: boolean
  onToggle: (id: string) => void
  className?: string
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onTouchStart?: (e: React.TouchEvent<HTMLButtonElement>) => void
  onTouchEnd?: (e: React.TouchEvent<HTMLButtonElement>) => void
}

export const ImpressionButton = React.memo(
  React.forwardRef<HTMLButtonElement, ImpressionButtonProps>(function ImpressionButton(
    {
      id,
      name,
      isSelected,
      onToggle,
      className,
      onMouseEnter,
      onMouseLeave,
      onTouchStart,
      onTouchEnd,
    },
    ref,
  ) {
    const handleClick = React.useCallback(() => {
      onToggle(id)
    }, [id, onToggle])

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-pressed={isSelected}
        className={cn(
          'rounded-full border px-3.5 py-2 text-sm font-medium cursor-pointer outline-none select-none',
          'transition-colors duration-100',
          isSelected
            ? 'border-red-900 bg-red-900 text-white shadow-sm'
            : 'border-white/80 bg-white/50 text-neutral-700 hover:bg-white/85 hover:text-neutral-900',
          className,
        )}
      >
        {name}
      </button>
    )
  }),
)

export default ImpressionButton
