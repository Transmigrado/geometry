"use client";

import { tono } from "@/lib/color";

const COS30 = Math.cos(Math.PI / 6);

/** Dónde cae en pantalla el cubito que está en la fila i, columna j y piso k. */
export function posicionIso(i: number, j: number, k: number, lado: number) {
  return {
    cx: (i - j) * lado * COS30,
    cy: (i + j) * (lado / 2) - k * lado,
  };
}

/** Las tres caras que se ven de un cubo, como puntos de polígono. */
export function carasIso(cx: number, cy: number, lado: number) {
  const dx = lado * COS30;
  const dy = lado / 2;

  return {
    arriba: `${cx},${cy - dy} ${cx + dx},${cy} ${cx},${cy + dy} ${cx - dx},${cy}`,
    izquierda: `${cx - dx},${cy} ${cx},${cy + dy} ${cx},${cy + dy + lado} ${
      cx - dx
    },${cy + lado}`,
    derecha: `${cx},${cy + dy} ${cx + dx},${cy} ${cx + dx},${cy + lado} ${cx},${
      cy + dy + lado
    }`,
  };
}

/** El rectángulo que ocupa un bloque de nx × ny × nz cubitos. */
export function limitesIso(
  nx: number,
  ny: number,
  nz: number,
  lado: number,
) {
  const dx = lado * COS30;
  const dy = lado / 2;

  return {
    minX: -ny * dx,
    maxX: nx * dx,
    minY: -(nz - 1) * lado - dy,
    maxY: (nx + ny - 2) * dy + dy + lado,
  };
}

function entre(uno: number[], otro: number[], parte: number) {
  return [
    uno[0] + (otro[0] - uno[0]) * parte,
    uno[1] + (otro[1] - uno[1]) * parte,
  ];
}

/** Un cubo grande con sus caras divididas en cubitos, sin dibujarlos todos. */
export function CuboCuadriculado({
  cx,
  cy,
  lado,
  divisiones,
  color,
}: {
  cx: number;
  cy: number;
  lado: number;
  divisiones: number;
  color: string;
}) {
  const caras = carasIso(cx, cy, lado);
  const dx = lado * COS30;
  const dy = lado / 2;

  const arriba = [cx, cy - dy];
  const derecha = [cx + dx, cy];
  const abajo = [cx, cy + dy];
  const izquierda = [cx - dx, cy];
  const abajoBajo = [cx, cy + dy + lado];
  const izquierdaBajo = [cx - dx, cy + lado];
  const derechaBajo = [cx + dx, cy + lado];

  const lineas = [];
  for (let paso = 1; paso < divisiones; paso += 1) {
    const parte = paso / divisiones;
    lineas.push(
      [entre(arriba, izquierda, parte), entre(derecha, abajo, parte)],
      [entre(arriba, derecha, parte), entre(izquierda, abajo, parte)],
      [entre(izquierda, abajo, parte), entre(izquierdaBajo, abajoBajo, parte)],
      [entre(izquierda, izquierdaBajo, parte), entre(abajo, abajoBajo, parte)],
      [entre(abajo, derecha, parte), entre(abajoBajo, derechaBajo, parte)],
      [entre(abajo, abajoBajo, parte), entre(derecha, derechaBajo, parte)],
    );
  }

  return (
    <g>
      <polygon points={caras.arriba} fill={tono(color, 1)} />
      <polygon points={caras.izquierda} fill={tono(color, 0.82)} />
      <polygon points={caras.derecha} fill={tono(color, 0.64)} />
      {lineas.map(([desde, hasta], indice) => (
        <line
          key={indice}
          x1={desde[0]}
          y1={desde[1]}
          x2={hasta[0]}
          y2={hasta[1]}
          stroke="rgba(255,255,255,.55)"
          strokeWidth={0.8}
        />
      ))}
      <polygon points={caras.arriba} fill="none" stroke="rgba(15,23,42,.5)" />
      <polygon points={caras.izquierda} fill="none" stroke="rgba(15,23,42,.5)" />
      <polygon points={caras.derecha} fill="none" stroke="rgba(15,23,42,.5)" />
    </g>
  );
}

export function CuboIso({
  cx,
  cy,
  lado,
  color,
  opacidad = 1,
}: {
  cx: number;
  cy: number;
  lado: number;
  color: string;
  opacidad?: number;
}) {
  const caras = carasIso(cx, cy, lado);

  return (
    <g
      stroke="rgba(15,23,42,.45)"
      strokeWidth={0.8}
      opacity={opacidad}
      // los tonos son opacos para que no se vean los cubos de adentro
    >
      <polygon points={caras.arriba} fill={tono(color, 1)} />
      <polygon points={caras.izquierda} fill={tono(color, 0.82)} />
      <polygon points={caras.derecha} fill={tono(color, 0.64)} />
    </g>
  );
}
