import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { baseDeDatos } from "./firebase";
import { HAY_COLEGIOS } from "./interruptores";

export type Perfil = {
  /** cómo quiere que le digamos */
  nombre: string | null;
  /** su apellido */
  apellido: string | null;
  /** su cumpleaños, en AAAA-MM-DD */
  nacimiento: string | null;
  /** el atuendo del avatar, tal como lo guarda el selector */
  avatar: string | null;
  /** una foto chica del avatar 3D, para mostrarla sin montar la escena */
  miniatura: string | null;
  /**
   * La foto de perfil de quien no es alumno. Los niños no suben ninguna:
   * su cara es el muñeco, y así no guardamos retratos de menores.
   */
  foto: string | null;
  /**
   * Ya pasó por el onboarding. Se mira antes que los campos: una vez que
   * alguien se presentó no se le vuelve a preguntar, aunque después borre
   * un dato o aunque mañana el onboarding pregunte algo más.
   */
  listo: boolean;
  /**
   * Qué pantalla le toca. Ojo: esto NO autoriza nada —de eso se encargan
   * los documentos de relación y las reglas—, sólo decide qué se pinta.
   * El cliente puede escribir «student» y «parent»; «teacher» y «school»
   * los pone el servidor al canjear una invitación.
   */
  rol: Rol;
  /** el colegio al que pertenece, si lo hay. Lo escribe sólo el servidor. */
  colegio: string | null;
  /** lo que lleva ganado celebrando rachas, y lo que cuesta cada lámina */
  monedas: number;
  /** cuántas veces le tocó cada lámina, por id de carta */
  cartas: Record<string, number>;
};

export const ROLES = ["student", "teacher", "school", "parent"] as const;

export type Rol = (typeof ROLES)[number];

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
  foto: "photoUrl",
  listo: "onboarded",
  rol: "role",
  colegio: "schoolId",
  monedas: "coins",
  cartas: "collectedCards",
};

export const PERFIL_VACIO: Perfil = {
  rol: "student",
  colegio: null,
  nombre: null,
  apellido: null,
  nacimiento: null,
  avatar: null,
  miniatura: null,
  foto: null,
  listo: false,
  monedas: 0,
  cartas: {},
};

export type Paso = "perfil" | "nombre" | "nacimiento" | "avatar";

/**
 * Qué campos llena cada paso. Saber esto es lo que deja deducir en cuál se
 * quedó cada uno, sin llevar la cuenta por separado.
 *
 * «perfil» —elegir quién eres— no llena ninguno, porque el rol siempre
 * tiene valor. Se pregunta igual, y lo pone el propio onboarding.
 */
const LLENA: Record<Paso, readonly (keyof Perfil)[]> = {
  perfil: [],
  nombre: ["nombre", "apellido"],
  nacimiento: ["nacimiento"],
  avatar: ["avatar"],
};

/**
 * Lo que se le pregunta a cada quien. A un profesor no se le pide la fecha
 * de nacimiento ni se le hace armar un avatar: eso es de los niños.
 */
export function pasosDe(rol: Rol): readonly Paso[] {
  // sin colegios todo el mundo es alumno, así que no hay nada que elegir
  if (!HAY_COLEGIOS) return ["nombre", "nacimiento", "avatar"];

  return rol === "student"
    ? ["perfil", "nombre", "nacimiento", "avatar"]
    : ["perfil", "nombre"];
}

/** El primer paso sin contestar, o nada si ya no hay nada que preguntar. */
export function pasoPendiente(perfil: Perfil): Paso | null {
  if (perfil.listo) return null;
  return pasosDe(HAY_COLEGIOS ? perfil.rol : "student").find(
    (paso) => LLENA[paso].some((campo) => !perfil[campo]),
  ) ?? null;
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
  return doc(baseDeDatos(), "users", uid);
}

/**
 * Deja el documento creado si todavía no existe. Hace falta porque las
 * reglas tratan distinto el alta —que fija el rol y la fecha de creación—
 * de las modificaciones posteriores, que sólo tocan campos de perfil.
 *
 * De paso arrastra lo que hubiera en la colección vieja. Eso es temporal:
 * en cuanto el único perfil de entonces esté copiado, se borra junto con
 * la regla de `perfiles` en firestore.rules.
 */
export async function asegurarPerfil(uid: string): Promise<Perfil> {
  const suyo = await getDoc(donde(uid));
  if (suyo.exists()) return leerPerfil(uid);

  const viejo = await getDoc(doc(baseDeDatos(), "perfiles", uid));
  const datos = viejo.exists() ? viejo.data() : {};

  const nuevo: Record<string, unknown> = {
    role: "student",
    createdAt: serverTimestamp(),
  };

  for (const campo of ["name", "lastName", "birthdate", "avatar",
                       "thumbnail", "onboarded"]) {
    if (datos[campo] !== undefined) nuevo[campo] = datos[campo];
  }

  await setDoc(donde(uid), nuevo);

  return leerPerfil(uid);
}

export async function leerPerfil(uid: string): Promise<Perfil> {
  const guardado = await getDoc(donde(uid));
  if (!guardado.exists()) return PERFIL_VACIO;

  const datos = guardado.data();
  const texto = (campo: keyof Perfil) => {
    const valor = datos[CAMPO[campo]];
    return typeof valor === "string" && valor ? valor : null;
  };

  const rol = datos[CAMPO.rol];
  const monedas = datos[CAMPO.monedas];
  const cartas = datos[CAMPO.cartas];

  return {
    nombre: texto("nombre"),
    apellido: texto("apellido"),
    nacimiento: texto("nacimiento"),
    avatar: texto("avatar"),
    miniatura: texto("miniatura"),
    foto: texto("foto"),
    listo: datos[CAMPO.listo] === true,
    rol: ROLES.includes(rol) ? rol : "student",
    colegio: texto("colegio"),
    monedas: typeof monedas === "number" ? monedas : 0,
    cartas: cartas && typeof cartas === "object" ? cartas : {},
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
