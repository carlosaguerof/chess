import { describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { CURSOS_NUEVOS, cursoNuevo, esLeccionOpcional, jugadasDeVariante, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales, soloObligatorias } from '../../src/curso/datos.ts'
import { adelanta } from '../../src/curso/adelantar.ts'
import { fotosDePasos } from '../../src/curso/pasos.ts'
import { palabras, posicion } from '../../src/curso/textos.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { repertorioCompleto } from '../../src/aprender/favoritas.ts'
import { LECCIONES_AVANCE, pasarAvance } from '../../src/aprender/migracion.ts'
import type { DatosCurso, LineaCurso } from '../../src/curso/tipos.ts'

/**
 * Los cursos del Avance contra la Caro-Kann y contra la Francesa, por estructuras (2026-11-25; `specs/cursos.md` §6). Las
 * reglas de contenido que valen para todo curso corren sobre los dos en `vite.config.ts`; aquí, lo propio: el mapa ("¿qué
 * pasó con d4?") medido con chess.js en toda la línea, la regla de obligatorio y opcional con los números medidos, la
 * migración de lo guardado, y que lo opcional no salga en el Repaso ni en Refuerza.
 */
const CK = CURSOS_NUEVOS['caro-kann:w']!
const FR = CURSOS_NUEVOS['francesa:w']!
const variantes = (c: DatosCurso) => lineasDe(c).filter((l) => l.tipo === 'variante')
const jugadas = (l: LineaCurso): Move[] => {
  const ch = new Chess()
  return l.jugadas.map((s) => ch.move(s))
}
const peones = (ch: Chess, color: 'w' | 'b') => ch.board().flat().filter((s) => s && s.type === 'p' && s.color === color).map((s) => s!.square).sort()

const ENTERA = 'Nadie cambia en d4'
const SOLA = 'Negras cambia en d4'
const CERRADA = 'Negras empuja a c4'

/** Qué pasó con d4 en toda la línea. Cada línea cae en una sola forma. */
function formaDe(l: LineaCurso): string[] {
  const m = jugadas(l)
  const final = posicion(l.jugadas, l.jugadas.length)
  const r: string[] = []
  const cambio = m.findIndex((x) => x.color === 'b' && x.piece === 'p' && x.from[0] === 'c' && x.to === 'd4' && !!x.captured)
  const retoma = cambio >= 0 && m[cambio + 1]?.piece === 'p' && m[cambio + 1]?.from[0] === 'c' && m[cambio + 1]?.to === 'd4'
  if (retoma) r.push(SOLA)
  if (m.some((x) => x.color === 'b' && x.piece === 'p' && x.from === 'c5' && x.to === 'c4')) r.push(CERRADA)
  if (cambio < 0 && !r.length && final.get('c3')?.type === 'p' && final.get('c3')?.color === 'w') r.push(ENTERA)
  // la cadena de blancas sigue en pie al final de toda lección: d4 y e5
  expect(final.get('d4'), l.id).toMatchObject({ type: 'p', color: 'w' })
  expect(final.get('e5'), l.id).toMatchObject({ type: 'p', color: 'w' })
  return r
}

/** La tabla del MAPA (`iterations/v4/mapa-avance-*.md`): forma y porcentaje de cada lección en 600–1000 y 1000–1400. */
const TABLA: Record<string, { forma: string; seccion: string; pct: [number | null, number | null] }> = {
  'caro-kann:w/af5': { forma: ENTERA, seccion: 'base', pct: [null, null] }, // tu jugada: se mide la respuesta, no tu cuarta
  'caro-kann:w/c5': { forma: SOLA, seccion: 'base', pct: [21.8, 29.5] },
  'francesa:w/cambio-d4': { forma: SOLA, seccion: 'base', pct: [7.5, 6.5] },
  'francesa:w/cge7': { forma: ENTERA, seccion: 'base', pct: [0, 3.7] },
  'francesa:w/principal': { forma: CERRADA, seccion: 'frecuentes', pct: [9.3, 15.7] },
  'francesa:w/lputian': { forma: SOLA, seccion: 'opcional', pct: [0, 0] },
  'francesa:w/euwe': { forma: SOLA, seccion: 'opcional', pct: [0, 1.7] },
  'francesa:w/wade': { forma: ENTERA, seccion: 'opcional', pct: [0, 0.7] },
  'francesa:w/cambio-alfil': { forma: ENTERA, seccion: 'opcional', pct: [0, 0.9] },
}
/** Las formas que salen en 5 % o más de las partidas del curso, en alguna banda (formas.mjs, media jugada 14). */
const FORMAS_5: Record<string, string[]> = { 'caro-kann:w': [ENTERA, SOLA], 'francesa:w': [ENTERA, SOLA] }

describe('Los cursos del Avance · las lecciones y su mapa', () => {
  it('cada curso es el de su tarjeta, con blancas, y lleva sus secciones en el orden de la tabla', () => {
    for (const c of [CK, FR]) {
      expect(c.color).toBe('w')
      expect(c.secciones!.flatMap((s) => s.variantes)).toEqual(c.variantes.map((v) => v.id))
      for (const v of c.variantes) expect(c.secciones!.find((s) => s.variantes.includes(v.id))!.id, v.id).toBe(TABLA[`${c.id}/${v.id}`]!.seccion)
    }
    expect(CK.nombre).toBe('Avance contra la Caro-Kann')
    expect(FR.nombre).toBe('Avance contra la Francesa')
    expect(obligatorias(CK)).toHaveLength(2)
    expect(opcionales(CK)).toHaveLength(0)
    expect(obligatorias(FR)).toHaveLength(3)
    expect(opcionales(FR)).toHaveLength(4)
  })

  it('cada etiqueta dice qué pasó con d4 en toda la línea (chess.js): una sola forma por lección', () => {
    for (const c of [CK, FR])
      for (const l of variantes(c)) {
        expect(formaDe(l), l.id).toEqual([TABLA[`${c.id}/${l.variante!.id}`]!.forma])
        expect(l.variante!.estructura, l.id).toBe(TABLA[`${c.id}/${l.variante!.id}`]!.forma)
      }
  })

  it('la regla de obligatorio y opcional, con los números medidos: la más jugada de cada forma de 5 % o más, y la que sola llega a 2 %', () => {
    for (const c of [CK, FR]) {
      const filas = c.variantes.map((v) => ({ v, ...TABLA[`${c.id}/${v.id}`]! }))
      const max = (p: [number | null, number | null]) => Math.max(p[0] ?? 0, p[1] ?? 0)
      for (const f of filas) {
        const deSuForma = filas.filter((x) => x.forma === f.forma)
        // contra la Caro-Kann la lección de 3...Af5 se separa por tu cuarta jugada: es la de su forma (nota 3 del 2026-11-25)
        const laMasJugada = f.pct[0] === null || deSuForma.every((x) => x === f || x.pct[0] === null || max(x.pct) <= max(f.pct))
        const porForma = FORMAS_5[c.id]!.includes(f.forma) && laMasJugada
        const porFrecuencia = max(f.pct) >= 2
        expect(f.seccion !== 'opcional', `${c.id} ${f.v.id}`).toBe(porForma || porFrecuencia)
        // "La base": una lección por forma; "Las que más te van a salir": por frecuencia
        if (f.seccion === 'base') expect(porForma, f.v.id).toBe(true)
        if (f.seccion === 'frecuentes') expect(porForma, f.v.id).toBe(false)
      }
    }
  })

  it('contra la Caro-Kann, tu jugada es una sola: 4.c3; tus otras cuartas jugadas de la base van en "buenas"', () => {
    const c3 = CK.mias['e4 c6 d4 d5 e5 Bf5 c3']!
    for (const s of ['Nf3', 'Nc3', 'h4', 'g4', 'Ne2']) expect(c3.buenas, s).toContain(s)
  })

  it('si dos lecciones llegan a la misma posición, enseñan la misma jugada tuya (nota 7)', () => {
    for (const c of [CK, FR]) {
      const enseña = new Map<string, string>()
      for (const l of variantes(c))
        for (const ply of misJugadas(l)) {
          const fen = posicion(l.jugadas, ply).fen().split(' ').slice(0, 4).join(' ')
          const s = l.jugadas[ply]!
          expect(enseña.get(fen) ?? s, `${l.id} ${ply}`).toBe(s)
          enseña.set(fen, s)
        }
    }
  })

  it('las dos lecciones de La base de la Francesa no piden las mismas jugadas ni terminan en la misma posición (revisión del mapa)', () => {
    const [a, b] = obligatorias(FR).slice(0, 2).map((v) => lineaPorId(FR, `v:${v.id}`)!)
    const mias = (l: LineaCurso) => misJugadas(l).filter((p) => p > 6).map((p) => l.jugadas[p])
    expect(mias(a!).filter((s) => mias(b!).includes(s))).toEqual(['Nf3'])
    expect(posicion(a!.jugadas, a!.jugadas.length).fen()).not.toBe(posicion(b!.jugadas, b!.jugadas.length).fen())
  })

  it('cada introducción abre nombrando su forma y no nombra ni la casilla de una jugada tuya que la línea te va a pedir', () => {
    const nombre: Record<string, RegExp> = { [ENTERA]: /^Estás en la cadena entera[:,]/, [SOLA]: /^Estás en la (base sola|cadena entera, pero negras cambia en d4)/, [CERRADA]: /^Estás en la cadena entera, pero con \.\.\.c4 negras la cierra/ }
    for (const c of [CK, FR])
      for (const l of variantes(c)) {
        const intro = l.variante!.intro
        expect(intro, l.id).toMatch(nombre[l.variante!.estructura!]!)
        expect(adelanta(l, l.desde - 1, intro), l.id).toEqual([])
        const m = jugadas(l)
        const primera = intro.split(/(?<=\.)\s/)[0]!
        // desde el tronco: 1.e4 y 2.d4 los comparten todas las lecciones, y d4 es la base de la que habla cada forma
        // (en una captura, la casilla es donde ya está la pieza del rival: contexto, como en `curso-contenido`)
        for (const ply of misJugadas(l).filter((p) => p >= 4 && !m[p]!.captured)) expect(primera, `${l.id}: ${m[ply]!.san}`).not.toMatch(new RegExp(`\\b${m[ply]!.to}\\b`))
        expect(palabras(intro), l.id).toBeLessThanOrEqual(45)
      }
  })

  it('si la siguiente jugada natural de negras cambia la forma, la introducción lo dice (nota 3): 3...Af5 y la Wade', () => {
    for (const [c, id] of [[CK, 'af5'], [FR, 'wade']] as const) expect(c.variantes.find((v) => v.id === id)!.intro, id).toContain('pasas a la base sola')
  })

  it('la página de cada forma: sus peones son los de la forma (chess.js)', () => {
    for (const c of [CK, FR]) {
      const pagina = (t: string) => c.piezas.estructura.paginas.find((p) => p.subtitulo === t)
      const entera = new Chess(pagina('La cadena entera')!.tablero!.fen!)
      expect(peones(entera, 'w')).toEqual(expect.arrayContaining(['c3', 'd4', 'e5']))
      expect(peones(entera, 'b')).toEqual(expect.arrayContaining(['c5', 'd5', 'e6']))
      const sola = new Chess(pagina('La base sola')!.tablero!.fen!)
      expect(peones(sola, 'w').some((s) => s[0] === 'c') || peones(sola, 'b').some((s) => s[0] === 'c')).toBe(false)
      expect(peones(sola, 'w')).toEqual(expect.arrayContaining(['d4', 'e5']))
    }
    const cerrada = new Chess(FR.piezas.estructura.paginas.find((p) => p.subtitulo === 'La cadena cerrada')!.tablero!.fen!)
    expect(cerrada.get('c4')).toMatchObject({ type: 'p', color: 'b' })
    expect(cerrada.attackers('d4', 'b')).toEqual([])
    expect(CK.piezas.estructura.paginas.map((p) => p.subtitulo)).toEqual(['El mapa', 'La cadena entera', 'La base sola'])
    expect(FR.piezas.estructura.paginas.map((p) => p.subtitulo)).toEqual(['El mapa', 'La cadena entera', 'La base sola', 'La cadena cerrada'])
  })

  it('El mapa: la pregunta es la misma en los dos cursos, y su paso a paso enseña cada forma en el tablero', () => {
    for (const c of [CK, FR]) {
      const mapa = c.piezas.estructura.paginas[0]!
      expect(mapa.texto[0]).toContain('¿qué pasó con d4?')
      const fotos = fotosDePasos(mapa.pasoAPaso!)
      const enPaso = (inicio: string) => new Chess(fotos[mapa.pasoAPaso!.pasos.findIndex((p) => p.frase.startsWith(inicio))]!.fen)
      expect(enPaso('La cadena entera').get('c3')).toMatchObject({ type: 'p', color: 'w' })
      const sola = enPaso('La base sola')
      expect(peones(sola, 'w').concat(peones(sola, 'b')).some((s) => s[0] === 'c')).toBe(false)
      if (c === FR) expect(enPaso('La cadena cerrada').get('c4')).toMatchObject({ type: 'p', color: 'b' })
    }
  })

  it('los «¿Y si…?» son errores tuyos que negras castiga: juegas con negras', () => {
    for (const c of [CK, FR]) {
      expect(c.piezas.errores.lista.map((e) => [e.de, e.lado])).toEqual(c.piezas.errores.lista.map(() => ['tuyo', 'b']))
      for (const e of c.piezas.errores.lista) {
        // la jugada equivocada es tuya (de blancas), y el castigo gana material (chess.js)
        const ch = new Chess()
        e.jugadas.forEach((s) => ch.move(s))
        const valor = (color: 'w' | 'b') => ch.board().flat().filter((s) => s?.color === color).reduce((t, s) => t + ({ p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 } as const)[s!.type], 0)
        expect(valor('b') - valor('w'), e.id).toBeGreaterThan(0)
        expect(e.desde % 2, e.id).toBe(0)
      }
    }
  })
})

describe('Los cursos del Avance · lo guardado, el Repaso y Refuerza', () => {
  it('lo guardado de cada lección vieja que sigue siendo obligatoria pasa a la nueva de la misma línea; lo demás se queda', () => {
    const viejo = {
      'caro-kann:w/w:caro-kann/avance-short': { escalon: 2 },
      'caro-kann:w/w:caro-kann/avance-tal': { escalon: 1 },
      'francesa:w/w:francesa/paulsen': { escalon: 3 },
      'francesa:w/w:francesa/lputian': { escalon: 1 },
      'italiana:w/w:italiana/paris': { escalon: 1 },
    }
    const nuevo = pasarAvance(viejo)
    expect(nuevo['caro-kann:w/w:caro-kann/avance-curso-short']).toEqual({ escalon: 2 })
    expect(nuevo['caro-kann:w/w:caro-kann/avance-short']).toBeUndefined()
    expect(nuevo['francesa:w/w:francesa/curso-paulsen']).toEqual({ escalon: 3 })
    // tu otra cuarta jugada y la opcional no se mudan: se quedan guardadas y dejan de salir
    expect(nuevo['caro-kann:w/w:caro-kann/avance-tal']).toEqual({ escalon: 1 })
    expect(nuevo['francesa:w/w:francesa/lputian']).toEqual({ escalon: 1 })
    expect(nuevo['italiana:w/w:italiana/paris']).toEqual({ escalon: 1 })
    // cada lección nueva de la tabla existe, y es obligatoria
    for (const [prefijo, tabla] of Object.entries(LECCIONES_AVANCE)) {
      const c = CURSOS_NUEVOS[prefijo.split('/')[0]!]!
      for (const nueva of Object.values(tabla)) expect(obligatorias(c).map((v) => v.base), nueva).toContain(nueva)
    }
  })

  it('el Repaso solo trae lo obligatorio de estos cursos: las opcionales van marcadas (el filtro común de main)', () => {
    for (const c of [CK, FR]) {
      const curso = cursos().find((x) => x.id === c.id)!
      expect(curso.lecciones.filter((l) => !l.opcional).map((l) => l.id.split('/').pop())).toEqual(obligatorias(c).map((v) => v.base))
      expect(curso.lecciones.filter((l) => l.opcional).map((l) => l.id.split('/').pop())).toEqual(opcionales(c).map((v) => v.base))
    }
  })

  it('Refuerza solo recorre las líneas obligatorias de estos cursos (soloObligatorias); los demás cursos, como siempre', () => {
    const rep = soloObligatorias(repertorioCompleto())
    for (const c of [CK, FR]) {
      const lineas = rep.lineas.filter((l) => l.apertura === c.apertura && l.color === c.color)
      expect(lineas.map((l) => l.claveBase).sort()).toEqual(obligatorias(c).map((v) => `${c.apertura}/${v.base}`).sort())
      for (const v of obligatorias(c)) expect(lineas.find((l) => l.claveBase === `${c.apertura}/${v.base}`)!.jugadas).toEqual(jugadasDeVariante(c, v))
    }
    // una apertura sin curso por estructuras no cambia
    const todas = repertorioCompleto()
    expect(rep.lineas.filter((l) => l.apertura === 'italiana').length).toBe(todas.lineas.filter((l) => l.apertura === 'italiana').length)
  })

  it('el filtro distingue por apertura y color: la Caro-Kann con blancas (el Avance) no choca con la de negras', () => {
    const negras = cursoNuevo('caro-kann-estructuras:b')!
    // una opcional de la Caro-Kann de negras es opcional con negras, no con blancas
    for (const v of opcionales(negras)) {
      expect(esLeccionOpcional('caro-kann', 'b', v.base), v.base).toBe(true)
      expect(esLeccionOpcional('caro-kann', 'w', v.base), v.base).toBe(false)
    }
    // las lecciones del Avance contra la Caro-Kann son obligatorias con blancas
    for (const v of obligatorias(CK)) expect(esLeccionOpcional('caro-kann', 'w', v.base), v.base).toBe(false)
    // Refuerza: con blancas, solo las dos del Avance; con negras, solo las obligatorias del curso de negras
    const rep = soloObligatorias(repertorioCompleto())
    expect(rep.lineas.filter((l) => l.apertura === 'caro-kann' && l.color === 'w').map((l) => l.claveBase).sort()).toEqual(obligatorias(CK).map((v) => `caro-kann/${v.base}`).sort())
    const deNegras = rep.lineas.filter((l) => l.apertura === 'caro-kann' && l.color === 'b').map((l) => l.claveBase!.split('/')[1])
    expect(deNegras.length).toBeGreaterThan(0)
    for (const b of deNegras) expect(negras.variantes.some((v) => v.base === b && !opcionales(negras).includes(v)), b).toBe(true)
  })
})
