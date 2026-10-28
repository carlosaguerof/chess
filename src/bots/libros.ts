import type { FuenteJugadas } from '../motor/bot.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import type { Personaje } from './personajes.ts'

/** Las líneas (SAN en inglés, desde la posición inicial) de una apertura o variante de la base, por su id ("caro-kann", "caro-kann:avance"). */
export type LineasPorClave = (clave: string) => string[][]

/** Hasta cuántas jugadas propias juega el bot de su libro (unas 6 a 8). */
export const JUGADAS_DE_LIBRO = 8

/**
 * El libro de un personaje para un color: de sus aperturas (estilo), las líneas que siguen la partida;
 * escoge la siguiente jugada entre ellas, más probable la que aparece en más líneas.
 */
export function libroDe(p: Personaje, colorBot: ColorCorto, lineas: LineasPorClave): FuenteJugadas {
  const candidatas = candidatasDeLibro(p, colorBot, lineas)
  return (historia, azar) => {
    const siguientes = candidatas(historia)
    if (siguientes.length === 0) return null
    return siguientes[Math.floor(azar() * siguientes.length)]!
  }
}

/** Todas las jugadas que el libro podría jugar en esa posición (con repetición: más probable la que está en más líneas). */
export function candidatasDeLibro(p: Personaje, colorBot: ColorCorto, lineas: LineasPorClave): (historia: string[]) => string[] {
  const claves = colorBot === 'w' ? p.estilo.blancas : p.estilo.negras
  const todas = claves.flatMap((c) => lineas(c))
  return (historia) => {
    const ply = historia.length
    const turnoBot = (ply % 2 === 0 ? 'w' : 'b') === colorBot
    if (!turnoBot || Math.floor(ply / 2) >= JUGADAS_DE_LIBRO) return []
    const siguientes: string[] = []
    for (const l of todas) {
      if (l.length <= ply) continue
      if (historia.every((s, i) => l[i] === s)) siguientes.push(l[ply]!)
    }
    return siguientes
  }
}
