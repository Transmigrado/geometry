/**
 * El catálogo de desafíos.
 *
 * Un **tema** es cómo se agrupa en los paneles: «Reconocer fracciones».
 * Un **desafío** es la unidad concreta que se le pone a un niño, y es lo
 * que un profesor calibrará y liberará cuando su curso vaya estando listo:
 * dentro de reconocer fracciones no cuesta lo mismo una tarta en cuatro
 * porciones iguales que una con una porción partida.
 *
 * Los identificadores de aquí viajan a la base y acaban en las
 * estadísticas, así que **no se renombran**: cambiarlos parte el histórico
 * en dos. Si un desafío deja de usarse, se marca y se deja estar.
 *
 * Los `ajustes` son los mandos que cada desafío sabrá aceptar. Hoy están
 * declarados y nada los lee: existen para que el panel del profesor tenga
 * de dónde agarrarse cuando se construya, y para que al escribir un
 * desafío nuevo quede claro qué se espera poder graduar.
 */

import type { Modulo, Tema } from "./metricas";

export type Ajuste = {
  clave: string;
  nombre: string;
  /** cómo viene antes de que nadie lo toque */
  porDefecto: boolean;
};

export type Desafio = {
  id: string;
  modulo: Modulo;
  tema: Tema;
  nombre: string;
  pie: string;
  ajustes: Ajuste[];
};

export const DESAFIOS: Desafio[] = [
  {
    id: "geometry.surface",
    modulo: "geometry",
    tema: "geometry.surface",
    nombre: "Cubrir superficie",
    pie: "Cuántas piezas hacen falta para forrar un cuerpo.",
    ajustes: [
      { clave: "cuerposRedondos", nombre: "Incluir esferas y cilindros", porDefecto: true },
      { clave: "medidasGrandes", nombre: "Medidas de más de 10", porDefecto: true },
    ],
  },
  {
    id: "geometry.volume",
    modulo: "geometry",
    tema: "geometry.volume",
    nombre: "Llenar volumen",
    pie: "Cuántos cuerpos caben dentro de otro.",
    ajustes: [
      { clave: "cuerposRedondos", nombre: "Incluir esferas y cilindros", porDefecto: true },
      { clave: "medidasGrandes", nombre: "Medidas de más de 10", porDefecto: true },
    ],
  },
  {
    id: "geometry.measure",
    modulo: "geometry",
    tema: "geometry.measurevolume",
    nombre: "Medir volumen",
    pie: "Cuánto ocupa un cuerpo, en cubitos y en litros.",
    ajustes: [
      { clave: "decimales", nombre: "Permitir medidas con decimales", porDefecto: false },
      { clave: "litros", nombre: "Mostrar también los litros", porDefecto: true },
    ],
  },
  {
    id: "equations.simple",
    modulo: "equations",
    tema: "equations.simple",
    nombre: "Ecuaciones simples",
    pie: "Tantas frutas pesan tanto: ¿cuánto pesa una?",
    ajustes: [
      { clave: "soloFrutas", nombre: "Sin números, sólo frutas", porDefecto: false },
      { clave: "pesosGrandes", nombre: "Pesos de más de dos cifras", porDefecto: false },
    ],
  },
  {
    id: "equations.constant",
    modulo: "equations",
    tema: "equations.withconstant",
    nombre: "Ecuaciones con pesa",
    pie: "Las frutas van acompañadas de una pesa conocida.",
    ajustes: [
      { clave: "soloFrutas", nombre: "Sin números, sólo frutas", porDefecto: false },
      { clave: "pesosGrandes", nombre: "Pesos de más de dos cifras", porDefecto: false },
    ],
  },
  {
    id: "fractions.equal",
    modulo: "fractions",
    tema: "fractions.identify",
    nombre: "Fracciones en partes iguales",
    pie: "Todas las piezas valen lo mismo: basta con contarlas.",
    ajustes: [
      { clave: "muchasPartes", nombre: "Figuras de más de seis partes", porDefecto: true },
      { clave: "triangulos", nombre: "Incluir triángulos", porDefecto: true },
    ],
  },
  {
    id: "fractions.mixed",
    modulo: "fractions",
    tema: "fractions.identify",
    nombre: "Fracciones en partes distintas",
    pie: "Hay piezas de dos tamaños: contar no sirve, hay que mirar cuánto ocupan.",
    ajustes: [
      { clave: "muchasPartes", nombre: "Figuras de más de seis partes", porDefecto: true },
      { clave: "triangulos", nombre: "Incluir triángulos", porDefecto: true },
    ],
  },
];

const POR_ID = new Map(DESAFIOS.map((cual) => [cual.id, cual]));

export function desafio(id: string): Desafio | null {
  return POR_ID.get(id) ?? null;
}

/** Cómo se llama, o el identificador crudo si es uno que ya no existe. */
export function nombreDeDesafio(id: string) {
  return POR_ID.get(id)?.nombre ?? id;
}

export const DESAFIOS_DE: Record<Modulo, Desafio[]> = {
  geometry: DESAFIOS.filter((cual) => cual.modulo === "geometry"),
  equations: DESAFIOS.filter((cual) => cual.modulo === "equations"),
  fractions: DESAFIOS.filter((cual) => cual.modulo === "fractions"),
};
