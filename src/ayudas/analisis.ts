/**
 * El análisis a toda fuerza de la barra y la sugerencia (T15): un motor APARTE del que juega el bot (su propio Web
 * Worker), sin debilitar. Nada de esto cambia cómo juega el bot.
 */
import { crearMotorNavegador } from '../motor/navegador.ts'
import type { MotorUci } from '../motor/uci.ts'

let motor: Promise<MotorUci> | null = null

function obtener(): Promise<MotorUci> {
  if (!motor) motor = crearMotorNavegador().catch((e) => ((motor = null), Promise.reject(e)))
  return motor
}

export interface Evaluacion {
  /** desde blancas */
  cpBlancas: number
  mate: number | null
  /** la mejor jugada para quien mueve (UCI) */
  mejor: string | null
}

export async function evaluar(fen: string, tiempoMs = 300): Promise<Evaluacion> {
  return evaluarCon(await obtener(), fen, tiempoMs)
}

/** La evaluación con un motor dado (en la app, el de las ayudas; en las pruebas, el de Node). */
export async function evaluarCon(m: MotorUci, fen: string, tiempoMs = 300): Promise<Evaluacion> {
  const a = await m.analizar(fen, { tiempoMs, multipv: 1 })
  const c = a.candidatas[0]
  const blancasMueve = fen.split(' ')[1] === 'w'
  const signo = blancasMueve ? 1 : -1
  return { cpBlancas: (c?.cp ?? 0) * signo, mate: c?.mate != null ? c.mate * signo : null, mejor: a.mejor }
}
