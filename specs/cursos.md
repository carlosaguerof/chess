# Los cursos del escalón 1 (specs)

> Decidido por Carlos el 2026-10-29 (diseño del escalón 1, aprobado con el piloto de la Caro-Kann). Esta página es la regla para hacer los otros siete cursos igual que el piloto. Lo que cambie cuando Carlos pruebe el piloto en el iPhone se anota aquí antes de la segunda corrida.
>
> **Las correcciones del piloto (2026-10-29, `iterations/v3/feedback.md`)** ya están aquí: las coordenadas en todos los tableros del curso (§1), Practicar sin ayudas que no pediste (§2), "Ver paso a paso" (§2.1) y las marcas en el tablero (§2.2, reglas v1.1). Por ahora solo las tiene la Caro-Kann (Nota 1 de Carlos): los otros siete cursos salen así cuando se hagan.

## Para qué

Aprender mis aperturas y defensas **comprendiéndolas, no de memoria**: cada jugada con su porqué, primero aprendida y luego encontrada por la meta. Un curso por rama de mi árbol (diseño §2): Italiana, Alapin, Avance contra la Caro-Kann, Avance contra la Francesa, la captura contra la Escandinava, Caro-Kann, Eslava y "...c6 y ...d5 contra lo demás".

## 1. El curso: seis piezas, en este orden

| # | Pieza | Qué trae | Cómo se ve |
|---|---|---|---|
| 1 | **La idea** | Contra qué la juegas, la idea en dos frases y qué vas a aprender (60–90 palabras) | De leer, con la posición clave y "Ver paso a paso" (§2.1) |
| 2 | **La estructura** | Tus peones y los del rival, tu ruptura y la suya, la casilla clave, "se parece a…" (una página por estructura principal) | De leer, solo los peones, y "Ver paso a paso": la cadena, su base y cada ruptura |
| 3 | **Las variantes** | Una lección por respuesta del rival que trae la base, de la más común a la más rara; máximo 6 a 8 jugadas mías por variante | De mover (la lección, §2) |
| 4 | **El plan** | Al terminar Aprender de cada variante: "Ya terminó la apertura. Tu plan: …" y el del rival en una frase | Dentro de la lección, con las marcas de su frase y "Ver paso a paso" desde el final de la variante |
| 5 | **Errores y trampas** | De 2 a 4 "¿Y si…?": primero los tuyos, luego los del rival que puedes castigar. Cada error, medido con el motor: si la jugada del rival es buena (6.h4 en la Bayoneta es su segunda mejor), no hay qué castigar y no entra | De mover: castigas tú, con la pieza que castiga, y el tablero se ve desde tu lado |
| 6 | **Repaso del curso** | La línea principal en un renglón, la idea en una frase, 2 o 3 reglas para recordar, y "Lo que tu guía decía distinto" | De leer, con "Ver paso a paso" |

**Todo tablero del curso lleva coordenadas** (a–h y 1–8, dentro de las casillas), las mismas de la lección, y volteadas cuando el curso es con negras: el de la lección, los de las páginas de leer y el del paso a paso (puntos 1 y 4 del feedback; `TableroMini` con `coordenadas`): "Los necesito para ubicar mejor lo que dice abajo."

Más un **glosario** ("Palabras del curso", plegado al final de la página del curso): cada término que usan los textos, en una frase.

**La página del curso** (`#/curso/<curso>`): el tablero, el nombre, "N de M variantes", un botón grande y las piezas en orden con su estado. **El botón grande es la acción principal:** "Empezar" la primera vez y "Repasar el curso" con todo hecho, una sola palabra con la letra de `grande` (22 px). En medio, **"Seguir" con jerarquía** (2026-10-29): arriba "Seguir", con esa letra, y abajo dónde retomo, el nombre de la variante a medias o de lo primero pendiente ("Avance: 4.♘c3 (Van der Wiel)", "La estructura"), en 15 px, de peso normal y en un renglón, sin puntos suspensivos. El más largo de la Caro-Kann, el de la Van der Wiel, mide 208 de los 296 que deja el botón a 360 de ancho. Antes iba todo en 22 px ("Seguir: …") y "Wiel)" quedaba solo en el segundo renglón. Los dos renglones van en un solo elemento hijo del botón (`specs/ux.md`, los botones con jugadas en su texto). Un curso nuevo mide su nombre más largo con `tests/e2e/boton-seguir.spec.ts`; si no cabe a 360, baja la letra del renglón chico, no menos de 13 px.

**Qué es "una variante":** una respuesta del rival (en la Caro-Kann: 4.Cf3, 4.c3, 4.Cc3, 4.h4, 4.g4, 4.Ce2, 3.Cc3, 3.exd5, 4.c4, 2.Cc3, 2.Cf3 con 3.d3, 2.Cf3 con 4.Ce5, 2.c4, 3.f3, 2.d3 y 2.Ac4). Mi respuesta es una sola, la recomendada por la investigación. Mis otras jugadas buenas que trae la base (en la Caro-Kann, 3...c5 y 4...Cd7) no son lecciones aparte: la lección las reconoce como "buena jugada, pero esta lección enseña otra línea". Si Carlos quiere una lección para ellas, se agrega una entrada en `variantes` (un paso).

**El orden:** por la frecuencia de la guía de Carlos (5 a 2) y, dentro de una familia, primero la línea principal de Wikibooks y Wikipedia. Las que no tienen dato van al final (frecuencia 1 en el curso; en la base quedan sin dato, como dice `scripts/base/ESQUEMA.md`).

**El tronco:** la primera variante empieza desde 1.e4 (o desde la primera jugada); las demás empiezan ya con el tronco en el tablero (`desde`: 1.e4 c6 2.d4 d5 en la Caro-Kann) y lo muestran en la línea.

## 2. La lección (diseño §4)

Código: `src/curso/ciclo.ts` (el ciclo, sin pantalla), `src/pantallas/LeccionCurso.tsx` (la pantalla), `src/curso/textos.ts`, `src/curso/avance.ts`.

- **Dos vueltas por variante.** *Aprender* (a Carlos le gustó mucho: se protege tal cual): "Te toca: 3...♗f5" con qué hace; al jugarla, "Correcto" con por qué ahora, qué prepara y el cuidado, y la máquina espera a **Siguiente**. Al final de Aprender, **el plan** (pieza 4). *Practicar* (correcciones, punto 5: "se supone que es práctica, sin pistas"):
  1. **En tu turno no hay ningún texto sobre tu jugada,** ni la pregunta por la meta: la narración solo explica la jugada del rival ("ayuda a comprender").
  2. **Pista,** solo si la pides: la idea en palabras (la `pregunta`, la meta). Si la pides otra vez, **se marca la pieza**, sin más texto.
  3. **Respuesta,** solo si la pides: **la flecha**, sin repetir texto.
  4. **Después de tu jugada** (correcta, o tras ver la Respuesta), **la explicación:** qué hace, por qué ahora, qué prepara y el cuidado, y la máquina espera a **Siguiente** ("para seguir reforzando el entendimiento"). Esto reemplaza el "solo Correcto" del piloto.

  Código: `src/curso/turno.ts` (`vistaTuTurno` y `explicacionDespues`). Un «¿Y si…?» no es Practicar: sigue preguntando por la meta, con las ayudas de Aprender.
- **Saltar de una vuelta a la otra** (Carlos, 2026-10-30: "quiero saltar directo a Practicar, por ejemplo con una variante que ya aprendí"). En la fila de arriba, la etiqueta de la vuelta es un **interruptor de dos opciones, Aprender | Practicar**, con "Jugada N de M" a la derecha. Se ve siempre, en Aprender (también en el plan) y en Practicar. La vuelta en curso va marcada con el color de su chip de antes (`chip-rep` para Aprender, `chip-base` para Practicar) y en negritas; la otra, sin fondo y con letra normal.
  1. **Tocar la otra** empieza esa vuelta desde su primera jugada, con su introducción (`empezar(l, vuelta)`, como "Ahora, Practicar"), **sin preguntar:** son pocas jugadas y volver es otro toque. Tocar la que ya está no hace nada.
  2. **Lo que se guarda para retomar** ("dónde me quedé") toma la vuelta nueva desde el toque, aunque salga antes de mi primera jugada.
  3. **Terminar Practicar sin haber hecho Aprender** cuenta igual: la variante sale hecha en la página del curso ("N de 16 variantes": cuenta `terminada`, no `aprendida`) y entra al Repaso de hoy (`marcarLeccion`), como cuando hago las dos. Las jugadas de Practicar se registran igual que siempre.
  4. **No agrega altura:** va en la misma fila, más baja que "Jugada N de M"; lo que se toca crece 10 arriba y 10 abajo, dentro del margen del panel. La lección sigue cabiendo a 360, 375, 390, 402 y 430 de ancho.
  5. **No va en el resumen** (ahí no hay fila) **ni en los «¿Y si…?»**, que se quedan con su chip "Castígalo".

  Código: `cambiarVuelta` en `src/pantallas/LeccionCurso.tsx` y `.vueltas` en `src/estilos.css`. Prueba: `tests/e2e/saltar-a-practicar.spec.ts`.
- **El ciclo rápido:** la jugada del rival llega sola a los 0.9 s. Cuando hay algo que leer, espera a Siguiente. La jugada ilegal no se puede hacer.
- **Tablero limpio en tu turno.** Las flechas de la siguiente jugada están apagadas de entrada; se prenden en Ajustes → "Flechas de la siguiente jugada" (solo en Aprender).
- **La ayuda en tres escalones,** solo si la pides. En Aprender: **Pista** (la idea en palabras, `pista`), **Otra pista** (se marca la pieza que se mueve, con su texto) y **Respuesta** (la flecha de la jugada, con su porqué). En Practicar, como dice el punto anterior: la meta, la pieza y solo la flecha. La Respuesta siempre está a la mano: con un error a la vista, Respuesta y Pista lo quitan y ayudan en un solo toque. La Respuesta cuenta como fallo para Refuerza y el Repaso.
- **El error se explica y se queda a la vista,** con la flecha roja de lo que jugaste, hasta **Reintentar**. Por qué no (sin la respuesta): lo que el curso trae para esa jugada (`errores`); si no, si deja una pieza tuya sin defensa; si no, que no logra la meta (solo en Aprender de una variante, que ya dijo la jugada, "Esta lección juega …"; nunca en Practicar ni en un «¿Y si…?»). Si el motor ve que pierde material o te deja peor, lo agrega; en un «¿Y si…?», donde se compara con la jugada que castiga, dice "el motor ve otra jugada que gana material" (la tuya puede no perder nada).
- **La jugada buena de otra línea** (está en la base para esa posición, o en `buenas` de esa jugada, medida con el motor) sale en azul: "Buena jugada, pero esta lección enseña otra línea. Prueba de nuevo." No cuenta como fallo.
- **Dónde vas:** "Variante N de M", "Jugada N de M" y la línea hasta ahora en un renglón, sin lo que sigue. En el celular es un solo renglón que se desliza, con la última jugada a la vista: partido en tres, le quitaba alto a la narración y al tablero (2026-10-29).
- **Los cuatro botones de la fila:** Pista, Respuesta, **Atrás** (regresa una jugada tuya) y **Reiniciar** (reinicia la vuelta y pregunta antes, con la misma ventana "¿Empezar de nuevo?"). Reiniciar lleva su ícono, una flecha en círculo, igual en el celular y en la computadora. Antes era el enlace "Empezar de nuevo" debajo de la fila, y con él la lección no cabía en el iPhone (2026-10-29).
- **El avance se guarda** en el teléfono (`ajedrez.v1.curso:<curso>`): piezas leídas, variantes aprendidas y terminadas, "¿Y si…?" hechos, y dónde me quedé (al volver, retomo ahí). Viaja en el Respaldo.
- **Al terminar Practicar, el resumen:** la línea en un renglón, la idea clave, en qué me equivoqué (fallos, Pista, Respuesta) y tres salidas: siguiente variante, repetir, volver al curso. El botón de la siguiente es de tamaño normal y dice solo **"Siguiente variante"** (el nombre se ve al abrirla; sin siguiente, "Errores y trampas", "Siguiente «¿Y si…?»" o "Volver al curso"). En el celular, el texto del resumen usa el espacio de la narración y se desliza por dentro, y las salidas quedan abajo, a la vista (Nota 1, 2026-10-29).
- **El espacio fijo de los mensajes** junto al tablero narra (la jugada del rival y su porqué, la pregunta, Correcto, el error) y no se quita solo. En el celular toma el alto que sobra de la pantalla (140 o más; si no alcanza, el tablero se achica: `specs/ux.md`, En el iPhone, regla 6) y se desplaza por dentro: Pista, Respuesta, Atrás y Reiniciar nunca salen de la pantalla, y la página no se desliza. Cada momento nuevo se lee desde arriba y la ayuda que pides se lleva a la vista. Su botón (Siguiente, Reintentar, Ahora, Practicar) se queda abajo en una franja del color del panel, a todo lo ancho: el texto pasa por debajo sin asomarse a su lado (C9).
- **El registro:** cada jugada de Practicar se registra como antes (`registrarPasoCurso`) y alimenta Refuerza; al terminar una variante entra al Repaso de hoy (`marcarLeccion`). Las variantes son las lecciones del curso para el Repaso (`leccionesDe`).

## 2.1 "Ver paso a paso" (correcciones, puntos 2 y 3)

Para el principiante que todavía no sigue la notación ni se imagina las jugadas: **las páginas de leer guardan su texto y suman el botón "Ver paso a paso"**. Vale para La idea, cada página de La estructura, el plan (en la lección, junto a "Ahora, Practicar") y cada página del Repaso.

1. **Una ventana, un paso por vista.** Abajo, en las esquinas: **Atrás** a la izquierda (no en el primero) y **Siguiente** a la derecha, que en el último dice **"Salir"**. En medio, "2 de 9". Un toque fuera (o Esc) la cierra. Como la ventana de "Cómo funciona" (`specs/ux.md`).
2. **Cada paso es una frase** (30 palabras o menos, en la notación de las guías), y **el tablero hace o muestra en ese momento lo que dice** ("Blancas abre con 1.e4" y se mueve el peón). El tablero lleva coordenadas.
3. **Cada paso que habla de una jugada trae esa jugada,** con su número, y cada jugada que hace el tablero está escrita en su frase. Un paso puede volver a una posición (`reinicio`: "Si blancas avanza, 3.e5…").
4. **El plan y la estructura son ilustrativos:** se mueven solo piezas de las que habla la frase, aunque el mismo color juegue dos veces seguidas, y la ventana lo dice en una línea ("Es una ilustración: el rival no contesta cada jugada."). Ahí las jugadas de negras van con "..." en los datos (`...Bd6`): sin eso, "Ad6" la jugaba el alfil blanco de f4. No se juegan capturas sin la respuesta del rival ni avances que dejarían una pieza colgada: esas frases no mueven nada y, si acaso, llevan su flecha de plan (§2.2).
5. **Las frases salen del texto de su página o de su plan,** que ya traen su fuente: el paso a paso no agrega ajedrez nuevo.

Datos: `pasoAPaso` en cada página (`PaginaLeer`) y en cada plan (`PlanVariante`), con `pasos: { frase, jugadas?, reinicio?, marcas? }[]`, `fen`, `soloPeones` e `ilustrativo`. Código: `src/curso/pasos.ts` (la posición de cada paso) y `src/componentes/PasoAPaso.tsx`.

## 2.2 Las marcas en el tablero (reglas v1.1, aprobadas por Carlos el 2026-10-29; puntos 6 y 7)

**Para qué:** que cada sesión, en cada curso, ponga las mismas marcas sin depender del gusto. Cada marca sale **de lo que afirma su frase** y se comprueba con un programa. "Es de esas cosas que, si se hace bien, quedaría increíble; pero si no, lo puede arruinar visualmente."

**Las piezas del sistema.** Dos tipos de marca: **flecha** (una pieza y una casilla relacionadas: se mueve, ataca, apoya o quiere ir; la del caballo, en L) y **casilla** (iluminada, cuando lo importante es la casilla misma). Dos colores, siempre con el mismo sentido: **verde, lo tuyo** (tu jugada, lo que tus piezas atacan o apoyan, tu plan) y **rojo, lo del rival contra ti** (lo que controla, amenaza o te quita). El **amarillo** de la última jugada lo pone el sistema y no cuenta como marca. Dos trazos: **sólida, "ahora"**; **punteada, "después"** (un plan, una ruta).

**Qué frase lleva qué marca.** Una marca existe solo si la frase afirma una de estas cosas:

| # | La frase dice… | Ejemplo | Marca |
|---|---|---|---|
| A1 | Tu jugada (en Aprender, y en Practicar solo como Respuesta o después de jugar) | "Te toca: 3...♗f5" | Flecha verde sólida de la jugada |
| A2 | Que tu pieza ataca o apoya una casilla | "atacas e4", "apoyado por c6" | Flecha verde sólida de tu pieza a esa casilla |
| A3 | Tu plan o una ruta futura | "prepara ...c5", "el alfil irá a g6" | Flecha verde punteada |
| A4 | Que una pieza del rival controla, ataca o amenaza algo | "la dama ataca b7" | Flecha roja de su pieza a la casilla |
| A5 | Que el rival te quita una casilla | "3.e5 le quita la casilla f6 a tu caballo" | Casilla roja, más flecha roja de tu pieza a ella |
| A6 | La casilla clave de una idea, sin pieza | "la casilla clave es d4" | Casilla verde (tuya para usar) o roja (fuerte para el rival) |

La jugada del rival no lleva marca extra: ya la enseña el amarillo.

**Las reglas, que se comprueban con un programa** (`tests/unit/correcciones-marcas.test.ts`, una prueba por regla):

| # | Regla |
|---|---|
| R1 | **Cada marca nace de su frase:** toda casilla marcada está escrita en la frase, y toda flecha sale de una pieza que la frase nombra ("tu caballo", "c6", o una jugada suya). El caso d6: la frase de 3.e5 no dice d6, así que d6 no se marca |
| R2 | **Máximo dos marcas nuevas por frase.** Las de una misma jugada se acumulan de frase en frase, hasta cuatro a la vez; el tablero se limpia al pasar a la siguiente jugada. Si hacen falta más de dos nuevas, se parte la frase; si una jugada pide más de cuatro, está explicando de más |
| R3 | **Nunca dos marcas para lo mismo:** la casilla de salida de una flecha no se ilumina además; no se repite una flecha ni se encierra la pieza que la flecha ya señala |
| R4 | **Cada marca dice algo cierto en el tablero** (chess.js, en cada posición): A1 es la jugada real; A2 y A4, que la pieza de verdad ataca o apoya esa casilla; A5, que el rival controla la casilla y tu pieza podría ir ahí; A3, que la pieza puede llegar ahí |
| R5 | **Colores y trazos solo de esta lista:** verde y rojo; sólida y punteada. Cada tipo usa el suyo (A1–A3 verde, A4 y A5 rojo, A6 verde o rojo; punteada solo la A3) |
| R6 | **Las flechas de caballo van en L** (lo hace el código que dibuja): primero el tramo largo, como el dibujo de Carlos, salvo que el otro camino no doble encima de una pieza o pase por menos piezas. La L nunca dobla encima de una pieza (parecería que esa pieza se mueve); si las dos esquinas tienen pieza, la frase no lleva esa flecha |
| R7 | **Cada marca aparece junto con su frase.** En Practicar, nada antes de tu jugada; la segunda Pista ilumina la pieza (la única excepción) y la Respuesta es la flecha A1 |
| R8 | **Solo lo clave:** marcan solo las frases con una afirmación A1–A6; las jugadas posibles que la frase no menciona nunca se marcan. La A1, solo en las jugadas clave (en la Caro-Kann: 1...c6, cada 2...d5, 3...♗f5, ...h5 contra h4, 4...♗f5 y 6...h6 en la Clásica, y ...♗g4 contra el caballo y la dama). La lista de qué jugadas llevan marcas se revisa entera (`iterations/v3/marcas-por-jugada.md`: 38 de 140 en el piloto) |

**Los ejemplos de referencia:**
1. **El dibujo de Carlos** (A5): "Blancas cierra el centro con 3.e5: gana espacio y le quita la casilla f6 a tu caballo." Lleva f6 en rojo y una flecha roja en L de g8 a f6, y nada en d6. Son dos marcas.
2. **"Te toca: 3...♗f5. Sacas tu alfil de casillas blancas fuera de la cadena de peones."** (A1) Una flecha verde sólida de c8 a f5, sin encerrar el alfil.
3. **"Te toca: 2...d5. Atacas el peón de e4. El peón de c6 apoya a tu peón de d5."** La primera frase lleva d7→d5 (A1) y d5→e4 (A2); la segunda suma c6→d5 (A2), y al final se ven las tres. Así se parte una frase que pedía tres marcas nuevas.

**Lo que enseñaron los tres pases visuales** (que las pruebas no ven):
- Una L que dobla encima de una pieza, o que pasa por un peón que también va a esa casilla (c4 o d4 hacia d5; c5 hacia d4), se lee como si esa pieza se moviera: esa marca no va.
- Una marca cuya frase queda debajo del botón en el iPhone se ve sin su frase (R7): en "después de jugar", solo llevan marcas las frases que se leen primero.
- La flecha de plan es de guiones con la punta abierta; con punta hueca de triángulo parecía el puntero del ratón, y de puntos no se veía en una casilla.
- Una marca que se queda de un paso al siguiente no cambia de forma: la ruta de la L depende solo del tablero.
- Si la frase dice dos cosas y solo una se puede marcar limpia, no se marca a medias: o la frase dice solo lo que se marca, o no lleva marca.

**Dónde se ven:**
- **Aprender, en tu turno:** las de la frase del rival y las de "Te toca" (en las jugadas clave, la A1 y lo que dice la frase, medido en la posición después de la jugada). La Pista, nada; la Otra pista ilumina la pieza, salvo que su flecha ya se vea; la Respuesta, la A1.
- **Practicar y los «¿Y si…?», en tu turno:** nada (en un «¿Y si…?», una flecha insinuaba la jugada que castiga). La Otra pista ilumina la pieza; la Respuesta es la A1.
- **Después de tu jugada** (en las dos vueltas): las de su explicación (en Practicar también las de "qué hace", sin la A1: la enseña el amarillo).
- **El plan:** las de "Tu plan" y "El de blancas".
- **El paso a paso:** las de cada frase, que se acumulan hasta que el tablero vuelve a mover. El tablero de la página de leer queda limpio: las marcas van con su frase.
- El error sigue con la flecha roja de lo que jugaste; la buena de otra línea, en verde.

**Cómo se escriben** (pegadas a su frase, nunca sueltas): cada campo trae sus marcas frase por frase, en orden: `rival[k].marcas`, `mias[k].marcasDe.{hace,porque,prepara,cuidado}` (en `hace`, la frase 0 va con "Te toca: <jugada>" y ahí va la A1), `plan.marcasDe.{tuyo,rival}` y `pasoAPaso.pasos[i].marcas`. Una marca: `{ tipo: 'A1'…'A6', de, a }` (flecha) o `{ tipo, en }` (casilla), con `color: 'verde' | 'rojo'` y `punteada: true` solo en la A3. Las marcas de antes (`marcas` sin frase) se quedan para cuando el interruptor está apagado.

**El interruptor interno.** `MARCAS_NUEVAS_DE_ENTRADA` en `src/curso/marcas.ts` (y `chess.interno.marcas` = "1" en el almacenamiento del navegador, para las pruebas): las marcas no se publican sin el "publica" de la torre. El dibujo es propio (`src/componentes/CapaMarcas.tsx`): el de chessground no hace flechas punteadas ni en L. Ahora: sólida con punta llena; plan: guiones con punta abierta; casilla: cuadro con borde. Verde #15781B, rojo #C62828.

**Cómo se revisa:** la prueba de las reglas; la lista de qué jugadas llevan marcas (`node scripts/marcas-por-jugada.ts > iterations/v3/marcas-por-jugada.md`, que la prueba mantiene al día); una captura de cada frase con marcas en los dos perfiles (`npx playwright test --grep @marcas`, en `iterations/v3/capturas/marcas/`, con su `indice.md`); y un pase visual con un subagente nuevo, hasta tres, solo contra estas reglas y el dibujo de Carlos.

## 3. Los textos

- **Los escribimos nosotros,** en español sencillo, con las ideas de fuentes abiertas (Wikibooks y Wikipedia) y serias (solo la idea). Nunca se copian textos con derechos. Una frase traducida de Wikibooks iría con su crédito y su licencia en archivos aparte; el piloto no trae ninguna.
- **Cada jugada mía:** `pregunta` (la meta, sin la jugada ni su casilla de destino), `pista` (la idea en palabras, sin la jugada ni su casilla; **obligatoria**: la de respaldo por tipo de jugada daba ideas falsas, como "un peón prepara tu estructura" para g4 contra el alfil), `buenas` (jugadas buenas en esa posición que no son la de la lección: toda jugada que el motor ve a 0.2 o menos de ella entre sus 5 mejores, salvo las que el curso enseña a no jugar; no salen en rojo), `hace`, `porque`, `prepara` y `cuidado` (opcionales), `errores` (por qué no, para las equivocadas conocidas; sale también en Practicar, así que tampoco dice la jugada ni su casilla), `marcasDe` (las marcas de cada frase, §2.2), `fuente` y `motor`. En Practicar, la `pregunta` es la Pista (§2), y `hace` se lee después de jugar. **Cada jugada del rival:** una frase (`rival`), que tampoco dice mi respuesta.
- **El orden y el largo:** qué hace → por qué ahora → qué prepara → cuidado; de 1 a 3 frases; hasta 40 palabras la explicación entera, salvo las jugadas clave (`clave: true`, hasta 100). Hechos que se cuentan, no adjetivos. **Sin símbolos de evaluación** (ni ?, !, ±, +0.4). Cada término se explica la primera vez y va al glosario.
- **La notación por dentro** es la de las guías (R D T A C, `0-0`); la pantalla la muestra en figuras o en letras (`specs/` y AGENTS.md). Las jugadas de las líneas, en SAN inglés.
- **Nada se inventa:** cada jugada sale de la base (`scripts/base/definiciones/<apertura>.json`): la fila de la lista CC0 de lichess y, si la lección sigue más allá, una `continuacion` con su fuente (Wikibooks, Wikipedia o la mejor jugada del motor), validada como todo con `npm run validar-base` (ninguna jugada mía pierde más de 1 peón). Cada "evita", "pierde" o "es un error" se comprueba con el motor y su comando queda en `iterations/<vuelta>/comprobaciones-del-curso.md`.
- **La fuente de cada idea** se guarda en el contenido (`fuente`, con la lista `fuentes`); en la app no se cita nada.

## 4. Dónde vive

- **El contenido:** `conocimiento/cursos/<apertura>.json` (forma: `src/curso/tipos.ts`), registrado en `CURSOS_NUEVOS` (`src/curso/datos.ts`). Un curso que no está ahí sigue con la lección de antes (`src/pantallas/Leccion.tsx`).
- **Las pantallas:** `src/pantallas/CursoPagina.tsx` (la página del curso, las piezas de leer y Errores y trampas) y `src/pantallas/LeccionCurso.tsx`. Las correcciones: `src/curso/turno.ts` (Practicar), `src/curso/pasos.ts` y `src/componentes/PasoAPaso.tsx` (el paso a paso), `src/curso/marcas.ts` y `src/componentes/CapaMarcas.tsx` (las marcas). Rutas: `#/curso/<curso>`, `#/curso/<curso>/leer/<idea|estructura|repaso>`, `#/curso/<curso>/errores`, `#/curso/<curso>/linea/<v:id|e:id>`; `#/leccion/<curso>/<n>` abre la variante n.
- **Lo guardado de antes:** al abrir la app, lo que llevaba en el Repaso de las lecciones viejas pasa a la lección nueva de la misma respuesta (`migrarAlCursoCaroKann` en `src/aprender/migracion.ts`; para otro curso, su propia tabla).

## 5. Cómo se comprueba

- `node scripts/revisar-curso.ts <curso>` lista de una vez lo que falta o no cumple la forma (largo, pregunta que delata). Solo encuentra la jugada o su casilla escritas: una pregunta o una pista que la *describe* ("el peón puede dar un paso más", "la casilla que te preparaste", "un cambio con jaque" cuando hay uno solo) la delata igual y solo la ve un pase adversarial.
- Vitest: `tests/unit/curso-contenido.test.ts` (piezas, orden, cada jugada legal y en la base, máximo 8 mías, textos y fuentes, cada jugada con su Pista, 40 palabras, sin símbolos, la pregunta no delata) y `tests/unit/curso-ciclo.test.ts` (el ciclo y el registro que alimenta Refuerza y el Repaso).
- Playwright, en los dos perfiles: `tests/e2e/c3-leccion.spec.ts` (cada punto de §2), `tests/e2e/c6-pantallas.spec.ts` (las pantallas y sus capturas), `tests/e2e/leccion-cabe.spec.ts` (la lección cabe en la pantalla del celular, en cinco pantallas), `tests/e2e/saltar-a-practicar.spec.ts` (el interruptor Aprender | Practicar y el avance de Practicar sin Aprender) y `tests/e2e/boton-seguir.spec.ts` (el botón "Seguir" con cada variante en curso, a 360, 375, 402 y 430; abre la página ya en cada ancho, porque al achicar la ventana con la página abierta el tablero tarda un momento en ajustarse). En la página publicada, `tests/publicado/leccion-cabe.spec.ts`.
- Las correcciones: `tests/e2e/correcciones-coordenadas.spec.ts` (§1), `tests/unit/correcciones-practicar.test.ts` y `tests/e2e/correcciones-practicar.spec.ts` (Practicar), `tests/unit/correcciones-paso-a-paso.test.ts` y `tests/e2e/correcciones-paso-a-paso.spec.ts` (§2.1), `tests/unit/correcciones-marcas.test.ts` y `tests/e2e/correcciones-marcas.spec.ts` (§2.2). En la página publicada: `tests/publicado/correcciones-caro-kann.spec.ts`.
- El motor: `iterations/<vuelta>/comprobaciones-del-curso.md`. Y hasta tres pases adversariales antes de publicar, cada uno con un subagente nuevo y solo seis categorías: errores de ajedrez, afirmaciones que el motor no sostiene, textos que delatan la jugada, puntos del diseño §4 que no se cumplen, algo que ya existía y se rompió, y texto copiado. En el piloto, el primero encontró 25 cosas que las pruebas no veían (`iterations/v3/learning.md`).
