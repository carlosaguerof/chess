import { Chess, type Square } from 'chess.js'
import type { Temperamento } from './elegir.ts'

/**
 * T17: el temperamento solo decide entre jugadas casi iguales para el motor: las que pierden como mucho MARGEN_CP
 * contra la mejor. A esas les quita "pérdida" (un bono B que crece con la temperatura del nivel: B = máx(BONO_CP,
 * temperatura), para que pese lo mismo en todos los niveles):
 * - agresivo: B por dar jaque, B por capturar (se suman) y B/2 por acercarse al rey rival (llegar a dos casillas o
 *   menos de él);
 * - defensivo: B por una jugada tranquila y segura (sin capturar ni dar jaque, a una casilla que el rival no ataca)
 *   y B/2 por un cambio parejo (captura de una pieza del mismo valor); a un jaque le suma B/2 de pérdida (lo evita).
 * El equilibrado no cambia nada. (Versión 3, tras el pase 1 de la T22: en la 1 los dos premiaban las capturas y la
 * medición no los separaba; la 2 los separaba poco.)
 */
export const MARGEN_CP = 50
export const BONO_CP = 40

/** El bono del temperamento para un nivel, según su temperatura. */
export const bonoDelNivel = (temperatura: number) => Math.max(BONO_CP, temperatura)

const VALOR: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

function casillaDelRey(chess: Chess, color: 'w' | 'b'): Square | null {
  for (const fila of chess.board()) for (const c of fila) if (c && c.type === 'k' && c.color === color) return c.square
  return null
}

const distancia = (a: Square, b: Square) => Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])))

/** Cuánto le baja la pérdida a una jugada por el temperamento (0 si no aplica). `bono` = B del nivel. */
export function bonoTemperamento(fen: string, uci: string, perdidaCp: number, t: Temperamento | undefined, bono = BONO_CP): number {
  if (!t || t === 'equilibrado' || perdidaCp > MARGEN_CP) return 0
  const c = new Chess(fen)
  const yo = c.turn()
  const rival = yo === 'w' ? 'b' : 'w'
  let m
  try {
    m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
  } catch {
    return 0
  }
  const jaque = m.san.includes('+') || m.san.includes('#')
  if (t === 'agresivo') {
    const rey = casillaDelRey(c, rival)
    const seAcerca = rey ? distancia(m.to, rey) <= 2 && distancia(m.to, rey) < distancia(m.from, rey) && m.piece !== 'k' : false
    return (jaque ? bono : 0) + (m.captured ? bono : 0) + (seAcerca ? bono / 2 : 0)
  }
  // defensivo
  if (jaque) return -bono / 2
  if (m.captured) return VALOR[m.captured] === VALOR[m.piece] ? bono / 2 : 0
  return c.isAttacked(m.to, rival) ? 0 : bono
}

/** Jaques y capturas de una lista de jugadas (para medir el temperamento). */
export function contarJaquesYCapturas(sanes: string[]): number {
  return sanes.filter((s) => s.includes('+') || s.includes('x')).length
}
