# Los cursos del escalón 1 (specs)

> Decidido por Carlos el 2026-10-29 (diseño del escalón 1, aprobado con el piloto de la Caro-Kann). Esta página es la regla para hacer los otros siete cursos igual que el piloto. Lo que cambie cuando Carlos pruebe el piloto en el iPhone se anota aquí antes de la segunda corrida.

## Para qué

Aprender mis aperturas y defensas **comprendiéndolas, no de memoria**: cada jugada con su porqué, primero aprendida y luego encontrada por la meta. Un curso por rama de mi árbol (diseño §2): Italiana, Alapin, Avance contra la Caro-Kann, Avance contra la Francesa, la captura contra la Escandinava, Caro-Kann, Eslava y "...c6 y ...d5 contra lo demás".

## 1. El curso: seis piezas, en este orden

| # | Pieza | Qué trae | Cómo se ve |
|---|---|---|---|
| 1 | **La idea** | Contra qué la juegas, la idea en dos frases y qué vas a aprender (60–90 palabras) | De leer, con la posición clave y 1 o 2 marcas |
| 2 | **La estructura** | Tus peones y los del rival, tu ruptura y la suya, la casilla clave, "se parece a…" (una página por estructura principal) | De leer, solo los peones, con la base de la cadena y una flecha por ruptura |
| 3 | **Las variantes** | Una lección por respuesta del rival que trae la base, de la más común a la más rara; máximo 6 a 8 jugadas mías por variante | De mover (la lección, §2) |
| 4 | **El plan** | Al terminar Aprender de cada variante: "Ya terminó la apertura. Tu plan: …" y el del rival en una frase | Dentro de la lección, con las flechas del plan |
| 5 | **Errores y trampas** | De 2 a 4 "¿Y si…?": primero los tuyos, luego los del rival que puedes castigar. Cada error, medido con el motor: si la jugada del rival es buena (6.h4 en la Bayoneta es su segunda mejor), no hay qué castigar y no entra | De mover: castigas tú, con la pieza que castiga, y el tablero se ve desde tu lado |
| 6 | **Repaso del curso** | La línea principal en un renglón, la idea en una frase, 2 o 3 reglas para recordar, y "Lo que tu guía decía distinto" | De leer |

Más un **glosario** ("Palabras del curso", plegado al final de la página del curso): cada término que usan los textos, en una frase.

**Qué es "una variante":** una respuesta del rival (en la Caro-Kann: 4.Cf3, 4.c3, 4.Cc3, 4.h4, 4.g4, 4.Ce2, 3.Cc3, 3.exd5, 4.c4, 2.Cc3, 2.Cf3 con 3.d3, 2.Cf3 con 4.Ce5, 2.c4, 3.f3, 2.d3 y 2.Ac4). Mi respuesta es una sola, la recomendada por la investigación. Mis otras jugadas buenas que trae la base (en la Caro-Kann, 3...c5 y 4...Cd7) no son lecciones aparte: la lección las reconoce como "buena jugada, pero esta lección enseña otra línea". Si Carlos quiere una lección para ellas, se agrega una entrada en `variantes` (un paso).

**El orden:** por la frecuencia de la guía de Carlos (5 a 2) y, dentro de una familia, primero la línea principal de Wikibooks y Wikipedia. Las que no tienen dato van al final (frecuencia 1 en el curso; en la base quedan sin dato, como dice `scripts/base/ESQUEMA.md`).

**El tronco:** la primera variante empieza desde 1.e4 (o desde la primera jugada); las demás empiezan ya con el tronco en el tablero (`desde`: 1.e4 c6 2.d4 d5 en la Caro-Kann) y lo muestran en la línea.

## 2. La lección (diseño §4)

Código: `src/curso/ciclo.ts` (el ciclo, sin pantalla), `src/pantallas/LeccionCurso.tsx` (la pantalla), `src/curso/textos.ts`, `src/curso/avance.ts`.

- **Dos vueltas por variante.** *Aprender*: "Te toca: 3...♗f5" con qué hace; al jugarla, "Correcto" con por qué ahora, qué prepara y el cuidado, y la máquina espera a **Siguiente**. Al final de Aprender, **el plan** (pieza 4). *Practicar*: la pregunta por la meta, sin la jugada; al acertar, solo "Correcto" y la máquina contesta sola (qué hace ya lo dijo Aprender y lo dice la Respuesta; un texto más largo se borraría a los 0.9 s, y nada se quita antes de leerlo: pase adversarial 2).
- **El ciclo rápido:** la jugada del rival llega sola a los 0.9 s. Cuando hay algo que leer, espera a Siguiente. La jugada ilegal no se puede hacer.
- **Tablero limpio en tu turno.** Las flechas de la siguiente jugada están apagadas de entrada; se prenden en Ajustes → "Flechas de la siguiente jugada" (solo en Aprender).
- **La ayuda en tres escalones,** solo si la pides: **Pista** (la idea en palabras), **Otra pista** (se marca la pieza que se mueve) y **Respuesta** (la flecha de la jugada, con su porqué). La Respuesta siempre está a la mano: con un error a la vista, Respuesta y Pista lo quitan y ayudan en un solo toque. La Respuesta cuenta como fallo para Refuerza y el Repaso.
- **El error se explica y se queda a la vista,** con la flecha roja de lo que jugaste, hasta **Reintentar**. Por qué no (sin la respuesta): lo que el curso trae para esa jugada (`errores`); si no, si deja una pieza tuya sin defensa; si no, que no logra la meta (solo en Aprender de una variante, que ya dijo la jugada, "Esta lección juega …"; nunca en Practicar ni en un «¿Y si…?»). Si el motor ve que pierde material o te deja peor, lo agrega; en un «¿Y si…?», donde se compara con la jugada que castiga, dice "el motor ve otra jugada que gana material" (la tuya puede no perder nada).
- **La jugada buena de otra línea** (está en la base para esa posición, o en `buenas` de esa jugada, medida con el motor) sale en azul: "Buena jugada, pero esta lección enseña otra línea. Prueba de nuevo." No cuenta como fallo.
- **Dónde vas:** "Variante N de M", "Jugada N de M" y la línea hasta ahora en un renglón, sin lo que sigue.
- **Atrás** regresa una jugada tuya; **Empezar de nuevo** reinicia la vuelta y pregunta antes.
- **El avance se guarda** en el teléfono (`ajedrez.v1.curso:<curso>`): piezas leídas, variantes aprendidas y terminadas, "¿Y si…?" hechos, y dónde me quedé (al volver, retomo ahí). Viaja en el Respaldo.
- **Al terminar Practicar, el resumen:** la línea en un renglón, la idea clave, en qué me equivoqué (fallos, Pista, Respuesta) y tres salidas: siguiente variante, repetir, volver al curso.
- **El espacio fijo de los mensajes** junto al tablero narra (la jugada del rival y su porqué, la pregunta, Correcto, el error) y no se quita solo. En el celular tiene una altura fija y se desplaza por dentro: Pista, Respuesta y Atrás nunca salen de la pantalla; cada momento nuevo se lee desde arriba y la ayuda que pides se lleva a la vista. Su botón (Siguiente, Reintentar, Ahora, Practicar) se queda abajo en una franja del color del panel, a todo lo ancho: el texto pasa por debajo sin asomarse a su lado (C9).
- **El registro:** cada jugada de Practicar se registra como antes (`registrarPasoCurso`) y alimenta Refuerza; al terminar una variante entra al Repaso de hoy (`marcarLeccion`). Las variantes son las lecciones del curso para el Repaso (`leccionesDe`).

## 3. Los textos

- **Los escribimos nosotros,** en español sencillo, con las ideas de fuentes abiertas (Wikibooks y Wikipedia) y serias (solo la idea). Nunca se copian textos con derechos. Una frase traducida de Wikibooks iría con su crédito y su licencia en archivos aparte; el piloto no trae ninguna.
- **Cada jugada mía:** `pregunta` (la meta, sin la jugada ni su casilla de destino), `pista` (la idea en palabras, sin la jugada ni su casilla; **obligatoria**: la de respaldo por tipo de jugada daba ideas falsas, como "un peón prepara tu estructura" para g4 contra el alfil), `buenas` (jugadas buenas en esa posición que no son la de la lección: toda jugada que el motor ve a 0.2 o menos de ella entre sus 5 mejores, salvo las que el curso enseña a no jugar; no salen en rojo), `hace`, `porque`, `prepara` y `cuidado` (opcionales), `errores` (por qué no, para las equivocadas conocidas; sale también en Practicar, así que tampoco dice la jugada ni su casilla), `marcas` (una por idea, después de jugarla), `fuente` y `motor`. **Cada jugada del rival:** una frase (`rival`), que tampoco dice mi respuesta.
- **El orden y el largo:** qué hace → por qué ahora → qué prepara → cuidado; de 1 a 3 frases; hasta 40 palabras la explicación entera, salvo las jugadas clave (`clave: true`, hasta 100). Hechos que se cuentan, no adjetivos. **Sin símbolos de evaluación** (ni ?, !, ±, +0.4). Cada término se explica la primera vez y va al glosario.
- **La notación por dentro** es la de las guías (R D T A C, `0-0`); la pantalla la muestra en figuras o en letras (`specs/` y AGENTS.md). Las jugadas de las líneas, en SAN inglés.
- **Nada se inventa:** cada jugada sale de la base (`scripts/base/definiciones/<apertura>.json`): la fila de la lista CC0 de lichess y, si la lección sigue más allá, una `continuacion` con su fuente (Wikibooks, Wikipedia o la mejor jugada del motor), validada como todo con `npm run validar-base` (ninguna jugada mía pierde más de 1 peón). Cada "evita", "pierde" o "es un error" se comprueba con el motor y su comando queda en `iterations/<vuelta>/comprobaciones-del-curso.md`.
- **La fuente de cada idea** se guarda en el contenido (`fuente`, con la lista `fuentes`); en la app no se cita nada.

## 4. Dónde vive

- **El contenido:** `conocimiento/cursos/<apertura>.json` (forma: `src/curso/tipos.ts`), registrado en `CURSOS_NUEVOS` (`src/curso/datos.ts`). Un curso que no está ahí sigue con la lección de antes (`src/pantallas/Leccion.tsx`).
- **Las pantallas:** `src/pantallas/CursoPagina.tsx` (la página del curso, las piezas de leer y Errores y trampas) y `src/pantallas/LeccionCurso.tsx`. Rutas: `#/curso/<curso>`, `#/curso/<curso>/leer/<idea|estructura|repaso>`, `#/curso/<curso>/errores`, `#/curso/<curso>/linea/<v:id|e:id>`; `#/leccion/<curso>/<n>` abre la variante n.
- **Lo guardado de antes:** al abrir la app, lo que llevaba en el Repaso de las lecciones viejas pasa a la lección nueva de la misma respuesta (`migrarAlCursoCaroKann` en `src/aprender/migracion.ts`; para otro curso, su propia tabla).

## 5. Cómo se comprueba

- `node scripts/revisar-curso.ts <curso>` lista de una vez lo que falta o no cumple la forma (largo, pregunta que delata). Solo encuentra la jugada o su casilla escritas: una pregunta o una pista que la *describe* ("el peón puede dar un paso más", "la casilla que te preparaste", "un cambio con jaque" cuando hay uno solo) la delata igual y solo la ve un pase adversarial.
- Vitest: `tests/unit/curso-contenido.test.ts` (piezas, orden, cada jugada legal y en la base, máximo 8 mías, textos y fuentes, cada jugada con su Pista, 40 palabras, sin símbolos, la pregunta no delata) y `tests/unit/curso-ciclo.test.ts` (el ciclo y el registro que alimenta Refuerza y el Repaso).
- Playwright, en los dos perfiles: `tests/e2e/c3-leccion.spec.ts` (cada punto de §2) y `tests/e2e/c6-pantallas.spec.ts` (las pantallas y sus capturas).
- El motor: `iterations/<vuelta>/comprobaciones-del-curso.md`. Y hasta tres pases adversariales antes de publicar, cada uno con un subagente nuevo y solo seis categorías: errores de ajedrez, afirmaciones que el motor no sostiene, textos que delatan la jugada, puntos del diseño §4 que no se cumplen, algo que ya existía y se rompió, y texto copiado. En el piloto, el primero encontró 25 cosas que las pruebas no veían (`iterations/v3/learning.md`).
