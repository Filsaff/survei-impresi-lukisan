import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { isRespondentValid, type Respondent } from '@/domain/survey'
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
  const update = <K extends keyof Respondent>(
    key: K,
    next: Respondent[K],
  ) => {
    onChange({
      ...value,
      [key]: next,
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (isRespondentValid(value)) {
      onSubmit()
    }
  }

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
            required
            type="email"
            placeholder="nama@email.com"
            value={value.email}
            onChange={(e) => update('email', e.target.value)}
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
              placeholder="Contoh: 25"
              value={value.age ?? ''}
              onChange={(e) =>
                update(
                  'age',
                  e.target.value ? Number(e.target.value) : undefined,
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

        {/* CTA */}
        <Button
          type="submit"
          variant="glassRed2"
          size="lg"
          disabled={!isRespondentValid(value)}
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
