"use client";

import { useState } from "react";
import { BarraComparacion } from "./BarraComparacion";
import { CubosApilados } from "./CubosApilados";
import { VistaCuerpo } from "./VistaCuerpo";
import {
  advertencia,
  enunciado,
  esCaja,
  formula,
  huella,
  medidasDeCaja,
  medir,
  nombreCorto,
  nombrePlural,
  type Cuerpo,
  type TipoProblema,
} from "@/lib/cuerpos";
import {
  conteoSuperficie,
  conteoVolumen,
  formatear,
  type Medidas,
} from "@/lib/problema";

type Props = {
  problema: TipoProblema;
  a: Cuerpo;
  b: Cuerpo;
};

const COLOR_A = { fuerte: "#0ea5e9", claro: "#bae6fd", texto: "text-sky-700" };
const COLOR_B = { fuerte: "#f59e0b", claro: "#fde68a", texto: "text-amber-700" };

export function Resultado({ problema, a, b }: Props) {
  const [armado, setArmado] = useState(1);

  const desarmable = problema === "superficie";
  const medidaA = medir(a, problema);
  const medidaB = medir(b, problema);
  const veces = medidaA / medidaB;
  const necesarios = Math.ceil(veces - 1e-9);
  const aviso = advertencia(problema, a, b);

  // si B es un cubo podemos contar cuadrados y cubitos de verdad
  const unidad = b.tipo === "cubo" ? b.lado : 1;
  const contarCuadrados = desarmable && esCaja(a) && b.tipo === "cubo";
  const apilarCubos = problema === "volumen" && esCaja(a) && b.tipo === "cubo";

  const huellaA = huella(a, desarmable);
  const huellaB = huella(b, desarmable);
  const escala = Math.max(
    6,
    Math.min(
      26,
      Math.floor(
        Math.min(
          400 / Math.max(huellaA.ancho, huellaB.ancho),
          300 / Math.max(huellaA.alto, huellaB.alto),
        ),
      ),
    ),
  );

  const titulo = problema === "superficie" ? "superficie" : "volumen";

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-3xl border-4 border-dashed border-sky-300 bg-white p-6 text-lg font-bold text-slate-700">
        📝 {enunciado(problema, a, b)}
      </p>

      {desarmable && (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <label
            htmlFor="armado"
            className="flex flex-wrap items-center justify-between gap-2 text-lg font-bold text-slate-700"
          >
            <span>Desarma los cuerpos para ver su superficie</span>
            <span className="text-sm font-semibold text-slate-500">
              {armado > 0.5 ? "🧊 armados" : "📄 abiertos"}
            </span>
          </label>
          <input
            id="armado"
            type="range"
            min={0}
            max={100}
            value={armado * 100}
            onChange={(evento) => setArmado(Number(evento.target.value) / 100)}
            className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-sky-100 accent-sky-500"
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setArmado(0)}
              className="rounded-full bg-sky-100 px-4 py-2 font-bold text-sky-700"
            >
              Desarmar
            </button>
            <button
              type="button"
              onClick={() => setArmado(1)}
              className="rounded-full bg-sky-100 px-4 py-2 font-bold text-sky-700"
            >
              Armar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta
          titulo={`${nombreCorto(a)} que queremos ${
            problema === "superficie" ? "cubrir" : "llenar"
          }`}
          total={`${titulo} ${formatear(medidaA)}`}
          color={COLOR_A.texto}
        >
          <VistaCuerpo
            cuerpo={a}
            escala={escala}
            armado={armado}
            desarmable={desarmable}
            color={COLOR_A.fuerte}
            colorClaro={COLOR_A.claro}
            unidad={unidad}
          />
        </Tarjeta>

        <Tarjeta
          titulo={`${nombreCorto(b)} con que lo hacemos`}
          total={`${titulo} ${formatear(medidaB)}`}
          color={COLOR_B.texto}
        >
          <VistaCuerpo
            cuerpo={b}
            escala={escala}
            armado={armado}
            desarmable={desarmable}
            color={COLOR_B.fuerte}
            colorClaro={COLOR_B.claro}
            unidad={unidad}
          />
        </Tarjeta>
      </div>

      {aviso && (
        <p className="rounded-3xl bg-amber-100 p-4 font-semibold text-amber-900">
          ⚠️ {aviso}
        </p>
      )}

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Calculemos {problema === "superficie" ? "las superficies" : "los volúmenes"}
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <Fila
            etiqueta={`${nombreCorto(a)} (lo que queremos cubrir)`}
            cuenta={formula(a, problema)}
          />
          <Fila
            etiqueta={`${nombreCorto(b)} (lo que usamos)`}
            cuenta={formula(b, problema)}
          />
        </ul>
      </section>

      {contarCuadrados && esCaja(a) && (
        <ConteoDeCuadrados medidas={medidasDeCaja(a)} unidad={unidad} />
      )}

      {apilarCubos && esCaja(a) && (
        <LlenadoConCubos medidas={medidasDeCaja(a)} unidad={unidad} />
      )}

      <BarraComparacion
        veces={veces}
        color={COLOR_B.fuerte}
        etiqueta={`¿Cuántas veces cabe ${formatear(medidaB)} dentro de ${formatear(
          medidaA,
        )}?`}
      />

      <Respuesta
        operacion={`${formatear(medidaA)} ÷ ${formatear(medidaB)} = ${formatear(
          veces,
        )}`}
        respuesta={`Necesitamos ${necesarios} ${
          necesarios === 1 ? nombreCorto(b).toLowerCase().replace(/^(el|la) /, "") : nombrePlural(b)
        }`}
        nota={
          Number.isInteger(veces)
            ? "La división da justa: no sobra ni falta nada."
            : `La división no da justa: con ${necesarios} nos pasamos un poco, así que sobra ${formatear(
                necesarios * medidaB - medidaA,
              )} de ${titulo}.`
        }
      />
    </div>
  );
}

function ConteoDeCuadrados({
  medidas,
  unidad,
}: {
  medidas: Medidas;
  unidad: number;
}) {
  const conteo = conteoSuperficie(medidas, unidad);
  const delCubo = 6;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">
        Contemos los cuadrados de lado {unidad}
      </h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {conteo.porCara.map((cara) => (
          <li
            key={cara.id}
            className="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-2 font-semibold text-slate-700"
          >
            <span>{cara.nombre}</span>
            <span>
              {cara.columnas} × {cara.filas} ={" "}
              <strong className="text-sky-700">{cara.cuadrados}</strong>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-lg font-bold text-slate-700">
        La caja tiene{" "}
        <strong className="text-sky-700">{conteo.cuadrados} cuadrados</strong> y
        el cubo tiene <strong className="text-amber-700">{delCubo}</strong>:{" "}
        {conteo.cuadrados} ÷ {delCubo} ={" "}
        <strong className="text-sky-700">
          {formatear(conteo.cuadrados / delCubo)}
        </strong>
      </p>
      {!conteo.exacto && (
        <p className="mt-2 font-semibold text-amber-700">
          Los cuadrados no caben justos en todas las caras: las partes rayadas
          del dibujo son los trozos que sobran.
        </p>
      )}
    </section>
  );
}

function LlenadoConCubos({
  medidas,
  unidad,
}: {
  medidas: Medidas;
  unidad: number;
}) {
  const conteo = conteoVolumen(medidas, unidad);
  const [capas, setCapas] = useState(conteo.enAlto);
  const lado = Math.max(
    12,
    Math.min(
      40,
      Math.floor(
        340 / Math.max(conteo.enLargo + conteo.enAncho, conteo.enAlto + 2),
      ),
    ),
  );

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">
        Así se llena la caja, capa por capa
      </h2>
      <label htmlFor="capas" className="font-bold text-slate-700">
        Capa {capas} de {conteo.enAlto}: {conteo.enLargo} × {conteo.enAncho} ×{" "}
        {capas} ={" "}
        <strong className="text-sky-700">
          {conteo.enLargo * conteo.enAncho * capas} cubos
        </strong>
      </label>
      <input
        id="capas"
        type="range"
        min={0}
        max={conteo.enAlto}
        value={capas}
        onChange={(evento) => setCapas(Number(evento.target.value))}
        className="h-3 w-full cursor-pointer appearance-none rounded-full bg-sky-100 accent-sky-500"
      />
      <div className="flex justify-center overflow-x-auto py-2">
        <CubosApilados
          conteo={conteo}
          capas={capas}
          lado={lado}
          color={COLOR_B.fuerte}
        />
      </div>
      {!conteo.exacto && (
        <p className="font-semibold text-amber-700">
          Los cubos no caben justos: quedan huecos sin llenar en la caja.
        </p>
      )}
    </section>
  );
}

function Fila({ etiqueta, cuenta }: { etiqueta: string; cuenta: string }) {
  return (
    <li className="rounded-2xl bg-sky-50 px-4 py-3 font-semibold text-slate-700">
      <span className="block text-sm text-slate-500">{etiqueta}</span>
      {cuenta}
    </li>
  );
}

function Tarjeta({
  titulo,
  total,
  color,
  children,
}: {
  titulo: string;
  total: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
        <p className={`font-extrabold ${color}`}>{total}</p>
      </header>
      <div className="flex min-h-[18rem] items-center justify-center overflow-x-auto py-4">
        {children}
      </div>
    </section>
  );
}

function Respuesta({
  operacion,
  respuesta,
  nota,
}: {
  operacion: string;
  respuesta: string;
  nota: string;
}) {
  return (
    <section className="rounded-3xl bg-emerald-500 p-6 text-white shadow-lg">
      <p className="text-2xl font-extrabold">{operacion}</p>
      <p className="mt-2 text-3xl font-extrabold">🎉 {respuesta}</p>
      <p className="mt-3 font-semibold text-emerald-50">{nota}</p>
    </section>
  );
}
