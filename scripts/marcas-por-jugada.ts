// Las marcas del curso, frase por frase (correcciones de la Caro-Kann, C5; reglas de las marcas v1.3, 2026-10-30).
//
//   node scripts/marcas-por-jugada.ts > iterations/v3/marcas-por-jugada.md
//   node scripts/marcas-por-jugada.ts italiana:w > iterations/v4/marcas-por-jugada-italiana.md (dónde va cada curso: `LISTA_DE_MARCAS`, en `tests/unit/correcciones-marcas.test.ts`)
//
// Junta cada frase que lleva marcas con la posición donde se miden, y lista qué jugadas llevan marcas y cuáles no,
// para revisar que solo se marque lo que no se ve solo (R8). La prueba `tests/unit/correcciones-marcas.test.ts` usa lo mismo.
import { CURSOS_NUEVOS, jugadasDeVariante, lineasDe } from '../src/curso/datos.ts'
import { fotosDePasos } from '../src/curso/pasos.ts'
import { frasesDe, marcasDelPaso } from '../src/curso/marcas.ts'
import { jugadaEs, lineaHasta, posicion } from '../src/curso/textos.ts'
import { todosLosVer } from '../src/curso/ver.ts'
import type { DatosCurso, Marca, PasoAPaso } from '../src/curso/tipos.ts'

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
  /**
   * solo en el paso a paso (reglas v1.4): las jugadas que el tablero hizo en ese paso, de dónde a dónde y qué capturó
   * (la A9 es la flecha de una de ellas), y si el tablero enseña solo los peones (la A8 tiene que caer en uno)
   */
  paso?: { hechas: { from: string; to: string; color: 'w' | 'b'; captured?: string }[]; soloPeones: boolean }
}

/**
 * Las frases de un paso a paso con sus marcas. Cada una va en los momentos en que se ve: el paso suyo y los de después
 * que la siguen enseñando (`marcasDelPaso`, la misma cuenta de la ventana), para medir juntas (R2, R3) las que se ven
 * juntas.
 */
function ligadasDelPaso(nombre: string, pa: PasoAPaso, inicio: string[], mio: 'w' | 'b'): Ligada[] {
  const fotos = fotosDePasos(pa, inicio)
  const r: Ligada[] = pa.pasos.map((p, i) => ({
    donde: `${nombre}, paso ${i + 1}`,
    frase: p.frase,
    marcas: p.marcas ?? [],
    fen: fotos[i]!.fen,
    mio,
    grupos: [] as string[],
    fenTablero: fotos[i]!.fen,
    paso: { hechas: fotos[i]!.hechas.map((m) => ({ from: m.from, to: m.to, color: m.color, captured: m.captured })), soloPeones: fotos[i]!.soloPeones },
  }))
  pa.pasos.forEach((p, i) => {
    const seVen = marcasDelPaso(pa, i)
    // las de este paso y las de los pasos de antes que se siguen viendo: van en el momento de este paso
    for (let j = i; j >= 0; j--) {
      const suyas = pa.pasos[j]!.marcas ?? []
      if (suyas.length && suyas.some((m) => seVen.includes(m))) r[j]!.grupos.push(`paso:${nombre}:${i}`)
      if (j < i && !suyas.some((m) => seVen.includes(m))) break
    }
  })
  return r.filter((x) => x.marcas.length > 0)
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
              // v1.3: "hace" es "Te toca" en Aprender, antes de jugar, y ahí no lleva marcas; se ve después de jugar en
              // Practicar ("qué hace"). Lo demás, después de jugar en las dos vueltas
              grupos: campo === 'hace' ? (enAprender ? [`practicar:${k}`] : []) : [`aprender:${k}`, `practicar:${k}`],
              fenTablero: fenDespues,
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
  for (const { nombre, pa, inicio } of pasos) r.push(...ligadasDelPaso(nombre, pa, inicio, c.color))
  // "Ver qué pasaría": las de cada paso, como en el paso a paso; cada frase, su propia ventana
  for (const v of todosLosVer(c)) {
    const nombre = `ver de ${v.clave}, ${v.campo} ${v.i}`
    const fotos = fotosDePasos({ pasos: v.ver.pasos }, v.inicio)
    let grupo = 0
    v.ver.pasos.forEach((p, i) => {
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
    (c.fichasDe ?? c.id) === 'caro-kann:b' ? '# Las marcas del curso de la Caro-Kann, jugada por jugada' : `# Las marcas del curso «${c.nombre}», jugada por jugada`,
    '',
    '> Generado con `node scripts/marcas-por-jugada.ts` (correcciones, C5; reglas de las marcas v1.3, 2026-10-30). La prueba `tests/unit/correcciones-marcas.test.ts` revisa que esté al día. Sirve para revisar que solo se marque lo que no se ve solo (R8): lo del rival en su frase, antes de tu jugada; lo tuyo, después. Una marca de una frase de tu jugada se ve después de jugarla; las de "hace", solo en Practicar.',
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

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(listaDeMarcas(CURSOS_NUEVOS[process.argv[2] ?? 'caro-kann:b']!))
