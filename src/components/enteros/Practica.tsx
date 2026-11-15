"use client";

import { useEffect, useState } from "react";
import { RectaNumerica } from "./RectaNumerica";
import { AyudaSuma } from "./AyudaSuma";
import { SumaColoreada } from "./SumaColoreada";
import { ModalCelebracion } from "@/components/avatar/ModalCelebracion";
import { nuevoEjercicio, PRIMER_EJERCICIO, textoSuma } from "@/lib/enteros";
import { cronometro, errorDeEnteros, registrar, TEMAS } from "@/lib/metricas";

export function Practica() {
  const [ejercicio, setEjercicio] = useState(PRIMER_EJERCICIO);
  const [elegida, setElegida] = useState<number | null>(null);
  const [resueltos, setResueltos] = useState(0);
  const [noGuardada, setNoGuardada] = useState(false);
  const [celebrando, setCelebrando] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  // PRIMER_EJERCICIO es fijo para que el primer render coincida entre
  // servidor y navegador; al montar ya podemos sortear uno de verdad.
  useEffect(() => {
    setEjercicio(nuevoEjercicio());
  }, []);

  const { a, b, resultado, opciones } = ejercicio;
  const acertada = elegida === null ? null : elegida === resultado;

  // desde cuándo lleva mirando este ejercicio
  const [reloj] = useState(cronometro);

  function responder(opcion: number) {
    if (acertada) return;
    setElegida(opcion);
    setNoGuardada(false);
    if (opcion === resultado) {
      const total = resueltos + 1;
      setResueltos(total);
      if (total % 5 === 0) setCelebrando(true);
    }

    void registrar({
      modulo: "integers",
      tema: TEMAS.enterosSuma,
      desafio: "integers.addition",
      tipo: "answer",
      acierto: opcion === resultado,
      error: errorDeEnteros(opcion, { a, b, resultado }),
      duracion: reloj.ms(),
    }).then((guardada) => {
      if (!guardada) setNoGuardada(true);
    });
  }

  function siguiente() {
    setEjercicio(nuevoEjercicio());
    setElegida(null);
    setMostrarAyuda(false);
    reloj.reiniciar();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-sky-800">
          ¿Cuánto da <SumaColoreada a={a} b={b} />?
        </h1>
        <p className="rounded-full bg-white px-4 py-2 font-bold text-sky-700 shadow">
          ✅ Llevas {resueltos}
        </p>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <RectaNumerica posicion={0} />
        <p className="text-2xl font-extrabold text-slate-800">
          <SumaColoreada a={a} b={b} /> = ?
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
                resultado,
              )}`}
            >
              {opcion}
            </button>
          </li>
        ))}
      </ul>

      {acertada === false && (
        <p className="rounded-3xl bg-amber-100 p-6 text-lg font-bold text-amber-900">
          Revisa: desde 0 el auto {a < 0 ? "retrocede" : "avanza"} {Math.abs(a)}{" "}
          y llega a {a}; después {b < 0 ? "retrocede" : "avanza"} {Math.abs(b)}{" "}
          más. Eso da {resultado}, no {elegida}. Prueba con otra.
        </p>
      )}

      {acertada && (
        <section className="rounded-3xl bg-emerald-500 p-6 text-white shadow-lg">
          <p className="text-2xl font-extrabold">
            🎉 ¡Eso es! {textoSuma(a, b)} = {resultado}
          </p>
          <p className="mt-2 text-lg font-bold text-emerald-50">
            Desde 0, el auto {a < 0 ? "retrocede" : "avanza"} {Math.abs(a)} y
            llega a {a}. Después {b < 0 ? "retrocede" : "avanza"} {Math.abs(b)}{" "}
            más, y llega a {resultado}.
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
        {acertada ? "Otro viaje ✨" : "Saltar esta"}
      </button>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          aria-expanded={mostrarAyuda}
          onClick={() => setMostrarAyuda((visible) => !visible)}
          className="rounded-full bg-violet-100 px-6 py-3 font-extrabold text-violet-900 shadow-sm transition hover:bg-violet-200"
        >
          {mostrarAyuda ? "Ocultar ayuda visual" : "💡 Mostrar ayuda visual"}
        </button>
        {mostrarAyuda && <AyudaSuma ejercicio={ejercicio} />}
      </div>

      {celebrando && (
        <ModalCelebracion
          racha={resueltos}
          onContinuar={() => setCelebrando(false)}
        />
      )}
    </div>
  );
}

function colorDe(opcion: number, elegida: number | null, resultado: number) {
  if (elegida === null) return "bg-white text-slate-800 hover:-translate-y-1";
  if (opcion === resultado && elegida === resultado) return "bg-emerald-500 text-white";
  if (opcion === elegida) return "bg-rose-500 text-white";
  return "bg-white text-slate-400";
}
