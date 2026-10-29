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

## Ajustes de la app (2026-10-28 y 29, después de usarla en el iPhone)

5. **Lo que se quita se apaga con un interruptor, y sus pruebas se apagan con el mismo.**
   *Lógica:* Carlos quiere el código de las favoritas, las populares y "Tus datos" para cuando haya varios usuarios. Si las pruebas se borraran o se dejaran fallar, prender el interruptor regresaría código sin probar; con `test.skip(!INTERRUPTOR)` vuelven a correr solas. → `src/aprender/interruptores.ts`; `specs/aprender.md` (regla 11); `context/despues.md`.

6. **"Trae todo" se comprueba en el código, no en la memoria.**
   *Lógica:* el archivo de exportar se describía como "todo", pero no traía Mis partidas ni los ajustes. Ahora los ajustes se toman por clave de lo que la app tenga guardado, así una clave nueva entra sola al respaldo; solo se excluye a mano lo que no debe viajar (la partida a medias). → `src/estado/respaldo.ts`; `tests/unit/ajustes-app.test.ts`.

7. **Instalar cambia dónde viven los datos.**
   *Lógica:* en el iPhone, la pestaña de Safari y la app instalada guardan por separado. Una guía para instalar sin una forma de llevar el avance deja lo aprendido atrás; por eso Importar se quedó (opción A) y la guía lo dice. Al agregar algo que cambia el "dónde", revisar el camino de los datos. → `specs/ux.md` (Instalar en el iPhone, Respaldo).

8. **La ayuda dice lo que hace el código, y una prueba lo cuida.**
   *Lógica:* el "cómo funciona" del repaso nombra sus plazos (1, 3, 7, 14 y 30 días); si alguien cambia `ESCALONES`, la prueba avisa antes de que la ayuda mienta. → `specs/ux.md` ("Cómo funciona"); `tests/unit/ajustes-app.test.ts`.
