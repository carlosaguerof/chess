import { beforeEach, describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { CURSOS_NUEVOS, esOpcional, leccionIdDe, leccionesDe, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales, soloObligatorias, textoMio } from '../../src/curso/datos.ts'
import { continuar, empezar, intentar, jugarRival, progreso, type EstadoCiclo } from '../../src/curso/ciclo.ts'
import { adelanta } from '../../src/curso/adelantar.ts'
import { posicion } from '../../src/curso/textos.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'
import { BASE } from '../../src/base/base.ts'
import { MIS_APERTURAS } from '../../src/aprender/interruptores.ts'
import { repertorioCompleto } from '../../src/aprender/favoritas.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { jugadasFalladas } from '../../src/registro/refuerza.ts'
import { registrarPasoCurso } from '../../src/registro/eventos.ts'
import { leerRegistro } from '../../src/registro/almacen-registro.ts'
import { LECCIONES_ESLAVA, pasarEslavaYOtrosNegras } from '../../src/aprender/migracion.ts'
import { frasesDe } from '../../src/curso/textos.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'

/**
 * La Eslava por estructuras (2026-11-25, `specs/cursos.md` §6): lo propio de este curso. Las reglas de contenido que valen
 * para todo curso corren sobre él en `vite.config.ts` (proyecto "curso eslava").
 */
const c = CURSOS_NUEVOS['eslava:b']!
const VARIANTES = lineasDe(c).filter((l) => l.tipo === 'variante')
const linea = (id: string) => lineaPorId(c, `v:${id}`)!
const jugadas = (l: LineaCurso): Move[] => {
  const ch = new Chess()
  return l.jugadas.map((s) => ch.move(s))
}

const TENSION = 'Nadie cambia peones'
const CAMBIO = 'Blancas cambia en d5'
const ALEKHINE = 'Tomas en c4 y lo defiendes con ...b5'
const CHECA = 'Tomas en c4, pero blancas ya jugó a4'

/** Qué forma dicen las jugadas de una línea, mirando toda la línea (como `curso-estructuras.test.ts`). */
function formaDe(l: LineaCurso): string[] {
  const m = jugadas(l)
  const r: string[] = []
  if (m.some((x, i) => x.color === 'w' && x.from === 'c4' && x.to === 'd5' && m[i + 1]?.from === 'c6' && m[i + 1]?.to === 'd5')) r.push(CAMBIO)
  const tomas = m.findIndex((x) => x.color === 'b' && x.from === 'd5' && x.to === 'c4')
  if (tomas >= 0) {
    const b5 = m.findIndex((x, i) => i > tomas && x.color === 'b' && x.from === 'b7' && x.to === 'b5')
    const a4 = m.findIndex((x, i) => i > tomas && x.color === 'w' && x.from === 'a2' && x.to === 'a4')
    if (b5 >= 0 && (a4 < 0 || a4 > b5)) r.push(ALEKHINE)
    if (a4 >= 0 && (b5 < 0 || b5 > a4)) r.push(CHECA)
  }
  // nadie cambió peones en el centro (en c4 ni en d5): fuera del centro sí puede haber capturas (7.Cxg6 hxg6)
  const fin = posicion(l.jugadas, l.jugadas.length)
  const peon = (sq: string, color: 'w' | 'b') => fin.get(sq as never)?.type === 'p' && fin.get(sq as never)?.color === color
  if (peon('c4', 'w') && peon('d4', 'w') && peon('c6', 'b') && peon('d5', 'b') && !m.some((x) => x.captured && (x.to === 'c4' || x.to === 'd5'))) r.push(TENSION)
  return r
}

describe('La Eslava · el curso', () => {
  it('es la tarjeta de la Eslava con negras, con el nombre de la guía', () => {
    expect(MIS_APERTURAS).toContain('eslava:b')
    expect(c.id).toBe('eslava:b')
    expect(c.nombre).toBe('Defensa Eslava')
    expect(c.color).toBe('b')
    expect(c.fichasDe).toBeUndefined()
  })

  it('una lección por respuesta del rival: las 13 variantes de la base menos las dos que son otra jugada tuya, que van en buenas', () => {
    const base = BASE.aperturas.find((a) => a.id === 'eslava')!.variantes.filter((v) => !v.id.startsWith('curso-'))
    expect(base).toHaveLength(13)
    const lecciones = c.variantes.map((v) => v.base.replace(/^curso-/, ''))
    expect(base.map((v) => v.id).filter((id) => !lecciones.includes(id)).sort()).toEqual(['semieslava', 'tranquila-clavada'])
    // 4...e6 (Semieslava) y 4...Ag4 (Clavada): buenas en la misma posición, en azul
    expect(c.mias['d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4']!.buenas).toContain('e6')
    expect(c.mias['d4 d5 c4 c6 Nf3 Nf6 e3 Bf5']!.buenas).toContain('Bg4')
    // una sola jugada tuya por posición: dos lecciones que llegan a la misma posición enseñan la misma jugada
    const tuya = new Map<string, string>()
    for (const l of VARIANTES)
      for (const p of misJugadas(l)) {
        const k = posicion(l.jugadas, p).fen().split(' ').slice(0, 4).join(' ')
        expect(tuya.get(k) ?? l.jugadas[p], `${l.id} ${p}`).toBe(l.jugadas[p])
        tuya.set(k, l.jugadas[p]!)
      }
  })

  it('las secciones: La base, una por forma (la Checa por el gate), y lo demás opcional; sin "Las que más te van a salir"', () => {
    expect(c.secciones!.map((s) => [s.id, s.titulo, !!s.opcional])).toEqual([
      ['base', 'La base', false],
      ['opcional', 'Opcional', true],
    ])
    expect(obligatorias(c).map((v) => [v.id, v.estructura])).toEqual([
      ['checa', CHECA],
      ['tranquila-schallopp', TENSION],
      ['cambio', CAMBIO],
      ['cc3', ALEKHINE],
    ])
    expect(opcionales(c).map((v) => v.id)).toEqual(['checa-clasica', 'alekhine-e3', 'checa-carlsbad', 'cambio-trifunovic', 'moderna-g3', 'geller', 'diemer'])
    // el orden de las variantes es el de las secciones, y la primera empieza desde 1.d4
    expect(c.variantes.map((v) => v.id)).toEqual(c.secciones!.flatMap((s) => s.variantes))
    expect(c.variantes[0]!.desde).toBe(0)
    for (const v of c.variantes.slice(1)) expect(v.desde, v.id).toBe(4)
  })

  it('cada etiqueta del mapa cuadra con las jugadas de su línea, mirando toda la línea; el Diemer, en ninguna', () => {
    for (const l of VARIANTES) {
      const v = l.variante!
      expect(formaDe(l), l.id).toEqual(v.estructura ? [v.estructura] : [])
    }
    expect(linea('diemer').variante!.estructura).toBeUndefined()
  })

  it('la regla que decide: con c4 en pie y tu caballo en f6, si blancas ya jugó e3 sacas el alfil; sin e3 (y sin g3), tomas en c4', () => {
    let revisadas = 0
    const vistas = { alfil: 0, tomas: 0 }
    for (const l of VARIANTES)
      for (const p of misJugadas(l)) {
        const pos = posicion(l.jugadas, p)
        const pieza = (sq: string) => pos.get(sq as never)
        const tension = pieza('c4')?.type === 'p' && pieza('c4')?.color === 'w' && pieza('d5')?.type === 'p' && pieza('f6')?.type === 'n' && pieza('c8')?.type === 'b'
        if (!tension) continue
        revisadas++
        const tuya = l.jugadas[p]!
        const e3 = pieza('e3')?.type === 'p' && pieza('e3')?.color === 'w'
        const g3 = pieza('g3')?.type === 'p' && pieza('g3')?.color === 'w'
        if (e3) expect(['Bf5', 'Bg4'], `${l.id} ${p}`).toContain(tuya)
        else if (!g3) expect(tuya, `${l.id} ${p}`).toBe('dxc4')
        if (e3) vistas.alfil++
        else if (!g3) vistas.tomas++
      }
    // las once líneas pasan por esa decisión 7 veces: la Tranquila (con e3) y las cinco de 4.Cc3 y 3.Cc3 (sin e3)
    expect(revisadas).toBe(7)
    expect(vistas).toEqual({ alfil: 1, tomas: 5 })
  })

  it('cada introducción abre con su frase: nombra su forma (o que queda fuera del mapa) y no dice ninguna jugada tuya de la línea', () => {
    const nombre: Record<string, RegExp> = { [TENSION]: /^Estás en la Tensión/, [CAMBIO]: /^Estás en el Cambio/, [ALEKHINE]: /^Estás en la Alekhine/, [CHECA]: /^Estás en la Checa/ }
    for (const l of VARIANTES) {
      const v = l.variante!
      const frase = frasesDe(v.intro)[0]!
      expect(frase, l.id).toMatch(v.estructura ? nombre[v.estructura]! : /^Esta línea queda fuera del mapa: blancas /)
      expect(adelanta(l, l.desde - 1, frase), l.id).toEqual([])
      expect(frase, l.id).not.toContain('...')
      const m = jugadas(l)
      for (const p of misJugadas(l)) expect(frase, `${l.id}: ${m[p]!.san}`).not.toMatch(new RegExp(`\\b${m[p]!.to}\\b`))
    }
  })

  it('"encerrado" (2...e6): al alfil de c8 solo le queda d7; con 2...c6, tiene cinco casillas', () => {
    const casillas = (j: string[]) => new Chess(posicion(j, j.length).fen().replace(' w ', ' b ')).moves({ square: 'c8', verbose: true }).map((m) => m.to)
    expect(casillas(['d4', 'd5', 'c4', 'e6', 'Nc3'])).toEqual(['d7'])
    expect(casillas(['d4', 'd5', 'c4', 'c6', 'Nc3']).sort()).toEqual(['d7', 'e6', 'f5', 'g4', 'h3'])
  })
})

/**
 * La tabla de obligatorio y opcional contra los datos (`iterations/v4/mapa-eslava.md`): partidas Rapid de lichess,
 * septiembre de 2026, con la Eslava como raíz (las partidas con 1.d4 d5 2.c4). `null` es "sin datos" (menos de 3 partidas
 * por jugada), no cero. Una banda con menos de 10 partidas no decide: pesa la otra (nota del orchestrator, 2026-11-25).
 */
const ESTRUCTURAS: Record<string, [number | null, number | null]> = {
  // [600–1000, 1000–1400]
  [ALEKHINE]: [25.9, 31.3],
  [TENSION]: [7.8, 17.8],
  [CAMBIO]: [9.6, 7.8],
  [CHECA]: [null, null],
}
const LECCIONES: Record<string, [number, number, number, number]> = {
  // [% 600–1000, n, % 1000–1400, n]
  checa: [0, 0, 0, 0],
  'tranquila-schallopp': [0, 0, 2.2, 9],
  cambio: [14.4, 13, 12.3, 135],
  cc3: [35.6, 32, 47.4, 520],
  'checa-clasica': [0, 0, 0, 0],
  'alekhine-e3': [0, 0, 0, 0],
  'checa-carlsbad': [0, 0, 0, 0],
  'cambio-trifunovic': [0, 0, 0, 0],
  'moderna-g3': [0, 0, 1.99, 8],
  geller: [0, 0, 0, 0],
  diemer: [3.3, 3, 1.0, 11],
}
/** El gate del mapa (nota 2): la Checa cubre la posición donde decides tomar (4.Cc3 dxc4), y 5.a4 es la mejor del motor. */
const POR_EL_GATE = ['checa']

describe('La Eslava · obligatorio y opcional, contra los datos', () => {
  it('la regla de §6, con sus cortes de 5 % y 2 %, da las obligatorias del curso', () => {
    const r = new Set<string>(POR_EL_GATE)
    // 1. comprender: la lección más jugada de cada forma con 5 % o más en alguna banda
    for (const [forma, bandas] of Object.entries(ESTRUCTURAS)) {
      if (!bandas.some((x) => x !== null && x >= 5)) continue
      const grupo = c.variantes.filter((v) => v.estructura === forma)
      const jugada = (id: string) => Math.max(LECCIONES[id]![0], LECCIONES[id]![2])
      r.add(grupo.sort((a, b) => jugada(b.id) - jugada(a.id))[0]!.id)
    }
    // 2. partidas reales: 2 % o más en una banda con 10 partidas o más
    for (const [id, [p1, n1, p2, n2]] of Object.entries(LECCIONES)) if ((p1 >= 2 && n1 >= 10) || (p2 >= 2 && n2 >= 10)) r.add(id)
    expect(obligatorias(c).map((v) => v.id).sort()).toEqual([...r].sort())
    expect(Object.keys(LECCIONES).sort()).toEqual(c.variantes.map((v) => v.id).sort())
  })
})

describe('La Eslava · lo guardado, el Repaso y Refuerza', () => {
  beforeEach(() => {
    instalarLocalStorage()
  })

  it('lo que llevaba en el Repaso de las lecciones viejas se muda a la lección nueva de la misma línea (no se copia)', () => {
    const p = 'eslava:b/b:eslava/'
    const nuevo = pasarEslavaYOtrosNegras({ [p + 'checa']: { escalon: 2 }, [p + 'semieslava']: { escalon: 1 }, [p + 'checa-carlsbad']: { escalon: 3 }, 'italiana:w/w:italiana/paris': { escalon: 1 } })
    expect(nuevo).toEqual({ [p + 'curso-checa']: { escalon: 2 }, [p + 'semieslava']: { escalon: 1 }, [p + 'checa-carlsbad']: { escalon: 3 }, 'italiana:w/w:italiana/paris': { escalon: 1 } })
    // la Semieslava va a la Checa solo si la Checa nueva no tenía nada
    expect(pasarEslavaYOtrosNegras({ [p + 'semieslava']: { escalon: 1 } })).toEqual({ [p + 'curso-checa']: { escalon: 1 } })
  })

  it('ninguna lección vieja se queda sin lección nueva: cada una va a la de su línea, o conserva su id', () => {
    const viejas = BASE.aperturas.find((a) => a.id === 'eslava')!.variantes.filter((v) => !v.id.startsWith('curso-')).map((v) => v.id)
    const nuevas = new Set(c.variantes.map((v) => v.base))
    for (const v of viejas) expect(nuevas.has(LECCIONES_ESLAVA[v] ?? v), v).toBe(true)
  })

  it('las opcionales no salen en el Repaso ni en Refuerza; las obligatorias, sí (orden de Carlos, 2026-11-25)', () => {
    const ck = cursos().find((x) => x.id === 'eslava:b')!
    expect(ck.lecciones.map((l) => l.id)).toEqual(obligatorias(c).map((v) => leccionIdDe(c, v)))
    expect(leccionesDe(c)).toHaveLength(4)
    // Refuerza: un fallo en una jugada que solo tiene una opcional no sale; uno en una obligatoria, sí
    const enLinea = (id: string, ply: number) => {
      const l = linea(id)
      const pos = posicion(l.jugadas, ply)
      registrarPasoCurso({ fen: pos.fen(), esperada: l.jugadas[ply]!, paso: { fallos: 1, pista: false, respuesta: false }, linea: l.id, camino: l.jugadas.slice(0, ply) })
    }
    enLinea('geller', 9) // 5...b5 contra 5.e4: solo en la Geller, opcional
    enLinea('cc3', 5) // 3...dxc4 contra 3.Cc3: en una obligatoria
    const falladas = jugadasFalladas(soloObligatorias(repertorioCompleto()), leerRegistro())
    expect(falladas.map((j) => j.esperada)).toEqual(['dxc4'])
    expect(esOpcional(c, 'geller')).toBe(true)
    // sin el filtro, las dos estaban
    expect(jugadasFalladas(repertorioCompleto(), leerRegistro())).toHaveLength(2)
  })
})

describe('La Eslava · el ciclo de la lección, en la Checa (desde 1.d4)', () => {
  const l = linea('checa')
  const hastaMiTurno = (e: EstadoCiclo) => {
    let x = e
    for (let i = 0; i < 10 && x.momento !== 'tuTurno' && x.momento !== 'fin' && x.momento !== 'plan'; i++) x = x.momento === 'rival' ? jugarRival(l, x) : continuar(l, x)
    return x
  }
  const mov = (san: string, e: EstadoCiclo) => {
    const m = posicion(l.jugadas, e.ply).move(san)
    return { san: m.san, desde: m.from, hasta: m.to }
  }

  it('empieza desde la primera jugada; me toca con "Jugada 1 de 8"', () => {
    const e = hastaMiTurno(empezar(l))
    expect(e.ply).toBe(1)
    expect(progreso(l, e)).toEqual({ n: 1, m: 8 })
  })

  it('la correcta avanza; una jugada buena del motor sale como buena, no en rojo; una mala, en rojo', () => {
    const e = hastaMiTurno(empezar(l))
    expect(intentar(l, e, mov('d5', e), { esperar: true }).resultado).toBe('correcta')
    const m = textoMio(c, l.jugadas, e.ply)!
    expect(m.buenas).toContain('Nf6')
    expect(intentar(l, e, mov('Nf6', e), { buenas: new Set(m.buenas) }).resultado).toBe('buena')
    expect(intentar(l, e, mov('g5', e), { buenas: new Set(m.buenas) }).resultado).toBe('error')
  })

  it('cada jugada tuya de cada línea dice su jugada en Aprender, y la pregunta no la delata', () => {
    for (const x of VARIANTES)
      for (const p of misJugadas(x)) {
        const m = textoMio(c, x.jugadas, p)!
        expect(m.pregunta, `${x.id} ${p}`).not.toContain(sanAEspanol(x.jugadas[p]!))
      }
  })
})
