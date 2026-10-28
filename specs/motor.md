# El motor de los bots: opciones, mediciones y decisión (T3)

> 2026-10-28. Lo que se midió dice el comando que lo produjo; lo que no se midió dice de dónde sale. La salida cruda de cada medición está en `iterations/v1/mediciones/`. Los scripts de medición están en `scripts/medicion-motores/` (los de Node) y en `src/pantallas/MedirMotor.tsx` + `tests/e2e/medir-motor.spec.ts` (los del navegador, `npm run medir`).
>
> **Lo que no se mide aquí:** un iPhone de verdad. Lo más cercano es WebKit de Playwright con la pantalla del iPhone (390×844) en la MacBook Air M1; un iPhone real puede ser más lento.

## Decisión

**Stockfish 19 lite de un hilo (npm `stockfish` 19.0.1, GPL-3.0), un solo motor, con debilitamiento propio en todo el rango.** El motor calcula varias jugadas candidatas y el bot escoge a propósito una peor según su nivel: con una "temperatura" (qué tanto se aleja de la mejor) y con errores grandes a propósito, más seguido a menor nivel. El `UCI_Elo` del propio Stockfish queda como un segundo modo en el mismo archivo de niveles (`"modo": "uci"`), por si algún nivel alto no se separa del de abajo; no se usa abajo de 1320 porque no baja de ahí.

Por qué:
1. **Cubre todo el rango, 100–3000,** incluida mi zona (500–1000), que ninguna opción hecha cubre: el `UCI_Elo` de Stockfish no baja de 1320 y Maia no distingue niveles debajo de 1100.
2. **Es ligero y rápido en el iPhone:** 1.85 MB (1.2 MB con gzip, 1.1 MB con brotli), carga en 0.16–0.28 s (tres mediciones, según qué tan ocupada esté la máquina) y elige jugada en milisegundos en tu zona y en 0.6 s en el 3000, en WebKit con pantalla de iPhone (medido; ver la tabla de mediciones). No necesita encabezados especiales del servidor, así que `npm run casa` y cualquier hosting estático sirven.
3. **Sirve para estilos:** las aperturas son el libro de cada personaje (aparte del motor, como hace lichess); el temperamento (T17) se engancha al escoger entre candidatas parecidas. Con `UCI_Elo` no hay dónde engancharlo.
4. **Un solo camino:** la misma función, `elegirJugada` (`src/motor/elegir.ts`), corre en la app (motor en un Web Worker) y en la calibración (motor en Node). Se calibra lo que se juega.
5. **Riesgo bajo:** ya está instalado y probado en los dos perfiles. El riesgo que queda es que los números de ELO son aproximados; lo que se garantiza y se mide es el orden (T4).

## Tabla de comparación

| Criterio | 1. Stockfish lite + debilitamiento propio (**escogida**) | 2. Stockfish con su `UCI_Elo` | 3. Maia en el navegador | 4. Fairy-Stockfish con niveles como los de lichess | 5. Rodent u otro con personalidades | 6. Mezcla (1 abajo + 2 arriba) |
|---|---|---|---|---|---|---|
| **Rango de ELO (de 100 a 3000)** | Todo, por diseño. El orden se mide con partidas entre niveles (T4, T13) | Solo **1320–3190**, escala de motores (CCRL Blitz). Medido: `option name UCI_Elo type spin default 1320 min 1320 max 3190` | Maia-1: 1100–1900. Maia-2: todo lo de menos de 1100 es un solo grupo. Maia-3: dice 600–2600 (sin verificar, sale de un commit) | `UCI_Elo` 500–2850 y Skill −20 a 20 (medido con `uci`) | Rodent IV: no hay versión para navegador | Todo |
| **Qué tan humano juega en 500–1000** | Comete los errores que se le piden: a menor nivel, más jugadas flojas y errores grandes (piezas colgadas). No aprende de partidas humanas. Juicio, no medición | No llega a esa zona. En 1320 pierde 130 centipeones por jugada en promedio (medido, `medir_skill.mjs`) | Lo más humano por diseño (entrenado con partidas de personas), pero no abajo de 1100 | Errores al azar a profundidad 1, no errores humanos (código) | — | Como la 1 abajo |
| **Peso y carga** | 1.85 MB (gzip 1.20 MB). Carga: **158–284 ms en WebKit-iPhone** (tres mediciones), 188 ms en Chromium, 206 ms en Node (medido) | El mismo archivo | Maia-3 ONNX: **45.7 MB** (medido, `Content-Length`), más onnxruntime-web | 1.64 MB (gzip 490 KB); carga 493 ms en Node | — | Como la 1 |
| **Tiempo por jugada (WebKit, pantalla de iPhone)** | **5–11 ms** de promedio de 100 a 1200; 0.1 s en 2600 y 0.57 s en 3000 (medido, `npm run medir`, con los niveles finales de la T13) | El que se le pida: 150 ms con `movetime 150` (medido) | No medido | Nivel 1 de lichess: 5–33 ms en Node (medido) | — | Igual |
| **Licencia** | GPL-3.0 | GPL-3.0 | Maia-1 GPL-3.0, Maia-2 MIT, **Maia-3 AGPL-3.0** | GPL-3.0 | Rodent IV GPL-3.0 | GPL-3.0 |
| **Sirve para estilos (aperturas y temperamento)** | **Sí y sí**: libro propio; el temperamento escoge entre candidatas parecidas | Aperturas sí (libro propio); temperamento no: escoge al azar entre sus 4 mejores (código, `search.cpp`) | Aperturas sí; temperamento no | Como la 2 | Rodent sí tiene personalidades, pero no corre en el navegador | Abajo sí; arriba solo aperturas |
| **Dificultad y riesgo de armarlo** | Media: escribir el selector y calibrar. Ya está armado y probado | Muy baja, pero no cubre la zona que importa | Alta: ONNX en Safari, memoria del iPhone, 46 MB, AGPL | Media: el paquete exige `SharedArrayBuffer` (encabezados COOP/COEP en el servidor) | Muy alta: compilar Rodent a WASM | Media |

## Mediciones

### En el navegador (WebKit con pantalla de iPhone y Chromium de escritorio)

Comando: `npm run medir` (corre `tests/e2e/medir-motor.spec.ts` en los dos perfiles). Mide la carga del motor (crear el Web Worker hasta `uciok`) y el tiempo de `elegirJugada` en 5 posiciones por nivel. Salida: `iterations/v1/mediciones/motor-iphone.json` y `motor-escritorio.json`.

| Nivel | WebKit 390×844: promedio / máximo (ms) | Chromium 1440×900: promedio / máximo (ms) |
|---|---|---|
| carga del motor | 158 | 157 |
| 100 | 11 / 18 | 7 / 12 |
| 200 | 6 / 7 | 5 / 9 |
| 300 | 7 / 9 | 5 / 6 |
| 400 | 6 / 8 | 5 / 6 |
| 500 | 6 / 8 | 5 / 5 |
| 600 | 6 / 8 | 5 / 7 |
| 700 | 5 / 6 | 5 / 6 |
| 800 | 6 / 7 | 6 / 6 |
| 900 | 6 / 7 | 6 / 7 |
| 1000 | 6 / 7 | 6 / 7 |
| 1100 | 9 / 10 | 7 / 8 |
| 1200 | 8 / 10 | 8 / 9 |
| 1300 | 10 / 13 | 10 / 11 |
| 1400 | 11 / 13 | 13 / 15 |
| 1500 | 13 / 17 | 15 / 17 |
| 1600 | 15 / 17 | 17 / 20 |
| 1700 | 18 / 22 | 21 / 26 |
| 1800 | 23 / 27 | 25 / 31 |
| 1900 | 27 / 33 | 31 / 37 |
| 2000 | 32 / 40 | 38 / 47 |
| 2100 | 34 / 41 | 42 / 51 |
| 2200 | 46 / 56 | 57 / 69 |
| 2300 | 56 / 66 | 70 / 85 |
| 2400 | 69 / 82 | 85 / 102 |
| 2500 | 85 / 104 | 104 / 126 |
| 2600 | 106 / 125 | 130 / 156 |
| 2700 | 135 / 166 | 177 / 225 |
| 2800 | 189 / 233 | 250 / 306 |
| 2900 | 295 / 357 | 387 / 476 |
| 3000 | 573 / 676 | 759 / 914 |
| `uci` 1500 (150 ms) | 153 / 154 | 153 / 154 |
| `uci` 3000 (300 ms) | 303 / 304 | 303 / 303 |

Medido el 2026-10-28 a las 13:15 con los 30 niveles finales de la T13 (v3, `src/motor/niveles.json`), con un solo proceso de calibración corriendo a la vez en la Air. Una medición anterior (10:55, con 6 procesos de calibración) daba el doble arriba: la carga de la máquina pesa. La primera medición (T3) se hizo con los niveles de la T3; esta la reemplaza (pase 1 de la T11, hallazgo 9; pase 2, H8).

El bot se toma de todos modos entre 0.4 y 1.2 s por jugada (para que se sienta como una persona). En todos los niveles el motor queda por debajo de eso (el 3000, 0.57 s de promedio y 0.68 s de máximo en WebKit).

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

1. **Libro de aperturas** del personaje (de la base, `conocimiento/`): hasta 8 jugadas suyas, según qué tan largas sean las variantes de su estilo (algunas tienen 1 o 2, como 1.b3 d5 de Olga). Si "Que juegue mis líneas" está prendido, el bot juega dentro de mi árbol, pero escoge primero las jugadas que también están en su libro.
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
- Calibración: `scripts/calibrar.ts:84` → `elegirJugada` (`src/motor/elegir.ts:47`), con el motor de Node (`scripts/motor-node.ts`).
- App: `src/pantallas/Partida.tsx:37` (`usePartidaBot`) → `src/partida/usePartidaBot.ts:152` (`jugadaDelBot`) → `src/motor/bot.ts:43` → `elegirJugada` (`src/motor/elegir.ts:47`), con el motor en un Web Worker (`src/motor/navegador.ts:38`). Lo ejercita `tests/e2e/t5-partida.spec.ts` (el bot contesta; `data-motor` dice `Stockfish 19 Lite WASM`).
- Los parámetros de los dos salen del mismo archivo: `src/motor/niveles.json`.

## Calibración de los niveles 100–3000 (T13)

**Cumple de punta a punta:** de 300 a 3000, cada nivel le saca 60 % o más al de 200 abajo (de 65.6 % a 91.7 %), y el ELO en cadena sube en cada nivel. 48 partidas por par, colores alternados, 24 aperturas de salida (`scripts/aperturas-calibracion.ts`), Stockfish 19 Lite WASM.

Cómo se llegó (tres corridas, todas con `node scripts/calibrar.ts`; los JSON crudos quedan fuera de git, el resumen por partido en `iterations/v1/mediciones/t13-calibracion.json`):
1. **v2** (`todo 100 3000`, 216 min): de 1300 a 3000, nodos ×1.26 por cada 100. Cumplía hasta 2700; 2800, 2900 y 3000 no (58.3, 58.3 y 57.3 %, con 32 a 41 tablas de 48) y la cadena dejaba de subir. Arriba de 2700 los niveles casi no se distinguían.
2. **Destrabe (nota 12):** un subagente ajustó una curva de fuerza con todos los partidos (de 1400 a 3000 había ≈ 1,250 ELO medidos, mal repartidos: mucho entre 1500 y 2500, casi nada arriba) y propuso **re-espaciar** de 1500 a 2900 con parámetros que ya existían: cada nivel toma los de un nivel más bajo de la v2. Ningún bot se volvió más lento (el 2900 bajó de 325k a 224k nodos); de 100 a 1400 y el 3000 quedaron igual. Las aperturas desequilibradas se probaron y no alcanzaban.
3. **v3** (`todo 1300 3000`, con la propuesta) y **v3d** (el 2100 un poco más débil, porque 2200 contra 2100 dio 49 % y la cadena bajaba; se repitieron sus 4 pares).

En la tabla, cada fila usa los partidos de los parámetros que quedaron: de 100 a 1400, los de la v2; de 1500 a 3000, los de la v3; los que tocan al 2100, los de la v3d.

| Nivel | contra 200 abajo (puntos / partidas, %) | +G =T −P | ¿≥ 60 %? | contra 100 abajo (%) | ELO en cadena | partidos de |
|---|---|---|---|---|---|---|
| 100 | — | — | — | — | 100 | — |
| 200 | — | — | — | 69.8 % vs 100 | 245 | t13-v2 |
| 300 | 35 / 48 vs 100 (72.9 %) | +32 =6 −10 | sí | 65.6 % vs 200 | 357 | t13-v2 |
| 400 | 40 / 48 vs 200 (83.3 %) | +38 =4 −6 | sí | 60.4 % vs 300 | 430 | t13-v2 |
| 500 | 39 / 48 vs 300 (81.3 %) | +38 =2 −8 | sí | 59.4 % vs 400 | 496 | t13-v2 |
| 600 | 39.5 / 48 vs 400 (82.3 %) | +38 =3 −7 | sí | 66.7 % vs 500 | 616 | t13-v2 |
| 700 | 44 / 48 vs 500 (91.7 %) | +43 =2 −3 | sí | 60.4 % vs 600 | 689 | t13-v2 |
| 800 | 41.5 / 48 vs 600 (86.5 %) | +40 =3 −5 | sí | 78.1 % vs 700 | 910 | t13-v2 |
| 900 | 38 / 48 vs 700 (79.2 %) | +37 =2 −9 | sí | 61.5 % vs 800 | 991 | t13-v2 |
| 1000 | 35 / 48 vs 800 (72.9 %) | +35 =0 −13 | sí | 67.7 % vs 900 | 1120 | t13-v2 |
| 1100 | 39 / 48 vs 900 (81.3 %) | +39 =0 −9 | sí | 69.8 % vs 1000 | 1265 | t13-v2 |
| 1200 | 38 / 48 vs 1000 (79.2 %) | +37 =2 −9 | sí | 61.5 % vs 1100 | 1346 | t13-v2 |
| 1300 | 32.5 / 48 vs 1100 (67.7 %) | +31 =3 −14 | sí | 77.1 % vs 1200 | 1557 | t13-v2 |
| 1400 | 40.5 / 48 vs 1200 (84.4 %) | +40 =1 −7 | sí | 65.6 % vs 1300 | 1669 | t13-v2 |
| 1500 | 38.5 / 48 vs 1300 (80.2 %) | +36 =5 −7 | sí | 57.3 % vs 1400 | 1720 | t13-v3 |
| 1600 | 36 / 48 vs 1400 (75.0 %) | +34 =4 −10 | sí | 56.3 % vs 1500 | 1764 | t13-v3 |
| 1700 | 34 / 48 vs 1500 (70.8 %) | +31 =6 −11 | sí | 77.1 % vs 1600 | 1975 | t13-v3 |
| 1800 | 41 / 48 vs 1600 (85.4 %) | +40 =2 −6 | sí | 56.3 % vs 1700 | 2019 | t13-v3 |
| 1900 | 35.5 / 48 vs 1700 (74.0 %) | +34 =3 −11 | sí | 66.7 % vs 1800 | 2139 | t13-v3 |
| 2000 | 37 / 48 vs 1800 (77.1 %) | +35 =4 −9 | sí | 54.2 % vs 1900 | 2168 | t13-v3 |
| 2100 | 32 / 48 vs 1900 (66.7 %) | +28 =8 −12 | sí | 59.4 % vs 2000 | 2234 | t13-v3d |
| 2200 | 34.5 / 48 vs 2000 (71.9 %) | +31 =7 −10 | sí | 75.0 % vs 2100 | 2425 | t13-v3, t13-v3d |
| 2300 | 40 / 48 vs 2100 (83.3 %) | +37 =6 −5 | sí | 61.5 % vs 2200 | 2506 | t13-v3, t13-v3d |
| 2400 | 35.5 / 48 vs 2200 (74.0 %) | +29 =13 −6 | sí | 66.7 % vs 2300 | 2626 | t13-v3 |
| 2500 | 31.5 / 48 vs 2300 (65.6 %) | +24 =15 −9 | sí | 58.3 % vs 2400 | 2684 | t13-v3 |
| 2600 | 35 / 48 vs 2400 (72.9 %) | +28 =14 −6 | sí | 55.2 % vs 2500 | 2720 | t13-v3 |
| 2700 | 34 / 48 vs 2500 (70.8 %) | +22 =24 −2 | sí | 77.1 % vs 2600 | 2931 | t13-v3 |
| 2800 | 37.5 / 48 vs 2600 (78.1 %) | +27 =21 −0 | sí | 58.3 % vs 2700 | 2989 | t13-v3 |
| 2900 | 35 / 48 vs 2700 (72.9 %) | +22 =26 −0 | sí | 56.3 % vs 2800 | 3033 | t13-v3 |
| 3000 | 36 / 48 vs 2800 (75.0 %) | +25 =22 −1 | sí | 58.3 % vs 2900 | 3091 | t13-v3 |

De 500 a 3000, todos ≥ 60 % contra el de 200 abajo: sí. El ELO en cadena sube en cada nivel: sí.

## El temperamento (T17)

En `elegirJugada`, entre las candidatas que pierden **50 centipeones o menos** contra la mejor (`MARGEN_CP`), el temperamento les cambia la "pérdida" con un bono **B = máx(40, temperatura del nivel)** (`bonoDelNivel`; en el nivel 700, B = 105), para que pese lo mismo en todos los niveles (`src/motor/temperamento.ts`):
- **Agresivo:** −B por dar jaque, −B por capturar (se suman) y −B/2 por acercarse al rey rival (llegar a dos casillas o menos de él).
- **Defensivo:** −B por una jugada tranquila y segura (sin capturar ni dar jaque, a una casilla que el rival no ataca), −B/2 por un cambio parejo (pieza por pieza del mismo valor) y +B/2 a un jaque (lo evita).
- **Equilibrado:** nada. Es el que se usa en la calibración de los niveles.

Así el temperamento solo decide entre jugadas casi iguales y la fuerza queda dentro del criterio de la T4.

**Medición** (versión 3; nivel 700; 4 partidos de 48 partidas cara a cara, 2 en cada orden de colores, y 2 de fuerza contra el 500). Comando de cada partido: `node scripts/calibrar.ts partido 700 <700|500> 48 <semilla> <salida> --temperamentos <a>,<b>`; resumen con `node scripts/resumir-temperamento.ts <carpeta> iterations/v1/mediciones/t17-temperamento.json` (ahí están las semillas 801–806):

| Partido (semilla) | Jaques + capturas en sus primeras 30 jugadas: agresivo / defensivo |
|---|---|
| agresivo vs defensivo (801) | 330 / 267 |
| agresivo vs defensivo (803) | 339 / 296 |
| defensivo vs agresivo (802) | 342 / 298 |
| defensivo vs agresivo (804) | 366 / 271 |
| **Total, 192 partidas** | **1377 / 1132**: +1.28 por partida (error estándar 0.25; t = 5.0) |

| Fuerza (semilla) | Resultado | ¿≥ 60 % (T4)? |
|---|---|---|
| 700 agresivo vs 500 (805) | 44 / 48 (91.7 %) | sí |
| 700 defensivo vs 500 (806) | 39.5 / 48 (82.3 %) | sí |

Historia: la versión 1 (margen 30, bono fijo de 25; el defensivo también premiaba capturas) dio 359 contra 309 en un solo partido, pero con otras semillas no se repitió (pase 1 de la T22). La versión 2 (bono 0.6 × temperatura) dio +0.25 por partida en 192 partidas (t = 0.95): no alcanzaba. Por eso la 3.
