// Dónde viven los archivos de revisión de cada curso: el inventario de "Ver qué pasaría", sus frases sin "Ver", las
// comprobaciones del motor y la lista de marcas. Los de la Caro-Kann están en la vuelta 3 (`iterations/v3/`); los de los
// cursos de la vuelta 4, en `iterations/v4/`, con el nombre de su apertura (2026-11-25).
import type { DatosCurso } from '../src/curso/tipos.ts'

export interface ArchivosDelCurso {
  sinVer: string
  inventario: string
  comprobaciones: string
  marcas: string
}

export function archivosDe(c: Pick<DatosCurso, 'id' | 'apertura' | 'color' | 'secciones'>): ArchivosDelCurso {
  if (c.apertura === 'caro-kann' && c.color === 'b')
    return {
      sinVer: 'iterations/v3/ver-que-pasa-sin-ver.json',
      inventario: 'iterations/v3/ver-que-pasa-inventario.md',
      comprobaciones: 'iterations/v3/comprobaciones-del-curso.md',
      marcas: c.secciones ? 'iterations/v3/marcas-por-jugada-estructuras.md' : 'iterations/v3/marcas-por-jugada.md',
    }
  const a = c.apertura
  return {
    sinVer: `iterations/v4/ver-que-pasa-sin-ver-${a}.json`,
    inventario: `iterations/v4/ver-que-pasa-inventario-${a}.md`,
    comprobaciones: `iterations/v4/comprobaciones-${a}.md`,
    marcas: `iterations/v4/marcas-por-jugada-${a}.md`,
  }
}
