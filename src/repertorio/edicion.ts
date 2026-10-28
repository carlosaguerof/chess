import type { Base } from '../base/tipos.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import { lineaDeVariante, repertorioInicial, type LineaRepertorio, type Repertorio } from './modelo.ts'
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

export interface Respaldo {
  app: 'chess-mis-aperturas'
  version: 1
  repertorio: Repertorio
  /** lecciones terminadas */
  progreso: Record<string, { fecha: number }>
  /** registro por jugada (nota 1) */
  registro: unknown[]
  /** R7: los escalones y fechas del repaso */
  repaso?: Record<string, { escalon: number; proxima: string }>
}

/** El archivo que se descarga: JSON con formato fijo (exportar → importar → exportar da los mismos bytes). */
export function exportar(r: Omit<Respaldo, 'app' | 'version'>): string {
  const respaldo: Respaldo = { app: 'chess-mis-aperturas', version: 1, repertorio: r.repertorio, progreso: r.progreso, registro: r.registro, repaso: r.repaso ?? {} }
  return JSON.stringify(respaldo, null, 1) + '\n'
}

export class ErrorImportar extends Error {}

/** Lee un archivo exportado. Si no es de esta app, dice qué pasó (N9). */
export function importar(texto: string): Respaldo {
  let d: unknown
  try {
    d = JSON.parse(texto)
  } catch {
    throw new ErrorImportar('El archivo no se pudo leer: no es un respaldo de esta app (JSON dañado).')
  }
  const r = d as Partial<Respaldo>
  if (r?.app !== 'chess-mis-aperturas' || r.version !== 1 || !r.repertorio || !Array.isArray(r.repertorio.lineas)) {
    throw new ErrorImportar('Ese archivo no es un respaldo de tu repertorio. Escoge el archivo que exportaste desde esta app.')
  }
  return { app: 'chess-mis-aperturas', version: 1, repertorio: r.repertorio as Repertorio, progreso: r.progreso ?? {}, registro: r.registro ?? [], repaso: r.repaso ?? {} }
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
