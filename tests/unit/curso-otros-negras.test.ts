import { beforeEach, describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { CURSOS_NUEVOS, leccionIdDe, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { adelanta } from '../../src/curso/adelantar.ts'
import { frasesDe, posicion } from '../../src/curso/textos.ts'
import { BASE } from '../../src/base/base.ts'
import { MIS_APERTURAS } from '../../src/aprender/interruptores.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { LECCIONES_OTROS_NEGRAS, pasarEslavaYOtrosNegras } from '../../src/aprender/migracion.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'

/**
 * "...c6 + ...d5 contra lo demás", por estructuras (2026-11-25, `specs/cursos.md` §6): lo propio de este curso. Las reglas
 * de contenido que valen para todo curso corren sobre él en `vite.config.ts` (proyecto "curso otros-negras").
 */
const c = CURSOS_NUEVOS['otros-negras:b']!
const VARIANTES = lineasDe(c).filter((l) => l.tipo === 'variante')
const linea = (id: string) => lineaPorId(c, `v:${id}`)!
const jugadas = (l: LineaCurso): Move[] => {
  const ch = new Chess()
  return l.jugadas.map((s) => ch.move(s))
}

const CENTRO = 'Blancas no ataca tu peón de d5'
const ANGLO = 'Blancas ataca d5 con c4, sin d4'
const ESLAVA = 'Blancas juega c4 y d4: es la Eslava'

/** ¿Qué peón de blancas ataca tu peón de d5? Se mira toda la línea: los peones blancos que llegan a c4, e4 y d4. */
function formaDe(l: LineaCurso): string[] {
  const m = jugadas(l)
  const llega = (sq: string) => m.some((x) => x.color === 'w' && x.piece === 'p' && x.to === sq)
  if (!m.some((x) => x.color === 'b' && x.piece === 'p' && x.to === 'd5')) return []
  if (llega('c4') && llega('d4')) return [ESLAVA]
  if (llega('c4')) return [ANGLO]
  if (llega('e4')) return []
  return [CENTRO]
}

describe('...c6 + ...d5 · el curso', () => {
  it('es la tarjeta de "Otras aperturas de blancas" con negras, y la página dice el mismo nombre', () => {
    expect(MIS_APERTURAS).toContain('otros-negras:b')
    expect(c.id).toBe('otros-negras:b')
    expect(c.nombre).toBe(cursos().find((x) => x.id === 'otros-negras:b')!.nombre)
    expect(c.nombre).toBe('Otras aperturas de blancas')
    expect(c.color).toBe('b')
  })

  it('una lección por cada variante de la base (8), todas desde la primera jugada', () => {
    const base = BASE.aperturas.find((a) => a.id === 'otros-negras')!.variantes.filter((v) => !v.id.startsWith('curso-'))
    expect(base).toHaveLength(8)
    expect(c.variantes.map((v) => v.base.replace(/^curso-/, '')).sort()).toEqual(base.map((v) => v.id).sort())
    for (const v of c.variantes) expect(v.desde, v.id).toBe(0)
  })

  it('las secciones: La base (una por forma con 5 % o más), las que más salen y lo opcional', () => {
    expect(c.secciones!.map((s) => [s.id, s.variantes])).toEqual([
      ['base', ['reti-bogoljubow', 'otras-hungara']],
      ['frecuentes', ['inglesa-caro-kann', 'reti-fianchetto', 'larsen-clasica', 'otras-bird']],
      ['opcional', ['inglesa-anglo-eslava-g3', 'inglesa-gurevich']],
    ])
    expect(obligatorias(c)).toHaveLength(6)
    expect(opcionales(c).map((v) => v.id)).toEqual(['inglesa-anglo-eslava-g3', 'inglesa-gurevich'])
    expect(c.variantes.map((v) => v.id)).toEqual(c.secciones!.flatMap((s) => s.variantes))
  })

  it('cada etiqueta del mapa cuadra con las jugadas de su línea, mirando toda la línea', () => {
    for (const l of VARIANTES) expect(formaDe(l), l.id).toEqual([l.variante!.estructura])
  })

  it('la lección de 1.c4 llega a la misma posición que el Cambio de la Eslava (chess.js)', () => {
    const corta = (j: string[]) => posicion(j, j.length).fen().split(' ').slice(0, 4).join(' ')
    expect(corta(linea('inglesa-caro-kann').jugadas.slice(0, 7))).toBe(corta(['d4', 'd5', 'c4', 'c6', 'cxd5', 'cxd5', 'Nc3']))
    // y 1.c4 c6 2.d4 d5 es la de la Eslava
    expect(corta(['c4', 'c6', 'd4', 'd5'])).toBe(corta(['d4', 'd5', 'c4', 'c6']))
  })

  it('cada introducción abre con su frase: nombra su forma y no dice ninguna jugada tuya de la línea', () => {
    const nombre: Record<string, RegExp> = { [CENTRO]: /^Estás en el Centro libre/, [ANGLO]: /^Estás en la Anglo-Eslava/, [ESLAVA]: /^Estás en la Eslava/ }
    for (const l of VARIANTES) {
      const frase = frasesDe(l.variante!.intro)[0]!
      expect(frase, l.id).toMatch(nombre[l.variante!.estructura!]!)
      expect(frase, l.id).toMatch(/tu objetivo es/)
      expect(adelanta(l, l.desde - 1, frase), l.id).toEqual([])
      expect(frase, l.id).not.toContain('...')
      const m = jugadas(l)
      for (const p of misJugadas(l)) expect(frase, `${l.id}: ${m[p]!.san}`).not.toMatch(new RegExp(`\\b${m[p]!.to}\\b`))
    }
  })

  it('las dos que acaban una jugada antes de cambiar de forma lo dicen ("Pero si blancas…")', () => {
    for (const id of ['reti-fianchetto', 'inglesa-gurevich']) expect(linea(id).variante!.intro, id).toMatch(/Pero si blancas .* ya es la Eslava\./)
  })
})

/** La tabla de obligatorio y opcional contra los datos (`iterations/v4/mapa-otros-negras.md`). */
const ESTRUCTURAS: Record<string, [number, number]> = { [CENTRO]: [27.9, 33.8], [ANGLO]: [2.8, 7.2], [ESLAVA]: [1.6, 3.9] }
const LECCIONES: Record<string, [number, number, number, number]> = {
  'reti-bogoljubow': [0.8, 29, 1.6, 179],
  'otras-hungara': [6.5, 700, 8.0, 2197],
  'inglesa-caro-kann': [1.9, 6, 5.9, 74],
  'reti-fianchetto': [3.8, 137, 4.0, 447],
  'larsen-clasica': [3.8, 410, 6.7, 1831],
  'otras-bird': [5.8, 623, 6.2, 1687],
  'inglesa-anglo-eslava-g3': [0, 0, 0.3, 4],
  'inglesa-gurevich': [0, 0, 0.3, 4],
}

describe('...c6 + ...d5 · obligatorio y opcional, contra los datos', () => {
  it('la regla de §6 da las seis obligatorias, y La base es la lección más jugada de cada forma con 5 % o más', () => {
    const base = new Set<string>()
    for (const [forma, bandas] of Object.entries(ESTRUCTURAS)) {
      if (!bandas.some((x) => x >= 5)) continue
      const jugada = (id: string) => Math.max(LECCIONES[id]![0], LECCIONES[id]![2])
      base.add(c.variantes.filter((v) => v.estructura === forma).sort((a, b) => jugada(b.id) - jugada(a.id))[0]!.id)
    }
    expect([...base].sort()).toEqual(c.secciones![0]!.variantes.slice().sort())
    const r = new Set(base)
    for (const [id, [p1, n1, p2, n2]] of Object.entries(LECCIONES)) if ((p1 >= 2 && n1 >= 10) || (p2 >= 2 && n2 >= 10)) r.add(id)
    expect([...r].sort()).toEqual(obligatorias(c).map((v) => v.id).sort())
  })
})

describe('...c6 + ...d5 · lo guardado y el Repaso', () => {
  beforeEach(() => {
    instalarLocalStorage()
  })

  it('lo de las lecciones viejas se muda a la nueva de la misma línea; las que no cambiaron conservan su id', () => {
    const p = 'otros-negras:b/b:otros-negras/'
    expect(pasarEslavaYOtrosNegras({ [p + 'otras-bird']: { escalon: 2 }, [p + 'reti-fianchetto']: { escalon: 1 } })).toEqual({ [p + 'curso-otras-bird']: { escalon: 2 }, [p + 'reti-fianchetto']: { escalon: 1 } })
    const nuevas = new Set(c.variantes.map((v) => v.base))
    const viejas = BASE.aperturas.find((a) => a.id === 'otros-negras')!.variantes.filter((v) => !v.id.startsWith('curso-')).map((v) => v.id)
    for (const v of viejas) expect(nuevas.has(LECCIONES_OTROS_NEGRAS[v] ?? v), v).toBe(true)
  })

  it('en el Repaso salen solo las seis obligatorias', () => {
    const cu = cursos().find((x) => x.id === 'otros-negras:b')!
    expect(cu.lecciones.filter((l) => !l.opcional).map((l) => l.id)).toEqual(obligatorias(c).map((v) => leccionIdDe(c, v)))
    expect(cu.lecciones.filter((l) => l.opcional).map((l) => l.id)).toEqual(opcionales(c).map((v) => leccionIdDe(c, v)))
  })
})
