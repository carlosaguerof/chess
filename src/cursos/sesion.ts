import type { Curso, Leccion } from './modelo.ts'
import { siguienteLeccion } from './modelo.ts'

/**
 * T18: en una misma sesión de práctica, la lección que fallé vuelve antes que las demás.
 * `falladas`: las lecciones donde me equivoqué en esta sesión (en orden), sin las que ya repetí bien.
 */
export function siguienteEnSesion(curso: Curso, hechas: Record<string, unknown>, actual: Leccion, falladas: string[]): Leccion | undefined {
  // solo las falladas de este curso: las de otro curso no le cierran el paso a las de aquí
  const pendiente = falladas.find((id) => id !== actual.id && curso.lecciones.some((l) => l.id === id))
  if (pendiente) return curso.lecciones.find((l) => l.id === pendiente)
  return siguienteLeccion(curso, hechas, actual.id)
}

/** Al terminar una lección: si fallé algún paso, entra a la lista; si la terminé sin fallos, sale. */
export function actualizarFalladas(falladas: string[], leccionId: string, fallos: number): string[] {
  const sin = falladas.filter((id) => id !== leccionId)
  return fallos > 0 ? [...sin, leccionId] : sin
}

const CLAVE = 'ajedrez.v1.sesion-falladas'

export function leerFalladas(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function guardarFalladas(f: string[]): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(f))
  } catch {
    /* nada */
  }
}
