/**
 * Lo que está encendido y lo que no.
 *
 * Next.js reemplaza estas variables al compilar, así que hay que
 * nombrarlas enteras: `process.env[algo]` no funcionaría.
 */

/**
 * Todo lo que tiene que ver con colegios: unirse a un curso, dejar que la
 * familia te siga, y elegir con qué perfil usar Materama.
 *
 * Apagado, Materama es lo que era: un niño entra y resuelve problemas. Así
 * se puede publicar la parte de los niños mientras la de los colegios se
 * termina de cocinar.
 *
 * Viene apagado por omisión a propósito. Un despliegue al que se le olvide
 * la variable enseña de menos, que es el lado por el que conviene
 * equivocarse.
 *
 * Ojo con lo que esto NO hace: el código de esas pantallas se compila y
 * viaja igual al navegador, sólo que no se pinta. Quien mire el paquete de
 * JavaScript verá los textos. Sirve para no enseñar lo que está a medio
 * hacer; no sirve para guardar un secreto. Lo que de verdad protege los
 * datos son las reglas de Firestore, y ésas no dependen de aquí.
 */
export const HAY_COLEGIOS = process.env.NEXT_PUBLIC_COLEGIOS === "1";
