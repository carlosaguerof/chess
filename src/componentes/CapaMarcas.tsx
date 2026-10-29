import type { Marca } from '../curso/tipos.ts'
import { centro, colorDe, puntosDeFlecha } from '../curso/marcas.ts'

/**
 * Las marcas encima del tablero (correcciones de la Caro-Kann, C5; reglas de las marcas v1.1): un dibujo propio, porque
 * el de chessground no hace flechas punteadas ni en L. Flecha: de la pieza a la casilla, sólida (ahora) o punteada (un
 * plan); la del caballo, en L. Casilla: iluminada. Solo verde y rojo. No se puede tocar: las jugadas pasan por debajo.
 */
const GRUESO = 0.16
const PUNTA = 0.42
/** la punta de la punteada, más chica: en una flecha de una casilla deja ver los puntos (pase visual 2) */
const PUNTA_PLAN = 0.34

/**
 * Una flecha. La punteada (un plan) es de puntos, sale un poco afuera de su pieza y lleva la punta abierta: en una
 * flecha de una sola casilla, los guiones quedaban debajo de la pieza y parecía sólida, o un puntero (pases visuales 1 y 2).
 */
function Flecha({ m, orientacion, ocupada, escala }: { m: Marca; orientacion: 'white' | 'black'; ocupada: (casilla: string) => boolean; escala: number }) {
  const puntos = puntosDeFlecha(m.de!, m.a!, orientacion, ocupada)
  const punta = (m.punteada ? PUNTA_PLAN : PUNTA) * escala
  const color = colorDe(m)
  if (m.punteada) {
    const [sx, sy] = puntos[0]!
    const [nx, ny] = puntos[1]!
    const l = Math.hypot(nx - sx, ny - sy)
    puntos[0] = [sx + ((nx - sx) / l) * 0.22, sy + ((ny - sy) / l) * 0.22]
  }
  // la línea termina donde empieza la punta, que llega cerca del centro de la casilla
  const [ax, ay] = puntos[puntos.length - 2]!
  const [bx, by] = puntos[puntos.length - 1]!
  const largo = Math.hypot(bx - ax, by - ay)
  const ux = (bx - ax) / largo
  const uy = (by - ay) / largo
  const fin: [number, number] = [bx - ux * 0.1, by - uy * 0.1]
  const base: [number, number] = [fin[0] - ux * punta, fin[1] - uy * punta]
  // la punteada, con la punta abierta y los puntos hasta ella: una punta hueca de triángulo parecía el puntero del ratón
  const linea = [...puntos.slice(0, -1), m.punteada ? [fin[0] - ux * 0.14, fin[1] - uy * 0.14] : base]
  const ancho = m.punteada ? punta * 0.65 : punta / 2
  const triangulo = [fin, [base[0] - uy * ancho, base[1] + ux * ancho], [base[0] + uy * ancho, base[1] - ux * ancho]]
  const trazo = linea.map((p) => p.join(',')).join(' ')
  const abierta = [triangulo[1]!, triangulo[0]!, triangulo[2]!].map((p) => p.join(',')).join(' ')
  return (
    <g data-marca="flecha" data-de={m.de} data-a={m.a} data-color={m.color ?? 'verde'} data-punteada={m.punteada ? 'si' : 'no'} data-puntos={puntos.length} opacity={escala > 1 ? 0.9 : 0.82}>
      {/* en un tablero chico, un borde claro debajo: la flecha se distingue también sobre el amarillo de la última jugada */}
      {escala > 1 && (
        <g stroke="#f4f4e6" strokeOpacity={0.75} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={trazo} strokeWidth={(m.punteada ? 0.12 : GRUESO) * escala + 0.07} />
          {m.punteada ? <polyline points={abierta} strokeWidth={0.075 * escala + 0.07} /> : <polygon points={triangulo.map((p) => p.join(',')).join(' ')} strokeWidth={0.07} />}
        </g>
      )}
      <polyline points={trazo} fill="none" stroke={color} strokeWidth={(m.punteada ? 0.12 : GRUESO) * escala} strokeLinecap={m.punteada ? 'butt' : 'round'} strokeLinejoin="round" strokeDasharray={m.punteada ? `${0.11 * escala} ${0.08 * escala}` : undefined} />
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
    <g data-marca="casilla" data-en={m.en} data-color={m.color ?? 'verde'}>
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
  return (
    <svg className="capa-marcas" viewBox="0 0 8 8" aria-hidden="true" data-testid="capa-marcas">
      {marcas.filter((m) => m.en).map((m) => <Casilla key={`c-${m.en}`} m={m} orientacion={orientacion} />)}
      {marcas.filter((m) => m.de && m.a).map((m) => <Flecha key={`f-${m.de}-${m.a}`} m={m} orientacion={orientacion} ocupada={(c) => llenas.has(c)} escala={escala} />)}
    </svg>
  )
}
