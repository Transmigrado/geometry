/**
 * Pruebas de las reglas de Firestore.
 *
 * No son pruebas de la app: son pruebas de la única barrera que protege
 * datos de menores. Cada caso de aquí es un ataque concreto que alguien
 * podría intentar con las herramientas del navegador abiertas.
 *
 *   firebase emulators:exec --only firestore "node pruebas/reglas.mjs"
 */

import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";

const COLEGIO = "colegio1";
const OTRO_COLEGIO = "colegio2";
const CURSO = "curso1";
const PROFE = "profe1";
const INTRUSO = "profe2";
const NINO = "nino1";
const MADRE = "madre1";

const entorno = await initializeTestEnvironment({
  projectId: "materama-pruebas",
  firestore: {
    rules: readFileSync("firestore.rules", "utf8"),
    host: "127.0.0.1",
    port: 8085,
  },
});

/** El escenario, escrito saltándose las reglas como haría el servidor. */
await entorno.withSecurityRulesDisabled(async (admin) => {
  const base = admin.firestore();

  await setDoc(doc(base, "users", NINO), {
    name: "Ana", lastName: "Pérez", birthdate: "2015-03-12",
    role: "student", onboarded: true,
  });

  await setDoc(doc(base, "schools", COLEGIO), { name: "Colegio Uno" });
  await setDoc(doc(base, "schools", COLEGIO, "members", PROFE), {
    role: "teacher", status: "active", email: "profe@colegio.cl",
  });
  await setDoc(doc(base, "schools", OTRO_COLEGIO, "members", INTRUSO), {
    role: "teacher", status: "active", email: "otro@colegio.cl",
  });

  await setDoc(doc(base, "courses", CURSO), {
    name: "5º B", year: 2026, schoolId: COLEGIO, teacherId: PROFE,
    archived: false,
  });
  await setDoc(doc(base, "courses", CURSO, "secrets", "student"), {
    code: "ABCD2345",
  });
  await setDoc(doc(base, "courses", CURSO, "roster", NINO), {
    name: "Ana", lastName: "Pérez",
  });

  await setDoc(doc(base, "enrollments", `${NINO}_${CURSO}`), {
    studentId: NINO, courseId: CURSO, schoolId: COLEGIO,
    teacherId: PROFE, status: "active",
  });

  await setDoc(doc(base, "guardianships", `${MADRE}_${NINO}`), {
    parentId: MADRE, studentId: NINO, status: "active",
  });

  await setDoc(doc(base, "invites", "ABCD2345"), {
    kind: "student", courseId: CURSO, maxUses: 30, usedCount: 0,
  });

  await setDoc(doc(base, "progress", `${NINO}_${CURSO}`), {
    studentId: NINO, courseId: CURSO, schoolId: COLEGIO,
    attempts: 10, correct: 7,
    byTopic: { "equations.simple": { a: 10, c: 7 } },
  });

  await setDoc(doc(base, "attempts", "intento1"), {
    studentId: NINO, courseId: CURSO, schoolId: COLEGIO,
    module: "equations", topic: "equations.simple",
    kind: "answer", correct: true, createdAt: new Date(),
  });
});

const como = (uid, extra) => entorno.authenticatedContext(uid, extra).firestore();
const nino = como(NINO);
const profe = como(PROFE);
const intruso = como(INTRUSO);
const madre = como(MADRE);
const nadie = entorno.unauthenticatedContext().firestore();

let pasadas = 0;
let falladas = 0;

async function caso(nombre, prueba) {
  try {
    await prueba();
    pasadas += 1;
    console.log(`  ✔ ${nombre}`);
  } catch (falla) {
    falladas += 1;
    console.log(`  ✘ ${nombre}`);
    console.log(`     ${falla.message?.split("\n")[0]}`);
  }
}

console.log("\nQuién puede ver a un niño");
await caso("el niño se ve a sí mismo", () =>
  assertSucceeds(getDoc(doc(nino, "users", NINO))));
await caso("su madre lo ve", () =>
  assertSucceeds(getDoc(doc(madre, "users", NINO))));
await caso("su profesor NO ve su perfil privado", () =>
  assertFails(getDoc(doc(profe, "users", NINO))));
await caso("un profesor de otro colegio tampoco", () =>
  assertFails(getDoc(doc(intruso, "users", NINO))));
await caso("sin sesión, nada", () =>
  assertFails(getDoc(doc(nadie, "users", NINO))));

console.log("\nEl rol se elige; el poder no");
await caso("el niño puede decir que es profesor…", () =>
  assertSucceeds(updateDoc(doc(nino, "users", NINO), { role: "teacher" })));
await caso("…pero eso no le deja leer a nadie", () =>
  assertFails(getDoc(doc(como(NINO, {}), "users", MADRE))));
await caso("no vale un rol inventado", () =>
  assertFails(updateDoc(doc(nino, "users", NINO), { role: "jefe" })));
await caso("ni se cuelga de un colegio", () =>
  assertFails(updateDoc(doc(nino, "users", NINO), { schoolId: COLEGIO })));
await caso("pero sí cambia su nombre", () =>
  assertSucceeds(updateDoc(doc(nino, "users", NINO), { name: "Anita" })));

console.log("\nEl código de matrícula no se filtra");
await caso("el alumno matriculado NO lee el código de su curso", () =>
  assertFails(getDoc(doc(nino, "courses", CURSO, "secrets", "student"))));
await caso("su profesor sí", () =>
  assertSucceeds(getDoc(doc(profe, "courses", CURSO, "secrets", "student"))));
await caso("las invitaciones no las lee nadie", () =>
  assertFails(getDoc(doc(profe, "invites", "ABCD2345"))));

console.log("\nEl curso y sus alumnos");
await caso("el alumno ve el nombre de su curso", () =>
  assertSucceeds(getDoc(doc(nino, "courses", CURSO))));
await caso("el profesor de otro colegio no", () =>
  assertFails(getDoc(doc(intruso, "courses", CURSO))));
await caso("el profesor ve a su alumno en el roster", () =>
  assertSucceeds(getDoc(doc(profe, "courses", CURSO, "roster", NINO))));
await caso("el intruso no", () =>
  assertFails(getDoc(doc(intruso, "courses", CURSO, "roster", NINO))));

console.log("\nLos intentos son inmutables");
await caso("el niño lee los suyos", () =>
  assertSucceeds(getDoc(doc(nino, "attempts", "intento1"))));
await caso("su profesor también", () =>
  assertSucceeds(getDoc(doc(profe, "attempts", "intento1"))));
await caso("un profesor ajeno no", () =>
  assertFails(getDoc(doc(intruso, "attempts", "intento1"))));
await caso("nadie los modifica", () =>
  assertFails(updateDoc(doc(nino, "attempts", "intento1"), { correct: false })));
await caso("nadie los borra", () =>
  assertFails(deleteDoc(doc(nino, "attempts", "intento1"))));

console.log("\nLo que el niño sí puede escribir");
await caso("un intento suyo, bien formado", () =>
  assertSucceeds(setDoc(doc(nino, "attempts", "intento2"), {
    studentId: NINO, courseId: CURSO, schoolId: COLEGIO,
    module: "equations", topic: "equations.simple",
    kind: "answer", correct: false, errorKind: "restar",
    durationMs: 4200, createdAt: serverTimestamp(),
  })));
await caso("pero no uno a nombre de otro", () =>
  assertFails(setDoc(doc(nino, "attempts", "intento3"), {
    studentId: "otroNino", courseId: CURSO, schoolId: COLEGIO,
    module: "equations", topic: "equations.simple",
    kind: "answer", correct: true, createdAt: serverTimestamp(),
  })));
await caso("ni uno de exploración con acierto", () =>
  assertFails(setDoc(doc(nino, "attempts", "intento4"), {
    studentId: NINO, courseId: CURSO, schoolId: COLEGIO,
    module: "geometry", topic: "geometry.volume",
    kind: "explore", correct: true, createdAt: serverTimestamp(),
  })));
await caso("ni colgarlo de un colegio que no es el suyo", () =>
  assertFails(setDoc(doc(nino, "attempts", "intento5"), {
    studentId: NINO, courseId: CURSO, schoolId: OTRO_COLEGIO,
    module: "equations", topic: "equations.simple",
    kind: "answer", correct: true, createdAt: serverTimestamp(),
  })));

console.log("\nVer cómo le va a un alumno");
const progreso = (quien, campo, valor) =>
  getDocs(query(collection(quien, "progress"), where(campo, "==", valor)));

await caso("su profesor lista el progreso de su curso", () =>
  assertSucceeds(progreso(profe, "courseId", CURSO)));
await caso("su madre lista el progreso de su hijo", () =>
  assertSucceeds(progreso(madre, "studentId", NINO)));
await caso("el niño lista el suyo", () =>
  assertSucceeds(progreso(nino, "studentId", NINO)));
await caso("un profesor ajeno no lista el de ese curso", () =>
  assertFails(progreso(intruso, "courseId", CURSO)));
await caso("ni nadie el de un niño que no es suyo", () =>
  assertFails(progreso(intruso, "studentId", NINO)));
await caso("y nadie lo escribe a mano", () =>
  assertFails(setDoc(doc(nino, "progress", `${NINO}_${CURSO}`), {
    studentId: NINO, courseId: CURSO, attempts: 999, correct: 999,
  })));

console.log("\nMatrículas y tutorías sólo las escribe el servidor");
await caso("el niño no se matricula solo", () =>
  assertFails(setDoc(doc(nino, "enrollments", `${NINO}_curso9`), {
    studentId: NINO, courseId: "curso9", status: "active",
  })));
await caso("nadie se adjudica un menor", () =>
  assertFails(setDoc(doc(intruso, "guardianships", `${INTRUSO}_${NINO}`), {
    parentId: INTRUSO, studentId: NINO, status: "active",
  })));

await entorno.cleanup();

console.log(`\n${pasadas} pasaron, ${falladas} fallaron\n`);
process.exit(falladas ? 1 : 0);
