"use client";

import { useId } from "react";

const ANCHO = 24;
const ALTO = 50;
/** el contorno de una botella de un litro */
const FORMA =
  "M 8 2 L 16 2 L 16 11 C 16 15, 20 16, 20 21 L 20 45 C 20 47, 19 48, 17 48 L 7 48 C 5 48, 4 47, 4 45 L 4 21 C 4 16, 8 15, 8 11 Z";

/** Una botella de 1 litro, llena hasta donde diga `llenado` (de 0 a 1). */
export function Botella({
  llenado,
  color,
}: {
  llenado: number;
  color: string;
}) {
  const id = useId();
  const parte = Math.max(0, Math.min(1, llenado));

  return (
    <svg width={ANCHO} height={ALTO} role="presentation" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect
            x={0}
            y={ALTO * (1 - parte)}
            width={ANCHO}
            height={ALTO * parte}
          />
        </clipPath>
      </defs>
      <path d={FORMA} fill="#eef2f7" />
      <g clipPath={`url(#${id})`}>
        <path d={FORMA} fill={color} />
      </g>
      <path d={FORMA} fill="none" stroke="rgba(15,23,42,.45)" strokeWidth={1.5} />
    </svg>
  );
}
