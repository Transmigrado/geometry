"use client";

import { tono } from "@/lib/color";

type Props = {
  radio: number;
  altura: number;
  color: string;
  colorClaro: string;
  /** 0 = pared desenrollada y tapas afuera, 1 = cilindro armado */
  armado: number;
  /** si el problema no permite desarmar, se dibuja solo el cilindro */
  desarmable: boolean;
};

const TIRAS = 48;
/** cuánto se aplasta la tapa al mirarla en perspectiva */
const APLASTADO = 0.3;

/**
 * La pared se divide en tiras verticales que van de `x = r·θ` (extendida) a
 * `x = r·sen θ` (enrollada), así que el mismo deslizador enrolla el tubo y
 * acuesta las tapas sin cortes ni saltos.
 */
export function CilindroPlegable({
  radio,
  altura,
  color,
  colorClaro,
  armado,
  desarmable,
}: Props) {
  const t = desarmable ? armado : 1;
  const radioTapa = radio * APLASTADO;

  const ancho = desarmable ? 2 * Math.PI * radio : 2 * radio;
  const alto = desarmable ? altura + 4 * radio : altura + 2 * radioTapa;
  const centroX = ancho / 2;
  const cima = desarmable ? 2 * radio : radioTapa;

  // al enrollarse el dibujo encoge, así que lo recentramos en su caja
  const centrado = (alto - (altura + 2 * radioTapa)) / 2 + radioTapa;
  const subida = t * (centrado - cima);

  const equis = (angulo: number) =>
    (1 - t) * radio * angulo + t * radio * Math.sin(angulo);
  const altoDe = (angulo: number) => cima + t * radioTapa * Math.cos(angulo);

  const tiras = Array.from({ length: TIRAS }, (_, indice) => {
    const desde = -Math.PI + (indice * 2 * Math.PI) / TIRAS;
    const hasta = -Math.PI + ((indice + 1) * 2 * Math.PI) / TIRAS;
    return { desde, hasta, profundidad: Math.cos((desde + hasta) / 2) };
  });

  // las tiras de atrás se pintan primero para que las de adelante las tapen
  const ordenadas = [...tiras].sort((a, b) => a.profundidad - b.profundidad);

  const contorno = [
    ...tiras.map(({ desde }) => [centroX + equis(desde), altoDe(desde)]),
    [centroX + equis(Math.PI), altoDe(Math.PI)],
    [centroX + equis(Math.PI), altoDe(Math.PI) + altura],
    ...tiras
      .map(({ desde }) => [centroX + equis(desde), altoDe(desde) + altura])
      .reverse(),
  ];

  // el contorno plano solo cede su lugar a la silueta al final del enrollado,
  // porque al cerrarse sus costuras se juntan en el centro del cilindro
  const silueta = Math.max(0, (t - 0.85) / 0.15);

  const radioTapaActual = radio * (1 - t) + radioTapa * t;
  const tapaArriba = cima - radio * (1 - t);
  const tapaAbajo = cima + altura + radio * (1 - t);

  return (
    <svg width={ancho} height={alto} className="shrink-0 overflow-visible">
      <g transform={`translate(0 ${subida})`}>
        <ellipse
          cx={centroX}
          cy={tapaAbajo}
          rx={radio}
          ry={radioTapaActual}
          fill={tono(colorClaro, 1 - 0.12 * t)}
          stroke="rgba(15,23,42,.35)"
        />

        {ordenadas.map(({ desde, hasta, profundidad }) => {
          // la cara que mira al niño se ve más clara que la del fondo
          const luz = 1 - t * 0.35 * (1 - (profundidad + 1) / 2);
          const relleno = tono(color, luz);

          return (
            <polygon
              key={desde}
              points={`${centroX + equis(desde)},${altoDe(desde)} ${
                centroX + equis(hasta)
              },${altoDe(hasta)} ${centroX + equis(hasta)},${
                altoDe(hasta) + altura
              } ${centroX + equis(desde)},${altoDe(desde) + altura}`}
              fill={relleno}
              stroke={relleno}
              strokeWidth={1}
            />
          );
        })}

        {/* el borde de la pared se desvanece al cerrarse... */}
        <path
          d={`M ${contorno.map(([x, y]) => `${x},${y}`).join(" L ")} Z`}
          fill="none"
          stroke="rgba(15,23,42,.35)"
          opacity={1 - silueta}
        />

        {/* ...y deja en su lugar los dos costados del cilindro */}
        {[-1, 1].map((lado) => (
          <line
            key={lado}
            x1={centroX + lado * radio}
            y1={cima}
            x2={centroX + lado * radio}
            y2={cima + altura}
            stroke="rgba(15,23,42,.35)"
            opacity={silueta}
          />
        ))}

        <ellipse
          cx={centroX}
          cy={tapaArriba}
          rx={radio}
          ry={radioTapaActual}
          fill={colorClaro}
          stroke="rgba(15,23,42,.35)"
        />

        {desarmable && (
          <text
            x={centroX}
            y={cima + altura / 2}
            textAnchor="middle"
            className="fill-slate-700/70 text-[11px] font-bold"
            opacity={1 - t}
          >
            la pared enrollada
          </text>
        )}
      </g>
    </svg>
  );
}
