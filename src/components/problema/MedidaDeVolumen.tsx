"use client";

import { useState } from "react";
import { Botella } from "./Botella";
import { CubosApilados } from "./CubosApilados";
import { CuboCuadriculado } from "./iso";
import { VistaCuerpo } from "./VistaCuerpo";
import {
  esCaja,
  formula,
  huella,
  medidasDeCaja,
  nombreCuerpo,
  volumen,
  type Cuerpo,
} from "@/lib/cuerpos";
import { conteoVolumen, formatear } from "@/lib/problema";

export type Unidad = "cm" | "m";

const UNIDADES: { clave: Unidad; nombre: string; cubica: string }[] = [
  { clave: "cm", nombre: "centímetros", cubica: "cm³" },
  { clave: "m", nombre: "metros", cubica: "m³" },
];

const COLOR = { fuerte: "#0ea5e9", claro: "#bae6fd" };
const COLOR_CUBITO = "#f59e0b";
const COLOR_LITRO = "#38bdf8";

export function MedidaDeVolumen({ cuerpo }: { cuerpo: Cuerpo }) {
  const [unidad, setUnidad] = useState<Unidad>("cm");
  const [dimensiones, setDimensiones] = useState(false);
  const [cuenta, setCuenta] = useState(false);

  const medida = UNIDADES.find((item) => item.clave === unidad)!;
  const total = volumen(cuerpo);
  const exacto = Number.isInteger(total);
  const cubitos = Math.round(total);

  // la caja se dibuja con su propia forma; lo demás, como un bloque de cubitos
  const bloque = esCaja(cuerpo)
    ? conteoVolumen(medidasDeCaja(cuerpo), 1)
    : bloqueDe(cubitos);

  const huellaCuerpo = huella(cuerpo, false);
  const escala = Math.max(
    8,
    Math.min(
      34,
      Math.floor(
        Math.min(360 / huellaCuerpo.ancho, 280 / huellaCuerpo.alto),
      ),
    ),
  );
  const ladoCubito = Math.max(
    5,
    Math.min(
      30,
      Math.floor(
        260 / Math.max(bloque.enLargo + bloque.enAncho, bloque.enAlto + 2),
      ),
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-6 shadow-sm">
        <span className="text-lg font-bold text-slate-700">
          Las medidas están en:
        </span>
        {UNIDADES.map((item) => (
          <button
            key={item.clave}
            type="button"
            onClick={() => setUnidad(item.clave)}
            aria-pressed={item.clave === unidad}
            className={`rounded-full px-5 py-2 font-bold transition ${
              item.clave === unidad
                ? "bg-sky-500 text-white shadow"
                : "bg-sky-100 text-sky-700"
            }`}
          >
            {item.nombre}
          </button>
        ))}
      </div>

      <p className="rounded-3xl border-4 border-dashed border-sky-300 bg-white p-6 text-lg font-bold text-slate-700">
        📝 ¿Cuánto volumen tiene {nombreCuerpo(cuerpo, unidad)}?
      </p>

      <button
        type="button"
        onClick={() => setDimensiones(!dimensiones)}
        aria-pressed={dimensiones}
        className={`self-start rounded-full px-6 py-3 font-bold shadow transition ${
          dimensiones ? "bg-sky-500 text-white" : "bg-white text-sky-700"
        }`}
      >
        📏 Ver dimensiones
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="El cuerpo que medimos">
          <VistaCuerpo
            cuerpo={cuerpo}
            escala={escala}
            armado={1}
            desarmable={false}
            color={COLOR.fuerte}
            colorClaro={COLOR.claro}
            unidad={1}
            dimensiones={dimensiones}
          />
        </Tarjeta>

        <Tarjeta titulo={`Lo mismo, en cubitos de 1 ${unidad} de lado`}>
          <CubosApilados
            conteo={bloque}
            visibles={cubitos}
            lado={ladoCubito}
            color={COLOR_CUBITO}
          />
        </Tarjeta>
      </div>

      <section className="rounded-3xl bg-emerald-500 p-6 text-white shadow-lg">
        <p className="text-2xl font-extrabold">
          El volumen de este cuerpo es {formatear(total)} {medida.cubica}
        </p>
        <p className="mt-2 text-xl font-bold text-emerald-50">
          {exacto
            ? `Es decir, caben justo ${cubitos} cubos de 1 ${unidad} de lado.`
            : `Es decir, unos ${cubitos} cubos de 1 ${unidad} de lado: en un cuerpo redondo los cubitos no calzan justos.`}
        </p>
      </section>

      <Litros total={total} unidad={unidad} />

      {cuenta ? (
        <>
          <button
            type="button"
            onClick={() => setCuenta(false)}
            className="self-start rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
          >
            🙈 Ocultar la cuenta
          </button>
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">
              De dónde sale ese número
            </h2>
            <p className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-lg font-semibold text-slate-700">
              {formula(cuerpo, "volumen")} {medida.cubica}
            </p>
          </section>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setCuenta(true)}
          className="self-start rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
        >
          👀 Ver de dónde sale ese número
        </button>
      )}
    </div>
  );
}

const MAXIMO_BOTELLAS = 24;

/**
 * El mismo volumen contado en litros. Un litro es un cubo de 10 cm de lado,
 * o sea 1000 cm³, y en un metro cúbico caben 1000 litros.
 */
function Litros({ total, unidad }: { total: number; unidad: Unidad }) {
  const litros = unidad === "cm" ? total / 1000 : total * 1000;
  const botellas = Math.ceil(litros - 1e-9);
  const dibujadas = Math.min(botellas, MAXIMO_BOTELLAS);
  const resto = litros - Math.floor(litros);

  return (
    <section className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-800">
          ¿Y cuántos litros son?
        </h2>

        <ul className="flex flex-wrap items-end gap-1">
          {Array.from({ length: Math.max(1, dibujadas) }, (_, indice) => (
            <li key={indice}>
              <Botella
                color={COLOR_LITRO}
                llenado={indice === botellas - 1 && resto > 0 ? resto : 1}
              />
            </li>
          ))}
          {botellas > dibujadas && (
            <li className="pb-2 font-bold text-slate-500">
              … y {redondear(botellas - dibujadas)} más
            </li>
          )}
        </ul>

        <p className="text-lg font-bold text-slate-700">
          {litros < 1
            ? `Son ${redondear(litros)} litros: ni siquiera llena una botella.`
            : `Son ${redondear(litros)} litros, o sea ${redondear(
                botellas,
              )} botellas de un litro.`}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-sky-50 p-4">
        <p className="text-center font-bold text-slate-700">
          Un litro es un cubo de 10 cm de lado
        </p>
        <svg width={150} height={150} role="presentation" aria-hidden="true">
          <g transform="translate(75 40)">
            <CuboCuadriculado
              cx={0}
              cy={0}
              lado={62}
              divisiones={10}
              color={COLOR_LITRO}
            />
          </g>
        </svg>
        <p className="text-center text-sm font-semibold text-slate-600">
          {unidad === "cm"
            ? "Dentro caben 1000 cubitos de 1 cm de lado: 1 litro = 1000 cm³."
            : "Ese cubo mide 0,1 m de lado, así que en 1 m³ caben 1000 litros."}
        </p>
      </div>
    </section>
  );
}

/** Números grandes con punto de miles; los chicos, con sus decimales. */
function redondear(valor: number) {
  if (valor < 1000) return formatear(valor);
  return Math.round(valor)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Acomoda los cubitos sueltos en un bloque parejo, de a diez por fila. */
function bloqueDe(cubitos: number) {
  const enLargo = Math.min(10, Math.max(1, cubitos));
  const enAncho = Math.min(10, Math.ceil(cubitos / enLargo));
  const enAlto = Math.ceil(cubitos / (enLargo * enAncho));

  return { enLargo, enAncho, enAlto, cubitos, exacto: true };
}

function Tarjeta({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
      <div className="flex min-h-[18rem] items-center justify-center overflow-x-auto py-4">
        {children}
      </div>
    </section>
  );
}
