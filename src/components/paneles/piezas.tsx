"use client";

import { useState } from "react";

/** Lo que comparten los tres paneles, para no escribirlo tres veces. */

export const CAMPO =
  "w-full rounded-2xl border-2 border-sky-200 px-4 py-3 font-bold text-slate-800 focus:border-sky-500 focus:outline-none";
export const ETIQUETA =
  "text-xs font-bold uppercase tracking-wide text-slate-500";
export const BOTON =
  "rounded-full bg-sky-500 px-6 py-3 font-bold text-white shadow transition hover:bg-sky-600 disabled:opacity-40";

export function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-3xl font-extrabold text-sky-800">{children}</h1>
  );
}

export function Tarjeta({
  titulo,
  pie,
  children,
}: {
  titulo?: string;
  pie?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      {titulo && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-slate-800">{titulo}</h2>
          {pie && <p className="text-sm text-slate-600">{pie}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Aviso({ texto }: { texto: string | null }) {
  if (!texto) return null;

  const malo = texto.startsWith("!");

  return (
    <p
      className={`rounded-2xl p-3 font-bold ${
        malo ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"
      }`}
    >
      {malo ? texto.slice(1) : texto}
    </p>
  );
}

export function Cargando() {
  return (
    <p className="py-10 text-center font-bold text-slate-400">Un momento…</p>
  );
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-slate-50 p-4 text-center text-slate-500">
      {children}
    </p>
  );
}

/**
 * Un código para repartir. Se enseña grande y espaciado porque se dicta en
 * voz alta en una sala de clases y se copia a mano.
 */
export function Codigo({ valor, caduca }: { valor: string; caduca?: number }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="rounded-2xl bg-sky-50 px-5 py-3 font-mono text-2xl font-bold tracking-[0.3em] text-sky-800">
        {valor}
      </code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(valor);
          setCopiado(true);
        }}
        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow"
      >
        {copiado ? "¡Copiado!" : "Copiar"}
      </button>
      {caduca ? (
        <span className="text-sm text-slate-500">
          Vence el {new Intl.DateTimeFormat("es", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(caduca)}
        </span>
      ) : null}
    </div>
  );
}

/** El mensaje que de verdad sirve de un error de Cloud Functions. */
export function porque(falla: unknown, siNo: string) {
  const mensaje = (falla as { message?: string })?.message;
  return mensaje && !mensaje.startsWith("INTERNAL") ? mensaje : siNo;
}
