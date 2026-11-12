"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { useSesion } from "@/components/auth/ProveedorSesion";
import { SelectorAvatar } from "@/components/avatar/SelectorAvatar";
import {
  conSello,
  edadDe,
  pasoPendiente,
  pasosDe,
  type Paso,
  type Perfil,
  type Rol,
} from "@/lib/perfil";
import { CASA, PERFILES } from "@/lib/roles";

const TITULO: Record<Paso, string> = {
  perfil: "¿Quién eres?",
  nombre: "¿Cómo te llamas?",
  nacimiento: "¿Cuándo es tu cumpleaños?",
  avatar: "Y ahora, ¡tú!",
};

const PIE: Record<Paso, string> = {
  perfil: "Según lo que elijas verás unas pantallas u otras.",
  nombre: "Para saludarte cada vez que entres.",
  nacimiento: "Lo usamos para proponerte problemas de tu edad.",
  avatar: "Elige tu pelo, tu ropa y tus zapatos. Después puedes cambiarlo.",
};

const CAMPO =
  "w-full rounded-2xl border-2 border-sky-200 px-4 py-3 text-xl font-bold text-slate-800 focus:border-sky-500 focus:outline-none";
const ETIQUETA = "text-sm font-bold uppercase tracking-wide text-slate-500";

/**
 * Las tres preguntas de la primera vez. Cada una se guarda apenas se
 * contesta, así que cerrar la pestaña a mitad de camino no pierde nada: al
 * volver, el onboarding sigue donde iba.
 */
export function Onboarding() {
  const { perfil } = usePerfil();
  const guardarPaso = useGuardarPaso();

  // quien llega sin nombre empieza por el principio; quien ya había
  // empezado, donde lo dejó. Desde ahí manda él: puede volver atrás a
  // corregirse sin tener que borrar lo que ya puso
  const [paso, setPaso] = useState<Paso>(() =>
    perfil.nombre ? (pasoPendiente(perfil) ?? "perfil") : "perfil",
  );

  const pasos = pasosDe(perfil.rol);
  const cual = pasos.indexOf(paso);
  const anterior = pasos[cual - 1];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {pasos.map((otro, indice) => (
            <span
              key={otro}
              className={`h-2 flex-1 rounded-full transition ${
                indice <= cual ? "bg-sky-500" : "bg-sky-100"
              }`}
            />
          ))}
        </div>
        <p className={ETIQUETA}>
          Paso {cual + 1} de {pasos.length}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-sky-800">
          {TITULO[paso]}
        </h1>
        <p className="text-lg text-slate-600">{PIE[paso]}</p>
      </div>

      {paso === "perfil" && (
        <PreguntaPerfil alSeguir={() => setPaso("nombre")} />
      )}
      {paso === "nombre" && (
        <PreguntaNombre
          alSeguir={() =>
            perfil.rol === "student" ? setPaso("nacimiento") : undefined
          }
        />
      )}
      {paso === "nacimiento" && (
        <PreguntaNacimiento alSeguir={() => setPaso("avatar")} />
      )}
      {paso === "avatar" && (
        <SelectorAvatar
          titulo={null}
          textoGuardar="¡Listo, a jugar!"
          // el avatar es la última pregunta: al guardarlo se cierra la
          // presentación y se entra a la app
          alGuardar={guardarPaso}
        />
      )}

      {anterior && (
        <button
          type="button"
          onClick={() => setPaso(anterior)}
          className="self-start rounded-full px-4 py-2 font-bold text-sky-700 hover:bg-sky-100"
        >
          ← Volver
        </button>
      )}
    </div>
  );
}

/**
 * Quién eres. El rol que se elija aquí no da poder sobre nadie: ser
 * profesor de verdad pasa por canjear la invitación de un colegio, y
 * administrar a un niño, por su código de familia.
 */
function PreguntaPerfil({ alSeguir }: { alSeguir: () => void }) {
  const { perfil, guardar } = usePerfil();
  const [guardando, setGuardando] = useState<Rol | null>(null);

  async function elegir(rol: Rol) {
    setGuardando(rol);
    try {
      if (rol !== perfil.rol) await guardar({ rol });
      alSeguir();
    } catch {
      setGuardando(null);
    }
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {PERFILES.map((cual) => (
        <li key={cual.rol}>
          <button
            type="button"
            onClick={() => elegir(cual.rol)}
            disabled={guardando !== null}
            aria-pressed={cual.rol === perfil.rol}
            className={`flex w-full items-start gap-4 rounded-3xl border-2 bg-white p-5 text-left transition disabled:opacity-50 ${
              cual.rol === perfil.rol
                ? "border-sky-500 shadow"
                : "border-transparent shadow-sm hover:border-sky-300"
            }`}
          >
            <span className="text-3xl" aria-hidden>{cual.emoji}</span>
            <span className="flex flex-col gap-1">
              <span className="text-lg font-extrabold text-sky-800">
                {cual.titulo}
              </span>
              <span className="text-sm text-slate-600">{cual.pie}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function PreguntaNombre({ alSeguir }: { alSeguir: () => void }) {
  const { perfil } = usePerfil();
  const { usuario } = useSesion();

  // si entró con Google ya sabemos cómo firma: se propone y que corrija
  const firma = usuario?.displayName?.trim().split(/\s+/) ?? [];
  const [nombre, setNombre] = useState(perfil.nombre ?? firma[0] ?? "");
  const [apellido, setApellido] = useState(
    perfil.apellido ?? firma.slice(1).join(" "),
  );
  const guardado = useGuardado(alSeguir);

  return (
    <Formulario
      guardado={guardado}
      sirve={Boolean(nombre.trim() && apellido.trim())}
      cambios={() => ({ nombre: nombre.trim(), apellido: apellido.trim() })}
    >
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={ETIQUETA}>Tu nombre</span>
          <input
            type="text"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            maxLength={30}
            autoFocus
            placeholder="Escribe tu nombre"
            className={CAMPO}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={ETIQUETA}>Tu apellido</span>
          <input
            type="text"
            value={apellido}
            onChange={(evento) => setApellido(evento.target.value)}
            maxLength={40}
            placeholder="Escribe tu apellido"
            className={CAMPO}
          />
        </label>
      </div>
    </Formulario>
  );
}

function PreguntaNacimiento({ alSeguir }: { alSeguir: () => void }) {
  const { perfil } = usePerfil();
  const [nacimiento, setNacimiento] = useState(perfil.nacimiento ?? "");

  const guardado = useGuardado(alSeguir);
  const edad = edadDe(nacimiento);

  return (
    <Formulario
      guardado={guardado}
      sirve={edad !== null}
      cambios={() => ({ nacimiento })}
    >
      <label className="flex max-w-sm flex-col gap-2">
        <span className={ETIQUETA}>Tu fecha de nacimiento</span>
        <input
          type="date"
          value={nacimiento}
          onChange={(evento) => setNacimiento(evento.target.value)}
          className={CAMPO}
        />
      </label>

      {edad !== null && (
        <p className="text-lg font-bold text-emerald-700">
          {edad === 1 ? "¡Tienes 1 año!" : `¡Tienes ${edad} años!`}
        </p>
      )}
    </Formulario>
  );
}

/**
 * Guarda un paso y, si con eso ya no queda nada que preguntar, lleva a
 * donde le toque: terminar de presentarse es entrar a la app, y la app de
 * un profesor no es la misma que la de un niño.
 */
function useGuardarPaso() {
  const { perfil, guardar } = usePerfil();
  const router = useRouter();

  return async (cambios: Partial<Perfil>) => {
    const sellados = conSello(perfil, cambios);
    await guardar(sellados);
    if (sellados.listo) router.replace(CASA[{ ...perfil, ...sellados }.rol]);
  };
}

/** El ir y venir de guardar, que es igual en las dos preguntas. */
function useGuardado(alSeguir: () => void) {
  const guardarPaso = useGuardarPaso();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    guardando,
    error,
    enviar: async (cambios: Partial<Perfil>) => {
      setGuardando(true);
      setError(null);
      try {
        await guardarPaso(cambios);
        alSeguir();
      } catch {
        setError("No pudimos guardarlo. ¿Lo intentamos otra vez?");
        setGuardando(false);
      }
    },
  };
}

/** La tarjeta con los campos, el aviso de error y el botón de seguir. */
function Formulario({
  guardado,
  sirve,
  cambios,
  children,
}: {
  guardado: ReturnType<typeof useGuardado>;
  sirve: boolean;
  /** lo que hay que guardar; se arma recién al enviar */
  cambios: () => Partial<Perfil>;
  children: React.ReactNode;
}) {
  const { guardando, error, enviar } = guardado;

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        if (sirve && !guardando) enviar(cambios());
      }}
      className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm"
    >
      {children}

      {error && (
        <p className="rounded-2xl bg-rose-100 p-3 font-bold text-rose-900">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!sirve || guardando}
        className="self-start rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600 disabled:opacity-40"
      >
        {guardando ? "Guardando…" : "Seguir"}
      </button>
    </form>
  );
}
