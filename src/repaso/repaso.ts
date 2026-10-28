import { guardar, leer } from '../estado/almacen.ts'
import type { Progreso } from '../repertorio/estado.ts'
import type { Leccion } from '../cursos/modelo.ts'

/**
 * R7 (nota 4): el "Repaso de hoy", repetición espaciada sobre las lecciones que ya terminé.
 * Al terminar una lección por primera vez, su línea vuelve al día siguiente (escalón 1). Si la contesto completa
 * sin ayuda, sube un escalón y vuelve más tarde: 1, 3, 7, 14 y 30 días. Si fallo una jugada o pido Pista o
 * Respuesta, regresa al escalón 1 y vuelve mañana. Las fechas son días del calendario de este navegador.
 */
export const ESCALONES = [1, 3, 7, 14, 30] as const

export interface FichaRepaso {
  /** 1 a 5: el escalón en que va (1 = vuelve en 1 día … 5 = en 30) */
  escalon: number
  /** el día en que toca (AAAA-MM-DD) */
  proxima: string
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

/** La ficha de una lección aprendida: la guardada o, si nunca la he repasado, la de su primer día. */
export function fichaDe(e: EstadoRepaso, id: string, hechas: Progreso): FichaRepaso | null {
  if (e[id]) return e[id]
  const h = hechas[id]
  return h ? { escalon: 1, proxima: sumarDias(dia(h.fecha), ESCALONES[0]) } : null
}

/** Terminé el repaso de una línea: sube un escalón si fue sin ayuda ni fallos; si no, vuelve al primero. */
export function alRepasar(e: EstadoRepaso, id: string, hoy: string, limpia: boolean, hechas: Progreso): EstadoRepaso {
  const antes = fichaDe(e, id, hechas)?.escalon ?? 1
  const escalon = limpia ? Math.min(antes + 1, ESCALONES.length) : 1
  return { ...e, [id]: { escalon, proxima: sumarDias(hoy, ESCALONES[escalon - 1]!) } }
}

/** Las lecciones que tocan hoy (o que ya tocaban): solo las aprendidas y que siguen en mis cursos. */
export function paraHoy(e: EstadoRepaso, hechas: Progreso, lecciones: Leccion[], hoy: string): Leccion[] {
  return lecciones
    .map((l) => ({ l, f: fichaDe(e, l.id, hechas) }))
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
