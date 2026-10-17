// Measures how smooth moving between pages feels, over a built site (run `pnpm build` first).
// Flow, on a phone viewport with a throttled CPU and network: course map -> click a lesson ->
// browser back -> click the lesson's "next" link. Per click it reports
//   cls        layout shift (PerformanceObserver "layout-shift", no recent input) summed over the flow
//   loads      full document loads (a client-side navigation adds none)
//   frames     screencast frames between the click and the page settling (every frame is a visible change)
//   blank      frames that are one flat colour (a white flash between pages)
// Usage: node scripts/measure-nav.mjs [distDir=dist] [runs=5] [cpu=4]
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright-core";

const dist = resolve(process.argv[2] ?? "dist");
const runs = Number(process.argv[3] ?? 5);
const cpu = Number(process.argv[4] ?? 4);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".vtt": "text/vtt", ".mp4": "video/mp4" };
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split("?")[0]);
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(dist, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

const analyzer = `
import sys, json, glob
from PIL import Image
import numpy as np
frames = sorted(glob.glob(sys.argv[1] + "/*.jpg"))
prev = None; blank = 0; changes = 0
for f in frames:
    a = np.asarray(Image.open(f).convert("L"), dtype=np.int16)
    flat = a.std() < 2.0
    if flat: blank += 1
    if prev is not None and prev.shape == a.shape and np.abs(a - prev).mean() > 0.4: changes += 1
    prev = a
print(json.dumps({"frames": len(frames), "blank": blank, "changes": changes}))
`;

const rows = [];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (let run = 0; run < runs; run++) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "he-IL", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 60, downloadThroughput: (6 * 1024 * 1024) / 8, uploadThroughput: (2 * 1024 * 1024) / 8 });
  let cls = 0;
  await page.exposeBinding("__cls", (_s, v) => void (cls += v));
  await page.addInitScript(() => {
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls(e.value);
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
  });
  let loads = 0;
  page.on("load", () => void loads++);

  const frameDirRoot = mkdtempSync(join(tmpdir(), "nav-frames-"));
  const step = async (name, action, settleSelector) => {
    const dir = join(frameDirRoot, name);
    mkdirSync(dir, { recursive: true });
    let n = 0;
    cdp.on("Page.screencastFrame", (f) => {
      writeFileSync(join(dir, `${String(n++).padStart(4, "0")}.jpg`), Buffer.from(f.data, "base64"));
      void cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    const cls0 = cls;
    const loads0 = loads;
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, everyNthFrame: 1 });
    await action();
    await page.waitForSelector(settleSelector, { state: "visible" });
    await page.waitForTimeout(1800);
    await cdp.send("Page.stopScreencast");
    cdp.removeAllListeners("Page.screencastFrame");
    const a = JSON.parse(execFileSync("python3", ["-I", "-c", analyzer, dir], { encoding: "utf8" }));
    rows.push({ run, step: name, cls: +(cls - cls0).toFixed(4), loads: loads - loads0, frames: a.frames, blank: a.blank, changes: a.changes });
  };

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await step("map->lesson", () => page.locator('a[href="/lessons/0-1/"]').first().click(), ".prose-lesson");
  await step("lesson->back", () => page.goBack(), "#overall-progress, h1");
  await page.waitForSelector('a[href="/lessons/0-1/"]');
  await page.locator('a[href="/lessons/0-1/"]').first().click();
  await page.waitForSelector(".prose-lesson");
  await page.waitForTimeout(1200);
  await step("lesson->next", () => page.locator('nav[aria-label="שיעור קודם והבא"] a[href^="/lessons/"]').last().click(), ".prose-lesson");
  await ctx.close();
  rmSync(frameDirRoot, { recursive: true, force: true });
}
await browser.close();
server.close();

const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const out = {};
for (const s of [...new Set(rows.map((r) => r.step))]) {
  const rs = rows.filter((r) => r.step === s);
  out[s] = Object.fromEntries(["cls", "loads", "frames", "blank", "changes"].map((k) => [k, med(rs.map((r) => r[k]))]));
}
console.log(JSON.stringify({ dist, runs, cpu, median: out, all: rows }, null, 1));
