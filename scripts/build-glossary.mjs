// Builds src/data/glossary.json: every term from course/course-map.md section 3,
// the lesson that first explains it, and its definition from src/data/definitions.json.
import { readFileSync, writeFileSync } from "node:fs";

const md = readFileSync(new URL("../course/course-map.md", import.meta.url), "utf8");
const defs = JSON.parse(readFileSync(new URL("../src/data/definitions.json", import.meta.url), "utf8"));
const section = md.slice(md.indexOf("## 3. רשימת המונחים"), md.indexOf("## 4. כרטיסי"));
const terms = {};
for (const line of section.split("\n")) {
  if (!line.startsWith("**שלב")) continue;
  const body = line.slice(line.indexOf(":**") + 3);
  for (const group of body.split("·")) {
    const m = group.trim().match(/^(.*)\((\d\.\d+)\)\s*$/);
    if (!m) continue;
    const lesson = m[2];
    for (const raw of m[1].split(/,\s*/)) {
      const parenthetical = raw.match(/\(([^)]+)\)/)?.[1];
      const term = raw.replace(/\([^)]*\)/g, "").trim();
      if (!term || terms[term]) continue; // first lesson wins (later mentions are reminders)
      const d = defs[term] ?? {};
      terms[term] = {
        lesson,
        definition: d.definition ?? null,
        forms: [...(d.forms ?? []), ...(parenthetical && !/^[\d.]+$/.test(parenthetical) && !/^(מבוא|מלא|חזרה)$/.test(parenthetical) ? [parenthetical] : [])],
      };
    }
  }
}
writeFileSync(new URL("../src/data/glossary.json", import.meta.url), `${JSON.stringify(terms, null, 2)}\n`);
console.log(`glossary.json: ${Object.keys(terms).length} terms, ${Object.values(terms).filter((t) => t.definition).length} with definitions`);
