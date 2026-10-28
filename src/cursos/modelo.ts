import { Chess, type Square } from 'chess.js'
import type { Base } from '../base/tipos.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import { esMiPly, GUIA, type Repertorio } from '../repertorio/modelo.ts'
import { jugadaNumerada, nombrePieza, sanAEspanol } from '../ajedrez/notacion.ts'

/** Un curso por apertura (y color), primero los de mi repertorio; una lección por variante, por frecuencia. */
export interface Leccion {
  id: string
  cursoId: string
  nombre: string
  familia: string
  plan: string
  autorPlan: 'ia' | 'guia' | 'yo'
  frecuencia: number
  color: ColorCorto
  jugadas: string[]
}

export interface Curso {
  id: string
  apertura: string
  color: ColorCorto
  nombre: string
  enRepertorio: boolean
  lecciones: Leccion[]
}

const nombreColor = (c: ColorCorto) => (c === 'w' ? 'con blancas' : 'con negras')

/** Ordena por frecuencia (de más a menos), sin perder el orden de la base entre iguales. */
export function porFrecuencia<T extends { frecuencia: number }>(xs: T[]): T[] {
  return xs
    .map((x, i) => ({ x, i }))
    .sort((a, b) => b.x.frecuencia - a.x.frecuencia || a.i - b.i)
    .map((p) => p.x)
}

export function cursosDe(base: Base, rep: Repertorio): Curso[] {
  const cursos: Curso[] = []
  const nombreApertura = (id: string) => base.aperturas.find((a) => a.id === id)?.nombre ?? id
  // 1) mi repertorio, en el orden de mi guía
  const grupos = new Map<string, { apertura: string; color: ColorCorto }>()
  for (const l of rep.lineas) grupos.set(`${l.apertura}:${l.color}`, { apertura: l.apertura, color: l.color })
  for (const [id, g] of grupos) {
    const lineas = rep.lineas.filter((l) => l.apertura === g.apertura && l.color === g.color)
    cursos.push({
      id,
      apertura: g.apertura,
      color: g.color,
      nombre: `${GUIA.find((x) => x.color === g.color && x.apertura === g.apertura)?.curso ?? nombreApertura(g.apertura)} (${nombreColor(g.color)})`,
      enRepertorio: true,
      lecciones: porFrecuencia(lineas).map((l) => ({ id: `${id}/${l.id}`, cursoId: id, nombre: l.nombre, familia: l.familia, plan: l.plan, autorPlan: l.autorPlan, frecuencia: l.frecuencia, color: l.color, jugadas: l.jugadas })),
    })
  }
  // 2) lo demás de la base, del lado que le toca a cada variante
  for (const a of base.aperturas)
    for (const color of ['w', 'b'] as ColorCorto[]) {
      const id = `${a.id}:${color}`
      const yaEnRep = new Set(rep.lineas.filter((l) => l.color === color).map((l) => l.claveBase))
      const vs = a.variantes.filter((v) => (v.lado === 'ambos' || (v.lado === 'blancas') === (color === 'w')) && !yaEnRep.has(v.clave))
      if (vs.length === 0) continue
      const existente = cursos.find((c) => c.id === id)
      const lecciones = porFrecuencia(vs).map((v) => ({ id: `${id}/${v.clave}`, cursoId: id, nombre: v.nombre, familia: v.familia, plan: v.plan, autorPlan: v.autorPlan, frecuencia: v.frecuencia, color, jugadas: v.jugadas }))
      if (existente) continue // lo que ya está en mi repertorio se practica ahí; lo demás se agrega desde la base (T10)
      cursos.push({ id, apertura: a.id, color, nombre: `${a.nombre} (${nombreColor(color)})`, enRepertorio: false, lecciones })
    }
  return cursos
}

// ------------------------------------------------------------------ una lección

export type Fase = 'ensenar' | 'preguntar' | 'terminada'
export type ResultadoIntento = 'correcta' | 'alternativa' | 'incorrecta'

export interface EstadoLeccion {
  fase: Fase
  /** cuántas medias jugadas de la línea ya están en el tablero */
  ply: number
  /** lo que pasó en el paso actual (para el registro) */
  paso: { fallos: number; pista: boolean; respuesta: boolean }
  ultimo: ResultadoIntento | null
}

export function nuevoEstado(l: Leccion): EstadoLeccion {
  return avanzarRival(l, { fase: 'ensenar', ply: 0, paso: limpio(), ultimo: null })
}

const limpio = () => ({ fallos: 0, pista: false, respuesta: false })

/** Juega las jugadas del rival hasta que me toque (o termine la línea). */
export function avanzarRival(l: Leccion, e: EstadoLeccion): EstadoLeccion {
  let ply = e.ply
  while (ply < l.jugadas.length && !esMiPly(l.color, ply)) ply++
  if (ply >= l.jugadas.length) {
    if (e.fase === 'ensenar') return avanzarRival(l, { fase: 'preguntar', ply: 0, paso: limpio(), ultimo: e.ultimo })
    return { ...e, fase: 'terminada', ply: l.jugadas.length }
  }
  return { ...e, ply }
}

/** Las jugadas que la lección espera en este paso: la de la línea y las alternativas aceptadas. */
export function esperada(l: Leccion, e: EstadoLeccion): string | null {
  return e.fase === 'terminada' ? null : (l.jugadas[e.ply] ?? null)
}

/**
 * Intento una jugada (SAN en inglés). Correcta: la de la línea. Alternativa: otra jugada mía de mi repertorio en esta
 * misma posición (se acepta, y la lección sigue por su línea). Incorrecta: se repite el paso.
 */
export function intentar(l: Leccion, e: EstadoLeccion, san: string, alternativas: string[] = []): { estado: EstadoLeccion; resultado: ResultadoIntento; pasoTerminado?: EstadoLeccion['paso'] } {
  const ok = esperada(l, e)
  if (!ok) return { estado: e, resultado: 'incorrecta' }
  if (san === ok || (alternativas.includes(san) && san !== ok)) {
    const resultado: ResultadoIntento = san === ok ? 'correcta' : 'alternativa'
    const pasoTerminado = e.paso
    const siguiente = avanzarRival(l, { ...e, ply: e.ply + 1, paso: limpio(), ultimo: resultado })
    return { estado: siguiente, resultado, pasoTerminado }
  }
  return { estado: { ...e, paso: { ...e.paso, fallos: e.paso.fallos + 1 }, ultimo: 'incorrecta' }, resultado: 'incorrecta' }
}

/** La posición antes del paso actual. */
export function posicion(l: Leccion, ply: number): Chess {
  const c = new Chess()
  for (const s of l.jugadas.slice(0, ply)) c.move(s)
  return c
}

/** Una idea en palabras según el tipo de jugada (sin decir a dónde va). */
export function ideaPorTipo(m: { san: string; captured?: string; flags: string; piece: string; from: string; color: string }, previaFueCaptura = false): string {
  if (m.flags.includes('k') || m.flags.includes('q')) return 'Pon a tu rey a salvo.'
  if (m.san.includes('+')) return 'Hay un jaque que sirve aquí.'
  if (m.captured) return previaFueCaptura ? 'Recupera el material.' : 'Hay algo que capturar.'
  const filaInicial = m.color === 'w' ? '1' : '8'
  if (m.piece === 'p') return m.from[0] === 'd' || m.from[0] === 'e' ? 'Pelea por el centro con un peón.' : 'Un peón prepara tu estructura.'
  if ((m.piece === 'n' || m.piece === 'b') && m.from[1] === filaInicial) return 'Saca una pieza a jugar.'
  if (m.piece === 'q') return 'Tu dama tiene una buena jugada.'
  return 'Mejora una pieza que ya está afuera.'
}

/** La Pista: la idea en palabras y la pieza que se mueve, nunca a dónde. */
export function pista(l: Leccion, e: EstadoLeccion): string {
  const san = esperada(l, e)
  if (!san) return ''
  const c = posicion(l, e.ply)
  const m = c.move(san)
  const destino = m.to
  // del plan, solo las frases que no dicen la casilla de destino ni la jugada
  // la frase del plan solo en la jugada que define la variante (la última mía de la lección); antes, la idea por tipo
  const ultimaMia = l.jugadas.reduce((u, _s, i) => (esMiPly(l.color, i) ? i : u), -1)
  const previa = e.ply > 0 ? posicion(l, e.ply - 1).move(l.jugadas[e.ply - 1]!) : null
  const porTipo = ideaPorTipo(m, !!previa?.captured)
  const idea = e.ply === ultimaMia ? (ideaDelPlan(l.plan, l.color, [destino, sanAEspanol(san).replace(/[+#]/g, ''), san.replace(/[+#]/g, '')]) ?? porTipo) : porTipo
  const pieza = m.flags.includes('k') || m.flags.includes('q') ? 'el rey' : `${nombrePieza(m.piece)} de ${m.from}`
  return `${idea} Mueve ${pieza}.`
}

/** La Respuesta: la jugada (para la flecha), su nombre en notación de mis guías y el plan de la línea. */
export function respuesta(l: Leccion, e: EstadoLeccion): { san: string; desde: Square; hasta: Square; texto: string; nombre: string; plan: string } | null {
  const san = esperada(l, e)
  if (!san) return null
  const m = posicion(l, e.ply).move(san)
  return { san, desde: m.from, hasta: m.to, texto: jugadaNumerada(sanAEspanol(san), e.ply), nombre: l.nombre, plan: l.plan }
}

export function marcarPista(e: EstadoLeccion): EstadoLeccion {
  return { ...e, paso: { ...e.paso, pista: true } }
}

export function marcarRespuesta(e: EstadoLeccion): EstadoLeccion {
  return { ...e, paso: { ...e.paso, respuesta: true } }
}

/** Las jugadas que también se aceptan en este paso: las de mi lado en las otras lecciones del curso, en la misma posición. */
export function alternativasEn(curso: Curso, leccion: Leccion, ply: number): string[] {
  const historia = leccion.jugadas.slice(0, ply)
  const r = new Set<string>()
  for (const l of curso.lecciones) {
    if (l.jugadas.length <= ply) continue
    if (historia.some((s, i) => l.jugadas[i] !== s)) continue
    const s = l.jugadas[ply]!
    if (s !== leccion.jugadas[ply]) r.add(s)
  }
  return [...r]
}

/** La siguiente lección del curso que no he terminado (o la que sigue a esta). */
export function siguienteLeccion(curso: Curso, hechas: Record<string, unknown>, despuesDe?: string): Leccion | undefined {
  const i = despuesDe ? curso.lecciones.findIndex((l) => l.id === despuesDe) : -1
  return curso.lecciones.slice(i + 1).find((l) => !hechas[l.id]) ?? curso.lecciones.slice(i + 1)[0]
}

/**
 * Una frase del plan que sirva de idea para MI lado, sin decir a dónde va la jugada.
 * Si el plan habla de los dos lados, se queda con la frase de mi lado; si ninguna sirve, null.
 */
export function ideaDelPlan(plan: string, color: ColorCorto, prohibidas: string[]): string | null {
  const mio = color === 'w' ? 'blancas' : 'negras'
  const otro = color === 'w' ? 'negras' : 'blancas'
  const frases = plan
    .split(/(?<=\.)\s+/)
    .map((f) => f.trim())
    .filter((f) => f && !prohibidas.some((p) => p && f.includes(p)))
  const deMiLado = frases.find((f) => f.toLowerCase().includes(mio))
  if (deMiLado) return deMiLado.replace(new RegExp(`^con ${mio}:?\\s*`, 'i'), '').replace(/^./, (c) => c.toUpperCase())
  return frases.find((f) => !f.toLowerCase().includes(otro)) ?? null
}

/** Del plan, solo lo que toca a mi lado (si el plan habla de los dos). */
export function planDeMiLado(plan: string, color: ColorCorto): string {
  const mio = color === 'w' ? 'blancas' : 'negras'
  const otro = color === 'w' ? 'negras' : 'blancas'
  const frases = plan.split(/(?<=\.)\s+/).map((f) => f.trim()).filter(Boolean)
  const hablaDeLosDos = frases.some((f) => f.toLowerCase().includes(mio)) && frases.some((f) => f.toLowerCase().includes(otro))
  if (!hablaDeLosDos) return plan
  return frases
    .filter((f) => !f.toLowerCase().includes(otro) || f.toLowerCase().includes(mio))
    .map((f) => f.replace(new RegExp(`^con ${mio}:?\\s*`, 'i'), '').replace(/^./, (c) => c.toUpperCase()))
    .join(' ')
}
