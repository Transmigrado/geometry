export type Figura = {
  slug: string;
  nombre: string;
  lados: number;
  vertices: number;
  color: string;
  emoji: string;
  descripcion: string;
  enLaVidaReal: string[];
  dato: string;
};

export const figuras: Figura[] = [
  {
    slug: "triangulo",
    nombre: "Triángulo",
    lados: 3,
    vertices: 3,
    color: "#f97316",
    emoji: "🔺",
    descripcion:
      "El triángulo tiene 3 lados y 3 esquinas. Es la figura más fuerte: por eso se usa en puentes y techos.",
    enLaVidaReal: ["Un trozo de pizza", "El techo de una casa", "Una señal de ceda el paso"],
    dato: "Si sumas sus tres ángulos siempre te dan 180°.",
  },
  {
    slug: "cuadrado",
    nombre: "Cuadrado",
    lados: 4,
    vertices: 4,
    color: "#3b82f6",
    emoji: "🟦",
    descripcion:
      "El cuadrado tiene 4 lados que miden exactamente lo mismo y 4 esquinas en forma de L.",
    enLaVidaReal: ["Una ventana", "Un dado", "Una servilleta doblada"],
    dato: "Todos sus ángulos son de 90°, como la esquina de una hoja.",
  },
  {
    slug: "rectangulo",
    nombre: "Rectángulo",
    lados: 4,
    vertices: 4,
    color: "#8b5cf6",
    emoji: "🟪",
    descripcion:
      "El rectángulo también tiene 4 lados, pero dos son largos y dos son cortos.",
    enLaVidaReal: ["Una puerta", "Un libro", "La pantalla de la tablet"],
    dato: "Un cuadrado es un rectángulo especial con todos los lados iguales.",
  },
  {
    slug: "circulo",
    nombre: "Círculo",
    lados: 0,
    vertices: 0,
    color: "#ec4899",
    emoji: "🔴",
    descripcion:
      "El círculo es una línea curva cerrada. No tiene lados rectos ni esquinas: ¡rueda!",
    enLaVidaReal: ["Una rueda", "El sol", "Una moneda"],
    dato: "La distancia del centro al borde se llama radio y siempre es la misma.",
  },
  {
    slug: "pentagono",
    nombre: "Pentágono",
    lados: 5,
    vertices: 5,
    color: "#10b981",
    emoji: "⬟",
    descripcion:
      "El pentágono tiene 5 lados y 5 esquinas. «Penta» significa cinco en griego.",
    enLaVidaReal: ["La casita que dibujas", "Los parches negros de un balón", "Un escudo"],
    dato: "Las abejas no lo usan: para sus panales prefieren el hexágono.",
  },
  {
    slug: "hexagono",
    nombre: "Hexágono",
    lados: 6,
    vertices: 6,
    color: "#eab308",
    emoji: "⬢",
    descripcion:
      "El hexágono tiene 6 lados iguales y encaja perfecto con otros hexágonos sin dejar huecos.",
    enLaVidaReal: ["Un panal de abejas", "Un lápiz visto de punta", "Un copo de nieve"],
    dato: "Las abejas lo eligen porque gasta menos cera y guarda más miel.",
  },
];

export function obtenerFigura(slug: string): Figura | undefined {
  return figuras.find((figura) => figura.slug === slug);
}
