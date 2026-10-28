import { useEffect, useMemo, useRef, useState } from 'react'
import type { Chess } from 'chess.js'
import type { DrawShape } from 'chessground/draw'
import { destinos, esCoronacion, largo, type ColorLargo } from '../ajedrez/reglas.ts'
import { Tablero } from './Tablero.tsx'
import { SelectorCoronacion } from './SelectorCoronacion.tsx'
import { sonar } from '../sonido/sonido.ts'

/**
 * Tablero + reglas: solo jugadas legales (con sus casillas marcadas), coronación con selector,
 * última jugada y jaque marcados. Quien lo usa recibe la jugada en UCI ("e2e4", "e7e8n").
 */
export function TableroJugable(props: {
  chess: Chess
  orientacion: ColorLargo
  /** quién puede mover: el color del humano, 'both', o undefined (nadie, p. ej. mientras piensa el bot) */
  puedeMover?: ColorLargo | 'both'
  onJugada: (uci: string) => void
  flechas?: DrawShape[]
}) {
  const { chess } = props
  const [pendiente, setPendiente] = useState<{ desde: string; hasta: string } | null>(null)
  const [, setVersion] = useState(0)
  const fen = chess.fen()
  const dests = useMemo(() => destinos(chess), [fen]) // eslint-disable-line react-hooks/exhaustive-deps
  const historia = chess.history({ verbose: true })
  const ultimaJ = historia[historia.length - 1]
  const turno = largo(chess.turn())
  const puede = props.puedeMover === 'both' || props.puedeMover === turno ? props.puedeMover : undefined

  // R6: un sonido cuando hay una jugada nueva (mía o del rival), distinto si captura; nada al abrir ni al deshacer
  const jugadasAntes = useRef(historia.length)
  useEffect(() => {
    if (historia.length === jugadasAntes.current + 1 && ultimaJ) sonar(ultimaJ.captured ? 'capturar' : 'mover')
    jugadasAntes.current = historia.length
  }, [fen]) // eslint-disable-line react-hooks/exhaustive-deps

  const alJugar = (desde: string, hasta: string) => {
    if (esCoronacion(chess, desde, hasta)) {
      setPendiente({ desde, hasta })
      return
    }
    props.onJugada(desde + hasta)
  }

  return (
    <div className="tablero-jugable">
      <Tablero
        fen={fen}
        orientacion={props.orientacion}
        turno={turno}
        puedeMover={pendiente ? undefined : puede}
        destinos={dests}
        ultima={ultimaJ ? [ultimaJ.from, ultimaJ.to] : undefined}
        jaque={chess.inCheck()}
        onJugada={alJugar}
        flechas={props.flechas}
      />
      {pendiente && (
        <SelectorCoronacion
          color={turno}
          onEscoger={(letra) => {
            const p = pendiente
            setPendiente(null)
            props.onJugada(p.desde + p.hasta + letra)
          }}
          onCancelar={() => {
            setPendiente(null)
            setVersion((v) => v + 1)
          }}
        />
      )}
    </div>
  )
}
