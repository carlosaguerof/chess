import { beforeEach, describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { BASE } from '../../src/base/base.ts'
import { CURSOS_NUEVOS, esOpcional, jugadasDeLaBaseEn, leccionIdDe, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { continuar, empezar, intentar, jugarRival, progreso, reintentar, type EstadoCiclo } from '../../src/curso/ciclo.ts'
import { fotosDePasos } from '../../src/curso/pasos.ts'
import { posicion } from '../../src/curso/textos.ts'
import { registrarPasoCurso } from '../../src/registro/eventos.ts'
import { jugadasFalladas } from '../../src/registro/refuerza.ts'
import { lineasDe as lineasDeFavorita, repertorioCompleto } from '../../src/aprender/favoritas.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { LECCIONES_ESCANDINAVA, pasarEscandinava } from '../../src/aprender/migracion.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'

/**
 * El curso de la captura contra la Escandinava, por estructuras (2026-11-25; `specs/cursos.md` §6). Las reglas de
 * contenido que valen para todo curso corren sobre este también (`vite.config.ts`, proyecto "curso escandinava"); aquí,
 * lo propio: el mapa contra las líneas (chess.js), la tabla de obligatorio y opcional contra los datos, el ciclo con sus
 * líneas, Refuerza y el Repaso sin las opcionales, y la migración de lo guardado.
 */
const c = CURSOS_NUEVOS['escandinava:w']!
const linea = (id: string) => lineaPorId(c, `v:${id}`)!

const CLAVADA = 'La clavada'
const FRENTE = 'La dama al frente'
const CASA = 'La dama en casa'
const GRANDE = 'El centro grande'
const TABLA: [string, string, boolean, [string, string][]][] = [
  ['La base', 'base', false, [['clasica', CLAVADA], ['valenciana', CASA], ['gipslis', GRANDE]]],
  ['Las que más te van a salir', 'frecuentes', false, [['lasker', CLAVADA]]],
  ['Opcional', 'opcional', true, [['bronstein', FRENTE], ['schiller-pytel', FRENTE], ['marshall', GRANDE], ['richter', GRANDE]]],
]

/** Las jugadas de una línea, con lo que hizo cada una. */
function jugadas(l: Pick<LineaCurso, 'jugadas'>): Move[] {
  const ch = new Chess()
  return l.jugadas.map((s) => ch.move(s))
}

/**
 * La pregunta del mapa, con chess.js sobre toda la línea: ¿dónde quedó la pieza que recuperó el peón de d5? La primera
 * captura de negras en d5 dice la pieza; si es la dama, su siguiente jugada dice a dónde se fue.
 */
function formaDe(l: Pick<LineaCurso, 'jugadas'>): string | undefined {
  const m = jugadas(l)
  const i = m.findIndex((x) => x.color === 'b' && x.to === 'd5' && !!x.captured)
  if (i < 0) return undefined
  if (m[i]!.piece === 'n') return GRANDE
  if (m[i]!.piece !== 'q') return undefined
  const sig = m.slice(i + 1).find((x) => x.color === 'b')
  if (sig?.piece !== 'q') return undefined
  return { a5: CLAVADA, d6: FRENTE, d8: CASA }[sig.to as string]
}

/**
 * La tabla de obligatorio y opcional (iterations/v4/mapa-escandinava.md): las partidas de lichess (CC0, septiembre de
 * 2026, Rapid) de 1.e4 d5, en las dos bandas; `null` es "sin datos" (ninguna secuencia con 3 partidas o más).
 */
const FORMAS: Record<string, [number | null, number | null]> = { [CLAVADA]: [14.2, 24.8], [CASA]: [13.2, 19.9], [GRANDE]: [null, 7.2], [FRENTE]: [2.9, 2.5] }
const LECCIONES: Record<string, [number | null, number | null]> = {
  clasica: [null, 2.5], valenciana: [13.2, 19.9], gipslis: [null, 3.0], lasker: [null, 2.2],
  bronstein: [null, 0.8], 'schiller-pytel': [null, 0.2], marshall: [null, null], richter: [null, null],
}
const max = (x: [number | null, number | null]) => Math.max(x[0] ?? 0, x[1] ?? 0)

describe('El curso de la Escandinava · las lecciones', () => {
  it('es el curso de la tarjeta de siempre (escandinava:w), con su nombre', () => {
    expect(c.id).toBe('escandinava:w')
    expect(c.color).toBe('w')
    expect(c.nombre).toBe('Contra la Escandinava')
    expect(c.fichasDe).toBeUndefined()
    expect(cursos().find((x) => x.id === 'escandinava:w')?.nombre).toBe('Contra la Escandinava')
  })

  it('las secciones, sus lecciones y su orden, tal como la tabla', () => {
    expect(c.secciones!.map((s) => [s.titulo, s.id, !!s.opcional, s.variantes])).toEqual(TABLA.map(([t, id, o, ls]) => [t, id, o, ls.map(([x]) => x)]))
    expect(c.variantes.map((v) => [v.id, v.estructura])).toEqual(TABLA.flatMap(([, , , ls]) => ls))
    expect(c.secciones![2]!.nota).toBe('No cuentan para terminar el curso.')
    expect(obligatorias(c)).toHaveLength(4)
    expect(opcionales(c)).toHaveLength(4)
    // la primera empieza desde 1.e4; las demás, con el tronco 1.e4 d5 2.exd5 en el tablero
    expect(c.variantes.map((v) => v.desde)).toEqual([0, 3, 3, 3, 3, 3, 3, 3])
  })

  it('una lección por cada variante de la base que no se separa de otra por una jugada tuya (nota 2 del orchestrator)', () => {
    // las 10 de b696d89, con blancas: la Grünfeld (6.Ce5) y la Transposición Panov (3.c4) se separan por tu jugada
    const viejas = ['da5-clasica', 'da5-grunfeld', 'da5-lasker', 'dd6-bronstein', 'dd6-schiller-pytel', 'dd8-valenciana', 'moderna-marshall', 'moderna-gipslis', 'moderna-richter', 'moderna-panov']
    const ap = BASE.aperturas.find((a) => a.id === 'escandinava')!
    for (const v of viejas) {
      const nueva = LECCIONES_ESCANDINAVA[v]
      if (v === 'da5-grunfeld' || v === 'moderna-panov') {
        expect(nueva, v).toBeUndefined()
        continue
      }
      // la lección nueva empieza con la misma fila de lichess y sigue con su continuación
      const vieja = ap.variantes.find((x) => x.id === v)!.jugadas
      const leccion = c.variantes.find((x) => x.base === nueva)!
      expect(ap.variantes.find((x) => x.id === nueva)!.jugadas.slice(0, vieja.length), v).toEqual(vieja)
      expect(leccion, v).toBeDefined()
    }
    // y sus jugadas siguen en la base, en azul: 6.Ce5 en la Clásica, 3.c4 contra 2...Cf6
    const clasica = linea('clasica')
    expect(jugadasDeLaBaseEn(posicion(clasica.jugadas, 10).fen()).has('Ne5')).toBe(true)
    expect(jugadasDeLaBaseEn(posicion(linea('gipslis').jugadas, 4).fen()).has('c4')).toBe(true)
  })

  it('una sola jugada tuya por posición: si dos lecciones llegan a la misma posición, enseñan la misma jugada', () => {
    const tuya = new Map<string, string>()
    for (const l of lineasDe(c).filter((x) => x.tipo === 'variante'))
      for (const ply of misJugadas(l)) {
        const k = posicion(l.jugadas, ply).fen().split(' ').slice(0, 4).join(' ')
        expect(tuya.get(k) ?? l.jugadas[ply], `${l.id} ${ply}`).toBe(l.jugadas[ply])
        tuya.set(k, l.jugadas[ply]!)
      }
  })

  it('máximo 8 jugadas tuyas por lección, y la línea termina en una jugada tuya', () => {
    for (const l of lineasDe(c).filter((x) => x.tipo === 'variante')) {
      expect(misJugadas(l).length, l.id).toBeLessThanOrEqual(8)
      expect(l.jugadas.length % 2, `${l.id}: termina en una jugada de blancas`).toBe(1)
    }
  })
})

describe('El curso de la Escandinava · el mapa (chess.js)', () => {
  it('cada etiqueta dice lo que pasa en su línea, mirando toda la línea', () => {
    for (const v of c.variantes) expect(formaDe(linea(v.id)), v.id).toBe(v.estructura)
  })

  it('la etiqueta se sostiene hasta el final: la pieza que recuperó sigue en juego, y en el centro grande c4 echa al caballo', () => {
    for (const v of c.variantes) {
      const m = jugadas(linea(v.id))
      const fin = posicion(linea(v.id).jugadas, linea(v.id).jugadas.length)
      if (v.estructura === GRANDE) {
        // el caballo que recuperó en d5 se va de ahí porque c4 lo ataca, y quedan c4 y d4
        const c4 = m.findIndex((x) => x.color === 'w' && x.san === 'c4')
        expect(c4, v.id).toBeGreaterThan(0)
        expect(fin.get('c4'), v.id).toMatchObject({ type: 'p', color: 'w' })
        expect(fin.get('d4'), v.id).toMatchObject({ type: 'p', color: 'w' })
        expect(fin.findPiece({ type: 'p', color: 'b' }).some((s) => s[0] === 'd'), `${v.id}: negras sin peón en la columna d`).toBe(false)
      } else expect(fin.findPiece({ type: 'q', color: 'b' }), v.id).toHaveLength(1)
    }
  })

  it('juegas d4 en todas las lecciones, y en ninguna queda tu peón de e', () => {
    for (const v of c.variantes) {
      const m = jugadas(linea(v.id))
      expect(m.some((x) => x.color === 'w' && x.san === 'd4'), v.id).toBe(true)
      expect(posicion(linea(v.id).jugadas, linea(v.id).jugadas.length).findPiece({ type: 'p', color: 'w' }).some((s) => s[0] === 'e'), v.id).toBe(false)
    }
  })

  it('la clavada: con la dama en a5 y d4 jugado, tu caballo de c3 no se puede mover; con Ad2, sí', () => {
    const l = linea('clasica')
    const tras4 = posicion(l.jugadas, 7)
    const conTurno = new Chess(tras4.fen().replace(' b ', ' w '))
    expect(conTurno.moves({ square: 'c3' })).toEqual([])
    const tras7 = posicion(l.jugadas, 13)
    expect(new Chess(tras7.fen().replace(' b ', ' w ')).moves({ square: 'c3' }).length).toBeGreaterThan(0)
  })

  it('El mapa: cada respuesta tiene su nombre, y el paso a paso la muestra en el tablero', () => {
    const p = c.piezas.estructura.paginas[0]!
    expect(p.subtitulo).toBe('El mapa')
    expect(p.texto[0]).toContain('¿dónde quedó la pieza que lo recuperó?')
    for (const [q, n] of [['La dama en a5', 'la clavada'], ['La dama en d6', 'la dama al frente'], ['La dama de vuelta en d8', 'la dama en casa'], ['El caballo en d5', 'el centro grande']]) expect(p.texto[1], q).toContain(`${q}: ${n}`)
    const fotos = fotosDePasos(p.pasoAPaso!)
    const cuando = (texto: string) => new Chess(fotos[p.pasoAPaso!.pasos.findIndex((x) => x.frase.startsWith(texto))]!.fen)
    expect(cuando('La clavada').get('a5')).toMatchObject({ type: 'q', color: 'b' })
    expect(cuando('La dama al frente').get('d6')).toMatchObject({ type: 'q', color: 'b' })
    expect(cuando('La dama en casa').get('d8')).toMatchObject({ type: 'q', color: 'b' })
    expect(cuando('El centro grande').get('d5')).toMatchObject({ type: 'n', color: 'b' })
    // el jaque: el alfil lo tapa
    expect(cuando('Si la dama da jaque').get('e2')).toMatchObject({ type: 'b', color: 'w' })
    expect(c.piezas.estructura.paginas.map((x) => x.subtitulo)).toEqual(['El mapa', CLAVADA, FRENTE, CASA, GRANDE])
  })

  it('las introducciones abren con la forma y no nombran una jugada tuya', () => {
    for (const v of c.variantes) {
      expect(v.intro, v.id).toMatch(new RegExp(`^Estás en ${v.estructura!.toLowerCase()}:`))
      const l = linea(v.id)
      for (const ply of misJugadas(l)) {
        const j = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
        // ni la jugada ni su casilla de llegada (en la introducción no hay capturas que den contexto)
        expect(v.intro, `${v.id}: ${j.san}`).not.toMatch(new RegExp(`\\b${j.to}\\b`))
      }
    }
  })
})

describe('El curso de la Escandinava · obligatorio y opcional', () => {
  it('la regla de §6 con los datos de este curso da la tabla: por forma, 5 % o más; por lección, 2 % o más', () => {
    const porForma = Object.entries(FORMAS).filter(([, x]) => max(x) >= 5).map(([f]) => f)
    const masJugada = (f: string) => c.variantes.filter((v) => v.estructura === f).sort((a, b) => max(LECCIONES[b.id]!) - max(LECCIONES[a.id]!))[0]!.id
    const base = porForma.map(masJugada)
    const frecuentes = c.variantes.map((v) => v.id).filter((id) => !base.includes(id) && max(LECCIONES[id]!) >= 2)
    expect(new Set(base)).toEqual(new Set(c.secciones![0]!.variantes))
    expect(frecuentes).toEqual(c.secciones![1]!.variantes)
    expect(c.variantes.filter((v) => esOpcional(c, v.id)).map((v) => v.id)).toEqual(c.variantes.map((v) => v.id).filter((id) => !base.includes(id) && !frecuentes.includes(id)))
    // los cortes caen en saltos: las formas, 7.2 y después 2.9; las lecciones, 2.2 y después 0.8
    expect(Object.values(FORMAS).map(max).filter((x) => x < 5)).toEqual([2.9])
    expect(Object.values(LECCIONES).map(max).filter((x) => x < 2).sort((a, b) => b - a)[0]).toBe(0.8)
  })
})

describe('El curso de la Escandinava · el ciclo, el Repaso y Refuerza', () => {
  beforeEach(() => instalarLocalStorage())
  const l = linea('clasica')
  const mov = (san: string, e: EstadoCiclo) => {
    const m = posicion(l.jugadas, e.ply).move(san)
    return { san: m.san, desde: m.from, hasta: m.to }
  }
  const hastaMiTurno = (e: EstadoCiclo) => {
    let x = e
    for (let i = 0; i < 10 && x.momento !== 'tuTurno' && x.momento !== 'fin' && x.momento !== 'plan'; i++) x = x.momento === 'rival' ? jugarRival(l, x) : continuar(l, x)
    return x
  }

  it('la primera lección empieza desde 1.e4, con blancas: la primera jugada es tuya', () => {
    let e = empezar(l)
    expect(e.momento).toBe('intro')
    expect(e.ply).toBe(0)
    e = hastaMiTurno(continuar(l, e))
    expect(e.ply).toBe(0)
    expect(progreso(l, e)).toEqual({ n: 1, m: 8 })
  })

  it('correcta, error y buena de otra línea: 6.Ac4 es la de la lección; 6.Ce5 (la Grünfeld) sale en azul, sin fallo', () => {
    let e = hastaMiTurno(empezar(l))
    for (const s of ['e4', 'exd5', 'Nc3', 'd4', 'Nf3']) e = hastaMiTurno(intentar(l, e, mov(s, e), { esperar: true }).estado)
    expect(e.ply).toBe(10)
    const buenas = jugadasDeLaBaseEn(posicion(l.jugadas, e.ply).fen())
    expect(intentar(l, e, mov('Bc4', e), { buenas }).resultado).toBe('correcta')
    const otra = intentar(l, e, mov('Ne5', e), { buenas })
    expect(otra.resultado).toBe('buena')
    expect(otra.estado.pasos[10]?.fallos ?? 0).toBe(0)
    const mal = intentar(l, e, mov('Qe2', e), { buenas })
    expect(mal.resultado).toBe('error')
    expect(mal.estado.pasos[10]!.fallos).toBe(1)
    expect(reintentar(mal.estado).momento).toBe('tuTurno')
  })

  it('un fallo en Practicar de una obligatoria sale en Refuerza; el de una opcional, no (nota 4: "que solo lo obligatorio salga en Repaso y Refuerza")', () => {
    const fallo = (lin: LineaCurso, ply: number) =>
      registrarPasoCurso({ fen: posicion(lin.jugadas, ply).fen(), esperada: lin.jugadas[ply]!, paso: { fallos: 1, pista: false, respuesta: false }, linea: lin.nombre, camino: lin.jugadas.slice(0, ply) })
    const clasica = fallo(l, 14) // 8.Cd5
    const bronstein = linea('bronstein')
    const opcional = fallo(bronstein, 10) // 6.g3, solo en la Bronstein
    const falladas = jugadasFalladas(repertorioCompleto(), [clasica, opcional])
    expect(falladas.some((j) => j.esperada === 'Nd5')).toBe(true)
    expect(falladas.some((j) => j.esperada === 'g3')).toBe(false)
    // las líneas de la base de la Escandinava con blancas que entran a Refuerza son las de las cuatro obligatorias
    const deLaEscandinava = repertorioCompleto().lineas.filter((x) => x.apertura === 'escandinava' && x.color === 'w').map((x) => x.claveBase).sort()
    expect(deLaEscandinava).toEqual(obligatorias(c).map((v) => `escandinava/${v.base}`).sort())
    // y la apertura sigue completa en la base (la guía y los bots no cambian)
    expect(lineasDeFavorita('escandinava:w').length).toBeGreaterThan(deLaEscandinava.length)
  })

  it('el Repaso lleva solo las cuatro obligatorias, con su id de siempre', () => {
    const curso = cursos().find((x) => x.id === 'escandinava:w')!
    expect(curso.lecciones.map((x) => x.id)).toEqual(obligatorias(c).map((v) => leccionIdDe(c, v)))
    expect(curso.lecciones.map((x) => x.id)).toContain('escandinava:w/w:escandinava/curso-valenciana')
  })
})

describe('El curso de la Escandinava · lo guardado de antes', () => {
  it('lo del Repaso de una lección vieja pasa a la lección nueva de la misma línea, sin quedar dos veces', () => {
    const viejo = { 'escandinava:w/w:escandinava/dd8-valenciana': { escalon: 2 }, 'italiana:w/w:italiana/paris': { escalon: 1 } }
    const nuevo = pasarEscandinava(viejo)
    expect(nuevo['escandinava:w/w:escandinava/curso-valenciana']).toEqual({ escalon: 2 })
    expect(nuevo['escandinava:w/w:escandinava/dd8-valenciana']).toBeUndefined()
    expect(nuevo['italiana:w/w:italiana/paris']).toEqual({ escalon: 1 })
    // si la nueva ya tenía algo, la vieja se queda como estaba
    const ya = pasarEscandinava({ 'escandinava:w/w:escandinava/da5-clasica': { escalon: 1 }, 'escandinava:w/w:escandinava/curso-clasica': { escalon: 3 } })
    expect(ya['escandinava:w/w:escandinava/curso-clasica']).toEqual({ escalon: 3 })
    expect(ya['escandinava:w/w:escandinava/da5-clasica']).toEqual({ escalon: 1 })
  })

  it('cada lección vieja va a una lección del curso; la Grünfeld y el Panov se quedan guardados y dejan de salir', () => {
    const ids = new Set(c.variantes.map((v) => v.base))
    for (const nueva of Object.values(LECCIONES_ESCANDINAVA)) expect(ids.has(nueva), nueva).toBe(true)
    const r = pasarEscandinava({ 'escandinava:w/w:escandinava/da5-grunfeld': { escalon: 2 } })
    expect(r).toEqual({ 'escandinava:w/w:escandinava/da5-grunfeld': { escalon: 2 } })
  })
})
