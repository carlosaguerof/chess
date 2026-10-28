# El motor de los bots: opciones, mediciones y decisión (T3)

> 2026-10-28. Lo que se midió dice el comando que lo produjo; lo que no se midió dice de dónde sale. La salida cruda de cada medición está en `iterations/v1/mediciones/`. Los scripts de medición están en `scripts/medicion-motores/` (los de Node) y en `src/pantallas/MedirMotor.tsx` + `tests/e2e/medir-motor.spec.ts` (los del navegador, `npm run medir`).
>
> **Lo que no se mide aquí:** un iPhone de verdad. Lo más cercano es WebKit de Playwright con la pantalla del iPhone (390×844) en la MacBook Air M1; un iPhone real puede ser más lento.

## Decisión

**Stockfish 19 lite de un hilo (npm `stockfish` 19.0.1, GPL-3.0), un solo motor, con debilitamiento propio en todo el rango.** El motor calcula varias jugadas candidatas y el bot escoge a propósito una peor según su nivel: con una "temperatura" (qué tanto se aleja de la mejor) y con errores grandes a propósito, más seguido a menor nivel. El `UCI_Elo` del propio Stockfish queda como un segundo modo en el mismo archivo de niveles (`"modo": "uci"`), por si algún nivel alto no se separa del de abajo; no se usa abajo de 1320 porque no baja de ahí.

Por qué:
1. **Cubre todo el rango, 100–3000,** incluida mi zona (500–1000), que ninguna opción hecha cubre: el `UCI_Elo` de Stockfish no baja de 1320 y Maia no distingue niveles debajo de 1100.
2. **Es ligero y rápido en el iPhone:** 1.85 MB (1.2 MB con gzip, 1.1 MB con brotli), carga en 0.24 s y elige jugada en milisegundos en WebKit con pantalla de iPhone (medido; ver la tabla de mediciones con los niveles actuales). No necesita encabezados especiales del servidor, así que `npm run casa` y cualquier hosting estático sirven.
3. **Sirve para estilos:** las aperturas son el libro de cada personaje (aparte del motor, como hace lichess); el temperamento (T17) se engancha al escoger entre candidatas parecidas. Con `UCI_Elo` no hay dónde engancharlo.
4. **Un solo camino:** la misma función, `elegirJugada` (`src/motor/elegir.ts`), corre en la app (motor en un Web Worker) y en la calibración (motor en Node). Se calibra lo que se juega.
5. **Riesgo bajo:** ya está instalado y probado en los dos perfiles. El riesgo que queda es que los números de ELO son aproximados; lo que se garantiza y se mide es el orden (T4).

## Tabla de comparación

| Criterio | 1. Stockfish lite + debilitamiento propio (**escogida**) | 2. Stockfish con su `UCI_Elo` | 3. Maia en el navegador | 4. Fairy-Stockfish con niveles como los de lichess | 5. Rodent u otro con personalidades | 6. Mezcla (1 abajo + 2 arriba) |
|---|---|---|---|---|---|---|
| **Rango de ELO (de 100 a 3000)** | Todo, por diseño. El orden se mide con partidas entre niveles (T4, T13) | Solo **1320–3190**, escala de motores (CCRL Blitz). Medido: `option name UCI_Elo type spin default 1320 min 1320 max 3190` | Maia-1: 1100–1900. Maia-2: todo lo de menos de 1100 es un solo grupo. Maia-3: dice 600–2600 (sin verificar, sale de un commit) | `UCI_Elo` 500–2850 y Skill −20 a 20 (medido con `uci`) | Rodent IV: no hay versión para navegador | Todo |
| **Qué tan humano juega en 500–1000** | Comete los errores que se le piden: a menor nivel, más jugadas flojas y errores grandes (piezas colgadas). No aprende de partidas humanas. Juicio, no medición | No llega a esa zona. En 1320 pierde 130 centipeones por jugada en promedio (medido, `medir_skill.mjs`) | Lo más humano por diseño (entrenado con partidas de personas), pero no abajo de 1100 | Errores al azar a profundidad 1, no errores humanos (código) | — | Como la 1 abajo |
| **Peso y carga** | 1.85 MB (gzip 1.20 MB). Carga: **239 ms en WebKit-iPhone**, 188 ms en Chromium, 206 ms en Node (medido) | El mismo archivo | Maia-3 ONNX: **45.7 MB** (medido, `Content-Length`), más onnxruntime-web | 1.64 MB (gzip 490 KB); carga 493 ms en Node | — | Como la 1 |
| **Tiempo por jugada (WebKit, pantalla de iPhone)** | **9–33 ms** de promedio de 100 a 1200, máximo 65 ms (medido, `npm run medir`) | El que se le pida: 150 ms con `movetime 150` (medido) | No medido | Nivel 1 de lichess: 5–33 ms en Node (medido) | — | Igual |
| **Licencia** | GPL-3.0 | GPL-3.0 | Maia-1 GPL-3.0, Maia-2 MIT, **Maia-3 AGPL-3.0** | GPL-3.0 | Rodent IV GPL-3.0 | GPL-3.0 |
| **Sirve para estilos (aperturas y temperamento)** | **Sí y sí**: libro propio; el temperamento escoge entre candidatas parecidas | Aperturas sí (libro propio); temperamento no: escoge al azar entre sus 4 mejores (código, `search.cpp`) | Aperturas sí; temperamento no | Como la 2 | Rodent sí tiene personalidades, pero no corre en el navegador | Abajo sí; arriba solo aperturas |
| **Dificultad y riesgo de armarlo** | Media: escribir el selector y calibrar. Ya está armado y probado | Muy baja, pero no cubre la zona que importa | Alta: ONNX en Safari, memoria del iPhone, 46 MB, AGPL | Media: el paquete exige `SharedArrayBuffer` (encabezados COOP/COEP en el servidor) | Muy alta: compilar Rodent a WASM | Media |

## Mediciones

### En el navegador (WebKit con pantalla de iPhone y Chromium de escritorio)

Comando: `npm run medir` (corre `tests/e2e/medir-motor.spec.ts` en los dos perfiles). Mide la carga del motor (crear el Web Worker hasta `uciok`) y el tiempo de `elegirJugada` en 5 posiciones por nivel. Salida: `iterations/v1/mediciones/motor-iphone.json` y `motor-escritorio.json`.

| Nivel | WebKit 390×844: promedio / máximo (ms) | Chromium 1440×900: promedio / máximo (ms) |
|---|---|---|
| carga del motor | 239 | 188 |
| 100 | 17 / 32 | 8 / 11 |
| 300 | 10 / 12 | 9 / 11 |
| 500 | 9 / 11 | 8 / 11 |
| 700 | 12 / 19 | 9 / 12 |
| 900 | 10 / 14 | 11 / 15 |
| 1000 | 17 / 23 | 18 / 28 |
| 1200 | 33 / 65 | 40 / 71 |
| `uci` 1500 (150 ms) | 153 / 154 | 154 / 155 |
| `uci` 3000 (300 ms) | 305 / 306 | 305 / 306 |

El bot se toma de todos modos entre 0.4 y 1.2 s por jugada (para que se sienta como una persona): el motor queda muy por debajo.

### En Node (MacBook Air M1)

| Qué | Comando | Resultado |
|---|---|---|
| Versión y rangos UCI | `( printf 'uci\nisready\n'; sleep 3; printf 'quit\n' ) \| node node_modules/stockfish/bin/stockfish-19-lite-single.js` | `id name Stockfish 19 Lite WASM`; `UCI_Elo` 1320–3190; `Skill Level` 0–20; `MultiPV` hasta 256; `Threads` solo 1 |
| Carga y tiempo por jugada | `node scripts/medicion-motores/medir_sf.mjs node_modules/stockfish/bin/stockfish-19-lite-single.js` | carga 206 ms; MultiPV 5 a profundidad 8: 29 ms (16–41); profundidad 12: 299 ms |
| Todas las jugadas | `TODAS=1 node scripts/medicion-motores/medir_sf_todas.mjs node_modules/stockfish/bin/stockfish-19-lite-single.js` | MultiPV 256 a profundidad 6: 54 ms; a profundidad 8: 173 ms |
| Qué tan débil es `UCI_Elo` | `node scripts/medicion-motores/medir_skill.mjs node_modules/stockfish/bin/stockfish-19-lite-single.js 10` | pérdida promedio por jugada: 1320 → 130 cp; 1600 → 72; 2000 → 72; 2400 → 43 (6 posiciones: no separa 1600 de 2000) |
| Fairy-Stockfish 1.1.12 | `node scripts/medicion-motores/fairy_uci.cjs <ruta>/package/stockfish.js` | carga 493 ms; `UCI_Elo` 500–2850; Skill −20..20; nivel 1 de lichess 5–33 ms |
| Tamaños | `stat -f%z`, `gzip -9 -c \| wc -c`, `brotli -q 11` | lite wasm 1,845,971 B (gzip 1,201,901); completo 99 MB (descartado para iPhone); Fairy wasm 1,636,293 B (gzip 489,751) |

## Lo que se descartó y por qué

- **El `UCI_Elo` de Stockfish como base:** no baja de 1320 (medido y en el código, `src/search.h` de `sf_19`), y escoge al azar entre sus 4 mejores jugadas, sin dónde enganchar el temperamento. Queda como modo opcional (`"modo": "uci"`) para niveles altos.
- **Maia:** la más humana, pero no distingue niveles debajo de 1100 (Maia-2) o no está verificado que sí (Maia-3), pesa 46 MB, Maia-3 es AGPL e integrar ONNX en Safari es riesgoso. Candidata para un modo "humano" en otra versión.
- **Fairy-Stockfish:** lo que suma (Skill negativo, `UCI_Elo` desde 500) se imita con el debilitamiento propio, y su paquete exige encabezados COOP/COEP en el servidor. Sería un segundo motor sin necesidad.
- **Rodent:** tiene personalidades, pero no hay versión para navegador; compilarla es un proyecto aparte.
- **Stockfish completo (99 MB):** demasiado pesado para el iPhone.

## Cómo juega un bot (lo que está construido)

1. **Libro de aperturas** del personaje (de la base, `conocimiento/`), unas 6 a 8 jugadas.
2. Fuera del libro, **`elegirJugada`** (`src/motor/elegir.ts`), con los parámetros de su nivel (`src/motor/niveles.json`, un solo archivo de datos):
   - `nodos` (cuántas posiciones revisa el motor) y `multipv` (cuántas candidatas pide). La v1 usaba `profundidad`; desde la v2 la fuerza se controla por nodos, que dan pasos más parejos.
   - `errorGrande`: probabilidad de una jugada que pierde al menos 150 centipeones contra la mejor (si no hay una entre las candidatas, una jugada legal que el motor ni consideró).
   - `temperatura`: entre las candidatas, la probabilidad de cada una baja con lo que pierde contra la mejor (exp(−pérdida / temperatura)).
   - Cada jugada se piensa desde cero (se borra la memoria del motor), igual en la app y en la calibración.
3. El bot espera entre 0.4 y 1.2 s antes de mover, aunque el motor conteste antes.

## Fuentes (de la investigación del 2026-10-28)

- Stockfish 19: `src/search.h` L252-273 y `src/search.cpp` L318, L2064-2089 en https://github.com/official-stockfish/Stockfish/tree/sf_19 ("Skill 0 .. 19 now covers CCRL Blitz Elo from 1320 to 3190").
- stockfish.js: https://github.com/nmrugg/stockfish.js (README del paquete: la versión lite de un hilo funciona en cualquier hosting estático).
- Niveles de lichess: https://github.com/lichess-org/fishnet/blob/master/src/api.rs L232-266 (nivel 1: Skill −9, 50 ms, profundidad 5 … nivel 8: Skill 20, 1000 ms, profundidad 22). Libro por nivel: https://github.com/lichess-org/lila/blob/master/modules/fishnet/src/main/FishnetOpeningBook.scala L79-95.
- Fairy-Stockfish: https://github.com/fairy-stockfish/Fairy-Stockfish (`src/ucioption.cpp`, `src/search.cpp`); npm `fairy-stockfish-nnue.wasm`.
- Maia: https://github.com/CSSLab/maia-chess, https://github.com/CSSLab/maia2, https://github.com/CSSLab/maia3, https://github.com/CSSLab/maia-platform-frontend.
- Rodent IV: https://github.com/nescitus/rodent-iv (sin versión WASM encontrada).

## Calibración de los niveles 300–1200 (T4)

Comando: `npm run calibrar` (= `node scripts/calibrar.ts todo 300 1200`), 48 partidas por par, colores alternados (cada apertura se juega una vez con cada color), 24 aperturas de salida distintas (`scripts/aperturas-calibracion.ts`, nombres de lichess). Tablas = medio punto. Partidas de más de 400 medias jugadas = tablas. Motor: `Stockfish 19 Lite WASM`. Resumen: `iterations/v1/mediciones/calibracion-t4-300-1200.json`; las partidas una por una (en UCI) quedan fuera del repo, en `00_corridas/_local/chess/2026-10-28_mvp/calibracion/oficial-t4/`.

"ELO en cadena": 300 vale 300; cada nivel suma la diferencia medida contra el de 100 abajo (−400·log10(1/p − 1)). Son números internos, no de chess.com: lo que se garantiza es el orden.

| Nivel | Contra el de 200 abajo | +G =T −P | ¿≥ 60 %? | Contra el de 100 abajo | ELO en cadena |
|---|---|---|---|---|---|
| 300 | — | — | — | — | 300 |
| 400 | — | — | — | 61.5 % vs 300 | 381 |
| 500 | 38 / 48 vs 300 (79.2 %) | +36 =4 −8 | sí | 59.4 % vs 400 | 447 |
| 600 | 35.5 / 48 vs 400 (74.0 %) | +34 =3 −11 | sí | 72.9 % vs 500 | 619 |
| 700 | 40 / 48 vs 500 (83.3 %) | +38 =4 −6 | sí | 65.6 % vs 600 | 731 |
| 800 | 40.5 / 48 vs 600 (84.4 %) | +40 =1 −7 | sí | 71.9 % vs 700 | 894 |
| 900 | 40 / 48 vs 700 (83.3 %) | +39 =2 −7 | sí | 66.7 % vs 800 | 1015 |
| 1000 | 38.5 / 48 vs 800 (80.2 %) | +38 =1 −9 | sí | 77.1 % vs 900 | 1225 |
| 1100 | 32.5 / 48 vs 900 (67.7 %) | +32 =1 −15 | sí | 70.8 % vs 1000 | 1380 |
| 1200 | 40 / 48 vs 1000 (83.3 %) | +39 =2 −7 | sí | 59.4 % vs 1100 | 1446 |

**Cómo se llegó a estos parámetros.** La v1 (por profundidad: 1 a 8) cumplía el 60 % pero con saltos disparejos (600→700 ganaba 89.6 %, 700→800 solo 59.4 %; cadena de 300 a 2268). La v2 controla la fuerza por **nodos** (de 60 a 7,444, ×1.55 por nivel), con errores y temperatura que bajan parejo: de 300 a 800 la cadena quedó casi igual al número nominal (300, 381, 447, 619, 731, 894), pero de 900 a 1200 volvió a crecer rápido. La v3 suaviza 900–1200 (nodos ×1.3, errores ×0.89, temperatura ×0.9 por nivel). Es la que está en `src/motor/niveles.json`. La corrida oficial desde ese archivo dio exactamente lo mismo que la v3: la calibración es determinista (semillas fijas).

**El mismo camino en la app y en la calibración:**
- Calibración: `scripts/calibrar.ts:71` → `elegirJugada` (`src/motor/elegir.ts:46`), con el motor de Node (`scripts/motor-node.ts`).
- App: `src/pantallas/Partida.tsx:28` (`usePartidaBot`) → `src/partida/usePartidaBot.ts:70` (`jugadaDelBot`) → `src/motor/bot.ts:38` → `elegirJugada` (`src/motor/elegir.ts:46`), con el motor en un Web Worker (`src/motor/navegador.ts:38`). Lo ejercita `tests/e2e/t5-partida.spec.ts` (el bot contesta; `data-motor` dice `Stockfish 19 Lite WASM`).
- Los parámetros de los dos salen del mismo archivo: `src/motor/niveles.json`.
