# El inventario de "Ver qué pasaría"

> Generado con `node scripts/ver-inventario.ts eslava:b`. La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso «Defensa Eslava»: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.

**66 frases: 10 con "Ver"; 56 sin él** (38 porque explica la jugada que ya está en la línea, sin una alternativa; 12 porque dice qué sigue (un plan), no qué pasaría con otra cosa; 5 porque lo que dice se juega en las jugadas que siguen de la línea; 1 porque dice una alternativa, pero sin una consecuencia que se enseñe en el tablero; 0 porque la consecuencia no se sostiene con el motor). 4 de las 10 contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.

## Con "Ver"

| Jugada | Campo | Frase | La línea | Dónde sale |
|---|---|---|---|---|
| 2...c6 | prepara | Con ...e6 harías lo mismo, pero ese alfil se quedaría encerrado detrás de tus peones. | 2...e6 | solo Aprender |
| 3...♘f6 | prepara | Por eso sale antes que tu alfil de c8: sin el caballo, cxd5 y ♕b3 atacarían b7 y d5 a la vez. | 3...♗f5 4.cxd5 4...cxd5 5.♕b3 | Aprender; en Practicar, solo en Alekhine: 5.e3, Gambito Geller: 5.e4 |
| 4...♗f5 | porque | Blancas ya jugó e3: si tomaras en c4, su alfil de f1 lo recuperaría de una vez. | 4...dxc4 5.♗xc4 | Aprender y Practicar |
| 5...e6 | cuidado | Si la dama blanca va a b3 contra b7 antes de cambiar en d5, tu dama la enfrenta en b6. | 6.♕b3 6...♕b6 | Aprender y Practicar |
| 5...♗f5 | prepara | Desde f5 tu alfil frena e4: si blancas lo juega, pierde ese peón. | 6.e4 6...♘xe4 7.♘xe4 7...♗xe4 | Aprender; en Practicar, solo en Checa: 5.a4, Checa: 6.♘e5 (Carlsbad) |
| 5...♗f5 (si juegas 5...b5) | errores | Con a4 ya jugado, ese peón no sostiene nada: blancas lo cambia y se lo gana. | 5...b5 6.axb5 6...cxb5 7.♘xb5 | Aprender y Practicar |
| 7...♗b4 | porque | Ese caballo apoya e4: mientras esté clavado, si blancas juega e4, pierde el peón. | 8.e4 8...♘xe4 | Aprender; en Practicar, solo en Checa: 5.a4 |
| 7...e6 | cuidado | Si la dama blanca va a b3 contra b7, tu alfil de f8 la tapa en b4, defendido por tu caballo. | 8.♕b3 8...♗b4 | Aprender y Practicar |
| 4...b5 (si juegas 4...e6) | errores | Así blancas recupera el peón de c4 con su alfil y se queda con el centro. | 4...e6 5.♗xc4 | Aprender y Practicar |
| 6...♗a6 | porque | Desde a6 cuida c4: si el alfil de f1 se come el peón, tu alfil se come al suyo. | 7.♗xc4 7...♗xc4 | Aprender y Practicar |

## Sin "Ver"

| Jugada | Campo | Frase | Por qué no |
|---|---|---|---|
| 1...d5 | porque | Así vigilas e4: blancas no puede poner ahí su otro peón con comodidad. | explica la jugada que ya está en la línea, sin una alternativa |
| 1...d5 | prepara | Y le abres camino a tu alfil de c8. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 2...c6 | porque | Si blancas cambia en d5, retomas con un peón y sigues vigilando e4. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 2...c6 | prepara | Tu alfil de c8 queda libre para salir. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3...♘f6 | porque | Tu caballo de f6 defiende otra vez d5 y vigila e4. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♗f5 | porque | Por eso sacas el alfil, con tu caballo de f6 cuidando d5. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...e6 | porque | Tu alfil de c8 ya salió: este peón ya no lo encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗g6 | porque | Si el caballo lo cambia, retomas con el peón de h y tu torre de h8 gana una columna. | lo que dice se juega en las jugadas que siguen de la línea |
| 7...hxg6 | porque | Tu torre de h8 gana la columna h, abierta hasta el peón de h2. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...hxg6 | prepara | Blancas tiene los dos alfiles, pero tu posición es sólida: sigues con tus piezas y el enroque. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...dxc4 | porque | Blancas todavía no jugó e3: recuperar el peón le va a costar jugadas, y mientras tanto sacas tus piezas. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...♗f5 | porque | Tu peón de c4 cuida b3, así que la dama blanca no puede ir ahí contra b7. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...e6 | porque | Tu alfil de c8 ya está afuera: este peón ya no lo encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...e6 | prepara | Tu alfil de f8 podrá salir a b4: después de a4, ningún peón de blancas puede vigilar esa casilla. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 7...♗b4 | prepara | Y ya puedes enrocar. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 8...0-0 | porque | Blancas recuperó el peón y tú sacaste tus alfiles y enrocaste: la partida queda pareja. | explica la jugada que ya está en la línea, sin una alternativa |
| 9...♘e4 | porque | Desde e4 tu caballo ataca al de c3, que ya estaba atacado por tu alfil de b4. | explica la jugada que ya está en la línea, sin una alternativa |
| 10...♗g6 | porque | Desde g6 sigue cuidando a tu caballo de e4. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♘bd7 | porque | Tu caballo de d7 ataca al de e5: blancas tiene que decidir si lo cambia o se lo lleva a c4. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...♕c7 | porque | Con ella apoyas el avance de tu peón de e, que libera tu juego. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 8...e5 | porque | Tu dama y tu caballo de d7 apoyan e5, y tus piezas ganan espacio. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...b5 | porque | Sin a4, nada lo impide, y su alfil de f1 ya no recupera el peón. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...b5 | prepara | Si blancas lo ataca con a4, tu peón sigue adelante y echa a su caballo de c3. | lo que dice se juega en las jugadas que siguen de la línea |
| 6...b4 | porque | El caballo tiene que irse, y blancas pierde tiempo. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...e6 | porque | El caballo de blancas quedó en a2, lejos del centro, y tú sigues sacando piezas. | explica la jugada que ya está en la línea, sin una alternativa |
| 8...♗b7 | porque | Cuando tu peón de c6 avance, ese alfil mirará toda la diagonal larga. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5...b5 | porque | Su alfil de f1 ya no puede recuperarlo sin perderse. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♘d5 | porque | Ahí ningún peón de blancas lo puede atacar. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...e6 | porque | El caballo se queda en el centro, y tu alfil de f8 ya puede salir. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...e6 | prepara | Es una línea con mucha pelea: termina de sacar tus piezas y enroca. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...♗g4 | porque | Tu alfil sale antes de ...e6, que lo dejaría encerrado. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...e6 | porque | Tu alfil de c8 ya está afuera, y tus peones de c6, d5 y e6 forman un centro firme. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗e7 | porque | Con tu alfil de f8 afuera, ya puedes enrocar. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...cxd5 | porque | Sigues con un peón en d5, y la posición queda simétrica: los peones de los dos lados son iguales. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...♘c6 | porque | Tu caballo vigila d4 y e5, y no le tapa el camino a tu alfil de c8, como haría en d7. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗f5 | porque | Es la idea de siempre: tu caballo de f6 cuida d5, y el alfil sale antes de que ...e6 lo encierre. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...e6 | porque | Tu alfil de c8 ya está afuera: este peón ya no lo encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 8...♗b4 | porque | Además clavas al caballo de c3 contra el rey de e1. | explica la jugada que ya está en la línea, sin una alternativa |
| 3...cxd5 | porque | Sigues con un peón en d5 vigilando e4, y la posición queda simétrica. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♘f6 | porque | Tu caballo de f6 también vigila e4. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...♘c6 | porque | Tu caballo vigila d4 y e5, y no le tapa el camino a tu alfil de c8, como haría en d7. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗f5 | porque | Es la idea de siempre: tu caballo de f6 cuida d5, y el alfil sale antes de que ...e6 lo encierre. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...e6 | porque | Tu alfil de c8 ya salió: este peón ya no lo encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 3...dxc4 | porque | Blancas todavía no jugó e3: recuperar el peón le va a costar jugadas. | explica la jugada que ya está en la línea, sin una alternativa |
| 3...dxc4 | porque | Si no impide ...b5 ni saca su alfil por g2, podrás defenderlo. | lo que dice se juega en las jugadas que siguen de la línea |
| 4...b5 | porque | Así su alfil de f1 ya no puede recuperarlo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...b5 | prepara | Si blancas ataca este peón con a4, lo avanzas contra su caballo de c3. | lo que dice se juega en las jugadas que siguen de la línea |
| 5...b4 | porque | El caballo de c3 tiene que irse, y blancas pierde tiempo. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...♕xd4 | porque | Ese peón no tenía defensa: ahora tienes dos peones de más. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...♕xd4 | cuidado | Blancas va a atacar a tu dama con su caballo: tenla lista para retirarse. | lo que dice se juega en las jugadas que siguen de la línea |
| 8...♕b6 | porque | Tienes dos peones de más, pero blancas tiene el centro y le toca mover: ahora te toca sacar tus piezas. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3...dxe4 | porque | Ganas un peón, y blancas tendrá que pelear para recuperarlo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...e5 | porque | En lugar de defender el peón de e4, abres el juego para tus piezas. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...exd4 | porque | Blancas tiene que retomar, y tú sigues con el peón de e4 de más. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♕xd4 | porque | Sin damas, blancas tiene menos con qué atacar, y tu posición queda un poco mejor. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 7...♘f6 | porque | Defiendes tu peón de e4 mientras sacas una pieza, y tu posición queda un poco mejor. | dice qué sigue (un plan), no qué pasaría con otra cosa |
