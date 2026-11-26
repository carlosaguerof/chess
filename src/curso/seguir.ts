import { cursoPorId } from '../cursos/datos.ts'
import { leerFalladas, siguienteEnSesion } from '../cursos/sesion.ts'
import { leerProgreso } from '../repertorio/estado.ts'
import { siguientePaso } from '../pantallas/CursoPagina.tsx'
import { leerAvance } from './avance.ts'
import { cursoNuevo } from './datos.ts'
import { cursoQueQueda } from './queda.ts'

/**
 * "Seguir" (vuelta 5, escalón 1; `specs/aprender.md`, "Seguir"): un curso completo antes del siguiente, en este orden.
 * Carlos, 2026-11-26: "Adelante con el orden de la tabla" (`iterations/v5/analisis-orden.md`, opción A). Son los ids de
 * las tarjetas de Aprender; la Caro-Kann abre el curso que queda (`queda.ts`). Cambiar el orden no pierde avance.
 */
export const ORDEN_SEGUIR = ['caro-kann:b', 'italiana:w', 'caro-kann:w', 'francesa:w', 'siciliana:w', 'escandinava:w', 'eslava:b', 'otros-negras:b', 'otros-1e4:w'] as const

/** A dónde lleva el botón: el curso (el nombre de su tarjeta) y el paso que toca, o el Repaso de hoy con todo terminado. */
export type DestinoSeguir = { fin: false; cursoId: string; curso: string; paso: string; url: string } | { fin: true; url: string }

/** Lo que "Seguir" lee de lo guardado. Las pruebas lo cambian; la app usa lo del teléfono. */
export interface LecturaSeguir {
  avance: typeof leerAvance
  progreso: typeof leerProgreso
  falladas: typeof leerFalladas
}

const DEL_TELEFONO: LecturaSeguir = { avance: leerAvance, progreso: leerProgreso, falladas: leerFalladas }

/** El paso que toca en un curso, o `undefined` si ya lo terminé. */
function pasoDe(id: string, leer: LecturaSeguir): { paso: string; url: string } | undefined {
  // los ocho cursos nuevos: lo mismo que el "Seguir" de su página
  const nuevo = cursoNuevo(cursoQueQueda(id) ?? id)
  if (nuevo) {
    const p = siguientePaso(nuevo, leer.avance(nuevo.id))
    return p && { paso: p.nombre, url: p.url }
  }
  // Otras defensas contra 1.e4, con la lección de antes: terminado con sus lecciones hechas; si no, la que fallé en esta
  // sesión (la regla del botón "Siguiente" de esa lección) o la primera sin hacer
  const curso = cursoPorId(id)
  if (!curso) return undefined
  const guardado: unknown = leer.progreso()
  const hechas = (guardado && typeof guardado === 'object' ? guardado : {}) as Record<string, unknown>
  const cuentan = curso.lecciones.filter((l) => !l.opcional)
  if (cuentan.every((l) => hechas[l.id])) return undefined
  const l = siguienteEnSesion({ ...curso, lecciones: cuentan }, hechas, undefined, leer.falladas())
  if (!l) return undefined
  // el nombre de la base dice mis jugadas ("Variante de los Dos Caballos"): solo la defensa del rival, con su número
  // (las dos de la Nimzowitsch van seguidas y, sin él, el botón no cambiaría al terminar la primera)
  return { paso: `Lección ${cuentan.indexOf(l) + 1} de ${cuentan.length}: ${l.familia || curso.nombre}`, url: `/leccion/${encodeURIComponent(curso.id)}/${curso.lecciones.indexOf(l)}` }
}

/**
 * Lo siguiente que toca: el primer curso del orden que no he terminado y, dentro, su paso. Solo lee lo guardado; no
 * escribe nada (ni avance, ni Repaso, ni Refuerza). Con los nueve terminados, el Repaso de hoy.
 */
export function seguir(leer: LecturaSeguir = DEL_TELEFONO): DestinoSeguir {
  for (const id of ORDEN_SEGUIR) {
    const p = pasoDe(id, leer)
    if (p) return { fin: false, cursoId: id, curso: cursoPorId(id)?.nombre ?? id, ...p }
  }
  return { fin: true, url: '/repaso' }
}
