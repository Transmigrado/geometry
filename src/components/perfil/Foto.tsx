"use client";

import { useRef, useState } from "react";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { useSesion } from "@/components/auth/ProveedorSesion";
import { Aviso, BOTON, Tarjeta, porque } from "@/components/paneles/piezas";
import { subirFoto } from "@/lib/foto";

/**
 * Cambiar la foto de perfil. Es de quien no es alumno: los niños tienen su
 * muñeco y no suben retratos.
 */
export function Foto() {
  const { perfil, guardar } = usePerfil();
  const { usuario } = useSesion();
  const archivo = useRef<HTMLInputElement>(null);

  const [subiendo, setSubiendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function elegida(evento: React.ChangeEvent<HTMLInputElement>) {
    const suya = evento.target.files?.[0];
    // el valor se limpia para que elegir la misma foto otra vez vuelva a
    // disparar el cambio
    evento.target.value = "";

    if (!suya || !usuario) return;

    setSubiendo(true);
    setAviso(null);
    try {
      const donde = await subirFoto(usuario.uid, suya);
      await guardar({ foto: donde });
      setAviso("Listo, esa es tu foto.");
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos subir la foto."));
    } finally {
      setSubiendo(false);
    }
  }

  async function quitar() {
    setAviso(null);
    try {
      await guardar({ foto: "" });
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos quitarla."));
    }
  }

  return (
    <Tarjeta
      titulo="Tu foto"
      pie="Se recorta en un círculo, así que mejor una donde salgas centrado."
    >
      <div className="flex flex-wrap items-center gap-4">
        <input
          ref={archivo}
          type="file"
          accept="image/*"
          onChange={elegida}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => archivo.current?.click()}
          disabled={subiendo}
          className={BOTON}
        >
          {subiendo ? "Subiendo…" : perfil.foto ? "Cambiar la foto" : "Subir una foto"}
        </button>

        {perfil.foto && (
          <button
            type="button"
            onClick={quitar}
            className="text-sm font-bold text-slate-500 underline"
          >
            Quitarla
          </button>
        )}
      </div>

      <Aviso texto={aviso} />
    </Tarjeta>
  );
}
