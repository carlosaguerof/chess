import { CLAVES_REGISTRO, guardarRegistro, leerRegistro } from './almacen-registro.ts'

/**
 * Registro por jugada (nota 1): cada vez que me toca una jugada de una línea (en los cursos, en "Refuerza" y con la guía
 * en una partida), se guarda si acerté a la primera, si fallé, si pedí Pista o Respuesta, y cuándo.
 */
export type ResultadoJugada = 'acierto' | 'fallo' | 'pista' | 'respuesta'
export type Lugar = 'curso' | 'refuerza' | 'partida'

export interface EntradaRegistro {
  /** la posición (FEN sin contadores) y la jugada que se esperaba (SAN en inglés) */
  fen: string
  esperada: string
  resultado: ResultadoJugada
  lugar: Lugar
  fecha: number
  /** la línea de donde salió, para poder practicarla (nombre visible) */
  linea?: string
  /** las jugadas desde el inicio hasta esta posición (SAN en inglés), para armar la práctica */
  camino?: string[]
}

export const fenCorto = (fen: string) => fen.split(' ').slice(0, 4).join(' ')

/** Lo peor que pasó en un paso: pedir Respuesta, luego Pista, luego fallar; si nada, acierto. */
export function resultadoDelPaso(p: { fallos: number; pista: boolean; respuesta: boolean }): ResultadoJugada {
  if (p.respuesta) return 'respuesta'
  if (p.pista) return 'pista'
  if (p.fallos > 0) return 'fallo'
  return 'acierto'
}

export function registrar(e: Omit<EntradaRegistro, 'fecha' | 'fen'> & { fen: string; fecha?: number }, ahora = Date.now()): EntradaRegistro {
  const entrada: EntradaRegistro = { ...e, fen: fenCorto(e.fen), fecha: e.fecha ?? ahora }
  const r = leerRegistro()
  r.push(entrada)
  guardarRegistro(r)
  return entrada
}

export { leerRegistro, CLAVES_REGISTRO }
