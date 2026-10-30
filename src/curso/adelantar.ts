import { sanAEspanol } from '../ajedrez/notacion.ts'
import type { Vuelta } from './ciclo.ts'
import { misJugadas, textoMio } from './datos.ts'
import { frasesDe, posicion } from './textos.ts'
import type { CampoMio, DatosCurso, LineaCurso, Marca } from './tipos.ts'

/**
 * Nada adelanta una jugada que la lección todavía te va a pedir (reglas de las marcas v1.3, R7; Carlos, 2026-10-30, en
 * Practicar: "en Practicar no se dan pistas que no pedí"). Sin pantalla, para probarlo con Vitest sobre todo el curso:
 * - **las marcas:** mientras dura la línea, ninguna flecha (la A1, ni una A3 "prepara…") apunta a una jugada mía que
 *   viene más adelante en esa línea, con la misma pieza y la misma casilla de llegada. En Aprender y en Practicar. En el
 *   plan del final sí, porque la línea ya terminó;
 * - **los textos, en Practicar:** la explicación de después de mi jugada no muestra una frase que escriba ("...e6") o
 *   describa ("tu alfil podrá esconderse en h7", el campo `describe` de los datos) una jugada que la línea todavía me
 *   va a pedir. Lo demás de la explicación, sí. Aprender no cambia: ahí la jugada se dice de todos modos.
 */

/** Mis jugadas de la línea después de la jugada `ply` (sus índices). */
export const misJugadasDespues = (l: LineaCurso, ply: number): number[] => misJugadas(l).filter((p) => p > ply)

/**
 * Una jugada en la notación de adentro, reducida a lo que la distingue: la pieza y su casilla de llegada ("Cbd7" y
 * "Cd7" son la misma "C:d7"), la captura de peón con su columna ("cxd4") o el avance ("e6"), y el enroque.
 */
export function jugadaReducida(sanEs: string): string {
  const s = sanEs.replace(/[+#!?]+$/, '')
  if (/^0-0-0/.test(s)) return '0-0-0'
  if (/^0-0/.test(s)) return '0-0'
  const pieza = /^([RDTAC])[a-h]?[1-8]?x?([a-h][1-8])/.exec(s)
  if (pieza) return `${pieza[1]}:${pieza[2]}`
  const captura = /^([a-h])x([a-h][1-8])/.exec(s)
  if (captura) return `${captura[1]}x${captura[2]}`
  return /^[a-h][1-8]/.exec(s)?.[0] ?? s
}

const JUGADA = '(?:[RDTAC][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8]|[a-h][1-8])'

/**
 * Las jugadas de un color que una frase escribe en la notación de adentro: las de negras con "..." ("...e6", "4...h5",
 * "...Cc6"); las de blancas con su número ("5.g4"). El enroque, "0-0", va sin puntos en las guías: cuenta suelto.
 */
export function jugadasEscritas(frase: string, color: 'w' | 'b'): string[] {
  const re = color === 'b' ? new RegExp(`\\.\\.\\.\\s?(${JUGADA})(?![a-h1-8])`, 'g') : new RegExp(`(?<![.\\d])\\d+\\.\\s?(${JUGADA})(?![a-h1-8])`, 'g')
  const r = [...frase.matchAll(re)].map((m) => jugadaReducida(m[1]!))
  for (const m of frase.matchAll(/(?<![\d-])0-0(-0)?(?![\d-])/g)) r.push(m[1] ? '0-0-0' : '0-0')
  return r
}

/**
 * Las jugadas mías que una frase de mi jugada `ply` adelanta: las que escribe o describe (`describe`, SAN inglés) y
 * que la línea todavía me va a pedir. Vacío si no adelanta nada.
 */
export function adelanta(l: LineaCurso, ply: number, frase: string, describe: string[] = []): string[] {
  const despues = new Map(misJugadasDespues(l, ply).map((p) => [jugadaReducida(sanAEspanol(l.jugadas[p]!)), l.jugadas[p]!]))
  const nombradas = [...jugadasEscritas(frase, l.lado), ...describe.map((s) => jugadaReducida(sanAEspanol(s)))]
  return [...new Set(nombradas.filter((j) => despues.has(j)).map((j) => despues.get(j)!))]
}

/**
 * ¿La flecha apunta a una jugada mía que viene más adelante en la línea, con la misma pieza y a la misma casilla? Se
 * sigue a la pieza que está en `de` en la posición antes de la jugada `desde`, jugada por jugada, hasta el final.
 */
export function marcaAdelanta(l: LineaCurso, desde: number, m: Marca): boolean {
  if (!m.de || !m.a) return false
  const ch = posicion(l.jugadas, desde)
  let casilla = m.de
  for (let p = desde; p < l.jugadas.length; p++) {
    const j = ch.move(l.jugadas[p]!)
    const mia = (p % 2 === 0 ? 'w' : 'b') === l.lado
    if (j.from === casilla) {
      if (mia && j.to === m.a) return true
      casilla = j.to
    } else if (j.to === casilla) return false
    // el enroque mueve también la torre
    if (j.flags.includes('k') && casilla === `h${j.from[1]}`) casilla = `f${j.from[1]}`
    if (j.flags.includes('q') && casilla === `a${j.from[1]}`) casilla = `d${j.from[1]}`
  }
  return false
}

/** Una frase de la explicación de después de mi jugada, con sus marcas. */
export interface FraseDespues {
  campo: CampoMio
  /** su lugar dentro del campo (0 = la primera) */
  i: number
  texto: string
  marcas: Marca[]
}

/**
 * Las frases de la explicación de después de mi jugada, en orden (qué hace → por qué ahora → qué prepara → cuidado).
 * En Aprender, "qué hace" ya lo dijo "Te toca": sigue por qué ahora. En Practicar, desde "qué hace", sin las frases que
 * adelantan una jugada que la línea todavía me va a pedir.
 */
export function frasesDespues(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number): FraseDespues[] {
  const m = textoMio(c, l.jugadas, ply)
  if (!m) return []
  const practicar = vuelta === 'practicar' && l.tipo === 'variante'
  const campos: CampoMio[] = practicar ? ['hace', 'porque', 'prepara', 'cuidado'] : ['porque', 'prepara', 'cuidado']
  const r: FraseDespues[] = []
  for (const campo of campos) {
    const texto = m[campo]
    if (!texto) continue
    frasesDe(texto).forEach((f, i) => {
      if (practicar && adelanta(l, ply, f, m.describe?.[campo]?.[i]).length) return
      r.push({ campo, i, texto: f, marcas: m.marcasDe?.[campo]?.[i] ?? [] })
    })
  }
  return r
}
