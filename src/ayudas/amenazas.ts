import { Chess, type Square } from 'chess.js'
import type { ColorCorto } from '../ajedrez/reglas.ts'

const VALOR: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
const CASILLAS: Square[] = 'abcdefgh'.split('').flatMap((c) => '12345678'.split('').map((f) => (c + f) as Square))

/** Quién ataca una casilla (las piezas de `color`). */
function atacantes(chess: Chess, casilla: Square, color: ColorCorto): Square[] {
  // chess.js 1.4: attackers(square, color)
  return (chess as unknown as { attackers: (s: Square, c: ColorCorto) => Square[] }).attackers(casilla, color)
}

export interface Amenaza {
  /** la pieza rival que ataca (la de menor valor) */
  desde: Square
  /** mi pieza atacada */
  hasta: Square
}

/**
 * Las amenazas contra mis piezas (T15): cada pieza mía (no el rey) atacada sin defensa suficiente:
 * nadie la defiende, o el rival la puede tomar con una pieza que vale menos.
 */
export function amenazas(chess: Chess, color: ColorCorto): Amenaza[] {
  const rival: ColorCorto = color === 'w' ? 'b' : 'w'
  const r: Amenaza[] = []
  for (const sq of CASILLAS) {
    const p = chess.get(sq)
    if (!p || p.color !== color || p.type === 'k') continue
    const ata = atacantes(chess, sq, rival)
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
