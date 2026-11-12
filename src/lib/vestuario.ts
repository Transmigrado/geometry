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

export const CUERPO = "/avatar/modelos/cuerpo.glb";
export const PALETA = "/avatar/modelos/paleta.png";

/** La polera y el pantalón no se pueden sacar: nadie anda desnudo. */
export const OBLIGATORIOS: Slot[] = ["Top", "Bottom"];

/** Con lo puesto arranca quien nunca guardó nada. */
export const ATUENDO_INICIAL: Atuendo = {
  piezas: { Top: "Top_Basic", Bottom: "Bottom_Basic" },
  piel: SIN_COLOR,
  colores: {},
};

export function archivoDe(slot: Slot) {
  return `/avatar/modelos/${slot.toLowerCase()}.glb`;
}

/** El icono se llama igual que la pieza, que por eso no necesita catálogo. */
export function iconoDe(pieza: string) {
  return `/avatar/iconos/${pieza}.png`;
}

/** Lee el atuendo guardado sin confiar en lo que venga. */
export function atuendoDe(json: string | null): Atuendo {
  if (!json) return ATUENDO_INICIAL;

  try {
    const guardado = JSON.parse(json)?.atuendo ?? {};
    const piezas: Atuendo["piezas"] = {};
    const colores: Atuendo["colores"] = {};

    for (const slot of SLOTS) {
      const pieza = guardado.piezas?.[slot];
      if (typeof pieza === "string") piezas[slot] = pieza;

      const color = guardado.colores?.[slot];
      if (Number.isInteger(color)) colores[slot] = color;
    }

    return {
      piezas: { ...ATUENDO_INICIAL.piezas, ...piezas },
      piel: Number.isInteger(guardado.piel) ? guardado.piel : SIN_COLOR,
      colores,
    };
  } catch {
    return ATUENDO_INICIAL;
  }
}
