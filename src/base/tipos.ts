/** La base de conocimiento de aperturas (conocimiento/base.json): teoría estándar con su fuente, validada con el motor. */
export type Lado = 'blancas' | 'negras' | 'ambos'

export interface Variante {
  id: string
  /** "caro-kann/avance-short": id único en toda la base */
  clave: string
  familia: string
  nombre: string
  nombreIngles: string
  eco: string
  /** SAN en inglés desde la posición inicial */
  jugadas: string[]
  /** el lado cuyas jugadas son "las mías" en esta línea */
  lado: Lado
  plan: string
  /** el plan lo redactó la IA (los de la guía de Carlos dicen "guia") */
  autorPlan: 'ia' | 'guia'
  /** 1 a 5 */
  frecuencia: number
  fuenteFrecuencia: string
  /** la fila de la fuente: lichess-org/chess-openings */
  fuente: { repo: string; eco: string; name: string; pgn: string }
  /** si la línea se cortó antes de una jugada de mi lado que el motor no aprueba */
  recorte?: { jugadasOriginales: number; motivo: string }
  /** C4: la línea sigue la fila de la fuente desde esta media jugada con teoría de otras fuentes (Wikibooks, Wikipedia o la mejor del motor) */
  continuacion?: { desde: number; fuente: string[] }
}

export interface Apertura {
  id: string
  nombre: string
  nombreIngles: string
  eco: string
  lado: Lado
  raiz: string[]
  idea: string
  variantes: Variante[]
}

export interface Base {
  version: string
  fuente: string
  aperturas: Apertura[]
}
