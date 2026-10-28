# chess — mis aperturas

Web app personal para aprender mis aperturas y defensas: bots con personaje y nivel, base de conocimiento de aperturas, mi repertorio, cursos y guía en la partida real. Todo corre en el navegador; nada se publica.

```
npm ci && npx playwright install webkit chromium
npm run dev      # http://localhost:5174
npm test         # lógica (Vitest)
npm run e2e      # punta a punta (Playwright, iPhone y escritorio)
npm run casa     # para jugar desde el iPhone en la red de la casa (puerto 4173)
```

**Desde el iPhone, en casa:** en la Air corre `npm run casa` (déjalo abierto) y en Safari del iPhone abre <http://air-station.local:4173/>. El iPhone y la Air tienen que estar en la misma red. Para cerrarlo, Ctrl+C en la Air.

**Instalarla en el iPhone (R1):** abre la página en Safari → Compartir → "Agregar a inicio". La primera vez guarda lo que necesita; después abre y el bot juega sin internet. (Solo en la app construida: `npm run casa` o la página publicada, no en `npm run dev`.)

Licencia: GPL-3.0-or-later (`LICENSE`); lo de fuera, con su licencia, en `LICENCIAS.md`. Reglas para trabajar aquí: `AGENTS.md`. Qué es y para quién: `context/producto.md`.

## Publicar (GitHub Pages)

La app se publica desde este mismo repo, en la rama `gh-pages`: <https://carlosaguerof.github.io/chess/>.

```
npm run publicar -- --prueba   # construye con la ruta /chess/ y lista lo que subiría, sin subir nada
npm run e2e:pages              # prueba ese sitio servido en local en /chess/ (el motor carga y el bot juega)
npm run publicar               # sube el sitio a gh-pages (solo si el repo es público; un commit nuevo, nunca forzado)
SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages   # prueba la página ya publicada
```

GitHub Pages se prende una sola vez, con la rama `gh-pages` en la raíz como fuente:
`gh api -X POST repos/carlosaguerof/chess/pages -f "source[branch]=gh-pages" -f "source[path]=/"`.
