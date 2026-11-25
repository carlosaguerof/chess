# Las comprobaciones con el motor del curso de la Alapin (2026-11-25)

Stockfish 19 lite de un hilo (el del repo), profundidad 18 (16 para las amenazas y para la tabla del plan en cada posición). Evaluaciones desde blancas. Cada comando se repite desde el repo con `scripts/motor-comprobar.ts` (modos `mejores`, `jugada`, `amenaza`, `linea` y `plan`), el mismo Stockfish de la app. Las salidas de abajo son las de la corrida (con la Air cargada, una corrida por posición: a otra profundidad o en otra máquina las cifras pueden moverse unos centipeones). Cada id es el que cita el curso en su campo `motor`.

| id | Afirmación | Comando | Resultado |
|---|---|---|---|
| R-d5 | Contra 2...d5, 3.exd5 es la mejor (la regla del mapa) | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5" --prof 18 --n 3` | Se sostiene: +0.31, la mejor |
| R-d5-d4 | Defender e4 con 3.d4 sale peor | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d4" --prof 18` | Se sostiene: pierde 101 (−0.64) |
| R-d5-e5 | 3.e5 es peor que cambiar | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "e5" --prof 18` | Se sostiene: pierde 35 |
| R-d5-d3 | 3.d3 es peor que cambiar | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d3" --prof 18` | Se sostiene: pierde 51 |
| R-nf6 | Contra 2...Cf6, 3.e5 es la mejor (la regla del mapa) | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6" --prof 18 --n 3` | Se sostiene: +0.17, la mejor |
| R-nf6-d4 | Si no atiendes e4 (3.d4), el caballo lo toma | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6" "d4" --prof 18` | Se sostiene: 3.d4 Cxe4, pierde 88 |
| R-nf6-d3 | 3.d3 es peor que avanzar | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6" "d3" --prof 18` | Se sostiene: pierde 20 |
| R-nf6-bd3 | 3.Ad3 es peor que avanzar | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6" "Bd3" --prof 18` | Se sostiene: pierde 40 |
| R-nc6 | Contra 2...Cc6, 3.d4 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nc6" --prof 18 --n 3` | Se sostiene: +0.30, la mejor |
| R-d6 | Contra 2...d6, 3.d4 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d6" --prof 18 --n 3` | Se sostiene: +0.57, la mejor |
| R-e6 | Contra 2...e6, 3.d4 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 e6" --prof 18 --n 3` | Se sostiene: +0.28, la mejor |
| R-g6 | Contra 2...g6, 3.d4 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 g6" --prof 18 --n 3` | Se sostiene: +0.48, la mejor |
| R-e5 | Contra 2...e5, la regla no se aplica (por eso no se dice "lo demás") | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 e5" --prof 18 --n 3` | 3.Cf3 +0.52; 3.d4 +0.16 |
| M-2c3 | 2.c3 está a 0.21 de la mejor de la posición (lo que permite validar-base) | `node scripts/motor-comprobar.ts linea "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w` | Se sostiene |
| M-d4 | 4.d4 es la mejor tras 3...Dxd5 | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w` | Se sostiene: +0.33 |
| M-cc-cxd4 | 5.cxd4 es la mejor tras 4...cxd4 | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w` | Se sostiene: +0.32 |
| L-cc | El Cambio Central con 7.Cc3 (la mejor): la única buena de negras es 7...Axf3 8.gxf3 Dxd4, y el aislado se deshace | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w` | Se sostiene: 7...Axf3 +0.34; las demás, +1.97 y más |
| L-cc-be2 | 7.Ae2 pierde 28 contra 7.Cc3, y 8.Cc3 es la mejor (empata con 0-0) | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" w` | Se sostiene |
| L-mod | Cada jugada blanca de la Línea Moderna a 0.08 o menos de la mejor | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" w` | Se sostiene |
| L-cc6 | Cada jugada blanca de 4...Cc6 a 0.07 o menos de la mejor | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" w` | Se sostiene |
| L-g6 | Cada jugada blanca de 4...g6 a 0.06 o menos de la mejor | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" w` | Se sostiene |
| L-gam | Cada jugada blanca del Gambito es la mejor | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w` | Se sostiene |
| L-cf6 | Cada jugada blanca de 2...Cf6 a 0.20 o menos de la mejor | `node scripts/motor-comprobar.ts linea "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w` | Se sostiene |
| F-gam | Contra el gambito, 4.Da4+ es la mejor (4.Ab5+ a 0.29) | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Nf6" --prof 18 --n 3` | Se sostiene |
| F-nf6-4 | 4.d4 y 4.Cf3 casi empatan (Stoltz y Heidenfeld van por 4.Cf3) | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Nd5" --prof 18 --n 3` | Se sostiene: +0.11 y +0.13 |
| F-nf6d4 | Tras 4...cxd4, 5.cxd4 está a 0.04 de la mejor | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4" --prof 18 --n 3` | Se sostiene |
| A-d5 | 2...d5 amenaza ...dxe4 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5" --prof 16` | Se sostiene: si negras jugara otra vez, dxe4 (−1.16) |
| A-nf6 | 2...Cf6 amenaza ...Cxe4 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6" --prof 16` | Se sostiene: −1.44 |
| A-nf6-e5 | 3.e5 ataca al caballo: tiene que moverse | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6 e5" --prof 16` | Se sostiene: si blancas jugara otra vez, exf6 (+5.98) |
| A-bg4 | 6...Ag4 amenaza cambiar en f3 y ganar d4 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4" --prof 16` | Se sostiene: Axf3 gxf3 Cxd4 (−1.40) |
| A-mod-bg4 | 5...Ag4 clava el caballo | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4" --prof 16` | Amenaza Axf3 (−0.45) |
| A-h3 | 7.h3 ataca al alfil | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3" --prof 16` | Se sostiene: hxg4 (+6.77) |
| A-c3-nc3 | 8.Cc3 ataca la dama (Cambio Central) | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" --prof 16` | Se sostiene: Cxd5 (+7.54) |
| A-cc6-nc3 | 8.Cc3 ataca la dama (4...Cc6) | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" --prof 16` | Se sostiene: Cxd5 (+6.79) |
| A-g6-nc3 | 8.Cc3 ataca la dama (4...g6) | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" --prof 16` | Se sostiene: Cxd5 (+6.86) |
| A-d6 | 5...d6 ataca la punta de la cadena | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6" --prof 16` | Amenaza dxe5 |
| A-nb6 | 7...Cb6 ataca el alfil de c4 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6" --prof 16` | Se sostiene: Cxc4 (−5.26) |
| A-gam-bd7 | 4...Ad7 ataca la dama de a4 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7" --prof 16` | Se sostiene: Axa4 (−8.51) |
| A-gam-b3 | 5.Db3 ataca b7 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3" --prof 16` | Se sostiene: Dxb7 (+3.54) |
| A-gam-e6 | 5...e6 ataca otra vez d5 | `node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" --prof 16` | Se sostiene: exd5 (−1.73) |
| E-d4 | «¿Y si…?» 3.d4 contra 2...d5: error tuyo | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d4" --prof 18` | Se sostiene: pierde 101 |
| E-d4-b | Lo castiga 3...dxe4 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 d4" --prof 18 --n 3` | Se sostiene: la mejor (−0.68) |
| E-d4-c | Tras 3...dxe4, 4.dxc5 Dxd1+ 5.Rxd1: el rey blanco ya no enroca | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 d4 dxe4" --prof 18 --n 3` | Se sostiene: −0.65 |
| E-nc3 | «¿Y si…?» 6.Cc3 antes que Cf3: pierde d4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Nc3" --prof 18` | Se sostiene: pierde 63; 6...Dxd4 |
| E-nc3-b | Lo castiga 6...Dxd4 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3" --prof 18 --n 3` | Se sostiene: la mejor (−0.33); las demás, +1.84 y más |
| E-nc3-c | Tras 6...Dxd4, negras sigue con el peón de más | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3 Qxd4" --prof 18 --n 3` | Se sostiene: −0.42 |
| E-ne4 | «¿Y si…?» 3...Ce4: error del rival | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6 e5" "Ne4" --prof 18` | Se sostiene: pierde 399 |
| E-ne4-b | Lo castiga 4.d3 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Ne4" --prof 18 --n 3` | Se sostiene: la mejor (+4.34) |
| E-ne4-c | Tras 4.d3, el caballo se pierde: 4...Cxf2 5.Rxf2 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Ne4 d3" --prof 18 --n 3` | Se sostiene: +4.43 |
| E-glot | «¿Y si…?» 8...Dxd4: la dama glotona | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3" "Qxd4" --prof 18` | Se sostiene: pierde 813 |
| E-glot-b | Lo castiga 9.Axc6+ | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3 Qxd4" --prof 18 --n 3` | Se sostiene: +9.16, la mejor |
| P-cc | El plan del aislado al final del Cambio Central: enrocar sí; "caballo a e5" no | `node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" "O-O Ne5 Be3 h3"` | 0-0 empata con la mejor; 9.Ce5 pierde 93 y 622 |
| P-mod | Al final de la Moderna: 11.Cc3 la mejor; Ce5 no | `node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" "Nc3 Ne5"` | Ce5 pierde 78 y 40 |
| P-cc6 | Al final de 4...Cc6: sacar el alfil y enrocar; Ce5 no | `node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" "O-O-O Be2 Bd3 Bc4 Ne5"` | Ce5 pierde 55 y 80 |
| P-g6 | Al final de 4...g6: enrocar | `node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" "O-O Be3 Ne5"` | 0-0 la mejor o empata |
| P-cf6 | Al final de 2...Cf6: si negras cambia en e5, 9.Cxe5 (no 9.dxe5) | `node scripts/motor-comprobar.ts plan "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"` | Se sostiene: 9.Cxe5 +0.08; 9.dxe5 pierde 83 |
| P-gam | Al final del Gambito sigues con un peón de más, y Cf3 y 0-0 siguen | `node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w` | Se sostiene |
| V-cf6-dxe5 | "Ver": 8...dxe5 9.Cxe5 deja el peón de d4 sin peones al lado | `node scripts/motor-comprobar.ts plan "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"` | Se sostiene (chess.js: sin peones blancos en c ni e) |
| C-d6-nf6 | Los dos peones: contra 2...d6 3.d4 Cf6, defender e4 con 4.Ad3 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d6 d4 Nf6" --prof 18 --n 3` | Se sostiene: la mejor (+0.57) |
| C-d6-nf6-e5 | Ahí, avanzar a e5 pierde | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 Nf6" "e5" --prof 18` | Se sostiene: pierde 129 |
| C-d6x-nf6 | Con 3...cxd4 4.cxd4 Cf6, defender con 5.Cc3 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" --prof 18 --n 3` | Se sostiene: la mejor (+0.92) |
| C-d6x-nf6-e5 | Ahí, 5.e5 pierde un peón y el enroque | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" "e5" --prof 18` | Se sostiene: pierde 206 |
| C-nc6x-nf6-e5 | Con 2...Cc6 … 4...Cf6, 5.e5 pierde | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "e5" --prof 18` | Se sostiene: pierde 232 (5.Cc3 +0.45) |
| C-e6x-nf6-e5 | Con 2...e6 … 4...Cf6, 5.e5 pierde | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 e6 d4 cxd4 cxd4 Nf6" "e5" --prof 18` | Se sostiene: pierde 54 (5.Cc3, la mejor) |
| C-nc6x-e6 | Los dos peones: Cf3 y Cc3 contra ...e6 | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6" --prof 18 --n 3` | Se sostiene: +0.37 y +0.35 |
| C-nc6x-g6-nf3 | Contra ...g6, Cf3 primero no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6" "Nf3" --prof 18` | Se sostiene: +0.86 (pierde 119 contra 5.d5) |
| N-c-nc6-qb6-nc3 | Con ...Db6, 5.Cc3 pierde el peón de d4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nc3" --prof 18` | Se sostiene: pierde 223 (5...Dxd4) |
| N-c-nc6-qb6-nf3 | Con ...Db6, 5.Cf3 defiende d4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nf3" --prof 18` | Se sostiene: +1.52 |
| I-qxd5-be2 | El aislado: el alfil antes que Cf3 deja que la dama tome g2 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5" "Be2" --prof 18` | Se sostiene: pierde 124 |
| I-cc-nc6-be2 | Tras 5...Cc6, el alfil antes que Cf3 deja que la dama tome d4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Be2" --prof 18` | Se sostiene: pierde 110 |
| N-mod-cxd4-bg4-be2 | La clavada sin ...Cc6: 7.Ae2 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 Bg4" "Be2" --prof 18` | Se sostiene: +0.30 (7.Cc3 +1.00) |
| N-cc-nf6-nf3-bg4-be2 | La clavada sin ...Cc6 (5...Cf6): 7.Ae2 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nf6 Nf3 Bg4" "Be2" --prof 18` | Se sostiene: +0.27 (7.Cc3 +0.90) |
| G-e6-nf3 | El gambito: tras 5...e6, sacar piezas (6.Cf3) pierde | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" "Nf3" --prof 18` | Se sostiene: pierde 208; 6.dxe6 y 6.Dxb7 sirven |
| K-nc6-nf6-bd3 | Gate 2: tras 2...Cc6 3.d4 Cf6, defender con 4.Ad3 pierde un peón (tapa a la dama) | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 Nf6" "Bd3" --prof 18` | Se sostiene: pierde 317 (cxd4 cxd4 Cxd4) |
| K-nc6-nf6-d5 | Ahí, con su caballo de dama en c6, 4.d5 contra él | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 Nf6" "d5" --prof 18` | Se sostiene: +2.71, a 8 de la mejor |
| K-nc6x-nf6-d5 | Con 3...cxd4 4.cxd4 Cf6, 5.d5 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "d5" --prof 18` | Se sostiene: +2.38, a 9 |
| K-nc6x-e6-nf3-nf6-d5 | Con ...e6 y Cf3 jugados, 6.d5 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 Nf6" "d5" --prof 18` | Se sostiene: +0.50, a 41 (6.Cc3 +0.89) |
| K-nc6x-g6-nf3-nf6-d5 | Con ...g6, 6.d5 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6 Nf3 Nf6" "d5" --prof 18` | Se sostiene: la mejor (+2.96) |
| K-nc6x-d6-nf3-nf6-d5 | Con ...d6, 6.d5 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d6 Nf3 Nf6" "d5" --prof 18` | Se sostiene: la mejor (+0.78) |
| K-nc6x-e6-nc3-nf6-d5 | Con ...e6 y Cc3 jugados, 6.d5 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nc3 Nf6" "d5" --prof 18` | Se sostiene: +1.30, a 8 |
| K-d6x-nf6-nc3-nc6-d5 | Por 2...d6, con su caballo de dama ya en c6, 6.d5 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 Nc6" "d5" --prof 18` | Se sostiene: la mejor (+1.37) |
| K-g6-bg7-nf3-nf6-bd3 | Sin su caballo de dama fuera (2...g6), defender con Ad3 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 g6 d4 Bg7 Nf3 Nf6" "Bd3" --prof 18` | Se sostiene: +0.37 (5.e5 +1.74, la mejor): por eso el texto no dice "no lo avances" en general |
| K-nc6x-e5-nf3 | Contra ...e5, el caballo de rey primero | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nf3" --prof 18` | Se sostiene: 5.Cf3 +0.16 (pierde 52, sin material) |
| K-nc6x-e5-nc3 | Contra ...e5, el de dama primero entrega un peón | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nc3" --prof 18` | Se sostiene: 5.Cc3 pierde 97 (exd4 Cd5) |
| B-cc6-bg4-h3 | Plan de la base de 4...Cc6: "contra ...Ag4, h3" pierde un peón | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4" "h3" --prof 18` | Se sostiene: pierde 149; 6.Ae2 está a 5 de la mejor |
| B-stoltz-c4 | Plan de la base del Stoltz: contra ...c4, el alfil a c2 es la única buena | `node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 c4" --prof 18 --n 3` | Se sostiene: Ac2 +0.15; Aa4 −0.48; d4 −2.11 |
| Z-nc6x-d5-nf3 | Revisión final: con un peón en d5 que ataca e4 sin ...e6 (2...Cc6 3.d4 cxd4 4.cxd4 d5), Cf3 primero pierde e4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d5" "Nf3"` | Se sostiene: pierde 113 (dxe4) |
| Z-nc6x-d5-exd5 | Ahí, cambiar en d5 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d5" "exd5"` | Se sostiene: +0.26, a 10 (5.Cc3 +0.42, la mejor) |
| Z-nc6x-d5-nc3 | Ahí, Cc3 defiende e4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d5" "Nc3"` | Se sostiene: la mejor |
| Z-nc6-d5-nf3 | Con 2...Cc6 3.d4 d5, Cf3 primero pierde e4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 d5" "Nf3"` | Se sostiene: pierde 93 |
| Z-nc6-d5-exd5 | Ahí, cambiar en d5 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 d5" "exd5"` | Se sostiene: +0.12, a 12 |
| Z-g6x-d5-nf3 | Con 2...g6 3.d4 cxd4 4.cxd4 d5, Cf3 primero pierde e4 | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 g6 d4 cxd4 cxd4 d5" "Nf3"` | Se sostiene: pierde 91 |
| Z-g6x-d5-exd5 | Ahí, cambiar en d5 no pierde material | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 g6 d4 cxd4 cxd4 d5" "exd5"` | Se sostiene: +0.21, a 53 (5.e5 +0.74, la mejor) |
| Z-bd3-e6-nc6-d5 | Revisión final: con tu alfil en d3 y su peón en e6, d5 contra el caballo pierde un peón | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 e6 d4 Nf6 Bd3 cxd4 cxd4 Nc6" "d5"` | Se sostiene: pierde 142 (exd5 exd5 Cxd5); 7.Ce2 la mejor |
| Z-bd3-d6-nc6-d5 | Con tu alfil en d3 pero sin ...e6 (2...d6), d5 sigue bien | `node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 Nf6 Bd3 Nc6" "d5"` | Se sostiene: la mejor (+1.10) |

## Las salidas, tal cual

### R-d5

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.31  exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 e6
  -0.08  e5 Nc6 d4 Bf5 Nf3 e6 Bb5 Qb6
  -0.08  Bb5+ Bd7 Bxd7+ Qxd7 exd5 Qxd5 Nf3 Nf6
```

### R-d5-d4

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d4" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  d4:        -0.64  d4 dxe4 Nd2 Nf6 dxc5 g6 f3 exf3
  pierde 101 centipeones contra la mejor
```

### R-d5-e5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "e5" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  e5:        +0.02  e5 Nc6 d4 Bf5 Be2 e6 Nf3 cxd4
  pierde 35 centipeones contra la mejor
```

### R-d5-d3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d3" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  d3:        -0.14  d3 Nc6 exd5 Qxd5 Nf3 e5 Be2 Nf6
  pierde 51 centipeones contra la mejor
```

### R-nf6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  +0.17  e5 Nd5 d4 cxd4 Nf3 Nc6 cxd4 d6
  -0.04  d3 Nc6 Nf3 g6 e5 Nd5 Qb3 e6
  -0.14  Qc2 e5 Nf3 d5 exd5 Qxd5 d4 exd4
```

### R-nf6-d4

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6" "d4" --prof 18`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  mejor:     +0.18  e5 Nd5 d4 cxd4 cxd4 d6 Nf3 dxe5
  d4:        -0.70  d4 Nxe4 Nf3 e6 Bd3 d5 Nbd2 Nxd2
  pierde 88 centipeones contra la mejor
```

### R-nf6-d3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6" "d3" --prof 18`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  mejor:     +0.18  e5 Nd5 d4 cxd4 cxd4 d6 Nf3 dxe5
  d3:        -0.02  d3 e5 c4 Nc6 Nc3 a6 g3 b5
  pierde 20 centipeones contra la mejor
```

### R-nf6-bd3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6" "Bd3" --prof 18`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  mejor:     +0.18  e5 Nd5 d4 cxd4 cxd4 d6 Nf3 dxe5
  Bd3:       -0.22  Bd3 Nc6 Nf3 e5 c4 g6 Nc3 Bh6
  pierde 40 centipeones contra la mejor
```

### R-nc6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nc6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nc6
FEN: r1bqkbnr/pp1ppppp/2n5/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 18
  +0.30  d4 d5 exd5 Qxd5 Nf3 Nf6 dxc5 Qxd1+
  +0.07  Nf3 Nf6 d4 cxd4 e5 Nd5 cxd4 d6
  +0.03  Bb5 Nf6 d3 e5 Nf3 Qc7 Bc4 Be7
```

### R-d6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d6
FEN: rnbqkbnr/pp2pppp/3p4/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.57  d4 Nf6 Bd3 g6 Nf3 Bg7 h3 O-O
  +0.22  Be2 Nf6 Bf3 g6 d4 Nc6 d5 Ne5
  +0.14  Bb5+ Bd7 Bxd7+ Qxd7 d4 Nf6 Qe2 Qe6
```

### R-e6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 e6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 e6
FEN: rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.28  d4 d5 e5 Nc6 Nf3 Bd7 Be2 Nge7
  +0.24  Nf3 Nf6 Bd3 d5 e5 Nfd7 Bc2 c4
  +0.08  Be2 d5 exd5 exd5 Nf3 Nc6 d4 Nf6
```

### R-g6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 g6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 g6
FEN: rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.48  d4 d5 dxc5 dxe4 Qxd8+ Kxd8 Na3 Nc6
  +0.44  Nf3 d5 e5 d4 cxd4 cxd4 Bb5+ Bd7
  +0.26  Bc4 e6 Nf3 d5 exd5 exd5 Bb5+ Bd7
```

### R-e5

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 e5" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 e5
FEN: rnbqkbnr/pp1p1ppp/8/2p1p3/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  +0.52  Nf3 Nc6 Bc4 Be7 d4 cxd4 cxd4 exd4
  +0.16  d4 exd4 Nf3 Nc6 Bc4 Nf6 cxd4 cxd4
  +0.15  Bc4 Nf6 Qb3 Qe7 Nf3 Nc6 Na3 a6
```

### M-2c3

`node scripts/motor-comprobar.ts linea "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  e5: +0.18 (pierde 0) | e5 +0.18 · d3 -0.07 · Qc2 -0.15 · Qa4 -0.25 · Bd3 -0.26
  d4: +0.25 (pierde 0) | d4 +0.25 · Bc4 +0.12 · Nf3 +0.11 · Na3 -0.12 · Bb5 -0.13
  cxd4: +0.12 (pierde 0) | cxd4 +0.12 · Nf3 +0.06 · Bc4 -0.01 · Qxd4 -0.10 · Be2 -0.18
  Nf3: +0.00 (pierde 20) | Bc4 +0.20 · Nf3 +0.00 · exd6 -0.07 · Qb3 -0.07 · Bb5+ -0.15
  Bc4: +0.06 (pierde 0) | Bc4 +0.06 · Nc3 -0.03 · Bd2 -0.06 · Qb3 -0.12 · exd6 -0.13
  Bb5: +0.03 (pierde 0) | Bb5 +0.03 · Bb3 -0.02 · Bd3 -0.28 · Be2 -0.31 · b3 -0.32
  FIN: +0.10 dxe5 Nxe5 Bd7 Nxd7 Qxd7 O-O · +0.16 Bd7 Nc3 dxe5 dxe5 g6 O-O · +0.35 e6 Qe2 a6 Bg5 Qc7 Bxc6+
```

### M-d4

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  cxd4: +0.32 (pierde 0) | cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
  Nf3: +0.28 (pierde 0) | Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
  Nc3: +0.63 (pierde 0) | Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
  FIN: +0.34 Bxf3 gxf3 Qxd4 Qxd4 Nxd4 Nb5 · +1.97 Qh5 d5 Bxf3 gxf3 O-O-O Qa4 · +2.71 Qa5 d5 Rd8 Bd2 Rxd5 Nxd5
```

### M-cc-cxd4

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  cxd4: +0.32 (pierde 0) | cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
  Nf3: +0.28 (pierde 0) | Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
  Nc3: +0.63 (pierde 0) | Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
  FIN: +0.34 Bxf3 gxf3 Qxd4 Qxd4 Nxd4 Nb5 · +1.97 Qh5 d5 Bxf3 gxf3 O-O-O Qa4 · +2.71 Qa5 d5 Rd8 Bd2 Rxd5 Nxd5
```

### L-cc

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Nc3 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  cxd4: +0.32 (pierde 0) | cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
  Nf3: +0.28 (pierde 0) | Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
  Nc3: +0.63 (pierde 0) | Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
  FIN: +0.34 Bxf3 gxf3 Qxd4 Qxd4 Nxd4 Nb5 · +1.97 Qh5 d5 Bxf3 gxf3 O-O-O Qa4 · +2.71 Qa5 d5 Rd8 Bd2 Rxd5 Nxd5
```

### L-cc-be2

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  cxd4: +0.32 (pierde 0) | cxd4 +0.32 · Nf3 +0.23 · Ne2 +0.10 · Qxd4 -0.07 · Be3 -0.09
  Nf3: +0.28 (pierde 0) | Nf3 +0.28 · Ne2 +0.23 · Be3 -0.09 · Na3 -0.31 · Nc3 -0.38
  Be2: +0.35 (pierde 28) | Nc3 +0.63 · Be2 +0.35 · Be3 -0.12 · Nbd2 -0.18 · Bd3 -0.64
  Nc3: +0.22 (pierde 0) | O-O +0.22 · Nc3 +0.22 · Be3 +0.08 · a3 +0.01 · Bf4 -0.06
  FIN: +0.21 Qa5 h3 Bxf3 Bxf3 Bb4 O-O · +0.30 Bb4 O-O Qa5 Ne4 Nf6 Nxf6+ · +0.37 Qd7 O-O Rd8 Be3 Bd6 Ne5
```

### L-mod

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  Nf3: +0.24 (pierde 0) | Nf3 +0.24 · dxc5 +0.10 · Na3 +0.08 · Be3 -0.07 · Ne2 -0.14
  Be2: +0.27 (pierde 8) | Nbd2 +0.35 · dxc5 +0.28 · Be2 +0.27 · Be3 +0.10 · Bb5+ -0.09
  h3: +0.17 (pierde 1) | O-O +0.18 · h3 +0.17 · Be3 +0.16 · Na3 +0.10 · Qa4+ +0.00
  O-O: +0.13 (pierde 7) | Be3 +0.20 · Na3 +0.16 · c4 +0.14 · O-O +0.13 · a3 +0.05
  Be3: +0.16 (pierde 0) | Be3 +0.16 · Bf4 +0.11 · Re1 +0.08 · Na3 +0.03 · Qa4 +0.00
  cxd4: +0.07 (pierde 3) | Nxd4 +0.10 · cxd4 +0.07 · Bxd4 -0.15 · Bc1 -0.64 · Bf4 -0.95
  FIN: +0.10 Be7 Nc3 Qd6 Qb3 O-O Rfd1 · +0.19 Qa5 Nc3 Bd6 Qb3 Qb4 g4 · +0.21 Bd6 Nc3 Qa5 Qb3 Qb4 g4
```

### L-cc6

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  Nf3: +0.31 (pierde 0) | Nf3 +0.31 · dxc5 +0.28 · Be3 -0.09 · Ne2 -0.13 · Na3 -0.18
  Be3: +0.16 (pierde 7) | dxc5 +0.23 · Be2 +0.21 · Be3 +0.16 · h3 -0.06 · Nbd2 -0.14
  cxd4: +0.27 (pierde 0) | cxd4 +0.27 · Nxd4 -0.28 · Bxd4 -0.34 · Bd2 -2.27 · Bg5 -2.41
  Nc3: +0.22 (pierde 0) | Nc3 +0.22 · a3 +0.20 · Bd3 +0.18 · Be2 +0.15 · Qd2 +0.04
  FIN: +0.26 Qd6 Bc4 Be7 O-O O-O Re1 · +0.27 Qa5 a3 Bd6 Bd3 O-O O-O · +0.28 Bb4 Bd3 e5 Be2 exd4 Nxd4
```

### L-g6

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" w`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  d4: +0.33 (pierde 0) | d4 +0.33 · Nf3 +0.24 · Na3 +0.20 · d3 -0.15 · Bb5+ -0.25
  Nf3: +0.29 (pierde 0) | Nf3 +0.29 · Be2 +0.24 · dxc5 +0.22 · Na3 +0.13 · Be3 +0.10
  Be2: +0.17 (pierde 6) | Nbd2 +0.23 · Na3 +0.22 · Be2 +0.17 · Be3 +0.14 · dxc5 +0.10
  cxd4: +0.20 (pierde 5) | Na3 +0.25 · cxd4 +0.20 · O-O +0.18 · Be3 -0.09 · a4 -0.34
  Nc3: +0.11 (pierde 0) | Nc3 +0.11 · O-O +0.11 · Be3 -0.13 · h3 -0.17 · Bf4 -0.19
  FIN: +0.09 Qd6 Qb3 O-O O-O Qb6 Qxb6 · +0.11 Qa5 O-O O-O Qb3 Qb6 Qxb6 · +0.16 Qd8 Qb3 O-O O-O Qb6 Qxb6
```

### L-gam

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  Qa4+: +0.56 (pierde 0) | Qa4+ +0.56 · Bb5+ +0.27 · Nf3 +0.21 · d4 +0.18 · Bc4 +0.12
  Qb3: +0.41 (pierde 0) | Qb3 +0.41 · Bb5 -0.37 · Qd1 -0.38 · Qc4 -0.40 · Qc2 -0.52
  dxe6: +0.45 (pierde 0) | dxe6 +0.45 · Qxb7 -0.01 · c4 -0.23 · d4 -0.74 · Nf3 -0.80
  Bc4: +0.55 (pierde 0) | Bc4 +0.55 · Qxb7 +0.00 · Qd1 -0.08 · Qc2 -0.32 · Qa4+ -0.38
  Qxc4: +0.34 (pierde 0) | Qxc4 +0.34 · Qxb7 -7.37 · Qa4+ -7.81 · d4 -7.87 · Qd1 -7.94
  FIN: +0.42 Bd6 Nf3 O-O O-O Nc6 d3 · +0.45 Nc6 Nf3 Be7 d4 cxd4 cxd4 · +0.48 Be7 Nf3 Nc6 d4 cxd4 cxd4
```

### L-cf6

`node scripts/motor-comprobar.ts linea "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" w`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  e5: +0.18 (pierde 0) | e5 +0.18 · d3 -0.07 · Qc2 -0.15 · Qa4 -0.25 · Bd3 -0.26
  d4: +0.25 (pierde 0) | d4 +0.25 · Bc4 +0.12 · Nf3 +0.11 · Na3 -0.12 · Bb5 -0.13
  cxd4: +0.12 (pierde 0) | cxd4 +0.12 · Nf3 +0.06 · Bc4 -0.01 · Qxd4 -0.10 · Be2 -0.18
  Nf3: +0.00 (pierde 20) | Bc4 +0.20 · Nf3 +0.00 · exd6 -0.07 · Qb3 -0.07 · Bb5+ -0.15
  Bc4: +0.06 (pierde 0) | Bc4 +0.06 · Nc3 -0.03 · Bd2 -0.06 · Qb3 -0.12 · exd6 -0.13
  Bb5: +0.03 (pierde 0) | Bb5 +0.03 · Bb3 -0.02 · Bd3 -0.28 · Be2 -0.31 · b3 -0.32
  FIN: +0.10 dxe5 Nxe5 Bd7 Nxd7 Qxd7 O-O · +0.16 Bd7 Nc3 dxe5 dxe5 g6 O-O · +0.35 e6 Qe2 a6 Bg5 Qc7 Bxc6+
```

### F-gam

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6
FEN: rnbqkb1r/pp2pppp/5n2/2pP4/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +0.36  Qa4+ Nbd7 Qb3 g6 Nf3 Bg7 Be2 O-O
  +0.33  Bb5+ Nbd7 d4 a6 Be2 Nxd5 Nf3 e6
  +0.16  Nf3 Nxd5 d4 cxd4 Nxd4 e6 Nd2 Be7
```

### F-nf6-4

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Nd5" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5
FEN: rnbqkb1r/pp1ppppp/8/2pnP3/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +0.13  Nf3 Nc6 d4 cxd4 cxd4 d6 Bc4 Nb6
  +0.11  d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6
  -0.02  Bc4 Nb6 Be2 Nc6 Nf3 g6 a4 d6
```

### F-nf6d4

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4
FEN: rnbqkb1r/pp1ppppp/8/3nP3/3p4/2P5/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  +0.11  Bc4 Qc7 Qe2 Nb6 Bb3 d3 Qxd3 Qxe5+
  +0.07  cxd4 d6 Bc4 Nb6 Bb3 dxe5 Qh5 e6
  +0.03  Nf3 Nc6 cxd4 d6 Bc4 Nb6 Bb5 dxe5
```

### A-d5

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5" --prof 16`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: dxe4 Qa4+ Nc6 Qxe4 Nf6 Qc2  (-1.16)
  Con el turno normal: +0.35  exd5 Qxd5 d4 cxd4 cxd4 e5
```

### A-nf6

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6" --prof 16`

```
Posición tras: e4 c5 c3 Nf6
FEN: rnbqkb1r/pp1ppppp/5n2/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 3
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Nxe4 d4 d5 Nf3 e6 Nbd2  (-1.44)
  Con el turno normal: +0.16  e5 Nd5 d4 cxd4 Nf3 Nc6
```

### A-nf6-e5

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6 e5" --prof 16`

```
Posición tras: e4 c5 c3 Nf6 e5
FEN: rnbqkb1r/pp1ppppp/5n2/2p1P3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: exf6 Nc6 d4 cxd4 cxd4 d5  (+5.98)
  Con el turno normal: +0.11  Nd5 d4 cxd4 Nf3 Nc6 Bc4
```

### A-bg4

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4
FEN: r3kbnr/pp2pppp/2n5/3q4/3P2b1/5N2/PP3PPP/RNBQKB1R w KQkq - 3 7
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Bxf3 gxf3 Nxd4 Be2 O-O-O Be3  (-1.40)
  Con el turno normal: +0.44  Be2 e6 Nc3 Qd7 O-O Nf6
```

### A-mod-bg4

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4
FEN: rn2kb1r/pp2pppp/5n2/2pq4/3P2b1/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Bxf3 Qxf3 Qxf3 gxf3 cxd4 cxd4  (-0.45)
  Con el turno normal: +0.36  dxc5 Qxd1+ Kxd1 Nc6 Be2 e5
```

### A-h3

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3
FEN: rn2kb1r/pp3ppp/4pn2/2pq4/3P2b1/2P2N1P/PP2BPP1/RNBQK2R b KQkq - 0 7
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: hxg4 Nxg4 c4 Qd7 d5 exd5  (+6.77)
  Con el turno normal: +0.24  Bh5 O-O Nc6 Be3 cxd4 cxd4
```

### A-c3-nc3

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3
FEN: r3kbnr/pp3ppp/2n1p3/3q4/3P2b1/2N2N2/PP2BPPP/R1BQK2R b KQkq - 1 8
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Nxd5 exd5 Kf1 Be7 Be3 f5  (+7.54)
  Con el turno normal: +0.38  Qd7 O-O Bxf3 Bxf3 Nxd4 Bxb7
```

### A-cc6-nc3

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3
FEN: r1b1kb1r/pp3ppp/2n1pn2/3q4/3P4/2N1BN2/PP3PPP/R2QKB1R b KQkq - 1 8
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Nxd5 Nxd5 Bb5 Bb4+ Kf1 Bd7  (+6.79)
  Con el turno normal: +0.30  Qd8 Bd3 Be7 O-O O-O a3
```

### A-g6-nc3

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3
FEN: rnb1k2r/pp2ppbp/5np1/3q4/3P4/2N2N2/PP2BPPP/R1BQK2R b KQkq - 2 8
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Nxd5 Nxd5 Bb5+ Nc6 Bd2 O-O  (+6.86)
  Con el turno normal: +0.14  Qd6 O-O O-O Qb3 a6 Rd1
```

### A-d6

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6" --prof 16`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6
FEN: rnbqkb1r/pp2pppp/3p4/3nP3/3P4/8/PP3PPP/RNBQKBNR w KQkq - 0 6
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: dxe5 dxe5 Nc6 Nf3 Bg4 h3  (-0.51)
  Con el turno normal: +0.30  Bc4 e6 Nf3 Be7 Qe2 dxe5
```

### A-nb6

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6" --prof 16`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6
FEN: r1bqkb1r/pp2pppp/1nnp4/4P3/2BP4/5N2/PP3PPP/RNBQK2R w KQkq - 4 8
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Nxc4 exd6 e6 Nc3 Nxd6 O-O  (-5.26)
  Con el turno normal: +0.13  Bb5 dxe5 Nxe5 Bd7 Bxc6 Bxc6
```

### A-gam-bd7

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7
FEN: rn1qkb1r/pp1bpppp/5n2/2pP4/Q7/2P5/PP1P1PPP/RNB1KBNR w KQkq - 3 5
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: Bxa4 b3 Bd7 Nf3 Nxd5 Ne5  (-8.51)
  Con el turno normal: +0.48  Qb3 Qb6 Bc4 Na6 Nf3 Nc7
```

### A-gam-b3

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3
FEN: rn1qkb1r/pp1bpppp/5n2/2pP4/8/1QP5/PP1P1PPP/RNB1KBNR b KQkq - 4 5
Mueven: negras · profundidad 16
  Si blancas jugara otra vez: Qxb7 Qb6 Qxa8 e6 Ba6 Bd6  (+3.54)
  Con el turno normal: +0.51  e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4
```

### A-gam-e6

`node scripts/motor-comprobar.ts amenaza "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" --prof 16`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6
FEN: rn1qkb1r/pp1b1ppp/4pn2/2pP4/8/1QP5/PP1P1PPP/RNB1KBNR w KQkq - 0 6
Mueven: blancas · profundidad 16
  Si negras jugara otra vez: exd5 Nf3 Bd6 Be2 O-O O-O  (-1.73)
  Con el turno normal: +0.53  dxe6 Bxe6 Bc4 Bxc4 Qxc4 Bd6
```

### E-d4

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5" "d4" --prof 18`

```
Posición tras: e4 c5 c3 d5
FEN: rnbqkbnr/pp2pppp/8/2pp4/4P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3
Mueven: blancas · profundidad 18
  mejor:     +0.37  exd5 Qxd5 d4 cxd4 cxd4 e5 Nf3 Nc6
  d4:        -0.64  d4 dxe4 Nd2 Nf6 dxc5 g6 f3 exf3
  pierde 101 centipeones contra la mejor
```

### E-d4-b

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 d4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 d4
FEN: rnbqkbnr/pp2pppp/8/2pp4/3PP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3
Mueven: negras · profundidad 18
  -0.68  dxe4 dxc5 Qxd1+ Kxd1 Nf6 Nd2 Nc6 Bb5
  +0.14  cxd4 exd5 Qxd5 cxd4 e5 dxe5 Qxe5+ Be2
  +0.30  Nc6 exd5 Qxd5 Nf3 Nf6 Be2 cxd4 cxd4
```

### E-d4-c

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 d4 dxe4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 d4 dxe4
FEN: rnbqkbnr/pp2pppp/8/2p5/3Pp3/2P5/PP3PPP/RNBQKBNR w KQkq - 0 4
Mueven: blancas · profundidad 18
  -0.59  Nd2 Nf6 dxc5 g6 f3 exf3 Ngxf3 Bg7
  -0.65  dxc5 Qxd1+ Kxd1 Nf6 Nd2 Nc6 Bb5 Be6
  -0.75  Bb5+ Bd7 Bxd7+ Qxd7 dxc5 f5 Ne2 Qxd1+
```

### E-nc3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Nc3" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6
FEN: r1b1kbnr/pp2pppp/2n5/3q4/3P4/8/PP3PPP/RNBQKBNR w KQkq - 1 6
Mueven: blancas · profundidad 18
  mejor:     +0.30  Nf3 Bg4 Be2 e6 Nc3 Qa5 O-O Nf6
  Nc3:       -0.33  Nc3 Qxd4 Qc2 Nf6 Nf3 Qg4 h3 Qg6
  pierde 63 centipeones contra la mejor
```

### E-nc3-b

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3
FEN: r1b1kbnr/pp2pppp/2n5/3q4/3P4/2N5/PP3PPP/R1BQKBNR b KQkq - 2 6
Mueven: negras · profundidad 18
  -0.33  Qxd4 Qc2 Qe5+ Be3 Nf6 Nf3 Qa5 Bc4
  +1.84  Qd8 d5 Ne5 Qe2 Ng6 Qb5+ Qd7 Nf3
  +2.27  Qa5 d5 Ne5 Bf4 Nd7 Nf3 Ngf6 a3
```

### E-nc3-c

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3 Qxd4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nc3 Qxd4
FEN: r1b1kbnr/pp2pppp/2n5/8/3q4/2N5/PP3PPP/R1BQKBNR w KQkq - 0 7
Mueven: blancas · profundidad 18
  -0.42  Qc2 Nf6 Nf3 Qd6 Be3 Bd7 Rd1 Qc7
  -0.45  Bd3 Qd8 Qe2 g6 Nf3 Bg7 h3 Nf6
  -0.76  Be3 Qxd1+ Rxd1 Bd7 Nf3 Nf6 g3 e5
```

### E-ne4

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nf6 e5" "Ne4" --prof 18`

```
Posición tras: e4 c5 c3 Nf6 e5
FEN: rnbqkb1r/pp1ppppp/5n2/2p1P3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3
Mueven: negras · profundidad 18
  mejor:     +0.12  Nd5 d4 cxd4 Nf3 Nc6 Bc4 Nb6 Bb3
  Ne4:       +4.11  Ne4 d3 Nxf2 Kxf2 d6 Nf3 dxe5 Nxe5
  pierde 399 centipeones contra la mejor
```

### E-ne4-b

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Ne4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Ne4
FEN: rnbqkb1r/pp1ppppp/8/2p1P3/4n3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +4.34  d3 Nxf2 Kxf2 Nc6 Nf3 d6 Qe1 Bg4
  +2.62  h4 c4 Bxc4 d5 Bb5+ Bd7 Bxd7+ Qxd7
  +2.24  Nf3 f6 d3 Ng5 Nxg5 fxg5 Bxg5 Nc6
```

### E-ne4-c

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Ne4 d3" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Ne4 d3
FEN: rnbqkb1r/pp1ppppp/8/2p1P3/4n3/2PP4/PP3PPP/RNBQKBNR b KQkq - 0 4
Mueven: negras · profundidad 18
  +4.43  Nxf2 Kxf2 d6 Nf3 Nc6 Qe1 Bg4 exd6
  +4.87  Nxc3 Nxc3 d5 exd6 e5 g3 Nc6 Bg2
  +5.93  Nd6 exd6 e6 Bf4 Qb6 Qb3 Qc6 d4
```

### E-glot

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3" "Qxd4" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3
FEN: r3kbnr/pp2pppp/2n5/3q4/3P4/5B2/PP3PPP/RNBQK2R b KQkq - 0 8
Mueven: negras · profundidad 18
  mejor:     +1.64  Qd7 d5 Ne5 Be2 e6 f4 Ng6 Nc3
  Qxd4:      +9.77  Qxd4 Bxc6+ bxc6 Qxd4 e6 Nc3 Ne7 Qa4
  pierde 813 centipeones contra la mejor
```

### E-glot-b

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3 Qxd4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 Bxf3 Bxf3 Qxd4
FEN: r3kbnr/pp2pppp/2n5/8/3q4/5B2/PP3PPP/RNBQK2R w KQkq - 0 9
Mueven: blancas · profundidad 18
  +9.16  Bxc6+ bxc6 Qxd4 Rd8 Qa4 f5 Be3 e5
  +0.38  O-O Qxd1 Rxd1 Rd8 Rxd8+ Kxd8 Bxc6 bxc6
  +0.22  Qb3 Qb6 Qxb6 axb6 Be3 e6 Bxb6 Ra6
```

### P-cc

`node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" "O-O Ne5 Be3 h3"`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3 · mueven negras · profundidad 18
  el rival: Qa5 +0.21 · Bb4 +0.30 · Qd7 +0.37
  tras Qa5: mejor +0.25 O-O
    O-O: +0.27 (pierde -2)
    Ne5: -0.68 (pierde 93)
    Be3: +0.07 (pierde 18)
    h3: +0.25 (pierde 0)
  tras Bb4: mejor +0.25 O-O
    O-O: +0.25 (pierde 0)
    Ne5: -5.97 (pierde 622)
    Be3: +0.10 (pierde 15)
    h3: -0.10 (pierde 35)
```

### P-mod

`node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" "Nc3 Ne5"`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4 · mueven negras · profundidad 18
  el rival: Be7 +0.10 · Qa5 +0.19 · Bd6 +0.21
  tras Be7: mejor +0.10 Nc3
    Nc3: +0.11 (pierde -1)
    Ne5: -0.68 (pierde 78)
  tras Qa5: mejor +0.24 Qb3
    Nc3: +0.15 (pierde 9)
    Ne5: -0.16 (pierde 40)
```

### P-cc6

`node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" "O-O-O Be2 Bd3 Bc4 Ne5"`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3 · mueven negras · profundidad 18
  el rival: Qd6 +0.26 · Qa5 +0.27 · Bb4 +0.28
  tras Qd6: mejor +0.45 Bd3
    O-O-O: ilegal aquí
    Be2: +0.06 (pierde 39)
    Bd3: +0.37 (pierde 8)
    Bc4: +0.22 (pierde 23)
    Ne5: -0.10 (pierde 55)
  tras Qa5: mejor +0.26 a3
    O-O-O: ilegal aquí
    Be2: +0.15 (pierde 11)
    Bd3: +0.15 (pierde 11)
    Bc4: +0.31 (pierde -5)
    Ne5: -0.54 (pierde 80)
```

### P-g6

`node scripts/motor-comprobar.ts plan "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" "O-O Be3 Ne5"`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3 · mueven negras · profundidad 18
  el rival: Qd6 +0.09 · Qa5 +0.11 · Qd8 +0.16
  tras Qd6: mejor +0.13 O-O
    O-O: +0.24 (pierde -11)
    Be3: -0.01 (pierde 14)
    Ne5: -0.10 (pierde 23)
  tras Qa5: mejor +0.07 O-O
    O-O: +0.20 (pierde -13)
    Be3: -0.10 (pierde 17)
    Ne5: +0.28 (pierde -21)
```

### P-cf6

`node scripts/motor-comprobar.ts plan "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5 · mueven negras · profundidad 18
  el rival: dxe5 +0.10 · Bd7 +0.16 · e6 +0.35
  tras dxe5: mejor +0.06 Nxe5
    Nxe5: +0.08 (pierde -2)
    dxe5: -0.77 (pierde 83)
    O-O: -0.25 (pierde 31)
    Nc3: -0.27 (pierde 33)
    exd6: ilegal aquí
  tras Bd7: mejor +0.33 Nc3
    Nxe5: ilegal aquí
    dxe5: ilegal aquí
    O-O: +0.04 (pierde 29)
    Nc3: +0.29 (pierde 4)
    exd6: +0.17 (pierde 16)
```

### P-gam

`node scripts/motor-comprobar.ts linea "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4 · mueven negras · profundidad 18
  e4: +0.32 (pierde 0) | e4 +0.32 · d4 +0.23 · Nf3 +0.22 · e3 +0.13 · c4 +0.12
  c3: +0.17 (pierde 21) | Nf3 +0.38 · Nc3 +0.30 · Ne2 +0.28 · c3 +0.17 · d4 +0.12
  exd5: +0.33 (pierde 0) | exd5 +0.33 · Bb5+ -0.02 · d3 -0.08 · e5 -0.13 · Na3 -0.17
  Qa4+: +0.56 (pierde 0) | Qa4+ +0.56 · Bb5+ +0.27 · Nf3 +0.21 · d4 +0.18 · Bc4 +0.12
  Qb3: +0.41 (pierde 0) | Qb3 +0.41 · Bb5 -0.37 · Qd1 -0.38 · Qc4 -0.40 · Qc2 -0.52
  dxe6: +0.45 (pierde 0) | dxe6 +0.45 · Qxb7 -0.01 · c4 -0.23 · d4 -0.74 · Nf3 -0.80
  Bc4: +0.55 (pierde 0) | Bc4 +0.55 · Qxb7 +0.00 · Qd1 -0.08 · Qc2 -0.32 · Qa4+ -0.38
  Qxc4: +0.34 (pierde 0) | Qxc4 +0.34 · Qxb7 -7.37 · Qa4+ -7.81 · d4 -7.87 · Qd1 -7.94
  FIN: +0.42 Bd6 Nf3 O-O O-O Nc6 d3 · +0.45 Nc6 Nf3 Be7 d4 cxd4 cxd4 · +0.48 Be7 Nf3 Nc6 d4 cxd4 cxd4
```

### V-cf6-dxe5

`node scripts/motor-comprobar.ts plan "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5 · mueven negras · profundidad 18
  el rival: dxe5 +0.10 · Bd7 +0.16 · e6 +0.35
  tras dxe5: mejor +0.06 Nxe5
    Nxe5: +0.08 (pierde -2)
    dxe5: -0.77 (pierde 83)
    O-O: -0.25 (pierde 31)
    Nc3: -0.27 (pierde 33)
    exd6: ilegal aquí
  tras Bd7: mejor +0.33 Nc3
    Nxe5: ilegal aquí
    dxe5: ilegal aquí
    O-O: +0.04 (pierde 29)
    Nc3: +0.29 (pierde 4)
    exd6: +0.17 (pierde 16)
```

### C-d6-nf6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d6 d4 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d6 d4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  +0.57  Bd3 g6 Nf3 cxd4 cxd4 Bg7 O-O Bg4
  +0.35  Nd2 cxd4 cxd4 g6 Bd3 Bg7 Ne2 O-O
  +0.24  Qc2 g6 dxc5 d5 Nd2 Bg7 Bb5+ Bd7
```

### C-d6-nf6-e5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 d6 d4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  mejor:     +0.55  Bd3 g6 Nf3 Bg7 O-O O-O h3 cxd4
  e5:        -0.74  e5 dxe5 dxc5 Qxd1+ Kxd1 g6 Nf3 Nbd7
  pierde 129 centipeones contra la mejor
```

### C-d6x-nf6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 d6 d4 cxd4 cxd4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  +0.92  Nc3 g6 Bb5+ Bd7 Be2 Qa5 Bd2 Bg7
  +0.61  Bd3 g6 Nc3 Bg7 h3 e5 Nge2 exd4
  +0.45  f3 e5 Ne2 Be7 Nbc3 h5 Be3 O-O
```

### C-d6x-nf6-e5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 d6 d4 cxd4 cxd4 Nf6
FEN: rnbqkb1r/pp2pppp/3p1n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +0.85  Nc3 g6 Be3 Bg7 Bb5+ Bd7 e5 Ng8
  e5:        -1.21  e5 dxe5 dxe5 Qxd1+ Kxd1 Ng4 Ke1 Nxe5
  pierde 206 centipeones contra la mejor
```

### C-nc6x-nf6-e5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.47  d5 Ne5 f4 Neg4 Nc3 Qb6 Qe2 e6
  e5:        +0.15  e5 Nd5 Nc3 e6 Nf3 d6 Bd2 Be7
  pierde 232 centipeones contra la mejor
```

### C-e6x-nf6-e5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 e6 d4 cxd4 cxd4 Nf6" "e5" --prof 18`

```
Posición tras: e4 c5 c3 e6 d4 cxd4 cxd4 Nf6
FEN: rnbqkb1r/pp1p1ppp/4pn2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +0.97  Nc3 Be7 Bd3 d6 Nf3 O-O h3 Nc6
  e5:        +0.43  e5 Nd5 Nf3 Bb4+ Bd2 O-O Bc4 Bxd2+
  pierde 54 centipeones contra la mejor
```

### C-nc6x-e6

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e6
FEN: r1bqkbnr/pp1p1ppp/2n1p3/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  +0.44  d5 exd5 exd5 Bb4+ Nc3 Qe7+ Be2 Ne5
  +0.37  Nf3 d5 e5 Nge7 Nc3 Nf5 Bb5 Bd7
  +0.35  Nc3 d5 e5 Nge7 Nf3 Nf5 Bb5 Bd7
```

### C-nc6x-g6-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 g6
FEN: r1bqkbnr/pp1ppp1p/2n3p1/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  mejor:     +2.05  d5 Nb4 Nc3 Bg7 Nf3 Na6 d6 Qb6
  Nf3:       +0.86  Nf3 Bg7 h3 d6 Be3 Nf6 d5 Ne5
  pierde 119 centipeones contra la mejor
```

### N-c-nc6-qb6-nc3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nc3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6
FEN: r1b1kbnr/pp1ppppp/1qn5/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.32  d5 Na5 Be3 Qxb2 Bd4 Qb4+ Nc3 e5
  Nc3:       +0.09  Nc3 Qxd4 Qc2 Qd6 Be3 e6 f4 a6
  pierde 223 centipeones contra la mejor
```

### N-c-nc6-qb6-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Qb6
FEN: r1b1kbnr/pp1ppppp/1qn5/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.32  d5 Na5 Be3 Qxb2 Bd4 Qb4+ Nc3 e5
  Nf3:       +1.52  Nf3 e6 Nc3 Bb4 a3 Bxc3+ bxc3 Nf6
  pierde 80 centipeones contra la mejor
```

### I-qxd5-be2

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5
FEN: rnb1kbnr/pp2pppp/8/2pq4/8/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 4
Mueven: blancas · profundidad 18
  mejor:     +0.31  d4 Nf6 Nf3 e6 Bd3 Be7 O-O O-O
  Be2:       -0.93  Be2 Qxg2 Bf3 Qg6 d4 cxd4 cxd4 Nc6
  pierde 124 centipeones contra la mejor
```

### I-cc-nc6-be2

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6
FEN: r1b1kbnr/pp2pppp/2n5/3q4/3P4/8/PP3PPP/RNBQKBNR w KQkq - 1 6
Mueven: blancas · profundidad 18
  mejor:     +0.30  Nf3 Bg4 Be2 e6 Nc3 Qa5 O-O Nf6
  Be2:       -0.80  Be2 Qxd4 Nd2 Qd8 Ngf3 g6 O-O Nf6
  pierde 110 centipeones contra la mejor
```

### N-mod-cxd4-bg4-be2

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 Bg4" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 cxd4 cxd4 Bg4
FEN: rn2kb1r/pp2pppp/5n2/3q4/3P2b1/5N2/PP3PPP/RNBQKB1R w KQkq - 1 7
Mueven: blancas · profundidad 18
  mejor:     +1.00  Nc3 Bxf3 gxf3 Qa5 Qb3 Nbd7 Qxb7 Rb8
  Be2:       +0.30  Be2 e6 Nc3 Qa5 Qb3 Bb4 O-O O-O
  pierde 70 centipeones contra la mejor
```

### N-cc-nf6-nf3-bg4-be2

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nf6 Nf3 Bg4" "Be2" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nf6 Nf3 Bg4
FEN: rn2kb1r/pp2pppp/5n2/3q4/3P2b1/5N2/PP3PPP/RNBQKB1R w KQkq - 3 7
Mueven: blancas · profundidad 18
  mejor:     +0.90  Nc3 Bxf3 gxf3 Qd6 Qb3 Qb6 Bb5+ Nbd7
  Be2:       +0.27  Be2 e6 Nc3 Qa5 Qb3 Bb4 h3 Bxf3
  pierde 63 centipeones contra la mejor
```

### G-e6-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6
FEN: rn1qkb1r/pp1b1ppp/4pn2/2pP4/8/1QP5/PP1P1PPP/RNB1KBNR w KQkq - 0 6
Mueven: blancas · profundidad 18
  mejor:     +1.36  Qxb7 exd5 Qxa8 Bd6 Qb7 O-O Be2
  Nf3:       -0.72  Nf3 exd5 d4 Bd6 Be2 O-O dxc5 Bxc5
  pierde 208 centipeones contra la mejor
```

### K-nc6-nf6-bd3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 Nf6" "Bd3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  mejor:     +2.79  d5 Nb8 e5 Ng8 Nf3 g6 d6 Nc6
  Bd3:       -0.38  Bd3 cxd4 cxd4 Nxd4 Nc3 e5 Nf3 Nxf3+
  pierde 317 centipeones contra la mejor
```

### K-nc6-nf6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/2p5/3PP3/2P5/PP3PPP/RNBQKBNR w KQkq - 1 4
Mueven: blancas · profundidad 18
  mejor:     +2.79  d5 Nb8 e5 Ng8 Nf3 g6 d6 Nc6
  d5:        +2.71  d5 Nb8 e5 Ng8 Nf3 a6 Bc4 d6
  pierde 8 centipeones contra la mejor
```

### K-nc6x-nf6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 Nf6
FEN: r1bqkb1r/pp1ppppp/2n2n2/8/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 1 5
Mueven: blancas · profundidad 18
  mejor:     +2.47  d5 Ne5 f4 Neg4 Nc3 Qb6 Qe2 e6
  d5:        +2.38  d5 Ne5 f4 Neg4 Nc3 b5 e5 b4
  pierde 9 centipeones contra la mejor
```

### K-nc6x-e6-nf3-nf6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 Nf6
FEN: r1bqkb1r/pp1p1ppp/2n1pn2/8/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +0.91  Nc3 d5 e5 Ne4 Bd3 Bb4 Qc2 Qa5
  d5:        +0.50  d5 Bb4+ Nc3 exd5 exd5 Ne7 d6 Ned5
  pierde 41 centipeones contra la mejor
```

### K-nc6x-g6-nf3-nf6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 g6 Nf3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 g6 Nf3 Nf6
FEN: r1bqkb1r/pp1ppp1p/2n2np1/8/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +2.90  d5 Nb4 Nc3 Qa5 Nd2 Qc5 Be2 Na6
  d5:        +2.96  d5 Nb4 Nc3 Bg7 Qa4 a5 a3 Nxe4
  pierde -6 centipeones contra la mejor
```

### K-nc6x-d6-nf3-nf6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d6 Nf3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 d6 Nf3 Nf6
FEN: r1bqkb1r/pp2pppp/2np1n2/8/3PP3/5N2/PP3PPP/RNBQKB1R w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +0.89  Nc3 d5 e5 Ne4 Be2 e6 O-O h6
  d5:        +0.78  d5 Ne5 Nxe5 dxe5 Nc3 Bd7 Qb3 e6
  pierde 11 centipeones contra la mejor
```

### K-nc6x-e6-nc3-nf6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nc3 Nf6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nc3 Nf6
FEN: r1bqkb1r/pp1p1ppp/2n1pn2/8/3PP3/2N5/PP3PPP/R1BQKBNR w KQkq - 2 6
Mueven: blancas · profundidad 18
  mejor:     +1.38  d5 Nb8 Bg5 h6 Bh4 d6 Bb5+ Bd7
  d5:        +1.30  d5 Nb8 Bg5 h6 Bh4 d6 Bb5+ Bd7
  pierde 8 centipeones contra la mejor
```

### K-d6x-nf6-nc3-nc6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 Nc6" "d5" --prof 18`

```
Posición tras: e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 Nc6
FEN: r1bqkb1r/pp2pppp/2np1n2/8/3PP3/2N5/PP3PPP/R1BQKBNR w KQkq - 3 6
Mueven: blancas · profundidad 18
  mejor:     +1.28  d5 Nb8 h3 e6 Nf3 Be7 Bd3 O-O
  d5:        +1.37  d5 Nb8 Nf3 g6 h3 Bg7 Bc4 O-O
  pierde -9 centipeones contra la mejor
```

### K-g6-bg7-nf3-nf6-bd3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 g6 d4 Bg7 Nf3 Nf6" "Bd3" --prof 18`

```
Posición tras: e4 c5 c3 g6 d4 Bg7 Nf3 Nf6
FEN: rnbqk2r/pp1pppbp/5np1/2p5/3PP3/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 5
Mueven: blancas · profundidad 18
  mejor:     +1.62  e5 Nd5 dxc5 Nc7 Na3 b6 cxb6 axb6
  Bd3:       +0.37  Bd3 d5 e5 Ne4 O-O Nc6 Re1 Bf5
  pierde 125 centipeones contra la mejor
```

### K-nc6x-e5-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nf3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e5
FEN: r1bqkbnr/pp1p1ppp/2n5/4p3/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  mejor:     +0.68  d5 Nd4 Nf3 Nxf3+ Qxf3 Nf6 Be3 Bb4+
  Nf3:       +0.16  Nf3 exd4 Nxd4 Nf6 Nc3 Bb4 Nxc6 bxc6
  pierde 52 centipeones contra la mejor
```

### K-nc6x-e5-nc3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 e5" "Nc3" --prof 18`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 e5
FEN: r1bqkbnr/pp1p1ppp/2n5/4p3/3PP3/8/PP3PPP/RNBQKBNR w KQkq - 0 5
Mueven: blancas · profundidad 18
  mejor:     +0.68  d5 Nd4 Nf3 Nxf3+ Qxf3 Nf6 Be3 Bb4+
  Nc3:       -0.29  Nc3 exd4 Nd5 Nf6 Bc4 Nxd5 Bxd5 Nb4
  pierde 97 centipeones contra la mejor
```

### B-cc6-bg4-h3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4" "h3" --prof 18`

```
Posición tras: e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Bg4
FEN: r3kbnr/pp2pppp/2n5/2pq4/3P2b1/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6
Mueven: blancas · profundidad 18
  mejor:     +0.32  Be2 cxd4 cxd4 e6 Nc3 Qa5 d5 exd5
  h3:        -1.17  h3 Bxf3 Qxf3 Qxf3 gxf3 cxd4 Bb5 e5
  pierde 149 centipeones contra la mejor
```

### B-stoltz-c4

`node scripts/motor-comprobar.ts mejores "e4 c5 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 c4" --prof 18 --n 3`

```
Posición tras: e4 c5 c3 Nf6 e5 Nd5 Nf3 Nc6 Bc4 Nb6 Bb3 c4
FEN: r1bqkb1r/pp1ppppp/1nn5/4P3/2p5/1BP2N2/PP1P1PPP/RNBQK2R w KQkq - 0 7
Mueven: blancas · profundidad 18
  +0.15  Bc2 d6 exd6 Qxd6 O-O g6 Na3 Bg7
  -0.48  Ba4 Nxa4 Qxa4 Qa5 Qxc4 Nxe5 Nxe5 Qxe5+
  -2.11  d4 cxb3 d5 bxa2 Na3 g6 Rxa2 Bg7
```

### Z-nc6x-d5-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d5" "Nf3"`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 d5 · mueven blancas · profundidad 18
  mejor: +0.36  exd5 Qxd5 Nf3 Bg4 Be2 e6 Nc3 Qd7
  Nf3: -0.77  Nf3 dxe4 Ne5 Nxe5 dxe5 Qxd1+ Kxd1 f5
  pierde 113 centipeones contra la mejor
```

### Z-nc6x-d5-exd5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d5" "exd5"`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 d5 · mueven blancas · profundidad 18
  mejor: +0.36  exd5 Qxd5 Nf3 Bg4 Be2 e6 Nc3 Qd7
  exd5: +0.26  exd5 Qxd5 Nf3 Bg4 Be2 e6 O-O Nf6
  pierde 10 centipeones contra la mejor
```

### Z-nc6x-d5-nc3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 cxd4 cxd4 d5" "Nc3"`

```
Posición tras: e4 c5 c3 Nc6 d4 cxd4 cxd4 d5 · mueven blancas · profundidad 18
  mejor: +0.36  exd5 Qxd5 Nf3 Bg4 Be2 e6 Nc3 Qd7
  Nc3: +0.42  Nc3 e6 e5 Nge7 Nf3 Nf5 a3 Bd7
  pierde -6 centipeones contra la mejor
```

### Z-nc6-d5-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 d5" "Nf3"`

```
Posición tras: e4 c5 c3 Nc6 d4 d5 · mueven blancas · profundidad 18
  mejor: +0.24  dxc5 dxe4 Qxd8+ Nxd8 Bb5+ Nc6 Nd2 Nf6
  Nf3: -0.69  Nf3 dxe4 Ne5 Nxe5 dxe5 Qxd1+ Kxd1 f5
  pierde 93 centipeones contra la mejor
```

### Z-nc6-d5-exd5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 Nc6 d4 d5" "exd5"`

```
Posición tras: e4 c5 c3 Nc6 d4 d5 · mueven blancas · profundidad 18
  mejor: +0.24  dxc5 dxe4 Qxd8+ Nxd8 Bb5+ Nc6 Nd2 Nf6
  exd5: +0.12  exd5 Qxd5 Nf3 Nf6 dxc5 Qxd1+ Kxd1 Bf5
  pierde 12 centipeones contra la mejor
```

### Z-g6x-d5-nf3

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 g6 d4 cxd4 cxd4 d5" "Nf3"`

```
Posición tras: e4 c5 c3 g6 d4 cxd4 cxd4 d5 · mueven blancas · profundidad 18
  mejor: +0.74  e5 Nc6 h3 Nh6 Nc3 f6 Bb5 Bg7
  Nf3: -0.17  Nf3 dxe4 Ne5 Bg7 Bb5+ Bd7 Qb3 e6
  pierde 91 centipeones contra la mejor
```

### Z-g6x-d5-exd5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 g6 d4 cxd4 cxd4 d5" "exd5"`

```
Posición tras: e4 c5 c3 g6 d4 cxd4 cxd4 d5 · mueven blancas · profundidad 18
  mejor: +0.74  e5 Nc6 h3 Nh6 Nc3 f6 Bb5 Bg7
  exd5: +0.21  exd5 Nf6 Bc4 Nxd5 Qb3 e6 Nc3 Bg7
  pierde 53 centipeones contra la mejor
```

### Z-bd3-e6-nc6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 e6 d4 Nf6 Bd3 cxd4 cxd4 Nc6" "d5"`

```
Posición tras: e4 c5 c3 e6 d4 Nf6 Bd3 cxd4 cxd4 Nc6 · mueven blancas · profundidad 18
  mejor: +0.70  Ne2 Nb4 Nbc3 Nxd3+ Qxd3 d5 e5 Ng8
  d5: -0.72  d5 exd5 exd5 Nxd5 Ne2 Nf6 O-O d5
  pierde 142 centipeones contra la mejor
```

### Z-bd3-d6-nc6-d5

`node scripts/motor-comprobar.ts jugada "e4 c5 c3 d6 d4 Nf6 Bd3 Nc6" "d5"`

```
Posición tras: e4 c5 c3 d6 d4 Nf6 Bd3 Nc6 · mueven blancas · profundidad 18
  mejor: +1.08  d5 Nb8 c4 g6 f4 Bg7 Nf3 e6
  d5: +1.10  d5 Ne5 Bc2 e6 f4 Ng6 dxe6 fxe6
  pierde -2 centipeones contra la mejor
```

## El plan en cada posición de sus lecciones (notas 5 y 7)

Cada fila se repite con `node scripts/motor-comprobar.ts jugada "<la posición, con la respuesta del rival>" "<la jugada del plan>" --prof 16`.

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


## Las lecciones de Los dos peones del centro (2026-11-25; D1 A de Carlos, "agregarles lección")

Las dos lecciones nuevas: 2...Cc6 3.d4 cxd4 4.cxd4 e6 5.Cf3 Cf6 6.d5 y 2...d6 3.d4 cxd4 4.cxd4 Cf6 5.Cc3 g6 6.Cf3 Ag7 7.Ae2 0-0 8.0-0. Las jugadas del rival salen de las partidas (lichess CC0); donde no hay, de la mejor del motor. Comandos con `node scripts/motor-comprobar.ts`, desde la raíz del repo; "…" abrevia la línea de la lección.

| Id | Afirmación del curso | Comando | Resultado | Veredicto |
|---|---|---|---|---|
| D-cc6-d4 | Contra 2...Cc6, 3.d4 la mejor; buena: Cf3 | `mejores "e4 c5 c3 Nc6" --n 5` | +0.28 d4 · +0.14 Cf3 · +0.05 Ab5 | Se sostiene |
| D-cc6-cxd4 | 4.cxd4 la mejor | `mejores "e4 c5 c3 Nc6 d4 cxd4" --n 5` | +0.40 cxd4 · −0.22 Cf3 | Se sostiene |
| D-cc6-5 | Tras 5.Cf3, la lección sigue 5...Cf6 (3 partidas, como 5...d5): 5...d5 es la mejor del motor, pero con ella la página manda avanzar a e5 y la lección saldría de su forma | `mejores "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3" --n 3` · `jugada "… e6 Nf3" "Nf6"` | +0.51 d5 e5 · +0.87 Cf6 · ...Cf6 a 42 de la mejor | Decisión anotada (`specs/cursos.md` §6, n.º 22) |
| D-cc6-cf3 | 5.Cf3 a 0.03 de la mejor; buenas: Cc3, d5, a3, Ae3 | `mejores "e4 c5 c3 Nc6 d4 cxd4 cxd4 e6" --n 5` | +0.45 Cc3 · +0.42 Cf3 · +0.42 d5 · +0.38 a3 · +0.29 Ae3 | Se sostiene |
| D-cc6-d5 | 6.d5, la regla de la página (con su caballo de dama en c6, d5 contra él), no pierde material; buenas: Cc3 (la mejor), e5, Ad3, Cbd2 | `mejores "… e6 Nf3 Nf6" --n 5` · `mejores "… e6 Nf3 Nf6" --n 4 --prof 22` | +0.83 Cc3 · +0.58 d5 · +0.44 e5 · +0.43 Ad3 · +0.40 Cbd2; a prof. 22, d5 a 49 de Cc3 (+0.43) | Se sostiene: no pierde material; Cc3, en azul (K-nc6x-e6-nf3-nf6-d5) |
| D-cc6-cxe4 | "Si el caballo de f6 se come tu e4, tú te comes el de c6" (ventana: 6...Cxe4 7.dxc6 bxc6) | `jugada "… Nf6 d5" "Nxe4"` · `mejores "… d5 Nxe4" --n 3` · `mejores "… d5 Nxe4 dxc6" --n 3` | ...Cxe4 pierde 285 · +3.14 dxc6 · tras 7.dxc6: +3.06 bxc6 | Se sostiene |
| D-cc6-plan | El plan: si cambia en d5, retomas con el peón de e4; si da jaque desde b4, Cc3 | `plan "… Nf6 d5" "exd5 Nc3 Bd2 Bd3 e5"` | contra 6...exd5 (+0.49): exd5, la mejor · contra 6...Ab4+ (+0.62): Cc3, a 15 | Se sostiene |
| D-d6-d4 | Contra 2...d6, 3.d4 la mejor | `mejores "e4 c5 c3 d6" --n 5` | +0.56 d4 · +0.24 Ae2 | Se sostiene |
| D-d6-cxd4 | 4.cxd4 la mejor | `mejores "e4 c5 c3 d6 d4 cxd4" --n 5` | +0.55 cxd4 · +0.25 Ab5+ | Se sostiene |
| D-d6-cc3 | 5.Cc3 la mejor: defiende e4 con una pieza | `mejores "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" --n 5` | +0.77 Cc3 · +0.55 Ad3 · +0.47 f3 | Se sostiene (C-d6x-nf6) |
| D-d6-e5 | El error 5.e5: dxe5 dxe5 Dxd1+ Rxd1 Cg4 Re1 Cxe5, un peón menos y sin enroque | `jugada "e4 c5 c3 d6 d4 cxd4 cxd4 Nf6" "e5"` · `mejores "… Nf6 e5" --n 3` · `mejores "… e5 dxe5 dxe5" --n 3` · `mejores "… dxe5 Qxd1+ Kxd1" --n 3` | e5 pierde 206 · −1.09 dxe5 · −1.18 Dxd1+ · −1.00 Cg4 Re1 Cxe5 | Se sostiene (C-d6x-nf6-e5) |
| D-d6-cf3 | 6.Cf3, la de las partidas (4 de 7) y la de la página, a 0.23 de la mejor sin perder material; buenas: h3, Ab5+, Ae3, Ae2 | `mejores "… Nf6 Nc3 g6" --n 5` | +0.88 h3 · +0.70 Ab5+ · +0.65 Ae3 · +0.65 Cf3 · +0.63 Ae2 | Se sostiene |
| D-d6-ae2 | 7.Ae2 a 0.03 de la mejor; buenas: Ae3, h3, Ab5+; 7...0-0, la mejor de negras | `mejores "… g6 Nf3 Bg7" --n 5` · `mejores "… Bg7 Be2" --n 3` | +0.79 Ae3 · +0.78 h3 · +0.76 Ae2 · +0.65 Ab5+ · tras Ae2: +0.74 0-0 · +0.76 a6 | Se sostiene |
| D-d6-oo | 8.0-0 la mejor; buenas: h3, Ae3 | `mejores "… Be2 O-O" --n 5` | +0.67 0-0 · +0.66 h3 · +0.62 Ae3 | Se sostiene |
| D-d6-plan | El plan: Ae3 y h3 | `plan "… Be2 O-O O-O" "h3 Be3 d5 e5 Re1"` · `plan "… Bg7 Be2" "Be3 h3"` | contra 8...Ag4 (+0.60): Ae3, la mejor; h3 pierde 10 · contra 8...a6 (+0.83): h3, la mejor; Ae3 pierde 22 · una jugada antes (tras 7.Ae2): contra 0-0, h3 la mejor y Ae3 a 15; contra ...a6, h3 a 23 y Ae3 a 45; ninguna pierde material | Se sostiene |

**En cada posición de las lecciones donde le toca al rival** (§6, n.º 6), con `node scripts/senales-leccion.mjs S-cc6 "<línea>"` y `S-d6`. Donde la siguiente jugada no aplica (4...d5, contra la que la página dice cambiar en d5, Z-nc6x-d5-exd5; 5...Cc6 por 2...d6, contra la que la página dice d5, K-d6x-nf6-nc3-nc6-d5), la fila lo deja ver; en ninguna la jugada que toca pierde material.

| Id | Posición (le toca al rival) | Respuesta | Partidas | Tu jugada | Resultado del motor |
|---|---|---|---|---|---|
| S-cc6-3-Nc6 | e4 c5 c3 | Nc6 | 248 (partidas) | d4 | mejor d4 (+0.32) · d4: +0.41  d4 d5 exd5 Qxd5 dxc5 Qxd1+ Kxd1 Bf5 · pierde -9 |
| S-cc6-3-d6 | e4 c5 c3 | d6 | 92 (partidas) | d4 | mejor d4 (+0.57) · d4: +0.67  d4 Nf6 Bd3 g6 h3 Bg7 Nf3 O-O · pierde -10 |
| S-cc6-5-cxd4 | e4 c5 c3 Nc6 d4 | cxd4 | 106 (partidas) | cxd4 | mejor cxd4 (+0.56) · cxd4: +0.39  cxd4 e6 d5 exd5 exd5 Bb4+ Nc3 Ne5 · pierde 17 |
| S-cc6-5-e6 | e4 c5 c3 Nc6 d4 | e6 | 28 (partidas) | cxd4 | cxd4 no es legal aquí |
| S-cc6-7-e6 | e4 c5 c3 Nc6 d4 cxd4 cxd4 | e6 | 31 (partidas) | Nf3 | mejor Nf3 (+0.51) · Nf3: +0.41  Nf3 d5 e5 Nge7 Na3 Nf5 Nc2 f6 · pierde 10 |
| S-cc6-7-d5 | e4 c5 c3 Nc6 d4 cxd4 cxd4 | d5 | 19 (partidas) | Nf3 | mejor exd5 (+0.36) · Nf3: -0.77  Nf3 dxe4 Ne5 Nxe5 dxe5 Qxd1+ Kxd1 f5 · pierde 113 |
| S-cc6-9-Nf6 | e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 | Nf6 | 3 (partidas) | d5 | mejor Nc3 (+0.91) · d5: +0.50  d5 Bb4+ Nc3 exd5 exd5 Ne7 d6 Ned5 · pierde 41 |
| S-cc6-9-d5 | e4 c5 c3 Nc6 d4 cxd4 cxd4 e6 Nf3 | d5 | 3 (partidas) | d5 | d5 no es legal aquí |
| S-d6-3-Nc6 | e4 c5 c3 | Nc6 | 248 (partidas) | d4 | mejor d4 (+0.32) · d4: +0.41  d4 d5 exd5 Qxd5 dxc5 Qxd1+ Kxd1 Bf5 · pierde -9 |
| S-d6-3-d6 | e4 c5 c3 | d6 | 92 (partidas) | d4 | mejor d4 (+0.57) · d4: +0.67  d4 Nf6 Bd3 g6 h3 Bg7 Nf3 O-O · pierde -10 |
| S-d6-5-cxd4 | e4 c5 c3 d6 d4 | cxd4 | 53 (partidas) | cxd4 | mejor cxd4 (+0.81) · cxd4: +0.47  cxd4 d5 e5 Bf5 Nc3 e6 g4 Bg6 · pierde 34 |
| S-d6-5-Nf6 | e4 c5 c3 d6 d4 | Nf6 | 5 (partidas) | cxd4 | cxd4 no es legal aquí |
| S-d6-7-Nf6 | e4 c5 c3 d6 d4 cxd4 cxd4 | Nf6 | 19 (partidas) | Nc3 | mejor Nc3 (+0.85) · Nc3: +0.71  Nc3 g6 Bb5+ Bd7 Be2 Nc6 h3 Bg7 · pierde 14 |
| S-d6-7-Nc6 | e4 c5 c3 d6 d4 cxd4 cxd4 | Nc6 | 13 (partidas) | Nc3 | mejor d5 (+1.22) · Nc3: +1.05  Nc3 e6 Nf3 Nf6 Bd3 Be7 Be3 O-O · pierde 17 |
| S-d6-9-g6 | e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 | g6 | 7 (partidas) | Nf3 | mejor Bb5+ (+0.74) · Nf3: +0.69  Nf3 Bg7 h3 O-O Be2 d5 e5 Ne4 · pierde 5 |
| S-d6-9-Nc6 | e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 | Nc6 | 3 (partidas) | Nf3 | mejor d5 (+1.28) · Nf3: +0.86  Nf3 d5 e5 Ne4 Bd3 Bf5 Qb3 Nc5 · pierde 42 |
| S-d6-11-Bg7 | e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 g6 Nf3 | Bg7 | 4 (motor) | Be2 | mejor h3 (+0.77) · Be2: +0.78  Be2 Bg4 O-O Nc6 Be3 O-O d5 Bxf3 · pierde -1 |
| S-d6-11-a6 | e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 g6 Nf3 | a6 | motor | Be2 | mejor h3 (+0.98) · Be2: +1.00  Be2 Bg7 e5 Nfd7 exd6 exd6 Bf4 O-O · pierde -2 |
| S-d6-13-O-O | e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 g6 Nf3 Bg7 Be2 | O-O | motor | O-O | mejor h3 (+0.68) · O-O: +0.60  O-O Bg4 Be3 Bxf3 Bxf3 Nc6 Ne2 Rc8 · pierde 8 |
| S-d6-13-a6 | e4 c5 c3 d6 d4 cxd4 cxd4 Nf6 Nc3 g6 Nf3 Bg7 Be2 | a6 | motor | O-O | mejor e5 (+0.91) · O-O: +0.90  O-O O-O h3 b5 e5 dxe5 dxe5 Nfd7 · pierde 1 |
