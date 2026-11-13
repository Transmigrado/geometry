"use client";

import { useState } from "react";
import { Contador } from "./Contador";
import { IconoProblema } from "./IconoProblema";
import { MedidaDeVolumen } from "./MedidaDeVolumen";
import { Resultado } from "./Resultado";
import { Opcion } from "@/components/ui/Opcion";
import {
  CATALOGO,
  campos,
  conMedida,
  nombreCuerpo,
  type Cuerpo,
  type TipoCuerpo,
  type TipoProblema,
} from "@/lib/cuerpos";
import { MEDIDA_MAX, MEDIDA_MIN } from "@/lib/problema";

type Paso = "problema" | "figuraA" | "medidasA" | "figuraB" | "medidasB";

/** medir el volumen ocupa un solo cuerpo: no hace falta el segundo */
type Modo = TipoProblema | "medirVolumen";

const CON_DOS_CUERPOS: Paso[] = [
  "problema",
  "figuraA",
  "medidasA",
  "figuraB",
  "medidasB",
];
const CON_UN_CUERPO: Paso[] = ["problema", "figuraA", "medidasA"];

export function ProblemaWizard() {
  const [paso, setPaso] = useState<Paso | "resultado">("problema");
  const [problema, setProblema] = useState<Modo | null>(null);
  const [a, setA] = useState<Cuerpo | null>(null);
  const [b, setB] = useState<Cuerpo | null>(null);

  const soloUno = problema === "medirVolumen";
  const orden = soloUno ? CON_UN_CUERPO : CON_DOS_CUERPOS;

  function elegirCuerpo(tipo: TipoCuerpo, cual: "a" | "b") {
    const inicial = CATALOGO.find((item) => item.tipo === tipo)!.inicial;
    if (cual === "a") {
      setA(inicial);
      setPaso("medidasA");
    } else {
      setB(inicial);
      setPaso("medidasB");
    }
  }

  function reiniciar() {
    setPaso("problema");
    setProblema(null);
    setA(null);
    setB(null);
  }

  if (paso === "resultado" && soloUno && a) {
    return (
      <div className="flex flex-col gap-6">
        <MedidaDeVolumen cuerpo={a} />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPaso("medidasA")}
            className="rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
          >
            ← Cambiar las medidas
          </button>
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-full bg-sky-500 px-6 py-3 font-bold text-white shadow"
          >
            Hacer otro problema
          </button>
        </div>
      </div>
    );
  }

  if (paso === "resultado" && problema && problema !== "medirVolumen" && a && b) {
    return (
      <div className="flex flex-col gap-6">
        <Resultado problema={problema} a={a} b={b} />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPaso("medidasB")}
            className="rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
          >
            ← Cambiar las medidas
          </button>
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-full bg-sky-500 px-6 py-3 font-bold text-white shadow"
          >
            Hacer otro problema
          </button>
        </div>
      </div>
    );
  }

  const accion = problema === "volumen" ? "llenar" : "cubrir";

  return (
    <div className="flex flex-col gap-6">
      <Progreso paso={paso as Paso} orden={orden} />

      {paso === "problema" && (
        <Pregunta titulo="¿Qué tipo de problema tienes?">
          <Opcion
            dibujo={<IconoProblema tipo="superficie" color="#f59e0b" />}
            titulo="Cubrir la superficie"
            descripcion="Pegar piezas por fuera, como forrar un regalo."
            onClick={() => {
              setProblema("superficie");
              setPaso("figuraA");
            }}
          />
          <Opcion
            dibujo={<IconoProblema tipo="volumen" color="#f59e0b" />}
            titulo="Llenar el volumen"
            descripcion="Meter cuerpos por dentro hasta que no quepa ninguno más."
            onClick={() => {
              setProblema("volumen");
              setPaso("figuraA");
            }}
          />
          <Opcion
            dibujo={<IconoProblema tipo="medirVolumen" color="#f59e0b" />}
            titulo="¿Cuánto volumen tiene?"
            descripcion="Medir un cuerpo y ver a cuántos cubitos equivale."
            onClick={() => {
              setProblema("medirVolumen");
              setPaso("figuraA");
            }}
          />
        </Pregunta>
      )}

      {paso === "figuraA" && (
        <Pregunta
          titulo={
            soloUno
              ? "¿De qué cuerpo quieres saber el volumen?"
              : `¿Qué cuerpo quieres ${accion}?`
          }
        >
          <ListaDeCuerpos onElegir={(tipo) => elegirCuerpo(tipo, "a")} />
        </Pregunta>
      )}

      {paso === "medidasA" && a && (
        <Pregunta titulo={`¿Cuánto mide ${nombreCuerpo(a).split(" de ")[0]}?`}>
          <Medidas cuerpo={a} onCambio={setA} />
          <Siguiente
            etiqueta={soloUno ? "Ver el problema ✨" : "Seguir"}
            onClick={() => setPaso(soloUno ? "resultado" : "figuraB")}
          />
        </Pregunta>
      )}

      {paso === "figuraB" && (
        <Pregunta titulo={`¿Con qué cuerpo lo vas a ${accion}?`}>
          <ListaDeCuerpos
            onElegir={(tipo) => elegirCuerpo(tipo, "b")}
            color="bg-amber-500"
          />
        </Pregunta>
      )}

      {paso === "medidasB" && b && (
        <Pregunta titulo={`¿Cuánto mide ${nombreCuerpo(b).split(" de ")[0]}?`}>
          <Medidas cuerpo={b} onCambio={setB} color="bg-amber-500" />
          <Siguiente
            etiqueta="Ver el problema ✨"
            onClick={() => setPaso("resultado")}
          />
        </Pregunta>
      )}

      {paso !== "problema" && (
        <button
          type="button"
          onClick={() =>
            setPaso(orden[Math.max(0, orden.indexOf(paso as Paso) - 1)])
          }
          className="self-start rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
        >
          ← Volver
        </button>
      )}
    </div>
  );
}

function ListaDeCuerpos({
  onElegir,
  color,
}: {
  onElegir: (tipo: TipoCuerpo) => void;
  color?: string;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {CATALOGO.map((cuerpo) => (
        <li key={cuerpo.tipo}>
          <Opcion
            emoji={cuerpo.emoji}
            titulo={cuerpo.nombre}
            descripcion={cuerpo.descripcion}
            onClick={() => onElegir(cuerpo.tipo)}
            color={color}
          />
        </li>
      ))}
    </ul>
  );
}

function Medidas({
  cuerpo,
  onCambio,
  color,
}: {
  cuerpo: Cuerpo;
  onCambio: (cuerpo: Cuerpo) => void;
  color?: string;
}) {
  return (
    <>
      {campos(cuerpo).map((campo) => (
        <Contador
          key={campo.clave}
          etiqueta={campo.etiqueta}
          valor={campo.valor}
          min={MEDIDA_MIN}
          max={MEDIDA_MAX}
          color={color}
          onChange={(valor) => onCambio(conMedida(cuerpo, campo.clave, valor))}
        />
      ))}
    </>
  );
}

function Progreso({ paso, orden }: { paso: Paso; orden: Paso[] }) {
  const actual = orden.indexOf(paso) + 1;

  return (
    <div className="flex items-center gap-3">
      <p className="font-bold text-slate-500">
        Paso {actual} de {orden.length}
      </p>
      <div className="flex gap-1.5">
        {orden.map((nombre, indice) => (
          <span
            key={nombre}
            className={`h-2.5 w-8 rounded-full ${
              indice < actual ? "bg-sky-500" : "bg-sky-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Pregunta({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold text-sky-800">{titulo}</h1>
      {children}
    </section>
  );
}

function Siguiente({
  onClick,
  etiqueta = "Seguir",
}: {
  onClick: () => void;
  etiqueta?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
    >
      {etiqueta}
    </button>
  );
}
