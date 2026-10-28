# Vuelta 2 — lo aprendido en la corrida, con su lógica (2026-10-28)

La vuelta 2 se cierra cuando Carlos la revise (su `feedback.md` llega después). Esto es lo que aprendió la corrida al construirla; cada punto dice dónde quedó.

1. **Cuando un dato pasa a "lo que el usuario escoge", cada lugar que lo usaba necesita su caso vacío.**
   *Lógica:* el repertorio sembrado por la guía se cambió por favoritas que empiezan vacías. La guía, el resumen final y Refuerza siguieron funcionando, pero en silencio: con cero favoritas ya no nombraban la apertura ni ofrecían práctica. Las pruebas no lo vieron porque usaban favoritas sembradas; lo encontraron los pases adversariales 2 y 3. → `specs/aprender.md` (regla 8 y "Cómo se comprueba"); `tests/unit/aprender.test.ts`.

2. **Al limpiar una pantalla, su gemela también.** La hoja de Opciones de Jugar se acortó, pero la de Ayudas dentro de la partida (los mismos interruptores) se quedó como estaba hasta el pase 3.
   *Lógica:* la vara se aplica por concepto, no por archivo: si un control vive en dos lugares, se limpian los dos. → `specs/ux.md` (Pantalla limpia).

3. **La revisión de UX se guarda cuando se hace, no se reconstruye.**
   *Lógica:* el pase 1 no pudo comprobar las revisiones de L1–L4 porque solo estaban resumidas; se reconstruyeron después y así quedó dicho. → `AGENTS.md` (cada cambio deja su entrada en `log.md`, con su evidencia).

4. **En React, un efecto de una línea puede devolver algo que no es limpieza.** `useEffect(() => window.scrollTo(0, 0), …)` tumbó la app en Chromium, donde `scrollTo` ya devuelve una promesa.
   *Lógica:* pasó en la computadora y no en el iPhone; con llaves el efecto no devuelve nada. → `src/App.tsx`; `log.md`.
