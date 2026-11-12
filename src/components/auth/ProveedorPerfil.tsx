"use client";

import { useEffect } from "react";
import { useSesion } from "./ProveedorSesion";
import { useDespacho, useEstado } from "@/estado/hooks";
import { guardarPedido, leerPedido, olvidado } from "@/estado/perfil";
import { PERFIL_VACIO, type Perfil } from "@/lib/perfil";

/**
 * El perfil vive en el store y lo comparten la cabecera, el onboarding, el
 * selector de avatar y la página de perfil. Así la carita de arriba cambia
 * en cuanto se guarda el avatar, sin volver a preguntarle a Firestore.
 */
export function usePerfil() {
  const estado = useEstado((todo) => todo.perfil);
  const despacho = useDespacho();
  const { usuario } = useSesion();
  const uid = usuario?.uid;

  // mientras no sea el del que entró, el perfil cargado es de otra cuenta
  const suyo = estado.duenio === uid;

  return {
    perfil: suyo ? estado.perfil : PERFIL_VACIO,
    cargando: Boolean(uid) && (!suyo || estado.cargando),
    guardando: estado.guardando,

    /**
     * Devuelve una promesa porque las pantallas esperan a que termine para
     * pasar al paso siguiente. Quien la cumple es la saga, con el aviso que
     * se le pasa en la acción.
     */
    guardar: (cambios: Partial<Perfil>) =>
      new Promise<void>((cumplir, fallar) => {
        if (!uid) return cumplir();

        despacho(
          guardarPedido(uid, cambios, (falla) =>
            falla ? fallar(falla) : cumplir(),
          ),
        );
      }),
  };
}

/** Pide el perfil al entrar y lo olvida al salir. */
export function ProveedorPerfil({ children }: { children: React.ReactNode }) {
  const { usuario } = useSesion();
  const despacho = useDespacho();
  const uid = usuario?.uid;

  useEffect(() => {
    despacho(uid ? leerPedido(uid) : olvidado());
  }, [uid, despacho]);

  return <>{children}</>;
}
