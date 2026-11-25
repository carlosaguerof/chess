/**
 * Los archivos de revisión de cada curso (2026-11-25): las comprobaciones del motor, el inventario de "Ver qué pasaría",
 * sus frases sin "Ver" y la lista de las marcas. Los de la Caro-Kann se quedan en `iterations/v3/`; los de los cursos
 * nuevos van en `iterations/v4/`, con el nombre de su archivo (`comprobaciones-eslava.md`). Las pruebas los leen de aquí,
 * así cada curso compara contra los suyos.
 */
import type { DatosCurso } from '../src/curso/tipos.ts'

export interface ArchivosDelCurso {
  comprobaciones: string
  inventario: string
  sinVer: string
  marcas: string
}

export function archivosDelCurso(c: DatosCurso): ArchivosDelCurso {
  if (c.apertura === 'caro-kann' && c.color === 'b')
    return {
      comprobaciones: 'iterations/v3/comprobaciones-del-curso.md',
      inventario: 'iterations/v3/ver-que-pasa-inventario.md',
      sinVer: 'iterations/v3/ver-que-pasa-sin-ver.json',
      marcas: c.secciones ? 'iterations/v3/marcas-por-jugada-estructuras.md' : 'iterations/v3/marcas-por-jugada.md',
    }
  const a = c.id.split(':')[0]!
  return {
    comprobaciones: `iterations/v4/comprobaciones-${a}.md`,
    inventario: `iterations/v4/ver-que-pasa-inventario-${a}.md`,
    sinVer: `iterations/v4/ver-que-pasa-sin-ver-${a}.json`,
    marcas: `iterations/v4/marcas-por-jugada-${a}.md`,
  }
}

/** ¿Es uno de los dos cursos de la Caro-Kann con negras? Sus ejemplos (los de Carlos) solo se prueban ahí. */
export const esCaroKann = (c: DatosCurso) => c.apertura === 'caro-kann' && c.color === 'b'
