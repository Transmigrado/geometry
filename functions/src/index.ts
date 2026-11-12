/**
 * Lo que no puede hacer el cliente.
 *
 * Todo lo que concede permisos —crear un colegio, invitar a un profesor,
 * matricular a un alumno— pasa por aquí. La razón es sencilla: quien pueda
 * escribir un documento de relación se está dando permisos a sí mismo, y
 * las reglas de Firestore no saben hacer transacciones ni contar intentos.
 */

import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { normalizar, nuevoCodigo } from "./codigos";

initializeApp();

const base = getFirestore();

/** Una semana para aceptar una invitación de profesor. */
const DURA_INVITACION = 7 * 24 * 60 * 60 * 1000;
/** Dos días para un código de curso: se reparte en clase y se usa ese día. */
const DURA_CURSO = 48 * 60 * 60 * 1000;
/** Una hora para el código con el que un apoderado se vincula a su hijo. */
const DURA_FAMILIA = 60 * 60 * 1000;

const MAX_MATRICULAS = 10;

function quien(peticion: { auth?: { uid: string; token: Record<string, unknown> } }) {
  if (!peticion.auth) {
    throw new HttpsError("unauthenticated", "Tienes que iniciar sesión.");
  }
  return peticion.auth;
}

function texto(valor: unknown, campo: string, max = 120): string {
  const limpio = String(valor ?? "").trim();
  if (!limpio || limpio.length > max) {
    throw new HttpsError("invalid-argument", `Revisa ${campo}.`);
  }
  return limpio;
}

/**
 * El rol vive en el token para que la app sepa qué pantalla pintar. No
 * autoriza nada: de eso se encargan las reglas mirando las relaciones.
 */
async function marcarRol(uid: string, role: string, schoolId: string | null) {
  await getAuth().setCustomUserClaims(uid, { role, schoolId });
  await base.doc(`users/${uid}`).set(
    { role, schoolId, claimsVersion: FieldValue.increment(1) },
    { merge: true },
  );
}

async function esStaff(uid: string, schoolId: string) {
  const suyo = await base.doc(`schools/${schoolId}/members/${uid}`).get();
  return suyo.exists && suyo.data()?.status === "active";
}

async function esAdmin(uid: string, schoolId: string) {
  const suyo = await base.doc(`schools/${schoolId}/members/${uid}`).get();
  return suyo.exists && suyo.data()?.status === "active"
    && suyo.data()?.role === "admin";
}

// ───────────────────────── colegio ─────────────────────────

export const crearColegio = onCall(async (peticion) => {
  const { uid, token } = quien(peticion);
  const nombre = texto(peticion.data?.nombre, "el nombre del colegio");

  // Va a administrar datos de menores: que al menos el correo sea suyo.
  if (!token.email_verified) {
    throw new HttpsError(
      "failed-precondition",
      "Primero confirma tu correo.",
    );
  }

  const colegio = base.collection("schools").doc();

  await base.batch()
    .set(colegio, {
      name: nombre,
      createdBy: uid,
      createdAt: FieldValue.serverTimestamp(),
    })
    .set(colegio.collection("members").doc(uid), {
      role: "admin",
      status: "active",
      name: texto(peticion.data?.quienEres ?? "Dirección", "tu nombre"),
      email: token.email ?? null,
      createdAt: FieldValue.serverTimestamp(),
    })
    .commit();

  await marcarRol(uid, "school", colegio.id);

  return { schoolId: colegio.id };
});

export const invitarProfesor = onCall(async (peticion) => {
  const { uid } = quien(peticion);
  const schoolId = texto(peticion.data?.schoolId, "el colegio", 40);
  const correo = texto(peticion.data?.correo, "el correo").toLowerCase();

  if (!(await esAdmin(uid, schoolId))) {
    throw new HttpsError("permission-denied", "No administras ese colegio.");
  }

  const codigo = nuevoCodigo();

  await base.doc(`invites/${codigo}`).set({
    kind: "teacher",
    schoolId,
    email: correo,
    createdBy: uid,
    maxUses: 1,
    usedCount: 0,
    expiresAt: Date.now() + DURA_INVITACION,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Se devuelve para que lo reparta quien invita. Cuando haya envío de
  // correo, el código deja de salir de aquí y va directo al invitado.
  return { codigo, caduca: Date.now() + DURA_INVITACION };
});

// ───────────────────────── cursos ─────────────────────────

export const crearCurso = onCall(async (peticion) => {
  const { uid } = quien(peticion);
  const nombre = texto(peticion.data?.nombre, "el nombre del curso", 60);
  const schoolId: string | null = peticion.data?.schoolId ?? null;

  if (schoolId && !(await esStaff(uid, schoolId))) {
    throw new HttpsError("permission-denied", "No perteneces a ese colegio.");
  }

  const curso = base.collection("courses").doc();

  await curso.set({
    name: nombre,
    year: Number(peticion.data?.anio) || new Date().getFullYear(),
    schoolId,
    teacherId: uid,
    archived: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { courseId: curso.id };
});

/**
 * El código con el que los alumnos entran al curso. Vive en una subcolección
 * aparte porque el documento del curso lo lee cualquier alumno matriculado:
 * si el código estuviera ahí, podría repartir su clase entera.
 *
 * Generar uno nuevo invalida el anterior, que es lo que hace falta el día
 * que se filtra.
 */
export const generarCodigoCurso = onCall(async (peticion) => {
  const { uid } = quien(peticion);
  const courseId = texto(peticion.data?.courseId, "el curso", 40);

  const curso = await base.doc(`courses/${courseId}`).get();
  if (!curso.exists || curso.data()?.teacherId !== uid) {
    throw new HttpsError("permission-denied", "Ese curso no es tuyo.");
  }

  const anterior = await base.doc(`courses/${courseId}/secrets/student`).get();
  const codigo = nuevoCodigo();
  const caduca = Date.now() + DURA_CURSO;

  const lote = base.batch();

  if (anterior.exists && anterior.data()?.code) {
    lote.set(
      base.doc(`invites/${anterior.data()!.code}`),
      { revoked: true },
      { merge: true },
    );
  }

  lote.set(base.doc(`invites/${codigo}`), {
    kind: "student",
    courseId,
    schoolId: curso.data()?.schoolId ?? null,
    createdBy: uid,
    maxUses: Number(peticion.data?.cupos) || 40,
    usedCount: 0,
    expiresAt: caduca,
    createdAt: FieldValue.serverTimestamp(),
  });

  lote.set(base.doc(`courses/${courseId}/secrets/student`), {
    code: codigo,
    expiresAt: caduca,
  });

  await lote.commit();

  return { codigo, caduca };
});

// ───────────────────────── familia ─────────────────────────

/**
 * El código con el que un apoderado se vincula a su hijo. Lo pide el
 * propio alumno desde su sesión, y dura una hora.
 *
 * Es la única vía: si un adulto pudiera vincularse buscando por correo o
 * por uid, cualquiera que conociese el de un niño se adjudicaría un menor
 * y vería su perfil entero.
 */
export const generarCodigoFamilia = onCall(async (peticion) => {
  const { uid } = quien(peticion);
  const codigo = nuevoCodigo(6);
  const caduca = Date.now() + DURA_FAMILIA;

  await base.doc(`invites/${codigo}`).set({
    kind: "guardian",
    studentId: uid,
    createdBy: uid,
    maxUses: 1,
    usedCount: 0,
    expiresAt: caduca,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { codigo, caduca };
});

// ───────────────────────── canje ─────────────────────────

/**
 * Canjear un código. Va aquí y no en reglas por cuatro motivos, y basta
 * con uno: el cupo necesita una transacción (si no, dos alumnos entran a
 * la vez con la última plaza), las reglas no saben contar intentos
 * fallidos, los claims sólo los pone el Admin SDK, y dejar leer la
 * invitación convertiría la base en un oráculo para probar códigos.
 *
 * El error es siempre el mismo da igual qué falle: distinguir «no existe»
 * de «caducado» de «sin cupo» le diría al que prueba que va bien.
 */
export const canjearCodigo = onCall(async (peticion) => {
  const { uid, token } = quien(peticion);
  const codigo = normalizar(peticion.data?.codigo);

  if (codigo.length < 6) {
    throw new HttpsError("invalid-argument", "Ese código no parece válido.");
  }

  const generico = new HttpsError(
    "failed-precondition",
    "Ese código no sirve. Pídele uno nuevo a tu profesor.",
  );

  const resultado = await base.runTransaction(async (t) => {
    const invitacion = await t.get(base.doc(`invites/${codigo}`));
    if (!invitacion.exists) throw generico;

    const datos = invitacion.data()!;
    if (datos.revoked) throw generico;
    if (datos.expiresAt && datos.expiresAt < Date.now()) throw generico;
    if ((datos.usedCount ?? 0) >= (datos.maxUses ?? 1)) throw generico;

    if (datos.kind === "teacher") {
      // La invitación va atada a un correo: si no, es una puerta abierta.
      const mio = String(token.email ?? "").toLowerCase();
      if (!token.email_verified || mio !== datos.email) {
        throw generico;
      }

      t.set(base.doc(`schools/${datos.schoolId}/members/${uid}`), {
        role: "teacher",
        status: "active",
        email: mio,
        createdAt: FieldValue.serverTimestamp(),
      });
      t.update(invitacion.ref, { usedCount: FieldValue.increment(1) });

      return { tipo: "teacher" as const, schoolId: datos.schoolId };
    }

    if (datos.kind === "guardian") {
      if (datos.studentId === uid) {
        throw new HttpsError(
          "failed-precondition",
          "Ese código es para que lo use tu familia, no tú.",
        );
      }

      const hijo = await t.get(base.doc(`users/${datos.studentId}`));

      t.set(base.doc(`guardianships/${uid}_${datos.studentId}`), {
        parentId: uid,
        studentId: datos.studentId,
        status: "active",
        source: "studentCode",
        createdAt: FieldValue.serverTimestamp(),
      });
      t.update(invitacion.ref, { usedCount: FieldValue.increment(1) });

      return {
        tipo: "guardian" as const,
        studentId: datos.studentId as string,
        nombre: hijo.data()?.name ?? null,
      };
    }

    // Alumno entrando a un curso.
    const curso = await t.get(base.doc(`courses/${datos.courseId}`));
    if (!curso.exists || curso.data()?.archived) throw generico;

    const matricula = base.doc(`enrollments/${uid}_${datos.courseId}`);
    if ((await t.get(matricula)).exists) {
      return {
        tipo: "student" as const,
        courseId: datos.courseId,
        nombre: curso.data()?.name,
      };
    }

    const yaTiene = await t.get(
      base.collection("enrollments")
        .where("studentId", "==", uid)
        .where("status", "==", "active"),
    );
    if (yaTiene.size >= MAX_MATRICULAS) {
      throw new HttpsError(
        "failed-precondition",
        "Ya estás en demasiados cursos.",
      );
    }

    const quienEs = await t.get(base.doc(`users/${uid}`));

    t.set(matricula, {
      studentId: uid,
      courseId: datos.courseId,
      schoolId: datos.schoolId ?? null,
      teacherId: curso.data()?.teacherId,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
    });

    // El roster lleva lo mínimo para una lista de clase. Nada de fecha de
    // nacimiento ni correo, y nada de la miniatura, que son 19 KB por niño.
    t.set(base.doc(`courses/${datos.courseId}/roster/${uid}`), {
      name: quienEs.data()?.name ?? null,
      lastName: quienEs.data()?.lastName ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });

    t.update(invitacion.ref, { usedCount: FieldValue.increment(1) });

    return {
      tipo: "student" as const,
      courseId: datos.courseId,
      nombre: curso.data()?.name,
    };
  });

  if (resultado.tipo === "teacher") {
    await marcarRol(uid, "teacher", resultado.schoolId);
  }
  if (resultado.tipo === "guardian") {
    await marcarRol(uid, "parent", null);
  }

  return resultado;
});

// ───────────────────────── métricas ─────────────────────────

/**
 * Cada intento suma en el progreso del alumno. Un documento por alumno y
 * curso, con los temas en un mapa dentro: así el panel del profesor es una
 * consulta de treinta documentos en vez de treinta por ocho temas.
 *
 * La marca en `counted` existe porque los triggers se reintentan: sin ella,
 * un reintento contaría el mismo intento dos veces.
 */
export const alGuardarIntento = onDocumentCreated(
  "attempts/{id}",
  async (evento) => {
    const intento = evento.data?.data();
    if (!intento || intento.kind !== "answer") return;

    const marca = base.doc(`counted/${evento.params.id}`);
    const acierto = intento.correct === true ? 1 : 0;
    const tema = limpio(intento.topic);
    const desafio = limpio(intento.challenge) || tema;
    const dia = diaDe(intento.localDate);

    const acumulado = base.doc(
      `progress/${intento.studentId}_${intento.courseId ?? "solo"}`,
    );
    // Un alumno puede estar en más de un curso. Mantener un documento por
    // curso evita mezclar lo que cada profesor está autorizado a consultar.
    const delDia = base.doc(
      `daily/${intento.studentId}_${intento.courseId ?? "solo"}_${dia}`,
    );

    const deQuien = {
      studentId: intento.studentId,
      courseId: intento.courseId ?? null,
      schoolId: intento.schoolId ?? null,
    };

    const unoMas = {
      attempts: FieldValue.increment(1),
      correct: FieldValue.increment(acierto),
      lastAt: FieldValue.serverTimestamp(),
    };

    await base.runTransaction(async (t) => {
      // los triggers se reintentan: sin esta marca, un reintento contaría
      // el mismo intento dos veces
      if ((await t.get(marca)).exists) return;

      t.set(acumulado, {
        ...deQuien,
        ...unoMas,
        byTopic: { [tema]: contar(acierto) },
      }, { merge: true });

      t.set(delDia, {
        ...deQuien,
        ...unoMas,
        date: dia,
        byTopic: { [tema]: contar(acierto) },
        byChallenge: { [desafio]: contar(acierto) },
      }, { merge: true });

      t.set(marca, { at: FieldValue.serverTimestamp() });
    });
  },
);

function contar(acierto: number) {
  return { a: FieldValue.increment(1), c: FieldValue.increment(acierto) };
}

function limpio(valor: unknown) {
  return String(valor ?? "").replace(/[^a-z0-9.]/g, "");
}

/**
 * El día al que se apunta lo que hizo. Lo dice el niño —es su calendario
 * el que importa, no el del servidor— pero se contrasta: si viene algo
 * absurdo, manda el reloj de aquí. Un día de margen cubre husos horarios
 * sin dejar pasar disparates.
 */
function diaDe(suyo: unknown): string {
  const hoy = new Date();
  const comoTexto = (cual: Date) => cual.toISOString().slice(0, 10);

  if (typeof suyo === "string" && /^\d{4}-\d{2}-\d{2}$/.test(suyo)) {
    const dicho = new Date(`${suyo}T12:00:00Z`).getTime();
    const distancia = Math.abs(dicho - hoy.getTime());
    if (distancia < 36 * 60 * 60 * 1000) return suyo;
  }

  return comoTexto(hoy);
}
