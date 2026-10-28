import { guardar, leer } from '../estado/almacen.ts'
import type { Resumen } from '../guia/guia.ts'

/** R2: el historial de mis partidas, guardado en el navegador, con en qué líneas me salgo más. */
export interface PartidaTerminada {
  id: string
  botId: string
  colorHumano: 'w' | 'b'
  resultado: 'gane' | 'perdi' | 'tablas'
  fin: string
  jugadas: number
  fecha: number
  /** si la guía estaba prendida: el caso del resumen y dónde me salí */
  resumen?: { caso: Resumen['caso']; linea?: string; jugue?: string; tuLinea?: string; ply?: number }
}

const CLAVE = 'historial'

export function leerHistorial(): PartidaTerminada[] {
  return leer<PartidaTerminada[]>(CLAVE, [])
}

export function anotarPartida(p: PartidaTerminada): PartidaTerminada[] {
  const h = leerHistorial().filter((x) => x.id !== p.id)
  const nuevo = [p, ...h].slice(0, 200)
  guardar(CLAVE, nuevo)
  return nuevo
}

/** En qué líneas me salgo más (solo las partidas donde me salí yo), de más a menos. */
export function dondeMeSalgo(h: PartidaTerminada[]): { linea: string; veces: number }[] {
  const c = new Map<string, number>()
  for (const p of h) if (p.resumen?.caso === 'me-sali' && p.resumen.linea) c.set(p.resumen.linea, (c.get(p.resumen.linea) ?? 0) + 1)
  return [...c.entries()].map(([linea, veces]) => ({ linea, veces })).sort((a, b) => b.veces - a.veces || a.linea.localeCompare(b.linea))
}

export function totales(h: PartidaTerminada[]): { gane: number; perdi: number; tablas: number } {
  return { gane: h.filter((p) => p.resultado === 'gane').length, perdi: h.filter((p) => p.resultado === 'perdi').length, tablas: h.filter((p) => p.resultado === 'tablas').length }
}
