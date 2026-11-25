# El mapa del curso «Avance contra la Caro-Kann» (2026-11-25)

El curso `caro-kann:w` (`conocimiento/cursos/avance-caro-kann.json`), por estructuras (`specs/cursos.md` §6). Juegas con blancas: 1.e4 c6 2.d4 d5 3.e5. Cada afirmación del motor, con su comando y su resultado, está en `comprobaciones-avance-caro-kann.md`; las partidas son de lichess (CC0, database.lichess.org, Rapid, septiembre de 2026), en dos bandas: 600–1000 y 1000–1400.

## La pregunta y sus dos formas

**¿Qué pasó con d4, la base de tu cadena?** Negras la ataca con su peón de c, y tú la sostienes. Es la misma pregunta que en el curso del Avance contra la Francesa, con las mismas dos primeras formas.

| Forma (etiqueta en la página) | Cómo se reconoce (con chess.js, en toda la línea) | Tu plan, como lo dice el curso | Comprobado en |
|---|---|---|---|
| **La cadena entera** («Nadie cambia en d4») | Tus peones de d4 y e5 siguen, tienes peón en c3 y nadie ha cambiado en d4 | Esquema c3, Cf3, Ae2 y 0-0. Si negras cambia en d4, retomas con el peón de c y pasas a la base sola. Ya enrocado y con tu caballo en d2, h3 le pregunta al alfil de g4 | `P-ck-af5`, `P-ck-af5-h3`, `N9-ck-cxd4`, `N11-ck-af5` |
| **La base sola** («Negras cambia en d4») | Negras cambió en d4 y retomaste con el peón de c: ningún peón defiende d4 | El mismo esquema y un aviso: cuenta atacantes y defensores de d4 antes de cada jugada. Después de ...cxd4 y cxd4, contra la clavada del alfil de g4, tu alfil va a e2, no a d3; tu caballo de b1, a d2 (tapa a tu dama un momento, pero si negras cambia en f3, retomas con él); si su caballo llega a f5, h3 | `P-ck-c5`, `P-ck-c5-cbd2`, `P-ck-c5-h3`, `N9-ck-ae2` |

La Francesa tiene una tercera forma (la cadena cerrada, ...c4); contra la Caro-Kann sale en 0.5 % de tus partidas de 1000–1400: no es forma de este curso.

## Cuánto sale cada forma

Entre tus partidas que llegan a 1.e4 c6 2.d4 d5 (juegas 3.e5 y lo del curso), a la media jugada 14:

| Forma | 600–1000 (610 partidas) | 1000–1400 (4652) |
|---|---|---|
| La cadena entera | 97.1 % | 84.9 % |
| La base sola | 0 % (n chica) | 10.6 % |
| Sin peón en d4 | 0 % | 2.4 % |
| Sin peón en e5 | 2.9 % | 1.7 % |
| La cadena cerrada | 0 % | 0.5 % |

## Las lecciones

Tu jugada es una sola en cada posición (`specs/cursos.md` §1): contra 3...Af5, 4.c3. Tus otras cuartas jugadas de la base que el motor no separa de 4.c3 (a 0.2 o menos: 4.Cd2, 4.h4, 4.Cf3, 4.Ae2, 4.Cc3 y 4.g4, `M-ck-4c3`) van en "buenas" de 4.c3; 4.Ce2 pierde 34 cp y no va. Lo guardado de esas líneas no se borra; deja de salir.

| Sección | Lección | Línea | Forma | Frecuencia, en la posición que la define | Por qué es obligatoria |
|---|---|---|---|---|---|
| La base | **3...Af5 4.c3** (`af5`, base `avance-curso-short`) | 3.e5 Af5 4.c3 e6 5.Ae2 c5 6.Cf3 Cc6 7.0-0 Ag4 8.Cbd2 | la cadena entera | 3...Af5 tras 3.e5: 34.7 % (59 de 170) y 52.4 % (1225 de 2336) | su forma sale en más de 5 % y es la más jugada de ella |
| La base | **3...c5 (Botvinnik-Carls)** (`c5`, base `avance-curso-botvinnik-carls`) | 3.e5 c5 4.c3 Cc6 5.Cf3 cxd4 6.cxd4 Ag4 7.Ae2 e6 8.0-0 | la base sola | 3...c5 tras 3.e5: 21.8 % (37 de 170) y 29.5 % (689 de 2336) | su forma sale en más de 5 % en 1000–1400 y es la más jugada de ella |

Sin opcionales: la pregunta para Carlos, en el reporte, es si sus otras cuartas jugadas vuelven como lecciones opcionales.

Los dos «¿Y si…?» de Errores y trampas: 5.Ad3 contra 3...c5 (`E-ck-5ad3`: ...cxd4 y ...Cxd4 ganan el peón) y Ad3 contra la clavada de g4 en la base sola.

## Fuera del mapa, sin lección

Aquí el porcentaje es de tus partidas del curso desde 1.e4 c6 (las proporciones de las jugadas del rival, con tus jugadas fijas); el de las lecciones, arriba, es el de su posición.

| Respuesta | De tus partidas (600–1000 / 1000–1400) | Qué dice la página del mapa | Comprobado en |
|---|---|---|---|
| **3...e6** | 16.6 % (31) / 8.9 % (223) | Lleva a la cadena entera: si negras encierra su alfil y después golpea con ...c5 contra tu c3, es la misma forma | `P-ck-e6` |
| **3...f6** | 7.5 % (14) / 3.7 % (92) | Contra 3...f6 o 3...Cd7, sigue con c3 y Cf3; si negras cambia en e5, retomas | `P-ck-sin-leccion` |
| **3...Cd7** | 5.4 % (10) / menos de 2 % | (la misma frase) | `P-ck-sin-leccion` |

Las demás respuestas a 3.e5 salen en menos de 5 % en las dos bandas. Antes de 3.e5, negras contesta 2...d5 en 91 % y 94 % de tus partidas.

## Cómo se comprobó

- **Cada jugada tuya** es la mejor del motor o está a 0.2 o menos (Stockfish 19 lite, un hilo, profundidad 18).
- **Cada plan**, al final de su lección y contra las dos respuestas más jugadas en cada posición de la lección donde mueve el rival (con 3 partidas o más); sin partidas, contra las dos mejores del motor y contra la respuesta del libro: las líneas de la base, que salen de Wikibooks y Wikipedia. Wikibooks no tiene página de ninguna de las tres posiciones sin partidas de este curso.
- **Cada jugada que nombra una regla**, en cada posición del curso donde aparece su señal, también con las jugadas naturales del rival ya en el tablero y una jugada antes del final de cada lección. Donde una regla falló, la frase dice dónde vale: h3 "ya enrocado y con tu caballo en d2" (`N9-ck-h3-fuera`: en el 3...c5 sin enrocar, h3 pierde d4 o b2); y en el 3...c5 el caballo de b1 va a d2, no a c3 (`P-ck-c5-cbd2`: con ...Db6 ya jugada, Cc3 pierde d4).
- **Lo que queda sin medir:** en 600–1000, la base sola no sale (n chica: 37 partidas con 3...c5 y ninguna llega a ...cxd4 con tu c3 a la media jugada 14).
