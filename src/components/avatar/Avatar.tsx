"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSesion } from "@/components/auth/ProveedorSesion";
import { leerPerfil } from "@/lib/perfil";

/**
 * La carita del usuario en la cabecera. Muestra la miniatura guardada, sin
 * despertar a Unity: eso solo pasa en la página del avatar.
 */
export function Avatar() {
  const { usuario } = useSesion();
  const [miniatura, setMiniatura] = useState<string | null>(null);

  const uid = usuario?.uid;

  useEffect(() => {
    if (!uid) return;
    let vigente = true;

    leerPerfil(uid)
      .then((perfil) => {
        if (vigente) setMiniatura(perfil.miniatura);
      })
      .catch(() => {});

    return () => {
      vigente = false;
    };
  }, [uid]);

  if (!usuario) return null;

  return (
    <Link
      href="/avatar"
      title="Tu avatar"
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-sky-200 bg-sky-100 text-lg"
    >
      {miniatura ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={miniatura}
          alt="Tu avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        "🙂"
      )}
    </Link>
  );
}
