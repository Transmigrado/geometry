"use client";

import { useCallback, useEffect, useState } from "react";
import { useSesion } from "@/components/auth/ProveedorSesion";
import {
  canjearCodigo,
  hijosDe,
  progresoDe,
  type Alumno,
  type Progreso,
} from "@/lib/colegio";
import {
  Aviso, BOTON, CAMPO, Cargando, ETIQUETA, Tarjeta, Titulo, Vacio, porque,
} from "./piezas";
import { ComoVa } from "./Progreso";

export function Familia() {
  const { usuario } = useSesion();
  const [hijos, setHijos] = useState<Alumno[] | null>(null);

  const uid = usuario?.uid;

  const recargar = useCallback(() => {
    if (!uid) return;
    hijosDe(uid).then(setHijos).catch(() => setHijos([]));
  }, [uid]);

  useEffect(recargar, [recargar]);

  return (
    <div className="flex flex-col gap-6">
      <Titulo>Mi familia</Titulo>

      {!hijos ? (
        <Cargando />
      ) : hijos.length === 0 ? (
        <Tarjeta titulo="Tus hijos">
          <Vacio>Todavía no has vinculado a nadie.</Vacio>
        </Tarjeta>
      ) : (
        hijos.map((hijo) => <Hijo key={hijo.id} hijo={hijo} />)
      )}

      <Vincular alVincular={recargar} />
    </div>
  );
}

/** Un hijo y cómo le va. */
function Hijo({ hijo }: { hijo: Alumno }) {
  const [progreso, setProgreso] = useState<Progreso[] | null>(null);

  useEffect(() => {
    progresoDe(hijo.id).then(setProgreso).catch(() => setProgreso([]));
  }, [hijo.id]);

  const nombre = [hijo.nombre, hijo.apellido].filter(Boolean).join(" ")
    || "Sin nombre";

  return (
    <Tarjeta titulo={nombre} pie="Cómo le va en cada tema.">
      {!progreso ? (
        <Cargando />
      ) : (
        <ComoVa
          progreso={progreso}
          quien={hijo.nombre || "Tu hijo"}
          alumno={hijo.id}
        />
      )}
    </Tarjeta>
  );
}

/**
 * El código lo pide el propio niño desde su perfil. Es a propósito: si un
 * adulto pudiera vincularse buscando por correo, cualquiera que conociera
 * el de un menor se lo adjudicaría.
 */
function Vincular({ alVincular }: { alVincular: () => void }) {
  const [codigo, setCodigo] = useState("");
  const [canjeando, setCanjeando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function canjear(evento: React.FormEvent) {
    evento.preventDefault();
    setCanjeando(true);
    setAviso(null);
    try {
      const hecho = await canjearCodigo({ codigo: codigo.trim() });
      setCodigo("");
      setAviso(`Listo, ya sigues a ${hecho.nombre ?? "tu hijo"}.`);
      alVincular();
    } catch (falla) {
      setAviso("!" + porque(falla, "Ese código no sirve."));
    } finally {
      setCanjeando(false);
    }
  }

  return (
    <Tarjeta
      titulo="Vincular a un hijo"
      pie="Pídele el código a él: lo saca de su propio perfil y dura una hora."
    >
      <form onSubmit={canjear} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-2">
          <span className={ETIQUETA}>Código de familia</span>
          <input
            type="text"
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
            maxLength={10}
            placeholder="ABC234"
            className={`${CAMPO} font-mono tracking-[0.2em]`}
          />
        </label>
        <button type="submit" disabled={codigo.trim().length < 6 || canjeando} className={BOTON}>
          {canjeando ? "Comprobando…" : "Vincular"}
        </button>
      </form>
      <Aviso texto={aviso} />
    </Tarjeta>
  );
}
