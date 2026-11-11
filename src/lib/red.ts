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

/** Un trozo plano del cuerpo abierto, con el área que le toca cubrir. */
export type Pieza =
  | {
      forma: "rect";
      x: number;
      y: number;
      ancho: number;
      alto: number;
      area: number;
    }
  | { forma: "circulo"; cx: number; cy: number; radio: number; area: number };

export type RedPlana = { ancho: number; alto: number; piezas: Pieza[] };

/** La caja abierta en T: sus seis caras, en el orden en que las contamos. */
export function piezasDeCaja(medidas: Medidas): RedPlana {
  const red = redDeCaja(medidas);

  return {
    ancho: red.ancho,
    alto: red.alto,
    piezas: red.caras.map((cara) => ({
      forma: "rect",
      x: cara.x,
      y: cara.y,
      ancho: cara.ancho,
      alto: cara.alto,
      area: cara.ancho * cara.alto,
    })),
  };
}

/** El cilindro abierto: la tapa, la pared desenrollada y la base. */
export function piezasDeCilindro(radio: number, altura: number): RedPlana {
  const contorno = 2 * Math.PI * radio;
  const areaTapa = Math.PI * radio ** 2;

  return {
    ancho: contorno,
    alto: altura + 4 * radio,
    piezas: [
      { forma: "circulo", cx: contorno / 2, cy: radio, radio, area: areaTapa },
      {
        forma: "rect",
        x: 0,
        y: 2 * radio,
        ancho: contorno,
        alto: altura,
        area: contorno * altura,
      },
      {
        forma: "circulo",
        cx: contorno / 2,
        cy: 3 * radio + altura,
        radio,
        area: areaTapa,
      },
    ],
  };
}

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
