// No learner-visible internal reference. Scans the TEXT of the built pages (lessons, stage checks, glossary,
// home) and fails when a learner could read an internal id, ticket, file name, path or process word.
// Ignored: <script>, <style>, HTML comments and attribute values (props, hrefs, ids are not read by a learner).
// Run after `pnpm build`:  pnpm check:refs   (add --quiet for the per-stage summary only)
import { existsSync, readFileSync, readdirSync } from "node:fs";

const dist = new URL("../dist/", import.meta.url).pathname;
if (!existsSync(dist)) {
  console.error("check:refs: dist/ is missing; run `pnpm build` first.");
  process.exit(2);
}

const RULES = [
  ["FK-", /FK-[A-Za-z0-9]/],
  ["J-code", /(?<![A-Za-z0-9_$])J\d+(?![:\d$])/],
  ["DEC-n", /DEC-\d/],
  ["Brain", /Brain/],
  ["ENG-n", /ENG-\d/],
  ["BIR_MRTG", /BIR_MRTG/],
  ["ריפו", /ריפו/],
  ["repo", /\brepo\b/i],
  ["commit", /\bcommit/i],
  ["path", /(?<![A-Za-z0-9])(?:research|src|context|course|qa-reports|scripts)\/[\w.\-]/],
  ["file name", /[\w\-]+\.(?:md|ts|tsx|mdx|pdf|json|mjs|py|vtt)(?![\w])/i],
  ["הבריף", /הבריף/],
  ["מפת הקורס מבטיחה", /מפת הקורס מבטיחה/],
  // No real person's name in learner-visible text (decided 2026-10-18); roles only: מומחה השטח, הצוות, בנקאי בשטח.
  ["real name (אילון)", /(?<![א-ת])[ובלמשכה]{0,3}אילון(?![א-ת])/],
  ["real name (עדן)", /(?<!גן )(?<![א-ת])[ובלמשכה]{0,3}עדן(?![א-ת])/],
  ["real name (דביר)", /(?<![א-ת])[ובלמשכה]{0,3}דביר(?![א-ת])/],
  ["real name (Latin)", /\b(?:Eylon|Eden|Dvir|Amit)\b/],
  ["LibreOffice", /LibreOffice/i],
  ["טבלת האותיות של הקורס", /טבלת האותיות של הקורס/],
  ["האתר חסום בסביבה", /האתר חסום בסביבה/],
];

function textOf(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ") // a tag, with all its attribute values
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/\s+/g, " ");
}

const pages = [];
const addDir = (sub) => {
  const d = dist + sub;
  if (!existsSync(d)) return;
  for (const name of readdirSync(d, { withFileTypes: true })) {
    if (name.isDirectory() && existsSync(`${d}/${name.name}/index.html`)) pages.push([`${sub}/${name.name}`, `${d}/${name.name}/index.html`]);
  }
};
addDir("lessons");
addDir("checks");
if (existsSync(dist + "glossary/index.html")) pages.push(["glossary", dist + "glossary/index.html"]);
if (existsSync(dist + "index.html")) pages.push(["home", dist + "index.html"]);

// Subtitles are spoken text: the same rules apply to public/video/*.he.vtt.
const vttDir = new URL("../public/video/", import.meta.url).pathname;
const vtts = existsSync(vttDir) ? readdirSync(vttDir).filter((f) => f.endsWith(".he.vtt")) : [];

const stageOf = (key) => {
  const m = key.match(/^lessons\/(\d+)-|^checks\/(\d+)$/);
  return m ? `stage ${m[1] ?? m[2]}` : "site (home, glossary)";
};

const quiet = process.argv.includes("--quiet");
const perStage = new Map();
const perRule = new Map();
let total = 0;
for (const [key, file] of pages) {
  const text = textOf(readFileSync(file, "utf8"));
  const lines = [];
  for (const [name, re] of RULES) {
    const g = new RegExp(re.source, re.flags.includes("i") ? "gi" : "g");
    for (const m of text.matchAll(g)) {
      total++;
      perStage.set(stageOf(key), (perStage.get(stageOf(key)) ?? 0) + 1);
      perRule.set(name, (perRule.get(name) ?? 0) + 1);
      const a = Math.max(0, m.index - 40);
      lines.push(`  [${name}] …${text.slice(a, m.index + m[0].length + 40)}…`);
    }
  }
  if (lines.length && !quiet) console.error(`✗ ${key}/index.html (${lines.length})\n${lines.join("\n")}`);
}

const NAME_RULES = RULES.filter(([name]) => name.startsWith("real name"));
let vttTotal = 0;
for (const f of vtts) {
  const text = readFileSync(vttDir + f, "utf8");
  for (const [name, re] of NAME_RULES) {
    for (const m of text.matchAll(new RegExp(re.source, "g"))) {
      vttTotal++;
      const a = Math.max(0, m.index - 40);
      console.error(`✗ public/video/${f} [${name}] …${text.slice(a, m.index + m[0].length + 40).replace(/\s+/g, " ")}…`);
    }
  }
}
total += vttTotal;

const order = [...perStage.keys()].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
if (total) {
  console.error(`\ncheck:refs: ${total} learner-visible internal references in ${pages.length} pages (${vttTotal} in subtitles).`);
  for (const s of order) console.error(`  ${s}: ${perStage.get(s)}`);
  console.error(`  by kind: ${[...perRule].map(([k, v]) => `${k} ${v}`).join(", ")}`);
  process.exit(1);
}
console.log(`check:refs: ${pages.length} pages, no learner-visible internal reference, no real name (${vtts.length} subtitle files checked).`);
