// Browser checks the screenshots can't make, over the built site (run `pnpm build` first):
//  1. every half-worked table (FillTable) accepts its own right answers;
//  2. every stage check scores 0 when all answers are wrong and all when all are right,
//     records the pass, and opens the next stage's mark on the home page;
//  3. at phone width, every fill-in table fits and every wider table shows the scroll hint.
// Run: pnpm qa:browser
import { createServer } from "node:http";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("../dist/", import.meta.url).pathname;
const src = new URL("../src/pages/", import.meta.url).pathname;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".vtt": "text/vtt" };
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
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

const lessonFiles = (await readdir(join(src, "lessons"))).filter((f) => f.endsWith(".mdx"));
const withFill = [];
for (const f of lessonFiles) if ((await readFile(join(src, "lessons", f), "utf8")).includes("<FillTable")) withFill.push(f.replace(".mdx", ""));
const stages = (await readdir(join(src, "checks")).catch(() => [])).filter((f) => /^\d+\.mdx$/.test(f)).map((f) => Number(f.replace(".mdx", "")));

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const problems = [];
const openAll = (page) =>
  page.addInitScript(() => {
    for (let s = 0; s < 10; s++) localStorage.setItem(`mogi-course:check:${s}`, JSON.stringify({ passed: true }));
  });

// 1. Half-worked tables.
{
  const page = await browser.newPage();
  await openAll(page);
  page.on("pageerror", (e) => problems.push(`fill: page error: ${e.message}`));
  for (const lesson of withFill) {
    await page.goto(`${base}/lessons/${lesson}/`);
    const first = page.locator("table:has(input)").first();
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await first.evaluate((t) => t.parentElement.setAttribute("data-qa-box", ""));
    const box = page.locator("[data-qa-box]");
    const inputs = await box.locator("input").count();
    await box.getByRole("button", { name: "הצגת הטבלה המלאה" }).click();
    const cells = await box.locator("td span.font-semibold").allTextContents();
    await box.getByRole("button", { name: "חזרה למילוי" }).click();
    for (let i = 0; i < inputs; i++) await box.locator("input").nth(i).fill(cells[i].replace(/[^\d.\-−]/g, ""));
    await box.getByRole("button", { name: "בדיקה" }).click();
    const ok = (await box.locator("p[aria-live]").textContent()).includes("הכול נכון");
    console.log(`fill ${lesson}: ${inputs} blanks ${ok ? "ok" : "FAILED"}`);
    if (!ok) problems.push(`fill ${lesson}: right answers not accepted`);
  }
  await page.close();
}

// 2. Stage checks.
for (const stage of stages) {
  const page = await browser.newPage();
  await page.addInitScript((n) => {
    for (let s = 0; s < n; s++) localStorage.setItem(`mogi-course:check:${s}`, JSON.stringify({ passed: true }));
  }, stage);
  page.on("pageerror", (e) => problems.push(`check ${stage}: page error: ${e.message}`));
  await page.goto(`${base}/`);
  const closedBefore = await page.locator(`[data-after-check="${stage}"]`).isVisible();
  await page.goto(`${base}/checks/${stage}/`);
  const props = JSON.parse(await page.locator("astro-island[component-url*=StageCheck]").getAttribute("props"));
  const decode = (v) =>
    Array.isArray(v) ? (v[0] === 1 ? v[1].map(decode) : v[0] === 0 && typeof v[1] === "object" ? Object.fromEntries(Object.entries(v[1]).map(([k, x]) => [k, decode(x)])) : v[1]) : v;
  const questions = decode(props.questions);
  const items = page.locator("ol > li");
  const answer = async (right) => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const item = items.nth(i);
      if (q.type === "numeric") await item.locator("input").fill(right ? String(q.answer) : "1");
      else await item.getByRole("radio").nth(right ? q.options.findIndex((o) => o.correct) : q.options.findIndex((o) => !o.correct)).click();
    }
    await page.getByRole("button", { name: "סיימתי — לבדיקה" }).click();
    return (await page.locator(`[id^=check-${stage}-result] p`).first().textContent()).trim();
  };
  const wrong = await answer(false);
  await page.getByRole("button", { name: "לנסות שוב מההתחלה" }).click();
  const right = await answer(true);
  const saved = await page.evaluate((n) => JSON.parse(localStorage.getItem(`mogi-course:check:${n}`) || "null"), stage);
  await page.goto(`${base}/`);
  const closedAfter = await page.locator(`[data-after-check="${stage}"]`).isVisible();
  console.log(`check ${stage}: all wrong → ${wrong} · all right → ${right} · pass saved ${saved?.passed === true} · next stage closed ${closedBefore} → ${closedAfter}`);
  if (!wrong.startsWith("0 ")) problems.push(`check ${stage}: all-wrong scored ${wrong}`);
  if (!right.startsWith(`${questions.length} `)) problems.push(`check ${stage}: all-right scored ${right}`);
  if (saved?.passed !== true) problems.push(`check ${stage}: pass not saved`);
  if (closedAfter) problems.push(`check ${stage}: next stage still marked closed after the pass`);
  await page.close();
}

// 3. Tables at phone width.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await openAll(page);
  for (const f of lessonFiles) {
    const lesson = f.replace(".mdx", "");
    await page.goto(`${base}/lessons/${lesson}/`, { waitUntil: "networkidle" });
    for (let y = 0; y < 40000; y += 700) await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll("main .overflow-x-auto")];
      const wide = boxes.filter((b) => b.scrollWidth > b.clientWidth + 1);
      return {
        wideWithoutHint: wide.filter((b) => !(b.previousElementSibling?.classList.contains("scroll-hint") && !b.previousElementSibling.hidden)).length,
        fillTooWide: wide.filter((b) => b.querySelector("input")).length,
      };
    });
    if (r.wideWithoutHint) problems.push(`phone ${lesson}: ${r.wideWithoutHint} wide table(s) without the scroll hint`);
    if (r.fillTooWide) problems.push(`phone ${lesson}: ${r.fillTooWide} fill-in table(s) wider than the screen`);
  }
  console.log(`phone tables: checked ${lessonFiles.length} lessons`);
  await page.close();
}

await browser.close();
server.close();
if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join("\n"));
  process.exit(1);
}
console.log("browser checks: fill-in tables, stage checks and phone tables all pass");
