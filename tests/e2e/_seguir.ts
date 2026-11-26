import type { Page } from '@playwright/test'
import { cursoNuevo, obligatorias } from '../../src/curso/datos.ts'
import { cursoQueQueda } from '../../src/curso/queda.ts'
import { cursoPorId } from '../../src/cursos/datos.ts'
import type { DatosCurso } from '../../src/curso/tipos.ts'

/** Lo guardado para las pruebas y las capturas de "Seguir" (`specs/aprender.md`, "Seguir"). */

/**
 * El orden de la regla, escrito aquí a mano: la prueba no lee el de la app (`ORDEN_SEGUIR`, que además importa una
 * pantalla con su CSS y Playwright no lo carga).
 */
export const ORDEN = ['caro-kann:b', 'italiana:w', 'caro-kann:w', 'francesa:w', 'siciliana:w', 'escandinava:w', 'eslava:b', 'otros-negras:b', 'otros-1e4:w'] as const

export const nuevoDe = (id: string): DatosCurso => cursoNuevo(cursoQueQueda(id) ?? id)!
export const otros = () => cursoPorId('otros-1e4:w')!

const terminado = (c: DatosCurso) => ({ piezas: { idea: 1, estructura: 1, errores: 1, repaso: 1 }, variantes: Object.fromEntries(obligatorias(c).map((v) => [v.id, { aprendida: 1, terminada: 1 }])), errores: {} })

/** Las claves (sin prefijo) de los cursos nuevos terminados. */
export function cursosTerminados(ids: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(ids.map((id) => [`curso:${nuevoDe(id).id}`, terminado(nuevoDe(id))]))
}

/** Las tres formas de lo guardado: nada, la Caro-Kann a medias y todo terminado. */
export const ESTADOS: Record<'vacio' | 'a-medias' | 'un-curso' | 'todo', Record<string, unknown>> = {
  vacio: {},
  'a-medias': (() => {
    const ck = nuevoDe('caro-kann:b')
    const [v1, v2] = obligatorias(ck)
    return { [`curso:${ck.id}`]: { piezas: { idea: 1, estructura: 1 }, variantes: { [v1!.id]: { aprendida: 1, terminada: 1 } }, errores: {}, enCurso: { linea: `v:${v2!.id}`, vuelta: 'practicar', ply: 5, fecha: 1 } } }
  })(),
  'un-curso': cursosTerminados(ORDEN.slice(0, 1)),
  todo: { ...cursosTerminados(ORDEN.slice(0, 8)), progreso: Object.fromEntries(otros().lecciones.map((l) => [l.id, { fecha: 1 }])) },
}

/** Borra lo guardado, pone esto y abre Inicio. */
export async function abrirInicioCon(page: Page, guardado: Record<string, unknown>) {
  await page.goto('/')
  await page.evaluate((g) => {
    localStorage.clear()
    sessionStorage.clear()
    for (const [k, v] of Object.entries(g)) localStorage.setItem('ajedrez.v1.' + k, JSON.stringify(v))
  }, guardado)
  await page.goto('/#/')
  await page.reload()
}

/** Lo que puede decir el botón de un curso: el nombre de su tarjeta y cada paso suyo. */
export function nombresPosibles(id: string): string[] {
  const tarjeta = cursoPorId(id)!.nombre
  if (id === 'otros-1e4:w') return [tarjeta, ...otros().lecciones.map((l, i, ls) => `Lección ${i + 1} de ${ls.length}: ${l.familia}`)]
  const c = nuevoDe(id)
  return [tarjeta, c.piezas.idea.titulo, c.piezas.estructura.titulo, ...obligatorias(c).map((v) => v.nombre), c.piezas.errores.titulo, c.piezas.repaso.titulo]
}
