"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Figura } from "./Figura";
import { comoTexto, partirFigura, type EjercicioOperacion } from "@/lib/fracciones";
import { useReproduccion } from "@/components/problema/animacion";

const DURACION = 3900;
const PASO_MS = 260;
const VUELO_MS = 650;
const COLOR_PRIMERA = "#8b5cf6";
const COLOR_SEGUNDA = "#0ea5e9";

type Caja = { x: number; y: number; sx: number; sy: number };
type Cajas = {
  ancho: number;
  alto: number;
  primera: Caja | null;
  segunda: Caja | null;
  resultado: Caja | null;
};

export function AyudaSuma({ ejercicio }: { ejercicio: EjercicioOperacion }) {
  const { figura, primera, segunda } = ejercicio;
  const comun = minimoComunMultiplo(primera.denominador, segunda.denominador);
  const primeraCantidad = primera.numerador * (comun / primera.denominador);
  const segundaCantidad = segunda.numerador * (comun / segunda.denominador);
  const total = primeraCantidad + segundaCantidad;
  const piezas = partirFigura(figura, comun);
  const piezasPrimera = new Set(Array.from({ length: primeraCantidad }, (_, i) => `p${i}`));
  const piezasSegunda = new Set(
    Array.from({ length: segundaCantidad }, (_, i) => `p${primeraCantidad + i}`),
  );
  const primeraSvg = useRef<SVGSVGElement>(null);
  const segundaSvg = useRef<SVGSVGElement>(null);
  const resultadoSvg = useRef<SVGSVGElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [iniciada, setIniciada] = useState(false);
  const [cajas, setCajas] = useState<Cajas | null>(null);
  const { t, reproduciendo, reproducir, ir } = useReproduccion(DURACION);

  useLayoutEffect(() => {
    const medir = () => {
      const marcoActual = marco.current;
      const svgPrimera = primeraSvg.current;
      const svgSegunda = segundaSvg.current;
      const svgResultado = resultadoSvg.current;
      if (!marcoActual || !svgPrimera || !svgSegunda || !svgResultado) return;

      const rectMarco = marcoActual.getBoundingClientRect();
      setCajas({
        ancho: rectMarco.width,
        alto: rectMarco.height,
        primera: ubicar(svgPrimera, rectMarco),
        segunda: ubicar(svgSegunda, rectMarco),
        resultado: ubicar(svgResultado, rectMarco),
      });
    };

    medir();
    const observador = new ResizeObserver(medir);
    if (marco.current) observador.observe(marco.current);
    if (primeraSvg.current) observador.observe(primeraSvg.current);
    if (segundaSvg.current) observador.observe(segundaSvg.current);
    if (resultadoSvg.current) observador.observe(resultadoSvg.current);
    return () => observador.disconnect();
  }, [comun]);

  const avanceActual = iniciada ? t : 0;
  const tiempo = avanceActual * DURACION;
  const finalizada = iniciada && !reproduciendo && t >= 1;
  const cajaDestino = cajas?.resultado ?? { x: 0, y: 0, sx: 1, sy: 1 };

  const vuelos = Array.from({ length: total }, (_, indice) => {
    const desdePrimera = indice < primeraCantidad;
    const cajaOrigen = desdePrimera ? cajas?.primera ?? null : cajas?.segunda ?? null;
    const inicioLocal = indice * PASO_MS;
    const avance = limitar((tiempo - inicioLocal) / VUELO_MS);
    return { indice, desdePrimera, cajaOrigen, avance };
  });

  const llegaron = new Set(vuelos.filter((vuelo) => vuelo.avance >= 1).map((vuelo) => `p${vuelo.indice}`));
  const siguenEnPrimera = new Set(
    [...piezasPrimera].filter((id) => {
      const indice = Number(id.slice(1));
      return vuelos[indice]?.avance === 0;
    }),
  );
  const siguenEnSegunda = new Set(
    [...piezasSegunda].filter((id) => {
      const indice = Number(id.slice(1));
      return vuelos[indice]?.avance === 0;
    }),
  );

  const coloresPrimera = Object.fromEntries([...piezasPrimera].map((id) => [id, COLOR_PRIMERA]));
  const coloresSegunda = Object.fromEntries([...piezasSegunda].map((id) => [id, COLOR_SEGUNDA]));
  const coloresResultado = Object.fromEntries(
    Array.from({ length: total }, (_, i) => [
      `p${i}`,
      i < primeraCantidad ? COLOR_PRIMERA : COLOR_SEGUNDA,
    ]),
  );

  function repetir() {
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
        Hagamos las partes del mismo tamaño
      </h2>
      <p className="mt-1 text-center text-slate-600">
        Dividimos las dos figuras en {comun} partes iguales. Después, cada parte coloreada viaja hasta el resultado.
      </p>

      <div
        ref={marco}
        className="relative mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]"
      >
        <PasoComun
          titulo="Primera fracción"
          equivalencia={`${comoTexto(primera)} = ${primeraCantidad}/${comun}`}
          piezas={piezas}
          pintadas={siguenEnPrimera}
          colores={coloresPrimera}
          svgRef={primeraSvg}
        />
        <span aria-hidden className="text-center text-3xl font-extrabold text-slate-500">+</span>
        <PasoComun
          titulo="Segunda fracción"
          equivalencia={`${comoTexto(segunda)} = ${segundaCantidad}/${comun}`}
          piezas={piezas}
          pintadas={siguenEnSegunda}
          colores={coloresSegunda}
          svgRef={segundaSvg}
        />
        <span aria-hidden className="text-center text-3xl font-extrabold text-slate-500">=</span>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-violet-50 p-3">
          <span className="font-bold text-slate-700">Las partes se juntan</span>
          <span className="text-xl font-extrabold text-slate-900">
            {primeraCantidad} + {segundaCantidad} = {total} de {comun}
          </span>
          <div className="w-36">
            <Figura
              piezas={piezas}
              pintadas={llegaron}
              colores={coloresResultado}
              svgRef={resultadoSvg}
              alTocar={() => {}}
              bloqueada
            />
          </div>
          <span className="font-extrabold text-violet-900">{total}/{comun}</span>
        </div>

        {iniciada && !finalizada && cajas?.resultado && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${cajas.ancho} ${cajas.alto}`}
            preserveAspectRatio="none"
          >
            {vuelos.map(({ indice, desdePrimera, cajaOrigen, avance }) => {
              if (avance >= 1 || !cajaOrigen) return null;
              const destino = cajaDestino;
              const curva = suavizar(avance);
              const x = cajaOrigen.x + (destino.x - cajaOrigen.x) * curva;
              const y = cajaOrigen.y + (destino.y - cajaOrigen.y) * curva;
              const sx = cajaOrigen.sx + (destino.sx - cajaOrigen.sx) * curva;
              const sy = cajaOrigen.sy + (destino.sy - cajaOrigen.sy) * curva;
              const color = desdePrimera ? COLOR_PRIMERA : COLOR_SEGUNDA;
              return (
                <path
                  key={indice}
                  d={piezas[indice].camino}
                  transform={`translate(${x} ${y}) scale(${sx} ${sy})`}
                  fill={color}
                  stroke="#0369a1"
                  strokeWidth={2 / Math.max(sx, sy, 0.01)}
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-700" aria-hidden>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLOR_PRIMERA }} />Primera fracción</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLOR_SEGUNDA }} />Segunda fracción</span>
      </div>
      <label htmlFor="recorrido-ayuda" className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 font-bold text-slate-700">
        <span className="flex justify-between">
          <span>Recorrido de las piezas</span>
          <span>{Math.round(avanceActual * 100)}%</span>
        </span>
        <input
          id="recorrido-ayuda"
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(avanceActual * 100)}
          onChange={(evento) => moverBarra(Number(evento.target.value))}
          aria-label="Avance de la animación de las piezas"
          className="w-full cursor-pointer accent-violet-600"
        />
      </label>
      <button
        type="button"
        onClick={repetir}
        disabled={reproduciendo}
        className="mx-auto mt-4 block rounded-full bg-violet-100 px-5 py-2 font-bold text-violet-950 transition hover:bg-violet-200 disabled:opacity-50"
      >
        {reproduciendo ? "Animando…" : avanceActual > 0 ? "Repetir animación" : "Reproducir animación"}
      </button>
    </aside>
  );
}

function PasoComun({
  titulo,
  equivalencia,
  piezas,
  pintadas,
  colores,
  svgRef,
}: {
  titulo: string;
  equivalencia: string;
  piezas: ReturnType<typeof partirFigura>;
  pintadas: Set<string>;
  colores: Record<string, string>;
  svgRef: React.Ref<SVGSVGElement>;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 p-3">
      <span className="font-bold text-slate-700">{titulo}</span>
      <span className="text-lg font-extrabold text-slate-900">{equivalencia}</span>
      <div className="w-36">
        <Figura piezas={piezas} pintadas={pintadas} colores={colores} svgRef={svgRef} alTocar={() => {}} bloqueada />
      </div>
    </div>
  );
}

function ubicar(elemento: SVGSVGElement, marco: DOMRect): Caja {
  const caja = elemento.getBoundingClientRect();
  return {
    x: caja.left - marco.left,
    y: caja.top - marco.top,
    sx: caja.width / 200,
    sy: caja.height / 200,
  };
}

function minimoComunMultiplo(uno: number, otro: number) {
  let a = uno;
  let b = otro;
  while (b !== 0) [a, b] = [b, a % b];
  return (uno * otro) / a;
}

function limitar(valor: number) {
  return Math.min(1, Math.max(0, valor));
}

function suavizar(valor: number) {
  return valor * valor * (3 - 2 * valor);
}
