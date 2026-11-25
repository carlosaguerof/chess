# El mapa del curso "Otras aperturas de blancas" (...c6 + ...d5 contra lo demás), y su tabla de obligatorio y opcional (2026-11-25)

> El mapa del curso `otros-negras:b` (`conocimiento/cursos/otros-negras.json`), con la regla de obligatorio y opcional de `specs/cursos.md` §6 medida en las partidas de este curso, tras dos revisiones del orchestrator. Las comprobaciones del motor, con su comando: `iterations/v4/comprobaciones-otros-negras.md`. Las partidas: la base abierta de lichess (CC0), septiembre de 2026, Rapid, los dos jugadores en la banda (600–1000 o 1000–1400), contadas por la corrida de frecuencias del 2026-11-25 (fuera de este repo). Stockfish 19 lite, un hilo, profundidad 18; las evaluaciones, desde blancas.

## En corto

- **La pregunta: ¿qué peón de blancas ataca tu peón de d5?** Contra todo lo que no es 1.e4 ni 1.d4, pones tu peón en d5, muchas veces con ...c6 detrás.
  - **Ninguno: el Centro libre.** Blancas juega con piezas (un alfil en la diagonal larga, o el peón de f). Tu plan son principios generales: sacas tus piezas a casillas activas (tu alfil de c8 antes de ...e6), enrocas. Contra 1.g3 con d3 (la Húngara), agrandas tu centro con ...e5: es donde se probó.
  - **El de c, sin un peón en d4: la Anglo-Eslava.** Tu peón de c6 sostiene d5. Tu alfil de c8 sale antes de ...e6; si el caballo de blancas ya está en c3, primero ...e6. Contra Db3 después de cxd5, ...Cc6 o ...Db6, nunca ...e6.
  - **El de c, con su peón de d en d4: la Eslava.** 1.c4 c6 2.d4 d5 es la misma posición que 1.d4 d5 2.c4 c6 (chess.js): su mapa te dice qué hacer.
- **"Con e4"** (1.Cf3 d5 2.e4, 1.d3 y e4) queda fuera del mapa: ninguna lección llega ahí, y sale en 3.1 % y 2.3 % de las partidas del curso (menos del 5 %, nota 10 del orchestrator).
- **El nombre:** la tarjeta de siempre dice "Otras aperturas de blancas", y el curso lleva ese mismo nombre (antes, "...c6 + ...d5 contra lo demás", el de la guía de Carlos).
- **8 lecciones, todas desde la primera jugada. La base: 2** (la Bogoljubow y la Húngara). **Las que más te van a salir: 4** (1.c4 con 2.Cc3, la Réti con 2.g3, la Larsen y la Bird). **Opcional: 2** (la Anglo-Eslava con g3 y la Gurevich).
- **...c6 no está en las ocho.** Contra la Larsen y la Bird el motor prefiere otras jugadas (5...c6 en la Larsen pierde 33; 3...c6 en la Bird, 26): el curso dice "pones tu peón en d5", no "...c6 + ...d5 siempre". Gana la teoría, y el Repaso lo dice en "Lo que tu guía decía distinto".

## Las formas

| Forma | Fuente | El motor |
|---|---|---|
| **El Centro libre** | Wikipedia (Nimzowitsch–Larsen Attack, King's Fianchetto Opening, Bird's Opening), Wikibooks 1.Cf3 d5 y 1.g3 d5 | En la Húngara, 6...e5 empata con la mejor (+0.17 tras 6.Cbd2); en la Larsen, 5...h6 es la mejor y le guarda h7 a tu alfil contra Ch4; contra 1.f4 d5 2.Cf3 Cf6 3.g3 (la más jugada), ...g6 es la mejor (−0.26) y la página lo dice |
| **La Anglo-Eslava** | Wikipedia (Réti Opening, English Opening), Wikibooks 1.c4 c6, la investigación del porqué | Con b3 jugado, 3...Af5 es la mejor (la dama blanca ya no tiene b3); en la Gurevich, 4...Af5 5.cxd5 cxd5 6.Db3 obliga a ...Ac8: ...e6 primero ahorra ese tiempo; en la de g3, 6...e6 contra 6.Db3 pierde 85 (7.Dxb7, +0.99) |
| **La Eslava** | Wikibooks 1.c4 c6, Wikipedia (English Opening, Slav Defense) | 1...c6 contra 1.c4 a 8 de la mejor; 2...d5, 3...cxd5 y 4...Cf6 entre las mejores |

**Cómo se calcula la forma de cada lección** (chess.js sobre toda la línea; `tests/unit/curso-otros-negras.test.ts`): con peones blancos que llegan a c4 y d4, la Eslava; a c4 sin d4, la Anglo-Eslava; ni a c4 ni a e4, el Centro libre. Cada línea cae en una.

## Las lecciones

| Sección | Lección | Línea | Forma |
|---|---|---|---|
| La base | `reti-bogoljubow` | 1.Cf3 d5 2.c4 c6 3.b3 Af5 4.Ab2 e6 5.e3 Cf6 | Anglo-Eslava |
| La base | `otras-hungara` | 1.g3 d5 2.Ag2 c6 3.Cf3 Cf6 4.0-0 Ag4 5.d3 Cbd7 6.Cbd2 e5 | Centro libre (3...Cf6, como la Réti con 2.g3: es la misma posición) |
| Las que más te van a salir | `inglesa-caro-kann` | 1.c4 c6 2.Cc3 d5 3.cxd5 cxd5 4.d4 Cf6 5.Af4 Cc6 | Eslava (llega al Cambio de la Eslava) |
| Las que más te van a salir | `reti-fianchetto` | 1.Cf3 d5 2.g3 c6 3.Ag2 Cf6 4.0-0 Ag4 5.d4 e6 | Centro libre ("Pero si blancas juega c4 después, ya es la Eslava": c4 entre las mejores, +0.22) |
| Las que más te van a salir | `larsen-clasica` | 1.b3 d5 2.Ab2 Cf6 3.e3 Af5 4.Cf3 e6 5.Ae2 h6 | Centro libre |
| Las que más te van a salir | `otras-bird` | 1.f4 d5 2.Cf3 Cf6 3.e3 Af5 4.Ae2 e6 5.0-0 Ae7 | Centro libre |
| Opcional | `inglesa-anglo-eslava-g3` | 1.c4 c6 2.Cf3 d5 3.g3 Cf6 4.Ag2 Af5 5.0-0 e6 6.d3 dxc4 7.dxc4 Dxd1 8.Txd1 Cbd7 | Anglo-Eslava |
| Opcional | `inglesa-gurevich` | 1.c4 c6 2.Cf3 d5 3.e3 Cf6 4.Cc3 e6 5.b3 Ad6 | Anglo-Eslava ("Pero si blancas pone su peón en d4, ya es la Eslava": d4 empata con la mejor, +0.12) |

La Bird va por 3.e3, la mejor de blancas según el motor (−0.17) y la segunda más jugada (24 % y 18 %), con el plan de la base (alfil a f5 antes de ...e6) y cada jugada tuya la mejor del motor. Las continuaciones, con su fuente, en `scripts/base/definiciones/otros-negras.json` (variantes `curso-*`); `validar-base` y `validar-libros`, sin fallas.

## Obligatorio y opcional

"Las partidas del curso": toda primera jugada que no es 1.e4 ni 1.d4 (10,821 en 600–1000 y 27,365 en 1000–1400). Reparto entre todas las partidas que siguen; lo que va por jugadas con menos de 3 partidas, "sin datos".

**Las formas** (media jugada 12):

| Forma | 600–1000 | 1000–1400 | Lección más jugada |
|---|---|---|---|
| Centro libre | 27.9 % | 33.8 % | `otras-hungara` |
| Anglo-Eslava | 2.8 % | 7.2 % | `reti-bogoljubow` |
| Eslava | 1.6 % | 3.9 % | `inglesa-caro-kann` |
| Con e4 (sin lección) | 3.1 % | 2.3 % | — |
| Sin ...d5 (sobre todo 1.e3 e5) | 21.6 % | 13.0 % | — |
| Sin datos | 43.0 % | 39.8 % | — |

"Sin ...d5" es lo que jugaron las negras de la muestra, no el rival: para quien siempre contesta ...d5, el Centro libre es mayor que lo que dice la tabla.

**Las lecciones:**

| Lección | 600–1000 | n | 1000–1400 | n | Sección |
|---|---|---|---|---|---|
| `reti-bogoljubow` | 0.8 % | 29 | 1.6 % | 179 | La base (Anglo-Eslava, 7.2 %) |
| `otras-hungara` | 6.5 % | 700 | 8.0 % | 2197 | La base (Centro libre) |
| `inglesa-caro-kann` (medida en 1.c4 c6 2.Cc3) | 1.9 % | 6 | 5.9 % | 74 | Las que más te van a salir |
| `reti-fianchetto` | 3.8 % | 137 | 4.0 % | 447 | Las que más te van a salir |
| `larsen-clasica` | 3.8 % | 410 | 6.7 % | 1831 | Las que más te van a salir |
| `otras-bird` | 5.8 % | 623 | 6.2 % | 1687 | Las que más te van a salir |
| `inglesa-anglo-eslava-g3` | 0.0 % | 0 | 0.3 % | 4 | Opcional |
| `inglesa-gurevich` | 0.0 % | 0 | 0.3 % | 4 | Opcional |

El corte de 2 % cae en un salto en 1000–1400 (de 4.0 % a 1.6 %). Una banda con menos de 10 partidas no decide (n ≥ 10): pesa la otra. La Eslava (la forma) no llega al 5 %, pero su lección entra por frecuencia (5.9 %, n 74).

## Cada plan, probado donde se usa

Los planes se sostienen. Dos reglas medidas aparte, donde aparece su señal:

- "Contra d3, agranda tu centro con ...e5" (la Húngara): tras 6.Cbd2, ...e5 empata con la mejor (+0.17). Si en lugar de Cbd2 blancas juega 6.c4, ...e5 pierde 28 contra ...dxc4: se queda (no pierde material ni pasa de 50), y la lección va por 6.Cbd2.
- "Si blancas ataca tu centro con c4, ...c6 sostiene d5" (la Larsen): con c4 al final de la lección, ...c6 es la mejor (−0.10).

## Las jugadas del rival sin lección (10 % de su posición y 2 % del curso)

- **1.e3** (23.6 % y 18.8 %): si contestas ...d5, llega al Centro libre en 85.8 % y 89.6 % de las partidas. "El mapa" lo dice.
- **1.Cf3 d5 2.d4** (43 % de su posición): Centro libre en 95.6 % y 89.3 %. "El mapa" lo dice.
- **1.c4 c6 2.d4** (21 % de su posición): tras 2...d5, la posición de la Eslava. "El mapa" y la página de la Eslava lo dicen.
- **1.Cf3 d5 2.e4** (10.5 % de su posición, 2.4 % del curso): llega a "Con e4", fuera del mapa. No se dice nada.
