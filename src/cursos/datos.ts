import { BASE } from '../base/base.ts'
import { cursosDeLaBase, type Curso } from './modelo.ts'

let todos: Curso[] | null = null

/** Todos los cursos: uno por apertura de la base y color (Nota 1). No dependen de mis favoritas. */
export function cursos(): Curso[] {
  todos ??= cursosDeLaBase(BASE)
  return todos
}

export function cursoPorId(id: string): Curso | undefined {
  return cursos().find((c) => c.id === id)
}
