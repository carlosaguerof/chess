// Las frecuencias del curso de la Italiana por estructuras (`italiana:w`): el método de su mapa
// (`iterations/v4/mapa-italiana.md`), rehecho en el repo (cierre de los cursos, 2026-11-25).
//
// Es el método de `estructuras.mjs` del worker del curso (`00_corridas/_local/chess/curso-italiana/`), corrido con la
// raíz en 3.Ac4 (`RAIZ=e4 e5 Nf3 Nc6 Bc4`; su salida, `estructuras-desde.json`), y el de `sinleccion.mjs` para 4...d5:
//
// - **Las partidas del curso** son las que llegan a 1.e4 e5 2.Cf3 Cc6 3.Ac4.
// - **Tú juegas lo del curso:** donde una lección tiene tu jugada (por cualquier orden de jugadas), juegas esa; donde
//   ninguna la tiene, lo que juega la gente. El rival juega lo que juega la gente.
// - **Una lección** se mide en la posición que la define: la primera jugada del rival en que su línea se separa de
//   las demás lecciones. Su `pct` es la probabilidad de llegar ahí (sumando transposiciones); su `n`, las partidas
//   reales que llegaron jugando lo del curso.
// - **Una forma** ("por cualquier camino") se mide tras la 7.ª jugada de negras (14 medias jugadas) o donde se acaban
//   los datos: la forma de la secuencia en cada hoja del árbol.
// - **Redondeo:** un solo redondeo, a un decimal, del valor exacto (`pct` de comun.mjs). El mapa redondeó la Dos Caballos
//   en 600–1000 dos veces (41.649 → 41.65 → 41.7); aquí sale 41.6. Ningún corte de la regla cambia por eso.
import { arbol, fenDe, esDeCarlos, pct, jugadasDeLaBase, cursoDelRepo, BANDAS, Chess } from './comun.mjs'

const RAIZ = 'e4 e5 Nf3 Nc6 Bc4'
/** Las formas se miran tras la 7.ª jugada de negras. */
const HASTA = 14
/** Las 24 medias jugadas que guarda el conteo. */
const TOPE = 24
const FORMAS = { cerrado: 'Centro cerrado', ideal: 'Centro ideal', abierto: 'Centro abierto' }
/** La entrada del mapa sin lección: 4...d5 contra 4.d3 (por la línea de la Dos Caballos con 4.d3). */
const D5 = { nombre: '4...d5 contra 4.d3 (sin lección, en el mapa)', leccion: 'dos-caballos-d3', seq: 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 d5' }
const CC6 = 'e4 e5 Nf3 Nc6'

const jug = (seq) => {
  const c = new Chess()
  return seq.split(' ').map((s) => c.move(s))
}

/** La forma de una secuencia, mirando toda la secuencia (la misma medida que el mapa y su prueba). */
export function forma(seq) {
  const m = jug(seq)
  const exd4 = m.findIndex((x) => x.color === 'b' && x.piece === 'p' && x.from === 'e5' && x.to === 'd4')
  const cxd4 = exd4 >= 0 && m.some((x, i) => i > exd4 && x.color === 'w' && x.piece === 'p' && x.from === 'c3' && x.to === 'd4')
  if (m.some((x) => x.color === 'w' && x.piece === 'n' && x.to === 'g5')) return 'Cg5'
  if (m.some((x) => x.color === 'w' && x.piece === 'p' && x.from === 'e4' && x.to === 'e5')) return 'e5'
  if (exd4 >= 0) return cxd4 ? 'ideal' : 'abierto'
  const d3 = m.some((x) => x.color === 'w' && x.piece === 'p' && x.from === 'd2' && x.to === 'd3')
  const centroQuieto = !m.some((x) => x.piece === 'p' && ((x.color === 'w' && x.from === 'e4') || (x.color === 'b' && x.from === 'e5')))
  return d3 && centroQuieto ? 'cerrado' : 'otra'
}

/** Tu jugada en cada posición de las lecciones (la primera que aparezca; el curso enseña una sola por posición). */
function libro(lecciones) {
  const m = new Map()
  for (const l of lecciones)
    l.jugadas.forEach((s, i) => {
      if (!esDeCarlos('w', i)) return
      const k = fenDe(l.jugadas.slice(0, i).join(' '))
      if (!m.has(k)) m.set(k, s)
    })
  return m
}

/** La posición que define una lección: hasta donde se separa de las demás, sin terminar en una jugada tuya. */
function definicion(lecciones, l) {
  const otras = lecciones.filter((x) => x !== l)
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

/** Recorre el árbol desde la raíz jugando lo del curso: probabilidad y partidas reales de cada posición (por FEN). */
function pasa(A, pol) {
  const pr = new Map()
  const n = new Map()
  const vis = (s, p) => {
    const k = fenDe(s)
    pr.set(k, (pr.get(k) || 0) + p)
    n.set(k, (n.get(k) || 0) + A.n(s))
  }
  const carlos = (s, p, d) => {
    if (d >= TOPE) return
    const m = pol(fenDe(s))
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
    if (d >= TOPE) return
    const den = A.n(s) - A.fin(s)
    if (den <= 0) return
    for (const h of A.de(s)) {
      const pp = (p * A.n(h)) / den
      vis(h, pp)
      carlos(h, pp, d + 1)
    }
  }
  rival(RAIZ, 1, RAIZ.split(' ').length)
  return { pr, n }
}

/**
 * Las hojas del árbol hasta `HASTA` medias jugadas, jugando lo del curso. `hoja(seq, p, partidas)`: `p`, la probabilidad
 * de la hoja; `partidas`, las partidas reales detrás de ella (0 donde tu jugada del curso no tiene datos: ahí nadie la
 * jugó, y la probabilidad es la de haberla jugado).
 */
function recorre(A, pol, hoja) {
  const reparte = (s, p, d, sig) => {
    const kids = A.de(s)
    const den = A.n(s) - A.fin(s)
    if (den <= 0 || !kids.length) return hoja(s, p, A.n(s))
    let u = 0
    for (const h of kids) {
      u += A.n(h)
      sig(h, (p * A.n(h)) / den, d + 1)
    }
    if (den > u) hoja(s, (p * (den - u)) / den, den - u)
  }
  const carlos = (s, p, d) => {
    if (d >= HASTA) return hoja(s, p, A.n(s))
    const m = pol(fenDe(s))
    if (m) {
      const h = s + ' ' + m
      return A.sec[h] ? rival(h, p, d + 1) : hoja(s, p, 0)
    }
    reparte(s, p, d, rival)
  }
  const rival = (s, p, d) => {
    if (d >= HASTA) return hoja(s, p, A.n(s))
    reparte(s, p, d, carlos)
  }
  rival(RAIZ, 1, RAIZ.split(' ').length)
}

const banda = (p, n) => ({ pct: n > 0 || p > 0 ? pct(p) : null, n })

export default function medir(datos) {
  const curso = cursoDelRepo('italiana')
  const lecciones = curso.variantes.map((v) => ({ id: v.id, jugadas: jugadasDeLaBase('italiana', v.base) }))
  const LP = libro(lecciones)
  const pol = (k) => LP.get(k)
  const salida = { partidas: {}, lecciones: {}, formas: {}, otras: {} }
  for (const l of lecciones) {
    const f = forma(l.jugadas.join(' '))
    salida.lecciones[l.id] = { forma: FORMAS[f] ?? null }
  }
  for (const nombre of Object.values(FORMAS)) salida.formas[nombre] = {}
  salida.otras[D5.nombre] = {}
  salida.otras['2...Cc6, de todas las partidas de la banda'] = {}

  for (const b of BANDAS) {
    const A = arbol(datos.bandas[b])
    salida.partidas[b] = A.n(RAIZ)

    const P = pasa(A, pol)
    for (const l of lecciones) {
      const K = fenDe(definicion(lecciones, l))
      salida.lecciones[l.id][b] = banda(P.pr.get(K) || 0, P.n.get(K) || 0)
    }

    const f = {}
    const n = {}
    recorre(A, pol, (s, p, partidas) => {
      const c = forma(s)
      f[c] = (f[c] || 0) + p
      n[c] = (n[c] || 0) + partidas
    })
    for (const [k, nombre] of Object.entries(FORMAS)) salida.formas[nombre][b] = banda(f[k] || 0, n[k] || 0)

    // 4...d5 contra 4.d3, como `sinleccion.mjs`: por la línea exacta de la lección (sin transposiciones),
    // multiplicando lo que elige el rival desde 3.Ac4.
    const l = lecciones.find((x) => x.id === D5.leccion).jugadas
    const fin = D5.seq.split(' ')
    let p = 1
    for (let i = RAIZ.split(' ').length; i < fin.length; i++) {
      if (esDeCarlos('w', i)) continue
      const seq = fin.slice(0, i).join(' ')
      if (i < fin.length - 1 && fin[i] !== l[i]) throw new Error(`4...d5: se separa de la lección en ${seq}`)
      const den = A.n(seq) - A.fin(seq)
      p = den > 0 ? (p * A.n(seq + ' ' + fin[i])) / den : 0
    }
    salida.otras[D5.nombre][b] = banda(p, A.n(D5.seq))
    salida.otras['2...Cc6, de todas las partidas de la banda'][b] = banda(A.n(CC6) / A.n(''), A.n(CC6))
  }

  return {
    metodo:
      'Las partidas del curso son las que llegan a 3.Ac4; tú juegas lo del curso (tu jugada de la lección en cada posición, ' +
      'por cualquier orden; fuera de las lecciones, lo que juega la gente) y el rival lo que juega la gente. Una lección se ' +
      'mide en la jugada del rival que la separa de las demás: pct, la probabilidad de llegar a esa posición sumando ' +
      'transposiciones; n, las partidas reales que llegaron jugando lo del curso. Una forma, en las hojas tras la 7.ª jugada ' +
      'de negras o donde se acaban los datos (n: las partidas reales detrás de esas hojas). 4...d5 contra 4.d3, por la línea ' +
      'exacta de la lección. Es el método de estructuras.mjs (con la raíz en 3.Ac4) y sinleccion.mjs del worker del curso. ' +
      'Cada pct se redondea una sola vez: la Dos Caballos en 600–1000 da 41.6 (41.649 %); el mapa dice 41.7 porque redondeó ' +
      'dos veces (41.65, la salida de estructuras.mjs, y luego a un decimal).',
    ...salida,
  }
}
