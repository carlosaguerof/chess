# Vuelta 1 — lo aprendido, con su lógica (2026-10-28)

El principio general detrás de cada cambio. Cada uno ya está en `specs/` (la vuelta se cierra cuando su aprendizaje quedó en las reglas).

1. **Que una pantalla se entienda no basta: también tiene que verse limpia, y eso se mide contra una referencia.**
   *Lógica:* la revisión por principios (Nielsen) del MVP pasó todas las pantallas, y aun así Jugar y Repertorio se veían sucios en el iPhone. Los principios revisan que se entienda y que haya salida; no cuentan cuántas cosas hay a la vista. Una captura de referencia (chess.com) hace visible la diferencia al ponerlas lado a lado. → `specs/ux.md`, "Pantalla limpia".

2. **El dato de dónde sale cada cosa es para el sistema, no para la pantalla.**
   *Lógica:* "de tu guía", "redactado por la IA", el nombre en inglés y el código ECO servían para auditar, pero al usuario le estorban. Se guardan en los datos y, si hacen falta, van en un "Detalles" que no estorbe. → `specs/ux.md` (reglas 3 y 4).

3. **Para un principiante, el producto no presupone qué sabe ni qué quiere: él escoge, y se empieza en cero.**
   *Lógica:* el repertorio sembrado con la guía mezclaba "lo mío" con "la base", y Carlos no sabía qué tocar. Una lista de todo, con un ♡ para guardar, deja la decisión en él y es un solo concepto. → `specs/aprender.md`; `context/producto.md`.

4. **Un concepto, una sección.** Aprender, Repertorio y Aperturas eran tres puertas al mismo contenido.
   *Lógica:* tres pantallas para lo mismo obligan a entender la diferencia antes de usarlas. Una sección con dos pestañas (Mis favoritas / Todas) se entiende al verla. → `specs/aprender.md`.

5. **Se escoge rival por cara y nivel, no leyendo.**
   *Lógica:* la estrategia escrita de cada bot (sus aperturas) era información correcta, pero nadie escoge así; chess.com lo resuelve con retratos y una frase. La personalidad se transmite con el dibujo y la frase. → `specs/personajes.md`; `specs/ux.md` (Jugar).

6. **Las imágenes salen de colecciones libres con licencia confirmada en su fuente; los dibujos hechos a mano en código no alcanzan la calidad.**
   *Lógica:* hay colecciones de ilustración de calidad con licencia que permite una página pública (CC0, CC BY, "libre para uso comercial"). Se confirma la licencia en la fuente antes de usarla, se anota con su enlace y, si pide atribución, se atribuye en la app. Las de pago, solo como plan B. → `specs/personajes.md`.

7. **Si algo es cuestión de gusto, se dejan listas las opciones y cambiar es un toque.**
   *Lógica:* los 3 estilos de retrato están construidos; se aplica el recomendado y Carlos escoge en Ajustes, en su iPhone, sin esperar a otra corrida. → `specs/personajes.md`.

8. **Al reescribir una pantalla, lo que tenía de UX se lista y se conserva o se decide quitar a propósito.**
   *Lógica:* al rehacer Jugar y Aprender se podían perder confirmaciones, avisos o datos (por ejemplo, el aviso de que las ayudas bajan las estrellas). Se revisó lo que tenía cada pantalla vieja y lo que se quitó se anotó como decisión. → `specs/ux.md`.

9. **Cada cambio deja su entrada en la bitácora con su porqué, y cada aprendizaje llega a las reglas.**
   *Lógica:* sin bitácora, la lógica de las decisiones se queda en el chat y el siguiente producto la vuelve a descubrir. → `AGENTS.md`; `log.md`.
