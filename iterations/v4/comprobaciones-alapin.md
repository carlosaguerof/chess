# Las comprobaciones con el motor del curso de la Alapin (2026-11-25)

Stockfish 19 lite de un hilo (el del repo), profundidad 18 (16 para las amenazas y para `planes-todos`). Evaluaciones desde blancas. Los scripts, fuera del repo (`00_corridas/_local/chess/curso-alapin/`): `motor.mjs` (los modos `mejores`, `jugada` y `amenaza`), `linea.mjs` (la línea, jugada por jugada, con las 5 mejores) y `plan.mjs` (las jugadas de un plan contra las dos mejores respuestas). Cada id es el que cita el curso en su campo `motor`.

| id | Afirmación | Comando | Resultado |
|---|---|---|---|
| R-d5 | Contra 2...d5, 3.exd5 es la mejor (la regla del mapa) | `—` | Se sostiene: +0.31, la mejor |
| R-d5-d4 | Defender e4 con 3.d4 sale peor | `—` | Se sostiene: pierde 101 (−0.64) |
| R-d5-e5 | 3.e5 es peor que cambiar | `—` | Se sostiene: pierde 35 |
| R-d5-d3 | 3.d3 es peor que cambiar | `—` | Se sostiene: pierde 51 |
| R-nf6 | Contra 2...Cf6, 3.e5 es la mejor (la regla del mapa) | `—` | Se sostiene: +0.17, la mejor |
| R-nf6-d4 | Si no atiendes e4 (3.d4), el caballo lo toma | `—` | Se sostiene: 3.d4 Cxe4, pierde 88 |
| R-nf6-d3 | 3.d3 es peor que avanzar | `—` | Se sostiene: pierde 20 |
| R-nf6-bd3 | 3.Ad3 es peor que avanzar | `—` | Se sostiene: pierde 40 |
| R-nc6 | Contra 2...Cc6, 3.d4 | `—` | Se sostiene: +0.30, la mejor |
| R-d6 | Contra 2...d6, 3.d4 | `—` | Se sostiene: +0.57, la mejor |
| R-e6 | Contra 2...e6, 3.d4 | `—` | Se sostiene: +0.28, la mejor |
| R-g6 | Contra 2...g6, 3.d4 | `—` | Se sostiene: +0.48, la mejor |
| R-e5 | Contra 2...e5, la regla no se aplica (por eso no se dice "lo demás") | `—` | 3.Cf3 +0.52; 3.d4 +0.16 |
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
| F-gam | Contra el gambito, 4.Da4+ es la mejor (4.Ab5+ a 0.29) | `—` | Se sostiene |
| F-nf6-4 | 4.d4 y 4.Cf3 casi empatan (Stoltz y Heidenfeld van por 4.Cf3) | `—` | Se sostiene: +0.11 y +0.13 |
| F-nf6d4 | Tras 4...cxd4, 5.cxd4 está a 0.04 de la mejor | `—` | Se sostiene |
| A-d5 | 2...d5 amenaza ...dxe4 | `—` | Se sostiene: si negras jugara otra vez, dxe4 (−1.16) |
| A-nf6 | 2...Cf6 amenaza ...Cxe4 | `—` | Se sostiene: −1.44 |
| A-nf6-e5 | 3.e5 ataca al caballo: tiene que moverse | `—` | Se sostiene: si blancas jugara otra vez, exf6 (+5.98) |
| A-bg4 | 6...Ag4 amenaza cambiar en f3 y ganar d4 | `—` | Se sostiene: Axf3 gxf3 Cxd4 (−1.40) |
| A-mod-bg4 | 5...Ag4 clava el caballo | `—` | Amenaza Axf3 (−0.45) |
| A-h3 | 7.h3 ataca al alfil | `—` | Se sostiene: hxg4 (+6.77) |
| A-c3-nc3 | 8.Cc3 ataca la dama (Cambio Central) | `—` | Se sostiene: Cxd5 (+7.54) |
| A-cc6-nc3 | 8.Cc3 ataca la dama (4...Cc6) | `—` | Se sostiene: Cxd5 (+6.79) |
| A-g6-nc3 | 8.Cc3 ataca la dama (4...g6) | `—` | Se sostiene: Cxd5 (+6.86) |
| A-d6 | 5...d6 ataca la punta de la cadena | `—` | Amenaza dxe5 |
| A-nb6 | 7...Cb6 ataca el alfil de c4 | `—` | Se sostiene: Cxc4 (−5.26) |
| A-gam-bd7 | 4...Ad7 ataca la dama de a4 | `—` | Se sostiene: Axa4 (−8.51) |
| A-gam-b3 | 5.Db3 ataca b7 | `—` | Se sostiene: Dxb7 (+3.54) |
| A-gam-e6 | 5...e6 ataca otra vez d5 | `—` | Se sostiene: exd5 (−1.73) |
| E-d4 | «¿Y si…?» 3.d4 contra 2...d5: error tuyo | `—` | Se sostiene: pierde 101 |
| E-d4-b | Lo castiga 3...dxe4 | `—` | Se sostiene: la mejor (−0.68) |
| E-d4-c | Tras 3...dxe4, 4.dxc5 Dxd1+ 5.Rxd1: el rey blanco ya no enroca | `—` | Se sostiene: −0.65 |
| E-nc3 | «¿Y si…?» 6.Cc3 antes que Cf3: pierde d4 | `—` | Se sostiene: pierde 63; 6...Dxd4 |
| E-nc3-b | Lo castiga 6...Dxd4 | `—` | Se sostiene: la mejor (−0.33); las demás, +1.84 y más |
| E-nc3-c | Tras 6...Dxd4, negras sigue con el peón de más | `—` | Se sostiene: −0.42 |
| E-ne4 | «¿Y si…?» 3...Ce4: error del rival | `—` | Se sostiene: pierde 399 |
| E-ne4-b | Lo castiga 4.d3 | `—` | Se sostiene: la mejor (+4.34) |
| E-ne4-c | Tras 4.d3, el caballo se pierde: 4...Cxf2 5.Rxf2 | `—` | Se sostiene: +4.43 |
| E-glot | «¿Y si…?» 8...Dxd4: la dama glotona | `—` | Se sostiene: pierde 813 |
| E-glot-b | Lo castiga 9.Axc6+ | `—` | Se sostiene: +9.16, la mejor |
| P-cc | El plan del aislado al final del Cambio Central: enrocar sí; "caballo a e5" no | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 cxd4 cxd4 Nc6 Nf3 Bg4 Be2 e6 Nc3" "O-O Ne5 Be3 h3"` | 0-0 empata con la mejor; 9.Ce5 pierde 93 y 622 |
| P-mod | Al final de la Moderna: 11.Cc3 la mejor; Ce5 no | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nf6 Nf3 Bg4 Be2 e6 h3 Bh5 O-O Nc6 Be3 cxd4 cxd4" "Nc3 Ne5"` | Ce5 pierde 78 y 40 |
| P-cc6 | Al final de 4...Cc6: sacar el alfil y enrocar; Ce5 no | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 Nc6 Nf3 Nf6 Be3 cxd4 cxd4 e6 Nc3" "O-O-O Be2 Bd3 Bc4 Ne5"` | Ce5 pierde 55 y 80 |
| P-g6 | Al final de 4...g6: enrocar | `node plan.mjs "e4 c5 c3 d5 exd5 Qxd5 d4 g6 Nf3 Bg7 Be2 cxd4 cxd4 Nf6 Nc3" "O-O Be3 Ne5"` | 0-0 la mejor o empata |
| P-cf6 | Al final de 2...Cf6: si negras cambia en e5, 9.Cxe5 (no 9.dxe5) | `node plan.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"` | Se sostiene: 9.Cxe5 +0.08; 9.dxe5 pierde 83 |
| P-gam | Al final del Gambito sigues con un peón de más, y Cf3 y 0-0 siguen | `node linea.mjs "e4 c5 c3 d5 exd5 Nf6 Qa4+ Bd7 Qb3 e6 dxe6 Bxe6 Bc4 Bxc4 Qxc4" w (FIN)` | Se sostiene |
| V-cf6-dxe5 | "Ver": 8...dxe5 9.Cxe5 deja el peón de d4 sin peones al lado | `node plan.mjs "e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 cxd4 d6 Nf3 Nc6 Bc4 Nb6 Bb5" "Nxe5 dxe5 O-O Nc3 exd6"` | Se sostiene (chess.js: sin peones blancos en c ni e) |
| C-d6-nf6 | Los dos peones: contra 2...d6 3.d4 Cf6, defender e4 con 4.Ad3 | `—` | Se sostiene: la mejor (+0.57) |
| C-d6-nf6-e5 | Ahí, avanzar a e5 pierde | `—` | Se sostiene: pierde 129 |
| C-d6x-nf6 | Con 3...cxd4 4.cxd4 Cf6, defender con 5.Cc3 | `—` | Se sostiene: la mejor (+0.92) |
| C-d6x-nf6-e5 | Ahí, 5.e5 pierde un peón y el enroque | `—` | Se sostiene: pierde 206 |
| C-nc6x-nf6-e5 | Con 2...Cc6 … 4...Cf6, 5.e5 pierde | `—` | Se sostiene: pierde 232 (5.Cc3 +0.45) |
| C-e6x-nf6-e5 | Con 2...e6 … 4...Cf6, 5.e5 pierde | `—` | Se sostiene: pierde 54 (5.Cc3, la mejor) |
| C-nc6x-e6 | Los dos peones: Cf3 y Cc3 contra ...e6 | `—` | Se sostiene: +0.37 y +0.35 |
| C-nc6x-g6-nf3 | Contra ...g6, Cf3 primero no pierde material | `—` | Se sostiene: +0.86 (pierde 119 contra 5.d5) |
| N-c-nc6-qb6-nc3 | Con ...Db6, 5.Cc3 pierde el peón de d4 | `—` | Se sostiene: pierde 223 (5...Dxd4) |
| N-c-nc6-qb6-nf3 | Con ...Db6, 5.Cf3 defiende d4 | `—` | Se sostiene: +1.52 |
| I-qxd5-be2 | El aislado: el alfil antes que Cf3 deja que la dama tome g2 | `—` | Se sostiene: pierde 124 |
| I-cc-nc6-be2 | Tras 5...Cc6, el alfil antes que Cf3 deja que la dama tome d4 | `—` | Se sostiene: pierde 110 |
| N-mod-cxd4-bg4-be2 | La clavada sin ...Cc6: 7.Ae2 no pierde material | `—` | Se sostiene: +0.30 (7.Cc3 +1.00) |
| N-cc-nf6-nf3-bg4-be2 | La clavada sin ...Cc6 (5...Cf6): 7.Ae2 no pierde material | `—` | Se sostiene: +0.27 (7.Cc3 +0.90) |
| G-e6-nf3 | El gambito: tras 5...e6, sacar piezas (6.Cf3) pierde | `—` | Se sostiene: pierde 208; 6.dxe6 y 6.Dxb7 sirven |

## Las salidas, tal cual

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

