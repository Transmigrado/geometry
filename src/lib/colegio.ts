/**
 * Lo que la app le pide al servidor: crear un colegio, invitar, armar
 * cursos y canjear códigos. Nada de esto se puede hacer desde el cliente,
 * porque todo concede permisos a alguien.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { baseDeDatos, funciones } from "./firebase";

export type Curso = {
  id: string;
  nombre: string;
  anio: number;
  colegio: string | null;
  profesor: string;
  archivado: boolean;
};

export type Alumno = {
  id: string;
  nombre: string;
  apellido: string;
};

export type Miembro = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
};

/** Los campos van en inglés en la base; aquí se traducen y ya está. */
function aCurso(id: string, datos: Record<string, unknown>): Curso {
  return {
    id,
    nombre: String(datos.name ?? ""),
    anio: Number(datos.year ?? 0),
    colegio: (datos.schoolId as string) ?? null,
    profesor: String(datos.teacherId ?? ""),
    archivado: datos.archived === true,
  };
}

function llamar<E, S>(nombre: string) {
  return async (envio: E): Promise<S> => {
    const respuesta = await httpsCallable<E, S>(funciones(), nombre)(envio);
    return respuesta.data;
  };
}

export const crearColegio = llamar<
  { nombre: string; quienEres?: string },
  { schoolId: string }
>("crearColegio");

export const invitarProfesor = llamar<
  { schoolId: string; correo: string },
  { codigo: string; caduca: number }
>("invitarProfesor");

export const crearCurso = llamar<
  { nombre: string; anio?: number; schoolId?: string | null },
  { courseId: string }
>("crearCurso");

export const generarCodigoCurso = llamar<
  { courseId: string; cupos?: number },
  { codigo: string; caduca: number }
>("generarCodigoCurso");

export const canjearCodigo = llamar<
  { codigo: string },
  {
    tipo: "student" | "teacher" | "guardian";
    courseId?: string;
    studentId?: string;
    nombre?: string;
    schoolId?: string;
  }
>("canjearCodigo");

/** El código que un alumno le da a su familia para que lo siga. */
export const generarCodigoFamilia = llamar<
  Record<string, never>,
  { codigo: string; caduca: number }
>("generarCodigoFamilia");

// ───────────────────── lecturas ─────────────────────

/** Los cursos que lleva un profesor. */
export async function cursosDe(profesor: string): Promise<Curso[]> {
  const encontrados = await getDocs(
    query(collection(baseDeDatos(), "courses"), where("teacherId", "==", profesor)),
  );
  return encontrados.docs.map((suyo) => aCurso(suyo.id, suyo.data()));
}

/** Los cursos de un colegio. */
export async function cursosDelColegio(schoolId: string): Promise<Curso[]> {
  const encontrados = await getDocs(
    query(collection(baseDeDatos(), "courses"), where("schoolId", "==", schoolId)),
  );
  return encontrados.docs.map((suyo) => aCurso(suyo.id, suyo.data()));
}

/**
 * La lista de clase. Son nombre y apellido y nada más: ni fecha de
 * nacimiento, ni correo, ni la miniatura del avatar, que pesa 19 KB por
 * niño y aquí no hace falta.
 */
export async function alumnosDe(courseId: string): Promise<Alumno[]> {
  const encontrados = await getDocs(
    collection(baseDeDatos(), "courses", courseId, "roster"),
  );
  return encontrados.docs.map((suyo) => ({
    id: suyo.id,
    nombre: String(suyo.data().name ?? ""),
    apellido: String(suyo.data().lastName ?? ""),
  }));
}

/** Los profesores de un colegio. */
export async function profesoresDe(schoolId: string): Promise<Miembro[]> {
  const encontrados = await getDocs(
    collection(baseDeDatos(), "schools", schoolId, "members"),
  );
  return encontrados.docs.map((suyo) => ({
    id: suyo.id,
    nombre: String(suyo.data().name ?? ""),
    correo: String(suyo.data().email ?? ""),
    rol: String(suyo.data().role ?? ""),
    estado: String(suyo.data().status ?? ""),
  }));
}

/** El código vigente de un curso. Sólo lo lee su profesor. */
export async function codigoDe(courseId: string) {
  const suyo = await getDoc(
    doc(baseDeDatos(), "courses", courseId, "secrets", "student"),
  );
  if (!suyo.exists()) return null;

  return {
    codigo: String(suyo.data().code ?? ""),
    caduca: Number(suyo.data().expiresAt ?? 0),
  };
}

/**
 * Los hijos de un apoderado. El vínculo se lee de `guardianships`, y el
 * nombre del documento del propio niño: un apoderado sí puede verlo entero.
 */
export async function hijosDe(apoderado: string): Promise<Alumno[]> {
  const vinculos = await getDocs(
    query(
      collection(baseDeDatos(), "guardianships"),
      where("parentId", "==", apoderado),
      where("status", "==", "active"),
    ),
  );

  const hijos = await Promise.all(
    vinculos.docs.map(async (vinculo) => {
      const id = String(vinculo.data().studentId);
      const suyo = await getDoc(doc(baseDeDatos(), "users", id));
      return {
        id,
        nombre: String(suyo.data()?.name ?? ""),
        apellido: String(suyo.data()?.lastName ?? ""),
      };
    }),
  );

  return hijos;
}

/**
 * Lo que lleva hecho cada alumno, por tema. Un documento por alumno y
 * curso, que lo escribe el trigger: así el panel del profesor es una sola
 * consulta de treinta documentos y la suma se hace aquí.
 */
export type Progreso = {
  alumno: string;
  intentos: number;
  aciertos: number;
  ultimo: number | null;
  porTema: Record<string, { intentos: number; aciertos: number }>;
};

function aProgreso(datos: Record<string, unknown>): Progreso {
  const porTema: Progreso["porTema"] = {};
  const temas = (datos.byTopic ?? {}) as Record<string, { a?: number; c?: number }>;

  for (const [tema, cuanto] of Object.entries(temas)) {
    porTema[tema] = { intentos: cuanto?.a ?? 0, aciertos: cuanto?.c ?? 0 };
  }

  return {
    alumno: String(datos.studentId ?? ""),
    intentos: Number(datos.attempts ?? 0),
    aciertos: Number(datos.correct ?? 0),
    ultimo: (datos.lastAt as { toMillis?: () => number })?.toMillis?.() ?? null,
    porTema,
  };
}

/** El progreso de todo un curso. */
export async function progresoDelCurso(courseId: string): Promise<Progreso[]> {
  const encontrados = await getDocs(
    query(collection(baseDeDatos(), "progress"), where("courseId", "==", courseId)),
  );
  return encontrados.docs.map((suyo) => aProgreso(suyo.data()));
}

/** Resumen diario del curso, separado por alumno y desafío. */
export type DiaAlumno = {
  alumno: string;
  fecha: string;
  porDesafio: Record<string, { ejercicios: number; aciertos: number }>;
};

export async function diasDelCurso(courseId: string): Promise<DiaAlumno[]> {
  const encontrados = await getDocs(
    query(
      collection(baseDeDatos(), "daily"),
      where("courseId", "==", courseId),
      orderBy("date", "desc"),
    ),
  );

  return encontrados.docs.map((documento) => {
    const datos = documento.data();
    const porDesafio: DiaAlumno["porDesafio"] = {};
    const desafios = (datos.byChallenge ?? {}) as Record<string, { a?: number; c?: number }>;

    for (const [id, cuenta] of Object.entries(desafios)) {
      porDesafio[id] = {
        ejercicios: Number(cuenta?.a ?? 0),
        aciertos: Number(cuenta?.c ?? 0),
      };
    }

    return {
      alumno: String(datos.studentId ?? ""),
      fecha: String(datos.date ?? ""),
      porDesafio,
    };
  });
}

/** Las respuestas recientes del alumno, sumando sus cursos. */
export async function diasDelAlumno(studentId: string): Promise<DiaAlumno[]> {
  const ahora = new Date();
  const fin = fechaISO(ahora);
  const inicioDate = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 6);
  const inicio = fechaISO(inicioDate);
  // Consultamos los intentos crudos para que el tablero del alumno no
  // dependa de que el trigger de agregación diaria ya se haya ejecutado.
  // Filtrar por alumno usa el índice simple de Firestore y evita depender
  // de un índice compuesto que quizá todavía no esté publicado.
  const encontrados = await getDocs(
    query(
      collection(baseDeDatos(), "attempts"),
      where("studentId", "==", studentId),
    ),
  );

  const agrupados = new Map<string, DiaAlumno>();
  for (const documento of encontrados.docs) {
    const datos = documento.data();
    const fecha = String(datos.localDate ?? "");
    const id = String(datos.challenge ?? "");
    if (datos.kind !== "answer" || fecha < inicio || fecha > fin || !id) continue;

    const dia = agrupados.get(fecha) ?? { alumno: studentId, fecha, porDesafio: {} };
    const antes = dia.porDesafio[id] ?? { ejercicios: 0, aciertos: 0 };
    dia.porDesafio[id] = {
      ejercicios: antes.ejercicios + 1,
      aciertos: antes.aciertos + (datos.correct === true ? 1 : 0),
    };
    agrupados.set(fecha, dia);
  }

  return [...agrupados.values()].sort((uno, otro) => otro.fecha.localeCompare(uno.fecha));
}

function fechaISO(fecha: Date) {
  const dos = (numero: number) => String(numero).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

/** El progreso de un alumno, mire quien mire. */
export async function progresoDe(studentId: string): Promise<Progreso[]> {
  const encontrados = await getDocs(
    query(collection(baseDeDatos(), "progress"), where("studentId", "==", studentId)),
  );
  return encontrados.docs.map((suyo) => aProgreso(suyo.data()));
}

/**
 * Todos los alumnos de un profesor, con el curso del que vienen. Se va
 * curso por curso a propósito: una consulta de grupo sobre los rosters no
 * puede pasar las reglas, porque no sabría a qué curso pertenece cada
 * documento hasta traerlo.
 */
export async function alumnosDelProfesor(cursos: Curso[]) {
  const listas = await Promise.all(
    cursos.map(async (curso) => {
      const suyos = await alumnosDe(curso.id).catch(() => []);
      return suyos.map((alumno) => ({ ...alumno, curso }));
    }),
  );

  return listas.flat();
}

/** Un colegio, para su propio panel. */
export async function colegio(schoolId: string) {
  const suyo = await getDoc(doc(baseDeDatos(), "schools", schoolId));
  return suyo.exists() ? { id: suyo.id, nombre: String(suyo.data().name ?? "") } : null;
}
