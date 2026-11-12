"use client";

import type { Fruta } from "@/lib/ecuaciones";

type Props = {
  fruta: Fruta;
  cantidad: number;
  /** lo que muestra el visor */
  marca: number;
  /** cuando la respuesta no cuadra, el visor lo dice */
  correcta: boolean | null;
};

const ANCHO = 340;
const ALTO = 240;

export function Balanza({ fruta, cantidad, marca, correcta }: Props) {
  const separacion = Math.min(48, 220 / cantidad);
  const inicio = ANCHO / 2 - ((cantidad - 1) * separacion) / 2;
  // con muchas frutas, achicarlas para que no se encimen
  const tamano = Math.min(38, separacion);
  const visor =
    correcta === null ? "#0f172a" : correcta ? "#047857" : "#9f1239";

  return (
    <svg
      width={ANCHO}
      height={ALTO}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="mx-auto shrink-0"
      role="img"
      aria-label={`Una pesa con ${cantidad} ${fruta.plural} que marca ${marca}`}
    >
      {Array.from({ length: cantidad }, (_, indice) => (
        <text
          key={indice}
          x={inicio + indice * separacion}
          y={64}
          textAnchor="middle"
          fontSize={tamano}
        >
          {fruta.emoji}
        </text>
      ))}

      <rect x={45} y={72} width={250} height={16} rx={8} fill="#38bdf8" />
      <rect x={160} y={88} width={20} height={34} fill="#0284c7" />
      <rect x={60} y={120} width={220} height={96} rx={20} fill="#0ea5e9" />
      <rect x={110} y={142} width={120} height={52} rx={12} fill={visor} />

      <text
        x={170}
        y={178}
        textAnchor="middle"
        fontSize={32}
        fontWeight="bold"
        fill="#f8fafc"
      >
        {marca}
      </text>
    </svg>
  );
}
