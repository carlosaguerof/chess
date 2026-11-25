// Las frecuencias del curso "Avance contra la Francesa" (`francesa:w`), con el método de su mapa
// (`iterations/v4/mapa-avance-francesa.md`; el método, en `avance-comun.mjs`).
import { medirAvance } from './avance-comun.mjs'

export default medirAvance({
  archivo: 'avance-francesa',
  apertura: 'francesa',
  inicio: 'e4 e6',
  raizFormas: 'e4 e6 d4 d5',
  tronco: [['d4', 'd5'], ['e5', null]],
  // la jugada del rival que le da nombre a cada lección (la de su nombre en el curso)
  define: {
    'cambio-d4': [7, 'cxd4'], // 4...cxd4 tras 4.c3
    cge7: [9, 'Nge7'], // 5...Cge7 tras 5.Cf3
    principal: [9, 'Qb6'], // 5...Db6 tras 5.Cf3
    lputian: [11, 'Nh6'], // 6...Ch6 tras 6.a3
    euwe: [9, 'Bd7'], // 5...Ad7 tras 5.Cf3
    wade: [9, 'Bd7'], // 5...Ad7 tras 4...Db6 5.Cf3
    'cambio-alfil': [5, 'Bd7'], // 3...Ad7 tras 3.e5
  },
  // lo que `fuenteFrecuencia` nombra además: 6...c4 de la línea principal y 4...Db6 de la Wade
  aparte: { 'principal · 6...c4': ['principal', 11, 'c4'], 'wade · 4...Db6': ['wade', 7, 'Qb6'] },
  formas: ['cadena entera', 'base sola', 'cerrada'],
  resto: ['sin peón en d4', 'sin peón en e5'],
  metodo:
    'Tus partidas: las que llegan a 1.e4 e6, jugando tú lo del curso (2.d4, 3.e5 y lo de sus lecciones). Cada lección, por su parte de tus partidas (el producto de las proporciones de las jugadas del rival, desde 1.e4 e6, hasta la que le da nombre), la que usa la regla de obligatorio y opcional; si a una posición no llega ninguna partida (tu jugada no se jugó ahí), su parte es 0, como en el mapa; su n, las partidas que llegan a esa jugada. En "otras", su medida en la posición que la define (entre las partidas que llegan ahí; null si no llega ninguna). Cada forma, a la media jugada 14 desde 1.e4 e6 2.d4 d5: juegas lo del curso mientras haya respuesta y lo que juega la gente fuera de él, y lo del rival pesa por lo que se juega en cada paso; su n, las partidas reales que llegan a esa forma por ese camino. Las respuestas a 2.d4 y a 3.e5 sin lección que salen en 5 % o más de tus partidas en alguna banda van en "otras".',
})
