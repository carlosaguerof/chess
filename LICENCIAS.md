# Licencias

**La app** (todo el código propio de este repo) es software libre bajo la **GNU General Public License v3.0 o posterior** (`GPL-3.0-or-later`). El texto completo está en [`LICENSE`](LICENSE). Código fuente: <https://github.com/carlosaguerof/chess>.

Por qué GPL: el tablero (chessground) y el motor (Stockfish) son GPL-3.0, y la app los incluye en el sitio que se publica. Al publicar el sitio, el código fuente completo queda disponible en este repo público, con la misma licencia.

## Dependencias que van dentro de la app

| Paquete | Versión | Licencia | Enlace | Para qué |
|---|---|---|---|---|
| chessground | 9.2.1 | GPL-3.0-or-later | <https://github.com/lichess-org/chessground> | el tablero (el de lichess) |
| stockfish (stockfish.js de Nathan Rugg, basado en Stockfish) | 19.0.1 | GPL-3.0 | <https://github.com/nmrugg/stockfish.js> · <https://github.com/official-stockfish/Stockfish> | el motor de los bots: `stockfish-19-lite-single.js` + `.wasm`, copiado a `public/motor/` con su licencia (`COPYING-stockfish.txt`) |
| chess.js | 1.4.0 | BSD-2-Clause | <https://github.com/jhlywa/chess.js> | las reglas del ajedrez |
| react, react-dom | 19.3.1 | MIT | <https://github.com/facebook/react> | la interfaz |
| @fontsource/inter (tipografía Inter, Rasmus Andersson) | 5.3.0 | OFL-1.1 | <https://github.com/fontsource/font-files> · <https://rsms.me/inter/> | letra de la interfaz, instalada en el proyecto |
| @fontsource/jetbrains-mono (JetBrains Mono) | 5.3.0 | OFL-1.1 | <https://github.com/fontsource/font-files> · <https://www.jetbrains.com/lp/mono/> | letra de las jugadas |

## Herramientas (no van dentro de la app)

| Paquete | Versión | Licencia | Enlace |
|---|---|---|---|
| vite | 8.3.5 | MIT | <https://github.com/vitejs/vite> |
| @vitejs/plugin-react | 6.1.2 | MIT | <https://github.com/vitejs/vite-plugin-react> |
| typescript | 5.9.3 | Apache-2.0 | <https://github.com/microsoft/TypeScript> |
| vitest | 5.0.5 | MIT | <https://github.com/vitest-dev/vitest> |
| @playwright/test | 1.64.1 | Apache-2.0 | <https://github.com/microsoft/playwright> |

## Datos y recursos de fuera

| Recurso | Licencia | Enlace | Dónde está | Para qué |
|---|---|---|---|---|
| Piezas cburnett (Colin M.L. Burnett), incluidas en chessground | CC BY-SA 3.0 (también GPL) | <https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces> | `node_modules/chessground/assets/chessground.cburnett.css` | las piezas del tablero |
| Lista de aperturas de lichess (`lichess-org/chess-openings`, commit `f06a50d`) | CC0 1.0 (dominio público) | <https://github.com/lichess-org/chess-openings> | `input/lichess-chess-openings/` (con su `COPYING.txt`) | nombres, ECO y jugadas de la base; aperturas de la calibración |
| Texto de la GPL v3 | se permite copiarlo tal cual | <https://www.gnu.org/licenses/gpl-3.0.txt> | `LICENSE` | la licencia de la app |

Lo propio: el tema del tablero (verde y crema), los íconos (también los de instalar la app en el iPhone, `public/icono*`), los avatares de los personajes (dibujados en el código, `CaraGenerada.tsx`), los sonidos (generados en el navegador, `src/sonido/`), sus nombres y frases, y los planes de las aperturas (redactados por la IA) son de este repo, bajo la misma GPL.

Lo que no se usa, a propósito: ningún archivo ni marca de chess.com (logo, piezas, sonidos, imágenes, avatares, nombres de sus bots).
