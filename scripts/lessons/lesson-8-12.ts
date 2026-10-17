/**
 * Lesson 8.12 - when a probability may be attached, and when it has no basis; a simulation does not turn an assumption into a fact.
 * LABEL: general method (maths); nothing here is a Mogi system; the models of prime's moves are INVENTED assumptions. The shares of
 * "approved applications" in the examples are SYNTHETIC counts (nobody has real approvals data; the Brain records that Eylon has
 * access to a source of many approvals whose size and coverage were not audited). Numbers: montecarlo.ts + engine.ts; rechecked by
 * checks/kinds/montecarlo.py (and schedule.py).
 */
import { DEFAULT_MODEL, type FutureModel } from "../../src/lib/calc/montecarlo.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given, givenMoney } from "./_sensitivity-facts.ts";
import { mcFact, shareFact } from "./_stage8b-facts.ts";
import { THRESHOLD, TRACK } from "./lesson-8-11.ts";

const base: FutureModel = { ...DEFAULT_MODEL, years: 15 };
export const MODELS: Record<string, FutureModel> = {
  calm: { ...base, scale: 0.5 },
  normal: base,
  wild: { ...base, scale: 2 },
  up: {
    ...base,
    primeSteps: [
      { value: "-0.50", weight: 5 },
      { value: "-0.25", weight: 10 },
      { value: "0", weight: 35 },
      { value: "0.25", weight: 30 },
      { value: "0.50", weight: 20 },
    ],
  },
};

export default function lesson812(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  add(givenMoney("t.amount", TRACK.amount as string));
  add(given("t.rate", TRACK.rate as string));
  add(given("t.years", TRACK.months / 12));
  add(givenMoney("t.threshold", THRESHOLD));
  add(mcFact("first", [TRACK], 1, 10, base, "first"));
  for (const [id, model] of Object.entries(MODELS)) {
    for (const m of ["count_at_least", "p_pct", "se_pct"] as const) add(mcFact(`m.${id}.${m}`, [TRACK], 1, 1000, model, m, THRESHOLD));
    add(mcFact(`m.${id}.mean`, [TRACK], 1, 1000, model, "mean_max"));
  }
  // Approvals: synthetic counts of similar applications (nobody has the real data).
  add(shareFact("apr.small", 15, 20));
  add(shareFact("apr.large", 150, 200));
  add(shareFact("apr.huge", 1500, 2000));

  return {
    lesson: "8.12",
    title: "מתי מותר לייחס הסתברות",
    note: "Same prime track as lesson 8.11 (300,000, 15 years, price-list rate); four invented models of prime's yearly moves; synthetic approval counts (15 of 20, 150 of 200, 1,500 of 2,000) that illustrate sample size only. Teaching assumptions.",
    facts,
  };
}
