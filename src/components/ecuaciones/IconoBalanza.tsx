"use client";

import { useBucle } from "@/components/problema/animacion";

/**
 * La pesa del módulo, en pequeño y con la respuesta tapada. Es la misma
 * que verán al entrar —barra, pie y visor— para que la tarjeta y lo que
 * hay detrás se reconozcan como la misma cosa.
 *
 * Las frutas se posan una a una y el visor acaba preguntando: eso es
 * exactamente el ejercicio.
 */
export function IconoBalanza({ color }: { color: string }) {
  const t = useBucle(4200);

  // tres frutas que van cayendo, y un respiro al final
  const puestas = Math.min(3, Math.floor(t * 4.2));

  return (
    <svg
      viewBox="0 0 150 120"
      width={150}
      height={120}
      role="img"
      aria-label="Una pesa con frutas encima"
    >
      {[0, 1, 2].map((cual) => {
        const puesta = cual < puestas;

        return (
          <text
            key={cual}
            x={45 + cual * 30}
            y={puesta ? 40 : 10}
            fontSize={26}
            textAnchor="middle"
            opacity={puesta ? 1 : 0}
            style={{ transition: "y 300ms ease-out, opacity 200ms" }}
          >
            🍎
          </text>
        );
      })}

      {/* la barra donde se apoyan */}
      <rect x={22} y={46} width={106} height={9} rx={4.5} fill={color} opacity={0.5} />

      {/* el cuerpo de la pesa, con su visor */}
      <rect x={69} y={55} width={12} height={16} fill={color} opacity={0.7} />
      <rect x={38} y={68} width={74} height={42} rx={12} fill={color} />
      <rect x={56} y={79} width={38} height={21} rx={5} fill="#0f172a" />
      <text
        x={75}
        y={95}
        fontSize={15}
        fontWeight="bold"
        textAnchor="middle"
        fill="#ffffff"
      >
        ?
      </text>
    </svg>
  );
}
