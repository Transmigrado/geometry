"use client";

import type { Fruta } from "@/lib/ecuaciones";
import { Pesa } from "./Balanza";

type Props = {
  fruta: Fruta;
  cantidadIzquierda: number;
  extraIzquierda: number;
  cantidadDerecha: number;
  extraDerecha: number;
};

const ANCHO = 380;
const ALTO = 240;
const VIGA_Y = 86;
const PLATO_Y = 150;

/**
 * Siempre está nivelada: lo que se ve es el enunciado —los dos platillos
 * pesan lo mismo—, no una respuesta. Por eso no recibe la elegida por el
 * niño: inclinarla según su respuesta regalaría si acertó antes de que
 * lo piense.
 */
export function BalanzaDosLados({
  fruta,
  cantidadIzquierda,
  extraIzquierda,
  cantidadDerecha,
  extraDerecha,
}: Props) {
  return (
    <svg
      width={ANCHO}
      height={ALTO}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="mx-auto shrink-0"
      role="img"
      aria-label={`Una balanza equilibrada: a la izquierda ${cantidadIzquierda} ${fruta.plural}${
        extraIzquierda > 0 ? ` y una pesa de ${extraIzquierda}` : ""
      }, a la derecha ${cantidadDerecha} ${fruta.plural}${
        extraDerecha > 0 ? ` y una pesa de ${extraDerecha}` : ""
      }`}
    >
      <path
        d={`M ${ANCHO / 2 - 16} ${ALTO - 18} L ${ANCHO / 2 + 16} ${ALTO - 18} L ${ANCHO / 2} ${VIGA_Y + 16} Z`}
        fill="#0284c7"
      />
      <rect x={ANCHO / 2 - 22} y={ALTO - 22} width={44} height={10} rx={4} fill="#0369a1" />

      <rect x={30} y={VIGA_Y} width={ANCHO - 60} height={8} rx={4} fill="#38bdf8" />
      <circle cx={ANCHO / 2} cy={VIGA_Y + 4} r={7} fill="#0369a1" />

      <Plato x={76} fruta={fruta} cantidad={cantidadIzquierda} extra={extraIzquierda} />
      <Plato x={ANCHO - 76} fruta={fruta} cantidad={cantidadDerecha} extra={extraDerecha} />
    </svg>
  );
}

function Plato({
  x,
  fruta,
  cantidad,
  extra,
}: {
  x: number;
  fruta: Fruta;
  cantidad: number;
  extra: number;
}) {
  const bultos = cantidad + (extra > 0 ? 1 : 0);
  const separacion = Math.min(32, 120 / bultos);
  const inicio = x - ((bultos - 1) * separacion) / 2;
  const tamano = Math.min(28, separacion);

  return (
    <g>
      <line x1={x - 30} y1={VIGA_Y + 6} x2={x} y2={PLATO_Y} stroke="#0284c7" strokeWidth={2} />
      <line x1={x + 30} y1={VIGA_Y + 6} x2={x} y2={PLATO_Y} stroke="#0284c7" strokeWidth={2} />
      <ellipse cx={x} cy={PLATO_Y} rx={58} ry={13} fill="#0ea5e9" />

      {Array.from({ length: cantidad }, (_, indice) => (
        <text
          key={indice}
          x={inicio + indice * separacion}
          y={PLATO_Y - 14}
          textAnchor="middle"
          fontSize={tamano}
        >
          {fruta.emoji}
        </text>
      ))}

      {extra > 0 && (
        <Pesa
          x={inicio + cantidad * separacion}
          suelo={PLATO_Y - 8}
          tamano={tamano}
          valor={extra}
        />
      )}
    </g>
  );
}
