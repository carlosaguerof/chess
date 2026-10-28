import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'

describe('humo', () => {
  it('chess.js arranca en la posición inicial', () => {
    const partida = new Chess()
    expect(partida.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    expect(partida.moves()).toHaveLength(20)
  })
})
