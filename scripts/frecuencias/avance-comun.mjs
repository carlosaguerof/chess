// El método de los dos mapas del Avance (contra la Caro-Kann y contra la Francesa), que comparten la pregunta "¿qué pasó
// con d4?" (cierre de los cursos, 2026-11-25, §3.5). Reproduce los scripts con que se hicieron los mapas
// (`iterations/v4/mapa-avance-*.md`), fuera del repo, en `00_corridas/_local/chess/curso-avance/`:
//
// - **Las formas** (`formas.mjs`, sobre `lineas-desde.json`): desde 1.e4 c6 2.d4 d5 (o 1.e4 e6 2.d4 d5), juegas lo del
//   curso mientras haya respuesta (si dos lecciones juegan distinto en una posición, la de la primera lección) y, fuera
//   del curso, lo que juega la gente; lo del rival pesa por lo que se juega en cada paso (entre las que siguen: n − fin).
//   La posición se clasifica a la media jugada 14.
// - **Cada lección** (`nota11-frec.mjs`), con dos medidas: en la posición que la define en la base (la jugada del rival
//   que le da nombre, entre las partidas que llegan ahí) y su parte de tus partidas del curso (desde 1.e4 c6 o 1.e4 e6,
//   el producto de las proporciones de las jugadas del rival; las tuyas, siempre las del curso). La regla de obligatorio
//   y opcional usa la parte de tus partidas (`specs/cursos.md` §6, "Los cursos del Avance…").
// - **Las respuestas sin lección** (`nota10.mjs`): las respuestas del rival a tu 2.d4 y a tu 3.e5, con su parte de tus
//   partidas; van las que no tienen lección y salen en 5 % o más en alguna banda.
import { arbol, fenDe, BANDAS, Chess, jugadasDeLaBase, cursoDelRepo, pct } from './comun.mjs'

/** La media jugada en que se clasifica la forma (la del mapa). */
const MEDIA_JUGADA = 14
/** El corte de las respuestas sin lección que van al mapa (`specs/cursos.md` §6). */
const CORTE_SIN_LECCION = 0.05

/** Las clases de `formas.mjs` y su nombre en el curso (la etiqueta de la página). */
const NOMBRE = {
  'cadena entera': 'Nadie cambia en d4',
  'base sola': 'Negras cambia en d4',
  cerrada: 'Negras empuja a c4',
  'sin peón en d4': 'Sin peón en d4',
  'sin peón en e5': 'Sin peón en e5',
  'no llega a 3.e5': 'No llega a 3.e5',
  otra: 'Otra',
}

/** La forma de una posición: qué pasó con d4, la base de tu cadena (tú eres blancas). Igual que `formas.mjs`. */
function forma(fen) {
  const ch = new Chess(fen)
  const p = (sq, c) => {
    const x = ch.get(sq)
    return !!x && x.type === 'p' && x.color === c
  }
  const colP = (col, c) => [1, 2, 3, 4, 5, 6, 7, 8].some((r) => p(col + r, c))
  if (p('e4', 'w')) return 'no llega a 3.e5'
  if (!p('e5', 'w')) return 'sin peón en e5'
  if (!p('d4', 'w')) return 'sin peón en d4'
  if (p('c4', 'b')) return 'cerrada'
  if (!colP('c', 'w') && !colP('c', 'b')) return 'base sola'
  if (colP('c', 'w')) return 'cadena entera'
  return 'otra'
}

/** El libro del curso: posición antes de tu jugada → tu jugada (la de la primera lección que pasa por ahí). */
function libroDe(lecciones) {
  const m = new Map()
  for (const l of lecciones)
    l.jugadas.forEach((s, i) => {
      if (i % 2 !== 0) return
      const k = fenDe(l.jugadas.slice(0, i).join(' '))
      if (!m.has(k)) m.set(k, s)
    })
  return m
}

/**
 * El recorrido de `formas.mjs`: la masa de cada forma a la media jugada 14 y, además, cuántas partidas reales llegan a
 * cada forma siguiendo el curso (`n`: las de cada hoja del recorrido; no está en el mapa, solo da el tamaño).
 */
function recorre(A, libro, raiz) {
  const masa = new Map()
  const reales = new Map()
  const suma = (m, k, v) => m.set(k, (m.get(k) || 0) + v)
  const fin = (s, p, n) => {
    const f = forma(fenDe(s) + ' 0 1')
    suma(masa, f, p)
    suma(reales, f, n)
  }
  const paso = (s, p, ply) => {
    if (ply >= MEDIA_JUGADA) return fin(s, p, A.n(s))
    if (ply % 2 === 0) {
      const m = libro.get(fenDe(s))
      if (m) {
        const h = s ? `${s} ${m}` : m
        if (!A.sec[h]) return fin(s, p, 0) // los datos se acaban: nadie jugó lo del curso
        return paso(h, p, ply + 1)
      }
    }
    const hijos = A.de(s)
    const den = A.n(s) - A.fin(s)
    if (den <= 0 || !hijos.length) return fin(s, p, Math.max(den, 0))
    let usado = 0
    for (const h of hijos) {
      usado += A.n(h)
      paso(h, (p * A.n(h)) / den, ply + 1)
    }
    if (den > usado) fin(s, (p * (den - usado)) / den, den - usado)
  }
  paso(raiz, 1, raiz.split(' ').length)
  return { masa, reales }
}

/**
 * La parte de tus partidas del curso que llega a `seq` (`nota11-frec.mjs`): desde `inicio`, solo las proporciones de
 * las jugadas del rival, cada una entre las partidas que llegan a su posición. Si a una posición no llega ninguna
 * partida (tu jugada no se jugó ahí), da 0, como en el mapa.
 */
function parte(A, inicio, seq) {
  const j = seq.split(' ')
  let p = 1
  for (let i = inicio.split(' ').length + 1; i < j.length; i += 2) {
    const den = A.n(j.slice(0, i).join(' '))
    if (!den) return 0
    p *= A.n(j.slice(0, i + 1).join(' ')) / den
  }
  return p
}

/** La medida en la posición: la jugada `seq` entre las partidas que llegan a la posición de antes. */
function enSuPosicion(A, seq) {
  const antes = seq.slice(0, seq.lastIndexOf(' '))
  const de = A.n(antes)
  const n = A.n(seq)
  return { pct: de ? pct(n / de) : null, n, de }
}

/** Una jugada del rival (SAN inglés) en la notación de los mapas: "3...Cd7". */
function enMapa(seq) {
  const j = seq.split(' ')
  const san = j.at(-1).replace(/^[NBRQK]/, (x) => ({ N: 'C', B: 'A', R: 'T', Q: 'D', K: 'R' })[x])
  return `${Math.ceil(j.length / 2)}...${san}`
}

/**
 * Mide un curso del Avance.
 * - `archivo`, `apertura`: el curso del repo y su apertura en la base.
 * - `inicio`: el punto de partida de tus partidas ("e4 c6"); `raizFormas`: desde dónde se miden las formas ("e4 c6 d4 d5").
 * - `tronco`: tus jugadas del tronco, con la respuesta del rival que sigue el curso (["d4", "d5"], ["e5"]).
 * - `define`: por lección, la jugada del rival que le da nombre (`[media jugada, SAN]`, la de `nota11-frec.mjs`).
 * - `aparte`: otras jugadas que nombra `fuenteFrecuencia`, medidas igual (`{ nombre: [id de la lección, media jugada, SAN] }`).
 * - `formas`: las clases de `formas.mjs` que son formas del curso; las demás van en `otras` (`resto`).
 */
export function medirAvance(cfg) {
  const curso = cursoDelRepo(cfg.archivo)
  const lecciones = curso.variantes.map((v) => ({ id: v.id, forma: v.estructura ?? null, jugadas: jugadasDeLaBase(cfg.apertura, v.base) }))
  for (const l of lecciones) {
    const d = cfg.define[l.id]
    if (!d) throw new Error(`${cfg.archivo}: la lección ${l.id} no tiene su jugada que la define`)
    if (l.jugadas[d[0]] !== d[1] || d[0] % 2 === 0) throw new Error(`${cfg.archivo}/${l.id}: en la media jugada ${d[0]} no está la jugada del rival ${d[1]}`)
  }
  for (const id of Object.keys(cfg.define)) if (!lecciones.some((l) => l.id === id)) throw new Error(`${cfg.archivo}: ${id} ya no es lección del curso`)
  const libro = libroDe(lecciones)
  const conLeccion = (seq) => lecciones.some((l) => l.jugadas.join(' ').startsWith(seq + ' ') || l.jugadas.join(' ') === seq)

  return (datos) => {
    const partidas = {}
    const lec = Object.fromEntries(lecciones.map((l) => [l.id, { forma: l.forma }]))
    const formas = Object.fromEntries(cfg.formas.map((f) => [NOMBRE[f], {}]))
    const otras = {}
    const pon = (nombre, banda, valor) => ((otras[nombre] ??= {})[banda] = valor)
    const candidatas = new Map() // respuesta sin lección → { banda: { pct, n } }

    for (const banda of BANDAS) {
      const A = arbol(datos.bandas[banda])
      partidas[banda] = A.n(cfg.inicio)

      // las lecciones: su parte de tus partidas (la de la regla) y, en `otras`, la medida en su posición
      for (const l of lecciones) {
        const seq = l.jugadas.slice(0, cfg.define[l.id][0] + 1).join(' ')
        lec[l.id][banda] = { pct: pct(parte(A, cfg.inicio, seq)), n: A.n(seq) }
        pon(`${l.id} · en su posición (${enMapa(seq)})`, banda, enSuPosicion(A, seq))
      }
      for (const [nombre, [id, ply, san]] of Object.entries(cfg.aparte ?? {})) {
        const l = lecciones.find((x) => x.id === id)
        if (l.jugadas[ply] !== san) throw new Error(`${cfg.archivo}/${id}: en la media jugada ${ply} no está ${san}`)
        const seq = l.jugadas.slice(0, ply + 1).join(' ')
        pon(`${nombre} · en su posición (${enMapa(seq)})`, banda, enSuPosicion(A, seq))
        pon(`${nombre} · de tus partidas del curso`, banda, { pct: pct(parte(A, cfg.inicio, seq)), n: A.n(seq) })
      }

      // las formas, desde la raíz de las formas, a la media jugada 14
      const r = recorre(A, libro, cfg.raizFormas)
      const base = A.n(cfg.raizFormas) - A.fin(cfg.raizFormas)
      pon(`Base de las formas: siguen después de ${enMapa(cfg.raizFormas)}`, banda, { pct: pct(parte(A, cfg.inicio, cfg.raizFormas)), n: base })
      for (const f of cfg.formas) formas[NOMBRE[f]][banda] = { pct: pct(r.masa.get(f) || 0), n: r.reales.get(f) || 0 }
      for (const f of Object.keys(NOMBRE)) {
        if (cfg.formas.includes(f)) continue
        if (!cfg.resto.includes(f) && !r.masa.get(f)) continue
        pon(`Forma fuera del curso · ${NOMBRE[f]}`, banda, { pct: pct(r.masa.get(f) || 0), n: r.reales.get(f) || 0 })
      }

      // las respuestas del rival en el tronco, con su parte de tus partidas
      let seq = cfg.inicio
      for (const [mia, sigue] of cfg.tronco) {
        seq = `${seq} ${mia}`
        for (const h of A.de(seq)) {
          if (h === `${seq} ${sigue}` || conLeccion(h)) continue
          const x = { pct: pct(parte(A, cfg.inicio, h)), n: A.n(h), p: parte(A, cfg.inicio, h) }
          if (!candidatas.has(h)) candidatas.set(h, {})
          candidatas.get(h)[banda] = x
        }
        if (sigue) seq = `${seq} ${sigue}`
      }
    }

    // van las que pasan del 5 % en alguna banda, con las dos bandas (sin partidas guardadas en una banda: menos de 3)
    const sinLeccion = [...candidatas].filter(([, b]) => BANDAS.some((x) => b[x] && b[x].p >= CORTE_SIN_LECCION))
    sinLeccion.sort((a, b) => a[0].split(' ').length - b[0].split(' ').length || Math.max(...BANDAS.map((x) => b[1][x]?.p ?? 0)) - Math.max(...BANDAS.map((x) => a[1][x]?.p ?? 0)))
    for (const [h, b] of sinLeccion)
      for (const banda of BANDAS) pon(`Sin lección · ${enMapa(h)}`, banda, b[banda] ? { pct: b[banda].pct, n: b[banda].n } : { pct: null, n: 0 })

    return { metodo: cfg.metodo, partidas, lecciones: lec, formas, otras }
  }
}
