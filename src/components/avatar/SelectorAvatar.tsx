"use client";

import { Suspense, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import type { WebGLRenderer } from "three";
import { Escena } from "./Escena";
import { Frontera } from "./Frontera";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import type { Perfil } from "@/lib/perfil";
import { COLORES_ROPA, PIELES, UNA_PIEZA, type Color } from "@/lib/paleta";
import {
  AVATAR,
  ATUENDO_INICIAL,
  atuendoDe,
  iconoDe,
  NOMBRE_SLOT,
  OBLIGATORIOS,
  SIN_COLOR,
  SLOTS,
  type Atuendo,
  type Slot,
} from "@/lib/vestuario";

const DRACO = "/draco/";
/** la foto del avatar viaja dentro del perfil, así que va chica */
const LADO_MINIATURA = 128;

export function SelectorAvatar({
  titulo = "Tu avatar",
  textoGuardar = "Guardar mi avatar",
  alGuardar,
}: {
  /** el onboarding ya pone su propio título más arriba */
  titulo?: string | null;
  textoGuardar?: string;
  /**
   * Quién escribe el perfil. El onboarding se mete aquí para dar por
   * terminada la presentación en la misma escritura que el avatar.
   */
  alGuardar?: (cambios: Partial<Perfil>) => Promise<void>;
} = {}) {
  const { perfil, guardar: guardarEnPerfil } = usePerfil();
  const guardarPerfil = alGuardar ?? guardarEnPerfil;
  const renderizador = useRef<WebGLRenderer | null>(null);

  // el perfil ya viene leído, así que el atuendo guardado se pone de una
  const [atuendo, setAtuendo] = useState<Atuendo>(() => atuendoDe(perfil.avatar));
  const [slot, setSlot] = useState<Slot>("Hair");
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  function ponerse(pieza: string | null) {
    const piezas = { ...atuendo.piezas, [slot]: pieza };

    // un vestido o un overol cubre también las piernas: fuera el pantalón
    if (slot === "Top") {
      piezas.Bottom = pieza && UNA_PIEZA.has(pieza)
        ? null
        : (atuendo.piezas.Bottom ?? ATUENDO_INICIAL.piezas.Bottom);
    }

    // y al elegir pantalón, el de una pieza deja paso a una polera normal
    const arriba = piezas.Top;
    if (slot === "Bottom" && arriba && UNA_PIEZA.has(arriba)) {
      piezas.Top = ATUENDO_INICIAL.piezas.Top;
    }

    setAtuendo({ ...atuendo, piezas });
  }

  function pintar(indice: number) {
    setAtuendo({ ...atuendo, colores: { ...atuendo.colores, [slot]: indice } });
  }

  async function guardar() {
    setGuardando(true);
    setAviso(null);
    try {
      const miniatura = retratar(renderizador.current);
      await guardarPerfil({
        avatar: JSON.stringify({ atuendo, miniatura }),
        miniatura,
      });
      setAviso("¡Listo! Tu avatar quedó guardado.");
    } catch {
      setAviso("No pudimos guardar tu avatar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {titulo && (
        <h1 className="text-3xl font-extrabold text-sky-800">{titulo}</h1>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="overflow-hidden rounded-3xl bg-white p-4 shadow-sm">
          <div className="h-[26rem] w-full overflow-hidden rounded-2xl lg:h-[34rem]">
            <Frontera aviso="No pudimos cargar tu avatar. Prueba a recargar la página.">
              <Suspense fallback={<Cargando />}>
                <Escena
                  atuendo={atuendo}
                  alCrear={(gl) => {
                    renderizador.current = gl;
                  }}
                />
              </Suspense>
            </Frontera>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm">
          <nav className="flex flex-wrap gap-2">
            {SLOTS.map((cual) => (
              <button
                key={cual}
                type="button"
                onClick={() => setSlot(cual)}
                aria-pressed={cual === slot}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  cual === slot
                    ? "bg-sky-500 text-white shadow"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {NOMBRE_SLOT[cual]}
              </button>
            ))}
          </nav>

          <Paleta
            titulo={`Color de ${NOMBRE_SLOT[slot].toLowerCase()}`}
            colores={COLORES_ROPA}
            elegido={atuendo.colores[slot] ?? SIN_COLOR}
            alElegir={pintar}
          />

          <Paleta
            titulo="Tono de piel"
            colores={PIELES}
            elegido={atuendo.piel}
            alElegir={(piel) => setAtuendo({ ...atuendo, piel })}
          />

          <Frontera aviso="No pudimos cargar el vestuario.">
            <Suspense fallback={<Cargando />}>
              <Piezas
                slot={slot}
                puesta={atuendo.piezas[slot] ?? null}
                alElegir={ponerse}
              />
            </Suspense>
          </Frontera>
        </section>
      </div>

      {aviso && (
        <p className="rounded-3xl bg-emerald-100 p-4 font-bold text-emerald-900">
          {aviso}
        </p>
      )}

      <button
        type="button"
        onClick={guardar}
        disabled={guardando}
        className="self-start rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600 disabled:opacity-40"
      >
        {guardando ? "Guardando…" : textoGuardar}
      </button>
    </div>
  );
}

/** La lista de piezas sale del propio archivo 3D, sin catálogo aparte. */
function Piezas({
  slot,
  puesta,
  alElegir,
}: {
  slot: Slot;
  puesta: string | null;
  alElegir: (pieza: string | null) => void;
}) {
  const { nodes } = useGLTF(AVATAR, DRACO);
  const piezas = Object.keys(nodes).filter((nombre) =>
    nombre.startsWith(`${slot}_`),
  );

  return (
    <ul className="grid max-h-[26rem] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-3">
      {!OBLIGATORIOS.includes(slot) && (
      <li>
        <button
          type="button"
          onClick={() => alElegir(null)}
          aria-pressed={puesta === null}
          className={`flex aspect-square w-full items-center justify-center rounded-2xl border-2 text-xs font-bold ${
            puesta === null
              ? "border-sky-500 bg-sky-50 text-sky-700"
              : "border-slate-200 text-slate-500"
          }`}
        >
          Ninguno
        </button>
      </li>
      )}

      {piezas.map((pieza) => (
        <li key={pieza}>
          <Ficha
            pieza={pieza}
            elegida={pieza === puesta}
            alElegir={() => alElegir(pieza)}
          />
        </li>
      ))}
    </ul>
  );
}

/** El pack no trae icono de todas las piezas: esas se muestran por su nombre. */
function Ficha({
  pieza,
  elegida,
  alElegir,
}: {
  pieza: string;
  elegida: boolean;
  alElegir: () => void;
}) {
  const [sinIcono, setSinIcono] = useState(false);

  return (
    <button
      type="button"
      onClick={alElegir}
      aria-pressed={elegida}
      title={pieza}
      className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 p-1 transition ${
        elegida
          ? "border-sky-500 bg-sky-50"
          : "border-slate-200 hover:border-sky-300"
      }`}
    >
      {sinIcono ? (
        <span className="text-center text-[10px] font-bold leading-tight text-slate-500">
          {pieza.split("_").slice(1).join(" ")}
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={iconoDe(pieza)}
          alt={pieza}
          loading="lazy"
          onError={() => setSinIcono(true)}
          className="h-full w-full object-contain"
        />
      )}
    </button>
  );
}

/** Los colores del pack, cada uno con su muestra. */
function Paleta({
  titulo,
  colores,
  elegido,
  alElegir,
}: {
  titulo: string;
  colores: Color[];
  elegido: number;
  alElegir: (indice: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        <li>
          <button
            type="button"
            onClick={() => alElegir(SIN_COLOR)}
            aria-pressed={elegido === SIN_COLOR}
            title="El color original"
            className={`h-7 rounded-full border-2 px-2 text-[10px] font-bold ${
              elegido === SIN_COLOR
                ? "border-sky-500 text-sky-700"
                : "border-slate-200 text-slate-500"
            }`}
          >
            Original
          </button>
        </li>

        {colores.map((color, indice) => (
          <li key={color.nombre}>
            <button
              type="button"
              onClick={() => alElegir(indice)}
              aria-pressed={indice === elegido}
              title={color.nombre}
              style={{ background: color.muestra }}
              className={`h-7 w-7 rounded-full border-2 transition ${
                indice === elegido
                  ? "border-sky-500 ring-2 ring-sky-200"
                  : "border-white shadow-sm hover:scale-110"
              }`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cargando() {
  return (
    <p className="py-10 text-center font-bold text-slate-400">
      Preparando el vestuario…
    </p>
  );
}

/** Saca una foto chica del lienzo para guardarla junto al avatar. */
function retratar(renderizador: WebGLRenderer | null) {
  if (!renderizador) return null;

  const lienzo = document.createElement("canvas");
  lienzo.width = LADO_MINIATURA;
  lienzo.height = LADO_MINIATURA;

  const pincel = lienzo.getContext("2d");
  if (!pincel) return null;

  const origen = renderizador.domElement;
  const lado = Math.min(origen.width, origen.height);

  pincel.drawImage(
    origen,
    (origen.width - lado) / 2,
    0,
    lado,
    lado,
    0,
    0,
    LADO_MINIATURA,
    LADO_MINIATURA,
  );

  return lienzo.toDataURL("image/png");
}
