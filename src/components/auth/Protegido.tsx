"use client";

import { Login } from "./Login";
import { useSesion } from "./ProveedorSesion";

/** Lo que hay detrás solo se ve con la sesión iniciada. */
export function Protegido({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useSesion();

  if (cargando) {
    return (
      <p className="py-20 text-center text-lg font-bold text-slate-500">
        Abriendo tu cuaderno…
      </p>
    );
  }

  return usuario ? <>{children}</> : <Login />;
}
