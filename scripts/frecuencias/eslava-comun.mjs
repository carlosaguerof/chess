// Lo que comparten las frecuencias de la Defensa Eslava (`eslava:b`) y de Otras aperturas de blancas
// (`otros-negras:b`): el método con que se sacaron los números de sus mapas (`iterations/v4/mapa-eslava.md` y
// `mapa-otros-negras.md`) el 2026-11-25. Sus scripts quedaron fuera del repo, en `00_corridas/_local/chess/`:
//
// - **Las lecciones**, como `frecuencias-siete/analiza.mjs` (`recorre` y `definicion`): juegas siempre lo del curso;
//   donde el curso no tiene jugada tuya, el camino sale del curso y no se sigue. El rival pesa por lo que se juega en
//   cada paso, entre las partidas que siguen (n − las que se acaban ahí), y se suman los caminos que llegan a la misma
//   posición (las 4 primeras partes del FEN). Una lección se mide en la posición tras la jugada del rival que la separa
//   de las demás lecciones del curso.
// - **Las formas**, como `curso-eslava/estructuras.mjs` (media jugada 12): juegas lo del curso mientras haya respuesta y,
//   fuera del curso, lo que juega la gente; el rival, lo que se juega. Se reparte entre todas las partidas que siguen;
//   lo que va por jugadas con menos de 3 partidas queda "sin datos" (hallazgo 10 de la revisión del mapa). Cada camino
//   se clasifica por sus jugadas y su posición en la media jugada 12, o antes si ahí se acaba el conteo.
// - **Lo que pasa después de una jugada sin lección**, como `curso-eslava/huecos.mjs`: los dos lados juegan lo que juega
//   la gente, repartido entre las jugadas guardadas, hasta la media jugada 12.
//
// Las jugadas de cada lección salen de la base del repo (`conocimiento/base.json`, por la `base` de cada variante del
// curso). Los scripts de afuera las leían de una copia de la base (`b696d89`) o de `lineas.json`; los números que usan
// los mapas son los mismos (ver `metodo` de cada archivo).
import { Chess, cursoDelRepo, esDeCarlos, fenDe, jugadasDeLaBase, pct } from './comun.mjs'

/** Las lecciones del curso, con sus jugadas de la base del repo (SAN inglés, sin + ni #). */
export function leccionesDelCurso(archivo) {
  const curso = cursoDelRepo(archivo)
  return { curso, lecciones: curso.variantes.map((v) => ({ id: v.id, forma: v.estructura ?? null, jugadas: jugadasDeLaBase(curso.apertura, v.base) })) }
}

/** El libro: posición antes de tu jugada → tu jugada. Una sola por posición: si dos lecciones juegan distinto, se detiene. */
export function libro(lecciones, color) {
  const m = new Map()
  for (const l of lecciones)
    l.jugadas.forEach((s, i) => {
      if (!esDeCarlos(color, i)) return
      const k = fenDe(l.jugadas.slice(0, i).join(' '))
      if (m.has(k) && m.get(k) !== s) throw new Error(`dos jugadas tuyas en la misma posición: ${m.get(k)} y ${s} (${l.id})`)
      if (!m.has(k)) m.set(k, s)
    })
  return m
}

/**
 * La posición que mide una lección (`definicion` de analiza.mjs): la primera jugada que la separa de las demás; si es
 * tuya, la posición de antes (tú la escoges siempre). Si la lección es el principio de otra, su final.
 */
export function medida(lecciones, l, color) {
  const otras = lecciones.filter((x) => x !== l)
  let i = 0
  for (; i < l.jugadas.length; i++) {
    const pre = l.jugadas.slice(0, i + 1).join(' ')
    if (!otras.some((o) => (o.jugadas.join(' ') + ' ').startsWith(pre + ' '))) break
  }
  if (i === l.jugadas.length) i = l.jugadas.length - 1
  let ply = i
  while (ply >= 0 && esDeCarlos(color, ply)) ply--
  return l.jugadas.slice(0, ply + 1).join(' ')
}

/**
 * El recorrido de las lecciones (`recorre` de analiza.mjs): la probabilidad y las partidas reales de cada posición a la
 * que llega una jugada del rival. `raiz`: { carlos: secuencia } (te toca) o { rival: secuencia, fuera: [jugadas] }.
 */
export function alcance(A, LP, raiz) {
  const pr = new Map()
  const n = new Map()
  const carlos = (s, p) => {
    const m = LP.get(fenDe(s))
    if (!m) return // sale del curso: no se sigue
    const h = s ? s + ' ' + m : m
    if (A.sec[h]) rival(h, p)
  }
  const rival = (s, p, fuera) => {
    let kids = A.de(s)
    let den = A.n(s) - A.fin(s)
    if (fuera) {
      kids = kids.filter((h) => !fuera.includes(h))
      den = kids.reduce((t, h) => t + A.n(h), 0)
    }
    if (den <= 0) return
    for (const h of kids) {
      const pp = (p * A.n(h)) / den
      const k = fenDe(h)
      pr.set(k, (pr.get(k) || 0) + pp)
      n.set(k, (n.get(k) || 0) + A.n(h))
      carlos(h, pp)
    }
  }
  if (raiz.carlos !== undefined) carlos(raiz.carlos, 1)
  else rival(raiz.rival, 1, raiz.fuera)
  return { pr, n }
}

/** Los peones de cada color en una posición de chess.js. */
export function peones(g) {
  const P = { w: new Set(), b: new Set() }
  for (const f of g.board()) for (const c of f) if (c && c.type === 'p') P[c.color].add(c.square)
  return P
}

/** Las jugadas (verbose de chess.js) y la posición final de una secuencia. */
export function jugar(seq) {
  const g = new Chess()
  const m = seq ? seq.split(' ').map((s) => g.move(s)) : []
  return { g, m }
}

export const SIN_DATOS = 'sin datos'

/**
 * El recorrido de las formas (`estructuras.mjs`), hasta la media jugada `tope`. `forma(seq)` clasifica una hoja.
 * Devuelve, por forma, su probabilidad y sus partidas reales: las de sus hojas (si tu jugada del curso no tiene
 * partidas, las de la posición donde la juegas); en "sin datos", las que fueron a jugadas con menos de 3 partidas.
 */
export function estructuras(A, LP, raiz, forma, tope = 12) {
  const f = new Map()
  const suma = (F, p, nReal) => {
    const x = f.get(F) ?? { p: 0, n: 0 }
    x.p += p
    x.n += nReal
    f.set(F, x)
  }
  const largo = (s) => (s ? s.split(' ').length : 0)
  const rival = (s, p, fuera) => {
    let hs = A.de(s)
    if (fuera) hs = hs.filter((h) => !fuera.includes(h))
    const t = hs.reduce((a, k) => a + A.n(k), 0)
    const den = fuera ? t : Math.max(t, A.n(s) - A.fin(s))
    if (!t || largo(s) >= tope) return suma(forma(s), p, A.n(s))
    for (const k of hs) mio(k, (p * A.n(k)) / den)
    if (den > t) suma(SIN_DATOS, (p * (den - t)) / den, den - t)
  }
  const mio = (s, p) => {
    if (largo(s) >= tope) return suma(forma(s), p, A.n(s))
    const r = LP.get(fenDe(s))
    if (r) {
      const sig = s ? s + ' ' + r : r
      if (A.n(sig)) return rival(sig, p)
      return suma(forma(sig), p, A.n(s))
    }
    const hs = A.de(s)
    const t = hs.reduce((a, k) => a + A.n(k), 0)
    const den = Math.max(t, A.n(s) - A.fin(s))
    if (!t) return suma(forma(s), p, A.n(s))
    for (const k of hs) rival(k, (p * A.n(k)) / den)
    if (den > t) suma(SIN_DATOS, (p * (den - t)) / den, den - t)
  }
  if (raiz.carlos !== undefined) mio(raiz.carlos, 1)
  else rival(raiz.rival, 1, raiz.fuera)
  return f
}

/** Lo que pasa después de una jugada (`huecos.mjs`): los dos lados juegan lo que juega la gente, hasta la media jugada `tope`. */
export function despues(A, raiz, clasifica, tope = 12) {
  const f = new Map()
  const anda = (s, p) => {
    const hs = A.de(s)
    const t = hs.reduce((a, k) => a + A.n(k), 0)
    if (!t || s.split(' ').length >= tope) {
      const F = clasifica(s)
      f.set(F, (f.get(F) || 0) + p)
      return
    }
    for (const k of hs) anda(k, (p * A.n(k)) / t)
  }
  anda(raiz, 1)
  return f
}

/** Una celda: `pct` con un decimal y `n`; sin partidas, `null` ("sin datos" no es 0 %: el conteo solo guarda 3 o más). */
export const celda = (p, n) => (n > 0 ? { pct: pct(p), n } : { pct: null, n: 0 })
