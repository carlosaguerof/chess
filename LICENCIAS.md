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
| @fontsource/inter (tipografía Inter, Rasmus Andersson) | 5.3.0 | OFL-1.1 | <https://github.com/fontsource/font-files> · <https://rsms.me/inter/> | la única letra de la interfaz (§3.6 de la limpieza), instalada en el proyecto |
| @dicebear/core, @dicebear/toon-head, @dicebear/avataaars, @dicebear/open-peeps (DiceBear, Florian Körner) | 9.4.2 | MIT (el código; los dibujos, abajo) | <https://github.com/dicebear/dicebear> · <https://www.dicebear.com/licenses/> | dibujan en el navegador el retrato de cada personaje (L1) |

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
| Retratos estilo **Ilustrado**: *ToonHead*, de Johan Melin (vía DiceBear `toon-head`) | **CC BY 4.0** (pide atribución: va en la app, en "Código fuente y licencias") | fuente: <https://www.figma.com/community/file/1589627891082866389> · autor: <https://www.johanmelin.com> · licencia: <https://creativecommons.org/licenses/by/4.0/> · confirmada en <https://www.dicebear.com/styles/toon-head/> el 2026-10-28 | `node_modules/@dicebear/toon-head` (su `LICENSE`) | el estilo recomendado de los personajes. **Cambios:** cada personaje combina piezas del estilo (pelo, barba, ropa, gesto) y colores propios |
| Retratos estilo **Caricatura**: *Avataaars*, de Pablo Stanley (vía DiceBear `avataaars`) | "Free for personal and commercial use" (libre para uso personal y comercial; así lo dice su fuente) | fuente: <https://avataaars.com/> ("Designed by Pablo Stanley · Free for personal and commercial use", leído el 2026-10-28) · <https://www.dicebear.com/styles/avataaars/> | `node_modules/@dicebear/avataaars` (su `LICENSE`) | segundo estilo, a escoger en Ajustes |
| Retratos estilo **Dibujado a mano**: *Open Peeps*, de Pablo Stanley (vía DiceBear `open-peeps`) | **CC0 1.0** (dominio público) | fuente: <https://www.openpeeps.com/> ("Free for commercial and personal use under CC0 License", leído el 2026-10-28) · licencia: <https://creativecommons.org/publicdomain/zero/1.0/> | `node_modules/@dicebear/open-peeps` (su `LICENSE`) | tercer estilo, a escoger en Ajustes |
| Texto de la GPL v3 | se permite copiarlo tal cual | <https://www.gnu.org/licenses/gpl-3.0.txt> | `LICENSE` | la licencia de la app |

Lo propio: el tema del tablero (verde y crema), los íconos (también los de instalar la app en el iPhone, `public/icono*`), los rasgos de cada personaje (`aspecto` en `src/bots/personajes.json`: edad, piel, peinado, barba, lentes, ropa y gesto), los sonidos (generados en el navegador, `src/sonido/`), sus nombres y frases, y los planes de las aperturas (redactados por la IA) son de este repo, bajo la misma GPL.

Lo que no se usa, a propósito: ningún archivo ni marca de chess.com (logo, piezas, sonidos, imágenes, avatares, nombres de sus bots).
