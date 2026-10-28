import provisionales from './libros-provisionales.json' with { type: 'json' }
import type { LineasPorClave } from './libros.ts'

/** De dónde salen las líneas de los libros. T5: provisionales (lichess, CC0). La T6 las cambia por la base. */
const datos = provisionales.lineas as unknown as Record<string, [string, string][]>

export const lineasDeLibro: LineasPorClave = (clave) => {
  const directas = datos[clave]
  if (directas) return directas.map(([, sanes]) => sanes.split(' '))
  // "caro-kann" sin variante: todas las variantes "caro-kann:*"
  return Object.entries(datos)
    .filter(([k]) => k.startsWith(clave + ':'))
    .flatMap(([, ls]) => ls.map(([, sanes]) => sanes.split(' ')))
}
