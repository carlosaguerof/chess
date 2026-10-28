import { Chess, type Square } from 'chess.js'
import type { Temperamento } from './elegir.ts'

/**
 * T17: el temperamento solo decide entre jugadas casi iguales para el motor: las que pierden como mucho MARGEN_CP
 * contra la mejor. A esas, el agresivo les quita hasta BONO_CP de "pérdida" si son jaque, captura o se acercan al rey
 * rival (llega a dos casillas o menos de él); el defensivo, si son cambios (captura de una pieza que vale lo mismo o más) o van a una casilla que el rival
 * no ataca. El equilibrado no cambia nada.
 */
export const MARGEN_CP = 30
export const BONO_CP = 25

const VALOR: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

function casillaDelRey(chess: Chess, color: 'w' | 'b'): Square | null {
  for (const fila of chess.board()) for (const c of fila) if (c && c.type === 'k' && c.color === color) return c.square
  return null
}

const distancia = (a: Square, b: Square) => Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])))

/** Cuánto le baja la pérdida a una jugada por el temperamento (0 si no aplica). */
export function bonoTemperamento(fen: string, uci: string, perdidaCp: number, t: Temperamento | undefined): number {
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
  if (t === 'agresivo') {
    const rey = casillaDelRey(c, rival)
    // "hacia el rey rival": llega a dos casillas o menos de su rey, acercándose
    const seAcerca = rey ? distancia(m.to, rey) <= 2 && distancia(m.to, rey) < distancia(m.from, rey) && m.piece !== 'k' : false
    return m.san.includes('+') || m.captured || seAcerca ? BONO_CP : 0
  }
  // defensivo: cambios, o la pieza queda en una casilla que el rival no ataca
  const cambio = !!m.captured && VALOR[m.captured]! >= VALOR[m.piece]!
  const segura = !c.isAttacked(m.to, rival)
  return cambio || (segura && !m.san.includes('+')) ? BONO_CP : 0
}

/** Jaques y capturas de una lista de jugadas (para medir el temperamento). */
export function contarJaquesYCapturas(sanes: string[]): number {
  return sanes.filter((s) => s.includes('+') || s.includes('x')).length
}
