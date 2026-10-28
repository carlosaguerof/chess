import { Chess, type Move, type Square } from 'chess.js'
import { sanAEspanol } from './notacion.ts'

export const FEN_INICIAL = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export type ColorCorto = 'w' | 'b'
export type ColorLargo = 'white' | 'black'

export const largo = (c: ColorCorto): ColorLargo => (c === 'w' ? 'white' : 'black')
export const corto = (c: ColorLargo): ColorCorto => (c === 'white' ? 'w' : 'b')
export const contrario = (c: ColorCorto): ColorCorto => (c === 'w' ? 'b' : 'w')

/** "e2e4", "e7e8q" */
export const uciDe = (m: Pick<Move, 'from' | 'to' | 'promotion'>): string => m.from + m.to + (m.promotion ?? '')

export function uciAObjeto(uci: string): { from: Square; to: Square; promotion?: string } {
  const r: { from: Square; to: Square; promotion?: string } = { from: uci.slice(0, 2) as Square, to: uci.slice(2, 4) as Square }
  if (uci.length > 4) r.promotion = uci[4]
  return r
}

/** Rehace la partida desde su FEN inicial y sus jugadas (UCI). Así la triple repetición tiene todo el historial. */
export function partidaDesde(fenInicial: string, jugadas: string[]): Chess {
  const chess = new Chess(fenInicial)
  for (const uci of jugadas) chess.move(uciAObjeto(uci))
  return chess
}

/** Casillas destino legales por casilla de origen (para marcar las casillas posibles). */
export function destinos(chess: Chess): Map<string, string[]> {
  const mapa = new Map<string, string[]>()
  for (const m of chess.moves({ verbose: true })) {
    const lista = mapa.get(m.from)
    if (lista) {
      if (!lista.includes(m.to)) lista.push(m.to)
    } else mapa.set(m.from, [m.to])
  }
  return mapa
}

/** ¿La jugada de `from` a `to` es una coronación legal? */
export function esCoronacion(chess: Chess, from: string, to: string): boolean {
  return chess.moves({ verbose: true }).some((m) => m.from === from && m.to === to && !!m.promotion)
}

/** Intenta una jugada; devuelve el Move o null si es ilegal (nunca lanza). */
export function intentar(chess: Chess, uci: string): Move | null {
  try {
    return chess.move(uciAObjeto(uci))
  } catch {
    return null
  }
}

export type TipoFin =
  | 'mate'
  | 'ahogado'
  | 'repeticion'
  | 'cincuenta'
  | 'material'
  | 'rendicion'
  | 'tiempo'
  | 'tablas-tiempo'

export interface Fin {
  tipo: TipoFin
  /** null = tablas */
  ganador: ColorCorto | null
  /** el nombre del final, en español */
  nombre: string
}

export const NOMBRES_FIN: Record<TipoFin, string> = {
  mate: 'Jaque mate',
  ahogado: 'Ahogado',
  repeticion: 'Tablas por triple repetición',
  cincuenta: 'Tablas por la regla de las 50 jugadas',
  material: 'Tablas por material insuficiente',
  rendicion: 'Abandono',
  tiempo: 'Se acabó el tiempo',
  'tablas-tiempo': 'Tablas: se acabó el tiempo y no hay material para dar mate',
}

/** El final de la partida según las reglas, o null si sigue. El mate va primero. */
export function finPorReglas(chess: Chess): Fin | null {
  if (chess.isCheckmate()) return { tipo: 'mate', ganador: contrario(chess.turn()), nombre: NOMBRES_FIN.mate }
  if (chess.isStalemate()) return { tipo: 'ahogado', ganador: null, nombre: NOMBRES_FIN.ahogado }
  if (chess.isInsufficientMaterial()) return { tipo: 'material', ganador: null, nombre: NOMBRES_FIN.material }
  if (chess.isThreefoldRepetition()) return { tipo: 'repeticion', ganador: null, nombre: NOMBRES_FIN.repeticion }
  if (chess.isDrawByFiftyMoves()) return { tipo: 'cincuenta', ganador: null, nombre: NOMBRES_FIN.cincuenta }
  return null
}

/** Las jugadas de la partida en SAN español (R D T A C, 0-0). */
export function jugadasEnEspanol(chess: Chess): string[] {
  return chess.history().map(sanAEspanol)
}

/** ¿Este color tiene material para dar mate? (para las tablas por tiempo) */
export function puedeDarMate(chess: Chess, color: ColorCorto): boolean {
  const piezas: string[] = []
  for (const fila of chess.board()) for (const c of fila) if (c && c.color === color && c.type !== 'k') piezas.push(c.type)
  if (piezas.length === 0) return false
  if (piezas.some((p) => p === 'p' || p === 'q' || p === 'r')) return true
  // solo menores: un alfil o un caballo solo no da mate; dos o más sí pueden
  return piezas.length >= 2
}
