// Lista las frases de un curso que no llevan "Ver qué pasaría" y todavía no tienen su razón en el archivo del curso
// (`archivosDelCurso` en scripts/archivos-del-curso.ts). Ayuda a escribir un curso nuevo; la prueba es `tests/unit/ver-que-pasa.test.ts`.
//
//   node scripts/frases-sin-ver.ts escandinava:w
import { existsSync, readFileSync } from 'node:fs'
import { CURSOS_NUEVOS } from '../src/curso/datos.ts'
import { todosLosVer } from '../src/curso/ver.ts'
import { frasesDelCurso, llaveDe } from './ver-inventario.ts'
import { archivosDelCurso } from './archivos-del-curso.ts'

const id = process.argv[2] ?? 'caro-kann:b'
const c = CURSOS_NUEVOS[id]!
const ruta = archivosDelCurso(c).sinVer
const hechas: Record<string, string> = existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : {}
const conVer = new Set(todosLosVer(c).map((v) => llaveDe(v.clave, v.campo, v.i)))
for (const x of frasesDelCurso(c)) if (!conVer.has(x.llave) && !(x.llave in hechas)) console.log(`${x.llave}\t${x.frase}`)
