// Screenshots of every built page at desktop and phone width, for the QA pass:
// RTL correct, nothing clipped, no horizontal scroll. Serves dist/ itself.
// Run: pnpm build && pnpm screens   → qa/screens/*.png
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("../dist/", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".vtt": "text/vtt", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split("?")[0]);
  if (path.endsWith("/")) path += "index.html";
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(4399);

const pages = ["/", "/lessons/0-3/", "/glossary/", "/login/"];
const viewports = { desktop: { width: 1280, height: 900 }, phone: { width: 390, height: 844 } };
const out = new URL("../qa/screens/", import.meta.url).pathname;
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const problems = [];
for (const [name, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport, locale: "he-IL" });
  page.on("pageerror", (e) => problems.push(`${name}: page error: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`${name}: console: ${m.text()}`));
  for (const p of pages) {
    await page.goto(`http://localhost:4399${p}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) problems.push(`${name} ${p}: horizontal scroll of ${overflow}px`);
    const dir = await page.evaluate(() => document.documentElement.dir);
    if (dir !== "rtl") problems.push(`${name} ${p}: dir is ${dir}`);
    // Equations must read left to right: the first character sits left of the last.
    const reversed = await page.evaluate(() =>
      [...document.querySelectorAll("span.ltr[dir=ltr]")]
        .filter((span) => {
          const node = span.firstChild;
          if (!node || node.nodeType !== 3 || node.length < 3) return false;
          const at = (i) => { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); return r.getBoundingClientRect(); };
          const a = at(0), b = at(node.length - 1);
          return a.top === b.top && a.left > b.left;
        })
        .map((span) => span.textContent),
    );
    for (const text of reversed) problems.push(`${name} ${p}: equation drawn right to left: ${text}`);
    const file = `${name}${p.replaceAll("/", "_") || "_"}.png`;
    await page.screenshot({ path: join(out, file), fullPage: true });
    console.log(`shot ${file}`);
  }
  await page.close();
}
await browser.close();
server.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("no horizontal scroll, RTL on every page, equations left to right, no page errors");
