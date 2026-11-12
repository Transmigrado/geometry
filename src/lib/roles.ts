/**
 * Qué ve cada quien. Ojo con lo que esto NO es: no es seguridad. La
 * frontera de verdad son las reglas de Firestore, y cada pantalla tiene
 * que seguir siendo segura si alguien escribe la URL a mano. Esto sólo
 * decide a dónde mandar a cada uno y qué enlaces pintar.
 */

import type { Rol } from "./perfil";

export const NOMBRE_ROL: Record<Rol, string> = {
  student: "Alumno",
  teacher: "Profesor",
  school: "Colegio",
  parent: "Apoderado",
};

/** Cómo se presenta cada perfil en el onboarding. */
export const PERFILES: { rol: Rol; titulo: string; pie: string; emoji: string }[] = [
  {
    rol: "student",
    titulo: "Soy alumno",
    pie: "Quiero resolver problemas y armar mi avatar.",
    emoji: "🎒",
  },
  {
    rol: "teacher",
    titulo: "Soy profesor",
    pie: "Quiero armar cursos y ver cómo le va a mi clase.",
    emoji: "📋",
  },
  {
    rol: "school",
    titulo: "Soy un colegio",
    pie: "Quiero administrar a mis profesores.",
    emoji: "🏫",
  },
  {
    rol: "parent",
    titulo: "Soy apoderado",
    pie: "Quiero seguir cómo va mi hijo o hija.",
    emoji: "👋",
  },
];

/** Dónde aterriza cada rol al entrar. */
export const CASA: Record<Rol, string> = {
  student: "/",
  teacher: "/profesor",
  school: "/colegio",
  parent: "/familia",
};

/** Los módulos del menú, por rol. */
export const MENU: Record<Rol, { href: string; nombre: string }[]> = {
  student: [
    { href: "/", nombre: "Geometría" },
    { href: "/ecuaciones", nombre: "Ecuaciones" },
  ],
  teacher: [{ href: "/profesor", nombre: "Mis cursos" }],
  school: [{ href: "/colegio", nombre: "Mi colegio" }],
  parent: [{ href: "/familia", nombre: "Mi familia" }],
};

/**
 * Las herramientas son de los alumnos. Un profesor que entre a «/» no
 * está haciendo nada malo, simplemente no es su sitio: se le manda al
 * suyo en vez de enseñarle un wizard que no le sirve.
 */
export function leToca(rol: Rol, ruta: string) {
  if (ruta === "/perfil") return true;
  // el muñeco 3D es cosa de niños; los adultos suben una foto y ya
  if (ruta === "/avatar") return rol === "student";
  if (rol === "student") return ruta === "/" || ruta === "/ecuaciones";
  return ruta.startsWith(CASA[rol]);
}
