import { Chess } from 'chess.js'
import { sanDeEspanol, sanAEspanol, jugadaNumerada } from '../ajedrez/notacion.ts'

/**
 * R3: leer un PGN con variantes (entre paréntesis) y sacar todas sus líneas, de la posición inicial a cada final.
 * Acepta la notación en inglés (N B R Q K) o la de mis guías (C A T D R). Ignora comentarios {…}, NAG ($1), "!?",
 * números de jugada y el resultado. Devuelve las líneas en SAN inglés.
 */
export class ErrorPgn extends Error {}

function fichas(pgn: string): string[] {
  const sinEncabezados = pgn.replace(/^\s*\[[^\]]*\]\s*$/gm, ' ')
  const sinComentarios = sinEncabezados.replace(/\{[^}]*\}/g, ' ').replace(/;[^\n]*/g, ' ')
  return sinComentarios
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !/^\d+\.(\.\.)?$/.test(t) && !/^\$\d+$/.test(t) && !['1-0', '0-1', '1/2-1/2', '*'].includes(t))
    .map((t) => t.replace(/^\d+\.(\.\.)?/, '').replace(/[!?]+$/, ''))
    .filter(Boolean)
}

export function lineasDePgn(pgn: string): string[][] {
  const ts = fichas(pgn)
  const lineas: string[][] = []
  // pila de "historias": cada variante empieza desde la posición ANTES de la última jugada de su padre
  let actual: string[] = []
  const pila: { antes: string[]; despues: string[] }[] = []
  let ultimaAntes: string[] = []
  let huboJugadaDesde = false
  const jugar = (historia: string[], san: string): string => {
    const c = new Chess()
    for (const s of historia) c.move(s)
    for (const intento of [san, sanDeEspanol(san)]) {
      try {
        return c.move(intento).san
      } catch {
        /* sigue */
      }
    }
    const antes = historia.map((s, i) => (i % 2 === 0 ? jugadaNumerada(sanAEspanol(s), i) : sanAEspanol(s))).join(' ')
    throw new ErrorPgn(`Jugada ilegal o que no entiendo: "${san}" después de ${antes || 'el inicio'}.`)
  }
  for (const t of ts) {
    if (t === '(') {
      pila.push({ antes: ultimaAntes, despues: actual })
      actual = [...ultimaAntes]
      huboJugadaDesde = false
      continue
    }
    if (t === ')') {
      if (huboJugadaDesde || actual.length) lineas.push(actual)
      const p = pila.pop()
      if (!p) throw new ErrorPgn('Hay un paréntesis de más.')
      actual = p.despues
      ultimaAntes = actual.slice(0, -1)
      continue
    }
    ultimaAntes = [...actual]
    actual = [...actual, jugar(actual, t)]
    huboJugadaDesde = true
  }
  if (pila.length) throw new ErrorPgn('Falta cerrar un paréntesis.')
  if (actual.length) lineas.push(actual)
  // sin repetidas ni prefijos de otras
  const unicas = lineas.filter((l, i) => l.length && !lineas.some((o, j) => j !== i && o.length > l.length && l.every((s, k) => o[k] === s)))
  return unicas.filter((l, i) => unicas.findIndex((o) => o.join(' ') === l.join(' ')) === i)
}
