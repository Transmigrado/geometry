import Link from "next/link";
import { FiguraSvg } from "@/components/FiguraSvg";
import { figuras } from "@/lib/figuras";

export const metadata = {
  title: "Figuras | Geometría Divertida",
  description: "Conoce el triángulo, el cuadrado, el círculo y muchas más figuras.",
};

export default function FigurasPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-extrabold text-sky-800">Las figuras</h1>
        <p className="mt-2 text-lg text-slate-600">
          Toca una figura para conocerla mejor.
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {figuras.map((figura) => (
          <li key={figura.slug}>
            <Link
              href={`/figuras/${figura.slug}`}
              className="flex h-full flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <FiguraSvg
                slug={figura.slug}
                color={figura.color}
                className="h-24 w-24"
              />
              <h2 className="text-xl font-bold text-slate-800">{figura.nombre}</h2>
              <p className="text-sm font-semibold text-slate-500">
                {figura.lados === 0
                  ? "Sin lados ni esquinas"
                  : `${figura.lados} lados · ${figura.vertices} esquinas`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
