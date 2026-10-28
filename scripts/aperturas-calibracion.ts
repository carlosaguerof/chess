/**
 * Posiciones de salida de la calibración: aperturas comunes (nombres y jugadas de lichess-org/chess-openings, CC0).
 * Cada una se juega dos veces, una con cada color, para que las partidas varíen y los colores se alternen.
 */
export const APERTURAS_CALIBRACION: { nombre: string; jugadas: string[] }[] = [
  { nombre: 'Italian Game', jugadas: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
  { nombre: 'Ruy Lopez', jugadas: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  { nombre: 'Scotch Game', jugadas: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'] },
  { nombre: 'Four Knights Game', jugadas: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6'] },
  { nombre: 'Petrov', jugadas: ['e4', 'e5', 'Nf3', 'Nf6'] },
  { nombre: 'Philidor Defense', jugadas: ['e4', 'e5', 'Nf3', 'd6'] },
  { nombre: 'Vienna Game', jugadas: ['e4', 'e5', 'Nc3'] },
  { nombre: 'Sicilian Defense: Alapin Variation', jugadas: ['e4', 'c5', 'c3'] },
  { nombre: 'Sicilian Defense: Open', jugadas: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'] },
  { nombre: 'Caro-Kann Defense: Advance Variation', jugadas: ['e4', 'c6', 'd4', 'd5', 'e5'] },
  { nombre: 'Caro-Kann Defense: Classical Variation', jugadas: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'] },
  { nombre: 'French Defense: Advance Variation', jugadas: ['e4', 'e6', 'd4', 'd5', 'e5'] },
  { nombre: 'Scandinavian Defense', jugadas: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3'] },
  { nombre: 'Pirc Defense', jugadas: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'] },
  { nombre: 'Alekhine Defense', jugadas: ['e4', 'Nf6'] },
  { nombre: "Queen's Gambit Declined", jugadas: ['d4', 'd5', 'c4', 'e6'] },
  { nombre: 'Slav Defense', jugadas: ['d4', 'd5', 'c4', 'c6'] },
  { nombre: "Queen's Gambit Accepted", jugadas: ['d4', 'd5', 'c4', 'dxc4'] },
  { nombre: 'London System', jugadas: ['d4', 'd5', 'Bf4'] },
  { nombre: "King's Indian Defense", jugadas: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'] },
  { nombre: 'Dutch Defense', jugadas: ['d4', 'f5'] },
  { nombre: 'English Opening', jugadas: ['c4', 'e5'] },
  { nombre: 'Zukertort Opening', jugadas: ['Nf3', 'd5'] },
  { nombre: "Bird Opening", jugadas: ['f4', 'd5'] },
]
