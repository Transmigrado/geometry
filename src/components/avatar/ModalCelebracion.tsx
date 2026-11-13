"use client";

import { Suspense, useEffect, useRef } from "react";
import { Confeti } from "./Confeti";
import { Escena } from "./Escena";
import { Frontera } from "./Frontera";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import {
  Modal,
  ModalBody,
  ModalContent,
  useModal,
} from "@/components/ui/animated-modal";
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

/** cuánto tarda el modal en irse antes de avisarle a quien lo llamó, para
 * no cortarle la animación de salida a mitad de camino */
const DURACION_SALIDA = 300;

/**
 * Cada cinco respuestas correctas, el propio muñeco del niño celebra. No es
 * sólo un cartel de «bien hecho»: verse a uno mismo contento es lo que hace
 * que valga la pena seguir jugando.
 *
 * El modal en sí —la entrada en 3D, el desenfoque de fondo, el cierre con
 * la X o tocando afuera— es el de Aceternity; lo de adentro es nuestro.
 */
export function ModalCelebracion({
  racha,
  onContinuar,
}: {
  racha: number;
  onContinuar: () => void;
}) {
  return (
    <Modal>
      <Celebracion racha={racha} onContinuar={onContinuar} />
    </Modal>
  );
}

function Celebracion({
  racha,
  onContinuar,
}: {
  racha: number;
  onContinuar: () => void;
}) {
  const { open, setOpen } = useModal();
  const { perfil, guardar } = usePerfil();
  const atuendo = atuendoDe(perfil.avatar);
  const otorgadas = useRef(false);
  const huboAbierto = useRef(false);

  // se abre solo: nadie hace clic en un botón para que aparezca la fiesta
  useEffect(() => {
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // no closable: la única forma de cerrarlo es «Continuar», para no
  // pisarle al niño un toque que en realidad iba para el juego de atrás.
  // Igual se espera a que termine de salir antes de avisarle al padre
  useEffect(() => {
    if (open) {
      huboAbierto.current = true;
      return;
    }
    if (!huboAbierto.current) return;

    const id = setTimeout(onContinuar, DURACION_SALIDA);
    return () => clearTimeout(id);
  }, [open, onContinuar]);

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
    <ModalBody closable={false} className="max-w-sm border-0 bg-transparent shadow-none">
      <ModalContent className="relative items-center gap-4 overflow-hidden rounded-3xl bg-white p-6 text-center md:p-6">
        <Confeti />

        <p className="text-2xl font-extrabold text-sky-800">
          🎉 ¡Llevas {racha} bien!
        </p>

        <div className="h-64 w-full overflow-hidden rounded-2xl bg-sky-50">
          <Frontera aviso="🎉">
            <Suspense fallback={<CargandoAvatar />}>
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
          onClick={() => setOpen(false)}
          className="rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
        >
          Continuar
        </button>
      </ModalContent>
    </ModalBody>
  );
}

/** Sólo se ve si alguien llega a la racha antes de que termine de precargar
 * el modelo y la paleta —raro, porque eso arranca apenas se entra al
 * juego—, así que un gesto simple basta. */
function CargandoAvatar() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="animate-bounce text-4xl" aria-hidden>
        🎉
      </span>
    </div>
  );
}
