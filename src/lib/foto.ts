/**
 * La foto de perfil de quien no es alumno.
 *
 * Los niños no suben ninguna —su cara es el muñeco 3D— así que aquí sólo
 * acaban caras de adultos. No es casualidad: cuanto menos material de
 * menores se guarde, mejor.
 */

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { almacenamiento } from "./firebase";

/** Lo que mide la foto una vez recortada. Es un círculo pequeño. */
const LADO = 256;

export const PESO_MAXIMO = 8 * 1024 * 1024;

/**
 * Deja la foto cuadrada y del tamaño que se usa. Se hace en el navegador y
 * no en el servidor para no subir ocho megas por una carita de 40 píxeles,
 * que es lo que acaba viéndose.
 *
 * Recorta por el centro: una foto de carnet y una apaisada tienen que
 * acabar las dos en el mismo círculo.
 */
async function encoger(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);

  const lado = Math.min(imagen.width, imagen.height);
  const lienzo = document.createElement("canvas");
  lienzo.width = LADO;
  lienzo.height = LADO;

  const pincel = lienzo.getContext("2d");
  if (!pincel) throw new Error("Este navegador no sabe recortar la imagen.");

  pincel.drawImage(
    imagen,
    (imagen.width - lado) / 2,
    (imagen.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    LADO,
    LADO,
  );

  imagen.close();

  const encogida = await new Promise<Blob | null>((listo) =>
    lienzo.toBlob(listo, "image/webp", 0.85),
  );

  if (!encogida) throw new Error("No pudimos preparar la imagen.");
  return encogida;
}

/** Sube la foto y devuelve su dirección, que es lo que guarda el perfil. */
export async function subirFoto(uid: string, archivo: File): Promise<string> {
  if (!archivo.type.startsWith("image/")) {
    throw new Error("Eso no parece una imagen.");
  }
  if (archivo.size > PESO_MAXIMO) {
    throw new Error("La imagen pesa demasiado. Prueba con una más pequeña.");
  }

  const encogida = await encoger(archivo);
  const donde = ref(almacenamiento(), `fotos/${uid}`);

  await uploadBytes(donde, encogida, { contentType: "image/webp" });

  return getDownloadURL(donde);
}
