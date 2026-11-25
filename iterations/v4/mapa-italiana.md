# El mapa de la Italiana, y su tabla de obligatorio y opcional (2026-11-25)

El curso de la Italiana por estructuras (`conocimiento/cursos/italiana.json`; `specs/cursos.md` §6). El mapa pasó dos vueltas del gate con un evaluator independiente; lo que cambió en cada una está en `log.md`. Las comprobaciones del motor: `iterations/v4/comprobaciones-italiana.md`.

## La pregunta y las formas

**¿Qué pasó con el peón de e5 de negras?**

| Forma | Qué pasó con e5 | Tu plan | Lecciones |
|---|---|---|---|
| **Centro cerrado** | Sigue en e5, frente a tu e4, y tu peón de d está en d3 | Sin prisa: enroque y Te1; Ab3, el caballo de b1 por d2 y h3; d4 cuando lo apoyen tus piezas. En el Centro cerrado, con tu torre en e1, nunca eches con h3 a un caballo en g4: la torre regresa a f1 | Dos Caballos con 4.d3; 3...Ac5 4.c3 Cf6 |
| **Centro ideal** | Se fue a d4 (...exd4) y lo retomaste con tu peón de c | Dura poco: negras ataca tus peones enseguida. En La Bourdonnais, d5 echa al caballo de c6 (ahí Cc3 no sirve: ...Cxe4 y ...d5 recuperan la pieza), y si el caballo salta a e5 lo cambias, o si va a a5 retiras tu alfil a d3; en el Blackburne, Cc3 cuida e4 y, si negras golpea con ...d5, tomas en d5. Nunca e5 sin preparar | La Bourdonnais; Blackburne-Kostić |
| **Centro abierto** | Se fue a d4 y lo retomaste con una pieza | Sacas tus piezas rápido y enrocas; si su caballo ataca tu alfil desde e5, retíralo primero. Antes, mira tu caballo de d4: si lo atacan por segunda vez (...Ac5 o ...Df6), cámbialo en c6; si después su dama sale a f6, cuida f2; si su caballo cambia en d4, retoma con la dama | 3...h6; 3...d6 (París) |

- **La regla que decide** (en tu jugada 4, o en la 5 tras 3...Ac5 4.c3): primero mira si atacan una pieza tuya; después, si el caballo de negras ya está en f6 atacando tu e4, d3; si negras juega pasivo (...d6, ...h6, ...Ae7), d4 de inmediato. Comprobada en las seis posiciones donde se aplica.
- **Sin lección, en el mapa:** 4...d5 contra 4.d3 (7.9 % y 7.3 % de las partidas del curso): toma en d5, enroca y lleva tu torre a e1.
- **Fuera del mapa:** la Húngara y la Rousseau (las únicas en que tu peón de e4 avanza a e5).
- **Tus otras jugadas** (4.d3 contra 3...Ac5, 6.Cbd2, 4.Cg5) no son lecciones: salen como "buena jugada, pero esta lección enseña otra línea".

## Obligatorio y opcional

Partidas Rapid de la base abierta de lichess (CC0), septiembre de 2026, con los dos jugadores en la banda. **Las partidas del curso** son las que llegan a 1.e4 e5 2.Cf3 Cc6 3.Ac4: 10,529 en 600–1000 y 45,608 en 1000–1400. El porcentaje de una lección: cuántas llegan a la posición que la define si juegas lo del curso (una sola jugada tuya por posición), sumando transposiciones.

| Sección | Lección | Forma | 600–1000 | n | 1000–1400 | n |
|---|---|---|---|---|---|---|
| La base | Dos Caballos: 4.d3 | Cerrado | 41.7 % | 1763 | 36.2 % | 7258 |
| La base | 3...Ac5 4.c3 d6 (La Bourdonnais) | Ideal | 6.5 % | 37 | 6.2 % | 281 |
| La base | 3...h6 | Abierto | 6.4 % | 272 | 18.7 % | 3745 |
| Las que más te van a salir | 3...Ac5 4.c3 Cf6 (Giuoco Pianissimo) | Cerrado | 17.0 % | 97 | 13.8 % | 625 |
| Las que más te van a salir | 3...d6 (Defensa París) | Abierto | 7.0 % | 295 | 5.4 % | 1088 |
| Las que más te van a salir | 3...Cd4 (la trampa) | Ideal | 1.9 % | 82 | 3.8 % | 755 |
| Opcional | 3...Ae7 (Húngara) | fuera | 0.6 % | 25 ⚠ | 1.3 % | 268 |
| Opcional | 3...f5 (Rousseau) | fuera | 0.6 % | 27 ⚠ | 1.7 % | 340 |

**Las formas, por cualquier camino** (tras la 7.ª jugada de negras, o donde se acaban los datos): Cerrado 54.7 % y 42.2 %; Abierto 7.5 % y 18.0 %; Ideal 3.0 % y 7.3 %. Las tres pasan el 5 % en alguna banda. **Los cortes caen en saltos de los datos:** por forma, de 7.3 a 3.0; por lección, de 3.8 a 1.7 (y de 1.9 a 0.6). La base del Abierto es 3...h6 y no París: París es un poco más jugada en 600–1000 (7.0 contra 6.4), pero tras 4.d4 negras cambia en d4 más seguido contra 3...h6, y en 1000–1400 es la más jugada con mucho; las dos son obligatorias.

**Límites:** se mide la forma de los peones, no si el plan sirve igual por cada camino; es lichess, un mes, en Rapid; no se comprobó que 600–1000 corresponda al 800 de Carlos.
