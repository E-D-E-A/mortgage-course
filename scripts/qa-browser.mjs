// Browser checks the screenshots can't make, over the built site (run `pnpm build` first):
//  1. every half-worked table (FillTable) accepts its own right answers;
//  2. every stage check shows the score only (0 when all answers are wrong, all when all are right),
//     saves the last score and attempt, shows no pass mark, and every stage page is reachable
//     with no saved progress at all (nothing is locked);
//  3. at phone width, every fill-in table fits, every wider table shows the scroll hint,
//     and no interactive component reports a hydration mismatch.
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

// 1. Half-worked tables.
{
  const page = await browser.newPage();
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
  // No saved progress at all: the page must still be open and complete.
  page.on("pageerror", (e) => problems.push(`check ${stage}: page error: ${e.message}`));
  await page.goto(`${base}/checks/${stage}/`);
  const lockText = await page.locator("main").innerText();
  for (const word of ["עדיין סגור", "ייפתח אחרי", "עברתם", "נכשלתם", "80%", "כדי לעבור"]) {
    if (lockText.includes(word)) problems.push(`check ${stage}: the page says "${word}"`);
  }
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
      else {
        const option = q.options.find((o) => (right ? o.correct : !o.correct));
        await item.getByRole("radio", { name: option.text, exact: true }).click();
      }
    }
    await page.getByRole("button", { name: "סיימתי — לבדיקה" }).click();
    return (await page.locator(`[id^=check-${stage}-result] p`).first().textContent()).trim();
  };
  const wrong = await answer(false);
  await page.getByRole("button", { name: "לנסות שוב מההתחלה" }).click();
  const right = await answer(true);
  const resultText = await page.locator(`[id^=check-${stage}-result]`).innerText();
  for (const word of ["עברתם", "נכשלתם", "הסף", "80%", "כדי לעבור"]) {
    if (resultText.includes(word)) problems.push(`check ${stage}: the result says "${word}"`);
  }
  const saved = await page.evaluate((n) => JSON.parse(localStorage.getItem(`mogi-course:check:${n}`) || "null"), stage);
  await page.goto(`${base}/`);
  const mark = (await page.locator(`[data-check="${stage}"]`).textContent())?.trim();
  const doneVisible = await page.locator(`[data-done="${stage}"]`).isVisible();
  console.log(`check ${stage}: all wrong → ${wrong} · all right → ${right} · saved ${JSON.stringify(saved)} · map says "${mark}"`);
  if (!wrong.startsWith("0 ")) problems.push(`check ${stage}: all-wrong scored ${wrong}`);
  if (!right.startsWith(`${questions.length} `)) problems.push(`check ${stage}: all-right scored ${right}`);
  if (saved?.score !== questions.length || saved?.total !== questions.length || saved?.attempts !== 2) problems.push(`check ${stage}: last score/attempt not saved (${JSON.stringify(saved)})`);
  if (!doneVisible || !mark?.includes(`${questions.length} מתוך ${questions.length}`)) problems.push(`check ${stage}: the course map does not show the score (${mark})`);
  await page.close();
}

// 2b. Nothing is locked: with no saved progress, every stage's first lesson and check opens and shows its content.
{
  const page = await browser.newPage();
  page.on("pageerror", (e) => problems.push(`open: page error: ${e.message}`));
  await page.goto(`${base}/`);
  const hrefs = await page.locator("main ol a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  const checkLinks = [...new Set(hrefs.filter((h) => h.startsWith("/checks/")))];
  const lessons = hrefs.filter((h) => h.startsWith("/lessons/"));
  const stageFirst = new Set();
  for (const h of lessons) stageFirst.add(h.split("/")[2].split("-")[0]);
  const targets = [...checkLinks];
  for (const st of stageFirst) targets.push(lessons.find((h) => h.split("/")[2].startsWith(`${st}-`)));
  for (const h of targets) {
    await page.goto(`${base}${h}`);
    const visible = await page.locator("main .prose-lesson").first().isVisible();
    const text = await page.locator("main").innerText();
    if (!visible || text.includes("עדיין סגור")) problems.push(`open: ${h} is not reachable without progress`);
  }
  if (stageFirst.size !== stages.length) problems.push(`open: found lessons for ${stageFirst.size} stages, checks for ${stages.length}`);
  console.log(`open: ${targets.length} stage pages reachable with no saved progress`);
  await page.close();
}

// 3. Tables at phone width.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let current = "";
  page.on("console", (m) => {
    if (/hydration/i.test(m.text())) problems.push(`phone ${current}: ${m.text().slice(0, 120)}`);
  });
  page.on("pageerror", (e) => problems.push(`phone ${current}: page error: ${e.message}`));
  for (const f of lessonFiles) {
    const lesson = f.replace(".mdx", "");
    current = lesson;
    await page.goto(`${base}/lessons/${lesson}/`, { waitUntil: "networkidle" });
    for (let y = 0; y < 40000; y += 700) await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll("main .overflow-x-auto, main .overflow-auto")];
      const wide = boxes.filter((b) => b.scrollWidth > b.clientWidth + 1);
      return {
        wideWithoutHint: wide.filter((b) => {
          const island = b.closest("astro-island");
          if (island) return !island.hasAttribute("data-wide-table");
          return !(b.previousElementSibling?.classList.contains("scroll-hint") && !b.previousElementSibling.hidden);
        }).length,
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
