/**
 * Lesson 0.10 — the Bank of Israel and its rate. Every number the lesson, its
 * exercises and its video show is declared here as a fact; the page and the
 * video read data/lessons/0-10.json, and checks/kinds/lending.py recomputes each
 * computed one.
 *
 * The 2026 decisions are data, not teaching numbers. They come from
 * research/notes/official-sources.md §6 (2026-10-09): search-index summaries of
 * Bank of Israel press releases, NOT read from the releases themselves. Each is
 * shown as "לא אומת". The 3.75% decision of 2026-05-25 rests on a single summary.
 * The 2026-09-01 date is the release's own wording; the schedule lists 31 August.
 * The prime is arithmetic: the rate plus 1.5 percentage points (BoI explainer,
 * also from a search summary).
 */
import { PRIME_ADDITION, primeFromPolicy, rateAfterCuts, rateChange, ratePath, relativeDrop, relativeDropOnNew } from "../../src/lib/calc/lending.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import Decimal from "decimal.js";
import type { Fact, LessonData } from "../build-data.ts";

const prime = (id: string, policy: string): Fact => ({
  id,
  kind: "lend_prime",
  inputs: { policy_rate: policy, addition: PRIME_ADDITION },
  value: plainNumber(primeFromPolicy(policy)),
});

const drop = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_rate_drop",
  inputs: { before, after },
  value: plainNumber(new Decimal(before).minus(after)),
});

const relDrop = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_relative_drop",
  inputs: { before, after },
  value: plainNumber(relativeDrop(before, after)),
});

const relDropOnNew = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_relative_drop_on_new",
  inputs: { before, after },
  value: plainNumber(relativeDropOnNew(before, after)),
});

const change = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_rate_change",
  inputs: { before, after },
  value: plainNumber(rateChange(before, after)),
});

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

/** The rate in force when 2026 began: set on 2025-11-24 (official-sources.md §6). */
const START = "4.25";
/** The 2026 decisions recorded in official-sources.md §6, rate after each decision. */
const DECISIONS = [
  { date: "2026-01-05", rate: "4" },
  { date: "2026-02-23", rate: "4" },
  { date: "2026-03-30", rate: "4" },
  { date: "2026-05-25", rate: "3.75" },
  { date: "2026-07-06", rate: "3.5" },
  { date: "2026-09-01", rate: "3.25" },
];

const path = (id: string, start: string, decisions: { date: string; rate: string }[]): Fact => ({
  id,
  kind: "lend_rate_path",
  inputs: {
    start,
    addition: PRIME_ADDITION,
    ...Object.fromEntries(decisions.flatMap((d, n) => [[`date_${n + 1}`, d.date], [`rate_${n + 1}`, d.rate]])),
  },
  value: ratePath(start, decisions).map((r, n) => ({
    period: n + 1,
    date: r.date,
    before: plainNumber(r.before),
    rate: plainNumber(r.rate),
    change: plainNumber(r.change),
    prime: plainNumber(r.prime),
  })),
});

export default function lesson010(): LessonData {
  const current = DECISIONS[DECISIONS.length - 1].rate;
  const facts: Fact[] = [
    given("decision.start", START),
    given("decision.start_date", "2025-11-24"),
    given("decision.current", plainNumber(current)),
    given("decision.current_date", "2026-09-01"),
    given("decision.effective_date", "2026-09-03"),
    given("decision.schedule_date", "2026-08-31"),
    given("decision.upcoming", ["2026-10-21", "2026-11-23"]),
    given("decision.count", "8"),
    given("decision.data_date", "2026-10-09"),
    given("prime.addition", PRIME_ADDITION),
    given("target.low", "1"),
    given("target.high", "3"),
    path("timeline.path", START, DECISIONS),
    prime("prime.current", current),
    drop("year.drop", START, current),
    change("year.change", START, current),
    relDrop("year.relative_drop", START, current),

    // Exercises.
    drop("ex2.wrong_subtract", current, PRIME_ADDITION),
    drop("ex4.answer", "4", "3.5"),
    change("ex4.signed", "4", "3.5"),
    relDrop("ex4.relative", "4", "3.5"),
    // Exercise 5: invented rates, 4.5% to 3.6% (not the 2026 numbers the lesson already shows).
    relDrop("ex5.answer", "4.5", "3.6"),
    drop("ex5.points", "4.5", "3.6"),
    relDropOnNew("ex5.on_new", "4.5", "3.6"),
    {
      id: "ex6.rate",
      kind: "lend_rate_after_cuts",
      inputs: { start: current, cut: "0.25", count: 2 },
      value: plainNumber(rateAfterCuts(current, "0.25", 2)),
    },
    {
      id: "ex6.answer",
      kind: "lend_prime_after_cuts",
      inputs: { start: current, cut: "0.25", count: 2, addition: PRIME_ADDITION },
      value: plainNumber(primeFromPolicy(rateAfterCuts(current, "0.25", 2))),
    },
    {
      id: "ex6.one_cut",
      kind: "lend_prime_after_cuts",
      inputs: { start: current, cut: "0.25", count: 1, addition: PRIME_ADDITION },
      value: plainNumber(primeFromPolicy(rateAfterCuts(current, "0.25", 1))),
    },
  ];

  return {
    lesson: "0.10",
    title: "בנק ישראל וריבית בנק ישראל",
    note: "The 2026 decisions are from search-index summaries of Bank of Israel releases (official-sources.md §6, 2026-10-09), not yet read from the releases. Prime = rate + 1.5 points is arithmetic.",
    facts,
  };
}
