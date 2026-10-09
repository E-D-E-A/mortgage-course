/**
 * Writes one data file per lesson to data/lessons/. The site, the videos and
 * the independent check all read these files, so each number has one source.
 *
 * Run: pnpm data
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lesson03 } from "./lessons/lesson-0-3.ts";

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

for (const lesson of [lesson03()]) {
  const ids = new Set<string>();
  for (const fact of lesson.facts) {
    if (ids.has(fact.id)) throw new Error(`lesson ${lesson.lesson}: duplicate fact id ${fact.id}`);
    ids.add(fact.id);
  }
  const file = join(out, `${lesson.lesson.replace(".", "-")}.json`);
  writeFileSync(file, `${JSON.stringify(lesson, null, 2)}\n`);
  console.log(`wrote ${file} (${lesson.facts.length} facts)`);
}
