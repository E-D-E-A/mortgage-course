/**
 * Lesson 8.8 - preferences and weights; feasible versus optimal. Objective functions, normalising, weights, the weighted
 * score, and the difference between a feasible candidate and an optimal one. LABEL: the three goals are Mogi's design (the
 * Brain's mix-construction page); the weights, the 4-decimal normalisation and the score are the COURSE'S ILLUSTRATION
 * ("for illustration"), not a Mogi decision and not a bank's policy. Candidates: case A's seven stage-5 mixes (the same loan,
 * the course's price list); feasible = passes Directive 329 as the team transcribed it (case-a-mix.ts caseAPasses).
 * Numbers: objectives.ts over engine.ts; rechecked by checks/kinds/objectives.py (with sensitivity.py/schedule.py).
 */
import Decimal from "decimal.js";
import { CANDIDATES, CASE_A, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { ltvPercent } from "../../src/lib/calc/ltv.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, givenMoney, tableFact } from "./_sensitivity-facts.ts";
import { mulFact, normRows, objLatticeFact, objNormFact, objTableFact, sumFact, type TableRow } from "./_stage8b-facts.ts";

export const WEIGHT_SETS = { bal: [40, 30, 30], pay: [70, 15, 15], tot: [15, 70, 15], stab: [15, 15, 70] } as const;
export const THREE = ["half", "linked", "short"] as const;

export default function lesson88(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  const price = add(givenMoney("a.price", CASE_A.price));
  const equity = add(givenMoney("a.equity", CASE_A.equity));
  add(difference("a.loan", price, equity));
  add({ id: "a.ltv", kind: "ltv_percent", inputs: { loan: CASE_A.loan, value: CASE_A.price }, value: percentString(ltvPercent(CASE_A.loan, CASE_A.price)) });

  const table = add(tableFact("cand.table", CANDIDATES, SCENARIOS.base, SCENARIOS.stress));
  const rows = table.value as (TableRow & { passes: string })[];
  const allowed = rows.filter((r) => r.passes === "yes").map((r) => r.id);
  const everyone = rows.map((r) => r.id);
  const tr = rows as TableRow[];

  for (const [k, w] of Object.entries(WEIGHT_SETS)) add(objTableFact(`tbl.${k}`, "cand.table", tr, allowed, [...w]));
  // Forgetting the limits: every candidate counts and the scale is taken over all seven.
  add(objTableFact("tbl.bal_free", "cand.table", tr, everyone, [...WEIGHT_SETS.bal]));
  // Another set of candidates searched: "linked" is not in it.
  add(objTableFact("tbl.bal_drop", "cand.table", tr, allowed.filter((x) => x !== "linked"), [...WEIGHT_SETS.bal]));
  // Doubling every weight changes nothing.
  add(objTableFact("tbl.bal_x2", "cand.table", tr, allowed, WEIGHT_SETS.bal.map((x) => x * 2)));
  add(objLatticeFact("lat.10", "cand.table", tr, allowed, 10));

  // By hand: three candidates, one column at a time.
  const three = THREE.map((id) => rows.find((r) => r.id === id) as TableRow);
  add(objNormFact("norm.first", three.map((r) => r.first)));
  add(objNormFact("norm.total", three.map((r) => r.total)));
  add(objNormFact("norm.rise", three.map((r) => r.rise)));
  const t3 = add(objTableFact("tbl.three", "cand.table", tr, [...THREE], [...WEIGHT_SETS.bal]));
  const half = (t3.value as ReturnType<typeof normRows>).find((r) => r.id === "half");
  if (!half) throw new Error("no half");
  const [wf, wt, we] = WEIGHT_SETS.bal;
  const p1 = add(mulFact("hand.p1", half.n_first, wf));
  const p2 = add(mulFact("hand.p2", half.n_total, wt));
  const p3 = add(mulFact("hand.p3", half.n_exposure, we));
  add(sumFact("hand.sum", [p1.value as string, p2.value as string, p3.value as string], 100));

  return {
    lesson: "8.8",
    title: "העדפות ומשקולות",
    note: "Case A's seven stage-5 candidates (src/data/case-a-mix.ts), the course's price list, the base and stress scenarios of lesson 5.6. Goals: Mogi's design (Brain J-090); weights, 4-decimal min-max normalisation and the weighted score are the course's illustration. Feasible = passes Directive 329 as the team transcribed it (unverified).",
    facts,
  };
}
