import { Chess } from 'chess.js'
import type { Repertorio, LineaRepertorio } from '../repertorio/modelo.ts'
import { esMiPly } from '../repertorio/modelo.ts'
import { fenCorto, type EntradaRegistro } from './registro.ts'

/** Una jugada mía de mi repertorio, con lo que dice el registro de ella. */
export interface JugadaARepasar {
  fen: string
  esperada: string
  camino: string[]
  linea: LineaRepertorio
  /** las familias y aperturas de mi repertorio que pasan por esta jugada (para nombrarla bien) */
  familias: Set<string>
  aperturas: Set<string>
  intentos: number
  fallos: number
  ultima: number | null
}

export const clave = (fen: string, san: string) => `${fenCorto(fen)}|${san}`

/** Todas mis jugadas de mi repertorio (sin repetir posición + jugada), con sus conteos del registro. */
export function jugadasDeMiRepertorio(rep: Repertorio, registro: EntradaRegistro[]): JugadaARepasar[] {
  const porClave = new Map<string, JugadaARepasar>()
  for (const l of rep.lineas) {
    const c = new Chess()
    l.jugadas.forEach((san, ply) => {
      const fen = c.fen()
      c.move(san)
      if (!esMiPly(l.color, ply)) return
      const k = clave(fen, san)
      if (!porClave.has(k)) porClave.set(k, { fen, esperada: san, camino: l.jugadas.slice(0, ply), linea: l, familias: new Set(), aperturas: new Set(), intentos: 0, fallos: 0, ultima: null })
      porClave.get(k)!.familias.add(l.familia)
      porClave.get(k)!.aperturas.add(l.apertura)
    })
  }
  for (const e of registro) {
    const j = porClave.get(`${e.fen}|${e.esperada}`)
    if (!j) continue
    j.intentos++
    if (e.resultado !== 'acierto') j.fallos++
    j.ultima = Math.max(j.ultima ?? 0, e.fecha)
  }
  return [...porClave.values()]
}

/**
 * "Refuerza lo que fallas" (ajustes de la app, 2026-10-28): solo las jugadas que he fallado, de la que más fallo a la
 * que menos; entre iguales, la que fallo más seguido y después la que llevo más tiempo sin practicar. Las que nunca he
 * practicado y las que nunca he fallado ya no salen.
 */
export function ordenRefuerza(js: JugadaARepasar[]): JugadaARepasar[] {
  return js.filter((j) => j.fallos > 0).sort((a, b) => b.fallos - a.fallos || b.fallos / b.intentos - a.fallos / a.intentos || (a.ultima ?? 0) - (b.ultima ?? 0))
}

/** Las jugadas falladas de mis cursos, en el orden de Refuerza. */
export function jugadasFalladas(rep: Repertorio, registro: EntradaRegistro[]): JugadaARepasar[] {
  // sin un solo fallo en el registro no hace falta recorrer las líneas
  if (!registro.some((e) => e.resultado !== 'acierto')) return []
  return ordenRefuerza(jugadasDeMiRepertorio(rep, registro))
}

/** Cómo se nombra una jugada: si la comparten varias aperturas, por el color; si varias variantes, por la apertura. */
export function nombreDeJugada(j: JugadaARepasar, nombreApertura: (id: string) => string): string {
  if (j.aperturas.size > 1) return j.linea.color === 'w' ? 'Con blancas' : 'Con negras'
  if (j.familias.size > 1) return nombreApertura(j.linea.apertura)
  return j.linea.familia
}

export function textoConteo(j: JugadaARepasar, ahora = Date.now()): string {
  if (j.intentos === 0) return 'nunca practicada'
  if (j.fallos > 0) return `fallada ${j.fallos} de ${j.intentos} ${j.intentos === 1 ? 'vez' : 'veces'}`
  const dias = Math.floor((ahora - (j.ultima ?? ahora)) / 86_400_000)
  return `bien ${j.intentos} de ${j.intentos} · ${dias === 0 ? 'hoy' : dias === 1 ? 'hace 1 día' : `hace ${dias} días`}`
}

/**
 * Las jugadas de la lección de Refuerza: hasta la que se pregunta y, si la línea sigue por ahí, el resto de la línea
 * (así la Pista sabe que esa jugada no es la última y no la confunde con la que define la variante).
 */
export function lineaCompleta(j: JugadaARepasar): string[] {
  const hasta = [...j.camino, j.esperada]
  const sigue = j.linea.jugadas.length > hasta.length && hasta.every((s, i) => j.linea.jugadas[i] === s)
  return sigue ? j.linea.jugadas : hasta
}

