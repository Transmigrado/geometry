"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { Aviso, Tarjeta, porque } from "@/components/paneles/piezas";
import type { Rol } from "@/lib/perfil";
import { CASA, PERFILES } from "@/lib/roles";

/**
 * Cambiar de perfil. Hace falta porque quien se equivoca al registrarse se
 * quedaría encerrado en la pantalla que no le toca.
 *
 * No regala nada: el rol sólo decide qué se pinta. Ponerse «colegio» sin
 * tener uno enseña un panel vacío que no puede hacer nada hasta crearlo de
 * verdad, y las reglas no miran el rol para nada.
 */
export function Cambiar() {
  const { perfil, guardar } = usePerfil();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function cambiar(rol: Rol) {
    setAviso(null);
    try {
      await guardar({ rol });
      router.replace(CASA[rol]);
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos cambiarlo."));
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="self-start text-sm font-bold text-slate-500 underline"
      >
        Usar Materama como otra cosa
      </button>
    );
  }

  return (
    <Tarjeta
      titulo="¿Cómo quieres usar Materama?"
      pie="Puedes volver a cambiarlo cuando quieras."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {PERFILES.map((cual) => (
          <li key={cual.rol}>
            <button
              type="button"
              onClick={() => cambiar(cual.rol)}
              disabled={cual.rol === perfil.rol}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-slate-100 p-4 text-left transition hover:border-sky-300 disabled:opacity-40"
            >
              <span className="text-2xl" aria-hidden>{cual.emoji}</span>
              <span className="font-bold text-slate-800">{cual.titulo}</span>
            </button>
          </li>
        ))}
      </ul>
      <Aviso texto={aviso} />
    </Tarjeta>
  );
}
