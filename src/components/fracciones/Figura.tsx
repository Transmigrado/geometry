"use client";

import type { Pieza } from "@/lib/fracciones";

const RELLENO = "#0ea5e9";
const VACIO = "#ffffff";
const BORDE = "#0369a1";

/**
 * La figura partida en piezas, que se pintan al tocarlas.
 *
 * Cada pieza es un botón de verdad y no un `path` con un `onClick`: así se
 * llega con el tabulador, se puede decir si está pintada o no, y el
 * teclado funciona solo.
 */
export function Figura({
  piezas,
  pintadas,
  colores,
  svgRef,
  alTocar,
  bloqueada,
}: {
  piezas: Pieza[];
  pintadas: Set<string>;
  colores?: Record<string, string>;
  svgRef?: React.Ref<SVGSVGElement>;
  alTocar: (id: string) => void;
  bloqueada: boolean;
}) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      className="h-auto w-full max-w-sm touch-manipulation"
    >
      {piezas.map((pieza) => {
        const pintada = pintadas.has(pieza.id);

        return (
          <path
            key={pieza.id}
            d={pieza.camino}
            role="button"
            tabIndex={bloqueada ? -1 : 0}
            aria-pressed={pintada}
            aria-label={pintada ? "Pieza pintada" : "Pieza sin pintar"}
            onClick={() => !bloqueada && alTocar(pieza.id)}
            onKeyDown={(evento) => {
              if (bloqueada) return;
              if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                alTocar(pieza.id);
              }
            }}
            fill={pintada ? colores?.[pieza.id] ?? RELLENO : VACIO}
            stroke={BORDE}
            strokeWidth={2}
            strokeLinejoin="round"
            className={
              bloqueada
                ? "outline-none"
                : "cursor-pointer outline-none transition-[fill] hover:fill-sky-200 focus-visible:stroke-[4]"
            }
          />
        );
      })}
    </svg>
  );
}
