import type { Metadata } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geometría Divertida",
  description:
    "Arma tu problema de superficie o volumen y mira cómo se resuelve paso a paso.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b-4 border-dashed border-sky-200 bg-white/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-extrabold text-sky-700">
              📐 Geometría Divertida
            </Link>
            <p className="text-lg font-bold text-sky-600">
              Problemas de superficie y volumen
            </p>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="px-6 py-6 text-center text-sm text-slate-500">
          Hecho para aprender jugando ✨
        </footer>
      </body>
    </html>
  );
}
