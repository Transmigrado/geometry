"use client";

import { usePerfil } from "@/components/auth/ProveedorPerfil";

/**
 * La carita del usuario. Sale de la miniatura guardada en el perfil, sin
 * montar el 3D: eso solo pasa en la página del avatar.
 */
export function Avatar({ className = "h-10 w-10 text-lg" }: { className?: string }) {
  const { perfil } = usePerfil();

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-sky-200 bg-sky-100 ${className}`}
    >
      {perfil.miniatura ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={perfil.miniatura}
          alt="Tu avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        "🙂"
      )}
    </span>
  );
}
