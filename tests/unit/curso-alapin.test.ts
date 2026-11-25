import { describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { CURSOS_NUEVOS, esLeccionOpcional, jugadasDeVariante, leccionIdDe, lineaPorId, misJugadas, obligatorias, opcionales, soloObligatorias } from '../../src/curso/datos.ts'
import { LECCIONES_ALAPIN, pasarAlapin } from '../../src/aprender/migracion.ts'
import { repertorioCompleto } from '../../src/aprender/favoritas.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { BASE } from '../../src/base/base.ts'

/**
 * Lo propio del curso de la Alapin contra la Siciliana, por estructuras (2026-11-25; `specs/cursos.md` §6 y su apartado de
 * la Alapin). El mapa, con su prueba y sus números: `iterations/v4/mapa-alapin.md`. Las pruebas de contenido corren
 * aparte sobre este curso (`vite.config.ts`, proyecto "curso alapin").
 */
const c = CURSOS_NUEVOS['siciliana:w']!
const jugar = (js: string[]) => {
  const ch = new Chess()
  const ms: Move[] = js.map((s) => ch.move(s))
  return { ch, ms }
}
const peones = (ch: Chess, color: 'w' | 'b') => ch.board().flat().filter((s) => s && s.type === 'p' && s.color === color).map((s) => s!.square).sort()
const material = (ch: Chess) => {
  const v: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
  let d = 0
  for (const s of ch.board().flat()) if (s) d += (s.color === 'w' ? 1 : -1) * v[s.type]!
  return d
}
const posicion = (js: string[]) => jugar(js).ch.fen().split(' ').slice(0, 4).join(' ')

/** La entrada del mapa de una línea, mirando toda la línea (no solo su final). */
function entrada(js: string[]): 'aislado' | 'cadena' | 'gambito' | 'centro' | 'otra' {
  const { ms } = jugar(js)
  const i = ms.findIndex((m) => m.color === 'w' && m.piece === 'p' && m.from === 'e4')
  if (i < 0) return 'otra'
  if (ms[i]!.to === 'e5') return 'cadena'
  if (ms[i]!.to !== 'd5') return 'otra'
  const sig = ms[i + 1]
  if (!sig) return 'otra'
  if (sig.to !== 'd5') return 'gambito'
  return sig.piece === 'q' ? 'aislado' : 'otra'
}

describe('La Alapin · el mapa contra las líneas (chess.js)', () => {
  const ETIQUETA: Record<string, string> = { aislado: 'Cambias en d5: el aislado', cadena: 'Avanzas a e5: la cadena', gambito: 'Excepción: no recupera el peón (gambito)' }

  it('cada lección cae en una sola entrada, y su etiqueta lo dice', () => {
    const vistas: Record<string, string[]> = {}
    for (const v of c.variantes) {
      const e = entrada(jugadasDeVariante(c, v))
      ;(vistas[e] ??= []).push(v.id)
      expect(v.estructura, v.id).toBe(ETIQUETA[e])
    }
    expect(vistas).toEqual({ aislado: ['cambio-central', 'moderna', 'cc6', 'g6'], cadena: ['cf6-d4'], gambito: ['gambito'] })
  })

  it('El aislado: al final de sus cuatro lecciones, tu peón de d4 no tiene peones propios en c ni en e (hallazgo 10 del gate)', () => {
    for (const v of c.variantes.filter((x) => entrada(jugadasDeVariante(c, x)) === 'aislado')) {
      const { ch } = jugar(jugadasDeVariante(c, v))
      const w = peones(ch, 'w')
      expect(w, v.id).toContain('d4')
      expect(w.filter((s) => s[0] === 'c' || s[0] === 'e'), v.id).toEqual([])
    }
  })

  it('La cadena: llega intacta al final (d4 y e5), y la siguiente natural, 8...dxe5 9.Cxe5, la deshace: por eso su "pero…"', () => {
    const js = jugadasDeVariante(c, c.variantes.find((v) => v.id === 'cf6-d4')!)
    expect(peones(jugar(js).ch, 'w')).toEqual(expect.arrayContaining(['d4', 'e5']))
    const despues = jugar([...js, 'dxe5', 'Nxe5']).ch
    expect(peones(despues, 'w').filter((s) => s[0] === 'c' || s[0] === 'e')).toEqual([])
    expect(c.variantes.find((v) => v.id === 'cf6-d4')!.intro).toContain('pero')
  })

  it('El gambito: desde 3...Cf6, después de cada jugada tuya sigues con un peón de más', () => {
    const js = jugadasDeVariante(c, c.variantes.find((v) => v.id === 'gambito')!)
    // a media captura (7...Axc4, antes de 8.Dxc4) no cuenta: se mide cuando ya jugaste
    for (let n = js.indexOf('Nf6') + 2; n <= js.length; n += 2) expect(material(jugar(js.slice(0, n)).ch), js.slice(0, n).join(' ')).toBeGreaterThanOrEqual(1)
    expect(material(jugar(js).ch)).toBe(1)
  })

  it('las páginas de La estructura: El mapa, El aislado, La cadena y Los dos peones del centro (sin la del gambito)', () => {
    expect(c.piezas.estructura.paginas.map((p) => p.subtitulo)).toEqual(['El mapa', 'El aislado', 'La cadena', 'Los dos peones del centro'])
    const fen = (i: number) => new Chess(c.piezas.estructura.paginas[i]!.tablero!.fen!)
    expect(peones(fen(1), 'w')).toEqual(['a2', 'b2', 'd4', 'f2', 'g2', 'h2'])
    expect(peones(fen(2), 'w')).toEqual(['a2', 'b2', 'd4', 'e5', 'f2', 'g2', 'h2'])
    expect(peones(fen(3), 'w')).toEqual(['a2', 'b2', 'd4', 'e4', 'f2', 'g2', 'h2'])
    // el rival, sin peón en c (y en El aislado, tampoco en d)
    for (const i of [1, 2, 3]) expect(peones(fen(i), 'b').some((s) => s[0] === 'c'), `página ${i}`).toBe(false)
    expect(peones(fen(1), 'b').some((s) => s[0] === 'd')).toBe(false)
  })

  it('lo que dicen las páginas de las transposiciones es cierto: 2...Cc6 al Cambio Central y 2...e6 al Avance contra la Francesa', () => {
    expect(posicion(['e4', 'c5', 'c3', 'Nc6', 'd4', 'cxd4', 'cxd4', 'd5', 'exd5', 'Qxd5', 'Nf3'])).toBe(posicion(['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'cxd4', 'cxd4', 'Nc6', 'Nf3']))
    expect(posicion(['e4', 'c5', 'c3', 'e6', 'd4', 'd5', 'e5'])).toBe(posicion(['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3']))
    // con 3...cxd4 4.cxd4 d5 5.e5 hay cadena, pero no es la misma posición (hallazgo 8): la página no dice que lo sea
    expect(posicion(['e4', 'c5', 'c3', 'e6', 'd4', 'cxd4', 'cxd4', 'd5', 'e5'])).not.toBe(posicion(['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3']))
    expect(c.piezas.estructura.paginas[1]!.texto.join(' ')).toContain('Con 2...Cc6 3.d4 cxd4 4.cxd4 d5 5.exd5 Dxd5 6.Cf3 llegas a la misma posición del Cambio Central')
    expect(c.piezas.estructura.paginas[2]!.texto.join(' ')).toContain('Con 2...e6 3.d4 d5 4.e5 llegas a la misma posición de tu Avance contra la Francesa')
  })

  it('la regla de la jugada 3 se dice como lo que es: para tu jugada 3', () => {
    expect(c.piezas.estructura.paginas[0]!.texto.join(' ')).toContain('la regla para tu jugada 3')
    expect(c.mias['e4 c5 c3 d5 exd5']!.hace).toContain('para tu jugada 3')
    expect(c.mias['e4 c5 c3 Nf6 e5']!.porque).toContain('para tu jugada 3')
    // y con los dos peones del centro, a un caballo que ataque e4 no se le echa
    expect(c.piezas.estructura.paginas[3]!.texto.join(' ')).toContain('no lo avances')
  })
})

describe('La Alapin · obligatorio y opcional (§6, con las partidas de este curso)', () => {
  // `iterations/v4/mapa-alapin.md`: lichess 1000–1400 y 600–1000, siguiendo las jugadas del mapa
  const FORMAS = { aislado: [12.3, null], cadena: [13.4, 21.9] } as const
  const LECCIONES: Record<string, { forma: keyof typeof FORMAS | 'gambito'; pct: (number | null)[] }> = {
    'cambio-central': { forma: 'aislado', pct: [2.95, null] },
    'cf6-d4': { forma: 'cadena', pct: [4.33, 21.88] },
    moderna: { forma: 'aislado', pct: [null, null] },
    cc6: { forma: 'aislado', pct: [0.72, null] },
    g6: { forma: 'aislado', pct: [null, null] },
    gambito: { forma: 'gambito', pct: [null, null] },
  }
  const max = (xs: readonly (number | null)[]) => Math.max(...xs.map((x) => x ?? 0))

  it('la regla de la Caro-Kann, con los mismos cortes: la más jugada de cada forma de 5 % o más, y toda lección de 2 % o más', () => {
    const paso1 = Object.entries(FORMAS).filter(([, p]) => max(p) >= 5).map(([f]) => Object.entries(LECCIONES).filter(([, l]) => l.forma === f).sort((a, b) => max(b[1].pct) - max(a[1].pct))[0]![0])
    const paso2 = Object.entries(LECCIONES).filter(([id, l]) => max(l.pct) >= 2 && !paso1.includes(id)).map(([id]) => id)
    expect(paso1).toEqual(['cambio-central', 'cf6-d4'])
    expect(paso2).toEqual([])
    expect(obligatorias(c).map((v) => v.id)).toEqual([...paso1, ...paso2])
    expect(opcionales(c).map((v) => v.id)).toEqual(['moderna', 'cc6', 'g6', 'gambito'])
    expect(c.secciones!.map((s) => s.id)).toEqual(['base', 'opcional'])
    expect(c.secciones!.find((s) => s.id === 'opcional')!.nota).toBe('No cuentan para terminar el curso.')
  })

  it('la frecuencia de cada lección es la de la tabla, y dice de dónde sale', () => {
    for (const v of c.variantes) {
      expect(v.frecuencia, v.id).toBe(LECCIONES[v.id]!.pct[0] ?? 0)
      expect(v.fuenteFrecuencia, v.id).toContain('lichess')
    }
  })

  it('las opcionales no salen en el Repaso ni en Refuerza: el filtro común (nota 6)', () => {
    for (const v of c.variantes) expect(esLeccionOpcional('siciliana', 'w', v.base), v.id).toBe(opcionales(c).includes(v))
    const curso = cursos().find((x) => x.id === 'siciliana:w')!
    expect(curso.lecciones.filter((l) => l.opcional).map((l) => l.id).sort()).toEqual(opcionales(c).map((v) => leccionIdDe(c, v)).sort())
    // en Refuerza, de la Alapin solo quedan las líneas de las dos obligatorias; las lecciones de antes salen
    const ids = soloObligatorias(repertorioCompleto()).lineas.filter((l) => l.apertura === 'siciliana' && l.color === 'w').map((l) => l.id).sort()
    expect(ids).toEqual(obligatorias(c).map((v) => `w:siciliana/${v.base}`).sort())
  })

  it('máximo 8 jugadas tuyas, desde 1.e4 c5 2.c3 (la primera, desde 1.e4)', () => {
    expect(c.variantes[0]!.desde).toBe(0)
    for (const v of c.variantes.slice(1)) expect(v.desde, v.id).toBe(3)
    for (const v of c.variantes) expect(misJugadas(lineaPorId(c, `v:${v.id}`)!).length, v.id).toBeLessThanOrEqual(8)
  })
})

describe('La Alapin · lo guardado de antes', () => {
  const P = 'siciliana:w/w:siciliana/'
  const viejas = BASE.aperturas.find((a) => a.id === 'siciliana')!.variantes.filter((v) => v.id.startsWith('alapin-') && !v.id.startsWith('alapin-curso-'))

  it('cada lección vieja de la Alapin tiene su lección nueva de la misma respuesta del rival', () => {
    expect(viejas.map((v) => v.id).sort()).toEqual(Object.keys(LECCIONES_ALAPIN).sort())
    const nuevas = new Set(c.variantes.map((v) => v.base))
    for (const [vieja, nueva] of Object.entries(LECCIONES_ALAPIN)) {
      expect(nuevas.has(nueva), `${vieja} → ${nueva}`).toBe(true)
      // la nueva empieza con la fila de la vieja, o es la de la misma respuesta del rival (Stoltz y Heidenfeld: 2...Cf6 3.e5 Cd5)
      const fila = viejas.find((v) => v.id === vieja)!.jugadas
      const linea = jugadasDeVariante(c, c.variantes.find((v) => v.base === nueva)!)
      const comunes = vieja.includes('stoltz') || vieja.includes('heidenfeld') ? 6 : fila.length
      expect(linea.slice(0, comunes), vieja).toEqual(fila.slice(0, comunes))
    }
  })

  it('se muda (no se copia), y si la nueva ya tenía algo, la vieja se queda como estaba', () => {
    const antes = { [`${P}alapin-d5-moderna`]: { escalon: 2 }, [`${P}alapin-cf6-d4`]: { escalon: 3 }, [`${P}alapin-cf6-stoltz`]: { escalon: 1 }, 'caro-kann:b/b:caro-kann/curso-clasica': { escalon: 4 } }
    const r = pasarAlapin(antes)
    expect(r).toEqual({ [`${P}alapin-curso-moderna`]: { escalon: 2 }, [`${P}alapin-curso-cf6-d4`]: { escalon: 3 }, [`${P}alapin-cf6-stoltz`]: { escalon: 1 }, 'caro-kann:b/b:caro-kann/curso-clasica': { escalon: 4 } })
    // la Heidenfeld sola sí se muda a la de 4.d4
    expect(pasarAlapin({ [`${P}alapin-cf6-heidenfeld`]: 7 })).toEqual({ [`${P}alapin-curso-cf6-d4`]: 7 })
    // el id nuevo es el de `leccionIdDe`: lo que se muda, el Repaso lo encuentra
    for (const v of c.variantes) expect(Object.values(LECCIONES_ALAPIN).map((b) => P + b)).toContain(leccionIdDe(c, v))
  })
})
