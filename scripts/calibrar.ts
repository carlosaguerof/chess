/**
 * Calibración de los niveles: partidos entre niveles con la MISMA función que usa la app (elegirJugada).
 *
 *   node scripts/calibrar.ts todo 300 1200 [--juegos 48] [--paralelo 6] [--niveles ruta.json] [--salida carpeta]
 *     → partidos de 100 en 100 (para el ELO en cadena) y de 200 en 200 (el criterio: ≥ 60 %), en paralelo.
 *   node scripts/calibrar.ts partido <eloA> <eloB> <juegos> <semilla> <salida.json> [--niveles ruta.json]
 *     → un partido (lo usa "todo" en procesos aparte).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { motorNode } from './motor-node.ts'
import { elegirJugada, azarConSemilla, type ParamsNivel, type Temperamento } from '../src/motor/elegir.ts'
import { contarJaquesYCapturas } from '../src/motor/temperamento.ts'
import { finPorReglas, uciDe } from '../src/ajedrez/reglas.ts'
import { APERTURAS_CALIBRACION } from './aperturas-calibracion.ts'
import datosNiveles from '../src/motor/niveles.json' with { type: 'json' }

const MAX_MEDIAS_JUGADAS = 400

function arg(nombre: string, porDefecto: string): string {
  const i = process.argv.indexOf(nombre)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1]! : porDefecto
}

function cargarNiveles(): ParamsNivel[] {
  const ruta = arg('--niveles', '')
  const d = ruta ? JSON.parse(readFileSync(ruta, 'utf8')) : datosNiveles
  return d.niveles as ParamsNivel[]
}

function nivel(niveles: ParamsNivel[], elo: number): ParamsNivel {
  const n = niveles.find((x) => x.elo === elo)
  if (!n) throw new Error(`no hay nivel ${elo}`)
  return n
}

interface ResultadoPartida {
  apertura: string
  blancas: number
  negras: number
  /** 1 gana blancas, 0 gana negras, 0.5 tablas */
  resultado: number
  fin: string
  mediasJugadas: number
  pgn: string
  errores: { blancas: number; negras: number }
  /** jaques + capturas de cada nivel en sus primeras 30 jugadas (T17) */
  jaquesYCapturas: { a: number; b: number }
}

/** Temperamentos de cada lado (T17): --temperamentos agresivo,defensivo (A,B). Sin el argumento, equilibrado. */
function temperamentos(): [Temperamento | undefined, Temperamento | undefined] {
  const t = arg('--temperamentos', '')
  if (!t) return [undefined, undefined]
  const [a, b] = t.split(',') as [Temperamento, Temperamento]
  return [a, b]
}

async function partido(eloA: number, eloB: number, juegos: number, semilla: number, salida: string) {
  const [tA, tB] = temperamentos()
  const niveles = cargarNiveles()
  const a = nivel(niveles, eloA)
  const b = nivel(niveles, eloB)
  // el paquete de Stockfish admite un solo motor por proceso; elegirJugada limpia su memoria antes de cada jugada
  const motor = motorNode()
  const version = await motor.iniciar()
  const azar = azarConSemilla(semilla)
  const partidas: ResultadoPartida[] = []
  const t0 = Date.now()
  for (let g = 0; g < juegos; g++) {
    const apertura = APERTURAS_CALIBRACION[Math.floor(g / 2) % APERTURAS_CALIBRACION.length]!
    const aConBlancas = g % 2 === 0
    const pb = aConBlancas ? a : b
    const pn = aConBlancas ? b : a
    const chess = new Chess()
    for (const san of apertura.jugadas) chess.move(san)
    await motor.nuevaPartida()
    const errores = { blancas: 0, negras: 0 }
    let fin = finPorReglas(chess)
    while (!fin && chess.history().length < MAX_MEDIAS_JUGADAS) {
      const blancas = chess.turn() === 'w'
      const tempMueve = (blancas ? aConBlancas : !aConBlancas) ? tA : tB
      const e = await elegirJugada(motor, chess.fen(), blancas ? pb : pn, azar, tempMueve)
      if (!e) break
      if (e.motivo === 'error') errores[blancas ? 'blancas' : 'negras']++
      chess.move({ from: e.uci.slice(0, 2), to: e.uci.slice(2, 4), promotion: e.uci[4] })
      fin = finPorReglas(chess)
    }
    const resultado = fin?.ganador === 'w' ? 1 : fin?.ganador === 'b' ? 0 : 0.5
    // jaques y capturas de cada lado en sus primeras 30 jugadas (desde el inicio, sin contar las de la apertura de salida)
    const sanes = chess.history()
    const inicio = apertura.jugadas.length
    const deColor = (c: 'w' | 'b') => sanes.filter((_, i) => i >= inicio && i < 60 && (i % 2 === 0 ? 'w' : 'b') === c)
    const aColor = aConBlancas ? 'w' : 'b'
    const jaquesYCapturas = { a: contarJaquesYCapturas(deColor(aColor)), b: contarJaquesYCapturas(deColor(aColor === 'w' ? 'b' : 'w')) }
    partidas.push({
      apertura: apertura.nombre,
      blancas: pb.elo,
      negras: pn.elo,
      resultado,
      fin: fin?.tipo ?? 'limite',
      mediasJugadas: chess.history().length,
      pgn: chess.history({ verbose: true }).map(uciDe).join(' '),
      errores,
      jaquesYCapturas,
    })
  }
  motor.cerrar()
  let puntosA = 0
  let g = 0, t = 0, p = 0
  for (const x of partidas) {
    const deA = x.blancas === eloA ? x.resultado : 1 - x.resultado
    puntosA += deA
    if (deA === 1) g++
    else if (deA === 0) p++
    else t++
  }
  const jyc = { a: partidas.reduce((x, p) => x + p.jaquesYCapturas.a, 0), b: partidas.reduce((x, p) => x + p.jaquesYCapturas.b, 0) }
  const resumen = { version, eloA, eloB, temperamentos: [tA ?? 'equilibrado', tB ?? 'equilibrado'], jaquesYCapturas: jyc, juegos, semilla, puntosA, ganadas: g, tablas: t, perdidas: p, porcentajeA: puntosA / juegos, segundos: (Date.now() - t0) / 1000, partidas }
  writeFileSync(salida, JSON.stringify(resumen, null, 1))
  console.log(`${eloA}${tA ? ' ' + tA : ''} vs ${eloB}${tB ? ' ' + tB : ''}: ${puntosA}/${juegos} (${((100 * puntosA) / juegos).toFixed(1)} %) +${g} =${t} -${p} en ${resumen.segundos.toFixed(0)} s · jaques+capturas (30 jugadas): ${jyc.a} vs ${jyc.b}`)
}

function diferenciaElo(s: number, n: number): number {
  // con corrección para 0 % o 100 %: medio punto
  const p = Math.min(Math.max(s, 0.5), n - 0.5) / n
  return -400 * Math.log10(1 / p - 1)
}

async function todo(desde: number, hasta: number) {
  const juegos = Number(arg('--juegos', '48'))
  const paralelo = Number(arg('--paralelo', '6'))
  const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const carpeta = arg('--salida', `/Users/carlosaguerof/01_repos/00_corridas/_local/chess/2026-10-28_mvp/calibracion/${sello}`)
  mkdirSync(carpeta, { recursive: true })
  const niveles = cargarNiveles().map((n) => n.elo).filter((e) => e >= desde && e <= hasta).sort((x, y) => x - y)
  const pares: [number, number, string][] = []
  for (let i = 1; i < niveles.length; i++) pares.push([niveles[i]!, niveles[i - 1]!, 'cadena'])
  for (let i = 0; i < niveles.length; i++) {
    const abajo = niveles.find((e) => e === niveles[i]! - 200)
    if (abajo !== undefined) pares.push([niveles[i]!, abajo, 'criterio'])
  }
  const extra = arg('--niveles', '') ? ['--niveles', arg('--niveles', '')] : []
  let siguiente = 0
  const correr = async (): Promise<void> => {
    while (siguiente < pares.length) {
      const [a, b] = pares[siguiente]!
      const semilla = 1000 + siguiente
      siguiente++
      await new Promise<void>((ok, mal) => {
        const h = spawn(process.execPath, ['scripts/calibrar.ts', 'partido', String(a), String(b), String(juegos), String(semilla), `${carpeta}/${a}-vs-${b}.json`, ...extra], { stdio: 'inherit' })
        h.on('exit', (c) => (c === 0 ? ok() : mal(new Error(`partido ${a}-${b} salió con ${c}`))))
      })
    }
  }
  const t0 = Date.now()
  await Promise.all(Array.from({ length: paralelo }, correr))
  const leer = (a: number, b: number) => JSON.parse(readFileSync(`${carpeta}/${a}-vs-${b}.json`, 'utf8'))
  // ELO en cadena: el primero vale su nominal; cada siguiente suma la diferencia medida contra el anterior
  const cadena: Record<number, number> = { [niveles[0]!]: niveles[0]! }
  for (let i = 1; i < niveles.length; i++) {
    const r = leer(niveles[i]!, niveles[i - 1]!)
    cadena[niveles[i]!] = cadena[niveles[i - 1]!]! + diferenciaElo(r.puntosA, r.juegos)
  }
  const filas = niveles.map((e) => {
    const c = pares.find(([a, , tipo]) => a === e && tipo === 'criterio')
    const crit = c ? leer(c[0], c[1]) : null
    const ady = e !== niveles[0] ? leer(e, niveles[niveles.indexOf(e) - 1]!) : null
    return {
      elo: e,
      contra200: crit ? { rival: crit.eloB, juegos: crit.juegos, puntos: crit.puntosA, porcentaje: crit.porcentajeA, g: crit.ganadas, t: crit.tablas, p: crit.perdidas, cumple: crit.porcentajeA >= 0.6 } : null,
      contra100: ady ? { rival: ady.eloB, juegos: ady.juegos, puntos: ady.puntosA, porcentaje: ady.porcentajeA } : null,
      eloCadena: Math.round(cadena[e]!),
    }
  })
  const resumen = { carpeta, juegosPorPartido: juegos, minutos: (Date.now() - t0) / 60000, version: leer(pares[0]![0], pares[0]![1]).version, filas }
  writeFileSync(`${carpeta}/resumen.json`, JSON.stringify(resumen, null, 1))
  console.log(`\nMotor: ${resumen.version} · ${juegos} partidas por par · ${resumen.minutos.toFixed(1)} min · ${carpeta}`)
  console.log('| Nivel | contra 200 abajo (puntos / partidas, %) | +G =T −P | ¿≥ 60 %? | contra 100 abajo (%) | ELO en cadena |')
  console.log('|---|---|---|---|---|---|')
  let subeSiempre = true
  for (let i = 0; i < filas.length; i++) {
    const f = filas[i]!
    if (i > 0 && f.eloCadena <= filas[i - 1]!.eloCadena) subeSiempre = false
    const c = f.contra200
    console.log(`| ${f.elo} | ${c ? `${c.puntos} / ${c.juegos} vs ${c.rival} (${(100 * c.porcentaje).toFixed(1)} %)` : '—'} | ${c ? `+${c.g} =${c.t} −${c.p}` : '—'} | ${c ? (c.cumple ? 'sí' : '**no**') : '—'} | ${f.contra100 ? `${(100 * f.contra100.porcentaje).toFixed(1)} % vs ${f.contra100.rival}` : '—'} | ${f.eloCadena} |`)
  }
  console.log(`\nEl ELO en cadena sube en cada nivel: ${subeSiempre ? 'sí' : 'NO'}`)
}

const modo = process.argv[2]
if (modo === 'partido') {
  const [, , , a, b, j, s, out] = process.argv
  await partido(Number(a), Number(b), Number(j), Number(s), out!)
  process.exit(0)
} else if (modo === 'todo') {
  await todo(Number(process.argv[3] ?? 300), Number(process.argv[4] ?? 1200))
  process.exit(0)
} else {
  console.log('uso: node scripts/calibrar.ts todo 300 1200 | partido <a> <b> <juegos> <semilla> <salida.json>')
}
