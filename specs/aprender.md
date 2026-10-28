# Aprender: "Aperturas y defensas" (specs)

> Decidido por Carlos el 2026-10-28 (Limpieza, Nota 1; decisión 24 de `log.md`). Manda sobre lo que el MVP decía del repertorio (`context/producto.md` §1.3 y §1.6, ya ajustados).

## La regla

1. **Una sola sección,** en la pestaña **Aprender** de la barra de abajo, con el título **"Aperturas y defensas"**. La barra queda en Inicio, Jugar, Aprender y Más. No hay pantalla aparte de Repertorio ni de Aperturas.
2. Arriba, dos pestañas: **"Mis favoritas"** y **"Todas"**.
3. **"Todas":** cada apertura o defensa de la base, una tarjeta por apertura y color, agrupadas en **"Para jugar con blancas"** y **"Para jugar con negras"**. Cada tarjeta: su nombre, un tablero chico con su posición (visto desde mi color), mi avance ("4 de 9 variantes aprendidas") y un **corazón sin rellenar en la esquina superior derecha**. Tocarlo lo rellena al instante y la apertura pasa a Mis favoritas; tocarlo otra vez la quita. No pide confirmación: no se pierde nada (el avance se queda).
4. **"Mis favoritas" empieza vacía.** Mi guía no siembra nada. Vacía, dice en una línea cómo agregar ("Toca el ♡ en Todas para guardar las que quieres aprender") y trae un botón a Todas.
5. **Al tocar una tarjeta** (en cualquiera de las dos): la página de esa apertura. Arriba el tablero; su nombre, mi avance y el corazón; un botón **"Empezar a aprender"** ("Seguir aprendiendo" si ya llevo alguna); y sus variantes como **renglones simples** (nombre y "Aprendida" o "Por aprender"), **de la más común a la más rara**.
6. **Al tocar una variante:** su línea en el tablero, con botones para ir al inicio, regresar, avanzar e ir al final; las jugadas **en un renglón** ("1.e4 c6 2.d4 d5 3.e5 Af5"), con la del tablero resaltada; su plan en dos líneas como mucho; y **"Practicar"** (abre la lección).
7. **El inglés, el código ECO y la fuente,** solo en un "Detalles" plegado, en la página de la apertura y en la de la variante.
8. **Mis favoritas son mi repertorio para todo lo demás:**
   - "Que juegue mis líneas" usa las variantes de mis favoritas; sin favoritas, el bot juega su libro.
   - La guía en partida reconoce cualquier apertura de la base, igual que antes; "tu línea" y el desvío se miden contra mis favoritas.
   - Refuerza propone lo que ya practiqué (en cualquier apertura) y, de mis favoritas, lo que aún no; el Repaso sigue con las lecciones que terminé.
9. **Fuera de la vista:** agregar líneas jugándolas, importar un PGN y editar el nombre, el plan o la frecuencia de una línea (con favoritas por apertura no hay líneas propias). **Exportar e importar mis datos** (favoritas, avance, registro y repaso) se quedan, en **Más → Tus datos**; un respaldo de antes de las favoritas también se lee.
10. **Lo guardado pasa al modelo nuevo sin errores,** una sola vez al abrir la app: el avance de las lecciones y su repaso se conservan (los ids viejos de "solo en la base" toman la forma nueva) y las favoritas empiezan vacías. El repertorio viejo no se borra del navegador; solo se deja de usar.

## Cómo se comprueba

- Playwright, en los dos perfiles (`tests/e2e/l3-aprender.spec.ts`): Mis favoritas vacía la primera vez; en Todas, el ♡ de la Caro-Kann se rellena y aparece en Mis favoritas; recargar la conserva; tocarlo otra vez la quita. Con negras → Caro-Kann → Variante del Avance: avanzar y regresar en el tablero, y Practicar abre la lección. Una partida con "Que juegue mis líneas" y la Caro-Kann en favoritas llega a una variante de la Caro-Kann. Exportar e importar devuelve las favoritas.
- Vitest (`tests/unit/aprender.test.ts`): un curso por apertura y color, de la más común a la más rara, con los mismos ids de antes; y el paso de lo guardado al modelo nuevo.

## Dónde vive en el código

`src/aprender/favoritas.ts` (favoritas y el repertorio que sale de ellas), `src/aprender/migracion.ts`, `src/cursos/modelo.ts` (`cursosDeLaBase`), `src/pantallas/AperturasYDefensas.tsx`, `src/pantallas/Respaldo.tsx`.
