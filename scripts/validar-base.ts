/**
 * Valida con el motor cada jugada de "mi lado" de la base: no puede perder más de 100 cp contra la mejor, a profundidad 18.
 * Guarda los resultados en conocimiento/validacion-motor.json (se reutilizan: solo se calcula lo nuevo).
 *
 *   node scripts/validar-base.ts [--paralelo 6] [--profundidad 18]
 *   (internamente) node scripts/validar-base.ts trabajo <entrada.json> <salida.json> <profundidad>
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { leerDefiniciones, leerFuente, jugadasMias, claveValidacion, type Validacion } from './construir-base.ts'
import { motorNode } from './motor-node.ts'
import { evaluarJugada } from './evaluar-jugada.ts'

const RUTA = 'conocimiento/validacion-motor.json'

async function trabajo(entrada: string, salida: string, profundidad: number) {
  const pendientes = JSON.parse(readFileSync(entrada, 'utf8')) as { fen: string; uci: string }[]
  const motor = motorNode()
  await motor.iniciar()
  const r: Validacion = {}
  for (const p of pendientes) r[claveValidacion(p.fen, p.uci)] = await evaluarJugada(motor, p.fen, p.uci, profundidad)
  writeFileSync(salida, JSON.stringify(r))
  motor.cerrar()
}

async function principal() {
  const paralelo = Number(process.argv[process.argv.indexOf('--paralelo') + 1] || 6)
  const profundidad = Number(process.argv.includes('--profundidad') ? process.argv[process.argv.indexOf('--profundidad') + 1] : 18)
  const cache: Validacion = existsSync(RUTA) ? JSON.parse(readFileSync(RUTA, 'utf8')) : {}
  const fuente = leerFuente()
  const pend = new Map<string, { fen: string; uci: string }>()
  for (const d of leerDefiniciones())
    for (const v of d.variantes) {
      const fila = fuente.find((f) => f.eco === v.fila.eco && f.name === v.fila.name && f.pgn === v.fila.pgn)
      if (!fila) continue
      const todas = [...fila.sanes, ...(v.continuacion ? v.continuacion.jugadas.split(' ').filter(Boolean) : [])]
      for (const j of jugadasMias(todas, v.lado ?? d.lado)) {
        const k = claveValidacion(j.fen, j.uci)
        const c = cache[k]
        if (!c || c.profundidad < profundidad || process.argv.includes('--todo')) pend.set(k, { fen: j.fen, uci: j.uci })
      }
    }
  const lista = [...pend.values()]
  console.log(`por validar: ${lista.length} jugadas (ya en caché: ${Object.keys(cache).length})`)
  if (lista.length === 0) return
  // la carpeta de trabajo (fuera del repo): la de la corrida que valida, o la del MVP
  const dir = process.env.DIR_VALIDACION ?? '/Users/carlosaguerof/01_repos/00_corridas/_local/chess/2026-10-28_mvp/validacion'
  mkdirSync(dir, { recursive: true })
  const lotes: { fen: string; uci: string }[][] = Array.from({ length: paralelo }, () => [])
  lista.forEach((p, i) => lotes[i % paralelo]!.push(p))
  const t0 = Date.now()
  await Promise.all(
    lotes.map(
      (lote, i) =>
        new Promise<void>((ok, mal) => {
          if (lote.length === 0) return ok()
          writeFileSync(`${dir}/lote-${i}.json`, JSON.stringify(lote))
          const h = spawn(process.execPath, ['scripts/validar-base.ts', 'trabajo', `${dir}/lote-${i}.json`, `${dir}/res-${i}.json`, String(profundidad)], { stdio: 'inherit' })
          h.on('exit', (c) => (c === 0 ? ok() : mal(new Error(`lote ${i} salió con ${c}`))))
        }),
    ),
  )
  for (let i = 0; i < paralelo; i++) if (existsSync(`${dir}/res-${i}.json`) && lotes[i]!.length) Object.assign(cache, JSON.parse(readFileSync(`${dir}/res-${i}.json`, 'utf8')))
  const ordenado = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(RUTA, JSON.stringify(ordenado, null, 0).replace(/\},"/g, '},\n"') + '\n')
  const malas = Object.entries(ordenado).filter(([, v]) => v.perdida > 100)
  console.log(`listo en ${((Date.now() - t0) / 60000).toFixed(1)} min; jugadas que pierden > 100 cp: ${malas.length}`)
  for (const [k, v] of malas) console.log(`  ${k} pierde ${v.perdida} (mejor ${v.mejor})`)
}

if (process.argv[2] === 'trabajo') {
  await trabajo(process.argv[3]!, process.argv[4]!, Number(process.argv[5]))
  process.exit(0)
} else {
  await principal()
  process.exit(0)
}
