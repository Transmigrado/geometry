"use client";

import { useEffect, useState } from "react";
import { diasDe, type Dia } from "@/lib/colegio";
import { nombreDeDesafio } from "@/lib/desafios";
import { Cargando, Vacio } from "./piezas";

/**
 * Día a día, con los fallos aparte de los ejercicios. Un promedio de por
 * vida esconde justo lo que un profesor viene a buscar: si hoy va mejor
 * que la semana pasada, y en qué desafío se atascó.
 */
export function PorDia({ alumno }: { alumno: string }) {
  const [dias, setDias] = useState<Dia[] | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    diasDe(alumno)
      .then((suyos) => {
        if (vigente) setDias(suyos);
      })
      .catch(() => {
        if (vigente) setDias([]);
      });

    return () => {
      vigente = false;
    };
  }, [alumno]);

  if (!dias) return <Cargando />;
  if (dias.length === 0) {
    return <Vacio>Todavía no hay días con ejercicios.</Vacio>;
  }

  // la barra más alta manda, para que los días flojos se vean flojos
  const tope = Math.max(...dias.map((dia) => dia.intentos), 1);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2">
        {/* del más antiguo al más nuevo, que es como se lee una línea de tiempo */}
        {[...dias].reverse().map((dia) => {
          const fallos = dia.intentos - dia.aciertos;
          const mirando = abierto === dia.fecha;

          return (
            <li key={dia.fecha}>
              <button
                type="button"
                onClick={() => setAbierto(mirando ? null : dia.fecha)}
                aria-pressed={mirando}
                title={`${comoFecha(dia.fecha)}: ${dia.intentos} ejercicios, ${fallos} fallos`}
                className={`flex w-16 flex-col items-center gap-1 rounded-2xl p-2 transition ${
                  mirando ? "bg-sky-100" : "hover:bg-slate-50"
                }`}
              >
                <Columna
                  aciertos={dia.aciertos}
                  fallos={fallos}
                  tope={tope}
                />
                <span className="text-[10px] font-bold text-slate-500">
                  {comoDiaCorto(dia.fecha)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {abierto && <Detalle dia={dias.find((cual) => cual.fecha === abierto)!} />}
    </div>
  );
}

/** Aciertos abajo y fallos encima, para que se vea la proporción. */
function Columna({
  aciertos,
  fallos,
  tope,
}: {
  aciertos: number;
  fallos: number;
  tope: number;
}) {
  const alto = 56;
  const deAciertos = (aciertos / tope) * alto;
  const deFallos = (fallos / tope) * alto;

  return (
    <span
      className="flex w-7 flex-col justify-end overflow-hidden rounded-lg bg-slate-100"
      style={{ height: alto }}
      aria-hidden
    >
      <span className="bg-rose-400" style={{ height: deFallos }} />
      <span className="bg-emerald-500" style={{ height: deAciertos }} />
    </span>
  );
}

function Detalle({ dia }: { dia: Dia }) {
  const fallos = dia.intentos - dia.aciertos;
  const desafios = Object.entries(dia.porDesafio).sort(
    ([, uno], [, otro]) => otro.intentos - uno.intentos,
  );

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-sky-50 p-4">
      <p className="font-bold text-slate-800">
        {comoFecha(dia.fecha)} · {dia.intentos}{" "}
        {dia.intentos === 1 ? "ejercicio" : "ejercicios"}
        {fallos > 0 && `, ${fallos} ${fallos === 1 ? "fallo" : "fallos"}`}
      </p>

      <ul className="flex flex-col gap-1">
        {desafios.map(([desafio, cuanto]) => (
          <li
            key={desafio}
            className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
          >
            <span className="font-semibold text-slate-700">
              {nombreDeDesafio(desafio)}
            </span>
            <span className="text-slate-500">
              {cuanto.aciertos} de {cuanto.intentos}
              {cuanto.intentos > cuanto.aciertos &&
                ` · ${cuanto.intentos - cuanto.aciertos} ${
                  cuanto.intentos - cuanto.aciertos === 1 ? "fallo" : "fallos"
                }`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** «2026-11-12» tal como lo diría alguien. */
function comoFecha(fecha: string) {
  const dia = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(dia.getTime())
    ? fecha
    : new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(dia);
}

function comoDiaCorto(fecha: string) {
  const dia = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(dia.getTime())) return fecha;

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
  }).format(dia);
}
