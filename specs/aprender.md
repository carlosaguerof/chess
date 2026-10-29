# Aprender: "Aperturas y defensas" (specs)

> Decidido por Carlos el 2026-10-28 (Limpieza, Nota 1; decisión 24 de `log.md`) y ajustado el mismo día después de usar la app en su iPhone (ajustes de la app: sin favoritas, solo sus cursos, Refuerza de lo fallado y Respaldo en Ajustes). Manda sobre lo que el MVP decía del repertorio (`context/producto.md` §1.3 y §1.6, ya ajustados).

## La regla

1. **Una sola sección,** en la pestaña **Aprender** de la barra de abajo, con el título **"Aperturas y defensas"**. La barra queda en Inicio, Jugar, Aprender y Más. No hay pantalla aparte de Repertorio ni de Aperturas.
2. Arriba, dos pestañas: **"Con blancas"** y **"Con negras"**. Cada una, una tarjeta por apertura mía de ese color: su nombre, un tablero chico con su posición (visto desde mi color) y mi avance ("4 de 9 variantes aprendidas").
3. **Solo mis cursos,** los de mi árbol (`GUIA` en `src/repertorio/modelo.ts`): con blancas, la Italiana, la Alapin, el Avance contra la Caro-Kann y contra la Francesa, la captura contra la Escandinava y "Otras defensas contra 1.e4"; con negras, la Caro-Kann, la Eslava y "Otras aperturas de blancas" (...c6 + ...d5 contra lo demás). Las populares que agregó la base (Londres, Gambito de Dama, Siciliana y Escandinava con negras, Gambito de Dama Declinado) están **apagadas**: no salen ni se abren por su dirección. Siguen en `conocimiento/` y en los libros de los bots que las juegan como su estilo.
4. **Las favoritas y el ♡ están apagados** (para cuando haya varios usuarios). Con el interruptor prendido, las pestañas vuelven a ser "Mis favoritas" (empieza vacía, con un botón a Todas) y "Todas" (agrupadas en "Para jugar con blancas" y "Para jugar con negras"), y cada tarjeta lleva su corazón.
5. **Al tocar una tarjeta:** la página de esa apertura. Arriba el tablero; su nombre y mi avance; un botón **"Empezar a aprender"** ("Seguir aprendiendo" si ya llevo alguna); y sus variantes como **renglones simples** (nombre y "Aprendida" o "Por aprender"), **de la más común a la más rara**. "Volver" regresa a la pestaña de su color.
6. **Al tocar una variante:** su línea en el tablero, con botones para ir al inicio, regresar, avanzar e ir al final; las jugadas **en un renglón** ("1.e4 c6 2.d4 d5 3.e5 Af5"), con la del tablero resaltada; su plan en dos líneas como mucho; y **"Practicar"** (abre la lección).
7. **El inglés, el código ECO y la fuente,** solo en un "Detalles" plegado, en la página de la apertura y en la de la variante.
8. **Mis aperturas son mi repertorio para todo lo demás:**
   - "Que juegue mis líneas" usa las variantes de todas mis aperturas.
   - La guía en partida mide "tu línea" y el desvío contra mis aperturas. Si la partida sale de ellas, nombra la apertura de la base que se jugó (cualquiera, también las apagadas), pero solo sugiere jugadas y ofrece "Practicar esta línea" de mis cursos.
   - **Refuerza muestra solo las jugadas que he fallado** (en cualquiera de mis cursos), de la que más fallo a la que menos; entre iguales, la que fallo más seguido y luego la que llevo más tiempo sin practicar. Sin fallos, dice "Aún no hay jugadas falladas." y la tarjeta del inicio no lleva botón.
   - El Repaso de hoy sigue igual, con las lecciones de mis cursos que terminé.
9. **Fuera de la vista:** agregar líneas jugándolas, importar un PGN y editar el nombre, el plan o la frecuencia de una línea. **Exportar e importar mis datos** viven en **Ajustes → Respaldo** (la pantalla "Tus datos" está apagada): el archivo trae todo (avance, registro, repaso, Mis partidas y ajustes); importar pregunta antes de reemplazar; un respaldo de antes de las favoritas, o sin partidas, también se lee.
10. **Lo guardado pasa al modelo nuevo sin errores,** una sola vez al abrir la app: el avance de las lecciones y su repaso se conservan (los ids viejos de "solo en la base" toman la forma nueva). Las favoritas guardadas no se borran del navegador: con el interruptor apagado no cuentan, y vuelven si se prende. El repertorio viejo tampoco se borra; solo se deja de usar.
11. **Lo que se apaga no se borra.** Se apaga con un interruptor interno, sin pantalla, en `src/aprender/interruptores.ts` (`FAVORITAS_PRENDIDAS`, `POPULARES_PRENDIDAS`, `TUS_DATOS_PRENDIDA`); sus pruebas se saltan con el mismo interruptor y vuelven a correr si se prende. Lo que espera a "cuando haya más usuarios": `context/despues.md`.

## Cómo se comprueba

- Playwright, en los dos perfiles (`tests/e2e/ajustes-app.spec.ts`): "Con blancas" y "Con negras", sin ♡ ni "Mis favoritas", y solo mis aperturas (las populares no se abren ni por su dirección); Refuerza solo con lo fallado, en orden, y su mensaje sin fallos; Respaldo exporta todo e importa con confirmación. En `tests/e2e/l3-aprender.spec.ts`: Con negras → Caro-Kann → Variante del Avance, avanzar y regresar en el tablero, y Practicar abre la lección; una partida con "Que juegue mis líneas" llega a una variante de mis aperturas.
- Vitest: `tests/unit/ajustes-app.test.ts` (solo mis cursos y nada suelto; la guía no sugiere las apagadas; lo guardado de la versión anterior —favoritas, avance, repaso, datos dañados— no rompe nada; el respaldo trae todo y se carga de vuelta) y `tests/unit/aprender.test.ts` (un curso por apertura y color, con los mismos ids de antes; el paso de lo guardado al modelo nuevo).
- **Cada lugar que usa el repertorio se prueba también con él vacío** (la regla de la L5): la guía y el resumen nombran la apertura de la base (`tests/unit/aprender.test.ts`).

## Dónde vive en el código

`src/aprender/interruptores.ts` (los interruptores y `MIS_APERTURAS`), `src/aprender/favoritas.ts` (`misAperturas`, `useMiRepertorio`), `src/aprender/migracion.ts`, `src/cursos/datos.ts` (`cursos()`: solo los activos), `src/cursos/modelo.ts` (`cursosDeLaBase`), `src/pantallas/AperturasYDefensas.tsx`, `src/registro/refuerza.ts`, `src/componentes/SeccionRespaldo.tsx`, `src/estado/respaldo.ts`; `src/pantallas/Respaldo.tsx` ("Tus datos", apagada).
