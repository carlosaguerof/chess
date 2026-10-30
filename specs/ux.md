# UX: los flujos como los vivo (specs)

> Base: los principios de producto de la dirección (Nielsen + Maister + lo de Carlos) y `context/producto.md` §2. Cada pantalla: una acción principal clara, pocas opciones a la vista, textos cortos; lo secundario en un menú (MVP, nota 5). Revisado con la skill `revisar-ux` al cerrar cada tarea con pantallas, **con la "Pantalla limpia" como vara**.

## Pantalla limpia (la vara para todas las pantallas)

Decidida por Carlos el 2026-10-28 (Limpieza §3; decisión 21 de `log.md`). Manda sobre lo que el MVP decía del inglés y el ECO.

1. **Una pantalla, un propósito,** con una acción principal clara.
2. **Sin párrafos que expliquen la app.** Como mucho, un subtítulo corto.
3. **Sin etiquetas sobre de dónde sale cada cosa** ("de tu guía", "en tu repertorio", "redactado por la IA", la fuente) en las vistas principales. Si hace falta, van en un "Detalles" que no estorbe.
4. **Sin nombres en inglés ni códigos ECO,** salvo en ese "Detalles" de Aperturas y defensas, y en la guía "Instalar en el iPhone", donde los botones van como los muestra el iPhone de Carlos (en inglés), con su explicación en español.
5. **Las jugadas en un renglón normal** ("1.e4 c6 2.d4 d5 3.e5 ♗f5", en la notación que escogí en Ajustes), no una píldora por media jugada. La excepción es la lista de jugadas de una partida, como en chess.com.
6. **Un solo tipo de letra** en la interfaz (Inter). Nada de letra de código; los relojes usan cifras de ancho fijo de la misma Inter.
7. **Se abre paso a paso:** primero una lista corta; el detalle, al tocar.
8. **Sin puntitos, flechitas ni triangulitos de adorno.** Cada elemento a la vista se tiene que ganar su lugar. (Se quedan los que dicen algo: los puntos que se mueven mientras el bot piensa, que son la señal de N1, y los botones de avanzar y regresar.)
9. **Se compara contra la referencia:** cada pantalla, junto a su captura de chess.com (si hay) o contra cómo resuelve chess.com algo parecido. Si al lado se ve más cargada, no está lista. Las capturas de chess.com **no entran a este repo** (es público): se quedan en el repo privado de la dirección.

**Al reescribir una pantalla:** antes de tirar la vieja, se listan sus arreglos de UX (avisos, confirmaciones, salidas, datos) y se confirma que la nueva los trae, o se anota por qué se quitó.

**Los estilos viven en un solo archivo** (`src/estilos.css`): antes de crear una clase, se busca ahí, porque un nombre repetido pisa al viejo sin que falle ninguna prueba (pasó con `.globo` e `.info`, 2026-10-29). La revisión mira las capturas de después, no solo el verde de las pruebas.

**Un botón con jugadas en su texto lleva el texto en un solo elemento** (`<span>`). `.boton` es `inline-flex`: cada trozo del texto (las letras, la figura ♘ de `<Texto>`, lo demás) sería una columna aparte, separada por el `gap` ("Siguiente variante: Avance: 4." · "♘" · "c3 (Van der Wiel)", Nota 1 del 2026-10-29). Y un botón dice lo justo: el de la siguiente variante, "Siguiente variante"; su nombre se ve al abrirla.

**Lo que a Carlos le gusta y se protege:** lo ordenado y sencillo de chess.com; la ventana de tiempo (tres grupos de tres y "Sin tiempo"); la lista limpia de todas las aperturas.

## En el iPhone: nunca zoom ni la página corrida de lado

Desde el bug del 2026-10-28 (`log.md`): jugando, la lista de jugadas en un renglón ensanchaba la página y Safari se alejaba solo.

1. **Todo cabe en el ancho de la pantalla, siempre.** Lo que crece a lo ancho (la lista de jugadas) se desliza dentro de su propio espacio. Las columnas de las rejillas van con `minmax(0, 1fr)`, no con `1fr`: con `1fr` la columna crece con su contenido más largo y arrastra al tablero y a la página.
2. **El doble toque no hace zoom** (`touch-action: manipulation` en toda la app; el tablero, `none`). El zoom con dos dedos se queda: sirve para ver de cerca.
3. **Los campos de texto, con letra de 16 px o más:** con menos, Safari hace zoom al tocarlos.
4. **La prueba:** `tests/e2e/zoom-iphone.spec.ts`, en el perfil del iPhone: tras cada jugada, el ancho de la página no pasa del de la pantalla y la escala sigue en 1. Una pantalla nueva con tablero entra a esa prueba.
5. **Un botón fijo sobre un texto que se desliza va en una franja a todo lo ancho,** del color del panel. Si solo el botón tapa el texto, el renglón de abajo se asoma cortado a su lado (el plan de la Tal, C9, 2026-10-29). La prueba, en el mismo archivo.
6. **La lección del curso mide lo que se ve de la pantalla, sin el scroll de la página** (2026-10-29; Carlos, en su iPhone 16 Pro: "dos barras de scroll", la de la narración se queda y la de la página sobra). Usa el alto visible de verdad (`100dvh`) menos las barras del sistema (`env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`), igual en la app instalada y en Safari. **La narración toma el alto que sobra,** con un mínimo de 140 (unas tres líneas más su botón), y se desliza por dentro. **Solo si con 140 no cabe, el tablero se achica,** centrado, sin bajar de 280; si ni así cabe (Safari con sus barras en un iPhone SE, el celular de lado), la página se desliza. Lo que crecería a lo alto no le quita espacio: la línea de jugadas va en un renglón que se desliza, con la última jugada a la vista, y el resumen usa el espacio de la narración, con sus salidas abajo. La prueba: `tests/e2e/leccion-cabe.spec.ts`, en cinco pantallas (375×667, 360×740, 390×844, 402×874 y 430×932) y en los momentos más altos de la lección.

## Jugar contra un bot

| Paso | Qué veo | Qué pasa al tocar | Elevador (N1) |
|---|---|---|---|
| 1. Inicio | El último bot con el que jugué (Brisa, 700, la primera vez) con su frase y un botón verde **Jugar**; debajo, "Escoger otro bot o color". Si tengo una partida a medias, arriba: "Partida en curso contra X · **Continuar**". | **Jugar** empieza la partida al instante (si hay una a medias, primero pregunta). | El botón se hunde al tocarlo; la partida aparece de inmediato. |
| 2. Jugar ("Play Bots") | Arriba, el escogido en grande con un globo con su frase, su nombre y su nivel (fijo al bajar). En medio, la cuadrícula de retratos (5 por fila en el celular) en Principiante, Intermedio, Avanzado y Maestro, con mis estrellas bajo cada uno y el escogido con borde verde. Abajo y fijos: **Opciones** (con el tiempo escogido), el color en tres botones (blancas, al azar, negras) y **Jugar**. Sin aperturas, códigos ni inglés. | Un retrato cambia el de arriba. Opciones abre una hoja con el tiempo, la guía, "Que juegue mis líneas" y las ayudas, que se guardan al momento. **Jugar** empieza con ese bot, color y tiempo. | Todo cambia al instante. |
| 3. La partida | Arriba el rival (retrato, nombre, nivel); el tablero; abajo yo; la lista de jugadas siempre visible (al lado en la computadora, debajo en el celular); Deshacer, Voltear, Ayudas y Rendirse. Arriba a la izquierda, salir al inicio (la partida se guarda). | Toco una pieza: se marca al instante con sus casillas posibles. Juego. | Turno del bot: "<Nombre> está pensando" con puntos que se mueven, de 0.4 a 1.2 s. Primera vez: "Preparando a <Nombre>" mientras carga el motor. Si el motor no carga: qué pasó y qué hacer, con **Reintentar** (N9). |
| 4. Deshacer | — | Regresa mi última jugada y la respuesta del bot. | Inmediato. |
| 5. Rendirse | — | Pregunta: "¿Rendirte?". **Rendirme** / Seguir jugando. | — |
| 6. Final | Un aviso: Ganaste / Perdiste / Tablas, y cómo; las estrellas; con la guía, hasta dónde seguí mi línea y "Practicar esta línea". Dos salidas: **Revancha** y **Otro bot**. Se puede cerrar para ver el tablero final. | — | — |
| 7. Recargar o cerrar | — | Al volver, la partida sigue donde iba (C1). | — |

Toques del inicio a mi primera jugada (C4): **Jugar** (1), tocar la pieza (2), tocar la casilla (3).

## Aprender

La sección "Aperturas y defensas": `specs/aprender.md`.

## "Cómo funciona": el ⓘ (ayuda breve, N10)

Decidido por Carlos el 2026-10-29 (Nota 1 de los ajustes de la app). Así se explica una función sin poner párrafos en la pantalla.

1. **Un ⓘ junto al título,** donde aparece la función (en el inicio y en su pantalla). Hoy: Repaso de hoy y Refuerza lo que fallas.
2. **Al tocarlo, un globito chico** junto al ícono, con un solo enlace: "Ver cómo funciona …". Un toque fuera lo cierra. El ⓘ dentro de una tarjeta que se toca no abre la tarjeta.
3. **Al tocar el enlace, una ventana encima** con la explicación **en pasos cortos, uno por vista**, en palabras de usuario. Abajo, en las esquinas: **Atrás** a la izquierda (no en el primer paso) y **Siguiente** a la derecha, que en el último dice **"Salir"** y cierra. En medio, "2 de 5". Un toque fuera (o Esc) la cierra.
4. **Lo que dice sale del código** y una prueba lo compara (los plazos del repaso contra `ESCALONES`). Si la función es opcional, un paso lo dice: "úsalo si te sirve, como gustes".
5. Código: `src/componentes/ComoFunciona.tsx`. Prueba: `tests/e2e/ajustes-app.spec.ts`.

## Instalar en el iPhone

Decidido por Carlos el 2026-10-28 (punto 5 de los ajustes de la app). En Más → "Instalar en el iPhone".

1. **Dice para qué es:** iPhone con Safari; para Android o computadora aún no hay guía.
2. **Los pasos de Safari,** tal como los hizo Carlos: ⋯ junto a la dirección → Share → View More → Add to Home Screen → Open as Web App prendido → Add; el ícono aparece en la pantalla de inicio. Cada paso, con un **dibujo propio, simple, hecho en el código**: nunca capturas de su teléfono (traen sus contactos y el repo es público).
3. **Si ya corre como app** (`display-mode: standalone` o `navigator.standalone`), en lugar de los pasos: "Ya la tienes como app".
4. **Una línea al final:** funciona sin internet después de abrirla una vez; lo que guardas vive en esa app (Safari y la app instalada son copias separadas) y el avance se pasa con Respaldo en Ajustes.
5. Chrome en el iPhone: solo si llegan capturas de Carlos. Código: `src/pantallas/Instalar.tsx`.

## Respaldo (Ajustes)

Decidido por Carlos el 2026-10-29 (opción A del punto 4). Exportar e Importar juntos, en Ajustes → "Respaldo", con tres frases: el avance vive solo en esta app, en este teléfono, sin nube; Exportar guarda todo en un archivo (a iCloud Drive o a Archivos); Importar lo carga de vuelta (después de borrar la app, en un teléfono nuevo o para pasar el avance de Safari a la app instalada). **Importar reemplaza:** antes pregunta y dice qué trae el archivo (N5); un archivo ajeno dice qué pasó, sin preguntar (N9). Abierta como app, Exportar ofrece compartir el archivo si el teléfono puede; si no, lo descarga. Código: `src/componentes/SeccionRespaldo.tsx`, `src/estado/respaldo.ts`.
