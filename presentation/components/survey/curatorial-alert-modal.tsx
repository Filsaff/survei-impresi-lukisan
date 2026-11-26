import * as React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export type CuratorialAlertType = 'error' | 'warning' | 'info' | 'offline'

export interface CuratorialAlertModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: CuratorialAlertType
  primaryButtonText?: string
  secondaryButtonText?: string
  onPrimaryClick: () => void
  onSecondaryClick?: () => void
}

export const CuratorialAlertModal = React.memo(function CuratorialAlertModal({
  isOpen,
  title,
  message,
  type = 'error',
  primaryButtonText = 'Mengerti',
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
}: CuratorialAlertModalProps) {
  if (!isOpen) return null

  const getIconConfig = () => {
    switch (type) {
      case 'offline':
        return {
          icon: <WifiOff size={22} />,
          badgeClass:
            'border-amber-900/15 bg-amber-900/[0.08] text-amber-800',
        }
      case 'info':
        return {
          icon: <Sparkles size={22} />,
          badgeClass:
            'border-red-900/15 bg-red-900/[0.08] text-red-800',
        }
      case 'warning':
        return {
          icon: <AlertCircle size={22} />,
          badgeClass:
            'border-amber-900/15 bg-amber-900/[0.08] text-amber-800',
        }
      case 'error':
      default:
        return {
          icon: <AlertTriangle size={22} />,
          badgeClass:
            'border-red-900/15 bg-red-900/[0.08] text-red-800',
        }
    }
  }

  const { icon, badgeClass } = getIconConfig()

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-neutral-950/45
        px-6
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
          bg-white/98
          p-8
          shadow-[0_30px_100px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)]
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
      >
        {/* Specular reflection highlight */}
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

        {/* Icon Badge */}
        <div
          className={`
            flex
            size-12
            items-center
            justify-center
            rounded-full
            border
            ${badgeClass}
          `}
        >
          {icon}
        </div>

        <h2
          id="alert-dialog-title"
          className="
            mt-6
            font-serif
            text-2xl
            font-medium
            leading-tight
            text-neutral-900
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-4
            text-sm
            leading-relaxed
            text-neutral-600
          "
        >
          {message}
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {secondaryButtonText && onSecondaryClick && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onSecondaryClick}
              className="
                h-12
                rounded-xl
                border-neutral-200
                bg-white
                px-5
                text-neutral-600
                hover:bg-neutral-50
                hover:text-neutral-900
              "
            >
              {secondaryButtonText}
            </Button>
          )}

          <Button
            type="button"
            variant="glassRed"
            size="lg"
            onClick={onPrimaryClick}
            className="
              group
              h-12
              rounded-xl
              px-6
            "
          >
            <span>{primaryButtonText}</span>
            <ArrowRight
              size={15}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </Button>
        </div>
      </div>
    </div>
  )
})
