// Los números de la regla de obligatorio y opcional de cada curso (`specs/cursos.md` §6), desde el conteo de partidas
// de lichess (CC0), a `conocimiento/frecuencias/<curso>.json` (cierre de los cursos, 2026-11-25, §3.5).
//
//   node scripts/frecuencias-cursos.mjs                       (todos, con el conteo por defecto)
//   node scripts/frecuencias-cursos.mjs <conteo.json> italiana:w eslava:b
//
// Cada curso tiene su script (`scripts/frecuencias/<archivo>.mjs`), con el método de su mapa. Su `medir(datos)`
// devuelve { metodo, partidas, lecciones, formas, otras? } (la forma del archivo: `conocimiento/frecuencias/README.md`).
import { writeFileSync, mkdirSync } from 'node:fs'
import { cargarConteo, CONTEO_POR_DEFECTO } from './frecuencias/comun.mjs'

/** Curso → archivo (el mismo nombre en `scripts/frecuencias/` y en `conocimiento/frecuencias/`). */
export const ARCHIVOS = {
  'italiana:w': 'italiana',
  'siciliana:w': 'alapin',
  'caro-kann:w': 'avance-caro-kann',
  'francesa:w': 'avance-francesa',
  'escandinava:w': 'escandinava',
  'eslava:b': 'eslava',
  'otros-negras:b': 'otros-negras',
}

const args = process.argv.slice(2)
const archivoConteo = args[0]?.endsWith('.json') ? args.shift() : CONTEO_POR_DEFECTO
const cuales = args.length ? args : Object.keys(ARCHIVOS)
const conteo = cargarConteo(archivoConteo)
mkdirSync(new URL('../conocimiento/frecuencias/', import.meta.url), { recursive: true })
for (const curso of cuales) {
  const archivo = ARCHIVOS[curso]
  if (!archivo) throw new Error(`curso sin script de frecuencias: ${curso}`)
  const { default: medir } = await import(`./frecuencias/${archivo}.mjs`)
  const r = medir(conteo.datos)
  const salida = {
    curso,
    fuente: conteo.datos.fuente,
    licencia: 'CC0 (base abierta de lichess)',
    filtro: conteo.datos.filtro,
    conteo: { sha256: conteo.sha256, partidasPorBanda: conteo.datos.partidasPorBanda, minimo: conteo.datos.minimo },
    script: `scripts/frecuencias/${archivo}.mjs`,
    ...r,
  }
  writeFileSync(new URL(`../conocimiento/frecuencias/${archivo}.json`, import.meta.url), JSON.stringify(salida, null, 1) + '\n')
  console.log(`${curso}: conocimiento/frecuencias/${archivo}.json`)
}
