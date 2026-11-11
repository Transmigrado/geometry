type Props = {
  slug: string;
  color: string;
  className?: string;
};

/** Puntos de cada polígono dentro de un viewBox de 100x100. */
const poligonos: Record<string, string> = {
  triangulo: "50,8 94,88 6,88",
  cuadrado: "12,12 88,12 88,88 12,88",
  rectangulo: "6,24 94,24 94,76 6,76",
  pentagono: "50,6 94,39 77,91 23,91 6,39",
  hexagono: "50,5 89,27 89,73 50,95 11,73 11,27",
};

export function FiguraSvg({ slug, color, className }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="presentation"
      className={className}
      aria-hidden="true"
    >
      {slug === "circulo" ? (
        <circle cx="50" cy="50" r="44" fill={color} />
      ) : (
        <polygon points={poligonos[slug] ?? poligonos.cuadrado} fill={color} />
      )}
    </svg>
  );
}
