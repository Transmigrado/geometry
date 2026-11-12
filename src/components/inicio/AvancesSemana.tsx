"use client";

import { useEffect, useState } from "react";
import { diasDelAlumno, type DiaAlumno } from "@/lib/colegio";
import { desafio } from "@/lib/desafios";
import type { Modulo } from "@/lib/metricas";

const MATERIAS: {
  id: Modulo;
  nombre: string;
  color: string;
  fondo: string;
}[] = [
  { id: "fractions", nombre: "Fracciones", color: "bg-violet-500", fondo: "bg-violet-50" },
  { id: "equations", nombre: "Ecuaciones", color: "bg-emerald-500", fondo: "bg-emerald-50" },
  { id: "geometry", nombre: "Geometría", color: "bg-amber-500", fondo: "bg-amber-50" },
];

type Conteo = { ejercicios: number; aciertos: number };
type Dia = { fecha: string; cuenta: Conteo };

export function AvancesSemana({ alumno }: { alumno: string }) {
  const [dias, setDias] = useState<DiaAlumno[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    diasDelAlumno(alumno)
      .then((datos) => {
        if (vigente) {
          setDias(datos);
          setError(false);
        }
      })
      .catch((falla: unknown) => {
        console.error("No pudimos leer las respuestas semanales del alumno.", falla);
        if (vigente) {
          setDias([]);
          setError(true);
        }
      });
    return () => {
      vigente = false;
    };
  }, [alumno]);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="avance-semanal">
      <div>
        <h2 id="avance-semanal" className="text-2xl font-extrabold text-sky-800">
          Tus avances esta semana
        </h2>
        <p className="text-slate-600">Respuestas y fallos de los últimos siete días.</p>
      </div>

      {dias === null ? (
        <p className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">Cargando tus avances…</p>
      ) : error ? (
        <p role="alert" className="rounded-3xl bg-white p-6 text-slate-700 shadow-sm">
          No pudimos cargar tus avances. Vuelve a cargar la página para intentarlo otra vez.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {MATERIAS.map((materia) => (
            <TarjetaMateria key={materia.id} materia={materia} dias={dias} />
          ))}
        </div>
      )}
    </section>
  );
}

function TarjetaMateria({
  materia,
  dias,
}: {
  materia: (typeof MATERIAS)[number];
  dias: DiaAlumno[];
}) {
  const semana = sieteDias(dias, materia.id);
  const ejercicios = semana.reduce((suma, dia) => suma + dia.cuenta.ejercicios, 0);
  const aciertos = semana.reduce((suma, dia) => suma + dia.cuenta.aciertos, 0);
  const fallos = ejercicios - aciertos;
  const maximo = Math.max(1, ...semana.map((dia) => dia.cuenta.ejercicios));

  return (
    <article className={`flex flex-col gap-4 rounded-3xl p-5 shadow-sm ${materia.fondo}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-extrabold text-slate-800">{materia.nombre}</h3>
        <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-slate-700">
          {ejercicios} {ejercicios === 1 ? "respuesta" : "respuestas"}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>{aciertos} bien</span>
        <span>{fallos} {fallos === 1 ? "fallo" : "fallos"}</span>
      </div>

      <div className="flex h-24 items-end justify-between gap-2" aria-label={`Actividad diaria de ${materia.nombre}`}>
        {semana.map((dia) => {
          const total = dia.cuenta.ejercicios;
          const alto = total ? Math.max(10, (total / maximo) * 100) : 0;
          const bien = total ? (dia.cuenta.aciertos / total) * 100 : 0;
          const mal = 100 - bien;

          return (
            <div key={dia.fecha} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs font-bold text-slate-600">{total || ""}</span>
              <div
                title={`${fechaCorta(dia.fecha)}: ${dia.cuenta.aciertos} bien, ${total - dia.cuenta.aciertos} fallos`}
                className="flex w-full max-w-8 items-end overflow-hidden rounded-t-lg bg-white/80"
                style={{ height: `${alto}%`, minHeight: total ? "8px" : "2px" }}
                role="img"
                aria-label={`${fechaCorta(dia.fecha)}: ${total} respuestas, ${total - dia.cuenta.aciertos} fallos`}
              >
                {total > 0 && (
                  <span className="flex w-full flex-col" style={{ height: "100%" }}>
                    <span className="w-full bg-rose-400" style={{ height: `${mal}%` }} />
                    <span className={`w-full ${materia.color}`} style={{ height: `${bien}%` }} />
                  </span>
                )}
              </div>
              <span className="text-xs font-bold capitalize text-slate-600">
                {diaSemana(dia.fecha)}
              </span>
            </div>
          );
        })}
      </div>

      {ejercicios === 0 ? (
        <p className="text-sm text-slate-600">¡Prueba esta materia para empezar tu semana!</p>
      ) : (
        <div className="flex gap-4 text-xs font-semibold text-slate-600" aria-hidden>
          <span className="flex items-center gap-1"><i className={`h-2.5 w-2.5 rounded-sm ${materia.color}`} />Bien</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-rose-400" />A revisar</span>
        </div>
      )}
    </article>
  );
}

function sieteDias(registros: DiaAlumno[], modulo: Modulo): Dia[] {
  const hoy = new Date();
  const dias: Dia[] = [];
  for (let diferencia = 6; diferencia >= 0; diferencia--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - diferencia);
    const iso = fechaISO(fecha);
    const cuenta: Conteo = { ejercicios: 0, aciertos: 0 };

    for (const registro of registros) {
      if (registro.fecha !== iso) continue;
      for (const [id, estadistica] of Object.entries(registro.porDesafio)) {
        if (desafio(id)?.modulo !== modulo) continue;
        cuenta.ejercicios += estadistica.ejercicios;
        cuenta.aciertos += estadistica.aciertos;
      }
    }
    dias.push({ fecha: iso, cuenta });
  }
  return dias;
}

function fechaISO(fecha: Date) {
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

function diaSemana(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es", { weekday: "short" })
    .format(new Date(anio, mes - 1, dia, 12))
    .replace(".", "");
}

function fechaCorta(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" })
    .format(new Date(anio, mes - 1, dia, 12));
}
