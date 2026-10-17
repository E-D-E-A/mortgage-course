/**
 * Lesson 8.23 — training and testing: labels, out-of-sample error, the time split, the error measures.
 * Stage 8, author D. General maths on the synthetic series of drift.ts (60 months; the invented bank's spread jumps at
 * month 37). Status: "עתיד" (design); the maths is general knowledge. Everything is להדגמה.
 */
import type { LessonData } from "../build-data.ts";
import { given } from "./affordability-facts.ts";
import { diffFact, errFact, seriesFact, splitFact } from "./_drift-facts.ts";

export const ERRORS = ["-0.20", "0.10", "-0.30", "0.20"];

export default function lesson823(): LessonData {
  const facts = [
    given("n.months", "60"),
    given("n.train", "42"),
    given("n.test", "18"),
    seriesFact("s.x1", 1, "x"),
    seriesFact("s.y1", 1, "y"),
    errFact("e.mae", ERRORS, "mae"),
    errFact("e.sumabs", ERRORS, "sumabs"),
    errFact("e.msq", ERRORS, "msq"),
    errFact("e.bias", ERRORS, "bias"),
    errFact("e.rmse", ERRORS, "rmse"),
  ];
  for (const seed of [1, 2, 3, 4, 5]) {
    facts.push(splitFact(`r${seed}.spread`, { split: "random", seed }, "spread", "test", "mae"));
    facts.push(splitFact(`r${seed}.memory`, { split: "random", seed }, "memory", "test", "mae"));
  }
  facts.push(
    splitFact("r3.memory.train", { split: "random", seed: 3 }, "memory", "train", "mae"),
    splitFact("r3.spread.train", { split: "random", seed: 3 }, "spread", "train", "mae"),
    splitFact("t.spread", { split: "time" }, "spread", "test", "mae"),
    splitFact("t.memory", { split: "time" }, "memory", "test", "mae"),
    splitFact("t.memory.train", { split: "time" }, "memory", "train", "mae"),
    splitFact("t.spread.train", { split: "time" }, "spread", "train", "mae"),
    splitFact("t.memory.rmse", { split: "time" }, "memory", "test", "rmse"),
    splitFact("t.memory.bias", { split: "time" }, "memory", "test", "bias"),
    splitFact("t.spread.rmse", { split: "time" }, "spread", "test", "rmse"),
  );
  const get = (id: string) => facts.find((x) => x.id === id) as (typeof facts)[number];
  facts.push(diffFact("gap.memory", get("t.memory"), get("r3.memory")), diffFact("gap.spread", get("t.spread"), get("r3.spread")));
  return {
    lesson: "8.23",
    title: "אימון ובדיקה: תיוג, בדיקה מחוץ למדגם, פיצול לפי זמן ומדדי שגיאה",
    note: "Synthetic series (drift.ts, 60 months). General maths; all numbers are illustrative. The random split is shown for five draws; the time split is one number.",
    facts,
  };
}
