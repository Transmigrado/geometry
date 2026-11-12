/**
 * Pruebas de las reglas de Storage, donde viven las fotos de perfil.
 *
 *   firebase emulators:exec --only storage "node pruebas/fotos.mjs"
 */

import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const YO = "profe1";
const OTRO = "profe2";

const entorno = await initializeTestEnvironment({
  projectId: "materama-pruebas",
  storage: {
    rules: readFileSync("storage.rules", "utf8"),
    host: "127.0.0.1",
    port: 9199,
  },
});

/** Una imagen cualquiera, del tamaño que se le pida. */
const imagen = (bytes = 1024) =>
  new Uint8Array(bytes).fill(137);

const comoFoto = { contentType: "image/webp" };

await entorno.withSecurityRulesDisabled(async (admin) => {
  await uploadBytes(
    ref(admin.storage(), `fotos/${OTRO}`),
    imagen(),
    comoFoto,
  );
});

const mio = entorno.authenticatedContext(YO).storage();
const ajeno = entorno.authenticatedContext(OTRO).storage();
const nadie = entorno.unauthenticatedContext().storage();

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

console.log("\nLa foto de perfil");
await caso("subo la mía", () =>
  assertSucceeds(uploadBytes(ref(mio, `fotos/${YO}`), imagen(), comoFoto)));
await caso("no la de otro", () =>
  assertFails(uploadBytes(ref(mio, `fotos/${OTRO}`), imagen(), comoFoto)));
await caso("sin sesión, nada", () =>
  assertFails(uploadBytes(ref(nadie, `fotos/${YO}`), imagen(), comoFoto)));

console.log("\nLo que no vale como foto");
await caso("un archivo que no es imagen", () =>
  assertFails(uploadBytes(ref(mio, `fotos/${YO}`), imagen(), {
    contentType: "application/pdf",
  })));
await caso("una imagen enorme, que no pasó por el recorte", () =>
  assertFails(uploadBytes(ref(mio, `fotos/${YO}`), imagen(600 * 1024), comoFoto)));

console.log("\nQuién las ve");
await caso("cualquiera que haya entrado", () =>
  assertSucceeds(getDownloadURL(ref(ajeno, `fotos/${OTRO}`))));
await caso("pero no quien no entró", () =>
  assertFails(getDownloadURL(ref(nadie, `fotos/${OTRO}`))));

console.log("\nFuera de las fotos no se escribe");
await caso("ni en otra carpeta", () =>
  assertFails(uploadBytes(ref(mio, `otros/${YO}`), imagen(), comoFoto)));

await entorno.cleanup();

console.log(`\n${pasadas} pasaron, ${falladas} fallaron\n`);
process.exit(falladas ? 1 : 0);
