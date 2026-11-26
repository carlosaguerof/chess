# El mapa de la Alapin contra la Siciliana (2026-11-25)

> El mapa del curso `siciliana:w` (`conocimiento/cursos/alapin.json`), con su tabla de obligatorio y opcional. Lo revisó un evaluator independiente (el gate del mapa) y esta es la versión que quedó después de sus correcciones. Las comprobaciones del motor: `iterations/v4/comprobaciones-alapin.md`. Las pruebas: `tests/unit/curso-alapin.test.ts`.

## La pregunta y sus respuestas

**¿Qué pasó con tu peón de e4?** Con 2.c3 preparas d4 y le quitas c3 a tu caballo: por eso las dos respuestas principales del rival, 2...d5 y 2...Cf6, atacan tu e4 justo cuando no puedes defenderlo con Cc3 (Wikibooks, 2.c3).

| Entrada | La señal | El plan, en una frase | Lecciones |
|---|---|---|---|
| **El aislado** | Lo cambiaste en d5 y el rival retomó con la dama | Primero el caballo de g1 a f3, que defiende d4 (si sacas antes un alfil o el otro caballo, la dama del rival se come g2 o d4); si te clavan ese caballo, primero rompes la clavada. Cuando el rival cambia en d4, retomas con el peón de c3 y el caballo de b1 sale a c3 atacando a la dama. Después enrocas y no te apresuras a cambiar piezas. | Cambio Central (La base), Línea Moderna, 4...Cc6, 4...g6 (opcionales) |
| **La cadena** | Lo avanzaste a e5, con d4 detrás | Sacas tus piezas (Cf3, Ac4) y enrocas, apartando primero la pieza que te ataquen; si el rival cambia en e5, retomas con el caballo y juegas como en El aislado. | 2...Cf6 3.e5 Cd5 4.d4 (La base) |
| **Los dos peones del centro** | Sigue en e4 y pusiste d4 al lado | Primero atiendes lo que ataque tu e4. Contra un peón en d5: con su peón ya en e6, avanzas a e5; si no, cambias en d5 (sacar antes ♘f3 pierde e4: de 91 a 113). Contra un caballo: con su caballo de dama ya en c6, avanzas d4 a d5 (salvo con tu alfil en d3 y su peón en e6: ahí d5 pierde 142); si no, defiendes e4 con una pieza (Cc3, o Ad3 si c3 está ocupado). Después, primero el caballo de g1 a f3, que defiende d4, y el de b1 a c3; luego enrocas. | Sin lección en el mapa del gate; **dos lecciones desde el 2026-11-25** (D1 A de Carlos): 2...Cc6 con ...e6 (La base) y 2...d6 con ...g6 (Las que más te van a salir) |
| *Excepción:* **el gambito** | Lo cambiaste en d5 y el rival jugó 3...Cf6 | Casi cada jugada es la única buena: 4.Da4+, 5.Db3 contra b7 y, contra ...e6, 6.dxe6; sigues con un peón de más. | Gambito Anti-Alapin (opcional) |

**La regla para tu jugada 3** (y solo para ella: ahí se midió): si un peón ataca tu e4 (2...d5), lo cambias; si lo ataca el caballo (2...Cf6), lo avanzas; si nadie lo ataca (2...Cc6, 2...d6, 2...e6 o 2...g6), 3.d4. Con los dos peones del centro, avanzar ante un caballo pierde de 54 a 232 centipeones, y en las líneas de 2...d6, un peón.

## De 8 variantes de la base, 6 lecciones

Las tres de 2...Cf6 3.e5 Cd5 se separaban por una jugada mía (4.d4, o 4.Cf3 y después 5.Ac4 o 5.Ca3). Una sola jugada tuya por posición (`specs/cursos.md` §1): queda 4.d4, y 4.Cf3 va en `buenas`. El Ataque Stoltz y la Heidenfeld dejan de ser lecciones; lo guardado de ellas se muda a la de 4.d4 si esa no tiene nada (`LECCIONES_ALAPIN`).

## Obligatorio y opcional, con las partidas de este curso

Lichess CC0, septiembre de 2026, Rapid, los dos jugadores en la banda. Las partidas del curso: las que llegan a 1.e4 c5 (2,489 en 600–1000 y 13,988 en 1000–1400; de ellas, 32 y 555 con 2.c3). Las formas, siguiendo las jugadas del mapa.

| Entrada | 600–1000 | 1000–1400 |
|---|---|---|
| Los dos peones del centro | 71.9 % (n 32) | 55.0 % |
| La cadena | 21.9 % (n 7) | 13.4 % (más de la mitad, por 2...e6: tu Avance contra la Francesa) |
| El aislado | sin datos | 12.3 % |
| La excepción (gambito) | sin datos | sin datos |

| Lección | Entrada | 600–1000 | 1000–1400 | Sección |
|---|---|---|---|---|
| 2...Cf6 4.d4 | La cadena | 21.9 % (n 7) | 4.3 % (n 24) | La base |
| Cambio Central | El aislado | sin datos | 2.9 % (n 3) | La base |
| 4...Cc6 | El aislado | sin datos | 0.7 % (n 4) | Opcional |
| Línea Moderna | El aislado | sin datos | sin datos | Opcional |
| 4...g6 | El aislado | sin datos | sin datos | Opcional |
| Gambito | Excepción | sin datos | sin datos | Opcional |

**No hay salto en los datos:** con 32 partidas en 600–1000 no se puede hablar de un corte. Se usaron los de la Caro-Kann (5 % por forma y 2 % por lección). La lección base de El aislado es el Cambio Central por la transposición que sí tiene datos: 2...Cc6 3.d4 cxd4 4.cxd4 d5 5.exd5 Dxd5 6.Cf3 es su posición tras 6.Cf3, y llega en el 5.0 % de las Alapin de 1000–1400 (42.2 % × 64.2 % × 99 % × 18.8 %, 19 partidas).

## Las jugadas frecuentes del rival sin lección

| Jugada | 600–1000 | 1000–1400 | Adónde llega |
|---|---|---|---|
| 2...Cc6 | 43.8 % (n 14) | 42.2 % (n 234) | Casi siempre a Los dos peones del centro; con 4...d5 (18.8 %), a la posición del Cambio Central |
| 2...d6 | sin datos | 16.1 % (n 89) | A Los dos peones del centro |
| 2...e6 | sin datos | 13.2 % (n 73) | A La cadena, por 3.d4 d5 4.e5: es tu Avance contra la Francesa (misma posición) |

## Lo que decidió el gate

- **El Cambio Central enseña 7.Ae2, no 7.Cc3** (la mejor del motor, de 3 a 28 centipeones según la corrida): con 7.Cc3 la única buena del rival es 7...Axf3 8.gxf3 Dxd4, y el aislado desaparece. Con 7.Ae2 la forma se conserva, el plan y la lección piden lo mismo ("si te clavan el caballo, primero rompe la clavada") y sale la trampa de la dama glotona. 7.Cc3 va en `buenas`.
- **"Un caballo en e5" y "la ruptura d4-d5"** (de la investigación) no entran al plan del aislado: el motor los desmiente en sus lecciones.
- **La cadena no dura en su lección** (8...dxe5 9.Cxe5): su introducción lleva el "pero…".
- **La segunda vuelta del gate** corrigió la regla del caballo contra e4 (con su caballo de dama en c6, 4.Ad3 perdía un peón: ahí d5) y los planes viejos de la base de 4...Cc6 y del Cambio Central, que contradecían al curso.
- **El gambito no es una forma:** es la excepción de "lo cambiaste", con jugadas casi únicas. Su plan de antes ("no defiendas el peón a toda costa") fallaba en su propia línea, y se corrigió también en la base.

## Las lecciones de Los dos peones del centro (2026-11-25; D1 A de Carlos: "agregarles lección")

Carlos, en la sesión "Air - chess": "D1 A." (agregarles lección), "D2 A." (lo que cuenta en el Repaso y en el avance se queda como está; la Alapin con sus obligatorias por la regla) y "D3 A." (tus jugadas alternativas siguen como "buena jugada", sin lección). Las medidas: `iterations/v4/comprobaciones-alapin.md`, ids `D-…` y `S-cc6-…`, `S-d6-…`.

| Lección | Línea | Por qué esa | Sección |
|---|---|---|---|
| 2...Cc6, con ...e6 | 1.e4 c5 2.c3 Cc6 3.d4 cxd4 4.cxd4 e6 5.Cf3 Cf6 6.d5 | 2...Cc6 es la respuesta más jugada (43.8 % y 42.2 %) y la que más lleva a esta forma. Tras 4.cxd4, 4...e6 es la más jugada (31 de 101). 5.Cf3 es la regla de la página (primero el caballo de g1, que defiende d4) y está a 0.03 de la mejor. Tras 5.Cf3, 5...Cf6 y 5...d5 empatan (3 y 3): la lección sigue 5...Cf6, que conserva la forma (con 5...d5, la página dice avanzar a e5 y la forma pasa a ser La cadena). 6.d5 es la regla de la página contra el caballo con su caballo de dama en c6: no pierde material, pero 6.Cc3 es mejor (a 0.25–0.49): va en azul. | La base: la más jugada de su forma. Medida en 4...e6, la jugada que la nombra (revisión del 2026-11-26): 8.3 % (n 31) en 1000–1400, sin datos en 600–1000 (en 2...Cc6 eran 42.2 % y 43.8 %) |
| 2...d6, con ...g6 | 1.e4 c5 2.c3 d6 3.d4 cxd4 4.cxd4 Cf6 5.Cc3 g6 6.Cf3 Ag7 7.Ae2 0-0 8.0-0 | La siguiente que pide la regla: 2...d6 sale en 16.1 % (n 89) de las Alapin de 1000–1400. Tras 4.cxd4, 4...Cf6 (19 de 49), 5.Cc3 la regla de la página (defiendes e4 con una pieza; la mejor), 5...g6 (7 de 13), 6.Cf3 (4 de 7; la de la página, a 0.23 de la mejor) Ag7 (4 de 4); después, la mejor del motor. | Las que más te van a salir, **por el gate** (revisión del 2026-11-26). Medida en 5...g6, la jugada que la nombra, sale 2.7 % con 7 partidas, que no decide, y la regla la dejaría opcional. Se queda obligatoria, como la Checa en la Eslava, porque es la única lección del curso donde defiendes e4 con una pieza, la otra rama de la regla del caballo de la página (2...d6 sale en 16.1 % de tus Alapin) |

**La forma, medida otra vez.** Con las lecciones, el script juega lo del curso en sus posiciones (3.d4 contra 2...Cc6 en vez de lo que juega la gente), y Los dos peones del centro cuenta también un peón que avanzó de d4 a d5 contra un caballo, que es la regla de su página (`forma` en `scripts/frecuencias/alapin.mjs`). Los números quedan así (1000–1400): Los dos peones del centro, 63.8 % (antes 55.0 %); La cadena, 14.6 % (antes 13.4 %); El aislado, 12.3 %; la transposición al Cambio Central, 5.1 % (antes 5.0 %); 4...Cc6 (opcional), 1.1 % (antes 0.7 %). Ninguna lección de antes cambia de sección.

**Lo que no cambió:** la página de Los dos peones del centro conserva su plan y sus reglas; su última frase decía "Este curso no trae lección para estas jugadas" y ahora nombra sus dos lecciones. El mapa ya no dice "no tiene lección, pero sí plan". Lo que cuenta en el Repaso y en el avance es lo de antes (D2 A); las dos lecciones nuevas no tienen lección de antes que mudar.
