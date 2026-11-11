"use client";

import { useId } from "react";
import { CajaPlegable } from "./CajaPlegable";
import { CilindroPlegable } from "./CilindroPlegable";
import { esCaja, huella, medidasDeCaja, type Cuerpo } from "@/lib/cuerpos";

type Props = {
  cuerpo: Cuerpo;
  escala: number;
  /** 0 = desarmado, 1 = armado en 3D */
  armado: number;
  /** si el problema permite abrir el cuerpo (solo en superficie) */
  desarmable: boolean;
  color: string;
  colorClaro: string;
  /** lado de los cuadrados en que se divide cada cara plana */
  unidad: number;
};

export function VistaCuerpo({
  cuerpo,
  escala,
  armado,
  desarmable,
  color,
  colorClaro,
  unidad,
}: Props) {
  if (esCaja(cuerpo)) {
    return (
      <CajaPlegable
        medidas={medidasDeCaja(cuerpo)}
        unidad={unidad}
        armado={desarmable ? armado : 1}
        escala={escala}
        color={color}
        colorCuadrado={colorClaro}
        numerar={desarmable}
      />
    );
  }

  if (cuerpo.tipo === "cilindro") {
    return (
      <CilindroPlegable
        radio={cuerpo.radio * escala}
        altura={cuerpo.altura * escala}
        color={color}
        colorClaro={colorClaro}
        armado={armado}
        desarmable={desarmable}
      />
    );
  }

  const medida = huella(cuerpo, desarmable);

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: medida.ancho * escala, height: medida.alto * escala }}
    >
      <Capa opacidad={desarmable ? armado : 1}>
        <Esfera radio={cuerpo.radio * escala} color={color} />
      </Capa>

      {desarmable && (
        <Capa opacidad={1 - armado}>
          <DesarmeEsfera radio={cuerpo.radio * escala} color={color} />
        </Capa>
      )}
    </div>
  );
}

function Capa({
  opacidad,
  children,
}: {
  opacidad: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity: opacidad, pointerEvents: opacidad < 0.5 ? "none" : undefined }}
    >
      {children}
    </div>
  );
}

function Esfera({ radio, color }: { radio: number; color: string }) {
  const id = useId();

  return (
    <svg width={radio * 2} height={radio * 2} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.85} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity={0.75} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill={`url(#${id})`} />
      <ellipse
        cx="50"
        cy="50"
        rx="49"
        ry="14"
        fill="none"
        stroke="rgba(15,23,42,.25)"
      />
      <circle
        cx="50"
        cy="50"
        r="49"
        fill="none"
        stroke="rgba(15,23,42,.35)"
      />
    </svg>
  );
}

/** La esfera no se puede aplanar, pero su superficie equivale a 4 círculos. */
function DesarmeEsfera({ radio, color }: { radio: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex flex-wrap justify-center"
        style={{ width: radio * 4 }}
      >
        {[0, 1, 2, 3].map((indice) => (
          <Circulo key={indice} radio={radio} color={color} />
        ))}
      </div>
      <p
        className="text-center text-xs font-semibold text-slate-600"
        style={{ maxWidth: Math.max(radio * 4, 220) }}
      >
        La esfera no se puede aplanar, pero su superficie mide lo mismo que
        estos 4 círculos de su mismo radio.
      </p>
    </div>
  );
}

function Circulo({ radio, color }: { radio: number; color: string }) {
  return (
    <svg width={radio * 2} height={radio * 2} viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="49"
        fill={color}
        stroke="rgba(15,23,42,.35)"
      />
    </svg>
  );
}
