"use client";

import { useSesion } from "@/components/auth/ProveedorSesion";
import { AvancesSemana } from "@/components/inicio/AvancesSemana";

/** Vive aparte del tablero del inicio para no amontonar las dos cosas en
 * la misma pantalla: elegir qué jugar y ver cómo le ha ido son preguntas
 * distintas. */
export function Estadisticas() {
  const { usuario } = useSesion();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-sky-800">
          📊 Tus estadísticas
        </h1>
        <p className="text-slate-600">Cómo te ha ido en cada materia.</p>
      </header>

      {usuario && <AvancesSemana alumno={usuario.uid} />}
    </div>
  );
}
