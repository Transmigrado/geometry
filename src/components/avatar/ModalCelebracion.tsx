"use client";

import { Suspense, useEffect } from "react";
import { Confeti } from "./Confeti";
import { Escena } from "./Escena";
import { Frontera } from "./Frontera";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { atuendoDe } from "@/lib/vestuario";

/** el niño ya no cabe entero con la cámara de siempre dentro de un modal
 * tan chico, así que esta se para un poco más lejos */
const ZOOM = 1.3;

const SONIDO = "/sonidos/celebracion.mp3";

/**
 * Cada cinco respuestas correctas, el propio muñeco del niño celebra. No es
 * sólo un cartel de «bien hecho»: verse a uno mismo contento es lo que hace
 * que valga la pena seguir jugando.
 */
export function ModalCelebracion({
  racha,
  onContinuar,
}: {
  racha: number;
  onContinuar: () => void;
}) {
  const { perfil } = usePerfil();
  const atuendo = atuendoDe(perfil.avatar);

  useEffect(() => {
    const audio = new Audio(SONIDO);
    // si el archivo todavía no existe, o el navegador bloquea el sonido,
    // que la fiesta siga en silencio antes que romper el modal
    audio.play().catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="relative flex w-full max-w-sm flex-col items-center gap-4 overflow-hidden rounded-3xl bg-white p-6 text-center shadow-xl">
        <Confeti />

        <p className="text-2xl font-extrabold text-sky-800">
          🎉 ¡Llevas {racha} bien!
        </p>

        <div className="h-64 w-full overflow-hidden rounded-2xl bg-sky-50">
          <Frontera aviso="🎉">
            <Suspense fallback={null}>
              <Escena atuendo={atuendo} animacion="Celebracion" zoom={ZOOM} />
            </Suspense>
          </Frontera>
        </div>

        <button
          type="button"
          onClick={onContinuar}
          className="rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
