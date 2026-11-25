# El inventario de "Ver qué pasaría"

> Generado con `node scripts/ver-inventario.ts caro-kann:w`. La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso «Avance contra la Caro-Kann»: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.

**19 frases: 4 con "Ver"; 15 sin él** (7 porque explica la jugada que ya está en la línea, sin una alternativa; 5 porque dice qué sigue (un plan), no qué pasaría con otra cosa; 3 porque lo que dice se juega en las jugadas que siguen de la línea; 0 porque dice una alternativa, pero sin una consecuencia que se enseñe en el tablero; 0 porque la consecuencia no se sostiene con el motor). 1 de las 4 contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.

## Con "Ver"

| Jugada | Campo | Frase | La línea | Dónde sale |
|---|---|---|---|---|
| 6.♘f3 | porque | No cambies en c5: el alfil de negras retoma sacando una pieza y tu peón de e5 se queda sin su base. | 6.dxc5 6...♗xc5 | Aprender y Practicar |
| 8.♘bd2 | porque | Tapa a tu dama un momento, pero si negras cambia en f3, este caballo retoma y d4 queda bien defendido. | 8...♗xf3 9.♘xf3 | Aprender y Practicar |
| 5.♘f3 | porque | No saques el alfil a d3: taparía a tu dama, y negras cambiaría en d4 para ganarte el peón. | 5.♗d3 5...cxd4 6.cxd4 6...♘xd4 | solo Aprender |
| 7.♗e2 | porque | No lo saques a d3: taparía a tu dama, y negras cambiaría en f3 para comerse d4. | 7.♗d3 7...♗xf3 8.♕xf3 8...♘xd4 | Aprender y Practicar |

## Sin "Ver"

| Jugada | Campo | Frase | Por qué no |
|---|---|---|---|
| 1.e4 | porque | Le abres paso a tu dama y a tu alfil de f1. | explica la jugada que ya está en la línea, sin una alternativa |
| 2.d4 | porque | Con tus peones en e4 y d4 dominas el centro, y negras todavía no tiene ninguno ahí. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.e5 | porque | Desde ahí le quitas la casilla f6 al caballo de g8. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.e5 | prepara | Tus peones de d4 y e5 forman una cadena, y su base es d4: ahí va a golpear negras. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3.e5 | cuidado | Tu trabajo en la apertura es sostener d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.c3 | porque | Es el mismo esqueleto que contra la Francesa: c3, ♘f3, ♗e2 y 0-0. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.c3 | prepara | Si negras golpea d4 y cambia ahí, retomas con el peón de c y tu cadena sigue en pie. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.♗e2 | porque | Desde e2 no queda frente al alfil de f5 de negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♗e2 | prepara | Después vienen ♘f3 y el enroque. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.0-0 | porque | Antes de enrocar contaste: d4 tiene más defensores que atacantes. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.0-0 | prepara | Si negras cambia en d4, retomas con el peón de c. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.c3 | porque | Si negras cambia en d4, retomas con el peón de c y tu cadena sigue en pie. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.cxd4 | porque | Estás en la base sola: ningún peón defiende d4, y lo sostienen tus piezas. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.0-0 | porque | Antes de enrocar contaste: d4 tiene más defensores que atacantes. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...cxd4 | porque | Si el peón de c3 retoma, a d4 no lo defiende nadie: el alfil de d3 tapa a la dama. | lo que dice se juega en las jugadas que siguen de la línea |
