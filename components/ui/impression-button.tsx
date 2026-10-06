'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ImpressionButtonProps {
  id: string
  name: string
  isSelected: boolean
  onToggle: (id: string) => void
  className?: string
}

export const ImpressionButton = React.memo(function ImpressionButton({
  id,
  name,
  isSelected,
  onToggle,
  className,
}: ImpressionButtonProps) {
  const handleClick = React.useCallback(() => {
    onToggle(id)
  }, [id, onToggle])

  return (
    <button
      type="button"
      onClick={handleClick}
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
})

export default ImpressionButton
