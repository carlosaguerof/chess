import { useEffect, useState } from 'react'
import { crearMotorNavegador } from '../motor/navegador.ts'
import { elegirJugada, type ParamsNivel } from '../motor/elegir.ts'
import { NIVELES } from '../motor/niveles.ts'

/** Solo en desarrollo: mide carga y tiempo por jugada del motor en este navegador (lo usa `npm run medir`). */
const POSICIONES = [
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  'r1bq1rk1/pp2bppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 w - - 0 8',
  'r2q1rk1/1b2bppp/p2ppn2/1p6/3NP3/1BN1B3/PPP1QPPP/R4RK1 w - - 0 12',
  '2r2rk1/pp1q1ppp/2n1pn2/3p4/3P4/2PB1N2/P1Q2PPP/R4RK1 w - - 4 16',
  '8/5pk1/6p1/3R4/5P2/6P1/r5KP/8 w - - 0 40',
]
const ALTOS: ParamsNivel[] = [
  { elo: 1500, modo: 'uci', uciElo: 1500, tiempoMs: 150 },
  { elo: 3000, modo: 'uci', uciElo: 3000, tiempoMs: 300 },
]

export function MedirMotor() {
  const [salida, setSalida] = useState<string>('midiendo…')
  useEffect(() => {
    ;(async () => {
      const t0 = performance.now()
      const motor = await crearMotorNavegador()
      const carga = performance.now() - t0
      const filas: { elo: number; modo: string; msPromedio: number; msMax: number }[] = []
      for (const n of [...NIVELES, ...ALTOS]) {
        const tiempos: number[] = []
        for (const fen of POSICIONES) {
          const t = performance.now()
          await elegirJugada(motor, fen, n, Math.random)
          tiempos.push(performance.now() - t)
        }
        filas.push({ elo: n.elo, modo: n.modo, msPromedio: Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length), msMax: Math.round(Math.max(...tiempos)) })
      }
      setSalida(JSON.stringify({ version: motor.version, msCarga: Math.round(carga), userAgent: navigator.userAgent, ancho: window.innerWidth, filas }))
      motor.cerrar()
    })().catch((e) => setSalida('error: ' + String(e)))
  }, [])
  return <pre data-testid="medicion">{salida}</pre>
}
