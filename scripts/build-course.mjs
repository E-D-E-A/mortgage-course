// Builds src/data/course.json from course/course-map.md — the approved map is
// the one source of the stages, lessons and prerequisites the site shows.
// Run: node scripts/build-course.mjs (also part of `pnpm data`).
import { readFileSync, writeFileSync } from "node:fs";

const md = readFileSync(new URL("../course/course-map.md", import.meta.url), "utf8");
const stages = [];
let stage = null;
for (const line of md.split("\n")) {
  const head = line.match(/^### שלב (\d) — (.+)$/);
  if (head) {
    stage = { id: Number(head[1]), title: head[2].trim(), goal: "", lessons: [] };
    stages.push(stage);
    continue;
  }
  if (!stage) continue;
  const goal = line.match(/^\*\*מטרה:\*\* (.+)$/);
  if (goal) stage.goal = goal[1].trim();
  const row = line.match(/^\| (\d\.\d+) \| (.+?) \| (.*?) \|/);
  if (row) {
    const [, id, cell, prereq] = row;
    const title = (cell.match(/\*\*(.+?)\*\*/)?.[1] ?? cell).replace(/[.:]$/, "").replace(/\s*★.*$/, "").trim();
    // "1.2–1.4" is a range within one stage: 1.2, 1.3, 1.4.
    const expanded = prereq.replace(/(\d+)\.(\d+)\s*[–-]\s*\1\.(\d+)/g, (_, st, a, b) =>
      Array.from({ length: Number(b) - Number(a) + 1 }, (_, i) => `${st}.${Number(a) + i}`).join(", "),
    );
    const prereqs = prereq === "—" || prereq === "הכול" ? [] : [...expanded.matchAll(/\d+\.\d+/g)].map((m) => m[0]);
    stage.lessons.push({ id, title, prereqs });
  }
}
writeFileSync(new URL("../src/data/course.json", import.meta.url), `${JSON.stringify({ stages }, null, 2)}\n`);
console.log(`course.json: ${stages.length} stages, ${stages.reduce((n, s) => n + s.lessons.length, 0)} lessons`);
