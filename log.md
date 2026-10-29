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
