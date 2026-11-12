"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  AnimationMixer,
  MeshStandardMaterial,
  NearestFilter,
  SkinnedMesh,
  SRGBColorSpace,
  type BufferGeometry,
  type Group,
  type Object3D,
  type WebGLRenderer,
} from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { anclasDe, calzar, esconder } from "@/lib/calce";
import { COLORES_ROPA, PIELES } from "@/lib/paleta";
import { celdaPrincipal, mudarCelda, type Celda } from "@/lib/uv";
import {
  AVATAR,
  CUERPO,
  PALETA,
  SIN_COLOR,
  SLOTS,
  type Atuendo,
  type Slot,
} from "@/lib/vestuario";

/** el decodificador vive en public, para no depender de un CDN ajeno */
const DRACO = "/draco/";

/** Un top que suba por encima de esta parte del cuerpo lleva capucha, y
 * uno que baje de esta otra trae botas: entonces tapan gorro y zapatos. */
const ALTURA_CAPUCHA = 0.85;
const ALTURA_BOTAS = 0.03;
/** de aquí para arriba empieza la cabeza, que es lo que tapa una capucha */
const ALTURA_CABEZA = 1.2;

/** cuánto se hunde la piel bajo la ropa para que no asome al animarse */
const MARGEN_PIEL = 0.012;

/** Qué se mete bajo qué, con cuánto aire, tal como lo hace el pack. */
const CALCES: {
  dentro: Slot;
  fuera: Slot;
  hueco: number;
  minimo: number;
  soloArriba?: boolean;
}[] = [
  { dentro: "Bottom", fuera: "Shoes", hueco: 0.003, minimo: 0.002 },
  { dentro: "Bottom", fuera: "Top", hueco: 0.004, minimo: 0.003 },
  { dentro: "Headwear", fuera: "Top", hueco: 0.004, minimo: 0.004, soloArriba: true },
  { dentro: "Hair", fuera: "Headwear", hueco: 0.004, minimo: 0.002 },
  { dentro: "Hair", fuera: "Top", hueco: 0.004, minimo: 0.002, soloArriba: true },
];

type Props = {
  atuendo: Atuendo;
  /** para poder sacarle la foto al personaje */
  alCrear?: (renderizador: WebGLRenderer) => void;
};

export function Escena({ atuendo, alCrear }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.95, 3.7], fov: 32 }}
      // sin esto la miniatura sale en negro
      gl={{ preserveDrawingBuffer: true }}
      onCreated={({ gl }) => alCrear?.(gl)}
    >
      <color attach="background" args={["#e0f2fe"]} />

      <ambientLight intensity={1.4} />
      <directionalLight
        position={[2.5, 4, 3]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} />

      <Personaje atuendo={atuendo} />
      <Plataforma />

      <OrbitControls
        target={[0, 0.78, 0]}
        enablePan={false}
        minDistance={2}
        maxDistance={5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}

function Personaje({ atuendo }: { atuendo: Atuendo }) {
  const paleta = useTexture(PALETA);
  const avatar = useGLTF(AVATAR, DRACO);

  const material = useMemo(() => {
    // se clona para poder ajustarla sin tocar la que guarda el cargador
    const mapa = paleta.clone();

    // es una paleta de colores planos: si el filtro interpola, los colores
    // se mezclan en los bordes de cada celda
    mapa.flipY = false;
    mapa.magFilter = NearestFilter;
    mapa.minFilter = NearestFilter;
    mapa.generateMipmaps = false;
    mapa.colorSpace = SRGBColorSpace;
    mapa.needsUpdate = true;

    return new MeshStandardMaterial({ map: mapa, roughness: 0.9 });
  }, [paleta]);

  /** Cuerpo, ropa y esqueleto salen del mismo archivo y de un solo
   * esqueleto, así que la ropa se mueve con el cuerpo sin más. */
  const escena = useMemo(() => clone(avatar.scene) as Group, [avatar.scene]);

  /** El personaje respira en vez de quedarse en cruz. */
  const bailarin = useRef<AnimationMixer | null>(null);
  const reposo = avatar.animations[0];

  useEffect(() => {
    if (!reposo) return;

    const mezclador = new AnimationMixer(escena);
    mezclador.clipAction(reposo).play();
    bailarin.current = mezclador;

    return () => {
      mezclador.stopAllAction();
      bailarin.current = null;
    };
  }, [escena, reposo]);

  useFrame((_, paso) => bailarin.current?.update(paso));

  const piel = useMemo(() => buscarMalla(escena, CUERPO), [escena]);

  /** El tono de piel vive en una celda, y esa misma celda aparece en las
   * prendas que dejan ver brazos o cuello. */
  const cambioDePiel = useMemo(() => {
    if (atuendo.piel === SIN_COLOR || !piel) return null;
    const desde = celdaPrincipal(geometriaBase(piel));
    const hasta = PIELES[atuendo.piel]?.celda;
    return desde && hasta ? { desde, hasta: hasta as Celda } : null;
  }, [atuendo.piel, piel]);

  const puesto = (slot: Slot) => {
    const nombre = atuendo.piezas[slot];
    return nombre ? buscarMalla(escena, nombre) : null;
  };

  const tapados = aQueTapa(puesto("Top"), piel);
  const tapadosClave = tapados.join();

  /** Las prendas se acomodan unas bajo otras antes de pintarlas. */
  const calzadas = useMemo(() => {
    const ajustadas = new Map<Slot, BufferGeometry>();
    const base = piel ? geometriaBase(piel) : null;
    if (!base) return ajustadas;

    const original = (slot: Slot) =>
      tapados.includes(slot) ? null : mallaBase(puesto(slot));

    for (const { dentro, fuera, hueco, minimo, soloArriba } of CALCES) {
      const interior = original(dentro);
      const exterior = original(fuera);
      if (!interior || !exterior) continue;

      ajustadas.set(
        dentro,
        calzar(ajustadas.get(dentro) ?? interior, anclasDe(interior, base), exterior, {
          hueco,
          minimo,
          solo: soloArriba ? (altura) => altura > ALTURA_CABEZA : undefined,
        }),
      );
    }

    return ajustadas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atuendo.piezas, piel, tapadosClave]);

  /** La prenda que se lleva en cada slot, ya calzada: es lo que tapa. */
  const puestas = useMemo(() => {
    const todas: BufferGeometry[] = [];

    for (const slot of SLOTS) {
      if (tapados.includes(slot)) continue;
      const malla = puesto(slot);
      if (malla) todas.push(calzadas.get(slot) ?? geometriaBase(malla));
    }

    return todas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atuendo.piezas, calzadas, tapadosClave]);

  /** La piel, hundida bajo lo que lleve puesto. */
  const cuerpo = useMemo(
    () => (piel ? esconder(geometriaBase(piel), puestas, MARGEN_PIEL) : null),
    [piel, puestas],
  );

  /**
   * De todas las mallas del archivo se muestra el cuerpo y una prenda por
   * slot, con su color y su calce. Three.js es mutable por naturaleza:
   * esto es sincronizar la escena, no guardar estado.
   */
  useEffect(() => {
    const visibles = new Map<string, BufferGeometry>();

    if (cuerpo) {
      visibles.set(CUERPO, recolorear(cuerpo, cambioDePiel, null));
    }

    for (const slot of SLOTS) {
      const elegida = tapados.includes(slot) ? null : atuendo.piezas[slot];
      const malla = elegida ? buscarMalla(escena, elegida) : null;
      if (!malla || !elegida) continue;

      const indice = atuendo.colores[slot];
      const color =
        indice === undefined || indice === SIN_COLOR
          ? null
          : (COLORES_ROPA[indice]?.celda as Celda);

      visibles.set(
        elegida,
        recolorear(calzadas.get(slot) ?? geometriaBase(malla), cambioDePiel, color),
      );
    }

    // se recorre a pie, sin callbacks, que el compilador no los deja
    const pendientes: Object3D[] = [escena];
    while (pendientes.length) {
      const nodo = pendientes.pop()!;
      pendientes.push(...nodo.children);

      const malla = nodo as SkinnedMesh;
      if (!malla.isSkinnedMesh) continue;

      const geometria = visibles.get(malla.name);
      malla.visible = Boolean(geometria);
      if (!geometria) continue;

      malla.geometry = geometria;
      malla.material = material;
      malla.castShadow = true;
      malla.receiveShadow = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escena, cuerpo, calzadas, cambioDePiel, material, atuendo, tapadosClave]);

  return <primitive object={escena} />;
}

function mallaBase(malla: SkinnedMesh | null) {
  return malla ? geometriaBase(malla) : null;
}

/** La geometría con la que vino cada malla, antes de teñirla o calzarla:
 * si se partiera de la ya modificada, los cambios se irían sumando. */
const sinTocar = new WeakMap<SkinnedMesh, BufferGeometry>();

function geometriaBase(malla: SkinnedMesh) {
  let original = sinTocar.get(malla);
  if (!original) {
    original = malla.geometry;
    sinTocar.set(malla, original);
  }
  return original;
}

/** La malla con esqueleto que lleva ese nombre. */
function buscarMalla(donde: Group, nombre: string) {
  const nodo = donde.getObjectByName(nombre) as SkinnedMesh | undefined;
  return nodo?.isSkinnedMesh ? nodo : null;
}

/**
 * El pack no marca qué prenda tapa a cuál: lo deduce de su tamaño. Un top
 * que llega a la cabeza trae capucha, y uno que llega al suelo trae botas.
 */
function aQueTapa(
  top: SkinnedMesh | null,
  cuerpo: SkinnedMesh | null,
): Slot[] {
  if (!top?.geometry || !cuerpo?.geometry) return [];

  cuerpo.geometry.computeBoundingBox();
  top.geometry.computeBoundingBox();
  const limites = cuerpo.geometry.boundingBox;
  const suyo = top.geometry.boundingBox;
  if (!limites || !suyo) return [];

  const alto = limites.max.y - limites.min.y;
  const tapados: Slot[] = [];

  if (suyo.max.y > limites.min.y + alto * ALTURA_CAPUCHA) {
    tapados.push("Headwear");
  }
  if (suyo.min.y < limites.min.y + alto * ALTURA_BOTAS) {
    tapados.push("Shoes");
  }

  return tapados;
}

/** Deja la malla original intacta: la comparten todas las piezas iguales. */
function recolorear(
  original: BufferGeometry,
  piel: { desde: Celda; hasta: Celda } | null,
  color: Celda | null,
) {
  const principal = color ? celdaPrincipal(original) : null;
  const cambios = [];

  // la ropa manda sobre la piel, igual que en el pack
  if (color && principal) cambios.push({ desde: principal, hasta: color });
  if (piel) cambios.push(piel);
  if (!cambios.length) return original;

  const uv = original.getAttribute("uv");
  if (!uv) return original;

  const copia = original.clone();
  const mudado = mudarCelda(uv.array as Float32Array, cambios);
  copia.setAttribute("uv", uv.clone().copyArray(mudado));

  return copia;
}

function Plataforma() {
  return (
    <group>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.68, 0.1, 48]} />
        <meshStandardMaterial color="#bae6fd" roughness={1} />
      </mesh>
      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.5}
        scale={2}
        blur={2.4}
        far={1.5}
      />
    </group>
  );
}

useGLTF.preload(AVATAR, DRACO);
