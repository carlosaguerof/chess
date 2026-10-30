import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Chess, type Color, type Square } from 'chess.js'
import { CURSOS_NUEVOS, lineaPorId, lineasDe, misJugadas, textoRival } from '../../src/curso/datos.ts'
import { empezar, pedirPista, pedirRespuesta, type EstadoCiclo, type Vuelta } from '../../src/curso/ciclo.ts'
import { caminosDeCaballo, centro, COLORES, colorDe, marcasDelMomento, marcasDelPaso, puntosDeFlecha, puntosDeFlechas, frasesDe, MARCAS_NUEVAS_DE_ENTRADA } from '../../src/curso/marcas.ts'
import { explicacionDespues } from '../../src/curso/turno.ts'
import { posicion } from '../../src/curso/textos.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'
import { CapaMarcas } from '../../src/componentes/CapaMarcas.tsx'
import { ligadas, listaDeMarcas, type Ligada } from '../../scripts/marcas-por-jugada.ts'
import type { DatosCurso, LineaCurso, Marca } from '../../src/curso/tipos.ts'

/**
 * Las marcas en el tablero (correcciones de la Caro-Kann, C5), con las reglas v1.3 (2026-10-30: lo del rival antes de
 * tu jugada, lo tuyo después; lo pegado no se marca, salvo A5; A7, el plan o la amenaza del rival). Una prueba por cada
 * regla de §3 (`00_corridas/chess/2026-10-29_REGLAS_marcas.md`), sobre los datos de todo el curso y sobre el código que
 * dibuja; una por cada ejemplo de §4; y una que mete errores a propósito para ver que las reglas los atrapan. R7 tiene
 * además su prueba en Playwright.
 */
const c = CURSOS_NUEVOS['caro-kann:b']!
const TODAS = ligadas(c)
const flechas = (ms: Marca[]) => ms.filter((m) => m.de && m.a)
const casillas = (ms: Marca[]) => ms.filter((m) => m.en)
const otro = (x: Color): Color => (x === 'w' ? 'b' : 'w')
const VARIANTES = lineasDe(c).filter((l) => l.tipo === 'variante')

// las casillas escritas en una frase: "f6", "Af5" (f5), "cxd5" (d5), "d4-e5"
const casillasEscritas = (frase: string) => new Set([...frase.matchAll(/(?<![a-z])(?:[RDTAC]?[a-h]?x?)([a-h][1-8])(?![0-9])/g)].map((m) => m[1]!))
const NOMBRES: Record<string, RegExp> = { p: /pe[oó]n|peones/i, n: /caballo/i, b: /alfil/i, r: /torre/i, q: /dama/i, k: /\brey\b/i }
const LETRA: Record<string, string> = { p: '', n: 'C', b: 'A', r: 'T', q: 'D', k: 'R' }
/** Distancia 1 en filas y columnas, contando la diagonal (R8). */
const pegadas = (a: string, b: string) => Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1]))) === 1

/** La pieza de la que sale la flecha está nombrada en la frase: su casilla, su nombre o una jugada suya a esa casilla. */
function nombraLaPieza(frase: string, tipo: string, de: string, a: string) {
  if (casillasEscritas(frase).has(de)) return true
  if (NOMBRES[tipo]!.test(frase)) return true
  return new RegExp(`(^|[^A-Za-z])${LETRA[tipo]}[a-h]?[1-8]?x?${a}(?![0-9])`).test(frase)
}

/** La pieza ataca o apoya la casilla (chess.js: cuenta también la defensa de una pieza propia). */
const ataca = (fen: string, de: string, a: string, color: Color) => new Chess(fen).attackers(a as Square, color).includes(de as Square)

/** La posición con el turno de un color (sin captura al paso). */
const conTurno = (fen: string, color: Color) => {
  const [tab, , enroques, , ...resto] = fen.split(' ')
  return new Chess([tab, color, enroques, '-', ...resto].join(' '), { skipValidation: true })
}

/** La pieza puede llegar a la casilla: la ataca, o tiene una jugada ahí (con el turno de su color). */
function llega(fen: string, de: string, a: string, color: Color) {
  if (ataca(fen, de, a, color)) return true
  return conTurno(fen, color).moves({ square: de as Square, verbose: true }).some((m) => m.to === a)
}

/** El primer paso de una A7: la flecha A7 de la misma frase que termina donde empieza esta (si la hay). */
const pasoAnterior = (x: Pick<Ligada, 'marcas'>, m: Marca) => x.marcas.find((n) => n.tipo === 'A7' && n !== m && n.a === m.de)

/** La pieza que hace una flecha: la de su casilla, o en el segundo paso de una A7, la del primero. */
function piezaDe(x: Pick<Ligada, 'marcas' | 'fen'>, m: Marca) {
  const primero = m.tipo === 'A7' ? pasoAnterior(x, m) : undefined
  return new Chess(x.fen).get((primero ?? m).de as Square)
}

// ---------------------------------------------------------------- las reglas como revisiones (devuelven lo que no cumple)
function revisarR1(x: Ligada): string[] {
  const r: string[] = []
  const escritas = casillasEscritas(x.frase)
  for (const m of x.marcas) {
    const destino = m.en ?? m.a!
    if (!escritas.has(destino)) r.push(`${x.donde}: "${destino}" no está escrita en «${x.frase}»`)
    if (!m.de) continue
    const pieza = piezaDe(x, m)
    if (!pieza) r.push(`${x.donde}: no hay pieza en ${m.de}`)
    else if (!nombraLaPieza(x.frase, pieza.type, m.de, m.a!)) r.push(`${x.donde}: «${x.frase}» no nombra la pieza de ${m.de}`)
  }
  return r
}

function revisarR4(x: Ligada): string[] {
  const r: string[] = []
  const mio = x.mio
  const tablero = new Chess(x.fen)
  for (const m of x.marcas) {
    const d = `${x.donde}: ${JSON.stringify(m)}`
    const pieza = m.de ? tablero.get(m.de as Square) : undefined
    const mal = (que: string) => r.push(`${d}: ${que}`)
    switch (m.tipo) {
      case 'A1':
        // v1.3: la flecha de tu jugada no va en los datos; solo sale con la Respuesta (la pone el código)
        mal('la A1 no va en los datos')
        break
      case 'A2':
        if (pieza?.color !== mio) mal('la pieza no es tuya')
        else if (!ataca(x.fen, m.de!, m.a!, mio)) mal(`no ataca ni apoya ${m.a}`)
        break
      case 'A3':
        if (pieza?.color !== mio) mal('la pieza no es tuya')
        else if (!llega(x.fen, m.de!, m.a!, mio)) mal(`no puede llegar a ${m.a}`)
        break
      case 'A4':
        if (pieza?.color !== otro(mio)) mal('la pieza no es del rival')
        else if (!ataca(x.fen, m.de!, m.a!, otro(mio))) mal(`no controla ${m.a}`)
        break
      case 'A5':
        if (m.en) {
          if (!tablero.isAttacked(m.en as Square, otro(mio))) mal(`el rival no controla ${m.en}`)
          if (tablero.get(m.en as Square)) mal(`${m.en} no está vacía`)
        } else {
          if (pieza?.color !== mio) mal('la pieza no es tuya')
          else if (!llega(x.fen, m.de!, m.a!, mio)) mal(`tu pieza no podría ir a ${m.a}`)
          if (!casillas(x.marcas).some((n) => n.en === m.a)) mal('sin su casilla')
        }
        break
      case 'A6':
        if (!/^[a-h][1-8]$/.test(m.en ?? '')) mal('no es una casilla')
        break
      case 'A7': {
        // el primer paso, una jugada legal de esa pieza; el segundo, legal (o un ataque) desde ahí, con el primero hecho
        const primero = pasoAnterior(x, m)
        const ch = conTurno(x.fen, otro(mio))
        if (primero) {
          const p = ch.get(primero.de as Square)
          if (!p || p.color !== otro(mio)) {
            mal('el primer paso no sale de una pieza del rival')
            break
          }
          ch.remove(primero.de as Square)
          ch.put(p, primero.a as Square)
          const tras = ch.fen()
          if (!llega(tras, m.de!, m.a!, otro(mio))) mal(`desde ${m.de} no llega ni ataca ${m.a}`)
        } else {
          if (pieza?.color !== otro(mio)) mal('la pieza no es del rival')
          else if (!ch.moves({ square: m.de as Square, verbose: true }).some((j) => j.to === m.a)) mal(`${m.de}→${m.a} no es una jugada legal`)
        }
        break
      }
      default:
        mal('sin tipo')
    }
  }
  return r
}

/** R7, en los datos: nada tuyo antes de tu jugada (la frase del rival solo trae lo del rival) y ninguna A1. */
function revisarR7Datos(todas: Ligada[]): string[] {
  const r: string[] = []
  for (const x of todas)
    for (const m of x.marcas) {
      if (m.tipo === 'A1') r.push(`${x.donde}: una A1 en los datos (solo sale con la Respuesta)`)
      if (x.donde.startsWith('rival ') && m.color !== 'rojo') r.push(`${x.donde}: una marca tuya antes de tu jugada (${JSON.stringify(m)})`)
    }
  return r
}

/** R8: ninguna A2 ni A4 entre casillas pegadas. */
const revisarR8 = (todas: Ligada[]): string[] =>
  todas.flatMap((x) => x.marcas.filter((m) => (m.tipo === 'A2' || m.tipo === 'A4') && m.de && m.a && pegadas(m.de, m.a)).map((m) => `${x.donde}: ${m.tipo} pegada ${m.de}→${m.a}`))

/** Las marcas que se ven juntas en cada momento (para R2 y R3). */
function porMomento(todas = TODAS): Map<string, { marcas: Marca[]; fen: string }> {
  const r = new Map<string, { marcas: Marca[]; fen: string }>()
  for (const x of todas)
    for (const g of x.grupos) {
      const v = r.get(g) ?? { marcas: [], fen: x.fenTablero }
      v.marcas.push(...x.marcas)
      r.set(g, v)
    }
  return r
}

// ---------------------------------------------------------------- los momentos de la lección, como se ven
const enTurno = (l: LineaCurso, vuelta: Vuelta, ply: number): EstadoCiclo => ({ ...empezar(l, vuelta), ply, momento: 'tuTurno' })
const despuesDe = (l: LineaCurso, vuelta: Vuelta, ply: number): EstadoCiclo => ({ ...empezar(l, vuelta), ply: ply + 1, momento: 'leer', ultima: ply })
const sinTipo = (ms: Marca[]) => ms.map((m) => `${m.en ? `[${m.en}]` : `${m.de}→${m.a}`}${m.tipo ? ` ${m.tipo}` : ''} ${m.color}${m.punteada ? ' punteada' : ''}`)

/**
 * Las jugadas mías que vienen después en la línea, desde la posición antes de la jugada `desde`, como (pieza, llegada):
 * a cada pieza se le sigue la pista desde su casilla en esa posición (otra cuenta que la del código, para revisarlo).
 */
function jugadasMiasQueVienen(l: LineaCurso, desde: number): Set<string> {
  const ch = posicion(l.jugadas, desde)
  const quien = new Map<string, string>()
  for (const fila of ch.board()) for (const p of fila) if (p) quien.set(p.square, p.square)
  const r = new Set<string>()
  for (let p = desde; p < l.jugadas.length; p++) {
    const j = ch.move(l.jugadas[p]!)
    const id = quien.get(j.from)
    if ((p % 2 === 0 ? 'w' : 'b') === l.lado && id) r.add(`${id}→${j.to}`)
    quien.delete(j.from)
    if (id) quien.set(j.to, id)
    else quien.delete(j.to)
    // el enroque mueve también la torre
    for (const [bandera, de, a] of [['k', 'h', 'f'], ['q', 'a', 'd']] as const) {
      const torre = quien.get(`${de}${j.from[1]}`)
      if (!j.flags.includes(bandera) || !torre) continue
      quien.delete(`${de}${j.from[1]}`)
      quien.set(`${a}${j.from[1]}`, torre)
    }
  }
  return r
}

describe('Correcciones · las marcas (reglas v1.3)', () => {
  it('el interruptor interno sale prendido: la torre dijo "publica" (C7)', () => {
    expect(MARCAS_NUEVAS_DE_ENTRADA).toBe(true)
  })

  it('hay marcas, y cada una está ligada a una frase que existe', () => {
    expect(TODAS.length).toBeGreaterThan(50)
    for (const x of TODAS) {
      expect(x.frase.length, x.donde).toBeGreaterThan(0)
      expect(x.marcas.length, x.donde).toBeGreaterThan(0)
    }
    // ningún campo trae marcas (ni descripciones) para más frases de las que tiene
    for (const [k, t] of Object.entries(c.rival)) expect(t.marcas?.length ?? 0, k).toBeLessThanOrEqual(frasesDe(t.texto).length)
    for (const [k, t] of Object.entries(c.mias))
      for (const campo of ['marcasDe', 'describe'] as const)
        for (const [nombre, m] of Object.entries(t[campo] ?? {})) expect(m.length, `${k} ${campo}.${nombre}`).toBeLessThanOrEqual(frasesDe((t as unknown as Record<string, string>)[nombre] ?? '').length)
  })

  it('R1 · cada marca nace de su frase: toda casilla marcada está escrita en ella, y toda flecha sale de una pieza que la frase nombra (el caso d6: no se marca)', () => {
    expect(TODAS.flatMap(revisarR1)).toEqual([])
    // el dibujo de Carlos: en la frase de 3.e5, f6 sí y d6 no
    const e5 = TODAS.find((x) => x.donde === 'rival «e4 c6 d4 d5 e5» frase 1')!
    expect(e5.marcas.map((m) => m.en ?? m.a)).toEqual(['f6', 'f6'])
    expect(JSON.stringify(e5.marcas)).not.toContain('d6')
  })

  it('R2 · máximo dos marcas nuevas por frase; las de una misma jugada se acumulan hasta cuatro', () => {
    for (const x of TODAS) expect(x.marcas.length, x.donde).toBeLessThanOrEqual(2)
    for (const [g, v] of porMomento()) expect(v.marcas.length, g).toBeLessThanOrEqual(4)
    // y en la lección, como se ve: cada momento de cada variante, en las dos vueltas
    for (const l of VARIANTES)
      for (const ply of misJugadas(l))
        for (const vuelta of ['aprender', 'practicar'] as const) {
          expect(marcasDelMomento(c, l, enTurno(l, vuelta, ply)).length, `${l.id} ${ply} ${vuelta}, antes`).toBeLessThanOrEqual(4)
          expect(marcasDelMomento(c, l, despuesDe(l, vuelta, ply)).length, `${l.id} ${ply} ${vuelta}, después`).toBeLessThanOrEqual(4)
        }
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

  it('R4 · cada marca dice algo cierto en el tablero (chess.js, en cada posición), también la A7: su primer paso es legal y el segundo, legal o un ataque desde ahí', () => {
    expect(TODAS.flatMap(revisarR4)).toEqual([])
    // hay A7, de uno y de dos pasos
    const a7 = TODAS.filter((x) => x.marcas.some((m) => m.tipo === 'A7'))
    expect(a7.length).toBeGreaterThanOrEqual(10)
    expect(a7.some((x) => x.marcas.some((m) => pasoAnterior(x, m)))).toBe(true)
  })

  it('R5 · colores y trazos solo de esta lista, y cada tipo con el suyo: punteada verde la A3, punteada roja la A7', () => {
    for (const x of TODAS)
      for (const m of x.marcas) {
        const d = `${x.donde}: ${JSON.stringify(m)}`
        expect(['verde', 'rojo'], d).toContain(m.color)
        expect(!!m.punteada, `${d}: punteadas solo la A3 y la A7`).toBe(m.tipo === 'A3' || m.tipo === 'A7')
        if (['A1', 'A2', 'A3'].includes(m.tipo!)) expect(m.color, d).toBe('verde')
        if (['A4', 'A5', 'A7'].includes(m.tipo!)) expect(m.color, d).toBe('rojo')
        if (['A1', 'A2', 'A3', 'A4', 'A7'].includes(m.tipo!)) expect(!!(m.de && m.a) && !m.en, `${d}: es flecha`).toBe(true)
        if (m.tipo === 'A6') expect(!!m.en && !m.de, `${d}: es casilla`).toBe(true)
      }
    expect(Object.keys(COLORES)).toEqual(['verde', 'rojo'])
    const usados = new Set(TODAS.flatMap((x) => x.marcas.map(colorDe)))
    for (const u of usados) expect(Object.values(COLORES)).toContain(u)
  })

  it('R5 · el código dibuja la A7 en rojo y de guiones, y la A3 en verde y de guiones; las sólidas, sin guiones', () => {
    const dibujo = (m: Marca) => renderToStaticMarkup(createElement(CapaMarcas, { marcas: [m], orientacion: 'black', fen: '8/8/8/8/8/8/8/8 w - - 0 1' }))
    const a7 = dibujo({ tipo: 'A7', de: 'h4', a: 'h5', color: 'rojo', punteada: true })
    expect(a7).toContain('data-tipo="A7"')
    expect(a7).toContain('data-punteada="si"')
    expect(a7).toContain(`stroke="${COLORES.rojo}"`)
    expect(a7).toContain('stroke-dasharray')
    expect(a7).not.toContain(COLORES.verde)
    const a3 = dibujo({ tipo: 'A3', de: 'e7', a: 'e6', color: 'verde', punteada: true })
    expect(a3).toContain(`stroke="${COLORES.verde}"`)
    expect(a3).toContain('stroke-dasharray')
    const a4 = dibujo({ tipo: 'A4', de: 'f3', a: 'd4', color: 'rojo' })
    expect(a4).not.toContain('stroke-dasharray')
    expect(a4).toContain(`fill="${COLORES.rojo}"`)
  })

  it('R6 · las flechas de caballo van en L, primero el tramo largo (g8→f6: baja a g6 y dobla a f6)', () => {
    // el dibujo de Carlos, con el tablero desde negras
    expect(puntosDeFlecha('g8', 'f6', 'black')).toEqual([
      [1.5, 7.5],
      [1.5, 5.5],
      [2.5, 5.5],
    ])
    expect(puntosDeFlecha('e5', 'c4', 'white')).toHaveLength(3)
    expect(puntosDeFlecha('c8', 'f5', 'black')).toHaveLength(2)
    for (const x of TODAS)
      for (const m of flechas(x.marcas)) {
        const pieza = piezaDe(x, m)
        expect(puntosDeFlecha(m.de!, m.a!, 'black').length, `${x.donde} ${m.de}→${m.a}`).toBe(pieza?.type === 'n' ? 3 : 2)
      }
  })

  it('R6 · y la L no dobla encima de una pieza (pase visual 1: parecía que esa pieza se movía)', () => {
    for (const [g, v] of porMomento()) {
      const tablero = new Chess(v.fen)
      const ocupada = (c: string) => !!tablero.get(c as Square)
      // como se dibujan: todas juntas, en su orden (puntosDeFlechas)
      const rutas = puntosDeFlechas(flechas(v.marcas) as { de: string; a: string }[], 'black', ocupada)
      for (const [k, m] of flechas(v.marcas).entries()) {
        const p = rutas[k]!
        if (p.length < 3) continue
        const esquina = caminosDeCaballo(m.de!, m.a!).find((cm) => centro(cm.esquina, 'black').join() === p[1]!.join())!.esquina
        expect(ocupada(esquina), `${g}: la L ${m.de}→${m.a} dobla en ${esquina}, que tiene una pieza`).toBe(false)
      }
    }
    // si la esquina del tramo largo tiene una pieza y la otra no, va por la otra (b8→c6 con la dama en b6: por c8)
    expect(puntosDeFlecha('b8', 'c6', 'black', (c) => c === 'b6')[1]).toEqual(centro('c8', 'black'))
    expect(puntosDeFlecha('b8', 'c6', 'black')[1]).toEqual(centro('b6', 'black'))
  })

  it('R6 · y dos flechas que se ven juntas no comparten tramo (pase visual de la v1.3: la ruta f3→e5→g6 se leía como una "T"; la L f3→d4 doblaba sobre la flecha de la dama)', () => {
    /** Los tramos de una flecha, de centro a centro de casilla vecina. */
    const tramos = (puntos: [number, number][]) =>
      puntos.slice(1).flatMap(([x1, y1], k) => {
        const [x0, y0] = puntos[k]!
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
        return Array.from({ length: n }, (_, s) => {
          const a = [x0 + ((x1 - x0) * s) / n, y0 + ((y1 - y0) * s) / n].join()
          const b = [x0 + ((x1 - x0) * (s + 1)) / n, y0 + ((y1 - y0) * (s + 1)) / n].join()
          return [a, b].sort().join('|')
        })
      })
    let revisados = 0
    for (const [g, v] of porMomento()) {
      const tablero = new Chess(v.fen)
      const fs = flechas(v.marcas) as { de: string; a: string }[]
      const rutas = puntosDeFlechas(fs, 'black', (c) => !!tablero.get(c as Square))
      // dos flechas de la misma pieza sí pueden salir juntas (8.♘f4 ataca g6 y h5: se lee como una horquilla)
      const vistos = new Map<string, { de: string; a: string }>()
      rutas.forEach((r, i) => {
        for (const t of tramos(r)) {
          const otra = vistos.get(t)
          if (otra && otra.de !== fs[i]!.de) expect.fail(`${g}: ${fs[i]!.de}→${fs[i]!.a} comparte un tramo con ${otra.de}→${otra.a}`)
          vistos.set(t, fs[i]!)
        }
      })
      revisados++
    }
    expect(revisados).toBeGreaterThan(40)
    // los dos casos del pase: la ruta del caballo de la Clásica (7.♘f3) y el plan de 4.c3
    const clasica = porMomento().get('tuTurno:e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7')!
    const [ida, vuelta] = puntosDeFlechas(flechas(clasica.marcas) as { de: string; a: string }[], 'black', (c) => !!new Chess(clasica.fen).get(c as Square))
    expect(ida![1]).toEqual(centro('f5', 'black'))
    expect(vuelta![1]).toEqual(centro('e6', 'black'))
    const c3 = porMomento().get('plan:avance-c3')!
    const rutasC3 = puntosDeFlechas(flechas(c3.marcas) as { de: string; a: string }[], 'black', (c) => !!new Chess(c3.fen).get(c as Square))
    const caballo = flechas(c3.marcas).findIndex((m) => m.de === 'f3')
    expect(rutasC3[caballo]![1]).toEqual(centro('f4', 'black'))
  })

  it('R7 · nada tuyo antes de tu jugada: en los datos, la frase del rival solo trae lo del rival y no hay ninguna A1', () => {
    expect(revisarR7Datos(TODAS)).toEqual([])
  })

  it('R7 · en Aprender, antes de jugar, solo hay marcas del rival; en Practicar, nada; la segunda Pista ilumina la pieza y la Respuesta es la A1', () => {
    for (const l of VARIANTES)
      for (const ply of misJugadas(l)) {
        const m = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
        const aprender = marcasDelMomento(c, l, enTurno(l, 'aprender', ply))
        expect(aprender.filter((x) => x.color !== 'rojo'), `${l.id} ${ply}: algo tuyo antes de jugar`).toEqual([])
        const e = enTurno(l, 'practicar', ply)
        expect(marcasDelMomento(c, l, e), `${l.id} ${ply}`).toEqual([])
        const p1 = pedirPista(e)
        expect(marcasDelMomento(c, l, p1)).toEqual([])
        const p2 = pedirPista(p1)
        expect(marcasDelMomento(c, l, p2)).toEqual([{ en: m.from, color: 'verde' }])
        expect(marcasDelMomento(c, l, pedirRespuesta(p2))).toEqual([{ tipo: 'A1', de: m.from, a: m.to, color: 'verde' }])
        // en Aprender, la Respuesta suma la A1 a lo del rival
        expect(marcasDelMomento(c, l, pedirRespuesta(enTurno(l, 'aprender', ply))).filter((x) => x.tipo === 'A1')).toEqual([{ tipo: 'A1', de: m.from, a: m.to, color: 'verde' }])
      }
    // en un «¿Y si…?», tampoco: se pregunta por la jugada que castiga
    for (const l of lineasDe(c).filter((x) => x.tipo === 'error'))
      for (const ply of misJugadas(l)) expect(marcasDelMomento(c, l, enTurno(l, 'aprender', ply)), `${l.id} ${ply}`).toEqual([])
  })

  it('R7 · mientras dura la línea, ninguna marca apunta a una jugada tuya que viene después (misma pieza, misma casilla); en el plan, sí', () => {
    let revisadas = 0
    for (const l of VARIANTES)
      for (const ply of misJugadas(l)) {
        const antes = jugadasMiasQueVienen(l, ply)
        const despues = jugadasMiasQueVienen(l, ply + 1)
        for (const vuelta of ['aprender', 'practicar'] as const) {
          for (const m of flechas(marcasDelMomento(c, l, enTurno(l, vuelta, ply)))) expect(antes.has(`${m.de}→${m.a}`), `${l.id} ${ply} ${vuelta}, antes: ${m.de}→${m.a}`).toBe(false)
          for (const m of flechas(marcasDelMomento(c, l, despuesDe(l, vuelta, ply)))) {
            expect(despues.has(`${m.de}→${m.a}`), `${l.id} ${ply} ${vuelta}, después: ${m.de}→${m.a} adelanta una jugada`).toBe(false)
            revisadas++
          }
        }
      }
    expect(revisadas).toBeGreaterThan(10)
    // el caso de Carlos: la Van der Wiel, en Practicar, después de 3...Af5, ya no marca ...e6 (es su siguiente jugada)
    const vdw = lineaPorId(c, 'v:avance-van-der-wiel')!
    expect(marcasDelMomento(c, vdw, despuesDe(vdw, 'practicar', 5))).toEqual([])
    expect(marcasDelMomento(c, vdw, despuesDe(vdw, 'aprender', 5))).toEqual([])
    // en la Bayoneta la línea no juega ...e6: ahí la flecha de "Después vas a jugar ...e6" sí va (una rama, A3)
    const bayoneta = lineaPorId(c, 'v:avance-bayoneta')!
    expect(marcasDelMomento(c, bayoneta, despuesDe(bayoneta, 'aprender', 5))).toEqual([{ tipo: 'A3', de: 'e7', a: 'e6', color: 'verde', punteada: true }])
    // en el plan del final, sí: la línea ya terminó (...Cc6 y ...cxd4 en la de 4.Cf3)
    const short = lineaPorId(c, 'v:avance-short')!
    const plan = marcasDelMomento(c, short, { ...empezar(short, 'aprender'), ply: short.jugadas.length, momento: 'plan' })
    expect(plan.map((m) => `${m.de}→${m.a}`)).toEqual(expect.arrayContaining(['b8→c6', 'c5→d4']))
  })

  it('R7 · en Practicar, la explicación de después no escribe ni describe una jugada tuya que la línea todavía te va a pedir (las 16 variantes, cada jugada)', () => {
    let jugadas = 0
    for (const l of VARIANTES)
      for (const ply of misJugadas(l)) {
        jugadas++
        const texto = explicacionDespues(c, l, 'practicar', ply).join(' ')
        for (const q of misJugadas(l).filter((p) => p > ply)) {
          const j = posicion(l.jugadas, q).move(l.jugadas[q]!)
          const es = sanAEspanol(j.san).replace(/[+#]/g, '')
          // escrita en la notación de adentro: "...e6", "...Cc6", o con su número, "4...h5" ("1...e6" de la Francesa no
          // es 4...e6); y el enroque, "0-0"
          const numero = Math.floor(q / 2) + 1
          if (es.startsWith('0-0')) expect(texto, `${l.id} ${ply}: dice ${es}`).not.toMatch(/(?<![\d-])0-0(?![\d-])/)
          else expect(texto, `${l.id} ${ply}: dice ...${es}, que viene después`).not.toMatch(new RegExp(`(?:(?<!\\d)|(?<![\\d])${numero})\\.\\.\\.${es.replace(/[+]/g, '\\+')}(?![a-h1-8])`))
        }
      }
    expect(jugadas).toBe(VARIANTES.reduce((n, l) => n + misJugadas(l).length, 0))
    // el caso de Carlos: después de 3...Af5 en la Van der Wiel, ni "Después vas a jugar ...e6" ni lo demás que lo nombra
    const vdw = lineaPorId(c, 'v:avance-van-der-wiel')!
    expect(explicacionDespues(c, vdw, 'practicar', 5)).toEqual(['Sacas tu alfil de casillas blancas fuera de la cadena de peones.'])
    // Aprender no cambia: ahí la jugada se dice de todos modos
    expect(explicacionDespues(c, vdw, 'aprender', 5).join(' ')).toContain('Después vas a jugar ...e6')
    // con su número, solo esa jugada: "(1...e6)" es la Francesa, no 4...e6 de la línea
    const short = lineaPorId(c, 'v:avance-short')!
    expect(explicacionDespues(c, short, 'practicar', 1).join(' ')).toContain('A diferencia de la Francesa (1...e6)')
    // y una descrita sin escribirla: "Tu alfil podrá esconderse en h7" (7...h5, antes de 8...Ah7)
    expect(explicacionDespues(c, vdw, 'practicar', 13).join(' ')).not.toContain('esconderse en h7')
    expect(explicacionDespues(c, vdw, 'aprender', 13).join(' ')).toContain('esconderse en h7')
  })

  it('R8 · solo lo que no se ve solo: ninguna A2 ni A4 entre casillas pegadas, salvo A5; y la lista de qué jugadas llevan marcas está al día', () => {
    expect(revisarR8(TODAS)).toEqual([])
    // la A5 sí, aunque la pieza esté pegada (se cumple en dos jugadas)
    expect(TODAS.some((x) => x.marcas.some((m) => m.tipo === 'A5'))).toBe(true)
    expect(readFileSync('iterations/v3/marcas-por-jugada.md', 'utf8')).toBe(listaDeMarcas(c))
  })

  it('el paso a paso acumula las marcas mientras la frase sigue con lo mismo, hasta que el tablero vuelve a mover; cada frase, después de su jugada', () => {
    const idea = c.piezas.idea.paginas[0]!.pasoAPaso!
    expect(marcasDelPaso(idea, 1)).toEqual([{ tipo: 'A3', de: 'd7', a: 'd5', color: 'verde', punteada: true }])
    expect(marcasDelPaso(idea, 2)).toEqual([])
    // "Desarrollas tu alfil por g7" y "Y el otro por f5": sigue con lo mismo, se acumulan
    const plan = (id: string) => c.variantes.find((v) => v.id === id)!.plan.pasoAPaso!
    expect(marcasDelPaso(plan('hillbilly'), 2).map((m) => `${m.de}→${m.a}`)).toEqual(['f8→g7', 'c8→f5'])
    // un paso sin marcas habla de otra cosa: no arrastra las de antes (pase visual de la v1.3: la flecha de ...cxd4 se
    // quedaba en "Tu alfil de h7 sigue mirando la diagonal hacia b1", sin su frase)
    expect(marcasDelPaso(plan('avance-van-der-wiel'), 3)).toEqual([])
    expect(marcasDelPaso(plan('hillbilly'), 3)).toEqual([])
    // ni las del otro lado: en el plan del Cambio, la casilla e5 del rival no lleva la verde de ...b5
    expect(marcasDelPaso(plan('cambio'), 3)).toEqual([{ tipo: 'A6', en: 'e5', color: 'rojo' }])
    // en ningún paso se ve una marca de un paso de antes sin que el de ahora traiga marcas de su mismo lado
    for (const pa of [...(['idea', 'estructura', 'repaso'] as const).flatMap((p) => c.piezas[p].paginas.map((pg) => pg.pasoAPaso!)), ...c.variantes.map((v) => v.plan.pasoAPaso!)])
      pa.pasos.forEach((p, i) => {
        const lados = new Set((p.marcas ?? []).map((m) => m.color))
        for (const m of marcasDelPaso(pa, i)) expect(lados.has(m.color), `«${p.frase}»: ${JSON.stringify(m)}`).toBe(true)
      })
  })

  it('las reglas atrapan errores metidos a propósito: una A1 en "Te toca", una A4 pegada y una A7 ilegal', () => {
    const malo = structuredClone(c) as DatosCurso
    malo.mias['e4 c6 d4 d5 e5 Bf5']!.marcasDe = { hace: [[{ tipo: 'A1', de: 'c8', a: 'f5', color: 'verde' }]] }
    malo.rival['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7 h5']!.marcas = [[{ tipo: 'A4', de: 'h5', a: 'g6', color: 'rojo' }]]
    malo.rival['e4 c6 d4 d5 e5 Bf5 Nc3 e6 g4 Bg6 Nge2 c5 h4']!.marcas = [[{ tipo: 'A7', de: 'h4', a: 'h6', color: 'rojo', punteada: true }]]
    const todas = ligadas(malo)
    expect(revisarR7Datos(todas)).toEqual([expect.stringContaining('una A1 en los datos')])
    expect(todas.flatMap(revisarR4)).toEqual(expect.arrayContaining([expect.stringContaining('la A1 no va en los datos'), expect.stringContaining('h4→h6 no es una jugada legal')]))
    expect(revisarR8(todas)).toEqual([expect.stringContaining('A4 pegada h5→g6')])
    // y la pantalla no enseña la A1 de "Te toca" aunque estuviera en los datos (antes de jugar, solo lo del rival)
    const l = lineaPorId(malo, 'v:avance-short')!
    expect(marcasDelMomento(malo, l, enTurno(l, 'aprender', 5)).filter((m) => m.tipo === 'A1')).toEqual([])
  })
})

describe('Las marcas · los ejemplos de referencia (§4 de las reglas v1.3)', () => {
  const linea = (id: string) => lineaPorId(c, id)!
  /** Lo que se ve en Aprender en mi turno de la jugada `ply` (las de la frase del rival de antes). */
  const antesDe = (id: string, ply: number) => sinTipo(marcasDelMomento(c, linea(id), enTurno(linea(id), 'aprender', ply)))
  const fraseRival = (id: string, ply: number) => textoRival(c, linea(id).jugadas, ply)!.texto

  it('1 · su dibujo (A5): en 3.e5, f6 en rojo y la L roja g8→f6, sin d6 y sin la verde de 3...♗f5; son dos marcas', () => {
    expect(fraseRival('v:avance-short', 4)).toBe('Blancas cierra el centro con 3.e5: gana espacio y le quita la casilla f6 a tu caballo.')
    expect(antesDe('v:avance-short', 5)).toEqual(['[f6] A5 rojo', 'g8→f6 A5 rojo'])
    const fl = marcasDelMomento(c, linea('v:avance-short'), enTurno(linea('v:avance-short'), 'aprender', 5)).find((m) => m.de === 'g8')!
    expect(puntosDeFlecha(fl.de!, fl.a!, 'black')).toHaveLength(3)
  })

  it('2 · 6.♘f3 en el Avance 4.c3 (A4): la L roja f3→d4; se queda', () => {
    expect(fraseRival('v:avance-c3', 10)).toBe('Blancas suma un defensor más de d4: el caballo.')
    expect(antesDe('v:avance-c3', 11)).toEqual(['f3→d4 A4 rojo'])
  })

  it('3 · 5.g4 en la Van der Wiel: sin marca, el peón está pegado a tu alfil', () => {
    expect(fraseRival('v:avance-van-der-wiel', 8)).toContain('Blancas echa a tu alfil con el peón de g')
    expect(antesDe('v:avance-van-der-wiel', 9)).toEqual([])
  })

  it('4 · 6.♘ge2 en la Van der Wiel (A7): las rojas punteadas e2→f4 y f4→g6', () => {
    expect(fraseRival('v:avance-van-der-wiel', 10)).toBe('Blancas lleva el otro caballo a f4 para seguir persiguiendo a tu alfil de g6.')
    expect(antesDe('v:avance-van-der-wiel', 11)).toEqual(['e2→f4 A7 rojo punteada', 'f4→g6 A7 rojo punteada'])
  })

  it('5 · 7.h4 en la Van der Wiel (A7): la roja punteada h4→h5, sin la verde de 7...h5; con el peón en h5, las cinco casillas del alfil quedan atacadas', () => {
    expect(fraseRival('v:avance-van-der-wiel', 12)).toBe('Blancas empuja h4: si su peón llega a h5, tu alfil de g6 se queda sin casillas.')
    expect(antesDe('v:avance-van-der-wiel', 13)).toEqual(['h4→h5 A7 rojo punteada'])
    const ch = posicion(linea('v:avance-van-der-wiel').jugadas, 13)
    ch.remove('h4')
    ch.put({ type: 'p', color: 'w' }, 'h5')
    const salidas = ch.moves({ square: 'g6', verbose: true }).map((m) => m.to)
    expect(salidas).toHaveLength(5)
    for (const s of salidas) expect(ch.isAttacked(s, 'w'), s).toBe(true)
  })

  it('6 · 6...♗g4 en el Cambio (A2): la verde g4→d1 solo en Practicar, después de jugar; en Aprender es "Te toca" y no lleva marcas tuyas', () => {
    const l = linea('v:cambio')
    expect(sinTipo(marcasDelMomento(c, l, despuesDe(l, 'practicar', 11)))).toEqual(['g4→d1 A2 verde'])
    expect(explicacionDespues(c, l, 'practicar', 11)[0]).toBe('Sacas el alfil antes de ...e6 y atacas a la dama de d1.')
    expect(antesDe('v:cambio', 11)).toEqual(['f4→c7 A4 rojo'])
    expect(marcasDelMomento(c, l, despuesDe(l, 'aprender', 11))).toEqual([])
  })
})
