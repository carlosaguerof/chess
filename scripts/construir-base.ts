/**
 * Construye la base de conocimiento (conocimiento/base.json y una página .md por apertura)
 * a partir de las definiciones curadas (scripts/base/definiciones/*.json) y la fuente (lichess-org/chess-openings, CC0).
 *
 *   node scripts/construir-base.ts
 *
 * Revisa: que cada fila exista tal cual en la fuente, que las jugadas sean legales y empiecen con la raíz.
 * Si existe conocimiento/validacion-motor.json, corta cada línea antes de la primera jugada de "mi lado" que pierda más de 100 cp.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { Chess } from 'chess.js'
import { lineaEnEspanol } from '../src/ajedrez/notacion.ts'
import type { Apertura, Base, Lado, Variante } from '../src/base/tipos.ts'

export const RUTA_TSV = 'input/lichess-chess-openings'
export const PERDIDA_MAXIMA_CP = 100

export interface FilaFuente {
  eco: string
  name: string
  pgn: string
  sanes: string[]
}

export function leerFuente(): FilaFuente[] {
  const filas: FilaFuente[] = []
  for (const f of ['a', 'b', 'c', 'd', 'e']) {
    const lineas = readFileSync(`${RUTA_TSV}/${f}.tsv`, 'utf8').split('\n').slice(1)
    for (const l of lineas) {
      if (!l.trim()) continue
      const [eco, name, pgn] = l.split('\t')
      filas.push({ eco: eco!, name: name!, pgn: pgn!, sanes: sanesDePgn(pgn!) })
    }
  }
  return filas
}

export function sanesDePgn(pgn: string): string[] {
  return pgn.split(/\s+/).filter((t) => t && !/^\d+\.(\.\.)?$/.test(t))
}

/** ¿De quién es la media jugada número i (0 = primera de blancas)? */
export const ladoDePly = (i: number): 'blancas' | 'negras' => (i % 2 === 0 ? 'blancas' : 'negras')
export const esMia = (lado: Lado, i: number) => lado === 'ambos' || lado === ladoDePly(i)

/** Las jugadas "mías" de una línea: posición (FEN) antes de la jugada y la jugada en UCI. */
export function jugadasMias(jugadas: string[], lado: Lado): { ply: number; fen: string; uci: string; san: string }[] {
  const c = new Chess()
  const r: { ply: number; fen: string; uci: string; san: string }[] = []
  jugadas.forEach((san, ply) => {
    const fen = c.fen()
    const m = c.move(san)
    if (esMia(lado, ply)) r.push({ ply, fen, uci: m.from + m.to + (m.promotion ?? ''), san })
  })
  return r
}

export const claveValidacion = (fen: string, uci: string) => `${fen.split(' ').slice(0, 4).join(' ')}|${uci}`

interface Definicion {
  id: string
  nombre: string
  nombreIngles: string
  eco: string
  lado: Lado
  raiz: string
  idea: string
  variantes: {
    id: string
    familia: string
    nombre: string
    fila: { eco: string; name: string; pgn: string }
    /** C4: jugadas después de la fila (SAN inglés), con su fuente; las de mi lado se validan con el motor como las demás */
    continuacion?: { jugadas: string; fuente: string[] }
    lado?: Lado
    plan: string
    frecuencia: number | null
    fuenteFrecuencia: string | null
  }[]
}

export function leerDefiniciones(): Definicion[] {
  const orden = ['italiana', 'siciliana', 'caro-kann', 'francesa', 'escandinava', 'otros-1e4', 'eslava', 'otros-negras', 'londres', 'gambito-dama', 'gambito-dama-declinado']
  const archivos = readdirSync('scripts/base/definiciones').filter((f) => f.endsWith('.json'))
  const defs = archivos.map((f) => JSON.parse(readFileSync(`scripts/base/definiciones/${f}`, 'utf8')) as Definicion)
  return defs.sort((a, b) => (orden.indexOf(a.id) + 99 * +(orden.indexOf(a.id) < 0)) - (orden.indexOf(b.id) + 99 * +(orden.indexOf(b.id) < 0)))
}

export interface Validacion {
  [clave: string]: { mejor: string; cpMejor: number; cpJugada: number; perdida: number; profundidad: number }
}

export function construir(): { base: Base; errores: string[]; recortes: string[] } {
  const fuente = leerFuente()
  const validacion: Validacion = existsSync('conocimiento/validacion-motor.json') ? JSON.parse(readFileSync('conocimiento/validacion-motor.json', 'utf8')) : {}
  const errores: string[] = []
  const recortes: string[] = []
  const aperturas: Apertura[] = []
  for (const d of leerDefiniciones()) {
    const raiz = d.raiz ? d.raiz.split(' ') : []
    const variantes: Variante[] = []
    const vistas = new Set<string>()
    for (const v of d.variantes) {
      const etiqueta = `${d.id}/${v.id}`
      const fila = fuente.find((f) => f.eco === v.fila.eco && f.name === v.fila.name && f.pgn === v.fila.pgn)
      if (!fila) {
        errores.push(`${etiqueta}: la fila no existe tal cual en la fuente (${v.fila.eco} · ${v.fila.name} · ${v.fila.pgn})`)
        continue
      }
      const jugadas = [...fila.sanes, ...(v.continuacion ? v.continuacion.jugadas.split(' ').filter(Boolean) : [])]
      if (raiz.some((m, i) => jugadas[i] !== m)) errores.push(`${etiqueta}: no empieza con la raíz ${d.raiz}`)
      const c = new Chess()
      try {
        for (const s of jugadas) c.move(s)
      } catch {
        errores.push(`${etiqueta}: jugada ilegal en ${fila.pgn}`)
        continue
      }
      const lado = v.lado ?? d.lado
      // recorte: antes de la primera jugada mía que pierda más de 100 cp
      let corte = jugadas.length
      let motivo = ''
      for (const j of jugadasMias(jugadas, lado)) {
        const val = validacion[claveValidacion(j.fen, j.uci)]
        if (val && val.perdida > PERDIDA_MAXIMA_CP) {
          corte = j.ply
          motivo = `${lineaEnEspanol([j.san], j.ply)} pierde ${val.perdida} cp contra ${val.mejor} (profundidad ${val.profundidad})`
          break
        }
      }
      const finales = jugadas.slice(0, corte)
      if (corte < jugadas.length) recortes.push(`${etiqueta}: se corta en ${finales.length} medias jugadas: ${motivo}`)
      if (finales.length <= raiz.length) {
        recortes.push(`${etiqueta}: queda vacía después del recorte; se quita`)
        continue
      }
      const firma = finales.join(' ')
      if (vistas.has(firma)) {
        recortes.push(`${etiqueta}: después del recorte repite otra variante; se quita`)
        continue
      }
      vistas.add(firma)
      variantes.push({
        id: v.id,
        clave: etiqueta,
        familia: v.familia,
        nombre: v.nombre,
        nombreIngles: fila.name,
        eco: fila.eco,
        jugadas: finales,
        lado,
        plan: v.plan,
        autorPlan: 'ia',
        frecuencia: v.frecuencia ?? 3,
        fuenteFrecuencia: v.frecuencia ? (v.fuenteFrecuencia ?? '') : 'sin dato (regla: 3)',
        fuente: { repo: 'lichess-org/chess-openings', eco: fila.eco, name: fila.name, pgn: fila.pgn },
        ...(corte < jugadas.length ? { recorte: { jugadasOriginales: jugadas.length, motivo } } : {}),
        ...(v.continuacion ? { continuacion: { desde: fila.sanes.length, fuente: v.continuacion.fuente } } : {}),
      })
    }
    aperturas.push({ id: d.id, nombre: d.nombre, nombreIngles: d.nombreIngles, eco: d.eco, lado: d.lado, raiz, idea: d.idea, variantes })
  }
  return { base: { version: '2026-10-28', fuente: 'lichess-org/chess-openings (CC0), commit f06a50d', aperturas }, errores, recortes }
}

const PUNTOS = (n: number) => '●'.repeat(n) + '○'.repeat(5 - n)
const LADO_ES: Record<Lado, string> = { blancas: 'blancas', negras: 'negras', ambos: 'los dos lados' }

export function paginaMarkdown(a: Apertura): string {
  const l: string[] = []
  l.push(`# ${a.nombre}`, '', `*${a.nombreIngles}* · ECO ${a.eco} · se juega con ${LADO_ES[a.lado]}${a.raiz.length ? ` · empieza con ${lineaEnEspanol(a.raiz)}` : ''}`, '')
  l.push(`> ${a.idea} *(redactado por la IA)*`, '')
  l.push('Las líneas salen de la lista abierta de aperturas de lichess (`lichess-org/chess-openings`, CC0) y están validadas con el motor: ninguna jugada del lado que aprendes pierde más de 1 peón contra la mejor (Stockfish 19 lite, profundidad 18). Los planes los redactó la IA.', '')
  let familia = ''
  for (const v of a.variantes) {
    if (v.familia !== familia) {
      familia = v.familia
      l.push(`## ${familia}`, '')
    }
    l.push(`### ${v.nombre}`, '')
    l.push(`**${lineaEnEspanol(v.jugadas)}**`, '')
    l.push(`- Frecuencia: ${PUNTOS(v.frecuencia)} (${v.frecuencia} de 5; ${v.fuenteFrecuencia})`)
    l.push(`- Plan *(redactado por la IA)*: ${v.plan}`)
    l.push(`- Fuente: ${v.fuente.eco} · ${v.fuente.name}`)
    if (v.continuacion) l.push(`- Sigue la fila de la fuente desde la media jugada ${v.continuacion.desde + 1} con teoría de: ${v.continuacion.fuente.join('; ')}.`)
    if (v.recorte) l.push(`- Recortada: la fuente sigue hasta ${v.recorte.jugadasOriginales} medias jugadas; se corta porque ${v.recorte.motivo}.`)
    l.push('')
  }
  return l.join('\n')
}

if (process.argv[1]?.endsWith('construir-base.ts')) {
  const { base, errores, recortes } = construir()
  if (errores.length) {
    console.error('ERRORES:\n' + errores.join('\n'))
    process.exit(1)
  }
  writeFileSync('conocimiento/base.json', JSON.stringify(base, null, 1) + '\n')
  for (const a of base.aperturas) writeFileSync(`conocimiento/${a.id}.md`, paginaMarkdown(a))
  const total = base.aperturas.reduce((s, a) => s + a.variantes.length, 0)
  console.log(`base: ${base.aperturas.length} aperturas, ${total} variantes`)
  if (recortes.length) console.log('recortes:\n' + recortes.join('\n'))
}
