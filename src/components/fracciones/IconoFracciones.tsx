"use client";

import { useBucle } from "@/components/problema/animacion";

/**
 * Un cuadrado en cuatro partes que se van pintando hasta la mitad y se
 * vacían. Enseña de un vistazo de qué va el juego: elegir partes hasta
 * llegar a la fracción que piden.
 */
export function IconoFracciones({ color }: { color: string }) {
  const t = useBucle(3600);

  // se pintan dos, se quedan un rato, y vuelta a empezar
  const pintadas = Math.min(2, Math.floor(t * 3.4));

  const lado = 54;
  const inicio = 21;

  return (
    <svg
      viewBox="0 0 150 120"
      width={150}
      height={120}
      role="img"
      aria-label="Un cuadrado con la mitad pintada"
    >
      {[0, 1, 2, 3].map((cual) => {
        const columna = cual % 2;
        const fila = Math.floor(cual / 2);

        return (
          <rect
            key={cual}
            x={inicio + columna * lado}
            y={6 + fila * lado}
            width={lado}
            height={lado}
            fill={cual < pintadas ? color : "#ffffff"}
            stroke={color}
            strokeWidth={3}
            style={{ transition: "fill 250ms" }}
          />
        );
      })}

      <text
        x={129}
        y={70}
        fontSize={26}
        fontWeight="bold"
        textAnchor="middle"
        fill={color}
      >
        ½
      </text>
    </svg>
  );
}
