"use client";

import { useState } from "react";
import { piezasDeConfeti } from "@/lib/confeti";

/**
 * Confeti cayendo, con CSS puro: nada que descargar ni que montar en el
 * canvas de three.js, así que no compite con la animación del avatar.
 */
export function Confeti({ cuantos = 46 }: { cuantos?: number }) {
  const [piezas] = useState(() => piezasDeConfeti(cuantos));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {piezas.map((pieza) => (
        <span
          key={pieza.id}
          className="confeti-pieza rounded-sm"
          style={{
            left: `${pieza.izquierda}%`,
            width: pieza.ancho,
            height: pieza.ancho * 1.6,
            backgroundColor: pieza.color,
            animationDelay: `${pieza.retraso}s`,
            animationDuration: `${pieza.duracion}s`,
            ["--giro" as string]: `${pieza.giro}deg`,
          }}
        />
      ))}
    </div>
  );
}
