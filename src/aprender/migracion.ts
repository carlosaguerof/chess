import { guardar, leer } from '../estado/almacen.ts'

/**
 * Nota 1 (L3): lo guardado en el navegador pasa al modelo de favoritas sin errores. El avance de las lecciones (y su
 * repaso) se conserva; el repertorio viejo se deja de usar y las favoritas empiezan vacías.
 *
 * Antes había dos formas de id de lección: las de mi repertorio ("caro-kann:b/b:caro-kann/avance-short") y las de
 * "solo en la base" ("siciliana:w/siciliana/smith-morra"). Ahora todas usan la primera.
 */
export const VERSION_MODELO = 2

/** El id de una lección en la forma nueva. */
export function idLeccionNuevo(id: string): string {
  const m = /^([^/:]+):([wb])\/(?![wb]:)(.+)$/.exec(id)
  return m ? `${m[1]}:${m[2]}/${m[2]}:${m[3]}` : id
}

/** Pasa las claves de un registro por id de lección (progreso o repaso) a la forma nueva, sin perder nada. */
export function migrarIds<T>(r: Record<string, T>): Record<string, T> {
  const nuevo: Record<string, T> = {}
  for (const [k, v] of Object.entries(r)) {
    const n = idLeccionNuevo(k)
    // si las dos formas existían para la misma lección, gana la que ya estaba en la forma nueva
    if (n === k || !(n in r)) nuevo[n] = v
  }
  return nuevo
}

/** Corre una sola vez al abrir la app. */
export function migrarAlModeloDeFavoritas(): void {
  if (leer<number>('modelo', 1) >= VERSION_MODELO) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  guardar('progreso', migrarIds(progreso && typeof progreso === 'object' ? progreso : {}))
  guardar('repaso', migrarIds(repaso && typeof repaso === 'object' ? repaso : {}))
  // el repertorio viejo (sembrado por mi guía) ya no se usa, pero no se borra: las favoritas empiezan vacías
  guardar('modelo', VERSION_MODELO)
}

/**
 * C3 (curso piloto de la Caro-Kann): la Caro-Kann con negras cambió a una lección por respuesta de blancas. Lo que ya
 * llevaba en el Repaso de hoy pasa a la lección nueva de la misma respuesta (se muda de nombre: no se pierde y no se cuenta
 * dos veces). Si la nueva ya tenía algo (dos viejas van a la misma), la primera de la lista gana y la otra se queda como estaba,
 * guardada en el teléfono aunque el Repaso ya no la saque.
 * El avance del curso nuevo (variantes terminadas en sus dos vueltas) empieza en cero.
 */
export const LECCIONES_CARO_KANN: Record<string, string> = {
  'avance-short': 'curso-avance-c3',
  'avance-short-cf3': 'curso-avance-short',
  'avance-van-der-wiel': 'curso-avance-van-der-wiel',
  'avance-tal': 'curso-avance-tal',
  'avance-bayoneta': 'curso-avance-bayoneta',
  'avance-bronstein': 'curso-avance-bronstein',
  clasica: 'curso-clasica',
  'clasica-cc3': 'curso-clasica',
  // las de una jugada mía distinta (3...c5, 4...Cd7) van a la lección de la misma respuesta de blancas (pase adversarial 1)
  'avance-botvinnik-carls': 'curso-avance-short',
  karpov: 'curso-clasica',
  'karpov-moderna': 'curso-clasica',
  'karpov-kasparov': 'curso-clasica',
  'cambio-rubinstein': 'curso-cambio',
  'panov-mieses': 'panov-principal',
  'dos-caballos': 'curso-dos-caballos',
  'dos-caballos-cf3': 'curso-oferta-final',
  'dos-caballos-cf3-apocalipsis': 'curso-apocalipsis',
  'panov-acelerado': 'curso-panov-acelerado',
  maroczy: 'curso-fantasia',
  hillbilly: 'curso-hillbilly',
}

/** Muda lo de cada lección vieja a su lección nueva (si la nueva aún no tiene nada). */
export function pasarCaroKann<T>(r: Record<string, T>): Record<string, T> {
  const nuevo = { ...r }
  const prefijo = 'caro-kann:b/b:caro-kann/'
  for (const [viejo, nueva] of Object.entries(LECCIONES_CARO_KANN)) {
    const v = r[prefijo + viejo]
    if (v !== undefined && !(prefijo + nueva in nuevo)) {
      nuevo[prefijo + nueva] = v
      delete nuevo[prefijo + viejo]
    }
  }
  return nuevo
}

/** Corre una sola vez al abrir la app. */
export function migrarAlCursoCaroKann(): void {
  if (leer<number>('modelo-caro-kann', 0) >= 1) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  if (progreso && typeof progreso === 'object') guardar('progreso', pasarCaroKann(progreso))
  if (repaso && typeof repaso === 'object') guardar('repaso', pasarCaroKann(repaso))
  guardar('modelo-caro-kann', 1)
}
