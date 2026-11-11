import Link from "next/link";
import { notFound } from "next/navigation";
import { FiguraSvg } from "@/components/FiguraSvg";
import { figuras, obtenerFigura } from "@/lib/figuras";

export function generateStaticParams() {
  return figuras.map((figura) => ({ slug: figura.slug }));
}

export async function generateMetadata({ params }: PageProps<"/figuras/[slug]">) {
  const { slug } = await params;
  const figura = obtenerFigura(slug);

  if (!figura) return {};

  return {
    title: `${figura.nombre} | Geometría Divertida`,
    description: figura.descripcion,
  };
}

export default async function FiguraPage({ params }: PageProps<"/figuras/[slug]">) {
  const { slug } = await params;
  const figura = obtenerFigura(slug);

  if (!figura) notFound();

  return (
    <article className="flex flex-col gap-8">
      <Link href="/figuras" className="font-bold text-sky-600 hover:underline">
        ← Volver a las figuras
      </Link>

      <header className="flex flex-col items-center gap-6 rounded-3xl bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:text-left">
        <FiguraSvg
          slug={figura.slug}
          color={figura.color}
          className="h-40 w-40 shrink-0"
        />
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800">
            {figura.nombre} {figura.emoji}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{figura.descripcion}</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-5xl font-extrabold text-sky-600">{figura.lados}</p>
          <p className="mt-1 font-bold text-slate-500">lados</p>
        </div>
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-5xl font-extrabold text-sky-600">{figura.vertices}</p>
          <p className="mt-1 font-bold text-slate-500">esquinas</p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          ¿Dónde la puedes encontrar?
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {figura.enLaVidaReal.map((ejemplo) => (
            <li
              key={ejemplo}
              className="rounded-full bg-sky-100 px-4 py-2 font-semibold text-sky-800"
            >
              {ejemplo}
            </li>
          ))}
        </ul>
      </section>

      <aside className="rounded-3xl border-4 border-dashed border-amber-300 bg-amber-50 p-6">
        <h2 className="font-bold text-amber-900">💡 ¿Sabías que...?</h2>
        <p className="mt-2 text-amber-900">{figura.dato}</p>
      </aside>
    </article>
  );
}
