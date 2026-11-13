import Link from "next/link";

/**
 * Una tarjeta de opción: icono a la izquierda, título y descripción a la
 * derecha. Es el patrón común para «elige qué hacer», lo use geometría,
 * fracciones o lo que venga después — para que un niño aprenda una sola
 * forma de elegir y no una por módulo.
 */
export function Opcion({
  emoji,
  dibujo,
  titulo,
  descripcion,
  onClick,
  href,
  color = "bg-sky-500",
}: {
  emoji?: string;
  dibujo?: React.ReactNode;
  titulo: string;
  descripcion: string;
  onClick?: () => void;
  href?: string;
  color?: string;
}) {
  const clase =
    "flex h-full w-full items-center gap-4 rounded-3xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg";

  const contenido = (
    <>
      <span
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${
          dibujo ? "bg-slate-100" : color
        }`}
      >
        {dibujo ?? emoji}
      </span>
      <span>
        <span className="block text-xl font-bold text-slate-800">{titulo}</span>
        <span className="block text-slate-600">{descripcion}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={clase}>
        {contenido}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={clase}>
      {contenido}
    </button>
  );
}
