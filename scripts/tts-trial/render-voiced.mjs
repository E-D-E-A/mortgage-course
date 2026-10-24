// Voice-over TRIAL (not part of the site). Two modes:
//   node scripts/tts-trial/render-voiced.mjs cues <lesson> <out.json>
//     writes the lesson's subtitle cues (numbers already filled in) to out.json.
//   node scripts/tts-trial/render-voiced.mjs render <lesson> <timeline.json> <outDir>
//     renders the scene with time remapped to the narration: each cue's old
//     window is mapped onto its new window from timeline.json, so the drawing
//     that belonged to a sentence stays under that sentence. Writes
//     <outDir>/<lesson>.silent.mp4 and <outDir>/<lesson>.he.vtt.
// video/<lesson>.html and public/video/ are only read, never written.
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const [mode, lesson, arg1, arg2] = process.argv.slice(2);
const fps = 25;
const root = new URL("../..", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/video/${lesson}.html`);
await page.waitForFunction(() => window.ready === true);

if (mode === "cues") {
  const { duration, cues } = await page.evaluate(() => ({ duration: window.duration, cues: window.cues }));
  await writeFile(arg1, JSON.stringify({ duration, cues }, null, 1));
  console.log(`cues: ${cues.length}, original duration ${duration}s`);
} else if (mode === "render") {
  // timeline.json: { duration, map: [[newT, oldT], ...] } — a piecewise-linear map, both columns increasing.
  const timeline = JSON.parse(await readFile(arg1, "utf8"));
  const outDir = arg2;
  const frames = join(root, ".video-frames", `${lesson}-voiced`);
  await rm(frames, { recursive: true, force: true });
  await mkdir(frames, { recursive: true });
  await mkdir(outDir, { recursive: true });
  await page.evaluate((map) => {
    const original = window.render;
    window.render = (t) => {
      let i = 0;
      while (i < map.length - 2 && t > map[i + 1][0]) i++;
      const [n0, o0] = map[i], [n1, o1] = map[i + 1];
      original(o0 + ((t - n0) / (n1 - n0 || 1)) * (o1 - o0));
    };
  }, timeline.map);
  const total = Math.round(timeline.duration * fps);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.render(t), i / fps);
    await page.screenshot({ path: join(frames, `${String(i).padStart(5, "0")}.png`) });
    if (i % (fps * 10) === 0) process.stdout.write(`\r${Math.round((100 * i) / total)}%`);
  }
  process.stdout.write("\r100%\n");
  const r = spawnSync("ffmpeg", ["-y", "-framerate", String(fps), "-i", join(frames, "%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", join(outDir, `${lesson}.silent.mp4`)], { stdio: ["ignore", "ignore", "pipe"] });
  if (r.status !== 0) throw new Error(r.stderr.toString().slice(-2000));
  const ts = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = (s % 60).toFixed(3).padStart(6, "0");
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
  };
  const vtt = ["WEBVTT", "", ...timeline.cues.flatMap(([a, b, text], i) => [String(i + 1), `${ts(a)} --> ${ts(b)}`, `‏${text}`, ""])].join("\n");
  await writeFile(join(outDir, `${lesson}.he.vtt`), vtt);
  await rm(frames, { recursive: true, force: true });
  console.log(`rendered ${total} frames (${timeline.duration.toFixed(1)}s)`);
}
await browser.close();
server.close();
