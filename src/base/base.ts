import datos from '../../conocimiento/base.json' with { type: 'json' }
import type { Apertura, Base, Variante } from './tipos.ts'

export const BASE = datos as unknown as Base

export function aperturaPorId(id: string): Apertura | undefined {
  return BASE.aperturas.find((a) => a.id === id)
}

export function variantePorClave(clave: string): Variante | undefined {
  for (const a of BASE.aperturas) {
    const v = a.variantes.find((x) => x.clave === clave)
    if (v) return v
  }
  return undefined
}

/**
 * Las líneas de un libro de bot por su clave: "caro-kann" (toda la apertura) o "caro-kann:avance" (las variantes cuyo id
 * empieza con "avance"). Los libros de los bots salen de aquí (T6).
 */
export function lineasDeClave(clave: string, base: Base = BASE): string[][] {
  const [ap, prefijo = ''] = clave.split(':')
  const a = base.aperturas.find((x) => x.id === ap)
  if (!a) return []
  return a.variantes.filter((v) => v.id.startsWith(prefijo)).map((v) => v.jugadas)
}

export function aperturaDeClave(clave: string): Apertura | undefined {
  return BASE.aperturas.find((a) => a.variantes.some((v) => v.clave === clave))
}
