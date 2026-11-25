# Comprobaciones con el motor del curso de la captura contra la Escandinava (2026-11-25)

Cada afirmación del curso que el motor puede medir ("es la mejor", "ataca", "pierde", "gana", "es un error"), con su comando y lo que contestó. El motor: Stockfish 19 lite (el de la app, el paquete `stockfish` de npm), un hilo, profundidad 18; las amenazas ("si fuera tu turno otra vez", con jugada nula), profundidad 16. `motor.mjs` es una envoltura de ese motor con chess.js, igual a la de las comprobaciones de la Caro-Kann (`iterations/v3/comprobaciones-del-curso.md`): `mejores` da las N mejores con su línea, `jugada` cuánto pierde una jugada contra la mejor, `amenaza` qué haría el lado que acaba de mover si jugara otra vez. Las evaluaciones van desde blancas: + es mejor para blancas. Diferencias de menos de 0.2 no distinguen jugadas.

Cada id aparece en el campo `motor` del texto que lo afirma, en `conocimiento/cursos/escandinava.json`. Las líneas del curso (las continuaciones de la base) y su comprobación: `scripts/base/definiciones/escandinava.json` (variantes `curso-*`); `npm run validar-base` (ninguna jugada mía pierde más de 100 cp) y `node scripts/validar-libros.ts` (ninguna jugada de libro pierde más de 200).

**Lo que el motor corrigió:**
- **El plan de la Lasker:** decía "Ac4 y 0-0-0". Contra 8...Db6 (la segunda del motor), 9.Ac4 pierde 74 (9...Dxd4). Ahora dice primero 0-0-0 (la torre defiende d4) y después el alfil (P-lasker-b).
- **El plan de la Schiller-Pytel:** "g3, Ag2 y 0-0" no se puede contra 7...De6+ (hay que tapar el jaque). Lleva su condición (P-sp-b).
- **La Grünfeld y la Transposición Panov** dejaron de ser lecciones (una sola jugada tuya por posición, nota 2 del orchestrator); 6.Ce5 (a 0.11 de 6.Ac4, la mejor del motor) y 3.c4 siguen como buenas jugadas.

| Id | Afirmación del curso | Comando | Resultado del motor | Veredicto |
|---|---|---|---|---|
| M-1e4 | 1.e4 es de las mejores; las buenas a 0.2: d4, Cf3, e3, c4 | `node motor.mjs mejores "" --prof 18 --n 5` | +0.32 e4 · +0.23 d4 · +0.22 Nf3 · +0.13 e3 · +0.12 c4 | Se sostiene |
| M-2exd5 | 2.exd5 es la mejor; 2.e5 deja escapar la ventaja | `node motor.mjs mejores "e4 d5" --n 5` · `node motor.mjs jugada "e4 d5" "e5"` | +0.72 exd5 · −0.04 e5 · −0.19 d3 · e5 pierde 65 | Se sostiene |
| M-3cc3 | 3.Cc3 es la mejor | `node motor.mjs mejores "e4 d5 exd5 Qxd5" --n 5` | +0.65 Nc3 · +0.27 Nf3 · +0.21 d4 | Se sostiene |
| M-3cc3-b | 3.Cc3 ataca a la dama: si no se mueve, Cxd5 | `node motor.mjs amenaza "e4 d5 exd5 Qxd5 Nc3" --prof 16` | Si blancas jugara otra vez: Nxd5 (+9.60) | Se sostiene |
| M-4d4-a5 | 4.d4 (con la dama en a5) es de las mejores; buenas: Cf3, a3, Ac4 | `node motor.mjs mejores "e4 d5 exd5 Qxd5 Nc3 Qa5" --n 5` | +0.60 d4 · +0.60 Nf3 · +0.54 a3 · +0.49 Bc4 · +0.40 h3 | Se sostiene |
| M-clavada | Con la dama en a5 y d4 jugado, tu caballo de c3 está clavado: si se moviera, la dama daría jaque | chess.js: en `e4 d5 exd5 Qxd5 Nc3 Qa5 d4` (con el turno de blancas), ninguna jugada legal del caballo de c3 | 0 jugadas legales del caballo | Se sostiene |
| M-5cf3-a5 | 5.Cf3 (dama en a5) la mejor; buenas: Ad2, a3 | `node motor.mjs mejores "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6" --n 5` | +0.69 Nf3 · +0.55 Bd2 · +0.53 a3 · +0.40 Bc4 | Se sostiene |
| M-6ac4 | 6.Ac4 a 0.1 de la mejor; buenas: Ad2, h3, Cd2 (y 6.Ce5, de la base) | `node motor.mjs mejores "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bf5" --n 5` · `jugada … "Bc4"` | +0.62 Ne5 · +0.51 Bd2 · +0.51 Bc4 · +0.39 h3 · +0.35 Nd2 · Bc4 pierde 10 | Se sostiene |
| M-7ad2 | 7.Ad2 la mejor; buenas: 0-0, a3, Ch4, De2 | `node motor.mjs mejores "… Bf5 Bc4 e6" --n 5` | +0.36 Bd2 · +0.35 O-O · +0.31 a3 · +0.27 Nh4 · +0.17 Qe2 | Se sostiene |
| M-7ad2-amenaza | Con 7.Ad2, si el caballo salta (Cd5), tu alfil ataca a la dama: si fuera tu turno otra vez, Cd5 gana | `node motor.mjs amenaza "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bf5 Bc4 e6 Bd2" --prof 16` | Si blancas jugara otra vez: Nd5 Qxd5 Bxd5 (+5.06) | Se sostiene |
| M-8cd5 | 8.Cd5 la mejor; buena: Ce4 (también destapa al alfil) | `node motor.mjs mejores "… Bc4 e6 Bd2 c6" --n 5` | +0.69 Nd5 · +0.57 Ne4 · +0.46 Nh4 | Se sostiene |
| M-8cd5-cxd5 | Si negras toma el caballo con el peón, 9.Axa5 se come la dama | `node motor.mjs jugada "… Bd2 c6 Nd5" "cxd5"` · `mejores "… Nd5 cxd5" --n 3` | cxd5 pierde 460 (+5.05) · +4.37 Bxa5 | Se sostiene |
| M-8cd5-dxd5 | Si la dama toma el caballo, 9.Axd5 se come la dama | `node motor.mjs mejores "… Bd2 c6 Nd5" --n 4` | +0.71 Qd8 · +4.53 Qxd2+ · +4.67 Qxd5 Bxd5 · +4.95 cxd5 | Se sostiene |
| M-6h3-a5 | Contra ...Ag4 (dama en a5), 6.h3 la mejor por mucho | `node motor.mjs mejores "… Qa5 d4 Nf6 Nf3 Bg4" --n 5` | +0.97 h3 · +0.50 Bd2 · +0.41 Be2 | Se sostiene |
| M-6h3-a5-b | Tras 6.h3, negras cambia en f3 (la mejor) | `node motor.mjs mejores "… Bg4 h3" --n 5` | +0.97 Bxf3 · +1.16 Bh5 · +1.20 Bf5 | Se sostiene |
| M-7dxf3-a5 | Retomas con la dama, no con el peón | `node motor.mjs mejores "… Bg4 h3 Bxf3" --n 4` | +0.96 Qxf3 · −0.73 gxf3 | Se sostiene |
| M-7dxf3-a5-b | Tu dama ataca el peón de b7, que nadie defiende | `node motor.mjs amenaza "… Bg4 h3 Bxf3 Qxf3" --prof 16` | Si blancas jugara otra vez: Qxb7 (+6.23) | Se sostiene |
| M-8ad2-lasker | 8.Ad2 la mejor; buena: Ac4 | `node motor.mjs mejores "… Bxf3 Qxf3 c6" --n 4` | +1.01 Bd2 · +0.93 Bc4 · +0.75 a3 | Se sostiene |
| M-4d4-d6 | 4.d4 (dama en d6) de las mejores; buena: Cf3 | `node motor.mjs mejores "e4 d5 exd5 Qxd5 Nc3 Qd6" --n 5` | +0.59 d4 · +0.59 Nf3 · +0.34 Be2 | Se sostiene |
| M-5cf3-d6 | 5.Cf3 la mejor; buenas: h3, Ag5, Ae3, Ac4 | `node motor.mjs mejores "… Qd6 d4 Nf6" --n 5` | +0.62 Nf3 · +0.60 h3 · +0.53 Bg5 · +0.48 Be3 · +0.48 Bc4 | Se sostiene |
| M-6g3 | 6.g3 la mejor (contra ...a6) | `node motor.mjs mejores "… Qd6 d4 Nf6 Nf3 a6" --n 5` | +1.03 g3 · +0.58 Bg5 · +0.56 a3 | Se sostiene |
| M-7af4 | 7.Af4 la mejor | `node motor.mjs mejores "… a6 g3 Nc6" --n 4` | +1.14 Bf4 · +0.86 Bg2 | Se sostiene |
| M-7af4-amenaza | Af4 ataca a la dama de d6 | `node motor.mjs amenaza "… a6 g3 Nc6 Bf4" --prof 16` | Si blancas jugara otra vez: Bxd6 (+7.54) | Se sostiene |
| M-8ag2 | 8.Ag2 la mejor | `node motor.mjs mejores "… Bf4 Qd8" --n 4` | +1.15 Bg2 · +0.73 Qd2 | Se sostiene |
| M-5cf3-sp | 5.Cf3 (tras 4...c6) a 0.12 de la mejor; buenas: Ae3, g3, Ae2, h3 | `node motor.mjs mejores "… Qd6 d4 c6" --n 5` | +0.75 Be3 · +0.65 g3 · +0.63 Nf3 · +0.59 Be2 · +0.58 h3 | Se sostiene |
| M-6ce5-sp | 6.Ce5 a 0.03 de la mejor; buenas: h3, Ae2, Ad3 | `node motor.mjs mejores "… c6 Nf3 Nf6" --n 4` | +0.65 h3 · +0.63 Be2 · +0.62 Bd3 · +0.62 Ne5 | Se sostiene |
| M-7cc4 | 7.Cc4 la mejor; buenas: f4, Af4 | `node motor.mjs mejores "… Ne5 Nbd7" --n 4` | +0.64 Nc4 · +0.57 f4 · +0.45 Bf4 | Se sostiene |
| M-7cc4-amenaza | Cc4 ataca a la dama de d6 | `node motor.mjs amenaza "… Ne5 Nbd7 Nc4" --prof 16` | Si blancas jugara otra vez: Nxd6+ (+7.29) | Se sostiene |
| M-4d4-d8 | 4.d4 (dama en d8) la mejor; buena: Cf3 | `node motor.mjs mejores "e4 d5 exd5 Qxd5 Nc3 Qd8" --n 5` | +0.71 d4 · +0.66 Nf3 · +0.32 g3 | Se sostiene |
| M-5cf3-d8 | 5.Cf3 la mejor; buenas: Ae3, Af4, Ac4 | `node motor.mjs mejores "… Qd8 d4 Nf6" --n 5` | +0.71 Nf3 · +0.62 Be3 · +0.57 Bf4 · +0.52 Bc4 | Se sostiene |
| M-6h3-d8 | Contra ...Ag4 (dama en d8), 6.h3 la mejor por mucho | `node motor.mjs mejores "… Qd8 d4 Nf6 Nf3 Bg4" --n 5` | +1.28 h3 · +0.63 Bc4 · +0.62 Bf4 | Se sostiene |
| M-6h3-d8-b | Tras 6.h3, ...Axf3 empata con la mejor | `node motor.mjs jugada "… Bg4 h3" "Bxf3"` | pierde 2 | Se sostiene |
| M-7dxf3-d8 | Retomas con la dama, no con el peón | `node motor.mjs mejores "… Qd8 … h3 Bxf3" --n 4` | +1.14 Qxf3 · +0.08 gxf3 | Se sostiene |
| M-7dxf3-d8-amenaza | Tu dama ataca b7 | `node motor.mjs amenaza "… Qd8 … Bxf3 Qxf3" --prof 16` | Si blancas jugara otra vez: Qxb7 (+5.59) | Se sostiene |
| M-7dxd4 | Si la dama de negras se come d4, Dxb7 y después la torre de a8 | `node motor.mjs jugada "… Qd8 … Qxf3" "Qxd4"` | Qxd4 pierde 582 (+6.97): Qxd4 Qxb7 Qd8 Qxa8 | Se sostiene |
| M-7dxd4-b | Tras 7...Dxd4, 8.Dxb7 la mejor | `node motor.mjs mejores "… Qxf3 Qxd4" --n 3` | +6.92 Qxb7 · +4.21 Nb5 · +3.69 Be3 | Se sostiene |
| M-3d4 | 3.d4 (contra 2...Cf6) la mejor; buena: Cf3 | `node motor.mjs mejores "e4 d5 exd5 Nf6" --n 5` | +0.73 d4 · +0.70 Nf3 · +0.50 Be2 | Se sostiene |
| M-4cf3 | 4.Cf3 la mejor; buena: c4 | `node motor.mjs mejores "e4 d5 exd5 Nf6 d4 Nxd5" --n 5` | +0.69 Nf3 · +0.63 c4 · +0.47 Be2 | Se sostiene |
| M-5ad3 | 5.Ad3 la mejor; buenas: Ch4, a3, Ab5+ | `node motor.mjs mejores "… Nxd5 Nf3 Bf5" --n 4` | +0.67 Bd3 · +0.66 Nh4 · +0.62 a3 · +0.49 Bb5+ | Se sostiene |
| M-6dxd3 | 6.Dxd3 la mejor; con el peón, peor | `node motor.mjs mejores "… Bf5 Bd3 Bxd3" --n 3` | +0.67 Qxd3 · −0.51 cxd3 | Se sostiene |
| M-7oo-marshall | 7.0-0 empata con la mejor; buena: c4 | `node motor.mjs mejores "… Bxd3 Qxd3 e6" --n 4` · `jugada … "O-O"` | +0.73 c4 · +0.71 O-O · O-O pierde 1 | Se sostiene |
| M-8c4-marshall | 8.c4 la mejor; buena: Te1 | `node motor.mjs mejores "… e6 O-O c6" --n 4` | +0.76 c4 · +0.66 Re1 · +0.58 Rd1 | Se sostiene |
| M-c4-amenaza-marshall | c4 echa al caballo de d5 | `node motor.mjs amenaza "… O-O c6 c4" --prof 16` | Si blancas jugara otra vez: cxd5 (+5.27) | Se sostiene |
| M-5ae2 | 5.Ae2 a 0.07 de la mejor; buenas: c4, h3, a3 | `node motor.mjs mejores "… Nxd5 Nf3 Bg4" --n 5` | +0.68 c4 · +0.61 Be2 · +0.54 h3 · +0.53 a3 | Se sostiene |
| M-6oo-gipslis | 6.0-0 a 0.11 de la mejor; buenas: c4, h3 | `node motor.mjs mejores "… Bg4 Be2 e6" --n 4` | +0.71 c4 · +0.67 h3 · +0.60 O-O | Se sostiene |
| M-7c4-gipslis | 7.c4 la mejor | `node motor.mjs mejores "… e6 O-O Nc6" --n 4` | +0.85 c4 · +0.62 h3 | Se sostiene |
| M-c4-amenaza-gipslis | c4 echa al caballo de d5 | `node motor.mjs amenaza "… O-O Nc6 c4" --prof 16` | Si blancas jugara otra vez: cxd5 (+5.91) | Se sostiene |
| M-8cc3-gipslis | 8.Cc3 la mejor | `node motor.mjs mejores "… Nc6 c4 Nb6" --n 4` | +0.77 Nc3 · +0.54 b3 | Se sostiene |
| M-5c4-richter | 5.c4 la mejor; buena: Ae2 | `node motor.mjs mejores "… Nxd5 Nf3 g6" --n 5` | +1.00 c4 · +0.93 Be2 | Se sostiene |
| M-c4-amenaza-richter | c4 echa al caballo de d5 | `node motor.mjs amenaza "… Nf3 g6 c4" --prof 16` | Si blancas jugara otra vez: cxd5 (+6.21) | Se sostiene |
| M-6cc3-richter | 6.Cc3 (la de Wikibooks) a 0.22 de la mejor; buenas: a4, c5, h3 | `node motor.mjs mejores "… g6 c4 Nb6" --n 4` · `jugada … "Nc3"` | +1.01 a4 · +0.78 c5 · +0.76 h3 · +0.75 Nc3 | Se sostiene (no pierde nada: es la línea de Wikibooks) |
| M-7ae2-richter | 7.Ae2 la mejor; buenas: c5, a4, Ae3 | `node motor.mjs mejores "… Nc3 Bg7" --n 4` | +0.79 Be2 · +0.78 c5 · +0.77 a4 · +0.73 Be3 | Se sostiene |
| M-8oo-richter | 8.0-0 a 0.05 de la mejor; buena: h3 | `node motor.mjs mejores "… Be2 O-O" --n 4` | +0.81 h3 · +0.76 O-O | Se sostiene |
| E-salto | 7.Cd5 sin tu alfil en c4 (tras 6.Ad2 c6) pierde el caballo | `node motor.mjs jugada "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 Bf5 Bd2 c6" "Nd5"` | Nd5 pierde 588 (−5.24) | Se sostiene |
| E-salto-b | Tras 7.Cd5, 7...Dxd5 la mejor | `node motor.mjs mejores "… Bd2 c6 Nd5" --n 3` | −5.54 Qxd5 · +0.65 Qd8 | Se sostiene |
| E-dc6 | 3...Dc6 es un error | `node motor.mjs jugada "e4 d5 exd5 Qxd5 Nc3" "Qc6"` | pierde 569 (+6.35) | Se sostiene |
| E-dc6-b | 4.Ab5 clava y gana la dama | `node motor.mjs mejores "e4 d5 exd5 Qxd5 Nc3 Qc6" --n 3` | +6.24 Bb5 Bd7 Bxc6 · +1.24 Nf3 | Se sostiene |
| E-dxd4 | 7...Dxd4 (dama en casa) es un error | `node motor.mjs jugada "… Qd8 … Bxf3 Qxf3" "Qxd4"` | pierde 582 (+6.97) | Se sostiene |
| E-dxd4-b | 8.Dxb7 y la torre de a8 no se salva | `node motor.mjs mejores "… Qxf3 Qxd4" --n 3` | +6.92 Qxb7 c6 Be3 Qd8 Qxa8 | Se sostiene |
| E-cxd5 | Tras 8...cxd5, 9.Axa5 la mejor | `node motor.mjs mejores "… Nd5 cxd5" --n 3` | +4.37 Bxa5 · −4.65 g4 | Se sostiene |

## Los planes, donde se usan (notas 2 y 5 del orchestrator)

Al final de cada lección y contra las dos mejores respuestas del motor (al final de las ocho no hay partidas con 3 o más repeticiones). Y en cada posición de la lección donde le toca al rival y hay partidas, contra sus dos respuestas más jugadas: abajo, "P-señal".

| Id | Plan | Comando | Resultado | Veredicto |
|---|---|---|---|---|
| P-clasica | Cxf6+, De2 y 0-0-0 | `mejores "… Nd5 Qd8"` · `mejores "… Nd5 Qd8 Nxf6+ Qxf6"` | 9.Nxf6+ la mejor (+0.45); 10.Qe2 la mejor (+0.72), sigue O-O-O | Se sostiene |
| P-lasker | 0-0-0 y después Ac4 (contra 8...Cbd7) | `mejores "… c6 Bd2 Nbd7" --n 4` | +1.15 Bc4 · +1.04 O-O-O | Se sostiene |
| P-lasker-b | Contra 8...Db6: 0-0-0, no Ac4 | `mejores "… c6 Bd2 Qb6" --n 4` · `jugada … "Bc4"` | +1.37 g4 · +1.28 Bf4 · +1.24 O-O-O · Bc4 pierde 74 (Qxd4) | **Corregido:** primero el enroque largo |
| P-lasker-c | Contra 8...e6: 0-0-0 | `jugada "… c6 Bd2 e6" "O-O-O"` | pierde 25 (+0.95) | Se sostiene |
| P-bronstein | 0-0 contra 8...e6 | `mejores "… Bg2 e6" --n 4` | +1.19 Qe2 · +1.12 h4 · +1.04 O-O | Se sostiene |
| P-bronstein-b | 0-0 contra 8...h6 | `jugada "… Bg2 h6" "O-O"` | pierde 39 (+1.30) | Se sostiene (no pierde material) |
| P-sp | Contra 7...Dc7: g3, Ag2, 0-0 | `jugada "… Nc4 Qc7" "g3"` | pierde 15 (+0.40) | Se sostiene |
| P-sp-b | Contra 7...De6+: tapa con Ae2 | `mejores "… Nc4 Qe6+" --n 4` | +0.99 Be2 · +0.34 Ne3 | **Con condición** (g3 no tapa el jaque) |
| P-valenciana | Contra 7...c6: Ae3 o Af4 y 0-0-0 | `mejores "… Qxf3 c6" --n 4` | +1.13 g4 · +0.72 Be3 · +0.57 Bf4 | Se sostiene (no pierde material; g4, la del motor, no se enseña) |
| P-valenciana-b | Contra 7...Dc8: Af4 (o Ae3) | `mejores "… Qxf3 Qc8" --n 4` · `jugada … "Be3"` | +2.31 g4 · +2.04 Bf4 · Be3 pierde 63 (+1.76) | Se sostiene |
| P-valenciana-c | Si negras deja b7 sin cuidar (7...e6), Dxb7 | `mejores "… Qxf3 e6" --n 3` | +2.95 Qxb7 | Se sostiene |
| P-marshall | Cc3 y Af4 | `mejores "… c6 c4 Nf6"` · `mejores "… c6 c4 Nb6"` | +0.74 Nc3 · contra Cb6: +1.08 Bf4, +1.04 Nc3 | Se sostiene |
| P-gipslis | d5 contra 8...Ae7 y 8...Ab4 | `mejores "… c4 Nb6 Nc3 Be7"` · `mejores "… Nc3 Bb4" --n 4` | +0.73 d5 (la mejor) · +0.98 d5 (a 0.11) | Se sostiene |
| P-gipslis-b | Si cambia en f3, retoma con el alfil | `mejores "… Nc3 Bxf3"` | +1.16 Bxf3 · −1.36 gxf3 | Se sostiene |
| P-richter | Contra ...Ag4, h3; contra ...Cc6, d5 | `mejores "… O-O O-O Bg4"` · `mejores "… O-O O-O Nc6"` | +0.77 h3 · +1.00 d5 (las mejores) | Se sostiene |
| P-señal-a5 | Con la dama en a5 y 4...c6 (36.4 % de las partidas ahí): Ad2 | `mejores "… Qa5 d4 c6" --n 4` | +0.93 Bd2 (la mejor) | Se sostiene |
| P-señal-a5-b | Tras 4...c6 5.Cf3 Ag4: h3 | `mejores "… Qa5 d4 c6 Nf3 Bg4"` | +0.98 h3 (la mejor) | Se sostiene |
| P-señal-d8 | Con la dama en d8 y 4...e6 (27.4 %): desarrolla | `mejores "… Qd8 d4 e6" --n 4` | +0.76 Nf3 · +0.76 Bd3 | Se sostiene |
| P-señal-d6 | Con la dama en d6 y 4...Cf6: 5.Cf3, y después Cb5 la ataca | `mejores "… Qd6 d4 Nf6" --n 4` | +0.69 Nf3 g6 Nb5 | Se sostiene |
| P-señal-caballo | Contra 4...Cc6 (23.5 % tras 4.Cf3): c4 | `mejores "… Nxd5 Nf3 Nc6"` | +0.96 Bb5 · +0.94 c4 | Se sostiene |

## Los jaques en e5 y e6 (nota 1 del orchestrator)

La frase de El mapa: "Si la dama da jaque en e5 o en e6, lo tapas con tu alfil, Ae2, y sigues sacando piezas con Cf3 y d4: la dama tiene que moverse otra vez."

| Id | Posición | Comando | Resultado | Veredicto |
|---|---|---|---|---|
| J-e5 | 3...De5+ | `mejores "e4 d5 exd5 Qxd5 Nc3 Qe5" --n 4` | +0.92 Be2 · +0.69 Nge2 | Se sostiene |
| J-e5-ag4 | 4.Ae2 Ag4 (35.1 %) | `mejores "… Qe5 Be2 Bg4" --n 4` | +0.98 d4 Bxe2 Ngxe2 Qa5 | Se sostiene: d4 ataca a la dama y se mueve |
| J-e5-dg5 | 4.Ae2 Dg5 (15.3 %) | `mejores "… Qe5 Be2 Qg5" --n 3` | +1.71 Nf3 Qa5 | Se sostiene |
| J-e5-cc6 | 4.Ae2 Cc6 (11.9 %) | `mejores "… Qe5 Be2 Nc6" --n 3` | +1.60 Nf3 Qa5 | Se sostiene |
| J-e6 | 3...De6+ | `mejores "e4 d5 exd5 Qxd5 Nc3 Qe6" --n 4` | +1.03 Be2 · +0.52 Nge2 | Se sostiene |
| J-e6-cc6 | 4.Ae2 Cc6 (26.8 %) | `mejores "… Qe6 Be2 Nc6" --n 3` | +2.39 d4 Qd7 d5 | Se sostiene |
| J-e6-dg6 | 4.Ae2 Dg6 (23.4 %) | `mejores "… Qe6 Be2 Qg6" --n 3` | +1.60 Nf3 · +1.40 d4 Qxg2 Bf3 | Se sostiene |
| J-e6-cf6 | 4.Ae2 Cf6 (14.2 %) | `mejores "… Qe6 Be2 Nf6" --n 3` | +1.12 Nf3 Qd6 · +1.12 d4 Qd6 | Se sostiene |

Las salidas completas de cada comando quedan en la carpeta de trabajo de la corrida, fuera del repo.
