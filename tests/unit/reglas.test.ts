import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { destinos, esCoronacion, finPorReglas, intentar, jugadasEnEspanol, partidaDesde, puedeDarMate, FEN_INICIAL } from '../../src/ajedrez/reglas.ts'
import { sanAEspanol, sanDeEspanol, lineaEnEspanol } from '../../src/ajedrez/notacion.ts'

describe('reglas del ajedrez', () => {
  it('enroque corto (0-0) de blancas', () => {
    const c = partidaDesde(FEN_INICIAL, ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'f8c5'])
    expect(destinos(c).get('e1')).toContain('g1')
    const m = intentar(c, 'e1g1')
    expect(m?.san).toBe('O-O')
    expect(c.get('g1')).toMatchObject({ type: 'k', color: 'w' })
    expect(c.get('f1')).toMatchObject({ type: 'r', color: 'w' })
    expect(jugadasEnEspanol(c).at(-1)).toBe('0-0')
  })

  it('enroque largo (0-0-0) de negras', () => {
    const c = new Chess('r3kbnr/pppqpppp/2n5/3p1b2/3P1B2/2N5/PPPQPPPP/R3KBNR b KQkq - 5 5')
    const m = intentar(c, 'e8c8')
    expect(m?.san).toBe('O-O-O')
    expect(c.get('c8')).toMatchObject({ type: 'k', color: 'b' })
    expect(c.get('d8')).toMatchObject({ type: 'r', color: 'b' })
    expect(sanAEspanol(m!.san)).toBe('0-0-0')
  })

  it('no se puede enrocar a través de una casilla atacada', () => {
    // el alfil negro de a6 ataca f1 por la diagonal abierta (sin peón en e2)
    const c = new Chess('rn1qkbnr/pppppppp/b7/8/8/5NP1/PPPP1PBP/RNBQK2R w KQkq - 0 1')
    expect(c.inCheck()).toBe(false)
    expect(destinos(c).get('e1') ?? []).not.toContain('g1')
    const libre = new Chess('rn1qkbnr/pppppppp/8/8/8/5NP1/PPPP1PBP/RNBQK2R w KQkq - 0 1')
    expect(destinos(libre).get('e1')).toContain('g1')
  })

  it('captura al paso', () => {
    const c = partidaDesde(FEN_INICIAL, ['e2e4', 'a7a6', 'e4e5', 'd7d5'])
    expect(destinos(c).get('e5')).toContain('d6')
    const m = intentar(c, 'e5d6')
    expect(m?.isEnPassant()).toBe(true)
    expect(c.get('d5')).toBeUndefined()
    expect(m?.san).toBe('exd6')
  })

  it('la captura al paso solo vale en la jugada inmediata', () => {
    const c = partidaDesde(FEN_INICIAL, ['e2e4', 'a7a6', 'e4e5', 'd7d5', 'g1f3', 'a6a5'])
    expect(intentar(c, 'e5d6')).toBeNull()
  })

  it('coronación: se detecta, y se puede escoger la pieza (no siempre dama)', () => {
    const c = new Chess('8/4P1k1/8/8/8/8/6K1/8 w - - 0 1')
    expect(esCoronacion(c, 'e7', 'e8')).toBe(true)
    const m = intentar(c, 'e7e8n')
    expect(m?.promotion).toBe('n')
    expect(c.get('e8')).toMatchObject({ type: 'n', color: 'w' })
    expect(sanAEspanol(m!.san)).toBe('e8=C+')
  })

  it('jaque mate (mate del pastor)', () => {
    const c = partidaDesde(FEN_INICIAL, ['e2e4', 'e7e5', 'd1h5', 'b8c6', 'f1c4', 'g8f6', 'h5f7'])
    expect(finPorReglas(c)).toEqual({ tipo: 'mate', ganador: 'w', nombre: 'Jaque mate' })
    expect(jugadasEnEspanol(c)).toEqual(['e4', 'e5', 'Dh5', 'Cc6', 'Ac4', 'Cf6', 'Dxf7#'])
  })

  it('ahogado', () => {
    const c = new Chess('7k/5Q2/6K1/8/8/8/8/8 w - - 0 1')
    intentar(c, 'f7g5') // aún no
    expect(finPorReglas(c)).toBeNull()
    const d = new Chess('7k/8/6K1/8/8/8/8/5Q2 w - - 0 1')
    intentar(d, 'f1f7')
    expect(finPorReglas(d)).toEqual({ tipo: 'ahogado', ganador: null, nombre: 'Ahogado' })
  })

  it('triple repetición', () => {
    const ida = ['g1f3', 'g8f6', 'f3g1', 'f6g8']
    const c = partidaDesde(FEN_INICIAL, [...ida, ...ida])
    expect(finPorReglas(c)?.tipo).toBe('repeticion')
    expect(finPorReglas(c)?.nombre).toBe('Tablas por triple repetición')
    const dos = partidaDesde(FEN_INICIAL, ida)
    expect(finPorReglas(dos)).toBeNull()
  })

  it('regla de las 50 jugadas', () => {
    const c = new Chess('8/8/4k3/8/8/4K3/8/R7 w - - 99 80')
    intentar(c, 'a1a2')
    expect(finPorReglas(c)?.tipo).toBe('cincuenta')
    expect(finPorReglas(c)?.nombre).toBe('Tablas por la regla de las 50 jugadas')
  })

  it('material insuficiente (rey y alfil contra rey)', () => {
    const c = new Chess('8/8/4k3/8/8/4K3/8/2B5 w - - 0 1')
    expect(finPorReglas(c)?.tipo).toBe('material')
    expect(puedeDarMate(c, 'w')).toBe(false)
    expect(puedeDarMate(new Chess('8/8/4k3/8/8/4K3/8/R7 w - - 0 1'), 'w')).toBe(true)
  })

  it('una jugada ilegal no se acepta', () => {
    const c = new Chess()
    expect(intentar(c, 'e2e5')).toBeNull()
    expect(c.fen()).toBe(FEN_INICIAL)
    expect(destinos(c).get('e2')).toEqual(['e3', 'e4'])
  })
})

describe('notación R D T A C', () => {
  it('traduce del inglés a mis guías y de regreso', () => {
    const pares: [string, string][] = [
      ['Nf3', 'Cf3'], ['Bc4', 'Ac4'], ['Qxd5', 'Dxd5'], ['Rxe8+', 'Txe8+'], ['Kf1', 'Rf1'],
      ['O-O', '0-0'], ['O-O-O', '0-0-0'], ['exd5', 'exd5'], ['b4', 'b4'], ['bxc3', 'bxc3'], ['e8=Q#', 'e8=D#'], ['Nbd7', 'Cbd7'],
    ]
    for (const [en, es] of pares) {
      expect(sanAEspanol(en)).toBe(es)
      expect(sanDeEspanol(es)).toBe(en)
    }
  })
  it('numera una línea como en mis guías', () => {
    expect(lineaEnEspanol(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'])).toBe('1.e4 c6 2.d4 d5 3.e5 Af5')
    expect(lineaEnEspanol(['Bf5'], 5)).toBe('3...Af5')
  })
})
