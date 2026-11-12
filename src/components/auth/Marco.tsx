"use client";

import Link from "next/link";
import { BarraSesion } from "./BarraSesion";
import { useSesion } from "./ProveedorSesion";

/**
 * La cabecera y el pie solo acompañan a quien ya entró: el login ocupa la
 * pantalla completa y trae su propia marca.
 */
export function Marco({ children }: { children: React.ReactNode }) {
  const { usuario } = useSesion();

  if (!usuario) return <>{children}</>;

  return (
    <>
      <header className="border-b-4 border-dashed border-sky-200 bg-white/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-extrabold text-sky-700">
            📐 Materama
          </Link>
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
