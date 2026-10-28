# chess — mis aperturas

Web app personal para aprender mis aperturas y defensas: bots con personaje y nivel, base de conocimiento de aperturas, mi repertorio, cursos y guía en la partida real. Todo corre en el navegador; nada se publica.

```
npm ci && npx playwright install webkit chromium
npm run dev      # http://localhost:5174
npm test         # lógica (Vitest)
npm run e2e      # punta a punta (Playwright, iPhone y escritorio)
npm run casa     # para jugar desde el iPhone en la red de la casa (puerto 4173)
```

Licencia: GPL-3.0-or-later (`LICENSE`); lo de fuera, con su licencia, en `LICENCIAS.md`. Reglas para trabajar aquí: `AGENTS.md`. Qué es y para quién: `context/producto.md`.
