"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSesion } from "./ProveedorSesion";
import {
  guardarPerfil,
  leerPerfil,
  PERFIL_VACIO,
  type Perfil,
} from "@/lib/perfil";

type Estado = {
  perfil: Perfil;
  cargando: boolean;
  guardar: (cambios: Partial<Perfil>) => Promise<void>;
};

const Contexto = createContext<Estado>({
  perfil: PERFIL_VACIO,
  cargando: false,
  guardar: async () => {},
});

export function usePerfil() {
  return useContext(Contexto);
}

/**
 * El perfil se lee una vez y lo comparten la cabecera, el onboarding y el
 * selector de avatar. Así la carita de arriba cambia en cuanto se guarda el
 * avatar, sin volver a preguntarle a Firestore.
 */
export function ProveedorPerfil({ children }: { children: React.ReactNode }) {
  const { usuario } = useSesion();
  const uid = usuario?.uid;

  // guardado junto al uid del que salió: así cambiar de cuenta no deja
  // ver por un instante el perfil del anterior
  const [leido, setLeido] = useState<{ uid: string; perfil: Perfil } | null>(
    null,
  );

  const suyo = leido?.uid === uid;

  useEffect(() => {
    if (!uid) return;
    let vigente = true;

    leerPerfil(uid)
      .then((perfil) => {
        if (vigente) setLeido({ uid, perfil });
      })
      .catch(() => {
        // sin perfil se arranca de cero, que es lo mismo que no tener nada
        if (vigente) setLeido({ uid, perfil: PERFIL_VACIO });
      });

    return () => {
      vigente = false;
    };
  }, [uid]);

  const perfil = suyo && leido ? leido.perfil : PERFIL_VACIO;

  return (
    <Contexto.Provider
      value={{
        perfil,
        cargando: Boolean(uid) && !suyo,
        guardar: async (cambios) => {
          if (!uid) return;
          await guardarPerfil(uid, cambios);
          setLeido({ uid, perfil: { ...perfil, ...cambios } });
        },
      }}
    >
      {children}
    </Contexto.Provider>
  );
}
