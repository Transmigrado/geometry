"use client";

import { Suspense, useEffect, useRef } from "react";
import { Confeti } from "./Confeti";
import { Escena } from "./Escena";
import { Frontera } from "./Frontera";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { atuendoDe } from "@/lib/vestuario";

/** el niño ya no cabe entero con la cámara de siempre dentro de un modal
 * tan chico, así que esta se para un poco más lejos */
const ZOOM = 1.3;

/** fondo de fiesta, sin el pedestal: aquí no hay que elegir ropa, sólo
 * verlo celebrar */
const FONDO = "#bbf7d0";

const SONIDO = "/sonidos/celebracion.mp3";

/** lo que se gana cada vez que aparece esta fiesta */
const MONEDAS_POR_RACHA = 2;

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
  const { perfil, guardar } = usePerfil();
  const atuendo = atuendoDe(perfil.avatar);
  const otorgadas = useRef(false);

  useEffect(() => {
    const audio = new Audio(SONIDO);
    // si el archivo todavía no existe, o el navegador bloquea el sonido,
    // que la fiesta siga en silencio antes que romper el modal
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    // la referencia evita pagar dos veces si React vuelve a montar el
    // efecto en desarrollo; en producción monta una sola vez de todos modos
    if (otorgadas.current) return;
    otorgadas.current = true;

    guardar({ monedas: perfil.monedas + MONEDAS_POR_RACHA }).catch(() => {});
    // sólo al abrirse: no hay que repetir el pago si el perfil cambia
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <Escena
                atuendo={atuendo}
                animacion="Celebracion"
                zoom={ZOOM}
                plataforma={false}
                fondo={FONDO}
              />
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
