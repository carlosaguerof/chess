import { Chess, type Move } from 'chess.js'
import type { PasoAPaso } from './tipos.ts'

/**
 * "Ver paso a paso" (correcciones de la Caro-Kann, C3), sin pantalla: la posición del tablero en cada paso. Cada paso
 * parte de la posición del anterior (o vuelve a `reinicio`) y hace sus jugadas. En un plan o una estructura
 * (`ilustrativo`), se mueven solo las piezas de las que habla la frase, aunque el mismo color juegue dos veces seguidas.
 */
export interface FotoPaso {
  fen: string
  /** las jugadas que hizo este paso (para la última jugada en amarillo y la prueba de los datos) */
  hechas: Move[]
  /** si el tablero cambió respecto del paso anterior */
  cambia: boolean
}

/**
 * Juega una jugada. Las de negras pueden ir con "..." ("...Bd6"): en un paso a paso ilustrativo así se sabe de qué
 * color es (Bd6 también puede ser del alfil blanco de f4), y si no le toca a ese color, se le da el turno.
 */
export function mover(ch: Chess, jugada: string, ilustrativo = false): Move {
  const negras = jugada.startsWith('...')
  const san = negras ? jugada.slice(3) : jugada
  const color = negras ? 'b' : 'w'
  if (ilustrativo && ch.turn() !== color) {
    const [tab, , enroques, , ...resto] = ch.fen().split(' ')
    ch.load([tab, color, enroques, '-', ...resto].join(' '))
  }
  if (negras && ch.turn() !== 'b') throw new Error(`${jugada}: no le toca a negras`)
  return ch.move(san)
}

/** La salida: la FEN del paso a paso, si no las jugadas de `inicio` (el final de la variante, en un plan). */
function salida(pa: PasoAPaso, inicio: string[] = []): Chess {
  const ch = new Chess(pa.fen)
  for (const s of inicio) ch.move(s)
  return ch
}

export function fotosDePasos(pa: PasoAPaso, inicio: string[] = []): FotoPaso[] {
  const ch = salida(pa, inicio)
  let antes = ch.fen()
  return pa.pasos.map((p) => {
    if (p.reinicio) {
      const de = salida(pa, inicio)
      for (const s of p.reinicio) mover(de, s, pa.ilustrativo)
      ch.load(de.fen())
    }
    const hechas = (p.jugadas ?? []).map((s) => mover(ch, s, pa.ilustrativo))
    const fen = ch.fen()
    const foto = { fen, hechas, cambia: fen.split(' ')[0] !== antes.split(' ')[0] }
    antes = fen
    return foto
  })
}

/** Solo los peones (la ficha de la estructura): las demás piezas se quitan del tablero que se ve. */
export function soloPeones(fen: string): string {
  const [tab, ...resto] = fen.split(' ')
  return [tab!.replace(/[kqrbnKQRBN]/g, '1').replace(/\d+/g, (x) => String([...x].reduce((s, d) => s + Number(d), 0))), ...resto].join(' ')
}
