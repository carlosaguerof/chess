/**
 * T13: ninguna jugada de libro de los bots pierde más de 2 peones (200 cp) contra la mejor del motor a profundidad 16.
 * Revisa, para cada personaje y cada color, las jugadas del lado del bot en las líneas de su estilo (hasta 8 jugadas suyas).
 * Guarda en conocimiento/validacion-libros.json.
 *
 *   node scripts/validar-libros.ts [--paralelo 2]
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { claveValidacion, type Validacion } from './construir-base.ts'
import { motorNode } from './motor-node.ts'
import { evaluarJugada } from './evaluar-jugada.ts'
import datosPersonajes from '../src/bots/personajes.json' with { type: 'json' }
import datosBase from '../conocimiento/base.json' with { type: 'json' }
import { lineasDeClave } from '../src/base/base.ts'
import type { Base } from '../src/base/tipos.ts'
import { JUGADAS_DE_LIBRO } from '../src/bots/libros.ts'

export const RUTA = 'conocimiento/validacion-libros.json'
export const PROFUNDIDAD = 16
export const PERDIDA_MAXIMA_LIBRO = 200

export function jugadasDeLibro(): { fen: string; uci: string; san: string; quien: string[] }[] {
  const base = datosBase as unknown as Base
  const mapa = new Map<string, { fen: string; uci: string; san: string; quien: string[] }>()
  for (const p of datosPersonajes.personajes) {
    for (const [lado, claves] of [['w', p.estilo.blancas], ['b', p.estilo.negras]] as const) {
      for (const clave of claves)
        for (const linea of lineasDeClave(clave, base)) {
          const c = new Chess()
          linea.forEach((san, ply) => {
            const fen = c.fen()
            const m = c.move(san)
            const delBot = (ply % 2 === 0 ? 'w' : 'b') === lado
            if (!delBot || Math.floor(ply / 2) >= JUGADAS_DE_LIBRO) return
            const k = claveValidacion(fen, m.from + m.to + (m.promotion ?? ''))
            const e = mapa.get(k) ?? { fen, uci: m.from + m.to + (m.promotion ?? ''), san, quien: [] }
            if (!e.quien.includes(p.id)) e.quien.push(p.id)
            mapa.set(k, e)
          })
        }
    }
  }
  return [...mapa.values()]
}

async function trabajo(entrada: string, salida: string) {
  const lista = JSON.parse(readFileSync(entrada, 'utf8')) as { fen: string; uci: string }[]
  const motor = motorNode()
  await motor.iniciar()
  const r: Validacion = {}
  for (const p of lista) r[claveValidacion(p.fen, p.uci)] = await evaluarJugada(motor, p.fen, p.uci, PROFUNDIDAD)
  writeFileSync(salida, JSON.stringify(r))
  motor.cerrar()
}

async function principal() {
  const paralelo = Number(process.argv.includes('--paralelo') ? process.argv[process.argv.indexOf('--paralelo') + 1] : 2)
  const cache: Validacion = existsSync(RUTA) ? JSON.parse(readFileSync(RUTA, 'utf8')) : {}
  const todas = jugadasDeLibro()
  const pend = todas.filter((j) => !cache[claveValidacion(j.fen, j.uci)])
  console.log(`jugadas de libro: ${todas.length}; por validar: ${pend.length}`)
  // la carpeta de trabajo (fuera del repo): la de la corrida que valida, o la del MVP
  const dir = process.env.DIR_VALIDACION ?? '/Users/carlosaguerof/01_repos/00_corridas/_local/chess/2026-10-28_mvp/validacion-libros'
  mkdirSync(dir, { recursive: true })
  const lotes: (typeof pend)[] = Array.from({ length: paralelo }, () => [])
  pend.forEach((p, i) => lotes[i % paralelo]!.push(p))
  await Promise.all(
    lotes.map(
      (lote, i) =>
        new Promise<void>((ok, mal) => {
          if (!lote.length) return ok()
          writeFileSync(`${dir}/lote-${i}.json`, JSON.stringify(lote))
          const h = spawn(process.execPath, ['scripts/validar-libros.ts', 'trabajo', `${dir}/lote-${i}.json`, `${dir}/res-${i}.json`], { stdio: 'inherit' })
          h.on('exit', (c) => (c === 0 ? ok() : mal(new Error(`lote ${i}: ${c}`))))
        }),
    ),
  )
  for (let i = 0; i < paralelo; i++) if (lotes[i]!.length) Object.assign(cache, JSON.parse(readFileSync(`${dir}/res-${i}.json`, 'utf8')))
  const ordenado = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)))
  writeFileSync(RUTA, JSON.stringify(ordenado).replace(/\},"/g, '},\n"') + '\n')
  const malas = todas.filter((j) => (ordenado[claveValidacion(j.fen, j.uci)]?.perdida ?? 0) > PERDIDA_MAXIMA_LIBRO)
  const max = Math.max(...todas.map((j) => ordenado[claveValidacion(j.fen, j.uci)]?.perdida ?? 0))
  console.log(`listo; la que más pierde: ${max} cp; pierden más de ${PERDIDA_MAXIMA_LIBRO}: ${malas.length}`)
  for (const m of malas) console.log(`  ${m.san} en ${m.fen} (${m.quien.join(', ')}) pierde ${ordenado[claveValidacion(m.fen, m.uci)]!.perdida}`)
}

if (process.argv[2] === 'trabajo') {
  await trabajo(process.argv[3]!, process.argv[4]!)
  process.exit(0)
} else if (process.argv[1]?.endsWith('validar-libros.ts')) {
  await principal()
  process.exit(0)
}
