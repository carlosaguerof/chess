import { lineasDeClave } from '../base/base.ts'
import type { LineasPorClave } from './libros.ts'

/** Los libros de los bots salen de la base de conocimiento (T6): "caro-kann", "caro-kann:avance", "gambito-dama:aceptado"… */
export const lineasDeLibro: LineasPorClave = (clave) => lineasDeClave(clave)
