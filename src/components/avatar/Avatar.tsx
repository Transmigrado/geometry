"use client";

import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { rolDe } from "@/lib/roles";

/**
 * La carita del usuario. Del alumno sale el retrato de su muñeco; de los
 * demás, la foto que subieron. En ninguno de los dos casos se monta la
 * escena 3D: eso solo pasa en la página del avatar.
 */
export function Avatar({ className = "h-10 w-10 text-lg" }: { className?: string }) {
  const { perfil } = usePerfil();
  const cara = rolDe(perfil) === "student" ? perfil.miniatura : perfil.foto;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-sky-200 bg-sky-100 ${className}`}
    >
      {cara ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={cara}
          alt="Tu avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        "🙂"
      )}
    </span>
  );
}
