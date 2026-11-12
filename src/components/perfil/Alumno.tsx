"use client";

import { useState } from "react";
import { canjearCodigo, generarCodigoFamilia } from "@/lib/colegio";
import {
  Aviso, BOTON, CAMPO, Codigo, ETIQUETA, Tarjeta, porque,
} from "@/components/paneles/piezas";

/** Lo que sólo le sirve a un alumno: su curso y su familia. */
export function Alumno() {
  return (
    <>
      <Unirse />
      <Familia />
    </>
  );
}

function Unirse() {
  const [codigo, setCodigo] = useState("");
  const [uniendo, setUniendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function unirse(evento: React.FormEvent) {
    evento.preventDefault();
    setUniendo(true);
    setAviso(null);
    try {
      const hecho = await canjearCodigo({ codigo: codigo.trim() });
      setCodigo("");
      setAviso(`¡Listo! Ya estás en ${hecho.nombre ?? "tu curso"}.`);
    } catch (falla) {
      setAviso("!" + porque(falla, "Ese código no sirve."));
    } finally {
      setUniendo(false);
    }
  }

  return (
    <Tarjeta
      titulo="Unirme a un curso"
      pie="Si tu profesor te dio un código, escríbelo aquí."
    >
      <form onSubmit={unirse} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-2">
          <span className={ETIQUETA}>Código del curso</span>
          <input
            type="text"
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
            maxLength={12}
            placeholder="ABCD2345"
            className={`${CAMPO} font-mono tracking-[0.2em]`}
          />
        </label>
        <button type="submit" disabled={codigo.trim().length < 6 || uniendo} className={BOTON}>
          {uniendo ? "Comprobando…" : "Unirme"}
        </button>
      </form>
      <Aviso texto={aviso} />
    </Tarjeta>
  );
}

/**
 * El código que el niño le da a su familia. Lo genera él y no al revés: si
 * un adulto pudiera vincularse buscando por correo, cualquiera que
 * conociera el de un menor se lo adjudicaría.
 */
function Familia() {
  const [codigo, setCodigo] = useState<{ codigo: string; caduca: number } | null>(null);
  const [pidiendo, setPidiendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function pedir() {
    setPidiendo(true);
    setAviso(null);
    try {
      setCodigo(await generarCodigoFamilia({}));
    } catch (falla) {
      setAviso("!" + porque(falla, "No pudimos crear el código."));
    } finally {
      setPidiendo(false);
    }
  }

  return (
    <Tarjeta
      titulo="Que mi familia me siga"
      pie="Dale este código a tu papá o a tu mamá. Dura una hora y sirve una sola vez."
    >
      {codigo && <Codigo valor={codigo.codigo} caduca={codigo.caduca} />}

      <button type="button" onClick={pedir} disabled={pidiendo} className={`${BOTON} self-start`}>
        {pidiendo ? "Creando…" : codigo ? "Crear otro" : "Crear código"}
      </button>

      <Aviso texto={aviso} />
    </Tarjeta>
  );
}
