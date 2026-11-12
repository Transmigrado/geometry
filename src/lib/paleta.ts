/** Los colores del pack: cada uno es una celda de la textura paleta. */

export type Color = {
  nombre: string;
  /** columna y fila dentro de la grilla de la paleta */
  celda: [number, number];
  /** el color tal cual, para pintar el botón */
  muestra: string;
};

/** La paleta de 2048×2048 está dividida en esta grilla de celdas. */
export const GRILLA = { columnas: 32, filas: 6 };

export const PIELES: Color[] = [
  { nombre: "Porcelain", celda: [18, 5], muestra: "#fad2b7" },
  { nombre: "Light", celda: [8, 3], muestra: "#f4cda1" },
  { nombre: "Rosy", celda: [24, 0], muestra: "#ce8273" },
  { nombre: "Tan", celda: [2, 4], muestra: "#ed8750" },
  { nombre: "Caramel", celda: [11, 2], muestra: "#a65f2b" },
  { nombre: "Brown", celda: [19, 5], muestra: "#8b5a3a" },
  { nombre: "Deep", celda: [0, 4], muestra: "#665149" },
  { nombre: "Ebony", celda: [17, 2], muestra: "#483633" },
];

export const COLORES_ROPA: Color[] = [
  { nombre: "Coral", celda: [7, 0], muestra: "#e15821" },
  { nombre: "Mustard", celda: [6, 3], muestra: "#854500" },
  { nombre: "Lemon", celda: [5, 3], muestra: "#b4aa10" },
  { nombre: "Leaf", celda: [21, 2], muestra: "#178229" },
  { nombre: "Olive", celda: [22, 2], muestra: "#36330f" },
  { nombre: "Teal", celda: [0, 2], muestra: "#206551" },
  { nombre: "Sky", celda: [23, 0], muestra: "#2ea6d5" },
  { nombre: "Denim", celda: [22, 3], muestra: "#09407c" },
  { nombre: "Lavender", celda: [7, 2], muestra: "#5737aa" },
  { nombre: "Plum", celda: [6, 2], muestra: "#0c1039" },
  { nombre: "Pink", celda: [1, 1], muestra: "#d44f93" },
  { nombre: "Berry", celda: [16, 2], muestra: "#612436" },
  { nombre: "Cocoa", celda: [12, 2], muestra: "#653d2f" },
  { nombre: "Charcoal", celda: [1, 5], muestra: "#0f0f0f" },
  { nombre: "Cream", celda: [4, 4], muestra: "#d4c9bf" },
];

/** Vestidos y overoles: cubren también las piernas, así que no llevan pantalón. */
export const UNA_PIEZA = new Set([
  "Top_AfroFloralCitizen_46",
  "Top_BearCitizen_08",
  "Top_BlondOverallCitizen_39",
  "Top_BraidedCitizen_03",
  "Top_FarmBraidsCitizen_26",
  "Top_ForkliftOperatorCitizen_55",
  "Top_LocsFloralCitizen_42",
  "Top_MaintenanceTechnicianCitizen_57",
  "Top_OverallCitizen_19",
  "Top_PonyDenimCitizen_47",
  "Top_SilverWaveCitizen_48",
  "Top_SunhatCitizen_10",
  "Top_YardMarshalCitizen_59",
]);
