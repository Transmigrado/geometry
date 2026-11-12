"use client";

import type { Fruta } from "@/lib/ecuaciones";

type Props = {
  fruta: Fruta;
  cantidad: number;
  /** la pesa de peso conocido que acompaña a las frutas; 0 si no hay */
  extra: number;
  /** lo que muestra el visor */
  marca: number;
  /** cuando la respuesta no cuadra, el visor lo dice */
  correcta: boolean | null;
};

const ANCHO = 340;
const ALTO = 240;

export function Balanza({ fruta, cantidad, extra, marca, correcta }: Props) {
  const bultos = cantidad + (extra > 0 ? 1 : 0);
  const separacion = Math.min(48, 230 / bultos);
  const inicio = ANCHO / 2 - ((bultos - 1) * separacion) / 2;
  // con muchas cosas encima, achicarlas para que no se encimen
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
      aria-label={`Una pesa con ${cantidad} ${fruta.plural}${
        extra > 0 ? ` y una pesa de ${extra}` : ""
      } que marca ${marca}`}
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

      {extra > 0 && (
        <Pesa
          x={inicio + cantidad * separacion}
          suelo={70}
          tamano={tamano}
          valor={extra}
        />
      )}

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

/** La pesa de metal de toda la vida, con su asa y su número grabado. */
function Pesa({
  x,
  suelo,
  tamano,
  valor,
}: {
  x: number;
  suelo: number;
  tamano: number;
  valor: number;
}) {
  const alto = tamano * 0.8;
  const abajo = tamano * 0.5;
  const arriba = tamano * 0.33;
  const techo = suelo - alto;

  return (
    <g>
      <path
        d={`M ${x - abajo} ${suelo} L ${x + abajo} ${suelo} L ${
          x + arriba
        } ${techo} L ${x - arriba} ${techo} Z`}
        fill="#64748b"
        stroke="#334155"
      />
      <path
        d={`M ${x - arriba * 0.6} ${techo} A ${arriba * 0.6} ${
          arriba * 0.6
        } 0 0 1 ${x + arriba * 0.6} ${techo}`}
        fill="none"
        stroke="#334155"
        strokeWidth={3}
      />
      <text
        x={x}
        y={suelo - alto * 0.28}
        textAnchor="middle"
        fontSize={tamano * 0.42}
        fontWeight="bold"
        fill="#f8fafc"
      >
        {valor}
      </text>
    </g>
  );
}
