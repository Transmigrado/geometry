#!/usr/bin/env node
/**
 * Sube las láminas de una colección a Storage y escribe su ficha en
 * Firestore. Es de una sola vez, pero está pensado para repetirse: cuando
 * salga una colección que no sea de matemáticos, se vuelve a llamar con
 * otra carpeta de .webp y otro `collectionId`.
 *
 * El .webp ya tiene que venir listo —recortado y liviano—, este script no
 * convierte nada: eso se hace una vez por fuera con cwebp.
 *
 * Uso:
 *   node herramientas/subir-cartas.mjs <clave-de-servicio.json> <carpeta-con-webp> <collectionId>
 */

import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import admin from "firebase-admin";
import { NOMBRES_DE } from "./cartas-nombres.mjs";

const [, , claveArg, carpetaArg, collectionId] = process.argv;

if (!claveArg || !carpetaArg || !collectionId) {
  console.error(
    "Uso: node herramientas/subir-cartas.mjs <clave.json> <carpeta> <collectionId>",
  );
  process.exit(1);
}

const nombres = NOMBRES_DE[collectionId];
if (!nombres) {
  console.error(`No hay nombres para la colección "${collectionId}" en cartas-nombres.mjs`);
  process.exit(1);
}

const clave = JSON.parse(readFileSync(claveArg, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(clave),
  storageBucket: `${clave.project_id}.firebasestorage.app`,
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

const archivos = readdirSync(carpetaArg).filter((f) => extname(f) === ".webp");

let subidas = 0;

for (const [indice, archivo] of archivos.entries()) {
  const slug = basename(archivo, ".webp");
  const nombre = nombres[slug];
  if (!nombre) {
    console.warn(`SIN NOMBRE: ${slug}, se omite`);
    continue;
  }

  const ruta = `cards/${collectionId}/${slug}.webp`;
  const token = randomUUID();

  await bucket.upload(join(carpetaArg, archivo), {
    destination: ruta,
    contentType: "image/webp",
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });

  const imageUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
    `${encodeURIComponent(ruta)}?alt=media&token=${token}`;

  await db
    .collection("cards")
    .doc(slug)
    .set({
      name: nombre,
      collectionId,
      imageUrl,
      order: indice,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log(`LISTO ${slug} -> ${nombre}`);
  subidas += 1;
}

console.log(`${subidas} láminas subidas a la colección "${collectionId}".`);
