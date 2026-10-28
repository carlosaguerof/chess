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
      if (!porClave.has(k)) porClave.set(k, { fen, esperada: san, camino: l.jugadas.slice(0, ply), linea: l, intentos: 0, fallos: 0, ultima: null })
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
 * "Refuerza lo que fallas": primero las jugadas que más fallo; después las que llevo más tiempo sin practicar
 * (las que nunca he practicado, antes que todas).
 */
export function ordenRefuerza(js: JugadaARepasar[]): JugadaARepasar[] {
  const falladas = js.filter((j) => j.fallos > 0).sort((a, b) => b.fallos - a.fallos || b.fallos / b.intentos - a.fallos / a.intentos || (a.ultima ?? 0) - (b.ultima ?? 0))
  const demas = js.filter((j) => j.fallos === 0).sort((a, b) => (a.ultima ?? -1) - (b.ultima ?? -1))
  return [...falladas, ...demas]
}

export function textoConteo(j: JugadaARepasar, ahora = Date.now()): string {
  if (j.intentos === 0) return 'nunca practicada'
  if (j.fallos > 0) return `fallada ${j.fallos} de ${j.intentos} ${j.intentos === 1 ? 'vez' : 'veces'}`
  const dias = Math.floor((ahora - (j.ultima ?? ahora)) / 86_400_000)
  return `bien ${j.intentos} de ${j.intentos} · ${dias === 0 ? 'hoy' : dias === 1 ? 'hace 1 día' : `hace ${dias} días`}`
}
