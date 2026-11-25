// Las frecuencias del curso "Avance contra la Caro-Kann" (`caro-kann:w`), con el método de su mapa
// (`iterations/v4/mapa-avance-caro-kann.md`; el método, en `avance-comun.mjs`).
import { medirAvance } from './avance-comun.mjs'

export default medirAvance({
  archivo: 'avance-caro-kann',
  apertura: 'caro-kann',
  inicio: 'e4 c6',
  raizFormas: 'e4 c6 d4 d5',
  tronco: [['d4', 'd5'], ['e5', null]],
  // la jugada del rival que le da nombre a cada lección: 3...Af5 y 3...c5, tras 3.e5
  define: { af5: [5, 'Bf5'], c5: [5, 'c5'] },
  formas: ['cadena entera', 'base sola'],
  // la cadena cerrada sale en el mapa, pero no es forma de este curso
  resto: ['sin peón en d4', 'sin peón en e5', 'cerrada'],
  metodo:
    'Tus partidas: las que llegan a 1.e4 c6, jugando tú lo del curso (2.d4, 3.e5 y lo de sus lecciones). Cada lección, por su parte de tus partidas (el producto de las proporciones de las jugadas del rival, desde 1.e4 c6, hasta la que le da nombre: 3...Af5 o 3...c5), la que usa la regla de obligatorio y opcional; su n, las partidas que llegan a esa jugada. En "otras", su medida en la posición que la define (entre las partidas que llegan a 3.e5). Cada forma, a la media jugada 14 desde 1.e4 c6 2.d4 d5: juegas lo del curso mientras haya respuesta y lo que juega la gente fuera de él, y lo del rival pesa por lo que se juega en cada paso; su n, las partidas reales que llegan a esa forma por ese camino. Las respuestas a 2.d4 y a 3.e5 sin lección que salen en 5 % o más de tus partidas en alguna banda van en "otras".',
})
