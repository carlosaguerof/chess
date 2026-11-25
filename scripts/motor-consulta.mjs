// Consultas al motor para comprobar lo que dice un curso (las comprobaciones de iterations/v4/comprobaciones-*.md).
// Usa el Stockfish 19 lite de un hilo y chess.js de este repo. Se corre desde la raíz del repo.
//
// Uso (jugadas en SAN inglés, separadas por espacios; la notación española no la entiende chess.js):
//   node scripts/motor-consulta.mjs mejores "e4 e5 Nf3 Nc6 Bc4" [--prof 18] [--n 3]
//       → las N mejores jugadas para el lado que mueve, con evaluación y continuación.
//   node scripts/motor-consulta.mjs jugada "e4 c6 d4 d5 e5" "Bf5" [--prof 18]
//       → cuánto pierde esa jugada contra la mejor (en centipeones).
//   node scripts/motor-consulta.mjs amenaza "e4 e5 Nf3 Nc6 Bc4 Nf6" [--prof 16]
//       → "si fuera tu turno otra vez": la mejor jugada del lado que acaba de mover (jugada nula).
//   node scripts/motor-consulta.mjs eval "e4 e5 Nf3" [--prof 18]
// Evaluaciones siempre desde el punto de vista de BLANCAS (+ = mejor para blancas).
import { createRequire } from 'node:module'

const require = createRequire(new URL('../package.json', import.meta.url))
const { Chess } = require('chess.js')
const stockfish = require('stockfish')

function argumentos() {
  const a = process.argv.slice(2)
  const opciones = { prof: 18, n: 3 }
  const libres = []
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--prof') opciones.prof = Number(a[++i])
    else if (a[i] === '--n') opciones.n = Number(a[++i])
    else libres.push(a[i])
  }
  return { modo: libres[0], jugadas: (libres[1] ?? '').trim(), candidata: libres[2], ...opciones }
}

function posicion(jugadas) {
  const juego = new Chess()
  for (const j of jugadas.split(/\s+/).filter(Boolean)) {
    const limpia = j.replace(/^\d+\.+/, '')
    if (!limpia) continue
    juego.move(limpia) // lanza error si es ilegal
  }
  return juego
}

function motor() {
  let alRecibir = () => {}
  const m = stockfish('lite-single', (l) => alRecibir(l))
  const enviar = (c) => m.processCommand(c)
  const esperar = (prueba) =>
    new Promise((resolver) => {
      const lineas = []
      alRecibir = (l) => {
        lineas.push(l)
        if (prueba(l)) resolver(lineas)
      }
    })
  return { enviar, esperar, cerrar: () => m.terminate() }
}

let unico = null
async function analizar(fen, prof, n, solo) {
  // Un solo motor por proceso: el módulo de stockfish.js no se puede iniciar dos veces.
  if (!unico) {
    unico = motor()
    const ok = unico.esperar((l) => l === 'uciok')
    unico.enviar('uci')
    await ok
  }
  const e = unico
  e.enviar('ucinewgame')
  e.enviar(`setoption name MultiPV value ${n}`)
  let listo
  listo = e.esperar((l) => l === 'readyok')
  e.enviar('isready')
  await listo
  e.enviar(`position fen ${fen}`)
  const fin = e.esperar((l) => l.startsWith('bestmove'))
  e.enviar(`go depth ${prof}${solo ? ' searchmoves ' + solo : ''}`)
  const lineas = await fin
  if (process.env.DEPURAR) console.error("[" + fen + " " + (solo ?? "") + "] " + lineas.length + " líneas\n" + lineas.filter((l) => l.startsWith("info depth") || l.startsWith("bestmove")).slice(-3).map((l) => l.slice(0, 120)).join("\n"))
  const porPv = new Map()
  for (const l of lineas) {
    const r = l.match(/^info depth (\d+) .*?multipv (\d+) score (cp|mate) (-?\d+).* pv (.+)$/)
    if (r && Number(r[1]) === prof) porPv.set(Number(r[2]), { tipo: r[3], valor: Number(r[4]), pv: r[5].split(' ') })
  }
  return [...porPv.entries()].sort((a, b) => a[0] - b[0]).map((x) => x[1])
}

function aSan(fen, uci) {
  const j = new Chess(fen)
  const san = []
  for (const u of uci) {
    try {
      const m = j.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] })
      san.push(m.san)
    } catch {
      break
    }
  }
  return san
}

function texto(r, turnoBlancas) {
  const signo = turnoBlancas ? 1 : -1
  if (r.tipo === 'mate') return `mate en ${Math.abs(r.valor)} para ${r.valor * signo > 0 ? 'blancas' : 'negras'}`
  const cp = (r.valor * signo) / 100
  return (cp >= 0 ? '+' : '') + cp.toFixed(2)
}

function cpBlancas(r, turnoBlancas) {
  const signo = turnoBlancas ? 1 : -1
  if (r.tipo === 'mate') return (r.valor > 0 ? 100000 : -100000) * signo
  return r.valor * signo
}

const { modo, jugadas, candidata, prof, n } = argumentos()
const juego = posicion(jugadas)
const fen = juego.fen()
const turnoBlancas = juego.turn() === 'w'
console.log(`Posición tras: ${jugadas || '(inicio)'}\nFEN: ${fen}\nMueven: ${turnoBlancas ? 'blancas' : 'negras'} · profundidad ${prof}`)

if (modo === 'mejores' || modo === 'eval') {
  const res = await analizar(fen, prof, modo === 'eval' ? 1 : n)
  for (const r of res) console.log(`  ${texto(r, turnoBlancas)}  ${aSan(fen, r.pv).slice(0, 8).join(' ')}`)
} else if (modo === 'jugada') {
  const prueba = new Chess(fen)
  const m = prueba.move(candidata)
  const uci = m.from + m.to + (m.promotion ?? '')
  const [mejor] = await analizar(fen, prof, 1)
  const [suya] = await analizar(fen, prof, 1, uci)
  const perdida = (cpBlancas(mejor, turnoBlancas) - cpBlancas(suya, turnoBlancas)) * (turnoBlancas ? 1 : -1)
  console.log(`  mejor:     ${texto(mejor, turnoBlancas)}  ${aSan(fen, mejor.pv).slice(0, 8).join(' ')}`)
  console.log(`  ${m.san}:${' '.repeat(Math.max(1, 10 - m.san.length))}${texto(suya, turnoBlancas)}  ${aSan(fen, suya.pv).slice(0, 8).join(' ')}`)
  console.log(`  pierde ${perdida} centipeones contra la mejor`)
} else if (modo === 'amenaza') {
  if (juego.inCheck()) {
    console.log('  El lado que mueve está en jaque: la amenaza es el jaque mismo.')
  } else {
    const partes = fen.split(' ')
    partes[1] = turnoBlancas ? 'b' : 'w'
    partes[3] = '-'
    const fenNulo = partes.join(' ')
    const [r] = await analizar(fenNulo, prof, 1)
    const turnoNulo = !turnoBlancas
    console.log(`  Si ${turnoNulo ? 'blancas' : 'negras'} jugara otra vez: ${aSan(fenNulo, r.pv).slice(0, 6).join(' ')}  (${texto(r, turnoNulo)})`)
    const [base] = await analizar(fen, prof, 1)
    console.log(`  Con el turno normal: ${texto(base, turnoBlancas)}  ${aSan(fen, base.pv).slice(0, 6).join(' ')}`)
  }
} else {
  console.log('Modo desconocido. Usa: mejores | jugada | amenaza | eval')
}
unico?.cerrar()
process.exit(0)
