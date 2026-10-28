import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { elegirJugada, azarConSemilla, UMBRAL_ERROR_CP } from '../../src/motor/elegir.ts'
import { jugadaDelBot, esperaDelBot } from '../../src/motor/bot.ts'
import { leerInfo, MotorUci, type Transporte } from '../../src/motor/uci.ts'
import { NIVELES } from '../../src/motor/niveles.ts'

/** Un motor falso que habla UCI y contesta con candidatas fijas. */
function motorFalso(candidatas: [string, number][]) {
  const enviados: string[] = []
  let cb: (l: string) => void = () => {}
  const t: Transporte = {
    enviar: (c) => {
      enviados.push(c)
      if (c === 'uci') {
        cb('id name Motor Falso 1.0')
        cb('uciok')
      } else if (c === 'isready') cb('readyok')
      else if (c.startsWith('go')) {
        candidatas.forEach(([uci, cp], i) => cb(`info depth 5 seldepth 6 multipv ${i + 1} score cp ${cp} nodes 10 pv ${uci}`))
        cb(`bestmove ${candidatas[0]![0]}`)
      }
    },
    alRecibir: (f) => {
      cb = f
    },
    cerrar: () => {},
  }
  return { motor: new MotorUci(t), enviados }
}

describe('cliente UCI', () => {
  it('lee las líneas info con cp y con mate', () => {
    expect(leerInfo('info depth 8 seldepth 9 multipv 2 score cp -31 nodes 13481 pv d2d4 d7d5')).toMatchObject({ uci: 'd2d4', cp: -31, multipv: 2, profundidad: 8 })
    const mate = leerInfo('info depth 3 multipv 1 score mate 2 nodes 100 pv d1h5 g7g6 h5f7')
    expect(mate?.mate).toBe(2)
    expect(mate?.cp).toBeGreaterThan(30000)
    expect(leerInfo('info string NNUE evaluation')).toBeNull()
  })
  it('muestra la versión del motor al iniciar', async () => {
    const { motor } = motorFalso([['e2e4', 30]])
    expect(await motor.iniciar()).toBe('Motor Falso 1.0')
  })
})

describe('elegirJugada (la función única)', () => {
  const fen = new Chess().fen()
  const cands: [string, number][] = [['e2e4', 40], ['d2d4', 35], ['g1f3', 30], ['a2a3', -20], ['g2g4', -300]]

  it('con temperatura baja y sin errores, casi siempre la mejor', async () => {
    const { motor } = motorFalso(cands)
    await motor.iniciar()
    const azar = azarConSemilla(3)
    const cuenta: Record<string, number> = {}
    for (let i = 0; i < 200; i++) {
      const e = await elegirJugada(motor, fen, { elo: 9, modo: 'debil', profundidad: 5, multipv: 5, errorGrande: 0, temperatura: 1 }, azar)
      cuenta[e!.uci] = (cuenta[e!.uci] ?? 0) + 1
    }
    expect(cuenta['e2e4']).toBeGreaterThan(190)
  })

  it('con errorGrande = 1, juega una jugada que pierde al menos 150 centipeones', async () => {
    const { motor } = motorFalso(cands)
    await motor.iniciar()
    const e = await elegirJugada(motor, fen, { elo: 9, modo: 'debil', profundidad: 5, multipv: 5, errorGrande: 1, temperatura: 50 }, azarConSemilla(1))
    expect(e?.motivo).toBe('error')
    expect(e?.uci).toBe('g2g4')
    expect(e!.perdidaCp).toBeGreaterThanOrEqual(UMBRAL_ERROR_CP)
  })

  it('borra la memoria del motor antes de cada jugada y pide las candidatas del nivel', async () => {
    const { motor, enviados } = motorFalso(cands)
    await motor.iniciar()
    await elegirJugada(motor, fen, { elo: 9, modo: 'debil', nodos: 500, multipv: 5, errorGrande: 0, temperatura: 50 }, azarConSemilla(1))
    expect(enviados).toContain('setoption name Clear Hash')
    expect(enviados).toContain('setoption name MultiPV value 5')
    expect(enviados).toContain('go nodes 500')
  })

  it('el modo uci usa UCI_LimitStrength con su UCI_Elo', async () => {
    const { motor, enviados } = motorFalso(cands)
    await motor.iniciar()
    await elegirJugada(motor, fen, { elo: 2000, modo: 'uci', uciElo: 2000, tiempoMs: 100 }, azarConSemilla(1))
    expect(enviados).toContain('setoption name UCI_LimitStrength value true')
    expect(enviados).toContain('setoption name UCI_Elo value 2000')
    expect(enviados).toContain('go movetime 100')
  })

  it('una sola jugada legal: la juega sin preguntar al motor', async () => {
    const { motor, enviados } = motorFalso(cands)
    await motor.iniciar()
    const e = await elegirJugada(motor, '7k/8/8/8/8/8/6r1/7K w - - 0 1', NIVELES[0]!, azarConSemilla(1))
    expect(e?.motivo).toBe('unica')
    expect(e?.uci).toBe('h1g2')
    expect(enviados.some((c) => c.startsWith('go'))).toBe(false)
  })
})

describe('niveles', () => {
  it('cada nivel sube en fuerza: menos errores y menos temperatura', () => {
    for (let i = 1; i < NIVELES.length; i++) {
      const a = NIVELES[i - 1]!
      const b = NIVELES[i]!
      if (a.modo !== 'debil' || b.modo !== 'debil') continue
      expect(b.elo).toBeGreaterThan(a.elo)
      expect(b.errorGrande!).toBeLessThanOrEqual(a.errorGrande!)
      expect(b.temperatura!).toBeLessThanOrEqual(a.temperatura!)
    }
  })
})

describe('jugadaDelBot', () => {
  it('primero su libro, luego el motor', async () => {
    const chess = new Chess()
    chess.move('e4')
    const { motor } = motorFalso([['d7d5', 0]])
    await motor.iniciar()
    const libro = (h: string[]) => (h.join(' ') === 'e4' ? 'c6' : null)
    const j = await jugadaDelBot(chess, NIVELES[5]!, async () => motor, { libro }, azarConSemilla(1))
    expect(j).toEqual({ uci: 'c7c6', origen: 'libro' })
    chess.move('c6')
    chess.move('Nf3')
    const j2 = await jugadaDelBot(chess, { elo: 9, modo: 'debil', profundidad: 5, multipv: 1, errorGrande: 0, temperatura: 1 }, async () => motor, { libro }, azarConSemilla(1))
    expect(j2).toEqual({ uci: 'd7d5', origen: 'motor' })
  })
  it('"mis líneas" va antes que el libro', async () => {
    const chess = new Chess()
    chess.move('e4')
    const { motor } = motorFalso([['d7d5', 0]])
    const j = await jugadaDelBot(chess, NIVELES[5]!, async () => motor, { misLineas: () => 'c6', libro: () => 'e5' }, azarConSemilla(1))
    expect(j?.origen).toBe('mis-lineas')
    expect(j?.uci).toBe('c7c6')
  })
  it('el bot se toma entre 0.4 y 1.2 s aunque el motor conteste antes', () => {
    const azar = azarConSemilla(9)
    for (let i = 0; i < 100; i++) {
      const espera = esperaDelBot(30, azar)
      expect(espera + 30).toBeGreaterThanOrEqual(400)
      expect(espera + 30).toBeLessThanOrEqual(1200)
    }
    expect(esperaDelBot(5000, azar)).toBe(0)
  })
})

describe('T17 · temperamento', () => {
  it('solo inclina entre jugadas casi iguales (margen de 30 cp): el agresivo prefiere el jaque, el defensivo el cambio', async () => {
    const { bonoTemperamento, MARGEN_CP, BONO_CP } = await import('../../src/motor/temperamento.ts')
    // 1.e4 e5 2.Cf3 Cc6 3.Ac4 Cf6: Axf7+ es jaque y captura
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    expect(bonoTemperamento(fen, 'c4f7', 10, 'agresivo')).toBe(BONO_CP)
    expect(bonoTemperamento(fen, 'c4f7', MARGEN_CP + 1, 'agresivo')).toBe(0) // fuera del margen, nada
    expect(bonoTemperamento(fen, 'c4f7', 10, 'equilibrado')).toBe(0)
    expect(bonoTemperamento(fen, 'b1c3', 10, 'agresivo')).toBe(0)
    // el defensivo: una casilla segura sí, un jaque no
    expect(bonoTemperamento(fen, 'e1g1', 0, 'defensivo')).toBe(BONO_CP)
    expect(bonoTemperamento(fen, 'c4f7', 0, 'defensivo')).toBe(0)
  })
  it('elegirJugada usa el temperamento: con dos jugadas iguales, el agresivo escoge más la captura', async () => {
    const { motor } = motorFalso([['c4f7', 0], ['b1c3', 0]])
    await motor.iniciar()
    const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    const nivel = { elo: 9, modo: 'debil' as const, profundidad: 5, multipv: 2, errorGrande: 0, temperatura: 20 }
    const contar = async (t?: 'agresivo' | 'defensivo') => {
      const azar = azarConSemilla(11)
      let n = 0
      for (let i = 0; i < 200; i++) if ((await elegirJugada(motor, fen, nivel, azar, t))!.uci === 'c4f7') n++
      return n
    }
    const agresivo = await contar('agresivo')
    const neutro = await contar()
    const defensivo = await contar('defensivo')
    expect(agresivo).toBeGreaterThan(neutro + 40)
    expect(defensivo).toBeLessThan(neutro - 40)
  })
})
