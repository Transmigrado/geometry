"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarraSesion } from "./BarraSesion";
import { usePerfil } from "./ProveedorPerfil";
import { useSesion } from "./ProveedorSesion";
import { pasoPendiente } from "@/lib/perfil";
import { MENU, rolDe } from "@/lib/roles";

/**
 * La cabecera y el pie solo acompañan a quien ya entró y ya se presentó: el
 * login y el onboarding ocupan la pantalla completa y traen su propia
 * marca, para que nadie se escape a mitad de camino.
 */
export function Marco({ children }: { children: React.ReactNode }) {
  const { usuario } = useSesion();
  const perfil = usePerfil();
  const donde = usePathname();

  if (!usuario || perfil.cargando || pasoPendiente(perfil.perfil)) {
    return <>{children}</>;
  }

  const rol = rolDe(perfil.perfil);
  const menu = MENU[rol];
  // el niño no lleva materias en la cabecera, así que necesita una puerta
  // de vuelta al tablero: el logo no le dice nada a un chico de diez años
  const volver = rol === "student" && donde !== "/";

  return (
    <>
      <header className="border-b-4 border-dashed border-sky-200 bg-white/70">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/" className="text-2xl font-extrabold text-sky-700">
            📐 Materama
          </Link>

          {volver && (
            <Link
              href="/"
              className="rounded-full bg-sky-100 px-4 py-2 font-bold text-sky-700 transition hover:bg-sky-200"
            >
              ← Inicio
            </Link>
          )}

          {menu.length > 0 && (
            <nav className="flex gap-2">
              {menu.map((modulo) => (
                <Modulo key={modulo.href} {...modulo} />
              ))}
            </nav>
          )}

          <BarraSesion />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>

      <footer className="px-6 py-6 text-center text-sm text-slate-500">
        Hecho para aprender jugando ✨
      </footer>
    </>
  );
}

function Modulo({ href, nombre }: { href: string; nombre: string }) {
  const donde = usePathname();
  const aqui = donde === href;

  return (
    <Link
      href={href}
      aria-current={aqui ? "page" : undefined}
      className={`rounded-full px-4 py-2 font-bold transition ${
        aqui ? "bg-sky-500 text-white shadow" : "text-sky-700 hover:bg-sky-100"
      }`}
    >
      {nombre}
    </Link>
  );
}
