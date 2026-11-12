"use client";

import { useState } from "react";
import { Balanza } from "./Balanza";
import { nuevoEjercicio, PRIMER_EJERCICIO } from "@/lib/ecuaciones";
import { cronometro, errorDe, registrar, TEMAS } from "@/lib/metricas";

export function Practica() {
  const [ejercicio, setEjercicio] = useState(PRIMER_EJERCICIO);
  const [elegida, setElegida] = useState<number | null>(null);
  const [resueltos, setResueltos] = useState(0);
  const [noGuardada, setNoGuardada] = useState(false);

  const { fruta, cantidad, peso, extra, total, opciones } = ejercicio;
  const acertada = elegida === null ? null : elegida === peso;
  const conPesa = extra > 0;
  /** lo que marcaría la pesa con la respuesta elegida */
  const marcaria = cantidad * (elegida ?? 0) + extra;

  // desde cuándo lleva mirando este ejercicio
  const [reloj] = useState(cronometro);

  function responder(opcion: number) {
    if (acertada) return;
    setElegida(opcion);
    setNoGuardada(false);
    if (opcion === peso) setResueltos(resueltos + 1);

    void registrar({
      modulo: "equations",
      tema: conPesa ? TEMAS.ecuacionConPesa : TEMAS.ecuacionSimple,
      desafio: conPesa ? "equations.constant" : "equations.simple",
      tipo: "answer",
      acierto: opcion === peso,
      error: errorDe(opcion, { cantidad, peso, total, extra }),
      duracion: reloj.ms(),
    }).then((guardada) => {
      if (!guardada) setNoGuardada(true);
    });
  }

  function siguiente() {
    setEjercicio(nuevoEjercicio());
    setElegida(null);
    reloj.reiniciar();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-sky-800">
          ¿Cuánto pesa cada {fruta.nombre}?
        </h1>
        <p className="rounded-full bg-white px-4 py-2 font-bold text-sky-700 shadow">
          ✅ Llevas {resueltos}
        </p>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <Balanza
          fruta={fruta}
          cantidad={cantidad}
          extra={extra}
          marca={acertada === false ? marcaria : total}
          correcta={acertada}
        />

        <p className="text-2xl font-extrabold text-slate-800">
          {cantidad} × {fruta.emoji}
          {conPesa && ` + ${extra}`} = {total}
        </p>
      </section>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {opciones.map((opcion) => (
          <li key={opcion}>
            <button
              type="button"
              onClick={() => responder(opcion)}
              aria-pressed={elegida === opcion}
              className={`w-full rounded-3xl px-6 py-8 text-3xl font-extrabold shadow-sm transition ${colorDe(
                opcion,
                elegida,
                peso,
              )}`}
            >
              {opcion}
            </button>
          </li>
        ))}
      </ul>

      {acertada === false && (
        <p className="rounded-3xl bg-amber-100 p-6 text-lg font-bold text-amber-900">
          Si cada {fruta.nombre} pesara {elegida}, la pesa marcaría {cantidad} ×{" "}
          {elegida}
          {conPesa && ` + ${extra}`} = {marcaria}, y marca {total}. Prueba con
          otra.
        </p>
      )}

      {acertada && (
        <section className="rounded-3xl bg-emerald-500 p-6 text-white shadow-lg">
          <p className="text-2xl font-extrabold">
            🎉 ¡Eso es! Cada {fruta.nombre} pesa {peso}
          </p>
          <p className="mt-2 text-lg font-bold text-emerald-50">
            {conPesa
              ? `Primero sacamos la pesa de ${extra}: ${total} − ${extra} = ${
                  total - extra
                }. Eso pesan las ${fruta.plural} juntas, así que ${
                  total - extra
                } ÷ ${cantidad} = ${peso}.`
              : `Para encontrarlo repartimos lo que marca la pesa entre las ${fruta.plural}: ${total} ÷ ${cantidad} = ${peso}.`}
          </p>
        </section>
      )}

      {noGuardada && (
        <p role="alert" className="rounded-2xl bg-rose-100 p-4 font-bold text-rose-900">
          No pudimos guardar esta respuesta en tus avances. Puedes seguir jugando, pero no aparecerá en tus estadísticas.
        </p>
      )}

      <button
        type="button"
        onClick={siguiente}
        className="self-start rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
      >
        {acertada ? "Otra pesa ✨" : "Saltar esta"}
      </button>
    </div>
  );
}

function colorDe(opcion: number, elegida: number | null, peso: number) {
  if (elegida === null) return "bg-white text-slate-800 hover:-translate-y-1";
  if (opcion === peso && elegida === peso) return "bg-emerald-500 text-white";
  if (opcion === elegida) return "bg-rose-500 text-white";
  return "bg-white text-slate-400";
}
