import { guardar, leer } from '../estado/almacen.ts'
import type { EntradaRegistro } from './registro.ts'

export const CLAVES_REGISTRO = { registro: 'registro' } as const

export function leerRegistro(): EntradaRegistro[] {
  return leer<EntradaRegistro[]>(CLAVES_REGISTRO.registro, [])
}

export function guardarRegistro(r: EntradaRegistro[]): void {
  guardar(CLAVES_REGISTRO.registro, r)
}
