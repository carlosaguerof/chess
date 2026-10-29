import { Chess } from 'chess.js'
import caroKann from '../../conocimiento/cursos/caro-kann.json' with { type: 'json' }
import { BASE } from '../base/base.ts'
import type { Leccion } from '../cursos/modelo.ts'
import type { DatosCurso, JugadaMia, JugadaRival, LineaCurso, VarianteCurso } from './tipos.ts'

/**
 * Los cursos del escalón 1 (diseño §3): hoy solo el piloto de la Caro-Kann (con negras). Los demás cursos siguen con
 * la lección de antes (`pantallas/Leccion.tsx`).
 */
export const CURSOS_NUEVOS: Record<string, DatosCurso> = { 'caro-kann:b': caroKann as unknown as DatosCurso }

export const cursoNuevo = (id: string): DatosCurso | undefined => CURSOS_NUEVOS[id]

/** La línea de una variante: la de su variante de la base (fila de la fuente + continuación). */
export function jugadasDeVariante(c: DatosCurso, v: VarianteCurso): string[] {
  const a = BASE.aperturas.find((x) => x.id === c.apertura)
  const b = a?.variantes.find((x) => x.id === v.base)
  if (!b) throw new Error(`curso ${c.id}: la variante ${v.id} apunta a ${v.base}, que no está en la base`)
  return b.jugadas
}

/** El id de lección de una variante, como los de antes: "caro-kann:b/b:caro-kann/curso-avance-short". */
export const leccionIdDe = (c: DatosCurso, v: VarianteCurso) => `${c.id}/${c.color}:${c.apertura}/${v.base}`

export function lineasDe(c: DatosCurso): LineaCurso[] {
  return [
    ...c.variantes.map((v): LineaCurso => ({ id: `v:${v.id}`, tipo: 'variante', nombre: v.nombre, jugadas: jugadasDeVariante(c, v), desde: v.desde, lado: c.color, intro: v.intro, leccionId: leccionIdDe(c, v), variante: v })),
    ...c.piezas.errores.lista.map((e): LineaCurso => ({ id: `e:${e.id}`, tipo: 'error', nombre: e.titulo, jugadas: e.jugadas, desde: e.desde, lado: e.lado, intro: e.intro, error: e })),
  ]
}

export function lineaPorId(c: DatosCurso, id: string): LineaCurso | undefined {
  return lineasDe(c).find((l) => l.id === id)
}

/** Las variantes como lecciones del modelo de antes: así el Repaso, el inicio y "Practicar esta línea" las usan igual. */
export function leccionesDe(c: DatosCurso): Leccion[] {
  return c.variantes.map((v) => {
    const b = BASE.aperturas.find((x) => x.id === c.apertura)!.variantes.find((x) => x.id === v.base)!
    return { id: leccionIdDe(c, v), cursoId: c.id, nombre: v.nombre, familia: b.familia, plan: v.plan.tuyo, autorPlan: 'ia', frecuencia: v.frecuencia, color: c.color, jugadas: b.jugadas, ingles: b.nombreIngles, eco: b.eco }
  })
}

const clave = (jugadas: string[], hasta: number) => jugadas.slice(0, hasta).join(' ')

/** La explicación de la jugada número `ply` (0 = 1.e4) de una línea, si es mía. */
export const textoMio = (c: DatosCurso, jugadas: string[], ply: number): JugadaMia | undefined => c.mias[clave(jugadas, ply + 1)]
export const textoRival = (c: DatosCurso, jugadas: string[], ply: number): JugadaRival | undefined => c.rival[clave(jugadas, ply + 1)]

const fenCorto = (fen: string) => fen.split(' ').slice(0, 4).join(' ')
let indice: Map<string, Set<string>> | null = null

/**
 * Las jugadas que la base trae en una posición (de cualquier apertura y variante): una jugada mía que está aquí y no
 * es la de la lección es "buena, pero esta lección enseña otra línea" (diseño §4).
 */
export function jugadasDeLaBaseEn(fen: string): Set<string> {
  if (!indice) {
    indice = new Map()
    for (const a of BASE.aperturas)
      for (const v of a.variantes) {
        const ch = new Chess()
        for (const s of v.jugadas) {
          const k = fenCorto(ch.fen())
          if (!indice.has(k)) indice.set(k, new Set())
          indice.get(k)!.add(s)
          ch.move(s)
        }
      }
  }
  return indice.get(fenCorto(fen)) ?? new Set()
}

/** El número de mis jugadas en una línea, desde `desde`. */
export function misJugadas(l: Pick<LineaCurso, 'jugadas' | 'desde' | 'lado'>): number[] {
  const r: number[] = []
  for (let i = l.desde; i < l.jugadas.length; i++) if ((i % 2 === 0 ? 'w' : 'b') === l.lado) r.push(i)
  return r
}
