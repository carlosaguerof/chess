# Las frecuencias de cada curso

Los números con que se decidió qué lección es obligatoria y cuál opcional (`specs/cursos.md` §6, "La regla de obligatorio y opcional"): un archivo chico por curso, con cada lección y cada forma del mapa, por banda, con su `n`. Las pruebas de cada curso leen de aquí; antes los escribían a mano, y una prueba podía pasar con números viejos (cierre de los cursos, 2026-11-25).

**De dónde salen:** partidas Rapid de la base abierta de lichess (CC0, `LICENCIAS.md`), septiembre de 2026, con los dos jugadores en la banda (600–1000 y 1000–1400). El conteo completo (1.4 MB) vive fuera del repo, en `00_corridas/_local/chess/frecuencias-siete/conteo.json`, con su `LEEME.md` (cómo se rehace desde el PGN de lichess). Cada archivo de aquí guarda el `sha256` del conteo del que salió.

**Cómo se rehacen:** `node scripts/frecuencias-cursos.mjs [conteo.json] [curso…]`. Cada curso tiene su script en `scripts/frecuencias/<archivo>.mjs`, con el método de su mapa (`iterations/v4/mapa-*.md`).

**La forma de cada archivo:**

```json
{
  "curso": "italiana:w",
  "fuente": "…", "licencia": "CC0 (base abierta de lichess)", "filtro": "…",
  "conteo": { "sha256": "…", "partidasPorBanda": { "600-1000": 88007, "1000-1400": 268376 }, "minimo": 3 },
  "script": "scripts/frecuencias/italiana.mjs",
  "metodo": "En una o dos frases: qué cuenta como partida del curso y cómo se mide una lección y una forma.",
  "partidas": { "600-1000": 4240, "1000-1400": 20103 },
  "lecciones": { "<id de la variante en el curso>": { "forma": "Centro cerrado", "600-1000": { "pct": 41.6, "n": 1763 }, "1000-1400": { "pct": 36.2, "n": 7258 } } },
  "formas": { "Centro cerrado": { "600-1000": { "pct": 54.7, "n": 2318 }, "1000-1400": { "pct": 42.2, "n": 8484 } } },
  "otras": { "<lo demás que usa la regla del curso, con su nombre>": { "600-1000": { "pct": 0, "n": 0 } } }
}
```

`pct` con un decimal, como en los mapas; `null` cuando no hay datos ("sin datos" no es 0 %: `specs/cursos.md` §6, la Eslava; el conteo solo guarda jugadas con 3 partidas o más). `n`: las partidas reales que llegaron ahí; en una forma, las de las hojas del recorrido que caen en ella (cada `metodo` lo dice). Un curso puede traer más campos que use su prueba: la Alapin, `frecuencia` (1000–1400 con dos decimales, como la guarda su curso).

**Al rehacerlos se encontró** (cierre de los cursos, 2026-11-25): la prueba del Avance contra la Caro-Kann usaba para 3...c5 su medida en la posición y no su parte de tus partidas, que es la de la regla, y para 3...Af5 decía "sin datos" cuando sí hay; un 41.7 % de la Italiana era 41.649 % redondeado dos veces; dos sumas del mapa de la Escandinava eran de filas ya redondeadas; y el Centro libre de Otras aperturas de blancas bajó de 33.8 % a 32.7 % porque la Húngara cambió de jugada después del mapa. Ninguna lección cambió de sección. Ojo con los cortes: con un decimal, 1.99 % se guarda como 2.0 (la Moderna de la Eslava, que sigue opcional porque tiene 8 partidas y una banda con menos de 10 no decide).
