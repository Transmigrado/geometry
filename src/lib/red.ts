/** La caja abierta en forma de T, en coordenadas planas. */

import { conteoSuperficie, type IdCara, type Medidas } from "./problema";

type Posicion = { x: number; y: number };

function posiciones({ largo, ancho, alto }: Medidas): Record<IdCara, Posicion> {
  return {
    tapa: { x: alto, y: 0 },
    trasera: { x: alto, y: ancho },
    base: { x: alto, y: ancho + alto },
    izquierda: { x: 0, y: ancho + alto },
    derecha: { x: alto + largo, y: ancho + alto },
    frontal: { x: alto, y: 2 * ancho + alto },
  };
}

export type CaraEnRed = Posicion & {
  id: IdCara;
  nombre: string;
  ancho: number;
  alto: number;
};

export function redDeCaja(medidas: Medidas) {
  const donde = posiciones(medidas);

  return {
    ancho: medidas.largo + 2 * medidas.alto,
    alto: 2 * medidas.ancho + 2 * medidas.alto,
    caras: conteoSuperficie(medidas, 1).porCara.map(
      (cara): CaraEnRed => ({
        id: cara.id,
        nombre: cara.nombre,
        ancho: cara.ancho,
        alto: cara.alto,
        ...donde[cara.id],
      }),
    ),
  };
}

/**
 * Dónde va cada cuadrado, en el mismo orden en que los numeramos al
 * desarmar la caja.
 */
export function cuadradosDeRed(medidas: Medidas, unidad: number): Posicion[] {
  const donde = posiciones(medidas);

  return conteoSuperficie(medidas, unidad).porCara.flatMap((cara) =>
    Array.from({ length: cara.filas }, (_, fila) =>
      Array.from({ length: cara.columnas }, (_, columna) => ({
        x: donde[cara.id].x + columna * unidad,
        y: donde[cara.id].y + fila * unidad,
      })),
    ).flat(),
  );
}
