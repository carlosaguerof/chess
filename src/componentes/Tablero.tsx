import { useEffect, useRef } from 'react'
import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import type { Config } from 'chessground/config'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import type { ColorLargo } from '../ajedrez/reglas.ts'
import './tablero.css'

export interface PropsTablero {
  fen: string
  orientacion: ColorLargo
  /** a quién le toca */
  turno: ColorLargo
  /** quién puede mover ahora: un color, ambos, o nadie (undefined) */
  puedeMover?: ColorLargo | 'both'
  destinos: Map<string, string[]>
  ultima?: [string, string]
  jaque: boolean
  onJugada: (desde: string, hasta: string) => void
  flechas?: DrawShape[]
  etiqueta?: string
}

/** El tablero de lichess (chessground) en un componente de React. */
export function Tablero(props: PropsTablero) {
  const el = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  const alJugar = useRef(props.onJugada)
  alJugar.current = props.onJugada

  const config = (): Config => ({
    fen: props.fen,
    orientation: props.orientacion,
    turnColor: props.turno,
    check: props.jaque,
    lastMove: props.ultima as Key[] | undefined,
    coordinates: true,
    autoCastle: true,
    highlight: { lastMove: true, check: true },
    animation: { enabled: true, duration: 180 },
    movable: {
      free: false,
      color: props.puedeMover,
      dests: props.destinos as Map<Key, Key[]>,
      showDests: true,
      events: { after: (orig, dest) => alJugar.current(orig, dest) },
    },
    premovable: { enabled: false },
    draggable: { enabled: true, showGhost: true },
    selectable: { enabled: true },
    drawable: { enabled: false, visible: true, autoShapes: props.flechas ?? [] },
  })

  useEffect(() => {
    if (!el.current) return
    api.current = Chessground(el.current, config())
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

  useEffect(() => {
    api.current?.set(config())
    api.current?.setAutoShapes(props.flechas ?? [])
  })

  return (
    <div
      className={`tablero ${props.orientacion === 'black' ? 'negras' : 'blancas'}`}
      data-testid="tablero"
      data-orientacion={props.orientacion}
      data-fen={props.fen}
      aria-label={props.etiqueta ?? 'Tablero'}
    >
      <div ref={el} />
    </div>
  )
}

/** Una pieza dibujada con el juego cburnett (para el selector de coronación y avisos). */
export function DibujoPieza({ tipo, color }: { tipo: 'queen' | 'rook' | 'bishop' | 'knight'; color: ColorLargo }) {
  // <piece> no es una etiqueta de React: se crea a mano dentro del contenedor
  return (
    <div
      className="cg-wrap"
      ref={(caja) => {
        if (!caja) return
        caja.replaceChildren()
        const pieza = document.createElement('piece')
        pieza.className = `${tipo} ${color}`
        caja.appendChild(pieza)
      }}
    />
  )
}
