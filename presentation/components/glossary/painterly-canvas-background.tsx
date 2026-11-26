'use client'

import * as React from 'react'

export function PainterlyCanvasBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-0 select-none overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, transparent 10%, black 18%, black 82%, transparent 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, transparent 10%, black 18%, black 82%, transparent 92%, transparent 100%)',
      }}
    >
      {/* 1. Artist Canvas Subtle Woven Texture */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <filter id="canvas-weave">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#canvas-weave)" />
      </svg>

      {/* 2. Flowing Watercolor Pigment Stains (Drifting under glass impression buttons) */}
      {/* Pigment 1: Terracotta & Madder Lake (Warm Indonesian Clay / Heritage Red) - Centered in buttons zone */}
      <div
        className="
          animate-pigment-a
          absolute
          top-[34%]
          left-[10%]
          h-[480px]
          w-[520px]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(185,28,28,0.065)_0%,rgba(153,27,27,0.025)_45%,transparent_70%)]
          blur-2xl
        "
      />

      {/* Pigment 2: Golden Ochre & Raw Sienna (Heritage Gold & Sunlight) */}
      <div
        className="
          animate-pigment-b
          absolute
          top-[42%]
          right-[5%]
          h-[560px]
          w-[600px]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.08)_0%,rgba(180,83,9,0.025)_50%,transparent_75%)]
          blur-3xl
        "
      />

      {/* Pigment 3: Deep Prussian Indigo & Cerulean (Maritime & Night Calm) */}
      <div
        className="
          animate-pigment-c
          absolute
          bottom-[16%]
          left-[5%]
          h-[520px]
          w-[540px]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.06)_0%,rgba(14,116,144,0.02)_45%,transparent_70%)]
          blur-3xl
        "
      />

      {/* Pigment 4: Soft Umber & Sage (Natural Flora & Earth Undertone) */}
      <div
        className="
          animate-pigment-a
          absolute
          bottom-[18%]
          right-[22%]
          h-[420px]
          w-[460px]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(120,53,15,0.045)_0%,transparent_65%)]
          blur-2xl
        "
      />

      {/* 3. Broad Painterly Palette Knife & Flat Brush Sweeps (Behind Buttons Area) */}
      {/* Mid-Right Broad Painterly Impasto Ribbon */}
      <div className="animate-brush-sweep absolute -right-20 top-[28%] w-[700px] opacity-70">
        <svg
          viewBox="0 0 700 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M50 140 C180 60, 340 180, 520 90 C620 40, 680 70, 720 50 C700 110, 630 160, 480 180 C310 200, 160 190, 50 140 Z"
            fill="url(#palette-terracotta-gradient)"
          />
          <defs>
            <linearGradient
              id="palette-terracotta-gradient"
              x1="50"
              y1="50"
              x2="720"
              y2="180"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#991B1B" stopOpacity="0.035" />
              <stop offset="0.45" stopColor="#D97706" stopOpacity="0.05" />
              <stop offset="0.85" stopColor="#B45309" stopOpacity="0.02" />
              <stop offset="1" stopColor="#991B1B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Lower-Left Broad Watercolor Wash Ribbon */}
      <div className="animate-brush-sweep absolute -left-28 bottom-32 w-[750px] opacity-65">
        <svg
          viewBox="0 0 750 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M-20 80 C150 140, 320 40, 500 110 C620 160, 710 120, 760 140 C730 200, 600 230, 450 190 C280 145, 120 220, -20 80 Z"
            fill="url(#palette-indigo-amber-gradient)"
          />
          <defs>
            <linearGradient
              id="palette-indigo-amber-gradient"
              x1="0"
              y1="40"
              x2="750"
              y2="200"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1E3A8A" stopOpacity="0.04" />
              <stop offset="0.5" stopColor="#B45309" stopOpacity="0.05" />
              <stop offset="0.85" stopColor="#991B1B" stopOpacity="0.025" />
              <stop offset="1" stopColor="#FAF8F5" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Center Subtle Pigment Wash Stream (Right behind Impression Buttons) */}
      <div className="animate-pigment-b absolute left-[10%] top-[45%] w-[85%] max-w-4xl opacity-80">
        <svg
          viewBox="0 0 900 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 90 C180 40, 360 140, 540 80 C720 20, 840 110, 900 70 C860 140, 720 160, 520 130 C340 100, 160 150, 0 90 Z"
            fill="url(#palette-center-swatch)"
          />
          <defs>
            <linearGradient
              id="palette-center-swatch"
              x1="0"
              y1="50"
              x2="900"
              y2="130"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#D97706" stopOpacity="0" />
              <stop offset="0.3" stopColor="#B45309" stopOpacity="0.045" />
              <stop offset="0.7" stopColor="#991B1B" stopOpacity="0.04" />
              <stop offset="1" stopColor="#1E3A8A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export default PainterlyCanvasBackground
