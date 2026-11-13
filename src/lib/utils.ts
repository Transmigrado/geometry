import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta clases de Tailwind sin que las últimas pierdan contra las
 * primeras cuando chocan (igual ancho, igual color, etc). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
