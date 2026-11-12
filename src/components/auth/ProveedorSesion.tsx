"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { autenticacion, hayConfiguracion } from "@/lib/firebase";

type Sesion = {
  usuario: User | null;
  cargando: boolean;
  configurado: boolean;
  salir: () => Promise<void>;
};

const Contexto = createContext<Sesion>({
  usuario: null,
  cargando: false,
  configurado: false,
  salir: async () => {},
});

export function useSesion() {
  return useContext(Contexto);
}

export function ProveedorSesion({ children }: { children: React.ReactNode }) {
  const configurado = hayConfiguracion();
  // sin configuración no hay nada que esperar, así que no arranca cargando
  const [estado, setEstado] = useState<{
    usuario: User | null;
    cargando: boolean;
  }>({ usuario: null, cargando: configurado });

  useEffect(() => {
    if (!configurado) return;

    return onAuthStateChanged(autenticacion(), (usuario) =>
      setEstado({ usuario, cargando: false }),
    );
  }, [configurado]);

  return (
    <Contexto.Provider
      value={{
        ...estado,
        configurado,
        salir: async () => {
          if (configurado) await signOut(autenticacion());
        },
      }}
    >
      {children}
    </Contexto.Provider>
  );
}
