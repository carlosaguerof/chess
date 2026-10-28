// ¿Qué tan débil juega el UCI_Elo/Skill Level propio de Stockfish 19 lite?
// Para cada FEN: referencia = todas las jugadas evaluadas con MultiPV 256 (máximo del motor), depth 14.
// Luego N tiradas con UCI_LimitStrength + UCI_Elo (movetime 100) y se mide la pérdida en
// centipeones (cp loss) de la jugada elegida contra la mejor de la referencia.
// Uso: node medir_skill.mjs <ruta-al-engine.js> [tiradas]
import { spawn } from "node:child_process";

const ENGINE = process.argv[2];
const N = +(process.argv[3] ?? 10);
const FENS = [
  "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 10",
  "4rrk1/pp1n3p/3q2pQ/2p1pb2/2PP4/2P3N1/P2B2PP/4RRK1 b - - 7 19",
  "r3r1k1/2p2ppp/p1p1bn2/8/1q2P3/2NPQN2/PPP3PP/R4RK1 b - - 2 15",
  "r1bq1rk1/ppp1nppp/4n3/3p3Q/3P4/1BP1B3/PP1N2PP/R4RK1 w - - 1 16",
  "4r1k1/r1q2ppp/ppp2n2/4P3/5Rb1/1N1BQ3/PPP3PP/R5K1 w - - 1 17",
  // apertura: 1.e4 e5 2.Cf3 Cc6 3.Ac4 (posición típica de nivel bajo)
  "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
];
const ELOS = [1320, 1600, 2000, 2400];

const p = spawn(process.execPath, [ENGINE], { stdio: ["pipe", "pipe", "pipe"] });
let buf = ""; const waiters = []; const lines = [];
p.stdout.on("data", (d) => {
  buf += d.toString(); let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); lines.push(line);
    for (const w of [...waiters]) if (w.re.test(line)) { waiters.splice(waiters.indexOf(w), 1); w.res(line); }
  }
});
const send = (c) => p.stdin.write(c + "\n");
const until = (re) => new Promise((res) => waiters.push({ re, res }));
const score = (l) => { const m = l.match(/ score (cp|mate) (-?\d+)/); if (!m) return null; return m[1] === "cp" ? +m[2] : (+m[2] > 0 ? 10000 - +m[2] : -10000 - +m[2]); };

async function setopts(o) { for (const [k, v] of Object.entries(o)) send(`setoption name ${k} value ${v}`); send("isready"); await until(/^readyok/); }

async function reference(fen) {
  await setopts({ UCI_LimitStrength: "false", "Skill Level": 20, MultiPV: 256 });
  send("ucinewgame"); send(`position fen ${fen}`);
  const s = lines.length; send("go depth 14"); await until(/^bestmove/);
  const info = lines.slice(s).filter((l) => / depth 14 /.test(l) && / pv /.test(l));
  const ref = {};
  for (const l of info) ref[l.match(/ pv (\S+)/)[1]] = score(l);
  return ref;
}

async function main() {
  send("uci"); await until(/^uciok/);
  const summary = {};
  for (const fen of FENS) {
    const ref = await reference(fen);
    const best = Math.max(...Object.values(ref));
    const nMoves = Object.keys(ref).length;
    console.log(`\nFEN ${fen}\n  referencia d14: ${nMoves} jugadas, mejor ${best}cp`);
    for (const elo of ELOS) {
      await setopts({ MultiPV: 1, UCI_LimitStrength: "true", UCI_Elo: elo });
      const picks = {}; const losses = [];
      for (let t = 0; t < N; t++) {
        send("ucinewgame"); send(`position fen ${fen}`); send("go movetime 100");
        const bm = (await until(/^bestmove/)).split(" ")[1];
        picks[bm] = (picks[bm] ?? 0) + 1;
        losses.push(ref[bm] != null ? best - ref[bm] : NaN);
      }
      const avg = losses.reduce((a, b) => a + b, 0) / losses.length;
      (summary[elo] ??= []).push(...losses);
      console.log(`  UCI_Elo ${elo}: jugadas ${JSON.stringify(picks)}  cp loss prom ${avg.toFixed(0)} (max ${Math.max(...losses)})`);
    }
  }
  console.log("\nRESUMEN (todas las posiciones):");
  for (const elo of ELOS) {
    const l = summary[elo]; const avg = l.reduce((a, b) => a + b, 0) / l.length;
    const big = l.filter((x) => x >= 200).length;
    console.log(`  UCI_Elo ${elo}: ${l.length} jugadas, cp loss prom ${avg.toFixed(0)}, jugadas con pérdida >=200cp: ${big}, peor ${Math.max(...l)}`);
  }
  send("quit"); setTimeout(() => p.kill(), 200);
}
main();
