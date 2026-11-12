import React from "react";

/** Ondas de pincel verde y turquesa, como en la tarjeta de Blanco y Negro. Decorativas. */
export const BrushWaves: React.FC<{ className?: string; flip?: boolean }> = ({ className = "", flip = false }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1440 120"
    preserveAspectRatio="none"
    className={`pointer-events-none block w-full h-14 sm:h-20 ${flip ? "rotate-180" : ""} ${className}`}
  >
    <defs>
      <linearGradient id="bw-verde" x1="0" x2="1">
        <stop offset="0" stopColor="#7ed321" />
        <stop offset="1" stopColor="#2fa83a" />
      </linearGradient>
      <linearGradient id="bw-turquesa" x1="0" x2="1">
        <stop offset="0" stopColor="#1fb7cf" />
        <stop offset="1" stopColor="#7fd6c2" />
      </linearGradient>
    </defs>
    <path d="M0 70 C240 10 480 110 760 60 S1200 10 1440 55 L1440 120 L0 120 Z" fill="url(#bw-turquesa)" opacity="0.55" />
    <path d="M0 90 C260 40 520 120 800 80 S1220 40 1440 85 L1440 120 L0 120 Z" fill="url(#bw-verde)" opacity="0.8" />
  </svg>
);
