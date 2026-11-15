"use client";

type Props = {
  posicion: number;
  /** mientras se mueve en reversa el auto no gira: solo retrocede */
  retrocediendo?: boolean;
};

const MIN = -12;
const MAX = 12;
const ANCHO = 480;
const ALTO = 120;
const MARGEN = 24;
const EJE_Y = 70;
const PASO = (ANCHO - MARGEN * 2) / (MAX - MIN);

function xDe(valor: number) {
  return MARGEN + (valor - MIN) * PASO;
}

export function RectaNumerica({ posicion, retrocediendo = false }: Props) {
  return (
    <svg
      width={ANCHO}
      height={ALTO}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label={`Una recta numérica con el auto en el ${posicion}`}
    >
      <line
        x1={MARGEN}
        y1={EJE_Y}
        x2={ANCHO - MARGEN}
        y2={EJE_Y}
        stroke="#94a3b8"
        strokeWidth={3}
      />

      {Array.from({ length: MAX - MIN + 1 }, (_, indice) => {
        const valor = MIN + indice;
        const destacado = valor % 2 === 0;

        return (
          <g key={valor}>
            <line
              x1={xDe(valor)}
              y1={EJE_Y - (destacado ? 10 : 6)}
              x2={xDe(valor)}
              y2={EJE_Y + (destacado ? 10 : 6)}
              stroke={valor === 0 ? "#0f172a" : "#94a3b8"}
              strokeWidth={valor === 0 ? 3 : 2}
            />
            {destacado && (
              <text
                x={xDe(valor)}
                y={EJE_Y + 26}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill="#475569"
              >
                {valor}
              </text>
            )}
          </g>
        );
      })}

      <g transform={`translate(${xDe(posicion)} ${EJE_Y - 18})`}>
        <Auto retrocediendo={retrocediendo} />
      </g>
    </svg>
  );
}

/** El auto siempre mira a la derecha: para ir al negativo, retrocede. */
function Auto({ retrocediendo }: { retrocediendo: boolean }) {
  return (
    <g>
      {retrocediendo && (
        <text
          x={10}
          y={-6}
          textAnchor="middle"
          fontSize={10}
          fontWeight="bold"
          fill="#dc2626"
        >
          ◀ R
        </text>
      )}
      <path
        d="M -16 10 L -12 -2 L 6 -2 L 12 4 L 16 4 L 16 10 Z"
        fill="#0ea5e9"
        stroke="#0369a1"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <rect x={-8} y={-8} width={14} height={8} rx={2} fill="#bae6fd" />
      <circle cx={-9} cy={11} r={3.4} fill="#0f172a" />
      <circle cx={9} cy={11} r={3.4} fill="#0f172a" />
    </g>
  );
}
