"use client";

import { useState } from "react";
import { Figura } from "./Figura";
import { AyudaPintar } from "./AyudaPintar";
import {
  comoTexto,
  cuantoSuman,
  iguales,
  nuevoEjercicio,
  PRIMER_EJERCICIO,
  simplificar,
  type Fraccion,
} from "@/lib/fracciones";
import { cronometro, registrar, TEMAS } from "@/lib/metricas";

const NOMBRE_FIGURA = {
  cuadrado: "este cuadrado",
  circulo: "esta tarta",
  triangulo: "este triángulo",
} as const;

export function Practica() {
  const [ejercicio, setEjercicio] = useState(PRIMER_EJERCICIO);
  const [pintadas, setPintadas] = useState<Set<string>>(new Set());
  const [juzgado, setJuzgado] = useState<boolean | null>(null);
  const [resueltos, setResueltos] = useState(0);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [reloj] = useState(cronometro);

  const { figura, piezas, objetivo, mezclado } = ejercicio;
  const elegidas = piezas.filter((pieza) => pintadas.has(pieza.id));
  const suma = cuantoSuman(elegidas);
  const acertada = juzgado === true;

  function tocar(id: string) {
    if (acertada) return;

    // volver a tocar después de fallar es empezar a corregir, así que el
    // aviso de «casi» se va solo
    setJuzgado(null);
    setPintadas((antes) => {
      const ahora = new Set(antes);
      if (!ahora.delete(id)) ahora.add(id);
      return ahora;
    });
  }

  function confirmar() {
    if (acertada || elegidas.length === 0) return;

    const bien = iguales(suma, objetivo);
    setJuzgado(bien);
    if (bien) setResueltos(resueltos + 1);

    registrar({
      modulo: "fractions",
      tema: TEMAS.fraccionIdentificar,
      desafio: mezclado ? "fractions.mixed" : "fractions.equal",
      tipo: "answer",
      acierto: bien,
      error: bien ? null : errorDe(suma, objetivo, elegidas.length),
      duracion: reloj.ms(),
    });
  }

  function siguiente() {
    setEjercicio(nuevoEjercicio());
    setPintadas(new Set());
    setJuzgado(null);
    setMostrarAyuda(false);
    reloj.reiniciar();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-sky-800">
          Pinta {comoTexto(objetivo)} de {NOMBRE_FIGURA[figura]}
        </h1>
        <span className="rounded-full bg-white px-4 py-2 font-bold text-emerald-700 shadow">
          ✅ Llevas {resueltos}
        </span>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <Figura
          piezas={piezas}
          pintadas={pintadas}
          alTocar={tocar}
          bloqueada={acertada}
        />

        <p className="text-lg font-bold text-slate-600">
          {elegidas.length === 0
            ? "Toca las partes que quieras pintar."
            : `Llevas pintado ${comoTexto(suma)}`}
        </p>
      </section>

      {juzgado === true && (
        <Aviso tono="bien">
          🎉 ¡Eso es! {comoTexto(objetivo)} de {NOMBRE_FIGURA[figura]} es justo
          lo que pintaste.
        </Aviso>
      )}

      {juzgado === false && (
        <Aviso tono="casi">
          Pintaste {comoTexto(suma)} y hacían falta {comoTexto(objetivo)}.{" "}
          {consejo(suma, objetivo)}
        </Aviso>
      )}

      <div className="flex flex-wrap gap-3">
        {acertada ? (
          <button
            type="button"
            onClick={siguiente}
            className="rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
          >
            Otra figura ✨
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={confirmar}
              disabled={elegidas.length === 0}
              className="rounded-full bg-emerald-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-emerald-600 disabled:opacity-40"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={siguiente}
              className="rounded-full bg-white px-6 py-4 font-bold text-sky-700 shadow"
            >
              Saltar esta
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          aria-expanded={mostrarAyuda}
          onClick={() => setMostrarAyuda((visible) => !visible)}
          className="rounded-full bg-violet-100 px-6 py-3 font-extrabold text-violet-900 shadow-sm transition hover:bg-violet-200"
        >
          {mostrarAyuda ? "Ocultar ayuda visual" : "💡 Mostrar ayuda visual"}
        </button>
        {mostrarAyuda && <AyudaPintar ejercicio={ejercicio} />}
      </div>
    </div>
  );
}

function Aviso({
  tono,
  children,
}: {
  tono: "bien" | "casi";
  children: React.ReactNode;
}) {
  return (
    <p
      className={`rounded-3xl p-6 text-lg font-bold shadow ${
        tono === "bien"
          ? "bg-emerald-500 text-white"
          : "bg-amber-100 text-amber-900"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * Una pista que no regala la respuesta. Pasarse y quedarse corto son
 * errores distintos, y al niño le sirve saber de cuál se trata.
 */
function consejo(suma: Fraccion, objetivo: Fraccion) {
  const mio = suma.numerador * objetivo.denominador;
  const suyo = objetivo.numerador * suma.denominador;

  return mio > suyo ? "Te pasaste: quita alguna." : "Te falta un poco más.";
}

/**
 * De qué se equivocó, para que su profesor vea el patrón. Contar piezas
 * en vez de mirar cuánto ocupan es *el* error de este módulo, así que se
 * distingue de pasarse o quedarse corto.
 */
function errorDe(suma: Fraccion, objetivo: Fraccion, cuantasElegidas: number) {
  // si eligió tantas piezas como dice el numerador, estaba contando
  if (cuantasElegidas === objetivo.numerador) return "contolaspiezas";

  const mio = suma.numerador * objetivo.denominador;
  const suyo = objetivo.numerador * suma.denominador;
  const mitad = simplificar({
    numerador: objetivo.numerador,
    denominador: objetivo.denominador * 2,
  });

  if (iguales(suma, mitad)) return "pintolamitad";
  return mio > suyo ? "sepaso" : "sequedocorto";
}
