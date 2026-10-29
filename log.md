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
