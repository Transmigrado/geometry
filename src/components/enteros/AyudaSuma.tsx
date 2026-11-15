"use client";

import { useState } from "react";
import { RectaNumerica } from "./RectaNumerica";
import type { Ejercicio } from "@/lib/enteros";
import { useReproduccion } from "@/components/problema/animacion";

const PASO_MS = 1200;

export function AyudaSuma({ ejercicio }: { ejercicio: Ejercicio }) {
  const { a, b, resultado } = ejercicio;
  const duracion = 2 * PASO_MS;
  const { t, reproduciendo, reproducir, ir } = useReproduccion(duracion);
  const [iniciada, setIniciada] = useState(false);

  const avance = iniciada ? t : 0;
  const tiempo = avance * duracion;

  const enFase1 = tiempo < PASO_MS;
  const progresoFase1 = Math.min(1, tiempo / PASO_MS);
  const progresoFase2 = Math.min(1, Math.max(0, tiempo - PASO_MS) / PASO_MS);

  const posicion = enFase1
    ? a * suavizar(progresoFase1)
    : a + b * suavizar(progresoFase2);
  const retrocediendo = enFase1
    ? a < 0 && progresoFase1 < 1
    : b < 0 && progresoFase2 < 1;

  const hechos = !iniciada || enFase1 ? 0 : progresoFase2 < 1 ? 1 : 2;

  function iniciar() {
    setIniciada(true);
    reproducir();
  }

  function moverBarra(valor: number) {
    setIniciada(true);
    ir(valor / 100);
  }

  return (
    <aside className="w-full rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-center text-xl font-extrabold text-sky-950">
        Sigamos al auto
      </h2>
      <p className="mt-1 text-center text-slate-600">
        {textoDe({ hechos, a, b, resultado })}
      </p>

      <div className="mt-4">
        <RectaNumerica posicion={posicion} retrocediendo={retrocediendo} />
      </div>

      <label htmlFor="recorrido-suma" className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 font-bold text-slate-700">
        <span className="flex justify-between">
          <span>Avance de la ayuda</span>
          <span>{Math.round(avance * 100)}%</span>
        </span>
        <input
          id="recorrido-suma"
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(avance * 100)}
          onChange={(evento) => moverBarra(Number(evento.target.value))}
          aria-label="Avance de la ayuda visual"
          className="w-full cursor-pointer accent-sky-600"
        />
      </label>
      <button
        type="button"
        onClick={iniciar}
        disabled={reproduciendo}
        className="mx-auto mt-4 block rounded-full bg-sky-100 px-5 py-2 font-bold text-sky-950 transition hover:bg-sky-200 disabled:opacity-50"
      >
        {reproduciendo ? "Manejando…" : avance > 0 ? "Repetir ayuda" : "Reproducir ayuda"}
      </button>
    </aside>
  );
}

function textoDe({
  hechos,
  a,
  b,
  resultado,
}: {
  hechos: number;
  a: number;
  b: number;
  resultado: number;
}) {
  if (hechos === 0) {
    return `Desde el 0, el auto ${a < 0 ? "retrocede" : "avanza"} ${Math.abs(a)} y llega a ${a}.`;
  }
  if (hechos === 1) {
    return `Ahora ${b < 0 ? "retrocede" : "avanza"} ${Math.abs(b)} más: de ${a} llega a ${resultado}.`;
  }
  return `Por eso ${a} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${resultado}.`;
}

function suavizar(valor: number) {
  return valor * valor * (3 - 2 * valor);
}
