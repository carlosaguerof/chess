# El inventario de "Ver qué pasaría"

> Generado con `node scripts/ver-inventario.ts escandinava:w`. La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso «Contra la Escandinava»: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.

**68 frases: 11 con "Ver"; 57 sin él** (29 porque explica la jugada que ya está en la línea, sin una alternativa; 9 porque dice qué sigue (un plan), no qué pasaría con otra cosa; 18 porque lo que dice se juega en las jugadas que siguen de la línea; 1 porque dice una alternativa, pero sin una consecuencia que se enseñe en el tablero; 0 porque la consecuencia no se sostiene con el motor). 2 de las 11 contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.

## Con "Ver"

| Jugada | Campo | Frase | La línea | Dónde sale |
|---|---|---|---|---|
| 8.♘d5 | porque | Si negras toma tu caballo con el peón, pierde la dama. | 8...cxd5 9.♗xa5 9...dxc4 | Aprender y Practicar |
| 8.♘d5 | prepara | Tu alfil de c4 apoya a tu caballo: si la dama lo toma, tu alfil la toma a ella. | 8...♕xd5 9.♗xd5 9...cxd5 | Aprender y Practicar |
| 7.♕xf3 | prepara | Si la dama de negras se come tu peón de d4, tu dama se come b7 y después la torre de a8. | 7...♕xd4 8.♕xb7 8...♕d8 9.♕xa8 | Aprender y Practicar |
| 5.d4 | prepara | Si su dama sale de la columna e, su alfil de g4 se queda sin defensa: tu alfil de e2 se lo come. | 5...♕a5 6.♗xg4 | Aprender y Practicar |
| 5.d4 | cuidado | Si su alfil cambia en e2, retomas con tu caballo de g1: tu peón de d4 sigue atacando a la dama. | 5...♗xe2 6.♘gxe2 | Aprender y Practicar |
| 5.d4 (si juegas 5.♘f3) | errores | Su alfil cambia en f3 y tu alfil de e2 no puede retomar: está clavado contra tu rey. Te quedas con los peones doblados. | 5.♘f3 5...♗xf3 6.gxf3 | solo Aprender |
| 6.f3 (si juegas 6.♘f3) | errores | Su alfil se come tu caballo y tu alfil de e2 no puede retomar: sigue clavado por la dama. Te quedas con los peones doblados. | 6.♘f3 6...♗xf3 7.gxf3 | solo Aprender |
| 8.f4 | porque | Si negras no lo tapa, f5 gana su alfil. | 8...♕b6 9.f5 9...♘c6 10.fxg6 10...hxg6 | Aprender y Practicar |
| 8.f4 | porque | Pero si su dama se va a c6, primero ♗b5: la clava contra su rey y la ganas. | 8...♕c6 9.♗b5 9...e6 10.♗xc6+ 10...♘xc6 | Aprender y Practicar |
| 5.d4 | prepara | Si negras no se cuida, d5 gana una pieza. | 5...♘f6 6.d5 6...♘xd5 7.♘xd5 | Aprender y Practicar |
| 6.♘f3 | porque | Mientras solo el caballo de b4 ataque tu peón de c2, está seguro: si se lo come, tu dama lo captura. | 6...♘xc2+ 7.♕xc2 | Aprender y Practicar |

## Sin "Ver"

| Jugada | Campo | Frase | Por qué no |
|---|---|---|---|
| 2.exd5 | porque | Ahora negras tiene que recuperar el peón, y la pieza con la que lo recupere decide tu plan. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.♘c3 | porque | La dama tiene que moverse otra vez: tú sacaste una pieza y negras no, y a eso se le llama ganar un tiempo. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.♘c3 | prepara | Cada vez que una pieza tuya salga atacando a la dama, ganarás otro tiempo. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.d4 | porque | Tu caballo de c3 queda clavado: si se moviera, la dama de a5 daría jaque. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d4 | prepara | Tu alfil podrá ir a d2 a quitar la clavada. | lo que dice se juega en las jugadas que siguen de la línea |
| 5.♘f3 | porque | Desde f3, tu caballo también vigila e5. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.♗c4 | porque | Más adelante, ese alfil apoya a tu caballo si salta a d5. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.♗c4 | prepara | Con el alfil afuera, ya puedes enrocar. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 7.♗d2 | porque | Y si el caballo salta, tu alfil de d2 queda atacando a la dama de a5. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.h3 | porque | El alfil tiene que decidir: si se cambia por tu caballo, te quedas con los dos alfiles; si se retira, pierde tiempo. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.♕xf3 | porque | Te quedas con los dos alfiles, y tu dama ataca el peón de b7, que nadie defiende. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♗d2 | porque | Sin la clavada, tu caballo vuelve a ser una pieza libre. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 8.♗d2 | prepara | Ya puedes enrocar largo. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4.d4 | porque | Aquí tu caballo no queda clavado. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♘f3 | porque | Desde f3, tu caballo también vigila e5. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.g3 | porque | Contra la dama en d6, este plan funciona bien según los maestros, y el motor la ve como la mejor aquí. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.g3 | prepara | Tu alfil de f1 tendrá la diagonal larga. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.♗f4 | porque | Es otro tiempo ganado: la dama tiene que moverse de nuevo. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♗g2 | porque | Con el alfil afuera, ya puedes enrocar corto. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5.♘f3 | porque | Desde ahí, tu caballo también podrá saltar al centro. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.♘e5 | porque | Desde ahí, tu caballo podrá saltar otra vez contra la dama. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.♘c4 | porque | La dama tiene que moverse otra vez, mientras tú sigues sacando piezas. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.d4 | porque | Tienes un peón en el centro y un caballo afuera; negras todavía no saca ninguna pieza. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♘f3 | porque | Desde f3, tu caballo también vigila e5. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6.h3 | porque | El alfil tiene que decidir: si se cambia por tu caballo, te quedas con los dos alfiles; si se retira, pierde tiempo. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.♕xf3 | porque | Tienes los dos alfiles, y tu dama ataca b7. | explica la jugada que ya está en la línea, sin una alternativa |
| 3.d4 | porque | Es la respuesta más sólida, según la teoría: dejas que negras recupere su peón y tú te quedas con el centro. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.♘f3 | porque | El caballo de negras se queda en d5 por ahora; más adelante lo echarás con un peón. | lo que dice se juega en las jugadas que siguen de la línea |
| 5.♗d3 | porque | Si negras cambia los alfiles, tu dama retoma y sale al juego. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.♕xd3 | porque | Con tu caballo afuera y tu alfil de f1 ya cambiado, puedes enrocar corto. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.0-0 | porque | Después vas a echar al caballo de d5 con un peón. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.c4 | porque | Es el centro grande: tus peones de c4 y d4 le quitan casillas a las piezas de negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.♗e2 | porque | Y ya puedes enrocar corto. | lo que dice se juega en las jugadas que siguen de la línea |
| 6.0-0 | porque | Después vas a echar al caballo de d5 con un peón. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.c4 | porque | Es el centro grande: tus peones de c4 y d4 le quitan casillas a las piezas de negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♘c3 | porque | Tu peón de c4 sigue defendido por tu alfil de e2. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.c4 | porque | Es el centro grande: tus peones de c4 y d4 le quitan casillas a las piezas de negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.♘c3 | porque | Tu peón de c4 ya está defendido: tu alfil de f1 lo cuida desde su casilla. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.♗e2 | porque | Y ya puedes enrocar corto. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.0-0 | porque | El alfil de g7 sigue mirando a d4: tu dama y tu caballo de f3 lo defienden. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...♕xd5 | porque | Sin un alfil en c4, nadie apoyaba a ese caballo: el ataque descubierto no funcionó. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.♗b5 | porque | Es una clavada: negras tiene que dar su dama por tu alfil. | explica la jugada que ya está en la línea, sin una alternativa |
| 8.♕xb7 | porque | La torre no tiene a dónde ir, y la dama de negras está lejos para cuidarla. | explica la jugada que ya está en la línea, sin una alternativa |
| 9.♗xa5 | porque | El ataque descubierto funcionó: ganas la dama por un caballo y un alfil. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.♗e2 | porque | El jaque te sirve para desarrollar: tu alfil ya salió, y la dama de negras ya se movió dos veces. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.d4 | porque | Ganas otro tiempo: tú ocupas el centro y negras mueve la dama por tercera vez. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.d4 | porque | Además le abres camino a tu alfil de c1. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.f3 | porque | Tu peón tapa además el camino del alfil hacia tu alfil de e2: ya no se pueden cambiar. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.f3 | porque | Y negras vuelve a mover una pieza que ya había sacado. | explica la jugada que ya está en la línea, sin una alternativa |
| 6.f3 | prepara | Si el alfil se retira, tus peones lo siguen persiguiendo. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.g4 | porque | Mientras su alfil huye, negras no saca piezas nuevas: las suyas siguen en casa. | explica la jugada que ya está en la línea, sin una alternativa |
| 4.♗e2 | porque | El jaque te sirve para desarrollar: tu alfil ya salió, y la dama de negras ya se movió dos veces. | explica la jugada que ya está en la línea, sin una alternativa |
| 5.d4 (si juegas 5.♘f3) | errores | Sacas una pieza, pero sin amenaza: busca una jugada que obligue a negras a defenderse. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 6.♘f3 | prepara | Ya puedes enrocar. | lo que dice se juega en las jugadas que siguen de la línea |
| 7.0-0 | porque | Con tu rey en e1, tu alfil de e2 estaba clavado. | explica la jugada que ya está en la línea, sin una alternativa |
| 7.0-0 | prepara | Tu torre puede ir a e1, frente a la dama, si su dama no ataca también tu peón de c2. | lo que dice se juega en las jugadas que siguen de la línea |
| 8.♖e1 | porque | Si algún día tu alfil sale de e2, tu torre ataca a la dama de e6. | dice qué sigue (un plan), no qué pasaría con otra cosa |
