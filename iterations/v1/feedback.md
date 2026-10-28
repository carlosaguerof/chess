# Vuelta 1 — feedback de Carlos (2026-10-28)

Lo que Carlos dijo al probar la app del MVP en su iPhone, con sus palabras (del instructivo de la limpieza y de lo que dijo en el chat, resumido en las decisiones 21 a 26 del día). Cada comentario dice si es **regla** (cómo se decide: va a `specs/`), **verdad** (qué es el producto y para quién: va a `context/`) o **dato** (un hecho que se anota o se mide, sin cambiar reglas).

| # | Lo que dijo | Qué es | A dónde va |
|---|---|---|---|
| F1 | "La probé en mi iPhone, y **Jugar y Repertorio se ven sucios** comparados con chess.com. Me gusta chess.com porque todo está ordenado y es muy sencillo." | **Regla** | `specs/ux.md` ("Pantalla limpia") |
| F2 | (Jugar) Quiere escoger rival por su cara y su nivel, como "Play Bots": cuadrícula de retratos por grupo, el escogido en grande con una frase, y abajo Opciones, el color y Jugar. No quiere leer la estrategia escrita de cada bot. | **Regla** | `specs/ux.md` (Jugar) y `specs/personajes.md` |
| F3 | (Los dibujos) Los avatares hechos en código no se ven como los de chess.com: quiere ilustraciones de calidad (retrato de busto, ilustrado, expresivo), de colecciones libres, originales, y escoger entre 3 estilos en Ajustes. Las imágenes con IA de pago, solo como plan B. | **Regla** | `specs/personajes.md` |
| F4 | "Abrí Aprender en el iPhone: sale 'mi repertorio', y **no lo entiendo**. Parece una mezcla entre mi guía y otra cosa, y como apenas estoy aprendiendo **no sé ni qué tocar**. La pantalla 'ver todas las aperturas de la base' se ve más limpia." | **Regla** (y una **verdad**: es principiante, la app no presupone qué sabe) | `specs/aprender.md`; `context/producto.md` |
| F5 | (Las favoritas) Una sola sección "Aperturas y defensas", con "Mis favoritas" y "Todas"; un ♡ en cada tarjeta; **las favoritas empiezan en cero**: mi guía ya no siembra nada. Las favoritas son mi repertorio para todo lo demás. | **Regla** | `specs/aprender.md` |
| F6 | (El perfil) Usar la app sin crear perfil; si crea perfil, que se guarde su avance (subir lo que ya lleva y sincronizar entre aparatos). Falta escoger el servicio. | **Dato** (pendiente de Carlos; no cambia reglas hoy) | `context/despues.md` |
| F7 | Quiere que los cambios queden en una bitácora, como en la LLM wiki, y que lo aprendido quede con su porqué, para que sus próximos productos ya traigan esa lógica. | **Regla** (del repo) | `AGENTS.md`; `log.md` |
| F8 | (Lo que le gustó, que se protege) Lo ordenado y sencillo de chess.com; la pantalla de "ver todas las aperturas", más limpia que la del repertorio; la ventana de tiempo que ya se había copiado. | **Regla** (proteger) | `specs/ux.md` |
