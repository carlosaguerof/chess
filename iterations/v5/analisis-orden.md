# El orden de cursos y lecciones para "Seguir" (análisis, 2026-11-26)

> Paso 1 del escalón 1 de "Seguir" (`manifest.md`). Es un análisis: no cambia la app. Lo escribió el worker de la corrida `00_corridas/chess/2026-11-26_PROMPT_analisis-orden.md`, rama `docs/v5-orden-de-cursos`, y pasó por un pase adversarial con un subagente nuevo (lo que encontró y cómo quedó, en el reporte de la corrida).

## La recomendación

**Un curso completo antes del siguiente** (tu hipótesis se queda), **en este orden**. Los nombres son los de las tarjetas de Aprender.

| # | Curso | Color | Lecciones obligatorias | Por qué ahí |
|---|---|---|---|---|
| 1 | Defensa Caro-Kann | negras | 8 | Te sale en 2 de cada 3 partidas con negras (68.6 % / 67.7 %): es, por mucho, lo que más usas. |
| 2 | Apertura Italiana | blancas | 6 | Te sale en 1 de cada 3 partidas con blancas (33.3 % / 38.8 %). Con la Caro-Kann, cubre cerca de la mitad de todas tus partidas. |
| 3 | Contra la Caro-Kann (el Avance) | blancas | 2 | Es la posición del Avance que estudiaste en el curso 1 ("Blancas empuja a e5"), ahora del otro lado, y son solo 2 lecciones. Abre la familia de "la cadena". |
| 4 | Contra la Francesa (el Avance) | blancas | 3 | El mismo esquema que el 3 (c3, ♘f3, ♗e2 y 0-0) y las mismas dos primeras formas: se aprende mientras el 3 está fresco. |
| 5 | Contra la Siciliana (la Alapin) | blancas | 4 | Cierra la familia: sus páginas de La estructura remiten a "tu Avance contra la Francesa" cuando llegas a esa misma cadena. |
| 6 | Contra la Escandinava | blancas | 6 | Te sale en 1 de cada 10 partidas con blancas; no depende de otro curso. |
| 7 | Defensa Eslava | negras | 4 | Abre la familia de "...c6 y ...d5": comparte con la Caro-Kann tus peones de c6 y d5 y la idea del alfil. Va antes del 8 porque el mapa del 8 la usa. |
| 8 | Otras aperturas de blancas | negras | 6 | Contra 1.c4 y 2.d4, su mapa dice "ya es la Eslava, y su mapa te dice qué hacer". |
| 9 | Otras defensas contra 1.e4 | blancas | 8 | Es el único curso que sigue con la lección de antes (sin La idea, La estructura ni Errores y trampas): 8 lecciones de 7 aperturas sin relación entre sí (dos son la Nimzowitsch). |

Los porcentajes, en dos bandas de partidas de lichess (600–1000 / 1000–1400); no son tus partidas. En total: 47 lecciones obligatorias, más 32 pasos que no son lecciones (La idea, La estructura, Errores y trampas y el Repaso del curso, en cada uno de los 8 cursos nuevos).

**Qué tan seguro estoy:** muy seguro de los dos primeros: juntos son cerca de la mitad de todas tus partidas, en las dos bandas. **Del 3 al 9, los datos no los separan:** cada curso cubre entre el 1 % y el 6 % de todas tus partidas, y su orden cambia según la banda y según si se cuentan solo las lecciones o también las páginas de leer (§2). Ahí el orden lo deciden las familias de cursos que se parecen; equivocarse cuesta poco.

**Lo que haría "Seguir" con lo que ya hiciste.** Tu avance vive en el iPhone y no lo puedo ver, así que el orden no depende de él. "Seguir" te lleva al **primer curso del orden que no has terminado**, y dentro de él:
1. si dejaste una lección a medias en ese curso, te regresa a ella;
2. si no, al primer paso pendiente (lo mismo que hace hoy el "Seguir" de la página del curso).

Lo ya hecho se salta y nada se pierde. Si avanzaste en un curso de más adelante, incluso con una lección a medias, ese avance espera su turno: cuando "Seguir" llegue ahí, empieza en lo que te falte. Un curso que hiciste con la lección de antes cuenta sus lecciones como hechas, pero no sus páginas de leer, así que "Seguir" te mandaría primero a La idea de ese curso (así cuenta hoy la página del curso).

*Lo que faltaba (revisión del análisis, 2026-11-26), ya resuelto en la regla (`specs/aprender.md`, "Seguir"):* con los nueve cursos terminados, "Seguir" lleva al Repaso de hoy; y en Otras defensas contra 1.e4, la siguiente lección depende de las que fallaste en la sesión (`src/pantallas/Leccion.tsx`), con la misma regla.

**Mientras no llegue el escalón 2,** el Repaso de hoy (el espaciado, el del inicio) sigue donde está, fuera de "Seguir". Si "Seguir" te jala a avanzar y dejas de repasar, los cursos de antes se olvidan: es justo lo que advierte la investigación sobre repasar (§1). Conviene que el escalón 2 no quede lejos.

**Una alternativa.** Alternar colores: Defensa Caro-Kann, Apertura Italiana, Defensa Eslava, Contra la Caro-Kann, Otras aperturas de blancas, Contra la Francesa, Contra la Siciliana, Contra la Escandinava, Otras defensas contra 1.e4. **Pero:** no deja las familias juntas (separa los dos Avances, que comparten esquema, con un curso de negras en medio, y separa la Defensa Eslava de Otras aperturas de blancas; corregido con la revisión del análisis, 2026-11-26); después del 5 ya no quedan cursos de negras, así que lo demás es con blancas de todos modos; y no encontré ningún estudio que diga que alternar colores ayude a aprender.

### La pregunta para ti

**¿Con qué orden arma "Seguir" su camino?** (unos 10 minutos: lee la tabla de arriba)

- **(A) El de la tabla:** Defensa Caro-Kann, Apertura Italiana, la familia de la cadena (Contra la Caro-Kann, Contra la Francesa, Contra la Siciliana), Contra la Escandinava, la familia de ...c6 y ...d5 (Defensa Eslava, Otras aperturas de blancas) y Otras defensas contra 1.e4. *(Recomendada.)*
- **(B) Alternando colores:** Defensa Caro-Kann, Apertura Italiana, Defensa Eslava, Contra la Caro-Kann, Otras aperturas de blancas, Contra la Francesa, Contra la Siciliana, Contra la Escandinava y Otras defensas contra 1.e4.

Si quieres mover un curso de lugar, dilo con su número; el orden se puede cambiar después sin perder avance.

---

## 1. ¿Un curso completo antes del siguiente, o intercalados?

**Lo que sostiene la evidencia** (las fuentes, en §5):

- **Intercalar (mezclar ejemplos de varias categorías en vez de verlos en bloque) ayuda a distinguir cosas que se parecen.** Una revisión sistemática de 26 estudios encontró una ventaja de intercalar, mayor "cuando las diferencias entre los ejemplos son sutiles" (Firth, Rivers y Boyle, 2021, resumen). Su regla práctica: juntar los ejemplos que el alumno confunde (p. 14).
- **Esa evidencia es de ejemplos cortos, no de temas completos.** La misma revisión dice que intercalar "tareas largas, o lecciones o temas completos" no está respaldado por la evidencia (p. 14) y que "parece poco probable que sea útil intercalar lecciones o temas completos" (p. 5). Sus estudios usan pinturas, imágenes y textos cortos, casi todos con universitarios, en laboratorio y con pruebas de minutos a 10 días (p. 11, 15 y 22).
- **Con categorías poco parecidas, intercalar no gana, y a veces conviene más el bloque.** En Carvalho y Goldstone (2014), el bloque fue mejor mientras se aprendía, pero en la prueba final intercalar fue mejor con categorías parecidas y dio igual con las poco parecidas; otro estudio no encontró ninguna ventaja del bloque (Firth et al., p. 14 y 15; solo leí ese resumen, no los artículos). *Matiz que faltaba (revisión del análisis, 2026-11-26):* la misma revisión dice que con categorías más distintas el bloque puede ser preferible (p. 4), que las de mucha variación interna "are often best blocked" (p. 14) y que el efecto "can even be reversed" (p. 24). Eso refuerza la recomendación de un curso completo antes del siguiente.
- **Empezar en bloque y luego mezclar** casi no se ha estudiado: no está "fuertemente respaldado", pero es mejor que solo bloque (Firth et al., p. 15 y 16, sobre Yan et al., 2017).
- **Repasar con tiempo de por medio (repetición espaciada) mejora mucho lo que recuerdas meses después.** En un estudio con más de 1,350 personas, repasar con el hueco adecuado dio 64 % más de recuerdo que repasar enseguida; el mejor hueco fue cerca del 20 % del tiempo que quieres recordarlo cuando son semanas, y cerca del 5 % cuando es un año (Cepeda et al., 2008, resumen y p. 4 de la versión en prensa). Advierten que estudiar un solo tema metido en una semana da un dominio inmediato "engañosamente alto" que no sobrevive al tiempo (p. 6). El material fueron datos curiosos, no ajedrez.
- **La gente suele creer que el bloque le sirve más, aunque no sea así** (Kornell y Bjork, 2008, y Yan et al., 2017, citados en Firth et al., p. 2 y p. 22; no leí esos artículos).

**Lo que es inferencia mía, aplicada a tus cursos:**

- **Entre cursos hay poco qué confundir.** En una partida, tu color y las primeras jugadas te dicen qué curso aplica: nunca dudas si estás en la Italiana o en la Caro-Kann. Las excepciones son las transposiciones (2...e6 en la Alapin lleva a la cadena de la Francesa; 1.c4 c6 2.d4 lleva a la Eslava), y los propios cursos ya las señalan en sus páginas. Lo que sí se confunde está **dentro** de un curso (qué forma es, qué plan toca) y entre cursos que comparten esquema (los dos Avances; la Caro-Kann y su Avance visto del otro lado). Por eso el orden pone juntos a los que se parecen.
- **Intercalar cursos sería intercalar temas completos,** justo lo que la revisión dice que no tiene respaldo. Además, cada curso arma su mapa en La idea y La estructura, y sus lecciones se apoyan en él.
- **El riesgo real del bloque es olvidar los cursos de antes.** Mientras estudias el curso 5, la Caro-Kann no se vuelve a ver salvo que entres al Repaso de hoy por tu cuenta. Eso lo resuelve el escalón 2 (el Repaso dentro del camino), no intercalar cursos.

**Qué decido con eso:** la evidencia no habla de cursos de aperturas ni compara bloque contra intercalado a nivel de curso. Gana tu hipótesis, que además es lo más simple: un curso completo; la mezcla y el espaciado llegan con el Repaso del escalón 2.

## 2. El orden de los cursos

### Tu nivel en las bandas de lichess

Los datos son partidas Rapid de lichess (septiembre de 2026), con los dos jugadores en la banda 600–1000 o 1000–1400 (`conocimiento/frecuencias/README.md`). Tu 700 es de chess.com, y las dos escalas no son iguales. ChessGoals compara perfiles de jugadores activos en dos tablas, las dos con el Blitz de chess.com como llave: en la fila de 500 de Blitz, una dice 815 de Rapid en chess.com y la otra 1290 de Rapid en lichess (±90, donde cae la mitad de los jugadores); ninguna baja de ahí ([chessgoals.com/rating-comparison](https://chessgoals.com/rating-comparison/), leída el 2026-11-26 con una herramienta que resume la página, no el texto crudo). **Inferencia mía, débil:** juntar las dos tablas y bajar de 815 a 700 pondría tu Rapid cerca de 1200 en lichess, más cerca de la banda 1000–1400. Por eso doy las dos bandas y no hago depender nada importante de una.

### Qué tanto te sale cada curso

"De tus partidas con ese color": con blancas juegas siempre 1.e4; con negras, 1...c6 contra 1.e4 y 1...d5 contra 1.d4. "Por lección": la parte de **todas** tus partidas, suponiendo mitad con blancas y mitad con negras (no verificado), dividida entre sus lecciones obligatorias. Otras aperturas de blancas se cuenta con todas las primeras jugadas que no son 1.e4 ni 1.d4, como lo define el repo (`conocimiento/frecuencias/otros-negras.json`, `partidas`).

| Curso | Obligatorias | De tus partidas con ese color (600–1000 / 1000–1400) | Por lección, de todas tus partidas (600–1000 / 1000–1400) |
|---|---|---|---|
| Defensa Caro-Kann | 8 | 68.6 % / 67.7 % | 4.3 % / 4.2 % |
| Apertura Italiana | 6 | 33.3 % / 38.8 % | 2.8 % / 3.2 % |
| Contra la Caro-Kann | 2 | 3.8 % / 6.7 % | 0.95 % / 1.7 % |
| Contra la Francesa | 3 | 2.3 % / 3.9 % | 0.38 % / 0.65 % |
| Contra la Siciliana | 4 | 4.1 % / 7.7 % | 0.51 % / 0.96 % |
| Contra la Escandinava | 6 | 10.2 % / 10.3 % | 0.85 % / 0.86 % |
| Defensa Eslava | 4 | 2.5 % / 5.5 % | 0.31 % / 0.69 % |
| Otras aperturas de blancas | 6 | 12.3 % / 10.2 % (las que abren sus lecciones, 1.c4, 1.♘f3, 1.b3, 1.g3 y 1.f4: 5.9 % / 6.0 %) | 1.0 % / 0.85 % |
| Otras defensas contra 1.e4 | 8 | 10.3 % / 9.3 % | 0.64 % / 0.58 % |

**Del 3 en adelante no hay un orden claro.** Por lección, con 1000–1400: Contra la Caro-Kann (1.7), Contra la Siciliana (0.96), Contra la Escandinava (0.86), Otras aperturas de blancas (0.85), Defensa Eslava (0.69), Contra la Francesa (0.65), Otras defensas contra 1.e4 (0.58). Con 600–1000 cambia casi todo: Otras aperturas de blancas (1.0) sube al 3 y Contra la Siciliana baja al 7. Y si se cuentan también los pasos de leer, Otras defensas contra 1.e4, que no tiene páginas de leer, sube al 3 en las dos bandas (0.64 / 0.58 por paso). Fuera de los dos primeros, todos quedan entre 0.3 % y 1.7 % por lección.

**Por eso el orden de 3 a 9 va por familias,** los cursos que se parecen juntos (abajo), y las familias, por lo que te sale por lección con 1000–1400: la cadena (3 cursos, 9 lecciones, 1.0 %), la Escandinava (0.86 %), ...c6 y ...d5 (2 cursos, 10 lecciones, 0.79 %) y Otras defensas contra 1.e4 (0.58 %). Con 600–1000 la cadena quedaría al final (0.57 %, contra 0.85 %, 0.74 % y 0.64 %). Dentro de cada familia, primero el curso del que hablan los otros. Otras defensas contra 1.e4 va al final por ser el único con la lección de antes: así "Seguir" no cambia de formato a la mitad del camino. Cualquiera de estas decisiones se puede mover sin costo.

### Qué curso prepara a otro

Lo dicen los propios cursos (`conocimiento/cursos/*.json`, en sus páginas de leer):

- **Contra la Caro-Kann ↔ Contra la Francesa:** "sostienes la base de tu cadena, d4, con el mismo esquema que contra la Francesa: c3, ♘f3, ♗e2 y 0-0"; "Son las mismas dos formas que contra la Francesa" (`avance-caro-kann.json`); "Las dos primeras formas también salen contra la Caro-Kann" (`avance-francesa.json`).
- **Contra la Siciliana → Contra la Francesa:** "llegas a la misma posición de tu Avance contra la Francesa… ahí sigue el plan de ese curso" (`alapin.json`, en dos páginas de La estructura; ninguna lección obligatoria de la Alapin juega esa transposición).
- **Defensa Caro-Kann ↔ Defensa Eslava:** "se comparten tus peones de c6 y d5 y la idea del alfil, no las jugadas" (`eslava.json`).
- **Otras aperturas de blancas → Defensa Eslava:** "El de c, con su peón de d en d4: ya es la Eslava, y su mapa te dice qué hacer" (`otros-negras.json`).
- **Defensa Caro-Kann ↔ Contra la Caro-Kann:** es la misma posición (1.e4 c6 2.d4 d5 3.e5), una vez con negras y otra con blancas. Inferencia mía: el plan del rival que aprendes en un curso es tu plan en el otro.

### Blancas primero, negras primero o alternadas

Ninguna de las tres como regla. Los dos cursos grandes son uno de cada color (Caro-Kann e Italiana); de ahí en adelante, 5 de los 7 cursos que quedan son con blancas, y los datos no separan unos de otros. No encontré evidencia sobre alternar colores; lo que la evidencia sí apoya es juntar lo que se confunde, y eso pide familias, no colores.

**Comparado con lo que se dijo antes:** el 2026-10-31 la torre propuso, con criterio propio y sin datos, "una respuesta por color primero (Caro-Kann e Italiana), luego Eslava y Alapin, y lo demás solo si sus partidas lo piden" (`00_corridas/chess/2026-10-29_PENDIENTES_torre-chess.md`, línea 159). Los dos primeros coinciden.

## 3. Dentro de cada curso

El orden ya existe y **sirve tal cual para "Seguir"**: es el mismo que usa el "Seguir" de la página de cada curso (`pasosDelCurso` y `siguientePaso`, `src/pantallas/CursoPagina.tsx:28-47`): La idea, La estructura, las lecciones obligatorias por sección (La base y Las que más te van a salir), Errores y trampas y el Repaso del curso (la página de cierre de cada curso, no el Repaso de hoy). Las opcionales no cuentan (`obligatorias`, `src/curso/datos.ts:80`), como pide el escalón 1. Cinco cosas a cuidar al construir, ninguna obliga a rediseñar:

1. **Una lección aprendida pero sin practicar puede volver a empezar en Aprender.** Cada curso guarda una sola lección "a medias" (`enCurso`, `src/curso/avance.ts:17`); si saliste después de Aprender y abriste otra lección del mismo curso, al volver la primera empieza en Aprender (`src/pantallas/LeccionCurso.tsx:70-72`). Para "Seguir", lo natural es que una lección ya aprendida abra en Practicar.
2. **Puede haber lecciones a medias en varios cursos a la vez** (una por curso, `src/curso/avance.ts:96`), y solo se borran al terminar esa lección (`src/pantallas/LeccionCurso.tsx:121`). Por eso "Seguir" solo mira la del curso en turno; si mirara todas, una lección vieja de un curso de más adelante lo jalaría fuera del orden.
3. **La Caro-Kann tiene dos cursos por dentro.** "Seguir" usa el que se ve (`caro-kann-estructuras:b`, `src/curso/queda.ts`); su avance ya junta lo del curso de antes (`leerAvance`).
4. **Otras defensas contra 1.e4 sigue con la lección de antes** (`src/pantallas/Leccion.tsx`): no tiene páginas de leer, guarda lo hecho en otro lugar (`progreso`) y su siguiente lección la decide su propia pantalla. "Seguir" tiene que leer los dos formatos.
5. **Las páginas de leer cuentan como pasos.** Un curso hecho con la lección de antes manda primero a La idea (arriba, "Lo que haría Seguir").

## 4. Lo que esto implica para el escalón 2 (sin diseñarlo)

- **El Repaso es donde entran la mezcla y el espaciado.** Con cursos en bloque, el Repaso es lo que trae de vuelta los cursos de antes. El Repaso de hoy ya mezcla las lecciones que terminaste, de cualquier curso, ordenadas por fecha (`paraHoy`, `src/repaso/repaso.ts:78-89`), con escalones de 1, 3, 7, 14 y 30 días (`ESCALONES`, línea 16).
- **La decisión de fondo del escalón 2:** cuándo "Seguir" repasa y cuándo avanza. Tus palabras del 2026-11-25 (`00_corridas/chess/2026-10-29_PENDIENTES_torre-chess.md`, línea 155): "Si soy constante, pues avanzaré rápido… Pero si no soy constante, se quedará probablemente en las primeras lecciones hasta que me las aprenda bien… para no estar aprendiendo más cuando todavía no termino de aprender."
- **Los plazos:** según Cepeda et al. (2008), el mejor hueco crece con el tiempo que quieres recordar; para aperturas que quieres recordar por años, un tope de 30 días podría quedarse corto. Inferencia mía, para medir en el escalón 2.
- **Juntar lo que se confunde, también al repasar:** los cursos que comparten esquema (los dos Avances, la Caro-Kann y su Avance) son los candidatos a salir juntos en el Repaso. Inferencia mía: la regla de Firth et al. (p. 14) es para aprender conceptos nuevos, y su revisión deja fuera la práctica mezclada después de aprender (p. 11 y 26).

## 5. Las fuentes

| Fuente | Qué leí | Qué tomé |
|---|---|---|
| Firth, J., Rivers, I. y Boyle, J. (2021). A systematic review of interleaving as a concept learning strategy. *Review of Education*. DOI 10.1002/rev3.3266. [PDF abierto (versión aceptada)](https://strathprints.strath.ac.uk/75711/7/Firth_etal_RE_2021_A_systematic_review_of_interleaving.pdf) | El artículo completo. | La ventaja de intercalar es mayor con diferencias sutiles; no hay evidencia para intercalar temas completos; pasar de bloque a intercalado casi no se ha estudiado; casi todo es de laboratorio, con universitarios y pruebas de días. |
| Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T. y Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science*, 19(11), 1095–1102. [PDF abierto (versión en prensa)](https://escholarship.org/content/qt0kp5q19x/qt0kp5q19x.pdf) | El artículo completo (versión en prensa; sus páginas, no las de la revista). | Repasar con tiempo de por medio mejora mucho el recuerdo; el mejor hueco depende de cuánto quieres recordar; meter un tema en poco tiempo da un dominio engañoso. |
| Brunmair, M. y Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. *Psychological Bulletin*, 145(11). | **Solo lo que de él dice Firth et al. (p. 7, 24 y 26).** El PDF no se pudo leer aquí y PubMed no abrió. | Ventaja media de intercalar (g = 0.42); en listas de palabras, al revés (g = −0.39); en matemáticas, 0.34. |
| Carvalho, P. F. y Goldstone, R. L. (2014). Putting category learning in order. *Memory & Cognition*, 42, 481–495. | **Solo lo que de él dice Firth et al. (p. 4, 14 y 15).** El PDF pedía iniciar sesión. | El bloque ganó mientras se aprendía; en la prueba, intercalar ganó con categorías parecidas y dio igual con las poco parecidas. |
| Kornell, N. y Bjork, R. A. (2008); Yan, V. X. et al. (2017). | **Solo lo que de ellos dice Firth et al. (p. 2, 15, 16 y 22).** | La gente cree que el bloque le sirve más aunque no sea así; pasar de bloque a intercalado no fue mejor que intercalar, pero sí mejor que solo bloque. |
| ChessGoals, *Rating Comparison* (actualizada en julio de 2026). [chessgoals.com/rating-comparison](https://chessgoals.com/rating-comparison/) | La página, a través de una herramienta que la resume. No es un estudio: compara perfiles de jugadores activos (1,066 con Rapid de lichess). | Con 500 de Blitz en chess.com: 815 de Rapid en chess.com (una tabla) y 1290 de Rapid en lichess (otra tabla, ±90). |

Las búsquedas en internet fueron del tema en general (intercalar contra bloque, repetición espaciada, comparación de ratings), sin nada tuyo.

## 6. Los datos y sus comandos

Las cifras de partidas salen de `consulta.mjs` (solo lee el conteo de lichess de `00_corridas/_local/chess/frecuencias-siete/`, el mismo de `conocimiento/frecuencias/`, con el mismo `sha256`):

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

`cuota.mjs` multiplica las partes de cada paso (por ejemplo, la Italiana: 1...e5 × 2...♘c6 tras 2.♘f3) y suma las primeras jugadas de los dos cursos de "Otras" (en Otras defensas contra 1.e4, las siete que abren sus lecciones: ...d6, ...g6, ...♘f6, ...♘c6, ...b6, ...a6 y ...h6). Las columnas "por lección" se calculan a mano con esa salida: la cifra del color, entre 2, entre las obligatorias. Las lecciones obligatorias, con el código de la app sobre `origin/main` `4d4a9c3`:

```
node ~/01_repos/00_corridas/_local/chess/analisis-orden/cursos.ts <copia de chess>
```

Las dos carpetas (`frecuencias-siete/` y `analisis-orden/`) viven en las máquinas de Carlos y no se suben.

## No verificado

- **Que tus partidas se parezcan a las de lichess.** Son partidas de otros jugadores, en lichess, en septiembre de 2026; las tuyas viven en chess.com y no las medí.
- **Tu equivalencia en lichess.** ChessGoals no llega a 700 de Rapid en chess.com y su tabla de lichess va por Blitz; "cerca de 1200" es mi extrapolación, juntando dos tablas.
- **Que juegues mitad con blancas y mitad con negras.** La columna "por lección" lo supone.
- **Que el mapa de Otras aperturas de blancas sirva contra las aperturas que no abren sus lecciones** (1.e3, 1.♘c3, 1.d3…): la tabla las cuenta, como el repo; sin ellas, el curso baja a 0.49 % / 0.50 % por lección.
- **Lo que llevas hecho en el iPhone:** no lo vi; "Seguir" funciona con cualquier avance.
- **Ningún estudio es de ajedrez.** Lo de intercalar y espaciar viene de pinturas, imágenes, textos cortos y datos curiosos; aplicarlo a cursos de aperturas es inferencia.
- **Brunmair y Richter, Carvalho y Goldstone, Kornell y Bjork y Yan et al.:** solo leí lo que de ellos dice Firth et al. ChessGoals la leí a través de un resumen de la página.

**Fuera de esta pregunta, para que lo sepas** (no es del escalón 1):
- **Con blancas, contra 1.e4 e5 2.♘f3 sin 2...♘c6** (la Petrov, 2...♘f6; la Philidor, 2...d6; 2...♗c5 y otras) no hay curso ni variante en la base: es cerca del 31.8 % / 19.4 % de tus partidas con blancas (`node consulta.mjs "e4 e5 Nf3"`: lo que no es 2...♘c6, por 1...e5).
- **Con negras, contra 1.d4 d5 sin 2.c4** (2.♗f4, 2.♘c3, 2.e3, 2.♘f3…), cerca del 16.5 % / 16.6 % de tus partidas con negras (`node cuota.mjs`), tampoco hay curso: la Eslava empieza en 2.c4 (`iterations/v4/mapa-eslava.md`, línea 92).
