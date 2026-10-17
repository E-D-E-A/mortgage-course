/**
 * Lesson 8.10 - three different forecasts: by Directive 451, a stress scenario, and a macro forecast. LABEL: Mogi today has no mix
 * calculation in code. Decided (Brain calculation-rules page, Eylon 2026-10-07): the pre-approval figures use the Bank of Israel's
 * dedicated forecast inputs for Directive 451 and not the macro forecast or a flat inflation; the data-connections page (Oct 2026)
 * keeps stress scenarios separate. The curves are ILLUSTRATIVE (src/data/curves.ts); the stress shocks are the course's
 * (case-a-mix.ts SCENARIOS.stress); the macro table is INVENTED (scenarios.ts MACRO). Numbers: scenarios.ts over engine.ts;
 * rechecked by checks/kinds/scenarios.py (which also recomputes the 451 route a second way, through forecast.py).
 */
import { CANDIDATES, INITIAL_MIX, PRIME_TODAY, candidate } from "../../src/data/case-a-mix.ts";
import { MACRO } from "../../src/lib/calc/scenarios.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { scnEvalFact, scnPathFact } from "./_stage8b-facts.ts";

export const SIDS = ["forecast451", "stress", "macro"] as const;
export const YEARS = 10;
export const MIXES = { initial: INITIAL_MIX, linked: candidate("linked").tracks } as const;

export default function lesson810(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  add(given("prime.today", PRIME_TODAY));
  for (const sid of SIDS) {
    add(scnPathFact(`path.prime.${sid}`, sid, "prime", YEARS, PRIME_TODAY));
    add(scnPathFact(`path.infl.${sid}`, sid, "inflation", YEARS, PRIME_TODAY));
  }
  MACRO.policy.forEach((p, y) => add(given(`macro.policy_${y + 1}`, p)));
  MACRO.inflation.forEach((p, y) => add(given(`macro.infl_${y + 1}`, p)));
  for (const [mid, tracks] of Object.entries(MIXES)) {
    for (const sid of SIDS) {
      for (const meas of ["first", "max", "max_month", "total"] as const) add(scnEvalFact(`${mid}.${sid}.${meas}`, sid, tracks, meas));
    }
  }
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  add(difference("initial.stress_gap", get("initial.stress.max"), get("initial.forecast451.max")));
  add(difference("initial.macro_gap", get("initial.forecast451.max"), get("initial.macro.max")));
  add(difference("initial.total_gap", get("initial.stress.total"), get("initial.forecast451.total")));
  add(difference("linked.total_gap", get("linked.stress.total"), get("linked.forecast451.total")));
  void CANDIDATES;
  void givenMoney;

  return {
    lesson: "8.10",
    title: "שלוש תחזיות שונות",
    note: "Illustrative zero curves (src/data/curves.ts, version A); the course's stress shocks (case-a-mix.ts); an invented macro table (scenarios.ts). Case A's initial mix and the 'linked' mix of lesson 5.6. Teaching assumptions, never forecasts of the market.",
    facts,
  };
}
