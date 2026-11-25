# Las comprobaciones con el motor del curso de la Alapin (2026-11-25)

Stockfish 19 lite de un hilo (el del repo), profundidad 18 (16 para las amenazas y para `planes-todos`). Evaluaciones desde blancas. Los scripts, fuera del repo (`00_corridas/_local/chess/curso-alapin/`): `motor.mjs` (los modos `mejores`, `jugada` y `amenaza`), `linea.mjs` (la línea, jugada por jugada, con las 5 mejores) y `plan.mjs` (las jugadas de un plan contra las dos mejores respuestas). Cada id es el que cita el curso en su campo `motor`.

| id | Afirmación | Comando | Resultado |
|---|---|---|---|
| R-d5 | Contra 2...d5, 3.exd5 es la mejor (la regla del mapa) | `node motor.mjs mejores "e4 c5 c3 d5" --prof 18 --n 3` | Se sostiene: +0.31, la mejor |
| R-d5-d4 | Defender e4 con 3.d4 sale peor | `node motor.mjs jugada "e4 c5 c3 d5" "d4" --prof 18` | Se sostiene: pierde 101 (−0.64) |
| R-d5-e5 | 3.e5 es peor que cambiar | `node motor.mjs jugada "e4 c5 c3 d5" "e5" --prof 18` | Se sostiene: pierde 35 |
| R-d5-d3 | 3.d3 es peor que cambiar | `node motor.mjs jugada "e4 c5 c3 d5" "d3" --prof 18` | Se sostiene: pierde 51 |
| R-nf6 | Contra 2...Cf6, 3.e5 es la mejor (la regla del mapa) | `node motor.mjs mejores "e4 c5 c3 Nf6" --prof 18 --n 3` | Se sostiene: +0.17, la mejor |
| R-nf6-d4 | Si no atiendes e4 (3.d4), el caballo lo toma | `node motor.mjs jugada "e4 c5 c3 Nf6" "d4" --prof 18` | Se sostiene: 3.d4 Cxe4, pierde 88 |
| R-nf6-d3 | 3.d3 es peor que avanzar | `node motor.mjs jugada "e4 c5 c3 Nf6" "d3" --prof 18` | Se sostiene: pierde 20 |
| R-nf6-bd3 | 3.Ad3 es peor que avanzar | `node motor.mjs jugada "e4 c5 c3 Nf6" "Bd3" --prof 18` | Se sostiene: pierde 40 |
| R-nc6 | Contra 2...Cc6, 3.d4 | `node motor.mjs mejores "e4 c5 c3 Nc6" --prof 18 --n 3` | Se sostiene: +0.30, la mejor |
| R-d6 | Contra 2...d6, 3.d4 | `node motor.mjs mejores "e4 c5 c3 d6" --prof 18 --n 3` | Se sostiene: +0.57, la mejor |
| R-e6 | Contra 2...e6, 3.d4 | `node motor.mjs mejores "e4 c5 c3 e6" --prof 18 --n 3` | Se sostiene: +0.28, la mejor |
| R-g6 | Contra 2...g6, 3.d4 | `node motor.mjs mejores "e4 c5 c3 g6" --prof 18 --n 3` | Se sostiene: +0.48, la mejor |
| R-e5 | Contra 2...e5, la regla no se aplica (por eso no se dice "lo demás") | `node motor.mjs mejores "e4 c5 c3 e5" --prof 18 --n 3` | 3.Cf3 +0.52; 3.d4 +0.16 |
| M-2c3 | 2.c3 está a 0.21 de la mejor de la posición (lo que permite validar-base) | `node linea.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w` | Se sostiene |
| M-d4 | 4.d4 es la mejor tras 3...Dxd5 | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w` | Se sostiene: +0.33 |
| M-cc-cxd4 | 5.cxd4 es la mejor tras 4...cxd4 | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w` | Se sostiene: +0.32 |
| L-cc | El Cambio Central con 7.Cc3 (la mejor): la única buena de negras es 7...Axf3 8.gxf3 Dxd4, y el aislado se deshace | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w` | Se sostiene: 7...Axf3 +0.34; las demás, +1.97 y más |
| L-cc-be2 | 7.Ae2 pierde 28 contra 7.Cc3, y 8.Cc3 es la mejor (empata con 0-0) | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" w` | Se sostiene |
| L-mod | Cada jugada blanca de la Línea Moderna a 0.08 o menos de la mejor | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" w` | Se sostiene |
| L-cc6 | Cada jugada blanca de 4...Cc6 a 0.07 o menos de la mejor | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" w` | Se sostiene |
| L-g6 | Cada jugada blanca de 4...g6 a 0.06 o menos de la mejor | `node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" w` | Se sostiene |
| L-gam | Cada jugada blanca del Gambito es la mejor | `node linea.mjs "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w` | Se sostiene |
| L-cf6 | Cada jugada blanca de 2...Cf6 a 0.20 o menos de la mejor | `node linea.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w` | Se sostiene |
| F-gam | Contra el gambito, 4.Da4+ es la mejor (4.Ab5+ a 0.29) | `node motor.mjs mejores "e4 c5 c3 d5 exd5 Nf6" --prof 18 --n 3` | Se sostiene |
| F-nf6-4 | 4.d4 y 4.Cf3 casi empatan (Stoltz y Heidenfeld van por 4.Cf3) | `node motor.mjs mejores "e4 c5 c3 Nf6 e5 Nd5" --prof 18 --n 3` | Se sostiene: +0.11 y +0.13 |
| F-nf6d4 | Tras 4...cxd4, 5.cxd4 está a 0.04 de la mejor | `node motor.mjs mejores "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4" --prof 18 --n 3` | Se sostiene |
| A-d5 | 2...d5 amenaza ...dxe4 | `node motor.mjs amenaza "e4 c5 c3 d5" --prof 16` | Se sostiene: si negras jugara otra vez, dxe4 (−1.16) |
| A-nf6 | 2...Cf6 amenaza ...Cxe4 | `node motor.mjs amenaza "e4 c5 c3 Nf6" --prof 16` | Se sostiene: −1.44 |
| A-nf6-e5 | 3.e5 ataca al caballo: tiene que moverse | `node motor.mjs amenaza "e4 c5 c3 Nf6 e5" --prof 16` | Se sostiene: si blancas jugara otra vez, exf6 (+5.98) |
| A-bg4 | 6...Ag4 amenaza cambiar en f3 y ganar d4 | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4" --prof 16` | Se sostiene: Axf3 gxf3 Cxd4 (−1.40) |
| A-mod-bg4 | 5...Ag4 clava el caballo | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4" --prof 16` | Amenaza Axf3 (−0.45) |
| A-h3 | 7.h3 ataca al alfil | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3" --prof 16` | Se sostiene: hxg4 (+6.77) |
| A-c3-nc3 | 8.Cc3 ataca la dama (Cambio Central) | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" --prof 16` | Se sostiene: Cxd5 (+7.54) |
| A-cc6-nc3 | 8.Cc3 ataca la dama (4...Cc6) | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" --prof 16` | Se sostiene: Cxd5 (+6.79) |
| A-g6-nc3 | 8.Cc3 ataca la dama (4...g6) | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" --prof 16` | Se sostiene: Cxd5 (+6.86) |
| A-d6 | 5...d6 ataca la punta de la cadena | `node motor.mjs amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6" --prof 16` | Amenaza dxe5 |
| A-nb6 | 7...Cb6 ataca el alfil de c4 | `node motor.mjs amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6" --prof 16` | Se sostiene: Cxc4 (−5.26) |
| A-gam-bd7 | 4...Ad7 ataca la dama de a4 | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7" --prof 16` | Se sostiene: Axa4 (−8.51) |
| A-gam-b3 | 5.Db3 ataca b7 | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3" --prof 16` | Se sostiene: Dxb7 (+3.54) |
| A-gam-e6 | 5...e6 ataca otra vez d5 | `node motor.mjs amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" --prof 16` | Se sostiene: exd5 (−1.73) |
| E-d4 | «¿Y si…?» 3.d4 contra 2...d5: error tuyo | `node motor.mjs jugada "e4 c5 c3 d5" "d4" --prof 18` | Se sostiene: pierde 101 |
| E-d4-b | Lo castiga 3...dxe4 | `node motor.mjs mejores "e4 c5 c3 d5 d4" --prof 18 --n 3` | Se sostiene: la mejor (−0.68) |
| E-d4-c | Tras 3...dxe4, 4.dxc5 Dxd1+ 5.Rxd1: el rey blanco ya no enroca | `node motor.mjs mejores "e4 c5 c3 d5 d4 dxe4" --prof 18 --n 3` | Se sostiene: −0.65 |
| E-nc3 | «¿Y si…?» 6.Cc3 antes que Cf3: pierde d4 | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Nc3" --prof 18` | Se sostiene: pierde 63; 6...Dxd4 |
| E-nc3-b | Lo castiga 6...Dxd4 | `node motor.mjs mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3" --prof 18 --n 3` | Se sostiene: la mejor (−0.33); las demás, +1.84 y más |
| E-nc3-c | Tras 6...Dxd4, negras sigue con el peón de más | `node motor.mjs mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3 Qxd4" --prof 18 --n 3` | Se sostiene: −0.42 |
| E-ne4 | «¿Y si…?» 3...Ce4: error del rival | `node motor.mjs jugada "e4 c5 c3 Nf6 e5" "Ne4" --prof 18` | Se sostiene: pierde 399 |
| E-ne4-b | Lo castiga 4.d3 | `node motor.mjs mejores "e4 c5 c3 Nf6 e5 Ne4" --prof 18 --n 3` | Se sostiene: la mejor (+4.34) |
| E-ne4-c | Tras 4.d3, el caballo se pierde: 4...Cxf2 5.Rxf2 | `node motor.mjs mejores "e4 c5 c3 Nf6 e5 Ne4 d3" --prof 18 --n 3` | Se sostiene: +4.43 |
| E-glot | «¿Y si…?» 8...Dxd4: la dama glotona | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3" "Qxd4" --prof 18` | Se sostiene: pierde 813 |
| E-glot-b | Lo castiga 9.Axc6+ | `node motor.mjs mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3 Qxd4" --prof 18 --n 3` | Se sostiene: +9.16, la mejor |
| P-cc | El plan del aislado al final del Cambio Central: enrocar sí; "caballo a e5" no | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" "O-O Ne5 Be3 h3"` | 0-0 empata con la mejor; 9.Ce5 pierde 93 y 622 |
| P-mod | Al final de la Moderna: 11.Cc3 la mejor; Ce5 no | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" "Nc3 Ne5"` | Ce5 pierde 78 y 40 |
| P-cc6 | Al final de 4...Cc6: sacar el alfil y enrocar; Ce5 no | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" "O-O-O Be2 Bd3 Bc4 Ne5"` | Ce5 pierde 55 y 80 |
| P-g6 | Al final de 4...g6: enrocar | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" "O-O Be3 Ne5"` | 0-0 la mejor o empata |
| P-cf6 | Al final de 2...Cf6: si negras cambia en e5, 9.Cxe5 (no 9.dxe5) | `node plan.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"` | Se sostiene: 9.Cxe5 +0.08; 9.dxe5 pierde 83 |
| P-gam | Al final del Gambito sigues con un peón de más, y Cf3 y 0-0 siguen | `node linea.mjs "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w (FIN)` | Se sostiene |
| V-cf6-dxe5 | "Ver": 8...dxe5 9.Cxe5 deja el peón de d4 sin peones al lado | `node plan.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"` | Se sostiene (chess.js: sin peones blancos en c ni e) |
| C-d6-nf6 | Los dos peones: contra 2...d6 3.d4 Cf6, defender e4 con 4.Ad3 | `node motor.mjs mejores "e4 c5 c3 d6 d4 Nf6" --prof 18 --n 3` | Se sostiene: la mejor (+0.57) |
| C-d6-nf6-e5 | Ahí, avanzar a e5 pierde | `node motor.mjs jugada "e4 c5 c3 d6 d4 Nf6" "e5" --prof 18` | Se sostiene: pierde 129 |
| C-d6x-nf6 | Con 3...cxd4 4.cxd4 Cf6, defender con 5.Cc3 | `node motor.mjs mejores "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" --prof 18 --n 3` | Se sostiene: la mejor (+0.92) |
| C-d6x-nf6-e5 | Ahí, 5.e5 pierde un peón y el enroque | `node motor.mjs jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" "e5" --prof 18` | Se sostiene: pierde 206 |
| C-nc6x-nf6-e5 | Con 2...Cc6 … 4...Cf6, 5.e5 pierde | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "e5" --prof 18` | Se sostiene: pierde 232 (5.Cc3 +0.45) |
| C-e6x-nf6-e5 | Con 2...e6 … 4...Cf6, 5.e5 pierde | `node motor.mjs jugada "e4 c5 c3 e6 d4 cxd4 cxd4 Nf6" "e5" --prof 18` | Se sostiene: pierde 54 (5.Cc3, la mejor) |
| C-nc6x-e6 | Los dos peones: Cf3 y Cc3 contra ...e6 | `node motor.mjs mejores "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6" --prof 18 --n 3` | Se sostiene: +0.37 y +0.35 |
| C-nc6x-g6-nf3 | Contra ...g6, Cf3 primero no pierde material | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6" "Nf3" --prof 18` | Se sostiene: +0.86 (pierde 119 contra 5.d5) |
| N-c-nc6-qb6-nc3 | Con ...Db6, 5.Cc3 pierde el peón de d4 | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nc3" --prof 18` | Se sostiene: pierde 223 (5...Dxd4) |
| N-c-nc6-qb6-nf3 | Con ...Db6, 5.Cf3 defiende d4 | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nf3" --prof 18` | Se sostiene: +1.52 |
| I-qxd5-be2 | El aislado: el alfil antes que Cf3 deja que la dama tome g2 | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5" "Be2" --prof 18` | Se sostiene: pierde 124 |
| I-cc-nc6-be2 | Tras 5...Cc6, el alfil antes que Cf3 deja que la dama tome d4 | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Be2" --prof 18` | Se sostiene: pierde 110 |
| N-mod-cxd4-bg4-be2 | La clavada sin ...Cc6: 7.Ae2 no pierde material | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 Bg4" "Be2" --prof 18` | Se sostiene: +0.30 (7.Cc3 +1.00) |
| N-cc-nf6-nf3-bg4-be2 | La clavada sin ...Cc6 (5...Cf6): 7.Ae2 no pierde material | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nf6 Nf3 Bg4" "Be2" --prof 18` | Se sostiene: +0.27 (7.Cc3 +0.90) |
| G-e6-nf3 | El gambito: tras 5...e6, sacar piezas (6.Cf3) pierde | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" "Nf3" --prof 18` | Se sostiene: pierde 208; 6.dxe6 y 6.Dxb7 sirven |
| K-nc6-nf6-bd3 | Gate 2: tras 2...Cc6 3.d4 Cf6, defender con 4.Ad3 pierde un peón (tapa a la dama) | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 Nf6" "Bd3" --prof 18` | Se sostiene: pierde 317 (cxd4 cxd4 Cxd4) |
| K-nc6-nf6-d5 | Ahí, con su caballo de dama en c6, 4.d5 contra él | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 Nf6" "d5" --prof 18` | Se sostiene: +2.71, a 8 de la mejor |
| K-nc6x-nf6-d5 | Con 3...cxd4 4.cxd4 Cf6, 5.d5 | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "d5" --prof 18` | Se sostiene: +2.38, a 9 |
| K-nc6x-e6-nf3-nf6-d5 | Con ...e6 y Cf3 jugados, 6.d5 no pierde material | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 Nf6" "d5" --prof 18` | Se sostiene: +0.50, a 41 (6.Cc3 +0.89) |
| K-nc6x-g6-nf3-nf6-d5 | Con ...g6, 6.d5 | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6 Nf3 Nf6" "d5" --prof 18` | Se sostiene: la mejor (+2.96) |
| K-nc6x-d6-nf3-nf6-d5 | Con ...d6, 6.d5 | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d6 Nf3 Nf6" "d5" --prof 18` | Se sostiene: la mejor (+0.78) |
| K-nc6x-e6-nc3-nf6-d5 | Con ...e6 y Cc3 jugados, 6.d5 | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nc3 Nf6" "d5" --prof 18` | Se sostiene: +1.30, a 8 |
| K-d6x-nf6-nc3-nc6-d5 | Por 2...d6, con su caballo de dama ya en c6, 6.d5 | `node motor.mjs jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 Nc6" "d5" --prof 18` | Se sostiene: la mejor (+1.37) |
| K-g6-bg7-nf3-nf6-bd3 | Sin su caballo de dama fuera (2...g6), defender con Ad3 no pierde material | `node motor.mjs jugada "e4 c5 c3 g6 d4 Bg7 Nf3 Nf6" "Bd3" --prof 18` | Se sostiene: +0.37 (5.e5 +1.74, la mejor): por eso el texto no dice "no lo avances" en general |
| K-nc6x-e5-nf3 | Contra ...e5, el caballo de rey primero | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nf3" --prof 18` | Se sostiene: 5.Cf3 +0.16 (pierde 52, sin material) |
| K-nc6x-e5-nc3 | Contra ...e5, el de dama primero entrega un peón | `node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nc3" --prof 18` | Se sostiene: 5.Cc3 pierde 97 (exd4 Cd5) |
| B-cc6-bg4-h3 | Plan de la base de 4...Cc6: "contra ...Ag4, h3" pierde un peón | `node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4" "h3" --prof 18` | Se sostiene: pierde 149; 6.Ae2 está a 5 de la mejor |
| B-stoltz-c4 | Plan de la base del Stoltz: contra ...c4, el alfil a c2 es la única buena | `node motor.mjs mejores "e4 c5 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 c4" --prof 18 --n 3` | Se sostiene: Ac2 +0.15; Aa4 −0.48; d4 −2.11 |

## Las salidas, tal cual

### R-d5

`node motor.mjs mejores "e4 c5 c3 d5" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.31  exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 e6
  -0.08  e5 Nc6 d4 Bf5 Nf3 e6 Bb5 Qb6
  -0.08  Bb5+ Bd7 Bxd7+ Qxd7 exd5 Qxd5 Nf3 Nf6
```

### R-d5-d4

`node motor.mjs jugada "e4 c5 c3 d5" "d4" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  d4:        -0.64  d4 dxe4 Nd2 Nf6 dxc5 g6 f3 exf3
  pierde 101 centipeones contra la mejor
```

### R-d5-e5

`node motor.mjs jugada "e4 c5 c3 d5" "e5" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  e5:        +0.02  e5 Nc6 d4 Bf5 Be2 e6 Nf3 cxd4
  pierde 35 centipeones contra la mejor
```

### R-d5-d3

`node motor.mjs jugada "e4 c5 c3 d5" "d3" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  d3:        -0.14  d3 Nc6 exd5 Qxd5 Nf3 e5 Be2 Nf6
  pierde 51 centipeones contra la mejor
```

### R-nf6

`node motor.mjs mejores "e4 c5 c3 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  +0.17  e5 Nd5 d4 cxd4 Nf3 Nc6 cxd4 d6
  -0.04  d3 Nc6 Nf3 g6 e5 Nd5 Qb3 e6
  -0.14  Qc2 e5 Nf3 d5 exd5 Qxd5 d4 exd4
```

### R-nf6-d4

`node motor.mjs jugada "e4 c5 c3 Nf6" "d4" --prof 18`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  mejor:     +0.18  e5 Nd5 d4 cxd4 cxd4 d6 Nf3 dxe5
  d4:        -0.70  d4 Nxe4 Nf3 e6 Bd3 d5 Nbd2 Nxd2
  pierde 88 centipeones contra la mejor
```

### R-nf6-d3

`node motor.mjs jugada "e4 c5 c3 Nf6" "d3" --prof 18`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  mejor:     +0.18  e5 Nd5 d4 cxd4 cxd4 d6 Nf3 dxe5
  d3:        -0.02  d3 e5 c4 Nc6 Nc3 a6 g3 b5
  pierde 20 centipeones contra la mejor
```

### R-nf6-bd3

`node motor.mjs jugada "e4 c5 c3 Nf6" "Bd3" --prof 18`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  mejor:     +0.18  e5 Nd5 d4 cxd4 cxd4 d6 Nf3 dxe5
  Bd3:       -0.22  Bd3 Nc6 Nf3 e5 c4 g6 Nc3 Bh6
  pierde 40 centipeones contra la mejor
```

### R-nc6

`node motor.mjs mejores "e4 c5 c3 Nc6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nc6
FEN: r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  +0.30  d4 d5 exd5 Qxd5 Nf3 Nf6 dxc5 Qxd1+
  +0.07  Nf3 Nf6 d4 cxd4 e5 Nd5 cxd4 d6
  +0.03  Bb5 Nf6 d3 e5 Nf3 Qc7 Bc4 Be7
```

### R-d6

`node motor.mjs mejores "e4 c5 c3 d6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d6
FEN: rnbqkbnr/pp2pppp/3p4/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.57  d4 Nf6 Bd3 g6 Nf3 Bg7 h3 O-O
  +0.22  Be2 Nf6 Bf3 g6 d4 Nc6 d5 Ne5
  +0.14  Bb5+ Bd7 Bxd7+ Qxd7 d4 Nf6 Qe2 Qe6
```

### R-e6

`node motor.mjs mejores "e4 c5 c3 e6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 e6
FEN: rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.28  d4 d5 e5 Nc6 Nf3 Bd7 Be2 Nge7
  +0.24  Nf3 Nf6 Bd3 d5 e5 Nfd7 Bc2 c4
  +0.08  Be2 d5 exd5 exd5 Nf3 Nc6 d4 Nf6
```

### R-g6

`node motor.mjs mejores "e4 c5 c3 g6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 g6
FEN: rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.48  d4 d5 dxc5 dxe4 Qxd8+ Kxd8 Na3 Nc6
  +0.44  Nf3 d5 e5 d4 cxd4 cxd4 Bb5+ Bd7
  +0.26  Bc4 e6 Nf3 d5 exd5 exd5 Bb5+ Bd7
```

### R-e5

`node motor.mjs mejores "e4 c5 c3 e5" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 e5
FEN: rnbqkbnr/pp1p1ppp/8/2p1p3/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.52  Nf3 Nc6 Bc4 Be7 d4 cxd4 cxd4 exd4
  +0.16  d4 exd4 Nf3 Nc6 Bc4 Nf6 cxd4 cxd4
  +0.15  Bc4 Nf6 Qb3 Qe7 Nf3 Nc6 Na3 a6
```

### M-2c3

`node linea.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w`

```
LÍNEA e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.e5: +0.18 (pierde 0) | top: e5 +0.18 · d3 -0.07 · Qc2 -0.15 · Qa4 -0.25 · Bd3 -0.26
4.d4: +0.25 (pierde 0) | top: d4 +0.25 · Bc4 +0.12 · Nf3 +0.11 · Na3 -0.12 · Bb5 -0.13
5.cxd4: +0.12 (pierde 0) | top: cxd4 +0.12 · Nf3 +0.06 · Bc4 -0.01 · Qxd4 -0.10 · Be2 -0.18
6.Nf3: +0.00 (pierde 20) | top: Bc4 +0.20 · Nf3 +0.00 · exd6 -0.07 · Qb3 -0.07 · Bb5+ -0.15
7.Bc4: +0.06 (pierde 0) | top: Bc4 +0.06 · Nc3 -0.03 · Bd2 -0.06 · Qb3 -0.12 · exd6 -0.13
8.Bb5: +0.03 (pierde 0) | top: Bb5 +0.03 · Bb3 -0.02 · Bd3 -0.28 · Be2 -0.31 · b3 -0.32
FIN (mueven negras):
      +0.10 dxe5 Nxe5 Bd7 Nxd7 Qxd7 O-O e6 Nc3
      +0.16 Bd7 Nc3 dxe5 dxe5 g6 O-O Bg7 Re1
      +0.35 e6 Qe2 a6 Bg5 Qc7 Bxc6+ bxc6 O-O
```

### M-d4

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.cxd4: +0.32 (pierde 0) | top: cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
6.Nf3: +0.28 (pierde 0) | top: Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
7.Nc3: +0.63 (pierde 0) | top: Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
FIN (mueven negras):
      +0.34 Bxf3 gxf3 Qxd4 Qxd4 Nxd4 Nb5 O-O-O Nxd4
      +1.97 Qh5 d5 Bxf3 gxf3 O-O-O Qa4 Ne5 Bg2
      +2.71 Qa5 d5 Rd8 Bd2 Rxd5 Nxd5 Qxd5 Be2
```

### M-cc-cxd4

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.cxd4: +0.32 (pierde 0) | top: cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
6.Nf3: +0.28 (pierde 0) | top: Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
7.Nc3: +0.63 (pierde 0) | top: Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
FIN (mueven negras):
      +0.34 Bxf3 gxf3 Qxd4 Qxd4 Nxd4 Nb5 O-O-O Nxd4
      +1.97 Qh5 d5 Bxf3 gxf3 O-O-O Qa4 Ne5 Bg2
      +2.71 Qa5 d5 Rd8 Bd2 Rxd5 Nxd5 Qxd5 Be2
```

### L-cc

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.cxd4: +0.32 (pierde 0) | top: cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
6.Nf3: +0.28 (pierde 0) | top: Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
7.Nc3: +0.63 (pierde 0) | top: Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
FIN (mueven negras):
      +0.34 Bxf3 gxf3 Qxd4 Qxd4 Nxd4 Nb5 O-O-O Nxd4
      +1.97 Qh5 d5 Bxf3 gxf3 O-O-O Qa4 Ne5 Bg2
      +2.71 Qa5 d5 Rd8 Bd2 Rxd5 Nxd5 Qxd5 Be2
```

### L-cc-be2

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.cxd4: +0.32 (pierde 0) | top: cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
6.Nf3: +0.28 (pierde 0) | top: Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
7.Be2: +0.35 (pierde 28) | top: Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
8.Nc3: +0.22 (pierde 0) | top: O-O +0.22 · Nc3 +0.22 · Be3 +0.08 · a3 +0.01 · Bf4 -0.06
FIN (mueven negras):
      +0.21 Qa5 h3 Bxf3 Bxf3 Bb4 O-O Nf6 Bd2
      +0.30 Bb4 O-O Qa5 Ne4 Nf6 Nxf6+ gxf6 h3
      +0.37 Qd7 O-O Rd8 Be3 Bd6 Ne5 Bxe5 dxe5
```

### L-mod

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.Nf3: +0.24 (pierde 0) | top: Nf3 +0.24 · dxc5 +0.10 · Na3 +0.08 · Be3 -0.07 · Ne2 -0.14
6.Be2: +0.27 (pierde 8) | top: Nbd2 +0.35 · dxc5 +0.28 · Be2 +0.27 · Be3 +0.10 · Bb5+ -0.09
7.h3: +0.17 (pierde 1) | top: O-O +0.18 · h3 +0.17 · Be3 +0.16 · Na3 +0.10 · Qa4+ +0.00
8.O-O: +0.13 (pierde 7) | top: Be3 +0.20 · Na3 +0.16 · c4 +0.14 · O-O +0.13 · a3 +0.05
9.Be3: +0.16 (pierde 0) | top: Be3 +0.16 · Bf4 +0.11 · Re1 +0.08 · Na3 +0.03 · Qa4 +0.00
10.cxd4: +0.07 (pierde 3) | top: Nxd4 +0.10 · cxd4 +0.07 · Bxd4 -0.15 · Bc1 -0.64 · Bf4 -0.95
FIN (mueven negras):
      +0.10 Be7 Nc3 Qd6 Qb3 O-O Rfd1 Rfd8 Rac1
      +0.19 Qa5 Nc3 Bd6 Qb3 Qb4 g4 Bg6 Ne5
      +0.21 Bd6 Nc3 Qa5 Qb3 Qb4 g4 Bg6 Ne5
```

### L-cc6

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.Nf3: +0.31 (pierde 0) | top: Nf3 +0.31 · dxc5 +0.28 · Be3 -0.09 · Ne2 -0.13 · Na3 -0.18
6.Be3: +0.16 (pierde 7) | top: dxc5 +0.23 · Be2 +0.21 · Be3 +0.16 · h3 -0.06 · Nbd2 -0.14
7.cxd4: +0.27 (pierde 0) | top: cxd4 +0.27 · Nxd4 -0.28 · Bxd4 -0.34 · Bd2 -2.27 · Bg5 -2.41
8.Nc3: +0.22 (pierde 0) | top: Nc3 +0.22 · a3 +0.20 · Bd3 +0.18 · Be2 +0.15 · Qd2 +0.04
FIN (mueven negras):
      +0.26 Qd6 Bc4 Be7 O-O O-O Re1 Rd8 Qe2
      +0.27 Qa5 a3 Bd6 Bd3 O-O O-O Qh5 h3
      +0.28 Bb4 Bd3 e5 Be2 exd4 Nxd4 O-O O-O
```

### L-g6

`node linea.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" w`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.d4: +0.33 (pierde 0) | top: d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
5.Nf3: +0.29 (pierde 0) | top: Nf3 +0.29 · Be2 +0.24 · dxc5 +0.22 · Na3 +0.13 · Be3 +0.10
6.Be2: +0.17 (pierde 6) | top: Nbd2 +0.23 · Na3 +0.22 · Be2 +0.17 · Be3 +0.14 · dxc5 +0.10
7.cxd4: +0.20 (pierde 5) | top: Na3 +0.25 · cxd4 +0.20 · O-O +0.18 · Be3 -0.09 · a4 -0.34
8.Nc3: +0.11 (pierde 0) | top: Nc3 +0.11 · O-O +0.11 · Be3 -0.13 · h3 -0.17 · Bf4 -0.19
FIN (mueven negras):
      +0.09 Qd6 Qb3 O-O O-O Qb6 Qxb6 axb6 Rd1
      +0.11 Qa5 O-O O-O Qb3 Qb6 Qxb6 axb6 Rd1
      +0.16 Qd8 Qb3 O-O O-O Qb6 Qxb6 axb6 Rd1
```

### L-gam

`node linea.mjs "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w`

```
LÍNEA e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.Qa4+: +0.56 (pierde 0) | top: Qa4+ +0.56 · Bb5+ +0.27 · Nf3 +0.21 · d4 +0.18 · Bc4 +0.12
5.Qb3: +0.41 (pierde 0) | top: Qb3 +0.41 · Bb5 -0.37 · Qd1 -0.38 · Qc4 -0.40 · Qc2 -0.52
6.dxe6: +0.45 (pierde 0) | top: dxe6 +0.45 · Qxb7 -0.01 · c4 -0.23 · d4 -0.74 · Nf3 -0.80
7.Bc4: +0.55 (pierde 0) | top: Bc4 +0.55 · Qxb7 +0.00 · Qd1 -0.08 · Qc2 -0.32 · Qa4+ -0.38
8.Qxc4: +0.34 (pierde 0) | top: Qxc4 +0.34 · Qxb7 -7.37 · Qa4+ -7.81 · d4 -7.87 · Qd1 -7.94
FIN (mueven negras):
      +0.42 Bd6 Nf3 O-O O-O Nc6 d3 Qd7 Nbd2
      +0.45 Nc6 Nf3 Be7 d4 cxd4 cxd4 Qd5 Qxd5
      +0.48 Be7 Nf3 Nc6 d4 cxd4 cxd4 Qd5 Qxd5
```

### L-cf6

`node linea.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w`

```
LÍNEA e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.e5: +0.18 (pierde 0) | top: e5 +0.18 · d3 -0.07 · Qc2 -0.15 · Qa4 -0.25 · Bd3 -0.26
4.d4: +0.25 (pierde 0) | top: d4 +0.25 · Bc4 +0.12 · Nf3 +0.11 · Na3 -0.12 · Bb5 -0.13
5.cxd4: +0.12 (pierde 0) | top: cxd4 +0.12 · Nf3 +0.06 · Bc4 -0.01 · Qxd4 -0.10 · Be2 -0.18
6.Nf3: +0.00 (pierde 20) | top: Bc4 +0.20 · Nf3 +0.00 · exd6 -0.07 · Qb3 -0.07 · Bb5+ -0.15
7.Bc4: +0.06 (pierde 0) | top: Bc4 +0.06 · Nc3 -0.03 · Bd2 -0.06 · Qb3 -0.12 · exd6 -0.13
8.Bb5: +0.03 (pierde 0) | top: Bb5 +0.03 · Bb3 -0.02 · Bd3 -0.28 · Be2 -0.31 · b3 -0.32
FIN (mueven negras):
      +0.10 dxe5 Nxe5 Bd7 Nxd7 Qxd7 O-O e6 Nc3
      +0.16 Bd7 Nc3 dxe5 dxe5 g6 O-O Bg7 Re1
      +0.35 e6 Qe2 a6 Bg5 Qc7 Bxc6+ bxc6 O-O
```

### F-gam

`node motor.mjs mejores "e4 c5 c3 d5 exd5 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6
FEN: rnbqkb1r/pp2pppp/5n2/2pP4/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +0.36  Qa4+ Nbd7 Qb3 g6 Nf3 Bg7 Be2 O-O
  +0.33  Bb5+ Nbd7 d4 a6 Be2 Nxd5 Nf3 e6
  +0.16  Nf3 Nxd5 d4 cxd4 Nxd4 e6 Nd2 Be7
```

### F-nf6-4

`node motor.mjs mejores "e4 c5 c3 Nf6 e5 Nd5" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5
FEN: rnbqkb1r/pp1ppppp/8/2pnP3/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +0.13  Nf3 Nc6 d4 cxd4 cxd4 d6 Bc4 Nb6
  +0.11  d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6
  -0.02  Bc4 Nb6 Be2 Nc6 Nf3 g6 a4 d6
```

### F-nf6d4

`node motor.mjs mejores "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4
FEN: rnbqkb1r/pp1ppppp/8/3nP3/3p4/2P5/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  +0.11  Bc4 Qc7 Qe2 Nb6 Bb3 d3 Qxd3 Qxe5+
  +0.07  cxd4 d6 Bc4 Nb6 Bb3 dxe5 Qh5 e6
  +0.03  Nf3 Nc6 cxd4 d6 Bc4 Nb6 Bb5 dxe5
```

### A-d5

`node motor.mjs amenaza "e4 c5 c3 d5" --prof 16`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: dxe4 Qa4+ Nc6 Qxe4 Nf6 Qc2  (-1.16)
  Con el turno normal: +0.35  exd5 Qxd5 d4 cxd4 cxd4 e5
```

### A-nf6

`node motor.mjs amenaza "e4 c5 c3 Nf6" --prof 16`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Nxe4 d4 d5 Nf3 e6 Nbd2  (-1.44)
  Con el turno normal: +0.16  e5 Nd5 d4 cxd4 Nf3 Nc6
```

### A-nf6-e5

`node motor.mjs amenaza "e4 c5 c3 Nf6 e5" --prof 16`

```
Posición tras: e4 c5 c3 Nf6 e5
FEN: rnbqkb1r/pp1ppppp/5n2/2p1P3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: exf6 Nc6 d4 cxd4 cxd4 d5  (+5.98)
  Con el turno normal: +0.11  Nd5 d4 cxd4 Nf3 Nc6 Bc4
```

### A-bg4

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4
FEN: r3kbnr/pp2pppp/2n5/3q4/3P2b1/5N2/PP3PPP/RNBQKB1R w KQkq - 3 7
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Bxf3 gxf3 Nxd4 Be2 O-O-O Be3  (-1.40)
  Con el turno normal: +0.44  Be2 e6 Nc3 Qd7 O-O Nf6
```

### A-mod-bg4

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4
FEN: rn2kb1r/pp2pppp/5n2/2pq4/3P2b1/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Bxf3 Qxf3 Qxf3 gxf3 cxd4 cxd4  (-0.45)
  Con el turno normal: +0.36  dxc5 Qxd1+ Kxd1 Nc6 Be2 e5
```

### A-h3

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3
FEN: rn2kb1r/pp3ppp/4pn2/2pq4/3P2b1/2P2N1P/PP2BPP1/RNBQK2R b KQkq - 0 7
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: hxg4 Nxg4 c4 Qd7 d5 exd5  (+6.77)
  Con el turno normal: +0.24  Bh5 O-O Nc6 Be3 cxd4 cxd4
```

### A-c3-nc3

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3
FEN: r3kbnr/pp3ppp/2n1p3/3q4/3P2b1/2N2N2/PP2BPPP/R1BQK2R b KQkq - 1 8
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Nxd5 exd5 Kf1 Be7 Be3 f5  (+7.54)
  Con el turno normal: +0.38  Qd7 O-O Bxf3 Bxf3 Nxd4 Bxb7
```

### A-cc6-nc3

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3
FEN: r1b1kb1r/pp3ppp/2n1pn2/3q4/3P4/2N1BN2/PP3PPP/R2QKB1R b KQkq - 1 8
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Nxd5 Nxd5 Bb5 Bb4+ Kf1 Bd7  (+6.79)
  Con el turno normal: +0.30  Qd8 Bd3 Be7 O-O O-O a3
```

### A-g6-nc3

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3
FEN: rnb1k2r/pp2ppbp/5np1/3q4/3P4/2N2N2/PP2BPPP/R1BQK2R b KQkq - 2 8
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Nxd5 Nxd5 Bb5+ Nc6 Bd2 O-O  (+6.86)
  Con el turno normal: +0.14  Qd6 O-O O-O Qb3 a6 Rd1
```

### A-d6

`node motor.mjs amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6" --prof 16`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6
FEN: rnbqkb1r/pp2pppp/3p4/3nP3/3P4/8/PP3PPP/RNBQKBNR w KQkq - 0 6
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: dxe5 dxe5 Nc6 Nf3 Bg4 h3  (-0.51)
  Con el turno normal: +0.30  Bc4 e6 Nf3 Be7 Qe2 dxe5
```

### A-nb6

`node motor.mjs amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6" --prof 16`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6
FEN: r1bqkb1r/pp2pppp/1nnp4/4P3/2BP4/5N2/PP3PPP/RNBQK2R w KQkq - 4 8
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Nxc4 exd6 e6 Nc3 Nxd6 O-O  (-5.26)
  Con el turno normal: +0.13  Bb5 dxe5 Nxe5 Bd7 Bxc6 Bxc6
```

### A-gam-bd7

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7
FEN: rn1qkb1r/pp1bpppp/5n2/2pP4/Q7/2P5/PP1P1PPP/RNB1KBNR w KQkq - 3 5
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Bxa4 b3 Bd7 Nf3 Nxd5 Ne5  (-8.51)
  Con el turno normal: +0.48  Qb3 Qb6 Bc4 Na6 Nf3 Nc7
```

### A-gam-b3

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3
FEN: rn1qkb1r/pp1bpppp/5n2/2pP4/8/1QP5/PP1P1PPP/RNB1KBNR b KQkq - 4 5
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Qxb7 Qb6 Qxa8 e6 Ba6 Bd6  (+3.54)
  Con el turno normal: +0.51  e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4
```

### A-gam-e6

`node motor.mjs amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6
FEN: rn1qkb1r/pp1b1ppp/4pn2/2pP4/8/1QP5/PP1P1PPP/RNB1KBNR w KQkq - 0 6
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: exd5 Nf3 Bd6 Be2 O-O O-O  (-1.73)
  Con el turno normal: +0.53  dxe6 Bxe6 Bc4 Bxc4 Qxc4 Bd6
```

### E-d4

`node motor.mjs jugada "e4 c5 c3 d5" "d4" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  d4:        -0.64  d4 dxe4 Nd2 Nf6 dxc5 g6 f3 exf3
  pierde 101 centipeones contra la mejor
```

### E-d4-b

`node motor.mjs mejores "e4 c5 c3 d5 d4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 d4
FEN: rnbqkbnr/pp2pppp/8/2pp4/3PP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3
Mueven: negras · profundidad 18
  -0.68  dxe4 dxc5 Qxd1+ Kxd1 Nf6 Nd2 Nc6 Bb5
  +0.14  cxd4 exd5 Qxd5 cxd4 e5 dxe5 Qxe5+ Be2
  +0.30  Nc6 exd5 Qxd5 Nf3 Nf6 Be2 cxd4 cxd4
```

### E-d4-c

`node motor.mjs mejores "e4 c5 c3 d5 d4 dxe4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 d4 dxe4
FEN: rnbqkbnr/pp2pppp/8/2p5/3Pp3/2P5/PP3PPP/RNBQKBNR w KQkq - 0 4
Mueven: blancas · profundidad 18
  -0.59  Nd2 Nf6 dxc5 g6 f3 exf3 Ngxf3 Bg7
  -0.65  dxc5 Qxd1+ Kxd1 Nf6 Nd2 Nc6 Bb5 Be6
  -0.75  Bb5+ Bd7 Bxd7+ Qxd7 dxc5 f5 Ne2 Qxd1+
```

### E-nc3

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Nc3" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6
FEN: r1b1kbnr/pp2pppp/2n5/3q4/3P4/8/PP3PPP/RNBQKBNR w KQkq - 1 6
Mueven: blancas · profundidad 18
  mejor:     +0.30  Nf3 Bg4 Be2 e6 Nc3 Qa5 O-O Nf6
  Nc3:       -0.33  Nc3 Qxd4 Qc2 Nf6 Nf3 Qg4 h3 Qg6
  pierde 63 centipeones contra la mejor
```

### E-nc3-b

`node motor.mjs mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3
FEN: r1b1kbnr/pp2pppp/2n5/3q4/3P4/2N5/PP3PPP/R1BQKBNR b KQkq - 2 6
Mueven: negras · profundidad 18
  -0.33  Qxd4 Qc2 Qe5+ Be3 Nf6 Nf3 Qa5 Bc4
  +1.84  Qd8 d5 Ne5 Qe2 Ng6 Qb5+ Qd7 Nf3
  +2.27  Qa5 d5 Ne5 Bf4 Nd7 Nf3 Ngf6 a3
```

### E-nc3-c

`node motor.mjs mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3 Qxd4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3 Qxd4
FEN: r1b1kbnr/pp2pppp/2n5/8/3q4/2N5/PP3PPP/R1BQKBNR w KQkq - 0 7
Mueven: blancas · profundidad 18
  -0.42  Qc2 Nf6 Nf3 Qd6 Be3 Bd7 Rd1 Qc7
  -0.45  Bd3 Qd8 Qe2 g6 Nf3 Bg7 h3 Nf6
  -0.76  Be3 Qxd1+ Rxd1 Bd7 Nf3 Nf6 g3 e5
```

### E-ne4

`node motor.mjs jugada "e4 c5 c3 Nf6 e5" "Ne4" --prof 18`

```
Posición tras: e4 c5 c3 Nf6 e5
FEN: rnbqkb1r/pp1ppppp/5n2/2p1P3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3
Mueven: negras · profundidad 18
  mejor:     +0.12  Nd5 d4 cxd4 Nf3 Nc6 Bc4 Nb6 Bb3
  Ne4:       +4.11  Ne4 d3 Nxf2 Kxf2 d6 Nf3 dxe5 Nxe5
  pierde 399 centipeones contra la mejor
```

### E-ne4-b

`node motor.mjs mejores "e4 c5 c3 Nf6 e5 Ne4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Ne4
FEN: rnbqkb1r/pp1ppppp/8/2p1P3/4n3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +4.34  d3 Nxf2 Kxf2 Nc6 Nf3 d6 Qe1 Bg4
  +2.62  h4 c4 Bxc4 d5 Bb5+ Bd7 Bxd7+ Qxd7
  +2.24  Nf3 f6 d3 Ng5 Nxg5 fxg5 Bxg5 Nc6
```

### E-ne4-c

`node motor.mjs mejores "e4 c5 c3 Nf6 e5 Ne4 d3" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Ne4 d3
FEN: rnbqkb1r/pp1ppppp/8/2p1P3/4n3/2PP4/PP3PPP/RNBQKBNR b KQkq - 0 4
Mueven: negras · profundidad 18
  +4.43  Nxf2 Kxf2 d6 Nf3 Nc6 Qe1 Bg4 exd6
  +4.87  Nxc3 Nxc3 d5 exd6 e5 g3 Nc6 Bg2
  +5.93  Nd6 exd6 e6 Bf4 Qb6 Qb3 Qc6 d4
```

### E-glot

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3" "Qxd4" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3
FEN: r3kbnr/pp2pppp/2n5/3q4/3P4/5B2/PP3PPP/RNBQK2R b KQkq - 0 8
Mueven: negras · profundidad 18
  mejor:     +1.64  Qd7 d5 Ne5 Be2 e6 f4 Ng6 Nc3
  Qxd4:      +9.77  Qxd4 Bxc6+ bxc6 Qxd4 e6 Nc3 Ne7 Qa4
  pierde 813 centipeones contra la mejor
```

### E-glot-b

`node motor.mjs mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3 Qxd4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3 Qxd4
FEN: r3kbnr/pp2pppp/2n5/8/3q4/5B2/PP3PPP/RNBQK2R w KQkq - 0 9
Mueven: blancas · profundidad 18
  +9.16  Bxc6+ bxc6 Qxd4 Rd8 Qa4 f5 Be3 e5
  +0.38  O-O Qxd1 Rxd1 Rd8 Rxd8+ Kxd8 Bxc6 bxc6
  +0.22  Qb3 Qb6 Qxb6 axb6 Be3 e6 Bxb6 Ra6
```

### P-cc

`node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" "O-O Ne5 Be3 h3"`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3
PLAN O-O Ne5 Be3 h3
Rival (3 mejores): Qa5 +0.21 · Bb4 +0.30 · Qd7 +0.37
— tras Qa5: mejor +0.25 O-O Nf6 h3 Bxf3 Bxf3 Be7
    O-O: +0.27 (pierde -2) O-O Nf6 h3 Bxf3 Bxf3 Rd8
    Ne5: -0.68 (pierde 93) Ne5 Bxe2 Kxe2 Qa6+ Ke1 Rd8
    Be3: +0.07 (pierde 18) Be3 Bb4 O-O Nge7 Qb3 Rd8
    h3: +0.25 (pierde 0) h3 Bxf3 Bxf3 Rd8 O-O Nf6
— tras Bb4: mejor +0.25 O-O Qa5 Ne4 Nf6 Nxf6+ gxf6
    O-O: +0.25 (pierde 0) O-O Qa5 h3 Bxf3 Bxf3 Nge7
    Ne5: -5.97 (pierde 622) Ne5 Bxe2 Qb3 Qxg2 Nxc6 Bh5
    Be3: +0.10 (pierde 15) Be3 Nge7 O-O Qa5 Qb3 O-O
    h3: -0.10 (pierde 35) h3 Bxf3 Bxf3 Qc4 Qb3 Qxb3
```

### P-mod

`node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" "Nc3 Ne5"`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4
PLAN Nc3 Ne5
Rival (3 mejores): Be7 +0.10 · Qa5 +0.19 · Bd6 +0.21
— tras Be7: mejor +0.10 Nc3 Qd6 Qb3 O-O Rfd1 Rfd8
    Nc3: +0.11 (pierde -1) Nc3 Qd6 Qb3 O-O Rfd1 Rfd8
    Ne5: -0.68 (pierde 78) Ne5 Bxe2 Qxe2 Nxe5 Nc3 Nf3+
— tras Qa5: mejor +0.24 Qb3 Qb4 Nc3 Bd6 g4 Bg6
    Nc3: +0.15 (pierde 9) Nc3 Bb4 Qb3 O-O Rac1 Rfd8
    Ne5: -0.16 (pierde 40) Ne5 Bxe2 Qxe2 Nxe5 Bd2 Nf3+
```

### P-cc6

`node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" "O-O-O Be2 Bd3 Bc4 Ne5"`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3
PLAN O-O-O Be2 Bd3 Bc4 Ne5
Rival (3 mejores): Qd6 +0.26 · Qa5 +0.27 · Bb4 +0.28
— tras Qd6: mejor +0.45 Bd3 Be7 O-O O-O Rc1 b6
    O-O-O: ilegal aquí
    Be2: +0.06 (pierde 39) Be2 Be7 Rc1 O-O O-O b6
    Bd3: +0.37 (pierde 8) Bd3 g6 Ne4 Nxe4 Bxe4 Bg7
    Bc4: +0.22 (pierde 23) Bc4 Be7 Rc1 a6 O-O O-O
    Ne5: -0.10 (pierde 55) Ne5 Nxe5 dxe5 Qxe5 Bb5+ Bd7
— tras Qa5: mejor +0.26 a3 Bd6 Bd3 O-O O-O Qh5
    O-O-O: ilegal aquí
    Be2: +0.15 (pierde 11) Be2 Bd6 O-O O-O Re1 h6
    Bd3: +0.15 (pierde 11) Bd3 Nb4 Bc4 Bd6 O-O O-O
    Bc4: +0.31 (pierde -5) Bc4 Bb4 Rc1 O-O O-O Rd8
    Ne5: -0.54 (pierde 80) Ne5 Bb4 Rc1 Bxc3+ bxc3 Nxe5
```

### P-g6

`node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" "O-O Be3 Ne5"`

```
LÍNEA e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3
PLAN O-O Be3 Ne5
Rival (3 mejores): Qd6 +0.09 · Qa5 +0.11 · Qd8 +0.16
— tras Qd6: mejor +0.13 O-O O-O Qb3 Na6 Bc4 Nc7
    O-O: +0.24 (pierde -11) O-O O-O Qb3 b6 Nb5 Qd8
    Be3: -0.01 (pierde 14) Be3 O-O O-O Be6 Qd2 Rd8
    Ne5: -0.10 (pierde 23) Ne5 Nc6 Nxc6 bxc6 Be3 Be6
— tras Qa5: mejor +0.07 O-O O-O Qb3 Qb6 Qxb6 axb6
    O-O: +0.20 (pierde -13) O-O O-O Ne5 Nc6 Nc4 Qc7
    Be3: -0.10 (pierde 17) Be3 Nc6 O-O O-O Qb3 Ng4
    Ne5: +0.28 (pierde -21) Ne5 O-O O-O Nc6 Nc4 Qf5
```

### P-cf6

`node plan.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"`

```
LÍNEA e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5
PLAN Nxe5 dxe5 O-O Nc3 exd6
Rival (3 mejores): dxe5 +0.10 · Bd7 +0.16 · e6 +0.35
— tras dxe5: mejor +0.06 Nxe5 Bd7 Bxc6 Bxc6 Nxc6 bxc6
    Nxe5: +0.08 (pierde -2) Nxe5 Bd7 Nc3 Nxe5 dxe5 Bxb5
    dxe5: -0.77 (pierde 83) dxe5 Qxd1+ Kxd1 g6 Nc3 Bg7
    O-O: -0.25 (pierde 31) O-O exd4 Nxd4 Bd7 Nc3 Nxd4
    Nc3: -0.27 (pierde 33) Nc3 exd4 Nxd4 Bd7 O-O Nxd4
    exd6: ilegal aquí
— tras Bd7: mejor +0.33 Nc3 dxe5 dxe5 g6 O-O Bg7
    Nxe5: ilegal aquí
    dxe5: ilegal aquí
    O-O: +0.04 (pierde 29) O-O Nxe5 Nxe5 dxe5 Bxd7+ Qxd7
    Nc3: +0.29 (pierde 4) Nc3 dxe5 dxe5 g6 Qe2 Bg7
    exd6: +0.17 (pierde 16) exd6 e6 Bg5 f6 Bd2 Bxd6
```

### P-gam

`node linea.mjs "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w (FIN)`

```
LÍNEA e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4 (lado w, prof 18)
1.e4: +0.32 (pierde 0) | top: e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
2.c3: +0.17 (pierde 21) | top: Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
3.exd5: +0.33 (pierde 0) | top: exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
4.Qa4+: +0.56 (pierde 0) | top: Qa4+ +0.56 · Bb5+ +0.27 · Nf3 +0.21 · d4 +0.18 · Bc4 +0.12
5.Qb3: +0.41 (pierde 0) | top: Qb3 +0.41 · Bb5 -0.37 · Qd1 -0.38 · Qc4 -0.40 · Qc2 -0.52
6.dxe6: +0.45 (pierde 0) | top: dxe6 +0.45 · Qxb7 -0.01 · c4 -0.23 · d4 -0.74 · Nf3 -0.80
7.Bc4: +0.55 (pierde 0) | top: Bc4 +0.55 · Qxb7 +0.00 · Qd1 -0.08 · Qc2 -0.32 · Qa4+ -0.38
8.Qxc4: +0.34 (pierde 0) | top: Qxc4 +0.34 · Qxb7 -7.37 · Qa4+ -7.81 · d4 -7.87 · Qd1 -7.94
FIN (mueven negras):
      +0.42 Bd6 Nf3 O-O O-O Nc6 d3 Qd7 Nbd2
      +0.45 Nc6 Nf3 Be7 d4 cxd4 cxd4 Qd5 Qxd5
      +0.48 Be7 Nf3 Nc6 d4 cxd4 cxd4 Qd5 Qxd5
```

### V-cf6-dxe5

`node plan.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"`

```
LÍNEA e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5
PLAN Nxe5 dxe5 O-O Nc3 exd6
Rival (3 mejores): dxe5 +0.10 · Bd7 +0.16 · e6 +0.35
— tras dxe5: mejor +0.06 Nxe5 Bd7 Bxc6 Bxc6 Nxc6 bxc6
    Nxe5: +0.08 (pierde -2) Nxe5 Bd7 Nc3 Nxe5 dxe5 Bxb5
    dxe5: -0.77 (pierde 83) dxe5 Qxd1+ Kxd1 g6 Nc3 Bg7
    O-O: -0.25 (pierde 31) O-O exd4 Nxd4 Bd7 Nc3 Nxd4
    Nc3: -0.27 (pierde 33) Nc3 exd4 Nxd4 Bd7 O-O Nxd4
    exd6: ilegal aquí
— tras Bd7: mejor +0.33 Nc3 dxe5 dxe5 g6 O-O Bg7
    Nxe5: ilegal aquí
    dxe5: ilegal aquí
    O-O: +0.04 (pierde 29) O-O Nxe5 Nxe5 dxe5 Bxd7+ Qxd7
    Nc3: +0.29 (pierde 4) Nc3 dxe5 dxe5 g6 Qe2 Bg7
    exd6: +0.17 (pierde 16) exd6 e6 Bg5 f6 Bd2 Bxd6
```

### C-d6-nf6

`node motor.mjs mejores "e4 c5 c3 d6 d4 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d6 d4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +0.57  Bd3 g6 Nf3 cxd4 cxd4 Bg7 O-O Bg4
  +0.35  Nd2 cxd4 cxd4 g6 Bd3 Bg7 Ne2 O-O
  +0.24  Qc2 g6 dxc5 d5 Nd2 Bg7 Bb5+ Bd7
```

### C-d6-nf6-e5

`node motor.mjs jugada "e4 c5 c3 d6 d4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 d6 d4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  mejor:     +0.55  Bd3 g6 Nf3 Bg7 O-O O-O h3 cxd4
  e5:        -0.74  e5 dxe5 dxc5 Qxd1+ Kxd1 g6 Nf3 Nbd7
  pierde 129 centipeones contra la mejor
```

### C-d6x-nf6

`node motor.mjs mejores "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d6 d4 cxd4 cxd4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  +0.92  Nc3 g6 Bb5+ Bd7 Be2 Qa5 Bd2 Bg7
  +0.61  Bd3 g6 Nc3 Bg7 h3 e5 Nge2 exd4
  +0.45  f3 e5 Ne2 Be7 Nbc3 h5 Be3 O-O
```

### C-d6x-nf6-e5

`node motor.mjs jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 d6 d4 cxd4 cxd4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +0.85  Nc3 g6 Be3 Bg7 Bb5+ Bd7 e5 Ng8
  e5:        -1.21  e5 dxe5 dxe5 Qxd1+ Kxd1 Ng4 Ke1 Nxe5
  pierde 206 centipeones contra la mejor
```

### C-nc6x-nf6-e5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.47  d5 Ne5 f4 Neg4 Nc3 Qb6 Qe2 e6
  e5:        +0.15  e5 Nd5 Nc3 e6 Nf3 d6 Bd2 Be7
  pierde 232 centipeones contra la mejor
```

### C-e6x-nf6-e5

`node motor.mjs jugada "e4 c5 c3 e6 d4 cxd4 cxd4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 e6 d4 cxd4 cxd4 Nf6
FEN: rnbqkb1r/pp1p1ppp/4pn2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +0.97  Nc3 Be7 Bd3 d6 Nf3 O-O h3 Nc6
  e5:        +0.43  e5 Nd5 Nf3 Bb4+ Bd2 O-O Bc4 Bxd2+
  pierde 54 centipeones contra la mejor
```

### C-nc6x-e6

`node motor.mjs mejores "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e6
FEN: r1bqkbnr/pp1p1ppp/2n1p3/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  +0.44  d5 exd5 exd5 Bb4+ Nc3 Qe7+ Be2 Ne5
  +0.37  Nf3 d5 e5 Nge7 Nc3 Nf5 Bb5 Bd7
  +0.35  Nc3 d5 e5 Nge7 Nf3 Nf5 Bb5 Bd7
```

### C-nc6x-g6-nf3

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 g6
FEN: r1bqkbnr/pp1ppp1p/2n3p1/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  mejor:     +2.05  d5 Nb4 Nc3 Bg7 Nf3 Na6 d6 Qb6
  Nf3:       +0.86  Nf3 Bg7 h3 d6 Be3 Nf6 d5 Ne5
  pierde 119 centipeones contra la mejor
```

### N-c-nc6-qb6-nc3

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nc3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6
FEN: r1b1kbnr/pp1ppppp/1qn5/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.32  d5 Na5 Be3 Qxb2 Bd4 Qb4+ Nc3 e5
  Nc3:       +0.09  Nc3 Qxd4 Qc2 Qd6 Be3 e6 f4 a6
  pierde 223 centipeones contra la mejor
```

### N-c-nc6-qb6-nf3

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6
FEN: r1b1kbnr/pp1ppppp/1qn5/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.32  d5 Na5 Be3 Qxb2 Bd4 Qb4+ Nc3 e5
  Nf3:       +1.52  Nf3 e6 Nc3 Bb4 a3 Bxc3+ bxc3 Nf6
  pierde 80 centipeones contra la mejor
```

### I-qxd5-be2

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5
FEN: rnb1kbnr/pp2pppp/8/2pq4/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 4
Mueven: blancas · profundidad 18
  mejor:     +0.31  d4 Nf6 Nf3 e6 Bd3 Be7 O-O O-O
  Be2:       -0.93  Be2 Qxg2 Bf3 Qg6 d4 cxd4 cxd4 Nc6
  pierde 124 centipeones contra la mejor
```

### I-cc-nc6-be2

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6
FEN: r1b1kbnr/pp2pppp/2n5/3q4/3P4/8/PP3PPP/RNBQKBNR w KQkq - 1 6
Mueven: blancas · profundidad 18
  mejor:     +0.30  Nf3 Bg4 Be2 e6 Nc3 Qa5 O-O Nf6
  Be2:       -0.80  Be2 Qxd4 Nd2 Qd8 Ngf3 g6 O-O Nf6
  pierde 110 centipeones contra la mejor
```

### N-mod-cxd4-bg4-be2

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 Bg4" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 Bg4
FEN: rn2kb1r/pp2pppp/5n2/3q4/3P2b1/5N2/PP3PPP/RNBQKB1R w KQkq - 1 7
Mueven: blancas · profundidad 18
  mejor:     +1.00  Nc3 Bxf3 gxf3 Qa5 Qb3 Nbd7 Qxb7 Rb8
  Be2:       +0.30  Be2 e6 Nc3 Qa5 Qb3 Bb4 O-O O-O
  pierde 70 centipeones contra la mejor
```

### N-cc-nf6-nf3-bg4-be2

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nf6 Nf3 Bg4" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nf6 Nf3 Bg4
FEN: rn2kb1r/pp2pppp/5n2/3q4/3P2b1/5N2/PP3PPP/RNBQKB1R w KQkq - 3 7
Mueven: blancas · profundidad 18
  mejor:     +0.90  Nc3 Bxf3 gxf3 Qd6 Qb3 Qb6 Bb5+ Nbd7
  Be2:       +0.27  Be2 e6 Nc3 Qa5 Qb3 Bb4 h3 Bxf3
  pierde 63 centipeones contra la mejor
```

### G-e6-nf3

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6
FEN: rn1qkb1r/pp1b1ppp/4pn2/2pP4/8/1QP5/PP1P1PPP/RNB1KBNR w KQkq - 0 6
Mueven: blancas · profundidad 18
  mejor:     +1.36  Qxb7 exd5 Qxa8 Bd6 Qb7 O-O Be2
  Nf3:       -0.72  Nf3 exd5 d4 Bd6 Be2 O-O dxc5 Bxc5
  pierde 208 centipeones contra la mejor
```

### K-nc6-nf6-bd3

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 Nf6" "Bd3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  mejor:     +2.79  d5 Nb8 e5 Ng8 Nf3 g6 d6 Nc6
  Bd3:       -0.38  Bd3 cxd4 cxd4 Nxd4 Nc3 e5 Nf3 Nxf3+
  pierde 317 centipeones contra la mejor
```

### K-nc6-nf6-d5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  mejor:     +2.79  d5 Nb8 e5 Ng8 Nf3 g6 d6 Nc6
  d5:        +2.71  d5 Nb8 e5 Ng8 Nf3 a6 Bc4 d6
  pierde 8 centipeones contra la mejor
```

### K-nc6x-nf6-d5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.47  d5 Ne5 f4 Neg4 Nc3 Qb6 Qe2 e6
  d5:        +2.38  d5 Ne5 f4 Neg4 Nc3 b5 e5 b4
  pierde 9 centipeones contra la mejor
```

### K-nc6x-e6-nf3-nf6-d5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 Nf6
FEN: r1bqkb1r/pp1p1ppp/2n1pn2/8/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +0.91  Nc3 d5 e5 Ne4 Bd3 Bb4 Qc2 Qa5
  d5:        +0.50  d5 Bb4+ Nc3 exd5 exd5 Ne7 d6 Ned5
  pierde 41 centipeones contra la mejor
```

### K-nc6x-g6-nf3-nf6-d5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6 Nf3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 g6 Nf3 Nf6
FEN: r1bqkb1r/pp1ppp1p/2n2np1/8/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +2.90  d5 Nb4 Nc3 Qa5 Nd2 Qc5 Be2 Na6
  d5:        +2.96  d5 Nb4 Nc3 Bg7 Qa4 a5 a3 Nxe4
  pierde -6 centipeones contra la mejor
```

### K-nc6x-d6-nf3-nf6-d5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d6 Nf3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 d6 Nf3 Nf6
FEN: r1bqkb1r/pp2pppp/2np1n2/8/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +0.89  Nc3 d5 e5 Ne4 Be2 e6 O-O h6
  d5:        +0.78  d5 Ne5 Nxe5 dxe5 Nc3 Bd7 Qb3 e6
  pierde 11 centipeones contra la mejor
```

### K-nc6x-e6-nc3-nf6-d5

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nc3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nc3 Nf6
FEN: r1bqkb1r/pp1p1ppp/2n1pn2/8/3PP3/2N5/PP3PPP/R1BQKBNR w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +1.38  d5 Nb8 Bg5 h6 Bh4 d6 Bb5+ Bd7
  d5:        +1.30  d5 Nb8 Bg5 h6 Bh4 d6 Bb5+ Bd7
  pierde 8 centipeones contra la mejor
```

### K-d6x-nf6-nc3-nc6-d5

`node motor.mjs jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 Nc6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 Nc6
FEN: r1bqkb1r/pp2pppp/2np1n2/8/3PP3/2N5/PP3PPP/R1BQKBNR w KQkq - 3 6
Mueven: blancas · profundidad 18
  mejor:     +1.28  d5 Nb8 h3 e6 Nf3 Be7 Bd3 O-O
  d5:        +1.37  d5 Nb8 Nf3 g6 h3 Bg7 Bc4 O-O
  pierde -9 centipeones contra la mejor
```

### K-g6-bg7-nf3-nf6-bd3

`node motor.mjs jugada "e4 c5 c3 g6 d4 Bg7 Nf3 Nf6" "Bd3" --prof 18`

```
Posición tras: e4 c5 c3 g6 d4 Bg7 Nf3 Nf6
FEN: rnbqk2r/pp1pppbp/5np1/2p5/3PP3/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 5
Mueven: blancas · profundidad 18
  mejor:     +1.62  e5 Nd5 dxc5 Nc7 Na3 b6 cxb6 axb6
  Bd3:       +0.37  Bd3 d5 e5 Ne4 O-O Nc6 Re1 Bf5
  pierde 125 centipeones contra la mejor
```

### K-nc6x-e5-nf3

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e5
FEN: r1bqkbnr/pp1p1ppp/2n5/4p3/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  mejor:     +0.68  d5 Nd4 Nf3 Nxf3+ Qxf3 Nf6 Be3 Bb4+
  Nf3:       +0.16  Nf3 exd4 Nxd4 Nf6 Nc3 Bb4 Nxc6 bxc6
  pierde 52 centipeones contra la mejor
```

### K-nc6x-e5-nc3

`node motor.mjs jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nc3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e5
FEN: r1bqkbnr/pp1p1ppp/2n5/4p3/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  mejor:     +0.68  d5 Nd4 Nf3 Nxf3+ Qxf3 Nf6 Be3 Bb4+
  Nc3:       -0.29  Nc3 exd4 Nd5 Nf6 Bc4 Nxd5 Bxd5 Nb4
  pierde 97 centipeones contra la mejor
```

### B-cc6-bg4-h3

`node motor.mjs jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4" "h3" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4
FEN: r3kbnr/pp2pppp/2n5/2pq4/3P2b1/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6
Mueven: blancas · profundidad 18
  mejor:     +0.32  Be2 cxd4 cxd4 e6 Nc3 Qa5 d5 exd5
  h3:        -1.17  h3 Bxf3 Qxf3 Qxf3 gxf3 cxd4 Bb5 e5
  pierde 149 centipeones contra la mejor
```

### B-stoltz-c4

`node motor.mjs mejores "e4 c5 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 c4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 c4
FEN: r1bqkb1r/pp1ppppp/1nn5/4P3/2p5/1BP2N2/PP1P1PPP/RNBQK2R w KQkq - 0 7
Mueven: blancas · profundidad 18
  +0.15  Bc2 d6 exd6 Qxd6 O-O g6 Na3 Bg7
  -0.48  Ba4 Nxa4 Qxa4 Qa5 Qxc4 Nxe5 Nxe5 Qxe5+
  -2.11  d4 cxb3 d5 bxa2 Na3 g6 Rxa2 Bg7
```

## El plan en cada posición de sus lecciones (notas 5 y 7)

Stockfish 19 lite, un hilo, profundidad 16. "pierde" = centipeones contra la mejor de blancas en esa posición. ⚠ = 50 o más.

## cambio-central (aislado)

- tras e4 c5 c3 d5 exd5 Qxd5 d4 **cxd4** [partidas (3)] · mejor cxd4 +0.29 · cxd4 +0.35 (pierde -6)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 **e5** [motor] · mejor Nf3 +0.33 · Nc3 +0.06 (pierde 27)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 **Nc6** [motor] · mejor Nf3 +0.29 · Nc3 -0.30 (pierde 59) ⚠
- tras e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 **Bg4** [motor] · mejor Be2 +0.44 · Nc3 +0.29 (pierde 15)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 **e5** [motor] · mejor Nc3 +0.54 · Nc3 +0.55 (pierde -1)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 **e6** [motor] · mejor Nc3 +0.39 · Nc3 +0.31 (pierde 8) · O-O +0.31 (pierde 8)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 **Nf6** [motor] · mejor Nc3 +0.28 · Nc3 +0.36 (pierde -8) · O-O +0.35 (pierde -7)

## moderna (aislado)

- tras e4 c5 c3 d5 exd5 Qxd5 d4 **cxd4** [partidas (3)] · mejor cxd4 +0.29 · cxd4 +0.35 (pierde -6)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 **e6** [motor] · mejor Be3 +0.20 · O-O +0.31 (pierde -11)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 **cxd4** [motor] · mejor cxd4 +0.35 · cxd4 +0.44 (pierde -9) · O-O +0.12 (pierde 23)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 **Bh5** [motor] · mejor O-O +0.28 · O-O +0.29 (pierde -1)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 **Bf5** [motor] · mejor Na3 +0.67 · O-O +0.59 (pierde 8)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 **cxd4** [motor] · mejor cxd4 +0.31 · cxd4 +0.26 (pierde 5)

## cc6 (aislado)

- tras e4 c5 c3 d5 exd5 Qxd5 d4 **cxd4** [partidas (3)] · mejor cxd4 +0.29 · cxd4 +0.35 (pierde -6)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 **cxd4** [motor] · mejor cxd4 +0.28 · cxd4 +0.29 (pierde -1)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 **e6** [motor] · mejor Nc3 +0.30 · Nc3 +0.33 (pierde -3)

## g6 (aislado)

- tras e4 c5 c3 d5 exd5 Qxd5 d4 **cxd4** [partidas (3)] · mejor cxd4 +0.29 · cxd4 +0.35 (pierde -6)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 **cxd4** [motor] · mejor cxd4 +0.24 · cxd4 +0.23 (pierde 1) · O-O +0.15 (pierde 9)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 **Nf6** [motor] · mejor c4 +0.28 · O-O +0.14 (pierde 14)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 **Qd6** [motor] · mejor Nc3 +0.17 · O-O +0.18 (pierde -1)
- tras e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 **Nf6** [motor] · mejor Nc3 +0.18 · Nc3 +0.24 (pierde -6) · O-O +0.21 (pierde -3)

## gambito (gambito)

- tras e4 c5 c3 **Nc6** [partidas (248)] · mejor d4 +0.35 · Nf3 +0.25 (pierde 10)
- tras e4 c5 c3 **d6** [partidas (92)] · mejor d4 +0.62 · Nf3 +0.13 (pierde 49)
- tras e4 c5 c3 **d5** [la lección] · mejor exd5 +0.35 · Nf3 -0.21 (pierde 56) ⚠
- tras e4 c5 c3 d5 exd5 **Qxd5** [partidas (15)] · mejor d4 +0.31 · Nf3 +0.18 (pierde 13)
- tras e4 c5 c3 d5 exd5 **Nf6** [motor] · mejor Qa4+ +0.54 · Nf3 +0.14 (pierde 40)
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ **Bd7** [motor] · mejor Qb3 +0.48 · Nf3 -8.18 (pierde 866) ⚠
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ **Nbd7** [motor] · mejor c4 +0.41 · Nf3 +0.20 (pierde 21)
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ **Qd7** [libro] · mejor Bb5 +5.95 · Nf3 -7.14 (pierde 1309) ⚠
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 **e6** [motor] · mejor dxe6 +0.53 · Nf3 -0.64 (pierde 117) ⚠
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 **Qb6** [motor] · mejor Bc4 +0.48 · Nf3 +0.39 (pierde 9)
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 **Bxe6** [motor] · mejor Bc4 +0.48 · Nf3 -6.60 (pierde 708) ⚠
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 **fxe6** [motor] · mejor Nf3 +1.05 · Nf3 +1.08 (pierde -3)
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 **Bxc4** [motor] · mejor Qxc4 +0.38 · Nf3 mate en 4 para negras (pierde 100038) ⚠
- tras e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 **Bd5** [motor] · mejor Nf3 +0.88 · Nf3 +0.95 (pierde -7)

## cf6-d4 (cadena)

- tras e4 c5 c3 **Nc6** [partidas (248)] · mejor d4 +0.35 · Nf3 +0.25 (pierde 10) · Bc4 -0.19 (pierde 54) ⚠
- tras e4 c5 c3 **d6** [partidas (92)] · mejor d4 +0.62 · Nf3 +0.13 (pierde 49) · Bc4 +0.05 (pierde 57) ⚠
- tras e4 c5 c3 **Nf6** [la lección] · mejor e5 +0.16 · Nf3 -0.90 (pierde 106) ⚠ · Bc4 -1.32 (pierde 148) ⚠
- tras e4 c5 c3 Nf6 e5 **Nd5** [partidas (5)] · mejor Nf3 +0.17 · Nf3 +0.17 (pierde 0) · Bc4 +0.06 (pierde 11)
- tras e4 c5 c3 Nf6 e5 **Ng8** [motor] · mejor d4 +1.02 · Nf3 +0.67 (pierde 35) · Bc4 +0.24 (pierde 78) ⚠
- tras e4 c5 c3 Nf6 e5 Nd5 d4 **cxd4** [motor] · mejor Bc4 +0.09 · Nf3 +0.14 (pierde -5) · Bc4 +0.09 (pierde 0)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 **d6** [motor] · mejor Nf3 +0.13 · Nf3 +0.13 (pierde 0) · Bc4 +0.03 (pierde 10)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 **e6** [libro] · mejor dxc5 +0.51 · Nf3 +0.18 (pierde 33) · Bc4 +0.28 (pierde 23)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 **d6** [motor] · mejor Bc4 +0.30 · Nf3 +0.11 (pierde 19) · Bc4 +0.32 (pierde -2)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 **e6** [motor] · mejor Nc3 +0.23 · Nf3 +0.29 (pierde -6) · Bc4 +0.39 (pierde -16)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 **Nc6** [libro] · mejor Nc3 +0.19 · Nf3 +0.17 (pierde 2) · Bc4 +0.32 (pierde -13)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 **Nc6** [motor] · mejor Bc4 +0.16 · Bc4 +0.12 (pierde 4)
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 **dxe5** [motor] · mejor dxe5 +0.20 · Nxe5 +0.05 (pierde 15) · Bc4 -0.43 (pierde 63) ⚠
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 **Nb6** [motor] · mejor Bb5 +0.13 · O-O -3.09 (pierde 322) ⚠
- tras e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 **dxe5** [motor] · mejor dxe5 +0.25 · Nxe5 +0.08 (pierde 17) · O-O -0.48 (pierde 73) ⚠

