/** Las piezas de ropa salen del pack de Unity, agrupadas por slot. */

export const SLOTS = ["Hair", "Headwear", "Top", "Bottom", "Shoes"] as const;

export type Slot = (typeof SLOTS)[number];

/** Qué lleva puesto: una pieza por slot, o nada. */
export type Atuendo = Partial<Record<Slot, string | null>>;

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
  Top: "Top_Basic",
  Bottom: "Bottom_Basic",
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
    const datos = JSON.parse(json);
    const guardado = datos?.atuendo ?? {};
    const atuendo: Atuendo = {};

    for (const slot of SLOTS) {
      const pieza = guardado[slot];
      if (typeof pieza === "string") atuendo[slot] = pieza;
    }

    return { ...ATUENDO_INICIAL, ...atuendo };
  } catch {
    return ATUENDO_INICIAL;
  }
}
