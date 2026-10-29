import { useEffect, useLayoutEffect, useRef } from 'react'
import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import type { Key } from 'chessground/types'
import type { DrawShape } from 'chessground/draw'
import type { ColorLargo } from '../ajedrez/reglas.ts'
import type { Marca } from '../curso/tipos.ts'
import { CapaMarcas } from './CapaMarcas.tsx'
import './tablero.css'

/**
 * Un tablero solo para ver (la tarjeta de una apertura, la línea de una variante): no se mueve nada en él.
 * `coordenadas`: las letras y los números dentro de las casillas, como en la lección (los tableros de leer del curso).
 */
export function TableroMini({ fen, orientacion, ultima, testid = 'tablero-mini', etiqueta, flechas, coordenadas = false, marcas }: { fen: string; orientacion: ColorLargo; ultima?: [string, string]; testid?: string; etiqueta?: string; flechas?: DrawShape[]; coordenadas?: boolean; marcas?: Marca[] }) {
  const el = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  // C3: las marcas de las piezas de leer del curso (flechas y casillas), solo para ver
  const config = () => ({ fen, orientation: orientacion, lastMove: ultima as Key[] | undefined, drawable: { enabled: false, visible: true, autoShapes: flechas ?? [] } })

  useEffect(() => {
    if (!el.current) return
    api.current = Chessground(el.current, { ...config(), viewOnly: true, coordinates: coordenadas, animation: { enabled: true, duration: 150 }, drawable: { enabled: false, visible: true, autoShapes: flechas ?? [] } })
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
    <div className={`tablero tablero-mini ${orientacion === 'black' ? 'negras' : 'blancas'}`} data-testid={testid} data-fen={fen} data-orientacion={orientacion} role="img" aria-label={etiqueta ?? 'Tablero'}>
      <div ref={el} />
      {marcas && <CapaMarcas marcas={marcas} orientacion={orientacion} fen={fen} />}
    </div>
  )
}
