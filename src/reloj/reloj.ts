import type { Chess } from 'chess.js'
import { NOMBRES_FIN, puedeDarMate, type ColorCorto, type Fin } from '../ajedrez/reglas.ts'

/** Los controles de tiempo, como en chess.com (T14). "+ N" son los segundos que se suman en cada jugada. */
export interface ControlTiempo {
  id: string
  grupo: 'bullet' | 'blitz' | 'rapid' | 'sin'
  nombre: string
  inicialMs: number
  incrementoMs: number
}

const min = (m: number) => m * 60_000
const seg = (s: number) => s * 1000

export const CONTROLES: ControlTiempo[] = [
  { id: '1+0', grupo: 'bullet', nombre: '1 min', inicialMs: min(1), incrementoMs: 0 },
  { id: '1+1', grupo: 'bullet', nombre: '1 | 1', inicialMs: min(1), incrementoMs: seg(1) },
  { id: '2+1', grupo: 'bullet', nombre: '2 | 1', inicialMs: min(2), incrementoMs: seg(1) },
  { id: '3+0', grupo: 'blitz', nombre: '3 min', inicialMs: min(3), incrementoMs: 0 },
  { id: '3+2', grupo: 'blitz', nombre: '3 | 2', inicialMs: min(3), incrementoMs: seg(2) },
  { id: '5+0', grupo: 'blitz', nombre: '5 min', inicialMs: min(5), incrementoMs: 0 },
  { id: '10+0', grupo: 'rapid', nombre: '10 min', inicialMs: min(10), incrementoMs: 0 },
  { id: '15+10', grupo: 'rapid', nombre: '15 | 10', inicialMs: min(15), incrementoMs: seg(10) },
  { id: '30+0', grupo: 'rapid', nombre: '30 min', inicialMs: min(30), incrementoMs: 0 },
  { id: 'sin', grupo: 'sin', nombre: 'Sin tiempo', inicialMs: 0, incrementoMs: 0 },
]

export const controlPorId = (id: string | undefined | null) => CONTROLES.find((c) => c.id === id) ?? CONTROLES[CONTROLES.length - 1]!

export interface EstadoReloj {
  controlId: string
  restante: { w: number; b: number }
  /** el reloj que corre ahora, o null (pausado o sin empezar) */
  corriendo: ColorCorto | null
  /** desde cuándo corre (ms) */
  desde: number | null
}

export function nuevoReloj(control: ControlTiempo): EstadoReloj {
  return { controlId: control.id, restante: { w: control.inicialMs, b: control.inicialMs }, corriendo: null, desde: null }
}

/** Lo que le queda a un color, contando lo que lleva corriendo. */
export function restante(e: EstadoReloj, color: ColorCorto, ahora: number): number {
  const base = e.restante[color]
  return e.corriendo === color && e.desde !== null ? Math.max(0, base - (ahora - e.desde)) : base
}

/** Arranca el reloj de un color (al empezar su turno). */
export function arrancar(e: EstadoReloj, color: ColorCorto, ahora: number): EstadoReloj {
  const parado = pausar(e, ahora)
  return { ...parado, corriendo: color, desde: ahora }
}

/** Pausa: lo que corrió se descuenta y el reloj se detiene (al irse de la app, C1). */
export function pausar(e: EstadoReloj, ahora: number): EstadoReloj {
  if (!e.corriendo || e.desde === null) return { ...e, corriendo: null, desde: null }
  return { ...e, restante: { ...e.restante, [e.corriendo]: restante(e, e.corriendo, ahora) }, corriendo: null, desde: null }
}

/** Un color jugó: se descuenta su tiempo, se le suma el incremento y arranca el del otro. */
export function alJugar(e: EstadoReloj, color: ColorCorto, ahora: number): EstadoReloj {
  const c = controlPorId(e.controlId)
  const quedo = restante(e, color, ahora)
  const otro: ColorCorto = color === 'w' ? 'b' : 'w'
  return { ...e, restante: { ...e.restante, [color]: quedo + c.incrementoMs }, corriendo: otro, desde: ahora }
}

/** ¿A quién se le acabó el tiempo? */
export function seAcabo(e: EstadoReloj, ahora: number): ColorCorto | null {
  if (controlPorId(e.controlId).grupo === 'sin') return null
  for (const c of ['w', 'b'] as ColorCorto[]) if (restante(e, c, ahora) <= 0) return c
  return null
}

/** Si se me acaba el tiempo pierdo, salvo que el rival no tenga material para dar mate: entonces son tablas. */
export function finPorTiempo(chess: Chess, sinTiempo: ColorCorto): Fin {
  const rival: ColorCorto = sinTiempo === 'w' ? 'b' : 'w'
  if (!puedeDarMate(chess, rival)) return { tipo: 'tablas-tiempo', ganador: null, nombre: NOMBRES_FIN['tablas-tiempo'] }
  return { tipo: 'tiempo', ganador: rival, nombre: NOMBRES_FIN.tiempo }
}

/** "4:05", "0:09.3" (con décimas en los últimos 10 s). */
export function formato(ms: number): string {
  const t = Math.max(0, ms)
  const m = Math.floor(t / 60_000)
  const s = Math.floor((t % 60_000) / 1000)
  if (t < 10_000) return `${m}:${String(s).padStart(2, '0')}.${Math.floor((t % 1000) / 100)}`
  return `${m}:${String(s).padStart(2, '0')}`
}
