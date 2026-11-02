import { Chess } from 'chess.js'
import caroKann from '../../conocimiento/cursos/caro-kann.json' with { type: 'json' }
import caroKannEstructuras from '../../conocimiento/cursos/caro-kann-estructuras.json' with { type: 'json' }
import { BASE } from '../base/base.ts'
import type { Leccion } from '../cursos/modelo.ts'
import type { AvanceCurso } from './avance.ts'
import { componerCurso } from './capas.ts'
import type { CapaCurso, DatosCurso, JugadaMia, JugadaRival, LineaCurso, VarianteCurso } from './tipos.ts'

const caroKannCurso = caroKann as unknown as DatosCurso

/**
 * Los cursos del escalón 1 (diseño §3): hoy el piloto de la Caro-Kann (con negras) y, para compararlo, las mismas
 * jugadas organizadas por estructuras (`specs/cursos.md` §6). Los demás cursos siguen con la lección de antes
 * (`pantallas/Leccion.tsx`).
 */
export const CURSOS_NUEVOS: Record<string, DatosCurso> = {
  'caro-kann:b': caroKannCurso,
  'caro-kann-estructuras:b': componerCurso(caroKannCurso, caroKannEstructuras as unknown as CapaCurso),
}

export const cursoNuevo = (id: string): DatosCurso | undefined => CURSOS_NUEVOS[id]

/** Los cursos que salen de este (en Aprender, cada tarjeta va justo después de la de su curso de origen). */
export const cursosQueSalenDe = (id: string): DatosCurso[] => Object.values(CURSOS_NUEVOS).filter((c) => c.fichasDe === id)

const seccionOpcionalDe = (c: DatosCurso, id: string) => c.secciones?.find((s) => s.opcional && s.variantes.includes(id))

/** ¿Esta variante no cuenta para terminar el curso? Sin `secciones`, todas cuentan. */
export const esOpcional = (c: DatosCurso, id: string): boolean => !!seccionOpcionalDe(c, id)

/** Las variantes que cuentan para terminar el curso: "N de M" y "Seguir" solo pasan por estas. */
export const obligatorias = (c: DatosCurso): VarianteCurso[] => c.variantes.filter((v) => !esOpcional(c, v.id))

/** Las variantes opcionales, en su orden. */
export const opcionales = (c: DatosCurso): VarianteCurso[] => c.variantes.filter((v) => esOpcional(c, v.id))

/** "3 de 16 variantes": cuenta solo las que cuentan para terminar el curso. */
export function avanceVariantes(c: DatosCurso, a: Pick<AvanceCurso, 'variantes'>): string {
  const vs = obligatorias(c)
  return `${vs.filter((v) => a.variantes[v.id]?.terminada).length} de ${vs.length} variantes`
}

/** La línea de una variante: la de su variante de la base (fila de la fuente + continuación). */
export function jugadasDeVariante(c: DatosCurso, v: VarianteCurso): string[] {
  const a = BASE.aperturas.find((x) => x.id === c.apertura)
  const b = a?.variantes.find((x) => x.id === v.base)
  if (!b) throw new Error(`curso ${c.id}: la variante ${v.id} apunta a ${v.base}, que no está en la base`)
  return b.jugadas
}

/**
 * El id de lección de una variante, como los de antes: "caro-kann:b/b:caro-kann/curso-avance-short". Un curso que sale
 * de otro usa el del curso de origen: la misma línea tiene una sola ficha de Repaso.
 */
export const leccionIdDe = (c: DatosCurso, v: VarianteCurso) => `${c.fichasDe ?? c.id}/${c.color}:${c.apertura}/${v.base}`

export function lineasDe(c: DatosCurso): LineaCurso[] {
  return [
    // una opcional no lleva `leccionId`: al terminarla, no entra al Repaso de hoy
    ...c.variantes.map((v): LineaCurso => ({ id: `v:${v.id}`, tipo: 'variante', nombre: v.nombre, jugadas: jugadasDeVariante(c, v), desde: v.desde, lado: c.color, intro: v.intro, ...(esOpcional(c, v.id) ? {} : { leccionId: leccionIdDe(c, v) }), variante: v })),
    ...c.piezas.errores.lista.map((e): LineaCurso => ({ id: `e:${e.id}`, tipo: 'error', nombre: e.titulo, jugadas: e.jugadas, desde: e.desde, lado: e.lado, intro: e.intro, error: e })),
  ]
}

export function lineaPorId(c: DatosCurso, id: string): LineaCurso | undefined {
  return lineasDe(c).find((l) => l.id === id)
}

/**
 * Las líneas con las que camina una lección: "Variante N de M", "Opcional N de M" y "Siguiente variante" se cuentan
 * aquí. Las obligatorias van con las obligatorias, las opcionales con las opcionales y los «¿Y si…?» entre ellos.
 */
export function grupoDeLinea(c: DatosCurso, l: LineaCurso): LineaCurso[] {
  if (l.tipo === 'error') return lineasDe(c).filter((x) => x.tipo === 'error')
  const opcional = esOpcional(c, l.variante!.id)
  return lineasDe(c).filter((x) => x.tipo === 'variante' && esOpcional(c, x.variante!.id) === opcional)
}

/** Las variantes como lecciones del modelo de antes: así el Repaso, el inicio y "Practicar esta línea" las usan igual. */
export function leccionesDe(c: DatosCurso): Leccion[] {
  return c.variantes.map((v) => {
    const b = BASE.aperturas.find((x) => x.id === c.apertura)!.variantes.find((x) => x.id === v.base)!
    return { id: leccionIdDe(c, v), cursoId: c.fichasDe ?? c.id, nombre: v.nombre, familia: b.familia, plan: v.plan.tuyo, autorPlan: 'ia', frecuencia: v.frecuencia, color: c.color, jugadas: b.jugadas, ingles: b.nombreIngles, eco: b.eco }
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
