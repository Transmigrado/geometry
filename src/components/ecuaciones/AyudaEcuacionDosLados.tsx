"use client";

import { useState } from "react";
import { BalanzaDosLados } from "./BalanzaDosLados";
import type { EjercicioDosLados, Fruta } from "@/lib/ecuaciones";
import { useReproduccion } from "@/components/problema/animacion";

const PASO_MS = 900;

type Estado = {
  cantidadIzquierda: number;
  extraIzquierda: number;
  cantidadDerecha: number;
  extraDerecha: number;
};

export function AyudaEcuacionDosLados({ ejercicio }: { ejercicio: EjercicioDosLados }) {
  const { fruta, cantidadIzquierda, extraIzquierda, cantidadDerecha, extraDerecha, peso } =
    ejercicio;

  // fase 1: sacar de a una la misma fruta de los dos lados, hasta que a
  // uno no le quede ninguna; fase 2: sacar de una vez el peso que se
  // repite en los dos lados; fase 3: ya reducido a «tantas frutas = tanto
  // peso», sacarlas de a una como en la balanza de un solo lado.
  const comunFrutas = Math.min(cantidadIzquierda, cantidadDerecha);
  const comunExtra = Math.min(extraIzquierda, extraDerecha);
  const eventosExtra = comunExtra > 0 ? 1 : 0;
  const diferenciaFrutas = Math.abs(cantidadIzquierda - cantidadDerecha);
  const diferenciaExtra = Math.abs(extraDerecha - extraIzquierda);
  const ladoFrutaEsIzquierda = cantidadIzquierda > cantidadDerecha;
  const eventosQuitarFruta = Math.max(0, diferenciaFrutas - 1);
  const eventos = comunFrutas + eventosExtra + eventosQuitarFruta;

  const duracion = eventos * PASO_MS;
  const { t, reproduciendo, reproducir, ir } = useReproduccion(duracion);
  const [iniciada, setIniciada] = useState(false);

  const avance = iniciada ? t : 0;
  const hechos = Math.min(eventos, Math.floor((avance * duracion) / PASO_MS + 0.001));

  function estadoEn(hechos: number): Estado {
    const frutasQuitadas = Math.min(hechos, comunFrutas);
    let cIzq = cantidadIzquierda - frutasQuitadas;
    let cDer = cantidadDerecha - frutasQuitadas;

    const hechosTrasFrutas = Math.max(0, hechos - comunFrutas);
    const extraQuitado = eventosExtra > 0 && hechosTrasFrutas >= 1 ? comunExtra : 0;
    let eIzq = extraIzquierda - extraQuitado;
    let eDer = extraDerecha - extraQuitado;

    const hechosFinales = Math.max(0, hechosTrasFrutas - eventosExtra);
    if (ladoFrutaEsIzquierda) {
      cIzq -= hechosFinales;
      eDer -= hechosFinales * peso;
    } else {
      cDer -= hechosFinales;
      eIzq -= hechosFinales * peso;
    }

    return { cantidadIzquierda: cIzq, extraIzquierda: eIzq, cantidadDerecha: cDer, extraDerecha: eDer };
  }

  const estado = estadoEn(hechos);

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
        Vamos sacando lo que se repite
      </h2>
      <p className="mt-1 text-center text-slate-600">
        {textoDe({
          hechos,
          comunFrutas,
          eventosExtra,
          comunExtra,
          diferenciaFrutas,
          diferenciaExtra,
          fruta,
          peso,
          estado,
          ejercicio,
        })}
      </p>

      <div className="mt-4">
        <BalanzaDosLados
          fruta={fruta}
          cantidadIzquierda={estado.cantidadIzquierda}
          extraIzquierda={estado.extraIzquierda}
          cantidadDerecha={estado.cantidadDerecha}
          extraDerecha={estado.extraDerecha}
        />
      </div>

      <label htmlFor="recorrido-dos-lados" className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 font-bold text-slate-700">
        <span className="flex justify-between">
          <span>Avance de la ayuda</span>
          <span>{Math.round(avance * 100)}%</span>
        </span>
        <input
          id="recorrido-dos-lados"
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
  comunFrutas,
  eventosExtra,
  comunExtra,
  diferenciaFrutas,
  diferenciaExtra,
  fruta,
  peso,
  estado,
  ejercicio,
}: {
  hechos: number;
  comunFrutas: number;
  eventosExtra: number;
  comunExtra: number;
  diferenciaFrutas: number;
  diferenciaExtra: number;
  fruta: Fruta;
  peso: number;
  estado: Estado;
  ejercicio: EjercicioDosLados;
}) {
  if (hechos === 0) {
    const { cantidadIzquierda, extraIzquierda, cantidadDerecha, extraDerecha } = ejercicio;
    return `Así empezamos: ${cantidadIzquierda} × ${fruta.nombre}${
      extraIzquierda > 0 ? ` + ${extraIzquierda}` : ""
    } = ${cantidadDerecha} × ${fruta.nombre}${
      extraDerecha > 0 ? ` + ${extraDerecha}` : ""
    }.`;
  }

  if (hechos <= comunFrutas) {
    return `Sacamos una ${fruta.nombre} de cada lado a la vez, así el equilibrio no se rompe: quedan ${estado.cantidadIzquierda} de un lado y ${estado.cantidadDerecha} del otro.`;
  }

  if (eventosExtra > 0 && hechos === comunFrutas + 1) {
    return `Ahora sacamos ${comunExtra} de cada lado, porque ese peso está repetido: queda ${diferenciaFrutas} × ${fruta.nombre} = ${diferenciaExtra}.`;
  }

  const restanFrutas = estado.cantidadIzquierda + estado.cantidadDerecha;
  if (restanFrutas === 1) {
    return `Con una sola ${fruta.nombre}, queda ${fruta.nombre} = ${peso}.`;
  }

  const quedaExtra = Math.max(estado.extraIzquierda, estado.extraDerecha);
  return `Quitamos una ${fruta.nombre} y bajamos ${peso} del otro lado: quedan ${restanFrutas} ${fruta.plural} y ${quedaExtra}.`;
}
