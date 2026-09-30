"use client";

export function BrushStrokes() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        overflow-hidden
        select-none
      "
      aria-hidden="true"
    >
      {/* Left brush strokes */}
      <svg
        className="brush-strokes brush-strokes-left"
        viewBox="0 0 800 600"
        fill="none"
      >
        <path d="M-80 150 C120 40, 180 260, 390 140 S650 80, 850 180" />
        <path d="M-100 175 C100 65, 190 285, 400 165 S660 105, 870 205" />
        <path d="M-120 200 C80 90, 200 310, 410 190 S670 130, 890 230" />
        <path d="M-140 225 C60 115, 210 335, 420 215 S680 155, 910 255" />
        <path d="M-160 250 C40 140, 220 360, 430 240 S690 180, 930 280" />
        <path d="M-180 275 C20 165, 230 385, 440 265 S700 205, 950 305" />
        <path d="M-200 300 C0 190, 240 410, 450 290 S710 230, 970 330" />
      </svg>

      {/* Right brush strokes */}
      <svg
        className="brush-strokes brush-strokes-right"
        viewBox="0 0 800 600"
        fill="none"
      >
        <path d="M-50 430 C140 320, 250 500, 430 380 S680 350, 850 430" />
        <path d="M-70 455 C120 345, 260 525, 440 405 S700 375, 870 455" />
        <path d="M-90 480 C100 370, 270 550, 450 430 S720 400, 890 480" />
        <path d="M-110 505 C80 395, 280 575, 460 455 S740 425, 910 505" />
        <path d="M-130 530 C60 420, 290 600, 470 480 S760 450, 930 530" />
      </svg>
    </div>
  );
}

export default BrushStrokes;