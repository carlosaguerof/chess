import { useEffect, useState } from 'react'
import { guardar, leer } from '../estado/almacen.ts'
import type { Vuelta } from './ciclo.ts'
import { cursosDeAntes } from './queda.ts'

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

/** Lo guardado de este curso, tal cual. */
function leerGuardado(cursoId: string): AvanceCurso {
  const a = leer<AvanceCurso | null>(clave(cursoId), null)
  if (!a || typeof a !== 'object') return vacio()
  return { piezas: a.piezas ?? {}, variantes: a.variantes ?? {}, errores: a.errores ?? {}, enCurso: a.enCurso }
}

/**
 * El avance de un curso. Si reemplaza a uno de antes (`queda.ts`), una variante que aprendí o terminé allá sale así
 * aquí: es la misma línea. Se calcula al leer y no se guarda: lo del curso de antes se queda donde estaba, un Respaldo
 * viejo sigue sirviendo y, si el curso de antes regresa, cada uno tiene lo suyo. Las piezas de leer (La idea, La
 * estructura, Errores y trampas con sus «¿Y si…?», Repaso del curso) y dónde me quedé no se pasan: cambiaron
 * (Carlos, 2026-11-25).
 */
export function leerAvance(cursoId: string): AvanceCurso {
  const a = leerGuardado(cursoId)
  const antes = cursosDeAntes(cursoId)
  if (antes.length === 0) return a
  const variantes = { ...a.variantes }
  for (const id of antes)
    for (const [v, x] of Object.entries(leerGuardado(id).variantes)) {
      if (!x || typeof x !== 'object') continue
      // lo de este curso gana; lo que no tiene, lo pone el de antes
      variantes[v] = { ...x, ...variantes[v] }
    }
  return { ...a, variantes }
}

/** Solo escribe lo de este curso: nada del de antes se copia aquí. */
function cambiar(cursoId: string, f: (a: AvanceCurso) => AvanceCurso): AvanceCurso {
  const nuevo = f(leerGuardado(cursoId))
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
