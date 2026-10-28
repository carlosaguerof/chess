/**
 * T17: junta los partidos de calibración con temperamentos (`calibrar.ts partido … --temperamentos a,b`) y resume
 * jaques + capturas de cada temperamento en sus primeras 30 jugadas: total, promedio por partida y la diferencia
 * por partida (agresivo − defensivo) con su error estándar. Guarda las semillas para poder repetirlo.
 *
 *   node scripts/resumir-temperamento.ts <carpeta con los .json> <salida.json>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [carpeta, salida] = process.argv.slice(2) as [string, string]
interface Partido {
  eloA: number
  eloB: number
  temperamentos: [string, string]
  semilla: number
  juegos: number
  puntosA: number
  porcentajeA: number
  jaquesYCapturas: { a: number; b: number }
  partidas: { jaquesYCapturas: { a: number; b: number } }[]
}
const partidos = readdirSync(carpeta)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(carpeta, f), 'utf8')) as Partido)
const cara = partidos.filter((p) => p.eloA === p.eloB && p.temperamentos.includes('agresivo') && p.temperamentos.includes('defensivo'))
const difs: number[] = []
let ag = 0
let def = 0
for (const p of cara) {
  const aEsAg = p.temperamentos[0] === 'agresivo'
  for (const j of p.partidas) {
    const a = aEsAg ? j.jaquesYCapturas.a : j.jaquesYCapturas.b
    const d = aEsAg ? j.jaquesYCapturas.b : j.jaquesYCapturas.a
    ag += a
    def += d
    difs.push(a - d)
  }
}
const n = difs.length
const media = difs.reduce((x, y) => x + y, 0) / n
const de = Math.sqrt(difs.reduce((x, y) => x + (y - media) ** 2, 0) / (n - 1))
const ee = de / Math.sqrt(n)
const resumen = {
  comando: 'node scripts/calibrar.ts partido <eloA> <eloB> 48 <semilla> <salida> --temperamentos <a>,<b>',
  cara_a_cara: {
    partidos: cara.map((p) => ({ temperamentos: p.temperamentos, semilla: p.semilla, juegos: p.juegos, jaquesYCapturas: p.jaquesYCapturas, puntosPrimero: p.puntosA })),
    partidas: n,
    agresivo: { total: ag, porPartida: +(ag / n).toFixed(2) },
    defensivo: { total: def, porPartida: +(def / n).toFixed(2) },
    diferenciaPorPartida: { media: +media.toFixed(2), errorEstandar: +ee.toFixed(2), t: +(media / ee).toFixed(2) },
  },
  fuerza: partidos
    .filter((p) => p.eloA !== p.eloB)
    .map((p) => ({ partido: `${p.eloA} ${p.temperamentos[0]} vs ${p.eloB} ${p.temperamentos[1]}`, semilla: p.semilla, juegos: p.juegos, puntos: p.puntosA, porcentaje: +(100 * p.porcentajeA).toFixed(1), cumpleT4: p.porcentajeA >= 0.6 })),
}
writeFileSync(salida, JSON.stringify(resumen, null, 1) + '\n')
console.log(JSON.stringify(resumen.cara_a_cara, null, 1), JSON.stringify(resumen.fuerza))
