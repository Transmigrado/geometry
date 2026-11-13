import { Opcion } from "@/components/ui/Opcion";

const JUEGOS = [
  {
    href: "/fracciones/pintar",
    nombre: "Pintar una fracción",
    descripcion: "Elige partes de una figura hasta completar la fracción que te piden.",
    emoji: "🎨",
    color: "bg-violet-500",
  },
  {
    href: "/fracciones/sumar",
    nombre: "Sumar fracciones",
    descripcion: "Junta dos fracciones y pinta el resultado en una figura.",
    emoji: "➕",
    color: "bg-sky-500",
  },
  {
    href: "/fracciones/restar",
    nombre: "Restar fracciones",
    descripcion: "Quita una fracción de otra y pinta lo que queda.",
    emoji: "➖",
    color: "bg-emerald-500",
  },
];

export function Juegos() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-extrabold text-sky-800">Juegos de fracciones</h1>
        <p className="mt-1 text-lg text-slate-600">¿Qué quieres practicar hoy?</p>
      </header>

      <div className="flex flex-col gap-4">
        {JUEGOS.map((juego) => (
          <Opcion
            key={juego.href}
            href={juego.href}
            emoji={juego.emoji}
            titulo={juego.nombre}
            descripcion={juego.descripcion}
            color={juego.color}
          />
        ))}
      </div>
    </div>
  );
}
