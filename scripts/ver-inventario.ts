// El inventario de "Ver qué pasa" (2026-10-30): cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso, con
// su "Ver" o con el porqué no lo lleva.
//
//   node scripts/ver-inventario.ts > iterations/v3/ver-que-pasa-inventario.md
//
// Por qué no: `iterations/v3/ver-que-pasa-sin-ver.json`, frase por frase, con una de las razones de `RAZONES`. La prueba
// `tests/unit/ver-que-pasa.test.ts` revisa que cada frase esté de un lado o del otro, y que esta lista esté al día.
import { readFileSync } from 'node:fs'
import { CURSOS_NUEVOS, lineasDe, misJugadas } from '../src/curso/datos.ts'
import { mostrarTexto } from '../src/ajedrez/mostrar.ts'
import { frasesDe, jugadaEs } from '../src/curso/textos.ts'
import { todosLosVer, verAdelanta, verDelError, verDespues } from '../src/curso/ver.ts'
import type { DatosCurso, VerQuePasa } from '../src/curso/tipos.ts'

/** Por qué una frase no lleva "Ver". */
export const RAZONES = {
  explica: 'explica la jugada que ya está en la línea, sin una alternativa',
  plan: 'dice qué sigue (un plan), no qué pasaría con otra cosa',
  linea: 'lo que dice se juega en las jugadas que siguen de la línea',
  'sin-consecuencia': 'dice una alternativa, pero sin una consecuencia que se enseñe en el tablero',
  'no-se-sostiene': 'la consecuencia no se sostiene con el motor',
} as const
export type Razon = keyof typeof RAZONES

/** Una frase del curso: la clave de la jugada, su campo y su lugar (en `errores`, la jugada equivocada). */
export interface FraseInventario {
  llave: string
  clave: string
  campo: 'porque' | 'prepara' | 'cuidado' | 'errores'
  i: number | string
  frase: string
}

export const llaveDe = (clave: string, campo: string, i: number | string) => `${clave} | ${campo} | ${i}`

export function frasesDelCurso(c: DatosCurso): FraseInventario[] {
  const r: FraseInventario[] = []
  for (const [clave, m] of Object.entries(c.mias)) {
    for (const campo of ['porque', 'prepara', 'cuidado'] as const) frasesDe(m[campo] ?? '').forEach((frase, i) => r.push({ llave: llaveDe(clave, campo, i), clave, campo, i, frase }))
    for (const [san, frase] of Object.entries(m.errores ?? {})) r.push({ llave: llaveDe(clave, 'errores', san), clave, campo: 'errores', i: san, frase })
  }
  return r
}

export const sinVer = (): Record<string, Razon> => JSON.parse(readFileSync('iterations/v3/ver-que-pasa-sin-ver.json', 'utf8')) as Record<string, Razon>

/** La línea de un "Ver", en un renglón: "4...e6 5.g4 ♗e4 6.f3 ♗g6 7.h5". */
function lineaDe(ver: VerQuePasa, inicio: string[]): string {
  let ply = inicio.length
  const r: string[] = []
  for (const p of ver.pasos) {
    if (p.reinicio) {
      r.push('·')
      ply = inicio.length + p.reinicio.length
    }
    for (const s of p.jugadas ?? []) r.push(jugadaEs(s, ply++))
  }
  return mostrarTexto(r.join(' '), 'figuras')
}

/** En qué vueltas sale un "Ver": Aprender siempre; en Practicar, las líneas donde se muestra y no adelanta nada. */
function dondeSale(c: DatosCurso, v: ReturnType<typeof todosLosVer>[number]): string {
  const practicar: string[] = []
  const ocultos: string[] = []
  const conLineas = lineasDe(c).filter((l) => l.tipo === 'variante' && misJugadas(l).some((p) => l.jugadas.slice(0, p + 1).join(' ') === v.clave))
  for (const l of conLineas) {
    const ply = v.clave.split(' ').length - 1
    const en = v.campo === 'errores' ? verDelError(c, l, 'practicar', ply, v.i as string) : verDespues(c, l, 'practicar', ply)
    const ventana = en?.pa.pasos.some((p) => p.titulo === v.frase) ?? false
    ;(ventana ? practicar : ocultos).push(l.nombre)
  }
  const nombres = (x: string[]) => mostrarTexto(x.join(', '), 'figuras')
  if (!ocultos.length) return 'Aprender y Practicar'
  if (!practicar.length) return 'solo Aprender'
  return `Aprender; en Practicar, solo en ${nombres(practicar)}`
}

export function listaDelInventario(c: DatosCurso): string {
  const frases = frasesDelCurso(c)
  const vers = todosLosVer(c)
  const razones = sinVer()
  const conVer = new Map(vers.map((v) => [llaveDe(v.clave, v.campo, v.i), v]))
  const nombre = (x: FraseInventario) => {
    const n = x.clave.split(' ').length - 1
    return mostrarTexto(`${jugadaEs(x.clave.split(' ')[n]!, n)}${x.campo === 'errores' ? ` (si juegas ${jugadaEs(x.i as string, n)})` : ''}`, 'figuras')
  }
  const texto = (t: string) => mostrarTexto(t, 'figuras').replace(/\|/g, '\\|')
  const cuenta = (k: Razon) => frases.filter((x) => razones[x.llave] === k).length
  const conteo = (Object.keys(RAZONES) as Razon[]).map((k) => `${cuenta(k)} porque ${RAZONES[k]}`).join('; ')
  const adelantan = vers.filter((v) => lineasDe(c).some((l) => l.tipo === 'variante' && misJugadas(l).some((p) => l.jugadas.slice(0, p + 1).join(' ') === v.clave && verAdelanta(l, v.campo === 'errores' ? p : p + 1, v.inicio, v.ver).length)))
  return [
    '# El inventario de "Ver qué pasa"',
    '',
    '> Generado con `node scripts/ver-inventario.ts` (2026-10-30). La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso de la Caro-Kann: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.',
    '',
    `**${frases.length} frases: ${vers.length} con "Ver"; ${frases.length - vers.length} sin él** (${conteo}). ${adelantan.length} de las ${vers.length} contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.`,
    '',
    '## Con "Ver"',
    '',
    '| Jugada | Campo | Frase | La línea | Dónde sale |',
    '|---|---|---|---|---|',
    ...frases.flatMap((x) => {
      const v = conVer.get(x.llave)
      return v ? [`| ${nombre(x)} | ${x.campo} | ${texto(x.frase)} | ${lineaDe(v.ver, v.inicio)} | ${dondeSale(c, v)} |`] : []
    }),
    '',
    '## Sin "Ver"',
    '',
    '| Jugada | Campo | Frase | Por qué no |',
    '|---|---|---|---|',
    ...frases.flatMap((x) => (conVer.has(x.llave) ? [] : [`| ${nombre(x)} | ${x.campo} | ${texto(x.frase)} | ${RAZONES[razones[x.llave]!] ?? '—'} |`])),
    '',
  ].join('\n')
}

if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(listaDelInventario(CURSOS_NUEVOS['caro-kann:b']!))
