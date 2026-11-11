/** Conteo de cuadrados y cubitos para los cuerpos con caras planas. */

export type Medidas = {
  largo: number;
  ancho: number;
  alto: number;
};

export const MEDIDA_MIN = 1;
export const MEDIDA_MAX = 12;

export function limitar(valor: number, min: number, max: number) {
  if (Number.isNaN(valor)) return min;
  return Math.min(max, Math.max(min, Math.round(valor)));
}

export type IdCara =
  | "base"
  | "tapa"
  | "frontal"
  | "trasera"
  | "izquierda"
  | "derecha";

export type Cara = {
  id: IdCara;
  nombre: string;
  /** versión corta, para que quepa dibujada dentro de la cara */
  corto: string;
  ancho: number;
  alto: number;
};

/**
 * Las 6 caras tal como quedan al abrir la caja en forma de T:
 * la tapa arriba, luego la cara de atrás, la base al centro con una cara a
 * cada lado, y el frente abajo.
 */
export function carasDe({ largo, ancho, alto }: Medidas): Cara[] {
  return [
    { id: "base", nombre: "Base", corto: "Base", ancho: largo, alto: ancho },
    { id: "tapa", nombre: "Tapa", corto: "Tapa", ancho: largo, alto: ancho },
    { id: "frontal", nombre: "Frente", corto: "Frente", ancho: largo, alto },
    { id: "trasera", nombre: "Atrás", corto: "Atrás", ancho: largo, alto },
    {
      id: "izquierda",
      nombre: "Izquierda",
      corto: "Izq.",
      ancho: alto,
      alto: ancho,
    },
    { id: "derecha", nombre: "Derecha", corto: "Der.", ancho: alto, alto: ancho },
  ];
}

export type ConteoCara = Cara & {
  columnas: number;
  filas: number;
  cuadrados: number;
  /** false si los cuadrados no caben justos y sobra un trozo de la cara. */
  exacta: boolean;
  /** número del primer cuadrado, para contarlos corridos entre caras. */
  desde: number;
};

export type ConteoSuperficie = {
  porCara: ConteoCara[];
  cuadrados: number;
  exacto: boolean;
};

export function conteoSuperficie(
  medidas: Medidas,
  unidad: number,
): ConteoSuperficie {
  let acumulado = 0;

  const porCara = carasDe(medidas).map((cara) => {
    const columnas = Math.floor(cara.ancho / unidad);
    const filas = Math.floor(cara.alto / unidad);
    const conteo: ConteoCara = {
      ...cara,
      columnas,
      filas,
      cuadrados: columnas * filas,
      exacta: cara.ancho % unidad === 0 && cara.alto % unidad === 0,
      desde: acumulado + 1,
    };
    acumulado += conteo.cuadrados;
    return conteo;
  });

  return {
    porCara,
    cuadrados: acumulado,
    exacto: porCara.every((cara) => cara.exacta),
  };
}

export type ConteoVolumen = {
  enLargo: number;
  enAncho: number;
  enAlto: number;
  cubitos: number;
  exacto: boolean;
};

export function conteoVolumen(medidas: Medidas, unidad: number): ConteoVolumen {
  const { largo, ancho, alto } = medidas;
  const enLargo = Math.floor(largo / unidad);
  const enAncho = Math.floor(ancho / unidad);
  const enAlto = Math.floor(alto / unidad);

  return {
    enLargo,
    enAncho,
    enAlto,
    cubitos: enLargo * enAncho * enAlto,
    exacto: largo % unidad === 0 && ancho % unidad === 0 && alto % unidad === 0,
  };
}

/** 5.666… → "5,67" y 10 → "10". */
export function formatear(valor: number) {
  const redondeado = Math.round(valor * 100) / 100;
  return redondeado.toString().replace(".", ",");
}
