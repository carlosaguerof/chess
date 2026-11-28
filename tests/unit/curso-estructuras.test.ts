import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess, type Move } from 'chess.js'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { caminoQueQueda, CURSOS_NUEVOS, esLeccionOpcional, grupoDeLinea, soloObligatorias, jugadasDeVariante, leccionIdDe, leccionesDe, lineaPorId, lineasDe, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { componerCurso } from '../../src/curso/capas.ts'
import { adelanta } from '../../src/curso/adelantar.ts'
import { fenQueSeVe, fotosDePasos, soloPeones } from '../../src/curso/pasos.ts'
import { frasesDe, palabras, posicion } from '../../src/curso/textos.ts'
import { pasosDelCurso, siguientePaso } from '../../src/pantallas/CursoPagina.tsx'
import { cursos } from '../../src/cursos/datos.ts'
import { dia, paraHoy, sumarDias } from '../../src/repaso/repaso.ts'
import { cursoActivo } from '../../src/aprender/interruptores.ts'
import { lineasDe as lineasDeFavorita, repertorioCompleto } from '../../src/aprender/favoritas.ts'
import type { AvanceCurso } from '../../src/curso/avance.ts'
import { cursoQueQueda } from '../../src/curso/queda.ts'
import { jugadasDeMiRepertorio, jugadasFalladas } from '../../src/registro/refuerza.ts'
import { fenCorto } from '../../src/registro/registro.ts'
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
  it('se llama "Defensa Caro-Kann", como la de antes, y sale del curso actual (su id no cambia)', () => {
    expect(nuevo.id).toBe('caro-kann-estructuras:b')
    expect(nuevo.nombre).toBe('Defensa Caro-Kann')
    expect(nuevo.nombre).toBe(actual.nombre)
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

  // La estructura, 2026-11-28 (Carlos en su iPhone: "pondría en toda esa descripción solo la idea general de esa lección y
  // el paso a paso verlo con el botón"; "De repente ya no existen 2 peones, 1 y 1 de cada jugador, no entiendo por qué").
  // Arriba, la idea; el detalle, en el paso a paso, que parte de la posición inicial con todas las piezas.
  const paginas = () => nuevo.piezas.estructura.paginas
  const fotosDe = (titulo: string) => fotosDePasos(pagina(titulo).pasoAPaso!)
  /** El paso cuya frase empieza así, y la posición de verdad en él. */
  const enPaso = (titulo: string, empieza: string) => {
    const pa = pagina(titulo).pasoAPaso!
    const i = pa.pasos.findIndex((x) => x.frase.startsWith(empieza))
    expect(i, `${titulo}: «${empieza}…»`).toBeGreaterThanOrEqual(0)
    return { i, paso: pa.pasos[i]!, foto: fotosDe(titulo)[i]!, ch: new Chess(fotosDe(titulo)[i]!.fen) }
  }
  const QUITAMOS = 'Quitamos las demás piezas para ver solo los peones.'
  /** Las frases de una página en el orden en que se leen: la idea de arriba y después cada paso. */
  const frasesDePagina = (p: PaginaLeer) => [...p.texto, ...p.pasoAPaso!.pasos.map((x) => x.frase)]

  it('La estructura trae cinco páginas; la Cadena y la Clásica salen de las páginas del curso de antes, que no cambian', () => {
    expect(paginas().map((p) => p.subtitulo)).toEqual(['El mapa', 'La Cadena', 'El Cambio', 'La Clásica', 'La Tensión'])
    const capaDe = capa.piezas.estructura.paginas
    expect(capaDe[1]!.de).toBe(0)
    expect(capaDe[3]!.de).toBe(1)
    // las de origen se quedan como estaban: el curso de antes no cambia
    const [avance, clasica] = actual.piezas.estructura.paginas
    expect(avance!.texto[0]).toMatch(/^Tus peones: c6, d5 y e6, y luego \.\.\.c5\./)
    expect(clasica!.texto[0]).toMatch(/^Tus peones: c6 y e6, sin debilidades\./)
    expect(avance!.pasoAPaso!.soloPeones && clasica!.pasoAPaso!.soloPeones).toBe(true)
    // y sus fuentes siguen en las páginas de este curso
    for (const f of avance!.fuente) expect(pagina('La Cadena').fuente).toContain(f)
    for (const f of clasica!.fuente) expect(pagina('La Clásica').fuente).toContain(f)
  })

  it('cada página: arriba, solo la idea general, en una o dos frases cortas, con la posición real de la lección', () => {
    for (const p of paginas()) {
      const frases = p.texto.flatMap((t) => frasesDe(t))
      expect(frases.length, p.subtitulo).toBeLessThanOrEqual(2)
      expect(palabras(p.texto.join(' ')), p.subtitulo).toBeLessThanOrEqual(45)
      // el detalle se fue al paso a paso: arriba ya no van las listas de peones
      expect(p.texto.join(' '), p.subtitulo).not.toMatch(/Tus peones:|Los de blancas:/)
      // el tablero de arriba: una posición de la partida, con todas las piezas
      expect(p.tablero!.jugadas, p.subtitulo).toBeDefined()
      expect(p.tablero!.soloPeones, p.subtitulo).toBeFalsy()
      expect(p.pasoAPaso, p.subtitulo).toBeDefined()
    }
    // la de cada forma es la de su lección, hasta donde la estructura ya está formada
    const hasta = (id: string, n: number) => jugadasDeVariante(nuevo, nuevo.variantes.find((v) => v.id === id)!).slice(0, n)
    expect(pagina('La Cadena').tablero!.jugadas).toEqual(hasta('avance-short', 10))
    expect(pagina('El Cambio').tablero!.jugadas).toEqual(hasta('cambio', 14))
    expect(pagina('La Clásica').tablero!.jugadas).toEqual(hasta('clasica', 20))
    expect(pagina('La Tensión').tablero!.jugadas).toEqual(linea('dos-caballos').jugadas)
  })

  it('cada paso a paso parte de la posición inicial con todas las piezas y juega la partida de su lección; solo después de un paso que lo dice, enseña los peones', () => {
    const lecciones: Record<string, string> = { 'La Cadena': 'avance-short', 'El Cambio': 'cambio', 'La Clásica': 'clasica', 'La Tensión': 'dos-caballos' }
    for (const p of paginas()) {
      const pa = p.pasoAPaso!
      const fotos = fotosDePasos(pa)
      expect(pa.fen, p.subtitulo).toBeUndefined()
      expect(pa.soloPeones || pa.ilustrativo, p.subtitulo).toBeFalsy()
      // el primer tablero: la posición inicial, con sus 32 piezas
      expect(new Chess(fotos[0]!.fen).history().length + new Chess(fotos[0]!.fen).board().flat().filter(Boolean).length, p.subtitulo).toBe(32)
      const quita = pa.pasos.findIndex((x) => x.soloPeones)
      if (p.subtitulo === 'El mapa') {
        expect(quita).toBe(-1)
        continue
      }
      // un solo paso quita las piezas; lo dice, no juega nada, y desde ahí es ilustración
      expect(pa.pasos[quita]!.frase, p.subtitulo).toBe(QUITAMOS)
      expect(pa.pasos.filter((x) => x.soloPeones !== undefined), p.subtitulo).toHaveLength(1)
      expect(pa.pasos[quita]!.ilustrativo, p.subtitulo).toBe(true)
      fotos.forEach((f, i) => expect([f.soloPeones, f.ilustrativo], `${p.subtitulo}, paso ${i + 1}`).toEqual([i >= quita, i >= quita]))
      // hasta ahí, las jugadas de los dos lados, una tras otra: la línea de su lección
      const jugadas = fotos.slice(0, quita).flatMap((f) => f.hechas.map((m) => m.san))
      const l = jugadasDeVariante(nuevo, nuevo.variantes.find((v) => v.id === lecciones[p.subtitulo!])!)
      expect(jugadas, p.subtitulo).toEqual(l.slice(0, jugadas.length))
      expect(jugadas.length, p.subtitulo).toBeGreaterThanOrEqual(6)
    }
  })

  it('ningún peón ni pieza desaparece sin una captura en ese paso, y cada captura se dice en palabras (quién toma a quién)', () => {
    /** Cuántas piezas de cada clase se ven: "bp" → 7. */
    const cuenta = (fen: string) => {
      const r = new Map<string, number>()
      for (const s of new Chess(fen, { skipValidation: true }).board().flat()) if (s) r.set(s.color + s.type, (r.get(s.color + s.type) ?? 0) + 1)
      return r
    }
    const tableroDe = (fen: string) => fen.split(' ')[0]!
    let capturas = 0
    for (const p of paginas()) {
      const pa = p.pasoAPaso!
      const fotos = fotosDePasos(pa)
      const vistos: string[] = [tableroDe(new Chess().fen())]
      let antes = new Chess().fen()
      pa.pasos.forEach((paso, i) => {
        const f = fotos[i]!
        const donde = `${p.subtitulo}, paso ${i + 1}: «${paso.frase}»`
        // un regreso vuelve a un tablero que ya se vio, y la frase lo dice
        if (paso.reinicio) {
          const de = new Chess()
          for (const s of paso.reinicio) de.move(s)
          const seVe = f.soloPeones ? soloPeones(de.fen()) : de.fen()
          expect(vistos, `${donde}: regresa a un tablero que no se vio`).toContain(tableroDe(seVe))
          expect(paso.frase, donde).toMatch(/^(.+: )?[Vv]olvemos/)
          antes = seVe
        }
        const ahora = fenQueSeVe(f)
        const [a, b] = [cuenta(antes), cuenta(ahora)]
        // lo que capturó este paso, por clase
        const tomadas = new Map<string, number>()
        for (const m of f.hechas.filter((x) => x.captured)) tomadas.set((m.color === 'w' ? 'b' : 'w') + m.captured, (tomadas.get((m.color === 'w' ? 'b' : 'w') + m.captured) ?? 0) + 1)
        for (const k of new Set([...a.keys(), ...b.keys()])) {
          const menos = (a.get(k) ?? 0) - (b.get(k) ?? 0)
          // el paso que quita las piezas: se van todas las que no son peones, y solo esas
          if (f.cambiaVista && f.soloPeones && k[1] !== 'p') expect(b.get(k) ?? 0, donde).toBe(0)
          else expect(menos, `${donde}: ${k}`).toBe(tomadas.get(k) ?? 0)
        }
        const capturo = f.hechas.filter((x) => x.captured)
        capturas += capturo.length
        if (capturo.length) expect(paso.frase, `${donde}: la captura, en palabras`).toMatch(/\b(toma|tomas|retoma|retomas)\b/i)
        vistos.push(tableroDe(ahora))
        antes = ahora
      })
    }
    // las cuentas de hoy: 14 capturas en las cinco páginas, cada una vista y dicha
    expect(capturas).toBe(14)
  })

  it('cada término se explica la primera vez que sale (en el orden en que se lee), o se dice con palabras simples', () => {
    // el término, y la frase que lo explica: ninguna frase de antes lo nombra
    const TERMINOS: [RegExp, string][] = [
      [/estructura de peones/i, 'La estructura de peones es la forma que dejan los peones; como un peón nunca regresa'],
      [/cadena/i, 'd4 protege a e5, como en una cadena'],
      [/tensi[oó]n/i, 'A eso se le llama tensión'],
      // "La base" con mayúscula es el nombre de la sección del curso, no el término
      [/(?<!La )\bbase\b/, 'por el peón de atrás, su base'],
      [/casilla clave/i, 'La casilla clave, la más importante aquí, es e5'],
      [/ruptura/i, 'Tu ruptura, empujar un peón contra los del rival para romper su forma'],
      [/ataque de minor[ií]as/i, 'Es el ataque de minorías: en las columnas a, b y c tienes dos peones contra tres'],
      [/lado de rey/i, 'en el lado de rey, de la e a la h'],
      [/\bd[eé]bil(es)?\b/i, 'un peón débil, de los que cuesta defender'],
      [/espacio/i, 'más espacio, más casillas para sus piezas detrás de sus peones'],
    ]
    const todas = paginas().flatMap(frasesDePagina)
    for (const [termino, explica] of TERMINOS) {
      const primera = todas.findIndex((f) => termino.test(f))
      expect(primera, String(termino)).toBeGreaterThanOrEqual(0)
      expect(todas[primera], String(termino)).toContain(explica)
    }
    // palabras que ya no se usan: se dicen con palabras simples
    for (const f of todas) expect(f).not.toMatch(/sim[eé]tric|debilidades|lado de dama|casi iguales/i)
    // cada término quiere decir una sola cosa: "casilla clave" es una casilla vacía (no un peón), y "cadena" son los peones de blancas
    for (const f of todas.filter((x) => /casilla clave/i.test(x))) expect(f, f).not.toMatch(/d4/)
    expect(todas.filter((x) => /cadena de tus peones|tu cadena/i.test(x))).toEqual([])
  })

  it('El mapa: qué es una estructura de peones y por qué importa, la pregunta, y las cuatro respuestas en el tablero', () => {
    const p = pagina('El mapa')
    expect(p.texto[0]).toMatch(/^La estructura de peones es la forma que dejan los peones; como un peón nunca regresa, esa forma se queda mucho tiempo y te dice qué plan toca\.$/)
    // las cuatro respuestas: tres desde 2...d5 y una antes, sin 2.d4 (el pase adversarial: "cuatro" no estaban en ese tablero)
    expect(enPaso('El mapa', 'Blancas juega 2.d4').paso.frase).toContain('blancas lo empuja, lo cambia o lo defiende; o, antes, no juega 2.d4')
    expect(p.texto[1]).toContain('¿qué pasó con el peón de e4?')
    // la Cadena: el peón llegó a e5
    const cadena = enPaso('El mapa', 'La Cadena').ch
    expect(cadena.get('e5')).toMatchObject({ type: 'p', color: 'w' })
    expect(cadena.get('e4')).toBeUndefined()
    // el Cambio: blancas toma en d5 con el peón de e4, y retomas con el de c
    const toma = enPaso('El mapa', 'El Cambio')
    expect(toma.foto.hechas.map((m) => [m.from, m.to, m.captured])).toEqual([['e4', 'd5', 'p']])
    const cambio = enPaso('El mapa', 'Retomas con tu peón de c6').ch
    expect(cambio.get('d5')).toMatchObject({ type: 'p', color: 'b' })
    expect(cambio.get('c6')).toBeUndefined()
    // la Clásica: tu peón captura en e4 y blancas retoma con una pieza
    expect(enPaso('El mapa', 'Tomas el peón de e4').ch.get('e4')).toMatchObject({ type: 'p', color: 'b' })
    expect(enPaso('El mapa', 'Blancas retoma con su caballo').ch.get('e4')).toMatchObject({ type: 'n', color: 'w' })
    // la Tensión: los dos peones siguen ahí, y nadie cambió peones
    const t = enPaso('El mapa', 'Nadie ha cambiado peones').ch
    expect(t.get('e4')).toMatchObject({ type: 'p', color: 'w' })
    expect(t.get('d5')).toMatchObject({ type: 'p', color: 'b' })
    expect(peones(t, 'w')).toHaveLength(8)
    expect(peones(t, 'b')).toHaveLength(8)
    expect(t.attackers('e4', 'b')).toContain('d5')
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

  it('La Cadena: los peones de la cadena, su base, tu ruptura y la de blancas, en el paso a paso', () => {
    const t = enPaso('La Cadena', 'Tus peones de adelante: d5 y e6').ch
    expect(peones(t, 'w')).toEqual(['a2', 'b2', 'c2', 'd4', 'e5', 'f2', 'g2', 'h2'])
    expect(peones(t, 'b')).toEqual(['a7', 'b7', 'c5', 'd5', 'e6', 'f7', 'g7', 'h7'])
    // la cadena: e5 protegido por d4, y d4 sin peón que lo proteja (la base); tu c5 ya la ataca
    expect(t.attackers('e5', 'w')).toContain('d4')
    expect(t.attackers('d4', 'w').filter((s) => t.get(s)?.type === 'p')).toEqual([])
    expect(t.attackers('d4', 'b')).toContain('c5')
    expect(enPaso('La Cadena', 'También puedes romper con ...f6').foto.hechas.map((m) => m.san)).toEqual(['f6'])
    // la de blancas, desde la posición de antes de ...f6 (sin las dos rupturas a la vez)
    const c4 = enPaso('La Cadena', 'Volvemos atrás. Blancas también puede romper')
    expect(c4.ch.attackers('d5', 'w')).toContain('c4')
    expect(c4.ch.get('f6')).toBeUndefined()
  })

  it('El Cambio: sus peones son los del final de la lección con ...e6, y lo que dice de ellos es cierto', () => {
    const { ch } = enPaso('El Cambio', 'Tus peones de adelante: d5 y e6.')
    const final = alFinal(linea('cambio'))
    expect(peones(ch, 'w')).toEqual(peones(final, 'w'))
    expect(peones(ch, 'b')).toEqual(peones(final, 'b').map((s) => (s === 'e7' ? 'e6' : s)).sort())
    expect(enPaso('El Cambio', 'Los de blancas: c3 y d4.').paso.marcas!.map((m) => m.en)).toEqual(['c3', 'd4'])
    // blancas no tiene peón en la columna e, y tú no tienes en la c
    expect(peones(ch, 'w').some((s) => s[0] === 'e')).toBe(false)
    expect(peones(ch, 'b').some((s) => s[0] === 'c')).toBe(false)
    // el ataque de minorías: en las columnas a, b y c, dos tuyos contra tres; y ...b4 llega contra c3
    const minorias = enPaso('El Cambio', 'Es el ataque de minorías').ch
    const lado = (color: 'w' | 'b') => peones(minorias, color).filter((s) => 'abc'.includes(s[0]!)).length
    expect([lado('b'), lado('w')]).toEqual([2, 3])
    expect(minorias.get('c3')).toMatchObject({ type: 'p', color: 'w' })
    expect(minorias.get('b5')).toMatchObject({ type: 'p', color: 'b' })
  })

  it('El Cambio: primero sacas tus piezas y enrocas, y después la ruptura, con la torre en b8 y sin regalar el peón; arriba, el plan en ese orden', () => {
    expect(pagina('El Cambio').texto[0]).toMatch(/Tu plan: sacar tus piezas, enrocar y después avanzar/)
    const pasos = pagina('El Cambio').pasoAPaso!.pasos
    const i = pasos.findIndex((x) => x.frase === 'Primero sacas tus piezas y enrocas.')
    expect(i).toBeGreaterThan(0)
    expect(pasos[i]!.jugadas).toBeUndefined()
    expect(pasos[i + 1]!.frase).toContain('Pones una torre en b8, para defender tu peón cuando avance. Luego empujas ...b5, cuidando de no regalar ese peón.')
    expect(pasos[i + 2]!.frase).toContain('...b4')
  })

  it('La Clásica: tus peones sin debilidades, el peón de d4 de blancas, la ruptura después de sacar tus piezas, y la casilla e5', () => {
    const { ch } = enPaso('La Clásica', 'Tus peones de adelante: c6 y e6.')
    const final = alFinal(linea('clasica'))
    expect(peones(ch, 'w')).toEqual(peones(final, 'w'))
    expect(peones(ch, 'b')).toEqual(peones(final, 'b'))
    expect(peones(ch, 'w')).toContain('d4')
    expect(peones(ch, 'w').some((s) => s[0] === 'e')).toBe(false)
    const pasos = pagina('La Clásica').pasoAPaso!.pasos
    const primero = pasos.findIndex((x) => x.frase === 'Primero terminas de sacar tus piezas y enrocas.')
    expect(pasos[primero + 1]!.jugadas).toEqual(['...c5'])
    expect(pasos.at(-1)!.marcas).toEqual([{ tipo: 'A6', en: 'e5', color: 'rojo' }])
  })

  it('La Tensión: la posición es la de Dos Caballos tras 5...e6, y las tres salidas son jugadas legales', () => {
    const dc = linea('dos-caballos')
    expect(dc.jugadas.at(-1)).toBe('e6')
    const ch = alFinal(dc)
    const { foto } = enPaso('La Tensión', QUITAMOS)
    expect(foto.fen).toBe(ch.fen())
    expect(peones(ch, 'b')).toEqual(['a7', 'b7', 'c6', 'd5', 'e6', 'f7', 'g7', 'h7'])
    expect(peones(ch, 'w')).toContain('e4')
    expect(peones(ch, 'w')).toContain('d2')
    expect(pagina('La Tensión').texto.join(' ')).toContain('Todavía puede volverse la Cadena, el Cambio o la Clásica')
    // el peón de e4 y el de d5 se atacan
    expect(ch.attackers('d5', 'w')).toContain('e4')
    expect(ch.attackers('e4', 'b')).toContain('d5')
    expect(peones(new Chess(enPaso('La Tensión', 'Y si después empuja e5').foto.fen), 'w')).toEqual(expect.arrayContaining(['d4', 'e5']))
    const cambio = enPaso('La Tensión', 'Volvemos atrás. Si blancas toma tu peón de d5')
    expect(cambio.ch.get('d5')).toMatchObject({ type: 'p', color: 'b' })
    expect(peones(cambio.ch, 'b')).not.toContain('c6')
    expect(cambio.paso.marcas!.filter((m) => m.tipo === 'A9')).toHaveLength(2)
    // la captura en e4 no se juega: la frase no dice con qué pieza retoma blancas, y lleva su flecha de plan (`specs/cursos.md` §2.1, regla 4)
    const captura = enPaso('La Tensión', 'Volvemos atrás. Si tomas el peón de e4')
    expect(captura.paso.jugadas).toBeUndefined()
    expect(captura.paso.marcas).toEqual([{ tipo: 'A3', de: 'd5', a: 'e4', color: 'verde', punteada: true }])
    expect(captura.foto.fen).toBe(ch.fen())
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
    expect(v.plan.tuyo).toBe(hoy.plan.tuyo.replace('Después, adelanta ...b5 y ...b4:', 'Después, con una torre en b8, adelanta ...b5 y ...b4, cuidando de no regalar el peón:'))
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

  it('una sola tarjeta de la Caro-Kann: la de antes, con sus lecciones, abre el curso por estructuras; ninguna línea sale dos veces', () => {
    const lista = cursos()
    expect(lista.filter((c) => c.apertura === 'caro-kann' && c.color === 'b').map((c) => c.id)).toEqual(['caro-kann:b'])
    expect(lista.some((c) => c.id === 'caro-kann-estructuras:b')).toBe(false)
    expect(cursoQueQueda('caro-kann:b')).toBe('caro-kann-estructuras:b')
    expect(lista.find((c) => c.id === 'caro-kann:b')!.lecciones.map((l) => l.id)).toEqual(leccionesDe(actual).map((l) => l.id))
    const ids = lista.flatMap((c) => c.lecciones).map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('en el Repaso, cada ficha muestra el plan del curso que queda (el Cambio, con la torre en b8), con el mismo orden e ids', () => {
    const lecciones = cursos().find((c) => c.id === 'caro-kann:b')!.lecciones
    expect(lecciones.map((l) => l.id)).toEqual(leccionesDe(actual).map((l) => l.id))
    for (const v of nuevo.variantes) expect(lecciones.find((l) => l.id === leccionIdDe(nuevo, v))!.plan, v.id).toBe(v.plan.tuyo)
    expect(lecciones.find((l) => l.id.endsWith('/curso-cambio'))!.plan).toContain('con una torre en b8')
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

describe('Una sola Caro-Kann · la dirección del curso de antes', () => {
  const N = '/curso/caro-kann-estructuras%3Ab'
  const partes = (camino: string) => camino.split('/').filter(Boolean)
  it('lleva a lo mismo en el curso que queda: la página, cada línea, cada pieza de leer y Errores y trampas', () => {
    expect(caminoQueQueda(partes('/curso/caro-kann%3Ab'))).toBe(N)
    expect(caminoQueQueda(partes('/curso/caro-kann:b'))).toBe(N)
    for (const l of lineasDe(nuevo)) expect(caminoQueQueda(partes(`/curso/caro-kann%3Ab/linea/${encodeURIComponent(l.id)}`)), l.id).toBe(`${N}/linea/${encodeURIComponent(l.id)}`)
    for (const p of ['idea', 'estructura', 'repaso']) expect(caminoQueQueda(partes(`/curso/caro-kann%3Ab/leer/${p}`))).toBe(`${N}/leer/${p}`)
    expect(caminoQueQueda(partes('/curso/caro-kann%3Ab/errores'))).toBe(`${N}/errores`)
  })

  it('"#/leccion/caro-kann:b/<n>" (Practicar esta línea, el resumen de una lección) abre esa misma línea', () => {
    actual.variantes.forEach((v, i) => expect(caminoQueQueda(partes(`/leccion/caro-kann%3Ab/${i}`)), v.id).toBe(`${N}/linea/${encodeURIComponent(`v:${v.id}`)}`))
    actual.variantes.forEach((v, i) => expect(caminoQueQueda(partes(`/curso/caro-kann%3Ab/${i}`)), v.id).toBe(`${N}/linea/${encodeURIComponent(`v:${v.id}`)}`))
  })

  it('lo que no existe en el que queda lleva a su página, nunca a una vacía', () => {
    const quitados = actual.piezas.errores.lista.filter((e) => !nuevo.piezas.errores.lista.some((x) => x.id === e.id))
    expect(quitados.length).toBeGreaterThan(0)
    for (const e of quitados) expect(caminoQueQueda(partes(`/curso/caro-kann%3Ab/linea/${encodeURIComponent(`e:${e.id}`)}`)), e.id).toBe(N)
    expect(caminoQueQueda(partes('/curso/caro-kann%3Ab/linea/v%3Ano-existe'))).toBe(N)
    expect(caminoQueQueda(partes('/leccion/caro-kann%3Ab/99'))).toBe(N)
    expect(caminoQueQueda(partes('/curso/caro-kann%3Ab/leer/otra'))).toBe(N)
  })

  it('las demás direcciones no cambian', () => {
    for (const c of ['/', '/cursos/negras', '/curso/caro-kann-estructuras%3Ab', '/curso/eslava%3Ab', '/leccion/eslava%3Ab/0', '/curso/caro-kann%3Aw', '/repaso']) expect(caminoQueQueda(partes(c)), c).toBeUndefined()
  })
})

describe('Una sola Caro-Kann · el avance de antes cuenta', () => {
  let memoria: Map<string, string>
  beforeEach(() => {
    memoria = instalarLocalStorage()
    ;(globalThis as unknown as { window: EventTarget }).window = new EventTarget()
  })
  const ANTES = 'ajedrez.v1.curso:caro-kann:b'
  const QUEDA = 'ajedrez.v1.curso:caro-kann-estructuras:b'

  it('una lección terminada en el de antes sale hecha en el que queda; las piezas de leer, los «¿Y si…?» y dónde me quedé, no', async () => {
    const { leerAvance } = await import('../../src/curso/avance.ts')
    const antes = { piezas: { idea: 1, estructura: 2, errores: 3, repaso: 4 }, variantes: { cambio: { aprendida: 5, terminada: 6 }, fantasia: { aprendida: 7 } }, errores: { 'tal-e6': 8, 'cambio-dc7': 9 }, enCurso: { linea: 'v:clasica', vuelta: 'practicar', ply: 5, fecha: 10 } }
    memoria.set(ANTES, JSON.stringify(antes))
    const a = leerAvance('caro-kann-estructuras:b')
    expect(a.variantes).toEqual({ cambio: { aprendida: 5, terminada: 6 }, fantasia: { aprendida: 7 } })
    expect(a.piezas).toEqual({})
    expect(a.errores).toEqual({})
    expect(a.enCurso).toBeUndefined()
    // "1 de 8" en la tarjeta y en la página, y "Seguir" se salta lo hecho
    expect(pasosDelCurso(nuevo, { ...a, piezas: { idea: 1, estructura: 1 } }).find((p) => p.id === 'v:cambio')!.hecho).toBe(true)
    expect(siguientePaso(nuevo, { ...a, piezas: { idea: 1, estructura: 1 } })!.id).toBe('v:avance-short')
    // el de antes no cambia, y el que queda no guardó nada
    expect(JSON.parse(memoria.get(ANTES)!)).toEqual(antes)
    expect(memoria.has(QUEDA)).toBe(false)
    // al de antes no le llega nada del que queda
    memoria.set(QUEDA, JSON.stringify({ piezas: {}, variantes: { panov: { terminada: 11 } }, errores: {} }))
    expect(leerAvance('caro-kann:b').variantes).toEqual(antes.variantes)
  })

  it('lo del que queda gana, y se junta campo por campo', async () => {
    const { leerAvance } = await import('../../src/curso/avance.ts')
    memoria.set(ANTES, JSON.stringify({ piezas: {}, variantes: { cambio: { aprendida: 1, terminada: 2 }, clasica: { aprendida: 3, terminada: 4 } }, errores: {} }))
    memoria.set(QUEDA, JSON.stringify({ piezas: { idea: 5 }, variantes: { cambio: { aprendida: 6 }, panov: { terminada: 7 } }, errores: {} }))
    const a = leerAvance('caro-kann-estructuras:b')
    expect(a.variantes).toEqual({ cambio: { aprendida: 6, terminada: 2 }, clasica: { aprendida: 3, terminada: 4 }, panov: { terminada: 7 } })
    expect(a.piezas).toEqual({ idea: 5 })
  })

  it('al terminar algo en el que queda, se guarda solo lo suyo: nada del de antes se copia', async () => {
    const { leerAvance, marcarVariante, marcarPieza } = await import('../../src/curso/avance.ts')
    memoria.set(ANTES, JSON.stringify({ piezas: {}, variantes: { cambio: { aprendida: 1, terminada: 2 } }, errores: {} }))
    marcarVariante('caro-kann-estructuras:b', 'clasica', 'terminada', 3)
    marcarPieza('caro-kann-estructuras:b', 'idea', 4)
    expect(JSON.parse(memoria.get(QUEDA)!)).toEqual({ piezas: { idea: 4 }, variantes: { clasica: { terminada: 3 } }, errores: {} })
    expect(leerAvance('caro-kann-estructuras:b').variantes).toEqual({ cambio: { aprendida: 1, terminada: 2 }, clasica: { terminada: 3 } })
  })

  it('un Respaldo viejo, con solo el avance de antes, sigue sirviendo', async () => {
    const { textoDelRespaldo, cargarRespaldo } = await import('../../src/estado/respaldo.ts')
    const { importar } = await import('../../src/repertorio/edicion.ts')
    const { leerAvance } = await import('../../src/curso/avance.ts')
    memoria.set(ANTES, JSON.stringify({ piezas: { idea: 1 }, variantes: { 'avance-short': { aprendida: 1, terminada: 2 } }, errores: {} }))
    const archivo = textoDelRespaldo()
    memoria.clear()
    cargarRespaldo(importar(archivo))
    expect(leerAvance('caro-kann-estructuras:b').variantes).toEqual({ 'avance-short': { aprendida: 1, terminada: 2 } })
  })
})

describe('Una sola Caro-Kann · las opcionales no salen en el Repaso ni en Refuerza', () => {
  const caroKann = () => cursos().find((c) => c.id === 'caro-kann:b')!
  const fen = (camino: string[]) => {
    const ch = new Chess()
    for (const s of camino) ch.move(s)
    return fenCorto(ch.fen())
  }
  const fallo = (camino: string[], esperada: string) => ({ fen: fen(camino), esperada, resultado: 'fallo' as const, lugar: 'curso' as const, fecha: 1, linea: 'x', camino })

  it('en cursos(), las 16 lecciones siguen (mismo orden e ids) y las 8 opcionales van marcadas', () => {
    const ls = caroKann().lecciones
    expect(ls).toHaveLength(16)
    const marcadas = ls.filter((l) => l.opcional).map((l) => l.id).sort()
    expect(marcadas).toEqual(opcionales(nuevo).map((v) => leccionIdDe(nuevo, v)).sort())
  })

  it('el Repaso no saca una opcional, aunque tenga su ficha guardada; una obligatoria, sí', () => {
    const ls = cursos().flatMap((c) => c.lecciones)
    const tal = leccionIdDe(nuevo, nuevo.variantes.find((v) => v.id === 'avance-tal')!)
    const cambio = leccionIdDe(nuevo, nuevo.variantes.find((v) => v.id === 'cambio')!)
    const ayer = new Date(`${sumarDias(dia(), -1)}T12:00:00`).getTime()
    const hechas = { [tal]: { fecha: ayer }, [cambio]: { fecha: ayer } }
    const fichas = { [tal]: { escalon: 2, proxima: dia() } }
    expect(paraHoy(fichas, hechas, ls, dia()).map((l) => l.id)).toEqual([cambio])
    // nada se borra: la ficha y lo aprendido siguen ahí
    expect(fichas[tal]).toEqual({ escalon: 2, proxima: dia() })
    expect(Object.keys(hechas)).toContain(tal)
  })

  it('Refuerza: de la Caro-Kann, solo las líneas de las 8 obligatorias; lo demás y la guía, igual', () => {
    const todo = repertorioCompleto()
    const rep = soloObligatorias(todo)
    const ck = (r: typeof todo) => r.lineas.filter((l) => l.apertura === 'caro-kann' && l.color === 'b').map((l) => l.id)
    expect(ck(rep).sort()).toEqual(obligatorias(nuevo).map((v) => `b:caro-kann/${v.base}`).sort())
    // las aperturas sin un curso con secciones no cambian (los cursos nuevos por estructuras tienen su propia prueba)
    const conSecciones = new Set(Object.values(CURSOS_NUEVOS).filter((c) => c.secciones).map((c) => `${c.apertura}:${c.color}`))
    const sinCurso = (l: (typeof todo.lineas)[number]) => !conSecciones.has(`${l.apertura}:${l.color}`)
    expect(rep.lineas.filter(sinCurso)).toEqual(todo.lineas.filter(sinCurso))
    // la guía y los bots siguen con todo
    expect(ck(todo).length).toBeGreaterThan(ck(rep).length)
    expect(repertorioCompleto().lineas).toHaveLength(todo.lineas.length)
  })

  it('una sola condición: esLeccionOpcional marca en el Repaso y filtra en Refuerza las mismas 8', () => {
    for (const v of nuevo.variantes) expect(esLeccionOpcional('caro-kann', 'b', v.base), v.id).toBe(opcionales(nuevo).includes(v))
    const marcadas = caroKann().lecciones.filter((l) => l.opcional).map((l) => l.id.slice(l.id.lastIndexOf('/') + 1)).sort()
    expect(marcadas).toEqual(opcionales(nuevo).map((v) => v.base).sort())
    const fuera = repertorioCompleto().lineas.filter((l) => !soloObligatorias(repertorioCompleto()).lineas.includes(l)).map((l) => l.id.slice(l.id.indexOf('/') + 1))
    for (const b of marcadas) expect(fuera, b).toContain(b)
    // ningún curso sin secciones tiene opcionales (los cursos nuevos por estructuras declaran las suyas)
    expect(cursos().filter((c) => c.id !== 'caro-kann:b' && !CURSOS_NUEVOS[c.id]?.secciones).flatMap((c) => c.lecciones).filter((l) => l.opcional)).toEqual([])
  })

  it('Refuerza deja de mostrar 37 jugadas de la Caro-Kann: 23 de opcionales y 14 de líneas de la base que no son lección', () => {
    const todas = jugadasDeMiRepertorio(repertorioCompleto(), [])
    const quedan = new Set(jugadasDeMiRepertorio(soloObligatorias(repertorioCompleto()), []).map((j) => `${j.fen}|${j.esperada}`))
    // las de la Caro-Kann con negras (los cursos nuevos cuentan las suyas en su propia prueba)
    const fuera = todas.filter((j) => !quedan.has(`${j.fen}|${j.esperada}`) && j.linea.apertura === 'caro-kann' && j.linea.color === 'b')
    expect(fuera).toHaveLength(37)
    const enOpcional = (j: (typeof todas)[number]) => opcionales(nuevo).some((v) => {
      const ch = new Chess()
      return jugadasDeVariante(nuevo, v).some((s) => {
        const ok = ch.fen() === j.fen && s === j.esperada
        ch.move(s)
        return ok
      })
    })
    expect(fuera.filter(enOpcional)).toHaveLength(23)
  })

  it('un curso nuevo con su propio id y secciones usa la misma condición', () => {
    const it = repertorioCompleto().lineas.find((l) => l.apertura === 'italiana' && l.color === 'w')!
    const base = it.id.slice(it.id.indexOf('/') + 1)
    const v = { ...nuevo.variantes[0]!, id: 'prueba', base }
    CURSOS_NUEVOS['prueba:w'] = { ...nuevo, id: 'prueba:w', apertura: 'italiana', color: 'w', fichasDe: undefined, variantes: [v], secciones: [{ id: 'opcional', titulo: 'Opcional', opcional: true, variantes: ['prueba'] }] }
    try {
      expect(esLeccionOpcional('italiana', 'w', base)).toBe(true)
      expect(soloObligatorias(repertorioCompleto()).lineas.some((l) => l.id === it.id)).toBe(false)
    } finally {
      delete CURSOS_NUEVOS['prueba:w']
    }
    expect(esLeccionOpcional('italiana', 'w', base)).toBe(false)
  })

  it('Refuerza: un fallo en una jugada que solo está en una opcional no sale; uno en una obligatoria, sí', () => {
    const soloTal = fallo(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4'], 'h5')
    const deLaBase = fallo(['e4', 'c6', 'd4', 'd5', 'e5'], 'Bf5')
    const rep = soloObligatorias(repertorioCompleto())
    expect(jugadasFalladas(repertorioCompleto(), [soloTal]).map((j) => j.esperada), 'antes salía').toEqual(['h5'])
    expect(jugadasFalladas(rep, [soloTal])).toEqual([])
    expect(jugadasFalladas(rep, [soloTal, deLaBase]).map((j) => j.esperada)).toEqual(['Bf5'])
  })
})

