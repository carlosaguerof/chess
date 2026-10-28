import type { Chess } from 'chess.js'
import { elegirJugada, type ParamsNivel, type Temperamento } from './elegir.ts'
import type { MotorUci } from './uci.ts'
import { uciDe } from '../ajedrez/reglas.ts'

export type OrigenJugadaBot = 'mis-lineas' | 'libro' | 'motor'

/** Una fuente de jugadas por historial (SAN en inglés desde la posición inicial): devuelve una jugada SAN o null. */
export type FuenteJugadas = (historia: string[], azar: () => number) => string | null

export interface JugadaBot {
  uci: string
  origen: OrigenJugadaBot
}

/**
 * La jugada del bot: primero "mis líneas" (si está prendido, T9), luego su libro de aperturas, y fuera de eso el motor
 * con `elegirJugada` (la misma función que se calibró).
 */
export async function jugadaDelBot(
  chess: Chess,
  nivel: ParamsNivel,
  motor: () => Promise<MotorUci>,
  fuentes: { misLineas?: FuenteJugadas | null; libro?: FuenteJugadas | null },
  azar: () => number = Math.random,
  temperamento?: Temperamento,
): Promise<JugadaBot | null> {
  const historia = chess.history()
  for (const [origen, fuente] of [
    ['mis-lineas', fuentes.misLineas],
    ['libro', fuentes.libro],
  ] as const) {
    if (!fuente) continue
    const san = fuente(historia, azar)
    if (!san) continue
    const legal = chess.moves({ verbose: true }).find((m) => m.san === san)
    if (legal) return { uci: uciDe(legal), origen }
  }
  const e = await elegirJugada(await motor(), chess.fen(), nivel, azar, temperamento)
  return e ? { uci: e.uci, origen: 'motor' } : null
}

/** Cuánto espera el bot antes de mover: entre 0.4 y 1.2 s en total, aunque el motor conteste antes. */
export function esperaDelBot(msUsados: number, azar: () => number = Math.random): number {
  const objetivo = 400 + azar() * 800
  return Math.max(0, objetivo - msUsados)
}
