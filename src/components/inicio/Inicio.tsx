"use client";

import Link from "next/link";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { IconoProblema } from "@/components/problema/IconoProblema";
import { IconoBalanza } from "@/components/ecuaciones/IconoBalanza";

/**
 * El tablero del niño: por dónde quiere empezar hoy.
 *
 * Las materias viven aquí y no en la cabecera porque van a ser muchas:
 * cuatro o cinco enlaces en una barra ya no caben, y veinte menos. En una
 * rejilla crecen sin estorbar.
 */
type Materia = {
  href: string;
  nombre: string;
  pie: string;
  /** el fondo de la tarjeta y el color de su dibujo */
  fondo: string;
  tinta: string;
  dibujo: React.ReactNode;
};

const MATERIAS: Materia[] = [
  {
    href: "/geometria",
    nombre: "Geometría",
    pie: "Cubre cajas, llena cuerpos y mide volúmenes.",
    fondo: "bg-amber-100 hover:bg-amber-200",
    tinta: "text-amber-900",
    // el dibujo del wizard es chiquito para una tarjeta, así que se agranda
    dibujo: (
      <span className="block scale-[1.7]">
        <IconoProblema tipo="volumen" color="#d97706" />
      </span>
    ),
  },
  {
    href: "/ecuaciones",
    nombre: "Ecuaciones",
    pie: "Descubre cuánto pesa cada fruta mirando la pesa.",
    fondo: "bg-emerald-100 hover:bg-emerald-200",
    tinta: "text-emerald-900",
    dibujo: <IconoBalanza color="#047857" />,
  },
];

export function Inicio() {
  const { perfil } = usePerfil();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold text-sky-800">
          {perfil.nombre ? `¡Hola, ${perfil.nombre}!` : "¡Hola!"}
        </h1>
        <p className="text-lg text-slate-600">¿Qué quieres hacer hoy?</p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2">
        {MATERIAS.map((materia) => (
          <li key={materia.href}>
            <Link
              href={materia.href}
              className={`flex h-full flex-col items-center gap-3 rounded-[2rem] p-8 text-center shadow-sm transition active:scale-[0.98] ${materia.fondo}`}
            >
              <span
                aria-hidden
                className="flex h-32 items-center justify-center"
              >
                {materia.dibujo}
              </span>
              <span className={`text-2xl font-extrabold ${materia.tinta}`}>
                {materia.nombre}
              </span>
              <span className={`text-sm font-semibold opacity-80 ${materia.tinta}`}>
                {materia.pie}
              </span>
            </Link>
          </li>
        ))}

        <li>
          <Pronto />
        </li>
      </ul>
    </div>
  );
}

/**
 * El hueco de lo que viene. Dice que esto crece, que es justo lo que uno
 * quiere que un niño piense al entrar.
 */
function Pronto() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[2rem] border-4 border-dashed border-slate-200 p-8 text-center">
      <span className="text-4xl" aria-hidden>✨</span>
      <span className="text-lg font-extrabold text-slate-400">
        Pronto habrá más
      </span>
      <span className="text-sm font-semibold text-slate-400">
        Estamos preparando otras materias.
      </span>
    </div>
  );
}
