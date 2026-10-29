import { Chess, type Square } from 'chess.js'
import { jugadaNumerada, nombrePieza, sanAEspanol } from '../ajedrez/notacion.ts'
import { amenazas } from '../ayudas/amenazas.ts'
import { ideaPorTipo } from '../cursos/modelo.ts'
import type { DatosCurso, JugadaMia, LineaCurso, Marca } from './tipos.ts'
import { textoMio } from './datos.ts'

/**
 * Los textos de la lección nueva, armados desde el contenido del curso. Todo va en la notación de las guías; la
 * pantalla lo convierte con `mostrarTexto`.
 */

/** "3...Af5" (en la notación de las guías). */
export const jugadaEs = (san: string, ply: number) => jugadaNumerada(sanAEspanol(san), ply)

export function posicion(jugadas: string[], ply: number): Chess {
  const c = new Chess()
  for (const s of jugadas.slice(0, ply)) c.move(s)
  return c
}

/** La explicación después de jugar (Aprender): por qué ahora → qué prepara → cuidado. */
export function despues(m: JugadaMia | undefined): string[] {
  if (!m) return []
  return [m.porque, m.prepara, m.cuidado ? `Cuidado: ${m.cuidado}` : undefined].filter((x): x is string => !!x)
}

/** La Pista (primer escalón): la idea en palabras; si el curso no la trae, la idea por el tipo de jugada. */
export function pistaDe(c: DatosCurso, l: LineaCurso, ply: number): string {
  const m = textoMio(c, l.jugadas, ply)
  if (m?.pista) return m.pista
  const pos = posicion(l.jugadas, ply)
  const previa = ply > 0 ? posicion(l.jugadas, ply - 1).move(l.jugadas[ply - 1]!) : null
  return ideaPorTipo(pos.move(l.jugadas[ply]!), !!previa?.captured)
}

/** La pieza que se mueve (Otra pista): la casilla de origen, sin decir a dónde. */
export function piezaQueSeMueve(l: LineaCurso, ply: number): { casilla: string; texto: string } {
  const m = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
  const pieza = m.flags.includes('k') || m.flags.includes('q') ? 'el rey' : `${nombrePieza(m.piece)} de ${m.from}`
  return { casilla: m.from, texto: `Se mueve ${pieza}.` }
}

/**
 * Por qué no es la jugada (sin decir cuál es): primero lo que el curso trae para esa jugada equivocada; si no, si deja
 * una pieza tuya sin defensa, eso; si no, que no logra la meta de esta jugada.
 */
export function porQueNo(c: DatosCurso, l: LineaCurso, ply: number, san: string, vuelta: 'aprender' | 'practicar'): string {
  const m = textoMio(c, l.jugadas, ply)
  const propio = m?.errores?.[san]
  if (propio) return propio
  const antes = posicion(l.jugadas, ply)
  const despuesDe = posicion(l.jugadas, ply)
  despuesDe.move(san)
  const color = antes.turn()
  const yaColgaban = new Set(amenazas(antes, color).map((a) => a.hasta))
  const nueva = amenazas(despuesDe, color).find((a) => !yaColgaban.has(a.hasta))
  if (nueva) {
    const pieza = nombrePieza(despuesDe.get(nueva.hasta as Square)?.type ?? '')
    return `Deja ${pieza} de ${nueva.hasta} sin defensa: el rival ${pieza.startsWith('la ') ? 'la' : 'lo'} puede tomar.`
  }
  // solo en Aprender de una variante la lección ya dijo la jugada; en un «¿Y si…?» se pregunta, como en Practicar
  if (vuelta === 'aprender' && l.tipo === 'variante') return `Esta lección juega ${jugadaEs(l.jugadas[ply]!, ply)}.`
  return 'Esa jugada no logra la meta de esta pregunta. Inténtalo otra vez, o pide una Pista.'
}

/** Las marcas del contenido como formas del tablero (chessground). */
export function formas(marcas: Marca[] | undefined): { orig: string; dest?: string; brush: string }[] {
  const brocha = (c?: Marca['color']) => (c === 'rojo' ? 'red' : c === 'azul' ? 'blue' : c === 'amarillo' ? 'yellow' : 'green')
  return (marcas ?? []).flatMap((m) => (m.de && m.a ? [{ orig: m.de, dest: m.a, brush: brocha(m.color) }] : m.en ? [{ orig: m.en, brush: brocha(m.color) }] : []))
}

/** Cuántas palabras tiene un texto (para el control de calidad). */
export const palabras = (t: string) => t.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length

/** La línea hasta una jugada, en un renglón (notación de las guías). */
export function lineaHasta(jugadas: string[], ply: number): string {
  return jugadas
    .slice(0, ply)
    .map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}.${sanAEspanol(s)}` : sanAEspanol(s)))
    .join(' ')
}
