// Las frecuencias de Otras aperturas de blancas (`otros-negras:b`, "...c6 + ...d5 contra lo demás"), con el método de
// su mapa (`iterations/v4/mapa-otros-negras.md`, "Obligatorio y opcional"). El método, en `eslava-comun.mjs`; aquí, lo
// propio del curso:
//
// - **Las partidas del curso**: toda primera jugada de blancas que no es 1.e4 ni 1.d4.
// - **Una lección**: su probabilidad entre esas partidas (juegas lo del curso; el rival, lo que se juega).
// - **Una forma**: el recorrido de `estructuras.mjs` desde la primera jugada, hasta la media jugada 12, clasificado por
//   qué peón de blancas ataca tu peón de d5 (mirando todo el camino).
import { BANDAS, arbol, fenDe } from './comun.mjs'
import { SIN_DATOS, alcance, celda, despues, estructuras, jugar, leccionesDelCurso, libro, medida } from './eslava-comun.mjs'

const FUERA = ['e4', 'd4']

/** Los nombres de las formas, como las etiquetas del curso (`estructura` de cada variante). */
const NOMBRE = {
  centro: 'Blancas no ataca tu peón de d5',
  anglo: 'Blancas ataca d5 con c4, sin d4',
  eslava: 'Blancas juega c4 y d4: es la Eslava',
}
/** Lo demás de la tabla de formas del mapa. */
const OTRA = {
  e4: 'Con e4 (sin lección)',
  sinD5: 'Sin ...d5 (sobre todo 1.e3 e5)',
  [SIN_DATOS]: 'Sin datos (jugadas con menos de 3 partidas)',
}

/** ¿Qué peón de blancas ataca tu peón de d5? Mirando todo el camino (`formaOtros` de estructuras.mjs). */
function forma(seq) {
  const { m } = jugar(seq)
  if (FUERA.includes(m[0]?.san)) throw new Error(`no es del curso: ${seq}`)
  if (!m.some((x) => x.color === 'b' && x.to === 'd5' && x.piece === 'p')) return 'sinD5'
  const llega = (sq) => m.some((x) => x.color === 'w' && x.piece === 'p' && x.to === sq)
  if (llega('c4') && llega('d4')) return 'eslava'
  if (llega('c4')) return 'anglo'
  if (llega('e4')) return 'e4'
  return 'centro'
}

export default function medir(datos) {
  const { lecciones: lecs } = leccionesDelCurso('otros-negras')
  const LP = libro(lecs, 'b')
  for (const l of lecs) if (!Object.values(NOMBRE).includes(l.forma)) throw new Error(`forma sin medir: ${l.forma}`)
  const raiz = { rival: '', fuera: FUERA }

  const partidas = {}
  const lecciones = Object.fromEntries(lecs.map((l) => [l.id, { forma: l.forma }]))
  const formas = Object.fromEntries(Object.values(NOMBRE).map((f) => [f, {}]))
  const claves = {
    e3: '1.e3, de las partidas del curso',
    e3Centro: '1.e3: si contestas ...d5, llega al Centro libre (n: las partidas con 1.e3)',
    d4: '1.Cf3 d5 2.d4, de las partidas con 1.Cf3 d5',
    d4Centro: '1.Cf3 d5 2.d4: llega al Centro libre (n: las partidas con 1.Cf3 d5 2.d4)',
    c4d4: '1.c4 c6 2.d4, de las partidas con 1.c4 c6',
    e4: '1.Cf3 d5 2.e4, de las partidas con 1.Cf3 d5',
    e4Curso: '1.Cf3 d5 2.e4, de las partidas del curso',
  }
  const otras = Object.fromEntries([...Object.values(OTRA), ...Object.values(claves)].map((k) => [k, {}]))

  for (const banda of BANDAS) {
    const A = arbol(datos.bandas[banda])
    const parte = (h, s) => celda(A.n(s) - A.fin(s) > 0 ? A.n(h) / (A.n(s) - A.fin(s)) : 0, A.n(h))
    const total = A.de('').filter((h) => !FUERA.includes(h)).reduce((t, h) => t + A.n(h), 0)
    partidas[banda] = total

    // las lecciones: su probabilidad entre las partidas del curso
    const { pr, n } = alcance(A, LP, raiz)
    for (const l of lecs) {
      const k = fenDe(medida(lecs, l, 'b'))
      lecciones[l.id][banda] = celda(pr.get(k) || 0, n.get(k) || 0)
    }
    const kE4 = fenDe('Nf3 d5 e4')
    otras[claves.e4Curso][banda] = celda(pr.get(kE4) || 0, n.get(kE4) || 0)

    // las formas, hasta la media jugada 12
    const f = estructuras(A, LP, raiz, forma)
    for (const F of f.keys()) if (!(F in NOMBRE) && !(F in OTRA)) throw new Error(`forma desconocida: ${F}`)
    for (const [F, nombre] of Object.entries(NOMBRE)) formas[nombre][banda] = celda(f.get(F)?.p ?? 0, f.get(F)?.n ?? 0)
    for (const [F, nombre] of Object.entries(OTRA)) otras[nombre][banda] = celda(f.get(F)?.p ?? 0, f.get(F)?.n ?? 0)

    // las jugadas del rival sin lección que dice el mapa
    otras[claves.e3][banda] = celda(A.n('e3') / total, A.n('e3'))
    const e3 = despues(A, 'e3', forma)
    otras[claves.e3Centro][banda] = celda((e3.get('centro') ?? 0) / (1 - (e3.get('sinD5') ?? 0)), A.n('e3'))
    otras[claves.d4][banda] = parte('Nf3 d5 d4', 'Nf3 d5')
    otras[claves.d4Centro][banda] = celda(despues(A, 'Nf3 d5 d4', forma).get('centro') ?? 0, A.n('Nf3 d5 d4'))
    otras[claves.c4d4][banda] = parte('c4 c6 d4', 'c4 c6')
    otras[claves.e4][banda] = parte('Nf3 d5 e4', 'Nf3 d5')
  }

  return {
    metodo:
      'Las partidas del curso son las de toda primera jugada de blancas que no es 1.e4 ni 1.d4 (`partidas`); todo porcentaje de lección y de forma es de ellas. ' +
      'Una lección se mide en la posición tras la jugada del rival que la separa de las demás (la de 1.c4 con 2.Cc3, en 1.c4 c6 2.Cc3): la probabilidad de llegar ahí (por su FEN, todos los caminos), jugando siempre lo del curso (fuera del curso el camino no se sigue) y el rival lo que se juega entre las partidas que siguen; su `n`, las partidas reales que llegaron. ' +
      'Una forma se mide hasta la media jugada 12: lo del curso mientras haya respuesta y fuera de él lo que juega la gente, el rival lo que se juega, repartido entre todas las partidas que siguen (lo que va por jugadas con menos de 3 partidas queda "sin datos"); cada hoja se clasifica por qué peón de blancas ataca tu peón de d5 en todo el camino, y su `n` son las partidas reales de sus hojas (si tu jugada del curso no tiene partidas, las de la posición donde la juegas). ' +
      'Sin partidas (el conteo solo guarda las jugadas con 3 o más), `pct` es null: "sin datos", no 0 %; en el mapa, "0.0 %" (n 0). ' +
      'Una diferencia con el mapa, por la base: el mapa midió las formas con la Húngara de antes (3...Ag4 tras 1.g3 d5 2.Ag2 c6 3.Cf3); la de hoy juega 3...Cf6 (una sola jugada por posición, como la Réti con 2.g3), y en 1000–1400 el Centro libre baja de 33.8 % a 32.7 % y "sin datos" sube de 39.8 % a 40.8 % (con 3...Ag4, este script da los números del mapa). Ninguna sección cambia. ' +
      'Las jugadas sin lección: su parte de su posición; "llega al Centro libre", lo que sigue con los dos lados jugando lo que juega la gente, hasta la media jugada 12 (`huecos.mjs`; tras 1.e3, entre los caminos con ...d5).',
    partidas,
    lecciones,
    formas,
    otras,
  }
}
