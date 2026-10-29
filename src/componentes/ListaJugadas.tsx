import { useEffect, useRef } from 'react'
import { mostrarTexto } from '../ajedrez/mostrar.ts'

/** La lista de jugadas, siempre a la vista, en la notación que escogí en Ajustes (figuras o letras). */
export function ListaJugadas(props: { sanes: string[]; primeraEsNegras?: boolean; numeroInicial?: number; marcar?: Record<number, string> }) {
  const caja = useRef<HTMLOListElement>(null)
  useEffect(() => {
    const c = caja.current
    if (c) c.scrollTop = c.scrollHeight
    if (c) c.scrollLeft = c.scrollWidth
  }, [props.sanes.length])

  const filas: { numero: number; blancas?: { san: string; i: number }; negras?: { san: string; i: number } }[] = []
  const base = props.numeroInicial ?? 1
  let i = 0
  if (props.primeraEsNegras && props.sanes.length > 0) {
    filas.push({ numero: base, negras: { san: props.sanes[0]!, i: 0 } })
    i = 1
  }
  for (; i < props.sanes.length; i += 2) {
    const numero = base + filas.length
    filas.push({
      numero,
      blancas: { san: props.sanes[i]!, i },
      negras: props.sanes[i + 1] !== undefined ? { san: props.sanes[i + 1]!, i: i + 1 } : undefined,
    })
  }
  const celda = (j?: { san: string; i: number }) =>
    j ? (
      <span className={`jugada ${props.marcar?.[j.i] ?? ''} ${j.i === props.sanes.length - 1 ? 'actual' : ''}`} data-testid="jugada">
        {mostrarTexto(j.san)}
      </span>
    ) : (
      <span className="jugada vacia">{props.primeraEsNegras ? '…' : ''}</span>
    )
  return (
    <ol className="lista-jugadas" ref={caja} data-testid="lista-jugadas" aria-label="Jugadas">
      {filas.length === 0 && <li className="apagado sin-jugadas">Aún no hay jugadas</li>}
      {filas.map((f) => (
        <li key={f.numero}>
          <span className="numero">{f.numero}.</span>
          {celda(f.blancas)}
          {celda(f.negras)}
        </li>
      ))}
    </ol>
  )
}
