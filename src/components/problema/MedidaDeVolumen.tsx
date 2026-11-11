"use client";

import { useState } from "react";
import { CubosApilados } from "./CubosApilados";
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
