"use client";

import { useBucle } from "@/components/problema/animacion";

/**
 * El auto del módulo, yendo y viniendo sobre una recta corta: avanza a la
 * derecha y retrocede a la izquierda, sin girar nunca.
 */
export function IconoAuto({ color }: { color: string }) {
  const t = useBucle(3600);
  // va y vuelve: 0 → 1 → 0
  const avance = t < 0.5 ? t * 2 : (1 - t) * 2;
  const x = 20 + avance * 110;
  const retrocediendo = t >= 0.5;

  return (
    <svg
      viewBox="0 0 150 90"
      width={150}
      height={90}
      role="img"
      aria-label="Un auto que avanza y retrocede sobre una recta"
    >
      <line x1={10} y1={60} x2={140} y2={60} stroke={color} strokeWidth={3} opacity={0.4} />
      <line x1={75} y1={50} x2={75} y2={70} stroke={color} strokeWidth={3} opacity={0.6} />

      <g transform={`translate(${x} 42)`}>
        {retrocediendo && (
          <text x={8} y={-6} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#dc2626">
            ◀ R
          </text>
        )}
        <path
          d="M -14 9 L -10 -2 L 5 -2 L 10 3 L 14 3 L 14 9 Z"
          fill={color}
          stroke={color}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        <rect x={-7} y={-7} width={12} height={7} rx={2} fill="white" opacity={0.7} />
        <circle cx={-8} cy={10} r={3} fill="#0f172a" />
        <circle cx={8} cy={10} r={3} fill="#0f172a" />
      </g>
    </svg>
  );
}
