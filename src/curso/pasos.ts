import { Chess, type Move } from 'chess.js'
import type { PasoAPaso } from './tipos.ts'

/**
 * "Ver paso a paso" (correcciones de la Caro-Kann, C3), sin pantalla: la posición del tablero en cada paso. Cada paso
 * parte de la posición del anterior (o vuelve a `reinicio`) y hace sus jugadas. En un plan o una estructura
 * (`ilustrativo`), se mueven solo las piezas de las que habla la frase, aunque el mismo color juegue dos veces seguidas.
 */
export interface FotoPaso {
  /** la posición de verdad, con todas las piezas (aunque se vean solo los peones) */
  fen: string
  /** las jugadas que hizo este paso (para la última jugada en amarillo y la prueba de los datos) */
  hechas: Move[]
  /** si el tablero que se ve cambió respecto del paso anterior (una jugada, un regreso o el paso a solo peones) */
  cambia: boolean
  /** en este paso se ven solo los peones */
  soloPeones: boolean
  /** en este paso es una ilustración: se mueven solo las piezas de las que habla la frase */
  ilustrativo: boolean
  /** este paso pasa a solo peones, o regresa a todas las piezas */
  cambiaVista: boolean
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

/**
 * Las fotos de cada paso. Un paso puede cambiar la vista desde ahí (La estructura de la Caro-Kann, 2026-11-28: "De
 * repente ya no existen 2 peones [...] no entiendo por qué"): el paso a paso parte de una posición real, con todas las
 * piezas, y juega las jugadas que forman la estructura; después, un paso pasa a solo peones (`soloPeones: true`, "Quitamos
 * las demás piezas…") y, si mueve piezas sin la respuesta del rival, a ilustración (`ilustrativo: true`). Los dos valen
 * desde ese paso hasta que otro paso los cambie; al empezar, los de la ventana (`pa.soloPeones`, `pa.ilustrativo`).
 */
export function fotosDePasos(pa: PasoAPaso, inicio: string[] = []): FotoPaso[] {
  const ch = salida(pa, inicio)
  let peones = !!pa.soloPeones
  let ilustrativo = !!pa.ilustrativo
  let antes = vista(ch.fen(), peones)
  return pa.pasos.map((p) => {
    const cambiaVista = p.soloPeones !== undefined && p.soloPeones !== peones
    if (p.soloPeones !== undefined) peones = p.soloPeones
    if (p.ilustrativo !== undefined) ilustrativo = p.ilustrativo
    if (p.reinicio) {
      const de = salida(pa, inicio)
      // el regreso se juega como empezó la ventana: en La estructura, la partida real hasta ahí, con las jugadas de los dos
      for (const s of p.reinicio) mover(de, s, pa.ilustrativo)
      ch.load(de.fen())
    }
    const hechas = (p.jugadas ?? []).map((s) => mover(ch, s, ilustrativo))
    const fen = ch.fen()
    const seVe = vista(fen, peones)
    const foto = { fen, hechas, cambia: seVe !== antes, soloPeones: peones, ilustrativo, cambiaVista }
    antes = seVe
    return foto
  })
}

/** Las piezas que se ven en una posición (solo la parte del tablero de la FEN). */
const vista = (fen: string, peones: boolean) => (peones ? soloPeones(fen) : fen).split(' ')[0]!

/** La posición que se ve en un paso: la de verdad, o solo sus peones. */
export const fenQueSeVe = (f: FotoPaso): string => (f.soloPeones ? soloPeones(f.fen) : f.fen)

/** Solo los peones (la ficha de la estructura): las demás piezas se quitan del tablero que se ve. */
export function soloPeones(fen: string): string {
  const [tab, ...resto] = fen.split(' ')
  return [tab!.replace(/[kqrbnKQRBN]/g, '1').replace(/\d+/g, (x) => String([...x].reduce((s, d) => s + Number(d), 0))), ...resto].join(' ')
}
