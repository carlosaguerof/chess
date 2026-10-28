# Licencias de lo que viene de fuera

La app es de uso personal y no se distribuye. Si algún día se distribuye, por `chessground` y `stockfish` (GPL-3.0) la app completa sería GPL-3.0; por eso `package.json` ya dice `GPL-3.0-only`.

## Dependencias (npm)

| Paquete | Versión | Licencia | Para qué |
|---|---|---|---|
| react, react-dom | 19.3.1 | MIT | la interfaz |
| vite | 8.3.5 | MIT | construir y servir |
| @vitejs/plugin-react | 6.1.2 | MIT | React en Vite |
| typescript | 5.9.3 | Apache-2.0 | tipos |
| vitest | 5.0.5 | MIT | pruebas de lógica |
| @playwright/test | 1.64.1 | Apache-2.0 | pruebas de punta a punta (WebKit y Chromium) |
| chess.js | 1.4.0 | BSD-2-Clause | reglas del ajedrez |
| chessground | 9.2.1 | GPL-3.0 | el tablero (el de lichess) |
| stockfish (stockfish.js, Nathan Rugg / Chess.com) | 19.0.1 | GPL-3.0 | el motor, versión lite de un solo hilo en WebAssembly |
| @fontsource/inter | 5.3.0 | OFL-1.1 (Inter, Rasmus Andersson) | tipografía de la interfaz, instalada en el proyecto |
| @fontsource/jetbrains-mono | 5.3.0 | OFL-1.1 (JetBrains) | tipografía de las jugadas |

## Datos y recursos

| Recurso | Licencia | Dónde está | Para qué |
|---|---|---|---|
| Piezas cburnett (Colin M.L. Burnett), vía `chessground/assets/chessground.cburnett.css` | CC BY-SA 3.0 | `node_modules/chessground/assets/` | las piezas del tablero |
| Lista de aperturas de lichess (`lichess-org/chess-openings`, commit `f06a50d`): nombres, ECO y jugadas | CC0 1.0 (dominio público), confirmada en su `COPYING.txt` y en la API de GitHub | `input/lichess-chess-openings/` | nombres y jugadas de la base; aperturas de la calibración |
| Motor copiado a `public/motor/` al construir (`scripts/copiar-motor.mjs`) | GPL-3.0 (`COPYING-stockfish.txt` va junto) | `public/motor/` (no se sube a git) | el motor del bot en el navegador |

Lo que no se usa, a propósito: ningún archivo de chess.com (logo, piezas, sonidos, imágenes, avatares, nombres de sus bots).
