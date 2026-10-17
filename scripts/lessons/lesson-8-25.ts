/**
 * Lesson 8.25 — human guidance and field knowledge as a hypothesis. Stage 8, author D. Synthetic: twenty invented
 * overrides sorted by reason, and twelve invented margins in two groups (payment ratio at or below an illustrative
 * threshold, and above it). Not data, not a finding about any bank. Status: "עתיד".
 */
import type { LessonData } from "../build-data.ts";
import { groupFact, intervalFact, percentFact, totalFact } from "./_drift-facts.ts";

export const REASONS = { preference: 8, policy: 5, field: 4, mistake: 1, unclear: 2 };
export const LOW = ["1.10", "1.25", "1.15", "1.30", "1.20", "1.05"];
export const HIGH = ["1.35", "1.20", "1.45", "1.30", "1.50", "1.25"];

export default function lesson825(): LessonData {
  const counts = Object.values(REASONS);
  const facts = [
    totalFact("ov.total", counts),
    ...Object.entries(REASONS).map(([k, v]) => percentFact(`ov.${k}.pct`, v, 20)),
    groupFact("g.mean_low", LOW, HIGH, "mean_a"),
    groupFact("g.mean_high", LOW, HIGH, "mean_b"),
    groupFact("g.diff", LOW, HIGH, "diff"),
    groupFact("g.sd_low", LOW, HIGH, "sd_a"),
    groupFact("g.sd_high", LOW, HIGH, "sd_b"),
    groupFact("g.n_low", LOW, HIGH, "n_a"),
    groupFact("g.sum_low", LOW, HIGH, "sum_a"),
    groupFact("g.n_high", LOW, HIGH, "n_b"),
    intervalFact("g.step", LOW, HIGH, "step"),
    intervalFact("g.se", LOW, HIGH, "se"),
    intervalFact("g.df", LOW, HIGH, "df"),
    intervalFact("g.t", LOW, HIGH, "t"),
    intervalFact("g.low", LOW, HIGH, "low"),
    intervalFact("g.high", LOW, HIGH, "high"),
  ];
  return {
    lesson: "8.25",
    title: "הכוונה אנושית וידע מהשטח כהשערה",
    note: "Synthetic: twenty invented overrides and twelve invented margins. A claim from the field is turned into a hypothesis and checked on invented numbers; nothing is a finding about a bank.",
    facts,
  };
}
