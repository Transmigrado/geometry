"use client";

import { Login } from "./Login";
import { usePerfil } from "./ProveedorPerfil";
import { useSesion } from "./ProveedorSesion";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { pasoPendiente } from "@/lib/perfil";

/**
 * Lo que hay detrás solo se ve con la sesión iniciada y con el perfil
 * completo: primero se entra, después se presenta uno, y recién ahí se
 * juega.
 */
export function Protegido({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useSesion();
  const perfil = usePerfil();

  if (cargando || perfil.cargando) {
    return (
      <p className="py-20 text-center text-lg font-bold text-slate-500">
        Abriendo tu cuaderno…
      </p>
    );
  }

  if (!usuario) return <Login />;

  return pasoPendiente(perfil.perfil) ? <Onboarding /> : <>{children}</>;
}
