/**
 * Lo que hace cada niño, para que su profesor vea dónde flojea el curso.
 *
 * Dos avisos sobre lo que esto es y lo que no es:
 *
 * 1. Un intento de tipo «explore» —pasearse por el wizard de geometría— no
 *    es un acierto ni un fallo. Si se contara como acierto, todo promedio
 *    del panel sería mentira.
 * 2. El ejercicio se genera en el navegador y el cliente conoce la
 *    respuesta, así que **nadie puede verificar en el servidor que un
 *    acierto sea verdad**. Esto sirve para ver uso y patrones de error; no
 *    son calificaciones y no se pueden presentar como tales a un colegio.
 *    Para que lo fueran, el ejercicio tendría que nacer en el servidor.
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { autenticacion, baseDeDatos, hayConfiguracion } from "./firebase";
import type { TipoCuerpo } from "./cuerpos";

export type Modulo = "geometry" | "equations" | "fractions";

/**
 * El tema es la unidad del panel: «en qué flojea el curso». Van en inglés
 * como todo lo que se guarda, y en minúsculas con puntos porque las reglas
 * sólo aceptan esa forma.
 */
export const TEMAS = {
  superficie: "geometry.surface",
  volumen: "geometry.volume",
  medirVolumen: "geometry.measurevolume",
  ecuacionSimple: "equations.simple",
  ecuacionConPesa: "equations.withconstant",
  fraccionIdentificar: "fractions.identify",
} as const;

export type Tema = (typeof TEMAS)[keyof typeof TEMAS];

export const NOMBRE_TEMA: Record<Tema, string> = {
  "geometry.surface": "Cubrir superficie",
  "geometry.volume": "Llenar volumen",
  "geometry.measurevolume": "Medir volumen",
  "equations.simple": "Ecuaciones simples",
  "equations.withconstant": "Ecuaciones con pesa",
  "fractions.identify": "Reconocer fracciones",
};

/** El tema de un problema de geometría, según su tipo. */
export function temaDe(tipo: "superficie" | "volumen" | "medirVolumen"): Tema {
  return TEMAS[tipo];
}

/**
 * Qué clase de error cometió, que vale más que el acierto a secas: saber
 * que el curso entero resta en vez de dividir dice qué hay que repasar.
 */
export function errorDe(
  elegida: number,
  { cantidad, peso, total, extra }: {
    cantidad: number; peso: number; total: number; extra: number;
  },
): string | null {
  if (elegida === peso) return null;
  if (extra > 0 && elegida === Math.round(total / cantidad)) return "olvidalapesa";
  if (extra > 0 && elegida === total - extra) return "olvidarepartir";
  if (extra === 0 && elegida === total - cantidad) return "restaenvezdedividir";
  if (extra === 0 && elegida === cantidad) return "cuentalasfrutas";
  return "porpoco";
}

/**
 * El curso del alumno, si está en alguno. Se lee una vez por sesión: no
 * cambia mientras resuelve ejercicios, y son dos lecturas por intento si
 * no se guarda.
 */
let suCurso: Promise<{ courseId: string; schoolId: string | null } | null> | null = null;

function cursoDe(uid: string) {
  suCurso ??= getDocs(
    query(
      collection(baseDeDatos(), "enrollments"),
      where("studentId", "==", uid),
      where("status", "==", "active"),
      limit(1),
    ),
  )
    .then((encontrados) => {
      const suyo = encontrados.docs[0];
      return suyo
        ? {
            courseId: String(suyo.data().courseId),
            schoolId: (suyo.data().schoolId as string) ?? null,
          }
        : null;
    })
    .catch(() => null);

  return suCurso;
}

/** Al cerrar sesión, el curso del anterior ya no vale. */
export function olvidarCurso() {
  suCurso = null;
}

/**
 * Cuánto tardó en contestar. Vive aquí y no en el componente porque medir
 * el tiempo no es cosa suya, y porque el compilador de React —con razón—
 * no deja llamar al reloj mientras pinta.
 */
export function cronometro() {
  let desde = Date.now();

  return {
    reiniciar() {
      desde = Date.now();
    },
    ms() {
      return Date.now() - desde;
    },
  };
}

/**
 * El día del niño, no el del servidor. Si practica a las once de la noche,
 * eso es su martes aunque en Londres ya sea miércoles. El trigger lo
 * comprueba contra su propio reloj por si llega algo disparatado.
 */
function hoy() {
  const ahora = new Date();
  const dosCifras = (n: number) => String(n).padStart(2, "0");

  return [
    ahora.getFullYear(),
    dosCifras(ahora.getMonth() + 1),
    dosCifras(ahora.getDate()),
  ].join("-");
}

type Intento = {
  modulo: Modulo;
  tema: Tema;
  /**
   * Cuál de los desafíos del catálogo es. Más fino que el tema: dentro de
   * reconocer fracciones no cuesta lo mismo con partes iguales que con
   * partes distintas, y es lo que el profesor calibrará.
   */
  desafio: string;
  /** «answer» es un ejercicio contestado; «explore», un paseo sin respuesta */
  tipo: "answer" | "explore";
  acierto?: boolean;
  error?: string | null;
  duracion?: number;
};

/**
 * Deja constancia de un intento. Nunca estorba: si falla, falla en
 * silencio. Que no se guarde una métrica no es motivo para romperle el
 * ejercicio a un niño.
 */
export async function registrar(intento: Intento) {
  if (!hayConfiguracion()) return;

  const quien = autenticacion().currentUser;
  if (!quien) return;

  try {
    const curso = await cursoDe(quien.uid);

    await addDoc(collection(baseDeDatos(), "attempts"), {
      studentId: quien.uid,
      courseId: curso?.courseId ?? null,
      schoolId: curso?.schoolId ?? null,
      module: intento.modulo,
      topic: intento.tema,
      challenge: intento.desafio,
      localDate: hoy(),
      kind: intento.tipo,
      correct: intento.tipo === "answer" ? intento.acierto === true : null,
      ...(intento.error ? { errorKind: intento.error } : {}),
      ...(intento.duracion ? { durationMs: Math.round(intento.duracion) } : {}),
      createdAt: serverTimestamp(),
    });
  } catch {
    // ni un aviso: esto es de fondo
  }
}

/** Los cuerpos, por si más adelante se quiere afinar el tema. */
export type { TipoCuerpo };
