import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { baseDeDatos } from "./firebase";

export type Perfil = {
  /** cómo quiere que le digamos */
  nombre: string | null;
  /** su apellido */
  apellido: string | null;
  /** su cumpleaños, en AAAA-MM-DD */
  nacimiento: string | null;
  /** el atuendo del avatar, tal como lo guarda el selector */
  avatar: string | null;
  /** una foto chica del avatar, para mostrarla sin abrir el 3D */
  miniatura: string | null;
  /**
   * Ya pasó por el onboarding. Se mira antes que los campos: una vez que
   * alguien se presentó no se le vuelve a preguntar, aunque después borre
   * un dato o aunque mañana el onboarding pregunte algo más.
   */
  listo: boolean;
};

/**
 * En la base los campos van en inglés, por convención. Dentro de la app el
 * perfil habla español como todo lo demás, así que la traducción vive aquí
 * y en ningún otro lado.
 */
const CAMPO: Record<keyof Perfil, string> = {
  nombre: "name",
  apellido: "lastName",
  nacimiento: "birthdate",
  avatar: "avatar",
  miniatura: "thumbnail",
  listo: "onboarded",
};

/**
 * Cómo se llamaban esos campos antes de la convención. Sólo se leen, para
 * no perder los perfiles de entonces; nunca se escriben. Cuando no queden
 * perfiles viejos, esto se borra.
 */
const ANTES: Partial<Record<keyof Perfil, string>> = {
  nombre: "nombre",
  nacimiento: "nacimiento",
  miniatura: "miniatura",
};

export const PERFIL_VACIO: Perfil = {
  nombre: null,
  apellido: null,
  nacimiento: null,
  avatar: null,
  miniatura: null,
  listo: false,
};

/** Lo que se pregunta al entrar por primera vez, en orden. */
export const PASOS = ["nombre", "nacimiento", "avatar"] as const;

export type Paso = (typeof PASOS)[number];

/**
 * Qué campos llena cada paso. Saber esto es lo que deja deducir en cuál se
 * quedó cada uno, sin llevar la cuenta por separado.
 */
const LLENA: Record<Paso, readonly (keyof Perfil)[]> = {
  nombre: ["nombre", "apellido"],
  nacimiento: ["nacimiento"],
  avatar: ["avatar"],
};

/** El primer paso sin contestar, o nada si ya no hay nada que preguntar. */
export function pasoPendiente(perfil: Perfil): Paso | null {
  if (perfil.listo) return null;
  return PASOS.find((paso) => LLENA[paso].some((campo) => !perfil[campo])) ?? null;
}

/**
 * Los cambios, más el sello de presentación si con ellos ya no queda nada
 * que preguntar. Así el onboarding se cierra solo, lo haya terminado en el
 * último paso o en uno anterior (que es lo que pasa cuando a un perfil de
 * antes sólo le faltaba un campo nuevo).
 */
export function conSello(
  perfil: Perfil,
  cambios: Partial<Perfil>,
): Partial<Perfil> {
  const despues = { ...perfil, ...cambios };
  return pasoPendiente(despues) ? cambios : { ...cambios, listo: true };
}

/** Cada usuario tiene su documento, con su propio uid de nombre. */
function donde(uid: string) {
  return doc(baseDeDatos(), "perfiles", uid);
}

export async function leerPerfil(uid: string): Promise<Perfil> {
  const guardado = await getDoc(donde(uid));
  if (!guardado.exists()) return PERFIL_VACIO;

  const datos = guardado.data();
  const texto = (campo: keyof Perfil) => {
    const antes = ANTES[campo];
    const valor = datos[CAMPO[campo]] ?? (antes ? datos[antes] : undefined);
    return typeof valor === "string" && valor ? valor : null;
  };

  return {
    nombre: texto("nombre"),
    apellido: texto("apellido"),
    nacimiento: texto("nacimiento"),
    avatar: texto("avatar"),
    miniatura: texto("miniatura"),
    listo: datos[CAMPO.listo] === true,
  };
}

/** Guarda sólo lo que viene: el onboarding escribe de a un campo. */
export async function guardarPerfil(uid: string, cambios: Partial<Perfil>) {
  const documento: Record<string, unknown> = { updatedAt: serverTimestamp() };

  for (const [campo, valor] of Object.entries(cambios)) {
    if (valor === undefined) continue;
    documento[CAMPO[campo as keyof Perfil]] = valor;
  }

  await setDoc(donde(uid), documento, { merge: true });
}

/** Los años cumplidos, o nada si la fecha no dice nada razonable. */
export function edadDe(nacimiento: string | null): number | null {
  if (!nacimiento) return null;

  const dia = new Date(`${nacimiento}T00:00:00`);
  if (Number.isNaN(dia.getTime())) return null;

  const hoy = new Date();
  const cumplio =
    hoy.getMonth() > dia.getMonth() ||
    (hoy.getMonth() === dia.getMonth() && hoy.getDate() >= dia.getDate());

  const anios = hoy.getFullYear() - dia.getFullYear() - (cumplio ? 0 : 1);
  return anios >= 0 && anios < 120 ? anios : null;
}

/** La fecha como se lee, no como se guarda: «15 de marzo de 2015». */
export function fechaLarga(nacimiento: string | null): string | null {
  if (!nacimiento) return null;

  const dia = new Date(`${nacimiento}T00:00:00`);
  if (Number.isNaN(dia.getTime())) return null;

  return new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(dia);
}
