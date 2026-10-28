import { registrar, resultadoDelPaso, type EntradaRegistro, type ResultadoJugada } from './registro.ts'

/**
 * Los tres lugares que registran cada jugada (nota 1): los cursos, "Refuerza" y la guía en una partida.
 * Las pantallas llaman a estas funciones; así se prueban sin la interfaz.
 */
export function registrarPasoCurso(p: { fen: string; esperada: string; paso: { fallos: number; pista: boolean; respuesta: boolean }; linea: string; camino: string[] }, ahora?: number): EntradaRegistro {
  return registrar({ fen: p.fen, esperada: p.esperada, resultado: resultadoDelPaso(p.paso), lugar: 'curso', linea: p.linea, camino: p.camino }, ahora)
}

export function registrarPasoRefuerza(p: { fen: string; esperada: string; paso: { fallos: number; pista: boolean; respuesta: boolean }; linea: string; camino: string[] }, ahora?: number): EntradaRegistro {
  return registrar({ fen: p.fen, esperada: p.esperada, resultado: resultadoDelPaso(p.paso), lugar: 'refuerza', linea: p.linea, camino: p.camino }, ahora)
}

/** En la partida guiada: si me desvié, fallo; si pedí Respuesta o Pista antes de jugar, eso; si no, acierto. */
export function resultadoEnPartida(desvio: boolean, ayuda: 'pista' | 'respuesta' | null): ResultadoJugada {
  if (desvio) return 'fallo'
  if (ayuda === 'respuesta') return 'respuesta'
  if (ayuda === 'pista') return 'pista'
  return 'acierto'
}

export function registrarJugadaPartida(p: { fen: string; esperada: string; desvio: boolean; ayuda: 'pista' | 'respuesta' | null; linea: string; camino: string[] }, ahora?: number): EntradaRegistro {
  return registrar({ fen: p.fen, esperada: p.esperada, resultado: resultadoEnPartida(p.desvio, p.ayuda), lugar: 'partida', linea: p.linea, camino: p.camino }, ahora)
}
