"use client";

import { useEffect, useState } from "react";
import { Balanza } from "./Balanza";
import { BalanzaDosLados } from "./BalanzaDosLados";
import { AyudaEcuacion } from "./AyudaEcuacion";
import { AyudaEcuacionDosLados } from "./AyudaEcuacionDosLados";
import { ModalCelebracion } from "@/components/avatar/ModalCelebracion";
import { nuevoEjercicio, PRIMER_EJERCICIO } from "@/lib/ecuaciones";
import { cronometro, errorDe, errorDeDosLados, registrar, TEMAS } from "@/lib/metricas";

export function Practica() {
  const [ejercicio, setEjercicio] = useState<ReturnType<typeof nuevoEjercicio>>(PRIMER_EJERCICIO);
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

  const { fruta, peso } = ejercicio;
  const acertada = elegida === null ? null : elegida === peso;

  // desde cuándo lleva mirando este ejercicio
  const [reloj] = useState(cronometro);

  function responder(opcion: number) {
    if (acertada) return;
    setElegida(opcion);
    setNoGuardada(false);
    if (opcion === peso) {
      const total = resueltos + 1;
      setResueltos(total);
      if (total % 5 === 0) setCelebrando(true);
    }

    const detalle =
      ejercicio.tipo === "doslados"
        ? {
            tema: TEMAS.ecuacionDosLados,
            desafio: "equations.bothsides",
            error: errorDeDosLados(opcion, ejercicio),
          }
        : {
            tema: ejercicio.extra > 0 ? TEMAS.ecuacionConPesa : TEMAS.ecuacionSimple,
            desafio: ejercicio.extra > 0 ? "equations.constant" : "equations.simple",
            error: errorDe(opcion, ejercicio),
          };

    void registrar({
      modulo: "equations",
      ...detalle,
      tipo: "answer",
      acierto: opcion === peso,
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
          ¿Cuánto pesa cada {fruta.nombre}?
        </h1>
        <p className="rounded-full bg-white px-4 py-2 font-bold text-sky-700 shadow">
          ✅ Llevas {resueltos}
        </p>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm">
        {ejercicio.tipo === "doslados" ? (
          <>
            <BalanzaDosLados
              fruta={fruta}
              cantidadIzquierda={ejercicio.cantidadIzquierda}
              extraIzquierda={ejercicio.extraIzquierda}
              cantidadDerecha={ejercicio.cantidadDerecha}
              extraDerecha={ejercicio.extraDerecha}
            />
            <p className="text-2xl font-extrabold text-slate-800">
              {ejercicio.cantidadIzquierda} × {fruta.emoji}
              {ejercicio.extraIzquierda > 0 && ` + ${ejercicio.extraIzquierda}`} ={" "}
              {ejercicio.cantidadDerecha} × {fruta.emoji}
              {ejercicio.extraDerecha > 0 && ` + ${ejercicio.extraDerecha}`}
            </p>
          </>
        ) : (
          <>
            <Balanza
              fruta={fruta}
              cantidad={ejercicio.cantidad}
              extra={ejercicio.extra}
              marca={
                acertada === false
                  ? ejercicio.cantidad * (elegida ?? 0) + ejercicio.extra
                  : ejercicio.total
              }
              correcta={acertada}
            />
            <p className="text-2xl font-extrabold text-slate-800">
              {ejercicio.cantidad} × {fruta.emoji}
              {ejercicio.extra > 0 && ` + ${ejercicio.extra}`} = {ejercicio.total}
            </p>
          </>
        )}
      </section>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ejercicio.opciones.map((opcion) => (
          <li key={opcion}>
            <button
              type="button"
              onClick={() => responder(opcion)}
              aria-pressed={elegida === opcion}
              className={`w-full rounded-3xl px-6 py-8 text-3xl font-extrabold shadow-sm transition ${colorDe(
                opcion,
                elegida,
                peso,
              )}`}
            >
              {opcion}
            </button>
          </li>
        ))}
      </ul>

      {acertada === false && (
        <p className="rounded-3xl bg-amber-100 p-6 text-lg font-bold text-amber-900">
          {ejercicio.tipo === "doslados"
            ? `Si cada ${fruta.nombre} pesara ${elegida}, un lado pesaría ${
                ejercicio.cantidadIzquierda * (elegida ?? 0) + ejercicio.extraIzquierda
              } y el otro ${
                ejercicio.cantidadDerecha * (elegida ?? 0) + ejercicio.extraDerecha
              }: no quedan iguales. Prueba con otra.`
            : `Si cada ${fruta.nombre} pesara ${elegida}, la pesa marcaría ${
                ejercicio.cantidad * (elegida ?? 0) + ejercicio.extra
              }, y marca ${ejercicio.total}. Prueba con otra.`}
        </p>
      )}

      {acertada && (
        <section className="rounded-3xl bg-emerald-500 p-6 text-white shadow-lg">
          <p className="text-2xl font-extrabold">
            🎉 ¡Eso es! Cada {fruta.nombre} pesa {peso}
          </p>
          <p className="mt-2 text-lg font-bold text-emerald-50">
            {ejercicio.tipo === "doslados" ? (
              <TextoDosLados ejercicio={ejercicio} />
            ) : ejercicio.extra > 0 ? (
              `Primero sacamos la pesa de ${ejercicio.extra}: ${ejercicio.total} − ${
                ejercicio.extra
              } = ${ejercicio.total - ejercicio.extra}. Eso pesan las ${
                fruta.plural
              } juntas, así que ${ejercicio.total - ejercicio.extra} ÷ ${
                ejercicio.cantidad
              } = ${peso}.`
            ) : (
              `Para encontrarlo repartimos lo que marca la pesa entre las ${fruta.plural}: ${ejercicio.total} ÷ ${ejercicio.cantidad} = ${peso}.`
            )}
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
        {acertada ? "Otra pesa ✨" : "Saltar esta"}
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
        {mostrarAyuda &&
          (ejercicio.tipo === "doslados" ? (
            <AyudaEcuacionDosLados ejercicio={ejercicio} />
          ) : (
            <AyudaEcuacion ejercicio={ejercicio} />
          ))}
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

function TextoDosLados({
  ejercicio,
}: {
  ejercicio: Extract<ReturnType<typeof nuevoEjercicio>, { tipo: "doslados" }>;
}) {
  const { fruta, cantidadIzquierda, extraIzquierda, cantidadDerecha, extraDerecha, peso } =
    ejercicio;
  const diferenciaFrutas = Math.abs(cantidadIzquierda - cantidadDerecha);
  const diferenciaExtra = Math.abs(extraDerecha - extraIzquierda);

  return (
    <>
      Juntamos las {fruta.plural} de un mismo lado y los números del otro: eso
      deja {diferenciaFrutas} × {fruta.nombre} = {diferenciaExtra}. Por eso{" "}
      {fruta.nombre} = {diferenciaExtra} ÷ {diferenciaFrutas} = {peso}.
    </>
  );
}

function colorDe(opcion: number, elegida: number | null, peso: number) {
  if (elegida === null) return "bg-white text-slate-800 hover:-translate-y-1";
  if (opcion === peso && elegida === peso) return "bg-emerald-500 text-white";
  if (opcion === elegida) return "bg-rose-500 text-white";
  return "bg-white text-slate-400";
}
