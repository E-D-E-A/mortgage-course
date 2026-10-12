/**
 * Lesson 4.3 — the payment-to-income ratio: which payment goes in, where
 * obligations go, the same-property rule and moving a mortgage (גרירה). Every
 * number the page, its exercises, its checker and its video show is a fact
 * here; checks/kinds/affordability.py (with household.py and common.py)
 * recomputes each computed one.
 *
 * Case B (אבי ומיכל) continues from 4.1–4.2. Its payment rests on the course's
 * calculation assumption from scripts/case_sketch.py: 1,130,000 ₪ for 25 years,
 * half at 4.6% and half at 4.1%, level payments (שפיצר) — not an offer and not
 * market data. Case A does not appear here (no payment before stage 5). Every
 * other household and loan is invented.
 */
import type { Obligation } from "../../src/lib/calc/affordability.ts";
import type { LessonData } from "../build-data.ts";
import { added, difference, disposable, given, payment, qualifying, ratio, ratioFromParts, ratioTable, sum } from "./affordability-facts.ts";

export default function lesson43(): LessonData {
  const facts = [];
  const add = <T extends { id: string }>(f: T) => (facts.push(f as never), f);

  // ── Small numbers first ──
  add(ratio("small.ratio", "3000", "10000"));
  add(given("small.payment", "3000"));
  add(given("small.disposable", "10000"));
  // Where an obligation of 1,000 goes: off the income (the rule) or onto the payment (an older text).
  const LOAN: Obligation = { kind: "loan", monthly: "1000", monthsLeft: 30 };
  const smallDisp = add(disposable("small.disp_after", "10000", [LOAN]));
  add(ratio("small.ratio_denominator", "3000", smallDisp.value as string));
  const smallNum = add(sum("small.numerator", ["3000", "1000"]));
  add(ratio("small.ratio_numerator", smallNum.value as string, "10000"));

  // ── Which payment ──
  add(qualifying("grace.after", { amount: "1000000", ratePercent: "4.5", months: 300, graceMonths: 12 }));
  add(qualifying("grace.during", { amount: "1000000", ratePercent: "4.5", months: 300, bullet: true }));
  add(qualifying("bullet.interest", { amount: "400000", ratePercent: "5", months: 120, bullet: true }));

  // ── Case B ──
  const t1 = add(qualifying("b.track1", { amount: "565000", ratePercent: "4.6", months: 300 }));
  const t2 = add(qualifying("b.track2", { amount: "565000", ratePercent: "4.1", months: 300 }));
  const bPay = add(sum("b.payment", [t1.value as string, t2.value as string]));
  add(given("b.loan", "1130000"));
  add(given("b.half", "565000"));
  add(given("b.declared", "19200"));
  add(given("b.recognised", "15700"));
  add(given("b.recognised_latest", "16200"));
  add(given("b.recognised_ntp", "15250"));
  const P = bPay.value as string;
  const rDecl = add(ratio("b.ratio_declared", P, "19200"));
  const rRec = add(ratio("b.ratio_recognised", P, "15700"));
  add(ratio("b.ratio_latest", P, "16200"));
  add(ratio("b.ratio_ntp", P, "15250"));
  add({ ...difference("b.ratio_gap", rRec, rDecl) });

  // The checker's tasks, on case B (income lines 7,500 + 8,200; מיכל's loan of 400 with 10 payments left does not count).
  const BLOAN: Obligation = { kind: "loan", monthly: "400", monthsLeft: 10 };
  add(given("t.income_avi_latest", "8000"));
  add(given("t.income_avi_declared", "11000"));
  add(given("t.income_michal", "8200"));
  add(ratioFromParts("t.same", "15700", [BLOAN, { kind: "mortgage", monthly: "1000", monthsLeft: 120, mortgage: "same_property" }], P));
  add(ratioFromParts("t.other", "15700", [BLOAN, { kind: "mortgage", monthly: "1000", monthsLeft: 120, mortgage: "other_property" }], P));
  add(ratioFromParts("t.short", "15700", [BLOAN, { kind: "mortgage", monthly: "1000", monthsLeft: 15, mortgage: "same_property" }], P));
  add(given("t.mortgage", "1000"));
  const tb1 = add(qualifying("t.bullet1", { amount: "565000", ratePercent: "4.6", months: 300, bullet: true }));
  const tb2 = add(qualifying("t.bullet2", { amount: "565000", ratePercent: "4.1", months: 300, bullet: true }));
  const tbPay = add(sum("t.bullet_pay", [tb1.value as string, tb2.value as string]));
  add(ratio("t.bullet_ratio", tbPay.value as string, "15700"));

  // ── The same-property rule: גלעד ונוי (invented) ──
  const SAME: Obligation = { kind: "mortgage", monthly: "2100", monthsLeft: 140, mortgage: "same_property" };
  const CAR: Obligation = { kind: "loan", monthly: "1200", monthsLeft: 24 };
  add(given("same.recognised", "15200"));
  add(given("same.car", "1200"));
  add(given("same.existing", "2100"));
  add(given("same.existing_months", 140));
  const top = add(qualifying("same.new", { amount: "200000", ratePercent: "5", months: 180 }));
  const sDisp = add(disposable("same.disposable", "15200", [CAR, SAME]));
  add(added("same.added", [CAR, SAME]));
  const sPay = add(payment("same.payment", top.value as string, [CAR, SAME]));
  add(ratio("same.ratio_new_only", top.value as string, sDisp.value as string));
  add(ratio("same.ratio", sPay.value as string, sDisp.value as string));
  // The same mortgage, if it were taken off the income instead (another property).
  add(ratioFromParts("same.ratio_other_property", "15200", [CAR, { ...SAME, mortgage: "other_property" }], top.value as string));
  add(disposable("same.disposable_other_property", "15200", [CAR, { ...SAME, mortgage: "other_property" }]));
  // With 18 or fewer payments left, it would not count at all.
  add(ratioFromParts("same.ratio_short", "15200", [CAR, { ...SAME, monthsLeft: 15 }], top.value as string));

  // ── Half-worked table (invented households) ──
  add(
    ratioTable("half.table", [
      { name: "1", recognised: "20000", obligations: [{ kind: "loan", monthly: "1000", monthsLeft: 30 }], newPayment: "5700" },
      { name: "2", recognised: "15000", obligations: [{ kind: "loan", monthly: "800", monthsLeft: 12 }], newPayment: "4800" },
      {
        name: "3",
        recognised: "24000",
        obligations: [
          { kind: "alimony", monthly: "2000", monthsLeft: null },
          { kind: "mortgage", monthly: "1800", monthsLeft: 60, mortgage: "same_property" },
        ],
        newPayment: "4000",
      },
      { name: "4", recognised: "12500", obligations: [{ kind: "rent", monthly: "3000", monthsLeft: 6, rentContinues: true }], newPayment: "4000" },
    ]),
  );

  // ── Exercises ──
  add(given("ex1.payment", "4200"));
  add(given("ex1.disposable", "14000"));
  add(ratio("ex1.answer", "4200", "14000"));
  add(ratio("ex1.err_inverse", "14000", "4200"));
  add(given("ex3.amount", "400000"));
  add(qualifying("ex3.answer", { amount: "400000", ratePercent: "5", months: 120, bullet: true }));
  add(qualifying("ex3.err_principal", { amount: "400000", ratePercent: "0", months: 120 }));
  add(given("ex3.err_annual", "20000"));
  const ex4: Obligation[] = [{ kind: "loan", monthly: "1500", monthsLeft: 30 }];
  add(given("ex4.income", "20000"));
  add(given("ex4.loan", "1500"));
  add(given("ex4.new", "5000"));
  add(ratioFromParts("ex4.answer", "20000", ex4, "5000"));
  add(ratio("ex4.err_numerator", "6500", "20000"));
  add(ratio("ex4.err_ignored", "5000", "20000"));
  add(disposable("ex4.disposable", "20000", ex4));
  // 6: moving a mortgage (גרירה): 2,400 a month, 200 left, onto the new home; a new payment of 3,000; 18,000 disposable before it.
  add(given("ex6.new", "3000"));
  add(given("ex6.existing", "2400"));
  add(given("ex6.months", 200));
  add(given("ex6.disposable", "18000"));
  const DRAG: Obligation = { kind: "mortgage", monthly: "2400", monthsLeft: 200, mortgage: "same_property" };
  const dragPay = add(payment("ex6.payment", "3000", [DRAG]));
  add(ratio("ex6.answer", dragPay.value as string, "18000"));
  add(ratio("ex6.err_new_only", "3000", "18000"));
  add(ratioFromParts("ex6.err_income", "18000", [{ ...DRAG, mortgage: "other_property" }], "3000"));

  return {
    lesson: "4.3",
    title: "יחס החזר",
    note: "Case B's payment is the course's calculation assumption (case_sketch.py); every other household and loan is invented.",
    facts,
  };
}
