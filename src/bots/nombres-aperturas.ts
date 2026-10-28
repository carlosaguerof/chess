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

/** Cómo se ve cada estilo según el lado del bot (con blancas abre; con negras se defiende). */
const CON_BLANCAS: Record<string, string> = {
  'siciliana:alapin': 'Alapin contra la Siciliana',
  'siciliana:smith-morra': 'Gambito Smith-Morra',
  'siciliana:grand-prix': 'Ataque Grand Prix',
  siciliana: 'Siciliana (con blancas)',
  'caro-kann:avance': 'Avance contra la Caro-Kann',
  'caro-kann:clasica': 'Clásica contra la Caro-Kann',
  'caro-kann:cambio': 'Cambio contra la Caro-Kann',
  'caro-kann:panov': 'Ataque Panov',
  'caro-kann:dos-caballos': 'Dos Caballos contra la Caro-Kann',
  francesa: 'Avance contra la Francesa',
  escandinava: 'Captura contra la Escandinava',
  eslava: 'Gambito de Dama contra la Eslava',
}
const CON_NEGRAS: Record<string, string> = {
  italiana: '1...e5',
  'gambito-dama:aceptado': 'Gambito de Dama Aceptado',
}

/** Nombre corto en español de una clave de estilo ("caro-kann:avance" → "Avance contra la Caro-Kann"). */
export function nombreApertura(clave: string, lado?: 'blancas' | 'negras'): string {
  if (lado === 'blancas' && CON_BLANCAS[clave]) return CON_BLANCAS[clave]
  if (lado === 'negras' && CON_NEGRAS[clave]) return CON_NEGRAS[clave]
  const [ap, v] = clave.split(':')
  const a = BASE.aperturas.find((x) => x.id === ap)
  const corto = (a?.nombre ?? ap!).replace(/^(Defensa|Apertura) /, '')
  if (!v) return corto
  if (ap === 'otros-negras') return VARIANTES[v] ?? v
  return `${corto}: ${VARIANTES[v] ?? v}`
}

/** El nombre en inglés y el ECO de una clave de estilo (N2: a un lado, en chico). */
export function inglesApertura(clave: string): string {
  const [ap, v] = clave.split(':')
  const a = BASE.aperturas.find((x) => x.id === ap)
  if (!a) return ''
  if (v) {
    const vs = a.variantes.filter((x) => x.id.startsWith(v))
    if (vs.length) return `${vs[0]!.nombreIngles.split(',')[0]} · ${vs[0]!.eco}`
  }
  return `${a.nombreIngles} · ${a.eco}`
}
