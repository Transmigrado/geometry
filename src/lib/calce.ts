/**
 * El calce entre prendas, como lo hace el pack: la de adentro se mete bajo
 * la de afuera para que no se crucen. A cada vértice de la prenda interior
 * se le tira un rayo desde el cuerpo hacia él; si por el camino aparece la
 * prenda exterior, el vértice se queda justo por dentro.
 */

import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";

// sin esto cada rayo recorrería todos los triángulos, y son miles
Mesh.prototype.raycast = acceleratedRaycast;
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

/**
 * Para cada vértice de la prenda, el punto del cuerpo del que nace. Es lo
 * que da la dirección en que esa parte de la ropa se aleja de la piel.
 */
export function anclar(
  prenda: BufferGeometry,
  cuerpo: BufferGeometry,
): Float32Array {
  const suyos = prenda.getAttribute("position");
  const piel = cuerpo.getAttribute("position");
  const anclas = new Float32Array(suyos.count * 3);

  for (let i = 0; i < suyos.count; i += 1) {
    const x = suyos.getX(i);
    const y = suyos.getY(i);
    const z = suyos.getZ(i);

    let cerca = Infinity;
    let mejor = 0;
    for (let j = 0; j < piel.count; j += 1) {
      const dx = piel.getX(j) - x;
      const dy = piel.getY(j) - y;
      const dz = piel.getZ(j) - z;
      const distancia = dx * dx + dy * dy + dz * dz;
      if (distancia < cerca) {
        cerca = distancia;
        mejor = j;
      }
    }

    anclas[i * 3] = piel.getX(mejor);
    anclas[i * 3 + 1] = piel.getY(mejor);
    anclas[i * 3 + 2] = piel.getZ(mejor);
  }

  return anclas;
}

/** Buscar el ancla de cada vértice es caro, pero solo hay que hacerlo una
 * vez por prenda: no cambia nunca. */
const memoria = new WeakMap<BufferGeometry, Float32Array>();

export function anclasDe(prenda: BufferGeometry, cuerpo: BufferGeometry) {
  let anclas = memoria.get(prenda);
  if (!anclas) {
    anclas = anclar(prenda, cuerpo);
    memoria.set(prenda, anclas);
  }
  return anclas;
}

const rayo = new Raycaster();
const desde = new Vector3();
const hacia = new Vector3();
const punto = new Vector3();
/**
 * Anclas para el propio cuerpo: desde cada vértice, un punto metido hacia
 * dentro siguiendo su normal. Con eso la piel se calza bajo la ropa con el
 * mismo rayo que una prenda bajo otra, que es lo que hace falta cuando la
 * piel no está rozando la tela sino saliéndose por ella.
 */
export function anclasDentro(
  cuerpo: BufferGeometry,
  hondura: number,
): Float32Array {
  const posicion = cuerpo.getAttribute("position");
  const normales = cuerpo.getAttribute("normal");
  const anclas = new Float32Array(posicion.count * 3);

  for (let i = 0; i < posicion.count; i += 1) {
    anclas[i * 3] = posicion.getX(i) - normales.getX(i) * hondura;
    anclas[i * 3 + 1] = posicion.getY(i) - normales.getY(i) * hondura;
    anclas[i * 3 + 2] = posicion.getZ(i) - normales.getZ(i) * hondura;
  }

  return anclas;
}

const adentro = new WeakMap<BufferGeometry, Float32Array>();

export function anclasDentroDe(cuerpo: BufferGeometry, hondura: number) {
  let anclas = adentro.get(cuerpo);
  if (!anclas) {
    anclas = anclasDentro(cuerpo, hondura);
    adentro.set(cuerpo, anclas);
  }
  return anclas;
}

export type Calce = {
  /** cuánto se deja respirar a la prenda de afuera */
  hueco: number;
  /** lo mínimo que la prenda se despega del cuerpo */
  minimo: number;
  /** para calzar solo una parte, por ejemplo lo que está sobre la cabeza */
  solo?: (altura: number) => boolean;
};

/**
 * Devuelve la prenda con sus vértices metidos bajo la exterior. Si no hay
 * nada que corregir devuelve la misma, para no copiar en vano.
 */
export function calzar(
  interior: BufferGeometry,
  anclas: Float32Array,
  exterior: BufferGeometry,
  { hueco, minimo, solo }: Calce,
): BufferGeometry {
  const origen = interior.getAttribute("position");
  if (!exterior.boundsTree) exterior.computeBoundsTree();

  // a dos caras, y no es un detalle: el rayo sale de dentro del cuerpo, así
  // que choca con la cara interior de la prenda. Mirando sólo las de frente,
  // ese choque no existe y no se calzaba nada
  const barrera = new Mesh(exterior, new MeshBasicMaterial({ side: DoubleSide }));
  rayo.firstHitOnly = true;

  const movido = Float32Array.from(origen.array as Float32Array);
  let cambio = false;

  for (let i = 0; i < origen.count; i += 1) {
    if (solo && !solo(movido[i * 3 + 1])) continue;

    desde.set(anclas[i * 3], anclas[i * 3 + 1], anclas[i * 3 + 2]);
    punto.set(movido[i * 3], movido[i * 3 + 1], movido[i * 3 + 2]);
    hacia.subVectors(punto, desde);

    const largo = hacia.length();
    if (largo < 1e-4) continue;
    hacia.divideScalar(largo);

    rayo.set(desde.clone().addScaledVector(hacia, 0.001), hacia);
    rayo.far = largo + hueco;

    const choque = rayo.intersectObject(barrera, false)[0];
    if (!choque) continue;

    const meta = Math.max(minimo, choque.distance + 0.001 - hueco);
    if (meta >= largo) continue;

    movido[i * 3] = desde.x + hacia.x * meta;
    movido[i * 3 + 1] = desde.y + hacia.y * meta;
    movido[i * 3 + 2] = desde.z + hacia.z * meta;
    cambio = true;
  }

  if (!cambio) return interior;

  const ajustada = interior.clone();
  ajustada.setAttribute("position", new BufferAttribute(movido, 3));
  ajustada.computeVertexNormals();

  return ajustada;
}

/**
 * Quita del cuerpo los triángulos que la ropa tapa. Empujar la piel hacia
 * dentro no alcanza: hundirla lo justo para que no asome por un muslo le
 * abre un cráter en la cintura, y hundirla poco la deja asomando. Lo que no
 * existe, en cambio, no puede atravesar nada por mucho que la animación
 * separe la piel de la tela.
 *
 * Tapado es que el rayo encuentre tela en esa dirección, delante o detrás
 * del propio vértice: delante significa que la piel ya se está saliendo,
 * detrás que la tela la cubre. Un triángulo se va solo si sus tres vértices
 * lo están, así que el agujero siempre queda por dentro del borde de la
 * prenda y nunca asoma.
 */
export function recortar(
  cuerpo: BufferGeometry,
  anclas: Float32Array,
  prendas: BufferGeometry[],
  margen: number,
): BufferGeometry {
  const posicion = cuerpo.getAttribute("position");
  if (!prendas.length) return cuerpo;

  const tapado = new Uint8Array(posicion.count);
  rayo.firstHitOnly = true;

  for (const prenda of prendas) {
    if (!prenda.boundsTree) prenda.computeBoundsTree();
    const barrera = new Mesh(prenda, new MeshBasicMaterial({ side: DoubleSide }));

    for (let i = 0; i < posicion.count; i += 1) {
      if (tapado[i]) continue;

      desde.set(anclas[i * 3], anclas[i * 3 + 1], anclas[i * 3 + 2]);
      punto.set(posicion.getX(i), posicion.getY(i), posicion.getZ(i));
      hacia.subVectors(punto, desde);

      const largo = hacia.length();
      if (largo < 1e-4) continue;
      hacia.divideScalar(largo);

      rayo.set(desde, hacia);
      rayo.far = largo + margen;

      if (rayo.intersectObject(barrera, false).length) tapado[i] = 1;
    }
  }

  const indice = cuerpo.getIndex();
  const caras = indice ? indice.count : posicion.count;
  const quedan: number[] = [];

  for (let t = 0; t < caras; t += 3) {
    const a = indice ? indice.getX(t) : t;
    const b = indice ? indice.getX(t + 1) : t + 1;
    const c = indice ? indice.getX(t + 2) : t + 2;

    if (tapado[a] && tapado[b] && tapado[c]) continue;
    quedan.push(a, b, c);
  }

  if (quedan.length === caras) return cuerpo;

  const recortado = cuerpo.clone();
  recortado.setIndex(quedan);

  return recortado;
}
