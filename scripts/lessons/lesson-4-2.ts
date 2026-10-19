/**
 * Lesson 4.2 — obligations and disposable income: the 18-month rule, the rent
 * exception, no double counting. Every number the page, its exercises, its
 * illustration and its video show is a fact here; checks/kinds/affordability.py
 * (with household.py and common.py) recomputes each computed one.
 *
 * Case A (נועם ושירה) appears only with the numbers the course map gives: net
 * incomes 12,400 and 9,300, the car loan of 1,450 a month for 26 more months.
 * Case B (אבי ומיכל) continues from 4.1 (recognised 15,700 by the two-year
 * average; מיכל's employer loan of 400 has 10 payments left). Everyone else is
 * invented; no number here is a bank's rule or market data.
 */
import type { Obligation } from "../../src/lib/calc/affordability.ts";
import type { LessonData } from "../build-data.ts";
import { deducted, difference, disposable, given, obligationTable, placement, sum, untilDrop } from "./affordability-facts.ts";

const CAR: Obligation = { kind: "loan", monthly: "1450", monthsLeft: 26 };

export default function lesson42(): LessonData {
  const facts = [];
  const add = <T extends { id: string }>(f: T) => (facts.push(f as never), f);

  // ── Prediction: the car loan, checked 9 payments from now ──
  add(given("pred.left_now", 26));
  add(given("pred.wait", 9));
  add({ id: "pred.left_then", kind: "hh_days_left", inputs: { window_days: 26, used_days: 9 }, value: 17 });
  add(placement("pred.placement_then", { ...CAR, monthsLeft: 17 }));

  // ── Case A ──
  add(given("case.noam", "12400"));
  add(given("case.shira", "9300"));
  add(given("case.michal_declared", "8200"));
  const total = add(sum("case.total", ["12400", "9300"]));
  add(given("case.car", "1450"));
  add(given("case.car_months", 26));
  add(placement("case.car_placement", CAR));
  add(disposable("case.disposable", total.value as string, [CAR]));
  add(untilDrop("case.until_drop", 26));
  add(given("case.line", 18));

  // ── Small round examples in the explanation ──
  add(placement("rule.loan_30", { kind: "loan", monthly: "1000", monthsLeft: 30 }));
  add(placement("rule.loan_12", { kind: "loan", monthly: "1000", monthsLeft: 12 }));
  add(placement("rule.loan_18", { kind: "loan", monthly: "1000", monthsLeft: 18 }));
  add(placement("rule.loan_19", { kind: "loan", monthly: "1000", monthsLeft: 19 }));
  add(placement("rule.rent_continues", { kind: "rent", monthly: "4000", monthsLeft: 6, rentContinues: true }));
  add(placement("rule.rent_ends", { kind: "rent", monthly: "4000", monthsLeft: 30, rentContinues: false }));
  add(placement("rule.rent_ends_long", { kind: "rent", monthly: "4000", monthsLeft: 30, rentContinues: false }));
  add(given("ex1.months", 12));
  add(placement("rule.no_end", { kind: "alimony", monthly: "1500", monthsLeft: null }));

  // ── Case B: אבי ומיכל, from 4.1 ──
  const MICHAL_LOAN: Obligation = { kind: "loan", monthly: "400", monthsLeft: 10 };
  add(given("b.recognised", "15700"));
  add(given("b.loan", "400"));
  add(given("b.loan_months", 10));
  add(placement("b.loan_placement", MICHAL_LOAN));
  add(disposable("b.disposable", "15700", [MICHAL_LOAN]));
  add(given("b.rec_ntp", "15250"));
  const bNet = add(disposable("b.disposable_net", "15700", [MICHAL_LOAN]));
  const bNtp = add(given("b.disposable_ntp", "15250"));
  add(difference("b.basis_gap", bNet, bNtp));

  // ── Worked example: רוני ותמר (invented) ──
  const W: { name: string; ob: Obligation }[] = [
    { name: "ליסינג לרכב", ob: { kind: "leasing", monthly: "1900", monthsLeft: 30 } },
    { name: "הלוואה אישית", ob: { kind: "loan", monthly: "700", monthsLeft: 12 } },
    { name: "מזונות", ob: { kind: "alimony", monthly: "1800", monthsLeft: 84 } },
    { name: "שכר דירה", ob: { kind: "rent", monthly: "4500", monthsLeft: 5, rentContinues: false } },
  ];
  add(given("worked.recognised", "23400"));
  add(obligationTable("worked.table", W));
  const wDed = add(deducted("worked.deducted", W.map((x) => x.ob)));
  add(disposable("worked.disposable", "23400", W.map((x) => x.ob)));
  const W2 = W.map((x) => (x.ob.kind === "rent" ? { ...x, ob: { ...x.ob, rentContinues: true } } : x));
  const w2Ded = add(deducted("worked.deducted_invest", W2.map((x) => x.ob)));
  add(disposable("worked.disposable_invest", "23400", W2.map((x) => x.ob)));
  add(difference("worked.rent_effect", w2Ded, wDed));
  add(given("worked.leasing", "1900"));
  add(given("worked.alimony", "1800"));
  add(given("worked.rent", "4500"));

  // ── Half-worked: הדס ועומר (invented) ──
  const H: { name: string; ob: Obligation }[] = [
    { name: "הלוואת רכב", ob: { kind: "loan", monthly: "1200", monthsLeft: 40 } },
    { name: "הלוואת לימודים", ob: { kind: "loan", monthly: "300", monthsLeft: 15 } },
    { name: "ליסינג", ob: { kind: "leasing", monthly: "1600", monthsLeft: 19 } },
    { name: "מזונות", ob: { kind: "alimony", monthly: "1500", monthsLeft: null } },
    { name: "שכר דירה", ob: { kind: "rent", monthly: "3800", monthsLeft: 9, rentContinues: false } },
  ];
  add(obligationTable("half.table", H));
  add(deducted("half.deducted", H.map((x) => x.ob)));

  // ── The illustration's tasks (case A's incomes and car loan, plus one extra obligation each time) ──
  const totalA = total.value as string;
  add(disposable("task.leasing19", totalA, [CAR, { kind: "leasing", monthly: "2000", monthsLeft: 19 }]));
  add(disposable("task.leasing18", totalA, [CAR, { kind: "leasing", monthly: "2000", monthsLeft: 18 }]));
  add(disposable("task.rent_continues", totalA, [CAR, { kind: "rent", monthly: "4000", monthsLeft: 6, rentContinues: true }]));
  add(disposable("task.rent_ends", totalA, [CAR, { kind: "rent", monthly: "4000", monthsLeft: 6, rentContinues: false }]));
  add(disposable("task.alimony_unknown", totalA, [CAR, { kind: "alimony", monthly: "1500", monthsLeft: null }]));
  add(disposable("task.car_gone", totalA, []));

  // ── Exercises ──
  // 2: 16,000 recognised; a loan of 1,100 with 40 left, a loan of 600 with 10 left.
  const ex2 = [
    { kind: "loan", monthly: "1100", monthsLeft: 40 },
    { kind: "loan", monthly: "600", monthsLeft: 10 },
  ] as Obligation[];
  add(given("ex2.income", "16000"));
  add(given("ex2.loan_a", "1100"));
  add(given("ex2.months_a", 40));
  add(given("ex2.loan_b", "600"));
  add(given("ex2.months_b", 10));
  add(disposable("ex2.answer", "16000", ex2));
  add(disposable("ex2.err_both", "16000", ex2.map((o) => ({ ...o, monthsLeft: 40 }))));
  // 3: case A — payments until the car loan stops counting; the "18 or more" mistake.
  // The question avoids the edge (exactly 18 left, which is not counted): after how many payments are 17 left?
  add({ id: "ex3.answer", kind: "hh_days_left", inputs: { window_days: 26, used_days: 17 }, value: 9 });
  add(untilDrop("ex3.err_edge", 26));
  // 4: rent that goes on after the purchase.
  add(given("ex4.rent", "4000"));
  add(given("ex4.months", 6));
  // 5: net to pay already lower by an employer loan of 500 (30 left).
  add(given("ex5.ntp", "9100"));
  add(given("ex5.loan", "500"));
  add(disposable("ex5.answer", "9100", []));
  add(disposable("ex5.err_double", "9100", [{ kind: "loan", monthly: "500", monthsLeft: 30 }]));
  // 6: a mixed list.
  const ex6: Obligation[] = [
    { kind: "loan", monthly: "1700", monthsLeft: 12 },
    { kind: "leasing", monthly: "2100", monthsLeft: 36 },
    { kind: "alimony", monthly: "1600", monthsLeft: null },
    { kind: "rent", monthly: "5200", monthsLeft: 7, rentContinues: true },
  ];
  add(given("ex6.income", "25000"));
  add(given("ex6.loan", "1700"));
  add(given("ex6.loan_months", 12));
  add(given("ex6.leasing", "2100"));
  add(given("ex6.leasing_months", 36));
  add(given("ex6.alimony", "1600"));
  add(given("ex6.rent", "5200"));
  add(given("ex6.rent_months", 7));
  add(deducted("ex6.deducted", ex6));
  add(disposable("ex6.answer", "25000", ex6));
  add(disposable("ex6.err_loan", "25000", ex6.map((o) => (o.monthsLeft === 12 ? { ...o, monthsLeft: 30 } : o))));
  add(disposable("ex6.err_rent", "25000", ex6.map((o) => (o.kind === "rent" ? { ...o, rentContinues: false } : o))));
  add(disposable("ex6.err_alimony", "25000", ex6.filter((o) => o.kind !== "alimony")));

  return {
    lesson: "4.2",
    title: "התחייבויות והכנסה פנויה",
    note: "Case A uses only the course map's numbers; case B continues from 4.1; every other household is invented.",
    facts,
  };
}
