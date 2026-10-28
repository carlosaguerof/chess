/** El motor en Node (para la calibración y las validaciones): el mismo Stockfish 19 lite de un hilo que usa la app. */
import { createRequire } from 'node:module'
import { MotorUci, type Transporte } from '../src/motor/uci.ts'

const require = createRequire(import.meta.url)

export function motorNode(): MotorUci {
  const stockfish = require('stockfish') as (tipo: string, alMensaje: (l: string) => void) => { processCommand(c: string): void; terminate(): void }
  let cb: (l: string) => void = () => {}
  const motor = stockfish('lite-single', (l) => cb(l))
  const transporte: Transporte = {
    enviar: (c) => motor.processCommand(c),
    alRecibir: (f) => {
      cb = f
    },
    cerrar: () => motor.terminate(),
  }
  return new MotorUci(transporte)
}
