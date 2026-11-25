# El mapa del curso de la captura contra la Escandinava, y su tabla de obligatorio y opcional (2026-11-25)

> El mapa del curso `escandinava:w` (`conocimiento/cursos/escandinava.json`), con su regla de obligatorio y opcional (`specs/cursos.md` §6) medida en las partidas de este curso. Es la versión que quedó tras las dos vueltas del gate del mapa: un evaluator independiente midió cada regla donde se usa; en la primera se corrigieron cuatro, y en la segunda, dos reglas que todavía regalaban un peón cuando el rival ya tenía otra jugada natural en el tablero. Las comprobaciones del motor, con su comando: `iterations/v4/comprobaciones-escandinava.md`. Las partidas: la base abierta de lichess (CC0), septiembre de 2026, Rapid, los dos jugadores en la banda (600–1000 o 1000–1400), contadas por la corrida de frecuencias del 2026-11-25 (fuera de este repo).

## En corto

- **La pregunta:** ¿a dónde se fue la dama cuando la atacaste con 3.Cc3? (Tras 1.e4 d5 2.exd5, negras casi siempre recupera el peón con la dama, y tu caballo la ataca.)
- **Cuatro entradas en el mapa, cada una con su señal y su jugada:**
  - **La clavada:** la dama fue a a5. Con d4, tu caballo de c3 queda clavado: antes de moverlo, Ad2. El salto Cd5 destapa a tu alfil de d2 contra la dama, con tu caballo de f3 ya afuera, tu alfil en c4 apoyándolo y sin un alfil de negras en b4 (si llega a b4, primero a3). Si en su cuarta jugada negras saca ...Cc6, d5. Contra ...Ag4, con tu caballo en f3: h3, salvo con un caballo de negras en c6; ahí, d5.
  - **La dama en casa:** la dama volvió a d8. Ya no hay a quién atacar: d4, sacas tus piezas y enrocas. Si en su cuarta jugada negras saca ...Cc6, d5. Contra ...Ag4, con tu caballo en f3: h3, salvo con un caballo de negras en c6 (ahí, d5) o con tu alfil en c4 y ...c6 jugado (ahí, Ae2). Si cambia en f3, retomas con una pieza, y si después saca su caballo a c6, Ab5 lo clava (pase adversarial 3).
  - **El jaque:** la dama dio jaque en e5 o e6. Lo tapas con Ae2 y sigues sacando piezas sin regalar nada: con la dama en e5 la vuelves a atacar, contra ...Ag4 d4 y contra lo demás Cf3; con la dama en e6, contra ...Cc6 d4 (amenaza d5) y contra lo demás Cf3. Si se va a c6, Ab5 la gana. Cuando se vaya, mira a dónde fue y sigue el mapa. **Sin lección** (notas 1 y 7).
  - **El centro grande:** negras no recuperó con la dama sino con el caballo (2...Cf6 3.d4 Cxd5). d4 y Cf3; después c4 echa al caballo y te quedas con c4 y d4 (si su alfil sale a f5, primero Ad3 y lo cambias). Mantén d4 defendido; con tu caballo en c3, si un caballo de negras va a c6, d5 lo echa.
- **La dama en d6 queda fuera del mapa:** sale en 2.9 % y 2.5 % (menos del 5 %, como las formas chicas de la Caro-Kann). Sus dos lecciones son opcionales y van sin etiqueta.
- **8 lecciones: 4 obligatorias y 4 opcionales.** La base: Clásica (la clavada), Valenciana (la dama en casa), Gipslis (el centro grande). Las que más te van a salir: Lasker. Opcional: Bronstein y Schiller-Pytel (fuera del mapa), Marshall y Richter.
- **Una sola jugada tuya por posición (nota 2):** la Grünfeld (6.Ce5) y la Transposición Panov (3.c4) se separan por una jugada tuya: no son lecciones, quedan como buena jugada (azul).

## Las entradas del mapa

| Entrada | La señal | Qué juegas (como queda escrito en la página) | Fuente |
|---|---|---|---|
| **La clavada** | La dama de negras en a5 | "Sacas tus piezas y, antes de mover ese caballo, Ad2. Si en su cuarta jugada negras saca ...Cc6, d5 lo echa. Contra ...Ag4, con tu caballo en f3: h3, salvo con un caballo de negras en c6; ahí, d5. El salto Cd5 destapa a tu alfil de d2 contra la dama: juégalo con tu caballo de f3 ya afuera, tu alfil en c4 apoyándolo y sin un alfil de negras en b4: si ese alfil llega a b4, primero a3." | WB 3...Da5 ("it frees the d2 square for the bishop, so that White might move their knight with tempo on the black queen"; tabla 7.Ad2 e6 8.Cd5 Dd8 9.Cxf6+ gxf6), WP (línea principal con Ac4 y Ad2), motor |
| **La dama en casa** | La dama de negras de vuelta en d8 | "Ocupas el centro con d4, sacas tus piezas y enrocas. Si en su cuarta jugada negras saca ...Cc6, d5 lo echa. Contra ...Ag4, con tu caballo en f3: h3, salvo con un caballo de negras en c6; ahí, d5. Si cambia en f3, retomas con la dama." | WB 3...Dd8 ("White now has a free hand to continue development"; 6.h3 Axf3 7.Dxf3; "7...Qxd4?? allows 8. Qxb7"), motor |
| **El jaque** | La dama de negras da jaque en e5 o e6 | "Lo tapas con tu alfil de f1: Ae2. Después sigues sacando piezas sin regalar nada. Con la dama en e5, la vuelves a atacar: contra ...Ag4, d4; contra lo demás, Cf3. Con la dama en e6: contra ...Cc6, d4, que amenaza d5 contra la dama y el caballo; contra lo demás, Cf3. Si la dama se va a c6, Ab5 la clava contra su rey y la ganas. Cuando la dama se vaya, mira a dónde fue y sigue el mapa." | WB 3.Cc3 ("common amateur tries, but they do not accomplish much for Black. 4. Be2 and White has developed another piece"; "3...Qc6?? and Bb5 pins it to the king"), WP ("gives White a handy lead in development"), partidas, motor |
| **El centro grande** | Negras recuperó con el caballo (en d5) | "d4 y Cf3; después c4 echa al caballo de d5, y tus peones de c4 y d4 quedan juntos, dominando el centro. Si su alfil sale a f5, primero Ad3 y lo cambias. Negras presiona d4 con sus piezas: mantenlo defendido. Con tu caballo en c3, si un caballo de negras va a c6, d5 lo echa." | WP ("White can respond with 4.c4, forcing the knight to move"), WB 2...Cf6 ("3. d4 is the most robust reply"; Gipslis con 9.d5), motor |

**Lo que une a lo de la dama:** cada pieza que sacas, si puede, la ataca sin quedar colgada: es ganar tiempos (WB 3.Cc3). El "sin quedar colgada" sale del gate: Af4 contra la dama en d6 sin g3 pierde el alfil.

### La entrada de cada lección

Con chess.js sobre la línea completa (base + continuación) (`tests/unit/curso-escandinava.test.ts`): la primera captura de negras en d5 dice la pieza; si es la dama, su jugada siguiente dice la casilla (a5, la clavada; d8, la dama en casa; d6, fuera del mapa). Cada línea cae en una sola entrada; las dos de d6, en ninguna. El jaque no tiene lección.

| Lección | Línea | Entrada | Dónde termina la dama, y su "pero…" |
|---|---|---|---|
| Clásica | 1.e4 d5 2.exd5 Dxd5 3.Cc3 Da5 4.d4 Cf6 5.Cf3 Af5 6.Ac4 e6 7.Ad2 c6 8.Cd5 | La clavada | Sigue en a5, atacada: tiene que volver a d8 (8...Dd8, la única). El plan lo dice: "La dama de negras tiene que volver a d8, y ahí ya no clava." |
| Lasker | … 3...Da5 4.d4 Cf6 5.Cf3 Ag4 6.h3 Axf3 7.Dxf3 c6 8.Ad2 | La clavada | Sigue en a5 (8...Cbd7, la del motor) |
| Valenciana | … 3...Dd8 4.d4 Cf6 5.Cf3 Ag4 6.h3 Axf3 7.Dxf3 | La dama en casa | d8 |
| Gipslis | 1.e4 d5 2.exd5 Cf6 3.d4 Cxd5 4.Cf3 Ag4 5.Ae2 e6 6.0-0 Cc6 7.c4 Cb6 8.Cc3 | El centro grande | (el caballo, echado por c4) |
| Marshall | … 4.Cf3 Af5 5.Ad3 Axd3 6.Dxd3 e6 7.0-0 c6 8.c4 | El centro grande | |
| Richter | … 4.Cf3 g6 5.c4 Cb6 6.Cc3 Ag7 7.Ae2 0-0 8.0-0 | El centro grande | |
| Bronstein | … 3...Dd6 4.d4 Cf6 5.Cf3 a6 6.g3 Cc6 7.Af4 Dd8 8.Ag2 | Fuera del mapa | Termina en d8, echada por Af4 (con g3 jugado) |
| Schiller-Pytel | … 3...Dd6 4.d4 c6 5.Cf3 Cf6 6.Ce5 Cbd7 7.Cc4 | Fuera del mapa | Atacada por Cc4: va a c7 (la del motor) o da jaque en e6; el plan dice qué hacer en los dos casos |

Las continuaciones salen de Wikibooks, Wikipedia o la mejor del motor (a 0.2 o menos), con su fuente, en `scripts/base/definiciones/escandinava.json` (variantes `curso-*`). Una excepción a "0.2 o menos", con fuente: 6.Cc3 en la Richter, a 0.26 de la mejor (6.a4), es la línea de Wikibooks. `npm run validar-base`: ninguna jugada mía pierde más de 100 cp; `validar-libros`: ninguna pierde más de 200. Los planes de la base (`plan`, el que usa la guía en partida) dicen lo mismo que el curso (nota 4): la Lasker, "0-0-0 y después Ac4"; la Clásica, con las dos retomas y la condición del alfil en b4; la Bronstein y la Schiller-Pytel, sin "Af4" antes de g3 ni "Ce5 cuando se pueda".

## Cada regla, medida donde se usa (notas 2, 5 y 8)

Todas las medidas, con su comando: `iterations/v4/comprobaciones-escandinava.md` (en la rama). Stockfish 19 lite, un hilo, profundidad 18; amenazas, 16.

**1. En las posiciones de la señal con partidas, contra las dos respuestas más jugadas** (1000–1400):

| Posición | Respuesta (partidas) | Lo que dice la regla | Medida | Veredicto |
|---|---|---|---|---|
| 3...Da5 4.d4 | ...c6 (177 de 486) | Ad2 | +0.79, la mejor | Se sostiene |
| | ...Cf6 (124) | (la lección: 5.Cf3) | +0.69, la mejor | Se sostiene |
| | ...e5 (52) | desarrolla (Cf3) | +1.08, la mejor | Se sostiene |
| | ...Cc6 (27; 25.5 % en 600–1000) | d5 | +1.61, la mejor | Se sostiene |
| 3...Da5 4.d4 Cf6 5.Cf3 | ...Af5 (22 de 60) | la Clásica: 6.Ac4 y Ad2 | 6.Ac4 a 0.1 de la mejor | Se sostiene |
| | ...Ag4 (21) | h3 | +0.97 contra +0.50 de la segunda | Se sostiene |
| 3...Da5 4.d4 c6 5.Cf3 | ...Ag4 | h3 | +0.98, la mejor | Se sostiene |
| 3...Dd8 4.d4 | ...Cf6 (129 de 445) | (la lección: 5.Cf3) | +0.71, la mejor | Se sostiene |
| | ...e6 (122) | Cf3 | pierde 3 | Se sostiene |
| | ...Af5 (61) | sacas tus piezas (sin jugada nombrada) | +1.08 g4 · +0.72 Ad3 | No se nombra jugada |
| 3...Dd8 4.d4 Cf6 5.Cf3 | ...Ag4 (23 de 74) | h3 | +1.28 contra +0.63 | Se sostiene |
| | ...e6 (21) | sacas tus piezas | +0.82 Ad3 | No se nombra jugada |
| 2...Cf6 3.d4 | ...Cxd5 (32 de 52) | (la lección: 4.Cf3) | +0.69, la mejor | Se sostiene |
| | ...Dxd5 (13) | Cc3 ataca a la dama: vuelve a las entradas de la dama | +0.66, la mejor | Se sostiene |
| 2...Cf6 3.d4 Cxd5 4.Cf3 | ...Ag4 (7 de 17) | la Gipslis | 5.Ae2 a 0.07 | Se sostiene |
| | ...Cc6 (4) | c4 | +0.94 (la mejor, 5.Ab5, +0.96) | Se sostiene |
| 3...Dd6 4.d4 (fuera del mapa) | ...Cf6 (18), ...e5 (8) | (sin regla del mapa) | Af4 sin g3 pierde 633 | Por eso la regla de la Bronstein dice "con g3" |

**2. Al final de cada lección, sin partidas: las dos mejores del motor y la respuesta del libro** (nota 8):

| Lección | Plan | Respuesta 1 | Respuesta 2 | Respuesta del libro | Veredicto |
|---|---|---|---|---|---|
| Clásica | Cxf6+; con la dama, De2 y 0-0-0; con el peón, 0-0 | 8...Dd8 (la única) | | 9...gxf6 (Wikibooks): 10.0-0 la mejor (+0.81); 10.De2 pierde 63 y ya no hay enroque largo | **Corregido:** el plan dice las dos retomas |
| Lasker | 0-0-0 y después Ac4 | 8...Cbd7: Ac4 +1.15, 0-0-0 +1.04 | 8...Db6: 0-0-0 +1.24; Ac4 pierde 74 | | **Corregido** antes del gate (primero 0-0-0) |
| Valenciana | Ae3 y 0-0-0; si b7 queda sin cuidar, Dxb7; contra ...Cc6, Ab5 (segunda vuelta del gate: sin "o a f4", que suelta d4 contra 7...Cc6) | 7...c6: Ae3 +0.72, Af4 +0.57 | 7...Dc8: Af4 +2.04, Ae3 +1.76 | 7...c6 (Wikibooks) | Se sostiene (la del motor, 8.g4, no se enseña); contra 7...e6, Dxb7 +2.95 |
| Gipslis | d5; si cambia en f3, Axf3 | 8...Ae7: d5 la mejor | 8...Ab4: d5 a 0.11 | 8...Ae7 (Wikibooks) | Se sostiene; contra 8...Axf3, Axf3 +1.16 (gxf3 −1.36) |
| Marshall | Cc3 y Af4 | 8...Cf6: Cc3 la mejor | 8...Cb6: Af4 +1.08, Cc3 +1.04 | | Se sostiene |
| Richter | d4 defendido; contra ...Ag4, h3; contra ...Cc6, d5 | 8...Ag4: h3 la mejor | 8...Te8: (no aplica) Ae3 +1.18 | 8...Cc6: d5 la mejor | Se sostiene |
| Bronstein | 0-0 | 8...e6: 0-0 a 0.15 | 8...h6: 0-0 pierde 39 | | Se sostiene (el "Ce5 cuando se pueda" se quitó) |
| Schiller-Pytel | si Dc7: g3, Ag2, 0-0; si De6+: Ae2 y 0-0 | 7...Dc7: g3 pierde 15 | 7...De6+: Ae2 la mejor | | Se sostiene |

**3. Cada jugada que una regla nombra, donde aparece su señal, con la pregunta "¿pierde material?"**:

| Jugada nombrada | Dónde se midió | ¿Pierde material? |
|---|---|---|
| Ad2 (la clavada) | tras 4...c6, tras 6...e6 de la Clásica, tras 7...c6 de la Lasker | No: la mejor en las tres |
| Cd5 (la clavada) | con Ac4 y Ad2 y ...c6: la mejor (+0.69); con ...Ab4: pierde 664; sin Ac4 (6.Ad2 c6 7.Cd5): pierde 588; sin Cf3 y con ...Ag4 (4...c6 5.Ad2 Cf6 6.Ac4 Ag4): pierde 555, por eso la condición "con tu caballo en f3" | Sí, sin la condición completa: por eso la regla la dice |
| a3 (contra ...Ab4) | tras 7...Ab4 de la Clásica | No: la mejor |
| h3 (contra ...Ag4) | dama en a5, dama en d8, tras 4...c6 5.Cf3 Ag4, dama en d6: la mejor en las cuatro. **Con un caballo de negras en c6 pierde d4** (segunda vuelta del gate): 4...Cc6 5.Cf3 Ag4, −253; 4...Cf6 5.Cf3 Cc6 6.Ac4 Ag4, −95 (−0.34); con la dama en a5, 5.Cf3 Cc6 6.Ad2 Ag4, −186. Ahí d5 es la mejor (G2-…). Sin Cf3 (4...c6 5.Ad2 Cf6 6.Ac4 Ag4) deja la dama colgada: la regla dice "con tu caballo en f3" | Sí, sin las dos condiciones; con ellas, no. Con el caballo en d5 (Gipslis) no se nombra: ahí la lección juega Ae2 |
| d5 (contra ...Cc6) | En la cuarta jugada (dama en a5 y en d8): la mejor. Contra ...Ag4 con el caballo en c6: la mejor en 4 de 5 posiciones; con la dama en a5 y sin Ad2 (4...Cc6 5.Cf3 Ag4), +0.23, a 61 de la mejor (5.Ab5), sin perder material. En el centro grande, con tu caballo en c3 (Gipslis tras 8...Ae7, Richter): la mejor; **sin tu Cc3, en la Gipslis tras 7...Cb6, pierde un peón (−120)**: la regla dice "con tu caballo en c3". Fuera de esas señales (por ejemplo 4...Cf6 5.Cf3 Cc6, o tras ...Axf3 Dxf3 Cc6) no es la mejor y el mapa no la nombra | No, con sus condiciones |
| Dxf3 | Lasker y Valenciana | No: la mejor (+0.96 y +1.14; con el peón, −0.73 y +0.08) |
| Dxb7 | si negras deja b7 sin cuidar (Valenciana, tras 7...e6, 7...Cbd7 o 7...Dxd4) | No: +2.95, +2.81 y +6.92. Con 7...Cc6, b7 queda tapado (no hay Dxb7) y el plan dice Ab5 (+3.51, la mejor) |
| Ab5 (Valenciana, contra ...Cc6) | tras 7...Cc6 | No: la mejor (+3.51); Ae3 ahí pierde 220 |
| c4 (centro grande) | Marshall, Gipslis, Richter, y contra 4...Cc6. Antes de enrocar es la mejor en la Gipslis 5 y 6 y en la Marshall 7 (por eso las reglas ya no dicen "cuando tu rey esté a salvo", pase 2) | No: la mejor o casi; contra 4...Af5, c4 inmediato pierde 76 sin material (la página dice "primero Ad3"), y la lección juega antes Ad3 |
| Ae2, d4, Cf3, Ab5 (el jaque) | las 12 posiciones de la tabla F-… | No: la frase pierde como mucho 41 (contra 4...b6) |
| Af4 (Bronstein) | sin g3: pierde 633; con g3: la mejor | Sí, sin g3: la regla dice "con g3" |

## Obligatorio y opcional

**Las partidas del curso** son las que empiezan con 1.e4 d5: es el punto de partida de todas las lecciones en la base. Juegas lo del curso mientras haya respuesta; lo del rival pesa por lo que se juega en cada paso; se suman las transposiciones (el método del informe de frecuencias de los siete cursos). La entrada se mide con la línea de la partida, en la media jugada 12. "Sin datos" quiere decir que ninguna secuencia llega a 3 partidas: no es cero.

| Entrada | 600–1000 | 1000–1400 | ¿5 % o más? | Su lección más jugada |
|---|---|---|---|---|
| La clavada (3...Da5) | 14.2 % | 24.8 % | sí | Clásica (sin datos / 2.3) |
| La dama en casa (3...Dd8) | 13.2 % | 19.9 % | sí | Valenciana (sin datos / 1.8) |
| El jaque (3...De5+ o 3...De6+) | 44.7 % | 28.4 % | sí | sin lección (nota 1) |
| El centro grande (2...Cf6 3.d4 Cxd5) | sin datos (5.5 % juega 2...Cf6 y ninguna secuencia sigue tras 3.d4) | 7.2 % (de 32 partidas) | sí, en 1000–1400 | Gipslis (sin datos / 3.0, de 7 partidas) |
| La dama en d6, fuera del mapa (3...Dd6) | 2.9 % | 2.5 % | no | (Bronstein y Schiller-Pytel, opcionales) |
| La dama a otra casilla (d4, c6, d7, c5, f5…) | 10.4 % | 5.8 % | | sin lección |
| Nadie recupera todavía (2...c6, 2...e6, 2...e5, y 2...Cf6 sin datos) | 14.3 % | 9.4 % | | sin lección |

| Sección | Lección | Entrada | 600–1000 | n | 1000–1400 | n | Por qué |
|---|---|---|---|---|---|---|---|
| La base | Clásica | La clavada | sin datos | 0 | 2.3 % | 22 ⚠ | la más jugada de su entrada |
| La base | Valenciana | La dama en casa | sin datos | 0 | 1.8 % | 23 ⚠ | la única lección de su entrada (regla 1); la entrada, 13.2 % y 19.9 % |
| La base | Gipslis | El centro grande | sin datos | 0 | 3.0 % | 7 ⚠ | la más jugada de su entrada |
| Las que más te van a salir | Lasker | La clavada | sin datos | 0 | 2.2 % | 21 ⚠ | 2 % o más |
| Opcional | Bronstein | fuera del mapa | sin datos | 0 | 0.2 % | 3 ⚠ | menos de 2 % |
| Opcional | Schiller-Pytel | fuera del mapa | sin datos | 0 | 0.2 % | 5 ⚠ | menos de 2 % |
| Opcional | Marshall | El centro grande | sin datos | 0 | sin datos (menos de 3 de 17 partidas) | | sin datos |
| Opcional | Richter | El centro grande | sin datos | 0 | sin datos (menos de 3 de 17 partidas) | | sin datos |

- **Cada lección se mide en la posición que la define en la base** (nota 11; la primera versión daba a la Valenciana el 19.9 % de toda su entrada): la Clásica en 5...Af5, la Lasker y la Valenciana en 5...Ag4, la Gipslis en 4...Ag4, la Bronstein en 5...a6, la Schiller-Pytel en 4...c6. El % del curso multiplica, paso a paso, lo que se juega en cada jugada de negras (`lecciones-freq.mjs`, fuera del repo).
- **Los cortes de las entradas caen en saltos; los de las lecciones ya no tanto.** Entradas con lección: 24.8, 19.9, 7.2 y después 2.9 (la dama en d6). Lecciones (1000–1400): 3.0, 2.3, 2.2, 1.8 y después 0.2. La Valenciana (1.8 %) queda debajo del 2 % y entra por la regla 1, como la lección de su entrada; el corte entre obligatorias y opcionales sigue en un salto (de 1.8 a 0.2), pero entre las obligatorias no hay salto. La lista no cambia.
- **El n es chico en casi todo, en 600–1000 sobre todo:** fuera de la Valenciana y de los jaques, esa banda no tiene datos tras la jugada 4. La Clásica (22) contra la Lasker (21) no se distingue con estos datos; las dos son obligatorias de todos modos.
- **La Clásica se mide en 5...Af5,** la posición de la base que la define. **La Marshall** dejó de ser el principio de la Gipslis y la Richter: con su continuación (4.Cf3 Af5) ya es su propia línea, sin datos.

## Las jugadas del rival sin lección (notas 1 y 2)

Con 10 % o más de las partidas que llegan a su posición y 2 % o más de las del curso:

| Jugada | De su posición | Del curso | ¿A qué entrada llega? | Evidencia |
|---|---|---|---|---|
| 3...De5+ | 32.6 % (n 386) / 15.6 % (n 1025) | 27.9 % / 12.5 % | **El jaque** (entrada propia, sin lección) | Tabla F-… de las comprobaciones: la frase, medida en las 6 respuestas más jugadas tras 4.Ae2 |
| 3...De6+ | 19.6 % (n 232) / 20.0 % (n 1310) | 16.8 % / 15.9 % | **El jaque** | Ídem, en 5 respuestas, más 4...Dc6 5.Ab5 (+6.26) |
| 3...Da5 4.d4 c6 | 36.4 % (1000–1400, n 177) | 9.0 % | **La clavada**: Ad2 (la mejor). Tras 5.Ad2, lo más jugado es 5...Dc7 (62 %): la dama sale de a5 y ya no hay clavada; sigues sacando piezas (6.Cf3 la mejor, 6.Ac4 a 0.08). Con 5.Cf3 Cf6 6.Ac4 Af5 7.Ad2 e6 llega a la posición de la Clásica (el orden de Wikipedia) | partidas; motor G-a5-c6, G2-a5-c6-dc7 |
| 3...Da5 4.d4 Af5 | 10.5 % (n 51) | 2.6 % | **La clavada**: Ad2 (+0.71, a 0.08 de la mejor) | motor G2-a5-af5 |
| 3...Da5 4.d4 Cc6 | 25.5 % (600–1000) | 3.6 % | **La clavada**: d5 echa al caballo (la mejor) | motor G-cd5-cc6 |
| 3...Da5 4.d4 e5 | 10.7 % | 2.7 % | **La clavada**: Cf3 (la mejor) | motor G-a5-e5 |
| 3...Dd8 4.d4 Cc6 | 10.8 % (n 48) / 19.6 % (n 10) | 2.1 % / 2.6 % | **La dama en casa**: d5 echa al caballo (la mejor, +1.45); h3 contra un ...Ag4 posterior pierde d4, por eso la regla "salvo con un caballo en c6" | motor G2-d8-cc6 |
| 3...Dd8 4.d4 e6 | 27.4 % | 5.5 % | **La dama en casa**: Cf3 (pierde 3) | motor G-d8-e6 |
| 3...Dd8 4.d4 Af5 | 13.7 % | 2.7 % | **La dama en casa**; la página no nombra jugada para ella | motor G-d8-af5 |
| 2...Cf6 3.d4 Dxd5 | 25 % (n 13) | 2.9 % | Vuelve a las entradas de la dama: 4.Cc3 la ataca (la mejor) | motor |

Las de 2 % a 10 % (solo en el reporte): 3...Dd4 (3.0 % de su posición en 600–1000), 2...c6 y 2...e6 (sin recuperar todavía).

## El gate: lo que no cuadró, por qué, y qué funcionó

1. **La pregunta de §6 no es de peones.** En las ocho lecciones tu peón de e se fue (2.exd5) y juegas d4; los peones de negras cambian de una línea a otra sin un plan propio. Probé por la pieza que recupera (dos respuestas, y "dama" no dice qué jugar), por los peones del centro (lo mismo) y por la casilla de la dama: la tercera es la que da una jugada concreta por respuesta. El gate la confirmó.
2. **"¿Dónde quedó la pieza?" se leía como posición final** (gate, hallazgo 5). La pregunta ahora es "¿a dónde se fue la dama cuando la atacaste?", y donde termina en otra casilla, el plan lo dice.
3. **Dos reglas perdían una pieza** (hallazgos 1 y 2): "atácala con Af4" sin g3 y "Cd5 con tu alfil en c4" con ...Ab4 tapando. La primera salió del mapa junto con su forma (la dama en d6, menos del 5 %) y quedó como regla de la Bronstein con su condición; la segunda lleva la condición completa y qué hacer si no se cumple (a3).
4. **La frase de los jaques fallaba en las dos respuestas más comunes** (hallazgo 3), y los jaques son lo más jugado (hallazgo 6). Ahora son una entrada del mapa, sin lección, con una regla por respuesta, medida tal como queda escrita en 12 posiciones.
5. **El plan de la Clásica no servía contra la respuesta del libro** (hallazgo 4): ahora dice las dos retomas en f6.
6. **El "Ce5 cuando se pueda" de la Bronstein** (hallazgo 8) se quitó: con el caballo de negras en c6 suelta d4.
7. **Una forma de menos del 5 % no lleva página** (hallazgo 6): la dama en d6 queda fuera del mapa, como las formas chicas de la Caro-Kann.

## Qué cambió con el gate (respecto de la primera versión)

- La pregunta, las entradas (sale "la dama al frente", entra "el jaque") y las páginas de La estructura: El mapa, La clavada, La dama en casa, El jaque, El centro grande.
- Las reglas: Af4 solo con g3 (Bronstein); el salto Cd5 con su condición completa; contra ...Cc6, d5; las dos retomas de la Clásica; la frase de los jaques; el Repaso ("con la dama en a5 o en d8, contra ...Ag4, h3").
- La base: los `plan` de la Clásica, la Lasker, la Bronstein y la Schiller-Pytel dicen lo mismo que el curso.
- La tabla de la nota 1 con las jugadas que pasan los dos umbrales (hallazgo 10), y "sin datos" donde no hay partidas (hallazgo 12).
- Hallazgo 9 (g3 contra las respuestas con partidas en la señal de d6): ya no hay regla del mapa para la dama en d6. Hallazgo 13 (n chico): queda dicho arriba. Hallazgo 14 (la frase de los jaques aunque "no llega a una forma"): el orchestrator lo resolvió en la nota 7, como entrada propia.

## La segunda vuelta del gate (notas 10 y 11)

El evaluator midió las reglas con otra jugada natural del rival ya en el tablero, y encontró tres que fallaban así (`iterations/v4/comprobaciones-escandinava.md`, "La segunda vuelta del gate"):

1. **"Contra ...Ag4, h3" perdía d4 con un caballo de negras en c6** (5 partidas llegan a esa posición). Ahora: "h3, salvo con un caballo de negras en c6; ahí, d5", medida en las cinco posiciones donde se juntan las dos señales.
2. **"Si un caballo va a c6, d5" del centro grande perdía un peón una jugada antes del final de la Gipslis.** Ahora: "con tu caballo en c3".
3. **Cd5 y h3 daban por hecho tu Cf3.** Ahora lo dicen.
4. Lo demás: el plan de la Valenciana sin "o a f4" y con Ab5 contra ...Cc6; cada lección medida en su posición de la base; las dos jugadas que faltaban en la tabla de la nota 1 (3...Da5 4.d4 Af5 y 3...Dd8 4.d4 Cc6); los planes de dos variantes de antes de la base (la Clásica y la Bronstein) alineados con el curso; "la vuelves a atacar" solo con la dama en e5; y qué sigue tras 4...c6 5.Ad2 Dc7.

## Para Carlos, al final

- (A) una lección para los jaques (3...De5+ y 3...De6+, lo más jugado en tu nivel), o (B) se quedan como entrada del mapa, sin lección.
