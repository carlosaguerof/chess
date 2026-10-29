// Las marcas del curso, frase por frase (correcciones de la Caro-Kann, C5; reglas de las marcas v1.1).
//
//   node scripts/marcas-por-jugada.ts > iterations/v3/marcas-por-jugada.md
//
// Junta cada frase que lleva marcas con la posición donde se miden, y lista qué jugadas llevan marcas y cuáles no,
// para revisar que solo sean las clave (R8). La prueba `tests/unit/correcciones-marcas.test.ts` usa lo mismo.
import { CURSOS_NUEVOS, jugadasDeVariante, lineasDe } from '../src/curso/datos.ts'
import { fotosDePasos } from '../src/curso/pasos.ts'
import { frasesDe } from '../src/curso/marcas.ts'
import { jugadaEs, lineaHasta, posicion } from '../src/curso/textos.ts'
import type { DatosCurso, Marca } from '../src/curso/tipos.ts'

/** Una frase con sus marcas, la posición donde se miden y el momento en que se ven junto con otras. */
export interface Ligada {
  donde: string
  frase: string
  marcas: Marca[]
  /** la posición donde se mide cada marca (en "Te toca", la A1 se mide contra la jugada) */
  fen: string
  /** la jugada de "Te toca" (para la A1) y la posición de antes, donde se mide */
  jugada?: { from: string; to: string }
  fenAntes?: string
  /** el color de "lo tuyo" */
  mio: 'w' | 'b'
  /** los momentos en que se ve: las marcas de un mismo momento se acumulan */
  grupos: string[]
  /** la posición que muestra el tablero en ese momento */
  fenTablero: string
}

const color = (ply: number): 'w' | 'b' => (ply % 2 === 0 ? 'w' : 'b')
const fenDe = (jugadas: string[]) => posicion(jugadas, jugadas.length).fen()

export function ligadas(c: DatosCurso): Ligada[] {
  const r: Ligada[] = []
  // la frase del rival (con su jugada en negritas si la frase no la dice) y "Te toca" de la jugada mía que sigue
  const vistas = new Set<string>()
  for (const l of lineasDe(c))
    for (let p = l.desde; p < l.jugadas.length; p++) {
      const k = l.jugadas.slice(0, p + 1).join(' ')
      if (vistas.has(k)) continue
      vistas.add(k)
      const mioEnLinea = l.lado
      const grupoTurno = `tuTurno:${l.jugadas.slice(0, p + 2).join(' ')}`
      const antes = l.jugadas.slice(0, p + 1)
      if (color(p) !== mioEnLinea) {
        const t = c.rival[k]
        if (!t?.marcas) continue
        const j = jugadaEs(l.jugadas[p]!, p)
        const frases = frasesDe(t.texto)
        frases[0] = (t.texto.includes(j) ? '' : `${j}. `) + frases[0]
        t.marcas.forEach((m, i) => m.length > 0 && r.push({ donde: `rival «${k}» frase ${i + 1}`, frase: frases[i] ?? '', marcas: m, fen: fenDe(antes), mio: mioEnLinea, grupos: [grupoTurno], fenTablero: fenDe(antes) }))
      } else {
        const t = c.mias[k]
        if (!t?.marcasDe) continue
        const jugada = posicion(l.jugadas, p).move(l.jugadas[p]!)
        const fenAntes = fenDe(l.jugadas.slice(0, p))
        const fenDespues = fenDe(antes)
        const grupoTuTurno = `tuTurno:${k}`
        const enAprender = l.tipo === 'variante'
        for (const campo of ['hace', 'porque', 'prepara', 'cuidado'] as const) {
          const marcas = t.marcasDe[campo]
          if (!marcas) continue
          const frases = frasesDe(t[campo] ?? '')
          if (campo === 'hace') frases[0] = `Te toca: ${jugadaEs(l.jugadas[p]!, p)}. ${frases[0]}`
          marcas.forEach((m, i) =>
            m.length > 0 && r.push({
              donde: `mía «${k}» ${campo} frase ${i + 1}`,
              frase: frases[i] ?? '',
              marcas: m,
              fen: fenDespues,
              jugada: { from: jugada.from, to: jugada.to },
              fenAntes,
              mio: color(p),
              // "hace" se ve en "Te toca" (Aprender) y después de jugar (Practicar, sin la A1); lo demás, después de jugar
              grupos: campo === 'hace' ? (enAprender ? [grupoTuTurno, `practicar:${k}`] : [grupoTuTurno]) : [`aprender:${k}`, `practicar:${k}`],
              fenTablero: campo === 'hace' ? fenAntes : fenDespues,
            }),
          )
        }
      }
    }
  // el plan de cada variante
  for (const v of c.variantes) {
    const fen = fenDe(jugadasDeVariante(c, v))
    for (const campo of ['tuyo', 'rival'] as const)
      v.plan.marcasDe?.[campo]?.forEach((m, i) => m.length > 0 && r.push({ donde: `plan ${v.id} ${campo} frase ${i + 1}`, frase: frasesDe(v.plan[campo])[i] ?? '', marcas: m, fen, mio: c.color, grupos: [`plan:${v.id}`], fenTablero: fen }))
  }
  // el paso a paso: las marcas de un paso se acumulan con las de antes hasta que el tablero vuelve a mover
  const pasos = [
    ...(['idea', 'estructura', 'repaso'] as const).flatMap((pieza) => c.piezas[pieza].paginas.map((p, i) => ({ nombre: `${pieza} ${i + 1}`, pa: p.pasoAPaso!, inicio: [] as string[] }))),
    ...c.variantes.map((v) => ({ nombre: `plan ${v.id} paso a paso`, pa: v.plan.pasoAPaso!, inicio: jugadasDeVariante(c, v) })),
  ]
  for (const { nombre, pa, inicio } of pasos) {
    const fotos = fotosDePasos(pa, inicio)
    let grupo = 0
    pa.pasos.forEach((p, i) => {
      if (p.jugadas?.length || p.reinicio) grupo = i
      if (p.marcas?.length) r.push({ donde: `${nombre}, paso ${i + 1}`, frase: p.frase, marcas: p.marcas, fen: fotos[i]!.fen, mio: c.color, grupos: [`paso:${nombre}:${grupo}`], fenTablero: fotos[i]!.fen })
    })
  }
  return r
}

/** Cada marca en palabras: "flecha g8→f6 (A5, roja)". */
export const enPalabras = (m: Marca) => `${m.en ? `casilla ${m.en}` : `flecha ${m.de}→${m.a}`} (${m.tipo ?? '—'}, ${m.color === 'rojo' ? 'roja' : 'verde'}${m.punteada ? ', punteada' : ''})`

/** La lista para revisar (R8): las jugadas del curso, cuáles llevan marcas y en qué frase. */
export function listaDeMarcas(c: DatosCurso): string {
  const todas = ligadas(c)
  const filas: string[] = []
  const vistas = new Set<string>()
  let conMarcas = 0
  let total = 0
  for (const l of lineasDe(c))
    for (let p = l.desde; p < l.jugadas.length; p++) {
      const k = l.jugadas.slice(0, p + 1).join(' ')
      if (vistas.has(k)) continue
      vistas.add(k)
      total++
      const quien = color(p) === l.lado ? 'tuya' : 'del rival'
      const suyas = todas.filter((x) => x.donde.includes(`«${k}»`))
      if (suyas.length) conMarcas++
      const detalle = suyas.map((x) => `${x.donde.replace(`«${k}» `, '')}: ${x.marcas.map(enPalabras).join('; ')}`).join('<br>')
      filas.push(`| ${jugadaEs(l.jugadas[p]!, p)} | ${l.nombre} | ${quien} | ${suyas.length ? 'sí' : 'no'} | ${detalle} |`)
    }
  const otras = todas.filter((x) => !x.donde.includes('«'))
  return [
    '# Las marcas del curso de la Caro-Kann, jugada por jugada',
    '',
    '> Generado con `node scripts/marcas-por-jugada.ts` (correcciones, C5; reglas de las marcas v1.1). La prueba `tests/unit/correcciones-marcas.test.ts` revisa que esté al día. Sirve para revisar que solo lleven marcas las jugadas clave (R8).',
    '',
    `**Jugadas con marcas: ${conMarcas} de ${total}.** Más ${otras.length} frases del plan y del paso a paso.`,
    '',
    '| Jugada | Línea | De quién | Marcas | En qué frase |',
    '|---|---|---|---|---|',
    ...filas,
    '',
    '## El plan y el paso a paso',
    '',
    '| Dónde | Frase | Marcas |',
    '|---|---|---|',
    ...otras.map((x) => `| ${x.donde} | ${x.frase} | ${x.marcas.map(enPalabras).join('; ')} |`),
    '',
  ].join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(listaDeMarcas(CURSOS_NUEVOS['caro-kann:b']!))
