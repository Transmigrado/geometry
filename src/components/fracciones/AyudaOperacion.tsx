"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Figura } from "./Figura";
import { comoTexto, partirFigura, type EjercicioOperacion } from "@/lib/fracciones";
import { useReproduccion } from "@/components/problema/animacion";

const PASO_MS = 260;
const VUELO_MS = 650;
const EXPLOSION_MS = 380;
const COLOR_PRIMERA = "#8b5cf6";
const COLOR_SEGUNDA_SUMA = "#0ea5e9";
const COLOR_SEGUNDA_RESTA = "#f97316";

type Caja = { x: number; y: number; sx: number; sy: number };
type Cajas = {
  ancho: number;
  alto: number;
  primera: Caja | null;
  segunda: Caja | null;
  resultado: Caja | null;
  centros: { x: number; y: number }[];
};
type Viaje = {
  indice: number;
  tipo: "primera" | "segunda";
  origen: Caja | null;
  destino: number;
  avance: number;
};

export function AyudaOperacion({ ejercicio }: { ejercicio: EjercicioOperacion }) {
  const { operacion, figura, primera, segunda, objetivo } = ejercicio;
  const esResta = operacion === "resta";
  const comun = minimoComunMultiplo(primera.denominador, segunda.denominador);
  const primeraCantidad = primera.numerador * (comun / primera.denominador);
  const segundaCantidad = segunda.numerador * (comun / segunda.denominador);
  const totalEventos = primeraCantidad + segundaCantidad;
  const duracion = (totalEventos - 1) * PASO_MS + VUELO_MS + (esResta ? EXPLOSION_MS : 0);
  const piezas = partirFigura(figura, comun);
  const segundaColor = esResta ? COLOR_SEGUNDA_RESTA : COLOR_SEGUNDA_SUMA;
  const primeraSvg = useRef<SVGSVGElement>(null);
  const segundaSvg = useRef<SVGSVGElement>(null);
  const resultadoSvg = useRef<SVGSVGElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [iniciada, setIniciada] = useState(false);
  const [cajas, setCajas] = useState<Cajas | null>(null);
  const { t, reproduciendo, reproducir, ir } = useReproduccion(duracion);

  useLayoutEffect(() => {
    const medir = () => {
      const contenedor = marco.current;
      const svgPrimera = primeraSvg.current;
      const svgSegunda = segundaSvg.current;
      const svgResultado = resultadoSvg.current;
      if (!contenedor || !svgPrimera || !svgSegunda || !svgResultado) return;

      const rectMarco = contenedor.getBoundingClientRect();
      const rectResultado = svgResultado.getBoundingClientRect();
      const escalaX = rectResultado.width / 200;
      const escalaY = rectResultado.height / 200;
      const centros = [...svgResultado.querySelectorAll("path")].map((path) => {
        const caja = path.getBBox();
        return {
          x: rectResultado.left - rectMarco.left + (caja.x + caja.width / 2) * escalaX,
          y: rectResultado.top - rectMarco.top + (caja.y + caja.height / 2) * escalaY,
        };
      });

      setCajas({
        ancho: rectMarco.width,
        alto: rectMarco.height,
        primera: ubicar(svgPrimera, rectMarco),
        segunda: ubicar(svgSegunda, rectMarco),
        resultado: ubicar(svgResultado, rectMarco),
        centros,
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
  const tiempo = avanceActual * duracion;
  const finalizada = iniciada && !reproduciendo && t >= 1;
  const cajaDestino = cajas?.resultado ?? { x: 0, y: 0, sx: 1, sy: 1 };
  const segundaOffset = esResta ? 0 : primeraCantidad;

  const vuelos: Viaje[] = [
    ...Array.from({ length: primeraCantidad }, (_, indice) => ({
      indice,
      tipo: "primera" as const,
      origen: cajas?.primera ?? null,
      destino: indice,
      avance: limitar((tiempo - indice * PASO_MS) / VUELO_MS),
    })),
    ...Array.from({ length: segundaCantidad }, (_, indice) => ({
      indice: primeraCantidad + indice,
      tipo: "segunda" as const,
      origen: cajas?.segunda ?? null,
      destino: segundaOffset + indice,
      avance: limitar((tiempo - (primeraCantidad + indice) * PASO_MS) / VUELO_MS),
    })),
  ];

  const primeraAunEnOrigen = new Set(
    vuelos
      .filter((vuelo) => vuelo.tipo === "primera" && vuelo.avance === 0)
      .map((vuelo) => `p${vuelo.destino}`),
  );
  const segundaAunEnOrigen = new Set(
    vuelos
      .filter((vuelo) => vuelo.tipo === "segunda" && vuelo.avance === 0)
      .map((vuelo) => `p${vuelo.destino}`),
  );
  const primerasLlegaron = new Set(
    vuelos
      .filter((vuelo) => vuelo.tipo === "primera" && vuelo.avance >= 1)
      .map((vuelo) => vuelo.destino),
  );
  const segundasLlegaron = new Set(
    vuelos
      .filter((vuelo) => vuelo.tipo === "segunda" && vuelo.avance >= 1)
      .map((vuelo) => vuelo.destino),
  );
  const pintadasResultado = esResta
    ? new Set([...primerasLlegaron].filter((indice) => !segundasLlegaron.has(indice)).map((i) => `p${i}`))
    : new Set([...primerasLlegaron, ...segundasLlegaron].map((i) => `p${i}`));

  const coloresPrimera = Object.fromEntries(
    Array.from({ length: primeraCantidad }, (_, i) => [`p${i}`, COLOR_PRIMERA]),
  );
  const coloresSegunda = Object.fromEntries(
    Array.from({ length: segundaCantidad }, (_, i) => [`p${segundaOffset + i}`, segundaColor]),
  );
  const coloresResultado = Object.fromEntries(
    Array.from({ length: primeraCantidad }, (_, i) => [`p${i}`, COLOR_PRIMERA]),
  );

  function iniciar() {
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
        {esResta ? "Veamos qué partes se quitan" : "Hagamos las partes del mismo tamaño"}
      </h2>
      <p className="mt-1 text-center text-slate-600">
        {esResta
          ? `Primero pasan ${primeraCantidad} partes al resultado. Después, las ${segundaCantidad} partes que quitamos chocan con las ocupadas y se anulan.`
          : `Dividimos las dos figuras en ${comun} partes iguales. Después, cada parte coloreada viaja hasta el resultado.`}
      </p>

      <div ref={marco} className="relative mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <PasoComun
          titulo={esResta ? "Fracción que tenemos" : "Primera fracción"}
          equivalencia={`${comoTexto(primera)} = ${primeraCantidad}/${comun}`}
          piezas={piezas}
          pintadas={primeraAunEnOrigen}
          colores={coloresPrimera}
          svgRef={primeraSvg}
        />
        <span aria-hidden className="text-center text-3xl font-extrabold text-slate-500">{esResta ? "−" : "+"}</span>
        <PasoComun
          titulo={esResta ? "Fracción que quitamos" : "Segunda fracción"}
          equivalencia={`${comoTexto(segunda)} = ${segundaCantidad}/${comun}`}
          piezas={piezas}
          pintadas={segundaAunEnOrigen}
          colores={coloresSegunda}
          svgRef={segundaSvg}
        />
        <span aria-hidden className="text-center text-3xl font-extrabold text-slate-500">=</span>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-violet-50 p-3">
          <span className="font-bold text-slate-700">{esResta ? "Las partes que quedan" : "Las partes se juntan"}</span>
          <span className="text-xl font-extrabold text-slate-900">
            {primeraCantidad} {esResta ? "−" : "+"} {segundaCantidad} = {esResta ? primeraCantidad - segundaCantidad : primeraCantidad + segundaCantidad} de {comun}
          </span>
          <div className="w-36">
            <Figura
              piezas={piezas}
              pintadas={pintadasResultado}
              colores={coloresResultado}
              svgRef={resultadoSvg}
              alTocar={() => {}}
              bloqueada
            />
          </div>
          <span className="font-extrabold text-violet-900">{comoTexto(objetivo)}</span>
        </div>

        {iniciada && !finalizada && cajas?.resultado && (
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${cajas.ancho} ${cajas.alto}`}
            preserveAspectRatio="none"
          >
            {vuelos.map((vuelo) => {
              if (vuelo.avance >= 1 || !vuelo.origen) return null;
              const curva = suavizar(vuelo.avance);
              const x = vuelo.origen.x + (cajaDestino.x - vuelo.origen.x) * curva;
              const y = vuelo.origen.y + (cajaDestino.y - vuelo.origen.y) * curva;
              const sx = vuelo.origen.sx + (cajaDestino.sx - vuelo.origen.sx) * curva;
              const sy = vuelo.origen.sy + (cajaDestino.sy - vuelo.origen.sy) * curva;
              return (
                <path
                  key={`vuelo-${vuelo.indice}`}
                  d={piezas[vuelo.destino].camino}
                  transform={`translate(${x} ${y}) scale(${sx} ${sy})`}
                  fill={vuelo.tipo === "primera" ? COLOR_PRIMERA : segundaColor}
                  stroke="#0369a1"
                  strokeWidth={2 / Math.max(sx, sy, 0.01)}
                  strokeLinejoin="round"
                />
              );
            })}

            {esResta && vuelos.filter((vuelo) => vuelo.tipo === "segunda").map((vuelo) => {
              const termina = vuelo.indice * PASO_MS + VUELO_MS;
              const estallido = limitar((tiempo - termina) / EXPLOSION_MS);
              const centro = cajas.centros[vuelo.destino];
              if (!centro || tiempo < termina || estallido >= 1) return null;
              return Array.from({ length: 8 }, (_, i) => {
                const angulo = (Math.PI * 2 * i) / 8;
                const distancia = 3 + estallido * 20;
                return (
                  <circle
                    key={`particula-${vuelo.indice}-${i}`}
                    cx={centro.x + Math.cos(angulo) * distancia}
                    cy={centro.y + Math.sin(angulo) * distancia}
                    r={2.6 * (1 - estallido * 0.45)}
                    fill={segundaColor}
                    stroke="white"
                    strokeWidth="0.8"
                    opacity={1 - estallido}
                  />
                );
              });
            })}
          </svg>
        )}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-700" aria-hidden>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLOR_PRIMERA }} />{esResta ? "Lo que tenemos" : "Primera fracción"}</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm" style={{ backgroundColor: segundaColor }} />{esResta ? "Lo que quitamos" : "Segunda fracción"}</span>
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
        onClick={iniciar}
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
