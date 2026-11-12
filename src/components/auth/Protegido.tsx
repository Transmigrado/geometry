"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Login } from "./Login";
import { usePerfil } from "./ProveedorPerfil";
import { useSesion } from "./ProveedorSesion";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { pasoPendiente } from "@/lib/perfil";
import { CASA, leToca, rolDe } from "@/lib/roles";

/**
 * Lo que hay detrás solo se ve con la sesión iniciada, con el perfil
 * completo y estando donde a uno le toca: primero se entra, después se
 * presenta uno, y recién ahí se juega.
 *
 * El reparto por rol es comodidad, no seguridad. Quien escriba la URL a
 * mano se topará con las reglas de Firestore, que son la frontera de
 * verdad; esto sólo evita enseñarle a un profesor un wizard de niños.
 */
export function Protegido({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useSesion();
  const perfil = usePerfil();
  const router = useRouter();
  const donde = usePathname();

  const rol = rolDe(perfil.perfil);
  const dentro = Boolean(usuario) && !cargando && !perfil.cargando
    && !pasoPendiente(perfil.perfil);
  const suSitio = dentro && leToca(rol, donde);

  useEffect(() => {
    if (dentro && !suSitio) router.replace(CASA[rol]);
  }, [dentro, suSitio, rol, router]);

  if (cargando || perfil.cargando) {
    return (
      <p className="py-20 text-center text-lg font-bold text-slate-500">
        Abriendo tu cuaderno…
      </p>
    );
  }

  if (!usuario) return <Login />;
  if (pasoPendiente(perfil.perfil)) return <Onboarding />;

  // mientras la redirección va en camino, mejor nada que un parpadeo de la
  // pantalla que no le corresponde
  if (!suSitio) return null;

  return <>{children}</>;
}
