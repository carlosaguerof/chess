// Corre Fairy-Stockfish (npm fairy-stockfish-nnue.wasm 1.1.12) en Node para capturar
// sus opciones UCI y medir el tiempo de los niveles 1 y 8 de lichess.
// Uso: node fairy_uci.cjs <ruta-a-package/stockfish.js>
const ENGINE = process.argv[2];
// Node 26 trae fetch global y el Emscripten viejo intenta fetch() de una ruta local: se desactiva.
delete globalThis.fetch;
const Stockfish = require(ENGINE);
const FENS = [
  "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 10",
  "4rrk1/pp1n3p/3q2pQ/2p1pb2/2PP4/2P3N1/P2B2PP/4RRK1 b - - 7 19",
  "r3r1k1/2p2ppp/p1p1bn2/8/1q2P3/2NPQN2/PPP3PP/R4RK1 b - - 2 15",
  "r1bq1rk1/ppp1nppp/4n3/3p3Q/3P4/1BP1B3/PP1N2PP/R4RK1 w - - 1 16",
  "4r1k1/r1q2ppp/ppp2n2/4P3/5Rb1/1N1BQ3/PPP3PP/R5K1 w - - 1 17",
];
(async () => {
  const t0 = performance.now();
  const sf = await Stockfish();
  const lines = []; const waiters = [];
  sf.addMessageListener((line) => {
    lines.push(line);
    for (const w of [...waiters]) if (w.re.test(line)) { waiters.splice(waiters.indexOf(w), 1); w.res(line); }
  });
  const until = (re) => new Promise((res) => waiters.push({ re, res }));
  sf.postMessage("uci"); await until(/^uciok/);
  console.log(`CARGA: init->uciok ${(performance.now() - t0).toFixed(0)} ms`);
  for (const l of lines) if (/^id name|Skill Level|UCI_Elo|UCI_LimitStrength|MultiPV|EvalFile|Use NNUE|UCI_Variant/.test(l)) console.log(l);
  // Niveles lichess (fishnet src/api.rs): 1 = Skill -9, 50 ms, depth 5; 8 = Skill 20, 1000 ms, depth 22
  for (const [name, skill, cmd] of [["lichess nivel 1", -9, "go movetime 50 depth 5"], ["Skill -20", -20, "go movetime 50 depth 5"], ["lichess nivel 8", 20, "go movetime 1000 depth 22"]]) {
    console.log(`\n== ${name}: setoption Skill Level ${skill}; ${cmd} ==`);
    sf.postMessage(`setoption name Skill Level value ${skill}`);
    for (const fen of FENS) {
      sf.postMessage("ucinewgame"); sf.postMessage("isready"); await until(/^readyok/);
      sf.postMessage(`position fen ${fen}`);
      const s = lines.length; const t = performance.now();
      sf.postMessage(cmd);
      const bm = await until(/^bestmove/);
      const info = lines.slice(s).filter((l) => / depth /.test(l) && / pv /.test(l)).pop() || "";
      console.log(`  ${(performance.now() - t).toFixed(0).padStart(5)} ms  depth ${info.match(/ depth (\d+)/)?.[1]}  ${bm}`);
    }
  }
  sf.postMessage("quit");
  setTimeout(() => process.exit(0), 300);
})();
