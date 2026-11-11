"use client";

import { CuboIso } from "./iso";
import { tono } from "@/lib/color";
import type { Cuerpo } from "@/lib/cuerpos";

export const TAMANO_MINI = 30;

const LADO_CUBO = 15;

/** El cuerpo dibujado chiquito y centrado en el origen, para usarlo como ficha. */
export function MiniCuerpo({
  cuerpo,
  color,
}: {
  cuerpo: Cuerpo;
  color: string;
}) {
  if (cuerpo.tipo === "cubo") {
    return <CuboIso cx={0} cy={-LADO_CUBO / 2} lado={LADO_CUBO} color={color} />;
  }

  if (cuerpo.tipo === "esfera") {
    return (
      <circle
        cx={0}
        cy={0}
        r={TAMANO_MINI / 2 - 2}
        fill={color}
        stroke="rgba(15,23,42,.4)"
      />
    );
  }

  if (cuerpo.tipo === "cilindro") {
    const rx = 9;
    const ry = 3;
    const altura = 18;

    return (
      <g stroke="rgba(15,23,42,.4)">
        <path
          d={`M ${-rx} ${-altura / 2} L ${-rx} ${altura / 2} A ${rx} ${ry} 0 0 0 ${rx} ${
            altura / 2
          } L ${rx} ${-altura / 2} Z`}
          fill={color}
        />
        <ellipse
          cx={0}
          cy={-altura / 2}
          rx={rx}
          ry={ry}
          fill={tono(color, 1.15)}
        />
      </g>
    );
  }

  const ancho = 24;
  const alto = 16;

  return (
    <g stroke="rgba(15,23,42,.4)">
      <rect
        x={-ancho / 2}
        y={-alto / 2}
        width={ancho}
        height={alto}
        fill={color}
      />
      <rect
        x={-ancho / 2}
        y={-alto / 2}
        width={ancho}
        height={5}
        fill={tono(color, 1.15)}
      />
    </g>
  );
}
