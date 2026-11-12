"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  alumnosDe,
  codigoDe,
  diasDelCurso,
  generarCodigoCurso,
  progresoDelCurso,
  type Alumno,
  type DiaAlumno,
  type Progreso,
} from "@/lib/colegio";
import { Insights, PorAlumno } from "./Insights";
import {
  Aviso, BOTON, Cargando, Codigo, Tarjeta, Titulo, Vacio, porque,
} from "./piezas";

export function CursoDetalle({ id }: { id: string }) {
  const [alumnos, setAlumnos] = useState<Alumno[] | null>(null);
  const [progreso, setProgreso] = useState<Progreso[] | null>(null);
  const [dias, setDias] = useState<DiaAlumno[] | null>(null);
  const [codigo, setCodigo] = useState<
    { codigo: string; caduca: number; vencido: boolean } | null
  >(null);
  const [generando, setGenerando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const recargar = useCallback(() => {
    alumnosDe(id).then(setAlumnos).catch(() => setAlumnos([]));
    progresoDelCurso(id).then(setProgreso).catch(() => setProgreso([]));
    diasDelCurso(id).then(setDias).catch(() => setDias([]));
    // si vive o no se decide al leerlo, no al pintar: la hora cambia sola
    // y el compilador no quiere funciones impuras durante el render
    codigoDe(id)
      .then((suyo) =>
        setCodigo(suyo && { ...suyo, vencido: suyo.caduca < Date.now() }),
      )
      .catch(() => setCodigo(null));
  }, [id]);

  useEffect(recargar, [recargar]);

  async function generar() {
    setGenerando(true);
    setAviso(null);
    try {
      setCodigo({ ...(await generarCodigoCurso({ courseId: id })), vencido: false });
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos generar el código."));
    } finally {
      setGenerando(false);
    }
  }

  const vencido = codigo?.vencido ?? false;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/profesor" className="self-start font-bold text-sky-700">
        ← Mis cursos
      </Link>

      <Titulo>El curso</Titulo>

      <Tarjeta
        titulo="Código de matrícula"
        pie="Repártelo en clase. Dura dos días, y generar uno nuevo invalida el anterior: eso es lo que hay que hacer si se te escapa fuera del aula."
      >
        {codigo && !vencido ? (
          <Codigo valor={codigo.codigo} caduca={codigo.caduca} />
        ) : (
          <Vacio>
            {vencido ? "El código venció." : "Todavía no has generado ninguno."}
          </Vacio>
        )}

        <button type="button" onClick={generar} disabled={generando} className={`${BOTON} self-start`}>
          {generando ? "Generando…" : codigo ? "Generar uno nuevo" : "Generar código"}
        </button>

        <Aviso texto={aviso} />
      </Tarjeta>

      {!alumnos || !progreso || !dias ? (
        <Cargando />
      ) : alumnos.length === 0 ? (
        <Tarjeta titulo="Alumnos">
          <Vacio>Nadie se ha unido todavía.</Vacio>
        </Tarjeta>
      ) : (
        <>
          <Insights progreso={progreso} alumnos={alumnos} />
          <PorAlumno progreso={progreso} alumnos={alumnos} dias={dias} />
        </>
      )}
    </div>
  );
}
