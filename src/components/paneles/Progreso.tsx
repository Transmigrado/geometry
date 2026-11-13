"use client";

import { Badge, Progress as Barra } from "flowbite-react";
import { NOMBRE_TEMA, type Tema } from "@/lib/metricas";
import type { Progreso } from "@/lib/colegio";
import { PorDia } from "./PorDia";
import { Vacio } from "./piezas";

/**
 * Cómo le va a un alumno, tema por tema. Lo miran su profesor y su
 * apoderado, así que habla de él en tercera persona y sin tecnicismos: a
 * un padre «tasa de acierto» no le dice nada.
 */

/**
 * Cada componente de Flowbite tiene su propia paleta: la insignia habla de
 * «success» y la barra de «green». No son intercambiables —pasarle
 * «success» a la barra la deja del color por defecto, que es casi negro.
 */
function comoVa(tasa: number) {
  if (tasa >= 75) {
    return { insignia: "success" as const, barra: "green" as const, texto: "Lo domina" };
  }
  if (tasa >= 50) {
    return { insignia: "warning" as const, barra: "yellow" as const, texto: "Le cuesta" };
  }
  return { insignia: "failure" as const, barra: "red" as const, texto: "Necesita repasarlo" };
}

/** Los temas de un alumno, sumando todos sus cursos. */
function temasDe(progreso: Progreso[]) {
  const juntos = new Map<string, { intentos: number; aciertos: number }>();

  for (const suyo of progreso) {
    for (const [tema, cuanto] of Object.entries(suyo.porTema)) {
      const antes = juntos.get(tema) ?? { intentos: 0, aciertos: 0 };
      juntos.set(tema, {
        intentos: antes.intentos + cuanto.intentos,
        aciertos: antes.aciertos + cuanto.aciertos,
      });
    }
  }

  return [...juntos.entries()]
    .map(([tema, cuanto]) => ({
      tema,
      ...cuanto,
      tasa: cuanto.intentos
        ? Math.round((cuanto.aciertos / cuanto.intentos) * 100)
        : 0,
    }))
    .sort((uno, otro) => uno.tasa - otro.tasa);
}

export function ComoVa({
  progreso,
  quien,
  alumno,
}: {
  progreso: Progreso[];
  /** cómo llamarle cuando no hay nada que enseñar */
  quien: string;
  /** de quién es, para poder traer su día a día */
  alumno?: string;
}) {
  const temas = temasDe(progreso);
  const intentos = temas.reduce((suma, fila) => suma + fila.intentos, 0);

  if (intentos === 0) {
    return <Vacio>{quien} todavía no ha resuelto ejercicios.</Vacio>;
  }

  const aciertos = temas.reduce((suma, fila) => suma + fila.aciertos, 0);
  const ultimo = progreso.reduce<number | null>(
    (ultimo, suyo) => (suyo.ultimo && (!ultimo || suyo.ultimo > ultimo) ? suyo.ultimo : ultimo),
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-6">
        <Dato que="Ejercicios" cuanto={intentos} />
        <Dato
          que="Le salen bien"
          cuanto={`${Math.round((aciertos / intentos) * 100)}%`}
        />
        <Dato
          que="Última vez"
          cuanto={
            ultimo
              ? new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(ultimo)
              : "—"
          }
        />
      </div>

      {alumno && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Día a día
          </span>
          <PorDia alumno={alumno} />
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {temas.map((fila) => {
          const estado = comoVa(fila.tasa);

          return (
            <li key={fila.tema} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-bold text-slate-800">
                  {NOMBRE_TEMA[fila.tema as Tema] ?? fila.tema}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    {fila.aciertos} de {fila.intentos}
                  </span>
                  <Badge color={estado.insignia}>{estado.texto}</Badge>
                </span>
              </div>
              <Barra
                progress={fila.tasa}
                color={estado.barra}
                size="lg"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Dato({ que, cuanto }: { que: string; cuanto: number | string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {que}
      </span>
      <span className="text-2xl font-extrabold text-sky-800">{cuanto}</span>
    </div>
  );
}
