// Builds src/data/glossary.json: every term, the lesson that first explains it,
// and its plain-Hebrew definition.
//  - The terms and their lessons come from course/course-map.md, section 3.
//  - Definitions live in src/data/definitions/<lesson>.json, one file per lesson,
//    so lessons can be written in parallel without touching a shared file.
//  - A definitions file may add a term the map does not list, by giving its
//    "lesson"; the build says so, and the map is updated in the same change.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const md = readFileSync(new URL("../course/course-map.md", import.meta.url), "utf8");
const defsDir = new URL("../src/data/definitions/", import.meta.url);
const defs = {};
for (const file of readdirSync(defsDir).filter((f) => f.endsWith(".json"))) {
  for (const [term, entry] of Object.entries(JSON.parse(readFileSync(new URL(file, defsDir), "utf8")))) {
    if (defs[term]) throw new Error(`"${term}" is defined twice (${file} and another definitions file)`);
    defs[term] = { ...entry, file };
  }
}

const section = md.slice(md.indexOf("## 3. רשימת המונחים"), md.indexOf("## 4. כרטיסי"));
const terms = {};
for (const line of section.split("\n")) {
  if (!line.startsWith("**שלב")) continue;
  const body = line.slice(line.indexOf(":**") + 3);
  // A bracket after a term is either another name for it (קל״צ, IRR, נסח טאבו),
  // which becomes a form, or a note (מבוא, של בנק ישראל, חשיפה לשינויי ריבית ומדד),
  // which does not. Another name is at most two words and not a "של…" phrase.
  const isAlias = (p) =>
    !!p && !/^[\d.]+$/.test(p) && !/^(מבוא|מלא|חזרה)$/.test(p) && !p.startsWith("של ") && p.trim().split(/\s+/).length <= 2;
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
        forms: [...(d.forms ?? []), ...(isAlias(parenthetical) ? [parenthetical] : [])],
      };
    }
  }
}
for (const [term, d] of Object.entries(defs)) {
  if (terms[term]) continue;
  if (!d.lesson) throw new Error(`"${term}" (${d.file}) is not in the course map's term list; give it a "lesson" or add it to the map`);
  console.warn(`note: "${term}" is added by ${d.file} for lesson ${d.lesson} — add it to course/course-map.md section 3`);
  terms[term] = { lesson: d.lesson, definition: d.definition ?? null, forms: d.forms ?? [] };
}
writeFileSync(new URL("../src/data/glossary.json", import.meta.url), `${JSON.stringify(terms, null, 2)}\n`);
console.log(`glossary.json: ${Object.keys(terms).length} terms, ${Object.values(terms).filter((t) => t.definition).length} with definitions`);
