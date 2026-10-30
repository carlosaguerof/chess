import type { Marca } from '../curso/tipos.ts'
import { centro, colorDe, puntosDeFlechas } from '../curso/marcas.ts'

/**
 * Las marcas encima del tablero (correcciones de la Caro-Kann, C5; reglas de las marcas v1.3): un dibujo propio, porque
 * el de chessground no hace flechas punteadas ni en L. Flecha: de la pieza a la casilla, sólida (ahora) o punteada
 * ("después": tu plan en verde, A3; el plan o la amenaza del rival en rojo, A7, una flecha por paso); la del caballo,
 * en L. Casilla: iluminada. Solo verde y rojo. No se puede tocar: las jugadas pasan por debajo.
 */
const GRUESO = 0.16
const PUNTA = 0.42
/** la punta de la punteada, más chica: en una flecha de una casilla deja ver los puntos (pase visual 2) */
const PUNTA_PLAN = 0.34

/**
 * La punteada de una sola casilla (h4→h5, c5→d4), a la medida (revisión de la torre, v1.3): con la de siempre se veía
 * solo una "V" chica, porque sus rayas caían sobre la pieza, donde casi no se ven, y la punta tapaba el resto. Sale del
 * borde entre las dos casillas, con la punta más chica y el trazo más fino y de rayas más cortas: dentro de la casilla
 * de llegada se ven dos o tres rayas y la punta. La recta pasa un poco del centro de la de llegada (si no, no caben);
 * la diagonal tiene lugar y llega antes del centro, como las demás, para no chocar con otra punta en esa casilla. Las
 * demás flechas no cambian.
 */
const CORTA = { sale: 0.5, pasaRecta: 0.12, pasaDiagonal: -0.1, punta: 0.2, grueso: 0.075, raya: 0.09, hueco: 0.05 }
/** De una casilla a la de junto, también en diagonal. */
const deUnaCasilla = (de: string, a: string) => Math.max(Math.abs(de.charCodeAt(0) - a.charCodeAt(0)), Math.abs(Number(de[1]) - Number(a[1]))) === 1

/**
 * Una flecha. La punteada (un plan) es de puntos, sale un poco afuera de su pieza y lleva la punta abierta: en una
 * flecha de una sola casilla, los guiones quedaban debajo de la pieza y parecía sólida, o un puntero (pases visuales 1 y 2).
 */
function Flecha({ m, ruta, escala }: { m: Marca; ruta: [number, number][]; escala: number }) {
  // una copia: la ruta viene de la capa, y en desarrollo React dibuja dos veces (moverle la salida dos veces la rompía)
  const puntos = [...ruta]
  const corta = !!m.punteada && deUnaCasilla(m.de!, m.a!)
  const punta = (corta ? CORTA.punta : m.punteada ? PUNTA_PLAN : PUNTA) * escala
  const color = colorDe(m)
  if (m.punteada) {
    const [sx, sy] = puntos[0]!
    const [nx, ny] = puntos[1]!
    const l = Math.hypot(nx - sx, ny - sy)
    const sale = corta ? CORTA.sale : 0.22
    puntos[0] = [sx + ((nx - sx) / l) * sale, sy + ((ny - sy) / l) * sale]
  }
  // la línea termina donde empieza la punta, que llega cerca del centro de la casilla
  const [ax, ay] = puntos[puntos.length - 2]!
  const [bx, by] = puntos[puntos.length - 1]!
  const largo = Math.hypot(bx - ax, by - ay)
  const ux = (bx - ax) / largo
  const uy = (by - ay) / largo
  const pasa = !corta ? -0.1 : m.de![0] === m.a![0] || m.de![1] === m.a![1] ? CORTA.pasaRecta : CORTA.pasaDiagonal
  const fin: [number, number] = [bx + ux * pasa, by + uy * pasa]
  const base: [number, number] = [fin[0] - ux * punta, fin[1] - uy * punta]
  // la punteada, con la punta abierta y los puntos hasta ella: una punta hueca de triángulo parecía el puntero del ratón
  const linea = [...puntos.slice(0, -1), m.punteada ? [fin[0] - ux * (corta ? 0.08 : 0.14), fin[1] - uy * (corta ? 0.08 : 0.14)] : base]
  const ancho = m.punteada ? punta * 0.65 : punta / 2
  const grueso = (corta ? CORTA.grueso : m.punteada ? 0.12 : GRUESO) * escala
  const rayas = corta ? `${CORTA.raya * escala} ${CORTA.hueco * escala}` : `${0.11 * escala} ${0.08 * escala}`
  const triangulo = [fin, [base[0] - uy * ancho, base[1] + ux * ancho], [base[0] + uy * ancho, base[1] - ux * ancho]]
  const trazo = linea.map((p) => p.join(',')).join(' ')
  const abierta = [triangulo[1]!, triangulo[0]!, triangulo[2]!].map((p) => p.join(',')).join(' ')
  return (
    <g data-marca="flecha" data-tipo={m.tipo} data-de={m.de} data-a={m.a} data-color={m.color ?? 'verde'} data-punteada={m.punteada ? 'si' : 'no'} data-corta={corta ? 'si' : undefined} data-puntos={puntos.length} opacity={escala > 1 ? 0.9 : 0.82}>
      {/* en un tablero chico, un borde claro debajo: la flecha se distingue también sobre el amarillo de la última jugada */}
      {escala > 1 && (
        <g stroke="#f4f4e6" strokeOpacity={0.75} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={trazo} strokeWidth={grueso + 0.07} />
          {m.punteada ? <polyline points={abierta} strokeWidth={0.075 * escala + 0.07} /> : <polygon points={triangulo.map((p) => p.join(',')).join(' ')} strokeWidth={0.07} />}
        </g>
      )}
      <polyline points={trazo} fill="none" stroke={color} strokeWidth={grueso} strokeLinecap={m.punteada ? 'butt' : 'round'} strokeLinejoin="round" strokeDasharray={m.punteada ? rayas : undefined} />
      {m.punteada ? (
        <polyline points={[triangulo[1]!, triangulo[0]!, triangulo[2]!].map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={0.075 * escala} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <polygon points={triangulo.map((p) => p.join(',')).join(' ')} fill={color} />
      )}
    </g>
  )
}

function Casilla({ m, orientacion }: { m: Marca; orientacion: 'white' | 'black' }) {
  const [x, y] = centro(m.en!, orientacion)
  const color = colorDe(m)
  return (
    <g data-marca="casilla" data-tipo={m.tipo} data-en={m.en} data-color={m.color ?? 'verde'}>
      <rect x={x - 0.44} y={y - 0.44} width={0.88} height={0.88} rx={0.06} fill={color} fillOpacity={0.32} stroke={color} strokeWidth={0.12} />
    </g>
  )
}

/** Las casillas con pieza, de la FEN que se ve (para que la L del caballo no doble encima de una pieza). */
function ocupadas(fen: string): Set<string> {
  const r = new Set<string>()
  fen
    .split(' ')[0]!
    .split('/')
    .forEach((fila, i) => {
      let col = 0
      for (const ch of fila) {
        if (/\d/.test(ch)) col += Number(ch)
        else r.add(`${'abcdefgh'[col++]}${8 - i}`)
      }
    })
  return r
}

/**
 * `escala`: en un tablero chico (el del paso a paso mide unos 350 px, 44 px por casilla) las flechas de una casilla casi
 * no se veían (revisión de la torre, C5): ahí el trazo y la punta van más gruesos. El tablero de la lección no cambia.
 */
export function CapaMarcas({ marcas, orientacion, fen, escala = 1 }: { marcas: Marca[]; orientacion: 'white' | 'black'; fen: string; escala?: number }) {
  if (!marcas.length) return null
  const llenas = ocupadas(fen)
  // las flechas en su orden: cada L evita las piezas y el camino de las de antes (puntosDeFlechas)
  const flechas = marcas.filter((m) => m.de && m.a)
  const rutas = puntosDeFlechas(flechas as { de: string; a: string; por?: string }[], orientacion, (c) => llenas.has(c))
  return (
    <svg className="capa-marcas" viewBox="0 0 8 8" aria-hidden="true" data-testid="capa-marcas">
      {marcas.filter((m) => m.en).map((m) => <Casilla key={`c-${m.en}`} m={m} orientacion={orientacion} />)}
      {flechas.map((m, i) => <Flecha key={`f-${m.de}-${m.a}`} m={m} ruta={rutas[i]!} escala={escala} />)}
    </svg>
  )
}
