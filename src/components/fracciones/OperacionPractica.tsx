"use client";

import Link from "next/link";
import { useState } from "react";
import { Figura } from "./Figura";
import { AyudaOperacion } from "./AyudaOperacion";
import { ModalCelebracion } from "@/components/avatar/ModalCelebracion";
import {
  comoTexto,
  cuantoSuman,
  iguales,
  nuevoEjercicioOperacion,
  partirFigura,
  type EjercicioOperacion,
  type Fraccion,
  type Operacion,
} from "@/lib/fracciones";
import { cronometro, registrar, TEMAS } from "@/lib/metricas";

const MAX_PARTES = 12;

export function OperacionPractica({ operacion }: { operacion: Operacion }) {
  const [ejercicio, setEjercicio] = useState(() => nuevoEjercicioOperacion(operacion));
  const [divisor, setDivisor] = useState(1);
  const [pintadas, setPintadas] = useState<Set<string>>(new Set());
  const [juzgado, setJuzgado] = useState<boolean | null>(null);
  const [resueltos, setResueltos] = useState(0);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [celebrando, setCelebrando] = useState(false);
  const [reloj] = useState(cronometro);

  const { figura, primera, segunda, objetivo } = ejercicio;
  const piezas = partirFigura(figura, divisor);
  const elegidas = piezas.filter((pieza) => pintadas.has(pieza.id));
  const sumaElegida = cuantoSuman(elegidas);
  const acertada = juzgado === true;
  const simbolo = operacion === "suma" ? "+" : "−";
  const nombre = operacion === "suma" ? "suma" : "resta";
  const tema = operacion === "suma" ? TEMAS.fraccionSuma : TEMAS.fraccionResta;
  const desafio = operacion === "suma" ? "fractions.addition" : "fractions.subtraction";

  function cambiarPartes(cambio: number) {
    setDivisor((actual) => Math.max(1, Math.min(MAX_PARTES, actual + cambio)));
    setPintadas(new Set());
    setJuzgado(null);
  }

  function confirmar() {
    if (acertada || elegidas.length === 0) return;
    const bien = iguales(sumaElegida, objetivo);
    setJuzgado(bien);
    if (bien) {
      const total = resueltos + 1;
      setResueltos(total);
      if (total % 5 === 0) setCelebrando(true);
    }

    void registrar({
      modulo: "fractions",
      tema,
      desafio,
      tipo: "answer",
      acierto: bien,
      error: bien ? null : "resultadoincorrecto",
      duracion: reloj.ms(),
    });
  }

  function siguiente() {
    setEjercicio(nuevoEjercicioOperacion(operacion));
    setDivisor(1);
    setPintadas(new Set());
    setJuzgado(null);
    setMostrarAyuda(false);
    reloj.reiniciar();
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/fracciones" className="self-start font-bold text-sky-700">
        ← Juegos de fracciones
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-sky-800">
            {operacion === "suma" ? "Sumemos fracciones" : "Restemos fracciones"}
          </h1>
          <p className="mt-1 text-slate-600">Usa las figuras para pensar cuánto representa cada parte.</p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 font-bold text-emerald-700 shadow">
          ✅ Llevas {resueltos}
        </span>
      </header>

      <section className="grid items-center gap-2 rounded-3xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_1fr_auto_1.2fr] sm:gap-3 sm:p-6">
        <Proporcion figura={figura} fraccion={primera} />
        <span className="text-center text-4xl font-extrabold text-sky-700">{simbolo}</span>
        <Proporcion figura={figura} fraccion={segunda} />
        <span className="text-center text-4xl font-extrabold text-sky-700">=</span>
        <div className="flex flex-col items-center gap-1">
          <p className="font-bold text-slate-600">Pinta la respuesta</p>
          <Figura
            piezas={piezas}
            pintadas={pintadas}
            alTocar={(id) => {
              setJuzgado(null);
              setPintadas((antes) => {
                const ahora = new Set(antes);
                if (!ahora.delete(id)) ahora.add(id);
                return ahora;
              });
            }}
            bloqueada={acertada}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-sky-50 p-4">
        <span className="text-lg font-extrabold text-sky-900">Dividir en:</span>
        <button
          type="button"
          onClick={() => cambiarPartes(-1)}
          disabled={divisor <= 1 || acertada}
          aria-label="Dividir en una parte menos"
          className="h-12 w-12 rounded-full bg-white text-3xl font-bold text-sky-700 shadow disabled:opacity-40"
        >
          −
        </button>
        <output aria-live="polite" className="min-w-12 text-center text-3xl font-extrabold text-sky-800">
          {divisor}
        </output>
        <button
          type="button"
          onClick={() => cambiarPartes(1)}
          disabled={divisor >= MAX_PARTES || acertada}
          aria-label="Dividir en una parte más"
          className="h-12 w-12 rounded-full bg-white text-3xl font-bold text-sky-700 shadow disabled:opacity-40"
        >
          +
        </button>
        <span className="font-bold text-sky-900">partes iguales</span>
      </div>

      <p className="text-center text-lg font-bold text-slate-600">
        {elegidas.length === 0
          ? "Toca las partes que representan el resultado."
          : `Llevas pintado ${comoTexto(sumaElegida)}`}
      </p>

      {juzgado === true && (
        <Aviso bien>
          🎉 ¡Correcto! {comoTexto(primera)} {simbolo} {comoTexto(segunda)} es {comoTexto(objetivo)}.
        </Aviso>
      )}
      {juzgado === false && (
        <Aviso>
          Pintaste {comoTexto(sumaElegida)}. Prueba otra división o cambia las partes pintadas.
        </Aviso>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {acertada ? (
          <button
            type="button"
            onClick={siguiente}
            className="rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
          >
            Otra {nombre} ✨
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
              Saltar
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
        {mostrarAyuda && <AyudaOperacion ejercicio={ejercicio} />}
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

function Proporcion({ figura, fraccion }: { figura: EjercicioOperacion["figura"]; fraccion: Fraccion }) {
  const piezas = partirFigura(figura, fraccion.denominador);
  const pintadas = new Set(Array.from({ length: fraccion.numerador }, (_, i) => `p${i}`));

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-extrabold text-slate-800">{comoTexto(fraccion)}</span>
      <div className="w-32 sm:w-36">
        <Figura piezas={piezas} pintadas={pintadas} alTocar={() => {}} bloqueada />
      </div>
    </div>
  );
}

function Aviso({ children, bien = false }: { children: React.ReactNode; bien?: boolean }) {
  return (
    <p className={`rounded-3xl p-5 text-center text-lg font-bold shadow ${bien ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-900"}`}>
      {children}
    </p>
  );
}
