import { useEffect, useState } from 'react'
import { guardar, leer } from '../estado/almacen.ts'
import type { Vuelta } from './ciclo.ts'

/**
 * El avance de un curso nuevo, guardado en el teléfono (diseño §4): las piezas leídas, las variantes aprendidas y
 * terminadas, los "¿Y si…?" hechos, y dónde me quedé para retomar. Viaja en el Respaldo (es una clave más).
 */
export type PiezaLeerId = 'idea' | 'estructura' | 'repaso'

export interface AvanceCurso {
  piezas: Partial<Record<PiezaLeerId | 'errores', number>>
  variantes: Record<string, { aprendida?: number; terminada?: number }>
  errores: Record<string, number>
  enCurso?: { linea: string; vuelta: Vuelta; ply: number; fecha: number }
}

const clave = (cursoId: string) => `curso:${cursoId}`
const vacio = (): AvanceCurso => ({ piezas: {}, variantes: {}, errores: {} })
const EVENTO = 'ajedrez:avance-curso'

export function leerAvance(cursoId: string): AvanceCurso {
  const a = leer<AvanceCurso | null>(clave(cursoId), null)
  if (!a || typeof a !== 'object') return vacio()
  return { piezas: a.piezas ?? {}, variantes: a.variantes ?? {}, errores: a.errores ?? {}, enCurso: a.enCurso }
}

function cambiar(cursoId: string, f: (a: AvanceCurso) => AvanceCurso): AvanceCurso {
  const nuevo = f(leerAvance(cursoId))
  guardar(clave(cursoId), nuevo)
  try {
    window.dispatchEvent(new Event(EVENTO))
  } catch {
    /* sin ventana (pruebas) */
  }
  return nuevo
}

export const marcarPieza = (cursoId: string, pieza: PiezaLeerId | 'errores', ahora = Date.now()) => cambiar(cursoId, (a) => ({ ...a, piezas: { ...a.piezas, [pieza]: a.piezas[pieza] ?? ahora } }))

export const marcarVariante = (cursoId: string, id: string, que: 'aprendida' | 'terminada', ahora = Date.now()) =>
  cambiar(cursoId, (a) => ({ ...a, variantes: { ...a.variantes, [id]: { ...a.variantes[id], [que]: a.variantes[id]?.[que] ?? ahora } } }))

export const marcarError = (cursoId: string, id: string, ahora = Date.now()) => cambiar(cursoId, (a) => ({ ...a, errores: { ...a.errores, [id]: a.errores[id] ?? ahora } }))

export const guardarEnCurso = (cursoId: string, linea: string, vuelta: Vuelta, ply: number, ahora = Date.now()) => cambiar(cursoId, (a) => ({ ...a, enCurso: { linea, vuelta, ply, fecha: ahora } }))

export const borrarEnCurso = (cursoId: string, linea?: string) => cambiar(cursoId, (a) => (!linea || a.enCurso?.linea === linea ? { ...a, enCurso: undefined } : a))

/** El avance al día (se vuelve a leer cuando cambia). */
export function useAvance(cursoId: string): AvanceCurso {
  const [a, setA] = useState(() => leerAvance(cursoId))
  useEffect(() => {
    const f = () => setA(leerAvance(cursoId))
    window.addEventListener(EVENTO, f)
    return () => window.removeEventListener(EVENTO, f)
  }, [cursoId])
  return a
}
