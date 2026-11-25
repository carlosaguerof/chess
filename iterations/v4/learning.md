# Lo aprendido en la iteración v4 (2026-11-25)

## Contra la Escandinava (`escandinava:w`)

1. **La pregunta del mapa no tiene que ser de peones.** En la Escandinava, los peones del centro casi no cambian entre líneas; lo que cambia el plan es a dónde se fue la dama cuando la atacaste. La prueba de una pregunta: que cada respuesta diga qué jugar. → `specs/cursos.md` §6.1.
2. **Una entrada del mapa puede no tener lección.** Los jaques (3...De5+ y 3...De6+) son lo más jugado en 600–1000 y la base no trae variante: van en el mapa con su página y su regla. Lo que sale en 5 % o más no se calla. → §6.1; nota 9 del orchestrator.
3. **Una regla falla cuando el rival ya tiene otra jugada natural en el tablero.** "Contra ...Ag4, h3" era la mejor en las cuatro posiciones donde la medí, y perdía d4 con un caballo de negras en c6 (ya había 5 partidas así). Cada regla se mide también con las otras jugadas comunes del rival en otro orden, y una jugada antes del final de cada lección. → §6.1 (nota 11).
4. **Una condición que se da por hecha se escribe.** Cd5 y h3 presuponían el caballo en f3; "d5 contra ...Cc6" del centro grande, el caballo en c3. Sin esa condición, las dos pierden material. → §6.1.
5. **La frecuencia de una lección se mide en la posición que la define en la base,** no en toda su entrada: la Valenciana daba 19.9 % (la entrada) y es 1.8 %. → §6.1.
6. **Los planes de la base que no son lección también se leen:** la guía en partida los muestra. Cinco variantes de antes decían cosas que el curso ya había corregido (por ejemplo, "Ac4 … y c4", que no se puede: el alfil tapa al peón). → §6.1 (nota 12).
7. **"La torre defiende d4" no se cumple si un alfil propio tapa la columna.** Un pase adversarial lo encontró con chess.js; la frase venía de mí, no de la fuente. Las afirmaciones de "qué defiende qué" se comprueban en el tablero, no se deducen. → `specs/cursos.md` §5 (pases), ya lo pide.
8. **Las preguntas que dicen el objetivo de la jugada suelen dejar una sola opción.** "¿Cómo ocupas el centro y le abres paso a tu alfil?" solo admite d4. Mejor una pregunta abierta y una pista que oriente sin cerrar.
9. **Las pruebas de la Caro-Kann asumían que solo ella tenía opcionales.** Al unir el filtro común, tres pruebas pasaron a medir "los cursos sin secciones". Los otros cursos nuevos van a encontrar lo mismo.
