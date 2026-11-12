"use client";

import { useSesion } from "./ProveedorSesion";

export function BarraSesion() {
  const { usuario, salir } = useSesion();

  if (!usuario) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm font-semibold text-slate-600 sm:block">
        {usuario.displayName ?? usuario.email}
      </span>
      <button
        type="button"
        onClick={salir}
        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow"
      >
        Salir
      </button>
    </div>
  );
}
