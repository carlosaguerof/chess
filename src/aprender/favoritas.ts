import { useEffect, useState } from 'react'
import { guardar, leer } from '../estado/almacen.ts'
import { BASE } from '../base/base.ts'
import type { Base } from '../base/tipos.ts'
import { lineaDeVariante, type LineaRepertorio, type Repertorio } from '../repertorio/modelo.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import { cursoActivo, FAVORITAS_PRENDIDAS, MIS_APERTURAS } from './interruptores.ts'

/**
 * Nota 1 (L3): "Aperturas y defensas". Mis favoritas son aperturas de la base con el color con que las juego
 * ("caro-kann:b" = la Caro-Kann con negras; "caro-kann:w" = contra la Caro-Kann, con blancas). Empiezan vacías
 * (mi guía ya no siembra nada).
 *
 * Desde los ajustes de la app (2026-10-28) están apagadas (`FAVORITAS_PRENDIDAS`, para cuando haya varios usuarios):
 * mi repertorio son todas mis aperturas. Prendidas, vuelven a ser mi repertorio para "Que juegue mis líneas" y la guía.
 */
const CLAVE = 'favoritas'
const EVENTO = 'favoritas'

export function leerFavoritas(): string[] {
  const f = leer<unknown>(CLAVE, [])
  return Array.isArray(f) ? f.filter((x): x is string => typeof x === 'string') : []
}

export function guardarFavoritas(f: string[]): void {
  guardar(CLAVE, f)
  window.dispatchEvent(new Event(EVENTO))
}

/** Pone o quita una favorita; devuelve la lista nueva. */
export function alternarFavorita(id: string): string[] {
  const f = leerFavoritas()
  const nueva = f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
  guardarFavoritas(nueva)
  return nueva
}

/** Las favoritas, al día en toda la app (el corazón se rellena al instante). */
export function useFavoritas(): string[] {
  const [f, setF] = useState(leerFavoritas)
  useEffect(() => {
    const cambio = () => setF(leerFavoritas())
    window.addEventListener(EVENTO, cambio)
    return () => window.removeEventListener(EVENTO, cambio)
  }, [])
  return f
}

/** ¿Esta variante se juega con este color? */
const ladoAColor = (lado: 'blancas' | 'negras' | 'ambos', color: ColorCorto) => lado === 'ambos' || (lado === 'blancas') === (color === 'w')

/** Las líneas de una apertura con un color: todas sus variantes de ese lado, como líneas de repertorio. */
export function lineasDe(id: string, base: Base = BASE): LineaRepertorio[] {
  const [apertura, color] = id.split(':') as [string, ColorCorto]
  const a = base.aperturas.find((x) => x.id === apertura)
  if (!a || (color !== 'w' && color !== 'b')) return []
  return a.variantes.filter((v) => ladoAColor(v.lado, color)).map((v) => lineaDeVariante(v, color, a.id, a.lado))
}

const cache = new Map<string, Repertorio>()

/** Mi repertorio: las variantes de mis favoritas. Sin favoritas, vacío (el bot juega su libro). */
export function repertorioDeFavoritas(favoritas: string[] = leerFavoritas(), base: Base = BASE): Repertorio {
  const k = favoritas.join('|')
  if (base === BASE && cache.has(k)) return cache.get(k)!
  const rep: Repertorio = { version: 1, lineas: favoritas.flatMap((id) => lineasDe(id, base)) }
  if (base === BASE) cache.set(k, rep)
  return rep
}

/** Todos mis cursos de la base con los dos colores, como si todos fueran favoritos (para lo ya practicado). */
export function repertorioCompleto(base: Base = BASE): Repertorio {
  const ids = base.aperturas.flatMap((a) => (['w', 'b'] as ColorCorto[]).map((c) => `${a.id}:${c}`)).filter(cursoActivo)
  return repertorioDeFavoritas(ids, base)
}

/** Mi repertorio al día (cambia cuando pongo o quito una favorita). */
export function useRepertorioFavoritas(): Repertorio {
  return repertorioDeFavoritas(useFavoritas())
}

/** Las aperturas que son mi repertorio: todas mis aperturas; con las favoritas prendidas, mis favoritas. */
export function misAperturas(favoritas: string[] = leerFavoritas()): string[] {
  return FAVORITAS_PRENDIDAS ? favoritas.filter(cursoActivo) : MIS_APERTURAS
}

/** Mi repertorio para la guía y "Que juegue mis líneas": las variantes de mis aperturas. */
export function useMiRepertorio(): Repertorio {
  return repertorioDeFavoritas(misAperturas(useFavoritas()))
}
