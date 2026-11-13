/**
 * El azar de dónde cae cada papelito vive aquí, no en el componente: el
 * compilador de React no deja llamar a `Math.random` durante el render, así
 * que lo que sea aleatorio se calcula afuera y entra ya decidido.
 */

const COLORES = ["#f43f5e", "#f59e0b", "#22c55e", "#0ea5e9", "#a855f7", "#facc15"];

export type PiezaConfeti = {
  id: number;
  izquierda: number;
  retraso: number;
  duracion: number;
  giro: number;
  color: string;
  ancho: number;
};

export function piezasDeConfeti(cuantos: number): PiezaConfeti[] {
  return Array.from({ length: cuantos }, (_, indice) => ({
    id: indice,
    izquierda: Math.random() * 100,
    retraso: Math.random() * 0.5,
    duracion: 1.8 + Math.random() * 1.4,
    giro: 180 + Math.random() * 540,
    color: COLORES[indice % COLORES.length],
    ancho: 6 + Math.random() * 6,
  }));
}
