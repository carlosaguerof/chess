import { Chess, type Square } from 'chess.js'
import type { Base, Variante } from '../base/tipos.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import { jugadaNumerada, nombrePieza, sanAEspanol } from '../ajedrez/notacion.ts'
import { GUIA, esMiPly, siguientesEnRepertorio, type LineaRepertorio, type Repertorio } from '../repertorio/modelo.ts'
import { ideaPorTipo, planDeMiLado } from '../cursos/modelo.ts'

/** La guía de aperturas en una partida real (T9). Todo sale de mi repertorio y de la base; nunca del motor. */
export interface Contexto {
  base: Base
  rep: Repertorio
  /** mi color en la partida */
  color: ColorCorto
}

const num = (san: string, ply: number) => jugadaNumerada(sanAEspanol(san), ply)

/** Variantes de la base cuyas jugadas son un prefijo de la historia (las más largas primero). */
function variantesQueCoinciden(base: Base, historia: string[]): { v: Variante; apertura: string }[] {
  const r: { v: Variante; apertura: string }[] = []
  for (const a of base.aperturas)
    for (const v of a.variantes) if (v.jugadas.length <= historia.length && v.jugadas.every((s, i) => historia[i] === s)) r.push({ v, apertura: a.nombre })
  return r.sort((x, y) => y.v.jugadas.length - x.v.jugadas.length)
}

/** El nombre de la apertura en cuanto se puede saber: la raíz de una apertura de la base, o una variante completa. */
export function nombreDeApertura(base: Base, historia: string[]): { apertura: string; variante?: string } | null {
  const v = variantesQueCoinciden(base, historia)[0]
  let mejor: { apertura: string; largo: number } | null = null
  for (const a of base.aperturas) {
    if (a.raiz.length < 2) continue
    if (a.raiz.length <= historia.length && a.raiz.every((s, i) => historia[i] === s) && (!mejor || a.raiz.length > mejor.largo)) mejor = { apertura: a.nombre, largo: a.raiz.length }
  }
  if (v && v.v.jugadas.length >= (mejor?.largo ?? 0) && v.v.jugadas.length >= 2) return { apertura: v.apertura, variante: v.v.familia }
  if (mejor) return { apertura: mejor.apertura }
  return null
}

export type TipoMensaje = 'inicio' | 'en-linea' | 'desvio' | 'fuera'

export interface Mensaje {
  tipo: TipoMensaje
  texto: string
  /** el nombre en inglés y el ECO de la apertura (N2: a un lado, en chico) */
  ingles?: string
  /** en un desvío: mi jugada y la de mi línea, para decidir si sigo o deshago */
  desvio?: { jugue: string; linea: string }
}

/** Lo que la guía me dice justo después de MI jugada. `historia` ya incluye mi jugada. */
export function mensajeTrasMiJugada(ctx: Contexto, historia: string[]): Mensaje {
  const ply = historia.length - 1
  const mia = historia[ply]!
  const antes = historia.slice(0, ply)
  const opciones = siguientesEnRepertorio(ctx.rep, ctx.color, antes)
  const nombreAntes = nombreDeApertura(ctx.base, antes)
  const nombreAhora = nombreDeApertura(ctx.base, historia)
  const partes: string[] = []
  if (opciones.length === 0) {
    // mi repertorio ya no tiene nada aquí
    const fuera = ply === 0 ? `Iniciaste con ${num(mia, 0)}.` : `Jugaste ${num(mia, ply)}. Ya estás fuera de tu repertorio: sigue con los principios (desarrolla, controla el centro, enroca).`
    return { tipo: 'fuera', texto: fuera }
  }
  const mio = opciones.find((o) => o.san === mia)
  if (!mio) {
    const linea = opciones[0]!
    const donde = nombreAntes ? `de la ${nombreAntes.variante ?? nombreAntes.apertura}` : 'de tu repertorio'
    return {
      tipo: 'desvio',
      texto: `Te desviaste ${donde}: jugaste ${num(mia, ply)} y tu línea dice ${num(linea.san, ply)}.`,
      desvio: { jugue: mia, linea: linea.san },
    }
  }
  if (ply === 0) partes.push(`Iniciaste con ${num(mia, 0)}.`)
  if (nombreAhora && (nombreAhora.apertura !== nombreAntes?.apertura || nombreAhora.variante !== nombreAntes?.variante)) {
    partes.push(nombreAhora.variante && nombreAhora.variante !== nombreAhora.apertura ? `Estás en la ${nombreAhora.apertura}: ${nombreAhora.variante}.` : `Estás en la ${nombreAhora.apertura}.`)
  }
  const familia = mio.lineas[0]!.familia
  const ap = nombreAhora ? ctx.base.aperturas.find((a) => a.nombre === nombreAhora.apertura) : undefined
  const otras = opciones.filter((o) => o.san !== mia)
  if (otras.length > 0) {
    const otraFamilia = otras[0]!.lineas[0]!.familia
    const nombreOtra = otraFamilia !== familia ? `la ${otraFamilia} (${num(otras[0]!.san, ply)})` : num(otras[0]!.san, ply)
    partes.push(`Contestaste con ${num(mia, ply)}${familia ? `, la ${familia}` : ''}; otra opción era ${nombreOtra}.`)
  } else if (ply > 0) partes.push(`Contestaste con ${num(mia, ply)}, como dice tu línea.`)
  return { tipo: 'en-linea', texto: partes.join(' '), ingles: ap ? `${ap.nombreIngles} · ${ap.eco}` : undefined }
}

export interface Ayuda {
  /** de dónde sale: mi repertorio, la base, el final de mi línea (su plan) o, fuera de teoría, nada */
  origen: 'repertorio' | 'base' | 'fin-de-linea' | 'fuera'
  san?: string
  desde?: Square
  hasta?: Square
  pista: string
  respuesta: string
  nombre?: string
  plan?: string
}

const PRINCIPIOS = 'Fuera de teoría: aquí ya no hay una línea de tu apertura. Plan de principios: desarrolla tus piezas, controla el centro y enroca.'

/** Pista y Respuesta en mi turno: de mi repertorio; si no, de la base; si no, fuera de teoría. */
export function ayudaEnMiTurno(ctx: Contexto, historia: string[]): Ayuda {
  const ply = historia.length
  const deRep = siguientesEnRepertorio(ctx.rep, ctx.color, historia)
  let san: string | undefined
  let nombre: string | undefined
  let plan: string | undefined
  let origen: Ayuda['origen'] = 'fuera'
  if (deRep.length > 0) {
    const lineas: LineaRepertorio[] = deRep[0]!.lineas
    const l = lineas[0]!
    san = deRep[0]!.san
    // si esta jugada todavía sirve a varias variantes, se nombra la apertura; si ya es de una sola, esa variante
    const familias = new Set(lineas.map((x) => x.familia))
    const apertura = ctx.base.aperturas.find((a) => a.id === l.apertura)
    if (familias.size > 1 && apertura) {
      nombre = apertura.nombre
      plan = apertura.idea
    } else {
      nombre = familias.size === 1 ? l.familia : l.nombre
      plan = planDeMiLado(l.plan, ctx.color)
    }
    origen = 'repertorio'
  } else {
    const deBase = siguientesEnBase(ctx.base, ctx.color, historia)
    if (deBase) {
      san = deBase.san
      nombre = deBase.v.familia
      plan = planDeMiLado(deBase.v.plan, ctx.color)
      origen = 'base'
    }
  }
  if (!san && esMiPly(ctx.color, ply)) {
    // mi línea termina justo aquí (en la jugada del rival): no hay una jugada en la fuente, pero sí su plan
    const termina = ctx.rep.lineas.find((l) => l.color === ctx.color && l.jugadas.length === historia.length && l.jugadas.every((s, i) => historia[i] === s))
    if (termina) {
      const texto = `Tu línea (${termina.nombre}) termina aquí: la fuente no trae más jugadas. Sigue su plan: ${planDeMiLado(termina.plan, ctx.color)}`
      return { origen: 'fin-de-linea', nombre: termina.nombre, plan: termina.plan, pista: texto, respuesta: texto }
    }
  }
  if (!san || !esMiPly(ctx.color, ply)) {
    const otros = GUIA.find((g) => g.color === ctx.color && (g.apertura === 'otros-1e4' || g.apertura === 'otros-negras'))
    const texto = otros ? `${PRINCIPIOS} Tu guía dice: “${otros.textoGuia}”` : PRINCIPIOS
    return { origen: 'fuera', pista: texto, respuesta: texto }
  }
  const c = new Chess()
  for (const s of historia) c.move(s)
  const m = c.move(san)
  const pieza = m.flags.includes('k') || m.flags.includes('q') ? 'el rey' : `${nombrePieza(m.piece)} de ${m.from}`
  const previaCaptura = historia.length > 0 && /x/.test(historia[historia.length - 1]!)
  // el nombre de la línea, sin lo que va entre paréntesis (a veces trae la jugada) ni la casilla de destino
  const nombreSeguro = nombre?.replace(/\s*\([^)]*\)/g, '').trim()
  const idea = `${ideaPorTipo(m, previaCaptura)}${nombreSeguro && !nombreSeguro.includes(m.to) ? ` Sigues la ${nombreSeguro}.` : ''}`
  return {
    origen,
    san,
    desde: m.from,
    hasta: m.to,
    nombre,
    plan,
    pista: `${idea} Mueve ${pieza}.`,
    respuesta: `${num(san, ply)} — ${nombre ?? ''}${origen === 'base' ? ' (de la base)' : ''}. ${corto(plan ?? '')}`.trim(),
  }
}

function siguientesEnBase(base: Base, color: ColorCorto, historia: string[]): { san: string; v: Variante } | null {
  const lado = color === 'w' ? 'blancas' : 'negras'
  const cuenta = new Map<string, { v: Variante; f: number }>()
  for (const a of base.aperturas)
    for (const v of a.variantes) {
      if (v.lado !== 'ambos' && v.lado !== lado) continue
      if (v.jugadas.length <= historia.length || historia.some((s, i) => v.jugadas[i] !== s)) continue
      const s = v.jugadas[historia.length]!
      const prev = cuenta.get(s)
      if (!prev || v.frecuencia > prev.f) cuenta.set(s, { v, f: v.frecuencia })
    }
  const mejor = [...cuenta.entries()].sort((a, b) => b[1].f - a[1].f)[0]
  return mejor ? { san: mejor[0], v: mejor[1].v } : null
}

/** "Que juegue mis líneas": el bot escoge entre las jugadas del rival de mi árbol, por frecuencia. */
export function jugadaDeMisLineas(rep: Repertorio, colorHumano: ColorCorto, historia: string[], azar: () => number): string | null {
  if (esMiPly(colorHumano, historia.length)) return null
  const todas = siguientesEnRepertorio(rep, colorHumano, historia)
  if (todas.length === 0) return null
  // evita las respuestas donde mi línea se acaba (no tendría jugada mía que practicar), si hay otras
  const conSeguimiento = todas.filter((o) => siguientesEnRepertorio(rep, colorHumano, [...historia, o.san]).length > 0)
  const ops = conSeguimiento.length > 0 ? conSeguimiento : todas
  const pesos = ops.map((o) => Math.max(...o.lineas.map((l) => l.frecuencia)))
  const total = pesos.reduce((a, b) => a + b, 0)
  let r = azar() * total
  for (let i = 0; i < ops.length; i++) {
    r -= pesos[i]!
    if (r <= 0) return ops[i]!.san
  }
  return ops[ops.length - 1]!.san
}

export interface Resumen {
  caso: 'completa' | 'me-sali' | 'se-salio-rival'
  /** hasta qué media jugada (incluida) seguí mi línea */
  hastaPly: number
  texto: string
  /** la línea que estaba siguiendo (para "Practicar esta línea", T18) */
  linea?: LineaRepertorio
  /** dónde me salí yo: mi jugada y la de mi línea */
  salida?: { ply: number; jugue: string; linea: string }
}

const ctx_nombreApertura = (l: LineaRepertorio) => (GUIA.find((g) => g.color === l.color && g.apertura === l.apertura)?.curso ?? l.familia)

/** El resumen al terminar: hasta qué jugada seguí mi línea, y dónde me salí yo o se salió el rival. */
export function resumenDePartida(rep: Repertorio, color: ColorCorto, historia: string[]): Resumen {
  let ultimaLinea: LineaRepertorio | undefined
  for (let ply = 0; ply < historia.length; ply++) {
    const ops = siguientesEnRepertorio(rep, color, historia.slice(0, ply))
    const jugada = historia[ply]!
    if (ops.length === 0) {
      const texto = ply === 0 ? 'La partida no entró a tu repertorio.' : `Seguiste tu línea completa hasta ${num(historia[ply - 1]!, ply - 1)}${ultimaLinea ? ` (${ultimaLinea.nombre})` : ''}. Ahí termina lo que tienes estudiado.`
      return { caso: 'completa', hastaPly: ply - 1, texto, linea: ultimaLinea }
    }
    const op = ops.find((o) => o.san === jugada)
    if (!op) {
      if (esMiPly(color, ply)) {
        const linea = ops[0]!
        return {
          caso: 'me-sali',
          hastaPly: ply - 1,
          texto: `Seguiste tu línea hasta ${ply > 0 ? num(historia[ply - 1]!, ply - 1) : 'el inicio'}. En ${num(jugada, ply)} te saliste tú: tu línea decía ${num(linea.san, ply)} (${linea.lineas[0]!.nombre}).`,
          linea: linea.lineas[0],
          salida: { ply, jugue: jugada, linea: linea.san },
        }
      }
      return {
        caso: 'se-salio-rival',
        hastaPly: ply - 1,
        texto: `Seguiste tu línea hasta ${ply > 0 ? num(historia[ply - 1]!, ply - 1) : 'el inicio'}. En ${num(jugada, ply)} se salió el rival; tu repertorio esperaba ${ops.map((o) => num(o.san, ply)).join(' o ')}.`,
        linea: ultimaLinea,
      }
    }
    ultimaLinea = op.lineas.length > 1 && new Set(op.lineas.map((l) => l.familia)).size === 1 ? { ...op.lineas[0]!, nombre: op.lineas[0]!.familia } : op.lineas.length > 1 ? { ...op.lineas[0]!, nombre: ctx_nombreApertura(op.lineas[0]!) } : op.lineas[0]
  }
  const ultima = historia.length > 0 ? num(historia[historia.length - 1]!, historia.length - 1) : 'el inicio'
  return { caso: 'completa', hastaPly: historia.length - 1, texto: `Seguiste tu línea toda la partida, hasta ${ultima}${ultimaLinea ? ` (${ultimaLinea.nombre})` : ''}.`, linea: ultimaLinea }
}

/** Las primeras frases de un plan, sin pasar de unos 180 caracteres (la Respuesta cabe en el celular). */
function corto(plan: string): string {
  const frases = plan.split(/(?<=\.)\s+/)
  let r = ''
  for (const f of frases) {
    if (r && (r + ' ' + f).length > 180) break
    r = r ? `${r} ${f}` : f
  }
  return r
}
