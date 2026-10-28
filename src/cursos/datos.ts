import { BASE } from '../base/base.ts'
import { cursosDe, type Curso } from './modelo.ts'
import type { Repertorio } from '../repertorio/modelo.ts'

export function cursos(rep: Repertorio): Curso[] {
  return cursosDe(BASE, rep)
}
