/** Lesson 8.26 (stage 8, author D): a lesson of principle without computed numbers; the data file holds only the date. */
import type { LessonData } from "../build-data.ts";
import { given } from "./affordability-facts.ts";

export default function lesson826(): LessonData {
  return {
    lesson: "8.26",
    title: "הסכמה, פרטיות, ומודל שפה לעולם לא מחשב",
    note: "No computed numbers. Principle and map only.",
    facts: [given("data.date", "2026-10-17")],
  };
}
