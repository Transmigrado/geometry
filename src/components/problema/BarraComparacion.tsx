"use client";

import { formatear } from "@/lib/problema";

type Props = {
  /** cuántas veces cabe B dentro de A */
  veces: number;
  color: string;
  etiqueta: string;
};

const MAXIMO_DIBUJABLE = 60;

/** Dibuja una ficha por cada B que cabe en A; la última va a medias si sobra. */
export function BarraComparacion({ veces, color, etiqueta }: Props) {
  const enteras = Math.floor(veces + 1e-9);
  const resto = veces - enteras;
  const fichas = enteras + (resto > 0.001 ? 1 : 0);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">{etiqueta}</h2>

      {fichas > MAXIMO_DIBUJABLE ? (
        <p className="mt-3 text-lg font-semibold text-slate-600">
          Son {formatear(veces)}: demasiadas para dibujarlas una por una.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {Array.from({ length: fichas }, (_, indice) => {
            const parcial = indice === enteras;

            return (
              <li
                key={indice}
                title={parcial ? `sobra ${formatear(resto)}` : `${indice + 1}`}
                className="relative h-9 w-9 overflow-hidden rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
              >
                <span
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    background: color,
                    height: parcial ? `${resto * 100}%` : "100%",
                  }}
                />
                <span className="relative flex h-full items-center justify-center">
                  {indice + 1}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
