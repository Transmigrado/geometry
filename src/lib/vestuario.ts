/** Las piezas de ropa salen del pack de Unity, agrupadas por slot. */

export const SLOTS = ["Hair", "Headwear", "Top", "Bottom", "Shoes"] as const;

export type Slot = (typeof SLOTS)[number];

/** Qué lleva puesto: una pieza por slot, de qué color, y su tono de piel. */
export type Atuendo = {
  piezas: Partial<Record<Slot, string | null>>;
  /** índice en PIELES; -1 deja el tono con que vino el modelo */
  piel: number;
  /** índice en COLORES_ROPA por slot; sin entrada, el color original */
  colores: Partial<Record<Slot, number>>;
};

export const SIN_COLOR = -1;

export const NOMBRE_SLOT: Record<Slot, string> = {
  Hair: "Pelo",
  Headwear: "Gorro",
  Top: "Polera",
  Bottom: "Pantalón",
  Shoes: "Zapatos",
};

/** Todo el avatar vive en un archivo: cuerpo, ropa, esqueleto y animación. */
export const AVATAR = "/avatar/modelos/avatar.glb";
export const PALETA = "/avatar/modelos/paleta.png";
export const CUERPO = "Cuerpo";

/** La polera y el pantalón no se pueden sacar: nadie anda desnudo. */
export const OBLIGATORIOS: Slot[] = ["Top", "Bottom"];

/** Con lo puesto arranca quien nunca guardó nada. */
export const ATUENDO_INICIAL: Atuendo = {
  piezas: { Top: "Top_Basic", Bottom: "Bottom_Basic" },
  piel: SIN_COLOR,
  colores: {},
};

/** El icono se llama igual que la pieza, que por eso no necesita catálogo. */
export function iconoDe(pieza: string) {
  return `/avatar/iconos/${pieza}.png`;
}

/**
 * El atuendo guardado va en inglés, como el resto de la base. Los nombres
 * de los slots no se traducen: son los del pack, y con ellos se llaman
 * también las mallas y los iconos.
 */
type Guardado = {
  pieces?: Partial<Record<Slot, string | null>>;
  skin?: number;
  colors?: Partial<Record<Slot, number>>;
};

export function comoJson(atuendo: Atuendo): string {
  const guardado: Guardado = {
    pieces: atuendo.piezas,
    skin: atuendo.piel,
    colors: atuendo.colores,
  };

  return JSON.stringify(guardado);
}

/** Lee el atuendo guardado sin confiar en lo que venga. */
export function atuendoDe(json: string | null): Atuendo {
  if (!json) return ATUENDO_INICIAL;

  try {
    const leido = JSON.parse(json);

    // los perfiles de antes de la convención lo guardaban en español, y
    // envuelto en un «atuendo»; se leen para no hacerles rehacer el avatar
    const guardado: Guardado = leido?.pieces
      ? leido
      : {
          pieces: leido?.atuendo?.piezas,
          skin: leido?.atuendo?.piel,
          colors: leido?.atuendo?.colores,
        };

    const piezas: Atuendo["piezas"] = {};
    const colores: Atuendo["colores"] = {};

    for (const slot of SLOTS) {
      const pieza = guardado.pieces?.[slot];
      if (typeof pieza === "string" || pieza === null) piezas[slot] = pieza;

      const color = guardado.colors?.[slot];
      if (Number.isInteger(color)) colores[slot] = color;
    }

    return {
      piezas: { ...ATUENDO_INICIAL.piezas, ...piezas },
      piel: Number.isInteger(guardado.skin) ? guardado.skin! : SIN_COLOR,
      colores,
    };
  } catch {
    return ATUENDO_INICIAL;
  }
}
