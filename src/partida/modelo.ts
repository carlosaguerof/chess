import type { Chess } from 'chess.js'
import { FEN_INICIAL, finPorReglas, partidaDesde, type ColorCorto, type Fin } from '../ajedrez/reglas.ts'

/** Una partida contra un bot, como se guarda en el navegador. */
export interface PartidaGuardada {
  id: string
  botId: string
  colorHumano: ColorCorto
  fenInicial: string
  /** jugadas en UCI desde fenInicial */
  jugadas: string[]
  fin: Fin | null
  orientacion: 'white' | 'black'
  /** cuántas veces deshice (para las estrellas, T16) */
  deshechas: number
  iniciada: number
  /** la guía de aperturas (T9) y "que juegue mis líneas" */
  opciones: OpcionesPartida
  /** cuántas veces pedí Pista o Respuesta (para las estrellas, T16) */
  ayudas: { pista: number; respuesta: number }
  /** el bot espera: me desvié de mi línea y tengo que decidir si sigo o deshago */
  pausa?: 'desvio' | null
}

export interface OpcionesPartida {
  guia: boolean
  misLineas: boolean
}

export const OPCIONES_POR_DEFECTO: OpcionesPartida = { guia: true, misLineas: true }

export function nuevaPartida(botId: string, colorHumano: ColorCorto, fenInicial = FEN_INICIAL, opciones: OpcionesPartida = OPCIONES_POR_DEFECTO): PartidaGuardada {
  return {
    opciones,
    ayudas: { pista: 0, respuesta: 0 },
    pausa: null,
    id: Math.random().toString(36).slice(2, 10),
    botId,
    colorHumano,
    fenInicial,
    jugadas: [],
    fin: null,
    orientacion: colorHumano === 'w' ? 'white' : 'black',
    deshechas: 0,
    iniciada: Date.now(),
  }
}

export function ajedrezDe(p: PartidaGuardada): Chess {
  return partidaDesde(p.fenInicial, p.jugadas)
}

export const turnoDe = (p: PartidaGuardada): ColorCorto => ajedrezDe(p).turn()

/** Agrega una jugada y revisa si la partida terminó. */
export function conJugada(p: PartidaGuardada, uci: string): PartidaGuardada {
  const jugadas = [...p.jugadas, uci]
  const chess = partidaDesde(p.fenInicial, jugadas)
  return { ...p, jugadas, fin: finPorReglas(chess) }
}

/**
 * Deshacer contra el bot: mi última jugada y su respuesta (dos medias jugadas).
 * Si la última jugada fue mía (el bot no alcanzó a contestar), solo esa.
 */
export function deshacer(p: PartidaGuardada): PartidaGuardada {
  if (p.fin || p.jugadas.length === 0) return p
  const inicio: ColorCorto = p.fenInicial.split(' ')[1] === 'b' ? 'b' : 'w'
  const quienMovio = (i: number): ColorCorto => (i % 2 === 0 ? inicio : inicio === 'w' ? 'b' : 'w')
  // la última jugada mía: se quita ella y todo lo que vino después (la respuesta del bot)
  let ultimaMia = -1
  for (let i = p.jugadas.length - 1; i >= 0; i--)
    if (quienMovio(i) === p.colorHumano) {
      ultimaMia = i
      break
    }
  if (ultimaMia < 0) return p
  return { ...p, jugadas: p.jugadas.slice(0, ultimaMia), deshechas: p.deshechas + 1, pausa: null }
}

export function puedeDeshacer(p: PartidaGuardada): boolean {
  return deshacer(p) !== p
}

export function rendirse(p: PartidaGuardada): PartidaGuardada {
  if (p.fin) return p
  return { ...p, fin: { tipo: 'rendicion', ganador: p.colorHumano === 'w' ? 'b' : 'w', nombre: 'Abandono' } }
}

export type Resultado = 'gane' | 'perdi' | 'tablas'

export function resultadoPara(p: PartidaGuardada): Resultado | null {
  if (!p.fin) return null
  if (p.fin.ganador === null) return 'tablas'
  return p.fin.ganador === p.colorHumano ? 'gane' : 'perdi'
}
