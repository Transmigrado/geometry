/**
 * Identificar fracciones pintando partes de una figura.
 *
 * La idea del módulo cabe en una frase: **las piezas no siempre valen lo
 * mismo**. Un cuadrado partido en tres franjas, con una de ellas partida
 * por la mitad, tiene piezas de 1/3 y piezas de 1/6; para pintar 1/2 hay
 * que elegir una franja entera y una mitad. Contar piezas no sirve: hay
 * que mirar cuánto ocupa cada una.
 *
 * Por eso todo se lleva con fracciones exactas y no con decimales: 1/3 no
 * existe en coma flotante, y «¿esto suma justo un medio?» tiene que ser
 * una pregunta con respuesta exacta.
 */

export type Fraccion = { numerador: number; denominador: number };

export type Figura = "cuadrado" | "circulo" | "triangulo";

export type Pieza = {
  id: string;
  /** qué parte del total vale esta pieza */
  valor: Fraccion;
  /** su contorno, listo para pintar */
  camino: string;
};

export type Ejercicio = {
  figura: Figura;
  piezas: Pieza[];
  objetivo: Fraccion;
  /** si las piezas valen distinto, que es lo que lo hace difícil */
  mezclado: boolean;
};

// ───────────────────────── fracciones ─────────────────────────

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

export function simplificar({ numerador, denominador }: Fraccion): Fraccion {
  const comun = mcd(Math.abs(numerador), Math.abs(denominador)) || 1;
  return { numerador: numerador / comun, denominador: denominador / comun };
}

export function sumar(una: Fraccion, otra: Fraccion): Fraccion {
  return simplificar({
    numerador:
      una.numerador * otra.denominador + otra.numerador * una.denominador,
    denominador: una.denominador * otra.denominador,
  });
}

export function restar(una: Fraccion, otra: Fraccion): Fraccion {
  return simplificar({
    numerador:
      una.numerador * otra.denominador - otra.numerador * una.denominador,
    denominador: una.denominador * otra.denominador,
  });
}

export function iguales(una: Fraccion, otra: Fraccion) {
  const a = simplificar(una);
  const b = simplificar(otra);
  return a.numerador === b.numerador && a.denominador === b.denominador;
}

export function comoTexto({ numerador, denominador }: Fraccion) {
  return `${numerador}/${denominador}`;
}

const NADA: Fraccion = { numerador: 0, denominador: 1 };

export function cuantoSuman(piezas: Pieza[]): Fraccion {
  return piezas.reduce((total, pieza) => sumar(total, pieza.valor), NADA);
}

export type Operacion = "suma" | "resta";

export type EjercicioOperacion = {
  operacion: Operacion;
  figura: Figura;
  primera: Fraccion;
  segunda: Fraccion;
  objetivo: Fraccion;
};

/** Crea una suma o resta que se puede resolver con hasta doce partes. */
export function nuevoEjercicioOperacion(operacion: Operacion): EjercicioOperacion {
  const denominadores = [2, 3, 4, 6];

  for (let intento = 0; intento < 100; intento += 1) {
    let primera = fraccionPropia(denominadores[azar(denominadores.length)]);
    let segunda = fraccionPropia(denominadores[azar(denominadores.length)]);

    if (operacion === "resta" && primera.numerador * segunda.denominador < segunda.numerador * primera.denominador) {
      [primera, segunda] = [segunda, primera];
    }

    const objetivo = operacion === "suma" ? sumar(primera, segunda) : restar(primera, segunda);
    // Evitamos 0 y 1: la figura debe mostrar una cantidad no trivial.
    if (objetivo.numerador <= 0 || objetivo.numerador >= objetivo.denominador) continue;

    return {
      operacion,
      figura: azar(2) === 0 ? "cuadrado" : "circulo",
      primera,
      segunda,
      objetivo,
    };
  }

  // Siempre existe una operación propia y fácil como plan alternativo.
  return operacion === "suma"
    ? {
        operacion,
        figura: "cuadrado",
        primera: { numerador: 1, denominador: 4 },
        segunda: { numerador: 1, denominador: 4 },
        objetivo: { numerador: 1, denominador: 2 },
      }
    : {
        operacion,
        figura: "cuadrado",
        primera: { numerador: 3, denominador: 4 },
        segunda: { numerador: 1, denominador: 4 },
        objetivo: { numerador: 1, denominador: 2 },
      };
}

function fraccionPropia(denominador: number): Fraccion {
  return {
    numerador: 1 + azar(denominador - 1),
    denominador,
  };
}

/** Una partición visual de partes iguales, usada por los tres juegos. */
export function partirFigura(figura: Figura, cuantas: number): Pieza[] {
  const total = Math.max(1, Math.min(12, Math.floor(cuantas)));
  let reparto: Reparto;
  if (figura === "circulo") {
    reparto = total === 1
      ? {
          figura,
          piezas: [
            pieza(
              `M ${CENTRO[0] + RADIO},${CENTRO[1]} A ${RADIO},${RADIO} 0 1,1 ${CENTRO[0] - RADIO},${CENTRO[1]} A ${RADIO},${RADIO} 0 1,1 ${CENTRO[0] + RADIO},${CENTRO[1]} Z`,
              1,
              1,
            ),
          ],
        }
      : porciones(total);
  } else if (figura === "triangulo") {
    if (total === 1) {
      reparto = {
        figura,
        piezas: [pieza(poligono([PICO, PIE_IZQ, PIE_DER]), 1, 1)],
      };
    } else if (total === 2) reparto = dosTriangulos();
    else if (total === 3) reparto = tresTriangulos();
    else if (total === 4) reparto = cuatroTriangulos();
    else if (total === 8) reparto = ochoTriangulos();
    else if (total === 6 || total === 9 || total === 12) {
      reparto = triangulosEnTresPartes(total / 3);
    } else {
      reparto = franjas(total, false);
    }
  } else {
    reparto = franjas(total, false);
  }

  return reparto.piezas.map((suya, i) => ({ ...suya, id: `p${i}` }));
}

/**
 * La figura del apoyo subdividida en unidades del tamaño de la pieza menor,
 * conservando el patrón del ejercicio original.
 */
export function unidadesDeEjercicio(ejercicio: Ejercicio): Pieza[] {
  const denominadorMenor = Math.max(
    ...ejercicio.piezas.map((pieza) => pieza.valor.denominador),
  );
  const mismaDivision = ejercicio.piezas.every(
    (pieza) => pieza.valor.denominador === denominadorMenor,
  );
  if (mismaDivision) return ejercicio.piezas;

  let reparto: Reparto;
  if (ejercicio.figura === "cuadrado") {
    // Rejilla 2×2 con la última celda partida: al convertir cada celda en
    // dos unidades iguales, queda una rejilla de dos filas y cuatro columnas.
    if (denominadorMenor === 8 && ejercicio.piezas.length === 5) {
      reparto = rejilla(2, 4);
    } else {
      // Franjas verticales, con la última dividida arriba y abajo.
      reparto = rejilla(2, denominadorMenor / 2);
    }
  } else if (ejercicio.figura === "circulo") {
    reparto = porciones(denominadorMenor);
  } else {
    reparto = ochoTriangulos();
  }

  return reparto.piezas.map((suya, i) => ({ ...suya, id: `p${i}` }));
}

// ───────────────────────── dibujo ─────────────────────────

const LADO = 200;
const MARGEN = 12;
const DENTRO = LADO - MARGEN * 2;

type Punto = [number, number];

function poligono(puntos: Punto[]): string {
  const [primero, ...resto] = puntos;
  return (
    `M ${primero[0].toFixed(2)},${primero[1].toFixed(2)} ` +
    resto.map(([x, y]) => `L ${x.toFixed(2)},${y.toFixed(2)}`).join(" ") +
    " Z"
  );
}

function rectangulo(x: number, y: number, ancho: number, alto: number) {
  return poligono([
    [x, y],
    [x + ancho, y],
    [x + ancho, y + alto],
    [x, y + alto],
  ]);
}

const CENTRO: Punto = [LADO / 2, LADO / 2];
const RADIO = DENTRO / 2;

/** Un trozo de tarta, entre dos ángulos. */
function sector(desde: number, hasta: number): string {
  const borde = (angulo: number): Punto => [
    CENTRO[0] + RADIO * Math.cos(angulo),
    CENTRO[1] + RADIO * Math.sin(angulo),
  ];

  const [x1, y1] = borde(desde);
  const [x2, y2] = borde(hasta);
  const grande = hasta - desde > Math.PI ? 1 : 0;

  return (
    `M ${CENTRO[0]},${CENTRO[1]} L ${x1.toFixed(2)},${y1.toFixed(2)} ` +
    `A ${RADIO},${RADIO} 0 ${grande},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`
  );
}

const medio = (una: Punto, otra: Punto): Punto => [
  (una[0] + otra[0]) / 2,
  (una[1] + otra[1]) / 2,
];

/** Los tres vértices del triángulo, con el pico arriba. */
const PICO: Punto = [LADO / 2, MARGEN];
const PIE_IZQ: Punto = [MARGEN, LADO - MARGEN];
const PIE_DER: Punto = [LADO - MARGEN, LADO - MARGEN];

// ───────────────────────── repartos ─────────────────────────

/**
 * Un reparto es una lista de piezas. Las mezclas —una pieza partida en
 * dos— se escriben a mano en vez de cortar polígonos genéricos: son pocas
 * y así cada una sale exactamente como se quiere ver.
 */
type Reparto = { figura: Figura; piezas: Omit<Pieza, "id">[] };

function pieza(camino: string, numerador: number, denominador: number) {
  return { camino, valor: { numerador, denominador } };
}

/** El cuadrado en franjas, de pie o tumbadas. */
function franjas(cuantas: number, tumbadas: boolean): Reparto {
  const paso = DENTRO / cuantas;

  return {
    figura: "cuadrado",
    piezas: Array.from({ length: cuantas }, (_, i) =>
      pieza(
        tumbadas
          ? rectangulo(MARGEN, MARGEN + i * paso, DENTRO, paso)
          : rectangulo(MARGEN + i * paso, MARGEN, paso, DENTRO),
        1,
        cuantas,
      ),
    ),
  };
}

/** El cuadrado en cuadraditos. */
function rejilla(filas: number, columnas: number): Reparto {
  const ancho = DENTRO / columnas;
  const alto = DENTRO / filas;

  return {
    figura: "cuadrado",
    piezas: Array.from({ length: filas * columnas }, (_, i) =>
      pieza(
        rectangulo(
          MARGEN + (i % columnas) * ancho,
          MARGEN + Math.floor(i / columnas) * alto,
          ancho,
          alto,
        ),
        1,
        filas * columnas,
      ),
    ),
  };
}

/**
 * Franjas, con la última partida por la mitad a lo ancho. Es el reparto
 * que de verdad obliga a pensar: quedan piezas de dos tamaños.
 */
function franjasConUnaPartida(cuantas: number): Reparto {
  const paso = DENTRO / cuantas;
  const enteras = Array.from({ length: cuantas - 1 }, (_, i) =>
    pieza(rectangulo(MARGEN + i * paso, MARGEN, paso, DENTRO), 1, cuantas),
  );

  const x = MARGEN + (cuantas - 1) * paso;

  return {
    figura: "cuadrado",
    piezas: [
      ...enteras,
      pieza(rectangulo(x, MARGEN, paso, DENTRO / 2), 1, cuantas * 2),
      pieza(rectangulo(x, MARGEN + DENTRO / 2, paso, DENTRO / 2), 1, cuantas * 2),
    ],
  };
}

/** La rejilla con un cuadradito partido en dos. */
function rejillaConUnaPartida(filas: number, columnas: number): Reparto {
  const ancho = DENTRO / columnas;
  const alto = DENTRO / filas;
  const total = filas * columnas;

  const enteros = Array.from({ length: total - 1 }, (_, i) =>
    pieza(
      rectangulo(
        MARGEN + (i % columnas) * ancho,
        MARGEN + Math.floor(i / columnas) * alto,
        ancho,
        alto,
      ),
      1,
      total,
    ),
  );

  const x = MARGEN + ((total - 1) % columnas) * ancho;
  const y = MARGEN + Math.floor((total - 1) / columnas) * alto;

  return {
    figura: "cuadrado",
    piezas: [
      ...enteros,
      pieza(rectangulo(x, y, ancho / 2, alto), 1, total * 2),
      pieza(rectangulo(x + ancho / 2, y, ancho / 2, alto), 1, total * 2),
    ],
  };
}

/** La tarta en porciones iguales. */
function porciones(cuantas: number): Reparto {
  const paso = (Math.PI * 2) / cuantas;
  const arranque = -Math.PI / 2;

  return {
    figura: "circulo",
    piezas: Array.from({ length: cuantas }, (_, i) =>
      pieza(sector(arranque + i * paso, arranque + (i + 1) * paso), 1, cuantas),
    ),
  };
}

/** La tarta con una porción partida en dos. */
function porcionesConUnaPartida(cuantas: number): Reparto {
  const paso = (Math.PI * 2) / cuantas;
  const arranque = -Math.PI / 2;

  const enteras = Array.from({ length: cuantas - 1 }, (_, i) =>
    pieza(sector(arranque + i * paso, arranque + (i + 1) * paso), 1, cuantas),
  );

  const desde = arranque + (cuantas - 1) * paso;

  return {
    figura: "circulo",
    piezas: [
      ...enteras,
      pieza(sector(desde, desde + paso / 2), 1, cuantas * 2),
      pieza(sector(desde + paso / 2, desde + paso), 1, cuantas * 2),
    ],
  };
}

/** El triángulo partido en cuatro, uniendo los puntos medios. */
function cuatroTriangulos(): Reparto {
  const a = medio(PICO, PIE_IZQ);
  const b = medio(PICO, PIE_DER);
  const c = medio(PIE_IZQ, PIE_DER);

  return {
    figura: "triangulo",
    piezas: [
      pieza(poligono([PICO, b, a]), 1, 4),
      pieza(poligono([a, c, PIE_IZQ]), 1, 4),
      pieza(poligono([b, PIE_DER, c]), 1, 4),
      // el del medio, que está del revés
      pieza(poligono([a, b, c]), 1, 4),
    ],
  };
}

/** Cuatro triángulos iguales, cada uno partido por la mitad. */
function ochoTriangulos(): Reparto {
  const a = medio(PICO, PIE_IZQ);
  const b = medio(PICO, PIE_DER);
  const c = medio(PIE_IZQ, PIE_DER);
  const triangulos: Punto[][] = [
    [PICO, b, a],
    [a, c, PIE_IZQ],
    [b, PIE_DER, c],
    [a, b, c],
  ];

  return {
    figura: "triangulo",
    piezas: triangulos.flatMap(([punta, uno, otro]) => {
      const mitad = medio(uno, otro);
      return [
        pieza(poligono([punta, uno, mitad]), 1, 8),
        pieza(poligono([punta, mitad, otro]), 1, 8),
      ];
    }),
  };
}

/** Divide cada uno de los tres sectores iguales del triángulo en partes iguales. */
function triangulosEnTresPartes(cuantas: number): Reparto {
  const centro: Punto = [
    (PICO[0] + PIE_IZQ[0] + PIE_DER[0]) / 3,
    (PICO[1] + PIE_IZQ[1] + PIE_DER[1]) / 3,
  ];
  const triangulos: Punto[][] = [
    [centro, PICO, PIE_DER],
    [centro, PIE_DER, PIE_IZQ],
    [centro, PIE_IZQ, PICO],
  ];

  return {
    figura: "triangulo",
    piezas: triangulos.flatMap(([punta, uno, otro]) =>
      Array.from({ length: cuantas }, (_, i) => {
        const inicio: Punto = [
          uno[0] + ((otro[0] - uno[0]) * i) / cuantas,
          uno[1] + ((otro[1] - uno[1]) * i) / cuantas,
        ];
        const fin: Punto = [
          uno[0] + ((otro[0] - uno[0]) * (i + 1)) / cuantas,
          uno[1] + ((otro[1] - uno[1]) * (i + 1)) / cuantas,
        ];
        return pieza(poligono([punta, inicio, fin]), 1, cuantas * 3);
      }),
    ),
  };
}

/** Los mismos cuatro, con el de la punta partido en dos. */
function cuatroTriangulosConUnoPartido(): Reparto {
  const a = medio(PICO, PIE_IZQ);
  const b = medio(PICO, PIE_DER);
  const c = medio(PIE_IZQ, PIE_DER);
  const partido = medio(a, b);

  return {
    figura: "triangulo",
    piezas: [
      pieza(poligono([a, c, PIE_IZQ]), 1, 4),
      pieza(poligono([b, PIE_DER, c]), 1, 4),
      pieza(poligono([a, b, c]), 1, 4),
      pieza(poligono([PICO, partido, a]), 1, 8),
      pieza(poligono([PICO, b, partido]), 1, 8),
    ],
  };
}

/** El triángulo partido en dos por la mitad de la base. */
function dosTriangulos(): Reparto {
  const base = medio(PIE_IZQ, PIE_DER);

  return {
    figura: "triangulo",
    piezas: [
      pieza(poligono([PICO, base, PIE_IZQ]), 1, 2),
      pieza(poligono([PICO, PIE_DER, base]), 1, 2),
    ],
  };
}

/** El triángulo en tres, desde el centro a cada vértice. */
function tresTriangulos(): Reparto {
  const centro: Punto = [
    (PICO[0] + PIE_IZQ[0] + PIE_DER[0]) / 3,
    (PICO[1] + PIE_IZQ[1] + PIE_DER[1]) / 3,
  ];

  return {
    figura: "triangulo",
    piezas: [
      pieza(poligono([centro, PICO, PIE_DER]), 1, 3),
      pieza(poligono([centro, PIE_DER, PIE_IZQ]), 1, 3),
      pieza(poligono([centro, PIE_IZQ, PICO]), 1, 3),
    ],
  };
}

/**
 * Todos los repartos. Los mezclados —los que tienen piezas de dos
 * tamaños— van marcados porque son los que de verdad enseñan: en los
 * demás basta con contar.
 */
const REPARTOS: { hacer: () => Reparto; mezclado: boolean }[] = [
  { hacer: () => franjas(2, false), mezclado: false },
  { hacer: () => franjas(3, false), mezclado: false },
  { hacer: () => franjas(4, true), mezclado: false },
  { hacer: () => rejilla(2, 2), mezclado: false },
  { hacer: () => rejilla(2, 3), mezclado: false },
  { hacer: () => rejilla(3, 3), mezclado: false },
  { hacer: () => porciones(2), mezclado: false },
  { hacer: () => porciones(3), mezclado: false },
  { hacer: () => porciones(4), mezclado: false },
  { hacer: () => porciones(6), mezclado: false },
  { hacer: () => porciones(8), mezclado: false },
  { hacer: () => dosTriangulos(), mezclado: false },
  { hacer: () => tresTriangulos(), mezclado: false },
  { hacer: () => cuatroTriangulos(), mezclado: false },

  { hacer: () => franjasConUnaPartida(3), mezclado: true },
  { hacer: () => franjasConUnaPartida(2), mezclado: true },
  { hacer: () => rejillaConUnaPartida(2, 2), mezclado: true },
  { hacer: () => porcionesConUnaPartida(4), mezclado: true },
  { hacer: () => porcionesConUnaPartida(3), mezclado: true },
  { hacer: () => cuatroTriangulosConUnoPartido(), mezclado: true },
];

// ───────────────────────── el ejercicio ─────────────────────────

/**
 * Todo lo que se puede pintar con esas piezas. Son pocas —nueve como
 * mucho— así que probar todas las combinaciones es instantáneo, y de paso
 * garantiza que lo que se pregunta tiene solución.
 */
function loQueSePuedePintar(piezas: Pieza[]): Fraccion[] {
  const vistos = new Map<string, Fraccion>();

  for (let combinacion = 1; combinacion < 2 ** piezas.length; combinacion += 1) {
    const elegidas = piezas.filter((_, i) => combinacion & (1 << i));
    const suma = cuantoSuman(elegidas);

    // el total no se pregunta: pintarlo entero no demuestra nada
    if (suma.numerador === suma.denominador) continue;

    vistos.set(comoTexto(suma), suma);
  }

  return [...vistos.values()];
}

/**
 * Las fracciones que un niño reconoce de entrada. Se prefieren para
 * preguntar: «pinta 1/2» enseña más que «pinta 5/9».
 */
const BONITAS = ["1/2", "1/3", "2/3", "1/4", "3/4", "1/6", "2/6", "5/6", "1/8", "3/8"];

function azar(hasta: number) {
  return Math.floor(Math.random() * hasta);
}

export function nuevoEjercicio(): Ejercicio {
  // dos de cada tres veces, uno de los que tienen piezas de distinto
  // tamaño: son los que obligan a mirar y no a contar
  const quiereMezclado = Math.random() < 0.66;
  const candidatos = REPARTOS.filter((cual) => cual.mezclado === quiereMezclado);
  const reparto = candidatos[azar(candidatos.length)].hacer();

  const piezas = reparto.piezas.map((suya, i) => ({ ...suya, id: `p${i}` }));

  const posibles = loQueSePuedePintar(piezas);
  const bonitas = posibles.filter((cual) => BONITAS.includes(comoTexto(cual)));
  const entre = bonitas.length ? bonitas : posibles;

  return {
    figura: reparto.figura,
    piezas,
    objetivo: entre[azar(entre.length)],
    mezclado: quiereMezclado,
  };
}

/** El primero es siempre el mismo, para que la pantalla no baile al cargar. */
export const PRIMER_EJERCICIO: Ejercicio = (() => {
  const reparto = franjasConUnaPartida(3);
  const piezas = reparto.piezas.map((suya, i) => ({ ...suya, id: `p${i}` }));

  return {
    figura: reparto.figura,
    piezas,
    objetivo: { numerador: 1, denominador: 2 },
    mezclado: true,
  };
})();
