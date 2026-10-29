import type { LineaCurso } from './tipos.ts'
import { misJugadas } from './datos.ts'

/**
 * El ciclo de la lección nueva (diseño §4), sin pantalla: así se prueba con Vitest.
 *
 * Cada variante tiene dos vueltas: Aprender (te enseña cada jugada con su porqué y tú la haces) y Practicar (te
 * pregunta por la meta y tú la encuentras). El ciclo: te toca → mueves → la respuesta llega al instante → la máquina
 * juega la del rival como un segundo después; si hay algo que leer, espera a "Siguiente". Un error se queda a la
 * vista hasta "Reintentar"; una jugada buena de otra línea, también, en otro color.
 */
export type Vuelta = 'aprender' | 'practicar'
export type Momento = 'intro' | 'rival' | 'tuTurno' | 'leer' | 'error' | 'buena' | 'plan' | 'fin'

export interface Paso {
  fallos: number
  pista: boolean
  respuesta: boolean
}

export interface Intento {
  san: string
  desde: string
  hasta: string
}

export interface EstadoCiclo {
  vuelta: Vuelta
  /** cuántas medias jugadas de la línea están en el tablero */
  ply: number
  momento: Momento
  /** el escalón de ayuda pedido en este paso: 1 Pista, 2 Otra pista (la pieza), 3 Respuesta */
  ayuda: 0 | 1 | 2 | 3
  /** la jugada equivocada (o buena de otra línea) que se queda a la vista */
  intento: Intento | null
  /** lo que pasó en cada jugada mía de esta vuelta (por su ply) */
  pasos: Record<number, Paso>
  /** mi última jugada correcta (para "Correcto: …") */
  ultima: number | null
}

const esMia = (l: Pick<LineaCurso, 'lado'>, ply: number) => (ply % 2 === 0 ? 'w' : 'b') === l.lado
const paso = (e: EstadoCiclo, ply: number): Paso => e.pasos[ply] ?? { fallos: 0, pista: false, respuesta: false }

export function empezar(l: LineaCurso, vuelta: Vuelta = 'aprender'): EstadoCiclo {
  return { vuelta, ply: l.desde, momento: 'intro', ayuda: 0, intento: null, pasos: {}, ultima: null }
}

/** Lo que sigue en la posición actual: la jugada del rival, la mía, o el final de la vuelta. */
export function siguienteMomento(l: LineaCurso, e: EstadoCiclo): Momento {
  if (e.ply >= l.jugadas.length) return e.vuelta === 'aprender' && l.tipo === 'variante' ? 'plan' : 'fin'
  return esMia(l, e.ply) ? 'tuTurno' : 'rival'
}

/** "Siguiente" (después de la introducción o de leer la explicación de mi jugada). */
export function continuar(l: LineaCurso, e: EstadoCiclo): EstadoCiclo {
  return { ...e, momento: siguienteMomento(l, { ...e }) }
}

/** La máquina juega la jugada del rival. */
export function jugarRival(l: LineaCurso, e: EstadoCiclo): EstadoCiclo {
  if (e.momento !== 'rival') return e
  const s = { ...e, ply: e.ply + 1, ayuda: 0 as const, intento: null }
  return { ...s, momento: siguienteMomento(l, s) }
}

/**
 * Intento una jugada (SAN inglés) en mi turno. `buenas`: las jugadas de la base en esta posición (otra línea buena).
 * `esperar`: si hay algo que leer después de esta jugada (en Aprender), la máquina espera a "Siguiente".
 */
export function intentar(l: LineaCurso, e: EstadoCiclo, j: Intento, opciones: { buenas?: Set<string>; esperar?: boolean } = {}): { estado: EstadoCiclo; resultado: 'correcta' | 'buena' | 'error' } {
  if (e.momento !== 'tuTurno') return { estado: e, resultado: 'error' }
  const esperada = l.jugadas[e.ply]
  if (j.san === esperada) {
    const s: EstadoCiclo = { ...e, ply: e.ply + 1, ayuda: 0, intento: null, ultima: e.ply, pasos: { ...e.pasos, [e.ply]: paso(e, e.ply) } }
    return { estado: { ...s, momento: opciones.esperar ? 'leer' : siguienteMomento(l, s) }, resultado: 'correcta' }
  }
  if (opciones.buenas?.has(j.san)) return { estado: { ...e, momento: 'buena', intento: j }, resultado: 'buena' }
  const p = paso(e, e.ply)
  return { estado: { ...e, momento: 'error', intento: j, pasos: { ...e.pasos, [e.ply]: { ...p, fallos: p.fallos + 1 } } }, resultado: 'error' }
}

/** "Reintentar": la jugada equivocada se quita del tablero y me vuelve a tocar. */
export function reintentar(e: EstadoCiclo): EstadoCiclo {
  return e.momento === 'error' || e.momento === 'buena' ? { ...e, momento: 'tuTurno', intento: null } : e
}

/** Pista: el primer toque da la idea en palabras; el segundo marca la pieza que se mueve. */
export function pedirPista(estado: EstadoCiclo): EstadoCiclo {
  const e = reintentar(estado)
  if (e.momento !== 'tuTurno' || e.ayuda >= 2) return estado
  const p = paso(e, e.ply)
  return { ...e, ayuda: e.ayuda === 0 ? 1 : 2, pasos: { ...e.pasos, [e.ply]: { ...p, pista: true } } }
}

/**
 * Respuesta: la flecha de la jugada, con su porqué. No castiga, salvo que cuenta como fallo para Refuerza y el Repaso.
 * Siempre está a la mano (diseño §4): con un error a la vista, lo quita y da la Respuesta en un solo toque (igual la Pista).
 */
export function pedirRespuesta(estado: EstadoCiclo): EstadoCiclo {
  const e = reintentar(estado)
  if (e.momento !== 'tuTurno') return estado
  const p = paso(e, e.ply)
  return { ...e, ayuda: 3, pasos: { ...e.pasos, [e.ply]: { ...p, respuesta: true } } }
}

/** A qué jugada mía regresa "Atrás" (o null si ya estoy en la primera). */
export function plyDeAtras(l: LineaCurso, e: EstadoCiclo): number | null {
  if (e.momento === 'leer') return e.ply - 1
  if (e.momento === 'intro' || e.momento === 'plan' || e.momento === 'fin') return null
  const antes = misJugadas(l).filter((p) => p < e.ply)
  return antes.length ? antes[antes.length - 1]! : null
}

/** "Atrás": regresa una jugada mía (y la del rival que vino después). */
export function atras(l: LineaCurso, e: EstadoCiclo): EstadoCiclo {
  const p = plyDeAtras(l, e)
  return p === null ? e : { ...e, ply: p, momento: 'tuTurno', ayuda: 0, intento: null, ultima: null }
}

/** "Empezar de nuevo" (después de confirmar): la misma vuelta, desde su primera jugada. */
export function empezarDeNuevo(l: LineaCurso, e: EstadoCiclo): EstadoCiclo {
  return continuar(l, { ...empezar(l, e.vuelta) })
}

/** Retomar donde me quedé: la vuelta y la jugada guardadas. */
export function retomar(l: LineaCurso, vuelta: Vuelta, ply: number): EstadoCiclo {
  const e = { ...empezar(l, vuelta), ply: Math.min(Math.max(ply, l.desde), l.jugadas.length) }
  return continuar(l, e)
}

/** "Jugada N de M": N es la que me toca (o la última que jugué), M las mías de la línea. */
export function progreso(l: LineaCurso, e: EstadoCiclo): { n: number; m: number } {
  const mias = misJugadas(l)
  const hechas = mias.filter((p) => p < e.ply).length
  const n = e.momento === 'tuTurno' || e.momento === 'error' || e.momento === 'buena' ? hechas + 1 : Math.max(hechas, 1)
  return { n: Math.min(n, mias.length), m: mias.length }
}

/** En qué me equivoqué en esta vuelta: las jugadas con fallos o con ayuda. */
export function tropiezos(e: EstadoCiclo): { ply: number; paso: Paso }[] {
  return Object.entries(e.pasos)
    .map(([ply, p]) => ({ ply: Number(ply), paso: p }))
    .filter((x) => x.paso.fallos > 0 || x.paso.pista || x.paso.respuesta)
    .sort((a, b) => a.ply - b.ply)
}
