import { exportar, type Respaldo } from '../repertorio/edicion.ts'
import { guardarProgreso, leerProgreso } from '../repertorio/estado.ts'
import { guardarRegistro, leerRegistro } from '../registro/almacen-registro.ts'
import { guardarRepaso, leerRepaso } from '../repaso/repaso.ts'
import { guardarFavoritas, leerFavoritas } from '../aprender/favoritas.ts'
import { leerHistorial } from '../historial/historial.ts'
import { abiertaComoApp } from './instalada.ts'
import { clavesGuardadas, guardar, leer } from './almacen.ts'
import type { EntradaRegistro } from '../registro/registro.ts'

/**
 * "Respaldo" en Ajustes (ajustes de la app, 2026-10-28; opción A de Carlos): todo vive solo en esta app, en este
 * teléfono. Exportar guarda todo en un archivo; Importar lo carga de vuelta (después de borrar la app, en un teléfono
 * nuevo, o para pasar el avance de la pestaña de Safari a la app instalada: en el iPhone son copias separadas).
 */

/** Lo que va en sus propias partes del archivo, o no se respalda: la partida a medias, la versión del modelo y el repertorio viejo. */
const NO_SON_AJUSTES = new Set(['favoritas', 'progreso', 'registro', 'repaso', 'historial', 'partida', 'modelo', 'repertorio'])

/** Los ajustes y lo demás guardado, por clave (sonido, estilo, estrellas, último bot, opciones de la partida…). */
function ajustesGuardados(): Record<string, unknown> {
  const r: Record<string, unknown> = {}
  for (const k of clavesGuardadas()) if (!NO_SON_AJUSTES.has(k)) r[k] = leer<unknown>(k, null)
  return r
}

/** El archivo con todo lo que la app guarda. */
export function textoDelRespaldo(): string {
  return exportar({ favoritas: leerFavoritas(), progreso: leerProgreso(), registro: leerRegistro(), repaso: leerRepaso(), historial: leerHistorial(), ajustes: ajustesGuardados() })
}

export const nombreDelArchivo = (hoy = new Date()) => `mis-aperturas-${hoy.toISOString().slice(0, 10)}.json`

/**
 * Exportar: en una pestaña, se descarga el archivo. Abierta como app en el iPhone, se ofrece compartirlo (de ahí,
 * "Guardar en Archivos" o iCloud Drive), porque en ese modo descargar puede no dejar el archivo a la mano; si no se
 * puede compartir, se descarga.
 */
export async function exportarMisDatos(hoy = new Date()): Promise<'descargado' | 'compartido' | 'cancelado'> {
  const texto = textoDelRespaldo()
  const nombre = nombreDelArchivo(hoy)
  if (abiertaComoApp() && typeof navigator.share === 'function' && typeof File === 'function') {
    const archivo = new File([texto], nombre, { type: 'application/json' })
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: nombre })
        return 'compartido'
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return 'cancelado'
        // si compartir falla por otra cosa, se descarga
      }
    }
  }
  const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'descargado'
}

/** Importar: reemplaza lo que hay en la app con lo del archivo (lo que el archivo no trae, se queda como está). */
export function cargarRespaldo(r: Respaldo): void {
  guardarFavoritas(r.favoritas)
  guardarProgreso(r.progreso)
  guardarRegistro(r.registro as EntradaRegistro[])
  guardarRepaso(r.repaso ?? {})
  if (r.historial) guardar('historial', r.historial)
  for (const [k, v] of Object.entries(r.ajustes ?? {})) if (!NO_SON_AJUSTES.has(k)) guardar(k, v)
  // los retratos escuchan este aviso para cambiar de estilo al momento (bots/retratos.ts)
  window.dispatchEvent(new Event('estilo-retratos'))
}

/** Lo que trae un archivo, en palabras: "12 lecciones aprendidas y 5 partidas". */
export function resumenDelRespaldo(r: Respaldo): string {
  const lecciones = Object.keys(r.progreso).length
  const partidas = r.historial?.length
  const l = `${lecciones} ${lecciones === 1 ? 'lección aprendida' : 'lecciones aprendidas'}`
  return partidas === undefined ? l : `${l} y ${partidas} ${partidas === 1 ? 'partida' : 'partidas'}`
}
