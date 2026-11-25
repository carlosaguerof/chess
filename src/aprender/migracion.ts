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

/**
 * El curso de la Italiana por estructuras (2026-11-25, `specs/cursos.md` §6): siete lecciones cambian de línea de la base
 * (una variante `curso-…` con su continuación), y su id cambia con ella. Lo que ya llevaba en el Repaso y el avance de
 * la lección vieja pasa a la nueva de la misma respuesta, como en la Caro-Kann: se muda, no se copia. La línea principal del
 * Giuoco Pianissimo conserva su id. Las otras cinco de antes (6.Cbd2, el Canal y las tres de 4.Cg5) son otra jugada tuya, no
 * una lección (nota 3 del orchestrator, `specs/cursos.md` §1): lo suyo se queda guardado en el teléfono y en el Respaldo, y
 * deja de salir.
 */
export const LECCIONES_ITALIANA: Record<string, string> = {
  'dos-caballos-d3': 'curso-dos-caballos-d3',
  'clasica-la-bourdonnais': 'curso-la-bourdonnais',
  paris: 'curso-paris',
  'anti-higado-frito': 'curso-anti-higado-frito',
  hungara: 'curso-hungara',
  'blackburne-kostic': 'curso-blackburne-kostic',
  rousseau: 'curso-rousseau',
}

/** Muda lo de cada lección vieja de la Italiana a su lección nueva (si la nueva aún no tiene nada). */
export function pasarItaliana<T>(r: Record<string, T>): Record<string, T> {
  const nuevo = { ...r }
  const prefijo = 'italiana:w/w:italiana/'
  for (const [viejo, nueva] of Object.entries(LECCIONES_ITALIANA)) {
    const v = r[prefijo + viejo]
    if (v !== undefined && !(prefijo + nueva in nuevo)) {
      nuevo[prefijo + nueva] = v
      delete nuevo[prefijo + viejo]
    }
  }
  return nuevo
}

/**
 * La Eslava y "...c6 + ...d5 contra lo demás" pasaron al curso por estructuras (2026-11-25, `specs/cursos.md` §6). Como
 * en la Caro-Kann, lo que ya llevaba en el Repaso y el avance de cada lección vieja se muda a la lección nueva de la misma
 * respuesta del rival (no se copia: no cuenta dos veces). Las dos de una jugada mía distinta en la misma posición (la
 * Semieslava, 4...e6, y la Defensa de la Clavada, 4...Ag4) van a la lección de esa misma respuesta del rival, como la
 * Karpov en la Caro-Kann. Las que no cambiaron de línea (`checa-carlsbad`, `cambio-trifunovic`, `inglesa-gurevich` y
 * `reti-fianchetto`) conservan su id y no se tocan.
 */
export const LECCIONES_ESLAVA: Record<string, string> = {
  checa: 'curso-checa',
  'tranquila-schallopp': 'curso-tranquila-schallopp',
  cambio: 'curso-cambio',
  cc3: 'curso-cc3',
  'checa-clasica': 'curso-checa-clasica',
  'alekhine-e3': 'curso-alekhine-e3',
  'moderna-g3': 'curso-moderna-g3',
  geller: 'curso-geller',
  diemer: 'curso-diemer',
  // una jugada mía distinta (4...Ag4 y 4...e6): a la lección de la misma respuesta de blancas (4.e3 y 4.Cc3)
  'tranquila-clavada': 'curso-tranquila-schallopp',
  semieslava: 'curso-checa',
}

export const LECCIONES_OTROS_NEGRAS: Record<string, string> = {
  'inglesa-caro-kann': 'curso-inglesa-caro-kann',
  'inglesa-anglo-eslava-g3': 'curso-inglesa-anglo-eslava-g3',
  'reti-bogoljubow': 'curso-reti-bogoljubow',
  'larsen-clasica': 'curso-larsen-clasica',
  'otras-hungara': 'curso-otras-hungara',
  'otras-bird': 'curso-otras-bird',
}

/** Muda lo de cada lección vieja de un curso a su lección nueva (si la nueva aún no tiene nada). */
function mudarLecciones<T>(r: Record<string, T>, prefijo: string, tabla: Record<string, string>): Record<string, T> {
  const nuevo = { ...r }
  for (const [viejo, nueva] of Object.entries(tabla)) {
    const v = nuevo[prefijo + viejo]
    if (v !== undefined && !(prefijo + nueva in nuevo)) {
      nuevo[prefijo + nueva] = v
      delete nuevo[prefijo + viejo]
    }
  }
  return nuevo
}

/** Lo de la Eslava y lo de "...c6 + ...d5", cada uno con su tabla. */
export const pasarEslavaYOtrosNegras = <T>(r: Record<string, T>): Record<string, T> =>
  mudarLecciones(mudarLecciones(r, 'eslava:b/b:eslava/', LECCIONES_ESLAVA), 'otros-negras:b/b:otros-negras/', LECCIONES_OTROS_NEGRAS)

/** Corre una sola vez al abrir la app. */
export function migrarAlCursoEslava(): void {
  if (leer<number>('modelo-eslava', 0) >= 1) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  if (progreso && typeof progreso === 'object') guardar('progreso', pasarEslavaYOtrosNegras(progreso))
  if (repaso && typeof repaso === 'object') guardar('repaso', pasarEslavaYOtrosNegras(repaso))
  guardar('modelo-eslava', 1)
}

/**
 * Los cursos del Avance (2026-11-25), contra la Caro-Kann y contra la Francesa, pasan a la lección nueva por estructuras.
 * Cada lección vieja que sigue siendo obligatoria tiene su lección nueva de la misma línea (la misma fila de la base, ahora
 * con su continuación): lo que llevaba en el Repaso de hoy se muda ahí, como en la Caro-Kann. Las de tus otras cuartas
 * jugadas contra la Caro-Kann (4.Cf3, 4.Cc3, 4.h4, 4.g4, 4.Ce2) ya no son lecciones (`specs/cursos.md` §1, nota 3 del
 * 2026-11-25): lo suyo no se borra, se queda en el teléfono y en el Respaldo, y deja de salir. El avance del curso nuevo
 * empieza en cero.
 */
export const LECCIONES_AVANCE: Record<string, Record<string, string>> = {
  'caro-kann:w/w:caro-kann/': {
    'avance-short': 'avance-curso-short',
    'avance-botvinnik-carls': 'avance-curso-botvinnik-carls',
  },
  // las que pasan a opcionales (Lputian, Euwe, Wade y 3...Ad7) no se mudan: una opcional no sale en el Repaso (nota 6)
  'francesa:w/w:francesa/': {
    'avance-c3': 'curso-avance-c3',
    paulsen: 'curso-paulsen',
    'principal-a3': 'curso-principal-a3',
  },
}

/** Muda lo de cada lección vieja de los dos Avances a su lección nueva (si la nueva aún no tiene nada). */
export function pasarAvance<T>(r: Record<string, T>): Record<string, T> {
  const nuevo = { ...r }
  for (const [prefijo, tabla] of Object.entries(LECCIONES_AVANCE))
    for (const [viejo, nueva] of Object.entries(tabla)) {
      const v = r[prefijo + viejo]
      if (v !== undefined && !(prefijo + nueva in nuevo)) {
        nuevo[prefijo + nueva] = v
        delete nuevo[prefijo + viejo]
      }
    }
  return nuevo
}

/** Corre una sola vez al abrir la app. */
export function migrarAlCursoItaliana(): void {
  if (leer<number>('modelo-italiana', 0) >= 1) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  if (progreso && typeof progreso === 'object') guardar('progreso', pasarItaliana(progreso))
  if (repaso && typeof repaso === 'object') guardar('repaso', pasarItaliana(repaso))
  guardar('modelo-italiana', 1)
}

/** Corre una sola vez al abrir la app. */
export function migrarAlCursoAvance(): void {
  if (leer<number>('modelo-avance', 0) >= 1) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  if (progreso && typeof progreso === 'object') guardar('progreso', pasarAvance(progreso))
  if (repaso && typeof repaso === 'object') guardar('repaso', pasarAvance(repaso))
  guardar('modelo-avance', 1)
}

/**
 * La captura contra la Escandinava (2026-11-25) pasa al curso por estructuras. Cada lección vieja tiene su lección nueva
 * de la misma línea (la misma fila de la base, ahora con su continuación): lo que llevaba en el Repaso de hoy se muda
 * ahí, como en la Caro-Kann. La Grünfeld y la Transposición Panov no son lecciones del curso nuevo (se separan de otra
 * por una jugada mía; nota 2 del orchestrator): lo suyo se queda guardado y deja de salir. El avance del curso nuevo
 * empieza en cero.
 */
export const LECCIONES_ESCANDINAVA: Record<string, string> = {
  'da5-clasica': 'curso-clasica',
  'da5-lasker': 'curso-lasker',
  'dd6-bronstein': 'curso-bronstein',
  'dd6-schiller-pytel': 'curso-schiller-pytel',
  'dd8-valenciana': 'curso-valenciana',
  'moderna-marshall': 'curso-marshall',
  'moderna-gipslis': 'curso-gipslis',
  'moderna-richter': 'curso-richter',
}

/** Muda lo de cada lección vieja de la Escandinava a su lección nueva (si la nueva aún no tiene nada). */
export function pasarEscandinava<T>(r: Record<string, T>): Record<string, T> {
  const nuevo = { ...r }
  const prefijo = 'escandinava:w/w:escandinava/'
  for (const [viejo, nueva] of Object.entries(LECCIONES_ESCANDINAVA)) {
    const v = r[prefijo + viejo]
    if (v !== undefined && !(prefijo + nueva in nuevo)) {
      nuevo[prefijo + nueva] = v
      delete nuevo[prefijo + viejo]
    }
  }
  return nuevo
}

/** Corre una sola vez al abrir la app. */
export function migrarAlCursoEscandinava(): void {
  if (leer<number>('modelo-escandinava', 0) >= 1) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  if (progreso && typeof progreso === 'object') guardar('progreso', pasarEscandinava(progreso))
  if (repaso && typeof repaso === 'object') guardar('repaso', pasarEscandinava(repaso))
  guardar('modelo-escandinava', 1)
}

/**
 * El curso de la Alapin contra la Siciliana (2026-11-25) pasa a la lección nueva por estructuras. Cada lección vieja tiene
 * su lección nueva de la misma línea (la misma fila de la base, ahora con su continuación): lo que llevaba en el Repaso de
 * hoy y en el avance se muda ahí, como en la Caro-Kann. El Ataque Stoltz y la Heidenfeld se separaban de 4.d4 por una
 * jugada mía (4.Cf3) y ya no son lecciones (`specs/cursos.md` §1, nota 2 del 2026-11-25): lo suyo va a la de la misma
 * respuesta del rival (2...Cf6 3.e5 Cd5), como 3...c5 en la Caro-Kann; si esa ya tiene algo, se queda como estaba,
 * guardado en el teléfono y en el Respaldo. Si la lección nueva es opcional, lo mudado se queda guardado y no sale en el
 * Repaso (lo decide el filtro común de las opcionales). El avance del curso nuevo empieza en cero.
 */
export const LECCIONES_ALAPIN: Record<string, string> = {
  'alapin-d5-cambio-central': 'alapin-curso-cambio-central',
  'alapin-cf6-d4': 'alapin-curso-cf6-d4',
  'alapin-d5-moderna': 'alapin-curso-moderna',
  'alapin-d5-cc6': 'alapin-curso-cc6',
  'alapin-d5-g6': 'alapin-curso-g6',
  'alapin-gambito-anti-alapin': 'alapin-curso-gambito',
  // las de una jugada mía distinta (4.Cf3) van a la lección de la misma respuesta del rival
  'alapin-cf6-stoltz': 'alapin-curso-cf6-d4',
  'alapin-cf6-heidenfeld': 'alapin-curso-cf6-d4',
}

/** Muda lo de cada lección vieja de la Alapin a su lección nueva (si la nueva aún no tiene nada). */
export function pasarAlapin<T>(r: Record<string, T>): Record<string, T> {
  const nuevo = { ...r }
  const prefijo = 'siciliana:w/w:siciliana/'
  for (const [viejo, nueva] of Object.entries(LECCIONES_ALAPIN)) {
    const v = r[prefijo + viejo]
    if (v !== undefined && !(prefijo + nueva in nuevo)) {
      nuevo[prefijo + nueva] = v
      delete nuevo[prefijo + viejo]
    }
  }
  return nuevo
}

/** Corre una sola vez al abrir la app. */
export function migrarAlCursoAlapin(): void {
  if (leer<number>('modelo-alapin', 0) >= 1) return
  const progreso = leer<Record<string, { fecha: number }>>('progreso', {})
  const repaso = leer<Record<string, unknown>>('repaso', {})
  if (progreso && typeof progreso === 'object') guardar('progreso', pasarAlapin(progreso))
  if (repaso && typeof repaso === 'object') guardar('repaso', pasarAlapin(repaso))
  guardar('modelo-alapin', 1)
}
