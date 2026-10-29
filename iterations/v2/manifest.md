# Iteración v2 — limpieza visual (2026-10-28)

**Qué pedí:** que Jugar y Repertorio se vean ordenados y sencillos, como chess.com, y que el resto de la app se limpie con la misma vara. Lo que hace la app no cambia: solo cómo se ve y cómo se recorre.

1. **Personajes con ilustraciones de calidad** (L1): tres estilos de colecciones libres, generados en el código a partir del personaje (siempre el mismo dibujo, sin internet), los 47 distintos y variados; uno aplicado y los tres a escoger en Más → Ajustes.
2. **Jugar** (L2): el personaje escogido en grande con su frase, la cuadrícula de retratos por grupo (Principiante, Intermedio, Avanzado, Maestro) con mis estrellas, y abajo, fijos, Opciones, el color y un botón verde Jugar. Sin aperturas, códigos ni inglés a la vista.
3. **Repertorio paso a paso** (L3): una tarjeta por apertura (tablero chico, nombre y avance) → sus variantes como renglones → la línea en un tablero que avanza y regresa, su plan corto, Practicar y Quitar. El inglés, el ECO y la fuente, solo en "Detalles".
4. **Limpieza del resto** (L4) con la vara de "pantalla limpia".
5. **Pase visual adversarial** (L5) y **publicar** (L6).

**La vara ("pantalla limpia"):** una pantalla, un propósito y una acción principal; sin párrafos que expliquen la app; sin etiquetas de dónde sale cada cosa en las vistas principales; sin inglés ni ECO salvo en "Detalles" de Aperturas; las jugadas en un renglón ("1.e4 c6 2.d4 d5"), salvo la lista de jugadas de una partida; un solo tipo de letra (Inter); se abre paso a paso; nada de adornos; y cada pantalla se compara contra cómo lo resuelve chess.com.

**La fuente de la tarea:** `/Users/carlosaguerof/01_repos/00_corridas/chess/2026-10-28_INSTRUCTIVO_limpieza-visual.md` (fuera de este repo). Las capturas de referencia de chess.com se quedan allá: **no entran a este repo**, que es público. El estado, lo bloqueado y el reporte viven junto al instructivo.

**Qué es éxito:** todo demostrado con pruebas que corren (`npm test`, `npm run e2e`) y con capturas de antes y después.

**Capturas:** `capturas/antes/` y `capturas/despues/`, cada una con `iphone/` (WebKit 390×844) y `escritorio/` (Chromium 1440×900). Se generan con `tests/e2e/capturas-v2.spec.ts`:

```
CAPTURAS=antes   npx playwright test --grep @capturas
CAPTURAS=despues npx playwright test --grep @capturas
```

Desde la Nota 1, Repertorio y Aperturas son "Aperturas y defensas", así que en `despues/` cambian algunas: 03 = Jugar con otro bot escogido, 07 = Mis favoritas, 08 = la página de una apertura, 12 = Todas, 13 = una variante, 14 = Mis favoritas vacía y 15 = Tus datos (exportar e importar, en Más).

Además: `capturas/l1/` (los 47 personajes en cada estilo y el ajuste del estilo) y `capturas/pruebas/` (las que toma cada prueba de `npm run e2e`; las de la v1 se quedan como estaban en `iterations/v1/capturas/`).

**Ajustes de la app (2026-10-28 y 29):** las capturas de antes y después de Aprender, Refuerza, Ajustes (con Respaldo), el menú Más, la guía "Instalar en el iPhone" y el ⓘ de "cómo funciona" están en `capturas/ajustes/{antes,despues}/{iphone,escritorio}/`. Se generan con `tests/e2e/capturas-ajustes.spec.ts`:

```
CAPTURAS=antes   npx playwright test --grep @ajustes
CAPTURAS=despues npx playwright test --grep @ajustes
```

La fuente: `00_corridas/chess/2026-10-28_PROMPT_ajustes-de-la-app.md` (fuera de este repo); el reporte, junto a él.
