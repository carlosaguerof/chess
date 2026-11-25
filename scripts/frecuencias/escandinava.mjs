// Las frecuencias del curso de la captura contra la Escandinava (`escandinava:w`): el método de su mapa
// (`iterations/v4/mapa-escandinava.md`), rehecho en el repo (cierre de los cursos, 2026-11-25).
//
// Son las dos medidas del worker del curso (`00_corridas/_local/chess/curso-escandinava/`), con una sola regla para
// repartir: en cada posición, las partidas de una jugada entre las que siguen (`n - fin`, como `consulta.mjs`):
//
// - **Las entradas del mapa** (`formas.mjs`, con tope 12): las partidas del curso son las que llegan a 1.e4 d5 y
//   siguen. Tú juegas lo del curso mientras haya respuesta (por posición, así se suman las transposiciones); donde no
//   la hay, lo que juega la gente. Lo del rival pesa por lo que se juega en cada paso. Cada partida se clasifica con su
//   línea en la media jugada 12 (o antes, si se acaban los datos): la primera captura de negras en d5 dice la pieza; si
//   es la dama, su jugada siguiente dice la casilla. "Sin datos" (`null`): ninguna secuencia de 3 partidas o más llega.
// - **Las lecciones y las jugadas del rival sin lección** (`lecciones-freq.mjs` y `consulta.mjs`): por la secuencia
//   exacta, el % del curso multiplica, por cada jugada de negras desde 2... (la recuperación), su parte de las partidas
//   de su posición; las tuyas cuentan 100 %. Si una jugada del camino no está en el conteo, "sin datos". Cada lección se
//   mide en la posición que la define en la base (nota 11 del mapa): la Valenciana en 5...Ag4, no en toda la dama en casa.
//
// `lecciones-freq.mjs` dividía entre `n` (todas las que llegaron) y no entre `n - fin`; en las ocho lecciones da lo
// mismo (ninguna partida termina en sus caminos con datos), y con `n - fin` salen también los números de la tabla de
// las jugadas sin lección del mapa (los midió `consulta.mjs`): 3...De5+ 27.9 % y 12.5 %, que con `n` darían 27.7 y 12.4.
import { readFileSync } from 'node:fs'
import { arbol, fenDe, limpia, pct, cursoDelRepo, BANDAS, Chess } from './comun.mjs'

const RAIZ = 'e4 d5'
/** Las entradas se miran con la línea de la partida en la media jugada 12. */
const TOPE = 12

const CLAVADA = 'La clavada'
const CASA = 'La dama en casa'
const GRANDE = 'El centro grande'
const D6 = 'La dama en d6 (fuera del mapa)'
/**
 * El jaque (3...De5+ o 3...De6+): entrada del mapa con sus lecciones desde el 2026-11-25 (D1 A de Carlos: "agregarles
 * lección"). Antes iba en `otras`, como "El jaque (3...De5+ o 3...De6+), sin lección".
 */
const JAQUE = 'El jaque'
// las filas del mapa sin lección (`otras`)
/** La única con datos: 2...Cf6 3.d4 Dxd5 4.Cc3 De6+ (1000–1400). El mapa no la suma al jaque: su fila es 3...De5+ o 3...De6+. */
const JAQUE_OTRO = 'La dama a e5 o e6 por otro camino (2...Cf6 3.d4 Dxd5 4.Cc3 De6+), sin lección y fuera de la fila del jaque'
const OTRA = 'La dama a otra casilla (d4, c6, d7, c5, f5…), sin lección'
const NADIE = 'Nadie recupera todavía (2...c6, 2...e6, 2...e5, y 2...Cf6 sin datos), sin lección'
const OTRA_PIEZA = 'Otra pieza recupera en d5 (el peón), sin lección'

/**
 * Las jugadas del rival de la tabla del mapa (notas 1 y 2), por su secuencia exacta. Eran las que no tenían lección; desde
 * el 2026-11-25, 3...De5+ y 3...De6+ la tienen (las lecciones del jaque), y sus filas se quedan como medida.
 */
const SIN_LECCION = {
  '3...De5+': 'e4 d5 exd5 Qxd5 Nc3 Qe5',
  '3...De6+': 'e4 d5 exd5 Qxd5 Nc3 Qe6',
  '3...De5+ 4.Ae2 Dg5': 'e4 d5 exd5 Qxd5 Nc3 Qe5 Be2 Qg5',
  '3...De6+ 4.Ae2 Dg6': 'e4 d5 exd5 Qxd5 Nc3 Qe6 Be2 Qg6',
  '3...Da5 4.d4 c6': 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 c6',
  '3...Da5 4.d4 Af5': 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Bf5',
  '3...Da5 4.d4 Cc6': 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nc6',
  '3...Da5 4.d4 e5': 'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 e5',
  '3...Dd8 4.d4 Cc6': 'e4 d5 exd5 Qxd5 Nc3 Qd8 d4 Nc6',
  '3...Dd8 4.d4 e6': 'e4 d5 exd5 Qxd5 Nc3 Qd8 d4 e6',
  '3...Dd8 4.d4 Af5': 'e4 d5 exd5 Qxd5 Nc3 Qd8 d4 Bf5',
  '2...Cf6 3.d4 Dxd5': 'e4 d5 exd5 Nf6 d4 Qxd5',
}
/** Las dos del jaque, y ...Dg5 y ...Dg6 tras 4.Ae2: el mapa da la suma de cada par. */
const JAQUES = ['3...De5+', '3...De6+']
const DG = ['3...De5+ 4.Ae2 Dg5', '3...De6+ 4.Ae2 Dg6']
const SEQ_JAQUES = JAQUES.map((k) => SIN_LECCION[k])

/**
 * La jugada que nombra a una lección cuando su fila de la base no la trae. Las dos del jaque salen de la fila
 * Mieses-Kotroc (1.e4 d5 2.exd5 Dxd5), que no dice nada del jaque; las nombra la primera respuesta del rival a 4.Ae2
 * (4...Ag4 y 4...Cc6), como la Valenciana se mide en 5...Ag4 y no en toda la dama en casa (nota 11 del mapa).
 */
const NOMBRADA = {
  'jaque-e5': 'e4 d5 exd5 Qxd5 Nc3 Qe5 Be2 Bg4',
  'jaque-e6': 'e4 d5 exd5 Qxd5 Nc3 Qe6 Be2 Nc6',
}

/** Las líneas del curso, desde la base del repo, y dónde empieza la continuación del curso en cada una. */
function lecciones() {
  const curso = cursoDelRepo('escandinava')
  const base = JSON.parse(readFileSync(new URL('../../conocimiento/base.json', import.meta.url)))
  const ap = base.aperturas.find((a) => a.id === curso.apertura)
  return curso.variantes.map((v) => {
    const b = ap.variantes.find((x) => x.id === v.base)
    if (!b) throw new Error(`no está en la base: ${curso.apertura}/${v.base}`)
    return { id: v.id, jugadas: b.jugadas.map(limpia), desde: b.continuacion?.desde ?? b.jugadas.length }
  })
}

/**
 * La posición que define una lección en la base: la última jugada de negras de su variante de la base (antes de la
 * continuación del curso); si ahí todavía no se separa de otra lección, la jugada de negras en que se separa (la
 * Marshall: su parte de la base termina en 3...Cxd5, que comparten la Gipslis y la Richter; se separa en 4...Af5).
 */
function definicion(ls, l) {
  if (NOMBRADA[l.id]) {
    if (!l.jugadas.join(' ').startsWith(NOMBRADA[l.id] + ' ')) throw new Error(`la jugada que nombra a ${l.id} no está en su línea`)
    return NOMBRADA[l.id]
  }
  let hasta = l.desde - 1
  for (const o of ls) {
    if (o === l) continue
    let i = 0
    while (i < l.jugadas.length && l.jugadas[i] === o.jugadas[i]) i++
    hasta = Math.max(hasta, i)
  }
  if (hasta % 2 === 0) hasta-- // termina en una jugada de negras
  return l.jugadas.slice(0, hasta + 1).join(' ')
}

/** La entrada del mapa de una lección, con chess.js sobre su línea completa (la misma pregunta que su prueba). */
function formaDeLinea(jugadas) {
  const g = new Chess()
  const m = jugadas.map((s) => g.move(s))
  const i = m.findIndex((x) => x.color === 'b' && x.to === 'd5' && !!x.captured)
  if (i < 0) return null
  if (m[i].piece === 'n') return GRANDE
  if (m[i].piece !== 'q') return null
  const sig = m.slice(i + 1).find((x) => x.color === 'b')
  if (sig?.piece !== 'q') return null
  return { a5: CLAVADA, d8: CASA, d6: D6, e5: JAQUE, e6: JAQUE }[sig.to] ?? null
}

/**
 * La entrada de una partida por su línea, como `forma()` de `formas.mjs`: la primera captura de negras en d5 en las
 * primeras 10 medias jugadas; si es la dama, a dónde va en su jugada siguiente. Devuelve la entrada y si ya quedó
 * decidida (ninguna jugada más la cambia).
 */
function entrada(seq) {
  const g = new Chess()
  const ms = seq ? seq.split(' ') : []
  for (let i = 0; i < ms.length; i++) {
    const m = g.move(ms[i])
    if (i < 10 && m.color === 'b' && m.to === 'd5' && m.captured) {
      if (m.piece === 'n') return [GRANDE, true]
      if (m.piece !== 'q') return [OTRA_PIEZA, true]
      if (ms[i + 2] === undefined) return [OTRA, false] // la dama, sin su jugada siguiente en los datos
      g.move(ms[i + 1])
      const x = g.move(ms[i + 2])
      if (x.piece !== 'q') return [OTRA, true] // la dama se queda en d5
      if (x.to === 'e5' || x.to === 'e6') return [SEQ_JAQUES.includes(ms.slice(0, i + 3).join(' ')) ? JAQUE : JAQUE_OTRO, true]
      return [{ a5: CLAVADA, d8: CASA, d6: D6 }[x.to] ?? OTRA, true]
    }
  }
  // nadie recupera ("todavía no" y "no hay peón en d5" de formas.mjs: la misma fila del mapa)
  return [NADIE, ms.length >= 10]
}

/**
 * Las entradas del mapa en una banda: su parte de las partidas del curso y sus partidas reales (las que llegaron a la
 * jugada que la decide; si no la decide una jugada, las que se clasifican donde se acaba la línea).
 */
function entradas(A, libro) {
  const masa = new Map()
  const reales = new Map()
  const suma = (m, k, x) => m.set(k, (m.get(k) ?? 0) + x)
  const visita = (s) => {
    const [e, decidida] = entrada(s)
    if (!decidida) return
    const i = s.lastIndexOf(' ')
    const [ep, antes] = entrada(i < 0 ? '' : s.slice(0, i))
    if (!(antes && ep === e)) suma(reales, e, A.n(s))
  }
  const anota = (s, p, partidas) => {
    const [e, decidida] = entrada(s)
    suma(masa, e, p)
    if (!decidida) suma(reales, e, partidas)
  }
  const largo = (s) => s.split(' ').length
  function rival(s, p) {
    if (largo(s) >= TOPE) return anota(s, p, A.n(s))
    const hs = A.de(s)
    const den = A.n(s) - A.fin(s)
    if (den <= 0 || !hs.length) return anota(s, p, A.n(s))
    for (const h of hs) {
      visita(h)
      mio(h, (p * A.n(h)) / den)
    }
    // lo que sigue con menos de 3 partidas se clasifica aquí
    const usado = hs.reduce((t, h) => t + A.n(h), 0)
    if (usado < den) anota(s, (p * (den - usado)) / den, den - usado)
  }
  function mio(s, p) {
    if (largo(s) >= TOPE) return anota(s, p, A.n(s))
    const tuya = libro.get(fenDe(s))
    if (tuya) {
      const sig = `${s} ${tuya}`
      if (A.n(sig) > 0) return rival(sig, p)
      return anota(sig, p, 0) // sin datos tras tu jugada del curso
    }
    const hs = A.de(s)
    const den = hs.reduce((t, h) => t + A.n(h), 0)
    if (!den) return anota(s, p, A.n(s))
    for (const h of hs) rival(h, (p * A.n(h)) / den)
  }
  mio(RAIZ, 1)
  return { masa, reales }
}

/**
 * Una secuencia exacta: su parte de las partidas del curso (sin redondear; `null` si no hay datos), su parte de las
 * partidas de su posición, y las partidas de su última jugada de negras.
 */
function porSecuencia(A, seq) {
  const ms = seq.split(' ')
  let curso = 1
  let posicion = null
  let n = 0
  for (let i = 3; i < ms.length; i += 2) {
    const padre = ms.slice(0, i).join(' ')
    const hijo = ms.slice(0, i + 1).join(' ')
    const siguen = A.n(padre) - A.fin(padre)
    if (!A.n(hijo) || siguen <= 0) return { curso: null, posicion: null, n: 0 }
    curso *= A.n(hijo) / siguen
    posicion = A.n(hijo) / siguen
    n = A.n(hijo)
  }
  return { curso, posicion, n }
}

const banda = (x, n) => (x === null ? { pct: null, n: 0 } : { pct: pct(x), n })

/** Dos secuencias juntas: la suma sin redondear antes; sin datos solo si ninguna tiene. */
function juntas(rs) {
  if (rs.every((r) => r.curso === null)) return { pct: null, n: 0 }
  return { pct: pct(rs.reduce((t, r) => t + (r.curso ?? 0), 0)), n: rs.reduce((t, r) => t + r.n, 0) }
}

export default function medir(datos) {
  const ls = lecciones()
  // tu jugada en cada posición de las lecciones (el curso enseña una sola por posición)
  const libro = new Map()
  for (const l of ls)
    l.jugadas.forEach((s, i) => {
      if (i % 2 !== 0) return
      const k = fenDe(l.jugadas.slice(0, i).join(' '))
      if (libro.has(k) && libro.get(k) !== s) throw new Error(`dos jugadas tuyas en la misma posición: ${libro.get(k)} y ${s}`)
      libro.set(k, s)
    })

  const partidas = {}
  const lec = Object.fromEntries(ls.map((l) => [l.id, { forma: formaDeLinea(l.jugadas) }]))
  const formas = Object.fromEntries([CLAVADA, CASA, JAQUE, GRANDE, D6].map((f) => [f, {}]))
  const otras = {}
  const fila = (k) => (otras[k] ??= {})

  for (const b of BANDAS) {
    const A = arbol(datos.bandas[b])
    partidas[b] = A.n(RAIZ) - A.fin(RAIZ)

    const { masa, reales } = entradas(A, libro)
    const total = [...masa.values()].reduce((t, x) => t + x, 0)
    if (Math.abs(total - 1) > 1e-9) throw new Error(`las entradas no suman 100 % en ${b}: ${total}`)
    const valor = (e) => banda(masa.get(e) ? masa.get(e) : null, reales.get(e) ?? 0)
    for (const f of Object.keys(formas)) formas[f][b] = valor(f)
    for (const e of [JAQUE_OTRO, OTRA, NADIE, OTRA_PIEZA]) fila(e)[b] = valor(e)

    for (const l of ls) {
      const r = porSecuencia(A, definicion(ls, l))
      lec[l.id][b] = banda(r.curso, r.n)
    }

    const sl = Object.fromEntries(Object.entries(SIN_LECCION).map(([k, seq]) => [k, porSecuencia(A, seq)]))
    // comprobación: el jaque del recorrido es la suma de 3...De5+ y 3...De6+ por su secuencia
    const jaques = JAQUES.reduce((t, k) => t + (sl[k].curso ?? 0), 0)
    if (Math.abs(jaques - (masa.get(JAQUE) ?? 0)) > 1e-9) throw new Error(`el jaque no cuadra en ${b}: ${jaques} y ${masa.get(JAQUE)}`)
    for (const [k, r] of Object.entries(sl)) {
      fila(`${k} · del curso`)[b] = banda(r.curso, r.n)
      fila(`${k} · de su posición`)[b] = banda(r.posicion, r.n)
    }
    fila(`${DG.join(' y ')}, juntas · del curso`)[b] = juntas(DG.map((k) => sl[k]))
  }

  return {
    metodo:
      'Las partidas del curso: las que llegan a 1.e4 d5 y siguen. En cada posición, una jugada pesa por sus partidas entre las ' +
      'que siguen (n - fin). Las entradas del mapa (`formas`, con el jaque, que tiene lección desde el 2026-11-25; en `otras`, lo que no tiene lección): juegas lo del ' +
      'curso mientras haya respuesta (por posición) y si no, lo que juega la gente; lo del rival pesa por lo que se juega; ' +
      'cada partida se clasifica con su línea en la media jugada 12 (la primera captura de negras en d5 dice la pieza; si es ' +
      'la dama, su jugada siguiente dice la casilla); su `n`, las partidas que llegaron a la jugada que la decide. Cada ' +
      'lección, en la posición que la define en la base (la última jugada de negras de su variante de la base, o la jugada en ' +
      'que se separa de las demás lecciones; las dos del jaque, en la primera respuesta del rival a 4.Ae2, que las nombra), por la secuencia exacta: el producto de la parte de cada jugada de negras desde ' +
      '2...; su `n`, las partidas de esa última jugada. Las jugadas del rival sin lección, igual (del curso) y su parte de las ' +
      'partidas de su posición. `null`: ninguna secuencia de 3 partidas o más llega ahí. Es el método de formas.mjs, ' +
      'lecciones-freq.mjs y consulta.mjs del worker del curso.',
    partidas,
    lecciones: lec,
    formas,
    otras,
  }
}
