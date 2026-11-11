"use client";

import type { CSSProperties, ReactNode } from "react";
import { Regla } from "./Regla";
import { conteoSuperficie, type ConteoCara, type Medidas } from "@/lib/problema";

type Props = {
  medidas: Medidas;
  /** lado del cuadrado con el que se mide cada cara */
  unidad: number;
  /** 0 = desarmada en forma de T, 1 = caja armada en 3D */
  armado: number;
  /** píxeles por unidad de medida (igual para todas las figuras que se comparan) */
  escala: number;
  color: string;
  colorCuadrado: string;
  /** numerar los cuadrados solo tiene sentido cuando contamos superficie */
  numerar?: boolean;
  numerarDesde?: number;
  /** dibujar las reglas de largo, ancho y alto */
  dimensiones?: boolean;
};

/**
 * Dibuja la caja con 6 caras unidas por bisagras: con `armado` en 0 queda
 * abierta en forma de T y con 1 se cierra en 3D. Cada cara se divide en
 * cuadrados del tamaño del cubo con el que medimos, numerados de corrido.
 */
export function CajaPlegable({
  medidas,
  unidad,
  armado,
  escala,
  color,
  colorCuadrado,
  numerar = true,
  numerarDesde = 1,
  dimensiones = false,
}: Props) {
  const { largo, ancho, alto } = medidas;
  const { porCara, cuadrados } = conteoSuperficie(medidas, unidad);
  const cara = (id: ConteoCara["id"]) =>
    porCara.find((item) => item.id === id)!;

  // La T ocupa (largo + 2·alto) de ancho y (2·ancho + 2·alto) de altura.
  const anchoT = (largo + 2 * alto) * escala;
  const altoT = (2 * ancho + 2 * alto) * escala;

  const lado = unidad * escala;
  const mostrarNumeros = numerar && cuadrados <= 200 && lado >= 15;
  const esCubo = largo === ancho && ancho === alto;
  // sitio alrededor del dibujo para que quepan las reglas; a los lados hace
  // falta más, porque ahí la etiqueta se extiende a lo ancho
  const margenX = dimensiones ? 52 : 0;
  const margenY = dimensiones ? 30 : 0;
  // abierta, la regla tiene que esquivar la cara vecina; armada, no
  const aparte = (1 - armado) * alto * escala + 10;

  const comun = {
    unidad,
    escala,
    color,
    colorCuadrado,
    mostrarNumeros,
    armado,
    desplazamiento: numerarDesde - 1,
  };

  return (
    <div
      className="relative mx-auto"
      style={{
        width: anchoT + margenX * 2,
        height: altoT + margenY * 2,
        perspective: 1400,
      }}
    >
      <div
        className="absolute"
        style={{
          left: margenX,
          top: margenY,
          width: anchoT,
          height: altoT,
          transformStyle: "preserve-3d",
          transform: `translateY(${(-armado * ancho * escala) / 2}px) rotateX(${
            -16 * armado
          }deg) rotateY(${-26 * armado}deg)`,
        }}
      >
        {/* la base se queda quieta y las demás caras giran sobre sus bordes */}
        <Cara
          {...comun}
          cara={cara("base")}
          style={{ left: alto * escala, top: (ancho + alto) * escala }}
          regla={
            dimensiones && (
              <>
                <Regla
                  direccion="horizontal"
                  etiqueta={esCubo ? `lado ${largo}` : `largo ${largo}`}
                  style={{
                    left: 0,
                    right: 0,
                    top: "100%",
                    height: 14,
                    marginTop: aparte,
                  }}
                />
                {/* en el cubo los tres lados miden lo mismo: basta una regla */}
                {!esCubo && (
                  <Regla
                    direccion="vertical"
                    etiqueta={`ancho ${ancho}`}
                    style={{
                      top: 0,
                      bottom: 0,
                      right: "100%",
                      width: 14,
                      marginRight: aparte,
                    }}
                  />
                )}
              </>
            )
          }
        >
          <Cara
            {...comun}
            cara={cara("trasera")}
            style={{ bottom: "100%", left: 0 }}
            bisagra={{ origen: "bottom center", giro: `rotateX(${90 * armado}deg)` }}
          >
            <Cara
              {...comun}
              cara={cara("tapa")}
              style={{ bottom: "100%", left: 0 }}
              bisagra={{
                origen: "bottom center",
                giro: `rotateX(${90 * armado}deg)`,
              }}
            />
          </Cara>

          <Cara
            {...comun}
            cara={cara("frontal")}
            style={{ top: "100%", left: 0 }}
            bisagra={{ origen: "top center", giro: `rotateX(${-90 * armado}deg)` }}
          />

          <Cara
            {...comun}
            cara={cara("izquierda")}
            style={{ right: "100%", top: 0 }}
            bisagra={{ origen: "center right", giro: `rotateY(${-90 * armado}deg)` }}
          />

          <Cara
            {...comun}
            cara={cara("derecha")}
            style={{ left: "100%", top: 0 }}
            bisagra={{ origen: "center left", giro: `rotateY(${90 * armado}deg)` }}
            regla={
              dimensiones &&
              !esCubo && (
                <Regla
                  direccion="horizontal"
                  etiqueta={`alto ${alto}`}
                  // cuelga por debajo de la pared derecha, fuera del cuerpo
                  style={{ left: 0, right: 0, top: "100%", height: 14, marginTop: 10 }}
                  // esa pared está de canto en 3D: el número se endereza
                  contra={`rotateY(${-90 * armado}deg)`}
                />
              )
            }
          />
        </Cara>
      </div>
    </div>
  );
}

type CaraProps = {
  cara: ConteoCara;
  unidad: number;
  escala: number;
  color: string;
  colorCuadrado: string;
  mostrarNumeros: boolean;
  armado: number;
  desplazamiento: number;
  style: CSSProperties;
  bisagra?: { origen: string; giro: string };
  regla?: ReactNode;
  children?: ReactNode;
};

function Cara({
  cara,
  unidad,
  escala,
  color,
  colorCuadrado,
  mostrarNumeros,
  armado,
  desplazamiento,
  style,
  bisagra,
  regla,
  children,
}: CaraProps) {
  const lado = unidad * escala;

  return (
    <div
      className="absolute"
      style={{
        width: cara.ancho * escala,
        height: cara.alto * escala,
        transformStyle: "preserve-3d",
        transformOrigin: bisagra?.origen,
        transform: bisagra?.giro,
        background: color,
        // el rayado asoma donde los cuadrados no alcanzan a cubrir la cara
        backgroundImage: cara.exacta
          ? undefined
          : "repeating-linear-gradient(45deg, rgba(15,23,42,.18) 0 5px, transparent 5px 10px)",
        outline: "1px solid rgba(15,23,42,.35)",
        ...style,
      }}
    >
      {Array.from({ length: cara.filas }, (_, fila) =>
        Array.from({ length: cara.columnas }, (_, columna) => {
          const numero =
            desplazamiento + cara.desde + fila * cara.columnas + columna;

          return (
            <span
              key={`${fila}-${columna}`}
              className="absolute flex items-center justify-center font-bold text-slate-700/80"
              style={{
                left: columna * lado,
                top: fila * lado,
                width: lado,
                height: lado,
                background: colorCuadrado,
                outline: "1px solid rgba(255,255,255,.75)",
                outlineOffset: -1,
                fontSize: Math.min(14, lado * 0.42),
              }}
            >
              {mostrarNumeros ? numero : null}
            </span>
          );
        }),
      )}

      <span
        className="pointer-events-none absolute left-1 top-0.5 max-w-full overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-wide text-slate-700/70"
        style={{ opacity: 1 - armado }}
      >
        {cara.corto}
      </span>

      {/* las caras vecinas van antes, para que la regla quede encima de
          ellas cuando la caja está abierta */}
      {children}
      {regla}
    </div>
  );
}
