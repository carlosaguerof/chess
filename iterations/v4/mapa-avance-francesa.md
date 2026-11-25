# El mapa del curso «Avance contra la Francesa» (2026-11-25)

El curso `francesa:w` (`conocimiento/cursos/avance-francesa.json`), por estructuras (`specs/cursos.md` §6). Juegas con blancas: 1.e4 e6 2.d4 d5 3.e5. Cada afirmación del motor, con su comando y su resultado, está en `comprobaciones-avance-francesa.md`; las partidas son de lichess (CC0, database.lichess.org, Rapid, septiembre de 2026), en dos bandas: 600–1000 y 1000–1400.

## La pregunta y sus tres formas

**¿Qué pasó con d4, la base de tu cadena?** Negras la ataca con su peón de c (3...c5), y tú la sostienes con 4.c3. Las dos primeras formas son las mismas del curso del Avance contra la Caro-Kann.

| Forma (etiqueta en la página) | Cómo se reconoce (con chess.js, en toda la línea) | Tu plan, como lo dice el curso | Comprobado en |
|---|---|---|---|
| **La cadena entera** («Nadie cambia en d4») | Tus peones de d4 y e5 siguen, tienes peón en c3, negras no empujó a c4 y nadie ha cambiado en d4 | Sostener d4 con c3 y Cf3. Contra un caballo que va a f5, suma un defensor antes de enrocar: el caballo de b1 por a3 a c2; con tus caballos en f3 y c2, tu alfil puede ir a d3, contra el caballo de f5. Si negras cambia en d4, retomas con el peón de c | `P-fr-cadena`, `P-fr-cge7-ad3`, `N9-fr-cxd4`, `N11-fr-cge7` |
| **La base sola** («Negras cambia en d4») | Negras cambió en d4 y retomaste con el peón de c: ningún peón defiende d4 | Defender d4 con piezas: si negras suma un atacante, suma un defensor o echa al atacante (Ca3-c2, Ab2 tras b4, o Ca4 contra la dama en b6). Con tu caballo ya en c3 y sin la dama de negras en b6, h4, y más adelante g4, echa al caballo de f5 | `P-fr-sola`, `P-fr-sola-h4`, `N11-fr-sola` |
| **La cadena cerrada** («Negras empuja a c4») | Negras empujó su peón a c4: ningún peón suyo ataca d4 | Desarrollarte con calma, sin empujar b4 de inmediato. Con tu alfil en e2 y tu rey enrocado, h3 y Te1, y juegas en el lado de rey; si su caballo salta a b3, lo cambias con el tuyo de d2 | `P-fr-cerrada`, `P-fr-cerrada-h3`, `N11-fr-cerrada` |

## Cuánto sale cada forma

Entre tus partidas que llegan a 1.e4 e6 2.d4 d5 (juegas 3.e5 y lo del curso), a la media jugada 14:

| Forma | 600–1000 (313 partidas) | 1000–1400 (2558) |
|---|---|---|
| La cadena entera | 84.9 % | 78.8 % |
| La base sola | 15.1 % | 14.6 % |
| La cadena cerrada | 0 % (n chica) | 3.4 % |
| Sin peón en e5 | 0 % | 2.1 % |
| Sin peón en d4 | 0 % | 1.1 % |

## Las lecciones

La regla (`specs/cursos.md` §6): cada forma que sale en 5 % o más trae a La base su lección más jugada; las demás lecciones de 2 % o más de tus partidas van a "Las que más te van a salir"; el resto, a Opcional. La frecuencia se mide en la posición que define la lección en la base.

| Sección | Lección | Línea | Forma | Frecuencia, en la posición que la define | De tus partidas del curso |
|---|---|---|---|---|---|
| La base | **4...cxd4** (`cambio-d4`, base `curso-avance-c3`) | 3.e5 c5 4.c3 cxd4 5.cxd4 Cc6 6.Cf3 Cge7 7.a3 Cf5 8.Cc3 | la base sola | 4...cxd4 tras 4.c3: 15.3 % en 1000–1400 (65 de 425); 3 de 10 en 600–1000 | 6.5 % y 7.5 % |
| La base | **5...Cge7 (Paulsen)** (`cge7`, base `curso-paulsen`) | …4...Cc6 5.Cf3 Cge7 6.Ca3 Cf5 7.Cc2 | la cadena entera | 5...Cge7 tras 5.Cf3: 15.9 % en 1000–1400 (22 de 138); 0 de 4 en 600–1000 | 3.7 % |
| Las que más te van a salir | **5...Db6 (línea principal)** (`principal`, base `curso-principal-a3`) | …5.Cf3 Db6 6.a3 c4 7.Cbd2 Ca5 8.Ae2 Ad7 9.0-0 | la cadena cerrada | 5...Db6 tras 5.Cf3: 47.1 % en 1000–1400 (65 de 138); 3 de 4 en 600–1000. Lo que sigue a 6.a3 no se puede medir (5 partidas) | 10.8 % y 9.3 % |
| Opcional | 6...Ch6 (Lputian) (`lputian`) | …6.a3 Ch6 7.b4 cxd4 8.cxd4 Cf5 9.Ab2 | la base sola | 0 de 5 tras 6.a3 | 0 % |
| Opcional | 5...Ad7 (Euwe) (`euwe`) | …5.Cf3 Ad7 6.Ae2 Cge7 7.Ca3 cxd4 8.cxd4 Cf5 9.Cc2 | la base sola | 7.2 % (10 de 138) | 1.7 % |
| Opcional | 4...Db6 y 5...Ad7 (Wade) (`wade`) | …4...Db6 5.Cf3 Ad7 6.Ae2 Ab5 7.0-0 Axe2 8.Dxe2 | la cadena entera | 10.9 % (5 de 46) | 0.7 % |
| Opcional | 3...Ad7 (cambio de alfil) (`cambio-alfil`) | 3.e5 Ad7 4.Cf3 a6 5.c3 Ab5 6.Axb5+ axb5 7.0-0 | la cadena entera | 1.6 % (21 de 1345) | 0.9 % |

- La base sola y la cadena entera pasan de 5 %: traen 4...cxd4 y la Paulsen, la lección más jugada de cada una (en la cadena entera, la Wade sale en 0.7 % y el cambio de alfil en 0.9 %). La cadena cerrada sale en 3.4 %: la línea principal entra por su frecuencia, en "Las que más te van a salir".
- Las dos lecciones de La base no piden las mismas jugadas ni terminan en la misma posición. Si dos lecciones llegan a la misma posición, piden la misma jugada tuya (`tests/unit/curso-avance.test.ts`).
- Los dos «¿Y si…?» de Errores y trampas: 5.Ad3 (`E-fr-ad3`: ...cxd4 y ...Cxd4 ganan el peón) y 6.Ae3 con la dama en b6 (`E-fr-ae3`: ...Dxb2 y ...Dxa1).

## Fuera del mapa, sin lección

Aquí el porcentaje es de tus partidas del curso desde 1.e4 e6 (las proporciones de las jugadas del rival, con tus jugadas fijas); el de las lecciones, arriba, es el de su posición.

| Respuesta | De tus partidas (600–1000 / 1000–1400) | Qué dice la página del mapa | Comprobado en |
|---|---|---|---|
| **Sin 2...d5** (2...Dh4, 2...Cf6, 2...d6, 2...Cc6, 2...c5, 2...c6) | 8.3, 8.2, 6.3, 5.5, 3.1 y 2.5 % / 4.6, 3.5, 6.5, 2.6, 5.8 y 5.2 % | Todavía no hay cadena: contra 2...Cf6, 3.e5 echa al caballo; contra 2...Dh4, 3.Cc3 defiende e4; contra lo demás, 3.Cf3 | `P-fr-sin-d5` (3.Cf3 contra 2...Dh4 pierde e4: por eso no se dice) |
| **3...Cc6** | 13.2 % (27) / 6.7 % (153) | No golpea d4 con su peón de c: lo tapa. 4.Cf3. Si ataca e5 con ...f6, 5.Ad3, y si cambia en e5, retomas con el caballo; contra ...Ab4+, 5.c3 | `P-fr-3cc6` |

Las demás respuestas a 3.e5 salen en menos de 5 % en las dos bandas.

## Cómo se comprobó

- **Cada jugada tuya** es la mejor del motor o está a 0.2 o menos (Stockfish 19 lite, un hilo, profundidad 18). 7.a3 en 4...cxd4 es la mejor; 6.Ca3 en la Paulsen va rumbo a c2.
- **Cada plan**, al final de su lección y contra las dos respuestas más jugadas en cada posición de la lección donde mueve el rival (con 3 partidas o más); sin partidas, contra las dos mejores del motor y contra la respuesta del libro: las líneas de la base, que salen de Wikibooks y Wikipedia. Wikibooks no tiene página de ninguna de las doce posiciones sin partidas de este curso.
- **Cada jugada que nombra una regla**, en cada posición del curso donde aparece su señal, también con las jugadas naturales del rival ya en el tablero y una jugada antes del final de cada lección. Donde una regla falló, la frase dice dónde vale: el alfil de c1 no sale "en la jugada 6" (`N9-fr-c1`), no se toma en h6 "en tu jugada 7" (`N9-fr-h6`), h4 "con tu caballo ya en c3 y sin la dama de negras en b6" (`N9-fr-h4-fuera`, `N11-fr-sola`), Ad3 "con tus caballos en f3 y c2" (`N9-fr-ad3-fuera`), h3 y Te1 "con tu alfil en e2 y tu rey enrocado" (`N9-fr-h3-fuera`), y contra ...Cb3, Cxb3 (`N11-fr-cerrada`).
- **Lo que queda sin medir:** en 600–1000, las lecciones de la línea principal y de la Paulsen tienen 4 partidas o menos en su posición; lo que sigue a 6.a3 no se puede medir en ninguna banda.
