# El mapa del curso de la Defensa Eslava, y su tabla de obligatorio y opcional (2026-11-25)

> El mapa del curso `eslava:b` (`conocimiento/cursos/eslava.json`), con la regla de obligatorio y opcional de `specs/cursos.md` §6 medida en las partidas de este curso. Es la versión que quedó tras dos revisiones del orchestrator (el gate del mapa). Las comprobaciones del motor, con su comando: `iterations/v4/comprobaciones-eslava.md`. Las partidas: la base abierta de lichess (CC0), septiembre de 2026, Rapid, los dos jugadores en la banda (600–1000 o 1000–1400), contadas por la corrida de frecuencias del 2026-11-25 (fuera de este repo). Stockfish 19 lite, un hilo, profundidad 18 (amenazas, 16); las evaluaciones, desde blancas.

## En corto

- **Tres preguntas en fila**, sobre el peón de c4 que blancas puso junto a d4 y que tú enfrentas con ...c6:
  1. **¿Blancas cambió en d5?** Sí: **el Cambio**. Retomas con el peón de c y sacas tus piezas igual que blancas.
  2. Si no, **¿ya jugó e3?** Sí: **la Tensión**. No tomas en c4: tu alfil de c8 sale a f5 antes de ...e6 (si blancas ya tiene su caballo en c3, lo más sencillo es primero ...e6). No (ni Cbd2, que también recupera c4 de una vez): tomas en c4.
  3. Si tomaste, **¿alcanzó a jugar a4?** Sí: **la Checa**. Con tu caballo ya en f6, dejas el peón y sacas tu alfil a f5. No: **la Pelea del lado de dama**. Defiendes c4 con ...b5, y si a4 lo ataca, ...b4 echa al caballo de c3.
- **11 lecciones, no 13.** La Semieslava (4...e6) y la Defensa de la Clavada (4...Ag4) son otras jugadas tuyas en posiciones donde el curso ya enseña una: quedan como buena jugada (azul), con lo guardado de antes pasado a la lección de esa posición (`LECCIONES_ESLAVA`, `src/aprender/migracion.ts`).
- **La base: 4** (la Checa, la Tranquila, el Cambio y 3.Cc3). **Opcional: 7.** "Las que más te van a salir" queda vacía.
- **Después de los pases** (2026-11-25): ...Ab4 contra Db3 lleva su condición, con tu caballo en c6; "tomas en c4" vale sin e3 ni Cbd2; la regla de la Checa (sacar el alfil con a4) vale con tu caballo en f6; el plan del Cambio saca el alfil a b4 (la mejor contra 8.Ab5, 8.Ae2 y 8.Db3); en el Diemer, blancas puede recuperar el peón: tu ventaja es de posición.
- **Fuera del mapa:** el Gambito Diemer (3.e4) y 3.c5 (el peón de c deja de atacar d5; 3...e5 golpea su centro, la mejor, −0.51). El mapa los dice en su último párrafo.

## Las formas

| Forma | La señal | Qué juegas (como lo dice la página) | Fuente | El motor |
|---|---|---|---|---|
| **El Cambio** | Blancas cambió en d5 y retomaste con el peón de c | Posición simétrica: sacas tus piezas igual que blancas (...Cc6, ...Af5, ...e6). Si la dama blanca ataca b7 desde b3: con tu caballo en c6 y ...e6 ya jugado, ...Ab4 (sin el caballo en c6, la dama se come el alfil: pierde 646); antes de ...e6, ...Ca5 | Wikibooks 3.cxd5, Wikipedia (Slav Defense, Exchange), la investigación del porqué | 3...cxd5, la mejor por 18; contra 8.Db3 con ...e6 jugado, 8...Ab4 la mejor (+0.30); antes de ...e6, ...Ca5 (+0.02) |
| **La Tensión** | El peón de c4 sigue ahí y blancas ya jugó e3 | Tu alfil sale a f5 antes de ...e6, con tu caballo ya en f6 defendiendo d5. Si blancas ya tiene su caballo en c3, lo más sencillo es primero ...e6 (con el alfil afuera, cxd5 cxd5 Db3 ataca b7: o el alfil vuelve a c8, o entregas el peón). Con ...e6 ya jugado, ...Db6 contra Db3 | Wikibooks 4...Af5, Wikipedia (Slav Defense) | Tras 4.e3, ...dxc4 pierde 60 y ...Af5 queda a 3 de la mejor; con e3 y Cc3, ...e6 a 2 de la mejor; ...Db6 sin ...e6 pierde 122 |
| **La Checa** | Tomaste en c4 y blancas alcanzó a jugar a4 | Dejas el peón: con tu caballo en f6, tu alfil sale a f5 (tu peón de c4 cuida b3, así que no hay Db3), después ...e6, ...Ab4 y enroque. Contra 6.Ce5, ...Cbd7, ...Dc7 y ...e5 | Wikibooks 4...dxc4, Wikipedia (Slav Defense, Czech) | Tras 5.a4, ...b5 pierde 128 y 5...Af5 es la mejor (+0.28); en 3.Cc3 dxc4 4.a4 (sin caballo en f6), ...Af5 pierde 143 |
| **La Pelea del lado de dama** | Tomaste en c4 y blancas no alcanzó a jugar a4 | ...b5 sostiene tu peón de c4 mientras blancas gasta jugadas en recuperarlo. Si a4 ataca tu peón de b5, ...b4 echa a su caballo de c3 (en la Geller, con tu caballo en d5, primero ...e6) | Wikipedia (Slav Defense: 3.Cc3 dxc4 4.e4 b5; 5.e3 b5 6.a4 b4 7.Ca2), Wikibooks 3.Cc3 dxc4 | ...b5 la mejor contra 4.e4 (+0.22), 4.e3 (+0.04), 5.e3 (−0.11) y 5.e4 (+0.23); ...b4 la mejor contra a4; en la Geller, ...b4 pierde 86 |

Si blancas no cambió ni jugó e3 (Cc3, Af4 o Ag5 sin e3), tomas en c4: ...Af5 pierde 33 tras 4.Cc3, 65 tras 4.Af4 y 57 tras 4.Ag5. Con 4.g3 las dos sirven (...dxc4 a 5 de la mejor; el curso saca el alfil a g4, a 16). Con 3.e3, la Tensión: 3...Af5 es la mejor.

**Cómo se calcula la forma de cada lección** (chess.js sobre toda la línea; `tests/unit/curso-eslava.test.ts`): el Cambio, si blancas juega c4×d5 y tú retomas con el de c; la Checa, si juegas d5×c4 y blancas juega a4 antes de cualquier ...b5; la Pelea del lado de dama, si juegas d5×c4 y ...b5 antes de a4; la Tensión, si nadie cambia peones en c4 ni en d5. Cada línea cae en una; el Diemer, en ninguna.

## Las lecciones

Tronco: 1.d4 d5 2.c4 c6. La primera (la Checa) empieza desde 1.d4. Las líneas que siguen más allá de la fila de lichess llevan su `continuacion`, con fuente, en `scripts/base/definiciones/eslava.json` (variantes `curso-*`): `validar-base` 0 jugadas mías pierden más de 100; `validar-libros`, 0 más de 200.

| Sección | Lección | Línea (tras 2...c6) | Forma |
|---|---|---|---|
| La base | `checa` | 3.Cf3 Cf6 4.Cc3 dxc4 5.a4 Af5 6.e3 e6 7.Axc4 Ab4 8.0-0 0-0 | Checa |
| La base | `tranquila-schallopp` | 3.Cf3 Cf6 4.e3 Af5 5.Cc3 e6 6.Ch4 Ag6 7.Cxg6 hxg6 | Tensión |
| La base | `cambio` | 3.cxd5 cxd5 4.Cc3 Cf6 5.Cf3 Cc6 6.Af4 Af5 7.e3 e6 | Cambio |
| La base | `cc3` | 3.Cc3 dxc4 4.e4 b5 5.a4 b4 6.Cb1 Aa6 7.Dc2 Dxd4 8.Cf3 Db6 | Pelea del lado de dama |
| Opcional | `checa-clasica` | … 8.0-0 0-0 9.De2 Ce4 10.g4 Ag6 | Checa |
| Opcional | `alekhine-e3` | 3.Cf3 Cf6 4.Cc3 dxc4 5.e3 b5 6.a4 b4 7.Ca2 e6 8.Axc4 Ab7 | Pelea del lado de dama |
| Opcional | `checa-carlsbad` | … 5.a4 Af5 6.Ce5 Cbd7 7.Cxc4 Dc7 8.g3 e5 | Checa |
| Opcional | `cambio-trifunovic` | 3.Cf3 Cf6 4.cxd5 cxd5 5.Cc3 Cc6 6.Af4 Af5 7.e3 e6 8.Db3 Ab4 | Cambio |
| Opcional | `moderna-g3` | 3.Cf3 Cf6 4.g3 Ag4 5.Ag2 e6 6.0-0 Ae7 | Tensión |
| Opcional | `geller` | 3.Cf3 Cf6 4.Cc3 dxc4 5.e4 b5 6.e5 Cd5 7.a4 e6 | Pelea del lado de dama |
| Opcional | `diemer` | 3.e4 dxe4 4.Cc3 e5 5.Ae3 exd4 6.Dxd4 Dxd4 7.Axd4 Cf6 | fuera del mapa |

## Obligatorio y opcional

"Las partidas del curso" son las que llegan a su tronco, 1.d4 d5 2.c4 (8,405 en 1000–1400 y 1,228 en 600–1000). El reparto de las estructuras va entre todas las partidas que siguen (n − las que se acaban); lo que va por jugadas con menos de 3 partidas queda "sin datos".

**Las formas** (media jugada 12; 600–1000 / 1000–1400):

| Forma | 600–1000 | 1000–1400 |
|---|---|---|
| Pelea del lado de dama | 25.9 % | 31.3 % |
| Tensión | 7.8 % | 17.8 % |
| Cambio | 9.6 % | 7.8 % |
| Checa | sin datos | sin datos |
| Tomas en c4, sin decidir | 14.8 % | 16.2 % |
| Sin datos | 34.1 % | 23.0 % |
| Otra (3.c5) | 4.4 % | 2.9 % |
| Fuera del mapa: 3.e4 | 3.3 % | 1.0 % |

En 600–1000 hay 90 partidas con 2...c6: pesa más la otra banda. Las formas con datos pasan del 5 % en 1000–1400, y el corte cae en un salto (de 7.8 % a 2.9 %).

**Las lecciones** (de las partidas del curso):

| Lección | 600–1000 | n | 1000–1400 | n | Sección |
|---|---|---|---|---|---|
| `checa` | sin datos | — | sin datos | — | La base (por el gate) |
| `tranquila-schallopp` | 0.0 % | 0 | 2.2 % | 9 | La base (Tensión) |
| `cambio` | 14.4 % | 13 | 12.3 % | 135 | La base (Cambio) |
| `cc3` | 35.6 % | 32 | 47.4 % | 520 | La base (Pelea del lado de dama) |
| `moderna-g3` | 0.0 % | 0 | 2.0 % (1.99) | 8 | Opcional |
| `diemer` | 3.3 % | 3 | 1.0 % | 11 | Opcional |
| `checa-clasica`, `alekhine-e3`, `checa-carlsbad`, `cambio-trifunovic`, `geller` | 0.0 % | 0 | 0.0 % | 0 | Opcional |

## El gate: la Checa

- **Qué falló:** la cuenta mecánica la dejaba opcional con "0 %". Pero ese 0 era "sin datos": tras 3.Cf3 Cf6 4.Cc3 dxc4 ninguna jugada de blancas tiene 3 partidas. La posición de 4.Cc3, donde el mapa te pide tomar en c4, sale en 14.8 % (n 6) y 6.7 % (n 27) de tus Eslavas, y ninguna otra obligatoria la cubre.
- **Qué se probó:** (a) dejarla opcional: Carlos llegaría a esa posición sin lección; (b) subir la Alekhine 5.e3: el motor la ve como la quinta de blancas (−0.02); (c) subir la Checa: 5.a4 es la mejor de blancas por 21 centipeones (+0.27) y la línea principal de Wikipedia y Wikibooks.
- **Qué funcionó:** (c). Cubre esa posición con la jugada que más probablemente llega y enseña las dos últimas preguntas del mapa. Va primera en La base y empieza desde 1.d4.

## Cada plan, probado donde se usa

En cada posición de cada lección donde mueve el rival, contra sus dos respuestas más jugadas (3 partidas o más) o, sin partidas, contra las dos mejores del motor y la del libro; y cada jugada que nombra una regla, medida donde aparece su señal. Los planes se sostienen. El único que necesitó condición fue el de la base de la Tranquila: "Con ...e6 ya jugado, si Ch4 persigue tu alfil, retíralo a g6. Si Db3 ataca b7 antes de cambiar en d5, defiéndelo con ...Db6." Las condiciones de ...Db6 y ...Ab4 (solo con tu peón ya en e6) también van en los planes de la base (`tranquila-schallopp`, `cambio`).

## Las jugadas del rival sin lección (10 % de su posición y 2 % del curso)

- **3.e3** (15.6 %, n 14, y 11.2 %, n 123, de las que llegan a 2...c6): lleva a la Tensión, y la página lo dice.
- **3.c5** (4.4 % y 5.5 %): no llega al 10 %, pero el mapa lo dice (arriba).
- 2.Af4, 2.Cc3, 2.e3 y 2.Cf3 son antes del tronco: no son partidas del curso (y del 97 % al 100 % no llegan a la Eslava).
