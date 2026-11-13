"use client";

import { useEffect, useState } from "react";
import { usePerfil } from "@/components/auth/ProveedorPerfil";
import { CometCard } from "@/components/ui/comet-card";
import { cartaAlAzar, cartasDe, PRECIO_CARTA, type Carta } from "@/lib/cartas";

/**
 * Las láminas se ganan comprándolas con las monedas que da cada racha. El
 * álbum muestra el catálogo completo desde el principio —con el espacio
 * vacío de quien todavía no toca— para que se vea cuánto falta.
 */
export function Album() {
  const { perfil, guardar } = usePerfil();
  const [cartas, setCartas] = useState<Carta[] | null>(null);
  const [comprando, setComprando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    cartasDe("mathematicians")
      .then((encontradas) => {
        if (vigente) setCartas(encontradas);
      })
      .catch(() => {
        if (vigente) setCartas([]);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const alcanza = perfil.monedas >= PRECIO_CARTA;

  async function comprar() {
    if (!cartas || cartas.length === 0 || !alcanza || comprando) return;

    setComprando(true);
    setMensaje(null);

    const elegida = cartaAlAzar(cartas);
    const antes = perfil.cartas[elegida.id] ?? 0;

    try {
      await guardar({
        monedas: perfil.monedas - PRECIO_CARTA,
        cartas: { ...perfil.cartas, [elegida.id]: antes + 1 },
      });
      setMensaje(
        antes > 0
          ? `¡Te repitió ${elegida.nombre}! Ya llevas ${antes + 1}.`
          : `🎉 ¡Conseguiste a ${elegida.nombre}!`,
      );
    } catch {
      setMensaje("No pudimos hacer la compra. Prueba de nuevo.");
    } finally {
      setComprando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-sky-800">
            🎴 Álbum de Matemáticos
          </h1>
          <p className="text-slate-600">
            Cada racha te da monedas. Cada lámina cuesta {PRECIO_CARTA}.
          </p>
        </div>

        <button
          type="button"
          onClick={comprar}
          disabled={!cartas || !alcanza || comprando}
          className="rounded-full bg-amber-500 px-6 py-3 font-bold text-white shadow transition hover:bg-amber-600 disabled:opacity-40"
        >
          {comprando
            ? "Comprando…"
            : `Comprar lámina (${PRECIO_CARTA})`}
        </button>
      </header>

      {mensaje && (
        <p className="rounded-2xl bg-amber-50 p-4 text-center font-bold text-amber-800">
          {mensaje}
        </p>
      )}

      {!cartas ? (
        <p className="text-lg font-bold text-slate-500">Cargando…</p>
      ) : cartas.length === 0 ? (
        <p className="text-lg font-bold text-slate-500">
          Todavía no hay láminas en este álbum.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cartas.map((carta) => (
            <li key={carta.id} className="relative hover:z-10">
              <Lamina carta={carta} coleccionada={(perfil.cartas[carta.id] ?? 0) > 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Lamina({ carta, coleccionada }: { carta: Carta; coleccionada: boolean }) {
  return (
    <CometCard className="w-full">
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white">
        <div className="flex aspect-[2/3] w-full items-center justify-center overflow-hidden bg-sky-50">
          {coleccionada ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={carta.imagen}
              alt={carta.nombre}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 p-3">
              <p className="text-center text-sm font-extrabold text-slate-500">
                {carta.nombre}
              </p>
            </div>
          )}
        </div>
        {coleccionada && (
          <p className="p-2 text-center text-sm font-extrabold text-slate-700">
            {carta.nombre}
          </p>
        )}
      </div>
    </CometCard>
  );
}
