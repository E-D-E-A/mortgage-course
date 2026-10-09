/**
 * Lesson 1.6 — the participants in a mortgage deal. The lesson computes
 * nothing; its only data is the date its statements are true as of.
 * The participants and their links (the big-picture map) are content, not
 * numbers: they live in src/components/big-picture/.
 */
import type { Fact, LessonData } from "../build-data.ts";

export default function lesson16(): LessonData {
  const facts: Fact[] = [{ id: "data_date", kind: "given", inputs: {}, value: "2026-10-09" }];
  return {
    lesson: "1.6",
    title: "המשתתפים",
    note: "No computed numbers. Statements are dated as of data_date.",
    facts,
  };
}
