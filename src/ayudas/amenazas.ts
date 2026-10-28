import { Chess, type Square } from 'chess.js'
import type { ColorCorto } from '../ajedrez/reglas.ts'

const VALOR: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
const CASILLAS: Square[] = 'abcdefgh'.split('').flatMap((c) => '12345678'.split('').map((f) => (c + f) as Square))

/** Quién ataca una casilla (las piezas de `color`). */
function atacantes(chess: Chess, casilla: Square, color: ColorCorto): Square[] {
  // chess.js 1.4: attackers(square, color)
  return (chess as unknown as { attackers: (s: Square, c: ColorCorto) => Square[] }).attackers(casilla, color)
}

/** La misma posición con el turno de `color` (para ver qué capturas legales tendría). */
function conTurno(chess: Chess, color: ColorCorto): Chess | null {
  const partes = chess.fen().split(' ')
  partes[1] = color
  partes[3] = '-'
  try {
    return new Chess(partes.join(' '))
  } catch {
    return null
  }
}

/** Las piezas de `color` que pueden capturar en una casilla con una jugada legal (una pieza clavada no cuenta). */
function capturanLegal(chess: Chess, casilla: Square, color: ColorCorto, posicion: Chess | null): Square[] {
  if (!posicion) return atacantes(chess, casilla, color)
  return [...new Set(posicion.moves({ verbose: true }).filter((m) => m.to === casilla && m.captured).map((m) => m.from as Square))]
}

export interface Amenaza {
  /** la pieza rival que ataca (la de menor valor) */
  desde: Square
  /** mi pieza atacada */
  hasta: Square
}

/**
 * Las amenazas contra mis piezas (T15): cada pieza mía (no el rey) que el rival puede tomar con una jugada legal
 * y sin defensa suficiente: nadie la defiende, o el rival la puede tomar con una pieza que vale menos.
 */
export function amenazas(chess: Chess, color: ColorCorto): Amenaza[] {
  const rival: ColorCorto = color === 'w' ? 'b' : 'w'
  const r: Amenaza[] = []
  const turnoRival = conTurno(chess, rival)
  for (const sq of CASILLAS) {
    const p = chess.get(sq)
    if (!p || p.color !== color || p.type === 'k') continue
    const ata = capturanLegal(chess, sq, rival, turnoRival)
    if (ata.length === 0) continue
    const defensores = atacantes(chess, sq, color)
    const masBarato = ata.reduce((a, b) => (VALOR[chess.get(b)!.type]! < VALOR[chess.get(a)!.type]! ? b : a))
    const valorAtacante = VALOR[chess.get(masBarato)!.type]!
    if (defensores.length === 0 || valorAtacante < VALOR[p.type]!) r.push({ desde: masBarato, hasta: sq })
  }
  return r
}

/** La barra de quién va ganando: de la evaluación (centipeones desde blancas) a un porcentaje de blancas (0–100). */
export function porcentajeBlancas(cpBlancas: number, mate: number | null): number {
  if (mate !== null) return mate > 0 ? 100 : 0
  const p = 50 + 50 * (2 / (1 + Math.exp(-0.004 * cpBlancas)) - 1)
  return Math.max(2, Math.min(98, p))
}
