# Iteración v3 — el curso piloto de la Caro-Kann (2026-10-29)

**Qué pedí:** aprender mis aperturas y defensas **comprendiéndolas, no de memoria**. Esta vuelta hace el escalón 1 con **un solo curso, completo: la Caro-Kann** (mi defensa con negras contra 1.e4). Es un piloto: lo pruebo en el iPhone y, con lo que diga, se ajusta el formato antes de hacer los otros siete cursos en otra corrida.

1. **Corregir la base** (C1): las ~35 correcciones que encontró la investigación del porqué, en toda la base, cada una validada con el motor.
2. **La notación** (C2): figuras de entrada (♘f3) en toda la app; en Ajustes, "Notación": Figuras o Letras (Nf3, en inglés). Nunca las dos juntas. Reemplaza R D T A C.
3. **La lección nueva** (C3): dos vueltas por variante (Aprender y Practicar); el ciclo rápido y la espera de "Siguiente" cuando hay algo que leer; el tablero limpio en mi turno, con las flechas de la siguiente jugada apagadas de entrada (su interruptor en Ajustes); la ayuda en tres escalones; el error que se explica y se queda hasta "Reintentar"; la jugada buena distinta en otro color; "Jugada N de M" y "Variante N de M"; la línea en un renglón; "Atrás" una jugada y "Empezar de nuevo" con confirmación; el avance guardado; el resumen al terminar con sus tres salidas; y un espacio fijo de mensajes que narra. Solo la usa la Caro-Kann; los demás cursos siguen con la lección de hoy.
4. **El contenido del curso** (C4): las seis piezas (la idea, la estructura, las variantes, el plan de cada variante, errores y trampas, y el repaso), una lección por variante de la más común a la más rara, cada jugada con sus campos (la pregunta por la meta, qué hace, por qué ahora, qué prepara, el cuidado, las marcas y la explicación de la jugada del rival) y un glosario.
5. **Comprobar los textos con el motor** (C5), **las pantallas** (C6), **tres pases adversariales** (C7), **bitácora y `specs/cursos.md`** (C8) y **publicar** (C9).

**La fuente de la tarea:** `/Users/carlosaguerof/01_repos/00_corridas/chess/2026-10-29_INSTRUCTIVO_curso-caro-kann.md` (fuera de este repo), con el diseño aprobado (`2026-10-28_DISENO_escalon-1.md`), la investigación del porqué y la exploración de los cursos de lichess. El estado, lo bloqueado y el reporte viven junto al instructivo.

**Qué es éxito:** todo demostrado con pruebas que corren (`npm test`, `npm run e2e`), cada afirmación de los textos comprobada con el motor o con una fuente seria, la página publicada comprobada, y yo recorriendo el curso completo en el iPhone.

**Capturas:** las de las pantallas de esta vuelta, en `iterations/v3/capturas/{iphone,escritorio}/`; las de las pruebas siguen en `iterations/v2/capturas/pruebas/<perfil>/`.

---

## Antes: la corrida del perfil y el guardado en la nube (detenida el 2026-10-28)

Esta carpeta se abrió el 2026-10-28 para el perfil opcional con guardado en la nube (instructivo `2026-10-28_INSTRUCTIVO_perfil-y-guardado.md`). Carlos la detuvo después de la etapa 0 y la pasó al estacionamiento (`context/despues.md`, "Cuando haya más usuarios"). Su manifiesto completo sigue en la historia de git (`git show dd43c9f:iterations/v3/manifest.md`). El proyecto `chess` de Supabase y su tabla `progreso` vacía siguen ahí.
