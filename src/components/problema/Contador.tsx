"use client";

type Props = {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  onChange: (valor: number) => void;
  color?: string;
};

/** Selector de números con botones grandes, pensado para dedos pequeños. */
export function Contador({
  etiqueta,
  valor,
  min,
  max,
  onChange,
  color = "bg-sky-500",
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-4 shadow-sm">
      <span className="text-lg font-bold text-slate-700">{etiqueta}</span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, valor - 1))}
          disabled={valor <= min}
          aria-label={`Quitar uno a ${etiqueta}`}
          className={`h-11 w-11 rounded-full ${color} text-2xl font-bold text-white shadow transition disabled:opacity-30`}
        >
          −
        </button>

        <output className="w-12 text-center text-3xl font-extrabold text-slate-800">
          {valor}
        </output>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, valor + 1))}
          disabled={valor >= max}
          aria-label={`Agregar uno a ${etiqueta}`}
          className={`h-11 w-11 rounded-full ${color} text-2xl font-bold text-white shadow transition disabled:opacity-30`}
        >
          +
        </button>
      </div>
    </div>
  );
}
