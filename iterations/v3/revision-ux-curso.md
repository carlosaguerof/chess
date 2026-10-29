# Revisión de UX del curso de la Caro-Kann (C6, 2026-10-29)

Con la skill `revisar-ux` (Nielsen + Maister + lo de Carlos, `00_direccion/principios/producto.md`) y la vara de la "Pantalla limpia" (`specs/ux.md`). Se recorrió el flujo de verdad, en el tamaño del iPhone (WebKit 390×844) y en la computadora (Chromium 1440×900), con las capturas de `tests/e2e/c6-pantallas.spec.ts` en `iterations/v3/capturas/{iphone,escritorio}/`.

## El flujo, como lo vive Carlos

1. **Aprender → Con negras:** la tarjeta "Defensa Caro-Kann" con su tablerito y "0 de 16 variantes" (`01-aprender-con-negras`).
2. **La página del curso:** el tablero, el nombre, el avance y un botón grande, **Empezar** (o "Seguir: …"); abajo, las piezas en orden con su estado: La idea, La estructura, las 16 variantes numeradas, Errores y trampas y Repaso; el glosario plegado al final (`02-pagina-del-curso`).
3. **Las piezas de leer:** una página por vista, con su tablero y sus marcas, "1 de 2" y **Siguiente**; al final, **Listo · Sigue: …** lleva a lo que sigue (`03` a `07`).
4. **La lección:** la introducción con **Empezar**; la máquina juega lo del rival; "Te toca: 3...♗f5" con qué hace; Correcto con por qué y **Siguiente**; el error en rojo con su flecha hasta **Reintentar**; la buena de otra línea en azul; Pista, Otra pista y Respuesta; el plan con sus flechas y **Ahora, Practicar**; la pregunta por la meta; el resumen con sus tres salidas (`08` a `17`).
5. **Errores y trampas:** la lista de los tres "¿Y si…?" y uno jugado, castigando tú (`18`, `19`).
6. **Ajustes:** Notación (Figuras o Letras) y "Flechas de la siguiente jugada" (`20-ajustes`).

## Por principio

| | Cumple | Evidencia |
|---|---|---|
| N1 · el estado a la vista | Cumple | "Variante 4 de 16", "Jugada 2 de 6", Aprender/Practicar y la línea en un renglón, siempre arriba del espacio de mensajes. La jugada del rival tarda 0.9 s con "Juega el rival…"; el clic en la pieza se marca al instante (el tablero de siempre). |
| N2 · palabras del usuario | Cumple | "Te toca", "Correcto", "Esa no es", "Buena jugada, pero esta lección enseña otra línea", "Ya terminó la apertura. Tu plan". Sin nombres en inglés ni códigos ECO. |
| N3 · salida | Cumple | Atrás regresa una jugada; Empezar de nuevo pregunta antes; la flecha de arriba vuelve al curso; el resumen trae tres salidas. |
| N4 · consistencia | Cumple | Los mismos botones (Pista, Respuesta) y colores de aviso que la lección de antes y la partida; el verde para lo correcto, el rojo para el error, el azul para la ayuda y la jugada buena de otra línea. |
| N5 · prevenir errores | Cumple | La jugada ilegal no se puede hacer; "Empezar de nuevo" pide confirmación. |
| N6 · a la vista | Cumple | La pregunta se queda mientras piensas; el error se queda hasta Reintentar; el avance se guarda y la página del curso dice "Seguir: …". |
| N8 · solo lo que importa | Cumplía a medias → arreglado | Con la Respuesta a la vista, las dos pistas de antes seguían ahí y en el iPhone empujaban el texto fuera de la pantalla (`14-leccion-respuesta`, antes del arreglo). Ahora la Respuesta reemplaza a las pistas. |
| N9 · errores que se entienden | Cumple | "Esa no es: 2...e5. Deja el peón de e5 sin defensa: el rival lo puede tomar." y "El motor ve que esa jugada te deja peor." (`11-leccion-error-hasta-reintentar`). |
| N10 · ayuda | Cumple | La ayuda llega por escalones, solo si la pides; el glosario, plegado. |
| Pantalla limpia | Cumple | Una acción principal por momento (Empezar, Siguiente, Reintentar, Ahora Practicar, Siguiente variante); sin etiquetas de fuente; el tablero limpio en tu turno. |
| C4 · sin fricción | Cumple | De Aprender a la primera jugada: la tarjeta, Empezar, Listo (La idea), Listo (La estructura), Empezar la variante. |

## Lo que se encontró y se arregló

1. **Las figuras se veían chicas** junto a las letras (♗f5 en Inter sale más bajo que una letra): costaba leerlas en el iPhone. Ahora se pintan un poco más grandes (`src/componentes/Notacion.tsx`, clase `.figura`), en todas las pantallas.
2. **El tablero de "La estructura" del Avance tenía un peón blanco en e4 y no en e5** (un error en la posición escrita a mano). Corregido, y una prueba revisa la cadena d4-e5 contra c5, d5 y e6.
3. **En el plan de la Tal y de la Bronstein, la flecha de ...c5 salía de c7,** pero ese peón está en c6. Corregido, y una prueba revisa que cada flecha salga de una casilla con pieza.
4. **Con la Respuesta a la vista, las pistas sobraban** (N8). Ahora la Respuesta las reemplaza.

5. **(Pase adversarial 1) En el iPhone, los mensajes largos empujaban Pista, Respuesta y Atrás fuera de la pantalla** (diseño §4 "los mensajes, en un espacio fijo" y §7 "abajo, a la mano"). Ahora, en el celular, la narración tiene una altura fija (200 px) y se desplaza por dentro; el botón de la acción (Siguiente, Reintentar) se queda pegado abajo de la narración y cada momento nuevo se lee desde arriba. La prueba nueva de `tests/e2e/zoom-iphone.spec.ts` revisa que, con las dos pistas, la Respuesta o la explicación, la página no se desplace y los tres botones quepan.
6. **(Pase adversarial 1) La Respuesta se apagaba con un error a la vista** ("La Respuesta siempre está a la mano", §4). Ahora Respuesta y Pista quitan el error y ayudan en un solo toque.
7. **(Pase adversarial 1) En un «¿Y si…?» que juegas con blancas, el tablero se veía desde negras.** Ahora se ve desde el lado que mueve.

**Las capturas del iPhone de esta carpeta (13 a 16) son de antes de los arreglos 5 a 7:** a las 01:54 se cayó la sesión gráfica de la Air y WebKit dejó de arrancar. Los arreglos se comprobaron con el perfil iPhone (390×844) emulado en Chromium: las 18 pruebas de la lección, de las pantallas y del zoom pasaron, y sus capturas están fuera del repo (`00_corridas/_local/chess/2026-10-29_caro-kann/c7/capturas-iphone-chromium/`). Se regeneran con WebKit en cuanto vuelva: `npx playwright test tests/e2e/c6-pantallas.spec.ts --project=iphone`.

## Lo que queda anotado (no se arregla ahora)

- En la computadora, el panel de la lección queda chico frente al tablero; se lee bien y es la misma forma que la lección de antes.
- Los textos de la lección son los que Carlos va a calificar en el iPhone (la pregunta de MANANA: bien, largos o cortos).
