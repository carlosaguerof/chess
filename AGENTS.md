# AGENTS.md — reglas para trabajar en este repo

## Qué es
Una web app personal (un solo usuario, sin cuentas, sin servidor) para **aprender y enseñar mis aperturas y defensas con sus variaciones**: bots con personaje y nivel para practicarlas, una base de conocimiento de aperturas, mi repertorio encima de ella, cursos para practicarlo y una guía dentro de la partida real. Qué es, para quién y qué es éxito: `context/producto.md`. Lo que no entra: `context/despues.md`.

## Capas (modo Capas de la dirección)
- `context/` — qué es, para quién, principios de producto.
- `specs/` — las reglas: motor y niveles, personajes, repertorio, UX.
- `input/` — mi insumo tal cual y los datos abiertos de aperturas con su licencia.
- `conocimiento/` — la base de aperturas (datos que usa la app + una página Markdown por apertura).
- `iterations/v1/` — esta vuelta: `manifest.md` y las capturas.
- Código en la raíz: `src/`, `scripts/`, `tests/`.

## Cómo se corre y se prueba
```
npm ci                          # dependencias (Node 26, npm 11)
npx playwright install webkit chromium
npm run dev                     # http://localhost:5174
npm run build                   # tsc -b + vite build
npm test                        # Vitest (lógica)
npm run e2e                     # Playwright: perfil iphone (WebKit 390×844) y escritorio (Chromium 1440×900)
npm run casa                    # construye y sirve en la red de la casa, puerto 4173
```
Las capturas de Playwright van a `iterations/v1/capturas/<perfil>/`.

## Principios
- Producto y UX: `/Users/carlosaguerof/01_repos/00_direccion/principios/producto.md` (Nielsen + Maister + lo de Carlos). Su aterrizaje en esta app: `context/producto.md` §2.
- Todo en español. Notación de piezas **R D T A C**, `0-0` y `0-0-0`.
- **Nada se inventa en las aperturas.** La teoría estándar de la base (`conocimiento/`, con su fuente y validada con el motor) es la fuente de verdad. Mi guía (`input/`) solo dice qué aperturas quiero aprender; si no coincide con la teoría, gana la teoría.
- Pantallas y flujo como chess.com; **nunca sus archivos ni su marca** (ni piezas, ni sonidos, ni avatares, ni nombres de bots). Todo propio o abierto, con la licencia en `LICENCIAS.md`.
- Sin secretos en el repo ni en el chat. No hay llaves: todo corre en el navegador.
- No se publica nada (sin deploy) sin que Carlos lo pida.

## Git
- Una rama por tarea: `feat/t<N>-<tema>`. Al cumplir la aceptación: `git merge --no-ff` a `main`, `git branch -d`, `git push origin main`.
- Commits en español con prefijo `feat:`, `fix:`, `test:`, `docs:`, `chore:`. `git add` con rutas explícitas, nunca `-A` ni `.`.
- Borrar es mover a la papelera (`mv <ruta> ~/.Trash/<nombre>-<AAAAMMDD-HHMMSS>`). Nunca `rm -r`, `push --force`, `reset --hard` ni `clean`.
