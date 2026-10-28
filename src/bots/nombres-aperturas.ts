import { BASE } from '../base/base.ts'

const VARIANTES: Record<string, string> = {
  avance: 'Avance',
  clasica: 'Clásica',
  cambio: 'Cambio',
  panov: 'Panov',
  'dos-caballos': 'Dos Caballos',
  alapin: 'Alapin',
  'smith-morra': 'Smith-Morra',
  'grand-prix': 'Grand Prix',
  aceptado: 'Aceptado',
  inglesa: 'Inglesa (1.c4)',
  reti: 'Réti (1.Cf3)',
  larsen: 'Larsen (1.b3)',
}

/** Nombre corto en español de una clave de estilo ("caro-kann:avance" → "Caro-Kann: Avance"). */
export function nombreApertura(clave: string): string {
  const [ap, v] = clave.split(':')
  const a = BASE.aperturas.find((x) => x.id === ap)
  const corto = (a?.nombre ?? ap!).replace(/^(Defensa|Apertura) /, '')
  if (!v) return corto
  if (ap === 'otros-negras') return VARIANTES[v] ?? v
  return `${corto}: ${VARIANTES[v] ?? v}`
}
