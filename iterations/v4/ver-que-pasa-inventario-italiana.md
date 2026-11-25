# El inventario de "Ver qué pasaría"

> Generado con `node scripts/ver-inventario.ts` (2026-10-30). La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso «Apertura Italiana»: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.

**75 frases: 9 con "Ver"; 66 sin él** (47 porque explica la jugada que ya está en la línea, sin una alternativa; 10 porque dice qué sigue (un plan), no qué pasaría con otra cosa; 6 porque lo que dice se juega en las jugadas que siguen de la línea; 3 porque dice una alternativa, pero sin una consecuencia que se enseñe en el tablero; 0 porque la consecuencia no se sostiene con el motor). 4 de las 9 contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.

## Con "Ver"

| Jugada | Campo | Frase | La línea | Dónde sale |
|---|---|---|---|---|
| 4.d3 | porque | Así el caballo de f6 ya no puede tomar en e4: perdería una pieza. | 4...♘xe4 5.dxe4 | Aprender y Practicar |
| 4.d3 | cuidado | Si negras golpea con ...d5, toma en d5: si sigues con tu plan, su peón se come tu alfil. | 4...d5 5.c3 5...dxc4 | solo Aprender |
| 7.♖e1 | cuidado | Si su caballo salta a g4, aparta tu torre a f1; si lo echas con h3, pierdes material. | 7...♘g4 8.h3 8...♘xf2 9.♕e2 9...♘xd3+ 10.♔h2 10...♘xe1 11.♕xe1 | Aprender y Practicar |
| 7.♖e1 | cuidado | Si su caballo salta a g4, aparta tu torre a f1; si lo echas con h3, pierdes material. | 7...♘g4 8.h3 8...♘xf2 9.♕e2 9...♘xd3+ 10.♔h2 10...♘xe1 11.♕xe1 | solo Aprender |
| 8.d5 | porque | Si negras toma en e4, tomas su caballo de c6. | 8...♘xe4 9.dxc6 9...♗xf2+ 10.♔f1 | Aprender y Practicar |
| 5.♘xd4 (si juegas 5.♕xd4) | errores | Tu dama se perdería: el caballo de c6 cuida esa casilla. | 5.♕xd4 5...♘xd4 | solo Aprender |
| 5.♘xd4 (si juegas 5.♕xd4) | errores | Tu dama se perdería: el caballo de c6 cuida esa casilla. | 5.♕xd4 5...♘xd4 | solo Aprender |
| 4.♘xd4 | cuidado | No tomes en e5: su dama atacaría tu caballo y tu peón de g2 a la vez. | 4.♘xe5 4...♕g5 5.♗xf7+ 5...♔d8 6.0-0 6...♕xe5 | solo Aprender |
| 4.♘xd4 (si juegas 4.♘xe5) | errores | Es la trampa: su dama atacaría tu caballo y tu peón de g2 a la vez. | 4.♘xe5 4...♕g5 5.♗xf7+ 5...♔d8 6.0-0 6...♕xe5 | solo Aprender |

## Sin "Ver"

| Jugada | Campo | Frase | Por qué no |
|---|---|---|---|
| 1.e4 | porque | Ocupa el centro y abre camino a tu dama y a tu alfil de f1. | explica la jugada que ya está en la línea, sin una alternativa |
| 2.♘f3 | porque | Sacas una pieza con amenaza: negras tiene que defender ese peón. | explica la jugada que ya está en la línea, sin una alternativa |
| 2.♘f3 | prepara | Además, tu caballo cuida d4 y te acerca al enroque. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.♗c4 | porque | f7 es el peón más débil de negras: al principio solo lo cuida su rey. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.♗c4 | prepara | Con el caballo y el alfil afuera, ya puedes enrocar. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.♗c4 | cuidado | Todavía no amenazas nada: f7 es una meta para después, no un ataque inmediato. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d3 | prepara | Y como e4 ya está seguro, amenazas ♘g5 contra f7. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.c3 | porque | Llegas al esquema lento del Giuoco Pianissimo: d4 queda para cuando esté preparado. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.c3 | prepara | Tu caballo de b1 saldrá por d2, porque c3 ya está ocupada. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.0-0 | porque | Con el centro cerrado no hay prisa: primero, el rey seguro. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.0-0 | prepara | Después, ♖e1 cuida e4 otra vez. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.♖e1 | porque | Cuando llegue d4, tu peón de e4 no se quedará solo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.c3 | porque | Hoy negras ataca d4 tres veces: con su peón de e5, su caballo de c6 y su alfil de c5. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.c3 | prepara | Amenazas d4, para quedarte con el centro. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.c3 | cuidado | Ahora tu caballo de b1 ya no puede ir a c3 a defender e4. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.d3 | porque | Así juegas lento y sólido: d4 queda para cuando esté preparado. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.0-0 | porque | Con el centro cerrado no hay prisa: primero, el rey seguro. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.0-0 | prepara | Después, ♖e1 cuida e4 otra vez. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.♖e1 | porque | Cuando llegue d4, tu peón de e4 no se quedará solo. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♗b3 | porque | Así el peón de negras ya no lo echa ganando tiempo. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 9.h3 | porque | Sin este peón, su caballo podría saltar a g4, contra f2, donde ya mira el alfil de a7. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 9.h3 | prepara | Siguen ♘bd2 y, con todo listo, d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.d4 | porque | Contra una jugada pasiva no hay que esperar: con c3 listo, el centro es tuyo. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.d4 | prepara | Si negras cambia en d4, retomas con tu peón de c3 y te quedan dos peones en el centro. | lo que dice se juega en las jugadas que siguen de la línea |
| 5.d4 | cuidado | Si negras no cambia y retira su alfil, tomas en e5. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.cxd4 | porque | Dos peones en el centro les quitan casillas a las piezas de negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.cxd4 | cuidado | Negras los atacará con sus piezas: hay que cuidarlos. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 7.h3 | porque | Desde g4, el alfil de negras clavaría tu caballo de f3, que defiende d4. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.h3 | cuidado | Si su dama sale a f6 contra d4, protégelo con ♗e3. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.d5 | prepara | Con más espacio en el centro, tus piezas tienen mejores casillas. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.d4 | porque | Contra una jugada pasiva no hay que esperar: vas adelante en desarrollo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d4 | prepara | Si negras cambia en d4, retomas con el caballo y el centro queda abierto. | lo que dice se juega en las jugadas que siguen de la línea |
| 4.d4 | cuidado | Si su alfil de c8 sale a g4 a clavar tu caballo, h3 le pregunta qué hace. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.♘xd4 | porque | Sin cadena de peones, tus piezas salen rápido. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♘xd4 | cuidado | Si su caballo cambia en d4, retoma con la dama. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♘c3 | porque | Cada jugada saca una pieza nueva: así sigues adelante en desarrollo. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.0-0 | porque | Tus caballos y tu alfil ya salieron y tu rey está seguro; el rey de negras sigue en el centro. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d4 | porque | Su jugada fue lenta: abre el centro mientras vas adelante en desarrollo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d4 | cuidado | Aquí atacar e5 de inmediato es mejor que preparar con c3. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 5.♘xd4 | porque | Sin cadena de peones, tus piezas salen rápido. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♘xd4 | cuidado | Si su alfil ataca tu caballo otra vez desde c5, cambia caballos en c6; si su caballo cambia en d4, retoma con la dama. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♘c3 | porque | Tienes tres piezas afuera; negras, dos, y gastó una jugada con su peón de h. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.♘xd4 | porque | Sin ese caballo, la trampa ya no funciona. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.♘xd4 | cuidado | Y si su dama sale a g5 de todos modos, regresa tu caballo a f3. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.0-0 | porque | Negras gastó tiempo con su caballo: tú ya tienes el rey seguro. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♖e1 | porque | Y se queda en la columna e, frente al rey de negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♖e1 | cuidado | Si negras juega ...h5 para saltar a g4, h3 le quita esa casilla. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.c3 | porque | Tus piezas están más adelantadas: abrir el centro te conviene. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.c3 | prepara | Si negras no lo cambia, lo tomas con este peón y te quedan dos peones en el centro. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.cxd4 | porque | Tus piezas están más adelantadas, y tus dos peones mandan en el centro. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.cxd4 | prepara | Si negras golpea con ...d5, tomas en d5. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.d4 | porque | Su alfil en e7 no presiona nada: no hay que esperar. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.c3 | porque | Si negras toma, retomas con una pieza y sigues adelante en desarrollo. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.c3 | cuidado | Si su caballo ataca tu alfil desde a5, sálvalo primero: ♗e2. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.e5 | porque | Ganas espacio, y el caballo tiene que buscar otra casilla. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♗d5 | porque | Negras tiene que moverlo otra vez, o sostenerlo con su peón de f. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.d4 | porque | Su peón de f salió de casa: a su rey le conviene el juego cerrado; a ti, abrirlo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d4 | cuidado | Si negras toma en e4, tomas en e5 con el caballo. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.e5 | porque | Su rey quedó más débil: ahora sacas tus piezas y enrocas. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♕xg5 | porque | Tu dama cuidaba g5 desde d8: el caballo no tenía apoyo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♕g5 | porque | Blancas no puede salvar las dos cosas. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...♕xg2 | porque | Tu dama entra en el lado del rey de blancas. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♕xe4+ | porque | Blancas tiene que tapar con su alfil, y tu caballo de d4 queda listo. | lo que dice se juega en las jugadas que siguen de la línea |
| 7...♘f3# | porque | El rey no tiene casilla libre y nadie puede tomar al caballo. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗xd4 | porque | Si su dama retoma, tu caballo de c6 se la come: ganas una pieza. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.dxe4 | porque | Ganas una pieza por un peón. | explica la jugada que ya está en la línea, sin una alternativa |
