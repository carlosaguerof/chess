/**
 * Estrellas al terminar (T16), con las reglas de Carlos (2026-10-28 y nota 2):
 * si gano, 3 sin ninguna ayuda; 2 con barra o flechas prendidas; 1 con la guía prendida, o si pedí Pista o Respuesta,
 * o deshice una jugada. Si empato sin ninguna ayuda, 2; con cualquier ayuda, 1. Si pierdo, 0. Cuenta la peor ayuda.
 */
export interface AyudasUsadas {
  guia: boolean
  pistaORespuesta: boolean
  deshacer: boolean
  barraOFlechas: boolean
}

export const SIN_AYUDAS: AyudasUsadas = { guia: false, pistaORespuesta: false, deshacer: false, barraOFlechas: false }

export function estrellas(resultado: 'gane' | 'tablas' | 'perdi', a: AyudasUsadas): 0 | 1 | 2 | 3 {
  const fuertes = a.guia || a.pistaORespuesta || a.deshacer
  const alguna = fuertes || a.barraOFlechas
  if (resultado === 'perdi') return 0
  if (resultado === 'tablas') return alguna ? 1 : 2
  if (fuertes) return 1
  if (a.barraOFlechas) return 2
  return 3
}

/** Las estrellas por bot: se guarda la mejor. */
export function conEstrellas(mapa: Record<string, number>, botId: string, n: number): Record<string, number> {
  return { ...mapa, [botId]: Math.max(mapa[botId] ?? 0, n) }
}
