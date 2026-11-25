// Las frecuencias del curso de la Alapin contra la Siciliana (`siciliana:w`), con el método de su mapa
// (`iterations/v4/mapa-alapin.md`, "Obligatorio y opcional, con las partidas de este curso").
//
// Es el método con que se sacaron los números del mapa el 2026-11-25 (su script, `estructuras.mjs`, quedó fuera del
// repo, en `00_corridas/_local/chess/curso-alapin/`; la corrida que dio el mapa es la de `MAPA=1`):
//
// - **Las partidas del curso** llegan a 1.e4 c5, y juegas 2.c3: todo porcentaje es de las partidas con 2.c3.
// - **Una lección** se mide en la jugada del rival que la separa de las demás (`definicion`): la probabilidad de llegar a
//   esa posición (por su FEN, sumando todos los caminos) si en las posiciones del libro del curso juegas lo del curso, y
//   fuera del libro lo que juega la gente; el rival, siempre lo real. Hasta 24 medias jugadas.
// - **Una forma** se mide hasta la media jugada 12, siguiendo las jugadas del mapa: en el libro, lo del curso; fuera, la
//   regla de la jugada 3 (3.exd5 contra ...d5, 3.e5 contra ...Cf6, 3.d4 contra lo demás) y, si un peón en d5 ataca tu
//   e4, avanzas con ...e6 jugado y si no, cambias; lo demás, lo que juega la gente. Cada hoja del recorrido se clasifica
//   por lo que pasó con tu peón de e4 (`forma`).
import { BANDAS, Chess, arbol, cursoDelRepo, esDeCarlos, fenDe, jugadasDeLaBase, pct } from './comun.mjs'

const RAIZ = 'e4 c5'
const HASTA_LECCION = 24
const HASTA_FORMA = 12

/** Los nombres de las formas, como en el mapa. */
const NOMBRE = { aislado: 'El aislado', cadena: 'La cadena', centro: 'Los dos peones del centro', gambito: 'El gambito (la excepción)' }
/**
 * Las formas con lecciones (la regla del paso 1). Los dos peones del centro tiene lección desde el 2026-11-25 (D1 A de
 * Carlos: "agregarles lección"); el gambito es una excepción.
 */
const FORMAS = ['aislado', 'cadena', 'centro']
/** La transposición que decide la lección base de El aislado: tras 4...d5, con 5.exd5 Dxd5 6.Cf3 llegas al Cambio Central. */
const TRANSPOSICION = 'e4 c5 c3 Nc6 d4 cxd4 cxd4 d5'
const CAMBIO_CENTRAL_TRAS_CF3 = 'e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3'
/** Las jugadas frecuentes del rival de la tabla del mapa (2...Cc6 y 2...d6 tienen lección desde el 2026-11-25). */
const RIVAL = { Nc6: '2...Cc6', d6: '2...d6', e6: '2...e6' }

/** Las jugadas de Carlos en cada posición del libro (una sola por posición: si dos lecciones juegan distinto, se detiene). */
function libro(ls) {
  const m = new Map()
  for (const l of ls)
    l.jugadas.forEach((s, i) => {
      if (!esDeCarlos('w', i)) return
      const k = fenDe(l.jugadas.slice(0, i).join(' '))
      if (m.has(k) && m.get(k) !== s) throw new Error(`dos jugadas tuyas en la misma posición: ${m.get(k)} y ${s} (${l.id})`)
      if (!m.has(k)) m.set(k, s)
    })
  return m
}

/** La posición justo antes de una jugada de la línea (la jugada es un objeto de `jug(seq).ms`). */
function antesDe(seq, m) {
  const c = new Chess()
  for (const s of seq.split(' ')) {
    const x = c.move(s)
    if (x.before === m.before && x.san === m.san) return new Chess(x.before)
  }
  return null
}

const jug = (seq) => {
  const c = new Chess()
  return { c, ms: seq.split(' ').map((s) => c.move(s)) }
}

/**
 * La forma, por lo que pasó con tu peón de e4:
 * - 'cadena': lo avanzaste a e5;
 * - 'gambito': lo cambiaste en d5 (el peón de d7) y el rival no retomó en d5 en su jugada siguiente;
 * - 'aislado': lo cambiaste en d5, el rival retomó con una pieza y tienes un peón en d4;
 * - 'centro': sigue en e4 y tienes un peón en d4 (los dos peones del centro), o ese peón ya avanzó de d4 a d5 con un caballo
 *   de negras en c6, que es la regla de su página contra un caballo (desde el 2026-11-25, con su lección: antes contaba como 'otra');
 * - 'otra': lo demás (incluido lo que todavía no se decide).
 */
export function forma(seq) {
  const { c, ms } = jug(seq)
  const peonD4 = c.get('d4')?.type === 'p' && c.get('d4')?.color === 'w'
  const e4e5 = ms.findIndex((x) => x.color === 'w' && x.piece === 'p' && x.from === 'e4' && x.to === 'e5')
  const exd5 = ms.findIndex((x) => x.color === 'w' && x.piece === 'p' && x.from === 'e4' && x.to === 'd5')
  if (e4e5 >= 0) return 'cadena'
  if (exd5 >= 0) {
    const sig = ms[exd5 + 1]
    if (!sig) return 'otra'
    const d7d5 = ms.some((x, i) => i < exd5 && x.color === 'b' && x.piece === 'p' && x.from === 'd7' && x.to === 'd5')
    if (d7d5 && sig.to !== 'd5') return 'gambito'
    if (!d7d5) return 'otra'
    if (sig.piece !== 'p' && peonD4) return 'aislado'
    return 'otra'
  }
  const e4 = c.get('e4')
  // el avance de d4 a d5 que manda la página: con un caballo de negras en c6 en ese momento (la regla del caballo)
  const d4d5 = c.get('d5')?.type === 'p' && c.get('d5')?.color === 'w' && ms.some((x) => x.color === 'w' && x.piece === 'p' && x.from === 'd4' && x.to === 'd5' && antesDe(seq, x)?.get('c6')?.type === 'n' && antesDe(seq, x)?.get('c6')?.color === 'b')
  if (e4?.type === 'p' && e4.color === 'w' && (peonD4 || d4d5)) return 'centro'
  return 'otra'
}

/** Fuera del libro, lo que receta el mapa: la regla de la jugada 3 y, contra un peón en d5 que ataca e4, e5 o exd5. */
function delMapa(seq) {
  const js = seq.split(' ')
  if (js.length === 4) return { d5: 'exd5', Nf6: 'e5', Nc6: 'd4', d6: 'd4', e6: 'd4', g6: 'd4' }[js[3]]
  const { c } = jug(seq)
  const e4 = c.get('e4')
  const d5 = c.get('d5')
  if (e4?.type === 'p' && e4.color === 'w' && d5?.type === 'p' && d5.color === 'b') return c.get('e6')?.type === 'p' && c.get('e6')?.color === 'b' ? 'e5' : 'exd5'
  return undefined
}

/** La posición donde se mide una lección: lo que la separa de las demás, hasta la última jugada del rival. */
function definicion(ls, l) {
  const otras = ls.filter((x) => x !== l)
  let i = 0
  for (; i < l.jugadas.length; i++) {
    const pre = l.jugadas.slice(0, i + 1).join(' ')
    if (!otras.some((o) => (o.jugadas.join(' ') + ' ').startsWith(pre + ' '))) break
  }
  if (i === l.jugadas.length) i = l.jugadas.length - 1
  let ply = i
  while (ply >= 0 && esDeCarlos('w', ply)) ply--
  return l.jugadas.slice(0, ply + 1).join(' ')
}

/** Lecciones: la probabilidad y las partidas reales de cada posición a la que llega una jugada del rival (por FEN). */
function alcance(A, LP) {
  const pr = new Map()
  const n = new Map()
  const carlos = (s, p, d) => {
    if (d >= HASTA_LECCION) return
    const m = LP.get(fenDe(s))
    if (m) {
      const h = s + ' ' + m
      if (A.sec[h]) rival(h, p, d + 1)
      return
    }
    const den = A.n(s) - A.fin(s)
    if (den <= 0) return
    for (const h of A.de(s)) rival(h, (p * A.n(h)) / den, d + 1)
  }
  const rival = (s, p, d) => {
    if (d >= HASTA_LECCION) return
    const den = A.n(s) - A.fin(s)
    if (den <= 0) return
    for (const h of A.de(s)) {
      const pp = (p * A.n(h)) / den
      const k = fenDe(h)
      pr.set(k, (pr.get(k) || 0) + pp)
      n.set(k, (n.get(k) || 0) + A.n(h))
      carlos(h, pp, d + 1)
    }
  }
  carlos(RAIZ, 1, 2)
  return { pr, n }
}

/**
 * Formas: el recorrido siguiendo las jugadas del mapa, hasta la media jugada 12. Cada hoja suma su probabilidad a su
 * forma, y sus partidas reales: las de la hoja; si tu jugada del mapa no tiene partidas, las de la posición donde la
 * juegas; si son las jugadas raras (menos de 3 partidas cada una), las que fueron a ellas.
 */
function recorrido(A, LP) {
  const f = {}
  const visita = new Map()
  const hoja = (s, p, nReal) => {
    const c = forma(s)
    f[c] ??= { p: 0, n: 0 }
    f[c].p += p
    f[c].n += nReal
  }
  const pasa = (s, p) => visita.set(s, (visita.get(s) || 0) + p)
  const carlos = (s, p, d) => {
    pasa(s, p)
    if (d >= HASTA_FORMA) return hoja(s, p, A.n(s))
    const m = LP.get(fenDe(s)) ?? delMapa(s)
    if (m) {
      const h = s + ' ' + m
      if (A.sec[h]) return rival(h, p, d + 1)
      return hoja(h, p, A.n(s))
    }
    const kids = A.de(s)
    const den = A.n(s) - A.fin(s)
    if (den <= 0 || !kids.length) return hoja(s, p, A.n(s))
    let u = 0
    for (const h of kids) {
      u += A.n(h)
      rival(h, (p * A.n(h)) / den, d + 1)
    }
    if (den > u) hoja(s, (p * (den - u)) / den, den - u)
  }
  const rival = (s, p, d) => {
    pasa(s, p)
    if (d >= HASTA_FORMA) return hoja(s, p, A.n(s))
    const kids = A.de(s)
    const den = A.n(s) - A.fin(s)
    if (den <= 0 || !kids.length) return hoja(s, p, A.n(s))
    let u = 0
    for (const h of kids) {
      u += A.n(h)
      carlos(h, (p * A.n(h)) / den, d + 1)
    }
    if (den > u) hoja(s, (p * (den - u)) / den, den - u)
  }
  carlos(RAIZ, 1, 2)
  return { f, visita }
}

/** Una celda: `pct` con un decimal y `n`; sin partidas, `null` ("sin datos" no es 0 %). */
const celda = (p, n) => (n > 0 ? { pct: pct(p), n } : { pct: null, n: 0 })

export default function medir(datos) {
  const curso = cursoDelRepo('alapin')
  const lecs = curso.variantes.map((v) => ({ id: v.id, jugadas: jugadasDeLaBase(curso.apertura, v.base) }))
  const LP = libro(lecs)

  // la transposición: con las jugadas del mapa, de 4...d5 se llega a la posición del Cambio Central tras 6.Cf3
  let s = TRANSPOSICION + ' ' + delMapa(TRANSPOSICION) + ' Qxd5'
  s += ' ' + LP.get(fenDe(s))
  if (fenDe(s) !== fenDe(CAMBIO_CENTRAL_TRAS_CF3)) throw new Error(`la transposición no llega al Cambio Central: ${s}`)

  const partidas = {}
  const lecciones = Object.fromEntries(lecs.map((l) => [l.id, { forma: NOMBRE[forma(l.jugadas.join(' '))] ?? 'otra' }]))
  const formas = Object.fromEntries(FORMAS.map((f) => [NOMBRE[f], {}]))
  const otras = {
    '1.e4 c5: las partidas que llegan a la raíz del curso (pct: de todas las de la banda)': {},
    [NOMBRE.gambito]: {},
    '2...Cc6 3.d4 cxd4 4.cxd4 d5: con 5.exd5 Dxd5 6.Cf3 llega al Cambio Central': {},
    ...Object.fromEntries(Object.values(RIVAL).map((r) => [r, {}])),
  }
  const claveTransp = Object.keys(otras)[2]

  for (const banda of BANDAS) {
    const A = arbol(datos.bandas[banda])
    const raiz = RAIZ + ' ' + LP.get(fenDe(RAIZ))
    partidas[banda] = A.n(raiz)
    otras[Object.keys(otras)[0]][banda] = celda(A.n(RAIZ) / datos.partidasPorBanda[banda], A.n(RAIZ))

    const { pr, n } = alcance(A, LP)
    for (const l of lecs) {
      const k = fenDe(definicion(lecs, l))
      const x = celda(pr.get(k) || 0, n.get(k) || 0)
      lecciones[l.id][banda] = x
      // la `frecuencia` de la variante en el curso: 1000–1400 con dos decimales, como la guardó el mapa
      if (banda === '1000-1400') lecciones[l.id].frecuencia = x.n > 0 ? +(100 * pr.get(k)).toFixed(2) : null
    }

    const { f, visita } = recorrido(A, LP)
    for (const c of FORMAS) formas[NOMBRE[c]][banda] = celda(f[c]?.p ?? 0, f[c]?.n ?? 0)
    for (const c of ['gambito']) otras[NOMBRE[c]][banda] = celda(f[c]?.p ?? 0, f[c]?.n ?? 0)
    otras[claveTransp][banda] = celda(visita.get(TRANSPOSICION) ?? 0, A.n(TRANSPOSICION))

    const den = A.n(raiz) - A.fin(raiz)
    for (const [m, r] of Object.entries(RIVAL)) otras[r][banda] = celda(den > 0 ? A.n(raiz + ' ' + m) / den : 0, A.n(raiz + ' ' + m))
  }

  return {
    metodo:
      'Las partidas del curso llegan a 1.e4 c5 y juegas 2.c3; todo porcentaje es de las partidas con 2.c3 (`partidas`). ' +
      'Una lección se mide en la jugada del rival que la separa de las demás: la probabilidad de llegar a esa posición (por su FEN, todos los caminos) jugando lo del curso en su libro y, fuera de él, lo que juega la gente, hasta 24 medias jugadas; `frecuencia` es el valor de 1000–1400 con dos decimales que guarda la variante del curso. ' +
      'Una forma se mide hasta la media jugada 12 siguiendo las jugadas del mapa (en el libro, lo del curso; fuera, la regla de la jugada 3 y, contra un peón en d5 que ataca e4, e5 con ...e6 jugado y si no exd5), y cada hoja se clasifica por lo que pasó con tu peón de e4; su `n` son las partidas reales de sus hojas (si tu jugada del mapa no tiene partidas, las de la posición donde la juegas). ' +
      'La transposición se mide en 4...d5 (de ahí, tus 5.exd5 y 6.Cf3 son las del mapa y 5...Dxd5 la jugaron todas); las jugadas del rival tras 2.c3, sobre las que siguen.',
    partidas,
    lecciones,
    formas,
    otras,
  }
}
