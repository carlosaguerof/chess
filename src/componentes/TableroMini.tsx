import { useEffect, useLayoutEffect, useRef } from 'react'
import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import type { Key } from 'chessground/types'
import type { ColorLargo } from '../ajedrez/reglas.ts'
import './tablero.css'

/** Un tablero solo para ver (la tarjeta de una apertura, la línea de una variante): no se mueve nada en él. */
export function TableroMini({ fen, orientacion, ultima, testid = 'tablero-mini', etiqueta }: { fen: string; orientacion: ColorLargo; ultima?: [string, string]; testid?: string; etiqueta?: string }) {
  const el = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const config = () => ({ fen, orientation: orientacion, lastMove: ultima as Key[] | undefined })

  useEffect(() => {
    if (!el.current) return
    api.current = Chessground(el.current, { ...config(), viewOnly: true, coordinates: false, animation: { enabled: true, duration: 150 }, drawable: { enabled: false, visible: false } })
    // al cambiar de tamaño se vuelve a dibujar, en el siguiente cuadro (como el tablero de la partida)
    let ancho = el.current.clientWidth
    let cuadro = 0
    const obs = new ResizeObserver((entradas) => {
      const nuevo = Math.round(entradas[0]?.contentRect.width ?? 0)
      if (nuevo === ancho) return
      ancho = nuevo
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => api.current?.redrawAll())
    })
    obs.observe(el.current)
    return () => {
      cancelAnimationFrame(cuadro)
      obs.disconnect()
      api.current?.destroy()
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // antes de pintar: el tablero nunca se queda una jugada atrás de los botones
  useLayoutEffect(() => {
    api.current?.set(config())
  })

  return (
    <div className="tablero tablero-mini" data-testid={testid} data-fen={fen} data-orientacion={orientacion} role="img" aria-label={etiqueta ?? 'Tablero'}>
      <div ref={el} />
    </div>
  )
}
