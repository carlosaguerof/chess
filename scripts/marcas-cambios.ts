// Qué momentos de la lección cambiaron sus marcas con las reglas v1.3 (2026-10-30), contra el curso de antes.
//
//   git show ad72f10:conocimiento/cursos/caro-kann.json > /tmp/antes.json
//   node scripts/marcas-cambios.ts /tmp/antes.json > iterations/v3/capturas/marcas-v1.3/cambios.json
//
// La segunda vuelta de la revisión de la torre (lo que cambió desde la primera, y cada momento con una flecha punteada
// de una casilla, que ahora se dibuja a la medida), con la lista de la primera vuelta guardada como cambios-1.json:
//
//   node scripts/marcas-cambios.ts /tmp/antes.json --vuelta2 iterations/v3/capturas/marcas-v1.3/cambios-1.json \
//     > iterations/v3/capturas/marcas-v1.3/cambios-2.json
//
// "Antes" son los datos de antes con lo que se veía con las reglas v1.1 (en "Te toca", la frase del rival y la tuya;
// después de jugar, la explicación; en Practicar, también "qué hace" sin la A1). "Después" es lo que se ve hoy
// (`marcasDelMomento`, `marcasDelPaso`). La prueba de las capturas (`tests/e2e/correcciones-marcas.spec.ts`, `@marcas`)
// saca una captura de cada momento de esta lista, en los dos perfiles, con su índice.
import { readFileSync } from 'node:fs'
import { CURSOS_NUEVOS, jugadasDeVariante, lineasDe, misJugadas, textoMio, textoRival } from '../src/curso/datos.ts'
import { empezar, type EstadoCiclo, type Vuelta } from '../src/curso/ciclo.ts'
import { marcasDelMomento, marcasDelPaso } from '../src/curso/marcas.ts'
import { frasesDespues } from '../src/curso/adelantar.ts'
import { frasesDe, jugadaEs } from '../src/curso/textos.ts'
import { enPalabras } from './marcas-por-jugada.ts'
import type { CampoMio, DatosCurso, LineaCurso, Marca, PasoAPaso } from '../src/curso/tipos.ts'

/** Un momento con marcas que cambiaron: dónde abrirlo, sus frases y las marcas de antes y de después. */
export interface Cambio {
  id: string
  tipo: 'te-toca' | 'despues-aprender' | 'despues-practicar' | 'plan' | 'paso'
  /** la línea y la jugada mía (en un plan, la línea; en un paso a paso, la página o el plan) */
  linea?: string
  ply?: number
  pieza?: 'idea' | 'estructura' | 'repaso'
  pagina?: number
  paso?: number
  /** en qué otras líneas se ve igual */
  tambien: string[]
  frases: { texto: string; antes: string[]; despues: string[] | null }[]
  antes: string[]
  despues: string[]
  /** en la segunda vuelta: por qué entra (cambió desde la primera, o trae una punteada de una casilla) */
  motivo?: string
}

const palabras = (ms: Marca[]) => ms.map(enPalabras)
const igual = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))
const todas = (m?: Marca[][]) => (m ?? []).flat()

/** Los momentos cuyas marcas cambiaron (con `todos`, también los que no cambiaron). */
export function cambios(antes: DatosCurso, hoy: DatosCurso, todos = false): Cambio[] {
  const r: Cambio[] = []
  const agregar = (x: Omit<Cambio, 'tambien'>, linea?: string) => {
    if (!todos && igual(x.antes, x.despues)) return
    const ya = r.find((y) => y.id === x.id && igual(y.despues, x.despues) && igual(y.antes, x.antes))
    if (ya) {
      if (linea) ya.tambien.push(linea)
      return
    }
    r.push({ ...x, tambien: [] })
  }
  for (const l of lineasDe(hoy).filter((x) => x.tipo === 'variante')) {
    const la = lineasDe(antes).find((x) => x.id === l.id)!
    for (const ply of misJugadas(l)) {
      const k = l.jugadas.slice(0, ply + 1).join(' ')
      const j = jugadaEs(l.jugadas[ply]!, ply)
      const ma = textoMio(antes, la.jugadas, ply)!
      // Aprender, en tu turno: la frase del rival y "Te toca"
      const ra = textoRival(antes, la.jugadas, ply - 1)
      const rh = textoRival(hoy, l.jugadas, ply - 1)
      const turno: EstadoCiclo = { ...empezar(l, 'aprender'), ply, momento: 'tuTurno' }
      const fr = (t: string | undefined, m: Marca[][] | undefined, n: Marca[][] | undefined, prefijo = '') => (t ? frasesDe(t).map((f, i) => ({ texto: prefijo && i === 0 ? `${prefijo}${f}` : f, antes: palabras(m?.[i] ?? []), despues: palabras(n?.[i] ?? []) })) : [])
      agregar(
        {
          id: `te-toca ${k}`,
          tipo: 'te-toca',
          linea: l.id,
          ply,
          frases: [...fr(rh?.texto, ra?.marcas, rh?.marcas, ply > l.desde ? `${jugadaEs(l.jugadas[ply - 1]!, ply - 1)}. ` : ''), ...fr(ma.hace, ma.marcasDe?.hace, [], `Te toca: ${j}. `)].filter((f) => f.antes.length || f.despues.length),
          antes: palabras([...todas(ra?.marcas), ...todas(ma.marcasDe?.hace)]),
          despues: palabras(marcasDelMomento(hoy, l, turno)),
        },
        l.id,
      )
      // después de tu jugada, en cada vuelta
      for (const vuelta of ['aprender', 'practicar'] as Vuelta[]) {
        const campos: CampoMio[] = vuelta === 'practicar' ? ['hace', 'porque', 'prepara', 'cuidado'] : ['porque', 'prepara', 'cuidado']
        const despues = marcasDelMomento(hoy, l, { ...empezar(l, vuelta), ply: ply + 1, momento: 'leer', ultima: ply })
        const vistas = frasesDespues(hoy, l, vuelta, ply)
        const mh = textoMio(hoy, l.jugadas, ply)!
        const frases = campos.flatMap((campo) =>
          frasesDe(mh[campo] ?? '').map((f, i) => {
            const a = (ma.marcasDe?.[campo]?.[i] ?? []).filter((m) => m.tipo !== 'A1')
            const vista = vistas.find((x) => x.campo === campo && x.i === i)
            return { texto: f, antes: palabras(a), despues: vista ? palabras(vista.marcas.filter((m) => despues.some((d) => d.de === m.de && d.a === m.a && d.en === m.en))) : null }
          }),
        )
        agregar(
          {
            id: `despues-${vuelta} ${k}`,
            tipo: vuelta === 'aprender' ? 'despues-aprender' : 'despues-practicar',
            linea: l.id,
            ply,
            frases: frases.filter((f) => f.antes.length || f.despues?.length),
            antes: palabras(campos.flatMap((campo) => todas(ma.marcasDe?.[campo]).filter((m) => m.tipo !== 'A1'))),
            despues: palabras(despues),
          },
          l.id,
        )
      }
    }
    // el plan del final
    if (l.variante) {
      const va = antes.variantes.find((v) => v.id === l.variante!.id)!
      const plan = marcasDelMomento(hoy, l, { ...empezar(l, 'aprender'), ply: l.jugadas.length, momento: 'plan' })
      agregar({
        id: `plan ${l.id}`,
        tipo: 'plan',
        linea: l.id,
        frases: (['tuyo', 'rival'] as const).flatMap((campo) => frasesDe(l.variante!.plan[campo]).map((f, i) => ({ texto: f, antes: palabras(va.plan.marcasDe?.[campo]?.[i] ?? []), despues: palabras(l.variante!.plan.marcasDe?.[campo]?.[i] ?? []) }))).filter((f) => f.antes.length || f.despues.length),
        antes: palabras([...todas(va.plan.marcasDe?.tuyo), ...todas(va.plan.marcasDe?.rival)]),
        despues: palabras(plan),
      })
    }
  }
  // el paso a paso: cada paso
  const pasos = (pa: PasoAPaso, pb: PasoAPaso, base: Omit<Cambio, 'id' | 'frases' | 'antes' | 'despues' | 'tambien' | 'paso'>, id: string) =>
    pb.pasos.forEach((p, i) =>
      agregar({ ...base, id: `${id}, paso ${i + 1}`, paso: i, frases: [{ texto: p.frase, antes: palabras(pa.pasos[i]?.marcas ?? []), despues: palabras(p.marcas ?? []) }], antes: palabras(marcasDelPaso(pa, i)), despues: palabras(marcasDelPaso(pb, i)) }),
    )
  for (const pieza of ['idea', 'estructura', 'repaso'] as const) hoy.piezas[pieza].paginas.forEach((pg, n) => pasos(antes.piezas[pieza].paginas[n]!.pasoAPaso!, pg.pasoAPaso!, { tipo: 'paso', pieza, pagina: n }, `paso ${pieza} ${n + 1}`))
  for (const v of hoy.variantes) pasos(antes.variantes.find((x) => x.id === v.id)!.plan.pasoAPaso!, v.plan.pasoAPaso!, { tipo: 'paso', linea: `v:${v.id}` }, `paso plan ${v.id}`)
  return r
}

/** La línea donde se abre un momento (para las capturas). */
export const lineaDe = (c: DatosCurso, id: string): LineaCurso => lineasDe(c).find((l) => l.id === id)!
export { jugadasDeVariante }

/** Una flecha punteada de una casilla a la de junto, en palabras ("flecha h4→h5 (A7, roja, punteada)"). */
const punteadaCorta = (p: string) => {
  const m = /^flecha ([a-h][1-8])→([a-h][1-8]) \(.*punteada\)$/.exec(p)
  return !!m && Math.max(Math.abs(m[1]!.charCodeAt(0) - m[2]!.charCodeAt(0)), Math.abs(Number(m[1]![1]) - Number(m[2]![1]))) === 1
}

/**
 * La segunda vuelta: lo que cambió desde la lista de la primera (`vuelta1`), y cada momento que trae una flecha punteada
 * de una casilla (cambie o no).
 */
export function vuelta2(antes: DatosCurso, hoy: DatosCurso, vuelta1: Cambio[]): Cambio[] {
  const llave = (x: Cambio) => `${x.id}|${[...x.despues].sort().join(';')}`
  const ya = new Set(vuelta1.map(llave))
  const nuevos = cambios(antes, hoy).filter((x) => !ya.has(llave(x)))
  const cortas = cambios(antes, hoy, true).filter((x) => x.despues.some(punteadaCorta))
  const r: Cambio[] = []
  for (const x of [...nuevos, ...cortas]) {
    const motivo = nuevos.some((n) => llave(n) === llave(x)) ? (x.despues.some(punteadaCorta) ? 'cambió y trae una punteada de una casilla' : 'cambió') : 'trae una punteada de una casilla'
    if (!r.some((y) => llave(y) === llave(x))) r.push({ ...x, motivo })
  }
  return r
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const antes = JSON.parse(readFileSync(process.argv[2]!, 'utf8')) as DatosCurso
  const hoy = CURSOS_NUEVOS['caro-kann:b']!
  const i = process.argv.indexOf('--vuelta2')
  const lista = i > 0 ? vuelta2(antes, hoy, JSON.parse(readFileSync(process.argv[i + 1]!, 'utf8')) as Cambio[]) : cambios(antes, hoy)
  process.stdout.write(JSON.stringify(lista, null, 2) + '\n')
}
