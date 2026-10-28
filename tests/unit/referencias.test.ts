import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

/** Las referencias archivo:línea del camino de llamada en specs/motor.md apuntan a la línea que dicen (§6). */
const ESPERADO: [string, string][] = [
  ['scripts/calibrar.ts', 'elegirJugada('],
  ['src/motor/elegir.ts', 'export async function elegirJugada'],
  ['src/pantallas/Partida.tsx', 'usePartidaBot('],
  ['src/partida/usePartidaBot.ts', 'jugadaDelBot('],
  ['src/motor/bot.ts', 'elegirJugada('],
  ['src/motor/navegador.ts', 'new Worker'],
]

describe('specs/motor.md · camino de llamada', () => {
  it('cada archivo:línea apunta a la llamada que dice', () => {
    const spec = readFileSync('specs/motor.md', 'utf8')
    for (const [archivo, trozo] of ESPERADO) {
      const refs = [...spec.matchAll(new RegExp(`${archivo.replace(/[./]/g, (c) => `\\${c}`)}:(\\d+)`, 'g'))].map((m) => Number(m[1]))
      expect(refs.length, archivo).toBeGreaterThan(0)
      const lineas = readFileSync(archivo, 'utf8').split('\n')
      for (const n of refs) expect(lineas[n - 1], `${archivo}:${n}`).toContain(trozo)
    }
  })
})
