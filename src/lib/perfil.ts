import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { baseDeDatos } from "./firebase";

export type Perfil = {
  /** el avatar tal como lo entrega Unity, sin interpretarlo */
  avatar: string | null;
  /** una foto chica del avatar, para mostrarla sin abrir Unity */
  miniatura: string | null;
};

export const PERFIL_VACIO: Perfil = { avatar: null, miniatura: null };

/** Cada usuario tiene su documento, con su propio uid de nombre. */
function donde(uid: string) {
  return doc(baseDeDatos(), "perfiles", uid);
}

export async function leerPerfil(uid: string): Promise<Perfil> {
  const guardado = await getDoc(donde(uid));
  if (!guardado.exists()) return PERFIL_VACIO;

  const datos = guardado.data();
  return {
    avatar: typeof datos.avatar === "string" ? datos.avatar : null,
    miniatura: typeof datos.miniatura === "string" ? datos.miniatura : null,
  };
}

export async function guardarPerfil(uid: string, perfil: Perfil) {
  await setDoc(
    donde(uid),
    { ...perfil, actualizado: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Si el avatar trae una miniatura adentro la sacamos para mostrarla; el
 * resto del JSON no lo tocamos, es cosa de Unity.
 */
export function miniaturaDe(avatar: string | null): string | null {
  if (!avatar) return null;

  try {
    const datos = JSON.parse(avatar);
    const foto = datos?.miniatura;
    return typeof foto === "string" && foto.startsWith("data:image")
      ? foto
      : null;
  } catch {
    return null;
  }
}
