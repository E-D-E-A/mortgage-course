/**
 * Writes one data file per lesson to data/lessons/. The site, the videos and
 * the independent check all read these files, so each number has one source.
 *
 * Each lesson has its own module, scripts/lessons/lesson-<stage>-<n>.ts, whose
 * default export returns its LessonData. New lessons are picked up by name.
 *
 * Run: pnpm data
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface Fact {
  id: string;
  /** What was computed. checks/independent_check.py knows how to recompute every kind. */
  kind: string;
  inputs: Record<string, string | number>;
  value: unknown;
}

export interface LessonData {
  lesson: string;
  title: string;
  note: string;
  facts: Fact[];
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "data", "lessons");
mkdirSync(out, { recursive: true });

const lessonsDir = join(root, "scripts", "lessons");
const modules = readdirSync(lessonsDir).filter((f) => /^lesson-\d+-\d+\.ts$/.test(f)).sort();
const lessons: LessonData[] = [];
for (const file of modules) {
  const mod = (await import(join(lessonsDir, file))) as { default: () => LessonData };
  lessons.push(mod.default());
}

for (const lesson of lessons) {
  const ids = new Set<string>();
  for (const fact of lesson.facts) {
    if (ids.has(fact.id)) throw new Error(`lesson ${lesson.lesson}: duplicate fact id ${fact.id}`);
    ids.add(fact.id);
  }
  const file = join(out, `${lesson.lesson.replace(".", "-")}.json`);
  writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
  console.log(`wrote ${file} (${lesson.facts.length} facts)`);
}
