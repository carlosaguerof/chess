import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { CURSOS_NUEVOS, lineasDe, misJugadas } from '../../src/curso/datos.ts'

/**
 * Una sola jugada tuya por posición (`specs/cursos.md` §1 y §6.1), también entre lecciones distintas y entre cursos: si
 * dos lecciones llegan a la misma posición, por el mismo orden o por otro, te enseñan la misma jugada. Recorre todas las
 * lecciones de todos los cursos de `CURSOS_NUEVOS` (los «¿Y si…?» no: ahí la jugada mala es a propósito). Revisión final de
 * la rama de la Eslava, 2026-11-25: la Húngara y la Réti con 2.g3 enseñaban 3...Ag4 y 3...Cf6 en la misma posición.
 */
describe('Una sola jugada tuya por posición, en todos los cursos', () => {
  it('dos lecciones que llegan a la misma posición enseñan la misma jugada', () => {
    const vista = new Map<string, { san: string; donde: string }>()
    const choques: string[] = []
    for (const c of Object.values(CURSOS_NUEVOS))
      for (const l of lineasDe(c).filter((x) => x.tipo === 'variante')) {
        const mias = new Set(misJugadas(l))
        const ch = new Chess()
        l.jugadas.forEach((san, ply) => {
          // la posición: piezas, turno, enroques y al paso (sin los contadores de jugadas)
          const fen = ch.fen().split(' ').slice(0, 4).join(' ')
          const m = ch.move(san)
          if (!mias.has(ply)) return
          const donde = `${c.id} ${l.id} (jugada ${Math.floor(ply / 2) + 1})`
          const antes = vista.get(fen)
          if (!antes) vista.set(fen, { san: m.san, donde })
          else if (antes.san !== m.san) choques.push(`${fen}: ${antes.donde} enseña ${antes.san}; ${donde} enseña ${m.san}`)
        })
      }
    expect(vista.size).toBeGreaterThan(50)
    expect(choques).toEqual([])
  })
})
