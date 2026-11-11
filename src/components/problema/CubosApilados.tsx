"use client";

import type { ConteoVolumen } from "@/lib/problema";

type Props = {
  conteo: ConteoVolumen;
  /** cuántas capas se muestran (para contar de a poco) */
  capas: number;
  /** lado del cubito en píxeles, igual en todas las figuras que se comparan */
  lado: number;
  color: string;
};

const COS30 = Math.cos(Math.PI / 6);

/** Aclara u oscurece el color sin transparencia, para que no se vea a través. */
function tono(hex: string, factor: number) {
  const entero = parseInt(hex.slice(1), 16);
  const canal = (desplazamiento: number) =>
    Math.round(Math.min(255, ((entero >> desplazamiento) & 255) * factor));

  return `rgb(${canal(16)}, ${canal(8)}, ${canal(0)})`;
}

/** Dibuja los cubitos que caben dentro de la caja, en vista isométrica. */
export function CubosApilados({ conteo, capas, lado, color }: Props) {
  const { enLargo, enAncho, enAlto } = conteo;
  const dx = lado * COS30;
  const dy = lado / 2;
  const visibles = Math.min(capas, enAlto);

  const cubos = [];
  for (let k = 0; k < visibles; k += 1) {
    for (let i = 0; i < enLargo; i += 1) {
      for (let j = 0; j < enAncho; j += 1) {
        // en isometría los cubos de una misma diagonal nunca se tapan entre sí
        cubos.push({ i, j, k, profundidad: i + j + k });
      }
    }
  }
  cubos.sort((a, b) => a.profundidad - b.profundidad);

  const minX = -enAncho * dx;
  const maxX = enLargo * dx;
  const minY = -(enAlto - 1) * lado - dy;
  const maxY = (enLargo + enAncho - 2) * dy + dy + lado;
  const margen = 4;
  const ancho = maxX - minX + margen * 2;
  const alto = maxY - minY + margen * 2;

  const caras = [tono(color, 1), tono(color, 0.82), tono(color, 0.64)];

  return (
    <svg
      viewBox={`${minX - margen} ${minY - margen} ${ancho} ${alto}`}
      width={ancho}
      height={alto}
      className="mx-auto shrink-0"
      role="presentation"
      aria-hidden="true"
    >
      {cubos.map(({ i, j, k }) => {
        const cx = (i - j) * dx;
        const cy = (i + j) * dy - k * lado;

        return (
          <g key={`${i}-${j}-${k}`} stroke="rgba(15,23,42,.45)" strokeWidth={0.8}>
            <polygon
              points={`${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${
                cx - dx
              },${cy}`}
              fill={caras[0]}
            />
            <polygon
              points={`${cx - dx},${cy} ${cx},${cy + dy} ${cx},${
                cy + dy + lado
              } ${cx - dx},${cy + lado}`}
              fill={caras[1]}
            />
            <polygon
              points={`${cx},${cy + dy} ${cx + dx},${cy} ${cx + dx},${
                cy + lado
              } ${cx},${cy + dy + lado}`}
              fill={caras[2]}
            />
          </g>
        );
      })}
    </svg>
  );
}
