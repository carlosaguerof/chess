# El inventario de "Ver qué pasa"

> Generado con `node scripts/ver-inventario.ts` (2026-10-30). La prueba `tests/unit/ver-que-pasa.test.ts` revisa que esté al día. Cada frase de `porque`, `prepara`, `cuidado` y `errores` del curso de la Caro-Kann: con su "Ver" o con el porqué no lo lleva. `hace` no entra: es "Te toca", antes de jugar. La regla: `specs/cursos.md` §2.3.

**97 frases: 43 con "Ver"; 54 sin él** (27 porque explica la jugada que ya está en la línea, sin una alternativa; 18 porque dice qué sigue (un plan), no qué pasaría con otra cosa; 4 porque lo que dice se juega en las jugadas que siguen de la línea; 5 porque dice una alternativa, pero sin una consecuencia que se enseñe en el tablero; 0 porque la consecuencia no se sostiene con el motor). 11 de las 43 contienen, en alguna línea, una jugada que esa línea todavía te va a pedir: ahí no salen en Practicar.

## Con "Ver"

| Jugada | Campo | Frase | La línea | Dónde sale |
|---|---|---|---|---|
| 1...c6 | porque | Si blancas cambia en d5, retomas con el peón de c y sigues con un peón en el centro. | 2.d4 2...d5 3.exd5 3...cxd5 | solo Aprender |
| 1...c6 | prepara | A diferencia de la Francesa (1...e6), tu alfil de c8 queda libre para salir. | 1...e6 2.d4 2...d5 | solo Aprender |
| 3...♗f5 | porque | Después vas a jugar ...e6 para abrir tu otro alfil; si ...e6 fuera primero, este alfil quedaría encerrado detrás de tus peones, como en la Francesa. | 3...e6 | Aprender; en Practicar, solo en Avance: 4.g4 (Bayoneta) |
| 3...♗f5 (si juegas 3...e6) | errores | Así tu alfil de c8 se queda encerrado detrás de tus peones. | 3...e6 | Aprender; en Practicar, solo en Avance: 4.g4 (Bayoneta) |
| 5...c5 | porque | Si d4 cae, el peón de e5 se queda sin apoyo. | 6.♗e3 6...cxd4 7.♘xd4 | Aprender y Practicar |
| 5...c5 | prepara | Si blancas toma en c5, tu alfil de f8 retoma. | 6.dxc5 6...♗xc5 | Aprender y Practicar |
| 4...e6 | cuidado | Si blancas juega 5.♕b3 contra b7, defiéndelo con la dama: ...♕c7 o ...♕b6. | 5.♕b3 5...♕c7 · 5...♕b6 | Aprender y Practicar |
| 5...c5 | porque | Si blancas cambia en c5, tu alfil de f8 retoma y se desarrolla. | 6.dxc5 6...♗xc5 | Aprender y Practicar |
| 5...♗g6 | porque | En e4 lo tomaría el caballo de c3. | 5...♗e4 6.♘xe4 6...dxe4 | Aprender y Practicar |
| 7...h5 | porque | Si lo dejaras avanzar, tu alfil de g6 se quedaría sin casillas. | 7...♘c6 8.h5 | Aprender y Practicar |
| 7...h5 | cuidado | Si juegas ...♘c6 como si nada, 8.h5 echa a tu alfil y pierdes casi un peón de ventaja. | 7...♘c6 8.h5 8...♗e4 9.♖h3 9...♘h6 10.♘xe4 10...dxe4 | Aprender y Practicar |
| 7...h5 (si juegas 7...♘c6) | errores | Si no frenas el peón de h, da un paso más, echa a tu alfil y pierdes casi un peón de ventaja. | 7...♘c6 8.h5 8...♗e4 9.♖h3 9...♘h6 10.♘xe4 10...dxe4 | solo Aprender |
| 8...♗h7 | prepara | Si blancas toma tu peón de h5, tus piezas quedan activas a cambio. | 9.♘xh5 9...♘c6 10.dxc5 10...♗xc5 | Aprender y Practicar |
| 4...h5 | porque | Si juegas ...e6 ahora, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes. | 4...e6 5.g4 5...♗e4 6.f3 6...♗g6 7.h5 7...♗xh5 8.♖xh5 | solo Aprender |
| 4...h5 (si juegas 4...e6) | errores | Con ...e6 siguen g4, f3 y otro paso del peón de h, y tu alfil se queda sin casillas: lo pierdes. | 4...e6 5.g4 5...♗e4 6.f3 6...♗g6 7.h5 7...♗xh5 8.♖xh5 | solo Aprender |
| 4...h5 (si juegas 4...h6) | errores | Con ...h6 tu alfil tendría h7, pero blancas sigue con 5.g4 contra tu alfil. | 4...h6 5.g4 5...♗e4 6.f3 6...♗h7 | Aprender y Practicar |
| 5...♗g6 | cuidado | Aquí no juegues ...e6: el peón de f3 se come tu alfil. | 5...e6 6.fxe4 | Aprender y Practicar |
| 5...♗g6 (si juegas 5...e6) | errores | Con ...e6, el peón de f3 se come tu alfil. | 5...e6 6.fxe4 | Aprender y Practicar |
| 7...♗xf7 | porque | Tomar con el rey también se puede, pero el rey queda más expuesto y es peor. | 7...♔xf7 8.f4 | Aprender y Practicar |
| 5...♗g6 | cuidado | Si después blancas empuja h4, contesta ...h5 antes de seguir. | 6.h4 6...h5 | Aprender y Practicar |
| 4...♗f5 | porque | Si jugaras ...e6 primero, tu alfil quedaría encerrado detrás de tus peones. | 4...e6 | solo Aprender |
| 6...h6 | porque | Si h5 lo echa de g6, se retira a h7 y no queda atrapado. | 7.h5 7...♗h7 | solo Aprender |
| 6...h6 | cuidado | Si juegas ...♘d7 o ...e6 sin atender h4, después de 7.h5 tu alfil queda en apuros y blancas queda mucho mejor. | 6...♘d7 7.h5 7...♗f5 8.♘xf5 8...♕a5+ 9.♗d2 9...♕xf5 | solo Aprender |
| 6...h6 (si juegas 6...♘d7) | errores | Sin atender h4, 7.h5 echa a tu alfil de g6 y blancas queda mucho mejor. | 6...♘d7 7.h5 7...♗f5 8.♘xf5 8...♕a5+ 9.♗d2 9...♕xf5 | solo Aprender |
| 6...h6 (si juegas 6...e6) | errores | Sin atender h4, 7.h5 echa a tu alfil de g6 y blancas queda mucho mejor. | 6...e6 7.h5 7...♗f5 8.♘xf5 8...exf5 | solo Aprender |
| 6...h6 (si juegas 6...♘f6) | errores | Sin atender h4, 7.h5 echa a tu alfil de g6 y blancas queda mucho mejor. | 6...♘f6 7.h5 7...♗f5 8.♘xf5 8...♕a5+ 9.♗d2 9...♕xf5 | Aprender y Practicar |
| 8...♗h7 | cuidado | No lo lleves a f5: el caballo de g3 lo cambia y blancas queda mucho mejor. | 8...♗f5 9.♘xf5 9...♕a5+ 10.♗d2 10...♕xf5 | Aprender y Practicar |
| 8...♗h7 (si juegas 8...♗f5) | errores | En f5, el caballo de g3 lo cambia y blancas queda mucho mejor. | 8...♗f5 9.♘xf5 9...♕a5+ 10.♗d2 10...♕xf5 | Aprender y Practicar |
| 9...♗xd3 | porque | Es lo más sencillo: si no cambias tú, blancas cambia en h7. | 9...♘gf6 10.♗xh7 10...♘xh7 | Aprender y Practicar |
| 3...cxd5 | cuidado | Retomar con la dama la saca demasiado pronto, y es peor. | 3...♕xd5 4.c4 4...♕a5+ | Aprender y Practicar |
| 3...cxd5 (si juegas 3...♕xd5) | errores | Así sacas la dama demasiado pronto, y es peor. | 3...♕xd5 4.c4 4...♕a5+ | Aprender y Practicar |
| 6...♗g4 | porque | Si jugaras ...e6 primero, tu alfil quedaría encerrado. | 6...e6 | Aprender y Practicar |
| 7...♕d7 | cuidado | Nunca con ...♕c7: el alfil de f4 se come tu dama. | 7...♕c7 8.♗xc7 | Aprender y Practicar |
| 7...♕d7 | cuidado | Y si juegas ...e6, pierdes b7. | 7...e6 8.♕xb7 | Aprender y Practicar |
| 7...♕d7 (si juegas 7...♕c7) | errores | El alfil de f4 se come tu dama. | 7...♕c7 8.♗xc7 | Aprender y Practicar |
| 7...♕d7 (si juegas 7...e6) | errores | Dejas caer el peón de b7. | 7...e6 8.♕xb7 | Aprender y Practicar |
| 4...♘f6 | cuidado | Tomar en c4 es peor: el alfil blanco recupera el peón y de paso se desarrolla. | 4...dxc4 5.♗xc4 | Aprender y Practicar |
| 4...♘f6 (si juegas 4...dxc4) | errores | Es peor: el alfil blanco recupera el peón y de paso se desarrolla. | 4...dxc4 5.♗xc4 | Aprender y Practicar |
| 4...e6 | cuidado | No saques todavía el alfil a f5: 5.♗b5+ y negras queda claramente peor. | 4...♗f5 5.♗b5+ 5...♗d7 6.♕h5 6...♘h6 7.♘xd7 7...♘xd7 8.♕xd5 | Aprender y Practicar |
| 4...e6 (si juegas 4...♗f5) | errores | Todavía no: 5.♗b5+ y quedas claramente peor. | 4...♗f5 5.♗b5+ 5...♗d7 6.♕h5 6...♘h6 7.♘xd7 7...♘xd7 8.♕xd5 | Aprender y Practicar |
| 4...♘f6 | cuidado | Retomar con la dama es peor: con 5.♘c3 blancas la ataca y gana tiempo. | 4...♕xd5 5.♘c3 5...♕d6 | Aprender y Practicar |
| 4...♘f6 (si juegas 4...♕xd5) | errores | Así sacas la dama: con 5.♘c3 blancas la ataca y gana tiempo. | 4...♕xd5 5.♘c3 5...♕d6 | Aprender y Practicar |
| 5...♘xd5 | porque | Si blancas cambia caballos, retomas con la dama y el material queda igual. | 6.♘xd5 6...♕xd5 | Aprender y Practicar |

## Sin "Ver"

| Jugada | Campo | Frase | Por qué no |
|---|---|---|---|
| 2...d5 | porque | Ahora blancas tiene que decidir: cerrar con e5, cambiar en d5 o defender e4. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 2...d5 | prepara | Cada decisión de blancas es una variante de este curso. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3...♗f5 | prepara | Con el alfil afuera, ...e6 y ...c5 ya no encierran nada. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...e6 | porque | Ahora sí puedes jugarla: el alfil de c8 ya está afuera y no se encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...e6 | prepara | Con el alfil de f8 listo, viene ...c5 contra d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6...♕b6 | porque | Además se pone detrás de tu peón de c5, apuntando a d4. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♕b6 | prepara | Siguen ...♘c6 y ...cxd4 contra d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...e6 | porque | Tu alfil de c8 ya salió, así que ...e6 no lo encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...c5 | prepara | Después, más piezas contra d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6...♘c6 | porque | Ya atacas d4 dos veces: con el peón de c5 y con el caballo. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♘c6 | prepara | Siguen ...♕b6 y ...cxd4, como contra 4.♘f3. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...e6 | porque | El de c8 ya está afuera: ...e6 no lo encierra. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...e6 | prepara | Tu plan sigue siendo ...c5 contra d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6...c5 | porque | Blancas está ocupada persiguiendo a tu alfil; tú atacas su centro. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...h5 | prepara | Tu alfil podrá esconderse en h7. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 8...♗h7 | porque | Ahí ya no lo alcanza el caballo. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...h5 | prepara | Ahora sí puedes seguir con ...e6. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5...♗xd3 | porque | Es la jugada de la teoría: cambias el alfil que en la Francesa sería tu alfil malo, el que queda encerrado detrás de sus peones. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...♗xd3 | prepara | Después, ...e6 ya no encierra a nadie. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 6...e6 | porque | Ya no queda ningún alfil que encerrar. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...e6 | prepara | Siguen ...c5 y ...♘c6 contra d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...♗e4 | porque | Desde ahí tu alfil ataca a la torre de h1: el peón de g2 se fue a g4 y dejó la diagonal abierta. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♗e4 | prepara | Si blancas lo echa con f3, vuelve a g6. | lo que dice se juega en las jugadas que siguen de la línea |
| 5...♗g6 | porque | Sigue en su diagonal y a salvo. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♕d6 | porque | Si blancas lo cambia en f7, retomas con el alfil y recuperas el peón. | lo que dice se juega en las jugadas que siguen de la línea |
| 7...♗xf7 | prepara | Tu alfil cuida a tu rey desde f7; siguen ...♘d7 y ...♘gf6. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 4...e6 | porque | Tu alfil de c8 ya está afuera. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...e6 | prepara | Si el caballo llega a g3 y ataca a tu alfil, tendrá g6. | lo que dice se juega en las jugadas que siguen de la línea |
| 5...♗g6 | porque | Tu alfil sigue en su diagonal, mirando a e4. | explica la jugada que ya está en la línea, sin una alternativa |
| 3...dxe4 | porque | Además, f5 queda libre para tu alfil: el peón de e4 ya no la vigila. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♗f5 | prepara | Más adelante, ...e6 ya no lo encierra. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 5...♗g6 | porque | Desde ahí tu alfil sigue mirando a e4 y a c2. | explica la jugada que ya está en la línea, sin una alternativa |
| 7...♘d7 | porque | Así el caballo blanco ya no puede plantarse en e5. | explica la jugada que ya está en la línea, sin una alternativa |
| 9...♗xd3 | prepara | Ya no tienes alfil que encerrar: ...e6 viene enseguida. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 10...e6 | porque | Ahora sí ...e6: ya no hay alfil que encerrar. | explica la jugada que ya está en la línea, sin una alternativa |
| 10...e6 | prepara | Siguen ...♘gf6, ...♕c7 y el enroque. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3...cxd5 | porque | Para esto jugaste 1...c6. | explica la jugada que ya está en la línea, sin una alternativa |
| 3...cxd5 | porque | Además tu caballo de b8 recupera la casilla c6. | explica la jugada que ya está en la línea, sin una alternativa |
| 5...e6 | porque | Es la forma más sólida. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗b4 | porque | Ese caballo es el que vigila d5. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♗b4 | prepara | Siguen el enroque y la presión sobre d4. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3...♗g4 | porque | Es la respuesta lógica: el alfil sale antes de ...e6. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♗xf3 | porque | Blancas se queda con los dos alfiles, pero tú evitas líneas con mucha teoría. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 4...♗xf3 | cuidado | Retirarte a h5 es peor para el motor y pide saber mucho más. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 4...♗xf3 (si juegas 4...♗h5) | errores | Retirarte a h5 es peor para el motor y pide saber mucho más. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 5...e6 | porque | Sin tu alfil de casillas blancas, tus peones van en casillas blancas y tus piezas juegan en las negras. | explica la jugada que ya está en la línea, sin una alternativa |
| 3...dxe4 | prepara | Después de 4.dxe4 puedes cambiar las damas. | lo que dice se juega en las jugadas que siguen de la línea |
| 4...♕xd1+ | porque | El rey blanco tiene que retomar y ya no podrá enrocar. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...♕xd1+ | prepara | Sigue una partida sin damas, con todas las demás piezas en el tablero. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 3...e6 | porque | Es lo más sólido; cambiar en e4 lleva a líneas muy filosas. | dice una alternativa, pero sin una consecuencia que se enseñe en el tablero |
| 4...♗b4 | porque | Ese caballo defiende e4; clavado, no puede moverse. | explica la jugada que ya está en la línea, sin una alternativa |
| 6...♘e7 | prepara | Ya puedes enrocar. | dice qué sigue (un plan), no qué pasaría con otra cosa |
| 2...d5 | porque | Tu peón de d5 está defendido por c6 y por tu dama. | explica la jugada que ya está en la línea, sin una alternativa |
| 4...g6 | porque | La dama tiene que moverse otra vez, y tú ganas tiempo. | explica la jugada que ya está en la línea, sin una alternativa |
