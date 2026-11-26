# El orden de cursos y lecciones para "Seguir" (análisis, 2026-11-26)

> Paso 1 del escalón 1 de "Seguir" (`manifest.md`). Es un análisis: no cambia la app. Lo escribió el worker de la corrida `00_corridas/chess/2026-11-26_PROMPT_analisis-orden.md`, rama `docs/v5-orden-de-cursos`.

## La recomendación

**Un curso completo antes del siguiente** (tu hipótesis se queda), **en este orden**. La regla que lo arma: primero lo que más te sale en partidas por cada lección que estudias; y si un curso se apoya en otro, va justo después de él.

| # | Curso | Color | Lecciones obligatorias | Por qué ahí |
|---|---|---|---|---|
| 1 | Defensa Caro-Kann | negras | 8 | Te sale en 2 de cada 3 partidas con negras (68.6 % / 67.7 %): es, por mucho, lo que más usas. |
| 2 | Apertura Italiana | blancas | 6 | Te sale en 1 de cada 3 partidas con blancas (33.3 % / 38.8 %). Con la Caro-Kann, cubre cerca de la mitad de todas tus partidas. |
| 3 | Avance contra la Caro-Kann | blancas | 2 | Es la misma posición que acabas de estudiar en la Caro-Kann ("Blancas empuja a e5"), ahora del otro lado; son solo 2 lecciones, y de los cursos chicos es el que más te sale por lección. |
| 4 | Avance contra la Francesa | blancas | 3 | El mismo esquema que el curso 3 (c3, ♘f3, ♗e2 y 0-0) y las mismas dos primeras formas: lo aprendes mientras el 3 está fresco. |
| 5 | Alapin contra la Siciliana | blancas | 4 | Su página remite a "tu Avance contra la Francesa" cuando llegas a la misma cadena; por eso va después del 4. |
| 6 | Contra la Escandinava | blancas | 6 | Te sale en 1 de cada 10 partidas con blancas; no depende de otro curso. |
| 7 | Defensa Eslava | negras | 4 | Comparte con la Caro-Kann tus peones de c6 y d5 y la idea del alfil; casi no te sale (el rival juega 2.c4 en el 13.2 % / 24.7 % de las partidas con 1.d4 d5). Va antes del 8 porque el 8 la usa. |
| 8 | Otras aperturas de blancas | negras | 6 | Una de sus lecciones (1.c4 y 2.♘c3) "ya es la Eslava, y su mapa te dice qué hacer". |
| 9 | Otras defensas contra 1.e4 | blancas | 8 | Es el único curso que sigue con la lección de antes (sin La idea, La estructura ni Errores y trampas), y cada una de sus 8 lecciones es una apertura distinta que sale poco (de menos de 0.1 % a 3.4 % de tus partidas con blancas cada una, según `node consulta.mjs "e4"`). |

Los porcentajes, en dos bandas de partidas de lichess (600–1000 / 1000–1400); no son tus partidas. En total: 47 lecciones obligatorias y 32 páginas de leer (La idea, La estructura, Errores y trampas y Repaso del curso, en los 8 cursos nuevos).

**Lo que haría "Seguir" con lo que ya hiciste.** Tu avance vive en el iPhone y no lo puedo ver, así que el orden no depende de él. "Seguir" haría dos cosas, en este orden:
1. Si dejaste una lección a medias, te regresa a ella (lo mismo que ya hace el "Seguir" de cada curso).
2. Si no, te lleva al primer paso pendiente del primer curso del orden que no has terminado.

Lo ya hecho se salta y nada se pierde. Si avanzaste en un curso de más adelante, ese avance espera su turno: cuando "Seguir" llegue ahí, empieza en lo que te falte. Un curso que hiciste con la lección de antes cuenta sus lecciones como hechas, pero no sus páginas de leer, así que "Seguir" te mandaría primero a La idea de ese curso (así cuenta hoy la página del curso).

**Qué tan seguro estoy:** muy seguro de los dos primeros (los datos no dejan duda); medio, del 3 al 6; poco, del 7 al 9. Del 3 en adelante, cada curso cubre entre el 1 % y el 5 % de todas tus partidas, y el orden de 4 a 9 cambia un poco según la banda que se use (abajo). Equivocarse ahí cuesta poco.

**Una alternativa.** Alternar colores: Caro-Kann, Italiana, Eslava, Avance contra la Caro-Kann, Otras aperturas de blancas, Avance contra la Francesa, Alapin, Escandinava, Otras defensas contra 1.e4. **Pero:** la Escandinava, que te sale en 1 de cada 10 partidas con blancas, baja al lugar 8, y la Eslava, la que menos te sale con negras, sube al 3. No encontré ningún estudio que diga que alternar colores ayude a aprender.

### La pregunta para ti

**¿Con qué orden arma "Seguir" su camino?** (unos 10 minutos: lee la tabla de arriba)

- **(A) El de la tabla** — Caro-Kann, Italiana, los tres de la cadena (Avance contra la Caro-Kann, Avance contra la Francesa, Alapin), Escandinava, Eslava, Otras aperturas de blancas y Otras defensas contra 1.e4. *(Recomendada.)*
- **(B) Alternando colores** — Caro-Kann, Italiana, Eslava, Avance contra la Caro-Kann, Otras aperturas de blancas, Avance contra la Francesa, Alapin, Escandinava y Otras defensas contra 1.e4.

Si quieres mover un curso de lugar, dilo con su número; cualquier orden se puede cambiar después sin perder avance.

---

## 1. ¿Un curso completo antes del siguiente, o intercalados?

**Lo que sostiene la evidencia** (las fuentes, en §5):

- **Intercalar (mezclar ejemplos de varias categorías en vez de verlos en bloque) ayuda a distinguir cosas que se parecen.** Una revisión sistemática de 26 estudios encontró una ventaja de intercalar, mayor "cuando las diferencias entre los ejemplos son sutiles" (Firth, Rivers y Boyle, 2021, resumen). La regla práctica que proponen: juntar los ejemplos que el alumno confunde (p. 14).
- **Esa evidencia es de ejemplos cortos, no de temas completos.** La misma revisión dice que intercalar "tareas largas, o lecciones o temas completos" no está respaldado por la evidencia (p. 14) y que "parece poco probable que sea útil intercalar lecciones o temas completos" (p. 5). Sus estudios usan pinturas, imágenes y textos cortos, casi todos con universitarios en laboratorio (p. 11 y p. 22).
- **Con categorías muy distintas, el bloque puede ganar.** Cuando los ejemplos de una misma categoría son muy variados o las categorías son muy distintas entre sí, bloquear puede ser mejor (Carvalho y Goldstone, 2014, citados en Firth et al., p. 4 y p. 14; solo leí ese resumen, no el artículo).
- **Empezar en bloque y luego mezclar** casi no se ha estudiado: no está "fuertemente respaldado", pero es mejor que solo bloque (Firth et al., p. 15 y 16, sobre Yan et al., 2017).
- **Repasar con tiempo de por medio (repetición espaciada) mejora mucho lo que recuerdas meses después.** En un estudio con más de 1,350 personas, repasar con el hueco adecuado dio 64 % más de recuerdo que repasar enseguida; el mejor hueco fue cerca del 20 % del tiempo que quieres recordarlo cuando son semanas, y cerca del 5 % cuando es un año (Cepeda et al., 2008, resumen y p. 4). Y advierten que meter un tema en un periodo corto da un dominio inmediato "engañosamente alto" que no sobrevive al tiempo (p. 6). Ojo: el material fueron datos curiosos, no ajedrez.
- **La gente suele creer que el bloque le sirve más, aunque no sea así** (Kornell y Bjork, 2008, y Yan et al., 2017, citados en Firth et al., p. 2 y p. 22; no leí esos artículos).

**Lo que es inferencia mía, aplicada a tus cursos:**

- **Entre cursos casi no hay qué confundir.** En una partida, tu color y las primeras jugadas te dicen qué curso aplica: nunca dudas si estás en la Italiana o en la Caro-Kann. Lo que sí se confunde está **dentro** de un curso (qué forma es, qué plan toca) y entre cursos que comparten esquema (los dos Avances; la Caro-Kann y su Avance visto del otro lado). Ahí es donde mezclar serviría, y eso ya lo hacen el mapa de cada curso y, después, el Repaso.
- **Intercalar cursos sería intercalar temas completos,** justo lo que la revisión dice que no tiene respaldo. Además, cada curso arma su mapa en La idea y La estructura, y sus lecciones se apoyan en él.
- **El riesgo real del bloque es olvidar los cursos de antes.** Mientras estudias el curso 5, la Caro-Kann no se vuelve a ver salvo que entres al Repaso por tu cuenta. Eso lo resuelve el escalón 2 (el Repaso dentro del camino), no intercalar cursos.

**Qué decido con eso:** la evidencia no habla de cursos de aperturas ni compara bloque contra intercalado a nivel de curso. Gana tu hipótesis, que además es lo más simple: un curso completo, y la mezcla y el espaciado llegan con el Repaso del escalón 2.

## 2. El orden de los cursos

### Tu nivel en las bandas de lichess

Los datos son partidas Rapid de lichess (septiembre de 2026), con los dos jugadores en la banda 600–1000 o 1000–1400 (`conocimiento/frecuencias/README.md`). Tu 700 es de chess.com, y las dos escalas no son iguales. ChessGoals compara perfiles de jugadores activos: un 815 de Rapid en chess.com corresponde a cerca de 1290 de Rapid en lichess (±90, donde cae la mitad de los jugadores); su tabla no baja de ahí ([chessgoals.com/rating-comparison](https://chessgoals.com/rating-comparison/), leído el 2026-11-26). **Inferencia mía:** tu 700 andaría cerca de 1200 en lichess, así que la banda 1000–1400 se parece más a tus rivales. Por eso, donde las dos bandas no coinciden, uso la de 1000–1400; las dos van en la tabla.

### Qué tanto te sale cada curso

"De tus partidas con ese color": con blancas juegas siempre 1.e4; con negras, 1...c6 contra 1.e4 y 1...d5 contra 1.d4. "Por lección": la parte de **todas** tus partidas, suponiendo mitad con blancas y mitad con negras (no verificado), dividida entre sus lecciones obligatorias.

| Curso | Obligatorias | De tus partidas con ese color (600–1000 / 1000–1400) | Por lección, de todas tus partidas (600–1000 / 1000–1400) |
|---|---|---|---|
| Defensa Caro-Kann | 8 | 68.6 % / 67.7 % | 4.3 % / 4.2 % |
| Apertura Italiana | 6 | 33.3 % / 38.8 % | 2.8 % / 3.2 % |
| Avance contra la Caro-Kann | 2 | 3.8 % / 6.7 % | 0.95 % / 1.7 % |
| Avance contra la Francesa | 3 | 2.3 % / 3.9 % | 0.38 % / 0.65 % |
| Alapin contra la Siciliana | 4 | 4.1 % / 7.7 % | 0.51 % / 0.96 % |
| Contra la Escandinava | 6 | 10.2 % / 10.3 % | 0.85 % / 0.86 % |
| Defensa Eslava | 4 | 2.5 % / 5.5 % | 0.31 % / 0.69 % |
| Otras aperturas de blancas | 6 | 5.9 % / 6.0 % (las que abren sus lecciones: 1.c4, 1.♘f3, 1.b3, 1.g3, 1.f4); 12.3 % / 10.2 % todas | 0.49 % / 0.50 % (todas: 1.0 % / 0.85 %) |
| Otras defensas contra 1.e4 | 8 | 10.3 % / 9.3 % | 0.64 % / 0.58 % |

Ordenados por lección con la banda 1000–1400: Caro-Kann, Italiana, Avance contra la Caro-Kann, Alapin, Escandinava, Otras aperturas de blancas (contando todas), Eslava, Avance contra la Francesa, Otras defensas contra 1.e4. Con la regla de "si se apoya en otro, va justo después de él" (el Avance contra la Francesa antes de la Alapin; la Eslava antes de Otras aperturas de blancas), sale el orden de la recomendación. **Con la banda 600–1000 cambia del 4 al 9:** la Escandinava subiría al 4 y Otras defensas contra 1.e4 al 5. Las dos bandas coinciden en los tres primeros.

### Qué curso prepara a otro

Lo dicen los propios cursos (`conocimiento/cursos/*.json`, en sus páginas de leer):

- **Avance contra la Caro-Kann ↔ Avance contra la Francesa:** "sostienes la base de tu cadena, d4, con el mismo esquema que contra la Francesa: c3, ♘f3, ♗e2 y 0-0"; "Son las mismas dos formas que contra la Francesa" (`avance-caro-kann.json`); "Las dos primeras formas también salen contra la Caro-Kann" (`avance-francesa.json`).
- **Alapin → Avance contra la Francesa:** "llegas a la misma posición de tu Avance contra la Francesa… ahí sigue el plan de ese curso" (`alapin.json`).
- **Caro-Kann ↔ Eslava:** "se comparten tus peones de c6 y d5 y la idea del alfil, no las jugadas" (`eslava.json`).
- **Otras aperturas de blancas → Eslava:** "El de c, con su peón de d en d4: ya es la Eslava, y su mapa te dice qué hacer" (`otros-negras.json`).
- **Caro-Kann ↔ Avance contra la Caro-Kann:** es la misma posición (1.e4 c6 2.d4 d5 3.e5), una vez con negras y otra con blancas. Inferencia mía: el plan del rival que aprendes en un curso es tu plan en el otro.

### Blancas primero, negras primero o alternadas

Ninguna de las tres como regla. Lo que decide es qué tanto te sale: los dos cursos grandes son uno de cada color (Caro-Kann e Italiana), y después casi todo lo que más te sale es con blancas. Alternar a la fuerza sube cursos que casi no te salen (la Eslava) y baja otros que sí (la Escandinava). No encontré evidencia sobre alternar colores; esto es inferencia con los datos de arriba.

**Comparado con lo que se dijo antes:** el 2026-10-31 la torre propuso, con criterio propio y sin datos, "una respuesta por color primero (Caro-Kann e Italiana), luego Eslava y Alapin, y lo demás solo si sus partidas lo piden" (`00_corridas/chess/2026-10-29_PENDIENTES_torre-chess.md`). Los dos primeros coinciden. La Eslava baja porque los datos de lichess dicen que casi no te sale.

## 3. Dentro de cada curso

El orden ya existe y **sirve tal cual para "Seguir"**: es el mismo que usa el "Seguir" de la página de cada curso (`pasosDelCurso` y `siguientePaso`, `src/pantallas/CursoPagina.tsx:28-47`): La idea, La estructura, las lecciones obligatorias por sección (La base y Las que más te van a salir), Errores y trampas y Repaso del curso. Las opcionales no cuentan (`obligatorias`, `src/curso/datos.ts:80`), como pide el escalón 1. Cuatro cosas a cuidar al construir, ninguna obliga a rediseñar:

1. **Una lección aprendida pero sin practicar puede volver a empezar en Aprender.** Cada curso guarda una sola lección "a medias" (`enCurso`, `src/curso/avance.ts:17`); si saliste después de Aprender y abriste otra, al volver la lección empieza en Aprender (`src/pantallas/LeccionCurso.tsx:70-72`). Para "Seguir", lo natural es que una lección ya aprendida abra en Practicar.
2. **La Caro-Kann tiene dos cursos por dentro.** "Seguir" usa el que se ve (`caro-kann-estructuras:b`, `src/curso/queda.ts`); su avance ya junta lo del curso de antes (`leerAvance`).
3. **Otras defensas contra 1.e4 sigue con la lección de antes** (`src/pantallas/Leccion.tsx`): no tiene páginas de leer, guarda lo hecho en otro lugar (`progreso`) y su siguiente lección la decide su propia pantalla. "Seguir" tiene que leer los dos formatos.
4. **Las páginas de leer cuentan como pasos.** Un curso hecho con la lección de antes manda primero a La idea (arriba, "Lo que haría Seguir").

## 4. Lo que esto implica para el escalón 2 (sin diseñarlo)

- **El Repaso es donde entran la mezcla y el espaciado.** Con cursos en bloque, el Repaso es lo que trae de vuelta los cursos de antes. El de hoy ya mezcla lecciones de todos tus cursos terminados, ordenadas por fecha (`paraHoy`, `src/repaso/repaso.ts:82-89`), con escalones de 1, 3, 7, 14 y 30 días (`ESCALONES`, línea 16).
- **La decisión de fondo del escalón 2:** cuándo "Seguir" repasa y cuándo avanza. Tu frase de antes apunta a repasar primero: "si no soy constante, se quedará probablemente en las primeras lecciones hasta que me las aprenda bien… para no estar aprendiendo más cuando todavía no termino de aprender".
- **Los plazos:** según Cepeda et al. (2008), el mejor hueco crece con el tiempo que quieres recordar; para aperturas que quieres recordar por años, un tope de 30 días podría quedarse corto. Inferencia mía, para medir en el escalón 2.
- **Juntar lo que se confunde:** en el Repaso, los cursos que comparten esquema (los dos Avances, la Caro-Kann y su Avance) son los candidatos a ir juntos (la regla práctica de Firth et al., p. 14).

## 5. Las fuentes

| Fuente | Qué leí | Qué tomé |
|---|---|---|
| Firth, J., Rivers, I. y Boyle, J. (2021). A systematic review of interleaving as a concept learning strategy. *Review of Education*, 9(2). [PDF abierto](https://strathprints.strath.ac.uk/75711/7/Firth_etal_RE_2021_A_systematic_review_of_interleaving.pdf) | El artículo completo. | La ventaja de intercalar es mayor con diferencias sutiles; no hay evidencia para intercalar temas completos; pasar de bloque a intercalado casi no se ha estudiado; casi todo es de laboratorio, con universitarios y pruebas de días. |
| Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T. y Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science*, 19(11), 1095–1102. [PDF abierto (versión en prensa)](https://escholarship.org/content/qt0kp5q19x/qt0kp5q19x.pdf) | El artículo completo (versión en prensa). | Repasar con tiempo de por medio mejora mucho el recuerdo; el mejor hueco depende de cuánto quieres recordar; meter un tema en poco tiempo da un dominio engañoso. |
| Brunmair, M. y Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin*, 145(11). | **Solo lo que de él dice Firth et al. (p. 7, 24 y 26).** El PDF no se pudo leer aquí y PubMed no abrió. | Ventaja media de intercalar (g = 0.42); en listas de palabras, al revés (g = −0.39); en matemáticas, 0.34. |
| Carvalho, P. F. y Goldstone, R. L. (2014). Putting category learning in order. *Memory & Cognition*, 42, 481–495. | **Solo lo que de él dice Firth et al. (p. 4, 14 y 15).** El PDF pedía iniciar sesión. | Intercalar ayuda con categorías parecidas; con categorías distintas, el bloque puede ganar. |
| Kornell, N. y Bjork, R. A. (2008); Yan, V. X. et al. (2017). | **Solo lo que de ellos dice Firth et al. (p. 2, 15, 16 y 22).** | La gente cree que el bloque le sirve más aunque no sea así; pasar de bloque a intercalado no fue mejor que intercalar, pero sí mejor que solo bloque. |
| ChessGoals, *Rating Comparison* (actualizado en julio de 2026). [chessgoals.com/rating-comparison](https://chessgoals.com/rating-comparison/) | La página (no es un estudio: compara perfiles de jugadores activos, 1,066 en Rapid de lichess). | 815 de Rapid en chess.com ≈ 1290 de Rapid en lichess (±90). |

Las búsquedas en internet fueron del tema en general (intercalar contra bloque, repetición espaciada, comparación de ratings), sin nada tuyo.

## 6. Los datos y sus comandos

Las cifras de partidas salen de `consulta.mjs` (solo lee el conteo de lichess de `00_corridas/_local/chess/frecuencias-siete/`, el mismo de `conocimiento/frecuencias/`):

```
cd ~/01_repos/00_corridas/_local/chess/frecuencias-siete
node consulta.mjs ""                 # 1.e4: 68.6 % / 67.7 %; 1.d4: 19.1 % / 22.1 %
node consulta.mjs "e4"               # 1...e5 65.1 % / 58.2 %; 1...d5 10.2 % / 10.3 %; 1...c5 4.1 % / 7.7 %; 1...c6 4.1 % / 7.2 %; 1...e6 4.7 % / 6.5 %
node consulta.mjs "e4 e5 Nf3"        # 2...♘c6 51.1 % / 66.7 %
node consulta.mjs "e4 c6 d4"         # 2...d5 91.2 % / 93.7 %
node consulta.mjs "e4 e6 d4"         # 2...d5 49.4 % / 59.2 %
node consulta.mjs "d4 d5"            # 2.c4 13.2 % / 24.7 %
cd ../analisis-orden && node cuota.mjs   # la columna "de tus partidas con ese color" de la tabla, con sus n
```

`cuota.mjs` multiplica las partes de cada paso (por ejemplo, la Italiana: 1...e5 × 2...♘c6 tras 2.♘f3) y suma las primeras jugadas de los cursos de "Otras". Las lecciones obligatorias, con el código de la app sobre `origin/main` `4d4a9c3`:

```
node ~/01_repos/00_corridas/_local/chess/analisis-orden/cursos.ts <copia de chess>
```

Las dos carpetas (`frecuencias-siete/` y `analisis-orden/`) viven en las máquinas de Carlos y no se suben.

## No verificado

- **Que tus partidas se parezcan a las de lichess.** Son partidas de otros jugadores, en lichess, en septiembre de 2026; las tuyas viven en chess.com y no las medí.
- **Tu equivalencia en lichess.** ChessGoals no llega a 700 de Rapid en chess.com; "cerca de 1200" es mi extrapolación.
- **Que juegues mitad con blancas y mitad con negras.** La columna "por lección" lo supone.
- **Que el mapa de Otras aperturas de blancas sirva contra las aperturas que no abren sus lecciones** (1.e3, 1.♘c3, 1.d3): por eso doy las dos cifras.
- **Lo que llevas hecho en el iPhone:** no lo vi; "Seguir" funciona con cualquier avance.
- **Ningún estudio es de ajedrez.** Lo de intercalar y espaciar viene de pinturas, imágenes, textos cortos y datos curiosos; aplicarlo a cursos de aperturas es inferencia.
- **Brunmair y Richter, Carvalho y Goldstone, Kornell y Bjork y Yan et al.:** solo leí lo que de ellos dice Firth et al.

**Fuera de esta pregunta, para que lo sepas:** con negras, contra 1.d4 d5 sin 2.c4 (2.♗f4, 2.♘c3, 2.e3, 2.♘f3…), que sale en cerca del 16.5 % de tus partidas con negras, no hay curso: la Eslava empieza en 2.c4 (`iterations/v4/mapa-eslava.md`, línea 92). No es del escalón 1.
