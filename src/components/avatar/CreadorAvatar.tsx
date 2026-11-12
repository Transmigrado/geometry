"use client";

import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/auth/ProveedorSesion";
import {
  guardarPerfil,
  leerPerfil,
  miniaturaDe,
  PERFIL_VACIO,
  type Perfil,
} from "@/lib/perfil";

/** El build de Unity, tal como sale exportado, vive en public/avatar. */
const CARPETA = "/avatar/Build";
const NOMBRE = "avatar_selector";
/** viene comprimido con brotli; next.config declara el Content-Encoding */
const COMPRESION = ".br";
/** El objeto de la escena que recibe los mensajes desde la web. */
const OBJETO = "Avatar";

type Instancia = {
  SendMessage: (objeto: string, metodo: string, dato?: string) => void;
  Quit: () => Promise<void>;
};

declare global {
  interface Window {
    createUnityInstance?: (
      lienzo: HTMLCanvasElement,
      configuracion: Record<string, unknown>,
      alAvanzar?: (progreso: number) => void,
    ) => Promise<Instancia>;
    /** Unity llama aquí cuando el avatar está listo. */
    materamaAvatarListo?: (json: string) => void;
  }
}

type Estado = "cargando" | "listo" | "sinBuild" | "falla";

export function CreadorAvatar() {
  const { usuario } = useSesion();
  const lienzo = useRef<HTMLCanvasElement>(null);
  const unity = useRef<Instancia | null>(null);

  const [estado, setEstado] = useState<Estado>("cargando");
  const [progreso, setProgreso] = useState(0);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO);
  const [aviso, setAviso] = useState<string | null>(null);

  const uid = usuario?.uid;

  // lo guardado se lee primero, para devolvérselo a Unity al arrancar
  useEffect(() => {
    if (!uid) return;
    let vigente = true;

    leerPerfil(uid)
      .then((guardado) => {
        if (vigente) setPerfil(guardado);
      })
      .catch(() => setAviso("No pudimos leer tu avatar guardado."));

    return () => {
      vigente = false;
    };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    // en desarrollo React monta dos veces; si la primera instancia llega
    // tarde hay que despedirla en vez de dejar dos Unity vivos
    let vigente = true;

    const guion = document.createElement("script");
    guion.src = `${CARPETA}/${NOMBRE}.loader.js`;

    guion.onerror = () => setEstado("sinBuild");
    guion.onload = () => {
      if (!lienzo.current || !window.createUnityInstance) {
        setEstado("sinBuild");
        return;
      }

      window
        .createUnityInstance(
          lienzo.current,
          {
            dataUrl: `${CARPETA}/${NOMBRE}.data${COMPRESION}`,
            frameworkUrl: `${CARPETA}/${NOMBRE}.framework.js${COMPRESION}`,
            codeUrl: `${CARPETA}/${NOMBRE}.wasm${COMPRESION}`,
            streamingAssetsUrl: "/avatar/StreamingAssets",
            companyName: "DefaultCompany",
            productName: "Avatar Selector",
            productVersion: "0.1.0",
          },
          (avance) => setProgreso(avance),
        )
        .then((instancia) => {
          if (!vigente) {
            instancia.Quit().catch(() => {});
            return;
          }
          unity.current = instancia;
          setEstado("listo");
        })
        .catch(() => {
          if (vigente) setEstado("falla");
        });
    };

    document.body.appendChild(guion);

    return () => {
      vigente = false;
      unity.current?.Quit().catch(() => {});
      unity.current = null;
      guion.remove();
    };
  }, [uid]);

  // cuando Unity ya está en pie, se le devuelve el avatar de la última vez
  useEffect(() => {
    if (estado !== "listo" || !perfil.avatar) return;
    unity.current?.SendMessage(OBJETO, "Cargar", perfil.avatar);
  }, [estado, perfil.avatar]);

  // el canal por el que Unity entrega el avatar terminado
  useEffect(() => {
    if (!uid) return;

    window.materamaAvatarListo = (json: string) => {
      const nuevo: Perfil = { avatar: json, miniatura: miniaturaDe(json) };
      setPerfil(nuevo);
      guardarPerfil(uid, nuevo)
        .then(() => setAviso("¡Listo! Tu avatar quedó guardado."))
        .catch(() => setAviso("No pudimos guardar tu avatar."));
    };

    return () => {
      delete window.materamaAvatarListo;
    };
  }, [uid]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-sky-800">Tu avatar</h1>
        {perfil.miniatura && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={perfil.miniatura}
            alt="Tu avatar guardado"
            className="h-16 w-16 rounded-full border-4 border-sky-200 object-cover"
          />
        )}
      </header>

      <section className="overflow-hidden rounded-3xl bg-white p-4 shadow-sm">
        <div className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-900">
          {/* el id es obligatorio: Unity busca el canvas por selector para
              engancharle el teclado, y sin id arma un "#" inválido */}
          <canvas id="unity-canvas" ref={lienzo} className="h-full w-full" />

          {estado !== "listo" && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              {estado === "cargando" && (
                <p className="text-lg font-bold text-white">
                  Preparando tu avatar… {Math.round(progreso * 100)}%
                </p>
              )}
              {estado === "falla" && (
                <p className="text-lg font-bold text-rose-200">
                  Unity no pudo arrancar. Mira la consola del navegador.
                </p>
              )}
              {estado === "sinBuild" && (
                <p className="max-w-md font-semibold text-slate-200">
                  Todavía no está el creador de avatares. Exporta el proyecto
                  de Unity como WebGL con el nombre{" "}
                  <code className="text-sky-300">{NOMBRE}</code> y copia la
                  carpeta <code className="text-sky-300">Build</code> dentro de{" "}
                  <code className="text-sky-300">public/avatar/</code>. Los
                  detalles están en <code className="text-sky-300">UNITY.md</code>.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {aviso && (
        <p className="rounded-3xl bg-emerald-100 p-4 font-bold text-emerald-900">
          {aviso}
        </p>
      )}

      <button
        type="button"
        disabled={estado !== "listo"}
        onClick={() => unity.current?.SendMessage(OBJETO, "Exportar")}
        className="self-start rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600 disabled:opacity-40"
      >
        Guardar mi avatar
      </button>
    </div>
  );
}
