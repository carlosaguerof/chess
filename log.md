# Bitácora — chess

Solo crece (nunca se reescribe una entrada vieja). Cada entrada empieza con `## [AAAA-MM-DD] <decisión|cambio|corrida|aprendizaje> | <título>` y dice **qué** cambió, **por qué** (la lógica), **quién** lo decidió y **dónde** quedó (commit, archivo o instructivo).

Para leerla de un vistazo: `grep "^## \[" log.md`.

Los instructivos de cada corrida viven fuera de este repo (en el repo privado de la dirección); aquí se citan por nombre: **MVP** = `2026-10-28_INSTRUCTIVO_mvp.md`, **Limpieza** = `2026-10-28_INSTRUCTIVO_limpieza-visual.md`.

---

## [2026-10-28] cambio | El repo nace vacío
- **Qué:** primer commit (`5be7450`) y la base del proyecto: Vite + React + TypeScript, Vitest y Playwright con dos perfiles, iPhone (WebKit 390×844) y escritorio (Chromium 1440×900) (`7cd2b53`).
- **Por qué:** todo lo que se construya se demuestra con pruebas que corren, en el aparato donde se usa (el iPhone) y en la computadora.
- **Quién:** la corrida MVP, con el instructivo de Carlos.
- **Dónde:** `5be7450`, `7cd2b53`, merge `997c5cb` (T1).

## [2026-10-28] decisión | 1. Chess es para aprender mis aperturas y defensas, no para copiar chess.com
- **Qué:** un sistema para aprender (y que me enseñe) mis aperturas y defensas con sus variaciones.
- **Por qué:** el objetivo final es aprender las líneas; los bots y lo demás son el medio. Ante la duda, gana lo que más ayuda a aprenderlas.
- **Quién:** Carlos.
- **Dónde:** MVP §1; `context/producto.md` §1.

## [2026-10-28] decisión | 2. Para un solo usuario, sin cuentas
- **Qué:** la app es para Carlos (ELO 700 en Rapid), sin cuentas ni servidor.
- **Por qué:** con un usuario sobra todo lo que piden muchos usuarios (rating, trampas, servidor).
- **Quién:** Carlos.
- **Dónde:** MVP §1; `context/producto.md`.

## [2026-10-28] decisión | 3. El MVP empieza contra la computadora; jugar en línea queda fuera
- **Qué:** solo partidas contra bots.
- **Por qué:** es lo más chico que ya sirve. En línea, con rating y control de trampas, es varias veces más grande (principio C2: un MVP no tiene que estar libre de fricción).
- **Quién:** Carlos.
- **Dónde:** MVP §4.1; `context/despues.md`.

## [2026-10-28] decisión | 4. 47 personajes, más densos donde juego
- **Qué:** 1 por nivel de 100 a 400 y de 1600 a 3000; 3 por nivel de 500 a 1000; 2 de 1100 a 1500.
- **Por qué:** la densidad va donde Carlos juega (500–1000), con variedad para practicar contra rivales distintos.
- **Quién:** Carlos.
- **Dónde:** MVP §4.1; `src/bots/personajes.json`.

## [2026-10-28] decisión | 5. El estilo de un personaje son sus aperturas, más un temperamento
- **Qué:** cada bot abre y se defiende con aperturas de la base, y es agresivo, equilibrado o defensivo.
- **Por qué:** es lo único documentado de cómo se distinguen los bots de chess.com, y sirve directo al objetivo: practicar contra distintas defensas.
- **Quién:** Carlos.
- **Dónde:** MVP §4.1 y T17; `specs/motor.md`; `src/bots/libros.ts`, `src/motor/temperamento.ts`.

## [2026-10-28] decisión | 6. El motor no se fija de antemano: se comparan opciones y se reporta
- **Qué:** la corrida comparó motores y escogió Stockfish 19 lite (un hilo) con debilitamiento propio.
- **Por qué:** Carlos quiere saber por qué. Es el único que cubre de 100 a 3000 y corre ligero en el iPhone (Maia no baja de 1100; el `UCI_Elo` de Stockfish no baja de 1320).
- **Quién:** Carlos pidió comparar; la corrida escogió con mediciones.
- **Dónde:** MVP T3; `specs/motor.md`; merge `414b32e`.

## [2026-10-28] decisión | 7. Los ELO son aproximados: se garantiza el orden
- **Qué:** cada nivel le gana al de 200 abajo (medido); que "700" se sienta como su 700 lo valida Carlos jugando.
- **Por qué:** sin datos de personas no se puede anclar el número a chess.com; el orden sí se mide.
- **Quién:** Carlos.
- **Dónde:** MVP §4.5; `specs/motor.md`; calibración en los merges `c708ef7` (T4) y `7238111` (T13).

## [2026-10-28] decisión | 8. Mi guía solo dice QUÉ aprender; la teoría estándar dice CÓMO
- **Qué:** las jugadas, variantes, planes y frecuencias salen de la teoría estándar (con fuente y validada con el motor). Si la guía y la teoría no coinciden, gana la teoría y no se le pregunta a Carlos.
- **Por qué:** Carlos es principiante: no es la fuente de verdad del dominio ni puede confirmar teoría. Eso está estandarizado; para eso está aprendiendo.
- **Quién:** Carlos.
- **Dónde:** MVP Nota 11; `context/producto.md`; `conocimiento/`.

## [2026-10-28] decisión | 9. La base trae también las aperturas más populares para principiantes
- **Qué:** además de las de Carlos, las 1 o 2 más populares de cada lado, con sus variaciones.
- **Por qué:** para conocer lo que se va a encontrar y poder escoger otras. Se escogen con datos o fuentes citadas, no al gusto.
- **Quién:** Carlos.
- **Dónde:** MVP §4.4; `conocimiento/fuentes-aperturas-populares.md`; merge `ea6f83c` (T6).

## [2026-10-28] decisión | 10. Practicar como los cursos de lichess, y además una guía dentro de la partida real
- **Qué:** la lección enseña, luego pregunta "¿qué harías?", con Pista y Respuesta, y se repite hasta acertar. En una partida, la guía dice qué hice después de mi jugada, calla tras la del rival, y Pista y Respuesta salen de la apertura que aprendo; si me desvío, decido si sigo o deshago.
- **Por qué:** así aprendió Carlos. Lo nuevo es aprender en contexto real, con ayuda pedida, sin que el sistema juegue por él.
- **Quién:** Carlos.
- **Dónde:** MVP §4.1; merges `2f762c7` (T8) y `3e6c077` (T9).

## [2026-10-28] decisión | 11. Las ayudas de chess.com, todas opcionales
- **Qué:** reloj (Bala, Relámpago, Rápida y Sin tiempo), barra de ventaja, flechas y estrellas.
- **Por qué:** replicar lo que ya funciona y gusta; al ser opcionales, no estorban a quien no las usa.
- **Quién:** Carlos.
- **Dónde:** MVP T14–T16; merges `b1bc8b6`, `e0cc05a`, `78f36d1`.

## [2026-10-28] decisión | 12. Las estrellas premian jugar sin ayuda
- **Qué:** si gano, 3 sin ayuda, 2 con barra o flechas, 1 con guía, Pista, Respuesta o deshacer; si empato, 2 sin ayuda y 1 con cualquiera; si pierdo, 0. Cuenta la peor ayuda.
- **Por qué:** como chess.com; la guía cuenta como ayuda.
- **Quién:** Carlos.
- **Dónde:** MVP T16 y Nota 2; `src/estrellas/estrellas.ts`.

## [2026-10-28] decisión | 13. Primero el registro de aciertos y fallos; la repetición espaciada al final y apagable
- **Qué:** "Refuerza lo que fallas" sobre un registro por jugada; el repaso con días (1, 3, 7, 14, 30) llegó después, con interruptor.
- **Por qué:** datos antes que mecanismo (C2, C3). Lo experimental, apagable: lo peor que pasa es que no guste y se apague.
- **Quién:** Carlos.
- **Dónde:** MVP Notas 1 y 4; merges `b7891ba` (T12) y `64c7a28` (R7).

## [2026-10-28] decisión | 14. La UI y lo esencial de la UX, como chess.com, sin sus archivos
- **Qué:** la distribución, el orden y los colores de chess.com; nunca su logo, piezas, sonidos, imágenes ni personajes.
- **Por qué:** Carlos valora su orden y sencillez (lichess no es tan amigable). Lo que se reconoce es la distribución; los archivos son de ellos.
- **Quién:** Carlos.
- **Dónde:** MVP regla 4 y Nota 5; `AGENTS.md`; `LICENCIAS.md`.

## [2026-10-28] decisión | 15. Publicar en GitHub Pages desde este repo, hecho público
- **Qué:** la app vive en <https://carlosaguerof.github.io/chess/>, construida desde `main` a la rama `gh-pages` con `npm run publicar`.
- **Por qué:** funcionó bien en otro producto y no cuesta. Un solo repo.
- **Quién:** Carlos.
- **Dónde:** MVP Notas 6 y 8; `scripts/publicar.mjs`; `specs/publicacion.md`.

## [2026-10-28] decisión | 16. Cumplir la licencia GPL
- **Qué:** repo público, `LICENSE` (GPL-3.0-or-later), `LICENCIAS.md` y el enlace "Código fuente y licencias" en la app.
- **Por qué:** Stockfish y chessground son GPL: si la página es pública, el código tiene que estar disponible.
- **Quién:** Carlos.
- **Dónde:** MVP Nota 7; `LICENSE`, `LICENCIAS.md`, `src/pantallas/Licencias.tsx`.

## [2026-10-28] decisión | 17. Commits con el correo privado de GitHub
- **Qué:** en este repo público, `user.email` es la dirección privada que da GitHub.
- **Por qué:** que el correo personal no quede expuesto a quien junta correos de los commits.
- **Quién:** Carlos.
- **Dónde:** MVP Nota 9; `specs/publicacion.md`.

## [2026-10-28] decisión | 18. Corridas largas en Opus 5.5 con esfuerzo alto, sin hora de corte
- **Qué:** las corridas desatendidas usan ese modelo y terminan lo que empiezan.
- **Por qué:** con buen contexto y buen tiempo basta, y consume menos; sin hora de corte no quedan tareas a medias.
- **Quién:** Carlos.
- **Dónde:** MVP Nota 3.

## [2026-10-28] decisión | 19. La corrida casi no pregunta
- **Qué:** antes de preguntar, otro agente intenta destrabar; si es escoger, se aplica la recomendada y cambiar es un paso.
- **Por qué:** las preguntas frenaban corridas sin necesidad; casi siempre se podía seguir.
- **Quién:** Carlos.
- **Dónde:** MVP Nota 12.

## [2026-10-28] decisión | 20. Frecuencias del explorador de lichess: hoy sin ellas
- **Qué:** las frecuencias salen de fuentes citadas; `npm run frecuencias` queda listo para cuando haya un token.
- **Por qué:** el explorador pide credenciales; la app funciona igual sin el dato.
- **Quién:** Carlos.
- **Dónde:** MVP Nota 10; `scripts/frecuencias-explorador.ts`.

## [2026-10-28] decisión | 21. Pantalla limpia, comparada contra una referencia
- **Qué:** reglas de "pantalla limpia" (una pantalla, un propósito; sin párrafos, sin etiquetas de origen, sin inglés ni ECO a la vista, jugadas en un renglón, una sola letra, paso a paso, sin adornos) y cada pantalla se compara contra una captura de referencia.
- **Por qué:** Jugar y Repertorio se veían sucios. La revisión por principios revisaba que se entendiera, no qué tan cargada se ve; la referencia hace visible la diferencia.
- **Quién:** Carlos.
- **Dónde:** Limpieza §3; `specs/ux.md`.

## [2026-10-28] decisión | 22. Personajes con ilustraciones libres de calidad, tres estilos a escoger
- **Qué:** retratos de colecciones libres, originales, con licencia clara; tres estilos en Ajustes. Las imágenes con IA de pago son el plan B.
- **Por qué:** los dibujos hechos en código no llegaban a esa calidad; las colecciones libres sí, sin costo.
- **Quién:** Carlos.
- **Dónde:** Limpieza L1; `specs/personajes.md`.

## [2026-10-28] decisión | 23. Jugar como "Play Bots", sin la estrategia escrita
- **Qué:** cuadrícula de caras por grupo, el escogido en grande con una frase, y abajo Opciones, el color y Jugar.
- **Por qué:** Carlos no quiere leer la estrategia de cada bot: quiere escoger rival por cara y nivel.
- **Quién:** Carlos.
- **Dónde:** Limpieza L2; `specs/personajes.md`.

## [2026-10-28] decisión | 24. Una sola sección "Aperturas y defensas", con favoritas que empiezan en cero
- **Qué:** Aprender, Repertorio y Aperturas se vuelven "Aperturas y defensas" (Mis favoritas / Todas), con un ♡ en cada tarjeta; las favoritas son el repertorio para todo lo demás.
- **Por qué:** un principiante no sabe qué tocar si la pantalla mezcla su guía con otra cosa. Él escoge; nada se presupone.
- **Quién:** Carlos.
- **Dónde:** Limpieza Nota 1; `specs/aprender.md`.

## [2026-10-28] decisión | 25. Usar la app sin perfil; con perfil, guardar el avance (pendiente)
- **Qué:** sin perfil todo sigue en el navegador; un perfil opcional subiría el avance y lo sincronizaría entre aparatos. Falta decidir con qué servicio.
- **Por qué:** hoy todo vive en el navegador y se puede perder; el perfil es opcional (C4) y da algo a cambio.
- **Quién:** Carlos. **Pendiente de él:** con qué servicio.
- **Dónde:** `context/despues.md`.

## [2026-10-28] decisión | 26. Los cambios van a esta bitácora, y los aprendizajes con su lógica
- **Qué:** este `log.md`; cada vuelta cierra con `feedback.md`, `changes.md` y `learning.md`, y las reglas pasan a `specs/`.
- **Por qué:** que los próximos productos ya traigan la lógica de lo que Carlos pidió.
- **Quién:** Carlos.
- **Dónde:** Limpieza Nota 2; `AGENTS.md`.

## [2026-10-28] corrida | MVP: bots por nivel, la base de aperturas, el repertorio y la guía (05:45–13:39)
- **Qué:** la primera corrida desatendida construyó el MVP. Sus commits principales (merges a `main`):
  - `997c5cb` T1 base del proyecto · `482f810` T2 tablero y reglas (chessground + chess.js) · `414b32e` T3 comparación de motores · `c708ef7` T4 motor y niveles 300–1200 · `2124ea2` T5 jugar contra un bot.
  - `ea6f83c` T6 base de aperturas (131 variantes, fuente lichess CC0, validadas con el motor) · `7e6dc12` T7 repertorio y T10 edición · `2f762c7` T8 cursos · `3e6c077` T9 la guía en la partida · `b7891ba` T12 registro y Refuerza.
  - `fc37b17`, `3729dff`, `349d34f` arreglos de los tres pases adversariales de P0 · `729b874` (rama `gh-pages`) primera publicación, desde `a01ec41`.
  - `b1bc8b6` reloj · `78f36d1` estrellas · `e0cc05a` ayudas · `80fa935` temperamento · `36872fe` practicar desde el resumen · `d0efb1f` pantalla Aperturas · `9c4b342` servir en la red de la casa · `5c6e260` sin internet (PWA) · `ff98d58` Mis partidas · `282a427` importar PGN · `6bc98b5` avatares · `a0fdc1c` sonido · `64c7a28` repaso espaciado.
  - `f37398b` T20 revisión de UX · `b674749`, `e3cfe0c`, `2a9d9d6` arreglos de los pases adversariales de P1 · `492634b` y `7238111` T13: los 47 personajes y la calibración de 100 a 3000 · `525a3d3` capturas finales · `b62b5f0` (rama `gh-pages`) segunda publicación.
- **Por qué:** las decisiones 1 a 20 de arriba.
- **Quién:** la corrida (Opus 5.5), con las 12 notas que Carlos agregó durante el día.
- **Dónde:** MVP; `iterations/v1/` (manifiesto y capturas).

## [2026-10-28] corrida | Limpieza visual: Jugar y Aprender como chess.com (14:08–)
- **Qué:** la segunda corrida desatendida rehace Jugar y la sección de aprender, cambia los retratos de los personajes y limpia el resto con la "Pantalla limpia"; Carlos agregó dos notas en el camino (Nota 1: "Aperturas y defensas" con favoritas; Nota 2: esta bitácora y el cierre de la vuelta 1). Cada tarea, en su rama, integrada a `main` con `--no-ff`.
- **Por qué:** las decisiones 21 a 26 de arriba: Carlos probó la app en su iPhone y Jugar y Repertorio se veían sucios comparados con chess.com.
- **Quién:** la corrida (Opus 5.5), con el instructivo de Carlos.
- **Dónde:** Limpieza; `iterations/v2/` (manifiesto y capturas de antes y después).

## [2026-10-28] cambio | L0: capturas de antes de todas las pantallas
- **Qué:** las 19 pantallas, en los dos perfiles, antes de tocar nada; y una prueba que las vuelve a tomar después (`tests/e2e/capturas-v2.spec.ts`, fuera de la suite normal).
- **Por qué:** la "Pantalla limpia" se juzga comparando: sin el antes no hay contra qué medir el después.
- **Quién:** la corrida (Limpieza L0).
- **Dónde:** merge `4c32f64`; `iterations/v2/capturas/antes/`.

## [2026-10-28] cambio | L1: retratos de calidad en tres estilos libres, a escoger en Ajustes
- **Qué:** cada personaje tiene un `aspecto` (edad, piel, peinado, color de pelo, barba, lentes, gorro, ropa y gesto) y se dibuja en el navegador con DiceBear en tres estilos: Ilustrado (ToonHead, CC BY 4.0, el recomendado), Caricatura (Avataaars, libre para uso personal y comercial) y Dibujado a mano (Open Peeps, CC0). Los 47 distintos en cada estilo; seis frases reescritas para que no nombren aperturas, jugadas ni nada en inglés.
- **Por qué:** los dibujos hechos en código no llegaban a la calidad de chess.com; las colecciones libres sí, sin costo y con licencia confirmada en su fuente. El gusto lo escoge Carlos con un toque.
- **Quién:** Carlos pidió (decisión 22); la corrida escogió los estilos y recomendó Ilustrado por ser el más parecido a un retrato de busto ilustrado.
- **Dónde:** merge `d5d02de`; `src/bots/retratos.ts`; `specs/personajes.md`; `LICENCIAS.md`.

## [2026-10-28] cambio | L2: Jugar como "Play Bots"
- **Qué:** una sola pantalla con el escogido en grande y su frase en un globo, la cuadrícula de retratos en Principiante, Intermedio, Avanzado y Maestro con mis estrellas, y abajo, fijos, Opciones (tiempo, guía, mis líneas y ayudas, guardadas al momento), el color en tres botones y Jugar. Entra el último bot con el que jugué. Los grupos de tiempo pasaron a Bala, Relámpago y Rápida.
- **Por qué:** Carlos escoge rival por cara y nivel, no leyendo su estrategia (decisión 23); y nada en inglés (§3).
- **Quién:** Carlos.
- **Dónde:** merge `e8cb6f6`; `src/pantallas/Jugar.tsx`; `specs/ux.md`.

## [2026-10-28] cambio | L3 (Nota 1): "Aperturas y defensas" con Mis favoritas y Todas
- **Qué:** Aprender, Repertorio y Aperturas se vuelven una sola sección en la pestaña Aprender; las favoritas empiezan vacías y son el repertorio para todo lo demás; cada apertura y cada variante se abren paso a paso; el inglés, el ECO y la fuente, solo en "Detalles". Lo guardado se migra sin perder el avance. Exportar e importar, en Más → Tus datos. Agregar o editar líneas sale de la vista.
- **Por qué:** Carlos abrió Aprender y no entendió "mi repertorio": parecía una mezcla de su guía con otra cosa y, como principiante, no sabía qué tocar (decisión 24).
- **Quién:** Carlos (Nota 1).
- **Dónde:** merge `bbd14fa`; `src/aprender/`, `src/pantallas/AperturasYDefensas.tsx`; `specs/aprender.md`.

## [2026-10-28] cambio | L4: limpieza del resto con la "Pantalla limpia"
- **Qué:** Inicio, lección, repaso, partida (con la guía y el resumen), Refuerza, Mis partidas, Más y Ajustes sin párrafos que expliquen, sin etiquetas de origen, sin inglés ni ECO, sin adornos; una sola letra (Inter).
- **Por qué:** la misma vara para toda la app (decisión 21).
- **Quién:** Carlos pidió; la corrida aplicó pantalla por pantalla (tabla en el ESTADO de la corrida).
- **Dónde:** merge `d055411`; `iterations/v2/capturas/despues/`; `specs/ux.md`.

## [2026-10-28] aprendizaje | Al usar React, un efecto de una sola línea puede devolver algo que no es limpieza
- **Qué:** `useEffect(() => window.scrollTo(0, 0), …)` tumbó la app en Chromium: ahí `scrollTo` ya devuelve una promesa y React la trató como función de limpieza.
- **Por qué importa:** pasó en una prueba en la computadora y no en el iPhone; con llaves (`useEffect(() => { … })`) el efecto no devuelve nada.
- **Quién:** la corrida, al probar la L3.
- **Dónde:** `src/App.tsx`; merge `bbd14fa`.

## [2026-10-28] cambio | L7 (Nota 2): esta bitácora, el cierre de la vuelta 1 y las reglas en specs/
- **Qué:** `log.md` con las 26 decisiones, las dos corridas y cada cambio; `iterations/v1/feedback.md`, `changes.md` y `learning.md`; `specs/ux.md` (Pantalla limpia), `specs/aprender.md`, `specs/personajes.md` y `specs/publicacion.md`; `context/producto.md` con el objetivo y el papel de la guía; la regla en `AGENTS.md`.
- **Por qué:** que la lógica de lo que Carlos pide no se quede en el chat y los próximos productos la traigan (decisión 26).
- **Quién:** Carlos (Nota 2).
- **Dónde:** merge `1922ecc`.

## [2026-10-28] cambio | L5: tres pases adversariales sobre la limpieza (21 hallazgos, todos arreglados)
- **Qué:** tres revisores nuevos, uno por pase, compararon cada pantalla antes y después contra la "Pantalla limpia" y las referencias. Pase 1: 9 hallazgos; pase 2: 7; pase 3: 5. Lo más importante que corrigieron: con "Mis favoritas" vacía la guía y el resumen ya no nombraban la apertura (ahora la base la nombra siempre); quedaban etiquetas de origen ("tu repertorio", "de la base", "Tu guía dice"); se había perdido la idea general de cada apertura; dos frases de personajes recordaban a bots de chess.com.
- **Por qué:** al rehacer una pantalla se pierden avisos y datos sin que nadie lo note; un revisor que no hizo el trabajo los encuentra. El tercer pase no terminó en 0 (era el último permitido); sus 5 hallazgos se arreglaron con prueba.
- **Quién:** la corrida (Limpieza L5).
- **Dónde:** commits `ec8b0a2`, `b3c449d` y el de los arreglos del pase 3; las tablas de hallazgos en el ESTADO de la corrida.

## [2026-10-28] aprendizaje | Cuando el repertorio pasa a "lo que el usuario escoge", cada lugar que lo usaba necesita su caso vacío
- **Qué:** al cambiar el repertorio sembrado por favoritas que empiezan vacías, la guía, el resumen y Refuerza siguieron funcionando, pero en silencio: con cero favoritas ya no nombraban la apertura ni ofrecían práctica.
- **Por qué importa:** las pruebas usaban favoritas sembradas y no lo vieron; lo encontraron los pases adversariales. Regla: al cambiar el origen de un dato, probar cada pantalla con ese dato vacío.
- **Quién:** la corrida, en los pases 2 y 3.
- **Dónde:** `tests/unit/aprender.test.ts`; `specs/aprender.md` (regla 8).

## [2026-10-28] cambio | L6: pruebas finales en verde, publicación y comprobación
- **Qué:** sobre `main` `d1d20a2`: `npm test` → 144 de 144; `npm run e2e` → 82 de 82 (iPhone y escritorio). `npm run publicar` subió el sitio a `gh-pages` (`ad94e9d`). Comprobación: la página da 200, el motor sale como `application/wasm`, y Playwright contra la página publicada pasa 6 de 6 (el bot juega, sin internet funciona, y la página ya trae Jugar con los 47 retratos y "Aperturas y defensas": `tests/publicado/limpieza.spec.ts`).
- **Por qué:** solo se publica con todo en verde, y lo publicado se comprueba en la página de verdad (decisión 15; `specs/publicacion.md`).
- **Quién:** autorizado por Carlos en el instructivo de la limpieza (regla 5).
- **Dónde:** <https://carlosaguerof.github.io/chess/>; `gh-pages` `ad94e9d`.

## [2026-10-28] cambio | La página ya no hace zoom al jugar en el iPhone
- **Qué:** jugando contra Brisa en el iPhone, desde la jugada 6 la página se ensanchaba (el tablero cortado a la derecha, la lista de jugadas en un renglón fuera de la pantalla) y Safari cambiaba el zoom solo. Reproducido en WebKit a 390×844 con la partida del reporte (1.e4 e5 2.d3 c6 … 8.exd5): el ancho de la página pasó de 390 a 473 px en 6.Ae2, 660 px en 8.exd5 y 694 px tras la respuesta de Brisa, con el tablero estirado a ese mismo ancho.
- **Causa:** en el celular, la rejilla de la partida tenía una sola columna `1fr`, que no puede medir menos que su contenido más largo. La lista de jugadas va en un renglón (`nowrap`), así que cada jugada ensanchaba la columna, y con ella el tablero (que mide el 100 % de la columna), los botones y la página. Al pasar del ancho de la pantalla, Safari se aleja para que quepa: ese era el "zoom".
- **Arreglo (`src/estilos.css`):** la columna de la partida y la de las lecciones van con `minmax(0, 1fr)`: miden la pantalla y la lista se desliza dentro de su propio espacio, con la última jugada a la vista (eso ya lo hacía `ListaJugadas`). Además, `touch-action: manipulation` en toda la app para que el doble toque (dos casillas tocadas rápido, dos toques a un botón) no haga zoom, sin quitar el zoom con dos dedos; el tablero sigue con `none`. Y letra de 16 px en los campos de texto (hoy no hay; es para que un campo futuro no haga zoom al tocarlo).
- **Por qué así:** se arregla en la causa (lo que empujaba la página) y no tapando el síntoma con `overflow-x: hidden`, que escondería el próximo desborde en vez de mostrarlo en la prueba.
- **Prueba:** `tests/e2e/zoom-iphone.spec.ts` (perfil iPhone): la partida del reporte y una de 40 jugadas, jugadas por toques, y la lección más larga en sus dos fases, con su variante y su apertura; tras cada jugada, el ancho de la página ≤ el de la pantalla y la escala en 1. Sin el arreglo falla en 6.Ae2 (473 > 390). Y `tests/publicado/zoom.spec.ts` lo comprueba en la página publicada. La regla quedó en `specs/ux.md` ("En el iPhone").
- **Quién:** Carlos reportó el bug con su captura; arreglado por la corrida "arreglar zoom".
- **Dónde:** rama `fix/zoom-iphone`, merge a `main`; publicado con `npm run publicar`. La salida de las pruebas y la comprobación de lo publicado, en `00_corridas/chess/2026-10-28_REPORTE_arreglar-zoom.md`.

## [2026-10-28] cambio | El arreglo del zoom, verificado por Carlos en su iPhone
- **Qué:** Carlos jugó en su iPhone real, en la página publicada con el arreglo, y ya no hace zoom ni se corre de lado.
- **Por qué importa:** las pruebas lo comprobaban en WebKit a 390×844; el gesto del doble toque solo se ve en un iPhone de verdad. Con esto, el arreglo queda cerrado.
- **Quién:** Carlos, al día siguiente del arreglo.
- **Dónde:** la entrada anterior; `00_corridas/chess/2026-10-28_REPORTE_arreglar-zoom.md`.

## [2026-10-28] cambio | 1. Aprender ya no tiene "Mis favoritas": "Con blancas" y "Con negras"
- **Qué:** las dos pestañas de Aprender son "Con blancas" y "Con negras", con mis aperturas de ese color. Las favoritas y el ♡ se apagan sin borrarse: quedan detrás de `FAVORITAS_PRENDIDAS` (`src/aprender/interruptores.ts`), para cuando haya varios usuarios. "Que juegue mis líneas", la guía en la partida y el texto de Opciones ("El bot entra a tus aperturas") usan todas mis aperturas. Lo guardado en el navegador (favoritas, avance, repaso) no se toca ni rompe nada al abrir.
- **Por qué:** la app es de un solo usuario y ya sabe cuáles son mis aperturas; escogerlas con un ♡ era un paso de más. Las favoritas sirven cuando cada usuario escoja las suyas.
- **Quién:** Carlos, después de usar la app en su iPhone.
- **Dónde:** rama `feat/ajustes-app`; `src/pantallas/AperturasYDefensas.tsx`, `src/aprender/favoritas.ts` (`misAperturas`, `useMiRepertorio`); `specs/aprender.md`. Pruebas: `tests/e2e/ajustes-app.spec.ts`, `tests/unit/ajustes-app.test.ts`; las de favoritas se saltan con su interruptor apagado y vuelven si se prende.

## [2026-10-28] cambio | 2. Solo mis cursos: las populares de la base se apagan
- **Qué:** Aprender trae los 9 cursos de mi árbol: con blancas, la Italiana, la Alapin, el Avance contra la Caro-Kann y contra la Francesa, la captura contra la Escandinava y "Otras defensas contra 1.e4"; con negras, la Caro-Kann, la Eslava y "...c6 + ...d5 contra lo demás" (sí es un curso: "Otras aperturas de blancas"). Se apagan, sin borrarse, las 5 que agregó la base como populares (decisión 9): Sistema Londres, Gambito de Dama, Siciliana con negras, Escandinava con negras y Gambito de Dama Declinado (`POPULARES_PRENDIDAS`). Qué tocaba cada una:
  - **Aprender:** sus 5 cursos ya no salen ni se abren por su dirección; el avance que tuvieran se queda guardado.
  - **La guía:** ya no sugiere jugadas de ellas (Pista y Respuesta) ni ofrece "Practicar esta línea" de ellas; sí nombra la apertura si la partida entra ahí (p. ej. si el bot abre con el Londres).
  - **"Que juegue mis líneas" y Refuerza:** solo mis cursos.
  - **El Repaso de hoy:** sin cambios en su lógica; como lee mis cursos, una lección aprendida de una popular ya no vuelve (su ficha sigue guardada).
  - **Los libros de los bots:** sin cambios. Ningún bot las usaba "para mí": son el estilo de cada bot (lo que él abre o cómo se defiende) desde la T5, antes de que existieran las populares. Además, que el bot juegue la Siciliana o la Escandinava con negras es justo lo que practico con la Alapin y la captura.
  - **"Otras defensas contra 1.e4"** se queda: es el "otros → Principios" con blancas de mi árbol, no una popular.
- **Por qué:** "solo mis cursos". Las populares estaban para conocer otras opciones; hoy meten ruido en lo que estoy aprendiendo.
- **Quién:** Carlos.
- **Dónde:** `src/aprender/interruptores.ts` (`MIS_APERTURAS` sale de `GUIA`; `POPULARES`), `src/cursos/datos.ts`, `src/guia/guia.ts`; la base (`conocimiento/`) no cambia.

## [2026-10-28] cambio | 3. "Refuerza lo que fallas" muestra solo lo que he fallado
- **Qué:** Refuerza muestra solo las jugadas falladas, de la que más fallo a la que menos (entre iguales, la que fallo más seguido y luego la que llevo más tiempo sin practicar). Ya no salen las que nunca practiqué ni las que nunca fallé. Sin fallos, dice "Aún no hay jugadas falladas." en una línea, y la tarjeta del inicio lo dice también, sin el botón Reforzar.
- **Por qué:** el nombre dice "lo que fallas"; mezclar lo nunca practicado lo volvía otra cosa. Sin botón, la tarjeta del inicio no invita a una pantalla vacía y sigue diciendo qué es (como la del Repaso).
- **Quién:** Carlos pidió; "sin botón" en vez de "botón inactivo", la corrida (se ve más limpio).
- **De paso:** al terminar una ronda de una sola jugada decía "Repasaste 1 jugadas"; ahora, "1 jugada" (con solo lo fallado, las rondas cortas son comunes).
- **Dónde:** `src/registro/refuerza.ts` (`ordenRefuerza`, `jugadasFalladas`), `src/pantallas/Refuerza.tsx`, `src/pantallas/Inicio.tsx`; `tests/unit/refuerza.test.ts`.

## [2026-10-28] cambio | 4. Sin la pantalla "Tus datos": Exportar pasa a Ajustes
- **Qué:** la pantalla "Tus datos" y su entrada en Más se apagan sin borrarse (`TUS_DATOS_PRENDIDA`); la ruta vieja abre el inicio. Exportar pasa a Ajustes con una línea que dice qué trae (la sección final, con Importar, es la entrada de la opción A, abajo).
- **Por qué en Ajustes y no en Mis partidas:** comprobado en el código (`src/repertorio/edicion.ts`, `exportar`): el archivo traía las favoritas, el avance, el registro de jugadas y el repaso, y **no** traía Mis partidas ni los ajustes. No era "solo el historial", así que no iba en Mis partidas.
- **Quién:** Carlos.
- **Dónde:** `src/App.tsx`, `src/pantallas/Ajustes.tsx`; `src/pantallas/Respaldo.tsx` se queda en el repo.

## [2026-10-28] cambio | 5. En Más, "Instalar en el iPhone"
- **Qué:** una guía para dejar la app en la pantalla de inicio con Safari, en los pasos que Carlos hizo: ⋯ junto a la dirección → Share → View More → Add to Home Screen → Open as Web App prendido → Add; el ícono "Aperturas" aparece en la pantalla de inicio. Los botones van en inglés, como los muestra su iPhone, con su explicación en español. Cada paso lleva un dibujo propio hecho en el código (nunca sus capturas: traen sus contactos y el repo es público). Dice que es para iPhone con Safari y que para Android o computadora aún no hay guía. Si la página ya corre como app, en lugar de los pasos dice "Ya la tienes como app". Al final: funciona sin internet después de abrirla una vez, lo que guardas vive en esa app y, para pasar el avance de Safari, Respaldo en Ajustes.
- **El nombre:** "Instalar en el iPhone": dice qué hace y dónde, así que alguien con Android sabe desde el menú que no es para él; en el iPhone, "instalar" ya quiere decir "como app".
- **Chrome en el iPhone:** no llegaron capturas, así que solo va Safari.
- **Por qué:** instalada se abre como una app, sin la barra de Safari, y funciona sin internet.
- **Quién:** Carlos (los pasos y las capturas); el nombre y los dibujos, la corrida.
- **Dónde:** `src/pantallas/Instalar.tsx`, `src/estado/instalada.ts`; `specs/ux.md`.

## [2026-10-29] cambio | Nota 1: "cómo funciona" con un ⓘ en Repaso de hoy y en Refuerza
- **Qué:** un ⓘ junto al título del Repaso de hoy y de Refuerza, en el inicio y en sus pantallas (en el repaso, arriba de la lección). Al tocarlo, un globito con "Ver cómo funciona el Repaso de hoy" o "Ver cómo funciona Refuerza"; al tocar el enlace, una ventana con la explicación en pasos cortos, uno por vista, con Atrás a la izquierda (no en el primero) y Siguiente a la derecha, que en el último dice "Salir". Un toque fuera cierra el globito y la ventana. El último paso de las dos dice que es opcional.
- **Lo que explica sale del código:** el repaso, de `src/repaso/repaso.ts` (por lección, entra al terminarla, 1-3-7-14-30 días sin ayuda, mañana si fallas o pides ayuda, te espera si te atrasas, se apaga en Ajustes); Refuerza, de `src/registro/` (qué se guarda, Pista y Respuesta cuentan como fallo, el orden y desde dónde se practica). Una prueba compara los plazos del texto con `ESCALONES`.
- **Por qué:** ayuda breve y a la mano (N10) sin párrafos en la pantalla (Pantalla limpia).
- **Quién:** Carlos (Nota 1); "Salir" a la derecha en el último paso, interpretado así porque es lo usual.
- **Dónde:** `src/componentes/ComoFunciona.tsx`; `tests/e2e/ajustes-app.spec.ts` (ⓘ → globito → ventana, Siguiente, Atrás, Salir, tocar fuera, en los dos perfiles).

## [2026-10-29] decisión | 4 (opción A): Exportar e Importar juntos en Ajustes, en "Respaldo"
- **Qué:** Importar se queda, junto a Exportar, en una sección "Respaldo" de Ajustes, con tres frases en palabras de usuario: tu avance vive solo en esta app, en este teléfono, sin nube; Exportar guarda todo en un archivo (a iCloud Drive o a Archivos); Importar lo carga de vuelta (después de borrar la app, en un teléfono nuevo o para pasar el avance de Safari a la app instalada). Importar pregunta antes de reemplazar (N5) y dice qué trae el archivo. El archivo ahora sí trae **todo**: avance, registro, repaso, Mis partidas y los ajustes (las estrellas, el estilo, el sonido, el último bot…); un archivo de antes, sin partidas, se sigue leyendo y no borra las que hay. Abierta como app, Exportar ofrece compartir el archivo si el teléfono puede; si no, lo descarga. "Tus datos" sigue fuera.
- **Por qué:** sin importar no había forma de recuperar un respaldo ni de pasar el avance de la pestaña de Safari a la app instalada: en el iPhone son copias separadas. Y "Exportar guarda todo" tenía que ser cierto. Compartir en modo app, porque ahí una descarga puede no dejar el archivo a la mano (no comprobado en un iPhone real).
- **Quién:** Carlos (opción A, por la dirección).
- **Dónde:** `src/componentes/SeccionRespaldo.tsx`, `src/estado/respaldo.ts`, `src/repertorio/edicion.ts`; `tests/e2e/ajustes-app.spec.ts` (exportar baja todo, importar pregunta, modo app descarga o comparte).

## [2026-10-29] aprendizaje | Un nombre de estilo nuevo puede pisar uno viejo sin que ninguna prueba falle
- **Qué:** el globito del ⓘ se llamó `.globo`, igual que el globo con la frase del bot en Jugar, y `.info`, igual que el aviso azul de la lección. Las pruebas pasaban (buscan textos y botones, no cómo se ven); lo vio la revisión de las capturas de después: un triángulo blanco que no era del globito, y el globo del bot habría quedado flotando.
- **Por qué importa:** los estilos de esta app viven en un solo archivo y cualquier nombre se comparte. Regla: antes de crear una clase, buscarla en `src/estilos.css`; y revisar las capturas de después, no solo correr las pruebas.
- **Quién:** la corrida, en la revisión de UX.
- **Dónde:** `.globo-info` e `.info-como` en `src/estilos.css`; la prueba "los estilos nuevos no pisan los de antes" en `tests/e2e/ajustes-app.spec.ts`; `iterations/v2/revision-ux-ajustes.md`.

## [2026-10-29] decisión | Lo que queda para cuando haya más usuarios
- **Qué:** una sección "Cuando haya más usuarios" en `context/despues.md`: lo que se apagó en estos ajustes y cómo se prende (favoritas, cursos populares, "Tus datos"), más lo que Carlos dejó para entonces: el perfil con guardado en la nube (la corrida que se detuvo el 2026-10-28), "Enviar feedback" en Más, la analítica con PostHog, un aviso de cookies y privacidad, y "Escoger tu ruta de aperturas". Nada se construye: solo queda anotado, con su porqué.
- **Por qué:** que no se pierda, y que nada de eso entre al escalón en curso (regla del MVP).
- **Quién:** Carlos, por la dirección.
- **Dónde:** `context/despues.md`.

## [2026-10-29] corrida | Ajustes de la app: pruebas en verde, merge, publicación y comprobación
- **Qué:** `npm test` → 156 de 156; `npm run e2e` → 103 pasaron y 9 se saltaron a propósito (en cada perfil, las 3 de favoritas y "Tus datos", apagadas; y las 3 del zoom en escritorio); `npm run e2e:pages` contra el sitio construido → 9 de 9. Merge `--no-ff` a `main` (`33b9f4e`) y `git push origin main`. `npm run publicar` subió el sitio (`gh-pages` `697c975`); GitHub Pages: `built`. Comprobación: la página da 200, sirve el código nuevo (`assets/index-DYIgBwXH.js`) y `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages` pasa 9 de 9 (con `tests/publicado/ajustes-app.spec.ts`: Aprender por color, el ⓘ, la guía para instalar y Respaldo).
- **Por qué:** solo se publica con todo en verde, y lo publicado se comprueba en la página de verdad (`specs/publicacion.md`).
- **Quién:** autorizado por Carlos en el prompt de la corrida ("Publicar está autorizado con todo en verde").
- **Dónde:** <https://carlosaguerof.github.io/chess/>; el reporte, en `00_corridas/chess/2026-10-28_REPORTE_ajustes-de-la-app.md`.

## [2026-10-29] corrida | Curso piloto de la Caro-Kann (escalón 1), desde las 00:44
- **Qué:** la corrida que hace el escalón 1 con un solo curso completo, la Caro-Kann: corrige la base, cambia la notación a figuras, construye la lección nueva, escribe el curso con el porqué de cada jugada, comprueba los textos con el motor, hace las pantallas, corre los pases adversariales y publica. La vuelta es la v3 (`iterations/v3/manifest.md`); la corrida del perfil que había abierto esa carpeta se detuvo el 2026-10-28 y su manifiesto queda en git.
- **Por qué:** la necesidad de Carlos es aprender sus aperturas comprendiéndolas, no de memoria. Primero un curso completo que él prueba en el iPhone; con lo que diga se ajusta el formato antes de hacer los otros siete (regla del MVP: empezar chico, probar y crecer).
- **Quién:** Carlos aprobó el diseño (A, con el piloto de la Caro-Kann) el 2026-10-29.
- **Dónde:** instructivo **Caro-Kann** = `2026-10-29_INSTRUCTIVO_curso-caro-kann.md`, con el diseño `2026-10-28_DISENO_escalon-1.md` (en el repo de las corridas, fuera de este).

## [2026-10-29] cambio | C1: 43 correcciones de la base, cada una comprobada con el motor
- **Qué:** los planes y las ideas de la base (`scripts/base/definiciones/*.json`, reconstruida con `npm run base`) traían errores de ajedrez y faltantes que hoy se ven en la app. Se corrigieron 43: 15 errores (por ejemplo, la Grünfeld de la Escandinava decía que el alfil tenía varias casillas y solo 7...Ae6 sirve; la Eslava del Cambio decía "desarrolla igual que blancas", que pierde material; el Milner-Barry no es un error sino un gambito legítimo), 25 faltantes (las trampas 4.h4 e6, 7...Dc7 en el Cambio de la Caro-Kann, 7.Axh6 en la Lputian, 8...Dxd4 en la Alapin…) y 3 frases sin fuente que se quitaron. Las líneas no cambiaron.
- **Por qué:** nada se inventa en el ajedrez; lo que la teoría y el motor desmienten no se enseña. Los cursos se escriben sobre esta base.
- **Cómo se comprobó:** 60 comandos del motor (Stockfish 19 lite, profundidad 18; 16 para las amenazas), más chess.js para la estructura de peones y la transposición 1.c4 c6 2.e4 d5. Un hallazgo contra la investigación: esa transposición sí está en la base (el Panov acelerado). La tabla completa, con el antes, el después y cada comando: `iterations/v3/correcciones-de-la-base.md`. La prueba que cuida que no vuelvan: `tests/unit/correcciones-base.test.ts`.
- **Quién:** la investigación del porqué las encontró; la corrida las aplicó y las volvió a comprobar (instructivo Caro-Kann, C1).
- **Dónde:** `scripts/base/definiciones/`, `conocimiento/base.json` y las páginas `conocimiento/<apertura>.md`.

## [2026-10-29] cambio | C2: las jugadas en figuras (♘f3), y en Ajustes, Figuras o Letras
- **Qué:** en toda la app las jugadas se ven en figuras de entrada (♘f3, ♗xc4, ♕d1, `0-0`). En Ajustes, una sección "Notación" con dos opciones, cada una con su ejemplo: **Figuras** (♘f3) y **Letras** (Nf3, la notación formal en inglés, con `O-O`). Nunca las dos juntas. Reemplaza las letras en español (R D T A C) en la pantalla: la lista de jugadas, la guía, los resúmenes, Refuerza, Mis partidas, Aprender (líneas, planes, nombres de variantes) y la lección.
- **Cómo:** por dentro los textos siguen en la notación de las guías de Carlos (R D T A C), así no se reescribe la base; al pintarse pasan por `mostrarTexto` (`src/ajedrez/mostrar.ts`), que cambia solo la letra de la pieza cuando la sigue una casilla ("Af5", "Cbd7", "Txe1") y deja las palabras ("Caro-Kann", "Réti"). La opción se guarda en el navegador (`ajedrez.v1.notacion`) y viaja en el Respaldo.
- **Por qué:** las figuras son universales y fáciles, como en chess.com; las letras en inglés sirven para leer libros y otros sitios. Las dos juntas confunden.
- **Quién:** Carlos (diseño del escalón 1, §6). AGENTS.md y `context/producto.md` ya dicen la regla nueva.
- **Dónde:** `src/ajedrez/mostrar.ts`, `src/pantallas/Ajustes.tsx`; pruebas: `tests/unit/notacion-mostrar.test.ts` (la conversión, en los dos sentidos, sin tocar palabras) y `tests/e2e/c2-notacion.spec.ts` (el cambio en Ajustes se ve en la lista de jugadas y en Aprender, y se recuerda al recargar, en los dos perfiles). Las pruebas que esperaban "Af5" o "Dxf7#" ahora esperan "♗f5" y "♕xf7#".

## [2026-10-29] cambio | C3: la lección nueva, solo para el curso de la Caro-Kann
- **Qué:** una lección nueva (diseño §4) para el curso piloto. Dos vueltas por variante: **Aprender** (te dice la jugada y su porqué; espera a "Siguiente" cuando hay algo que leer) y **Practicar** (pregunta por la meta, sin la jugada; ciclo rápido: la máquina contesta sola a los 0.9 s). Tablero limpio en tu turno; las flechas de la siguiente jugada, apagadas de entrada y con su interruptor en Ajustes. La ayuda en tres escalones: Pista (la idea), Otra pista (la pieza marcada) y Respuesta (la flecha con su porqué; cuenta como fallo para Refuerza y el Repaso). El error se explica (lo que trae el curso, la pieza que deja sin defensa o la meta que no cumple, y si el motor ve que pierde material, lo dice) y se queda con su flecha roja hasta "Reintentar"; la jugada buena de otra línea (la trae la base) sale en azul, sin contar como fallo. "Variante N de M", "Jugada N de M" y la línea en un renglón. Atrás regresa una jugada; Empezar de nuevo pregunta antes. El avance se guarda en el teléfono y se retoma donde te quedaste. Al terminar Aprender, el plan con sus flechas; al terminar Practicar, el resumen (la línea, la idea clave, en qué te equivocaste) con tres salidas. Un espacio fijo de mensajes narra todo y no se quita solo.
- **Lo que se conecta:** cada jugada de Practicar se registra como antes y alimenta Refuerza; cada variante terminada entra al Repaso de hoy. Las variantes del curso son las lecciones de la Caro-Kann para el Repaso, el inicio y "Practicar esta línea". Lo que ya llevaba en el Repaso de las lecciones viejas de la Caro-Kann pasa a la lección nueva de la misma respuesta (una vez, sin borrar nada). Los otros siete cursos siguen con la lección de antes.
- **Por qué:** lo que funciona de lichess (el ciclo rápido, la espera para leer, la explicación del error que no se va) y lo que hacemos mejor (sin marcas que delaten, la ayuda por escalones, la jugada buena que no es roja, el avance guardado, el resumen).
- **Quién:** Carlos (diseño del escalón 1, §4).
- **Dónde:** `src/curso/` (`ciclo.ts`, `datos.ts`, `textos.ts`, `avance.ts`, `flechas.ts`, `tipos.ts`), `src/pantallas/LeccionCurso.tsx`, `src/aprender/migracion.ts`; pruebas: `tests/unit/curso-ciclo.test.ts` y `tests/e2e/c3-leccion.spec.ts` (cada punto, en los dos perfiles).

## [2026-10-29] cambio | C4: el curso de la Caro-Kann, con el porqué de cada jugada
- **Qué:** el contenido del curso piloto (`conocimiento/cursos/caro-kann.json`): La idea, La estructura (Avance y Clásica), 16 variantes (una por respuesta de blancas que trae la base, de la más común a la más rara: el Avance con 4.Cf3, 4.c3, 4.Cc3, 4.h4, 4.g4 y 4.Ce2; la Clásica; el Cambio y el Panov; los Dos Caballos; 2.Cf3 con 3.d3 y con 4.Ce5; 2.c4; 3.f3; 2.d3 y 2.Ac4), cada una con su plan; tres "¿Y si…?" (4...e6 contra 4.h4 y 7...Dc7 en el Cambio, tuyos; 6.h4 en la Bayoneta, del rival); el Repaso con tres reglas y "Lo que tu guía decía distinto"; y un glosario de 13 palabras. Cada jugada mía trae su pregunta por la meta, qué hace, por qué ahora, qué prepara y el cuidado; cada jugada del rival, su frase. Máximo 8 jugadas mías por variante.
- **Las líneas:** salen de la base. Donde la fila de la lista CC0 de lichess se acaba antes, la base trae ahora una `continuacion` con su fuente (Wikibooks, Wikipedia o la mejor del motor), validada como todo: 14 variantes nuevas en `scripts/base/definiciones/caro-kann.json`, 29 jugadas nuevas validadas (ninguna mía pierde más de 1 peón) y los libros de los bots revalidados (ninguna jugada pierde más de 2 peones).
- **Decisión de la corrida:** las lecciones son las respuestas de blancas; mis otras jugadas buenas que trae la base (3...c5 y 4...Cd7) se reconocen dentro de la lección ("buena jugada, pero esta lección enseña otra línea") en lugar de tener lección propia. Agregarlas es un paso (una entrada en `variantes`).
- **Por qué:** la necesidad de Carlos es comprender, no memorizar; nada se inventa: cada jugada sale de la base y cada idea tiene su fuente (guardada en el contenido, no en la app). Los textos son nuestros: ninguno es traducción.
- **Quién:** Carlos (diseño §3 y §5); el contenido, la corrida.
- **Dónde:** `conocimiento/cursos/caro-kann.json`, `scripts/base/definiciones/caro-kann.json` (las `continuacion`), `scripts/construir-base.ts` y `scripts/validar-base.ts` (las leen), `scripts/revisar-curso.ts` (lista lo que no cumple la forma); prueba: `tests/unit/curso-contenido.test.ts`.

## [2026-10-29] cambio | C5: cada afirmación del curso, comprobada con el motor
- **Qué:** 91 comprobaciones (Stockfish 19 lite, profundidad 18; 16 para las amenazas), una por cada "es la mejor", "evita", "pierde" o "es un error" del curso. 89 se sostienen; 2 se corrigieron: en la Bronstein, contra un h4 tardío, solo ...h5 (...h6 es medio peón peor), y en el Panov, 4...dxc4 "es peor" (pierde poco) en vez de "le sirve a blancas". Dos frases sin medida ("lleno de huecos") se cambiaron por lo que dicen las fuentes. Con lo confirmado se agregaron los "por qué no" de 15 jugadas equivocadas conocidas (salen cuando las juegas).
- **Por qué:** nada se inventa en el ajedrez; lo que el motor puede medir, se mide.
- **Quién:** la corrida (instructivo Caro-Kann, C5).
- **Dónde:** `iterations/v3/comprobaciones-del-curso.md` (afirmación, comando, resultado y veredicto); el id de cada comprobación va en el campo `motor` del texto, en `conocimiento/cursos/caro-kann.json`.

## [2026-10-29] cambio | C6: las pantallas del curso, revisadas con la Pantalla limpia
- **Qué:** la tarjeta de la Caro-Kann con su avance ("3 de 16 variantes"); la página del curso con las piezas en orden y su estado (La idea, La estructura, las 16 variantes, Errores y trampas, Repaso), un botón grande "Empezar" o "Seguir: …" y el glosario plegado; las piezas de leer, una página por vista con su tablero y sus marcas; la lista de "¿Y si…?"; y la lección. Capturas de cada pantalla en los dos perfiles (`iterations/v3/capturas/`). La revisión de UX encontró y arregló cuatro cosas: las figuras chicas (ahora un poco más grandes), un peón en e4 que debía estar en e5 en "La estructura", dos flechas de ...c5 que salían de c7 y las pistas que sobraban con la Respuesta a la vista.
- **Por qué:** la vara de todas las pantallas es la Pantalla limpia (`specs/ux.md`), revisada con las capturas en el tamaño del iPhone, no solo con las pruebas en verde.
- **Quién:** Carlos (diseño §7); la revisión, la corrida con la skill `revisar-ux`.
- **Dónde:** `src/pantallas/CursoPagina.tsx`, `src/componentes/Notacion.tsx`; `iterations/v3/revision-ux-curso.md`; pruebas: `tests/e2e/c6-pantallas.spec.ts` y la lección nueva en `tests/e2e/zoom-iphone.spec.ts`.

## [2026-10-29] cambio | C7: tres pases adversariales sobre el curso de la Caro-Kann
- **Qué:** tres revisiones, cada una con un subagente nuevo y solo las seis categorías del instructivo (errores de ajedrez, afirmaciones que el motor no sostiene, textos que delatan la jugada, puntos del diseño §4 que no se cumplen, algo que ya existía y se rompió, texto copiado). Pase 1: 25 hallazgos (8 graves); pase 2: 15 (3 graves); pase 3: 9 (1 grave). Todos se arreglaron. Lo más importante:
  - **El ajedrez:** un caballo de f3 que "cuidaba e4"; un d5 "atacado dos veces" con un solo atacante; un alfil que "se comía" una casilla defendida; una regla del Repaso que regalaba el alfil contra g4; un plan que mandaba el caballo a la casilla de su propio alfil.
  - **Los «¿Y si…?»:** el error "del rival" (6.h4 en la Bayoneta) era su segunda mejor jugada. Pasó a ser un error tuyo (6...h6), y el del rival es ahora 5.Ag2, que pierde un alfil y una torre. **Esto corrige la entrada de C4**, que habla de tres «¿Y si…?» con 6.h4 como error del rival: ahora son cuatro.
  - **Las pistas que delataban:** la de respaldo, armada por el tipo de jugada, daba ideas falsas; ahora cada jugada trae la suya.
  - **Las jugadas buenas:** salían en rojo las que no traía la base. Ahora `buenas` tiene, medida con el motor, toda jugada a 0.2 o menos de la de la lección (91 en 37 posiciones).
  - **La lección:**
    - La Respuesta está a la mano también con un error a la vista.
    - En un «¿Y si…?», el error no dice "esta lección juega…" y el tablero se ve desde tu lado.
    - En el iPhone, la narración tiene altura fija y la ayuda que pides se lleva a la vista.
    - En Practicar, solo "Correcto" (el texto largo se borraba a los 0.9 s).
  - **El Repaso:** las lecciones viejas de la Karpov y la Botvinnik-Carls pasan a la lección de la misma respuesta.
- **Por qué:** nada se inventa en el ajedrez, y las pruebas de forma no ven un texto falso ni una pista que describe la jugada. Cada pase encontró errores en los arreglos del anterior.
- **Quién:** la corrida (instructivo Caro-Kann, C7). Las decisiones que puede cambiar Carlos:
  - Practicar solo dice "Correcto" en lugar de esperar a "Siguiente".
  - La Karpov y la Botvinnik-Carls van a la Clásica y al Avance.
- **Dónde:** `conocimiento/cursos/caro-kann.json`, `src/pantallas/LeccionCurso.tsx`, `src/curso/{ciclo,textos,tipos}.ts`, `src/aprender/migracion.ts`, `src/estilos.css`.
  - Las medidas: `iterations/v3/comprobaciones-del-curso.md` (E-*, P2-*, P3-*).
  - Lo aprendido: `iterations/v3/learning.md` (10 a 20).
  - Las pruebas: `tests/unit/curso-{contenido,ciclo}.test.ts` y `tests/e2e/zoom-iphone.spec.ts`.
  - Los informes de los pases, fuera del repo: `00_corridas/_local/chess/2026-10-29_caro-kann/c7/`.

## [2026-10-29] decisión | C8: el formato de los cursos queda escrito para los otros siete
- **Qué:** `specs/cursos.md` (nuevo) dice cómo se hace un curso del escalón 1, para que la segunda corrida haga los otros siete igual:
  - §1: las seis piezas y el glosario.
  - §2: la lección, con sus dos vueltas, la ayuda en escalones, el error que se queda, las jugadas buenas, el avance guardado y la narración.
  - §3: los textos (los campos de cada jugada, el orden y el largo, sin símbolos, nada se inventa, la fuente de cada idea).
  - §4: dónde vive cada cosa.
  - §5: cómo se comprueba (`revisar-curso`, Vitest, Playwright, el motor y hasta tres pases adversariales).
  
  Lo aprendido en la vuelta (20 puntos, cada uno con su porqué y dónde quedó la regla) está en `iterations/v3/learning.md`.
- **Por qué:** una vuelta se cierra cuando su aprendizaje quedó en las reglas (AGENTS.md). Lo que encontraron los pases (pistas que describen la jugada, `buenas` medidas en cada posición, errores del rival que el motor confirme) es justo lo que la próxima corrida no debe repetir.
- **Quién:** Carlos (instructivo Caro-Kann, C8); la redacción, la corrida.
- **Dónde:** `specs/cursos.md`, `iterations/v3/learning.md`.
- **Una propuesta para Carlos, sin cambiar ninguna regla:** reiniciar la Air antes de una corrida larga con capturas. Esta noche, tras 29 horas encendida, se cayó la pantalla con una captura de WebKit y el perfil iPhone no se pudo correr.

## [2026-10-29] corrida | C9: publicar queda bloqueado (WebKit no arranca en la Air)
- **Qué:** la corrida del curso de la Caro-Kann cierra C0 a C8, integradas a `main`. **No se publicó.** El instructivo pide `npm test` y `npm run e2e` en verde, y el perfil iPhone de `npm run e2e` corre en WebKit, que no arranca desde las 01:54.
- **Las pruebas al cierre** (03:39–03:49, sobre `1fe00b6`):
  - `npm test`: 195 de 195.
  - `npm run e2e -- --project=escritorio`: 66 pasan y 8 se saltan (son del iPhone).
  - El perfil iPhone emulado en Chromium (390×844): 71 pasan y 3 se saltan.
  - `npm run e2e -- --project=iphone`: `browserType.launch: Timeout 180000ms exceeded`.
- **Por qué no arranca:** a las 01:54 se cayó WindowServer (`IOSurface … limit reached`, con una captura de 390×844) y la sesión de Carlos quedó en la pantalla de inicio. Sin sesión gráfica, WebKit no arranca; Chromium sí. Hace falta que Carlos entre con su contraseña.
- **Quién:** la corrida; lo que sigue, Carlos (un paso).
- **Dónde:** `00_corridas/chess/2026-10-29_BLOQUEADO_curso-caro-kann.md`, que trae los pasos para cerrar C9: las pruebas de WebKit, las capturas del iPhone 13 a 16, `npm run publicar` y la comprobación contra la página publicada.

## [2026-10-29] corrida | C9: publicado el curso de la Caro-Kann, con las pruebas del iPhone en WebKit
- **Qué:** Carlos entró a la Air a las 10:57 y WebKit volvió a arrancar. Se cerró C9:
  - `npm test`: 195 de 195 (26 archivos).
  - `npm run e2e`, los dos perfiles, una sola corrida (11:05–11:13): **138 pasan, 12 se saltan, ninguna falla**. iPhone (WebKit): 72 pasan y 3 se saltan; escritorio: 66 pasan y 9 se saltan (las del iPhone y las de favoritas, que se saltan en los dos).
  - Las capturas del iPhone del curso (`iterations/v3/capturas/iphone`, de la 02 a la 19) se rehicieron en WebKit: eran de antes de los arreglos de los pases.
  - Publicado: `npm run publicar` → `gh-pages` `ad36251`, desde `main` `0e86eb9`. Comprobación: `curl -sI` da 200 y el `.wasm` del motor sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages`: 11 pasan y 1 se salta (la del zoom, solo del iPhone). Trae una prueba nueva, `tests/publicado/curso-caro-kann.spec.ts`: el curso abre y la lección de la Tal se juega hasta el plan.
  - Ningún mensaje de `IOSurface` en el registro del sistema durante las pruebas.
- **Lo que encontró la revisión de las capturas:** en el plan de la Tal, en el iPhone, el renglón de "El de blancas" se asomaba cortado a la derecha de "Ahora, Practicar". Ya pasaba en las capturas de Chromium del pase 2 y nadie lo vio. Arreglo: el botón va en una franja del color del panel, a todo lo ancho (`ee65b8e`), con su prueba en `tests/e2e/zoom-iphone.spec.ts`, que falla sin el arreglo. Además, las capturas del curso esperan 250 ms, porque la pieza salía a medio camino de su animación.
- **Por qué:** el instructivo pide `npm test` y `npm run e2e` en verde antes de publicar, con el iPhone en WebKit. La pantalla con el renglón cortado es la que Carlos recorre en la prueba de MAÑANA (variante 4).
- **Quién:** Carlos pidió cerrar C9 (`00_corridas/chess/2026-10-29_PROMPT_publicar-curso-caro-kann.md`); la sesión lo hizo.
- **Dónde:** `0e86eb9` (merge de `ee65b8e`, el arreglo, y `198f2e1`, las capturas); lo aprendido, en `iterations/v3/learning.md` (21 y 22), `specs/ux.md` (En el iPhone, regla 5) y `specs/cursos.md` §2; el cierre, en el REPORTE de la corrida, sección "C9, cerrada".

## [2026-10-29] decisión | Correcciones de la Caro-Kann: los 7 comentarios de Carlos en el iPhone, en una corrida
- **Qué:** Carlos recorrió el curso publicado en su iPhone y dejó 7 comentarios (`iterations/v3/feedback.md`). Una corrida los arregla en este orden: C1 coordenadas en los tableros de leer (puntos 1 y 4), C2 Practicar sin ayudas que no pediste (5), C3 "Ver paso a paso" (2 y 3), C4 publicar, C5 las marcas en el tablero (6 y 7, al final y con revisión de la torre), C6 bitácora y reglas, C7 publicar las marcas con el "publica". La vuelta sigue siendo la v3.
- **Por qué:** Aprender le gustó mucho y se protege; Practicar daba pistas que no pidió; el principiante no se imagina las jugadas solo con el texto; y las marcas, "si se hace bien, quedaría increíble; pero si no, lo puede arruinar visualmente".
- **Quién:** Carlos (instructivo `00_corridas/chess/2026-10-29_INSTRUCTIVO_correcciones-caro-kann.md`, con sus Notas 1 a 3: solo la Caro-Kann por ahora; las reglas de las marcas v1.1; la torre es "Air - chess - torre").
- **Dónde:** `iterations/v3/feedback.md`, `iterations/v3/changes.md`; el estado de la corrida, en `00_corridas/chess/2026-10-29_ESTADO_correcciones-caro-kann.md`.

## [2026-10-29] cambio | C1: coordenadas en los tableros de leer de la Caro-Kann
- **Qué:** los tableros de La idea y de La estructura llevan las mismas coordenadas que la lección (a–h y 1–8 dentro de las casillas), volteadas porque el curso es con negras. También el tablero de la ventana del paso a paso (C3).
- **Por qué:** "Los necesito para ubicar mejor lo que dice abajo." (punto 1). El tablero de la lección ya las tenía (punto 4).
- **Quién:** Carlos (feedback); la corrida.
- **Dónde:** `65d8cb4`. `src/componentes/TableroMini.tsx` (`coordenadas`), `src/pantallas/CursoPagina.tsx`; prueba `tests/e2e/correcciones-coordenadas.spec.ts` (falla sin el arreglo). Los tableros de las tarjetas y de los otros cursos no cambian (Nota 1).

## [2026-10-29] cambio | C2: Practicar sin ayudas que no pediste
- **Qué:** en Practicar, en tu turno solo se lee la frase del rival; nada de tu jugada ni la pregunta por la meta. La Pista, si la pides, da la meta en palabras (lo que antes era la pregunta); la segunda marca la pieza, sin más texto. La Respuesta es solo la flecha. Después de tu jugada (correcta o tras la Respuesta) llega la explicación (qué hace, por qué ahora, qué prepara y el cuidado) y la máquina espera a "Siguiente". Aprender y los «¿Y si…?» no cambian.
- **Por qué:** "se supone que es práctica, sin pistas, pero sí te da pistas"; "la explicación de tu jugada, que te la dé hasta que la hagas, para seguir reforzando el entendimiento" (punto 5). Reemplaza la decisión del piloto de "solo Correcto" en Practicar: Carlos escogió la otra opción.
- **Quién:** Carlos (feedback); la corrida. Decisión de la corrida que Carlos puede cambiar: la explicación de Practicar suma el "cuidado", como Aprender.
- **Dónde:** `e166127`. `src/curso/turno.ts` (nuevo), `src/pantallas/LeccionCurso.tsx`; pruebas `tests/unit/correcciones-practicar.test.ts` (los escalones) y `tests/e2e/correcciones-practicar.spec.ts`; se ajustaron `c3-leccion`, `c6-pantallas` y `zoom-iphone`.

## [2026-10-29] cambio | C3: "Ver paso a paso" en La idea, La estructura, el plan y el repaso
- **Qué:** las páginas de leer guardan su texto y suman "Ver paso a paso": una ventana con un paso por vista, Atrás y Siguiente abajo en las esquinas ("Salir" en el último), que se cierra al tocar fuera. Cada paso es una frase y el tablero hace o muestra lo que dice. 21 paso a paso: La idea, las dos estructuras, las dos páginas del Repaso y los 16 planes (en la lección, junto a "Ahora, Practicar").
- **Por qué:** "para alguien principiante… no sé bien seguir la anotación e imaginármelo" (puntos 2 y 3): las dos maneras, el texto y el tablero.
- **Quién:** Carlos (feedback); la corrida escribió las frases a partir del texto de cada página y de cada plan (sin ajedrez nuevo).
- **Dónde:** `a1bd11d`. Datos `pasoAPaso` en `conocimiento/cursos/caro-kann.json`; `src/curso/pasos.ts`, `src/componentes/PasoAPaso.tsx`; pruebas `tests/unit/correcciones-paso-a-paso.test.ts` (cada paso que habla de una jugada la trae, y al revés) y `tests/e2e/correcciones-paso-a-paso.spec.ts`. Lo aprendido: en un plan, "Ad6" lo jugaba el alfil blanco de f4; las jugadas de negras van con "..." en los datos.

## [2026-10-29] corrida | C4: publicadas las correcciones C1 a C3
- **Qué:** una sola corrida completa y publicar. `npm test`: 210 de 210. `npm run e2e` (13:21–13:30): 158 pasan, 12 se saltan, ninguna falla (iPhone en WebKit 82, escritorio 76). `npm run publicar` desde `main` `501d2dd` → `gh-pages` `8343fd9`. Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`; `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages`: 15 pasan, 1 se salta (la del zoom en escritorio). Ningún `IOSurface`.
- **Por qué:** el instructivo autoriza publicar C1 a C3 con todo en verde; las marcas esperan el "publica" de la torre.
- **Quién:** la corrida.
- **Dónde:** `501d2dd`; prueba nueva en la página publicada: `tests/publicado/correcciones-caro-kann.spec.ts` (coordenadas, paso a paso y Practicar).

## [2026-10-29] cambio | C5: las marcas en el tablero, integradas con un interruptor apagado
- **Qué:** marcas que ilustran lo que dice cada frase, con las reglas v1.1 que aprobó Carlos (tabla A1–A6 y reglas R1–R8). Van pegadas a su frase en los datos (`rival[k].marcas`, `mias[k].marcasDe`, `plan.marcasDe`, `pasoAPaso.pasos[i].marcas`) y se ven junto con ella: en Aprender (la frase del rival y "Te toca"), después de tu jugada en las dos vueltas, en el plan y en el paso a paso. En Practicar y en los «¿Y si…?», nada antes de tu jugada; la segunda Pista ilumina la pieza y la Respuesta es la flecha. El dibujo es propio: flecha sólida (ahora) o de guiones con punta abierta (plan), la del caballo en L sin doblar encima de una pieza, y casilla iluminada; solo verde y rojo. El ejemplo de Carlos queda tal cual: en "3.e5 le quita la casilla f6 a tu caballo", f6 en rojo y la L roja g8→g6→f6, sin d6; en "Te toca: 3...♗f5", una flecha verde. 42 de 140 jugadas llevan marcas (la lista, en `iterations/v3/marcas-por-jugada.md`), más 46 frases del plan y del paso a paso.
- **Por qué:** "si se hace bien, quedaría increíble; pero si no, lo puede arruinar visualmente" (puntos 6 y 7). Las reglas v1.1 hacen que cada marca salga de su frase y se pueda comprobar con un programa.
- **Cómo se comprobó:** `tests/unit/correcciones-marcas.test.ts`, una prueba por regla (R1 a R8) más dos que salieron de los pases (ninguna L dobla encima de una pieza; ninguna casilla encierra una pieza tuya): 12 de 12, y atrapa a propósito una casilla que la frase no dice (d6), una flecha falsa y un color cambiado. `tests/e2e/correcciones-marcas.spec.ts`: apagado de entrada, el dibujo de Carlos, R7 y el tablero de leer limpio. Capturas de cada frase con marcas en los dos perfiles (86 por perfil, `iterations/v3/capturas/marcas/`, con su índice). Tres pases visuales con subagentes nuevos (11, 9 y 4 hallazgos, ninguno de R1 a R5; todos arreglados).
- **Quién:** Carlos (feedback y reglas v1.1, Nota 2); la torre de chess autorizó una segunda corrida de capturas del iPhone, la última de C5. Decisiones de la corrida que puede cambiar la torre: la A1 de "Te toca" solo en las jugadas clave; sin marca cuando ninguna ruta de la L es limpia o la frase queda escondida en el iPhone.
- **Dónde:** `7ffe98d` (merge de `240665a`), con `MARCAS_NUEVAS_DE_ENTRADA = false` en `src/curso/marcas.ts`. `src/componentes/CapaMarcas.tsx`, `scripts/marcas-por-jugada.ts`. Los pases: `00_corridas/_local/chess/2026-10-29_correcciones/c5-pases-visuales.md`. No se publica sin el "publica" de la torre (C7).

## [2026-10-29] decisión | C6: las reglas de Practicar, del paso a paso y de las marcas, en specs/cursos.md
- **Qué:** `specs/cursos.md` trae ahora las coordenadas en todo tablero del curso (§1), Practicar sin ayudas que no pediste (§2), "Ver paso a paso" (§2.1) y las marcas completas (§2.2: la tabla A1–A6, R1–R8, los tres ejemplos, lo que enseñaron los pases, dónde se ven y cómo se escriben). Lo aprendido, en `iterations/v3/learning.md` (23 a 35) y `iterations/v3/changes.md`.
- **Por qué:** para que los otros siete cursos ya salgan así (Nota 1: por ahora, solo la Caro-Kann), y porque una vuelta se cierra cuando su aprendizaje quedó en las reglas.
- **Quién:** Carlos (instructivo, C6); la redacción, la corrida.
- **Dónde:** `specs/cursos.md`, `iterations/v3/{changes,learning}.md`.

## [2026-10-29] corrida | C7: las marcas tienen el "publica" de la torre, pero publicarlas queda bloqueado (se cayó la pantalla de la Air)
- **Qué:** la torre de chess revisó en el iPhone las capturas de las marcas (la 00, el ejemplo de Carlos, y el paso a paso, de la 58 a la 85) y dijo **"publica"** a las 14:42. Antes pidió un arreglo, que se hizo: en el tablero chico del paso a paso, las flechas de una casilla van más gruesas y con un borde claro (`e42a934`); el tablero de la lección no cambió. Se preparó C7 en `feat/c7-marcas` (`8daa76d`, en `origin`): el interruptor prendido (`MARCAS_NUEVAS_DE_ENTRADA = true`), las pruebas que contaban las flechas de chessground (`c3-leccion`, `correcciones-practicar`) cuentan ahora la capa nueva, y una prueba en la página publicada mira el ejemplo de Carlos. `npm test`: 222 de 222. **En el `npm run e2e` de C7 (empezó a las 14:43:27, con 43 % de memoria libre, sin navegadores sobrantes y 1885 MB de swap), a las 14:45:22 se cayó WindowServer:** el reporte `/Library/Logs/DiagnosticReports/WindowServer-2026-10-29-144525.ips` dice `SIGABRT` en `IOSurfaceDebugTallyAndAbort` ← `iosurface_create_common`, el mismo límite de la noche (C9 del piloto). La sesión de Carlos quedó en la pantalla de inicio y WebKit ya no arranca: tres pruebas del iPhone fallaron en 1 ms. La corrida se detuvo y se avisó a la torre. **No se publicó:** `main` y la página publicada siguen con el interruptor apagado (lo de C4).
- **La decisión de Carlos sobre la A1** (por la torre, 14:38): la flecha verde de tu jugada en "Te toca" se queda **solo en las jugadas clave** (14 de 69: 1...c6, las 2...d5, 3...♗f5, ...h5 contra h4, 4...♗f5 y 6...h6 en la Clásica, ...♗g4). Después de probarlo dirá si hace falta en todos; la pregunta va en el MANANA de la corrida.
- **Por qué:** el instructivo pide publicar solo con todo en verde, y detenerse si aparece `IOSurface`.
- **Quién:** Carlos (la A1); la torre (el "publica" y el arreglo del tablero chico); la corrida. Lo que sigue es de Carlos: entrar a la Air con su contraseña.
- **Dónde:** `feat/c7-marcas` en `origin`; los pasos para cerrar C7, en `00_corridas/chess/2026-10-29_BLOQUEADO_correcciones-caro-kann.md`.
- **Lo aprendido (propuesta, no se cambió ninguna regla):** la corrida de las capturas del iPhone de C5 (14:41) y la suite completa de C7 (14:43) quedaron a dos minutos una de otra; el swap venía de 1.5 a 1.9 GB. Una corrida completa de WebKit justo después de otra con capturas tumbó la pantalla, igual que en la noche. Antes de la suite completa conviene dejar pasar un rato, o reiniciar la Air si el swap pasa de 1.5 GB.

## [2026-10-29] corrida | C7: publicadas las marcas de la Caro-Kann, con el "publica" de la torre
- **Qué:** Carlos entró a la Air (a las 17:43 `/dev/console` volvió a ser suyo) y se retomó C7 desde las pruebas, con los pasos del BLOQUEADO y uno más que pidió la torre: esperar a que la carga bajara de 8 (`uptime`, de 75 a 7.46 a las 17:46). Antes de la corrida: 70 % de memoria libre, sin navegadores sobrantes, swap 127 MB.
  - `npm test`: 222 de 222.
  - `npm run e2e`, una sola vez, los dos perfiles (17:46–17:55): **166 pasan, 12 se saltan, ninguna falla** (iPhone en WebKit 86, escritorio 80).
  - Sin `IOSurface` en el registro y sin reportes de fallo nuevos.
  - Integrado: `eef6ead` (merge de `feat/c7-marcas`, con `MARCAS_NUEVAS_DE_ENTRADA = true`).
  - `npm run publicar` → `gh-pages` `2703309`; a las 17:56:23 la página servía `index-CYetwzx9.js`, el del build.
  - Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages`: 17 pasan y 1 se salta (la del zoom en escritorio). Incluye la prueba nueva del ejemplo de Carlos con las marcas prendidas (f6 roja, la L roja g8→g6→f6, sin d6, y la verde c8→f5), que pasa en los dos perfiles.
- **Por qué:** el instructivo pide publicar las marcas solo con el "publica" de la torre (14:42) y con todo en verde; la caída de las 14:45 lo había dejado bloqueado.
- **Quién:** la torre ("retoma C7", 17:43); la corrida.
- **Dónde:** `eef6ead` en `main`, `gh-pages` `2703309`. Cierra la entrada anterior de C7 (bloqueada) y el BLOQUEADO de la corrida.

## [2026-10-29] cambio | La lección del curso cabe en la pantalla del celular
- **Qué:**
  - En el celular (menos de 900 de ancho), la lección mide lo que se ve de la pantalla: `100dvh`, con `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`. La narración deja su alto fijo de 200 y toma lo que sobra (140 o más). Solo si no alcanza, el tablero se achica, centrado, hasta 280. La página ya no se desliza; solo en el caso extremo, como el iPhone SE en Safari con sus barras (375×548).
  - La línea de jugadas va en un renglón que se desliza, con la última jugada a la vista. Al final de la Clásica medía tres renglones (77 px) a 360 y 375 de ancho, y con ella el SE no cabía.
  - "Empezar de nuevo" pasa a ser el cuarto botón de la fila, **"Reiniciar"**, con su ícono (una flecha en círculo, dibujada en el código), en el celular y en la computadora. La ventana que confirma ("¿Empezar de nuevo?") no cambia. Se quitó el enlace de abajo.
  - Nota 1 de Carlos (21:35): el resumen también cabe (su texto se desliza en el espacio de la narración y las salidas quedan abajo). Su botón es de tamaño normal y dice solo "Siguiente variante". Los otros tres botones con jugadas en su texto (Seguir, Listo · Sigue y el Siguiente de la lección de antes) llevan el texto en un solo elemento: `.boton` es `inline-flex` y la figura ♘ quedaba como columna aparte.
  - Medido en Chromium (alto de la página contra la ventana, en "Te toca" de la última jugada de la Clásica). Antes: 917/667, 902/740, 906/844, 918/874 y 946/932. Después: la página mide lo mismo que la ventana en las cinco pantallas, también en el resumen. Narración de 140 a 263; tablero de 287 a 430. Con las barras del sistema simuladas (402×874, arriba 62 y abajo 34): tablero 402, narración 157.
  - Pruebas: `npm test` 222 de 222. `npm run e2e`, una sola vez, los dos perfiles (21:57–22:06): **178 pasan, 12 se saltan, ninguna falla** (iPhone en WebKit 92, escritorio 86). Sin `IOSurface` ni reportes nuevos de WindowServer.
  - Lo que ya funcionaba se queda, y lo cuidan sus pruebas en verde: la narración se desliza por dentro; su botón va en la franja a todo lo ancho (C9); la ayuda que pides se lleva a la vista; Pista, Respuesta y Atrás siempre a la vista (ahora también Reiniciar); nada se sale a lo ancho; y la ventana que confirma.
- **Por qué:** Carlos probó la Caro-Kann en su iPhone 16 Pro (402×874, instalada como app) y vio dos barras de scroll: la de la narración, que funciona, y la de la página, que sobraba. La página no cabía en ninguno de los cinco celulares que midió la torre: abajo de los botones iban "Empezar de nuevo" y un margen. Las pruebas de antes miraban que los botones se vieran, no que la página cupiera.
- **Quién:** Carlos (el prompt y la Nota 1); la corrida de la Air.
- **Dónde:** `fix/leccion-cabe-en-pantalla`: `0e28d58` (la prueba y las capturas de antes), `84a42da` (el cambio), `f4acfe0` (las reglas) y `4149810` (las capturas de después). La regla está en `specs/ux.md` (En el iPhone, regla 6, y los botones con jugadas) y en `specs/cursos.md` §2; lo aprendido, en `iterations/v3/learning.md` (37 a 41). Las pruebas: `tests/e2e/leccion-cabe.spec.ts`, `tests/e2e/c3-leccion.spec.ts` (Reiniciar) y `tests/publicado/leccion-cabe.spec.ts`. Las capturas, en `iterations/v3/capturas/correcciones/{iphone,escritorio}/leccion-{antes,despues}-*`. El reporte, en `00_corridas/chess/2026-10-29_REPORTE_leccion-cabe-en-pantalla.md`.

## [2026-10-29] corrida | Publicada la lección que cabe en la pantalla del celular
- **Qué:**
  - Integrado a `main` en `31850c7` (merge `--no-ff` de `fix/leccion-cabe-en-pantalla`).
  - `npm run publicar` subió `gh-pages` `889b170`. A las 22:08:56 la página servía `index-CiQXZ_yd.js`, el del build.
  - Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages -- --project=escritorio`: 9 pasan y 1 se salta (la del zoom, que es del iPhone). Con el iPhone emulado en Chromium (390×844, táctil): 10 de 10. Las dos corridas incluyen la prueba nueva, `tests/publicado/leccion-cabe.spec.ts`: la lección a 402×874, sin scroll de la página y con los cuatro botones a la vista.
- **Por qué en Chromium:** la §6 del prompt y la torre piden WebKit una sola vez (la pantalla de la Air se cae por `IOSurface`), y esa vez ya fue la suite completa (21:57–22:06). La comprobación de la página publicada trae el perfil del iPhone en WebKit; la corrida la hizo en Chromium, con el mismo perfil emulado. Propuesta para la regla: `iterations/v3/learning.md`, n.º 41.
- **Quién:** la corrida de la Air (publicar estaba autorizado en el prompt, con todo en verde).
- **Dónde:** `main` `31850c7`, `gh-pages` `889b170`; el reporte, en `00_corridas/chess/2026-10-29_REPORTE_leccion-cabe-en-pantalla.md`.

## [2026-10-29] cambio | El botón "Seguir" de la página del curso, con jerarquía
- **Qué:**
  - En la página del curso, el botón grande dice **"Seguir"** arriba, con la letra de `grande` (22 px), y abajo el nombre de lo que sigue ("Avance: 4.♘c3 (Van der Wiel)"), en 15 px, de peso normal y en un renglón. Los dos renglones van dentro de un solo elemento hijo del botón (`.boton-seguir` y `.boton-seguir-nombre` en `src/estilos.css`).
  - "Empezar" y "Repasar el curso" no cambian. Tampoco los otros botones, la lección, los otros siete cursos ni la figura ♘.
  - Medido en Chromium a 360 de ancho: el nombre más largo de las 16 variantes, el de la Van der Wiel, mide 208 de los 296 que deja el botón (en letras, "4.Nc3", 208.3). Cabe en 15 px; no hubo que bajar la letra. El botón mide 79.5 de alto a 360.
  - Pruebas: `tests/e2e/boton-seguir.spec.ts`, nueva, en los dos perfiles. Recorre las 16 variantes en curso a 360, 375, 402 y 430: "Seguir" con la letra de `grande`, el nombre chico, de peso normal, en un renglón y dentro del botón, el texto en un solo elemento y sin scroll a lo ancho. También revisa que "Empezar" y "Repasar el curso" sigan igual. Tres pruebas que buscaban el texto "Seguir: …" (`c3-leccion`, `c6-pantallas`, `leccion-cabe`) miran ahora los dos renglones.
  - `npm test`: 222 de 222. `npm run e2e`, una sola vez, los dos perfiles (00:05:22–00:15:12 del 30): **184 pasan, 12 se saltan, ninguna falla** (iPhone en WebKit 95, escritorio 89). Sin `IOSurface` ni reportes nuevos de WindowServer.
- **Por qué:** Carlos vio en su iPhone "Seguir: Avance: 4.♘c3 (Van der Wiel)" todo en 22 px, con "Wiel)" solo en el segundo renglón: se veía pesado. El botón sigue grande porque es la acción principal de la página, pero con jerarquía: la acción, grande; dónde retomo, chico.
- **Quién:** Carlos (el prompt); la corrida de la Air. Una decisión de la corrida: "Seguir" lleva los dos renglones con cualquier cosa que siga (también "La estructura" o "Errores y trampas"), no solo con una variante, para que el botón se vea igual siempre.
- **Dónde:** `fix/boton-seguir`: `fd0607c` (la prueba y las capturas de antes), `b8f4ac3` (el cambio), `ce3fb32` (las reglas) y `c9ec361` (las capturas de después). La regla, en `specs/cursos.md` §1 (la página del curso) y §5; lo aprendido, en `iterations/v3/learning.md` n.º 42. Las capturas, en `iterations/v3/capturas/correcciones/{iphone,escritorio}/boton-seguir-{antes,despues}-*` (las de antes, solo en `escritorio/`, de Chromium). El reporte, en `00_corridas/chess/2026-10-29_REPORTE_boton-seguir.md`.

## [2026-10-29] corrida | Publicado el botón "Seguir" con jerarquía
- **Qué:**
  - Integrado a `main` en `9ca2bf5` (merge `--no-ff` de `fix/boton-seguir`, encima de `origin/main` `526a900`).
  - `npm run publicar` subió `gh-pages` `4b3528c` a las 00:16:34 del 30. A las 00:17:47 la página servía `index-OUHVzM9S.js`, el del build.
  - Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages -- --project=escritorio`: 9 pasan y 1 se salta (la del zoom, que es del iPhone). Con el iPhone emulado en Chromium (390×844, táctil): 10 de 10.
  - Ninguna prueba de la página publicada mira el botón: se revisó aparte, en Chromium, con la Van der Wiel en curso. A 402×874 y a 360×740: "Seguir" en 22 px y "Avance: 4.♘c3 (Van der Wiel)" en 15 px, peso 400, en un renglón (19.5 de alto), el texto en un solo elemento y la página tan ancha como la pantalla.
- **Por qué en Chromium:** el prompt (§5) pide WebKit una sola vez, y esa vez fue la suite completa (00:05–00:15). Es la misma salida que la corrida anterior (`iterations/v3/learning.md` n.º 41).
- **Quién:** la corrida de la Air (publicar estaba autorizado en el prompt, con todo en verde).
- **Dónde:** `main` `9ca2bf5`, `gh-pages` `4b3528c`; el reporte, en `00_corridas/chess/2026-10-29_REPORTE_boton-seguir.md`.

## [2026-10-30] cambio | Saltar a Practicar: el interruptor Aprender | Practicar
- **Qué:**
  - En la lección de la Caro-Kann, la etiqueta de la vuelta en la fila de arriba ("Aprender · Jugada N de M") es ahora un interruptor de dos opciones, **Aprender | Practicar**, con "Jugada N de M" a la derecha. Se ve siempre, en Aprender (también en el plan) y en Practicar. La vuelta en curso va marcada con el color de su chip de antes (`chip-rep` o `chip-base`) y en negritas; la otra, sin fondo y con letra normal.
  - Tocar la otra empieza esa vuelta desde su primera jugada, con su introducción (`empezar(l, vuelta)`), sin preguntar. Tocar la que ya está no hace nada. Lo que se guarda para retomar ("dónde me quedé") toma la vuelta nueva desde el toque.
  - No va en el resumen ni en los «¿Y si…?», que se quedan con su chip "Castígalo". No agrega altura: la fila mide lo que "Jugada N de M"; lo que se toca crece 10 arriba y 10 abajo, dentro del margen del panel.
  - El avance ya funcionaba sin cambios: la página del curso cuenta `terminada`, no `aprendida`, y al terminar Practicar la variante entra al Repaso (`marcarLeccion`) y cada jugada se registra (`registrarPasoCurso`). Lo revisa la prueba nueva con la Fantasía, solo en Practicar: "1 de 16 variantes", "Hecha", el Repaso de mañana y dos jugadas en el registro. No cambió `avance.ts` ni `ciclo.ts`, así que no hubo Vitest nuevo.
  - Los otros siete cursos, las marcas y los botones de abajo no cambian.
  - Pruebas: `npm test` 222 de 222. En Chromium: la prueba nueva y `leccion-cabe` en las cinco pantallas, el escritorio completo (96 pasan, 9 se saltan) y las pruebas de la lección con el iPhone emulado (102 pasan, 3 se saltan). `npm run e2e`, una sola vez, los dos perfiles (00:42:23–00:52:40): **198 pasan, 12 se saltan, ninguna falla** (iPhone en WebKit 102, escritorio 96). Sin `IOSurface` ni reportes nuevos de WindowServer.
- **Por qué:** Carlos quería saltar directo a Practicar, por ejemplo con una variante que ya aprendió; hasta hoy solo llegaba terminando Aprender. Sin preguntar, porque son pocas jugadas y volver es otro toque.
- **Quién:** Carlos (el prompt, con el diseño ya decidido); la corrida de la Air. Una decisión de la corrida: la vuelta marcada lleva negritas, además de su color, porque con Practicar marcado el gris de `chip-base` casi no se distinguía de la otra opción (`iterations/v3/learning.md` n.º 43).
- **Dónde:** `feat/saltar-a-practicar`: `7f74731` (la prueba y las capturas de antes), `17b7e25` (el cambio), `a8d5f0d` (la regla) y `195cd4c` (las capturas de después). La regla, en `specs/cursos.md` §2 ("Saltar de una vuelta a la otra") y §5; lo aprendido, en `iterations/v3/learning.md` n.º 43 y 44. La prueba: `tests/e2e/saltar-a-practicar.spec.ts`. Las capturas, en `iterations/v3/capturas/correcciones/{iphone,escritorio}/saltar-{antes,despues}-*` (las de antes, solo en `escritorio/`, de Chromium). El reporte, en `00_corridas/chess/2026-10-30_REPORTE_saltar-a-practicar.md`.

## [2026-10-30] corrida | Publicado el interruptor Aprender | Practicar
- **Qué:**
  - Integrado a `main` en `8d70d68` (merge `--no-ff` de `feat/saltar-a-practicar`, encima de `origin/main` `0cdec0c`).
  - `npm run publicar` subió `gh-pages` `93d0ae3` a las 00:53:52 del 30. A las 00:54:18 la página servía `index-CML2fesy.js`, el del build.
  - Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages -- --project=escritorio`: 9 pasan y 1 se salta (la del zoom, que es del iPhone). Con el iPhone emulado en Chromium (390×844, táctil): 10 de 10.
  - Ninguna prueba de la página publicada mira el interruptor: se revisó aparte, en Chromium (escritorio y el iPhone emulado), con la Tal en la jugada 3 de Aprender. A 402×874 y a 360×740: el interruptor a la vista y marcado en Aprender; "Practicar" lleva a la introducción de Practicar en "Jugada 1 de 4" y, con "Empezar", al primer turno sin marcas; "Aprender" regresa a la jugada 1. La página mide lo mismo que la pantalla (874 y 740) y la fila, 19 a 20.
- **Por qué en Chromium:** el prompt (§5) pide WebKit una sola vez, y esa vez fue la suite completa (00:42–00:52). Es la misma salida que las dos corridas anteriores (`iterations/v3/learning.md` n.º 41).
- **Quién:** la corrida de la Air (publicar estaba autorizado en el prompt, con todo en verde).
- **Dónde:** `main` `8d70d68`, `gh-pages` `93d0ae3`; el reporte, en `00_corridas/chess/2026-10-30_REPORTE_saltar-a-practicar.md`.

## [2026-10-30] decisión | Las marcas, v1.3: lo del rival antes de tu jugada, lo tuyo después
- **El criterio de Carlos, en sus palabras:** "Quiero entender lo que hace mi rival y deducir yo mi jugada." "Cuando me indican directamente qué tengo que mover, no comprendo tanto: simplemente hago caso. Cuando no me lo dicen, tengo que esforzarme en comprender la situación, y si no la entiendo, leo la notación, solo la del movimiento que me toca." Y a las 00:40 y 00:45, sobre lo publicado: "en Practicar no se dan pistas que no pedí".
- **Qué cambió:**
  - **Antes de tu jugada, solo lo del rival.** En Aprender, "Te toca" ya no lleva marcas tuyas: la flecha de tu jugada (A1) sale solo con la Respuesta, como en Practicar. En Practicar, antes de jugar, nada.
  - **Después de tu jugada, lo tuyo,** con las frases que se leen después (en Practicar, también "qué hace": ahí sale la verde g4→d1 de 6...♗g4 en el Cambio).
  - **Lo pegado no se marca** (R8), salvo la casilla vacía que te quitan (A5).
  - **A7, nueva:** el plan o la amenaza del rival, en rojo punteado, una flecha por paso, hasta dos ("lleva el otro caballo a f4 para seguir persiguiendo a tu alfil de g6": e2→f4 y f4→g6).
  - **R7 creció:** mientras dura la línea, ninguna marca apunta a una jugada tuya que viene (misma pieza, misma casilla), en Aprender y en Practicar; en el plan del final, sí. Y en Practicar, la explicación de después no muestra una frase que nombre o describa una jugada que la línea todavía te va a pedir (el caso de Carlos: la Van der Wiel, 3...♗f5 y "Después vas a jugar ...e6"). Aprender no cambia.
  - **Los datos de la Caro-Kann:** se quitaron 14 A1, 21 A2 (pegadas), 13 A4 (12 pegadas y la de 7.♘f3, que pasó a A7) y 3 A3 (las que adelantaban en toda línea donde salen); 2 A2 del paso a paso pasaron a A3 (dicen un plan); se agregaron 23 A7, 10 A4 y 1 A6. La lista de lo pegado de la torre se confirmó con un programa y salió más larga: 35. Se reescribieron 7 frases del rival para nombrar su casilla, sin cambiar lo que dicen. 14 frases llevan `describe`. La lista completa, en el reporte.
  - **Dos pases visuales** con subagentes nuevos, solo contra la v1.3 y sus seis ejemplos, sobre las capturas de cada momento que cambió (`iterations/v3/capturas/marcas-v1.3/`). Ninguno encontró una regla rota. El 1 encontró tres cosas que se leían mal (la ruta de 7.♘f3 encimada, la L del plan de 4.c3 sobre la flecha de la dama y una marca del paso a paso sin su frase); se arreglaron (`89d7b36`) y una prueba nueva revisa que no vuelvan. El 2, ninguna nueva de gravedad alta.
- **Por qué:** dos objetivos que se equilibran: que aprender sea llevadero (el tablero ayuda a ver la situación) y que comprenda, no que obedezca (el tablero no da la respuesta: la da el texto, o la Pista y la Respuesta si las pides).
- **Quién:** Carlos (el criterio, las dos dudas "1A" y "A", y lo de las 00:40 y 00:45); la torre (las reglas v1.3, `00_corridas/chess/2026-10-29_REGLAS_marcas.md`); la corrida de la Air.
- **Dónde:** `feat/marcas-v1.3`. Las reglas completas, en `specs/cursos.md` §2.2 (y §2 y §3: lo que no adelanta en Practicar). El código: `src/curso/marcas.ts`, `src/curso/adelantar.ts` (nuevo), `src/curso/turno.ts`, `src/componentes/CapaMarcas.tsx`. Las pruebas: `tests/unit/correcciones-marcas.test.ts` (R1 a R8, los seis ejemplos y los errores metidos a propósito) y `tests/e2e/correcciones-marcas.spec.ts`. La lista, `iterations/v3/marcas-por-jugada.md`; las capturas, `iterations/v3/capturas/marcas-v1.3/`. Lo aprendido, `iterations/v3/learning.md` n.º 45 a 50 y 53.

## [2026-10-30] cambio | Tres errores de pantalla: el texto debajo de "Siguiente", la barra de inicio y la hora, y las coordenadas de la página del curso
- **Qué:**
  - **Debajo de "Siguiente" ya no se asoma texto.** En la captura de Carlos (la Van der Wiel, 3...♗f5), entre el botón y el borde de abajo de la narración se veía cortado "…detrás de tus peones, como en la Francesa". La causa: la franja del botón (C9) se pegaba con `bottom: 0`, y `sticky` se pega dentro del relleno del cuadro que se desliza (10 px); por ahí pasaba el texto. Ahora la franja baja esos 10 y los cubre con su propio relleno.
  - **Nada queda debajo de la barra de abajo ni detrás de la hora.** La barra (Inicio, Jugar, Aprender, Más) medía `--alto-nav` más la barra de inicio del iPhone, pero el espacio de abajo del contenido y el menú "Más" no la sumaban: "Palabras del curso" quedaba tapado, y lo último de 7 de 15 pantallas, 10 px debajo de la barra. Ahora la suman, en todas las pantallas con la barra. Arriba va una franja fija del color del fondo, del alto de la hora; el contenido empieza abajo de ella y el escogido de Jugar se pega debajo. La lección y la partida no cambian (ya las contaban).
  - **El tablero de arriba de la página del curso lleva coordenadas,** volteadas para negras, como los de leer. Las miniaturas de las tarjetas de Aprender se quedan sin ellas.
- **Por qué:** lo vio Carlos en su iPhone (00:36, 00:44 y 00:55). Ninguna prueba lo veía: la de C9 miraba a los lados del botón, no debajo, y Playwright no trae los `env()` de las barras del sistema.
- **Cómo se comprobó:** tres pruebas que fallan sin el arreglo (`4d7d75f`) y pasan con él (`a36cc5d`): `tests/e2e/zoom-iphone.spec.ts` (C9, en las cinco pantallas de `leccion-cabe`: fallaban las 5), `tests/e2e/barras-del-sistema.spec.ts` (nueva: un estilo de prueba fija `--seguro-arriba` y `--seguro-abajo` en 62 y 34; fallaban 9 de 17) y `tests/e2e/correcciones-coordenadas.spec.ts`. La suite completa en Chromium, los dos perfiles: 226 pasan, 34 se saltan.
- **Quién:** Carlos (el prompt, puntos 8, 9 y 10); la torre (la causa del punto 9, confirmada); la corrida de la Air.
- **Dónde:** `src/estilos.css` (las variables `--seguro-arriba` y `--seguro-abajo`, `.contenido`, `.menu-mas`, `.franja-arriba`, `.narracion-pie`), `src/componentes/Marco.tsx`, `src/pantallas/CursoPagina.tsx`. Las reglas: `specs/ux.md` (En el iPhone, reglas 5 y 7) y `specs/cursos.md` §1. Lo aprendido: `iterations/v3/learning.md` n.º 51 y 52.

## [2026-10-30] decisión | S1: en el interruptor Aprender | Practicar, la vuelta en curso siempre en verde
- **Qué:** la opción escogida del interruptor va siempre en verde (`chip-rep`) y en negritas, sea Aprender o Practicar; la otra, en gris (sin fondo, con el texto apagado). Antes, Practicar escogido iba en gris (`chip-base`). El chip "Castígalo" de los «¿Y si…?» no cambia.
- **Por qué:** Carlos lo probó en su iPhone: "Prefiero que Practicar se ponga en verde cuando esté seleccionado y que Aprender se ponga un gris. Así como Aprender está en verde cuando está activo y Practicar está en gris." El verde dice "aquí estás", no qué vuelta es. Con Practicar en gris, las dos opciones casi no se distinguían (`iterations/v3/learning.md` n.º 43; las negritas eran un parche).
- **Quién:** Carlos (por la torre, "S1", en la misma rama y la misma publicación que las marcas v1.3); la corrida de la Air.
- **Dónde:** `VUELTAS` en `src/pantallas/LeccionCurso.tsx` y `.vueltas` en `src/estilos.css`. La regla, en `specs/cursos.md` §2 ("Saltar de una vuelta a la otra"). La prueba, `tests/e2e/saltar-a-practicar.spec.ts`: con cada vuelta escogida, su fondo y su color son los de `chip-rep`, en negritas, y la otra va sin fondo y gris; fallaba antes del cambio (`21a740e`). Las capturas de la fila, en `iterations/v3/capturas/marcas-v1.3/{iphone,escritorio}/*-s1-interruptor-*.png`.

## [2026-10-30] decisión | La revisión de la torre de las marcas v1.3: lo tuyo desde lejos o saltando también, y la punteada de una casilla que se lee
- **Qué:**
  - **Decisión 1, las tres puntas en d4 del plan de 4.c3 (la roja de ♘f3, la de la dama y la verde de c5):** se quedan. Es la idea del plan, la pelea por d4, y cabe en R2.
  - **Decisión 2, lo tuyo desde lejos o saltando:** la tabla v1.3 dice que la A2 se marca después de tu jugada, así que esas frases llevan su flecha. Se agregaron 15 A2: en las frases que se leen después de jugar (en Practicar, también "qué hace") y en el paso a paso ("Tu dama ataca el peón de b2", "Desde ahí tu alfil ataca a la torre de h1", "Desde ahí tu alfil sigue mirando a e4 y a c2" (solo g6→c2, que pasa por e4: dos flechas en la misma diagonal iban una encima de otra), los caballos que atacan o cuidan d4, d5 y e5, la dama que defiende d5, y "...♘c6: vas contra d4" del Bronstein). Cada una con R1, R4, R7 y R8: "Atacas el peón de d5 con el caballo" (4...♘f6 en el 2.c4) no la lleva, porque 5...♘xd5 viene después. Tres "por qué" se reescribieron para nombrar al alfil (R1), sin cambiar lo que dicen.
  - **La punteada de una casilla se lee como flecha.** En el ejemplo 5 de Carlos (h4→h5) se veía una "V" chica: sus rayas caían sobre la pieza, donde casi no se ven, y la punta tapaba el resto. Ahora sale del borde entre las dos casillas, con la punta más chica: se ven dos o tres rayas y la punta en la casilla de llegada (la recta pasa un poco del centro; la diagonal llega antes, para no chocar con otra punta). Las demás flechas no cambian; la casilla roja que se ve café se queda.
  - **Arreglado de paso:** `Flecha` cambiaba la ruta que le pasa la capa, y en desarrollo React dibuja dos veces; las capturas 01–82 muestran las punteadas largas un poco más afuera de su pieza que la app publicada (`iterations/v3/learning.md` n.º 56).
- **Por qué:** la torre revisó las capturas de la primera vuelta y los dos pases visuales; el ejemplo 5 es el que dibujó Carlos, "así que no es menor". Lo demás de la revisión quedó como estaba (el índice, los ejemplos, S1, las quitadas, las A7 y los tres arreglos de pantalla), incluidas las 4 jugadas de Practicar sin explicación, que la torre le dirá a Carlos.
- **Quién:** la torre ("Air - chess - torre"), con las reglas v1.3 de Carlos; la corrida de la Air.
- **Dónde:** `b400573` (las A2, el dibujo y sus pruebas) y `c0af644` (las capturas de la segunda vuelta, desde la 83, en `iterations/v3/capturas/marcas-v1.3/`, con su sección en `indice.md` y `cambios-2.json`). Las reglas: `specs/cursos.md` §2.2. Lo aprendido: `iterations/v3/learning.md` n.º 55 y 56.

## [2026-10-30] corrida | Publicadas las marcas v1.3, Practicar sin pistas, los tres errores de pantalla y S1
- **Qué:**
  - La torre revisó dos vueltas de capturas (Chromium) y dijo **"publica"**. En la primera tomó dos decisiones: (1) A, las tres puntas en d4 se quedan; (2) B, lo tuyo desde lejos o saltando entra en esta corrida. También pidió arreglar la punteada de una casilla. La segunda vuelta le pareció bien.
  - Antes de WebKit (02:53): `/dev/console` de `carlosaguerof`, 50 % de memoria libre, carga 1.63, sin WebKit ni Chromium sobrantes, sin WindowServer nuevo desde el reinicio de las 23:04.
  - `npm run e2e`, una sola vez, los dos perfiles (02:53:16–03:03:48): **226 pasan, 34 se saltan, ninguna falla** (iPhone en WebKit: 127 pasan y 3 se saltan; escritorio: 99 y 31). Después: 0 renglones de `IOSurface` en `log show --last 30m` y ningún `WindowServer-*.ips` nuevo; 39 % libre.
  - `npm test`: 235 de 235. Integrado a `main` en `ec90fac` (merge `--no-ff` de `feat/marcas-v1.3` encima de `origin/main` `ad72f10`).
  - `npm run publicar` → `gh-pages` `08028e5` (03:04:54–03:05:01). A las 03:05:36 la página servía `index-CeANqJK6.js`, el del build.
  - Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages`, en Chromium (escritorio y el iPhone emulado, 390×844, táctil): **25 pasan, 1 se salta** (la del zoom en escritorio). Incluye las pruebas nuevas de la página publicada:
    - el ejemplo de Carlos, sin la verde de 3...♗f5;
    - la A7 de 7.h4;
    - Practicar sin ...e6 después de 3...♗f5;
    - las coordenadas de la página del curso.
- **Por qué la comprobación fue en Chromium:** la §5 del prompt pide WebKit una sola vez, y esa vez fue la suite completa, como en las corridas anteriores (`iterations/v3/learning.md` n.º 41).
- **Quién:** la torre ("publica", 02:52); la corrida de la Air.
- **Dónde:** `main` `ec90fac`, `gh-pages` `08028e5`. El reporte, en `00_corridas/chess/2026-10-30_REPORTE_marcas-v1.3.md`.

## [2026-10-30] cambio | Las pruebas completas en GitHub, no en la Air
- **Qué:**
  - `.github/workflows/pruebas.yml`: `npm test` y `npm run e2e`, los dos perfiles, en una máquina de GitHub nueva en cada corrida, sobre la rama que se diga (`gh workflow run pruebas.yml -f rama=<rama>`). Se lanza a mano, no corre en cada push, no usa secretos, no hace commits y no publica. Al final, aunque falle, sube `test-results/` y solo las capturas que esa corrida rehízo.
  - Máquina: `macos-latest` (macOS 26 arm64, M1 de 3 núcleos, 7 GB), con Node 26.12.1, el de la Air. Gratis: la documentación de GitHub dice que los ejecutores estándar son gratis e ilimitados en repos públicos, y la API da `billable` 0 ms en las tres corridas.
  - Corridas (todas: 226 pasan, 34 se saltan, 0 fallan; iPhone en WebKit 127 y 3, escritorio 99 y 31; `npm test` 235 de 235):
    - [`41042070927`](https://github.com/carlosaguerof/chess/actions/runs/41042070927), `main` `7995874`: 13 min 4 s (`e2e` 12.0 min).
    - [`41042074419`](https://github.com/carlosaguerof/chess/actions/runs/41042074419), `main` `7995874`: 17 min 42 s (`e2e` 16.2 min).
    - [`41044447367`](https://github.com/carlosaguerof/chess/actions/runs/41044447367), `feat/marcas-v1.3` `28de5f9`: 13 min 10 s (`e2e` 12.2 min). Es para comprobar que sirve para otra rama; el registro muestra que bajó ese commit.
  - El mismo resultado de la Air en la publicación de las marcas v1.3 (226, 34, 0 y 235 de 235): `main` no cambió de pruebas desde entonces.
  - El artefacto se bajó con `gh run download` en las dos de `main`: 243 capturas, 122 del iPhone, 38 MB.
- **Por qué:** las pruebas del perfil del iPhone en WebKit sacan muchas capturas y van llenando el WindowServer de la Air. Ya tiró la pantalla dos veces (n.º 15 y 36). Reiniciar lo vacía, pero cierra las sesiones y el Remote Control, y la Air se queda en la contraseña de FileVault. Una máquina de GitHub se tira al acabar: si algo se llena, no le pasa nada a la Air.
- **Quién:** Carlos (el prompt `00_corridas/chess/2026-10-30_PROMPT_pruebas-en-github.md`); la corrida "pruebas en GitHub" en la Air. Lo que decidió la corrida: Node exacto (26.12.1), `timeout-minutes: 60`, 14 días de artefacto, subir solo lo rehecho, `DEBUG=pw:browser` para que el registro muestre el navegador, y la tercera corrida sobre otra rama.
- **Dónde:** `.github/workflows/pruebas.yml`, en `main` desde `7995874`. Cómo se usa: `AGENTS.md`. La regla de publicar: `specs/publicacion.md`. Lo aprendido y la respuesta al n.º 41: `iterations/v3/learning.md` n.º 57 a 61. El reporte, en `00_corridas/chess/2026-10-30_REPORTE_pruebas-en-github.md`.

## [2026-10-30] cambio | "Ver qué pasa": las alternativas de la explicación, en el tablero (V1)
- **Qué:**
  - Cuando la explicación del momento trae una frase de "¿y si…?", el pie lleva **"Ver qué pasa"** (secundario, a la izquierda) y el botón principal (a la derecha). Abre la misma ventana del "Ver paso a paso": el título es la frase, el primer paso es la posición de la que habla, un paso por jugada, las jugadas de los dos lados se juegan, y el último dice la consecuencia. Al cerrar, la lección sigue igual, sin contar como fallo ni como ayuda.
  - **El inventario:** 97 frases de `porque`, `prepara`, `cuidado` y `errores`; **43 con "Ver" y 54 sin él** (27 explican la jugada, 18 son un plan, 4 se juegan enseguida en la línea y 5 no tienen una consecuencia que se enseñe). **Ninguna consecuencia se cayó con el motor.**
  - **En Practicar:** sale solo con las frases que se muestran, y no sale si su línea contiene una jugada que la línea todavía me va a pedir (misma pieza, misma casilla), ni, con un error a la vista, si una jugada del rival cae en la casilla que falta. Lo decide el código línea por línea: 31 "Ver" salen en las dos vueltas, 10 solo en Aprender, y 2 en Practicar solo en la Bayoneta.
  - **Dos frases con "Ver" en un momento** van una tras otra en la misma ventana, con "Frase 1 de 2" arriba, y la ventana mide la más larga para que los botones no se muevan. Si la segunda sigue la línea de la primera, continúa desde ahí.
  - Dos cambios en el dibujo, para que dos flechas no se lean juntas: una L no llega por detrás de la flecha que sale de su casilla (`puntosDeFlechas`), y una marca puede fijar la esquina de su L (`por`). Se compararon todas las rutas de la lección y de los paso a paso antes y después: solo cambian las que se buscaba.
- **Por qué:** Carlos, probando la Caro-Kann en su iPhone: "Lo leo y no lo veo." Una frase de "¿y si…?" le pide imaginar varias jugadas. Es la misma razón del "Ver paso a paso" (§2.1): para el principiante, el tablero tiene que hacer lo que dice el texto.
- **Cómo se comprobó:** cada línea es legal con chess.js; cada consecuencia, con Stockfish (73 comprobaciones nuevas, ids `V-…`) y, lo que el motor no mide, con chess.js en la prueba. Un pase con un subagente nuevo revisó el inventario (20 hallazgos: la Francesa, que sí lleva "Ver"; "casi un peón", que no salía en mi línea; y dos textos y un "Ver" que delataban en Practicar). Dos pases visuales con subagentes nuevos revisaron las capturas (17 y 6 hallazgos). Lo que no se tocó, con su porqué, está en el reporte.
  - **La frase de Carlos cambió** (la torre, al revisar): en 4...h5 de la Tal, "Si juegas ...e6 ahora, siguen…" pasó a "Con ...e6 en vez de ...h5, siguen…", porque chocaba con "Ahora sí puedes seguir con ...e6", la frase de abajo. Lo demás de la frase, su `ver` y su regla en Practicar no cambiaron.
- **Quién:** Carlos (el prompt); la torre (la frase de 4...h5 y mandar la corrida final a GitHub, en lugar de WebKit en la Air); la corrida de la Air. Las decisiones de la corrida, en el reporte.
- **Dónde:** `feat/ver-que-pasa`: `de4e941`, `8290b97`, `e553bb5`, `885ef71`, `c502657` y `79e68f0`. La regla, en `specs/cursos.md` §2.3. El código: `src/curso/ver.ts` y `BotonVerQuePasa` en `src/componentes/PasoAPaso.tsx`. Los datos: `ver` y `verErrores` en `conocimiento/cursos/caro-kann.json`. Las pruebas: `tests/unit/ver-que-pasa.test.ts`, `tests/e2e/ver-que-pasa.spec.ts` y `tests/publicado/correcciones-caro-kann.spec.ts`. El inventario: `iterations/v3/ver-que-pasa-inventario.md` y `iterations/v3/ver-que-pasa-sin-ver.json`. El motor: `iterations/v3/comprobaciones-del-curso.md`. Las capturas: `iterations/v3/capturas/ver-que-pasa/`. Lo aprendido: `iterations/v3/learning.md` n.º 62 a 67 y 69 a 71.

## [2026-10-30] cambio | Las marcas de "Siguen…" al final de una línea (V2)
- **Qué:** las frases de plan de la última jugada de una línea llevan sus flechas verdes punteadas (A3): 6...e6 de la Tal (c6→c5 y b8→c6), 6...♘c6 del 4.c3 (d8→b6 y c5→d4), 10...e6 de la Clásica (g8→f6 y d8→c7) y, porque la encontró el programa, 7...♗xf7 de la Bayoneta (b8→d7 y g8→f6). Quedan sin marca "Siguen el enroque y la presión sobre d4" (Panov), que no nombra ni pieza ni casilla, y "Sigue una partida sin damas" (R1).
- **Por qué:** son planes para después de la línea: R7 ya no las detiene, y las reglas v1.3 piden su A3. Lo vio la corrida de las marcas v1.3 (decisión 18 de su reporte) y no lo hizo.
- **R4 creció:** `llega` daba por bueno b8→c6 con el peón todavía en c6, porque el caballo "apoya" esa casilla. Ahora las A3 de un "Siguen…" se juegan en su orden, la segunda con la primera hecha, y la prueba atrapa el orden al revés.
- **Quién:** Carlos (el prompt); la corrida de la Air (la búsqueda con un programa).
- **Dónde:** `b1c2b03` (la prueba, que falla sin las marcas) y `5dc6fcc` (las marcas). La regla, en `specs/cursos.md` §2.2 (R4 y lo que enseñaron los pases). `iterations/v3/marcas-por-jugada.md`, regenerado. Lo aprendido: `iterations/v3/learning.md` n.º 68.

## [2026-10-30] cambio | La acción principal va a la derecha (V3)
- **Qué:** en el pie de la narración, el botón principal ("Siguiente", "Empezar", "Reintentar", "Ahora, Practicar") va pegado a la derecha, solo o con uno secundario a su izquierda. No cambia su alto, ni lo que hace, ni la altura del pie. Solo, mide lo de siempre (140); junto a "Ver qué pasa" crece a la mitad del pie, como en el plan. Las salidas del resumen van a todo lo ancho, una debajo de otra: no hay ningún botón principal solo a la izquierda en la lección.
- **Por qué:** Carlos, en su iPhone: "Siguiente debería ir a la derecha, no a la izquierda." Es donde ya estaba en la ventana del paso a paso.
- **Quién:** Carlos (el prompt); la corrida de la Air.
- **Dónde:** `f38d14b` (la prueba, que falla sin el arreglo) y `c9c8a31` (`.narracion-pie`, `src/estilos.css`). La regla, en `specs/ux.md`. La prueba: `tests/e2e/ver-que-pasa.spec.ts`.

## [2026-10-30] corrida | Publicados "Ver qué pasa", las marcas de "Siguen…" y el botón principal a la derecha
- **Qué:**
  - La torre revisó el índice, el inventario y cinco capturas, y dijo **"publica"**, con un cambio de texto (la frase de 4...h5 de la Tal: "Con ...e6 en vez de ...h5, siguen…") y la corrida final en GitHub. Sus otras decisiones: los puntos 1, 3, 4 y 5 del aviso de la corrida y la baja del pie se quedan como están.
  - Con el cambio: `npm test` 256 de 256; Playwright en Chromium, los dos perfiles (el iPhone emulado): **249 pasan, 39 se saltan, ninguna falla**.
  - `origin/main` (`ea5b8e3`) se mezcló en la rama (`4c521f4`). Sus únicos conflictos fueron `log.md` y `learning.md`, que crecieron de los dos lados: se quedaron ambos, y lo aprendido de esta corrida pasó a ser del n.º 62 al 71.
  - **La corrida final, en GitHub:** [`41052532777`](https://github.com/carlosaguerof/chess/actions/runs/41052532777), sobre `feat/ver-que-pasa` `4c521f4`, 18 min (`e2e` 16.7 min): `npm test` 256 de 256; `npm run e2e`, los dos perfiles, con el iPhone en WebKit: **249 pasan, 39 se saltan, ninguna falla**.
  - Integrado a `main` en `8334c8c` (merge `--no-ff` encima de `origin/main`). `npm run publicar` → `gh-pages` `dc1f9e1` (06:22:45). A las 06:23:16 la página servía `index-DaWgOspI.js`, el del build.
  - Comprobación: `curl -sI` da 200 y el `.wasm` sale como `application/wasm`. `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages`, en Chromium (escritorio y el iPhone emulado, 390×844, táctil): **27 pasan, 1 se salta** (la del zoom en escritorio). Incluye el caso nuevo de la Tal.
- **Por qué en GitHub y no en la Air:** la regla nueva de `specs/publicacion.md`. WebKit no corrió en la Air, y la medición de `ioclasscount` que había pedido la torre ya no aplica.
- **Las capturas del iPhone del artefacto no se subieron al repo,** por indicación de la torre. Las de `iterations/v3/capturas/ver-que-pasa/iphone/` son de Chromium.
- **Quién:** la torre ("publica"); la corrida de la Air.
- **Dónde:** `main` `8334c8c`, `gh-pages` `dc1f9e1`. El reporte, en `00_corridas/chess/2026-10-30_REPORTE_ver-que-pasa.md`.

## [2026-10-30] cambio | El botón se llama "Ver qué pasaría"
- **Qué:**
  - El texto visible del botón pasó de "Ver qué pasa" a **"Ver qué pasaría"**, con "Siguiente" y con "Reintentar" (`src/componentes/PasoAPaso.tsx`). También cambiaron los comentarios y títulos de prueba en `src/` y `tests/`, y `specs/cursos.md` y `specs/ux.md`; §2.3 deja la razón con las palabras de Carlos, para los otros siete cursos.
  - Se quedan como estaban los identificadores internos (`ver-que-pasa`, `src/curso/ver.ts`, `BotonVerQuePasa`), `scripts/` y los nombres de archivo. No se reescribieron ni las entradas viejas de esta bitácora ni las capturas viejas.
  - Pruebas nuevas: el texto exacto en `tests/e2e/ver-que-pasa.spec.ts` y `tests/publicado/correcciones-caro-kann.spec.ts`; y que el nombre cabe, con "Siguiente" y con "Reintentar", a 390×844 y a 375×667. La de la página publicada guarda la captura del pie.
- **Por qué:** Carlos lo probó en su iPhone: "no se entiende a menos que leas el texto y luego te lo preguntes", y propuso "Ver qué pasaría" o "Qué pasaría". Lo que se ve no es lo que sigue en la partida, sino lo que pasaría con otra cosa: el presente suena a lo que sigue, y el condicional dice que es un supuesto. El botón mide la mitad del pie y no parte el renglón, así que un nombre más largo se podía salir sin que nada fallara: por eso la prueba.
- **Cómo se comprobó:**
  - Corrida final en GitHub, [`41100866910`](https://github.com/carlosaguerof/chess/actions/runs/41100866910), sobre `feat/ver-que-pasaria` `c6888f5`, 18 min de trabajo (26 con la espera de máquina): `npm test` 256 de 256; `npm run e2e`, con el iPhone en WebKit: **253 pasan, 39 se saltan, ninguna falla**.
  - **Cuánto cabe, en WebKit:** el nombre mide 122.2 px. A 390×844 tiene 151 por dentro (sobran 28.8) y a 375×667, 144 (sobran 21.8). No hizo falta ajustar nada. Con "Siguiente" y con "Reintentar" mide lo mismo.
  - A las 12:09:54 la página ya servía el build nuevo; `curl -sI` da 200, el `.wasm` sale como `application/wasm`, y el bundle publicado trae "Ver qué pasaría" y ya no el nombre viejo.
- **Quién:** Carlos (la queja y las dos propuestas); la torre (escogió "Ver qué pasaría"); la corrida de la Air.
- **Dónde:** `feat/ver-que-pasaria` `c6888f5`, merge a `main` `4eefe14`, `gh-pages` `576cf34`. El reporte, en `00_corridas/chess/2026-10-30_REPORTE_ver-que-pasaria.md`.

## [2026-10-30] cambio | La página publicada se comprueba en GitHub, con el iPhone en WebKit
- **Qué:**
  - Workflow nuevo, `.github/workflows/pagina-publicada.yml`: se lanza a mano y corre `SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages`, los dos perfiles, con las pruebas de `main`, en `macos-latest`. Sin secretos, solo lectura y sin commits. Sube `test-results-publicado/` aunque falle, 14 días. Su `timeout-minutes` es 50: 14 pruebas por 2 perfiles a 90 s cada una, más la instalación, para que el corte nunca le gane a las pruebas.
  - `playwright.publicado.config.ts` ahora guarda el `trace` de lo que falle: sin eso no había con qué diagnosticar.
  - `specs/publicacion.md` y `AGENTS.md` dicen dónde corre y cómo se lanza.
- **Por qué:** WebKit revisaba el código antes de publicar, pero no la página publicada: `npm run e2e:pages` corría en Chromium en la Air (`iterations/v3/learning.md` n.º 41 y 58). Ahora el perfil del iPhone corre en WebKit sin tocar la Air.
- **Cómo se comprobó:** su primera corrida, [`41104631717`](https://github.com/carlosaguerof/chess/actions/runs/41104631717), probó la parte A ya publicada, con las pruebas de `main` `d42a733`, en 2 min: **27 pasan, 1 se salta** (la del zoom en escritorio), **ninguna falla**. El registro confirma que el perfil `iphone` arrancó `webkit-2370` y `escritorio`, Chromium. La captura del pie en WebKit se revisó a ojo: el nombre se lee entero y los dos botones se ven bien. El registro público no trae nada privado.
- **No se republicó:** no cambia la app. No se lanzó `pruebas.yml` para esta rama: lo que cambia no lo toca esa suite, y lo prueba la primera corrida del workflow.
- **Quién:** la torre (el prompt, que responde a los n.º 41 y 58); la corrida de la Air (el `trace` y el `timeout-minutes`).
- **Dónde:** `chore/pagina-publicada` `338ed64`, merge a `main` `d42a733`. Lo aprendido, en `iterations/v3/learning.md` n.º 73 a 77.

## [2026-10-30] cambio | "Ver qué pasaría" va junto a su frase
- **Qué:**
  - Cada frase con "Ver" lleva su botón justo después de su punto final, en el mismo renglón, y la frase que sigue continúa después del botón. Con un error, igual, dentro del cuadro rojo. El pie queda solo con el principal; `dos-botones` sigue solo en el plan, con "Ver paso a paso".
  - Dos frases con "Ver" en un momento: dos botones, y cada uno abre su ventana, con su frase de título y desde su propia posición. Se acabaron "Frase 1 de 2" y el juntar frases: fuera `juntar`, `pasosYaVistos`, `PasoLeer.titulo` y `.titulos-paso`.
  - El aspecto es `.enlace-chico` con `.enlace-ver`: sin relleno de alto para que el renglón no crezca, `nowrap`, y una zona de toque de 44 en `::after`. Se separa con un espacio de medio eme: con un margen, al bajar de renglón quedaba sangrado. Lo que se ve de cada botón manda sobre la zona del otro, y el pie (`position: relative; z-index: 2`) sobre todo.
  - Ninguna frase cambió: `explicacionDespues` no se tocó y `tramosDe` corta su salida. Se quedan el nombre, el testid `ver-que-pasa`, las 43 frases, la ventana, sus pasos, las marcas y las reglas de Practicar. `verDespues` devuelve una lista.
- **Por qué:** Carlos, en su iPhone: "Está al mismo nivel que Siguiente. [...] Preferiría que esté dentro del cuadro de texto de la explicación, más pequeño y justo al final que se menciona eso que pudiera pasar". El pie es para seguir. El botón deja de competir con "Siguiente" y queda pegado a la frase de la que habla: quien lee lo encuentra justo ahí, y quien va rápido lo pasa de largo. La regla queda en `specs/ux.md` y en `specs/cursos.md` §2.3, para los otros siete cursos.
- **Cómo se comprobó:**
  - La foto de los textos y de las frases con "Ver", de `b2c1a9f` contra este cambio: 196 momentos y 90 frases, idénticas byte por byte. En Practicar, 23 después de jugar y 12 en errores, con su huella en la prueba.
  - En la Air, solo Chromium: `npm test` y Playwright en los dos perfiles, con el iPhone emulado. Cada protección del CSS se quitó una por una y su prueba falló.
  - **Medidas, en Chromium:** contraste de 8.65:1 sobre el panel y 7.5:1 en el cuadro rojo, así que el verde se queda. El botón mide 99.3 de ancho, no se parte y cabe a 375. El renglón no crece. Zona de toque: 44 libre; 39 o 40 justo arriba del pie; de 30 a 36 con dos botones uno sobre otro (solo en la ...♕c7 del Cambio).
- **Quién:** Carlos (la queja y el diseño); la torre (el prompt y su revisión); la corrida de la Air (la separación con medio eme y las capas de la zona de toque).
- **Dónde:** rama `feat/ver-en-la-frase`. Lo aprendido, en `iterations/v3/learning.md` n.º 78 a 84. El reporte, en `00_corridas/chess/2026-10-30_REPORTE_ver-en-la-frase.md`.
