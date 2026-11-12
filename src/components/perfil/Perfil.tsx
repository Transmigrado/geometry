"use client";

import Link from "next/link";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { useSesion } from "@/components/auth/ProveedorSesion";
import { Avatar } from "@/components/avatar/Avatar";
import { Alumno } from "./Alumno";
import { Cambiar } from "./Cambiar";
import { Foto } from "./Foto";
import { edadDe, fechaLarga } from "@/lib/perfil";

/** Lo que sabemos de quien entró, y la puerta para cambiar su avatar. */
export function Perfil() {
  const { perfil } = usePerfil();
  const { usuario, salir } = useSesion();

  const edad = edadDe(perfil.nacimiento);
  const cumpleanos = fechaLarga(perfil.nacimiento);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-sky-800">Tu perfil</h1>

      <section className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left">
        <Avatar className="h-32 w-32 text-5xl" />

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <p className="text-2xl font-extrabold text-slate-800">
            {[perfil.nombre, perfil.apellido].filter(Boolean).join(" ")}
          </p>
          {perfil.rol === "student" && (
            <Link
              href="/avatar"
              className="rounded-full bg-sky-500 px-6 py-3 font-bold text-white shadow transition hover:bg-sky-600"
            >
              Cambiar avatar
            </Link>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <Dato nombre="Nombre" valor={perfil.nombre} />
        <Dato nombre="Apellido" valor={perfil.apellido} />
        <Dato
          nombre="Fecha de nacimiento"
          valor={
            cumpleanos && edad !== null
              ? `${cumpleanos} · ${edad} años`
              : cumpleanos
          }
        />
        <Dato nombre="Correo" valor={usuario?.email ?? null} />
      </section>

      {perfil.rol === "student" ? <Alumno /> : <Foto />}

      <Cambiar />

      <button
        type="button"
        onClick={salir}
        className="self-start rounded-full bg-white px-6 py-3 font-bold text-sky-700 shadow transition hover:bg-sky-50"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function Dato({ nombre, valor }: { nombre: string; valor: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-48 shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500">
        {nombre}
      </span>
      <span className="text-lg font-bold text-slate-800">
        {valor ?? "—"}
      </span>
    </div>
  );
}
