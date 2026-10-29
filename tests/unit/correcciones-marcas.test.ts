import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess, type Color, type Square } from 'chess.js'
import { CURSOS_NUEVOS, lineaPorId, misJugadas } from '../../src/curso/datos.ts'
import { continuar, empezar, intentar, jugarRival, pedirPista, pedirRespuesta, type EstadoCiclo } from '../../src/curso/ciclo.ts'
import { caminosDeCaballo, centro, COLORES, colorDe, marcasDelMomento, marcasDelPaso, puntosDeFlecha, frasesDe, MARCAS_NUEVAS_DE_ENTRADA } from '../../src/curso/marcas.ts'
import { posicion } from '../../src/curso/textos.ts'
import { ligadas, listaDeMarcas, type Ligada } from '../../scripts/marcas-por-jugada.ts'
import type { Marca } from '../../src/curso/tipos.ts'

/**
 * Correcciones de la Caro-Kann, C5: las marcas en el tablero. Una prueba por cada regla de §3 de las reglas v1.1
 * (`00_corridas/chess/2026-10-29_REGLAS_marcas.md`, aprobadas por Carlos el 2026-10-29), sobre los datos de todo el
 * curso y sobre el código que dibuja. R7 (en Practicar, nada en tu turno) tiene además su prueba en Playwright.
 */
const c = CURSOS_NUEVOS['caro-kann:b']!
const TODAS = ligadas(c)
const flechas = (ms: Marca[]) => ms.filter((m) => m.de && m.a)
const casillas = (ms: Marca[]) => ms.filter((m) => m.en)
const otro = (x: Color): Color => (x === 'w' ? 'b' : 'w')

// las casillas escritas en una frase: "f6", "Af5" (f5), "cxd5" (d5), "d4-e5"
const casillasEscritas = (frase: string) => new Set([...frase.matchAll(/(?<![a-z])(?:[RDTAC]?[a-h]?x?)([a-h][1-8])(?![0-9])/g)].map((m) => m[1]!))
const NOMBRES: Record<string, RegExp> = { p: /pe[oó]n|peones/i, n: /caballo/i, b: /alfil/i, r: /torre/i, q: /dama/i, k: /\brey\b/i }
const LETRA: Record<string, string> = { p: '', n: 'C', b: 'A', r: 'T', q: 'D', k: 'R' }

/** La pieza de la que sale la flecha está nombrada en la frase: su casilla, su nombre o una jugada suya a esa casilla. */
function nombraLaPieza(frase: string, tipo: string, de: string, a: string) {
  if (casillasEscritas(frase).has(de)) return true
  if (NOMBRES[tipo]!.test(frase)) return true
  return new RegExp(`(^|[^A-Za-z])${LETRA[tipo]}[a-h]?[1-8]?x?${a}(?![0-9])`).test(frase)
}

/** La pieza ataca o apoya la casilla (chess.js: cuenta también la defensa de una pieza propia). */
const ataca = (fen: string, de: string, a: string, color: Color) => new Chess(fen).attackers(a as Square, color).includes(de as Square)

/** La pieza puede llegar a la casilla: la ataca, o tiene una jugada ahí (con el turno de su color). */
function llega(fen: string, de: string, a: string, color: Color) {
  if (ataca(fen, de, a, color)) return true
  const [tab, , enroques, , ...resto] = fen.split(' ')
  const ch = new Chess([tab, color, enroques, '-', ...resto].join(' '))
  return ch.moves({ square: de as Square, verbose: true }).some((m) => m.to === a)
}

/** Las marcas que se ven juntas en cada momento (para R2 y R3). En Practicar, sin la A1 (ya la enseña el amarillo). */
function porMomento(): Map<string, { marcas: Marca[]; fen: string }> {
  const r = new Map<string, { marcas: Marca[]; fen: string }>()
  for (const x of TODAS)
    for (const g of x.grupos) {
      const v = r.get(g) ?? { marcas: [], fen: x.fenTablero }
      if (g.startsWith('tuTurno:') && x.donde.includes(' hace ')) v.fen = x.fenTablero
      v.marcas.push(...(g.startsWith('practicar:') ? x.marcas.filter((m) => m.tipo !== 'A1') : x.marcas))
      r.set(g, v)
    }
  return r
}

describe('Correcciones · C5 · las marcas (reglas v1.1)', () => {
  it('el interruptor interno sale apagado: las marcas no se publican sin el "publica" de la torre', () => {
    expect(MARCAS_NUEVAS_DE_ENTRADA).toBe(false)
  })

  it('hay marcas, y cada una está ligada a una frase que existe', () => {
    expect(TODAS.length).toBeGreaterThan(50)
    for (const x of TODAS) {
      expect(x.frase.length, x.donde).toBeGreaterThan(0)
      expect(x.marcas.length, x.donde).toBeGreaterThan(0)
    }
    // ningún campo trae marcas para más frases de las que tiene
    for (const [k, t] of Object.entries(c.rival)) expect(t.marcas?.length ?? 0, k).toBeLessThanOrEqual(frasesDe(t.texto).length)
    for (const [k, t] of Object.entries(c.mias))
      for (const [campo, m] of Object.entries(t.marcasDe ?? {})) expect(m.length, `${k} ${campo}`).toBeLessThanOrEqual(frasesDe((t as unknown as Record<string, string>)[campo] ?? '').length)
  })

  it('R1 · cada marca nace de su frase: toda casilla marcada está escrita en ella, y toda flecha sale de una pieza que la frase nombra (el caso d6: no se marca)', () => {
    for (const x of TODAS) {
      const escritas = casillasEscritas(x.frase)
      for (const m of x.marcas) {
        const destino = m.en ?? m.a!
        expect(escritas.has(destino), `${x.donde}: "${destino}" escrita en «${x.frase}»`).toBe(true)
        if (m.de) {
          const fen = m.tipo === 'A1' ? posicionAntes(x) : x.fen
          const pieza = new Chess(fen).get(m.de as Square)
          expect(pieza, `${x.donde}: hay una pieza en ${m.de}`).toBeTruthy()
          expect(nombraLaPieza(x.frase, pieza!.type, m.de, m.a!), `${x.donde}: «${x.frase}» nombra la pieza de ${m.de}`).toBe(true)
        }
      }
    }
    // el dibujo de Carlos: en la frase de 3.e5, f6 sí y d6 no
    const e5 = TODAS.find((x) => x.donde === 'rival «e4 c6 d4 d5 e5» frase 1')!
    expect(e5.marcas.map((m) => m.en ?? m.a)).toEqual(['f6', 'f6'])
    expect(JSON.stringify(e5.marcas)).not.toContain('d6')
  })

  it('R2 · máximo dos marcas nuevas por frase; las de una misma jugada se acumulan hasta cuatro', () => {
    for (const x of TODAS) expect(x.marcas.length, x.donde).toBeLessThanOrEqual(2)
    for (const [g, v] of porMomento()) expect(v.marcas.length, g).toBeLessThanOrEqual(4)
    // el ejemplo 3 de las reglas: 2...d5 se parte en dos frases, y al final se ven las tres flechas
    const d5 = TODAS.filter((x) => x.donde.startsWith('mía «e4 c6 d4 d5» hace'))
    expect(d5.map((x) => x.marcas.length)).toEqual([2, 1])
    expect(porMomento().get('tuTurno:e4 c6 d4 d5')!.marcas).toHaveLength(3)
  })

  it('R3 · nunca dos marcas para lo mismo: ni flechas repetidas, ni la casilla de salida iluminada, ni encerrada la pieza que la flecha señala', () => {
    for (const [g, v] of porMomento()) {
      const fs = flechas(v.marcas)
      const llaves = fs.map((m) => `${m.de}-${m.a}`)
      expect(new Set(llaves).size, `${g}: flechas repetidas`).toBe(llaves.length)
      const cs = casillas(v.marcas).map((m) => m.en)
      expect(new Set(cs).size, `${g}: casillas repetidas`).toBe(cs.length)
      const tablero = new Chess(v.fen)
      for (const m of casillas(v.marcas)) {
        // tampoco se ilumina una pieza tuya: se lee como "esta pieza", no como la casilla (pase visual 1, el plan del Panov)
        const p = tablero.get(m.en as Square)
        expect(!p || p.color !== TODAS.find((x) => x.marcas.includes(m))!.mio, `${g}: ${m.en} encierra una pieza tuya`).toBe(true)
        expect(fs.some((f) => f.de === m.en), `${g}: la casilla ${m.en} es la salida de una flecha`).toBe(false)
        // solo se ilumina la llegada de una flecha si está vacía (A5: la casilla que te quitan)
        if (fs.some((f) => f.a === m.en)) expect(tablero.get(m.en as Square), `${g}: ${m.en} encierra una pieza`).toBeFalsy()
      }
    }
  })

  it('R4 · cada marca dice algo cierto en el tablero (chess.js, en cada posición)', () => {
    for (const x of TODAS) {
      const mio = x.mio
      const tablero = new Chess(x.fen)
      for (const m of x.marcas) {
        const d = `${x.donde}: ${JSON.stringify(m)}`
        const pieza = m.de ? tablero.get(m.de as Square) : undefined
        switch (m.tipo) {
          case 'A1':
            expect(x.jugada, d).toBeDefined()
            expect({ de: m.de, a: m.a }, d).toEqual({ de: x.jugada!.from, a: x.jugada!.to })
            break
          case 'A2':
            expect(pieza?.color, `${d}: la pieza es tuya`).toBe(mio)
            expect(ataca(x.fen, m.de!, m.a!, mio), `${d}: ataca o apoya ${m.a}`).toBe(true)
            break
          case 'A3':
            expect(pieza?.color, `${d}: la pieza es tuya`).toBe(mio)
            expect(llega(x.fen, m.de!, m.a!, mio), `${d}: puede llegar a ${m.a}`).toBe(true)
            break
          case 'A4':
            expect(pieza?.color, `${d}: la pieza es del rival`).toBe(otro(mio))
            expect(ataca(x.fen, m.de!, m.a!, otro(mio)), `${d}: controla ${m.a}`).toBe(true)
            break
          case 'A5':
            if (m.en) expect(tablero.isAttacked(m.en as Square, otro(mio)), `${d}: el rival controla ${m.en}`).toBe(true)
            else {
              expect(pieza?.color, `${d}: la pieza es tuya`).toBe(mio)
              expect(llega(x.fen, m.de!, m.a!, mio), `${d}: tu pieza podría ir a ${m.a}`).toBe(true)
              expect(casillas(x.marcas).some((n) => n.en === m.a), `${d}: con su casilla`).toBe(true)
            }
            break
          case 'A6':
            expect(m.en, d).toMatch(/^[a-h][1-8]$/)
            break
          default:
            throw new Error(`${d}: sin tipo`)
        }
      }
    }
  })

  it('R5 · colores y trazos solo de esta lista, y cada tipo con el suyo; el código dibuja solo verde y rojo', () => {
    for (const x of TODAS)
      for (const m of x.marcas) {
        const d = `${x.donde}: ${JSON.stringify(m)}`
        expect(['verde', 'rojo'], d).toContain(m.color)
        expect(!!m.punteada, `${d}: punteada solo la A3`).toBe(m.tipo === 'A3')
        if (['A1', 'A2', 'A3'].includes(m.tipo!)) expect(m.color, d).toBe('verde')
        if (['A4', 'A5'].includes(m.tipo!)) expect(m.color, d).toBe('rojo')
        if (['A1', 'A2', 'A3', 'A4'].includes(m.tipo!)) expect(!!(m.de && m.a) && !m.en, `${d}: es flecha`).toBe(true)
        if (m.tipo === 'A6') expect(!!m.en && !m.de, `${d}: es casilla`).toBe(true)
      }
    expect(Object.keys(COLORES)).toEqual(['verde', 'rojo'])
    const usados = new Set(TODAS.flatMap((x) => x.marcas.map(colorDe)))
    for (const u of usados) expect(Object.values(COLORES)).toContain(u)
  })

  it('R6 · las flechas de caballo van en L, primero el tramo largo (g8→f6: baja a g6 y dobla a f6)', () => {
    // el dibujo de Carlos, con el tablero desde negras
    expect(puntosDeFlecha('g8', 'f6', 'black')).toEqual([
      [1.5, 7.5],
      [1.5, 5.5],
      [2.5, 5.5],
    ])
    // un salto con el tramo largo de lado: e5→c6? no, e5→c4 (dos a la izquierda, uno abajo)
    expect(puntosDeFlecha('e5', 'c4', 'white')).toHaveLength(3)
    expect(puntosDeFlecha('c8', 'f5', 'black')).toHaveLength(2)
    for (const x of TODAS)
      for (const m of flechas(x.marcas)) {
        const pieza = new Chess(m.tipo === 'A1' ? posicionAntes(x) : x.fen).get(m.de as Square)
        expect(puntosDeFlecha(m.de!, m.a!, 'black').length, `${x.donde} ${m.de}→${m.a}`).toBe(pieza?.type === 'n' ? 3 : 2)
      }
  })

  it('R6 · y la L no dobla encima de una pieza (pase visual 1: parecía que esa pieza se movía)', () => {
    for (const [g, v] of porMomento()) {
      const tablero = new Chess(v.fen)
      const ocupada = (c: string) => !!tablero.get(c as Square)
      for (const m of flechas(v.marcas)) {
        const p = puntosDeFlecha(m.de!, m.a!, 'black', ocupada)
        if (p.length < 3) continue
        const esquina = caminosDeCaballo(m.de!, m.a!).find((cm) => centro(cm.esquina, 'black').join() === p[1]!.join())!.esquina
        expect(ocupada(esquina), `${g}: la L ${m.de}→${m.a} dobla en ${esquina}, que tiene una pieza`).toBe(false)
      }
    }
    // si la esquina del tramo largo tiene una pieza y la otra no, va por la otra (b8→c6 con la dama en b6: por c8)
    expect(puntosDeFlecha('b8', 'c6', 'black', (c) => c === 'b6')[1]).toEqual(centro('c8', 'black'))
    expect(puntosDeFlecha('b8', 'c6', 'black')[1]).toEqual(centro('b6', 'black'))
  })

  it('R7 · en Practicar, nada antes de tu jugada; la segunda Pista ilumina la pieza y la Respuesta es la flecha A1', () => {
    for (const id of ['v:avance-short', 'v:avance-c3', 'v:clasica', 'v:cambio', 'v:dos-caballos']) {
      const l = lineaPorId(c, id)!
      for (const ply of misJugadas(l)) {
        const e: EstadoCiclo = { ...empezar(l, 'practicar'), ply, momento: 'tuTurno' }
        expect(marcasDelMomento(c, l, e), `${id} ${ply}`).toEqual([])
        const p1 = pedirPista(e)
        expect(marcasDelMomento(c, l, p1)).toEqual([])
        const p2 = pedirPista(p1)
        const m = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
        expect(marcasDelMomento(c, l, p2)).toEqual([{ en: m.from, color: 'verde' }])
        expect(marcasDelMomento(c, l, pedirRespuesta(p2))).toEqual([{ tipo: 'A1', de: m.from, a: m.to, color: 'verde' }])
      }
    }
    // en un «¿Y si…?», tampoco: se pregunta por la jugada que castiga
    for (const l of [lineaPorId(c, 'e:tal-e6')!, lineaPorId(c, 'e:bayoneta-ag2')!].filter(Boolean))
      for (const ply of misJugadas(l)) expect(marcasDelMomento(c, l, { ...empezar(l, 'aprender'), ply, momento: 'tuTurno' }), `${l.id} ${ply}`).toEqual([])
    // en Aprender sí: la frase de 3.e5 y "Te toca: 3...Af5" (el dibujo de Carlos y el ejemplo 2)
    const short = lineaPorId(c, 'v:avance-short')!
    let e = continuar(short, empezar(short, 'aprender'))
    while (e.momento !== 'tuTurno' || e.ply !== 5) {
      if (e.momento === 'rival') e = jugarRival(short, e)
      else if (e.momento === 'tuTurno') {
        const j = posicion(short.jugadas, e.ply).move(short.jugadas[e.ply]!)
        e = continuar(short, intentar(short, e, { san: j.san, desde: j.from, hasta: j.to }, { esperar: true }).estado)
      } else e = continuar(short, e)
    }
    expect(marcasDelMomento(c, short, e)).toEqual([
      { tipo: 'A5', en: 'f6', color: 'rojo' },
      { tipo: 'A5', de: 'g8', a: 'f6', color: 'rojo' },
      { tipo: 'A1', de: 'c8', a: 'f5', color: 'verde' },
    ])
    // y después de jugar 3...Af5 en Practicar, las de su explicación (sin la A1)
    const j = posicion(short.jugadas, 5).move('Bf5')
    const leer = intentar(short, { ...empezar(short, 'practicar'), ply: 5, momento: 'tuTurno' }, { san: j.san, desde: j.from, hasta: j.to }, { esperar: true }).estado
    expect(marcasDelMomento(c, short, leer)).toEqual([{ tipo: 'A3', de: 'e7', a: 'e6', color: 'verde', punteada: true }])
  })

  it('el paso a paso acumula las marcas hasta que el tablero vuelve a mover', () => {
    const idea = c.piezas.idea.paginas[0]!.pasoAPaso!
    expect(marcasDelPaso(idea, 3)).toEqual([{ tipo: 'A2', de: 'd5', a: 'e4', color: 'verde' }])
    expect(marcasDelPaso(idea, 4).map((m) => `${m.de}-${m.a}`)).toEqual(['d5-e4', 'c6-d5'])
    expect(marcasDelPaso(idea, 5)).toEqual([])
  })

  it('R8 · solo lo clave: la lista de qué jugadas llevan marcas está al día (iterations/v3/marcas-por-jugada.md)', () => {
    expect(readFileSync('iterations/v3/marcas-por-jugada.md', 'utf8')).toBe(listaDeMarcas(c))
    // la A1 (la flecha de tu jugada) solo en las jugadas clave, no en todas
    const conA1 = TODAS.filter((x) => x.marcas.some((m) => m.tipo === 'A1')).length
    expect(conA1).toBeLessThanOrEqual(15)
  })
})

/** La posición antes de la jugada de "Te toca" (para medir la A1). */
const posicionAntes = (x: Ligada): string => x.fenAntes ?? x.fen
