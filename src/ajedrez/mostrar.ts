import { guardar, leer } from '../estado/almacen.ts'

/**
 * C2 (curso de la Caro-Kann): cómo se ven las jugadas en la app. Por dentro, los textos (planes, guía, cursos) van en
 * la notación de mis guías (R D T A C, 0-0) y chess.js en la inglesa; en pantalla se ven de una sola forma, la que
 * escojo en Ajustes → Notación:
 *   - "figuras" (de entrada): ♘f3, ♗xc4, ♕d1, 0-0, como chess.com;
 *   - "letras": la notación formal en inglés: Nf3, Bxc4, Qd1, O-O.
 * Nunca las dos juntas. Todo lo que se muestra pasa por `mostrarTexto` (o `mostrarSan` si viene de chess.js).
 */
export type Notacion = 'figuras' | 'letras'

const CLAVE = 'notacion'
const FIGURA: Record<string, string> = { R: '♔', D: '♕', T: '♖', A: '♗', C: '♘' }
const LETRA: Record<string, string> = { R: 'K', D: 'Q', T: 'R', A: 'B', C: 'N' }
const DE_INGLES: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' }

let actual: Notacion | null = null
const avisar = new Set<() => void>()

export function notacion(): Notacion {
  actual ??= leer<Notacion>(CLAVE, 'figuras') === 'letras' ? 'letras' : 'figuras'
  return actual
}

export function cambiarNotacion(n: Notacion): void {
  actual = n
  guardar(CLAVE, n)
  for (const f of avisar) f()
}

/** Para que una pantalla se vuelva a pintar al cambiar la notación (y para las pruebas). */
export function alCambiarNotacion(f: () => void): () => void {
  avisar.add(f)
  return () => avisar.delete(f)
}

/** Lo vuelve a leer del navegador (al importar un respaldo). */
export function releerNotacion(): void {
  actual = null
}

// Una jugada en la notación de mis guías dentro de un texto: la letra de la pieza (R D T A C) seguida de la casilla, con
// desambiguación y captura opcionales ("Af5", "Cbd7", "C1f3", "Txe1", "Dxd1+"). No la precede ni la sigue una letra o
// cifra, así que palabras como "Caro" o "Réti" no se tocan.
const PIEZA_EN_TEXTO = /(^|[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9])([RDTAC])((?:[a-h]?[1-8]?)x?[a-h][1-8])(?![A-Za-z0-9])/g
const CORONA_EN_TEXTO = /([a-h][18])=([DTAC])/g
const ENROQUE_EN_TEXTO = /(^|[^0-9-])0-0(-0)?(?![0-9-])/g

/** Un texto con jugadas en la notación de mis guías → como se ve en pantalla. */
export function mostrarTexto(texto: string, n: Notacion = notacion()): string {
  const pieza = n === 'figuras' ? FIGURA : LETRA
  let t = texto.replace(PIEZA_EN_TEXTO, (_m, antes: string, p: string, resto: string) => antes + pieza[p] + resto)
  t = t.replace(CORONA_EN_TEXTO, (_m, casilla: string, p: string) => `${casilla}=${pieza[p]}`)
  if (n === 'letras') t = t.replace(ENROQUE_EN_TEXTO, (_m, antes: string, largo?: string) => `${antes}O-O${largo ? '-O' : ''}`)
  return t
}

/** Una jugada de chess.js (SAN en inglés: "Nf3", "O-O", "e8=Q+") → como se ve en pantalla. */
export function mostrarSan(san: string, n: Notacion = notacion()): string {
  if (n === 'letras') return san
  if (san.startsWith('O-O-O')) return '0-0-0' + san.slice(5)
  if (san.startsWith('O-O')) return '0-0' + san.slice(3)
  const primera = san[0]!
  const s = DE_INGLES[primera] ? FIGURA[DE_INGLES[primera]!] + san.slice(1) : san
  return s.replace(/=([QRBN])/, (_m, p: string) => '=' + FIGURA[DE_INGLES[p]!])
}
