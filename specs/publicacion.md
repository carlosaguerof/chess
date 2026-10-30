# Publicación (specs)

> Decisiones 15, 16 y 17 de `log.md` (MVP Notas 6 a 9).

## Dónde y cómo

- La app se publica en **GitHub Pages**, desde este mismo repo (público): <https://carlosaguerof.github.io/chess/>.
- `npm run publicar` construye con la ruta base `/chess/` (`npm run build:pages` → `dist-pages/`) y sube el sitio construido a la rama **`gh-pages`** como un commit encima del anterior, con un push normal (nunca forzado). `npm run publicar -- --prueba` lista lo que subiría sin subir nada. Script: `scripts/publicar.mjs`.
- Pages sirve la rama `gh-pages` desde la raíz.

## Cuándo

- Solo con **`npm test` y `npm run e2e` en verde**, y solo si `gh repo view carlosaguerof/chess --json visibility` dice `PUBLIC` (el script lo revisa).
- **La corrida final antes de publicar va en GitHub** (`.github/workflows/pruebas.yml`, cómo se lanza: `AGENTS.md`), sobre la rama que se va a publicar. **En la Air, mientras se trabaja, Chromium**: el perfil del iPhone en WebKit llena el WindowServer y tira la pantalla (`iterations/v3/learning.md` n.º 15 y 36).
- Publicar está autorizado al cerrar una corrida que lo diga en su instructivo; fuera de eso, solo cuando Carlos lo pida.

## Comprobación después de publicar

1. `curl -sI https://carlosaguerof.github.io/chess/` da 200, y el `.wasm` del motor sale como `application/wasm`.
2. **Playwright contra la página publicada corre en GitHub,** con `.github/workflows/pagina-publicada.yml`, los dos perfiles: `npm run e2e:pages` (`playwright.publicado.config.ts`) con `SITIO=https://carlosaguerof.github.io/chess/`, y el iPhone en WebKit, que en la Air no se corre. Abre la app y el bot juega; y sin internet la app carga y el bot juega (service worker). Se lanza a mano después de publicar (`AGENTS.md`), prueba la página con las pruebas de `main`, no hace commits ni publica nada, y deja `test-results-publicado/` en un artefacto de 14 días.

## Licencia (GPL)

- Stockfish y chessground son GPL-3.0: como la página es pública, el código fuente completo está en este repo público, bajo **GPL-3.0-or-later** (`LICENSE`).
- `LICENCIAS.md` lista cada dependencia y cada recurso de fuera con su licencia y su enlace (también los de las ilustraciones de los personajes).
- En la app, en el menú Más, "Código fuente y licencias" lleva al repo y a `LICENCIAS.md`, con las atribuciones que piden atribución.

## Commits

- Este repo es público: los commits van con el **correo privado de GitHub** (`git config user.email` = la dirección `…@users.noreply.github.com`), nunca con el correo personal.
- Nada privado en el repo: ni secretos, ni datos personales, ni capturas de otros productos (las de chess.com se quedan en el repo privado de la dirección).
