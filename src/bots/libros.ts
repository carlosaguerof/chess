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
  const claves = colorBot === 'w' ? p.estilo.blancas : p.estilo.negras
  const todas = claves.flatMap((c) => lineas(c))
  return (historia, azar) => {
    const ply = historia.length
    const turnoBot = (ply % 2 === 0 ? 'w' : 'b') === colorBot
    if (!turnoBot) return null
    if (Math.floor(ply / 2) >= JUGADAS_DE_LIBRO) return null
    const siguientes: string[] = []
    for (const l of todas) {
      if (l.length <= ply) continue
      let sigue = true
      for (let i = 0; i < ply; i++)
        if (l[i] !== historia[i]) {
          sigue = false
          break
        }
      if (sigue) siguientes.push(l[ply]!)
    }
    if (siguientes.length === 0) return null
    return siguientes[Math.floor(azar() * siguientes.length)]!
  }
}
