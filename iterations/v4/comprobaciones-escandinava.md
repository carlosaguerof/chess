# Comprobaciones con el motor del curso de la captura contra la Escandinava (2026-11-25)

Cada afirmación del curso que el motor puede medir ("es la mejor", "ataca", "pierde", "gana", "es un error"), con su comando y lo que contestó. El motor: Stockfish 19 lite (el de la app, el paquete `stockfish` de npm), un hilo, profundidad 18; las amenazas ("si fuera tu turno otra vez", con jugada nula), profundidad 16. `motor.mjs` es una envoltura de ese motor con chess.js, igual a la de las comprobaciones de la Caro-Kann (`iterations/v3/comprobaciones-del-curso.md`): `mejores` da las N mejores con su línea, `jugada` cuánto pierde una jugada contra la mejor, `amenaza` qué haría el lado que acaba de mover si jugara otra vez. Las evaluaciones van desde blancas: + es mejor para blancas. Diferencias de menos de 0.2 no distinguen jugadas.

Cada id aparece en el campo `motor` del texto que lo afirma, en `conocimiento/cursos/escandinava.json`. Las líneas del curso (las continuaciones de la base) y su comprobación: `scripts/base/definiciones/escandinava.json` (variantes `curso-*`); `npm run validar-base` (ninguna jugada mía pierde más de 100 cp) y `node scripts/validar-libros.ts` (ninguna jugada de libro pierde más de 200).

**Lo que el motor corrigió:**
- **El plan de la Lasker:** decía "Ac4 y 0-0-0". Contra 8...Db6 (la segunda del motor), 9.Ac4 pierde 74 (9...Dxd4). Ahora dice primero 0-0-0 y después el alfil (P-lasker-b). Tras 0-0-0, 9...Dxd4 pierde 430 por 10.Cb5 (Dxd4 Cb5 Da4 Cc7+): d4 aguanta por esa táctica, no porque la torre lo defienda (el alfil de d2 tapa la columna; pase adversarial 2).
- **El plan de la Schiller-Pytel:** "g3, Ag2 y 0-0" no se puede contra 7...De6+ (hay que tapar el jaque). Lleva su condición (P-sp-b).
- **El gate del mapa** (abajo): el alfil a f4 contra la dama en d6, solo con g3 jugado; el salto Cd5 de la Clásica, con su condición completa (ningún alfil de negras en b4); el plan de la Clásica, con las dos retomas en f6; la frase de los jaques, medida como queda escrita; y el "Ce5 cuando se pueda" de la Bronstein se quitó (con el caballo de negras en c6, Ce5 suelta d4).
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
| M-8cd5-cxd5 | Si negras toma el caballo con el peón, 9.Axa5 se come la dama | `node motor.mjs jugada "… Bd2 c6 Nd5" "cxd5"` · `mejores "… Nd5 cxd5" --n 3` | cxd5 pierde 460 (+5.05) · +4.37 Bxa5; sigue 9...dxc4 (+3.96): ganas la dama por un caballo y un alfil | Se sostiene (el pase 1 corrigió "por un caballo") |
| M-8cd5-dxd5 | Si la dama toma el caballo, 9.Axd5 se come la dama | `node motor.mjs mejores "… Bd2 c6 Nd5" --n 4` | +0.71 Qd8 · +4.53 Qxd2+ · +4.67 Qxd5 Bxd5 cxd5 · +4.95 cxd5: la dama por un caballo y un alfil | Se sostiene (el pase 1 corrigió "por un caballo") |
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
| P-clasica | Cxf6+; si retoma con la dama, De2 y 0-0-0 (si retoma con el peón: G-clasica-gxf6) | `mejores "… Nd5 Qd8"` · `mejores "… Nd5 Qd8 Nxf6+ Qxf6"` | 9.Nxf6+ la mejor (+0.45); 10.Qe2 la mejor (+0.72), sigue O-O-O | Se sostiene |
| P-lasker | 0-0-0 y después Ac4 (contra 8...Cbd7) | `mejores "… c6 Bd2 Nbd7" --n 4` | +1.15 Bc4 · +1.04 O-O-O | Se sostiene |
| P-lasker-b | Contra 8...Db6: 0-0-0, no Ac4 | `mejores "… c6 Bd2 Qb6" --n 4` · `jugada … "Bc4"` | +1.37 g4 · +1.28 Bf4 · +1.24 O-O-O · Bc4 pierde 74 (Qxd4) | **Corregido:** primero el enroque largo |
| P-lasker-c | Contra 8...e6: 0-0-0 | `jugada "… c6 Bd2 e6" "O-O-O"` | pierde 25 (+0.95) | Se sostiene |
| P-bronstein | 0-0 contra 8...e6 (el plan ya no dice Ce5) | `mejores "… Bg2 e6" --n 4` | +1.19 Qe2 · +1.12 h4 · +1.04 O-O | Se sostiene |
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

## Lo que corrigió el gate del mapa (revisión del 2026-11-25; notas 7 y 8 del orchestrator)

Un evaluator independiente midió cada regla del mapa donde se usa, también contra la respuesta del libro y como queda escrita. Estas son las medidas de este curso después de corregir.

| Id | Regla (como queda escrita) | Comando | Resultado | Veredicto |
|---|---|---|---|---|
| G-af4 | La dama en d6 quedó fuera del mapa; la regla de la Bronstein: "tu alfil sale a f4 cuando tu peón de g3 lo protege" | `jugada "e4 d5 exd5 Qxd5 Nc3 Qd6 d4 Nf6" "Bf4"` · `amenaza "… a6 g3 Nc6 Bf4"` | Sin g3: Bf4 pierde 633 (Dxf4). Con g3: Bxd6 amenaza (+7.54) y Bf4 es la mejor (+1.14) | **Corregido:** el alfil a f4 solo con g3 jugado |
| G-cd5-ab4 | "El salto Cd5, con tu alfil en c4 y ningún alfil de negras en b4: si llega a b4, primero a3" | `mejores "… Bc4 e6 Bd2 Bb4" --n 4` · `jugada … "Nd5"` | +0.44 a3 (la mejor) · Nd5 pierde 664 (−6.15) | **Corregido:** la condición completa |
| G-cd5-cc6 | Con la dama en a5, contra ...Cc6, d5 echa al caballo | `jugada "e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nc6" "d5"` | +1.61 d5 (la mejor; pierde 9 contra la misma) | Se sostiene |
| G-a5-e5 | Con la dama en a5, contra ...e5, desarrolla (Cf3) | `mejores "… Qa5 d4 e5" --n 4` | +1.08 Nf3 (la mejor) | Se sostiene |
| G-a5-c6 | Con la dama en a5, contra ...c6 (36.4 %), Ad2 | `jugada "… Qa5 d4 c6" "Bd2"` | +0.79 Bd2 (la mejor) | Se sostiene |
| G-clasica-gxf6 | Si negras retoma con el peón, 9...gxf6, enroca corto (no De2) | `mejores "… Nxf6+ gxf6" --n 4` · `jugada … "Qe2"` | +0.81 O-O (la mejor) · Qe2 pierde 63 (Axc2, y ya no hay 0-0-0) | **Corregido:** el plan dice las dos retomas |
| G-d8-e6 | Con la dama en d8, contra ...e6 (27.4 %), Cf3 | `jugada "… Qd8 d4 e6" "Nf3"` | +0.77 Nf3 (pierde 3) | Se sostiene |
| G-d8-af5 | Con la dama en d8, contra 4...Af5 (13.7 %): sacas tus piezas (el plan no nombra jugada) | `mejores "… Qd8 d4 Bf5" --n 4` | +1.08 g4 · +0.95 Df3 · +0.72 Ad3 · +0.68 Ac4 | Sin regla nombrada: no se dice nada más |

## La segunda vuelta del gate (notas 10 y 11): cada regla con otra jugada natural del rival ya en el tablero

Stockfish 19 lite, un hilo, profundidad 18, con la Air muy cargada. `jugada "<jugadas>" "<candidata>"` da la mejor y la candidata; "pierde" es la diferencia. Las jugadas, desde 1.e4 (abreviado: "…" es `e4 d5 exd5 Qxd5 Nc3`; VAL es `… Qd8 d4 Nf6 Nf3 Bg4 h3 Bxf3 Qxf3`; RICH es `e4 d5 exd5 Nf6 d4 Nxd5 Nf3 g6 c4 Nb6 Nc3 Bg7 Be2 O-O O-O`).

| Id | Regla (como queda escrita) | Posición | Candidata | Resultado | Veredicto |
|---|---|---|---|---|---|
| G2-d8-cc6 | "Si en su cuarta jugada negras saca ...Cc6, d5 lo echa" (dama en d8) | `… Qd8 d4 Nc6` | d5 | +1.45; la mejor, d5 con otra continuación (+1.65) | Se sostiene |
| G2-a5-cc6 | Ídem, dama en a5 | `… Qa5 d4 Nc6` | d5 | +1.52; la mejor, d5 (+1.61) | Se sostiene |
| G2-d8-cc6-ag4 | "Contra ...Ag4: h3, salvo con un caballo de negras en c6; ahí, d5" | `… Qd8 d4 Nc6 Nf3 Bg4` | d5 · h3 | d5 +2.66 (la mejor) · h3 +0.16, pierde 253 (Axf3 Dxf3 Cxd4) | Se sostiene; h3 sola no |
| G2-d8-cc6-af5 | (con el caballo en c6, contra ...Af5) | `… Qd8 d4 Nc6 Nf3 Bf5` | d5 | +1.54, la mejor | Se sostiene |
| G2-d8-cf6-cc6-ag4 | ídem | `… Qd8 d4 Nf6 Nf3 Nc6 Bc4 Bg4` | d5 · h3 | d5 +0.46 (la mejor, d5 +0.61) · h3 −0.34, pierde 95 | Se sostiene; h3 sola no |
| G2-d8-ag4-cc6 | ídem, con ...Ag4 primero y Ae2 | `… Qd8 d4 Nf6 Nf3 Bg4 Be2 Nc6` | d5 | +0.53, a 20 de la mejor (Ab5) | Se sostiene |
| G2-a5-cc6-ad2-ag4 | ídem, dama en a5 | `… Qa5 d4 Nf6 Nf3 Nc6 Bd2 Bg4` | d5 · h3 | d5 +1.22 (la mejor, d5 +1.61) · h3 −0.25, pierde 186 | Se sostiene; h3 sola no |
| G2-a5-cc6-ag4 | ídem, sin Ad2 | `… Qa5 d4 Nc6 Nf3 Bg4` | d5 · h3 · Ad2 | la mejor Ab5 +0.84 · d5 +0.23 · h3 +0.16 · Ad2 +0.43 | d5 no pierde material (a 61 de la mejor) |
| G2-cf6-cc6 | (sin ...Ag4, no se nombra d5) | `… Qd8 d4 Nf6 Nf3 Nc6` · `… Qa5 d4 Nf6 Nf3 Nc6` | d5 | −70 (Ab5 +1.02) · −57 (Ad2 +1.10, la mejor) | Por eso la regla solo dice d5 en la cuarta jugada o con ...Ag4 |
| G2-ae5-cc6 | (con un caballo blanco en e5, d5 lo cuelga; fuera de las líneas) | `… Qd8 d4 Nf6 Nf3 Bg4 h3 Bh5 g4 Bg6 Ne5 Nc6` | d5 | −1.61, pierde 489 (Ab5 +3.28) | Fuera de las señales de la regla (el alfil ya no está en g4) |
| G2-sin-cf3 | "Contra ...Ag4, con tu caballo en f3"; "el salto Cd5, con tu caballo en f3" | `… Qa5 d4 c6 Bd2 Nf6 Bc4 Bg4` | Cf3 · f3 | f3 +1.15 (la mejor) · Cf3 +0.65 | Sin Cf3, ni h3 ni Cd5 (el gate: −751 y −555) |
| G2-a5-af5 | 3...Da5 4.d4 Af5: Ad2 (la regla de la clavada) | `… Qa5 d4 Bf5` | Ad2 | +0.71 (la mejor, Df3 +0.63) | Se sostiene |
| G2-a5-c6-dc7 | Tras 4...c6 5.Ad2 Dc7, ya no hay clavada: sigues sacando piezas | `… Qa5 d4 c6 Bd2 Qc7` | Cf3 · Ac4 | Cf3 +0.94 (la mejor) · Ac4 +0.99 | Se sostiene |
| G2-lasker-cc6 | (Lasker, tras ...Axf3 Dxf3 Cc6) | `… Qa5 d4 Nf6 Nf3 Bg4 h3 Bxf3 Qxf3 Nc6` | Ab5 · Ad2 | Ab5 +2.13 (la mejor) · Ad2 −0.04, pierde 225 | La línea sigue 7...c6; no se nombra |
| G2-val-c6 | Plan de la Valenciana: "Saca tu alfil de c1 a e3 y enroca largo" | `VAL c6` · `VAL c6 Be3 e6` | Ae3 · 0-0-0 | Ae3 +0.72 (g4 +1.11) · 0-0-0 +0.64 (Ad3 +0.88) | Se sostiene, sin material |
| G2-val-b7 | "Si negras deja b7 sin cuidar, tu dama se lo come" | `VAL e6` · `VAL Nbd7` | Dxb7 | +2.95 y +2.81, la mejor en las dos (Ae3 ahí: +0.77 y +1.13) | Se sostiene |
| G2-val-cc6 | "Si saca su caballo a c6, Ab5 lo clava" | `VAL Nc6` | Ab5 · Ae3 · d5 | Ab5 +3.51 (la mejor) · Ae3 +1.24 · d5 +0.94 (con el caballo en c6, Dxb7 no es posible: c6 tapa la diagonal) | Se sostiene; por eso se quitó "o a f4" y se agregó Ab5 |
| G2-gipslis-d5 | "Con tu caballo en c3, si un caballo de negras va a c6, d5 lo echa" | `e4 d5 exd5 Nf6 d4 Nxd5 Nf3 Bg4 Be2 e6 O-O Nc6 c4 Nb6` · `… Nc3 Be7` | d5 · Cc3 | sin Cc3: d5 −0.40, pierde 120 (exd5 cxd5 Dxd5) · Cc3 la mejor · con Cc3 y 8...Ae7: d5 la mejor (+0.83) | Se sostiene con la condición |
| G2-grande-sin-e6 | ídem, sin ...e6 | `e4 d5 exd5 Nf6 d4 Nxd5 Nf3 Nc6 c4 Nb6` · `… Nf3 Bg4 Be2 Nc6 c4 Nb6` | d5 | −28 (+1.23) · la mejor (+0.76) | Sin material; la regla no la nombra sin Cc3 |
| G2-richter | "Contra ...Ag4, h3; si un caballo va a c6, d5" (con Cc3) | `RICH Nc6` · `RICH Bg4` · `RICH Bg4 h3 Bxf3 Bxf3 Nc6` | d5 · h3 · d5 | d5 la mejor (+0.98) · h3 la mejor (+0.90) · d5 +0.34, a 17 | Se sostiene |
| G2-marshall-af5 | "Si su alfil sale a f5, primero Ad3 y lo cambias" | `e4 d5 exd5 Nf6 d4 Nxd5 Nf3 Bf5` | c4 · Ad3 | Ad3 +0.68 (la mejor, Ad3 +0.75) · c4 −0.01, pierde 76 (...Cb4) | Se sostiene |
| G2-lasker-plan | Plan de la Lasker: 0-0-0 y Ac4 (sin "la torre defiende d4": el alfil de d2 tapa la columna; pase 2) | `… Qa5 d4 Nf6 Nf3 Bg4 h3 Bxf3 Qxf3 c6 Bd2 Nbd7` · `… O-O-O e6` | 0-0-0 · Ac4 | +0.96 (g4 +0.80) · +0.95 (Rb1 +0.90) | Se sostiene |
| P3-d8-c6-ac4 | Con la dama en d8: "h3, salvo … con tu alfil en c4 y ...c6 jugado (ahí, Ae2)" (pase adversarial 3) | `mejores "… Qd8 d4 Nf6 Nf3 c6 Bc4 Bg4" --n 3` | +3.87 Ce5 · +3.48 Axf7+ · +0.34 Ae2; h3 −0.20, pierde 413 (Axf3 Dxf3 Dxd4: con ...c6 no hay Dxb7, y d4 cae con tiempo contra el alfil de c4) | Ae2 no pierde material; Ce5 es una táctica que el curso no enseña |
| P3-d8-ac4-sin-c6 | (sin ...c6, h3 sigue sirviendo) | `mejores "… Qd8 d4 Nf6 Bc4 Bg4 Nf3 e6" --n 3` | +0.74 h3, la mejor | Por eso la excepción dice "y ...c6 jugado" |
| P3-a5-c6-ac4 | (con la dama en a5, h3 sigue sirviendo) | `mejores "… Qa5 d4 Nf6 Nf3 c6 Bc4 Bg4" --n 3` | +0.86 h3, la mejor | La excepción es solo de la dama en d8 |
| P3-ae2-retoma | "Si cambia en f3, retomas con una pieza, no con un peón" (con tu alfil en e2, Dxf3 no es legal) | `mejores "… Qd8 d4 Nf6 Nf3 c6 Be2 Bg4" --n 3` · `mejores "… Be2 Bg4 h3 Bxf3" --n 3` | h3 la mejor (+0.52) · Axf3 la mejor (+0.56; gxf3 +0.00) | Se sostiene |
| P3-lasker-cc6 | "Si después saca su caballo a c6, Ab5 lo clava" (la Lasker, una jugada antes del final: 7...Cc6 en vez de 7...c6) | `mejores "… Qa5 d4 Nf6 Nf3 Bg4 h3 Bxf3 Qxf3 Nc6" --n 3` | +2.40 Ab5, la mejor · Ad2 −0.04 (pierde 225: 8...0-0-0 y d4 cae) | Se sostiene; la idea de la Lasker y La clavada lo dicen |

Las salidas, completas: `lote11a.out`, `lote11b.out`, `lote11c.out`, `lote12.out` y `lote13.out` en la carpeta de trabajo de la corrida (fuera de este repo).

## Los planes de la base, también los de las variantes que no son lección (nota 12)

La guía en partida muestra el `plan` de la variante de la base en la que estás, sea o no lección. Ninguno contradice al curso:

| Variante | Qué decía | Qué dice ahora | Respaldo |
|---|---|---|---|
| da5-clasica | "Ad2 … amenaza Cd5", sin condición | Ad2 prepara Cd5; el salto solo con tu caballo en f3, tu alfil en c4 y ningún alfil de negras en b4 | G-cd5-ab4, G2-sin-cf3 |
| dd6-bronstein | "atacándola con Cb5, Af4 o Ce4"; "g3, Ag2, 0-0 y Ce5" | g3 primero, y Af4 protegido por g3; Ag2 y 0-0 (sin Ce5) | G-af4, P-bronstein |
| dd6-schiller-pytel | "lo principal es g3 con Ag2…: no ganas mucho persiguiéndola" | Ce5 y Cc4, que ataca a la dama otra vez; si va a c7, g3, Ag2 y 0-0; si da jaque en e6, Ae2 | M-6ce5-sp, P-schiller-pytel |
| moderna-marshall | "Cf3, Ae2 o Ac4 y 0-0, y c4" | contra ...Ag4, Ae2; contra ...Af5, Ad3; c4 antes o después de enrocar; con Cc3, contra ...Cc6, d5 | G2-marshall-af5, G2-gipslis-d5 |
| moderna-richter | "Ae2 o Ac4, 0-0 y c4" (con el alfil en c4, el peón de c ya no puede ir a c4) | c4; después Cc3, Ae2 y 0-0; contra ...Ag4, h3; contra ...Cc6, d5 | G2-richter |
| curso-lasker | "la torre en d1 defendiendo d4" | "tu rey a salvo y tu torre en la columna d" | G2-lasker-plan |
| curso-valenciana | "Desarrolla el alfil de c1 y enroca" | Ae3 y 0-0-0; Dxb7 si toma en d4; contra ...Cc6, Ab5 | G2-val-… |
| curso-marshall | "dos peones en el centro" | "tus peones de c4 y d4 dominan el centro" | (pase 1, el centro) |
| da5-lasker | (sin cambio) "Si negras contesta 6...Dh5, 7.hxg4 Dxh1 8.Ce2 y la dama negra queda atrapada" | igual | B-lasker-dh5: `jugada "… Qa5 d4 Nf6 Nf3 Bg4 h3 Qh5" "hxg4" --prof 16` la mejor (+2.99); `mejores "… h3 Qh5 hxg4 Qxh1 Ne2" --prof 16`: +4.82 (h5 Cg3 hxg4 Cxh1) |
| da5-grunfeld, dd8-valenciana, moderna-gipslis, moderna-panov | (sin cambio) | igual | Grünfeld y Panov son tus otras jugadas (6.Ce5, 3.c4), buenas en el curso; la Valenciana y la Gipslis dicen lo mismo que sus lecciones |

## Los jaques en e5 y e6 (nota 1 del orchestrator; la frase, medida como queda escrita, nota 8)

La página "El jaque": "Lo tapas con tu alfil de f1: Ae2. Después la vuelves a atacar sin regalar nada. Con la dama en e5: contra ...Ag4, d4; contra lo demás, Cf3. Con la dama en e6: contra ...Cc6, d4; contra lo demás, Cf3. Si la dama se va a c6, Ab5 la clava contra su rey y la ganas."

| Id | Posición (frecuencia en 1000–1400 tras 4.Ae2) | Lo que dice la frase | Comando | Resultado | Veredicto |
|---|---|---|---|---|---|
| F-e5-ag4 | 3...De5+ 4.Ae2 Ag4 (35.1 %) | d4 | `jugada "… Qe5 Be2 Bg4" "d4"` · `jugada … "Nf3"` | d4 la mejor (+0.84) · Cf3 pierde 131 (Axf3 y gxf3) | Se sostiene |
| F-e5-dg5 | 4...Dg5 (15.3 %) | Cf3 | `jugada "… Qe5 Be2 Qg5" "Nf3"` | pierde 21 (+1.54) | Se sostiene |
| F-e5-cc6 | 4...Cc6 (11.9 %) | Cf3 | `jugada "… Qe5 Be2 Nc6" "Nf3"` · `jugada … "d4"` | Cf3 pierde 10 (+1.55) · d4 pierde 195 (Dxd4) | Se sostiene |
| F-e5-e6 | 4...e6 (9.6 %) | Cf3 | `jugada "… Qe5 Be2 e6" "Nf3"` | pierde 21 | Se sostiene |
| F-e5-af5 | 4...Af5 (7.6 %) | Cf3 | `jugada "… Qe5 Be2 Bf5" "Nf3"` | pierde 34 | Se sostiene |
| F-e5-cf6 | 4...Cf6 (7.6 %) | Cf3 | `jugada "… Qe5 Be2 Nf6" "Nf3"` | pierde 4 | Se sostiene |
| F-e6-cc6 | 3...De6+ 4.Ae2 Cc6 (26.8 %) | d4 | `jugada "… Qe6 Be2 Nc6" "d4"` · `jugada … "Nf3"` | d4 pierde 5 (+2.37) · Cf3 pierde 111 (sin material) | Se sostiene |
| F-e6-dg6 | 4...Dg6 (23.4 %) | Cf3 | `jugada "… Qe6 Be2 Qg6" "Nf3"` | la mejor (+1.67) | Se sostiene |
| F-e6-cf6 | 4...Cf6 (14.2 %) | Cf3 | `jugada "… Qe6 Be2 Nf6" "Nf3"` | pierde 5 | Se sostiene |
| F-e6-c6 | 4...c6 (6.7 %) | Cf3 | `jugada "… Qe6 Be2 c6" "Nf3"` | la mejor (+1.05) | Se sostiene |
| F-e6-b6 | 4...b6 (6.0 %) | Cf3 | `jugada "… Qe6 Be2 b6" "Nf3"` | pierde 41 | Se sostiene |
| F-e6-dc6 | 4...Dc6 (14.2 % en 600–1000) | Ab5 la clava y la ganas | `mejores "… Qe6 Be2 Qc6" --n 3` | +6.26 Bb5 Bd7 Bxc6 | Se sostiene |

## Los jaques: lo que se midió antes del gate

La primera frase, antes del gate, decía "sigues sacando piezas con Cf3 y d4" sin decir cuál: estas son las mejores de cada posición. La frase de hoy, medida tal como queda escrita, está arriba (F-…).

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
