# T20 — Revisión de UX, pantalla por pantalla

Fecha: 2026-10-28. Con la lista "Revisión rápida de un flujo" de `00_direccion/principios/producto.md` y la §4.2 del instructivo, sobre la app corriendo en los dos perfiles de Playwright: `iphone` (WebKit, 390×844) y `escritorio` (Chromium, 1440×900). Las capturas están en `iterations/v1/capturas/{iphone,escritorio}/` con el mismo nombre en los dos perfiles.

Claves de la lista: **N1a** se ve el estado al entrar · **N1b** cada clic se nota, sin 2–3 s mudos · **N1c/C1** irse y volver, y resumen al terminar · **N2** palabras del usuario · **N3** salida · **N4** lo mismo se llama igual · **N5** prevenir y confirmar · **N6** a la vista · **N8/C2** nada sobra · **N9** errores claros · **C4** primera vez sin fricción.

✓ = cumple · ✗→✓ = no cumplía y se arregló en la T20 · — = no aplica en esa pantalla.

| Pantalla (captura) | N1a | N1b | N1c/C1 | N2 | N3 | N4 | N5 | N6 | N8/C2 | N9 | C4 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Inicio (`t5-inicio`, `r7-inicio`, `t5-inicio-partida-en-curso`) | ✓ partida en curso y repaso de hoy a la vista | ✓ | ✓ "Partida en curso… Continuar" | ✓ | — | ✓ | ✓ empezar otra pide confirmación | ✓ | ✗→✓ decía "Repaso de hoy: listo" sin nada aprendido | — | ✓ 3 toques a la primera jugada (prueba T5) |
| Menú Más (`t20-menu-mas`) | ✓ | ✓ | — | ✓ | ✗→✓ se quedaba abierto al cambiar de pantalla con "atrás"; ahora se cierra | ✓ | — | ✓ | ✓ 4 entradas | — | ✓ |
| Lista de bots (`t5-lista-bots`, `r4-lista-completa`, `t16-lista-con-estrellas`) | ✓ nivel, estrellas, aperturas | ✓ | — | ✓ español, con inglés y ECO en chico | ✓ menú abajo | ✓ | — | ✓ | ✗→✓ en el iPhone la línea en inglés se salía de la tarjeta (desbordaba a lo ancho) | — | ✓ |
| Bot en grande y Elegir tiempo (`t5-detalle-bot`, `t14-elegir-tiempo`) | ✓ frase, estilo, color, tiempo, guía | ✓ opción con borde verde | ✓ se recuerda lo último | ✓ | ✓ "‹ Bots" | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| Partida (`t5-partida`, `t5-bot-pensando`, `t14-reloj`, `t15-ayudas-prendidas`, `t15-menu-ayudas`) | ✓ "Brisa está pensando" con puntos que se mueven | ✓ casilla marcada en 2.0 ms (iPhone) / 13.6 ms (escritorio), T2 | ✓ recargar deja la partida y el reloj (T5, T14) | ✓ R D T A C | ✓ deshacer; salir sin perder | ✓ | ✓ solo legales; rendirse confirma (`t5-confirmar-rendirse`) | ✓ lista de jugadas siempre | ✓ 3 botones + Ayudas (un solo botón, §4.2 N8) | — | — |
| Partida con guía (`t9-mensaje`, `t9-desvio`, `t9-respuesta`, `t15-barra-negras`) | ✓ mensaje tras mi jugada | ✓ | ✓ resumen al final | ✓ con inglés y ECO en chico (pase 3) | ✓ Deshacer mi jugada / Seguir así | ✓ | ✓ el bot espera si me desvío | ✗→✓ en el iPhone, la barra fija de abajo tapaba Pista y Respuesta; ahora quedan fijas encima (pase 2 de la T22) | ✓ mensaje + Pista + Respuesta | — | — |
| Final de partida (`t5-final`, `t16-estrellas`, `t18-resumen`) | ✓ resultado, motivo, estrellas | ✓ | ✓ resumen de la apertura y "Practicar esta línea" | ✓ | ✓ cerrar (×), Revancha, Otro bot | ✓ | — | ✓ | ✓ | — | — |
| Motor que no carga (`t20-error-motor`) | ✓ | ✓ | — | ✓ sin códigos | ✓ Reintentar | ✓ | — | ✓ | ✓ | ✓ qué pasó y qué hacer | — |
| Aprender (`t20-aprender`, `t8-cursos`) | ✓ lecciones hechas por curso | ✓ | ✓ el avance se guarda | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | ✓ |
| Curso (`t8-curso-caro-kann`) | ✓ número, nombre, frecuencia, hecha | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | ✓ |
| Lección (`t8-ensena`, `t8-incorrecta`, `t8-pista`, `t8-respuesta`, `t8-fin-leccion`) | ✓ "Te la enseño / Ahora tú", paso N de M | ✓ correcta o incorrecta al instante | ✓ fin con nombre y Siguiente | ✗→✓ con negras, el plan que enseñaba empezaba con el de blancas; ahora solo el de mi lado | ✓ | ✓ | ✓ la incorrecta se repite | ✓ nombre de la línea arriba | ✓ | ✓ "Incorrecta: 1...e5 no es la jugada de tu línea. Intenta otra vez." | ✓ |
| Refuerza (`t12-refuerza`, `t12-ronda`) | ✓ cuántas fallé y cuántas sin practicar | ✓ | ✓ | ✓ | ✓ | ✓ mismas Pista y Respuesta | — | ✓ jugadas que llevan a la posición (pase 2) | ✓ | — | ✓ |
| Repaso de hoy (`r7-inicio`, `r7-fin-linea`, `r7-listo`) | ✓ "N líneas, unos M minutos"; "Repaso de hoy · 1 de 2" | ✓ | ✓ "Listo por hoy" y cuántas mañana | ✓ | ✓ salir al inicio | ✓ la misma lección | — | ✓ | ✓ | — | ✓ |
| Repertorio (`t7-repertorio-negras`, `t7-repertorio-blancas`, `t20-repertorio-menu`, `t10-confirmar-borrar`, `t10-base-abierta`, `r3-pgn`, `r3-pgn-error`) | ✓ "en tu repertorio" / "solo en la base" | ✓ | ✓ exportar e importar | ✓ | ✓ deshacer borrado; volver al original | ✓ | ✓ borrar confirma y se deshace; volver al original confirma | ✓ | ✓ acciones en menús ⋯ | ✓ PGN: "Jugada ilegal o que no entiendo: "Re3" después de 1.e4 c6." | ✓ |
| Aperturas, la base (`t19-aperturas`, `t19-caro-kann`) | ✓ variantes, color, "en tu repertorio" | ✓ | — | ✓ | ✓ | ✓ el mismo árbol que el repertorio | — | ✓ | ✓ | — | ✓ |
| Mis partidas (`r2-historial`, `t20-historial-vacio`) | ✓ totales y dónde me salgo más | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | — | ✓ vacío: explica y lleva a jugar |
| Ajustes (`r6-ajustes`) | ✓ | ✓ | ✓ se recuerda | ✓ | ✓ | ✓ el mismo interruptor que en el bot | — | ✓ | ✓ 2 interruptores | — | ✓ |
| Código fuente y licencias (`nota7-licencias`) | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ | ✗→✓ faltaban las tipografías y lo propio (avatares, íconos, sonidos) | — | — |

## La §4.2, punto por punto

| Punto | ¿Cumple? | Evidencia |
|---|---|---|
| N1: casilla marcada en menos de 0.1 s | ✓ | T2: 2.0 ms (iPhone), 13.6 ms (escritorio) |
| N1: "<Nombre> está pensando…" con una señal que se mueve; 0.4–1.2 s; Web Worker | ✓ | `t5-bot-pensando`; `esperaDelBot` en `src/motor/bot.ts`; prueba T5 |
| N1: se ve que el motor está cargando | ✓ | `t20-motor-cargando` ("Preparando a Brisa" con los puntos, con el motor demorado 4 s en la prueba) |
| N2: español, R D T A C, `0-0`, inglés y ECO en chico | ✓ | todas las capturas; pases 1 a 3 |
| N3: deshacer contra el bot; salir sin perder la partida | ✓ | prueba T5; `t5-inicio-partida-en-curso` |
| N5: solo jugadas legales, con casillas marcadas; confirmar rendirse, otra partida y borrar rama; deshacer el borrado | ✓ | `t2-casillas-marcadas`, `t5-confirmar-rendirse`, `t10-confirmar-borrar` |
| N6: lista de jugadas siempre; nombre de la línea al practicar | ✓ | `t5-partida`, `t8-ensena`, `r7-fin-linea` |
| N8: tablero, dos jugadores, lista, 3 botones; con la guía, su mensaje + Pista y Respuesta; reloj junto a su jugador; barra y flechas desde un solo botón | ✓ | `t5-partida`, `t9-mensaje`, `t14-reloj`, `t15-menu-ayudas`, `t15-ayudas-prendidas` |
| N9: si el motor no carga, qué pasó y qué hacer | ✓ | `t20-error-motor` |
| C1: recargar o cerrar no pierde la partida | ✓ | pruebas T5 y T14 (el reloj, con tolerancia de 1.5 s) |
| C2: nada fuera de la §4.1 | ✓ | lo de P1 y la reserva viene de la tabla de tareas y las notas |
| C4: 3 toques a la primera jugada; bot de 700 recomendado | ✓ | prueba T5 (Inicio → Jugar → jugada) |
| Celular primero (390×844) y escritorio (1440×900) | ✓ | todas las capturas, en los dos perfiles |
| Aspecto de chess.com, con lo propio | ✓ | tema oscuro, tablero verde y crema, rival arriba y yo abajo, panel de jugadas al lado (debajo en el celular), aviso final con Revancha / Otro bot; piezas cburnett (CC BY-SA), avatares y sonidos propios |

## Arreglos de la T20 (commit `7ac9101`)

1. El menú "Más" se quedaba abierto al cambiar de pantalla sin tocar una opción → se cierra al cambiar de pantalla (`Marco.tsx`; lo comprueba `tests/e2e/t20-recorrido.spec.ts`).
2. En el iPhone, la lista de bots desbordaba a lo ancho porque la línea en inglés no se cortaba → columnas `minmax(0, 1fr)` y "…" al final (`estilos.css`).
3. "Repaso de hoy: listo" salía antes de aprender ninguna lección → ahora solo "Repaso de hoy", con la explicación (`Inicio.tsx`).
4. Al aprender con negras, el plan que se enseñaba empezaba con lo de blancas → solo el plan de mi lado, como en la guía (`Leccion.tsx`, `planDeMiLado`).
5. "Código fuente y licencias" no decía las tipografías ni lo propio → agregado; `LICENCIAS.md` dice dónde está cada cosa propia.

Nada quedó en "no cumple": la T20 no deja nada para BLOQUEADO.

Después, el pase 2 de la T22 encontró dos cosas más que esta revisión no vio, ya arregladas: en el iPhone la barra fija tapaba Pista y Respuesta (captura `t15-barra-negras`), y con negras la barra de ventaja horizontal se veía al revés.
