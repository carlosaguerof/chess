# La base de conocimiento de aperturas

Teoría estándar: cada línea es una fila de la lista abierta de aperturas de lichess (`lichess-org/chess-openings`, CC0, en `input/`), copiada tal cual. Cada jugada del lado que se aprende está validada con el motor (Stockfish 19 lite, profundidad 18): ninguna pierde más de 1 peón contra la mejor. Los planes los redactó la IA y así se marcan.

- Datos que usa la app: `base.json` (133 variantes en 11 aperturas).
- Validación con el motor: `validacion-motor.json` (346 jugadas; la que más pierde, 69 centipeones).
- Cómo se arma: `npm run base` (construye) y `npm run validar-base` (valida con el motor). Las definiciones curadas están en `scripts/base/definiciones/`.
- Por qué entraron las populares: `fuentes-aperturas-populares.md` (fuentes de enseñanza para principiantes, citadas).

| Apertura | Para ti | Variantes | Página |
|---|---|---|---|
| Apertura Italiana (Italian Game, C50–C59) | tu repertorio (blancas) | 13 | [italiana.md](italiana.md) |
| Defensa Siciliana (Sicilian Defense, B20–B99) | tu repertorio (blancas: Alapin) · popular con negras | 23 | [siciliana.md](siciliana.md) |
| Defensa Caro-Kann (Caro-Kann Defense, B10–B19) | tu repertorio (negras; el Avance también con blancas) | 22 | [caro-kann.md](caro-kann.md) |
| Defensa Francesa (French Defense, C02) | tu repertorio (blancas: Avance) | 7 | [francesa.md](francesa.md) |
| Defensa Escandinava (Scandinavian Defense, B01) | tu repertorio (blancas: captura) · popular con negras | 10 | [escandinava.md](escandinava.md) |
| Otras defensas contra 1.e4 (Other defenses to 1.e4, B00–B09) | tu repertorio (blancas: principios) | 8 | [otros-1e4.md](otros-1e4.md) |
| Defensa Eslava (Slav Defense, D10–D19, D43) | tu repertorio (negras) | 13 | [eslava.md](eslava.md) |
| Otras aperturas de blancas (tú con negras) (Other White openings, A00–A14, D02) | tu repertorio (negras: ...c6 + ...d5) | 8 | [otros-negras.md](otros-negras.md) |
| Sistema Londres (London System, A45–A48, D00–D02) | popular con blancas | 7 | [londres.md](londres.md) |
| Gambito de Dama (Queen's Gambit, D06–D69) | popular con blancas | 12 | [gambito-dama.md](gambito-dama.md) |
| Gambito de Dama Declinado (Queen's Gambit Declined, D30–D69) | popular con negras contra 1.d4 | 10 | [gambito-dama-declinado.md](gambito-dama-declinado.md) |
