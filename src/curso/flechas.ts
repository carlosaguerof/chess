import { guardar, leer } from '../estado/almacen.ts'

/**
 * Diseño §4: en tu turno el tablero está limpio. Las flechas de la siguiente jugada (en Aprender) están apagadas de
 * entrada, y se prenden en Ajustes → "Flechas de la siguiente jugada".
 */
const CLAVE = 'flechas-leccion'

export const flechasPrendidas = (): boolean => leer<boolean>(CLAVE, false) === true
export const prenderFlechas = (v: boolean): void => guardar(CLAVE, v)
