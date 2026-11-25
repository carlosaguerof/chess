# Iteración v4 — los siete cursos, por estructuras (2026-11-25)

**Qué pedí:** los otros siete cursos con el formato que elegí al comparar los dos de la Caro-Kann (`specs/cursos.md` §6): primero el mapa, una lección por estructura, las que más salen y lo demás como opcional. Los siete a la vez, en una sola corrida ("2. B", 2026-11-25), con un gate: "si falla pues primero entiendas por qué y luego se considere que no lo hagan así y encuentren como sí funciona". Y en Aprender, una sola Caro-Kann ("1. A").

**Qué es éxito:** cada curso con sus pruebas en verde (`npm test` y la corrida completa en GitHub), cada afirmación comprobada con el motor o con una fuente seria, publicado y comprobado, y yo recorriendo los siete en el iPhone.

**La fuente:** los prompts `00_corridas/chess/2026-11-25_PROMPT_curso-*.md` (fuera de este repo), con sus mapas, reportes y revisiones. Cada curso lo hizo un worker en su rama; cada mapa pasó por el gate (un evaluator independiente, una o dos vueltas) y cada rama por una revisión final antes de entrar a `main`.

| Curso | Rama | Mapa | Revisiones (en `00_corridas/chess/`, con el prefijo `2026-11-25_`) | Entró a `main` |
|---|---|---|---|---|
| Una sola Caro-Kann (`caro-kann-estructuras:b`) y el filtro común de opcionales | `feat/una-sola-caro-kann` | (el de la v3) | `REVISION_una-sola-caro-kann.md` y `-2.md` | `309b55b`, 02:42 |
| Avance contra la Caro-Kann (`caro-kann:w`) | `feat/curso-avance` | `mapa-avance-caro-kann.md` | mapa: `REVISION_mapa-curso-avance.md` y `-2.md`; rama: `REVISION_rama-curso-avance.md` | `e443cfe`, 04:38 |
| Avance contra la Francesa (`francesa:w`) | `feat/curso-avance` | `mapa-avance-francesa.md` | las mismas del Avance | `e443cfe`, 04:38 |
| Defensa Eslava (`eslava:b`) | `feat/curso-eslava` | `mapa-eslava.md` | mapa: `REVISION_mapa-curso-eslava.md` y `-2.md`; rama: `REVISION_rama-curso-eslava.md` | `69ea61e`, 04:59 |
| Otras aperturas de blancas (`otros-negras:b`, "...c6 + ...d5 contra lo demás") | `feat/curso-eslava` | `mapa-otros-negras.md` | las mismas de la Eslava | `69ea61e`, 04:59 |
| Italiana (`italiana:w`) | `feat/curso-italiana` | `mapa-italiana.md` | mapa: `REVISION_mapa-curso-italiana.md` y `-2.md`; rama: `REVISION_rama-curso-italiana.md` | `83a68ef`, 05:11 |
| La captura contra la Escandinava (`escandinava:w`) | `feat/curso-escandinava` | `mapa-escandinava.md` | mapa: `REVISION_mapa-curso-escandinava.md` y `-2.md`; rama: `REVISION_rama-curso-escandinava.md` y `-2.md` | `430569e`, 05:45 |
| Alapin contra la Siciliana (`siciliana:w`) | `feat/curso-alapin` | `mapa-alapin.md` | mapa: `REVISION_mapa-curso-alapin.md` y `-2.md`; rama: `REVISION_rama-curso-alapin.md` y `-2.md` | `0da166f`, 06:11 |
| **El cierre:** lo común a todos los cursos | `feat/cierre-cursos` | — | la de esta rama, antes de entrar | pendiente |

Los mapas, sus comprobaciones del motor, sus listas de marcas y sus inventarios de "Ver qué pasaría" están en esta carpeta, uno por curso. Los números de la regla de obligatorio y opcional, en `conocimiento/frecuencias/`. Qué cambió en la app: `changes.md`; lo aprendido: `learning.md`.

**El cierre (`feat/cierre-cursos`).** Las revisiones finales de cada rama encontraron cosas que no eran de un curso sino de todos, y que ninguna rama podía arreglar sola sin chocar con las demás: un Respaldo viejo perdía el Repaso, el avance de las lecciones viejas no se contaba igual en todos, el nombre de una lección adelantaba tu jugada en Practicar, Playwright podía probar el servidor de otra copia, las tablas de obligatorio y opcional se comparaban con números escritos a mano, y decenas de pruebas se saltaban en los cursos nuevos. La corrida del cierre las arregló una vez, para todos (`log.md`, 2026-11-25).

**Lo que falta para cerrar del todo:** la corrida completa en GitHub (los dos perfiles; la llave de la Air da 403 al lanzarla), publicar, y mi recorrido de los siete en el iPhone, con mis respuestas a las preguntas de cada curso (lecciones para lo que más sale sin lección, las cuartas jugadas del Avance, los jaques de la Escandinava).
