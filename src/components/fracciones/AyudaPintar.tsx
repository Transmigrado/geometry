"use client";

import { useState } from "react";
import { Figura } from "./Figura";
import {
  comoTexto,
  type Ejercicio,
  unidadesDeEjercicio,
} from "@/lib/fracciones";
import { useReproduccion } from "@/components/problema/animacion";

const PASO_MS = 280;
const LLENADO_MS = 480;

export function AyudaPintar({ ejercicio }: { ejercicio: Ejercicio }) {
  const unidad = Math.max(...ejercicio.piezas.map((pieza) => pieza.valor.denominador));
  const espaciosObjetivo = Math.round(
    (ejercicio.objetivo.numerador * unidad) / ejercicio.objetivo.denominador,
  );
  const piezas = unidadesDeEjercicio(ejercicio);
  const duracion = (espaciosObjetivo - 1) * PASO_MS + LLENADO_MS;
  const { t, reproduciendo, reproducir, ir } = useReproduccion(duracion);
  const [iniciada, setIniciada] = useState(false);
  const tiempo = iniciada ? t * duracion : 0;
  const avance = iniciada ? t : 0;

  const pintadas = new Set(
    piezas
      .slice(0, espaciosObjetivo)
      .filter((_, indice) => iniciada && progresoDe(indice, tiempo) > 0)
      .map((pieza) => pieza.id),
  );
  const completas = piezas
    .slice(0, espaciosObjetivo)
    .filter((_, indice) => progresoDe(indice, tiempo) >= 1).length;
  const colores = Object.fromEntries(
    piezas.slice(0, espaciosObjetivo).map((pieza) => [pieza.id, "#0ea5e9"]),
  );

  function iniciar() {
    setIniciada(true);
    reproducir();
  }

  function moverBarra(valor: number) {
    setIniciada(true);
    ir(valor / 100);
  }

  return (
    <aside className="w-full rounded-3xl border-2 border-violet-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-center text-xl font-extrabold text-violet-950">
        Miremos las partes más pequeñas
      </h2>
      <p className="mt-1 text-center text-slate-600">
        Dividimos las partes grandes para que todas tengan el tamaño de la más pequeña.
        Cada espacio vale 1/{unidad}. Para pintar {comoTexto(ejercicio.objetivo)},
        necesitamos {espaciosObjetivo} de esos {unidad} espacios.
      </p>

      <div className="mx-auto mt-4 w-64 max-w-full rounded-2xl bg-violet-50 p-3">
        <Figura
          piezas={piezas}
          pintadas={pintadas}
          colores={colores}
          alTocar={() => {}}
          bloqueada
        />
      </div>
      <p className="mt-2 text-center font-bold text-slate-700" aria-live="polite">
        {completas} de {espaciosObjetivo} espacios pintados
      </p>

      <label htmlFor="recorrido-pintar" className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 font-bold text-slate-700">
        <span className="flex justify-between">
          <span>Avance de la ayuda</span>
          <span>{Math.round(avance * 100)}%</span>
        </span>
        <input
          id="recorrido-pintar"
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(avance * 100)}
          onChange={(evento) => moverBarra(Number(evento.target.value))}
          aria-label="Avance de la ayuda visual"
          className="w-full cursor-pointer accent-violet-600"
        />
      </label>
      <button
        type="button"
        onClick={iniciar}
        disabled={reproduciendo}
        className="mx-auto mt-4 block rounded-full bg-violet-100 px-5 py-2 font-bold text-violet-950 transition hover:bg-violet-200 disabled:opacity-50"
      >
        {reproduciendo ? "Pintando…" : avance > 0 ? "Repetir ayuda" : "Reproducir ayuda"}
      </button>
    </aside>
  );
}

function progresoDe(indice: number, tiempo: number) {
  return Math.min(1, Math.max(0, (tiempo - indice * PASO_MS) / LLENADO_MS));
}
