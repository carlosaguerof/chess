/**
 * Un curso que dejó de verse y el curso que queda en su lugar (Carlos, 2026-11-25: en Con negras, una sola Caro-Kann,
 * la de estructuras; `specs/cursos.md` §6). El de antes sigue en el repo: sus datos son la base de la capa, sus
 * lecciones siguen siendo las fichas de Repaso de esas líneas, y lo que llevaba guardado no se toca. En Aprender, su
 * tarjeta abre el que queda; su dirección lleva al que queda; y una lección que terminé en él sale hecha en el que queda
 * (`leerAvance`). Para regresar a las dos tarjetas basta con quitarlo de aquí.
 */
export const CURSO_QUE_QUEDA: Record<string, string> = {
  'caro-kann:b': 'caro-kann-estructuras:b',
}

/** El curso que queda en lugar de este, si este dejó de verse. */
export const cursoQueQueda = (id: string): string | undefined => CURSO_QUE_QUEDA[id]

/** Los cursos de antes que este reemplaza (su avance de las lecciones cuenta aquí). */
export const cursosDeAntes = (id: string): string[] => Object.keys(CURSO_QUE_QUEDA).filter((k) => CURSO_QUE_QUEDA[k] === id)
