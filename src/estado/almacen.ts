/** Guardado en el navegador (localStorage) con claves versionadas. Nunca lanza: si no se puede leer, devuelve el valor por defecto. */
const PREFIJO = 'ajedrez.v1.'

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const t = localStorage.getItem(PREFIJO + clave)
    return t === null ? porDefecto : (JSON.parse(t) as T)
  } catch {
    return porDefecto
  }
}

export function guardar<T>(clave: string, valor: T): void {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
  } catch {
    /* sin espacio o bloqueado: la app sigue */
  }
}

export function borrar(clave: string): void {
  try {
    localStorage.removeItem(PREFIJO + clave)
  } catch {
    /* nada */
  }
}

export const CLAVES = {
  partida: 'partida',
  ajustes: 'ajustes',
} as const
