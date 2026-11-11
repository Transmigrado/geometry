"use client";

import { useState } from "react";
import { Contador } from "./Contador";
import { Resultado } from "./Resultado";
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

const ORDEN: Paso[] = [
  "problema",
  "figuraA",
  "medidasA",
  "figuraB",
  "medidasB",
];

const EJEMPLO: { problema: TipoProblema; a: Cuerpo; b: Cuerpo } = {
  problema: "superficie",
  a: { tipo: "paralelepipedo", largo: 10, ancho: 4, alto: 2 },
  b: { tipo: "cubo", lado: 2 },
};

export function ProblemaWizard() {
  const [paso, setPaso] = useState<Paso | "resultado">("problema");
  const [problema, setProblema] = useState<TipoProblema | null>(null);
  const [a, setA] = useState<Cuerpo | null>(null);
  const [b, setB] = useState<Cuerpo | null>(null);

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

  function usarEjemplo() {
    setProblema(EJEMPLO.problema);
    setA(EJEMPLO.a);
    setB(EJEMPLO.b);
    setPaso("resultado");
  }

  function reiniciar() {
    setPaso("problema");
    setProblema(null);
    setA(null);
    setB(null);
  }

  if (paso === "resultado" && problema && a && b) {
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
      <Progreso paso={paso as Paso} />

      {paso === "problema" && (
        <Pregunta titulo="¿Qué tipo de problema tienes?">
          <Opcion
            emoji="🎁"
            titulo="Cubrir la superficie"
            descripcion="¿Cuánta superficie del cuerpo B necesito para cubrir el cuerpo A por fuera?"
            onClick={() => {
              setProblema("superficie");
              setPaso("figuraA");
            }}
          />
          <Opcion
            emoji="📦"
            titulo="Llenar el volumen"
            descripcion="¿Cuánto volumen del cuerpo B necesito para llenar el cuerpo A por dentro?"
            onClick={() => {
              setProblema("volumen");
              setPaso("figuraA");
            }}
          />
        </Pregunta>
      )}

      {paso === "figuraA" && (
        <Pregunta titulo={`¿Qué cuerpo quieres ${accion}?`}>
          <ListaDeCuerpos onElegir={(tipo) => elegirCuerpo(tipo, "a")} />
        </Pregunta>
      )}

      {paso === "medidasA" && a && (
        <Pregunta titulo={`¿Cuánto mide ${nombreCuerpo(a).split(" de ")[0]}?`}>
          <Medidas cuerpo={a} onCambio={setA} />
          <Siguiente onClick={() => setPaso("figuraB")} />
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

      <div className="flex flex-wrap gap-3">
        {paso !== "problema" && (
          <button
            type="button"
            onClick={() =>
              setPaso(ORDEN[Math.max(0, ORDEN.indexOf(paso as Paso) - 1)])
            }
            className="rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
          >
            ← Volver
          </button>
        )}
        {paso === "problema" && (
          <button
            type="button"
            onClick={usarEjemplo}
            className="rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow"
          >
            Ver un ejemplo: cubrir una caja de 10 × 4 × 2 con cubos de 2
          </button>
        )}
      </div>
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

function Progreso({ paso }: { paso: Paso }) {
  const actual = ORDEN.indexOf(paso) + 1;

  return (
    <div className="flex items-center gap-3">
      <p className="font-bold text-slate-500">
        Paso {actual} de {ORDEN.length}
      </p>
      <div className="flex gap-1.5">
        {ORDEN.map((nombre, indice) => (
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

function Opcion({
  emoji,
  titulo,
  descripcion,
  onClick,
  color = "bg-sky-500",
}: {
  emoji: string;
  titulo: string;
  descripcion: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full items-center gap-4 rounded-3xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color} text-3xl`}
      >
        {emoji}
      </span>
      <span>
        <span className="block text-xl font-bold text-slate-800">{titulo}</span>
        <span className="block text-slate-600">{descripcion}</span>
      </span>
    </button>
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
