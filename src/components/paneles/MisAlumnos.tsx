"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import {
  alumnosDelProfesor,
  progresoDelCurso,
  type Alumno,
  type Curso,
  type Progreso,
} from "@/lib/colegio";
import { Cargando, Tarjeta, Vacio } from "./piezas";
import { ComoVa } from "./Progreso";

type Suyo = Alumno & { curso: Curso };

/**
 * Todos los alumnos del profesor, de todos sus cursos. Ordenados por lo
 * que les cuesta: el que peor lo lleva arriba, que es a quien hay que
 * mirar primero.
 */
export function MisAlumnos({ cursos }: { cursos: Curso[] }) {
  const [alumnos, setAlumnos] = useState<Suyo[] | null>(null);
  const [progreso, setProgreso] = useState<Map<string, Progreso[]> | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);

  // la lista de cursos cambia de identidad en cada render del padre, pero
  // lo que importa es qué cursos son
  const cuales = cursos.map((curso) => curso.id).join();

  useEffect(() => {
    let vigente = true;

    alumnosDelProfesor(cursos)
      .then((suyos) => {
        if (vigente) setAlumnos(suyos);
      })
      .catch(() => {
        if (vigente) setAlumnos([]);
      });

    Promise.all(cursos.map((curso) => progresoDelCurso(curso.id).catch(() => [])))
      .then((listas) => {
        if (!vigente) return;
        const porAlumno = new Map<string, Progreso[]>();
        for (const suyo of listas.flat()) {
          porAlumno.set(suyo.alumno, [...(porAlumno.get(suyo.alumno) ?? []), suyo]);
        }
        setProgreso(porAlumno);
      })
      .catch(() => {
        if (vigente) setProgreso(new Map());
      });

    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuales]);

  if (!alumnos || !progreso) {
    return (
      <Tarjeta titulo="Mis alumnos">
        <Cargando />
      </Tarjeta>
    );
  }

  if (alumnos.length === 0) {
    return (
      <Tarjeta titulo="Mis alumnos">
        <Vacio>
          Todavía no se ha unido nadie. Reparte el código de matrícula de tu
          curso.
        </Vacio>
      </Tarjeta>
    );
  }

  const conNota = alumnos
    .map((alumno) => {
      const suyo = progreso.get(alumno.id) ?? [];
      const intentos = suyo.reduce((suma, cual) => suma + cual.intentos, 0);
      const aciertos = suyo.reduce((suma, cual) => suma + cual.aciertos, 0);

      return {
        ...alumno,
        progreso: suyo,
        intentos,
        tasa: intentos ? Math.round((aciertos / intentos) * 100) : null,
      };
    })
    // los que peor lo llevan primero; los que no han empezado, al final
    .sort((uno, otro) => (uno.tasa ?? 101) - (otro.tasa ?? 101));

  return (
    <Tarjeta
      titulo="Mis alumnos"
      pie="De quien más le cuesta a quien mejor lo lleva. Pulsa un nombre para ver sus temas."
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeadCell>Alumno</TableHeadCell>
              <TableHeadCell>Curso</TableHeadCell>
              <TableHeadCell>Ejercicios</TableHeadCell>
              <TableHeadCell>Le salen bien</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {conNota.map((alumno) => {
              const nombre = [alumno.nombre, alumno.apellido]
                .filter(Boolean).join(" ") || "Sin nombre";
              const mirando = abierto === alumno.id;

              return (
                <Fragment key={alumno.id}>
                  <TableRow
                    className="cursor-pointer bg-white hover:bg-sky-50"
                    onClick={() => setAbierto(mirando ? null : alumno.id)}
                  >
                    <TableCell className="font-bold text-slate-800">
                      {mirando ? "▾" : "▸"} {nombre}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {alumno.curso.nombre}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {alumno.intentos}
                    </TableCell>
                    <TableCell>
                      {alumno.tasa === null ? (
                        <span className="text-slate-400">Sin empezar</span>
                      ) : (
                        <Badge
                          color={
                            alumno.tasa >= 75
                              ? "success"
                              : alumno.tasa >= 50
                                ? "warning"
                                : "failure"
                          }
                          className="w-fit"
                        >
                          {alumno.tasa}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>

                  {mirando && (
                    <TableRow className="bg-sky-50">
                      <TableCell colSpan={4}>
                        <ComoVa progreso={alumno.progreso} quien={nombre} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Tarjeta>
  );
}
