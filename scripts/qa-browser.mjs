// Browser checks the screenshots can't make, over the built site (run `pnpm build` first):
//  1. every half-worked table (FillTable) accepts its own right answers;
//  2. every stage check shows the score only (0 when all answers are wrong, all when all are right),
//     saves the last score and attempt, shows no pass mark, and every stage page is reachable
//     with no saved progress at all (nothing is locked);
//  3. at phone width, every fill-in table fits, every wider table shows the scroll hint,
//     and no interactive component reports a hydration mismatch;
//  4. the site chrome at phone width: a sign-out link in the header, a back link on lesson and check pages,
//     (and per lesson: no sideways page scroll, every <summary> row at least 44px),
//     every lesson row on the course map a link at least 44px tall, no sideways scroll, and client-side
//     navigation that keeps the page (no full load), starts progress sync once, and still sends a signed-out
//     visitor to the sign-in page (a stand-in for the Netlify gate); signing out removes the saved answers.
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

// The public sign-in pages may load nothing from the gated /_astro/ folder except fonts.
const gatedRefs = [];
for (const f of ["login/index.html", "auth/callback/index.html"]) {
  const html = await readFile(join(root, f), "utf8");
  for (const m of html.matchAll(/\/_astro\/[\w.\-]+/g)) if (!/\.woff2?$/.test(m[0])) gatedRefs.push(`${f}: ${m[0]}`);
}

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
        pageScrolls: document.documentElement.scrollWidth > innerWidth,
        shortSummaries: [...document.querySelectorAll("main summary")].filter((e) => e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().height < 43.5).length,
      };
    });
    if (r.wideWithoutHint) problems.push(`phone ${lesson}: ${r.wideWithoutHint} wide table(s) without the scroll hint`);
    if (r.pageScrolls) problems.push(`phone ${lesson}: the page scrolls sideways`);
    if (r.shortSummaries) problems.push(`phone ${lesson}: ${r.shortSummaries} <summary> row(s) under 44px`);
    if (r.fillTooWide) problems.push(`phone ${lesson}: ${r.fillTooWide} fill-in table(s) wider than the screen`);
  }
  console.log(`phone tables: checked ${lessonFiles.length} lessons`);
  await page.close();
}

// 4. The site chrome, with a stand-in for the Netlify gate: every path but the public ones needs the cookie mc_at.
{
  let sessionCalls = 0;
  const gate = createServer(async (req, res) => {
    const url = req.url.split("?")[0];
    const cookie = req.headers.cookie ?? "";
    const publicPath = url === "/login/" || url.startsWith("/auth/") || url.startsWith("/brand/mogi-") || (url.startsWith("/_astro/") && /\.woff2?$/.test(url));
    if (url === "/auth/session" && req.method === "GET") {
      sessionCalls++;
      const b = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
      const ok = cookie.includes("mc_at=ok");
      res.writeHead(ok ? 200 : 401, { "content-type": "application/json", "cache-control": "no-store" });
      return res.end(JSON.stringify(ok ? { email: "dvir@first-edea.com", access_token: `${b({ alg: "none" })}.${b({ sub: "u1", email: "dvir@first-edea.com" })}.s` } : { error: "signed-out" }));
    }
    if (url === "/auth/logout") {
      res.writeHead(302, { location: "/login/?signed_out=1", "set-cookie": "mc_at=; Max-Age=0; Path=/" });
      return res.end();
    }
    if (!publicPath && !cookie.includes("mc_at=ok")) {
      res.writeHead(302, { location: `/login/?next=${encodeURIComponent(url)}` });
      return res.end();
    }
    let path = decodeURIComponent(url);
    if (path.endsWith("/")) path += "index.html";
    try {
      const body = await readFile(join(root, path));
      res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok) => gate.listen(0, "127.0.0.1", ok));
  const gbase = `http://127.0.0.1:${gate.address().port}`;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "he-IL" });
  await ctx.addCookies([{ name: "mc_at", value: "ok", url: gbase }]);
  const page = await ctx.newPage();
  await page.route(/supabase\.co/, (r) => r.abort());
  page.on("pageerror", (e) => problems.push(`chrome: page error: ${e.message}`));
  page.on("console", (m) => /hydration/i.test(m.text()) && problems.push(`chrome: ${m.text().slice(0, 120)}`));
  const noSideScroll = async (label) => {
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 0) problems.push(`chrome ${label}: horizontal scroll of ${over}px`);
  };

  await page.goto(`${gbase}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => (window.__keptAlive = 1));
  await noSideScroll("map");
  const logout = page.locator("header a[data-logout]");
  const lb = await logout.boundingBox();
  if (!(await logout.isVisible()) || (await logout.getAttribute("aria-label")) !== "יציאה" || (await logout.getAttribute("href")) !== "/auth/logout") problems.push("chrome: no visible sign-out link in the header");
  if (lb && (lb.height < 44 || lb.width < 44)) problems.push(`chrome: sign-out target is ${lb.width}x${lb.height}`);
  await page.waitForFunction(() => document.querySelector("[data-who]")?.textContent, null, { timeout: 5000 }).catch(() => problems.push("chrome: the signed-in email is not shown"));
  // Every lesson row of every stage is a link of at least 44px (open every stage first).
  for (const t of await page.locator(".stage-toggle").all()) if ((await t.getAttribute("aria-expanded")) !== "true") await t.click();
  await page.waitForTimeout(400);
  const rows = await page.locator("a[data-lesson]").evaluateAll((as) => as.map((a) => ({ href: a.getAttribute("href"), h: a.getBoundingClientRect().height, tag: a.tagName })));
  const short = rows.filter((r) => r.h < 43.5);
  if (rows.length < 100) problems.push(`chrome: only ${rows.length} lesson rows are links on the map`);
  if (short.length) problems.push(`chrome: ${short.length} lesson row(s) under 44px, e.g. ${short[0].href} (${short[0].h}px)`);
  console.log(`chrome: ${rows.length} lesson rows are links, shortest ${Math.min(...rows.map((r) => r.h))}px`);
  await noSideScroll("map, all stages open");

  // Client-side navigation: map -> lesson (no full load), back link -> stage, glossary and its back link.
  await page.goto(`${gbase}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => (window.__keptAlive = 1));
  await page.locator('a[href="/lessons/0-2/"]').first().click();
  await page.waitForSelector(".prose-lesson");
  if (!(await page.evaluate(() => window.__keptAlive === 1))) problems.push("chrome: the click on a lesson row reloaded the whole page");
  const back = page.locator("a.back-link").first();
  if (!(await back.isVisible()) || (await back.getAttribute("href")) !== "/#stage-0") problems.push(`chrome: lesson page back link is ${await back.getAttribute("href")}`);
  await noSideScroll("lesson");
  const lessonLinks = await page.locator('nav[aria-label="שיעור קודם והבא"] a').count();
  if (lessonLinks < 3) problems.push(`chrome: previous/next/back links at the end of a lesson: ${lessonLinks}`);
  await page.locator('a[href="/glossary/"]').first().click();
  await page.waitForSelector("dl");
  await noSideScroll("glossary");
  await page.locator('a[data-back="history"]').click();
  await page.waitForSelector(".prose-lesson");
  if (!page.url().endsWith("/lessons/0-2/")) problems.push(`chrome: the glossary back link went to ${page.url()}`);
  await back.click();
  await page.waitForSelector("[data-course-map]");
  const stageOpen = await page.evaluate(() => {
    const el = document.getElementById("stage-0");
    const r = el.getBoundingClientRect();
    return { open: el.dataset.open, inView: r.top < innerHeight && r.bottom > 0, lessons: el.querySelector("a[data-lesson]").getBoundingClientRect().height > 0 };
  });
  if (!page.url().endsWith("/#stage-0") || stageOpen.open !== "true" || !stageOpen.inView || !stageOpen.lessons) problems.push(`chrome: the back link did not land on an open stage 0 (${page.url()} ${JSON.stringify(stageOpen)})`);
  await page.goto(`${gbase}/checks/0/`, { waitUntil: "networkidle" });
  if ((await page.locator("a.back-link").first().getAttribute("href")) !== "/#stage-0") problems.push("chrome: the check page has no back link to its stage");
  // One sync start for the whole visit, however many pages were shown.
  await page.goto(`${gbase}/`, { waitUntil: "networkidle" });
  await page.locator('a[href="/lessons/0-1/"]').first().click();
  await page.waitForSelector(".prose-lesson");
  await page.locator('nav[aria-label="שיעור קודם והבא"] a[href^="/lessons/"]').last().click();
  await page.waitForFunction(() => location.pathname === "/lessons/0-2/");
  await page.waitForTimeout(800);
  // No session was stored at the start, so sync fetched it from the server once; every later page reused it.
  if (sessionCalls !== 1) problems.push(`chrome: ${sessionCalls} GET /auth/session calls over a whole visit (expected 1)`);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mogi-course:sb-session") || "null"));
  if (!stored?.access_token || "refresh_token" in stored) problems.push(`chrome: the stored session is ${JSON.stringify(stored)}`);
  console.log(`chrome: ${sessionCalls} /auth/session call for a visit of many pages`);

  // Signed out in the middle of a visit: a client-side click still ends at the sign-in page.
  await ctx.clearCookies();
  await page.locator('a[href="/lessons/0-3/"]').first().click().catch(() => {});
  await page.goto(`${gbase}/`).catch(() => {});
  await page.waitForURL(/\/login\//, { timeout: 5000 }).catch(() => problems.push(`chrome: a signed-out visitor did not reach the sign-in page (${page.url()})`));
  if (!(await page.locator("#google").isVisible().catch(() => false))) problems.push("chrome: the sign-in page does not show its button");

  // Signing out removes the session and this person's saved answers from the browser.
  await ctx.addCookies([{ name: "mc_at", value: "ok", url: gbase }]);
  await page.goto(`${gbase}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem("mogi-course:exercise:x", "1");
    localStorage.setItem("mogi-course:sb-session", "{}");
  });
  await page.locator("header a[data-logout]").click();
  await page.waitForURL(/signed_out=1/);
  const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("mogi-course:")));
  if (left.length) problems.push(`chrome: sign-out left ${left.join(", ")} in the browser`);
  await ctx.close();
  gate.close();
}

await browser.close();
server.close();
for (const g of gatedRefs) problems.push(`public page loads a gated file: ${g}`);
if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join("\n"));
  process.exit(1);
}
console.log("browser checks: fill-in tables, stage checks and phone tables all pass");
