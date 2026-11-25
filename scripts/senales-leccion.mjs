// Cómo se prueba una lección nueva (`specs/cursos.md` §6, n.º 6): en cada posición de la lección donde le toca al rival,
// contra sus dos respuestas más jugadas (3 partidas o más, en las dos bandas juntas) o, sin partidas, contra las dos
// mejores del motor, ¿la siguiente jugada de la lección pierde material? Escribe una fila de Markdown por medida.
//
//   node scripts/senales-leccion.mjs <id> "<jugadas de la lección, SAN inglés>" [conteo.json]
//
// El conteo de partidas vive fuera del repo (`scripts/frecuencias/comun.mjs`, CONTEO_POR_DEFECTO); el motor es el de
// `scripts/motor-comprobar.ts` (Stockfish 19 lite, un hilo, profundidad 18). "Pierde" es lo que pierde la jugada contra
// la mejor de esa posición, en centipeones; la línea del motor dice si es material.
import { execFileSync } from 'node:child_process'
import { Chess } from 'chess.js'
import { cargarConteo, CONTEO_POR_DEFECTO, BANDAS, limpia } from './frecuencias/comun.mjs'

const [id, texto, archivo = CONTEO_POR_DEFECTO] = process.argv.slice(2)
const L = texto.split(/\s+/).filter(Boolean)
const { datos } = cargarConteo(archivo)
const motor = (...a) => execFileSync('node', ['scripts/motor-comprobar.ts', ...a], { encoding: 'utf8' })

/** Las respuestas del rival con 3 partidas o más, sumando las dos bandas. */
function jugadas(seq) {
  const pre = seq.map(limpia).join(' ') + ' '
  const n = new Map()
  for (const b of BANDAS)
    for (const [k, v] of Object.entries(datos.bandas[b])) if (k.startsWith(pre) && !k.slice(pre.length).includes(' ')) n.set(k.slice(pre.length), (n.get(k.slice(pre.length)) ?? 0) + v[0])
  return [...n].filter(([, x]) => x >= 3).sort((a, b) => b[1] - a[1])
}

const sanDe = (seq, m) => {
  const c = new Chess()
  for (const s of seq) c.move(s)
  try {
    return c.move(m).san
  } catch {
    return null
  }
}

console.log(`| Id | Posición (le toca al rival) | Respuesta | Partidas | Tu jugada | Resultado del motor |`)
console.log(`|---|---|---|---|---|---|`)
for (let i = 1; i < L.length; i += 2) {
  if (i < 3) continue
  const pos = L.slice(0, i)
  const sig = L[i + 1]
  if (!sig) break
  let resp = jugadas(pos).slice(0, 2).map(([m, n]) => [sanDe(pos, m), `${n}`])
  let fuente = 'partidas'
  if (resp.length < 2) {
    const out = motor('mejores', pos.join(' '), '--n', '2')
    const mot = [...out.matchAll(/^\s+[+-][\d.]+\s+(\S+)/gm)].map((x) => x[1])
    for (const m of mot) if (!resp.some(([r]) => r === m)) resp.push([m, 'motor'])
    resp = resp.slice(0, 2)
    fuente = 'motor'
  }
  for (const [r, n] of resp) {
    if (!r) continue
    const tras = [...pos, r]
    const lasuya = sanDe(tras, sig)
    let res
    if (!lasuya) res = `${sig} no es legal aquí`
    else {
      const out = motor('jugada', tras.join(' '), lasuya)
      const mejor = out.match(/mejor: (\S+)\s+(\S+)/)
      const pierde = out.match(/pierde (-?\d+)/)
      const linea = out.match(new RegExp(`${lasuya.replace(/[+]/g, '\\+')}: (.*)`))
      res = `mejor ${mejor?.[2]} (${mejor?.[1]}) · ${lasuya}: ${linea ? linea[1].trim() : '?'} · pierde ${pierde?.[1] ?? 0}`
    }
    console.log(`| ${id}-${i}-${r} | ${pos.join(' ')} | ${r} | ${n} (${fuente}) | ${sig} | ${res} |`)
  }
}
