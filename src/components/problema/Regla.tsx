"use client";

import type { CSSProperties } from "react";

type Props = {
  direccion: "horizontal" | "vertical";
  etiqueta: string;
  /** dónde se coloca dentro de la cara o del dibujo */
  style: CSSProperties;
  /** giro que cancela el de la cara, para que el número se lea de frente */
  contra?: string;
};

const TINTA = "rgba(15,23,42,.65)";

/** Una medida dibujada como regla: la línea, sus dos topes y el número. */
export function Regla({ direccion, etiqueta, style, contra }: Props) {
  const horizontal = direccion === "horizontal";

  const linea: CSSProperties = horizontal
    ? { left: 0, right: 0, top: "50%", height: 2, marginTop: -1 }
    : { top: 0, bottom: 0, left: "50%", width: 2, marginLeft: -1 };

  const tope: CSSProperties = horizontal
    ? { top: "50%", width: 2, height: 12, marginTop: -6 }
    : { left: "50%", height: 2, width: 12, marginLeft: -6 };

  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      // sin esto el contenedor aplanaría el giro del número y lo haría
      // desaparecer cuando la cara está de canto
      style={contra ? { ...style, transformStyle: "preserve-3d" } : style}
    >
      <span className="absolute" style={{ ...linea, background: TINTA }} />
      <span
        className="absolute"
        style={{ ...tope, background: TINTA, ...(horizontal ? { left: 0 } : { top: 0 }) }}
      />
      <span
        className="absolute"
        style={{
          ...tope,
          background: TINTA,
          ...(horizontal ? { right: 0 } : { bottom: 0 }),
        }}
      />
      <span
        className="relative whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm"
        style={contra ? { transform: contra } : undefined}
      >
        {etiqueta}
      </span>
    </div>
  );
}
