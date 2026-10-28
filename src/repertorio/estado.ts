import { useCallback, useState } from 'react'
import { guardar, leer } from '../estado/almacen.ts'
import { BASE } from '../base/base.ts'
import { repertorioInicial, type Repertorio } from './modelo.ts'

const CLAVE = 'repertorio'

/** Mi repertorio: la semilla sale de la base; mis cambios se guardan encima, en el navegador. */
export function leerRepertorio(): Repertorio {
  const r = leer<Repertorio | null>(CLAVE, null)
  return r && r.version === 1 && Array.isArray(r.lineas) ? r : repertorioInicial(BASE)
}

export function guardarRepertorio(r: Repertorio): void {
  guardar(CLAVE, r)
}

export function useRepertorio() {
  const [rep, setRep] = useState<Repertorio>(leerRepertorio)
  const cambiar = useCallback((r: Repertorio) => {
    setRep(r)
    guardarRepertorio(r)
  }, [])
  return [rep, cambiar] as const
}

const CLAVE_PROGRESO = 'progreso'
export type Progreso = Record<string, { fecha: number }>

export function leerProgreso(): Progreso {
  return leer<Progreso>(CLAVE_PROGRESO, {})
}

export function marcarLeccion(id: string, ahora = Date.now()): Progreso {
  const p = leerProgreso()
  p[id] = { fecha: ahora }
  guardar(CLAVE_PROGRESO, p)
  return p
}

export function guardarProgreso(p: Progreso): void {
  guardar(CLAVE_PROGRESO, p)
}
