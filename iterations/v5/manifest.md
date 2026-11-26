# Iteración v5 — "Seguir": lo siguiente que toca, sin decidir (2026-11-26)

**Qué pedí** (conversación de arranque del MVP, en la sesión "Air - chess", 2026-11-25 y 26): un botón **"Seguir"** que me lleve a lo siguiente que toca, como en Duolingo, para no tener que decidir cada vez entre Repaso, Refuerza o seguir un curso, ni cuál curso ni cuál lección. Mis palabras:

> 1. Quitarme fricción. Aunque hoy sean un par de clicks, me genera fricción cognitiva el decidir si hacer el repaso, el refuerzo (que no me quedan claras las diferencias entre uno y otro) o continuar con el curso. Eso me frena, me dispersa, es fricción para iniciar y continuar. 2. Yo, en mi iPhone, en la web app que ya tenemos. No se en que momento del día, no se en que frecuencia, es parte de la intención. Que simplemente en cualquier momento que se me antoje pueda abrir la app y darle a algunas lecciones según mi ánimo. 3. Sí, ya me serviría eso.

Antes, al plantear la idea: mi hipótesis es terminar un curso completo antes de empezar el siguiente; no sé si conviene blancas primero, negras primero o alternarlas; y quiero el Repaso espaciado dentro del camino. La idea estacionada de la que sale: "Seguir la siguiente lección" y "El Progreso más gamificado" (`00_corridas/chess/2026-10-29_PENDIENTES_torre-chess.md`, *Ideas de Carlos, estacionadas*).

## La necesidad, el usuario y los escalones

- **Necesidad:** quitar la fricción de decidir qué sigue (Repaso, Refuerza o curso; cuál curso; cuál lección).
- **Usuario:** yo, en mi iPhone, en la web app que ya existe; sin horario ni frecuencia fija, cuando se me antoje.
- **Escalón 1:** un botón "Seguir" que te lleva a lo siguiente que toca, en un orden fijo de todos los cursos. Solo lo obligatorio, sin el Repaso.
- **Escalón 2:** el Repaso dentro del mismo camino ("Seguir" decide si toca repasar o avanzar).
- **Escalón 3:** el camino visual tipo Duolingo (solo la idea del camino; nada de sus archivos ni su marca).
- **Parking lot:** rachas y puntos, avisos, las lecciones opcionales dentro del camino, unir Repaso y Refuerza, las partidas guiadas.

## Los pasos del escalón 1

1. **El análisis del orden** de cursos y lecciones: `analisis-orden.md` (esta vuelta).
2. **La regla escrita en `specs/`**, con el orden que yo decida.
3. **Construir**, con pruebas, revisión y publicación.
4. **Lo pruebo en el iPhone.**

**Cuándo arranca** (mi respuesta, 2026-11-26): **"1 A."** El análisis ya, en paralelo; se construye cuando yo haya decidido el orden.

**El orden** (mi respuesta, 2026-11-26, en la sesión "Air - chess"): **"Adelante con el orden de la tabla."** Es la opción (A) del análisis: Defensa Caro-Kann, Apertura Italiana, Contra la Caro-Kann, Contra la Francesa, Contra la Siciliana, Contra la Escandinava, Defensa Eslava, Otras aperturas de blancas y Otras defensas contra 1.e4, un curso completo antes del siguiente.

**Dónde va el botón** (sin contestar): el orchestrator ("Air - chess") eligió la recomendada, que se puede cambiar: **un botón grande arriba en Inicio**; Aprender queda igual, y Repaso y Refuerza siguen debajo, como hoy. Si digo otra cosa, se cambia. La regla escrita: `specs/aprender.md`, "Seguir".

## Qué es éxito del escalón 1

Abro la app, toco "Seguir" y caigo en lo siguiente obligatorio del orden que escogí; lo que ya hice no se repite ni se pierde. *(Propuesta del análisis, no dicha por mí: sin pasar por Aprender ni escoger curso.)*

## Archivos de esta vuelta

| Archivo | Qué es |
|---|---|
| `manifest.md` | Esta página. |
| `analisis-orden.md` | La recomendación del orden, la pregunta para mí, el porqué, los datos con sus comandos y las fuentes. |

Al cerrarla: `feedback.md`, `changes.md` y `learning.md`.
