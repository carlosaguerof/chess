import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess, type Move } from 'chess.js'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { CURSOS_NUEVOS, grupoDeLinea, jugadasDeVariante, leccionIdDe, leccionesDe, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { componerCurso } from '../../src/curso/capas.ts'
import { adelanta } from '../../src/curso/adelantar.ts'
import { fotosDePasos } from '../../src/curso/pasos.ts'
import { palabras, posicion } from '../../src/curso/textos.ts'
import { pasosDelCurso, siguientePaso } from '../../src/pantallas/CursoPagina.tsx'
import { cursos } from '../../src/cursos/datos.ts'
import { dia, paraHoy, sumarDias } from '../../src/repaso/repaso.ts'
import { cursoActivo } from '../../src/aprender/interruptores.ts'
import { lineasDe as lineasDeFavorita, repertorioCompleto } from '../../src/aprender/favoritas.ts'
import type { AvanceCurso } from '../../src/curso/avance.ts'
import type { CapaCurso, LineaCurso, PaginaLeer } from '../../src/curso/tipos.ts'

/**
 * El curso de la Caro-Kann por estructuras (`specs/cursos.md` §6): las mismas jugadas con otra organización, para que
 * Carlos compare. Aquí, lo que sale de la capa y lo que sus textos afirman, medido con chess.js. Las reglas de contenido
 * que valen para todo curso corren sobre los dos: `vite.config.ts`, proyecto "curso por estructuras".
 */
const actual = CURSOS_NUEVOS['caro-kann:b']!
const nuevo = CURSOS_NUEVOS['caro-kann-estructuras:b']!
const capa = JSON.parse(readFileSync('conocimiento/cursos/caro-kann-estructuras.json', 'utf8')) as CapaCurso
const linea = (id: string) => lineaPorId(nuevo, `v:${id}`)!

/** La tabla de §4.2 del prompt: lo que Carlos aprobó. */
const CADENA = 'Blancas empuja a e5'
const CAMBIO = 'Blancas cambia en d5'
const CLASICA = 'Tú cambias en e4'
const TENSION = 'Nadie cambia peones'
const TABLA: [string, string, boolean, [string, string | undefined][]][] = [
  ['La base', 'base', false, [['avance-short', CADENA], ['cambio', CAMBIO], ['clasica', CLASICA], ['dos-caballos', TENSION]]],
  ['Las que más te van a salir', 'frecuentes', false, [['avance-van-der-wiel', CADENA], ['oferta-final', undefined], ['breyer', TENSION], ['hillbilly', undefined]]],
  ['Opcional', 'opcional', true, [['avance-c3', CADENA], ['avance-tal', CADENA], ['avance-bayoneta', CADENA], ['avance-bronstein', CADENA], ['panov', CAMBIO], ['apocalipsis', CAMBIO], ['panov-acelerado', CAMBIO], ['fantasia', TENSION]]],
]

/** Las jugadas de una línea, con lo que hizo cada una. */
function jugadas(l: LineaCurso): Move[] {
  const ch = new Chess()
  return l.jugadas.map((s) => ch.move(s))
}
const peones = (ch: Chess, color: 'w' | 'b') => ch.board().flat().filter((s) => s && s.type === 'p' && s.color === color).map((s) => s!.square).sort()
const alFinal = (l: LineaCurso) => posicion(l.jugadas, l.jugadas.length)

/**
 * Qué estructura dicen las jugadas de una línea. Se mira toda la línea, no solo su final: en la Bayoneta blancas empuja a
 * e5 y después entrega ese peón. Cada línea cae en una sola; las dos de fuera del mapa, en ninguna.
 */
function estructuraDe(l: LineaCurso): string[] {
  const m = jugadas(l)
  const r: string[] = []
  if (m.some((x) => x.color === 'w' && x.from === 'e4' && x.to === 'e5')) r.push(CADENA)
  if (m.some((x) => x.color === 'w' && x.from === 'e4' && x.to === 'd5')) r.push(CAMBIO)
  // capturas en e4 y blancas retoma con una pieza: si retoma con un peón, sigue habiendo un peón blanco en e4; si no retoma, te quedas con él
  if (m.some((x, i) => x.color === 'b' && x.from === 'd5' && x.to === 'e4' && m[i + 1]?.to === 'e4' && m[i + 1]?.piece !== 'p')) r.push(CLASICA)
  const final = alFinal(l)
  const capturasAlCentro = m.some((x) => x.captured && (x.to === 'e4' || x.to === 'd5'))
  if (final.get('e4')?.type === 'p' && final.get('e4')?.color === 'w' && final.get('d5')?.type === 'p' && final.get('d5')?.color === 'b' && !capturasAlCentro) r.push(TENSION)
  return r
}

describe('El curso por estructuras · la capa', () => {
  it('se llama como dijo Carlos y sale del curso actual', () => {
    expect(nuevo.id).toBe('caro-kann-estructuras:b')
    expect(nuevo.nombre).toBe('Caro-Kann por estructuras')
    expect(nuevo.fichasDe).toBe('caro-kann:b')
  })

  it('el archivo trae solo lo que cambia: ni explicaciones, ni planes, ni la lista de fuentes', () => {
    const texto = JSON.stringify(capa)
    for (const k of ['mias', 'rival', 'plan', 'variantes']) expect(Object.keys(capa), k).not.toContain(k)
    expect(texto).not.toContain('"pregunta"')
    expect(Object.keys(capa.fuentes ?? {})).toEqual(['AJEDREZ'])
    // el párrafo que se queda igual no se copia: se pide por su lugar
    expect(texto).not.toContain(actual.piezas.idea.paginas[0]!.texto[0]!)
  })

  it('las explicaciones, los planes y el glosario son los del curso actual: una corrección llega a los dos', () => {
    expect(nuevo.mias).toBe(actual.mias)
    expect(nuevo.rival).toBe(actual.rival)
    // el plan es el mismo objeto, salvo el del Cambio, que cambia en su frase de la ruptura
    for (const v of nuevo.variantes) if (v.id !== 'cambio') expect(v.plan, v.id).toBe(actual.variantes.find((x) => x.id === v.id)!.plan)
    for (const g of actual.glosario) expect(nuevo.glosario, g.termino).toContainEqual(g)
    for (const [k, f] of Object.entries(actual.fuentes)) expect(nuevo.fuentes[k]).toBe(f)
    // el glosario sigue en orden
    expect(nuevo.glosario.map((g) => g.termino)).toEqual(nuevo.glosario.map((g) => g.termino).sort((a, b) => a.localeCompare(b, 'es')))
  })

  it('si un texto que la capa cambia ya no existe en el curso actual, el curso no carga', () => {
    const roto = structuredClone(capa)
    roto.secciones[0]!.lecciones[0]!.cambia = [['Esto no está', 'x']]
    expect(() => componerCurso(actual, roto)).toThrow('no encontré')
    expect(() => componerCurso(actual, { ...capa, de: 'otro:b' })).toThrow()
    for (const campo of ['idea', 'planTuyo', 'pasosDelPlan'] as const) {
      const r = structuredClone(capa)
      r.secciones[0]!.lecciones[1]![campo] = [['Esto no está', 'x']]
      expect(() => componerCurso(actual, r), campo).toThrow('no encontré')
    }
  })

  it('el curso actual no lleva secciones: su página se ve como hoy', () => {
    expect(actual.secciones).toBeUndefined()
    expect(actual.fichasDe).toBeUndefined()
    expect(obligatorias(actual)).toHaveLength(16)
    expect(opcionales(actual)).toEqual([])
    expect(actual.variantes.every((v) => v.estructura === undefined)).toBe(true)
  })
})

describe('El curso por estructuras · las lecciones', () => {
  it('las secciones, sus lecciones y su orden, tal como la tabla', () => {
    expect(nuevo.secciones!.map((s) => [s.titulo, s.id, !!s.opcional, s.variantes])).toEqual(TABLA.map(([t, id, o, ls]) => [t, id, o, ls.map(([x]) => x)]))
    expect(nuevo.variantes.map((v) => [v.id, v.estructura])).toEqual(TABLA.flatMap(([, , , ls]) => ls))
    expect(nuevo.secciones![2]!.nota).toBe('No cuentan para terminar el curso.')
    expect(obligatorias(nuevo)).toHaveLength(8)
    expect(opcionales(nuevo)).toHaveLength(8)
  })

  it('ninguna jugada cambia: las mismas 16 líneas, y Avance 4.Cf3 sigue siendo la primera, la que empieza desde 1.e4', () => {
    const lineas = (c: typeof nuevo) => lineasDe(c).filter((l) => l.tipo === 'variante').map((l) => [l.id, l.jugadas, l.desde]).sort()
    expect(lineas(nuevo)).toEqual(lineas(actual))
    expect(nuevo.variantes[0]!.id).toBe('avance-short')
    expect(nuevo.variantes[0]!.desde).toBe(0)
  })

  it('cada etiqueta dice lo que pasa en su línea, y las dos sin etiqueta quedan de verdad fuera de las cuatro formas (chess.js)', () => {
    for (const v of nuevo.variantes) expect(estructuraDe(linea(v.id)), v.id).toEqual(v.estructura ? [v.estructura] : [])
    // y la medida distingue: la Clásica no se confunde con 3.d3, donde blancas retoma con un peón, ni con 2.Ac4, donde no retoma
    expect(jugadas(linea('oferta-final')).some((x) => x.san === 'dxe4')).toBe(true)
    expect(jugadas(linea('hillbilly')).some((x) => x.san === 'dxe4')).toBe(true)
  })

  it('"Variante N de 8" y "Opcional N de 8": cada lección camina con las de su grupo', () => {
    expect(grupoDeLinea(nuevo, linea('avance-short')).map((l) => l.variante!.id)).toEqual(TABLA.slice(0, 2).flatMap(([, , , ls]) => ls.map(([x]) => x)))
    expect(grupoDeLinea(nuevo, linea('panov')).map((l) => l.variante!.id)).toEqual(TABLA[2]![3].map(([x]) => x))
    expect(grupoDeLinea(actual, lineaPorId(actual, 'v:panov')!)).toHaveLength(16)
    expect(grupoDeLinea(nuevo, lineaPorId(nuevo, 'e:tal-e6')!)).toHaveLength(2)
  })

  it('"Seguir" y lo que sigue no pasan por las opcionales; con lo obligatorio hecho, no hay nada que seguir', () => {
    const vacio: AvanceCurso = { piezas: {}, variantes: {}, errores: {} }
    expect(pasosDelCurso(nuevo, vacio).map((p) => p.id)).toEqual(['idea', 'estructura', ...obligatorias(nuevo).map((v) => `v:${v.id}`), 'errores', 'repaso'])
    // una opcional a medias no es lo que sigue
    const enOpcional: AvanceCurso = { ...vacio, enCurso: { linea: 'v:panov', vuelta: 'aprender', ply: 5, fecha: 1 } }
    expect(siguientePaso(nuevo, enOpcional)?.id).toBe('idea')
    const hecho = { aprendida: 1, terminada: 1 }
    const todo: AvanceCurso = { piezas: { idea: 1, estructura: 1, errores: 1, repaso: 1 }, variantes: Object.fromEntries(obligatorias(nuevo).map((v) => [v.id, hecho])), errores: {} }
    expect(siguientePaso(nuevo, todo)).toBeUndefined()
    // en el curso actual, todas siguen contando
    expect(pasosDelCurso(actual, vacio)).toHaveLength(2 + 16 + 2)
  })
})

describe('El curso por estructuras · los textos', () => {
  const pagina = (titulo: string) => nuevo.piezas.estructura.paginas.find((p) => p.subtitulo === titulo)!

  it('La idea: se quedan sus dos párrafos, y el tercero ya no promete la lista de la más común a la más rara', () => {
    const [a, b, c] = nuevo.piezas.idea.paginas[0]!.texto
    const hoy = actual.piezas.idea.paginas[0]!
    expect([a, b]).toEqual(hoy.texto.slice(0, 2))
    expect(c).toContain('qué pasó con el peón de e4')
    expect(c).not.toMatch(/más común|más rara/)
    expect(nuevo.piezas.idea.paginas[0]!.pasoAPaso).toBe(hoy.pasoAPaso)
  })

  it('La estructura trae cinco páginas, y la Cadena y la Clásica son las de hoy', () => {
    expect(nuevo.piezas.estructura.paginas.map((p) => p.subtitulo)).toEqual(['El mapa', 'La Cadena', 'El Cambio', 'La Clásica', 'La Tensión'])
    const sinTitulo = ({ subtitulo: _, ...p }: PaginaLeer) => p
    expect(sinTitulo(pagina('La Cadena'))).toEqual(sinTitulo(actual.piezas.estructura.paginas[0]!))
    expect(sinTitulo(pagina('La Clásica'))).toEqual(sinTitulo(actual.piezas.estructura.paginas[1]!))
  })

  it('El mapa: cada respuesta tiene su nombre, y el tablero la muestra', () => {
    const p = pagina('El mapa')
    expect(p.texto[0]).toContain('¿qué pasó con el peón de e4?')
    for (const [q, n] of [['empujó a e5', 'la Cadena'], ['cambió en d5', 'el Cambio'], ['capturaste en e4 y blancas retomó con una pieza', 'la Clásica'], ['Sigue en e4', 'la Tensión']]) expect(p.texto[1], q).toMatch(new RegExp(`${q}: ${n}`))
    const fotos = fotosDePasos(p.pasoAPaso!)
    const cuando = (texto: string) => new Chess(fotos[p.pasoAPaso!.pasos.findIndex((x) => x.frase.startsWith(texto))]!.fen)
    // la Cadena: el peón llegó a e5
    expect(cuando('La Cadena').get('e5')).toMatchObject({ type: 'p', color: 'w' })
    expect(cuando('La Cadena').get('e4')).toBeUndefined()
    // el Cambio: en d5 quedó tu peón, retomado con el de c
    expect(cuando('El Cambio').get('d5')).toMatchObject({ type: 'p', color: 'b' })
    expect(cuando('El Cambio').get('c6')).toBeUndefined()
    // la Clásica: tu peón lo capturó
    expect(cuando('La Clásica').get('e4')).toMatchObject({ type: 'p', color: 'b' })
    // la Tensión: los dos peones siguen ahí, y nadie cambió peones
    const t = cuando('Después de 4.h3')
    expect(t.get('e4')).toMatchObject({ type: 'p', color: 'w' })
    expect(t.get('d5')).toMatchObject({ type: 'p', color: 'b' })
    expect(peones(t, 'w')).toHaveLength(8)
    expect(peones(t, 'b')).toHaveLength(8)
  })

  it('lo que une a las cuatro lecciones de La base: tu alfil de c8 sale antes de ...e6', () => {
    for (const id of nuevo.secciones![0]!.variantes) {
      const m = jugadas(linea(id))
      const alfil = m.findIndex((x) => x.color === 'b' && x.from === 'c8')
      const e6 = m.findIndex((x) => x.color === 'b' && x.san === 'e6')
      expect(alfil, id).toBeGreaterThan(0)
      if (e6 >= 0) expect(alfil, id).toBeLessThan(e6)
    }
  })

  it('El Cambio: sus peones son los del final de la lección con ...e6, y lo que dice de ellos es cierto', () => {
    const p = pagina('El Cambio')
    const ch = new Chess(p.tablero!.fen!)
    const final = alFinal(linea('cambio'))
    expect(peones(ch, 'w')).toEqual(peones(final, 'w'))
    expect(peones(ch, 'b')).toEqual(peones(final, 'b').map((s) => (s === 'e7' ? 'e6' : s)).sort())
    expect(p.texto[0]).toContain('Tus peones: d5 y e6. Los de blancas: c3 y d4.')
    // blancas no tiene peón en la columna e, y tú no tienes en la c
    expect(peones(ch, 'w').some((s) => s[0] === 'e')).toBe(false)
    expect(peones(ch, 'b').some((s) => s[0] === 'c')).toBe(false)
    // el ataque de minorías: tienes menos peones de ese lado, y ...b4 llega contra c3
    const lado = (color: 'w' | 'b') => peones(ch, color).filter((s) => 'abc'.includes(s[0]!)).length
    expect(lado('b')).toBeLessThan(lado('w'))
    expect(ch.get('c3')).toMatchObject({ type: 'p', color: 'w' })
    // el paso a paso sale de la misma posición, con el turno de negras para ...b5
    expect(p.pasoAPaso!.fen!.split(' ')[0]).toBe(p.tablero!.fen!.split(' ')[0])
    expect(p.pasoAPaso!.soloPeones && p.tablero!.soloPeones).toBe(true)
  })

  it('La Tensión: la posición es la de Dos Caballos tras 5...e6, y las tres salidas son jugadas legales', () => {
    const p = pagina('La Tensión')
    const dc = linea('dos-caballos')
    expect(dc.jugadas.at(-1)).toBe('e6')
    expect(p.tablero!.jugadas).toEqual(dc.jugadas)
    expect(p.tablero!.soloPeones).toBe(true)
    const ch = alFinal(dc)
    expect(p.pasoAPaso!.fen).toBe(ch.fen())
    expect(peones(ch, 'b')).toEqual(['a7', 'b7', 'c6', 'd5', 'e6', 'f7', 'g7', 'h7'])
    expect(peones(ch, 'w')).toContain('e4')
    expect(peones(ch, 'w')).toContain('d2')
    expect(p.texto[0]).toContain('el centro todavía no se decide')
    expect(p.texto[1]).toContain('puede terminar en otra forma')
    // el peón de e4 y el de d5 se atacan
    expect(ch.attackers('d5', 'w')).toContain('e4')
    expect(ch.attackers('e4', 'b')).toContain('d5')
    const fotos = fotosDePasos(p.pasoAPaso!)
    expect(peones(new Chess(fotos[3]!.fen), 'w')).toEqual(expect.arrayContaining(['d4', 'e5']))
    expect(new Chess(fotos[4]!.fen).get('d5')).toMatchObject({ type: 'p', color: 'b' })
    expect(peones(new Chess(fotos[4]!.fen), 'b')).not.toContain('c6')
    // la captura en e4 no se juega: la frase no dice con qué pieza retoma blancas, y lleva su flecha de plan (`specs/cursos.md` §2.1, regla 4)
    const captura = p.pasoAPaso!.pasos[5]!
    expect(captura.jugadas).toBeUndefined()
    expect(captura.marcas).toEqual([{ tipo: 'A3', de: 'd5', a: 'e4', color: 'verde', punteada: true }])
    expect(fotos[5]!.fen).toBe(ch.fen())
  })

  it('cada introducción abre con su frase y sigue con la de hoy; "La más común" se fue', () => {
    const frases = capa.secciones.flatMap((s) => s.lecciones)
    expect(frases).toHaveLength(16)
    for (const l of frases) {
      const hoy = actual.variantes.find((v) => v.id === l.id)!.intro
      const v = nuevo.variantes.find((x) => x.id === l.id)!
      expect(v.intro.startsWith(`${l.frase} `), l.id).toBe(true)
      if (l.id === 'avance-short') expect(v.intro.slice(l.frase.length + 1)).toBe(hoy.replace('La más común. ', ''))
      else expect(v.intro.slice(l.frase.length + 1), l.id).toBe(hoy)
      expect(v.intro, l.id).not.toMatch(/más común|más rara|última|siguiente variante/i)
    }
  })

  it('cada frase es una sola, nombra su estructura (o dice que queda fuera del mapa) y dice lo que se busca', () => {
    const nombre: Record<string, RegExp> = { [CADENA]: /^Estás en la Cadena: /, [CAMBIO]: /^Estás en el Cambio[:,] /, [CLASICA]: /^Estás en la Clásica: /, [TENSION]: /^Estás en la Tensión: / }
    for (const l of capa.secciones.flatMap((s) => s.lecciones)) {
      expect(l.frase, l.id).toMatch(l.estructura ? nombre[l.estructura]! : /^Esta línea queda fuera del mapa: blancas /)
      if (l.estructura) expect(l.frase, l.id).toMatch(/tu objetivo es/)
      expect(l.frase.match(/\.(\s|$)/g), l.id).toHaveLength(1)
      expect(l.fuente.length, l.id).toBeGreaterThan(0)
    }
  })

  it('la frase nueva no nombra ninguna jugada tuya que la línea te va a pedir, ni su casilla', () => {
    for (const l of capa.secciones.flatMap((s) => s.lecciones)) {
      const ln = linea(l.id)
      expect(adelanta(ln, ln.desde - 1, l.frase), l.id).toEqual([])
      expect(l.frase, l.id).not.toContain('...')
      const m = jugadas(ln)
      for (const ply of misJugadas(ln)) expect(l.frase, `${l.id}: ${m[ply]!.san}`).not.toMatch(new RegExp(`\\b${m[ply]!.to}\\b`))
    }
  })

  it('lo que hace blancas en las dos de fuera del mapa, y en las que dicen que no ha jugado d4', () => {
    // 2.Cf3 y 3.d3: es la única línea que termina sin peón blanco en la columna d
    const sinD = nuevo.variantes.filter((v) => !peones(alFinal(linea(v.id)), 'w').some((s) => s[0] === 'd')).map((v) => v.id)
    expect(sinD).toEqual(['oferta-final'])
    // 2.Ac4: después de 1.e4, solo mueve su alfil y su dama, y los dos llegan a atacar f7
    const hill = linea('hillbilly')
    expect(jugadas(hill).filter((x) => x.color === 'w').map((x) => x.piece)).toEqual(['p', 'b', 'b', 'q'])
    const antes = posicion(hill.jugadas, hill.jugadas.length - 1)
    expect(antes.attackers('f7', 'w').sort()).toEqual(['b3', 'h5'])
    // 2.c4: blancas cambia también su peón de c
    expect(jugadas(linea('panov-acelerado')).some((x) => x.color === 'w' && x.from[0] === 'c' && x.piece === 'p' && !!x.captured)).toBe(true)
    // en las que dicen que blancas no tiene peón en d4 o no lo ha jugado
    for (const id of ['breyer', 'apocalipsis']) expect(jugadas(linea(id)).some((x) => x.color === 'w' && x.piece === 'p' && x.to === 'd4'), id).toBe(false)
  })

  it('El Panov lleva un peón blanco en c4, el centro se abre pronto en 2.c4, y el peón de d4 del Panov puede quedar aislado (chess.js)', () => {
    expect(alFinal(linea('panov')).get('c4')).toMatchObject({ type: 'p', color: 'w' })
    const c4 = alFinal(linea('panov-acelerado'))
    expect(c4.board().flat().filter((s) => s && s.type === 'p' && (s.square[1] === '4' || s.square[1] === '5') && 'cde'.includes(s.square[0]!))).toEqual([])
    // si blancas cambia en d5 y retomas, ya no le queda peón de c ni de e junto al de d4
    const panov = alFinal(linea('panov'))
    panov.move('cxd5')
    panov.move('Nxd5')
    const blancas = peones(panov, 'w')
    expect(blancas).toContain('d4')
    expect(blancas.some((s) => s[0] === 'c' || s[0] === 'e')).toBe(false)
  })

  it('Errores y trampas: solo los dos que dijo Carlos, y la frase de arriba lo dice', () => {
    expect(nuevo.piezas.errores.lista.map((e) => e.id)).toEqual(['tal-e6', 'cambio-dc7'])
    expect(nuevo.piezas.errores.intro).toMatch(/^Dos «¿Y si…\?»: errores tuyos/)
    expect(nuevo.piezas.errores.intro).not.toMatch(/Cuatro|tres|castigas tú/)
    expect(actual.piezas.errores.lista).toHaveLength(4)
  })

  it('Repaso del curso: igual que hoy, con la pregunta del mapa al abrir y "para que tu alfil tenga h7"', () => {
    const [p, q] = nuevo.piezas.repaso.paginas
    const [hoy, guia] = actual.piezas.repaso.paginas
    expect(p!.texto[0]).toContain('¿qué pasó con el peón de e4?')
    expect(p!.texto[1]).toBe('La idea: tu alfil de casillas blancas sale antes de ...e6. Después, el plan depende de la estructura: en la Cadena golpeas el centro con ...c5; en la Clásica también, después de sacar tus piezas y enrocar; en el Cambio, con una torre en b8, avanzas ...b5 y ...b4, cuidando de no regalar el peón; en la Tensión sacas tus piezas.')
    expect(p!.texto[2]).toBe(hoy!.texto[1]!.replace('para que tenga h7', 'para que tu alfil tenga h7'))
    expect(p!.texto[2]).not.toContain('para que tenga h7')
    expect(p!.pasoAPaso).toBe(hoy!.pasoAPaso)
    expect(q).toEqual(guia)
    // el curso actual se queda con su texto: es de otro lote
    expect(hoy!.texto[1]).toContain('para que tenga h7')
  })

  it('el Cambio pide la torre en b8 en su plan y en su paso a paso, sin tocar lo demás, y sus marcas se quedan', () => {
    const v = nuevo.variantes.find((x) => x.id === 'cambio')!
    const hoy = actual.variantes.find((x) => x.id === 'cambio')!
    expect(v.plan.tuyo).toBe(hoy.plan.tuyo.replace('Después, adelanta ...b5 y ...b4:', 'Después, con una torre en b8, adelanta ...b5 y ...b4, sin regalar el peón:'))
    // un paso nuevo enseña la torre en el tablero; los demás conservan sus jugadas y sus marcas
    const pasos = v.plan.pasoAPaso!.pasos
    const i = pasos.findIndex((x) => x.jugadas?.[0] === '...Rab8')
    expect(pasos[i]!.frase).toContain('...Tab8')
    expect(pasos[i + 1]!.frase).toBe('Después, con una torre en b8, adelantas ...b5 y ...b4, cuidando de no regalar el peón: es el ataque de minorías.')
    const sinElNuevo = pasos.filter((_, k) => k !== i)
    expect(sinElNuevo.map((x) => x.marcas)).toEqual(hoy.plan.pasoAPaso!.pasos.map((x) => x.marcas))
    expect(sinElNuevo.map((x) => x.jugadas)).toEqual(hoy.plan.pasoAPaso!.pasos.map((x) => x.jugadas))
    // con la torre en b8 y el peón en b5, la torre lo defiende (chess.js)
    const fotos = fotosDePasos(v.plan.pasoAPaso!, jugadasDeVariante(nuevo, v))
    const ch = new Chess(fotos[i]!.fen)
    expect(ch.get('b8')).toMatchObject({ type: 'r', color: 'b' })
    ch.remove('b7')
    ch.put({ type: 'p', color: 'b' }, 'b5')
    expect(ch.attackers('b5', 'b')).toContain('b8')
    for (const k of ['rival', 'marcas', 'marcasDe', 'fuente'] as const) expect(v.plan[k], k).toBe(hoy.plan[k])
    // en el curso actual se queda; es un pendiente de otro lote
    expect(hoy.plan.tuyo).toContain('Después, adelanta ...b5 y ...b4')
  })

  it('la idea de la Clásica nombra a tu alfil, solo en este curso, y las demás ideas son las de hoy', () => {
    const clasica = nuevo.variantes.find((x) => x.id === 'clasica')!
    const hoy = actual.variantes.find((x) => x.id === 'clasica')!
    expect(clasica.idea).toBe(hoy.idea.replace('para que tenga h7', 'para que tu alfil tenga h7'))
    expect(hoy.idea).toContain('para que tenga h7')
    for (const v of nuevo.variantes) if (v.id !== 'clasica') expect(v.idea, v.id).toBe(actual.variantes.find((x) => x.id === v.id)!.idea)
  })

  it('la página del Cambio: primero sacas tus piezas y enrocas, y después la ruptura, en el texto y en el paso a paso', () => {
    const p = pagina('El Cambio')
    expect(p.texto[1]).toMatch(/^Primero sacas tus piezas y enrocas\. Después, con una torre en b8, tu ruptura: \.\.\.b5 y \.\.\.b4, contra c3, cuidando de no regalar el peón\./)
    const pasos = p.pasoAPaso!.pasos
    const i = pasos.findIndex((x) => x.frase === 'Primero sacas tus piezas y enrocas.')
    expect(i).toBeGreaterThan(0)
    expect(pasos[i]!.jugadas).toBeUndefined()
    expect(pasos[i + 1]!.frase).toContain('tu ruptura empieza con ...b5')
  })

  it('cada fuente citada existe, y cada término nuevo está en el glosario', () => {
    const citadas = [...capa.secciones.flatMap((s) => s.lecciones.flatMap((l) => l.fuente)), ...nuevo.piezas.estructura.paginas.flatMap((p) => p.fuente)]
    for (const f of citadas) expect(nuevo.fuentes[f], f).toBeDefined()
    const terminos = nuevo.glosario.map((g) => g.termino)
    for (const t of ['Ataque de minorías', 'Estructura', 'Tensión', 'Lado de dama y lado de rey', 'Cadena de peones', 'Peón aislado', 'Peón débil', 'Ruptura']) expect(terminos, t).toContain(t)
  })

  it('ninguna frase nueva pasa de 40 palabras con su introducción', () => {
    for (const v of nuevo.variantes) expect(palabras(v.intro), v.id).toBeLessThanOrEqual(40)
  })
})

describe('El curso por estructuras · una sola ficha de Repaso por línea', () => {
  it('cada lección usa la ficha de esa línea en el curso actual', () => {
    for (const v of nuevo.variantes) expect(leccionIdDe(nuevo, v), v.id).toBe(leccionIdDe(actual, actual.variantes.find((x) => x.id === v.id)!))
    expect(leccionesDe(nuevo).every((l) => l.cursoId === 'caro-kann:b')).toBe(true)
  })

  it('una obligatoria cuenta para el Repaso; una opcional no', () => {
    const lineas = lineasDe(nuevo).filter((l) => l.tipo === 'variante')
    for (const l of lineas) {
      if (obligatorias(nuevo).some((v) => v.id === l.variante!.id)) expect(l.leccionId, l.id).toBe(leccionIdDe(actual, actual.variantes.find((x) => x.id === l.variante!.id)!))
      else expect(l.leccionId, l.id).toBeUndefined()
    }
  })

  it('la tarjeta va justo después de la del curso actual, y no trae lecciones: ninguna línea sale dos veces', () => {
    const lista = cursos()
    const i = lista.findIndex((c) => c.id === 'caro-kann:b')
    expect(lista[i + 1]).toMatchObject({ id: 'caro-kann-estructuras:b', nombre: 'Caro-Kann por estructuras', color: 'b', lecciones: [] })
    expect(lista[i + 1]!.raiz).toEqual(lista[i]!.raiz)
    const ids = lista.flatMap((c) => c.lecciones).map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('terminada en el curso nuevo, la línea sale una vez en el Repaso, y en el curso que usa "Practicar esta línea"', () => {
    const lecciones = cursos().flatMap((c) => c.lecciones)
    const id = lineasDe(nuevo).find((l) => l.id === 'v:cambio')!.leccionId!
    const ayer = new Date(`${sumarDias(dia(), -1)}T12:00:00`).getTime()
    const hoy = paraHoy({}, { [id]: { fecha: ayer } }, lecciones, dia())
    expect(hoy.map((l) => l.id)).toEqual([id])
    expect(hoy[0]!.cursoId).toBe('caro-kann:b')
    // "Practicar esta línea" busca el curso por apertura y color: sigue siendo el actual
    expect(cursos().filter((c) => c.lecciones.some((l) => l.id === id)).map((c) => c.id)).toEqual(['caro-kann:b'])
  })

  it('no toca la guía, ni el repertorio, ni lo que juegan los bots: no es una apertura de la base', () => {
    expect(cursoActivo('caro-kann-estructuras:b')).toBe(false)
    expect(lineasDeFavorita('caro-kann-estructuras:b')).toEqual([])
    expect(repertorioCompleto().lineas.filter((l) => l.apertura.includes('estructuras'))).toEqual([])
  })
})

describe('El curso por estructuras · el Respaldo', () => {
  let memoria: Map<string, string>
  beforeEach(() => {
    memoria = instalarLocalStorage()
    ;(globalThis as unknown as { window: EventTarget }).window = new EventTarget()
  })

  it('un Respaldo exportado e importado conserva el avance de los dos cursos', async () => {
    const { textoDelRespaldo, cargarRespaldo } = await import('../../src/estado/respaldo.ts')
    const { importar } = await import('../../src/repertorio/edicion.ts')
    const uno = { piezas: { idea: 1 }, variantes: { 'avance-short': { aprendida: 1, terminada: 2 } }, errores: {} }
    const dos = { piezas: { estructura: 3 }, variantes: { panov: { terminada: 4 } }, errores: { 'tal-e6': 5 } }
    memoria.set('ajedrez.v1.curso:caro-kann:b', JSON.stringify(uno))
    memoria.set('ajedrez.v1.curso:caro-kann-estructuras:b', JSON.stringify(dos))
    const archivo = textoDelRespaldo()
    memoria.clear()
    cargarRespaldo(importar(archivo))
    expect(JSON.parse(memoria.get('ajedrez.v1.curso:caro-kann:b')!)).toEqual(uno)
    expect(JSON.parse(memoria.get('ajedrez.v1.curso:caro-kann-estructuras:b')!)).toEqual(dos)
  })
})
