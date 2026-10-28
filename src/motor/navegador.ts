/**
 * El motor en el navegador: Stockfish 19 lite de un hilo, en un Web Worker (la pantalla nunca se congela).
 * Un solo motor para el bot. Su estado (cargando, listo, error) se puede ver desde la interfaz.
 */
import { MotorUci, type Transporte } from './uci.ts'

export type EstadoMotor =
  | { tipo: 'apagado' }
  | { tipo: 'cargando' }
  | { tipo: 'listo'; version: string; msCarga: number }
  | { tipo: 'error'; mensaje: string }

let estado: EstadoMotor = { tipo: 'apagado' }
const oyentes = new Set<(e: EstadoMotor) => void>()
let promesa: Promise<MotorUci> | null = null

function cambiar(e: EstadoMotor) {
  estado = e
  for (const o of oyentes) o(e)
}

export function estadoMotor(): EstadoMotor {
  return estado
}

export function alCambiarMotor(cb: (e: EstadoMotor) => void): () => void {
  oyentes.add(cb)
  return () => oyentes.delete(cb)
}

const MENSAJE_ERROR = 'No se pudo cargar el motor del bot. Revisa tu conexión y vuelve a intentarlo; si sigue igual, recarga la página.'

/** Crea un motor nuevo en su propio Web Worker. */
export function crearMotorNavegador(): Promise<MotorUci> {
  return new Promise((resolver, rechazar) => {
    let worker: Worker
    try {
      worker = new Worker(`${import.meta.env.BASE_URL}motor/stockfish-19-lite-single.js`)
    } catch {
      rechazar(new Error(MENSAJE_ERROR))
      return
    }
    let cb: (l: string) => void = () => {}
    worker.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data === 'string') cb(ev.data)
    }
    const transporte: Transporte = {
      enviar: (c) => worker.postMessage(c),
      alRecibir: (f) => {
        cb = f
      },
      cerrar: () => worker.terminate(),
    }
    const motor = new MotorUci(transporte)
    const limite = setTimeout(() => {
      worker.terminate()
      rechazar(new Error(MENSAJE_ERROR))
    }, 20000)
    worker.onerror = () => {
      clearTimeout(limite)
      worker.terminate()
      rechazar(new Error(MENSAJE_ERROR))
    }
    motor.iniciar().then(
      () => {
        clearTimeout(limite)
        resolver(motor)
      },
      () => {
        clearTimeout(limite)
        rechazar(new Error(MENSAJE_ERROR))
      },
    )
  })
}

/** El motor del bot (uno para toda la app). La primera vez lo carga; si falló, lo vuelve a intentar. */
export function obtenerMotor(): Promise<MotorUci> {
  if (promesa) return promesa
  const t0 = performance.now()
  cambiar({ tipo: 'cargando' })
  promesa = crearMotorNavegador().then(
    (m) => {
      cambiar({ tipo: 'listo', version: m.version, msCarga: Math.round(performance.now() - t0) })
      return m
    },
    (e: Error) => {
      promesa = null
      cambiar({ tipo: 'error', mensaje: e.message })
      throw e
    },
  )
  return promesa
}
