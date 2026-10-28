import datos from './niveles.json' with { type: 'json' }
import type { ParamsNivel } from './elegir.ts'

export const NIVELES = datos.niveles as ParamsNivel[]

/** Los parámetros del nivel más cercano a este ELO. */
export function nivelDe(elo: number): ParamsNivel {
  let mejor = NIVELES[0]!
  for (const n of NIVELES) if (Math.abs(n.elo - elo) < Math.abs(mejor.elo - elo)) mejor = n
  return mejor
}
