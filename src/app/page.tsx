import Link from "next/link";
import { FiguraSvg } from "@/components/FiguraSvg";
import { figuras } from "@/lib/figuras";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold text-sky-800 sm:text-5xl">
          ¡Hola! Vamos a descubrir las figuras
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Aquí aprenderás cuántos lados y esquinas tiene cada figura, y dónde
          puedes encontrarlas en tu casa, en la calle y en la naturaleza.
        </p>
        <Link
          href="/figuras"
          className="mt-8 inline-block rounded-full bg-sky-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-600"
        >
          Explorar figuras
        </Link>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-sky-800">
          Las figuras que vas a conocer
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {figuras.map((figura) => (
            <li key={figura.slug}>
              <Link
                href={`/figuras/${figura.slug}`}
                className="flex flex-col items-center gap-2 rounded-3xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <FiguraSvg
                  slug={figura.slug}
                  color={figura.color}
                  className="h-16 w-16"
                />
                <span className="text-center font-bold text-slate-700">
                  {figura.nombre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
