import type { Base } from '../base/tipos.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import { lineaDeVariante, repertorioInicial, type LineaRepertorio, type Repertorio } from './modelo.ts'
import { migrarIds } from '../aprender/migracion.ts'
import { lineasDePgn, ErrorPgn } from './pgn.ts'

/** Agregar a mi repertorio una variante de la base (lo principal de "escoger qué aprendo"). */
export function agregarDeBase(rep: Repertorio, base: Base, clave: string, color: ColorCorto): Repertorio {
  const id = `${color}:${clave}`
  if (rep.lineas.some((l) => l.id === id)) return rep
  for (const a of base.aperturas) {
    const v = a.variantes.find((x) => x.clave === clave)
    if (v) return { ...rep, lineas: [...rep.lineas, lineaDeVariante(v, color, a.id, a.lado)] }
  }
  return rep
}

/** Agregar una línea jugándola en el tablero desde un nodo. */
export function agregarPropia(rep: Repertorio, color: ColorCorto, jugadas: string[], nombre: string, apertura = 'propia'): Repertorio {
  const id = `${color}:propia/${jugadas.join('-')}`
  if (rep.lineas.some((l) => l.id === id)) return rep
  const linea: LineaRepertorio = { id, color, apertura, jugadas, familia: nombre, nombre, plan: '', autorPlan: 'yo', frecuencia: 3, origen: 'propia' }
  return { ...rep, lineas: [...rep.lineas, linea] }
}

/** Cambiar nombre, plan o frecuencia de una línea. */
export function editarLinea(rep: Repertorio, id: string, cambios: Partial<Pick<LineaRepertorio, 'nombre' | 'plan' | 'frecuencia' | 'familia'>>): Repertorio {
  return {
    ...rep,
    lineas: rep.lineas.map((l) =>
      l.id === id
        ? {
            ...l,
            ...cambios,
            ...(cambios.plan !== undefined && cambios.plan !== l.plan ? { autorPlan: 'yo' as const } : {}),
            ...(cambios.frecuencia !== undefined ? { frecuencia: Math.max(1, Math.min(5, Math.round(cambios.frecuencia))) } : {}),
          }
        : l,
    ),
  }
}

export interface Borrado {
  repertorio: Repertorio
  /** lo que se borró, para deshacerlo */
  quitadas: { linea: LineaRepertorio; indice: number }[]
}

/** Borrar una rama: todas mis líneas de ese color que pasan por esas jugadas. Devuelve lo necesario para deshacer. */
export function borrarRama(rep: Repertorio, color: ColorCorto, camino: string[]): Borrado {
  const quitadas: Borrado['quitadas'] = []
  const lineas: LineaRepertorio[] = []
  rep.lineas.forEach((l, indice) => {
    const pasa = l.color === color && camino.length > 0 && camino.every((s, i) => l.jugadas[i] === s)
    if (pasa) quitadas.push({ linea: l, indice })
    else lineas.push(l)
  })
  return { repertorio: { ...rep, lineas }, quitadas }
}

/** Deshacer un borrado: las líneas regresan a su lugar. */
export function deshacerBorrado(rep: Repertorio, b: Borrado): Repertorio {
  const lineas = [...rep.lineas]
  for (const q of [...b.quitadas].sort((x, y) => x.indice - y.indice)) lineas.splice(Math.min(q.indice, lineas.length), 0, q.linea)
  return { ...rep, lineas }
}

export function repertorioOriginal(base: Base): Repertorio {
  return repertorioInicial(base)
}

// ----------------------------------------------------------- exportar e importar (todo en un archivo)

/**
 * El archivo de respaldo (versión 2, Nota 1): mis favoritas, el avance, el registro y el repaso; desde los ajustes de
 * la app (2026-10-28), también Mis partidas y los ajustes. Un archivo sin esas dos partes se sigue leyendo.
 */
export interface Respaldo {
  app: 'chess-mis-aperturas'
  version: 2
  /** mis favoritas: "caro-kann:b", "italiana:w"… */
  favoritas: string[]
  /** lecciones terminadas */
  progreso: Record<string, { fecha: number }>
  /** registro por jugada (nota 1) */
  registro: unknown[]
  /** R7: los escalones y fechas del repaso */
  repaso?: Record<string, { escalon: number; proxima: string }>
  /** R2: Mis partidas */
  historial?: unknown[]
  /** lo demás que la app guarda, por clave: sonido, estilo, repaso prendido, estrellas, último bot, opciones… */
  ajustes?: Record<string, unknown>
}

/** El archivo que se descarga: JSON con formato fijo (exportar → importar → exportar da los mismos bytes). */
export function exportar(r: Omit<Respaldo, 'app' | 'version'>): string {
  const respaldo: Respaldo = { app: 'chess-mis-aperturas', version: 2, favoritas: r.favoritas, progreso: r.progreso, registro: r.registro, repaso: r.repaso ?? {}, historial: r.historial ?? [], ajustes: r.ajustes ?? {} }
  return JSON.stringify(respaldo, null, 1) + '\n'
}

export class ErrorImportar extends Error {}

/**
 * Lee un archivo exportado. Si no es de esta app, dice qué pasó (N9). Un respaldo de antes de las favoritas
 * (versión 1, con el repertorio de la guía) también se lee: su avance pasa a los ids nuevos y las favoritas quedan vacías.
 */
export function importar(texto: string): Respaldo {
  let d: unknown
  try {
    d = JSON.parse(texto)
  } catch {
    throw new ErrorImportar('El archivo no se pudo leer: no es un respaldo de esta app (JSON dañado).')
  }
  const r = d as Partial<Omit<Respaldo, 'version'>> & { version?: number; repertorio?: { lineas?: unknown } }
  const v1 = r?.version === 1 && !!r.repertorio && Array.isArray(r.repertorio.lineas)
  const v2 = r?.version === 2 && Array.isArray(r.favoritas)
  if (r?.app !== 'chess-mis-aperturas' || !(v1 || v2)) {
    throw new ErrorImportar('Ese archivo no es un respaldo de esta app. Escoge el archivo que exportaste desde aquí.')
  }
  const progreso = r.progreso ?? {}
  const repaso = r.repaso ?? {}
  return {
    app: 'chess-mis-aperturas',
    version: 2,
    favoritas: v2 ? r.favoritas!.filter((x) => typeof x === 'string') : [],
    progreso: v1 ? migrarIds(progreso) : progreso,
    registro: r.registro ?? [],
    repaso: v1 ? migrarIds(repaso) : repaso,
    historial: Array.isArray(r.historial) ? r.historial : undefined,
    ajustes: r.ajustes && typeof r.ajustes === 'object' && !Array.isArray(r.ajustes) ? r.ajustes : undefined,
  }
}

/**
 * R3: importar un PGN (con variantes) a mi repertorio de un color. Cada línea del PGN entra como línea mía,
 * con el nombre del encabezado [Event] o "Importada de PGN", en el curso de la apertura con la que comparte
 * más jugadas. Las que ya estaban (iguales o dentro de una línea más larga) no se repiten.
 */
export function importarPgn(rep: Repertorio, color: ColorCorto, pgn: string): { repertorio: Repertorio; nuevas: number; yaEstaban: number; nombre: string } {
  const nombre = /\[Event\s+"([^"]+)"\]/.exec(pgn)?.[1]?.trim() || 'Importada de PGN'
  const lineas = lineasDePgn(pgn)
  if (lineas.length === 0) throw new ErrorPgn('No encontré jugadas en ese PGN.')
  let r = rep
  let nuevas = 0
  let yaEstaban = 0
  for (const jugadas of lineas) {
    const mias = r.lineas.filter((l) => l.color === color)
    if (mias.some((l) => l.jugadas.length >= jugadas.length && jugadas.every((s, i) => l.jugadas[i] === s))) {
      yaEstaban++
      continue
    }
    // la apertura (y su curso) de la línea mía que comparte más jugadas
    let mejor: { apertura: string; comun: number } = { apertura: 'propia', comun: 0 }
    for (const l of mias) {
      let i = 0
      while (i < l.jugadas.length && l.jugadas[i] === jugadas[i]) i++
      if (i > mejor.comun) mejor = { apertura: l.apertura, comun: i }
    }
    r = agregarPropia(r, color, jugadas, nombre, mejor.apertura)
    nuevas++
  }
  return { repertorio: r, nuevas, yaEstaban, nombre }
}
