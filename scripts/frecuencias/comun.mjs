// Lo que comparten los scripts de frecuencias de cada curso (cierre de los cursos, 2026-11-25, §3.5).
//
// Los números de la regla de obligatorio y opcional (`specs/cursos.md` §6) salen de un conteo de partidas reales de
// lichess (CC0) que vive fuera del repo, porque es grande (`00_corridas/_local/chess/frecuencias-siete/conteo.json`,
// 1.4 MB; cómo se rehace, en su LEEME.md). Cada curso mide sus lecciones y sus formas con su propio script
// (`scripts/frecuencias/<curso>.mjs`, el método de su mapa en `iterations/v4/mapa-*.md`), y el resultado, chico, se
// guarda en `conocimiento/frecuencias/<curso>.json`: las pruebas leen de ahí. Para rehacerlos:
//
//   node scripts/frecuencias-cursos.mjs [conteo.json] [curso…]
//
// **El conteo no está en el repo** (1.4 MB) y estos scripts lo necesitan; las pruebas no: leen los JSON chicos. Se rehace
// desde el PGN abierto de lichess con los scripts de su carpeta (`LEEME.md` ahí, "Cómo se rehace"): bajar los primeros
// 2 GiB de `https://database.lichess.org/standard/lichess_db_standard_rated_2026-09.pgn.zst`; `extrae.py` (las partidas
// "Rated Rapid game" con los dos jugadores en 600–1000 o 1000–1400, hasta 24 medias jugadas), `prefijos.py` y `minimo.py`
// (cuántas partidas pasan por cada secuencia, con 3 o más) y `necesarias.mjs` (el recorte a lo que usan los cursos). Esos
// scripts tampoco están en el repo. El `sha256` de cada JSON dice de qué conteo salió.
//
// Este archivo viene de `comun.mjs` de esa carpeta (la clave de una posición, el árbol de partidas), con chess.js del repo.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { Chess } from 'chess.js'

export { Chess }

/** El conteo por defecto: el de la corrida de frecuencias del 2026-11-25, fuera del repo. */
export const CONTEO_POR_DEFECTO = process.env.CONTEO ?? join(homedir(), '01_repos/00_corridas/_local/chess/frecuencias-siete/conteo.json')

export function cargarConteo(archivo) {
  const texto = readFileSync(archivo)
  return { datos: JSON.parse(texto), sha256: createHash('sha256').update(texto).digest('hex') }
}

export const BANDAS = ['600-1000', '1000-1400']

/** SAN sin + ni #, como las llaves del conteo. */
export const limpia = (s) => s.replace(/[+#]/g, '')

/** Clave de una posición: tablero, turno, enroques y al paso (las 4 primeras partes del FEN). */
export const clave = (fen) => fen.split(' ').slice(0, 4).join(' ')

const cacheFen = new Map([['', clave(new Chess().fen())]])
/** La clave de la posición tras una secuencia ("e4 e5 Nf3"), o null si no es legal. */
export function fenDe(seq) {
  if (cacheFen.has(seq)) return cacheFen.get(seq)
  const i = seq.lastIndexOf(' ')
  const padre = i < 0 ? '' : seq.slice(0, i)
  const san = i < 0 ? seq : seq.slice(i + 1)
  const fp = fenDe(padre)
  let k = null
  if (fp) {
    const g = new Chess(fp + ' 0 1')
    try {
      g.move(san)
      k = clave(g.fen())
    } catch {
      k = null
    }
  }
  cacheFen.set(seq, k)
  return k
}

/** ¿La media jugada `ply` (desde 0) es del color `color`? */
export const esDeCarlos = (color, ply) => (ply % 2 === 0 ? 'w' : 'b') === color

/** El árbol de partidas de una banda: secuencia → [n, fin]; hijos por secuencia. */
export function arbol(sec) {
  const hijos = new Map()
  for (const k of Object.keys(sec)) {
    if (k === '') continue
    const i = k.lastIndexOf(' ')
    const p = i < 0 ? '' : k.slice(0, i)
    if (!hijos.has(p)) hijos.set(p, [])
    hijos.get(p).push(k)
  }
  return { sec, hijos, n: (s) => (sec[s] ? sec[s][0] : 0), fin: (s) => (sec[s] ? sec[s][1] : 0), de: (s) => hijos.get(s) || [] }
}

/** Las jugadas de una variante de la base (SAN inglés, sin + ni #), desde la base del repo. */
export function jugadasDeLaBase(apertura, varianteId) {
  const base = JSON.parse(readFileSync(new URL('../../conocimiento/base.json', import.meta.url)))
  const a = base.aperturas.find((x) => x.id === apertura)
  const v = a?.variantes.find((x) => x.id === varianteId)
  if (!v) throw new Error(`no está en la base: ${apertura}/${varianteId}`)
  return v.jugadas.map(limpia)
}

/** El curso del repo (su JSON tal cual; la Caro-Kann por estructuras es una capa y no se mide aquí). */
export function cursoDelRepo(archivo) {
  return JSON.parse(readFileSync(new URL(`../../conocimiento/cursos/${archivo}.json`, import.meta.url)))
}

/** Un porcentaje con un decimal, como en los mapas. */
export const pct = (x) => Math.round(1000 * x) / 10
