# Producto — qué es, para quién y qué es éxito

> Aprobado por Carlos el 2026-10-28. Es la fuente del MVP (v1). Lo que no entra: `despues.md`.

## 0. Qué es y para quién

Una web app personal para **aprender y enseñar mis aperturas y defensas con sus variaciones**. Los bots son el rival para practicarlas. No es copiar chess.com: cuando haya que decidir entre dos caminos, gana el que me ayude más a aprender mis líneas.

Para mí (Carlos): ELO 700 en chess.com, Rapid. Un solo usuario, sin cuentas. Todo corre en el navegador.

Éxito del MVP: abrir la app en el navegador y (1) jugar contra bots con personaje y nivel aproximado de ELO; (2) tener la base de conocimiento de mis aperturas y defensas, con sus variaciones bien bajadas, y mi repertorio encima; (3) practicar mi repertorio contra el sistema; (4) jugar contra un bot que entra a mi repertorio y, al terminar, saber en qué jugada me salí. Todo demostrado con pruebas que corren.

## 1. El MVP

**Entra:**

1. **Jugar contra bots** con personaje: nombre, ELO aproximado, una frase de quién es, y su estilo, que en el MVP son **sus aperturas y defensas**. Cada bot tiene su libro: qué abre con blancas y cómo se defiende con negras, unas 6 a 8 jugadas sacadas de la base, y después juega con el motor a su nivel.
2. **La base de conocimiento de aperturas:** como mínimo, todas las que uso, con sus variaciones bien bajadas. Más las 1 o 2 más populares para principiantes junto a cada una mía.
3. **Mi repertorio,** encima de la base y visible como en mis guías: un árbol por color, con el nombre de cada línea, su plan y su frecuencia. **Mi guía solo dice QUÉ quiero aprender, no cómo se juega (nota 11, 06:14):** de ahí sale la lista de aperturas (con blancas: 1.e4 con la Italiana, la Alapin, el Avance contra la Caro-Kann y contra la Francesa, y la captura contra la Escandinava; con negras: la Caro-Kann y la Eslava). Las jugadas, variantes, planes y frecuencias salen de la base (teoría estándar con fuente, validada con el motor). Si mi guía y la teoría no coinciden, gana la teoría. En la app la marca es "en tu repertorio" contra "solo en la base"; los planes de mi guía aparecen donde coinciden con la teoría.
4. **Practicarlo con cursos.** Es la parte que más voy a diseñar después: esta versión es el punto de partida. La base es como los cursos de lichess:
   - Un **curso por apertura** ("Caro-Kann", "Italiana"…) y una **lección por variante**.
   - **Primero te la enseña:** "Juega 1...c6", con su idea. La juego y la marca como correcta.
   - **Luego te pregunta:** la máquina contesta con la jugada del rival y me pregunta "¿Qué harías?". Si fallo, la marca como incorrecta y repito ese paso hasta acertar.
   - En cualquier paso puedo pedir **Pista** (la idea en palabras y la pieza que se mueve, sin decir a dónde) o la **Respuesta** (la jugada con flecha, su nombre y su plan).
   - Al terminar la lección, su nombre y su plan, y pasa a la siguiente variante.
5. **La guía en una partida real**, que es lo que más quiero. Contra un bot, con la guía de aperturas prendida:
   - **Al jugar yo, me dice qué hice:** "Iniciaste con 1.e4", "Estás en la Caro-Kann", "Contestaste con la Variante del Avance; otra opción era la Clásica", o "Te desviaste de la Caro-Kann: tu línea dice 3...Af5".
   - **Al jugar el rival, no dice nada,** pero puedo pedir **Pista** o **Respuesta**. No son lo que el motor cree mejor: salen de la apertura que estoy aprendiendo (mi repertorio y la base). Fuera de teoría, me lo dice y me da el plan de principios.
   - **Si me desvío, decido yo:** sigo, o deshago la jugada.
   - El bot puede **jugar las líneas de mi repertorio** para que lleguemos a ellas, y al final de la partida hay un resumen: hasta qué jugada seguí mi línea, dónde me salí yo o dónde se salió el rival.
6. **Escoger qué aprendo (editar mi repertorio).** Todavía no me sé estas aperturas: el sistema las tiene que tener y enseñármelas. Lo principal: agregar a mi repertorio una línea tomándola de la base, o quitarla. Además: agregar una jugándola en el tablero, cambiar su nombre, su plan y su frecuencia, y exportar o importar todo en un archivo, porque vive en el navegador.
7. **Refuerza lo que fallas** (P1; cambió el 2026-10-28 a las 05:55, nota 1 del instructivo). Cada vez que me toca una jugada de una línea (en los cursos, en "Refuerza" y con la guía en una partida) se guarda si acerté a la primera, si fallé, si pedí Pista o si pedí Respuesta, y cuándo; va por jugada (la posición y la jugada esperada). En el inicio, un botón arma una práctica con las jugadas que más fallo y luego con las que llevo más tiempo sin practicar o nunca he practicado, con sus conteos ("fallada 3 de 5 veces"). Nada de calendarios ni escalones. El registro entra al exportar e importar. Encima, al final de la cola (R7, nota 4): "Repaso de hoy" con escalones de 1, 3, 7, 14 y 30 días, con un interruptor (prendido por defecto) para quitarlo del inicio.
8. **Las ayudas de chess.com, todas opcionales** (P1): reloj, barra de quién va ganando, flechas de amenazas y de sugerencias, y estrellas al ganar según cuánta ayuda usé. Estrellas: si gano, 3 sin ninguna ayuda; 2 con barra o flechas; 1 con la guía prendida, o si pedí Pista o Respuesta, o deshice. Si empato sin ayuda, 2; si empato con cualquier ayuda, 1 (nota 2, 06:05). Si pierdo, 0. Cuenta la peor ayuda usada.

**La distribución de personajes** (47 en total):

| ELO | Personajes por nivel | Cuántos |
|---|---|---|
| 100, 200, 300, 400 | 1 | 4 |
| 500, 600, 700, 800, 900, 1000 | 3 | 18 |
| 1100, 1200, 1300, 1400, 1500 | 2 | 10 |
| 1600 a 3000, de 100 en 100 | 1 | 15 |

Los de un mismo nivel se distinguen por sus aperturas. Cada personaje trae además un **temperamento** (agresivo, equilibrado o defensivo): en P0 es solo un dato.

## 2. Principios de producto que se tienen que notar

La fuente es `/Users/carlosaguerof/01_repos/00_direccion/principios/producto.md` (Nielsen, Maister y lo de Carlos). Aquí, cómo se aterriza en esta app:

- **N1, el elevador.** Al tocar una pieza, la casilla se marca al instante (menos de 0.1 s). Mientras el bot piensa se ve "<Nombre> está pensando…", con una señal que se mueve, desde que le toca hasta que juega. El bot se toma entre 0.4 y 1.2 s por jugada aunque el motor conteste antes, para que se sienta como una persona. El motor corre en un Web Worker: la pantalla nunca se congela. Si el motor tarda en cargar la primera vez, se ve que está cargando.
- **N2, mis palabras.** Todo en español: jaque, jaque mate, ahogado, tablas, rendirse, deshacer. La notación es la de mis guías: **R D T A C** (rey, dama, torre, alfil, caballo), `0-0` y `0-0-0`. Los nombres de aperturas, en español (con el nombre en inglés y el código ECO a un lado, en chico).
- **N3, salida.** Deshacer contra el bot (mi última jugada y su respuesta). Salir al inicio no pierde la partida.
- **N5, prevenir errores.** Solo se aceptan jugadas legales, y se marcan las casillas posibles. Rendirse, empezar otra partida con una en curso y borrar una rama del repertorio piden confirmación; borrar una rama además se puede deshacer.
- **N6, a la vista.** La lista de jugadas siempre visible. Al practicar, el nombre de la línea a la vista.
- **N8, solo lo que importa.** En la partida: el tablero, los dos jugadores, la lista de jugadas y tres botones (deshacer, rendirse, voltear). Con la guía prendida, además, su mensaje y dos botones: Pista y Respuesta. Con reloj, cada reloj junto a su jugador. Las demás ayudas (barra y flechas) se prenden desde un solo botón de ayudas y, prendidas, se ven sobre el tablero o a su lado. Nada más.
- **N9, errores claros.** Si el motor no carga, se dice qué pasó y qué hacer, sin códigos.
- **C1, irse y volver.** Si recargo o cierro la pestaña, la partida sigue donde iba.
- **C2, MVP.** Nada que no esté en la §1.
- **La vara de cada pantalla (nota 5):** una acción principal clara, pocas opciones a la vista, textos cortos y todo en su lugar; lo secundario va en un menú. Si una pantalla se parece más a lichess que a chess.com en cantidad de cosas a la vista, no está lista.
- **C4, entrar sin fricción.** Del inicio a mi primera jugada contra un bot, máximo 3 toques: el inicio me recomienda un bot de 700.
- **Pensado para el celular primero** (iPhone, Safari, 390×844), y que también funcione en la computadora (1440×900).
- **El aspecto es el de chess.com, copiado lo más cerca posible** en distribución, colores, tamaños y flujo. Uso 100 % personal y privado. Lo que queda igual: tema oscuro, tablero verde y crema, el rival arriba y yo abajo del tablero, cada uno con su nombre, su nivel y su avatar, la lista de jugadas en un panel al lado (en el celular, debajo), y botones grandes y claros. Y lo esencial de su UX: escoger el bot en una lista con avatar y nivel, verlo en grande con su frase antes de jugar, escoger color y "Jugar"; la partida; y al terminar, un aviso con el resultado y dos salidas, revancha u otro bot. Encima de eso mandan los principios de esta sección. Se logra con colores, distribución y piezas propias o abiertas, **nunca con sus archivos ni su marca**. Las tipografías van instaladas en el proyecto (`@fontsource`). De mis guías se toma solo cómo se dibuja el árbol del repertorio: las jugadas en píldoras, las ramas con líneas finas, el plan con un filete y la frecuencia con 5 puntos.
