// The brief's rule "no term appears before it is explained", as a check.
//
// For every lesson page (src/pages/lessons/<stage>-<n>.mdx):
//  1. A glossary term whose lesson comes AFTER this one may appear only inside
//     <Later ...>…</Later>, which tells the learner where it will be explained.
//  2. A term this lesson introduces must appear at least once as <Term t="…">,
//     so it gets its definition and popover where it is first used.
//  3. Every <Term t="…"> must name a glossary term with a written definition.
// The lesson's video subtitles (public/video/<lesson>.he.vtt) are checked with its text.
//
// Hebrew attaches prefixes (ה, ב, ל, ו, מ, ש, כ and their combinations), so a
// term matches with any of them. Run: pnpm check:terms
import { existsSync, readFileSync, readdirSync } from "node:fs";

const glossary = JSON.parse(readFileSync(new URL("../src/data/glossary.json", import.meta.url), "utf8"));
const dir = new URL("../src/pages/lessons/", import.meta.url);
const order = (id) => id.split(".").map(Number);
const before = (a, b) => {
  const [as, al] = order(a);
  const [bs, bl] = order(b);
  return as < bs || (as === bs && al < bl);
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const HEB = "א-ת";
const prefixes = "(?:ו?(?:ש|כש|מש)?(?:ה|ב|ל|מ|כ)?)";
const patternFor = (words) =>
  new RegExp(`(?<![${HEB}])${prefixes}(?:${words.map(escape).join("|")})(?![${HEB}])`, "u");

// Everyday words that are also glossary terms, or look like a prefix plus a term
// ("כסף" = כ + "סף"). For these, only an explicit <Term> mark is checked.
const AMBIGUOUS = new Set(["משתנה", "שגיאה", "ערב", "סף", "תרחיש", "דירוג", "מנוף", "תחזית", "מדרגה", "פונקציה"]);
const IGNORED_WORDS = /(?<![\u05D0-\u05EA])[והבלמשכ]*כסף(?![\u05D0-\u05EA])/gu;

let failures = 0;
const fail = (file, msg) => {
  failures++;
  console.error(`✗ ${file}: ${msg}`);
};

for (const file of readdirSync(dir).filter((f) => /^\d+-\d+\.mdx$/.test(f))) {
  const lesson = file.replace(".mdx", "").replace("-", ".");
  // The video's subtitles are lesson text too.
  const vttPath = new URL(`../public/video/${file.replace(".mdx", "")}.he.vtt`, import.meta.url);
  const raw = readFileSync(new URL(file, dir), "utf8") + (existsSync(vttPath) ? `\n${readFileSync(vttPath, "utf8")}` : "");
  // Frontmatter, imports and code are not prose. <Later> blocks are allowed forward references.
  const prose = raw
    .replace(/^---[\s\S]*?---/, "")
    .replace(/^import .*$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<Later\b[\s\S]*?<\/Later>/g, "")
    .replace(IGNORED_WORDS, "");

  for (const [term, entry] of Object.entries(glossary)) {
    const re = patternFor([term, ...entry.forms]);
    if (!AMBIGUOUS.has(term) && before(lesson, entry.lesson) && re.test(prose)) {
      const line = prose.split("\n").find((l) => re.test(l))?.trim().slice(0, 90);
      fail(file, `uses "${term}" (explained in ${entry.lesson}) — wrap it in <Later> or rephrase. Line: ${line}`);
    }
    if (entry.lesson === lesson && !raw.includes(`<Term t="${term}"`)) {
      fail(file, `introduces "${term}" but never marks it with <Term t="${term}">`);
    }
  }
  for (const m of raw.matchAll(/<Term t="([^"]+)"/g)) {
    const entry = glossary[m[1]];
    if (!entry) fail(file, `<Term t="${m[1]}"> is not in the glossary`);
    else if (!entry.definition) fail(file, `<Term t="${m[1]}"> has no written definition in src/data/definitions.json`);
    else if (before(lesson, entry.lesson)) fail(file, `<Term t="${m[1]}"> belongs to lesson ${entry.lesson}, after this one`);
  }
}

if (failures) {
  console.error(`\n${failures} term problem(s).`);
  process.exit(1);
}
console.log("terms: every lesson uses only terms already explained, and marks the ones it introduces.");
