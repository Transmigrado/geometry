"use client";

import { useState } from "react";
import { cronometro, registrar, type Tema } from "@/lib/metricas";
import { DESAFIOS } from "@/lib/desafios";

/** En geometría cada tema tiene un solo desafío, así que sale del catálogo. */
function desafioDe(tema: Tema) {
  return DESAFIOS.find((cual) => cual.tema === tema)?.id ?? tema;
}

/**
 * «Ahora te toca a ti». Antes de enseñar la cuenta, el niño dice qué le
 * sale.
 *
 * No es sólo pedagogía: sin esto el código no se entera de si acertó. Lo
 * único que sabría es que reveló la solución, y eso no distingue al que lo
 * resolvió de cabeza del que se rindió, así que el panel del profesor no
 * tendría nada que enseñar.
 *
 * Rendirse sigue estando permitido y no cuenta como fallo: se guarda como
 * un paseo, no como una respuesta.
 */
export function Adivina({
  esperada,
  tema,
  unidad,
  alResolver,
}: {
  esperada: number;
  tema: Tema;
  /** lo que se cuenta: «cubitos», «cajas»… */
  unidad: string;
  alResolver: () => void;
}) {
  const [dicho, setDicho] = useState("");
  const [acierto, setAcierto] = useState<boolean | null>(null);
  const [reloj] = useState(cronometro);

  const suyo = Number(dicho);
  const sirve = dicho.trim() !== "" && Number.isFinite(suyo) && suyo >= 0;

  function comprobar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!sirve || acierto !== null) return;

    const bien = Math.abs(suyo - esperada) < 1e-9;
    setAcierto(bien);

    registrar({
      modulo: "geometry",
      tema,
      desafio: desafioDe(tema),
      tipo: "answer",
      acierto: bien,
      duracion: reloj.ms(),
    });

    alResolver();
  }

  function rendirse() {
    setAcierto(null);
    registrar({
      modulo: "geometry",
      tema,
      desafio: desafioDe(tema),
      tipo: "explore",
      duracion: reloj.ms(),
    });
    alResolver();
  }

  return (
    <section className="flex flex-col gap-4 rounded-3xl border-4 border-dashed border-emerald-400 bg-white p-6">
      <p className="text-lg font-bold text-slate-700">
        ✏️ Ahora te toca a ti: mira los dibujos y dime cuántos{" "}
        {unidad} te salen.
      </p>

      <form onSubmit={comprobar} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Tu respuesta
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={dicho}
            onChange={(evento) => setDicho(evento.target.value)}
            disabled={acierto !== null}
            className="w-40 rounded-2xl border-2 border-emerald-300 px-4 py-3 text-2xl font-extrabold text-slate-800 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
          />
        </label>

        {acierto === null && (
          <button
            type="submit"
            disabled={!sirve}
            className="rounded-full bg-emerald-500 px-6 py-3 font-bold text-white shadow transition hover:bg-emerald-600 disabled:opacity-40"
          >
            Comprobar
          </button>
        )}
      </form>

      {acierto === true && (
        <p className="text-xl font-extrabold text-emerald-700">
          🎉 ¡Eso es! Mira abajo cómo se hace la cuenta.
        </p>
      )}

      {acierto === false && (
        <p className="text-lg font-bold text-rose-700">
          Casi. Mira la cuenta de abajo y fíjate en qué paso se te escapó.
        </p>
      )}

      {acierto === null && (
        <button
          type="button"
          onClick={rendirse}
          className="self-start text-sm font-bold text-slate-500 underline"
        >
          No sé, enséñame la cuenta
        </button>
      )}
    </section>
  );
}
