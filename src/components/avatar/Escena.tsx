"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import {
  MeshStandardMaterial,
  NearestFilter,
  SRGBColorSpace,
  type Mesh,
  type WebGLRenderer,
} from "three";
import {
  archivoDe,
  CUERPO,
  PALETA,
  SLOTS,
  type Atuendo,
} from "@/lib/vestuario";

/** el decodificador vive en public, para no depender de un CDN ajeno */
const DRACO = "/draco/";

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
      // el personaje mide 1,7 con los pies en el suelo: la cámara lo mira
      // desde su cintura y a distancia suficiente para que entre entero
      camera={{ position: [0, 0.95, 3.4], fov: 32 }}
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
        target={[0, 0.8, 0]}
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

  return (
    <group>
      <Pieza archivo={CUERPO} nombre="Cuerpo" material={material} />
      {SLOTS.map((slot) => (
        <Pieza
          key={slot}
          archivo={archivoDe(slot)}
          nombre={atuendo[slot] ?? null}
          material={material}
        />
      ))}
    </group>
  );
}

function Pieza({
  archivo,
  nombre,
  material,
}: {
  archivo: string;
  nombre: string | null;
  material: MeshStandardMaterial;
}) {
  // se carga igual aunque no haya nada puesto, para que al elegir ya esté
  const { nodes } = useGLTF(archivo, DRACO);

  if (!nombre) return null;
  const nodo = nodes[nombre] as Mesh | undefined;
  if (!nodo?.geometry) return null;

  return (
    <mesh
      geometry={nodo.geometry}
      material={material}
      position={nodo.position}
      quaternion={nodo.quaternion}
      scale={nodo.scale}
      castShadow
      receiveShadow
    />
  );
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
