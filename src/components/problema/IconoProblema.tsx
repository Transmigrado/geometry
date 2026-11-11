"use client";

import { useBucle } from "./animacion";
import { CuboIso, carasIso, limitesIso, posicionIso } from "./iso";
import type { TipoProblema } from "@/lib/cuerpos";

const LADO = 17;
const PAUSA = 4;

/**
 * Dos dibujitos que se repiten solos para que el niño vea la diferencia
 * antes de elegir: la cáscara que se pega por fuera y el relleno que entra
 * por dentro.
 */
export function IconoProblema({
  tipo,
  color,
}: {
  tipo: TipoProblema;
  color: string;
}) {
  const t = useBucle(tipo === "superficie" ? 4200 : 3600);

  const cubos = [0, 1].flatMap((k) =>
    [0, 1].flatMap((j) => [0, 1].map((i) => ({ i, j, k }))),
  );
  // se llena de abajo hacia arriba, como cuando uno acomoda cubitos
  const orden = [...cubos].sort(
    (a, b) => a.k - b.k || a.j - b.j || a.i - b.i,
  );

  const parches = parchesVisibles();
  const total = tipo === "superficie" ? parches.length : orden.length;
  const puestos = Math.min(total, Math.floor(t * (total + PAUSA)));

  const limites = limitesIso(2, 2, 2, LADO);
  const margen = 4;

  return (
    <svg
      width={56}
      height={56}
      viewBox={`${limites.minX - margen} ${limites.minY - margen} ${
        limites.maxX - limites.minX + margen * 2
      } ${limites.maxY - limites.minY + margen * 2}`}
      role="presentation"
      aria-hidden="true"
    >
      {tipo === "superficie"
        ? // el cuerpo completo y encima los parches que lo van tapando
          [
            ...cubos
              .sort((a, b) => a.i + a.j + a.k - (b.i + b.j + b.k))
              .map(({ i, j, k }) => {
                const { cx, cy } = posicionIso(i, j, k, LADO);
                return (
                  <CuboIso
                    key={`cuerpo-${i}-${j}-${k}`}
                    cx={cx}
                    cy={cy}
                    lado={LADO}
                    color="#cbd5e1"
                  />
                );
              }),
            ...parches.slice(0, puestos).map((parche, indice) => (
              <polygon
                key={`parche-${indice}`}
                points={parche}
                fill={color}
                stroke="rgba(15,23,42,.35)"
                strokeWidth={0.8}
              />
            )),
          ]
        : orden.slice(0, puestos).map(({ i, j, k }) => {
            const { cx, cy } = posicionIso(i, j, k, LADO);
            return (
              <CuboIso
                key={`relleno-${i}-${j}-${k}`}
                cx={cx}
                cy={cy}
                lado={LADO}
                color={color}
              />
            );
          })}
    </svg>
  );
}

/** Los 12 trozos planos que se ven de un bloque de 2 × 2 × 2. */
function parchesVisibles() {
  const arriba = [0, 1].flatMap((j) =>
    [0, 1].map((i) => carasIso(...coordenadas(i, j, 1)).arriba),
  );
  const izquierda = [1, 0].flatMap((k) =>
    [0, 1].map((i) => carasIso(...coordenadas(i, 1, k)).izquierda),
  );
  const derecha = [1, 0].flatMap((k) =>
    [0, 1].map((j) => carasIso(...coordenadas(1, j, k)).derecha),
  );

  return [...arriba, ...izquierda, ...derecha];
}

function coordenadas(i: number, j: number, k: number): [number, number, number] {
  const { cx, cy } = posicionIso(i, j, k, LADO);
  return [cx, cy, LADO];
}
