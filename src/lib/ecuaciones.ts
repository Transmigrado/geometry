/** Ecuaciones de primer grado contadas con una pesa: cantidad × peso = total. */

export type Fruta = {
  nombre: string;
  plural: string;
  emoji: string;
};

export const FRUTAS: Fruta[] = [
  { nombre: "manzana", plural: "manzanas", emoji: "🍎" },
  { nombre: "plátano", plural: "plátanos", emoji: "🍌" },
  { nombre: "pera", plural: "peras", emoji: "🍐" },
  { nombre: "naranja", plural: "naranjas", emoji: "🍊" },
  { nombre: "frutilla", plural: "frutillas", emoji: "🍓" },
  { nombre: "kiwi", plural: "kiwis", emoji: "🥝" },
];

export type Ejercicio = {
  fruta: Fruta;
  cantidad: number;
  /** lo que pesa cada fruta: la incógnita */
  peso: number;
  /** una pesa de peso conocido que acompaña a las frutas; 0 si no hay */
  extra: number;
  /** lo que marca la pesa: cantidad × peso + extra */
  total: number;
  opciones: number[];
};

const PESO_MIN = 2;
const PESO_MAX = 12;
const FRUTAS_MIN = 2;
const FRUTAS_MAX = 6;

/**
 * El primero es siempre el mismo para que el dibujo no cambie entre el
 * servidor y el navegador; los siguientes ya salen al azar.
 */
export const PRIMER_EJERCICIO: Ejercicio = {
  fruta: FRUTAS[0],
  cantidad: 5,
  peso: 8,
  extra: 0,
  total: 40,
  opciones: [9, 35, 8, 7],
};

/** Las pesas de metal vienen en números redondos. */
const PESAS = [5, 10, 15, 20];

export function nuevoEjercicio(conPesa = Math.random() < 0.5): Ejercicio {
  const fruta = FRUTAS[azar(0, FRUTAS.length - 1)];
  const cantidad = azar(FRUTAS_MIN, FRUTAS_MAX);
  const peso = azar(PESO_MIN, PESO_MAX);
  const extra = conPesa ? PESAS[azar(0, PESAS.length - 1)] : 0;
  const total = cantidad * peso + extra;

  return {
    fruta,
    cantidad,
    peso,
    extra,
    total,
    opciones: opcionesPara(cantidad, peso, total, extra),
  };
}

/**
 * Las opciones equivocadas son los errores que de verdad comete un niño:
 * olvidar la pesa, olvidar repartir, o pasarse por poco.
 */
function opcionesPara(
  cantidad: number,
  peso: number,
  total: number,
  extra: number,
) {
  const descuidos =
    extra > 0
      ? [Math.round(total / cantidad), total - extra]
      : [total - cantidad, cantidad];

  const candidatos = [
    ...descuidos,
    peso + 1,
    peso - 1,
    peso + 2,
    peso - 2,
  ];

  const otros = mezclar([
    ...new Set(candidatos.filter((valor) => valor > 0 && valor !== peso)),
  ]);

  return mezclar([peso, ...otros.slice(0, 3)]);
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
