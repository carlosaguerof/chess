import type { MotorUci } from '../src/motor/uci.ts'

export interface Evaluacion {
  mejor: string
  cpMejor: number
  cpJugada: number
  perdida: number
  profundidad: number
}

/**
 * Cuánto pierde una jugada contra la mejor del motor, a una profundidad fija.
 * Siempre igual: motor reiniciado (ucinewgame) y memoria borrada antes de cada búsqueda, para que sea repetible.
 */
export async function evaluarJugada(motor: MotorUci, fen: string, uci: string, profundidad: number): Promise<Evaluacion> {
  await motor.nuevaPartida()
  const mejor = await motor.analizar(fen, { profundidad, multipv: 1, limpiar: true })
  const top = mejor.candidatas[0]
  let cpJugada: number
  if (top && top.uci === uci) cpJugada = top.cp
  else {
    await motor.nuevaPartida()
    const una = await motor.analizar(fen, { profundidad, multipv: 1, limpiar: true, soloJugadas: [uci] })
    cpJugada = una.candidatas[0]?.cp ?? -99999
  }
  const cpMejor = Math.max(top?.cp ?? cpJugada, cpJugada)
  return { mejor: top?.uci ?? uci, cpMejor, cpJugada, perdida: Math.max(0, cpMejor - cpJugada), profundidad }
}
