/**
 * Lesson 8.7 — the data, the hard constraints and a feasible solution. A DESIGN lesson ("עתיד"): a teaching model of how an algorithm could
 * keep only candidates that obey the rules; no such filter exists in Mogi's code today. The numbers come from src/lib/calc/constraints.ts
 * on the synthetic case (src/data/case-s8.ts), rechecked by checks/kinds/constraints.py (independent) and regulation.py.
 * The lines of Directive 329 are the team's transcription (not checked against the directive); the bank lines are INVENTED (stage 6's
 * fictional banks); the client's limits are teaching assumptions.
 */
import { CANDIDATES, S8_CASE, candidateById } from "../../src/data/case-s8.ts";
import { evaluate } from "../../src/lib/calc/constraints.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { maxLoanAt, maxPaymentAt, maxVariable, minFixed } from "../../src/lib/calc/regulation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { feasibleCountFact, measureFact, reasonsFact } from "./_constraints-facts.ts";
import { difference, given } from "./lesson-3-8.ts";
import { countProduct, intDiff } from "./_stats-facts.ts";

export default function lesson87(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);

  push(given("k.price", S8_CASE.price), given("k.max_pay", S8_CASE.maxPayment), given("k.target", S8_CASE.targetRatio));
  push(countProduct("k.n", [CANDIDATES.length]));

  // ── Every candidate: its reasons, and (for four of them) the numbers the checks read. ──
  for (const c of CANDIDATES) push(reasonsFact(`r.${c.id}`, c));
  for (const id of ["c01", "c03", "c07", "c09", "c11"]) {
    const c = candidateById(id);
    push(measureFact(`m.${id}_ratio`, c, "ratio", 2), measureFact(`m.${id}_pay`, c, "payment", 0), measureFact(`m.${id}_ltv`, c, "ltv", 2), measureFact(`m.${id}_var`, c, "variable_percent", 1), measureFact(`m.${id}_loan`, c, "loan", 0));
  }
  push(measureFact("m.c09_disp", candidateById("c09"), "disposable", 0), measureFact("m.c01_disp", candidateById("c01"), "disposable", 0));
  push(measureFact("m.c05_ratio", candidateById("c05"), "ratio", 2), measureFact("m.c05_pay", candidateById("c05"), "payment", 0));
  push(measureFact("m.c10_ltv", candidateById("c10"), "ltv", 2));
  push(measureFact("m.c06_ratio", candidateById("c06"), "ratio", 2), measureFact("m.c06_pay", candidateById("c06"), "payment", 0));

  push(difference("m.c07_margin", facts.find((f) => f.id === "k.target") as Fact, facts.find((f) => f.id === "m.c07_ratio") as Fact));

  // ── How many pass, as families of constraints are switched on. ──
  push(
    feasibleCountFact("f.identity", CANDIDATES, ["identity"]),
    feasibleCountFact("f.law", CANDIDATES, ["identity", "law"]),
    feasibleCountFact("f.bank", CANDIDATES, ["identity", "law", "bank"]),
    feasibleCountFact("f.all", CANDIDATES),
  );
  const feasibleN = CANDIDATES.filter((c) => evaluate(c).feasible).length;
  push(intDiff("f.rejected", CANDIDATES.length, feasibleN));

  // ── The limits as numbers (regulation.ts, recomputed by regulation.py). ──
  const maxLoan = { id: "lim.max_loan", kind: "reg_max_loan", inputs: { value: S8_CASE.price, deal: "only_home" }, value: moneyString(maxLoanAt(S8_CASE.price, "only_home")) } as Fact;
  push(maxLoan, { id: "lim.max_var", kind: "reg_max_variable", inputs: { loan: "1640000" }, value: moneyString(maxVariable("1640000")) } as Fact);
  push({ id: "lim.max_pay40", kind: "reg_max_payment", inputs: { income: "20250.00", percent: "40" }, value: moneyString(maxPaymentAt("20250", "40")) } as Fact);
  push({ id: "lim.max_pay50", kind: "reg_max_payment", inputs: { income: "20250.00", percent: "50" }, value: moneyString(maxPaymentAt("20250", "50")) } as Fact);
  // ── Exercises. ──
  push({ id: "ex.max_loan", kind: "reg_max_loan", inputs: { value: "2000000", deal: "only_home" }, value: moneyString(maxLoanAt("2000000", "only_home")) } as Fact);
  push({ id: "ex.max_var", kind: "reg_max_variable", inputs: { loan: "1200000" }, value: moneyString(maxVariable("1200000")) } as Fact);
  push({ id: "ex.max_loan_repl", kind: "reg_max_loan", inputs: { value: "2000000", deal: "replacement" }, value: moneyString(maxLoanAt("2000000", "replacement")) } as Fact);
  push({ id: "ex.min_fixed", kind: "reg_min_fixed", inputs: { loan: "1200000" }, value: moneyString(minFixed("1200000")) } as Fact);
  push(given("ex.price", "2000000"), given("ex.loan", "1200000"));
  return { lesson: "8.7", title: "הנתונים, האילוצים הקשיחים ופתרון אפשרי", note: "A design lesson (future): a teaching model of the filter on the synthetic case.", facts };
}
