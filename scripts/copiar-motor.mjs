// Copia el motor (Stockfish 19 lite de un hilo, GPL-3.0) de node_modules a public/motor/, para servirlo junto a la app.
import { copyFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
const origen = 'node_modules/stockfish/bin/'
const destino = 'public/motor/'
mkdirSync(destino, { recursive: true })
for (const f of ['stockfish-19-lite-single.js', 'stockfish-19-lite-single.wasm']) {
  const o = origen + f
  const d = destino + f
  if (!existsSync(d) || statSync(d).size !== statSync(o).size) copyFileSync(o, d)
}
copyFileSync('node_modules/stockfish/Copying.txt', destino + 'COPYING-stockfish.txt')
