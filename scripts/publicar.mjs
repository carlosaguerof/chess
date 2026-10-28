// Publica la app en GitHub Pages desde este mismo repo (notas 6 y 8): https://carlosaguerof.github.io/chess/
//
//   npm run publicar -- --prueba   → construye con la ruta /chess/ y lista lo que subiría, sin subir nada
//   npm run publicar               → construye y sube el sitio a la rama gh-pages (un commit encima del anterior)
//
// No borra nada ni fuerza nada: arma el árbol del sitio en un índice temporal de git (.cache/indice-pages),
// hace un commit cuyo padre es el gh-pages publicado y lo sube con un push normal.
// Solo publica si el repo es público y si `npm test` y `npm run e2e` están en verde (eso lo revisa quien lo corre).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const prueba = process.argv.includes('--prueba')
const SALIDA = 'dist-pages'
const URL = 'https://carlosaguerof.github.io/chess/'
const run = (cmd, args, opts = {}) => (execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...opts }) ?? '').trim()

// 1) construir con la ruta base /chess/
run('npm', ['run', 'build:pages'], { stdio: ['ignore', 'inherit', 'inherit'] })
writeFileSync(join(SALIDA, '.nojekyll'), '')
writeFileSync(
  join(SALIDA, 'README.md'),
  `# chess — sitio publicado\n\nEsta rama (gh-pages) es el sitio construido de la app: ${URL}\nEl código fuente está en la rama main de este mismo repo (GPL-3.0-or-later). No se edita aquí: se genera con \`npm run publicar\`.\n`,
)

// 2) la lista de archivos del sitio
const archivos = []
const recorrer = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    if (statSync(p).isDirectory()) recorrer(p)
    else archivos.push(relative(SALIDA, p))
  }
}
recorrer(SALIDA)
archivos.sort()
const total = archivos.reduce((s, f) => s + statSync(join(SALIDA, f)).size, 0)
console.log(`\nArchivos del sitio (${archivos.length}, ${(total / 1024 / 1024).toFixed(2)} MB):`)
for (const f of archivos) console.log(`  ${f}  (${(statSync(join(SALIDA, f)).size / 1024).toFixed(1)} KB)`)

if (prueba) {
  console.log(`\nModo de prueba: no se subió nada. Para publicar: npm run publicar  →  ${URL}`)
  process.exit(0)
}

// 3) solo si el repo es público (nota 8)
const visibilidad = JSON.parse(run('gh', ['repo', 'view', 'carlosaguerof/chess', '--json', 'visibility'])).visibility
if (visibilidad !== 'PUBLIC') {
  console.error(`El repo dice ${visibilidad}: no se publica (nota 8). Falta que Carlos haga público el repo.`)
  process.exit(2)
}

// 4) el árbol del sitio en un índice temporal, sin tocar el índice ni los archivos del repo
mkdirSync('.cache', { recursive: true })
const env = { ...process.env, GIT_INDEX_FILE: join(process.cwd(), '.cache', 'indice-pages') }
run('git', ['read-tree', '--empty'], { env })
for (let i = 0; i < archivos.length; i += 50)
  run('git', ['--work-tree', SALIDA, 'add', '--force', '--', ...archivos.slice(i, i + 50)], { env })
const arbol = run('git', ['write-tree'], { env })

// 5) un commit encima del gh-pages publicado (si existe) y un push normal (sin forzar)
let padre = ''
try {
  run('git', ['fetch', '-q', 'origin', 'gh-pages'])
  padre = run('git', ['rev-parse', 'FETCH_HEAD'])
} catch {
  padre = ''
}
if (padre && run('git', ['rev-parse', `${padre}^{tree}`]) === arbol) {
  console.log('Sin cambios: el sitio ya está al día.')
  process.exit(0)
}
const fuente = run('git', ['rev-parse', '--short', 'HEAD'])
const mensaje = `Publica el sitio desde main ${fuente}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
const commit = run('git', ['commit-tree', arbol, ...(padre ? ['-p', padre] : []), '-m', mensaje])
run('git', ['push', '-q', 'origin', `${commit}:refs/heads/gh-pages`], { stdio: ['ignore', 'inherit', 'inherit'] })
console.log(`\nPublicado (${commit.slice(0, 7)}). En uno o dos minutos: ${URL}`)
