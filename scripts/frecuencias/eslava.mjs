// Las frecuencias de la Defensa Eslava (`eslava:b`), con el método de su mapa (`iterations/v4/mapa-eslava.md`,
// "Obligatorio y opcional"). El método, en `eslava-comun.mjs`; aquí, lo propio del curso:
//
// - **Las partidas del curso** son las que llegan a su tronco, 1.d4 d5 2.c4 (el denominador del mapa, decisión del
//   worker del curso: desde 1.d4, 2.Af4, 2.Cc3, 2.e3 y 2.Cf3 se llevan del 75 % al 87 % sin ser Eslava).
// - **Una lección**: su probabilidad desde 1.d4 (juegas 1...d5 y lo del curso), dividida entre la de llegar a 2.c4 (el
//   "informe de frecuencias dividido entre la parte de 1.d4 que llega a 2.c4" del mapa).
// - **Una forma**: el recorrido de `estructuras.mjs` desde 2.c4, hasta la media jugada 12. Es lo mismo que recorrer desde
//   1.d4 y quedarse con la parte de la Eslava, como hizo el mapa ("dentro de la Eslava").
import { BANDAS, arbol, fenDe } from './comun.mjs'
import { SIN_DATOS, alcance, celda, despues, estructuras, jugar, leccionesDelCurso, libro, medida, peones } from './eslava-comun.mjs'

const TRONCO = 'd4 d5 c4'
const C6 = 'd4 d5 c4 c6'
/** La posición donde el mapa te pide tomar en c4 (el gate de la Checa): 3.Cf3 Cf6 4.Cc3. */
const GATE = 'd4 d5 c4 c6 Nf3 Nf6 Nc3'

/** Los nombres de las formas, como las etiquetas del curso (`estructura` de cada variante). */
const NOMBRE = {
  cambio: 'Blancas cambia en d5',
  tension: 'Nadie cambia peones',
  defiendes: 'Tomas en c4 y lo defiendes',
  checa: 'Blancas juega a4 contra tu peón de c4',
}
/** Lo demás de la tabla de formas del mapa. */
const OTRA = {
  sinDecidir: 'Tomas en c4, sin decidir',
  [SIN_DATOS]: 'Sin datos (jugadas con menos de 3 partidas)',
  otra: 'Otra (casi todo 3.c5)',
  e4: 'Fuera del mapa: 3.e4',
}

/** La forma de un camino, por sus jugadas y su posición (`formaEslava` de estructuras.mjs, con la regla del hallazgo 6). */
function forma(seq) {
  if (!seq.startsWith(C6)) throw new Error(`fuera del tronco: ${seq}`)
  const { g, m } = jugar(seq)
  const cambio = m.some((x, i) => x.color === 'w' && x.from === 'c4' && x.to === 'd5' && m[i + 1]?.from === 'c6' && m[i + 1]?.to === 'd5')
  if (cambio) return 'cambio'
  const tomas = m.findIndex((x) => x.color === 'b' && x.from === 'd5' && x.to === 'c4')
  if (tomas >= 0) {
    const b5 = m.findIndex((x, i) => i > tomas && x.color === 'b' && x.from === 'b7' && x.to === 'b5')
    const a4 = m.findIndex((x, i) => i > tomas && x.color === 'w' && x.from === 'a2' && x.to === 'a4')
    if (b5 >= 0 && (a4 < 0 || a4 > b5)) return 'defiendes'
    if (a4 >= 0) return 'checa'
    return 'sinDecidir'
  }
  // nadie cambió peones en el centro (en c4 ni en d5); fuera del centro sí puede haber capturas (7.Cxg6 hxg6)
  const P = peones(g)
  if (P.w.has('c4') && P.w.has('d4') && P.b.has('d5') && P.b.has('c6') && !m.some((x) => x.captured && (x.to === 'c4' || x.to === 'd5'))) return 'tension'
  if (m.some((x) => x.color === 'w' && x.from === 'e2' && x.to === 'e4' && x.flags.includes('b'))) return 'e4'
  return 'otra'
}

/** ¿Llegó alguna vez a la formación de la Eslava (peones blancos en c4 y d4, negros en c6 y d5)? (`huecos.mjs`) */
function llegaALaEslava(seq) {
  const { m } = jugar(seq)
  const g = jugar('').g
  for (const x of m) {
    g.move(x.san)
    const P = peones(g)
    if (P.w.has('c4') && P.w.has('d4') && P.b.has('c6') && P.b.has('d5')) return 'llega'
  }
  return 'no llega'
}
/** Las segundas jugadas de blancas sin lección (antes del tronco), y cuánto llegan después a la Eslava. */
const ANTES = { Bf4: '2.Af4', Nc3: '2.Cc3', e3: '2.e3', Nf3: '2.Cf3' }

export default function medir(datos) {
  const { lecciones: lecs } = leccionesDelCurso('eslava')
  const LP = libro(lecs, 'b')
  for (const l of lecs) if (l.forma !== null && !Object.values(NOMBRE).includes(l.forma)) throw new Error(`forma sin medir: ${l.forma}`)

  const partidas = {}
  const lecciones = Object.fromEntries(lecs.map((l) => [l.id, { forma: l.forma }]))
  const formas = Object.fromEntries(Object.values(NOMBRE).map((f) => [f, {}]))
  const claves = {
    tronco: 'La Eslava (1.d4 d5 2.c4), de las partidas con 1.d4 d5',
    c6: '2...c6, de las partidas de la Eslava (las que la juegan de verdad)',
    gate: 'La posición de 4.Cc3, donde tomas en c4 (el gate de la Checa)',
    e3: '3.e3, de las partidas con 2...c6',
    c5: '3.c5, de las partidas con 2...c6',
    ...Object.fromEntries(Object.entries(ANTES).map(([m, t]) => [`antes-${m}`, `${t}: no llega a la Eslava (n: las partidas con 1.d4 d5 ${t})`])),
  }
  const otras = Object.fromEntries([...Object.values(OTRA), ...Object.values(claves)].map((k) => [k, {}]))
  // el orden de `otras`: primero lo de la tabla de formas, luego lo demás
  const ordenOtras = [OTRA.sinDecidir, OTRA[SIN_DATOS], OTRA.otra, OTRA.e4]

  for (const banda of BANDAS) {
    const A = arbol(datos.bandas[banda])
    const parte = (h, s) => celda(A.n(s) - A.fin(s) > 0 ? A.n(h) / (A.n(s) - A.fin(s)) : 0, A.n(h))
    partidas[banda] = A.n(TRONCO)

    // las lecciones: su probabilidad desde 1.d4, dividida entre la de llegar a 2.c4
    const { pr, n } = alcance(A, LP, { carlos: 'd4' })
    const ini = pr.get(fenDe(TRONCO)) || 0
    if (!ini) throw new Error(`no llega al tronco en ${banda}`)
    for (const l of lecs) {
      const k = fenDe(medida(lecs, l, 'b'))
      lecciones[l.id][banda] = celda((pr.get(k) || 0) / ini, n.get(k) || 0)
    }
    otras[claves.gate][banda] = celda((pr.get(fenDe(GATE)) || 0) / ini, n.get(fenDe(GATE)) || 0)

    // las formas: desde 2.c4 (donde te toca), hasta la media jugada 12
    const f = estructuras(A, LP, { carlos: TRONCO }, forma)
    for (const F of f.keys()) if (!(F in NOMBRE) && !(F in OTRA)) throw new Error(`forma desconocida: ${F}`)
    for (const [F, nombre] of Object.entries(NOMBRE)) formas[nombre][banda] = celda(f.get(F)?.p ?? 0, f.get(F)?.n ?? 0)
    for (const [F, nombre] of Object.entries(OTRA)) otras[nombre][banda] = celda(f.get(F)?.p ?? 0, f.get(F)?.n ?? 0)

    // lo demás que dice el mapa
    otras[claves.tronco][banda] = parte(TRONCO, 'd4 d5')
    otras[claves.c6][banda] = parte(C6, TRONCO)
    otras[claves.e3][banda] = parte(C6 + ' e3', C6)
    otras[claves.c5][banda] = parte(C6 + ' c5', C6)
    for (const m of Object.keys(ANTES)) {
      const raiz = 'd4 d5 ' + m
      otras[claves[`antes-${m}`]][banda] = celda(despues(A, raiz, llegaALaEslava).get('no llega') ?? 0, A.n(raiz))
    }
  }

  return {
    metodo:
      'Las partidas del curso son las que llegan a 1.d4 d5 2.c4 (`partidas`); todo porcentaje de lección y de forma es de ellas. ' +
      'Una lección se mide en la posición tras la jugada del rival que la separa de las demás (si es principio de otra, en su final): la probabilidad de llegar ahí (por su FEN, todos los caminos) desde 1.d4, jugando siempre lo del curso (fuera del curso el camino no se sigue) y el rival lo que se juega entre las partidas que siguen, dividida entre la de llegar a 2.c4; su `n`, las partidas reales que llegaron. ' +
      'Una forma se mide hasta la media jugada 12, desde 2.c4: lo del curso mientras haya respuesta y fuera de él lo que juega la gente, el rival lo que se juega, repartido entre todas las partidas que siguen (lo que va por jugadas con menos de 3 partidas queda "sin datos"); cada hoja se clasifica por sus jugadas (las cuatro formas de la prueba) y su `n` son las partidas reales de sus hojas (si tu jugada del curso no tiene partidas, las de la posición donde la juegas). ' +
      'Sin partidas (el conteo solo guarda las jugadas con 3 o más), `pct` es null: "sin datos", no 0 %. En el mapa, la Checa sale "sin datos" y las demás lecciones sin partidas "0.0 %" (n 0); aquí todas son null. ' +
      'Las jugadas sin lección: 3.e3 y 3.c5, de las partidas con 2...c6; 2.Af4, 2.Cc3, 2.e3 y 2.Cf3, lo que sigue con los dos lados jugando lo que juega la gente, hasta la media jugada 12 (`huecos.mjs`).',
    partidas,
    lecciones,
    formas,
    otras: Object.fromEntries([...ordenOtras, ...Object.values(claves)].map((k) => [k, otras[k]])),
  }
}
