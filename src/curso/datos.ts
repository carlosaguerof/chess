import { Chess } from 'chess.js'
import caroKann from '../../conocimiento/cursos/caro-kann.json' with { type: 'json' }
import caroKannEstructuras from '../../conocimiento/cursos/caro-kann-estructuras.json' with { type: 'json' }
import alapin from '../../conocimiento/cursos/alapin.json' with { type: 'json' }
import italiana from '../../conocimiento/cursos/italiana.json' with { type: 'json' }
import eslava from '../../conocimiento/cursos/eslava.json' with { type: 'json' }
import otrosNegras from '../../conocimiento/cursos/otros-negras.json' with { type: 'json' }
import avanceCaroKann from '../../conocimiento/cursos/avance-caro-kann.json' with { type: 'json' }
import avanceFrancesa from '../../conocimiento/cursos/avance-francesa.json' with { type: 'json' }
import escandinava from '../../conocimiento/cursos/escandinava.json' with { type: 'json' }
import { BASE } from '../base/base.ts'
import type { Leccion } from '../cursos/modelo.ts'
import type { AvanceCurso } from './avance.ts'
import { componerCurso } from './capas.ts'
import { cursoQueQueda } from './queda.ts'
import type { Repertorio } from '../repertorio/modelo.ts'
import type { CapaCurso, DatosCurso, JugadaMia, JugadaRival, LineaCurso, VarianteCurso } from './tipos.ts'

const caroKannCurso = caroKann as unknown as DatosCurso

/**
 * Los cursos del escalón 1 (diseño §3): la Caro-Kann (con negras), organizada por estructuras (`specs/cursos.md` §6).
 * El piloto de antes sigue aquí, sin verse: es la base de la capa y sus lecciones son las fichas de Repaso de esas
 * líneas; su dirección lleva al que queda (`queda.ts`). Los demás cursos siguen con la lección de antes
 * (`pantallas/Leccion.tsx`).
 */
export const CURSOS_NUEVOS: Record<string, DatosCurso> = {
  'caro-kann:b': caroKannCurso,
  'caro-kann-estructuras:b': componerCurso(caroKannCurso, caroKannEstructuras as unknown as CapaCurso),
  // la Alapin contra la Siciliana, por estructuras (2026-11-25): un archivo completo, con sus secciones
  'siciliana:w': alapin as unknown as DatosCurso,
  // la Italiana, por estructuras (2026-11-25): un solo archivo, con sus secciones
  'italiana:w': italiana as unknown as DatosCurso,
  // la Eslava, por estructuras (2026-11-25): un solo archivo, con sus secciones (specs/cursos.md §6)
  'eslava:b': eslava as unknown as DatosCurso,
  // ...c6 + ...d5 contra lo demás, por estructuras (2026-11-25)
  'otros-negras:b': otrosNegras as unknown as DatosCurso,
  // los cursos por estructuras (2026-11-25): un archivo completo cada uno, con sus secciones
  'caro-kann:w': avanceCaroKann as unknown as DatosCurso,
  'francesa:w': avanceFrancesa as unknown as DatosCurso,
  'escandinava:w': escandinava as unknown as DatosCurso,
}

export const cursoNuevo = (id: string): DatosCurso | undefined => CURSOS_NUEVOS[id]

/**
 * La dirección de un curso que dejó de verse, en el curso que queda (`queda.ts`): "#/curso/<antes>/…" y
 * "#/leccion/<antes>/<n>" llevan a lo mismo en el que queda (la misma línea, la misma pieza de leer, Errores y
 * trampas, o su página), nunca a una página vacía. Para las demás direcciones, `undefined`.
 */
export function caminoQueQueda(partes: string[]): string | undefined {
  const [primera, segunda, ...resto] = partes
  if ((primera !== 'curso' && primera !== 'leccion') || !segunda) return undefined
  const id = decodeURIComponent(segunda)
  const queda = cursoQueQueda(id)
  const nuevo = queda ? cursoNuevo(queda) : undefined
  if (!queda || !nuevo) return undefined
  const pagina = `/curso/${encodeURIComponent(queda)}`
  const linea = (lid: string) => (lineaPorId(nuevo, lid) ? `${pagina}/linea/${encodeURIComponent(lid)}` : pagina)
  // "#/leccion/<curso>/<n>" y "#/curso/<curso>/<n>" cuentan las variantes del curso de antes
  const porNumero = (n: string | undefined) => {
    const v = cursoNuevo(id)?.variantes[Number(n ?? 0)]
    return v ? linea(`v:${v.id}`) : pagina
  }
  if (primera === 'leccion') return porNumero(resto[0])
  if (resto[0] === 'linea' && resto[1]) return linea(decodeURIComponent(resto[1]))
  if (resto[0] === 'leer' && ['idea', 'estructura', 'repaso'].includes(resto[1] ?? '')) return `${pagina}/leer/${resto[1]}`
  if (resto[0] === 'errores') return `${pagina}/errores`
  if (resto[0] !== undefined && /^\d+$/.test(resto[0])) return porNumero(resto[0])
  return pagina
}

const seccionOpcionalDe = (c: DatosCurso, id: string) => c.secciones?.find((s) => s.opcional && s.variantes.includes(id))

/** ¿Esta variante no cuenta para terminar el curso? Sin `secciones`, todas cuentan. */
export const esOpcional = (c: DatosCurso, id: string): boolean => !!seccionOpcionalDe(c, id)

/** Las variantes que cuentan para terminar el curso: "N de M" y "Seguir" solo pasan por estas. */
export const obligatorias = (c: DatosCurso): VarianteCurso[] => c.variantes.filter((v) => !esOpcional(c, v.id))

/** Las variantes opcionales, en su orden. */
export const opcionales = (c: DatosCurso): VarianteCurso[] => c.variantes.filter((v) => esOpcional(c, v.id))

/** "3 de 16 variantes": cuenta solo las que cuentan para terminar el curso. */
export function avanceVariantes(c: DatosCurso, a: Pick<AvanceCurso, 'variantes'>): string {
  const vs = obligatorias(c)
  return `${vs.filter((v) => a.variantes[v.id]?.terminada).length} de ${vs.length} variantes`
}

/** La línea de una variante: la de su variante de la base (fila de la fuente + continuación). */
export function jugadasDeVariante(c: DatosCurso, v: VarianteCurso): string[] {
  const a = BASE.aperturas.find((x) => x.id === c.apertura)
  const b = a?.variantes.find((x) => x.id === v.base)
  if (!b) throw new Error(`curso ${c.id}: la variante ${v.id} apunta a ${v.base}, que no está en la base`)
  return b.jugadas
}

/**
 * Lo que comparten todas las líneas del curso, desde 1.e4: la posición del tablero de arriba de su página (1.e4 c6 en
 * la Caro-Kann; 1.e4 e6 2.d4 d5 3.e5 en el Avance contra la Francesa).
 */
export function troncoDelCurso(c: DatosCurso): string[] {
  const ls = c.variantes.map((v) => jugadasDeVariante(c, v))
  const t: string[] = []
  for (let i = 0; ls.length && ls.every((l) => l[i] !== undefined && l[i] === ls[0]![i]); i++) t.push(ls[0]![i]!)
  return t
}

/**
 * El id de lección de una variante, como los de antes: "caro-kann:b/b:caro-kann/curso-avance-short". Un curso que sale
 * de otro usa el del curso de origen: la misma línea tiene una sola ficha de Repaso.
 */
export const leccionIdDe = (c: DatosCurso, v: VarianteCurso) => `${c.fichasDe ?? c.id}/${c.color}:${c.apertura}/${v.base}`

export function lineasDe(c: DatosCurso): LineaCurso[] {
  return [
    // una opcional no lleva `leccionId`: al terminarla, no entra al Repaso de hoy
    ...c.variantes.map((v): LineaCurso => ({ id: `v:${v.id}`, tipo: 'variante', nombre: v.nombre, jugadas: jugadasDeVariante(c, v), desde: v.desde, lado: c.color, intro: v.intro, ...(esOpcional(c, v.id) ? {} : { leccionId: leccionIdDe(c, v) }), variante: v })),
    ...c.piezas.errores.lista.map((e): LineaCurso => ({ id: `e:${e.id}`, tipo: 'error', nombre: e.titulo, jugadas: e.jugadas, desde: e.desde, lado: e.lado, intro: e.intro, error: e })),
  ]
}

export function lineaPorId(c: DatosCurso, id: string): LineaCurso | undefined {
  return lineasDe(c).find((l) => l.id === id)
}

/**
 * Las líneas con las que camina una lección: "Variante N de M", "Opcional N de M" y "Siguiente variante" se cuentan
 * aquí. Las obligatorias van con las obligatorias, las opcionales con las opcionales y los «¿Y si…?» entre ellos.
 */
export function grupoDeLinea(c: DatosCurso, l: LineaCurso): LineaCurso[] {
  if (l.tipo === 'error') return lineasDe(c).filter((x) => x.tipo === 'error')
  const opcional = esOpcional(c, l.variante!.id)
  return lineasDe(c).filter((x) => x.tipo === 'variante' && esOpcional(c, x.variante!.id) === opcional)
}

/**
 * Los nombres de antes de las lecciones renombradas el 2026-11-25 (cierre de los cursos: en Practicar, el nombre no
 * adelanta tu jugada), por curso y variante. El registro guarda el nombre de la línea; con esto, un fallo guardado con el
 * nombre de antes sigue regresando la ficha del Repaso. La Clásica de la Caro-Kann ya estaba publicada.
 */
export const NOMBRES_DE_ANTES: Record<string, Record<string, string[]>> = {
  'caro-kann:b': { clasica: ['Clásica: 3.Cc3'] },
  'caro-kann:w': { af5: ['3...Af5 4.c3'] },
  'italiana:w': { 'dos-caballos-d3': ['Dos Caballos: 4.d3'], 'la-bourdonnais': ['3...Ac5 4.c3 d6 (La Bourdonnais)'], principal: ['3...Ac5 4.c3 Cf6 (Giuoco Pianissimo)'] },
  'eslava:b': { checa: ['Checa: 5.a4'], 'checa-clasica': ['Checa: 9.De2 (Sämisch)'], 'checa-carlsbad': ['Checa: 6.Ce5 (Carlsbad)'] },
  'otros-negras:b': { 'reti-bogoljubow': ['Réti: 2.c4 c6 3.b3'], 'inglesa-caro-kann': ['Inglesa: 1.c4 c6 2.Cc3'], 'inglesa-anglo-eslava-g3': ['Inglesa: 2.Cf3 d5 3.g3'], 'inglesa-gurevich': ['Inglesa: 2.Cf3 d5 3.e3'] },
}

/** Las variantes como lecciones del modelo de antes: así el Repaso, el inicio y "Practicar esta línea" las usan igual. */
export function leccionesDe(c: DatosCurso): Leccion[] {
  return c.variantes.map((v) => {
    const b = BASE.aperturas.find((x) => x.id === c.apertura)!.variantes.find((x) => x.id === v.base)!
    const antes = NOMBRES_DE_ANTES[c.fichasDe ?? c.id]?.[v.id]
    return { id: leccionIdDe(c, v), cursoId: c.fichasDe ?? c.id, nombre: v.nombre, familia: b.familia, plan: v.plan.tuyo, autorPlan: 'ia', frecuencia: v.frecuencia, color: c.color, jugadas: b.jugadas, ingles: b.nombreIngles, eco: b.eco, ...(antes ? { nombresAntes: antes } : {}) }
  })
}

const clave = (jugadas: string[], hasta: number) => jugadas.slice(0, hasta).join(' ')

/** La explicación de la jugada número `ply` (0 = 1.e4) de una línea, si es mía. */
export const textoMio = (c: DatosCurso, jugadas: string[], ply: number): JugadaMia | undefined => c.mias[clave(jugadas, ply + 1)]
export const textoRival = (c: DatosCurso, jugadas: string[], ply: number): JugadaRival | undefined => c.rival[clave(jugadas, ply + 1)]

const fenCorto = (fen: string) => fen.split(' ').slice(0, 4).join(' ')
let indice: Map<string, Set<string>> | null = null

/**
 * Las jugadas que la base trae en una posición (de cualquier apertura y variante): una jugada mía que está aquí y no
 * es la de la lección es "buena, pero esta lección enseña otra línea" (diseño §4).
 */
export function jugadasDeLaBaseEn(fen: string): Set<string> {
  if (!indice) {
    indice = new Map()
    for (const a of BASE.aperturas)
      for (const v of a.variantes) {
        const ch = new Chess()
        for (const s of v.jugadas) {
          const k = fenCorto(ch.fen())
          if (!indice.has(k)) indice.set(k, new Set())
          indice.get(k)!.add(s)
          ch.move(s)
        }
      }
  }
  return indice.get(fenCorto(fen)) ?? new Set()
}

/** El número de mis jugadas en una línea, desde `desde`. */
export function misJugadas(l: Pick<LineaCurso, 'jugadas' | 'desde' | 'lado'>): number[] {
  const r: number[] = []
  for (let i = l.desde; i < l.jugadas.length; i++) if ((i % 2 === 0 ? 'w' : 'b') === l.lado) r.push(i)
  return r
}

/** Los cursos de una apertura y color que dividen sus lecciones en obligatorias y opcionales (los que traen `secciones`). */
const conSecciones = (apertura: string, color: string): DatosCurso[] => Object.values(CURSOS_NUEVOS).filter((c) => c.secciones && c.apertura === apertura && c.color === color)

/**
 * ¿Es una lección opcional? La lección de la variante `base` de la base, en una apertura y color, es opcional si está en
 * la sección opcional de su curso, sea cual sea el curso (`specs/cursos.md` §6). Es la única condición: el Repaso
 * (`cursos()` marca `opcional`) y Refuerza (`soloObligatorias`) la usan, y los cursos nuevos también.
 */
/**
 * ¿Esta variante de la base es lección de algún curso (obligatoria u opcional)? La guía en partida la usa para desempatar:
 * con la misma frecuencia, gana la línea que el curso enseña (orchestrator, 2026-11-25: contra 1.g3 salía el plan de otra
 * variante porque era la primera de la lista).
 */
export function esLeccionDeCurso(apertura: string, color: string, base: string): boolean {
  return Object.values(CURSOS_NUEVOS).some((c) => c.apertura === apertura && c.color === color && c.variantes.some((v) => v.base === base))
}

export function esLeccionOpcional(apertura: string, color: string, base: string): boolean {
  return conSecciones(apertura, color).some((c) => opcionales(c).some((v) => v.base === base))
}

/**
 * El repertorio de Refuerza: en una apertura con un curso con `secciones`, solo las líneas de sus lecciones obligatorias
 * (Carlos, pendientes de la Caro-Kann, n.º 8, "Su orden", punto 2). Eso quita las opcionales y también las variantes de
 * la base que no son lección del curso (en la Caro-Kann, 37 jugadas: 23 de opcionales y 14 de Karpov, Maróczy, 3.♘d2 y
 * otras). Una jugada que una opcional comparte con una obligatoria sigue saliendo. Las demás aperturas no cambian, y la
 * guía en la partida y los bots siguen con el repertorio completo. El registro no se toca.
 */
export function soloObligatorias(rep: Repertorio): Repertorio {
  return {
    ...rep,
    lineas: rep.lineas.filter((l) => {
      const cs = conSecciones(l.apertura, l.color)
      if (cs.length === 0) return true
      const base = l.id.slice(l.id.indexOf('/') + 1)
      return cs.some((c) => c.variantes.some((v) => v.base === base)) && !esLeccionOpcional(l.apertura, l.color, base)
    }),
  }
}
