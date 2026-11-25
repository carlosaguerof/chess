# El inventario de "Ver qué pasaría"

> Generado con `node scripts/ver-inventario.ts francesa:w`. La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso «Avance contra la Francesa»: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.

**54 frases: 8 con "Ver"; 46 sin él** (27 porque explica la jugada que ya está en la línea, sin una alternativa; 8 porque dice qué sigue (un plan), no qué pasaría con otra cosa; 11 porque lo que dice se juega en las jugadas que siguen de la línea; 0 porque dice una alternativa, pero sin una consecuencia que se enseñe en el tablero; 0 porque la consecuencia no se sostiene con el motor). 2 de las 8 contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.

## Con "Ver"

| Jugada | Campo | Frase | La línea | Dónde sale |
|---|---|---|---|---|
| 4.c3 | cuidado | Si cambiaras tú en c5, soltarías tu centro: el alfil de negras retoma y tu peón de e5 se queda sin su base. | 4.dxc5 4...♗xc5 | Aprender y Practicar |
| 5.cxd4 | porque | Si retomaras con la dama, el caballo de negras la atacaría desde c6 y negras ganaría un tiempo. | 5.♕xd4 5...♘c6 | Aprender y Practicar |
| 8.♘c3 | cuidado | Si la dama de negras va a b6, d4 tendrá tres atacantes y dos defensores: échala con tu caballo desde a4. | 8...♕b6 9.♘a4 9...♕d8 | Aprender y Practicar |
| 5.♘f3 | porque | No saques el alfil a d3: taparía a tu dama, y negras cambiaría en d4 para ganarte el peón. | 5.♗d3 5...cxd4 6.cxd4 6...♘xd4 | Aprender; en Practicar, solo en 5...♘ge7 (Paulsen), 5...♕b6 (línea principal) |
| 6.a3 | cuidado | Si negras no cierra con ...c4 y saca su caballo a e7, ♗e2 todavía no: tras ...cxd4 y ...♘f5, tres piezas atacarían d4 y dos lo defenderían. | 6...♘ge7 7.♗e2 7...cxd4 8.cxd4 8...♘f5 | solo Aprender |
| 6.a3 | cuidado | Si en vez de a3 sacabas el alfil de c1, la dama se comía tu peón de b2 y después tu torre. | 6.♗e3 6...♕xb2 7.dxc5 7...♕xa1 | Aprender y Practicar |
| 7.b4 | cuidado | En vez de b4, no tomes el caballo de h6 con tu alfil: la dama de negras se comería tu peón de b2 y recuperaría la pieza. | 7.♗xh6 7...♕xb2 8.♘bd2 8...gxh6 | Aprender y Practicar |
| 6.♗xb5+ | cuidado | Si negras tapa con ...c6, tienes una pieza de más y tu alfil sigue atacado: retíralo a a4. | 6...c6 7.♗a4 | Aprender y Practicar |

## Sin "Ver"

| Jugada | Campo | Frase | Por qué no |
|---|---|---|---|
| 1.e4 | porque | Le abres paso a tu dama y a tu alfil de f1. | explica la jugada que ya está en la línea, sin una alternativa |
| 2.d4 | porque | Con tus peones en e4 y d4 dominas el centro, y negras todavía no tiene ninguno ahí. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.e5 | porque | Desde ahí le quitas la casilla f6 al caballo de g8, y el alfil de c8 de negras se queda encerrado detrás de e6. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.e5 | prepara | Tus peones de d4 y e5 forman una cadena, y su base es d4: ahí va a golpear negras. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3.e5 | prepara | Tu trabajo en la apertura es sostener d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.c3 | porque | Si negras cambia en d4, retomas con el peón de c y tu cadena sigue en pie. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.c3 (si juegas 4.dxc5) | errores | Si cambias en c5, sueltas tu centro: el alfil de negras retoma y tu peón de e5 se queda sin su base. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.cxd4 | prepara | Ahora ningún peón defiende d4: estás en la base sola. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.cxd4 (si juegas 5.♕xd4) | errores | Si retomas con la dama, el caballo de negras la ataca desde c6 y negras gana un tiempo. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♘f3 | porque | Ahora d4 tiene dos defensores, el caballo y tu dama, contra un atacante. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.a3 | porque | Así su caballo de c6 no va a b4, ni su alfil de f8 cuando el caballo deje e7. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.a3 | prepara | Tu otro caballo ya puede salir sin que nadie lo clave. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.♘c3 | porque | Tu peón de d4 sigue con dos defensores contra dos atacantes: puedes desarrollarte. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♘f3 (si juegas 5.♗d3) | errores | Desde d3 tu alfil tapa a tu dama: negras cambia en d4 y te gana el peón. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♘a3 | porque | Desde c2 defenderá d4 sin tapar a tu dama. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.♘a3 | prepara | Por ahora, tu peón de c3 sigue detrás de d4: si negras cambia, retomas con el peón. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 7.♘c2 | porque | Ahora d4 tiene cuatro defensores, el peón de c3, los dos caballos y tu dama, contra tres atacantes. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♘c2 | prepara | Si negras cambia en d4, retomas con el peón. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.a3 | porque | Con un peón en b4, tu alfil de c1 ya no tendrá que cuidar b2 y, cuando tu peón de c3 se vaya, podrá defender d4 desde b2. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.a3 (si juegas 6.♗e3) | errores | Con la dama de negras en b6, tu alfil de c1 no sale todavía: la dama se come tu peón de b2. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♘bd2 | porque | Con ...c4, ningún peón de negras ataca d4, y tu peón de c3 y tu caballo de f3 lo defienden: el caballo puede ir delante de tu dama. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♘bd2 | prepara | Desde d2 vigila c4 y e4. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♘bd2 (si juegas 7.b4) | errores | Si empujas b4 ahora, negras lo captura al paso con su peón de c4. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♗e2 | porque | Desde e2 no estorba a ninguna pieza tuya. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♗e2 | prepara | Ya puedes poner tu rey a salvo. | lo que dice se juega en las jugadas que siguen de la línea |
| 9.0-0 | porque | Ningún peón de negras ataca d4, y tu peón de c3 y tu caballo de f3 lo defienden contra la dama de b6: puedes enrocar. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.b4 | porque | Tu alfil de c1 ya no tiene que cuidar b2: tu peón está ahora en b4, defendido por tus peones de a3 y c3. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.b4 | prepara | Cuando cambien en d4 y retomes, tu alfil podrá defender d4 desde b2. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.b4 (si juegas 7.♗xh6) | errores | Si tomas en h6, la dama de negras se come tu peón de b2 y negras recupera la pieza. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.cxd4 | porque | Ahora estás en la base sola: ningún peón defiende d4, y lo sostienen tus piezas. | explica la jugada que ya está en la línea, sin una alternativa |
| 9.♗b2 | porque | Ahora son tres defensores, el alfil, el caballo de f3 y tu dama, contra tres atacantes. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♗e2 | porque | Desde e2 no corta la línea de tu dama hacia d4. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♘a3 | porque | Desde c2 defenderá d4 sin tapar a tu dama. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.cxd4 | porque | Estás en la base sola: ningún peón defiende d4. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.cxd4 | prepara | Tu caballo de a3 ya va en camino para ayudar. | lo que dice se juega en las jugadas que siguen de la línea |
| 9.♘c2 | porque | Ahora d4 tiene tres defensores, los dos caballos y tu dama, contra dos atacantes. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♘f3 | porque | Tu alfil de c1 se queda en casa, cuidando el peón de b2. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♗e2 | porque | Si negras lo cambia, retomas y sigues desarrollándote. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.♗e2 | prepara | Ya puedes poner tu rey a salvo. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.0-0 | porque | Si negras cambia en e2, retomas con la dama sin perder tiempo. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.♕xe2 | porque | Negras cambió su alfil encerrado, pero tú conservas tu cadena y más espacio. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♕xe2 | prepara | Siguen tu caballo de b1 y tu alfil de c1. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.c3 | porque | Cuando negras golpee con ...c5, ya tienes un peón para retomar en d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.♗xb5+ | porque | Así negras casi siempre retoma enseguida y tú ya puedes enrocar. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.0-0 | porque | Negras cambió su alfil encerrado, pero tú conservas la cadena y más espacio. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...cxd4 | porque | Si el peón de c3 retoma, a d4 no lo defiende nadie: el alfil de d3 tapa a la dama. | lo que dice se juega en las jugadas que siguen de la línea |
