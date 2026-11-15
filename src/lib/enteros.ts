/**
 * Suma de números enteros contada con un auto en una recta numérica: avanza
 * a la derecha con los números positivos y retrocede con los negativos.
 */

export type Ejercicio = {
  a: number;
  b: number;
  resultado: number;
  opciones: number[];
};

const VALOR_MIN = 1;
const VALOR_MAX = 9;

/** El auto nunca debería salirse de la recta que se dibuja. */
export const LIMITE_RECTA = 12;

/**
 * El primero es siempre el mismo para que el dibujo no cambie entre el
 * servidor y el navegador; los siguientes ya salen al azar.
 */
export const PRIMER_EJERCICIO: Ejercicio = {
  a: 5,
  b: -8,
  resultado: -3,
  opciones: [-3, 13, 3, -13],
};

export function nuevoEjercicio(): Ejercicio {
  const a = conSigno(azar(VALOR_MIN, VALOR_MAX));
  let b = conSigno(azar(VALOR_MIN, VALOR_MAX));
  while (Math.abs(a + b) > LIMITE_RECTA - 2) {
    b = conSigno(azar(VALOR_MIN, VALOR_MAX));
  }
  const resultado = a + b;

  return { a, b, resultado, opciones: opcionesPara(a, b, resultado) };
}

/** «5 + (-8)»: con paréntesis en el negativo para que no se lea como resta. */
export function textoSuma(a: number, b: number) {
  return `${a} + ${b < 0 ? `(${b})` : b}`;
}

/**
 * Las opciones equivocadas son los errores que de verdad comete un niño:
 * ignorar el signo y sumar como si todo fuera positivo, restar en vez de
 * sumar, o invertir el signo del resultado.
 */
function opcionesPara(a: number, b: number, resultado: number) {
  const candidatos = [
    Math.abs(a) + Math.abs(b),
    a - b,
    b - a,
    -resultado,
    resultado + 1,
    resultado - 1,
  ];

  const otros = mezclar([
    ...new Set(candidatos.filter((valor) => valor !== resultado)),
  ]);

  return mezclar([resultado, ...otros.slice(0, 3)]);
}

function conSigno(valor: number) {
  return Math.random() < 0.5 ? valor : -valor;
}

function azar(desde: number, hasta: number) {
  return desde + Math.floor(Math.random() * (hasta - desde + 1));
}

function mezclar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
