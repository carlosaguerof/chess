# Revisión de UX — ajustes de la app (2026-10-29)

Con la skill `revisar-ux` (Nielsen + lo de Carlos) y la **Pantalla limpia** de `specs/ux.md` como vara. Recorrido en la app corriendo, en los dos perfiles (WebKit 390×844 y Chromium 1440×900). Capturas: `capturas/ajustes/antes/` y `capturas/ajustes/despues/`, cada una con `iphone/` y `escritorio/`.

## Lo que se encontró y se arregló en la revisión

| | Qué | Arreglo | Evidencia |
|---|---|---|---|
| 1 | **El globito del ⓘ pisaba el globo del bot en Jugar.** Las dos clases se llamaban `.globo`: el globito salía con un triángulo blanco que no era suyo y el globo con la frase del bot quedaba flotando. | La del ⓘ pasó a `.globo-info`; una prueba vigila que el globo del bot siga en su lugar. | `despues/iphone/10-como-funciona-globito.png`, `14-jugar-sin-cambios.png`; `tests/e2e/ajustes-app.spec.ts` ("los estilos nuevos no pisan…") |
| 2 | **`.info` ya existía** (el aviso azul de la lección, `aviso-leccion info`): el envoltorio del ⓘ le habría cambiado el acomodo. | Pasó a `.info-como`. | `src/estilos.css` |
| 3 | **"Repasaste 1 jugadas"** al terminar una ronda de Refuerza de una sola jugada (ahora es común: solo salen las falladas). | "1 jugada". | `tests/e2e/t12-refuerza.spec.ts` |
| 4 | En el iPhone, el centro de la tarjeta de Refuerza o del Repaso puede caer en el ⓘ: un toque ahí abre el globito y no la pantalla. | Se deja así: el ⓘ es un blanco aparte y abrir el globito no hace daño (un toque fuera lo cierra). El resto de la tarjeta abre su pantalla. | Lo encontraron r7 y t12; las pruebas tocan el botón de la tarjeta |

## Pantalla por pantalla

**Aprender** (`01-aprender`, `02-aprender-segunda-pestana`). Cumple: una pantalla, un propósito; sin "Mis favoritas" vacía ni corazones (antes: un mensaje que explicaba el ♡ y un botón a Todas, `antes/iphone/01-aprender.png`); solo mis 9 cursos. Las pestañas "Con blancas / Con negras" dicen lo que hay detrás en palabras de Carlos (N2). "Volver" desde una apertura regresa a la pestaña de su color (N6).

**Refuerza** (`03-refuerza`, `04-refuerza-sin-falladas`, `00-inicio-sin-falladas`). Cumple: la lista es solo lo fallado, con su conteo en rojo, y el subtítulo dice cuántas son (N1). Sin fallos, una línea; la tarjeta del inicio lo dice igual que la del Repaso vacía (N4) y no lleva botón a una pantalla vacía (N8). Antes: "0 sin practicar todavía" y renglones "bien 3 de 3" que no eran de "lo que fallas".

**Ajustes → Respaldo** (`05b-ajustes-respaldo`, `13-importar-confirmar`). Cumple con una excepción pedida: son tres frases de explicación, más de lo que deja la regla 2 de la Pantalla limpia ("sin párrafos que expliquen la app"); Carlos las pidió con ese contenido porque sin ellas no se entiende para qué importar. Van en Ajustes, que es secundaria, y debajo de cada botón. Importar pregunta antes de reemplazar y dice qué trae (N5); "Cancelar" no toca nada (N3); un archivo ajeno dice qué pasó, sin códigos (N9); al exportar, "Listo: se descargó el archivo" al instante (N1).

**Instalar en el iPhone** (`08-instalar`, `09-instalar-ya-instalada`). Cumple: dice para quién es en el título y en una línea; siete pasos con su dibujo (N10: pasos concretos); los nombres de los botones en inglés, como los ve Carlos en su iPhone, con la explicación en español: excepción anotada en la regla 4 de la Pantalla limpia. Si ya está instalada, una sola línea en lugar de los pasos (N1). Ninguna captura personal.

**El ⓘ "cómo funciona"** (`10-…`, `11-…`, `12-…`). Cumple: la ayuda no ocupa la pantalla (Pantalla limpia, regla 2) y está a un toque (N10); un paso por vista; Atrás y Siguiente en las esquinas, "Salir" en el último; "2 de 5" dice cuánto falta (N1); un toque fuera o Esc cierra (N3). El último paso dice que es opcional.

**Jugar** (`14-jugar-sin-cambios`): igual que antes (comparada con `capturas/despues/iphone/02-jugar.png` de la limpieza).

## Lo que queda para que Carlos lo valide en su iPhone

- (A) Que el ⓘ sea fácil de tocar sin abrir la tarjeta por error, y al revés.
- (B) Que Exportar, con la app instalada, abra compartir y deje guardar el archivo en Archivos o iCloud Drive; y que Importar lo lea de ahí.
