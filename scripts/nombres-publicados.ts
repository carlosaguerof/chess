// Los nombres con que la app publicada guardó cada lección en el registro (cierre de los cursos, 2026-11-25).
//
//   node scripts/nombres-publicados.ts > nombres.json && mv nombres.json src/curso/nombres-de-antes.json
//
// (No directo al archivo: el script carga los cursos, que leen ese mismo archivo, y la redirección lo vacía antes.)
//
// El Repaso reconoce un fallo por el nombre de la lección (`fichaDe`, `src/repaso/repaso.ts`), y lo que hay en el
// teléfono es lo publicado, no `main`: la página publicada sale de `main` `1baf424` (gh-pages `f98f8e2`). Ahí los siete
// cursos usaban la lección de antes, que guardaba el nombre de la variante de la base (`v.nombre`), y la Caro-Kann, el
// curso piloto (`conocimiento/cursos/caro-kann.json`). Para cada lección de hoy de esos ocho cursos, junta los nombres
// publicados de su misma variante y de cada lección vieja que se le muda (`TABLAS_DE_MUDANZA`), sin el nombre de hoy.
// Si se publica otra versión con otros nombres, se agrega su commit a `PUBLICADOS` y se rehace.
import { execFileSync } from 'node:child_process'
import { CURSOS_NUEVOS, leccionIdDe } from '../src/curso/datos.ts'
import { TABLAS_DE_MUDANZA } from '../src/aprender/migracion.ts'

/** Los commits de `main` de los que salió una página publicada. */
const PUBLICADOS = ['1baf424']

interface VarianteBase {
  id: string
  nombre: string
}
interface Base {
  aperturas: { id: string; variantes: VarianteBase[] }[]
}

const leer = <T,>(commit: string, archivo: string): T => JSON.parse(execFileSync('git', ['show', `${commit}:${archivo}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })) as T

const nombres: Record<string, Set<string>> = {}
const agregar = (id: string, nombre: string | undefined) => {
  if (!nombre) return
  ;(nombres[id] ??= new Set()).add(nombre)
}

for (const commit of PUBLICADOS) {
  const base = leer<Base>(commit, 'conocimiento/base.json')
  const piloto = leer<{ variantes: { id: string; nombre: string }[] }>(commit, 'conocimiento/cursos/caro-kann.json')
  for (const c of Object.values(CURSOS_NUEVOS)) {
    if (c.fichasDe) continue // la capa de la Caro-Kann usa las fichas del curso de antes
    const ap = base.aperturas.find((a) => a.id === c.apertura)
    const prefijo = `${c.id}/${c.color}:${c.apertura}/`
    const tabla = TABLAS_DE_MUDANZA.find((t) => t.prefijo === prefijo)?.tabla ?? {}
    for (const v of c.variantes) {
      const id = leccionIdDe(c, v)
      // la misma variante, si ya era lección (la Caro-Kann: su curso piloto; los demás: la variante de la base)
      if (c.id === 'caro-kann:b') agregar(id, piloto.variantes.find((x) => x.id === v.id)?.nombre)
      else agregar(id, ap?.variantes.find((x) => x.id === v.base)?.nombre)
      // y cada lección vieja que se le muda
      for (const [vieja, nueva] of Object.entries(tabla)) if (nueva === v.base) agregar(id, ap?.variantes.find((x) => x.id === vieja)?.nombre)
      nombres[id]?.delete(v.nombre)
      if (nombres[id]?.size === 0) delete nombres[id]
    }
  }
}

const salida = Object.fromEntries(Object.keys(nombres).sort().map((k) => [k, [...nombres[k]!].sort((a, b) => a.localeCompare(b, 'es'))]))
console.log(JSON.stringify(salida, null, 1))
