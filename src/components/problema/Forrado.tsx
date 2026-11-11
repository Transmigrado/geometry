"use client";

import { useId, type ReactNode } from "react";
import { useReproduccion } from "./animacion";
import { CuboIso, limitesIso, posicionIso } from "./iso";
import { MiniCuerpo, TAMANO_MINI } from "./MiniCuerpo";
import {
  esCaja,
  medidasDeCaja,
  medir,
  type Cuerpo,
  type TipoProblema,
} from "@/lib/cuerpos";
import { tono } from "@/lib/color";
import { conteoVolumen } from "@/lib/problema";
import {
  cuadradosDeRed,
  piezasDeCaja,
  piezasDeCilindro,
  redDeCaja,
  type Pieza,
} from "@/lib/red";

type Props = {
  problema: TipoProblema;
  a: Cuerpo;
  b: Cuerpo;
  escala: number;
  colorB: string;
};

const HUECO = 44;
const CARAS_DEL_CUBO = 6;
/** a partir de aquí son demasiadas piezas para verlas volar una a una */
const MAXIMO_PIEZAS = 40;

export function Forrado({ problema, a, b, escala, colorB }: Props) {
  const id = useId();
  const medidas = esCaja(a) ? medidasDeCaja(a) : null;
  const unidad = b.tipo === "cubo" ? b.lado : 1;

  const cuadrados =
    medidas && problema === "superficie" && b.tipo === "cubo"
      ? cuadradosDeRed(medidas, unidad)
      : null;
  const cubos =
    medidas && problema === "volumen" && b.tipo === "cubo"
      ? conteoVolumen(medidas, unidad)
      : null;

  // cubrir una superficie se ve mejor con el cuerpo abierto, salvo la
  // esfera, que no se puede aplanar
  const red =
    problema === "superficie"
      ? medidas
        ? piezasDeCaja(medidas)
        : a.tipo === "cilindro"
          ? piezasDeCilindro(a.radio, a.altura)
          : null
      : null;

  const modo =
    cuadrados && cuadrados.length > 0 && cuadrados.length <= 240
      ? "cuadrados"
      : cubos && cubos.cubitos > 0 && cubos.cubitos <= 400
        ? "cubos"
        : red
          ? "desarme"
          : "nivel";

  const cuantas =
    modo === "cuadrados"
      ? Math.ceil(cuadrados!.length / CARAS_DEL_CUBO)
      : modo === "cubos"
        ? cubos!.cubitos
        : Math.ceil(medir(a, problema) / medir(b, problema) - 1e-9);
  // una cuenta rara aquí envenenaría la duración y con ella todo el avance
  const piezas = Number.isFinite(cuantas) ? Math.max(1, cuantas) : 1;

  const duracion = Math.min(9000, Math.max(2600, piezas * 650));
  const { t, reproduciendo, reproducir, ir } = useReproduccion(duracion);

  const porPiezas = piezas <= MAXIMO_PIEZAS;
  const avance = t * piezas;
  const colocadas = Math.min(piezas, Math.floor(avance));
  const fase = porPiezas ? avance - colocadas : 0;
  const volando = porPiezas && colocadas < piezas && fase > 0;
  // la pieza se va vaciando durante la segunda mitad de su viaje
  const vertido = Math.max(0, (fase - 0.5) / 0.5);
  const hecho = Math.min(
    medir(a, problema),
    (colocadas + vertido) * medir(b, problema),
  );

  const escena = dibujarDestino();
  const fuenteX = TAMANO_MINI / 2;
  const fuenteY = escena.alto / 2;
  const ancho = TAMANO_MINI + HUECO + escena.ancho;
  const alto = Math.max(escena.alto, TAMANO_MINI * 2);

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">
        {problema === "superficie"
          ? "Mira cómo se va cubriendo por fuera"
          : "Mira cómo se va llenando por dentro"}
      </h2>

      <div className="flex justify-center overflow-x-auto py-2">
        <svg width={ancho} height={alto} className="shrink-0">
          <defs>
            <pattern
              id={`${id}-rayas`}
              width="8"
              height="8"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="#f1f5f9" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" />
            </pattern>
          </defs>

          {/* la fuente: de aquí salen las piezas, nunca se acaba */}
          <g transform={`translate(${fuenteX} ${fuenteY})`}>
            {[6, 3, 0].map((desvio) => (
              <g key={desvio} transform={`translate(${desvio} ${desvio})`}>
                <MiniCuerpo cuerpo={b} color={colorB} />
              </g>
            ))}
          </g>

          <g transform={`translate(${TAMANO_MINI + HUECO} 0)`}>
            {escena.nodo}
          </g>

          {volando && dibujarVuelo()}
        </svg>
      </div>

      <Bandeja cuerpo={b} color={colorB} cuantas={colocadas} />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={reproducir}
          className="rounded-full bg-sky-500 px-6 py-3 font-bold text-white shadow"
        >
          {reproduciendo ? "⏳ Va en camino…" : "▶ Verlo de nuevo"}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={t * 100}
          onChange={(evento) => ir(Number(evento.target.value) / 100)}
          aria-label="Avance de la animación"
          className="h-3 min-w-48 flex-1 cursor-pointer appearance-none rounded-full bg-sky-100 accent-sky-500"
        />
      </div>
    </section>
  );

  function dibujarDestino(): { ancho: number; alto: number; nodo: ReactNode } {
    if (modo === "cuadrados" && medidas) {
      const red = redDeCaja(medidas);
      const lado = unidad * escala;
      const puestos = Math.min(
        cuadrados!.length,
        colocadas * CARAS_DEL_CUBO,
      );

      return {
        ancho: red.ancho * escala,
        alto: red.alto * escala,
        nodo: (
          <>
            {red.caras.map((cara) => (
              <rect
                key={cara.id}
                x={cara.x * escala}
                y={cara.y * escala}
                width={cara.ancho * escala}
                height={cara.alto * escala}
                fill={`url(#${id}-rayas)`}
                stroke="rgba(15,23,42,.35)"
              />
            ))}

            {cuadrados!.map((cuadro, indice) => {
              const puesto = indice < puestos;
              // un tono por cubo, para ver de cuál salió cada grupo de seis
              const grupo = Math.floor(indice / CARAS_DEL_CUBO);

              return (
                <rect
                  key={indice}
                  x={cuadro.x * escala}
                  y={cuadro.y * escala}
                  width={lado}
                  height={lado}
                  fill={puesto ? tono(colorB, grupo % 2 ? 0.82 : 1) : "white"}
                  fillOpacity={puesto ? 1 : 0.45}
                  stroke="rgba(15,23,42,.3)"
                  strokeDasharray={puesto ? undefined : "3 3"}
                />
              );
            })}
          </>
        ),
      };
    }

    if (modo === "cubos" && cubos) {
      const lado = unidad * escala;
      const limites = limitesIso(cubos.enLargo, cubos.enAncho, cubos.enAlto, lado);
      const orden = ordenDeCubos(cubos.enLargo, cubos.enAncho, cubos.enAlto);

      return {
        ancho: limites.maxX - limites.minX,
        alto: limites.maxY - limites.minY,
        nodo: (
          <g transform={`translate(${-limites.minX} ${-limites.minY})`}>
            {[...orden]
              .sort((uno, otro) => uno.profundidad - otro.profundidad)
              .map(({ i, j, k, puesto }) => {
                const { cx, cy } = posicionIso(i, j, k, lado);
                return (
                  <CuboIso
                    key={`${i}-${j}-${k}`}
                    cx={cx}
                    cy={cy}
                    lado={lado}
                    color={colorB}
                    opacidad={puesto < colocadas ? 1 : 0.12}
                  />
                );
              })}
          </g>
        ),
      };
    }

    if (modo === "desarme" && red) {
      return {
        ancho: red.ancho * escala,
        alto: red.alto * escala,
        nodo: (
          <>
            {red.piezas.map((pieza, indice) => (
              <PiezaDeRed
                key={indice}
                pieza={pieza}
                parte={cubiertoDe(indice)}
                escala={escala}
                color={colorB}
                rayas={`url(#${id}-rayas)`}
                id={`${id}-pieza-${indice}`}
              />
            ))}
          </>
        ),
      };
    }

    const forma = formaDe(a, escala);
    const llenado = alturaLlena(a, problema, hecho / medir(a, problema));

    return {
      ancho: forma.ancho,
      alto: forma.alto,
      nodo: (
        <>
          <clipPath id={`${id}-nivel`}>
            <rect
              x={0}
              y={forma.alto * (1 - llenado)}
              width={forma.ancho}
              height={forma.alto * llenado}
            />
          </clipPath>
          {forma.dibujo("#f1f5f9")}
          <g clipPath={`url(#${id}-nivel)`}>{forma.dibujo(colorB)}</g>
          <g fill="none" stroke="rgba(15,23,42,.45)">
            {forma.dibujo("none")}
          </g>
        </>
      ),
    };
  }

  function dibujarVuelo() {
    const destino = puntoDestino();
    const salto = -34 * Math.sin(Math.PI * fase);
    const x = fuenteX + (destino.x - fuenteX) * fase;
    const y = fuenteY + (destino.y - fuenteY) * fase + salto;

    // a mitad de camino el cubo se abre y cada cara busca su cuadrado
    if (modo === "cuadrados" && fase > 0.55) {
      const reparto = (fase - 0.55) / 0.45;
      const lado = unidad * escala;
      const base = TAMANO_MINI + HUECO;

      return (
        <g>
          {Array.from({ length: CARAS_DEL_CUBO }, (_, cara) => {
            const indice = colocadas * CARAS_DEL_CUBO + cara;
            const objetivo = cuadrados![indice];
            if (!objetivo) return null;

            const finX = base + objetivo.x * escala;
            const finY = objetivo.y * escala;

            return (
              <rect
                key={cara}
                x={x - lado / 2 + (finX - (x - lado / 2)) * reparto}
                y={y - lado / 2 + (finY - (y - lado / 2)) * reparto}
                width={lado}
                height={lado}
                fill={colorB}
                stroke="rgba(15,23,42,.3)"
              />
            );
          })}
        </g>
      );
    }

    // el cubo crece durante el viaje hasta el tamaño que tendrá al llegar
    if (b.tipo === "cubo" && modo !== "nivel") {
      const destinoLado = unidad * escala;
      const parte = modo === "cuadrados" ? Math.min(1, fase / 0.55) : fase;
      const lado = TAMANO_MINI / 2 + (destinoLado - TAMANO_MINI / 2) * parte;

      return (
        <g transform={`translate(${x} ${y})`}>
          <CuboIso cx={0} cy={-lado / 2} lado={lado} color={colorB} />
        </g>
      );
    }

    return (
      <g transform={`translate(${x} ${y})`}>
        <MiniCuerpo cuerpo={b} color={colorB} />
      </g>
    );
  }

  /** Cuánto lleva cubierta la pieza, repartiendo el área en orden. */
  function cubiertoDe(indice: number) {
    const antes = red!.piezas
      .slice(0, indice)
      .reduce((suma, pieza) => suma + pieza.area, 0);

    return Math.max(0, Math.min(1, (hecho - antes) / red!.piezas[indice].area));
  }

  function puntoDestino() {
    const base = TAMANO_MINI + HUECO;

    if (modo === "desarme" && red) {
      // la pieza viaja hacia el trozo que se está cubriendo ahora
      const indice = Math.max(
        0,
        red.piezas.findIndex((_, numero) => cubiertoDe(numero) < 1),
      );
      const pieza = red.piezas[indice];
      const centro =
        pieza.forma === "rect"
          ? { x: pieza.x + pieza.ancho / 2, y: pieza.y + pieza.alto / 2 }
          : { x: pieza.cx, y: pieza.cy };

      return { x: base + centro.x * escala, y: centro.y * escala };
    }

    if (modo === "cuadrados" && cuadrados) {
      const objetivo =
        cuadrados[Math.min(cuadrados.length - 1, colocadas * CARAS_DEL_CUBO)];

      if (objetivo) {
        return {
          x: base + (objetivo.x + unidad / 2) * escala,
          y: (objetivo.y + unidad / 2) * escala,
        };
      }
    }

    if (modo === "cubos" && cubos) {
      const lado = unidad * escala;
      const limites = limitesIso(
        cubos.enLargo,
        cubos.enAncho,
        cubos.enAlto,
        lado,
      );
      const destino = ordenDeCubos(
        cubos.enLargo,
        cubos.enAncho,
        cubos.enAlto,
      ).find((cubo) => cubo.puesto === colocadas);

      if (destino) {
        const { cx, cy } = posicionIso(destino.i, destino.j, destino.k, lado);
        return {
          x: base - limites.minX + cx,
          y: -limites.minY + cy + lado / 2,
        };
      }
    }

    return { x: base + escena.ancho / 2, y: escena.alto / 2 };
  }
}

function Bandeja({
  cuerpo,
  color,
  cuantas,
}: {
  cuerpo: Cuerpo;
  color: string;
  cuantas: number;
}) {
  const dibujadas = Math.min(cuantas, 60);

  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
        Las que hemos usado
      </p>
      <ul className="mt-2 flex min-h-12 flex-wrap items-center gap-1">
        {Array.from({ length: dibujadas }, (_, indice) => (
          <li key={indice}>
            <svg width={TAMANO_MINI} height={TAMANO_MINI}>
              <g transform={`translate(${TAMANO_MINI / 2} ${TAMANO_MINI / 2})`}>
                <MiniCuerpo cuerpo={cuerpo} color={color} />
              </g>
            </svg>
          </li>
        ))}
        {cuantas > dibujadas && (
          <li className="font-bold text-slate-500">…</li>
        )}
      </ul>
    </div>
  );
}

/** El orden en que se acomodan los cubitos: piso por piso, fila por fila. */
function ordenDeCubos(nx: number, ny: number, nz: number) {
  const cubos = [];
  for (let k = 0; k < nz; k += 1) {
    for (let j = 0; j < ny; j += 1) {
      for (let i = 0; i < nx; i += 1) {
        cubos.push({
          i,
          j,
          k,
          profundidad: i + j + k,
          puesto: k * nx * ny + j * nx + i,
        });
      }
    }
  }
  return cubos;
}

/** Un trozo de la red, vacío y con lo que ya se cubrió encima. */
function PiezaDeRed({
  pieza,
  parte,
  escala,
  color,
  rayas,
  id,
}: {
  pieza: Pieza;
  parte: number;
  escala: number;
  color: string;
  rayas: string;
  id: string;
}) {
  const borde = "rgba(15,23,42,.35)";

  if (pieza.forma === "rect") {
    const alto = pieza.alto * escala;
    const y = pieza.y * escala;

    return (
      <>
        <rect
          x={pieza.x * escala}
          y={y}
          width={pieza.ancho * escala}
          height={alto}
          fill={rayas}
          stroke={borde}
        />
        <rect
          x={pieza.x * escala}
          y={y + alto * (1 - parte)}
          width={pieza.ancho * escala}
          height={alto * parte}
          fill={color}
        />
        <rect
          x={pieza.x * escala}
          y={y}
          width={pieza.ancho * escala}
          height={alto}
          fill="none"
          stroke={borde}
        />
      </>
    );
  }

  const radio = pieza.radio * escala;
  const cx = pieza.cx * escala;
  const cy = pieza.cy * escala;
  // en un círculo el área no sube parejo con la altura
  const altura = radio * alturaDeCirculo(parte);

  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect
            x={cx - radio}
            y={cy + radio - altura}
            width={radio * 2}
            height={altura}
          />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={radio} fill={rayas} stroke={borde} />
      <circle cx={cx} cy={cy} r={radio} fill={color} clipPath={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={radio} fill="none" stroke={borde} />
    </>
  );
}

/** Qué altura, en radios, cubre esa parte del área de un círculo. */
function alturaDeCirculo(parte: number) {
  if (parte <= 0) return 0;
  if (parte >= 1) return 2;

  let bajo = 0;
  let alto = 2;
  for (let paso = 0; paso < 24; paso += 1) {
    const medio = (bajo + alto) / 2;
    const area =
      (Math.acos(1 - medio) - (1 - medio) * Math.sqrt(2 * medio - medio ** 2)) /
      Math.PI;
    if (area < parte) bajo = medio;
    else alto = medio;
  }

  return (bajo + alto) / 2;
}

function formaDe(cuerpo: Cuerpo, escala: number) {
  if (esCaja(cuerpo)) {
    const medidas = medidasDeCaja(cuerpo);
    const ancho = medidas.largo * escala;
    const alto = medidas.alto * escala;
    return {
      ancho,
      alto,
      dibujo: (relleno: string) => (
        <rect width={ancho} height={alto} fill={relleno} />
      ),
    };
  }

  if (cuerpo.tipo === "esfera") {
    const diametro = 2 * cuerpo.radio * escala;
    return {
      ancho: diametro,
      alto: diametro,
      dibujo: (relleno: string) => (
        <circle
          cx={diametro / 2}
          cy={diametro / 2}
          r={diametro / 2}
          fill={relleno}
        />
      ),
    };
  }

  const rx = cuerpo.radio * escala;
  const ry = rx * 0.3;
  const altura = cuerpo.altura * escala;

  return {
    ancho: rx * 2,
    alto: altura + ry * 2,
    dibujo: (relleno: string) => (
      <>
        <path
          d={`M 0 ${ry} L 0 ${ry + altura} A ${rx} ${ry} 0 0 0 ${rx * 2} ${
            ry + altura
          } L ${rx * 2} ${ry} Z`}
          fill={relleno}
        />
        <ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={relleno} />
      </>
    ),
  };
}

/**
 * A qué altura llega lo que ya pusimos. En la esfera el volumen no sube
 * parejo con la altura, así que se busca el casquete que corresponde.
 */
function alturaLlena(
  cuerpo: Cuerpo,
  problema: TipoProblema,
  fraccion: number,
) {
  if (cuerpo.tipo !== "esfera" || problema !== "volumen") return fraccion;

  let bajo = 0;
  let alto = 2;
  for (let paso = 0; paso < 24; paso += 1) {
    const medio = (bajo + alto) / 2;
    if ((medio * medio * (3 - medio)) / 4 < fraccion) bajo = medio;
    else alto = medio;
  }

  return (bajo + alto) / 4;
}
