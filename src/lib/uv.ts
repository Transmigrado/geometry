/**
 * El recoloreo del pack: cada trozo del modelo apunta con sus UV a una
 * celda de la paleta, así que cambiar de color es mover esas UV a otra
 * celda. Aquí se replica lo que hace CitizenOutfit en Unity.
 */

import type { BufferGeometry } from "three";
import { GRILLA } from "./paleta";

export type Celda = [number, number];

/** Dentro de la celda se respeta la altura, que es el sombreado; pero no
 * los bordes, porque ahí el color del vecino se cuela. */
const MARGEN = 0.02;

function celdaDe(u: number, v: number): Celda {
  const repetir = (valor: number) => valor - Math.floor(valor);
  return [
    Math.floor(repetir(u) * GRILLA.columnas),
    Math.floor(repetir(v) * GRILLA.filas),
  ];
}

const misma = (una: Celda, otra: Celda) =>
  una[0] === otra[0] && una[1] === otra[1];

/**
 * La celda que más superficie ocupa en la malla: es el color principal de
 * la prenda, el que se cambia. Solo cuentan los triángulos enteros dentro
 * de una celda, para no mezclar los que cruzan de un color a otro.
 */
export function celdaPrincipal(geometria: BufferGeometry): Celda | null {
  const uv = geometria.getAttribute("uv");
  const posicion = geometria.getAttribute("position");
  const indices = geometria.getIndex();
  if (!uv || !posicion || !indices) return null;

  const celdas: Celda[] = [];
  for (let i = 0; i < uv.count; i += 1) {
    celdas.push(celdaDe(uv.getX(i), uv.getY(i)));
  }

  const area = new Map<string, number>();
  for (let t = 0; t + 2 < indices.count; t += 3) {
    const a = indices.getX(t);
    const b = indices.getX(t + 1);
    const c = indices.getX(t + 2);
    if (!misma(celdas[a], celdas[b]) || !misma(celdas[a], celdas[c])) continue;

    const area2 = superficie(posicion, a, b, c);
    const llave = celdas[a].join(",");
    area.set(llave, (area.get(llave) ?? 0) + area2);
  }

  let mayor = -1;
  let principal: Celda | null = null;
  for (const [llave, valor] of area) {
    if (valor > mayor) {
      mayor = valor;
      const [x, y] = llave.split(",").map(Number);
      principal = [x, y];
    }
  }

  return principal;
}

/** El doble del área del triángulo, que basta para comparar entre sí. */
function superficie(
  posicion: { getX: (i: number) => number; getY: (i: number) => number; getZ: (i: number) => number },
  a: number,
  b: number,
  c: number,
) {
  const ux = posicion.getX(b) - posicion.getX(a);
  const uy = posicion.getY(b) - posicion.getY(a);
  const uz = posicion.getZ(b) - posicion.getZ(a);
  const vx = posicion.getX(c) - posicion.getX(a);
  const vy = posicion.getY(c) - posicion.getY(a);
  const vz = posicion.getZ(c) - posicion.getZ(a);

  const x = uy * vz - uz * vy;
  const y = uz * vx - ux * vz;
  const z = ux * vy - uy * vx;

  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Mueve a otra celda las UV que estén en `desde`. Devuelve un arreglo
 * nuevo: la malla original no se toca, porque la comparten todas las
 * piezas iguales.
 */
export function mudarCelda(
  uv: Float32Array,
  cambios: { desde: Celda; hasta: Celda }[],
): Float32Array {
  const movido = Float32Array.from(uv);

  for (let i = 0; i < movido.length; i += 2) {
    const celda = celdaDe(movido[i], movido[i + 1]);
    const cambio = cambios.find((uno) => misma(celda, uno.desde));
    if (!cambio) continue;

    // la altura dentro de la celda se conserva: ahí vive el sombreado
    const dentro = movido[i + 1] * GRILLA.filas - celda[1];
    const alto = Math.min(1 - MARGEN, Math.max(MARGEN, dentro));

    movido[i] = (cambio.hasta[0] + 0.5) / GRILLA.columnas;
    movido[i + 1] = (cambio.hasta[1] + alto) / GRILLA.filas;
  }

  return movido;
}
