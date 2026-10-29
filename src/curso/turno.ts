import type { DatosCurso, LineaCurso } from './tipos.ts'
import type { Vuelta } from './ciclo.ts'
import { textoMio } from './datos.ts'
import { despues, jugadaEs, piezaQueSeMueve, pistaDe, posicion } from './textos.ts'

/**
 * Lo que la lección dice y marca en mi turno, según la vuelta y el escalón de ayuda que pedí (correcciones de la
 * Caro-Kann, C2; punto 5 del feedback de Carlos), sin pantalla: así se prueba con Vitest.
 *
 * - **Aprender** (una variante) no cambia: "Te toca" con qué hace; Pista, la idea; Otra pista, la pieza (y su texto);
 *   Respuesta, la jugada con su porqué y la flecha.
 * - **Practicar:** nada sobre mi jugada (la narración solo explica la del rival). Pista, solo si la pido: la meta en
 *   palabras (la pregunta). Otra pista: se marca la pieza. Respuesta: solo la flecha, sin repetir texto.
 * - **Un «¿Y si…?»** pregunta por la meta, con las ayudas de Aprender (no es Practicar: no cambia).
 */
export interface TextoTurno {
  tipo: 'pregunta' | 'pista' | 'respuesta'
  /** la jugada, en negritas, antes del texto */
  jugada?: string
  texto: string
}

export interface VistaTurno {
  textos: TextoTurno[]
  /** la casilla de la pieza que se mueve (Otra pista) */
  pieza: string | null
  /** la flecha de la jugada (Respuesta) */
  flecha: { de: string; a: string } | null
}

export function vistaTuTurno(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number, ayuda: 0 | 1 | 2 | 3): VistaTurno {
  const esperada = l.jugadas[ply]
  const mia = textoMio(c, l.jugadas, ply)
  if (!esperada || !mia) return { textos: [], pieza: null, flecha: null }
  const m = posicion(l.jugadas, ply).move(esperada)
  const pieza = ayuda === 2 ? m.from : null
  const flecha = ayuda === 3 ? { de: m.from, a: m.to } : null
  if (vuelta === 'practicar' && l.tipo === 'variante') {
    // con la Respuesta a la vista, la pista ya no hace falta: solo la flecha
    const textos: TextoTurno[] = ayuda === 1 || ayuda === 2 ? [{ tipo: 'pista', texto: `Pista: ${mia.pregunta}` }] : []
    return { textos, pieza, flecha }
  }
  // en Aprender la lección dice la jugada; en los «¿Y si…?», pregunta por la meta
  const textos: TextoTurno[] = [vuelta === 'aprender' && l.tipo === 'variante' ? { tipo: 'pregunta', jugada: `Te toca: ${jugadaEs(esperada, ply)}`, texto: mia.hace } : { tipo: 'pregunta', texto: mia.pregunta }]
  // con la Respuesta a la vista, las pistas ya no hacen falta (y en el iPhone empujarían el texto fuera de la pantalla)
  if (ayuda === 1 || ayuda === 2) textos.push({ tipo: 'pista', texto: `Pista: ${pistaDe(c, l, ply)}` })
  if (ayuda === 2) textos.push({ tipo: 'pista', texto: `Otra pista: ${piezaQueSeMueve(l, ply).texto}` })
  if (ayuda === 3) textos.push({ tipo: 'respuesta', jugada: `Respuesta: ${jugadaEs(esperada, ply)}`, texto: [mia.hace, mia.porque].filter(Boolean).join(' ') })
  return { textos, pieza, flecha }
}

/**
 * La explicación después de mi jugada (correcta, o tras ver la Respuesta). En Aprender, "qué hace" ya lo dijo "Te
 * toca": sigue por qué ahora → qué prepara → cuidado. En Practicar no se dijo nada antes: qué hace → por qué ahora →
 * qué prepara → cuidado.
 */
export function explicacionDespues(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number): string[] {
  const m = textoMio(c, l.jugadas, ply)
  if (!m) return []
  return vuelta === 'practicar' && l.tipo === 'variante' ? [m.hace, ...despues(m)] : despues(m)
}

/** La introducción de cada vuelta. */
export const INTRO_PRACTICAR = 'Ahora, Practicar: juegas tú, sin ayuda. Si te atoras, pide una Pista o la Respuesta. Después de cada jugada tuya, su explicación.'
