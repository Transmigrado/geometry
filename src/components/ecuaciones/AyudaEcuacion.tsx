"use client";

import { useState } from "react";
import { Balanza } from "./Balanza";
import type { Ejercicio, Fruta } from "@/lib/ecuaciones";
import { useReproduccion } from "@/components/problema/animacion";

const PASO_MS = 900;

export function AyudaEcuacion({ ejercicio }: { ejercicio: Ejercicio }) {
  const { fruta, cantidad, peso, extra, total } = ejercicio;
  const conPesa = extra > 0;
  // con pesa: un paso para quitarla y uno por cada fruta que sobra;
  // sin pesa: un paso por cada fruta que sobra (la última se queda sola).
  const eventos = conPesa ? cantidad : cantidad - 1;
  const duracion = eventos * PASO_MS;
  const { t, reproduciendo, reproducir, ir } = useReproduccion(duracion);
  const [iniciada, setIniciada] = useState(false);

  const avance = iniciada ? t : 0;
  const hechos = Math.min(eventos, Math.floor((avance * duracion) / PASO_MS + 0.001));

  const pesaQuitada = conPesa && hechos >= 1;
  const frutasQuitadas = conPesa ? hechos - 1 : hechos;
  const restantes = cantidad - Math.max(0, frutasQuitadas);
  const marca = conPesa && !pesaQuitada ? total : restantes * peso;

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
        Vamos quitando de a una
      </h2>
      <p className="mt-1 text-center text-slate-600">
        {textoDe({ hechos, conPesa, extra, total, cantidad, restantes, peso, fruta })}
      </p>

      <div className="mt-4">
        <Balanza
          fruta={fruta}
          cantidad={restantes}
          extra={conPesa && !pesaQuitada ? extra : 0}
          marca={marca}
          correcta={null}
        />
      </div>

      <label htmlFor="recorrido-ecuacion" className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 font-bold text-slate-700">
        <span className="flex justify-between">
          <span>Avance de la ayuda</span>
          <span>{Math.round(avance * 100)}%</span>
        </span>
        <input
          id="recorrido-ecuacion"
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
        {reproduciendo ? "Quitando…" : avance > 0 ? "Repetir ayuda" : "Reproducir ayuda"}
      </button>
    </aside>
  );
}

function textoDe({
  hechos,
  conPesa,
  extra,
  total,
  cantidad,
  restantes,
  peso,
  fruta,
}: {
  hechos: number;
  conPesa: boolean;
  extra: number;
  total: number;
  cantidad: number;
  restantes: number;
  peso: number;
  fruta: Fruta;
}) {
  if (hechos === 0) {
    return `Así empezamos: ${cantidad} ${fruta.plural}${
      conPesa ? ` y una pesa de ${extra}` : ""
    } marcan ${total}.`;
  }
  if (conPesa && hechos === 1) {
    return `Primero quitamos la pesa de ${extra}: ${total} − ${extra} = ${total - extra}.`;
  }
  if (restantes === 1) {
    return `Con una sola ${fruta.nombre}, la pesa marca justo lo que pesa: ${peso}.`;
  }
  return `Quitamos una ${fruta.nombre} y la pesa baja a ${restantes * peso}: quedan ${restantes} ${fruta.plural}.`;
}
