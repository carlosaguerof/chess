// Lista las frases de un curso que no llevan "Ver qué pasaría" y todavía no tienen su razón en el archivo del curso
// (`ARCHIVOS_VER` en scripts/ver-inventario.ts). Ayuda a escribir un curso nuevo; la prueba es `tests/unit/ver-que-pasa.test.ts`.
//
//   node scripts/frases-sin-ver.ts escandinava:w
import { existsSync, readFileSync } from 'node:fs'
import { CURSOS_NUEVOS } from '../src/curso/datos.ts'
import { todosLosVer } from '../src/curso/ver.ts'
import { archivosVer, frasesDelCurso, llaveDe } from './ver-inventario.ts'

const id = process.argv[2] ?? 'caro-kann:b'
const c = CURSOS_NUEVOS[id]!
const ruta = archivosVer(c).sinVer
const hechas: Record<string, string> = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {}
const conVer = new Set(todosLosVer(c).map((v) => llaveDe(v.clave, v.campo, v.i)))
for (const x of frasesDelCurso(c)) if (!conVer.has(x.llave) && !(x.llave in hechas)) console.log(`${x.llave}\t${x.frase}`)
