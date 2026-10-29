# Lo que no entra en el MVP (queda para después)

Decidido el 2026-10-28. Se anota para no perderlo; nada de esto se construye en la v1.

- Chat de los bots.
- Comentario de cada jugada fuera de la apertura.
- Cuentas de usuario; jugar en línea.
- Compartir el repertorio con otra persona.
- Importar estudios o PGN: se construyó en la v1 (R3) y salió de la vista con la Nota 1 de la limpieza, junto con agregar líneas jugándolas y editarlas (el analizador de PGN sigue en el código y en sus pruebas).
- **Perfil opcional** (decisión 25, pendiente de Carlos): usar la app sin perfil como hoy; con perfil, subir el avance y sincronizarlo entre aparatos. Falta escoger el servicio.
- Análisis de la partida con el motor.
- Táctica (problemas).
- Repetición espaciada con escalones de días (1, 3, 7, 14, 30): la T12 se cambió por "Refuerza lo que fallas" (nota 1). La repetición espaciada vuelve como R7, la última tarea de la cola, con un interruptor para apagarla (nota 4). Si no llega a construirse en esta vuelta, queda aquí.

## Cuando haya más usuarios

Anotado el 2026-10-29 (ajustes de la app; `log.md`). Hoy la app es de un solo usuario, Carlos. Nada de esto se construye ahora: queda aquí, con su porqué, para cuando la use más gente.

**Lo que se apagó en los ajustes de la app.** No se borró: el código, sus datos y sus pruebas siguen en el repo. Se prende en `src/aprender/interruptores.ts`, cambiando el interruptor a `true` y volviendo a construir; sus pruebas, que hoy se saltan, vuelven a correr solas.
- **Las favoritas y el ♡** (`FAVORITAS_PRENDIDAS`): Aprender vuelve a "Mis favoritas / Todas" y las favoritas vuelven a ser el repertorio de la guía y de "Que juegue mis líneas". *Por qué esperan:* sirven cuando cada usuario escoge sus aperturas; con uno solo, la app ya sabe cuáles son.
- **Los cursos populares para principiantes** (`POPULARES_PRENDIDAS`): Sistema Londres, Gambito de Dama, Siciliana con negras, Escandinava con negras y Gambito de Dama Declinado (decisión 9). *Por qué esperan:* para quien aún no tiene su ruta; hoy meten ruido.
- **La pantalla "Tus datos"** (`TUS_DATOS_PRENDIDA`): Exportar e Importar ya viven en Ajustes → Respaldo; la pantalla aparte no hace falta.

**Lo que Carlos dejó para entonces:**
- **El perfil y el inicio de sesión, con guardado en la nube.** La corrida se detuvo el 2026-10-28 (`iterations/v3/manifest.md`). El proyecto `chess` de Supabase sigue ahí, con la tabla `progreso` vacía (comprobado el 2026-10-29: 0 filas). *Por qué espera:* con un solo usuario, Respaldo cubre pasar el avance de un aparato a otro.
- **"Enviar feedback" en Más**, con texto e imágenes o videos. *Por qué espera:* hoy el feedback es Carlos mismo; sirve cuando lo use alguien más.
- **La analítica con PostHog**, siguiendo la receta de la dirección (`00_direccion/recetas/posthog.md`, fuera de este repo). *Por qué espera:* medir el uso tiene sentido con más de un usuario.
- **Un aviso de cookies y privacidad** que separe lo básico (lo que la app necesita para funcionar) de la analítica. *Por qué espera:* va con la analítica; sin ella no hay nada que avisar.
- **"Escoger tu ruta de aperturas":** una parte didáctica que le explique al usuario qué aperturas y defensas puede escoger como principiante, con sus ventajas y desventajas; él escoge su ruta y de ahí le aparecen sus cursos. Es lo que Carlos hizo a mano con sus guías (`input/`). *Por qué espera:* Carlos ya tiene su ruta; es para los que vengan. Se apoyaría en las populares y en `conocimiento/fuentes-aperturas-populares.md`.
