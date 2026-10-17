/**
 * Lesson 8.14 - a grid search, and shrinking the space. LABEL: Mogi today has no mix search in code (the engine call is frozen); this
 * is the COURSE'S ILLUSTRATION. The grid: three kinds of track (fixed unlinked, prime, variable unlinked), shares in steps of 10%
 * of the loan, one term for all tracks (20, 25 or 30 years), for the synthetic case of stage 8 (src/data/case-s8.ts: the family's own
 * request at the fictional bank א׳ and the client's limits, which are teaching assumptions). The weights are illustration. "Best"
 * means the best weighted score among the feasible candidates THE GRID CONTAINS. Numbers: src/lib/calc/search.ts over engine.ts and
 * constraints.ts (stage-8 author A); rechecked by checks/kinds/search.py (with schedule.py and constraints.py).
 */
import Decimal from "decimal.js";
import { CASE_A, GOAL_CONTEXT } from "../../src/data/case-a-mix.ts";
import { BASE_CHOICE, LEVEL2, S8_CASE, loanOfChoice, requestOf, s8Bank } from "../../src/data/case-s8.ts";
import { rejectionReasons } from "../../src/lib/calc/constraints.ts";
import type { GridSpec, SearchContext } from "../../src/lib/calc/search.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { givenMoney } from "./_sensitivity-facts.ts";
import { c2fFact, gridFact } from "./_stage8b-facts.ts";

const choice = BASE_CHOICE;
const request = requestOf(choice);
const bank = s8Bank(choice.bank);
export const WEIGHTS = [40, 30, 30];
export const spec = (stepPercent: number): GridSpec => ({ loan: loanOfChoice(choice), kinds: [...LEVEL2.kinds], stepPercent, termsMonths: [240, 300, 360], termMode: "shared", rates: bank.prices });
export const ctx: SearchContext = {
  scenarios: GOAL_CONTEXT,
  weights: WEIGHTS,
  feasible: (c) => rejectionReasons({ id: c.id, request, tracks: c.tracks }) as string[],
};

export default function lesson814(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const cand = { id: "case", request, tracks: [] };

  add(givenMoney("loan", loanOfChoice(choice).toFixed(2)));
  // The ratio limit in shekels: the target ratio of the disposable income (recognised income less the car loan's monthly payment).
  const disposable = new Decimal(CASE_A.recognisedIncome).minus(CASE_A.car.monthly);
  add(givenMoney("cap.disposable", disposable.toFixed(2)));
  add(givenMoney("cap.ratio_limit", disposable.mul(S8_CASE.targetRatio).div(100).toFixed(2)));
  add(gridFact("full", spec(10), cand, ctx, false));
  add(gridFact("pruned", spec(10), cand, ctx, true));
  add(gridFact("s20", spec(20), cand, ctx, true));
  add(c2fFact("c2f", spec(10), cand, ctx, 20, true));

  return {
    lesson: "8.14",
    title: "חיפוש על רשת וצמצום המרחב",
    note: "Synthetic case of stage 8 (src/data/case-s8.ts): the family's own request at the fictional bank א׳; three kinds of track, 10% steps, one term of 20, 25 or 30 years. Constraints from constraints.ts (the client's limits are teaching assumptions). Weights 40/30/30 for illustration.",
    facts,
  };
}
