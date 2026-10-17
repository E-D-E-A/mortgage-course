/**
 * Lesson 8.6 — the decision variables in two levels: positioning the request, and the structure of the mix. A DESIGN lesson ("עתיד"):
 * the brief's formulation of the problem, not a Mogi system (no mix calculation exists in code; the engine call is frozen). The case is the
 * synthetic case (src/data/case-s8.ts): case A, with the small space of the DecisionTree illustration. The counts of that small space
 * come from countShapes / countChoices there, and are rechecked in Python by checks/kinds/stats.py (stats_shapes, stats_count_product).
 */
import { BASE_CHOICE, LEVEL1, LEVEL2, candidateOf, countChoices, countShapes, entryOf, loanOfChoice, S8_CASE } from "../../src/data/case-s8.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { measureFact } from "./_constraints-facts.ts";
import { countProduct, shapes } from "./_stats-facts.ts";
import { difference, given } from "./lesson-3-8.ts";

export default function lesson86(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);

  // ── The data that is NOT a decision: the price, the incomes, the base equity. ──
  push(given("d.price", S8_CASE.price), given("d.equity", S8_CASE.baseEquity), given("d.income1", S8_CASE.incomes[0]), given("d.income2", S8_CASE.incomes[1]), given("d.car", S8_CASE.car.monthly.toString()));
  push(given("d.loan", loanOfChoice(BASE_CHOICE).toString()), given("d.extra", "20000"));
  const loan0 = facts.find((f) => f.id === "d.loan") as Fact;
  push(difference("d.loan_after", loan0, facts.find((f) => f.id === "d.extra") as Fact));

  // ── The size of the small space. ──
  const L1 = [LEVEL1.extraEquity.length, LEVEL1.closeCar.length, LEVEL1.parent.length, LEVEL1.bank.length];
  push(countProduct("s.level1", L1), ...L1.map((n, k) => given(`s.l1_${k}`, String(n))));
  push(shapes("s.level2", LEVEL2.kinds.length, LEVEL2.shareStep, LEVEL2.years.length, countShapes(LEVEL2.kinds.length, LEVEL2.shareStep, LEVEL2.years.length)));
  push(countProduct("s.total", [countChoices(), countShapes(LEVEL2.kinds.length, LEVEL2.shareStep, LEVEL2.years.length)]));
  push(given("s.kinds", String(LEVEL2.kinds.length)), given("s.step", String(LEVEL2.shareStep)), given("s.terms", String(LEVEL2.years.length)));

  // ── Level 1 changes what level 2 has: the same mix shape (half fixed, half prime, 30 years: candidate c05) after three different positionings. ──
  const e = entryOf("c05");
  const mk = (id: string, patch: Partial<typeof BASE_CHOICE>) => candidateOf(id, { ...e.choice, ...patch }, e.shape);
  const none = mk("p0", {});
  const eq40 = mk("p1", { extraEquity: "40000" });
  const car = mk("p2", { closeCar: true });
  const parent = mk("p3", { parent: true });
  for (const [tag, c] of [["none", none], ["eq", eq40], ["car", car], ["parent", parent]] as const) {
    push(measureFact(`c.${tag}_loan`, c, "loan", 0), measureFact(`c.${tag}_pay`, c, "payment", 2), measureFact(`c.${tag}_ratio`, c, "ratio", 2), measureFact(`c.${tag}_disp`, c, "disposable", 0));
  }
  push(
    difference("c.eq_gain", facts.find((f) => f.id === "c.none_ratio") as Fact, facts.find((f) => f.id === "c.eq_ratio") as Fact),
    difference("c.car_gain", facts.find((f) => f.id === "c.none_ratio") as Fact, facts.find((f) => f.id === "c.car_ratio") as Fact),
    difference("c.parent_gain", facts.find((f) => f.id === "c.none_ratio") as Fact, facts.find((f) => f.id === "c.parent_ratio") as Fact),
  );

  // ── Exercises. ──
  push(countProduct("ex.l1", [2, 2, 2, 3]), shapes("ex.l2", 2, 10, 1, countShapes(2, 10, 1)), given("ex.extra", "30000"));
  push(difference("ex.loan", loan0, facts.find((f) => f.id === "ex.extra") as Fact));
  return { lesson: "8.6", title: "משתני ההחלטה בשתי רמות", note: "A design lesson (future): the formulation of the problem, on the synthetic case.", facts };
}
