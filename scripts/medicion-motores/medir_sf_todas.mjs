// Mide Stockfish 19 lite single (npm stockfish 19.0.1) en Node.
// Uso: node medir_sf.mjs <ruta-al-engine.js>
// Lanza el motor como proceso hijo (stdin/stdout UCI), igual que examples de stockfish.js.
import { spawn } from "node:child_process";

const ENGINE = process.argv[2];
if (!ENGINE) { console.error("falta ruta al engine"); process.exit(1); }

// Posiciones de medio juego tomadas de la lista de bench de Stockfish (src/benchmark.cpp).
const FENS = [
  "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 10",
  "4rrk1/pp1n3p/3q2pQ/2p1pb2/2PP4/2P3N1/P2B2PP/4RRK1 b - - 7 19",
  "r3r1k1/2p2ppp/p1p1bn2/8/1q2P3/2NPQN2/PPP3PP/R4RK1 b - - 2 15",
  "r1bq1rk1/ppp1nppp/4n3/3p3Q/3P4/1BP1B3/PP1N2PP/R4RK1 w - - 1 16",
  "4r1k1/r1q2ppp/ppp2n2/4P3/5Rb1/1N1BQ3/PPP3PP/R5K1 w - - 1 17",
];

function startEngine() {
  const t0 = performance.now();
  const p = spawn(process.execPath, [ENGINE], { stdio: ["pipe", "pipe", "pipe"] });
  let buf = "";
  const waiters = [];
  const lines = [];
  p.stdout.on("data", (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      lines.push(line);
      for (const w of [...waiters]) {
        if (w.re.test(line)) { waiters.splice(waiters.indexOf(w), 1); w.res(line); }
      }
    }
  });
  const send = (c) => p.stdin.write(c + "\n");
  const until = (re) => new Promise((res) => waiters.push({ re, res }));
  return { p, send, until, lines, t0 };
}

async function run() {
  const e = startEngine();
  e.send("uci");
  await e.until(/^uciok/);
  const tUci = performance.now() - e.t0;
  e.send("isready");
  await e.until(/^readyok/);
  const tReady = performance.now() - e.t0;
  console.log(`CARGA: spawn->uciok ${tUci.toFixed(0)} ms, spawn->readyok ${tReady.toFixed(0)} ms`);

  async function go(fen, opts, goCmd) {
    e.send("ucinewgame");
    for (const [k, v] of Object.entries(opts)) e.send(`setoption name ${k} value ${v}`);
    e.send("isready"); await e.until(/^readyok/);
    e.send(`position fen ${fen}`);
    const start = e.lines.length;
    const t = performance.now();
    e.send(goCmd);
    const best = await e.until(/^bestmove/);
    const ms = performance.now() - t;
    const infos = e.lines.slice(start).filter((l) => l.startsWith("info") && / pv /.test(l));
    const last = infos[infos.length - 1] || "";
    const depth = +(last.match(/ depth (\d+)/)?.[1] ?? 0);
    const nodes = +(last.match(/ nodes (\d+)/)?.[1] ?? 0);
    // última tanda de MultiPV a la profundidad final
    const finalPv = infos.filter((l) => / depth (\d+)/.exec(l)?.[1] == depth);
    const mpv = {};
    for (const l of finalPv) {
      const k = l.match(/ multipv (\d+)/)?.[1] ?? "1";
      const cp = l.match(/ score (cp|mate) (-?\d+)/);
      const mv = l.match(/ pv (\S+)/)?.[1];
      mpv[k] = `${mv}:${cp ? cp[1] + cp[2] : "?"}`;
    }
    return { ms, depth, nodes, best: best.split(" ")[1], mpv };
  }

  const cases = process.env.TODAS ? [
    ["MultiPV 256 (todas las jugadas), go depth 6", { MultiPV: 256, UCI_LimitStrength: "false", "Skill Level": 20 }, "go depth 6"],
    ["MultiPV 256 (todas las jugadas), go depth 8", { MultiPV: 256, UCI_LimitStrength: "false", "Skill Level": 20 }, "go depth 8"],
  ] : [
    ["MultiPV 1, go depth 8", { MultiPV: 1, UCI_LimitStrength: "false", "Skill Level": 20 }, "go depth 8"],
    ["MultiPV 5, go depth 8", { MultiPV: 5, UCI_LimitStrength: "false", "Skill Level": 20 }, "go depth 8"],
    ["MultiPV 5, go depth 12", { MultiPV: 5, UCI_LimitStrength: "false", "Skill Level": 20 }, "go depth 12"],
    ["MultiPV 5, go movetime 100", { MultiPV: 5, UCI_LimitStrength: "false", "Skill Level": 20 }, "go movetime 100"],
    ["MultiPV 1, go movetime 100", { MultiPV: 1, UCI_LimitStrength: "false", "Skill Level": 20 }, "go movetime 100"],
    ["UCI_LimitStrength true, UCI_Elo 1320, go movetime 100", { MultiPV: 1, UCI_LimitStrength: "true", UCI_Elo: 1320 }, "go movetime 100"],
  ];

  for (const [name, opts, cmd] of cases) {
    console.log(`\n== ${name} ==`);
    const msList = [];
    for (const fen of FENS) {
      const r = await go(fen, opts, cmd);
      msList.push(r.ms);
      console.log(`  ${r.ms.toFixed(0).padStart(5)} ms  depth ${String(r.depth).padStart(2)}  nodes ${String(r.nodes).padStart(8)}  best ${r.best}  jugadas_evaluadas ${Object.keys(r.mpv).length}`);
    }
    const avg = msList.reduce((a, b) => a + b, 0) / msList.length;
    console.log(`  PROMEDIO ${avg.toFixed(0)} ms  (min ${Math.min(...msList).toFixed(0)}, max ${Math.max(...msList).toFixed(0)})`);
  }
  e.send("quit");
  setTimeout(() => e.p.kill(), 200);
}
run();
