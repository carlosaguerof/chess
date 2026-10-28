import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { amenazas, porcentajeBlancas } from '../../src/ayudas/amenazas.ts'

describe('T15 · ayudas: amenazas y barra', () => {
  it('la amenaza señala la pieza colgada', () => {
    // el caballo blanco de e5 está atacado por el peón de d6 y no tiene defensa
    const c = new Chess('rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 0 4')
    const a = amenazas(c, 'w')
    expect(a).toContainEqual({ desde: 'd6', hasta: 'e5' })
  })
  it('una pieza defendida y atacada por algo de más valor no es amenaza', () => {
    // 1.e4 e5 2.Cf3 Cc6: el peón de e5 lo ataca el caballo (vale más) y lo defiende el de c6
    const c = new Chess('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3')
    expect(amenazas(c, 'b')).toEqual([])
    // 1.e4 e5 2.Cf3: sin defensa, sí es amenaza
    const sinDefensa = new Chess('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2')
    expect(amenazas(sinDefensa, 'b')).toEqual([{ desde: 'f3', hasta: 'e5' }])
  })
  it('la barra: más ventaja, más llena; un mate la llena', () => {
    expect(porcentajeBlancas(0, null)).toBe(50)
    expect(porcentajeBlancas(300, null)).toBeGreaterThan(70)
    expect(porcentajeBlancas(-300, null)).toBeLessThan(30)
    expect(porcentajeBlancas(0, 1)).toBe(100)
    expect(porcentajeBlancas(0, -2)).toBe(0)
  })
})

describe('T15 · con el motor a toda fuerza (aparte del del bot)', () => {
  it('la sugerencia coincide con la mejor jugada del motor, y un mate en 1 llena la barra', { timeout: 60_000 }, async () => {
    const { motorNode } = await import('../../scripts/motor-node.ts')
    const { evaluarCon } = await import('../../src/ayudas/analisis.ts')
    const m = motorNode()
    await m.iniciar()
    // mate del pastor a una jugada: Dxf7#
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4'
    const e = await evaluarCon(m, fen, 300)
    expect(e.mejor).toBe('h5f7')
    expect(e.mate).toBe(1)
    expect(porcentajeBlancas(e.cpBlancas, e.mate)).toBe(100)
    // la ventaja del lado correcto: negras con una dama de más
    const negrasGanan = await evaluarCon(m, 'q3k3/8/8/8/8/8/8/4K3 w - - 0 1', 200)
    expect(porcentajeBlancas(negrasGanan.cpBlancas, negrasGanan.mate)).toBeLessThan(20)
    m.cerrar()
  })
})

describe('T15 · amenazas solo con capturas legales (pase 2 de la T22)', () => {
  it('una pieza clavada no amenaza', () => {
    // el caballo negro de e6 está clavado por la torre de e1 contra su rey: no puede tomar el alfil de d4
    const c = new Chess('4k3/8/4n3/8/3B4/8/8/4R1K1 b - - 0 1')
    expect(amenazas(c, 'w')).toEqual([])
    // sin la torre, sí
    expect(amenazas(new Chess('4k3/8/4n3/8/3B4/8/8/6K1 b - - 0 1'), 'w')).toEqual([{ desde: 'e6', hasta: 'd4' }])
  })
})

describe('T15 · más atacantes que defensores (pase 3 de la T22)', () => {
  it('el peón de e4 atacado por dos y defendido por uno es amenaza', () => {
    const c = new Chess()
    for (const s of ['e4', 'b6', 'Nc3', 'Bb7', 'Bc4', 'Nf6', 'a3', 'e6']) c.move(s)
    expect(amenazas(c, 'w').map((a) => a.hasta)).toContain('e4')
  })
})
