import { guardar, leer } from '../estado/almacen.ts'
import { conEstrellas } from './estrellas.ts'

const CLAVE = 'estrellas'

export function leerEstrellas(): Record<string, number> {
  return leer<Record<string, number>>(CLAVE, {})
}

export function anotarEstrellas(botId: string, n: number): Record<string, number> {
  const m = conEstrellas(leerEstrellas(), botId, n)
  guardar(CLAVE, m)
  return m
}
