/** Aclara u oscurece un color #rrggbb sin usar transparencia. */
export function tono(hex: string, factor: number) {
  const entero = parseInt(hex.slice(1), 16);
  const canal = (desplazamiento: number) =>
    Math.round(
      Math.min(255, ((entero >> desplazamiento) & 255) * factor),
    );

  return `rgb(${canal(16)}, ${canal(8)}, ${canal(0)})`;
}
