import * as React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SurveyConfirmationModalProps {
  onBack: () => void
  onSubmit: () => void
  submitting?: boolean
  error?: string | null
}

export const SurveyConfirmationModal = React.memo(function SurveyConfirmationModal({
  onBack,
  onSubmit,
  submitting = false,
  error = null,
}: SurveyConfirmationModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-neutral-950/40
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
          20 lukisan.{' '}
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
})

// Also export alias ConfirmationDialog for backward compatibility if imported elsewhere
export const ConfirmationDialog = SurveyConfirmationModal
