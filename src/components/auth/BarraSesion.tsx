"use client";

import Link from "next/link";
import { usePerfil } from "./ProveedorPerfil";
import { useSesion } from "./ProveedorSesion";
import { Avatar } from "@/components/avatar/Avatar";

/**
 * El acceso al perfil desde la cabecera. Aquí no va el botón de salir: se
 * tropieza con él sin querer, y cerrar la sesión por accidente en medio de
 * un problema no se lo deseamos a nadie. Vive en la página de perfil.
 */
export function BarraSesion() {
  const { usuario } = useSesion();
  const { perfil } = usePerfil();

  if (!usuario) return null;

  return (
    <Link
      href="/perfil"
      title="Tu perfil"
      className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition hover:bg-sky-100"
    >
      <Avatar />
      <span className="hidden text-sm font-bold text-slate-600 sm:block">
        {perfil.nombre ?? usuario.displayName ?? usuario.email}
      </span>
    </Link>
  );
}
