"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import {
  MeshStandardMaterial,
  NearestFilter,
  SRGBColorSpace,
  type BufferGeometry,
  type Mesh,
  type WebGLRenderer,
} from "three";
import { anclasDe, calzar } from "@/lib/calce";
import { COLORES_ROPA, PIELES } from "@/lib/paleta";
import { celdaPrincipal, mudarCelda, type Celda } from "@/lib/uv";
import {
  archivoDe,
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
  const cuerpo = useGLTF(CUERPO, DRACO);
  const vestuario = {
    Hair: useGLTF(archivoDe("Hair"), DRACO),
    Headwear: useGLTF(archivoDe("Headwear"), DRACO),
    Top: useGLTF(archivoDe("Top"), DRACO),
    Bottom: useGLTF(archivoDe("Bottom"), DRACO),
    Shoes: useGLTF(archivoDe("Shoes"), DRACO),
  };

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

  const piel = cuerpo.nodes.Cuerpo as Mesh | undefined;

  /** El tono de piel vive en una celda, y esa misma celda aparece en las
   * prendas que dejan ver brazos o cuello. */
  const cambioDePiel = useMemo(() => {
    if (atuendo.piel === SIN_COLOR || !piel?.geometry) return null;
    const desde = celdaPrincipal(piel.geometry);
    const hasta = PIELES[atuendo.piel]?.celda;
    return desde && hasta ? { desde, hasta: hasta as Celda } : null;
  }, [atuendo.piel, piel]);

  const puesto = (slot: Slot) => {
    const nombre = atuendo.piezas[slot];
    if (!nombre) return null;
    return (vestuario[slot].nodes[nombre] as Mesh | undefined) ?? null;
  };

  const tapados = aQueTapa(puesto("Top"), piel);
  const tapadosClave = tapados.join();

  /** Las prendas se acomodan unas bajo otras antes de pintarlas. */
  const calzadas = useMemo(() => {
    const ajustadas = new Map<Slot, BufferGeometry>();
    const cuerpo = piel?.geometry;
    if (!cuerpo) return ajustadas;

    const original = (slot: Slot) =>
      tapados.includes(slot) ? null : (puesto(slot)?.geometry ?? null);

    for (const { dentro, fuera, hueco, minimo, soloArriba } of CALCES) {
      const interior = original(dentro);
      const exterior = original(fuera);
      if (!interior || !exterior) continue;

      ajustadas.set(
        dentro,
        calzar(ajustadas.get(dentro) ?? interior, anclasDe(interior, cuerpo), exterior, {
          hueco,
          minimo,
          solo: soloArriba ? (altura) => altura > ALTURA_CABEZA : undefined,
        }),
      );
    }

    return ajustadas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atuendo.piezas, piel, tapadosClave]);

  return (
    <group>
      <Pieza malla={piel} material={material} piel={cambioDePiel} />

      {SLOTS.map((slot) => {
        if (tapados.includes(slot)) return null;
        const indice = atuendo.colores[slot];

        return (
          <Pieza
            key={slot}
            malla={puesto(slot)}
            calzada={calzadas.get(slot)}
            material={material}
            piel={cambioDePiel}
            color={
              indice === undefined || indice === SIN_COLOR
                ? null
                : (COLORES_ROPA[indice]?.celda as Celda)
            }
          />
        );
      })}
    </group>
  );
}

/**
 * El pack no marca qué prenda tapa a cuál: lo deduce de su tamaño. Un top
 * que llega a la cabeza trae capucha, y uno que llega al suelo trae botas.
 */
function aQueTapa(top: Mesh | null, cuerpo: Mesh | undefined): Slot[] {
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

function Pieza({
  malla,
  calzada,
  material,
  piel,
  color,
}: {
  malla: Mesh | null | undefined;
  calzada?: BufferGeometry;
  material: MeshStandardMaterial;
  piel: { desde: Celda; hasta: Celda } | null;
  color?: Celda | null;
}) {
  const geometria = useMemo(() => {
    const base = calzada ?? malla?.geometry;
    if (!base) return null;
    return recolorear(base, piel, color ?? null);
  }, [malla, calzada, piel, color]);

  if (!malla || !geometria) return null;

  return (
    <mesh
      geometry={geometria}
      material={material}
      position={malla.position}
      quaternion={malla.quaternion}
      scale={malla.scale}
      castShadow
      receiveShadow
    />
  );
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

SLOTS.forEach((slot) => useGLTF.preload(archivoDe(slot), DRACO));
useGLTF.preload(CUERPO, DRACO);
