/**
 * Las comprobaciones con el motor de los cursos (`iterations/v4/comprobaciones-*.md`), repetibles desde el repo: el mismo
 * Stockfish 19 lite de un hilo que usa la app. Jugadas en SAN inglés separadas por espacios; evaluaciones desde blancas.
 *
 *   node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5" [--prof 18] [--n 3]   las N mejores del lado que mueve
 *   node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d4" [--prof 18]        cuánto pierde esa jugada contra la mejor
 *   node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6" [--prof 16]          "si jugara otra vez" el lado que acaba de mover
 *   node scripts/motor-comprobar.ts linea "e4 c5 c3 ..." w [--prof 18]          en cada jugada de ese lado: las 5 mejores y lo que pierde la de la línea
 *   node scripts/motor-comprobar.ts plan "e4 c5 c3 ..." "O-O Ne5" [--prof 18]   las jugadas de un plan, contra las 2 mejores respuestas del rival
 */
import { createRequire } from 'node:module'
import { Chess } from 'chess.js'

const require = createRequire(import.meta.url)
type Linea = { tipo: string; valor: number; pv: string[] }

let alRecibir: (l: string) => void = () => {}
const sf = (require('stockfish') as (t: string, f: (l: string) => void) => { processCommand(c: string): void; terminate(): void })('lite-single', (l) => alRecibir(l))
const esperar = (prueba: (l: string) => boolean) =>
  new Promise<string[]>((ok) => {
    const ls: string[] = []
    alRecibir = (l) => {
      ls.push(l)
      if (prueba(l)) ok(ls)
    }
  })
let listo = false
async function analizar(fen: string, prof: number, n: number, solo?: string): Promise<Linea[]> {
  if (!listo) {
    const p = esperar((l) => l === 'uciok')
    sf.processCommand('uci')
    await p
    listo = true
  }
  sf.processCommand('ucinewgame')
  sf.processCommand(`setoption name MultiPV value ${n}`)
  const r = esperar((l) => l === 'readyok')
  sf.processCommand('isready')
  await r
  sf.processCommand(`position fen ${fen}`)
  const fin = esperar((l) => l.startsWith('bestmove'))
  sf.processCommand(`go depth ${prof}${solo ? ' searchmoves ' + solo : ''}`)
  const ls = await fin
  const porPv = new Map<number, Linea>()
  for (const l of ls) {
    const m = l.match(/^info depth (\d+) .*?multipv (\d+) score (cp|mate) (-?\d+).* pv (.+)$/)
    if (m && Number(m[1]) === prof) porPv.set(Number(m[2]), { tipo: m[3]!, valor: Number(m[4]), pv: m[5]!.split(' ') })
  }
  return [...porPv.entries()].sort((a, b) => a[0] - b[0]).map((x) => x[1])
}
const aSan = (fen: string, uci: string[]) => {
  const j = new Chess(fen)
  const r: string[] = []
  for (const u of uci) {
    try {
      r.push(j.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san)
    } catch {
      break
    }
  }
  return r
}
const texto = (r: Linea, tb: boolean) => {
  const s = tb ? 1 : -1
  if (r.tipo === 'mate') return `mate en ${Math.abs(r.valor)} para ${r.valor * s > 0 ? 'blancas' : 'negras'}`
  const cp = (r.valor * s) / 100
  return (cp >= 0 ? '+' : '') + cp.toFixed(2)
}
const cpBlancas = (r: Linea, tb: boolean) => (r.tipo === 'mate' ? (r.valor > 0 ? 100000 : -100000) : r.valor) * (tb ? 1 : -1)
const posicion = (js: string) => {
  const c = new Chess()
  for (const s of js.split(/\s+/).filter(Boolean)) c.move(s.replace(/^\d+\.+/, ''))
  return c
}
const uciDe = (fen: string, san: string) => {
  const m = new Chess(fen).move(san)
  return m.from + m.to + (m.promotion ?? '')
}

const a = process.argv.slice(2)
const opcion = (n: string, def: number) => (a.includes(n) ? Number(a[a.indexOf(n) + 1]) : def)
const libres = a.filter((x, i) => !x.startsWith('--') && !a[i - 1]?.startsWith('--'))
const [modo, jugadas = '', extra] = libres
const prof = opcion('--prof', modo === 'amenaza' ? 16 : 18)
const juego = posicion(jugadas)
const fen = juego.fen()
const tb = juego.turn() === 'w'
const out: string[] = [`Posición tras: ${jugadas || '(inicio)'} · mueven ${tb ? 'blancas' : 'negras'} · profundidad ${prof}`]

if (modo === 'mejores') {
  for (const r of await analizar(fen, prof, opcion('--n', 3))) out.push(`  ${texto(r, tb)}  ${aSan(fen, r.pv).slice(0, 8).join(' ')}`)
} else if (modo === 'jugada') {
  const [mejor] = await analizar(fen, prof, 1)
  const [suya] = await analizar(fen, prof, 1, uciDe(fen, extra!))
  out.push(`  mejor: ${texto(mejor!, tb)}  ${aSan(fen, mejor!.pv).slice(0, 8).join(' ')}`, `  ${extra}: ${texto(suya!, tb)}  ${aSan(fen, suya!.pv).slice(0, 8).join(' ')}`, `  pierde ${(cpBlancas(mejor!, tb) - cpBlancas(suya!, tb)) * (tb ? 1 : -1)} centipeones contra la mejor`)
} else if (modo === 'amenaza') {
  const partes = fen.split(' ')
  partes[1] = tb ? 'b' : 'w'
  partes[3] = '-'
  const nulo = partes.join(' ')
  const [r] = await analizar(nulo, prof, 1)
  out.push(`  Si ${tb ? 'negras' : 'blancas'} jugara otra vez: ${aSan(nulo, r!.pv).slice(0, 6).join(' ')}  (${texto(r!, !tb)})`)
} else if (modo === 'linea') {
  const lado = extra ?? 'w'
  const js = jugadas.split(/\s+/).filter(Boolean)
  const c = new Chess()
  for (let i = 0; i <= js.length; i++) {
    const f = c.fen()
    const t = c.turn() === 'w'
    if (i === js.length) {
      out.push(`  FIN: ${(await analizar(f, prof, 3)).map((r) => `${texto(r, t)} ${aSan(f, r.pv).slice(0, 6).join(' ')}`).join(' · ')}`)
      break
    }
    if (c.turn() === lado) {
      const res = await analizar(f, prof, 5)
      const u = uciDe(f, js[i]!)
      const suya = res.find((r) => r.pv[0] === u) ?? (await analizar(f, prof, 1, u))[0]!
      out.push(`  ${js[i]}: ${texto(suya, t)} (pierde ${(cpBlancas(res[0]!, t) - cpBlancas(suya, t)) * (t ? 1 : -1)}) | ${res.map((r) => `${aSan(f, r.pv)[0]} ${texto(r, t)}`).join(' · ')}`)
    }
    c.move(js[i]!)
  }
} else if (modo === 'plan') {
  const res = await analizar(fen, prof, 3)
  out.push(`  el rival: ${res.map((r) => `${aSan(fen, r.pv)[0]} ${texto(r, tb)}`).join(' · ')}`)
  for (const r of res.slice(0, 2)) {
    const k = new Chess(fen)
    k.move(aSan(fen, r.pv)[0]!)
    const fk = k.fen()
    const [mejor] = await analizar(fk, prof, 1)
    out.push(`  tras ${aSan(fen, r.pv)[0]}: mejor ${texto(mejor!, true)} ${aSan(fk, mejor!.pv)[0]}`)
    for (const p of (extra ?? '').split(/\s+/).filter(Boolean)) {
      let u: string
      try {
        u = uciDe(fk, p)
      } catch {
        out.push(`    ${p}: ilegal aquí`)
        continue
      }
      const [suya] = await analizar(fk, prof, 1, u)
      out.push(`    ${p}: ${texto(suya!, true)} (pierde ${cpBlancas(mejor!, true) - cpBlancas(suya!, true)})`)
    }
  }
} else out.push('Modo desconocido: mejores | jugada | amenaza | linea | plan')
console.log(out.join('\n'))
sf.terminate()
process.exit(0)
