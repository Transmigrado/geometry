import Link from "next/link";

const JUEGOS = [
  {
    href: "/fracciones/pintar",
    nombre: "Pintar una fracción",
    descripcion: "Elige partes de una figura hasta completar la fracción que te piden.",
    icono: "🎨",
    color: "bg-violet-100 hover:bg-violet-200 text-violet-950",
  },
  {
    href: "/fracciones/sumar",
    nombre: "Sumar fracciones",
    descripcion: "Junta dos fracciones y pinta el resultado en una figura.",
    icono: "➕",
    color: "bg-sky-100 hover:bg-sky-200 text-sky-950",
  },
  {
    href: "/fracciones/restar",
    nombre: "Restar fracciones",
    descripcion: "Quita una fracción de otra y pinta lo que queda.",
    icono: "➖",
    color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-950",
  },
];

export function Juegos() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="self-start font-bold text-sky-700">← Inicio</Link>
      <header>
        <h1 className="text-3xl font-extrabold text-sky-800">Juegos de fracciones</h1>
        <p className="mt-1 text-lg text-slate-600">¿Qué quieres practicar hoy?</p>
      </header>

      <ul className="grid gap-4 md:grid-cols-3">
        {JUEGOS.map((juego) => (
          <li key={juego.href}>
            <Link
              href={juego.href}
              className={`flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-3xl p-6 text-center shadow-sm transition hover:-translate-y-1 ${juego.color}`}
            >
              <span aria-hidden className="text-5xl">{juego.icono}</span>
              <span className="text-2xl font-extrabold">{juego.nombre}</span>
              <span className="text-sm font-semibold opacity-80">{juego.descripcion}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
