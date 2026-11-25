import { describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { CURSOS_NUEVOS, grupoDeLinea, leccionIdDe, leccionesDe, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales, troncoDelCurso } from '../../src/curso/datos.ts'
import { continuar, empezar, intentar, jugarRival, reintentar, type EstadoCiclo } from '../../src/curso/ciclo.ts'
import { posicion } from '../../src/curso/textos.ts'
import { fotosDePasos } from '../../src/curso/pasos.ts'
import { todosLosVer } from '../../src/curso/ver.ts'
import { registrarPasoCurso } from '../../src/registro/eventos.ts'
import { jugadasFalladas } from '../../src/registro/refuerza.ts'
import { repertorioDeFavoritas } from '../../src/aprender/favoritas.ts'
import { MIS_APERTURAS } from '../../src/aprender/interruptores.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { LECCIONES_ITALIANA, pasarItaliana } from '../../src/aprender/migracion.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'

/**
 * El curso de la Italiana por estructuras (2026-11-25; `specs/cursos.md` §6 y su apartado de la Italiana). Las reglas de
 * contenido que valen para todo curso corren también sobre este (`vite.config.ts`, proyecto "curso de la Italiana"); aquí,
 * lo propio: el mapa contra las líneas (chess.js), una sola jugada tuya por posición, la regla que decide d3 o d4, la
 * tabla de obligatorio y opcional, la migración de lo guardado y lo que las ventanas de "Ver qué pasaría" dicen que se ve.
 */
const c = CURSOS_NUEVOS['italiana:w']!
const linea = (id: string) => lineaPorId(c, `v:${id}`)!
const variantes = lineasDe(c).filter((l) => l.tipo === 'variante')

const CERRADO = 'Centro cerrado'
const IDEAL = 'Centro ideal'
const ABIERTO = 'Centro abierto'
/** La tabla del mapa (`iterations/v4/mapa-italiana.md`): sección, lección, forma y su frecuencia en las dos bandas. */
const TABLA: [string, string, boolean, [string, string | undefined, number, number][]][] = [
  ['La base', 'base', false, [['dos-caballos-d3', CERRADO, 41.7, 36.2], ['la-bourdonnais', IDEAL, 6.5, 6.2], ['anti-higado-frito', ABIERTO, 6.4, 18.7]]],
  ['Las que más te van a salir', 'frecuentes', false, [['principal', CERRADO, 17.0, 13.8], ['paris', ABIERTO, 7.0, 5.4], ['blackburne-kostic', IDEAL, 1.9, 3.8]]],
  ['Opcional', 'opcional', true, [['hungara', undefined, 0.6, 1.3], ['rousseau', undefined, 0.6, 1.7]]],
]
/** Las formas por cualquier camino, en las dos bandas (el mismo archivo). */
const FORMAS: Record<string, [number, number]> = { [CERRADO]: [54.7, 42.2], [ABIERTO]: [7.5, 18.0], [IDEAL]: [3.0, 7.3] }

const jugadas = (l: LineaCurso): Move[] => {
  const ch = new Chess()
  return l.jugadas.map((s) => ch.move(s))
}

/** Qué forma dicen las jugadas de una línea, mirando toda la línea (el mapa). */
function formaDe(l: LineaCurso): string | undefined {
  const m = jugadas(l)
  const exd4 = m.findIndex((x) => x.color === 'b' && x.piece === 'p' && x.from === 'e5' && x.to === 'd4')
  const cxd4 = exd4 >= 0 && m.some((x, i) => i > exd4 && x.color === 'w' && x.piece === 'p' && x.from === 'c3' && x.to === 'd4')
  if (m.some((x) => x.color === 'w' && x.piece === 'n' && x.to === 'g5')) return undefined
  if (m.some((x) => x.color === 'w' && x.piece === 'p' && x.from === 'e4' && x.to === 'e5')) return undefined
  if (exd4 >= 0) return cxd4 ? IDEAL : ABIERTO
  const d3 = m.some((x) => x.color === 'w' && x.piece === 'p' && x.from === 'd2' && x.to === 'd3')
  const centroQuieto = !m.some((x) => x.piece === 'p' && ((x.color === 'w' && x.from === 'e4') || (x.color === 'b' && x.from === 'e5')))
  return d3 && centroQuieto ? CERRADO : undefined
}

describe('La Italiana por estructuras · el curso', () => {
  it('es el curso de la tarjeta de siempre (italiana:w), con 8 lecciones: una por respuesta del rival, sin las otras jugadas tuyas', () => {
    expect(MIS_APERTURAS).toContain('italiana:w')
    expect(c.id).toBe('italiana:w')
    expect(c.color).toBe('w')
    expect(c.variantes).toHaveLength(8)
    // las cinco variantes de la base que se separan por una jugada tuya no son lecciones (nota 3): 4.d3 contra 3...Ac5,
    // 6.Cbd2 y 4.Cg5 van como "buenas" de la jugada de la lección
    const bases = c.variantes.map((v) => v.base)
    for (const fuera of ['pianissimo-canal', 'giuoco-pianissimo-cbd2', 'dos-caballos-lolli', 'dos-caballos-polerio', 'dos-caballos-traxler']) expect(bases).not.toContain(fuera)
    expect(c.mias['e4 e5 Nf3 Nc6 Bc4 Bc5 c3']!.buenas).toContain('d3')
    expect(c.mias['e4 e5 Nf3 Nc6 Bc4 Nf6 d3']!.buenas).toContain('Ng5')
    expect(c.mias['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O']!.buenas).toContain('Nbd2')
    // el tablero de arriba de su página: lo que comparten todas sus líneas
    expect(troncoDelCurso(c)).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'])
  })

  it('las secciones, sus lecciones, su orden y la forma de cada una, como la tabla del mapa', () => {
    expect(c.secciones!.map((s) => [s.titulo, s.id, !!s.opcional, s.variantes])).toEqual(TABLA.map(([t, id, o, ls]) => [t, id, o, ls.map(([x]) => x)]))
    expect(c.variantes.map((v) => [v.id, v.estructura])).toEqual(TABLA.flatMap(([, , , ls]) => ls.map(([id, f]) => [id, f])))
    expect(c.secciones!.at(-1)!.nota).toBe('No cuentan para terminar el curso.')
    expect(obligatorias(c)).toHaveLength(6)
    expect(opcionales(c)).toHaveLength(2)
    // la primera empieza desde 1.e4; las demás, con el tronco en el tablero
    expect(c.variantes[0]!.desde).toBe(0)
    for (const v of c.variantes.slice(1)) expect(v.desde, v.id).toBe(5)
    expect(grupoDeLinea(c, linea('principal'))).toHaveLength(6)
    expect(grupoDeLinea(c, linea('rousseau'))).toHaveLength(2)
  })

  it('cada etiqueta dice lo que pasa en su línea (chess.js, toda la línea); la Húngara y la Rousseau quedan de verdad fuera', () => {
    for (const v of c.variantes) expect(formaDe(linea(v.id)), v.id).toBe(v.estructura)
    // fuera del mapa: son las únicas en que tu peón de e4 avanza a e5
    const avanzaE4 = (l: LineaCurso) => jugadas(l).some((x) => x.color === 'w' && x.from === 'e4' && x.to === 'e5')
    expect(variantes.filter(avanzaE4).map((l) => l.variante!.id)).toEqual(['hungara', 'rousseau'])
    // la medida distingue: en el Blackburne el peón de e5 toma en d4 (un caballo) y tu peón de c lo retoma
    expect(jugadas(linea('blackburne-kostic')).some((x) => x.san === 'cxd4')).toBe(true)
    expect(jugadas(linea('anti-higado-frito')).some((x) => x.san === 'Nxd4')).toBe(true)
  })

  it('una sola jugada tuya por posición: si dos lecciones llegan al mismo tablero, enseñan la misma jugada (nota 7)', () => {
    const vista = new Map<string, string>()
    for (const l of variantes)
      for (const ply of misJugadas(l)) {
        const fen = posicion(l.jugadas, ply).fen().split(' ').slice(0, 4).join(' ')
        const antes = vista.get(fen)
        if (antes) expect(l.jugadas[ply], `${l.id} ${ply}`).toBe(antes)
        vista.set(fen, l.jugadas[ply]!)
      }
    // las dos del Centro cerrado llegan al mismo tablero tras 6...0-0, y las dos siguen con Te1
    const a = posicion(linea('dos-caballos-d3').jugadas, 12).fen()
    const b = posicion(linea('principal').jugadas, 12).fen()
    expect(a).toBe(b)
    expect(linea('dos-caballos-d3').jugadas[12]).toBe('Re1')
    expect(linea('principal').jugadas[12]).toBe('Re1')
  })

  it('la regla que decide (el mapa): si el caballo de negras ya ataca tu e4 desde f6, d3; si negras juega pasivo, d4', () => {
    let medidas = 0
    for (const l of variantes)
      for (const ply of misJugadas(l)) {
        const ch = posicion(l.jugadas, ply)
        const j = new Chess(ch.fen()).move(l.jugadas[ply]!)
        if (j.piece !== 'p' || j.from !== 'd2') continue
        medidas++
        const caballoEnF6 = ch.get('f6')?.type === 'n' && ch.get('f6')?.color === 'b'
        expect(j.to, `${l.id} ${ply}`).toBe(caballoEnF6 ? 'd3' : 'd4')
      }
    expect(medidas).toBeGreaterThanOrEqual(6)
    const mapa = c.piezas.estructura.paginas[0]!.texto.join(' ')
    expect(mapa).toContain('Primero mira si atacan una pieza tuya')
    expect(mapa).toContain('¿qué pasó con el peón de e5 de negras?')
  })

  it('obligatorio y opcional siguen la regla (specs/cursos.md §6) con los números del mapa', () => {
    // paso 1: cada forma pasa el 5 % en alguna banda, y la lección de La base de cada forma es su más jugada en alguna
    // banda (en el Abierto, 3...h6 en 1000–1400: tras 4.d4 negras cambia en d4 más seguido que en París; el gate del mapa)
    for (const [forma, [a, b]] of Object.entries(FORMAS)) expect(Math.max(a, b), forma).toBeGreaterThanOrEqual(5)
    const filas = TABLA.flatMap(([, id, , ls]) => ls.map(([l, f, a, b]) => ({ seccion: id, l, f, a, b })))
    for (const forma of Object.keys(FORMAS)) {
      const de = filas.filter((x) => x.f === forma)
      const base = de.find((x) => x.seccion === 'base')!
      const masEn = (k: 'a' | 'b') => de.every((x) => x[k] <= base[k])
      expect(masEn('a') || masEn('b'), forma).toBe(true)
      for (const x of de) expect(x.seccion, x.l).not.toBe('opcional')
    }
    // paso 2: las demás obligatorias pasan el 2 % en alguna banda; las opcionales, en ninguna
    for (const x of filas.filter((y) => y.seccion === 'frecuentes')) expect(Math.max(x.a, x.b), x.l).toBeGreaterThanOrEqual(2)
    for (const x of filas.filter((y) => y.seccion === 'opcional')) expect(Math.max(x.a, x.b), x.l).toBeLessThan(2)
  })

  it('cada introducción abre con una frase que nombra su forma (o dice que está fuera del mapa) sin nombrar una jugada tuya', () => {
    for (const l of variantes) {
      const v = l.variante!
      const frase = v.intro.split(/(?<=\.) /)[0]!
      expect(frase, v.id).toMatch(v.estructura ? new RegExp(`^Estás en el ${v.estructura}`) : /^Fuera del mapa/)
      for (const ply of misJugadas(l)) {
        const j = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
        expect(frase, `${v.id}: ${j.san}`).not.toContain(sanAEspanol(j.san).replace(/[+#]/g, ''))
      }
    }
  })
})

describe('La Italiana por estructuras · el ciclo, el registro y lo guardado', () => {
  const principal = linea('principal')
  const mov = (l: LineaCurso, san: string, e: EstadoCiclo) => {
    const m = posicion(l.jugadas, e.ply).move(san)
    return { san: m.san, desde: m.from, hasta: m.to }
  }
  const hastaMiTurno = (l: LineaCurso, e: EstadoCiclo) => {
    let x = e
    for (let i = 0; i < 10 && x.momento !== 'tuTurno' && x.momento !== 'fin' && x.momento !== 'plan'; i++) x = x.momento === 'rival' ? jugarRival(l, x) : continuar(l, x)
    return x
  }

  it('la lección empieza con el tronco en el tablero; la máquina juega 3...Ac5 y te toca 4.c3; 4.d3 es buena de otra línea', () => {
    const e = hastaMiTurno(principal, empezar(principal))
    expect(e.ply).toBe(6)
    const d3 = intentar(principal, e, mov(principal, 'd3', e), { buenas: new Set(c.mias['e4 e5 Nf3 Nc6 Bc4 Bc5 c3']!.buenas) })
    expect(d3.resultado).toBe('buena')
    const mal = intentar(principal, e, mov(principal, 'Ng5', e))
    expect(mal.resultado).toBe('error')
    expect(intentar(principal, reintentar(mal.estado), mov(principal, 'c3', e), { esperar: true }).resultado).toBe('correcta')
  })

  it('un fallo en Practicar entra al registro y sale en Refuerza de la Italiana', () => {
    let e = hastaMiTurno(principal, empezar(principal, 'practicar'))
    e = reintentar(intentar(principal, e, mov(principal, 'Ng5', e)).estado)
    const fen = posicion(principal.jugadas, e.ply).fen()
    const r = intentar(principal, e, mov(principal, 'c3', e))
    const entrada = registrarPasoCurso({ fen, esperada: principal.jugadas[e.ply]!, paso: r.estado.pasos[e.ply]!, linea: principal.nombre, camino: principal.jugadas.slice(0, e.ply) })
    expect(entrada.resultado).toBe('fallo')
    expect(jugadasFalladas(repertorioDeFavoritas(['italiana:w']), [entrada]).some((j) => j.esperada === 'c3')).toBe(true)
  })

  it('las lecciones del Repaso de la Italiana son las de este curso, una por línea', () => {
    const it = cursos().find((x) => x.id === 'italiana:w')!
    expect(it.lecciones.map((l) => l.id).sort()).toEqual(leccionesDe(c).map((l) => l.id).sort())
    expect(new Set(it.lecciones.map((l) => l.jugadas.join(' '))).size).toBe(it.lecciones.length)
    expect(leccionIdDe(c, c.variantes.find((v) => v.id === 'paris')!)).toBe('italiana:w/w:italiana/curso-paris')
  })

  it('lo guardado de las lecciones viejas pasa a la nueva de la misma línea; lo de las cinco que ya no son lección se queda guardado', () => {
    const p = 'italiana:w/w:italiana/'
    const viejo = { [`${p}paris`]: { escalon: 2 }, [`${p}giuoco-pianissimo-principal`]: { escalon: 1 }, [`${p}dos-caballos-lolli`]: { escalon: 3 }, 'caro-kann:b/b:caro-kann/avance-tal': { escalon: 1 } }
    const nuevo = pasarItaliana(viejo)
    expect(nuevo[`${p}curso-paris`]).toEqual({ escalon: 2 })
    expect(nuevo[`${p}paris`]).toBeUndefined() // se mudó: no cuenta dos veces
    expect(nuevo[`${p}giuoco-pianissimo-principal`]).toEqual({ escalon: 1 }) // la principal conserva su id
    expect(nuevo[`${p}dos-caballos-lolli`]).toEqual({ escalon: 3 }) // ya no es lección: no se borra
    expect(nuevo['caro-kann:b/b:caro-kann/avance-tal']).toEqual({ escalon: 1 })
    // si la nueva ya tenía algo, la vieja se queda como estaba
    expect(pasarItaliana({ [`${p}paris`]: { escalon: 2 }, [`${p}curso-paris`]: { escalon: 4 } })[`${p}curso-paris`]).toEqual({ escalon: 4 })
    // cada lección vieja que sigue siendo lección tiene su lección nueva
    const nuevas = new Set(leccionesDe(c).map((x) => x.id.split('/').pop()))
    for (const v of ['dos-caballos-d3', 'clasica-la-bourdonnais', 'paris', 'anti-higado-frito', 'hungara', 'blackburne-kostic', 'rousseau', 'giuoco-pianissimo-principal']) expect(nuevas.has(LECCIONES_ITALIANA[v] ?? v), v).toBe(true)
  })
})

describe('La Italiana por estructuras · lo que "Ver qué pasaría" dice que se ve (chess.js)', () => {
  const TODOS = todosLosVer(c)
  const final = (inicio: string) => {
    const v = TODOS.find((x) => x.frase.startsWith(inicio))!
    return new Chess(fotosDePasos({ pasos: v.ver.pasos }, v.inicio).at(-1)!.fen)
  }
  const valor = (ch: Chess, color: 'w' | 'b') => ch.board().flat().filter((p) => p?.color === color).reduce((s, p) => s + { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[p!.type], 0)

  it('"perdería una pieza" y "su peón se come tu alfil": la pieza ya no está, y nadie retoma', () => {
    const nxe4 = final('Así el caballo de f6 ya no puede tomar en e4')
    expect(valor(nxe4, 'w') - valor(nxe4, 'b')).toBe(2)
    const d5 = final('Si negras golpea con ...d5, toma en d5')
    expect(d5.findPiece({ type: 'b', color: 'w' })).toHaveLength(1)
    expect(valor(d5, 'b') - valor(d5, 'w')).toBe(3)
  })

  it('"pierdes material" con h3 contra el caballo de g4: una torre y dos peones por un caballo', () => {
    const ch = final('Si su caballo salta a g4, aparta tu torre a f1')
    expect(ch.findPiece({ type: 'r', color: 'w' })).toHaveLength(1)
    expect(valor(ch, 'b') - valor(ch, 'w')).toBe(4)
  })

  it('"tomas su caballo de c6": una pieza por dos peones; y la trampa de 3...Cd4: dos peones por una pieza', () => {
    const d5 = final('Si negras toma en e4, tomas su caballo de c6')
    expect(valor(d5, 'w') - valor(d5, 'b')).toBe(1)
    expect(d5.findPiece({ type: 'n', color: 'b' })).toHaveLength(1)
    const trampa = final('No tomes en e5')
    expect(valor(trampa, 'b') - valor(trampa, 'w')).toBe(1)
  })
})
