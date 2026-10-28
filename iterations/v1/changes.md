# Vuelta 1 — qué se cambió por cada comentario (2026-10-28)

Los cambios se hicieron en la corrida de limpieza visual (la vuelta 2 los construye; esta lista cierra la vuelta 1). El detalle de cada cambio, con su commit, está en `log.md`.

| Comentario | Qué se cambió en el sistema | Qué se cambió en la app | Dónde |
|---|---|---|---|
| F1 Jugar y Repertorio se ven sucios | La vara "Pantalla limpia" (9 reglas) entra a `specs/ux.md`, y cada pantalla se compara contra una referencia | Jugar rehecho; Repertorio fundido en "Aperturas y defensas"; el resto limpiado (sin párrafos, sin etiquetas de origen, sin inglés ni ECO salvo en "Detalles", una sola letra, sin puntitos de frecuencia) | L2, L3, L4 |
| F2 Jugar como "Play Bots" | `specs/ux.md` (Jugar) y `specs/personajes.md` (sin estrategia escrita a la vista) | La pantalla Jugar: el escogido en grande con su frase, la cuadrícula por nivel con las estrellas, y abajo Opciones, el color y Jugar | L2 |
| F3 Los dibujos | `specs/personajes.md`: ilustraciones de colecciones libres con licencia confirmada en su fuente, originales, generadas en el código desde el aspecto de cada personaje | 3 estilos (Ilustrado, Caricatura, Dibujado a mano) a escoger en Más → Ajustes; recomendado: Ilustrado | L1 |
| F4 No entiendo "mi repertorio" | `specs/aprender.md`; `context/producto.md` (soy principiante: nada se presupone) | Una sola sección, "Aperturas y defensas" | Nota 1, L3 |
| F5 Las favoritas | `specs/aprender.md`: las favoritas empiezan vacías y son el repertorio | Mis favoritas / Todas, con ♡; "Que juegue mis líneas" y la guía usan las favoritas; lo guardado se migra sin perder el avance | Nota 1, L3 |
| F6 El perfil | `context/despues.md`: el perfil opcional queda pendiente del servicio | Nada todavía | — |
| F7 La bitácora | `AGENTS.md`: cada cambio deja su entrada en `log.md`; cada aprendizaje va a `learning.md` y a `specs/` | — (es del repo) | Nota 2, L7 |
| F8 Lo que le gustó | `specs/ux.md`: se protege la ventana de tiempo y la pantalla limpia de Todas | Se conservó la ventana de tiempo (con nombres en español) | L2 |
