/**
 * Los códigos que se reparten para entrar a un curso o aceptar una
 * invitación de profesor.
 */

/**
 * Sin 0/O ni 1/I/L: estos códigos se dictan en voz alta en una sala de
 * clases y se copian a mano en un cuaderno.
 */
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Ocho caracteres sobre 31 símbolos son ~850 mil millones de
 * combinaciones. No es por elegancia: con seis el espacio baja a 900
 * millones y, con unos cuantos miles de códigos vivos, probar al azar
 * empieza a dar premio. Nadie puede enumerarlos —las invitaciones no se
 * leen desde el cliente— pero sí puede intentar adivinarlos.
 */
export function nuevoCodigo(largo = 8): string {
  const letras = [];
  for (let i = 0; i < largo; i += 1) {
    letras.push(ALFABETO[Math.floor(Math.random() * ALFABETO.length)]);
  }
  return letras.join("");
}

/** Lo que teclee el niño, puesto en la forma en que se guardó. */
export function normalizar(codigo: unknown): string {
  return String(codigo ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
