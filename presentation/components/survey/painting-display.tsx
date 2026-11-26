import * as React from 'react'
import { Info } from 'lucide-react'
import type { SurveyPainting } from '@/domain/survey'

export interface PaintingDisplayProps {
  painting: SurveyPainting
}

export const PaintingDisplay = React.memo(function PaintingDisplay({
  painting,
}: PaintingDisplayProps) {
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null)
  const [hasError, setHasError] = React.useState<boolean>(false)
  const imgRef = React.useRef<HTMLImageElement | null>(null)

  React.useEffect(() => {
    setHasError(false)
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoadedSrc(painting.image)
    }
  }, [painting.image])

  const isLoaded = loadedSrc === painting.image

  return (
    <section className="flex flex-col items-center">
      <div
        className="
          relative
          w-full
          max-w-xl
          overflow-hidden
          rounded-[2rem]
          border
          border-neutral-200/70
          bg-neutral-200/60
          p-3
          shadow-[0_20px_60px_rgba(0,0,0,0.07),inset_0_1px_2px_rgba(255,255,255,0.9)]
        "
      >
        <div
          className="
            relative
            aspect-[4/3]
            w-full
            overflow-hidden
            rounded-[1.5rem]
            bg-white
          "
        >
          {/* Skeleton Shimmer Loading State */}
          {!isLoaded && !hasError && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-200/70 animate-pulse select-none"
            >
              <div className="size-8 rounded-full border-2 border-red-900/20 border-t-red-900 animate-spin" />
              <span className="mt-3 text-xs font-medium tracking-wide text-neutral-500">
                Memuat lukisan ke-{painting.position}...
              </span>
            </div>
          )}

          {/* Error Fallback */}
          {hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-100 p-6 text-center">
              <p className="text-sm font-medium text-neutral-700">
                Gagal memuat gambar lukisan ke-{painting.position}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Periksa koneksi internet Anda atau coba muat ulang gambar.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHasError(false)
                  setLoadedSrc(null)
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-neutral-200/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-300 active:scale-95"
              >
                Muat Ulang
              </button>
            </div>
          )}

          <img
            ref={imgRef}
            key={painting.image}
            src={painting.image}
            alt={`Lukisan Budaya Indonesia ke-${painting.position}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => {
              setLoadedSrc(painting.image)
              setHasError(false)
            }}
            onError={() => {
              setHasError(true)
            }}
            className={`
              block
              h-full
              w-full
              aspect-[4/3]
              object-contain
              transition-opacity
              duration-300
              ease-out
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>
      </div>

      <div className="mt-6 w-full max-w-xl text-left">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-px w-5 bg-red-800/40" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-red-800 uppercase">
            Koleksi Riset Budaya
          </span>
        </div>

        <h2
          className="
            font-serif
            text-2xl
            font-medium
            tracking-tight
            text-neutral-900
            md:text-3xl
          "
        >
          Lukisan Budaya Indonesia ke-{painting.position}
        </h2>

        <div
          className="
            mt-4
            rounded-xl
            border
            border-neutral-200/80
            bg-neutral-50/90
            p-3.5
            text-xs
            text-neutral-600
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.85)]
          "
        >
          <div className="flex items-start gap-2.5">
            <Info size={16} className="mt-0.5 shrink-0 text-neutral-400" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-neutral-800">
                Catatan Kualitas Gambar:
              </strong>{' '}
              Karya dalam dataset riset ini bersumber dari arsip beresolusi
              terbatas dan telah melalui proses pembesaran (<em>upscaling</em>).
              Beberapa gambar mungkin tampak terdistorsi akibat keterbatasan
              resolusi asli tersebut. Mohon berikan penilaian berdasarkan kesan
              visual keseluruhan karya yang Anda rasakan.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
})
