"use client";

import { CuboIso, limitesIso, posicionIso } from "./iso";
import type { ConteoVolumen } from "@/lib/problema";

type Props = {
  conteo: ConteoVolumen;
  /** cuántos cubitos se muestran, contando piso por piso */
  visibles: number;
  /** lado del cubito en píxeles */
  lado: number;
  color: string;
};

/** Dibuja los cubitos que caben dentro de la caja, en vista isométrica. */
export function CubosApilados({ conteo, visibles, lado, color }: Props) {
  const { enLargo, enAncho, enAlto } = conteo;

  const cubos = [];
  for (let k = 0; k < enAlto; k += 1) {
    for (let j = 0; j < enAncho; j += 1) {
      for (let i = 0; i < enLargo; i += 1) {
        const puesto = k * enLargo * enAncho + j * enLargo + i;
        if (puesto < visibles) {
          // en isometría los cubos de una misma diagonal no se tapan entre sí
          cubos.push({ i, j, k, profundidad: i + j + k });
        }
      }
    }
  }
  cubos.sort((uno, otro) => uno.profundidad - otro.profundidad);

  const limites = limitesIso(enLargo, enAncho, enAlto, lado);
  const margen = 4;

  return (
    <svg
      viewBox={`${limites.minX - margen} ${limites.minY - margen} ${
        limites.maxX - limites.minX + margen * 2
      } ${limites.maxY - limites.minY + margen * 2}`}
      width={limites.maxX - limites.minX + margen * 2}
      height={limites.maxY - limites.minY + margen * 2}
      className="mx-auto shrink-0"
      role="presentation"
      aria-hidden="true"
    >
      {cubos.map(({ i, j, k }) => {
        const { cx, cy } = posicionIso(i, j, k, lado);
        return (
          <CuboIso
            key={`${i}-${j}-${k}`}
            cx={cx}
            cy={cy}
            lado={lado}
            color={color}
          />
        );
      })}
    </svg>
  );
}
