// Renders a lesson video from its scene page (video/<lesson>.html):
// photographs window.render(t) at a fixed frame rate, assembles the frames with
// ffmpeg into public/video/<lesson>.mp4, writes the Hebrew subtitles from
// window.cues to public/video/<lesson>.he.vtt, a poster frame, and a contact
// sheet of key frames to qa/video/ for checking direction, clipping and numbers.
// Run: pnpm video 0-3
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const lesson = process.argv[2] ?? "0-3";
const fps = Number(process.env.FPS ?? 25);
const root = new URL("..", import.meta.url).pathname;
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
}).listen(4398);

const frames = join(root, ".video-frames", lesson);
await rm(frames, { recursive: true, force: true });
await mkdir(frames, { recursive: true });
const outDir = join(root, "public", "video");
const qaDir = join(root, "qa", "video");
await mkdir(outDir, { recursive: true });
await mkdir(qaDir, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("requestfailed", (r) => errors.push(`failed: ${r.url()}`));
await page.goto(`http://localhost:4398/video/${lesson}.html`);
await page.waitForFunction(() => window.ready === true);
if (errors.length) throw new Error(errors.join("\n"));
const { duration, cues } = await page.evaluate(() => ({ duration: window.duration, cues: window.cues }));

const total = Math.round(duration * fps);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / fps);
  await page.screenshot({ path: join(frames, `${String(i).padStart(5, "0")}.png`) });
  if (i % (fps * 10) === 0) process.stdout.write(`\r${Math.round((100 * i) / total)}%`);
}
process.stdout.write("\r100%\n");

// Key frames for QA: the middle of every cue.
for (const [a, b] of cues) {
  const t = (a + b) / 2;
  await page.evaluate((x) => window.render(x), t);
  await page.screenshot({ path: join(qaDir, `${lesson}-t${String(Math.round(t)).padStart(3, "0")}.png`) });
}
await page.evaluate(() => window.render(95));
await page.screenshot({ path: join(outDir, `${lesson}-poster.png`) });
await browser.close();
server.close();

const run = (args) => {
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  if (r.status !== 0) throw new Error(r.stderr.toString().slice(-2000));
};
run(["-y", "-framerate", String(fps), "-i", join(frames, "%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-movflags", "+faststart", join(outDir, `${lesson}.mp4`)]);

const ts = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = (s % 60).toFixed(3).padStart(6, "0");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec}`;
};
const vtt = ["WEBVTT", "", ...cues.flatMap(([a, b, text], i) => [String(i + 1), `${ts(a)} --> ${ts(b)}`, text, ""])].join("\n");
await writeFile(join(outDir, `${lesson}.he.vtt`), vtt);
await rm(frames, { recursive: true, force: true });
console.log(`video: public/video/${lesson}.mp4 (${duration}s at ${fps}fps), subtitles: ${cues.length} cues, key frames in qa/video/`);
