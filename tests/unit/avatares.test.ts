import { describe, expect, it } from 'vitest'
import { PERSONAJES } from '../../src/bots/personajes.ts'
import { rasgos } from '../../src/componentes/CaraGenerada.tsx'

describe('R4 · avatares generados', () => {
  it('los 47 personajes tienen una cara distinta (rasgos o color de fondo) y siempre la misma', () => {
    expect(PERSONAJES).toHaveLength(47)
    const firmas = PERSONAJES.map((p) => JSON.stringify({ ...rasgos(p.id), fondo: p.color }))
    expect(new Set(firmas).size).toBe(47)
    expect(rasgos(PERSONAJES[0]!.id)).toEqual(rasgos(PERSONAJES[0]!.id))
  })
})
