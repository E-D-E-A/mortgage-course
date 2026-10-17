/**
 * Lesson 8.24 — maintenance: drift, retraining, versions, monitoring. Stage 8, author D. Synthetic series of drift.ts:
 * an invented bank's spread over the anchor is 1.00 until month 36 and 1.25 from month 37. A model fitted on months 1–24
 * keeps believing 1.00. The alarm factor, window and retrain sizes are choices of the illustration (להדגמה).
 */
import type { LessonData } from "../build-data.ts";
import { given } from "./affordability-facts.ts";
import { DEFAULT_MONITOR } from "../../src/lib/calc/drift.ts";
import { diffFact, monitorFact } from "./_drift-facts.ts";

export default function lesson824(): LessonData {
  const facts = [
    given("spec.before", "1.00"),
    given("spec.after", "1.25"),
    given("spec.change", "37"),
    given("spec.train_to", "24"),
    given("spec.factor", "3"),
    given("spec.window", "6"),
    monitorFact("m.spread1", "spread1"),
    monitorFact("m.baseline", "baseline"),
    monitorFact("m.threshold", "threshold"),
    monitorFact("m.baseline6", "baseline6"),
    monitorFact("m.threshold6", "threshold6"),
    monitorFact("m.healthy", "v1_healthy"),
    monitorFact("m.alarm", "alarm_month"),
    monitorFact("m.delay", "delay"),
    monitorFact("m.spread2", "spread2"),
    monitorFact("m.v1after", "v1_after"),
    monitorFact("m.v2after", "v2_after"),
  ];
  for (const k of [3, 6, 12, 24]) {
    const o = { ...DEFAULT_MONITOR, retrainWindow: k };
    facts.push(monitorFact(`k${k}.spread`, "spread2", o), monitorFact(`k${k}.after`, "v2_after", o));
  }
  const get = (id: string) => facts.find((x) => x.id === id) as (typeof facts)[number];
  for (const k of [3, 6, 24]) facts.push(diffFact(`g${k}`, get("m.v1after"), get(`k${k}.after`)));
  facts.push(diffFact("m.gap", get("m.v1after"), get("m.healthy")), diffFact("m.gain", get("m.v1after"), get("m.v2after")));
  return {
    lesson: "8.24",
    title: "תחזוקה: זליגה כשמשטר הריבית משתנה, אימון מחדש, גרסאות וניטור",
    note: "Synthetic: one invented bank, one model with one number (the spread), one jump at month 37. Alarm factor 3, rolling window 6, retraining windows 3/6/12/24 are the illustration's choices, not Mogi's.",
    facts,
  };
}
