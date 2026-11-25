import { BASE } from '../base/base.ts'
import { cursoActivo } from '../aprender/interruptores.ts'
import { cursosDeLaBase, type Curso, type Leccion } from './modelo.ts'
import { cursoNuevo, esLeccionOpcional, leccionesDe, leccionIdDe } from '../curso/datos.ts'
import { cursoQueQueda } from '../curso/queda.ts'

let todos: Curso[] | null = null

/**
 * Mis cursos: uno por apertura de la base y color (Nota 1), solo los de mi árbol (las populares de la base están
 * apagadas: `aprender/interruptores.ts`). No dependen de mis favoritas.
 */
export function cursos(): Curso[] {
  // C3: el curso piloto de la Caro-Kann trae sus propias lecciones (una por variante); el Repaso y el inicio las usan igual.
  // Una sola Caro-Kann (2026-11-25): el curso por estructuras no es una apertura de la base y no entra aquí. La de la
  // base se queda, con su id y sus lecciones (las fichas de Repaso de esas líneas, una por línea, y "Practicar esta
  // línea"); su tarjeta y su dirección abren el curso que queda (`curso/queda.ts`, `specs/cursos.md` §6)
  todos ??= cursosDeLaBase(BASE)
    .filter((c) => cursoActivo(c.id))
    .map((c) => {
      const n = cursoNuevo(c.id)
      const lecciones = n ? conElPlanDelQueQueda(c.id, leccionesDe(n)) : c.lecciones
      // las opcionales van marcadas: no salen en el Repaso (`esLeccionOpcional`, la misma condición de Refuerza)
      return { ...c, lecciones: lecciones.map((l) => (esLeccionOpcional(c.apertura, c.color, l.id.slice(l.id.lastIndexOf('/') + 1)) ? { ...l, opcional: true } : l)) }
    })
  return todos
}

/**
 * Si el curso dejó de verse, sus lecciones (las fichas de Repaso de esas líneas) muestran el plan del curso que queda:
 * es el que Carlos lee en la lección, con sus correcciones (el Cambio, con la torre en b8). El orden y los ids no
 * cambian: "Practicar esta línea" cuenta las lecciones en ese orden.
 */
function conElPlanDelQueQueda(id: string, lecciones: Leccion[]): Leccion[] {
  const queda = cursoNuevo(cursoQueQueda(id) ?? '')
  if (!queda) return lecciones
  const planes = new Map(queda.variantes.map((v) => [leccionIdDe(queda, v), v.plan.tuyo]))
  return lecciones.map((l) => ({ ...l, plan: planes.get(l.id) ?? l.plan }))
}

export function cursoPorId(id: string): Curso | undefined {
  return cursos().find((c) => c.id === id)
}
