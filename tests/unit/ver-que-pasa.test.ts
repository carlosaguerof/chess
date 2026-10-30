import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess, type Square } from 'chess.js'
import { CURSOS_NUEVOS, lineaPorId, lineasDe, misJugadas } from '../../src/curso/datos.ts'
import { fotosDePasos } from '../../src/curso/pasos.ts'
import { frasesDespues } from '../../src/curso/adelantar.ts'
import { palabras, posicion } from '../../src/curso/textos.ts'
import { todosLosVer, verAdelanta, verDelError, verDespues, type VerDelMomento } from '../../src/curso/ver.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'
import { frasesDelCurso, listaDelInventario, llaveDe, RAZONES, sinVer } from '../../scripts/ver-inventario.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'

/**
 * "Ver qué pasa" (Carlos, 2026-10-30): sobre los datos de todo el curso. Las marcas de los pasos entran a las reglas R1 a
 * R8 por `ligadas` (`tests/unit/correcciones-marcas.test.ts`). Las consecuencias que dice el motor, con sus comandos, en
 * `iterations/v3/comprobaciones-del-curso.md`; aquí, las que se miden con chess.js.
 */
const c = CURSOS_NUEVOS['caro-kann:b']!
const TODOS = todosLosVer(c)
const VARIANTES = lineasDe(c).filter((l) => l.tipo === 'variante')
const linea = (id: string) => lineaPorId(c, id)!
const fotos = (v: (typeof TODOS)[number]) => fotosDePasos({ pasos: v.ver.pasos }, v.inicio)
const donde = (v: (typeof TODOS)[number]) => `«${v.frase}»`

// una jugada numerada en la notación de las guías, como en `correcciones-paso-a-paso.test.ts`
const NUMERADA = /(\d+)\.(\.\.)?((?:[RDTAC][a-h]?[1-8]?x?[a-h][1-8])|(?:[a-h]x[a-h][1-8])|(?:[a-h][1-8])|(?:0-0(?:-0)?))/g
const sinJaque = (san: string) => sanAEspanol(san).replace(/[+#]$/, '')
const escrita = (frase: string, sanEs: string) => new RegExp(`(^|[^A-Za-zÁÉÍÓÚáéíóúñ0-9-])${sanEs}(?![A-Za-z0-9-])`).test(frase)
/** Las jugadas que ya están en el tablero en una posición, con su número: "5.g4", "4...e6". */
function jugadasHechas(fen: string, jugadas: string[]) {
  const ch = new Chess()
  const r = jugadas.map((s) => {
    const m = ch.move(s)
    return { es: sinJaque(m.san), num: Number(m.before.split(' ')[5]), color: m.color }
  })
  expect(ch.fen(), 'la salida').toBe(fen)
  return r
}

describe('"Ver qué pasa" · los datos', () => {
  it('cada línea es legal (chess.js): se juegan las jugadas de los dos lados, sin saltarse el turno', () => {
    expect(TODOS).toHaveLength(43)
    for (const v of TODOS) {
      expect(() => fotos(v), donde(v)).not.toThrow()
      expect(v.ver.pasos.length, donde(v)).toBeGreaterThanOrEqual(2)
      // sin "ilustrativo": aquí nadie juega dos veces seguidas
      expect(JSON.stringify(v.ver), donde(v)).not.toContain('ilustrativo')
      expect(JSON.stringify(v.ver), donde(v)).not.toContain('"...')
    }
  })

  it('el tablero empieza en la posición de la que habla la frase, y su primer paso lo dice sin mover nada', () => {
    for (const v of TODOS) {
      const p = v.ver.pasos[0]!
      expect(p.jugadas, donde(v)).toBeUndefined()
      const ultima = v.inicio.at(-1)!
      const n = v.inicio.length - 1
      const esperada = `${Math.floor(n / 2) + 1}.${n % 2 ? '..' : ''}${sanAEspanol(ultima)}`
      // si habla de antes de mi jugada, el tablero regresa, y lo dice (con un error a la vista no regresa: no se hizo)
      expect(p.frase, donde(v)).toBe(`${v.ver.antes && v.campo !== 'errores' ? 'Regresamos a' : 'Esta es'} la posición después de ${esperada}.`.replace('Esta es la', 'Esta es la'))
    }
    // las de `errores` hablan de antes de mi jugada; "Si juegas ...e6 ahora", también
    for (const v of TODOS.filter((x) => x.campo === 'errores')) expect(v.ver.antes, donde(v)).toBe(true)
  })

  it('un paso por jugada, y cada paso que juega dice su jugada, con su número; el que no juega no cambia el tablero', () => {
    for (const v of TODOS) {
      const f = fotos(v)
      v.ver.pasos.forEach((p, i) => {
        const d = `${donde(v)}, paso ${i + 1}`
        expect(p.jugadas?.length ?? 0, d).toBeLessThanOrEqual(1)
        const hechas = f[i]!.hechas.map((m) => ({ es: sinJaque(m.san), num: Number(m.before.split(' ')[5]), color: m.color }))
        for (const m of f[i]!.hechas) expect(escrita(p.frase, sinJaque(m.san)), `${d}: "${sinJaque(m.san)}"`).toBe(true)
        // lo numerado en la frase se juega en ese paso, o ya está en el tablero
        const antes = i === 0 ? jugadasHechas(new Chess().fen(), []).slice(0, 0) : []
        const yaJugadas = [...antes, ...jugadasHechas(posicion(v.inicio, v.inicio.length).fen(), v.inicio), ...f.slice(0, i).flatMap((x) => x.hechas.map((m) => ({ es: sinJaque(m.san), num: Number(m.before.split(' ')[5]), color: m.color })))]
        for (const [, num, puntos, jugada] of p.frase.matchAll(NUMERADA)) {
          const color = puntos ? 'b' : 'w'
          const ok = [...hechas, ...(hechas.length ? [] : yaJugadas)].some((h) => h.es === jugada && h.num === Number(num) && h.color === color)
          expect(ok, `${d}: "${num}.${puntos ?? ''}${jugada}"`).toBe(true)
        }
        expect(f[i]!.cambia, d).toBe(!!(p.jugadas?.length || p.reinicio))
      })
    }
  })

  it('cada frase corta, en la notación de las guías, sin símbolos, con su fuente y su motor (y ese id está en las comprobaciones)', () => {
    const comprobaciones = readFileSync('iterations/v3/comprobaciones-del-curso.md', 'utf8')
    for (const v of TODOS) {
      const vistas = new Set<string>()
      for (const p of v.ver.pasos) {
        const d = `${donde(v)}: «${p.frase}»`
        expect(palabras(p.frase), d).toBeLessThanOrEqual(30)
        expect(p.frase, d).not.toMatch(/[!?±]/)
        expect(p.frase, d).not.toMatch(/(^|[^A-Za-z])[NBQK][a-h]?[1-8]?x?[a-h][1-8]/)
        expect(vistas.has(p.frase), `${d}: repetida`).toBe(false)
        vistas.add(p.frase)
        expect(p.fuente?.length, d).toBeGreaterThan(0)
        for (const f of p.fuente!) expect(c.fuentes[f], `${d}: la fuente ${f}`).toBeTruthy()
        expect(p.motor?.length, d).toBeGreaterThan(0)
        for (const id of p.motor!) expect(comprobaciones, `${d}: el id ${id}`).toContain(`| ${id} |`)
      }
    }
  })

  it('cada frase del inventario con "Ver" tiene su línea, y cada línea tiene su frase; las demás dicen por qué no', () => {
    const frases = frasesDelCurso(c)
    const llaves = new Set(frases.map((x) => x.llave))
    const conVer = new Set(TODOS.map((v) => llaveDe(v.clave, v.campo, v.i)))
    const razones = sinVer()
    // cada línea, con una frase que existe, y una línea por frase
    expect(conVer.size).toBe(TODOS.length)
    for (const k of conVer) expect(llaves.has(k), k).toBe(true)
    for (const v of TODOS) expect(v.frase.length, llaveDe(v.clave, v.campo, v.i)).toBeGreaterThan(0)
    // cada frase, de un lado o del otro, y nunca de los dos
    for (const x of frases) expect(conVer.has(x.llave) !== x.llave in razones, `${x.llave}: «${x.frase}»`).toBe(true)
    for (const [k, r] of Object.entries(razones)) {
      expect(llaves.has(k), k).toBe(true)
      expect(Object.keys(RAZONES), k).toContain(r)
    }
    // ninguna frase de `hace` lleva "Ver": es "Te toca", antes de jugar
    expect(JSON.stringify(Object.values(c.mias).map((m) => Object.keys(m.ver ?? {})))).not.toContain('hace')
    // ninguna consecuencia se cayó con el motor
    expect(Object.values(razones)).not.toContain('no-se-sostiene')
    // la Francesa sí es una alternativa, con su consecuencia: va con "Ver", solo en Aprender
    expect(TODOS.some((v) => v.frase.startsWith('A diferencia de la Francesa'))).toBe(true)
    // y la lista está al día
    expect(readFileSync('iterations/v3/ver-que-pasa-inventario.md', 'utf8')).toBe(listaDelInventario(c))
  })

  it('tiene la línea de la Tal que Carlos no veía: 4...e6 5.g4 ...Ae4 6.f3 ...Ag6 7.h5, igual que el «¿Y si…?», y juega la pérdida', () => {
    const v = TODOS.find((x) => x.frase.startsWith('Si juegas ...e6 ahora'))!
    expect(v.ver.antes).toBe(true)
    expect(v.inicio).toEqual(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4'])
    expect(v.ver.pasos.flatMap((p) => p.jugadas ?? [])).toEqual([...c.piezas.errores.lista.find((e) => e.id === 'tal-e6')!.jugadas.slice(7), 'Bxh5', 'Rxh5'])
    expect(v.ver.pasos.at(-1)!.frase).toContain('lo pierdes')
  })
})

describe('"Ver qué pasa" · las consecuencias que se miden en el tablero (chess.js)', () => {
  const final = (frase: string) => new Chess(fotos(TODOS.find((v) => v.frase === frase)!).at(-1)!.fen)
  /** La posición del paso cuya frase empieza con `inicio`. */
  const enPaso = (frase: string, inicio: string) => {
    const v = TODOS.find((x) => x.frase === frase)!
    return new Chess(fotos(v)[v.ver.pasos.findIndex((p) => p.frase.startsWith(inicio))]!.fen)
  }
  const salidas = (ch: Chess, de: string, turno = 'b') => {
    const [tab, , enroques, , ...resto] = ch.fen().split(' ')
    return new Chess([tab, turno, enroques, '-', ...resto].join(' ')).moves({ square: de as Square, verbose: true }).map((m) => m.to as string)
  }

  it('"encerrado": al alfil de c8 solo le queda d7', () => {
    for (const f of ['Si jugaras ...e6 primero, tu alfil quedaría encerrado detrás de tus peones.', 'Si jugaras ...e6 primero, tu alfil quedaría encerrado.', 'Así tu alfil de c8 se queda encerrado detrás de tus peones.', 'A diferencia de la Francesa (1...e6), tu alfil de c8 queda libre para salir.']) expect(salidas(final(f), 'c8'), f).toEqual(['d7'])
    // y desde d7 no sale a ningún lado (solo regresa)
    const ch = final('Así tu alfil de c8 se queda encerrado detrás de tus peones.')
    ch.remove('c8')
    ch.put({ type: 'b', color: 'b' }, 'd7')
    expect(salidas(ch, 'd7')).toEqual(['c8'])
  })

  it('"sin casillas": todas las casillas del alfil de g6 están atacadas', () => {
    for (const [f, e4] of [
      ['Si lo dejaras avanzar, tu alfil de g6 se quedaría sin casillas.', 'c3'],
      ['Si juegas ...e6 ahora, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes.', 'f3'],
    ] as const) {
      const ch = enPaso(f, 'Tu alfil')
      expect(ch.get('g6'), f).toEqual({ type: 'b', color: 'b' })
      expect(salidas(ch, 'g6').sort(), f).toEqual(['c2', 'd3', 'e4', 'f5', 'h5'])
      // lo que dice el último paso: quién cubre cada casilla
      for (const [casilla, quien] of [['f5', 'g4'], ['h5', 'g4'], ['e4', e4], ['d3', 'd1'], ['c2', 'd1']] as const) expect(ch.attackers(casilla, 'w'), `${f}: ${casilla}`).toContain(quien)
    }
  })

  it('"lo pierdes": al final de la Tal ya no está tu alfil, y blancas tiene una pieza por un peón', () => {
    const ch = final('Si juegas ...e6 ahora, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes.')
    expect(ch.findPiece({ type: 'b', color: 'b' })).toEqual(['f8'])
    const valor = (color: 'w' | 'b') => ch.board().flat().filter((p) => p?.color === color).reduce((s, p) => s + { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[p!.type], 0)
    expect(valor('w') - valor('b')).toBe(2)
  })

  it('lo que se ve al final: blancas con sus dos alfiles, tus piezas en casa y un peón de más', () => {
    const vdw = final('En e4 lo tomaría el caballo de c3.')
    expect(vdw.findPiece({ type: 'b', color: 'w' })).toHaveLength(2)
    expect(vdw.findPiece({ type: 'b', color: 'b' })).toHaveLength(1)
    // 5.Axc4: ninguna pieza negra salió de su fila; lo mismo con la dama que sale temprano, salvo la dama
    const panov = final('Tomar en c4 es peor: el alfil blanco recupera el peón y de paso se desarrolla.')
    for (const fila of panov.board().slice(1)) expect(fila.filter((p) => p?.color === 'b' && p.type !== 'p')).toEqual([])
    for (const f of ['Retomar con la dama la saca demasiado pronto, y es peor.', 'Retomar con la dama es peor: con 5.Cc3 blancas la ataca y gana tiempo.']) {
      const ch = final(f)
      for (const fila of ch.board().slice(1)) expect(fila.filter((p) => p?.color === 'b' && p.type !== 'p' && p.type !== 'q'), f).toEqual([])
    }
    const b7 = final('Y si juegas ...e6, pierdes b7.')
    const cuenta = (color: 'w' | 'b') => b7.board().flat().filter((p) => p?.type === 'p' && p.color === color).length
    expect(cuenta('w') - cuenta('b')).toBe(1)
  })

  it('"sin apoyo": ninguna pieza blanca defiende e5, y ya no hay peón en d4', () => {
    const ch = final('Si d4 cae, el peón de e5 se queda sin apoyo.')
    expect(ch.get('d4')?.type).toBe('n')
    expect(ch.attackers('e5', 'w')).toEqual([])
  })

  it('"lo pierdes", "pierdes la dama": la pieza ya no está, y nadie retoma', () => {
    expect(final('Aquí no juegues ...e6: el peón de f3 se come tu alfil.').get('e4')).toEqual({ type: 'p', color: 'w' })
    const dama = final('Nunca con ...Dc7: el alfil de f4 se come tu dama.')
    expect(dama.findPiece({ type: 'q', color: 'b' })).toEqual([])
    expect(dama.attackers('c7', 'b')).toEqual([])
  })

  it('"el material queda igual", y el rey que tomó ya no puede enrocar', () => {
    const cuenta = (ch: Chess, color: 'w' | 'b') => ch.board().flat().filter((p) => p?.color === color).length
    const igual = final('Si blancas cambia caballos, retomas con la dama y el material queda igual.')
    expect(cuenta(igual, 'w')).toBe(cuenta(igual, 'b'))
    expect(final('Tomar con el rey también se puede, pero el rey queda más expuesto y es peor.').getCastlingRights('b')).toEqual({ k: false, q: false })
  })
})

describe('"Ver qué pasa" · en la lección', () => {
  /** Las jugadas mías que la línea me va a pedir desde `desde`, como pieza y casilla (otra cuenta que la del código). */
  function pedidas(l: LineaCurso, desde: number) {
    return misJugadas(l)
      .filter((p) => p >= desde)
      .map((p) => {
        const m = posicion(l.jugadas, p).move(l.jugadas[p]!)
        return `${m.piece}${m.to}`
      })
  }
  /** Las jugadas de mi color que hace una ventana, como pieza y casilla. */
  function hechasMias(l: LineaCurso, v: VerDelMomento) {
    return fotosDePasos(v.pa, v.inicio).flatMap((f) => f.hechas.filter((m) => m.color === l.lado).map((m) => `${m.piece}${m.to}`))
  }

  it('en Practicar ninguna línea contiene una jugada mía que la línea me va a pedir (las 16 variantes, cada jugada y cada equivocada conocida)', () => {
    let revisadas = 0
    let ocultas = 0
    for (const l of VARIANTES)
      for (const ply of misJugadas(l)) {
        const despues = verDespues(c, l, 'practicar', ply)
        if (despues) {
          revisadas++
          for (const j of hechasMias(l, despues)) expect(pedidas(l, ply + 1), `${l.id} ${ply}: ${j}`).not.toContain(j)
        }
        const m = c.mias[l.jugadas.slice(0, ply + 1).join(' ')]!
        for (const san of Object.keys(m.errores ?? {})) {
          const error = verDelError(c, l, 'practicar', ply, san)
          if (m.verErrores?.[san] && !error) ocultas++
          if (!error) continue
          revisadas++
          // con un error a la vista, la jugada que falta también cuenta
          for (const j of hechasMias(l, error)) expect(pedidas(l, ply), `${l.id} ${ply} ${san}: ${j}`).not.toContain(j)
        }
      }
    expect(revisadas).toBeGreaterThan(20)
    expect(ocultas).toBeGreaterThan(3)
  })

  it('sale solo con las frases que se muestran: lo que Practicar oculta no trae "Ver"', () => {
    for (const l of VARIANTES)
      for (const ply of misJugadas(l)) {
        const v = verDespues(c, l, 'practicar', ply)
        const visibles = frasesDespues(c, l, 'practicar', ply).map((f) => f.texto)
        for (const p of v?.pa.pasos ?? []) if (p.titulo) expect(visibles, `${l.id} ${ply}`).toContain(p.titulo)
      }
    // el caso de Carlos, en la Tal: la frase de ...e6 no se muestra en Practicar, y por eso no hay botón
    const tal = linea('v:avance-tal')
    expect(verDespues(c, tal, 'aprender', 7)?.titulo).toContain('Si juegas ...e6 ahora')
    expect(verDespues(c, tal, 'practicar', 7)).toBeNull()
  })

  it('en Practicar no va si la línea contiene una jugada que la línea me va a pedir, aunque la frase se muestre; en Aprender sí va', () => {
    // el de 6...e6 sin atender h4: ...e6 viene en la Clásica. El de 6...Cf6, no
    const cl = linea('v:clasica')
    expect(verDelError(c, cl, 'aprender', 11, 'e6')).not.toBeNull()
    expect(verDelError(c, cl, 'practicar', 11, 'e6')).toBeNull()
    expect(verDelError(c, cl, 'practicar', 11, 'Nf6')).not.toBeNull()
    // una misma frase se decide línea por línea: 3...e6 no se pide en la Bayoneta, y en la de 4.Cf3 sí
    expect(verDelError(c, linea('v:avance-bayoneta'), 'practicar', 5, 'e6')).not.toBeNull()
    expect(verDelError(c, linea('v:avance-short'), 'practicar', 5, 'e6')).toBeNull()
    // una jugada del rival no adelanta nada, salvo con un error a la vista, si cae en la casilla que falta: 7...Cc6 8.h5 enseña h5
    const vdw = linea('v:avance-van-der-wiel')
    expect(verDelError(c, vdw, 'aprender', 13, 'Nc6')).not.toBeNull()
    expect(verDelError(c, vdw, 'practicar', 13, 'Nc6')).toBeNull()
    expect(verDespues(c, vdw, 'practicar', 13)?.titulo).toContain('Si lo dejaras avanzar')
    // los errores metidos a propósito: una flecha verde o un texto que adelantan
    const v = TODOS.find((x) => x.clave === 'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5' && x.campo === 'porque')!
    const short = linea('v:avance-short')
    expect(verAdelanta(short, 10, v.inicio, v.ver)).toEqual([])
    expect(verAdelanta(short, 10, v.inicio, { pasos: [...v.ver.pasos, { frase: 'Con la dama.', marcas: [{ tipo: 'A3', de: 'd8', a: 'b6', color: 'verde', punteada: true }] }] })).toEqual(['Qb6'])
    expect(verAdelanta(short, 10, v.inicio, { pasos: [...v.ver.pasos, { frase: 'Y luego ...Db6.' }] })).toEqual(['Qb6'])
  })

  it('un momento con dos frases: la ventana las cubre una tras otra, y el título cambia con la frase', () => {
    const titulos = (v: VerDelMomento) => v.pa.pasos.flatMap((p) => (p.titulo ? [p.titulo] : []))
    // dos líneas distintas: la segunda vuelve a la posición de salida
    const cambio = verDespues(c, linea('v:cambio'), 'aprender', 13)!
    expect(titulos(cambio)).toEqual(['Nunca con ...Dc7: el alfil de f4 se come tu dama.', 'Y si juegas ...e6, pierdes b7.'])
    const f = fotosDePasos(cambio.pa, cambio.inicio)
    const segunda = cambio.pa.pasos.findIndex((p, i) => i > 0 && p.titulo)
    expect(cambio.pa.pasos[segunda]!.reinicio).toEqual([])
    // cuando la segunda frase regresa el tablero, lo dice, también si sola diría "Esta es la posición"
    const short = verDespues(c, linea('v:avance-short'), 'aprender', 9)!
    expect(short.pa.pasos.find((p, i) => i > 0 && p.titulo)!.frase).toBe('Regresamos a la posición después de 5...c5.')
    expect(short.pa.pasos[0]!.frase).toBe('Esta es la posición después de 5...c5.')
    expect(f[segunda]!.fen).toBe(f[0]!.fen)
    // una habla de después y otra de antes: la ventana sale de antes, y la de después lleva mi jugada
    const clasica = verDespues(c, linea('v:clasica'), 'aprender', 11)!
    expect(clasica.inicio).toHaveLength(11)
    expect(clasica.pa.pasos[0]!.reinicio).toEqual(['h6'])
    expect(() => fotosDePasos(clasica.pa, clasica.inicio)).not.toThrow()
    // la segunda sigue la línea de la primera: continúa desde ahí, sin repetir 7...Cc6 y 8.h5
    const vdw = verDespues(c, linea('v:avance-van-der-wiel'), 'aprender', 13)!
    expect(titulos(vdw)).toHaveLength(2)
    expect(vdw.pa.pasos.flatMap((p) => p.jugadas ?? [])).toEqual(['Nc6', 'h5', 'Be4', 'Rh3', 'Nh6', 'Nxe4', 'dxe4'])
    expect(vdw.pa.pasos.filter((p) => p.reinicio)).toEqual([])
    // cada ventana se puede recorrer completa, en cada momento de cada variante
    for (const l of VARIANTES)
      for (const ply of misJugadas(l))
        for (const vuelta of ['aprender', 'practicar'] as const) {
          const v = verDespues(c, l, vuelta, ply)
          if (v) expect(() => fotosDePasos(v.pa, v.inicio), `${l.id} ${ply} ${vuelta}`).not.toThrow()
        }
  })

  it('una equivocada sin explicación del curso, o sin "Ver", no trae botón', () => {
    const tal = linea('v:avance-tal')
    expect(verDelError(c, tal, 'aprender', 7, 'a6')).toBeNull()
    expect(verDelError(c, tal, 'aprender', 7, 'h6')!.titulo).toContain('Con ...h6 tu alfil tendría h7')
    expect(verDespues(c, tal, 'aprender', 9)).toBeNull()
  })
})
