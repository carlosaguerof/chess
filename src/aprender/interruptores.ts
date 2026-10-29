import { GUIA } from '../repertorio/modelo.ts'

/**
 * Interruptores internos, sin pantalla (ajustes de la app, 2026-10-28). Lo que se apagó no se borró: su código y sus
 * datos siguen en el repo. Para prender algo se cambia aquí a `true` y se vuelve a construir la app.
 */

/**
 * "Mis favoritas" y el ♡ (Nota 1): para cuando haya varios usuarios y cada uno escoja las suyas. Hoy la app es de un
 * solo usuario y todo usa mis aperturas (MIS_APERTURAS). Prendido, Aprender vuelve a "Mis favoritas / Todas" con el
 * ♡, y las favoritas vuelven a ser el repertorio de la guía y de "Que juegue mis líneas".
 */
export const FAVORITAS_PRENDIDAS: boolean = false

/**
 * Las aperturas populares para principiantes que agregó la base (decisión 9): las de POPULARES. Apagado, no salen en
 * Aprender, ni en la guía, ni en lo que el bot juega para mí. Siguen en la base (`conocimiento/`) y en los libros de
 * los bots que las juegan como su estilo.
 */
export const POPULARES_PRENDIDAS: boolean = false

/**
 * La pantalla "Tus datos" (Nota 1). Apagada, la pantalla y su entrada en Más no existen: Exportar e Importar viven en
 * Ajustes → Respaldo (opción A de Carlos).
 */
export const TUS_DATOS_PRENDIDA: boolean = false

/**
 * Mis aperturas: los cursos de mi árbol (mi guía). Con blancas, la Italiana, la Alapin, el Avance contra la Caro-Kann
 * y contra la Francesa, la captura contra la Escandinava y principios contra lo demás; con negras, la Caro-Kann, la
 * Eslava y ...c6 + ...d5 contra lo demás.
 */
export const MIS_APERTURAS: string[] = GUIA.map((g) => `${g.apertura}:${g.color}`)

/** Los cursos que agregó la base como populares para principiantes (`conocimiento/fuentes-aperturas-populares.md`). */
export const POPULARES: string[] = ['londres:w', 'gambito-dama:w', 'siciliana:b', 'escandinava:b', 'gambito-dama-declinado:b']

/** ¿Este curso ("caro-kann:b") sale en la app? */
export function cursoActivo(id: string): boolean {
  return MIS_APERTURAS.includes(id) || (POPULARES_PRENDIDAS && POPULARES.includes(id))
}
