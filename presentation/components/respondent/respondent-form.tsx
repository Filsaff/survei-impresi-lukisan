import * as React from 'react'
import { AlertCircle, ArrowRight } from 'lucide-react'
import {
  EMAIL_LETTERS_DOTS_REGEX,
  isRespondentValid,
  type Respondent,
} from '@/domain/survey'
import { Button } from '@/components/ui/button'

export interface RespondentFormProps {
  value: Respondent
  onChange: (value: Respondent) => void
  onSubmit: () => void
}

export const RespondentForm = React.memo(function RespondentForm({
  value,
  onChange,
  onSubmit,
}: RespondentFormProps) {
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const emailInputRef = React.useRef<HTMLInputElement>(null)

  const update = <K extends keyof Respondent>(
    key: K,
    next: Respondent[K],
  ) => {
    onChange({
      ...value,
      [key]: next,
    })
  }

  const handleAgeChange = (rawAgeText: string) => {
    const parsedAge = rawAgeText ? Number(rawAgeText) : undefined
  
    onChange({
      ...value,
      age: parsedAge,
      allowAdultContent:
        parsedAge !== undefined && parsedAge >= 18,
    })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextEmail = e.target.value
    update('email', nextEmail)

    // Clear error message if user starts typing a valid format or clears the field
    if (emailError) {
      if (!nextEmail.trim() || EMAIL_LETTERS_DOTS_REGEX.test(nextEmail.trim())) {
        setEmailError(null)
      }
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    // 1. Strict email username format check (letters and dots only)
    const trimmedEmail = (value.email || '').trim()
    if (!trimmedEmail || !EMAIL_LETTERS_DOTS_REGEX.test(trimmedEmail)) {
      setEmailError(
        'Format email belum sesuai. Nama pengguna email (sebelum @) hanya boleh berupa huruf dan titik tanpa angka atau karakter lain (contoh: nama.lengkap@domain.com).'
      )
      emailInputRef.current?.focus()
      return
    }

    setEmailError(null)

    // 2. Proceed if all fields are valid
    if (isRespondentValid(value)) {
      onSubmit()
    }
  }

  // The button is clickable once base fields are filled.
  // If email format is invalid when clicked, handleSubmit intercepts and displays the interactive notification.
  const isBaseFilled = Boolean(
    value.name?.trim() &&
      value.email?.trim() &&
      value.gender &&
      value.age &&
      value.education,
  )

  return (
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
      onSubmit={handleSubmit}
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
        <label className="block">
          <span className="text-xs font-semibold tracking-widest text-neutral-500">
            NAMA LENGKAP
          </span>

          <input
            required
            maxLength={100}
            placeholder="Masukkan nama Anda"
            value={value.name}
            onChange={(e) => update('name', e.target.value)}
            className="
              mt-2
              h-12
              w-full
              rounded-xl
              border
              border-neutral-200/80
              bg-white/80
              px-4
              text-sm
              text-neutral-900
              outline-none
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
              transition-colors
              placeholder:text-neutral-400
              focus:border-neutral-400
              focus:bg-white
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
            ref={emailInputRef}
            required
            type="email"
            maxLength={100}
            placeholder="nama@domain.com"
            value={value.email}
            onChange={handleEmailChange}
            className={`
              mt-2
              h-12
              w-full
              rounded-xl
              border
              bg-white/80
              px-4
              text-sm
              text-neutral-900
              outline-none
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
              transition-all
              placeholder:text-neutral-400
              ${
                emailError
                  ? 'border-red-400 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-neutral-200/80 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-red-900/10'
              }
            `}
          />

          {/* Interactive Error Notification if email format is invalid */}
          {emailError && (
            <div
              role="alert"
              className="mt-2 flex items-start gap-2 rounded-xl border border-red-200/90 bg-red-50/90 px-3.5 py-2.5 text-xs text-red-700 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{emailError}</span>
            </div>
          )}
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
                  onChange={() => update('gender', 'Laki-laki')}
                  className="accent-red-800 size-5 border-neutral-200/80"
                />
                Laki-laki
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                <input
                  type="radio"
                  name="gender"
                  checked={value.gender === 'Perempuan'}
                  onChange={() => update('gender', 'Perempuan')}
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
              max="120"
              placeholder="Contoh: 25"
              value={value.age ?? ''}
              onChange={(e) => handleAgeChange(e.target.value)}
              className="
                mt-2
                h-12
                w-full
                rounded-xl
                border
                border-neutral-200/80
                bg-white/80
                px-4
                text-sm
                text-neutral-900
                outline-none
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
                transition-colors
                placeholder:text-neutral-400
                focus:border-neutral-400
                focus:bg-white
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
              border-neutral-200/80
              bg-white/80
              px-4
              text-sm
              text-neutral-900
              outline-none
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
              transition-colors
              focus:border-neutral-400
              focus:bg-white
              focus:ring-2
              focus:ring-red-900/10
            "
          >
            <option value="">Pilih tingkat pendidikan</option>
            <option>SMA / sederajat</option>
            <option>D3</option>
            <option>S1</option>
            <option>S2 / S3</option>
          </select>
        </label>

        {/* Adult / Nude Painting Content Toggle (Minimal Switch, 18+ Only) */}
        {value.age && value.age >= 18 && (
          <label
            className="
              flex cursor-pointer items-center justify-between gap-4
              rounded-xl border border-neutral-200/80 bg-white/70 px-4 py-3
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
              transition-all duration-300 hover:border-neutral-300 hover:bg-white
              animate-in fade-in slide-in-from-top-1
            "
          >
            <div className="flex flex-col select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-neutral-700">
                  Sertakan Lukisan Nude
                </span>
                <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-red-900 bg-red-900/10">
                  18+
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Izin menampilkan karya bertema nude art
              </p>
            </div>

            {/* Hidden native checkbox for keyboard and touch accessibility */}
            <input
              type="checkbox"
              name="allowAdultContent"
              checked={Boolean(value.allowAdultContent)}
              onChange={(e) => update('allowAdultContent', e.target.checked)}
              className="sr-only"
            />

            {/* Visual On/Off Switch */}
            <div
              aria-hidden="true"
              className={`
                relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out
                ${value.allowAdultContent ? 'bg-red-900' : 'bg-neutral-300/80'}
              `}
            >
              <span
                className={`
                  inline-block size-5 transform rounded-full bg-white shadow-md ring-0
                  transition duration-200 ease-in-out
                  ${value.allowAdultContent ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </div>
          </label>
        )}

        {/* CTA */}
        <Button
          type="submit"
          variant="glassRed2"
          size="lg"
          disabled={!isBaseFilled}
          className="mt-2 w-full text-base font-medium"
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
  )
})
