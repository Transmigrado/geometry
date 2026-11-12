import { Suspense } from "react";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Marco } from "@/components/auth/Marco";
import { ProveedorPerfil } from "@/components/auth/ProveedorPerfil";
import { ProveedorSesion } from "@/components/auth/ProveedorSesion";
import { ProveedorEstado } from "@/estado/Proveedor";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Materama",
  description:
    "Arma tu problema de superficie o volumen y mira cómo se resuelve paso a paso.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/*
          El store queda fuera del prerender a propósito: Redux le pone un
          sufijo al azar a su acción de arranque, y eso no se puede hornear
          en el HTML estático. Detrás del login no hay nada que prerenderizar
          de todos modos.
        */}
        <Suspense>
          <ProveedorEstado>
            <ProveedorSesion>
              <ProveedorPerfil>
                <Marco>{children}</Marco>
              </ProveedorPerfil>
            </ProveedorSesion>
          </ProveedorEstado>
        </Suspense>
      </body>
    </html>
  );
}
