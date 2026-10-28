/**
 * Frecuencias reales a mi nivel, del explorador de aperturas de lichess (nota 10: "después, B").
 * Necesita un token personal de lichess en la variable LICHESS_TOKEN. El token NUNCA se guarda en el repo.
 *
 *   LICHESS_TOKEN=... npm run frecuencias
 *
 * Para cada posición de la base en la que le toca al rival, pide al explorador las partidas Rapid de los grupos
 * de rating más cercanos a 600–1000 (el explorador agrupa por rating: 0 = menos de 1000, y 1000) y guarda
 * cuántas partidas siguieron con cada jugada en conocimiento/frecuencias/explorador.json.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { construir } from './construir-base.ts'

const token = process.env.LICHESS_TOKEN
if (!token) {
  console.error('Falta el token: corre `LICHESS_TOKEN=<tu token> npm run frecuencias`. Los pasos para crearlo están en MANANA.')
  process.exit(2)
}

const { base } = construir()
const posiciones = new Map<string, string[]>()
for (const a of base.aperturas)
  for (const v of a.variantes)
    for (let i = 0; i < v.jugadas.length; i++) posiciones.set(v.jugadas.slice(0, i).join(' '), v.jugadas.slice(0, i))

const salida: Record<string, { total: number; jugadas: Record<string, number> }> = {}
let n = 0
for (const [clave, jugadas] of posiciones) {
  const c = new Chess()
  for (const s of jugadas) c.move(s)
  const url = `https://explorer.lichess.ovh/lichess?variant=standard&speeds=rapid&ratings=0,1000&moves=20&fen=${encodeURIComponent(c.fen())}`
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (r.status === 401) {
    console.error('El explorador rechazó el token (401). Revisa que el token sea válido.')
    process.exit(3)
  }
  if (r.status === 429) {
    console.error('Demasiadas consultas (429): espera un minuto y vuelve a correrlo.')
    process.exit(4)
  }
  const d = (await r.json()) as { white: number; draws: number; black: number; moves: { san: string; white: number; draws: number; black: number }[] }
  salida[clave] = {
    total: d.white + d.draws + d.black,
    jugadas: Object.fromEntries(d.moves.map((m) => [m.san, m.white + m.draws + m.black])),
  }
  n++
  if (n % 20 === 0) console.log(`${n} / ${posiciones.size} posiciones`)
  await new Promise((ok) => setTimeout(ok, 400)) // sin saturar el explorador
}
mkdirSync('conocimiento/frecuencias', { recursive: true })
writeFileSync('conocimiento/frecuencias/explorador.json', JSON.stringify({ fuente: 'explorer.lichess.ovh, Rapid, ratings 0 y 1000', fecha: new Date().toISOString(), posiciones: salida }, null, 1))
console.log(`listo: ${n} posiciones en conocimiento/frecuencias/explorador.json`)
