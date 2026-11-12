"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/components/auth/ProveedorSesion";
import { canjearCodigo, crearCurso, cursosDe, type Curso } from "@/lib/colegio";
import {
  Aviso, BOTON, CAMPO, Cargando, ETIQUETA, Tarjeta, Titulo, Vacio, porque,
} from "./piezas";
import { MisAlumnos } from "./MisAlumnos";

export function Profesor() {
  const { usuario } = useSesion();
  const [cursos, setCursos] = useState<Curso[] | null>(null);

  const uid = usuario?.uid;

  const recargar = useCallback(() => {
    if (!uid) return;
    cursosDe(uid).then(setCursos).catch(() => setCursos([]));
  }, [uid]);

  useEffect(recargar, [recargar]);

  return (
    <div className="flex flex-col gap-6">
      <Titulo>Mis cursos</Titulo>

      {cursos && cursos.length > 0 && <MisAlumnos cursos={cursos} />}

      <Tarjeta titulo="Armar un curso">
        <NuevoCurso alCrear={recargar} />
      </Tarjeta>

      <Tarjeta titulo="Tus cursos">
        {!cursos ? (
          <Cargando />
        ) : cursos.length === 0 ? (
          <Vacio>Todavía no tienes ninguno. Arma el primero ahí arriba.</Vacio>
        ) : (
          <ul className="flex flex-col gap-2">
            {cursos.map((curso) => (
              <li key={curso.id}>
                <Link
                  href={`/profesor/curso/${curso.id}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border-2 border-slate-100 p-4 transition hover:border-sky-300"
                >
                  <span className="text-lg font-bold text-sky-800">
                    {curso.nombre}
                  </span>
                  <span className="text-sm text-slate-500">{curso.anio}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Invitacion />
    </div>
  );
}

function NuevoCurso({ alCrear }: { alCrear: () => void }) {
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function crear(evento: React.FormEvent) {
    evento.preventDefault();
    setCreando(true);
    setAviso(null);
    try {
      await crearCurso({ nombre: nombre.trim() });
      setNombre("");
      alCrear();
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos crear el curso."));
    } finally {
      setCreando(false);
    }
  }

  return (
    <form onSubmit={crear} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-64 flex-1 flex-col gap-2">
          <span className={ETIQUETA}>Nombre del curso</span>
          <input
            type="text"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            maxLength={60}
            placeholder="5º B"
            className={CAMPO}
          />
        </label>
        <button type="submit" disabled={!nombre.trim() || creando} className={BOTON}>
          {creando ? "Creando…" : "Crear curso"}
        </button>
      </div>
      <Aviso texto={aviso} />
    </form>
  );
}

/** Para el profesor al que un colegio invitó. */
function Invitacion() {
  const [codigo, setCodigo] = useState("");
  const [canjeando, setCanjeando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function canjear(evento: React.FormEvent) {
    evento.preventDefault();
    setCanjeando(true);
    setAviso(null);
    try {
      await canjearCodigo({ codigo: codigo.trim() });
      window.location.reload();
    } catch (falla) {
      setAviso("!" + porque(falla, "Ese código no sirve."));
      setCanjeando(false);
    }
  }

  return (
    <Tarjeta
      titulo="¿Te invitó un colegio?"
      pie="Pega aquí el código que te pasaron. Tiene que ser para este mismo correo."
    >
      <form onSubmit={canjear} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-2">
          <span className={ETIQUETA}>Código</span>
          <input
            type="text"
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
            maxLength={12}
            placeholder="ABCD2345"
            className={`${CAMPO} font-mono tracking-[0.2em]`}
          />
        </label>
        <button type="submit" disabled={codigo.trim().length < 6 || canjeando} className={BOTON}>
          {canjeando ? "Comprobando…" : "Unirme"}
        </button>
      </form>
      <Aviso texto={aviso} />
    </Tarjeta>
  );
}
