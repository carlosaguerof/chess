/**
 * Revisa de una vez la forma de un curso nuevo (specs/cursos.md): que cada jugada tenga su texto, que ninguno pase de
 * 40 palabras (salvo las jugadas clave), y que la pregunta de Practicar y la Pista no digan la jugada ni su casilla.
 * Las pruebas (tests/unit/curso-contenido.test.ts) fallan con el primero; este script los lista todos.
 *
 *   node scripts/revisar-curso.ts caro-kann:b
 */
import { Chess } from 'chess.js'
import { CURSOS_NUEVOS, lineasDe, textoMio, textoRival } from '../src/curso/datos.ts'
import { despues, palabras } from '../src/curso/textos.ts'
import { sanAEspanol } from '../src/ajedrez/notacion.ts'

const id = process.argv[2] ?? 'caro-kann:b'
const c = CURSOS_NUEVOS[id]
if (!c) throw new Error(`no hay curso nuevo ${id}`)
let n = 0
const aviso = (...x: unknown[]) => (n++, console.log(...x))
for (const [k, m] of Object.entries(c.mias)) {
  const p = palabras([m.hace, ...despues(m)].join(' '))
  if (p > (m.clave ? 100 : 40)) aviso('LARGO', p, k)
  if (palabras(m.pregunta) > 40) aviso('PREGUNTA LARGA', k)
}
for (const [k, x] of Object.entries(c.rival)) if (palabras(x.texto) > 40) aviso('LARGO (rival)', k)
for (const l of lineasDe(c))
  for (let ply = l.desde; ply < l.jugadas.length; ply++) {
    const camino = l.jugadas.slice(0, ply + 1).join(' ')
    if ((ply % 2 === 0 ? 'w' : 'b') !== l.lado) {
      if (!textoRival(c, l.jugadas, ply)) aviso('FALTA (rival)', l.id, camino)
      continue
    }
    const m = textoMio(c, l.jugadas, ply)
    if (!m) {
      aviso('FALTA', l.id, camino)
      continue
    }
    const ch = new Chess()
    l.jugadas.slice(0, ply).forEach((s) => ch.move(s))
    // las jugadas buenas que la base no trae: legales aquí y distintas de la de la lección
    for (const b of m.buenas ?? []) {
      if (b === l.jugadas[ply]) aviso('BUENA = LA DE LA LECCIÓN', l.id, b)
      try {
        new Chess(ch.fen()).move(b)
      } catch {
        aviso('BUENA ILEGAL', l.id, b, '|', camino)
      }
    }
    const j = ch.move(l.jugadas[ply]!)
    const es = sanAEspanol(j.san).replace(/[+#]/g, '')
    // lo que se ve en Practicar antes de jugar: la frase de la jugada del rival, la pregunta y la Pista
    const antes = ply > l.desde ? textoRival(c, l.jugadas, ply - 1)?.texto ?? '' : ''
    for (const t of [antes, m.pregunta, m.pista ?? '']) {
      if (t.includes(es)) aviso('DELATA', l.id, j.san, '|', t)
      // en una captura, la casilla es donde ya está la pieza rival: nombrarla es contexto, no la respuesta
      else if (!j.captured && !j.flags.includes('k') && !j.flags.includes('q') && new RegExp(`\\b${j.to}\\b`).test(t)) aviso('CASILLA', l.id, j.san, j.to, '|', t)
    }
  }
console.log(n === 0 ? `${id}: sin avisos` : `${id}: ${n} avisos`)
