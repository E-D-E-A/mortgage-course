/** Lesson 8.27 (stage 8, author D): a lesson of principle without computed numbers; the data file holds only the date. */
import type { LessonData } from "../build-data.ts";
import { given } from "./affordability-facts.ts";

export default function lesson827(): LessonData {
  return {
    lesson: "8.27",
    title: "כל המשתנים במקום אחד",
    note: "No computed numbers. Principle and map only.",
    facts: [given("data.date", "2026-10-17")],
  };
}
