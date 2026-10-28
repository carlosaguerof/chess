import { Chess } from 'chess.js'
import { guardar, leer } from '../estado/almacen.ts'
import type { Progreso } from '../repertorio/estado.ts'
import type { Leccion } from '../cursos/modelo.ts'
import { fenCorto, type EntradaRegistro } from '../registro/registro.ts'

/**
 * R7 (nota 4): el "Repaso de hoy", repetición espaciada sobre las lecciones que ya terminé.
 * Al terminar una lección por primera vez, su línea vuelve al día siguiente (escalón 1). Si la contesto completa
 * sin ayuda, sube un escalón y vuelve más tarde: 1, 3, 7, 14 y 30 días. Si fallo una jugada o pido Pista o
 * Respuesta, regresa al escalón 1 y vuelve mañana. Las fechas son días del calendario de este navegador.
 * Está construido sobre el registro de la nota 1: si después de su último repaso fallé (o pedí ayuda en) una jugada
 * de la línea en cualquier lugar (curso, Refuerza o la guía en una partida), la línea también vuelve al escalón 1.
 */
export const ESCALONES = [1, 3, 7, 14, 30] as const

export interface FichaRepaso {
  /** 1 a 5: el escalón en que va (1 = vuelve en 1 día … 5 = en 30) */
  escalon: number
  /** el día en que toca (AAAA-MM-DD) */
  proxima: string
  /** cuándo terminé su último repaso (ms); lo que el registro diga después cuenta */
  ultima?: number
}
export type EstadoRepaso = Record<string, FichaRepaso>

/** El día de una fecha, en la hora de este navegador (AAAA-MM-DD). */
export function dia(fecha: Date | number = Date.now()): string {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function sumarDias(d: string, n: number): string {
  const [a, m, x] = d.split('-').map(Number) as [number, number, number]
  return dia(new Date(a, m - 1, x + n, 12))
}

/** Las jugadas mías de una lección: la posición antes de cada una y la jugada (como las guarda el registro). */
function pasosDe(l: Leccion): Set<string> {
  const c = new Chess()
  const r = new Set<string>()
  l.jugadas.forEach((s, i) => {
    if ((i % 2 === 0 ? 'w' : 'b') === l.color) r.add(`${fenCorto(c.fen())}|${s}`)
    c.move(s)
  })
  return r
}

/**
 * La ficha de una lección aprendida: la guardada o, si nunca la he repasado, la de su primer día. Si el registro
 * tiene un fallo, una Pista o una Respuesta en una jugada suya después del último repaso, vuelve al escalón 1.
 */
export function fichaDe(e: EstadoRepaso, id: string, hechas: Progreso, registro: EntradaRegistro[] = [], leccion?: Leccion): FichaRepaso | null {
  const h = hechas[id]
  const f = e[id] ?? (h ? { escalon: 1, proxima: sumarDias(dia(h.fecha), ESCALONES[0]), ultima: h.fecha } : null)
  if (!f || !leccion || registro.length === 0) return f
  const desde = f.ultima ?? h?.fecha ?? 0
  const pasos = pasosDe(leccion)
  const fallo = registro.find((r) => r.fecha > desde && r.resultado !== 'acierto' && pasos.has(`${r.fen}|${r.esperada}`))
  if (!fallo) return f
  const manana = sumarDias(dia(fallo.fecha), ESCALONES[0])
  return { ...f, escalon: 1, proxima: manana < f.proxima ? manana : f.proxima }
}

/** Terminé el repaso de una línea: sube un escalón si fue sin ayuda ni fallos; si no, vuelve al primero. */
export function alRepasar(e: EstadoRepaso, id: string, hoy: string, limpia: boolean, hechas: Progreso, ahora = Date.now()): EstadoRepaso {
  const antes = fichaDe(e, id, hechas)?.escalon ?? 1
  const escalon = limpia ? Math.min(antes + 1, ESCALONES.length) : 1
  return { ...e, [id]: { escalon, proxima: sumarDias(hoy, ESCALONES[escalon - 1]!), ultima: ahora } }
}

/** Las lecciones que tocan hoy (o que ya tocaban): solo las aprendidas y que siguen en mis cursos. */
export function paraHoy(e: EstadoRepaso, hechas: Progreso, lecciones: Leccion[], hoy: string, registro: EntradaRegistro[] = []): Leccion[] {
  return lecciones
    .map((l) => ({ l, f: fichaDe(e, l.id, hechas, registro, l) }))
    .filter((x): x is { l: Leccion; f: FichaRepaso } => !!x.f && x.f.proxima <= hoy)
    .sort((a, b) => a.f.proxima.localeCompare(b.f.proxima) || a.f.escalon - b.f.escalon)
    .map((x) => x.l)
}

/** Unos 10 segundos por cada jugada mía, redondeado hacia arriba en minutos. */
export function minutos(ls: Leccion[]): number {
  const jugadas = ls.reduce((n, l) => n + l.jugadas.filter((_, i) => (i % 2 === 0 ? 'w' : 'b') === l.color).length, 0)
  return Math.max(1, Math.ceil((jugadas * 10) / 60))
}

const CLAVE = 'repaso'
const CLAVE_ACTIVO = 'repaso-activo'

export function leerRepaso(): EstadoRepaso {
  return leer<EstadoRepaso>(CLAVE, {})
}
export function guardarRepaso(e: EstadoRepaso): void {
  guardar(CLAVE, e)
}
/** El interruptor (nota 4): prendido por defecto. Apagado, el inicio no muestra el repaso; nada más cambia. */
export function repasoActivo(): boolean {
  return leer<boolean>(CLAVE_ACTIVO, true)
}
export function activarRepaso(v: boolean): void {
  guardar(CLAVE_ACTIVO, v)
}
