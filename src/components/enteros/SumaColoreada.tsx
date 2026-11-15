/** El signo es lo que hay que leer primero: positivo en verde, negativo en rojo. */
export function SumaColoreada({ a, b }: { a: number; b: number }) {
  return (
    <>
      <span className={a < 0 ? "text-rose-600" : "text-emerald-600"}>{a}</span>
      {" + "}
      {b < 0 ? (
        <>
          (<span className="text-rose-600">{b}</span>)
        </>
      ) : (
        <span className="text-emerald-600">{b}</span>
      )}
    </>
  );
}
