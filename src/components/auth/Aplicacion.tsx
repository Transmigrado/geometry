"use client";

import { Login } from "./Login";
import { useSesion } from "./ProveedorSesion";
import { ProblemaWizard } from "@/components/problema/ProblemaWizard";

export function Aplicacion() {
  const { usuario, cargando } = useSesion();

  if (cargando) {
    return (
      <p className="py-20 text-center text-lg font-bold text-slate-500">
        Abriendo tu cuaderno…
      </p>
    );
  }

  return usuario ? <ProblemaWizard /> : <Login />;
}
