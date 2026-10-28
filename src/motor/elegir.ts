import { Chess } from 'chess.js'
import { uciDe } from '../ajedrez/reglas.ts'
import type { Candidata, MotorUci } from './uci.ts'
import { bonoTemperamento } from './temperamento.ts'

/** Los parámetros de un nivel. Viven todos en `niveles.json` (un solo archivo de datos). */
export interface ParamsNivel {
  elo: number
  /** "debil": debilitamiento propio (varias candidatas + errores a propósito); "uci": el UCI_Elo de Stockfish */
  modo: 'debil' | 'uci'
  /** debil: profundidad de búsqueda (si no hay `nodos`) */
  profundidad?: number
  /** debil: cuántas posiciones puede revisar el motor por jugada (control fino de la fuerza) */
  nodos?: number
  /** debil: cuántas candidatas se piden al motor */
  multipv?: number
  /** debil: probabilidad (0–1) de cometer un error grande a propósito en una jugada */
  errorGrande?: number
  /** debil: qué tanto se aleja de la mejor (en centipeones); más alto = escoge jugadas peores más seguido */
  temperatura?: number
  /** uci: el UCI_Elo que se le pide a Stockfish (1320–3190) */
  uciElo?: number
  /** uci: tiempo de búsqueda por jugada */
  tiempoMs?: number
}

export type Temperamento = 'agresivo' | 'equilibrado' | 'defensivo'

export interface Eleccion {
  uci: string
  motivo: 'motor' | 'error' | 'unica'
  /** cuánto pierde contra la mejor candidata, en centipeones (0 si es la mejor) */
  perdidaCp: number
  candidatas: Candidata[]
}

/** Lo que se considera un error grande: perder al menos esto contra la mejor jugada. */
export const UMBRAL_ERROR_CP = 150

/**
 * LA función de elegir jugada del motor. Cada jugada se piensa desde cero (sin la memoria de la anterior),
 * así un mismo motor puede jugar los dos lados en la calibración sin que uno aproveche lo que pensó el otro.
 * La usan la app (en el navegador, con el motor en un Web Worker)
 * y la calibración (en Node). Así lo que se calibró es lo que se juega.
 * `azar` devuelve un número en [0, 1): en la app es Math.random; en la calibración, una semilla fija.
 */
export async function elegirJugada(motor: MotorUci, fen: string, nivel: ParamsNivel, azar: () => number = Math.random, temperamento?: Temperamento): Promise<Eleccion | null> {
  const legales = new Chess(fen).moves({ verbose: true }).map(uciDe)
  if (legales.length === 0) return null
  if (legales.length === 1) return { uci: legales[0]!, motivo: 'unica', perdidaCp: 0, candidatas: [] }

  if (nivel.modo === 'uci') {
    const a = await motor.analizar(fen, { uciElo: nivel.uciElo ?? 1320, tiempoMs: nivel.tiempoMs ?? 150, multipv: 1, limpiar: true })
    const uci = a.mejor && legales.includes(a.mejor) ? a.mejor : legales[0]!
    return { uci, motivo: 'motor', perdidaCp: 0, candidatas: a.candidatas }
  }

  const limite = nivel.nodos ? { nodos: nivel.nodos } : { profundidad: nivel.profundidad ?? 4 }
  const a = await motor.analizar(fen, { ...limite, multipv: Math.min(nivel.multipv ?? 6, legales.length), limpiar: true })
  const cands = a.candidatas.filter((c) => legales.includes(c.uci))
  if (cands.length === 0) {
    const uci = a.mejor && legales.includes(a.mejor) ? a.mejor : legales[0]!
    return { uci, motivo: 'motor', perdidaCp: 0, candidatas: [] }
  }
  const mejorCp = Math.max(...cands.map((c) => c.cp))
  const perdida = (c: Candidata) => Math.max(0, mejorCp - c.cp)

  // 1) error grande a propósito: más seguido a menor nivel
  if (azar() < (nivel.errorGrande ?? 0)) {
    const malas = cands.filter((c) => perdida(c) >= UMBRAL_ERROR_CP)
    if (malas.length > 0) {
      const c = malas[Math.floor(azar() * malas.length)]!
      return { uci: c.uci, motivo: 'error', perdidaCp: perdida(c), candidatas: cands }
    }
    // si entre las candidatas no hay una mala, una jugada legal que el motor ni consideró
    const fuera = legales.filter((u) => !cands.some((c) => c.uci === u))
    if (fuera.length > 0) {
      const uci = fuera[Math.floor(azar() * fuera.length)]!
      return { uci, motivo: 'error', perdidaCp: UMBRAL_ERROR_CP, candidatas: cands }
    }
  }

  // 2) entre las candidatas, más probable la mejor; la temperatura decide qué tanto se aleja.
  //    El temperamento (T17) solo inclina entre jugadas casi iguales (ver temperamento.ts).
  const t = Math.max(1, nivel.temperatura ?? 50)
  // la pérdida efectiva puede quedar por debajo de 0: así el bono también decide entre jugadas igual de buenas
  const efectiva = (c: Candidata) => perdida(c) - bonoTemperamento(fen, c.uci, perdida(c), temperamento)
  const pesos = cands.map((c) => Math.exp(-efectiva(c) / t))
  const total = pesos.reduce((s, p) => s + p, 0)
  let r = azar() * total
  for (let i = 0; i < cands.length; i++) {
    r -= pesos[i]!
    if (r <= 0) return { uci: cands[i]!.uci, motivo: 'motor', perdidaCp: perdida(cands[i]!), candidatas: cands }
  }
  const ultima = cands[cands.length - 1]!
  return { uci: ultima.uci, motivo: 'motor', perdidaCp: perdida(ultima), candidatas: cands }
}

/** Generador con semilla (mulberry32), para que la calibración se pueda repetir. */
export function azarConSemilla(semilla: number): () => number {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
