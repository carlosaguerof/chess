# UX: los flujos como los vivo (specs)

> Base: `/Users/carlosaguerof/01_repos/00_direccion/principios/producto.md` y `context/producto.md` §2. Cada pantalla: una acción principal clara, pocas opciones a la vista, textos cortos; lo secundario en un menú (nota 5). Revisado con la skill `revisar-ux` al cerrar cada tarea con pantallas.

## Jugar contra un bot (T5)

| Paso | Qué veo | Qué pasa al tocar | Elevador (N1) |
|---|---|---|---|
| 1. Inicio | El bot recomendado (700) en grande: avatar, nombre, nivel, su frase, y un botón verde **Jugar**. Debajo, "Escoger otro bot". Si tengo una partida a medias, arriba: "Partida en curso contra X · **Continuar**". | **Jugar** empieza la partida con blancas al instante (si hay una a medias, primero pregunta). | El botón se hunde al tocarlo; la partida aparece de inmediato. |
| 2. Lista de bots | Primero "Tu zona (500–1000)", luego los demás agrupados por nivel. Cada fila: avatar, nombre, nivel y sus aperturas en chico. | Abre al bot en grande. | — |
| 3. El bot en grande | Avatar grande, nombre, nivel, frase, sus aperturas, su temperamento. Escoger color: Blancas · Al azar · Negras. Botón **Jugar**. | Empieza la partida. | — |
| 4. La partida | Arriba el rival (avatar, nombre, nivel); el tablero; abajo yo; la lista de jugadas siempre visible (al lado en la computadora, debajo en el celular); tres botones: Deshacer, Voltear, Rendirse. Arriba a la izquierda, salir al inicio (la partida se guarda). | Toco una pieza: se marca al instante con sus casillas posibles. Juego. | Turno del bot: "<Nombre> está pensando…" con puntos que se mueven, de 0.4 a 1.2 s. Primera vez: "Preparando a <Nombre>…" mientras carga el motor. Si el motor no carga: qué pasó y qué hacer, con **Reintentar** (N9). |
| 5. Deshacer | — | Regresa mi última jugada y la respuesta del bot (dos medias jugadas). | Inmediato. |
| 6. Rendirse | — | Pregunta: "¿Rendirte? La partida termina como derrota." **Rendirme** / Seguir jugando. | — |
| 7. Final | Un aviso: Ganaste / Perdiste / Tablas, y cómo (jaque mate, ahogado…). Dos salidas: **Revancha** (mismo bot, colores cambiados) y **Otro bot**. Se puede cerrar para ver el tablero final. | — | — |
| 8. Recargar o cerrar | — | Al volver, la partida sigue donde iba (C1). Si le tocaba al bot, vuelve a pensar. | — |

Toques del inicio a mi primera jugada (C4): **Jugar** (1), tocar la pieza (2), tocar la casilla (3). Arrastrar cuenta como un solo gesto.
