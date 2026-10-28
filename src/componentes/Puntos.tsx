/** La frecuencia con 5 puntos, como en mis guías. */
export function Puntos({ n }: { n: number }) {
  return (
    <span className="puntos-frecuencia" aria-label={`Frecuencia ${n} de 5`} title={`Frecuencia ${n} de 5`} data-frecuencia={n}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? 'lleno' : ''} />
      ))}
    </span>
  )
}
