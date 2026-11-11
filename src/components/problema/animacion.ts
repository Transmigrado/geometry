"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

function suscribir(alCambiar: () => void) {
  const consulta = window.matchMedia(CONSULTA);
  consulta.addEventListener("change", alCambiar);
  return () => consulta.removeEventListener("change", alCambiar);
}

/** true si el sistema pide menos movimiento: entonces mostramos el final fijo. */
function useQuieto() {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
}

/** Avance de 0 a 1 que se repite para siempre. */
export function useBucle(duracion: number) {
  const quieto = useQuieto();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (quieto) return;

    let cuadro = 0;
    const inicio = performance.now();
    const paso = (ahora: number) => {
      setT(((ahora - inicio) % duracion) / duracion);
      cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [duracion, quieto]);

  return quieto ? 1 : t;
}

/** Avance de 0 a 1 que se reproduce una vez y se queda quieto al final. */
export function useReproduccion(duracion: number) {
  const quieto = useQuieto();
  const [t, setT] = useState(1);
  const [reproduciendo, setReproduciendo] = useState(false);
  const inicio = useRef(0);

  useEffect(() => {
    if (!reproduciendo || quieto) return;

    let cuadro = 0;
    inicio.current = performance.now();
    const paso = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio.current) / duracion);
      setT(avance);
      if (avance < 1) {
        cuadro = requestAnimationFrame(paso);
      } else {
        setReproduciendo(false);
      }
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [reproduciendo, duracion, quieto]);

  return {
    t,
    reproduciendo,
    reproducir: () => {
      if (quieto) {
        setT(1);
        return;
      }
      setT(0);
      setReproduciendo(true);
    },
    /** mover a mano detiene la reproducción */
    ir: (valor: number) => {
      setReproduciendo(false);
      setT(valor);
    },
  };
}
