"use client";

import {
  Badge,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { NOMBRE_TEMA, type Tema } from "@/lib/metricas";
import type { Alumno, DiaAlumno, Progreso } from "@/lib/colegio";
import { nombreDeDesafio } from "@/lib/desafios";
import { Tarjeta, Vacio } from "./piezas";

/**
 * Dónde flojea el curso. Se arma sumando el progreso de cada alumno, que
 * ya viene agregado por tema: Firestore no sabe agrupar, así que la suma
 * se hace aquí sobre los treinta documentos que trae la consulta.
 */
type Fila = {
  tema: string;
  intentos: number;
  aciertos: number;
  /** de 0 a 100 */
  tasa: number;
};

function porTema(progreso: Progreso[]): Fila[] {
  const juntos = new Map<string, { intentos: number; aciertos: number }>();

  for (const alumno of progreso) {
    for (const [tema, cuanto] of Object.entries(alumno.porTema)) {
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
      tasa: cuanto.intentos ? Math.round((cuanto.aciertos / cuanto.intentos) * 100) : 0,
    }))
    // lo flojo primero, que es lo que el profesor viene a buscar
    .sort((uno, otro) => uno.tasa - otro.tasa);
}

function nombreDe(tema: string) {
  return NOMBRE_TEMA[tema as Tema] ?? tema;
}

/**
 * Verde si va bien, ámbar si regular, rojo si hay que repasarlo.
 *
 * Van dos colores porque cada componente de Flowbite tiene su paleta: la
 * insignia habla de «success» y la barra de «green». Pasarle «success» a la
 * barra la deja del color por defecto, que es casi negro.
 */
function comoVa(tasa: number) {
  if (tasa >= 75) {
    return { insignia: "success" as const, barra: "green" as const, texto: "Va bien" };
  }
  if (tasa >= 50) {
    return { insignia: "warning" as const, barra: "yellow" as const, texto: "Regular" };
  }
  return { insignia: "failure" as const, barra: "red" as const, texto: "Hay que repasarlo" };
}

export function Insights({
  progreso,
  alumnos,
}: {
  progreso: Progreso[];
  alumnos: Alumno[];
}) {
  const temas = porTema(progreso);
  const intentos = temas.reduce((suma, fila) => suma + fila.intentos, 0);

  if (intentos === 0) {
    return (
      <Tarjeta titulo="Cómo va el curso">
        <Vacio>
          Todavía nadie ha resuelto ejercicios. En cuanto lo hagan, aquí
          aparece en qué temas flojean.
        </Vacio>
      </Tarjeta>
    );
  }

  const aciertos = temas.reduce((suma, fila) => suma + fila.aciertos, 0);
  const practicaron = progreso.filter((quien) => quien.intentos > 0).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Cifra que="Ejercicios resueltos" cuanto={intentos} />
        <Cifra
          que="Aciertos"
          cuanto={`${Math.round((aciertos / intentos) * 100)}%`}
        />
        <Cifra que="Han practicado" cuanto={`${practicaron} de ${alumnos.length}`} />
      </div>

      <Tarjeta
        titulo="Dónde flojea el curso"
        pie="De lo más flojo a lo más sólido. Cada fila junta a todo el curso."
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Tema</TableHeadCell>
                <TableHeadCell>Aciertos</TableHeadCell>
                <TableHeadCell>Ejercicios</TableHeadCell>
                <TableHeadCell>
                  <span className="sr-only">Cómo va</span>
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {temas.map((fila) => {
                const estado = comoVa(fila.tasa);

                return (
                  <TableRow key={fila.tema} className="bg-white">
                    <TableCell className="font-bold text-slate-800">
                      {nombreDe(fila.tema)}
                    </TableCell>
                    <TableCell className="w-64">
                      <Progress
                        progress={fila.tasa}
                        color={estado.barra}
                        textLabel={`${fila.tasa}%`}
                        labelText
                        size="lg"
                      />
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {fila.aciertos} de {fila.intentos}
                    </TableCell>
                    <TableCell>
                      <Badge color={estado.insignia} className="w-fit">
                        {estado.texto}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Tarjeta>
    </>
  );
}

/** Cómo va cada alumno, para el que quiera mirar uno por uno. */
export function PorAlumno({
  progreso,
  alumnos,
  dias,
}: {
  progreso: Progreso[];
  alumnos: Alumno[];
  dias: DiaAlumno[];
}) {
  const suyo = new Map(progreso.map((quien) => [quien.alumno, quien]));

  return (
    <Tarjeta titulo="Alumno por alumno">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Alumno</TableHeadCell>
              <TableHeadCell>Ejercicios</TableHeadCell>
              <TableHeadCell>Aciertos</TableHeadCell>
              <TableHeadCell>Última vez</TableHeadCell>
              <TableHeadCell>Detalle</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {alumnos.map((alumno) => {
              const cuanto = suyo.get(alumno.id);
              const tasa = cuanto?.intentos
                ? Math.round((cuanto.aciertos / cuanto.intentos) * 100)
                : null;

              return (
                <TableRow key={alumno.id} className="bg-white">
                  <TableCell className="font-bold text-slate-800">
                    {[alumno.nombre, alumno.apellido].filter(Boolean).join(" ")
                      || "Sin nombre"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {cuanto?.intentos ?? 0}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {tasa === null ? "—" : `${tasa}%`}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {cuanto?.ultimo
                      ? new Intl.DateTimeFormat("es", { dateStyle: "short" })
                          .format(cuanto.ultimo)
                      : "Todavía no practica"}
                  </TableCell>
                  <TableCell>
                    <ActividadDiaria dias={dias.filter((dia) => dia.alumno === alumno.id)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Tarjeta>
  );
}

function ActividadDiaria({ dias }: { dias: DiaAlumno[] }) {
  if (dias.length === 0) return <span className="text-slate-500">Sin actividad diaria</span>;

  return (
    <details className="min-w-52">
      <summary className="cursor-pointer font-bold text-sky-700">
        Ver por día ({dias.length})
      </summary>
      <div className="mt-3 flex flex-col gap-3">
        {dias.map((dia) => (
          <section key={`${dia.alumno}-${dia.fecha}`} className="rounded-xl bg-slate-50 p-3">
            <h3 className="mb-2 font-bold text-slate-700">{fechaEnEspanol(dia.fecha)}</h3>
            <ul className="flex flex-col gap-2">
              {Object.entries(dia.porDesafio).map(([id, cuenta]) => (
                <li key={id} className="flex flex-wrap justify-between gap-x-4 text-sm">
                  <span className="text-slate-700">{nombreDeDesafio(id)}</span>
                  <span className="font-semibold text-slate-600">
                    {cuenta.ejercicios} ejercicios · {cuenta.ejercicios - cuenta.aciertos} fallos
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}

function fechaEnEspanol(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return fecha;
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(
    new Date(anio, mes - 1, dia, 12),
  );
}

function Cifra({ que, cuanto }: { que: string; cuanto: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-white p-5 shadow-sm">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {que}
      </span>
      <span className="text-3xl font-extrabold text-sky-800">{cuanto}</span>
    </div>
  );
}
