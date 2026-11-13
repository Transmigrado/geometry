"use client";

import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiChartBar, HiCollection, HiHome } from "react-icons/hi";
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

  return (
    <div className="flex flex-1">
      {/* el niño no lleva materias en la cabecera —van a ser muchas y no
       * caben—, así que su navegación vive en esta barra aparte. Fija a la
       * izquierda y a todo lo alto, para no comerse el ancho del contenido */}
      {rol === "student" && <BarraLateral donde={donde} />}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b-4 border-dashed border-sky-200 bg-white/70">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <Link href="/" className="text-2xl font-extrabold text-sky-700">
              📐 Materama
            </Link>

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
      </div>
    </div>
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

const ITEMS_ALUMNO = [
  { href: "/", nombre: "Inicio", icono: HiHome },
  { href: "/albumes", nombre: "Mis álbumes", icono: HiCollection },
  { href: "/estadisticas", nombre: "Estadísticas", icono: HiChartBar },
];

function BarraLateral({ donde }: { donde: string }) {
  return (
    <Sidebar
      aria-label="Navegación del alumno"
      className="sticky top-0 h-screen w-16 shrink-0 border-r border-gray-200 sm:w-64"
    >
      <SidebarItems>
        <SidebarItemGroup>
          {ITEMS_ALUMNO.map((item) => {
            const aqui = item.href === "/" ? donde === "/" : donde.startsWith(item.href);

            return (
              <SidebarItem
                key={item.href}
                as={Link}
                href={item.href}
                icon={item.icono}
                active={aqui}
                className="justify-center sm:justify-start"
              >
                <span className="hidden sm:inline">{item.nombre}</span>
              </SidebarItem>
            );
          })}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
