import { BASE } from '../base/base.ts'
import { cursoActivo } from '../aprender/interruptores.ts'
import { cursosDeLaBase, type Curso } from './modelo.ts'
import { cursoNuevo, cursosQueSalenDe, leccionesDe } from '../curso/datos.ts'

let todos: Curso[] | null = null

/**
 * Mis cursos: uno por apertura de la base y color (Nota 1), solo los de mi árbol (las populares de la base están
 * apagadas: `aprender/interruptores.ts`). No dependen de mis favoritas.
 */
export function cursos(): Curso[] {
  // C3: el curso piloto de la Caro-Kann trae sus propias lecciones (una por variante); el Repaso y el inicio las usan igual
  todos ??= cursosDeLaBase(BASE)
    .filter((c) => cursoActivo(c.id))
    .flatMap((c) => {
      const n = cursoNuevo(c.id)
      // un curso que sale de otro no es una apertura de la base: su tarjeta va justo después de la del curso de origen.
      // Va sin lecciones: las fichas de esas líneas son las del curso de origen, y así ninguna sale dos veces en el
      // Repaso, en el inicio ni en "Practicar esta línea" (`specs/cursos.md` §6)
      return [n ? { ...c, lecciones: leccionesDe(n) } : c, ...cursosQueSalenDe(c.id).map((x) => ({ ...c, id: x.id, nombre: x.nombre, lecciones: [] }))]
    })
  return todos
}

export function cursoPorId(id: string): Curso | undefined {
  return cursos().find((c) => c.id === id)
}
