/**
 * Notación de mis guías: R D T A C (rey, dama, torre, alfil, caballo), 0-0 y 0-0-0.
 * chess.js trabaja en notación inglesa (K Q R B N, O-O). Aquí se traduce en los dos sentidos.
 */
const A_ESPANOL: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' }
const A_INGLES: Record<string, string> = { R: 'K', D: 'Q', T: 'R', A: 'B', C: 'N' }

/** SAN inglés → SAN de mis guías. "Nf3" → "Cf3", "O-O" → "0-0", "e8=Q+" → "e8=D+". */
export function sanAEspanol(san: string): string {
  if (san.startsWith('O-O-O')) return '0-0-0' + san.slice(5)
  if (san.startsWith('O-O')) return '0-0' + san.slice(3)
  let s = san
  const primera = s[0]
  if (primera && A_ESPANOL[primera]) s = A_ESPANOL[primera] + s.slice(1)
  return s.replace(/=([QRBN])/, (_m, p: string) => '=' + A_ESPANOL[p])
}

/** SAN de mis guías → SAN inglés. "Cf3" → "Nf3", "0-0" → "O-O", "Axc4" → "Bxc4". */
export function sanDeEspanol(es: string): string {
  const limpio = es.trim()
  if (limpio.startsWith('0-0-0')) return 'O-O-O' + limpio.slice(5)
  if (limpio.startsWith('0-0')) return 'O-O' + limpio.slice(3)
  let s = limpio
  const primera = s[0]
  if (primera && A_INGLES[primera]) s = A_INGLES[primera] + s.slice(1)
  return s.replace(/=([DTAC])/, (_m, p: string) => '=' + A_INGLES[p])
}

/** "1.e4", "1...c6", "3...Af5": el número de jugada con su SAN en español. ply 0 = primera jugada de blancas desde la inicial. */
export function jugadaNumerada(sanEs: string, ply: number, primeraEsNegras = false): string {
  const p = ply + (primeraEsNegras ? 1 : 0)
  const numero = Math.floor(p / 2) + 1
  return p % 2 === 0 ? `${numero}.${sanEs}` : `${numero}...${sanEs}`
}

/** Una línea de jugadas en SAN inglés → texto en español con números: "1.e4 c6 2.d4 d5". */
export function lineaEnEspanol(sanes: string[], desdePly = 0): string {
  return sanes
    .map((san, i) => {
      const ply = desdePly + i
      const es = sanAEspanol(san)
      if (ply % 2 === 0) return `${Math.floor(ply / 2) + 1}.${es}`
      if (i === 0) return `${Math.floor(ply / 2) + 1}...${es}`
      return es
    })
    .join(' ')
}

const NOMBRE_PIEZA: Record<string, string> = {
  k: 'el rey',
  q: 'la dama',
  r: 'la torre',
  b: 'el alfil',
  n: 'el caballo',
  p: 'el peón',
}

/** "el caballo", "el peón"... para la Pista (sin casilla de destino). */
export function nombrePieza(tipo: string): string {
  return NOMBRE_PIEZA[tipo] ?? 'una pieza'
}
