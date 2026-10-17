// Every <NumericExercise> must say its unit: `unit="₪"`, `unit="%"`, `unit="חודשים"` ... never absent, never "".
// A count or a percent must not silently print the shekel. Run: pnpm check:units
import { readFileSync, readdirSync } from "node:fs";

const roots = ["src/pages/lessons", "src/pages/checks", "src/pages"];
const files = [...new Set(roots.flatMap((d) => readdirSync(d, { withFileTypes: true }).filter((e) => e.isFile() && /\.mdx$/.test(e.name)).map((e) => `${d}/${e.name}`)))];

// The end of the opening tag: the first ">" outside braces and quotes.
function tagEnd(s, from) {
  let depth = 0, q = null;
  for (let i = from; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === q) q = null; }
    else if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
  }
  return s.length;
}

const bad = [];
let total = 0;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/<NumericExercise\b/g)) {
    total++;
    const tag = s.slice(m.index, tagEnd(s, m.index + m[0].length));
    const line = s.slice(0, m.index).split("\n").length;
    if (!/\bunit=/.test(tag)) bad.push([f, line, "no unit="]);
    else if (/\bunit=(""|''|\{\s*(""|'')\s*\}|\{\s*``\s*\})/.test(tag)) bad.push([f, line, 'unit=""']);
  }
}
const perFile = new Map();
for (const [f, l, why] of bad) { if (process.argv.includes("--list")) console.error(`✗ ${f}:${l} ${why}`); perFile.set(f, (perFile.get(f) ?? 0) + 1); }
if (bad.length) {
  const perStage = {};
  for (const [f] of bad) { const st = f.match(/lessons\/(\d+)-|checks\/(\d+)\.mdx/); const k = st ? st[1] ?? st[2] : "?"; perStage[k] = (perStage[k] ?? 0) + 1; }
  console.error(`check:units: ${bad.length} of ${total} NumericExercise lack a unit (per stage: ${JSON.stringify(perStage)}). Use --list for file:line.`);
  process.exit(1);
}
console.log(`check:units: ${total} NumericExercise, all with a unit.`);
