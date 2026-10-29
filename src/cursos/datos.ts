import { BASE } from '../base/base.ts'
import { cursoActivo } from '../aprender/interruptores.ts'
import { cursosDeLaBase, type Curso } from './modelo.ts'
import { cursoNuevo, leccionesDe } from '../curso/datos.ts'

let todos: Curso[] | null = null

/**
 * Mis cursos: uno por apertura de la base y color (Nota 1), solo los de mi árbol (las populares de la base están
 * apagadas: `aprender/interruptores.ts`). No dependen de mis favoritas.
 */
export function cursos(): Curso[] {
  // C3: el curso piloto de la Caro-Kann trae sus propias lecciones (una por variante); el Repaso y el inicio las usan igual
  todos ??= cursosDeLaBase(BASE)
    .filter((c) => cursoActivo(c.id))
    .map((c) => {
      const n = cursoNuevo(c.id)
      return n ? { ...c, lecciones: leccionesDe(n) } : c
    })
  return todos
}

export function cursoPorId(id: string): Curso | undefined {
  return cursos().find((c) => c.id === id)
}
