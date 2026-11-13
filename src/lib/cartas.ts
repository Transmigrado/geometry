/**
 * El catálogo de láminas: quién sale en cada colección y dónde está su
 * imagen. Es de lectura nada más —lo escribe un script de administración,
 * no la app— así que no hace falta ni un slice ni una saga.
 */

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { baseDeDatos } from "./firebase";

export type Carta = {
  id: string;
  nombre: string;
  imagen: string;
  orden: number;
};

/** Lo que cuesta cada lámina, en monedas. */
export const PRECIO_CARTA = 20;

/** Cualquiera del catálogo puede tocar, repetidas incluidas: así es un
 * álbum de láminas de verdad. */
export function cartaAlAzar(cartas: Carta[]): Carta {
  return cartas[Math.floor(Math.random() * cartas.length)];
}

function aCarta(id: string, datos: Record<string, unknown>): Carta {
  return {
    id,
    nombre: String(datos.name ?? ""),
    imagen: String(datos.imageUrl ?? ""),
    orden: Number(datos.order ?? 0),
  };
}

/** Las láminas de una colección, en su orden de catálogo. */
export async function cartasDe(collectionId: string): Promise<Carta[]> {
  const encontradas = await getDocs(
    query(
      collection(baseDeDatos(), "cards"),
      where("collectionId", "==", collectionId),
      orderBy("order"),
    ),
  );
  return encontradas.docs.map((cual) => aCarta(cual.id, cual.data()));
}
