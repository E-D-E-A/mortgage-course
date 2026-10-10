/**
 * Lesson 3.4 — schedules for equal principal, grace and bullet: the same three
 * row rules as 3.2, a different payment rule per method. Every number the
 * lesson, its exercises and its illustration's guided tasks show is declared
 * here as a fact, recomputed independently by checks/kinds/repayment.py,
 * amortization.py and compound.py.
 *
 * Inputs are teaching numbers, not market rates. Monthly rate = annual ÷ 12.
 * Grace sits inside the loan's term (Mogi decision, Brain 67436545, Q11).
 */
import { compoundBalance, simpleBalance } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Method } from "../../src/lib/calc/repayment.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, percentOfFact, repCell, repMonths, repPayment, repSchedule, repSum, repTotalInterest, repTotalPaid, slice } from "./lesson-2-9.ts";
import { baseFact, leftFact, monthlyFact, paymentsTotal, stepsFact } from "./lesson-3-1.ts";

const compound = (id: string, principal: string, ratePercent: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal, rate_percent: ratePercent, periods },
  value: moneyString(compoundBalance(principal, ratePercent, periods)),
});
const simple = (id: string, principal: string, ratePercent: string, periods: number): Fact => ({
  id,
  kind: "simple_balance",
  inputs: { principal, rate_percent: ratePercent, periods },
  value: moneyString(simpleBalance(principal, ratePercent, periods)),
});

export default function lesson34(): LessonData {
  // ── Prediction: 100,000 ₪ at 6% a year, full bullet, five years. ──
  const pLast = repCell("pred.answer", "bullet_full", "100000", "6", 60, 60, "payment");

  // ── Explanation and illustration: 600,000 ₪ at 4.8% for 20 years, 12 months of grace. ──
  const L = ["600000", "4.8", 240] as const;
  const cell = (id: string, method: Method, month: number, field: "opening" | "interest" | "principal" | "payment" | "closing") =>
    repCell(id, method, ...L, month, field, method.startsWith("grace") ? 12 : undefined);
  const gFullClose = cell("full.close_12", "grace_full", 12, "closing");
  const sInterest = repTotalInterest("spitzer.interest", "spitzer", ...L);
  const eInterest = repTotalInterest("equal.interest", "equal_principal", ...L);
  const gpInterest = repTotalInterest("partial.interest", "grace_partial", ...L, 12);
  const gfInterest = repTotalInterest("full.interest", "grace_full", ...L, 12);
  const bpInterest = repTotalInterest("bp.interest", "bullet_partial", ...L);
  const bfInterest = repTotalInterest("bf.interest", "bullet_full", ...L);
  const bfLast = cell("bf.last", "bullet_full", 240, "payment");
  const loan = given("loan", "600000.00");

  // ── Worked example: גל ורותם, 400,000 ₪ at 5.4% for 20 years, 6 months of full grace. ──
  const W = ["400000", "5.4", 240] as const;
  const wClose6 = repCell("worked.close_6", "grace_full", ...W, 6, "closing", 6);
  const wAfter = repCell("worked.after", "grace_full", ...W, 7, "payment", 6);
  const wSpitzer = repPayment("worked.spitzer", ...W);
  const wFullInterest = repTotalInterest("worked.full_interest", "grace_full", ...W, 6);
  const wSpInterest = repTotalInterest("worked.sp_interest", "spitzer", ...W);
  const wLoan = given("worked.loan", "400000.00");

  // ── Exercises. ──
  // 2: equal principal, 180,000 ₪ at 6% for 15 years.
  const x2Part = slice("ex2.part", "180000", "1", "180");
  const x2Int = percentOfFact("ex2.interest", "180000", "0.5");
  // 3: partial grace of 24 months, 300,000 ₪ at 4.2% for 20 years.
  // 5: full bullet, 150,000 ₪ at 4.8% for 10 years.
  // 6: partial bullet vs Spitzer on the same loan.
  const x6Bp = repTotalInterest("ex6.bp", "bullet_partial", "150000", "4.8", 120);
  const x6Sp = repTotalInterest("ex6.sp", "spitzer", "150000", "4.8", 120);
  const x6SpPay = repPayment("ex6.sp_pay", "150000", "4.8", 120);
  const x6SpTotal = paymentsTotal("ex6.sp_total", x6SpPay.value as string, 120);
  const x6Loan = given("ex6.loan", "150000.00");
  const x6SpRough = difference("ex6.sp_rough", x6SpTotal, x6Loan);

  const facts: Fact[] = [
    // Prediction.
    pLast,
    simple("pred.simple", "100000", "6", 5),
    compound("pred.yearly", "100000", "6", 5),
    given("pred.loan", "100000.00"),
    compound("pred.exact", "100000", "0.5", 60),
    baseFact("pred.base", "6"),
    monthlyFact("pred.monthly", "6", 2),

    // The row rules on the explanation's loan.
    loan,
    monthlyFact("monthly", "4.8", 2),
    baseFact("base", "4.8"),
    repPayment("spitzer.pay", ...L),
    cell("equal.first", "equal_principal", 1, "payment"),
    cell("equal.last", "equal_principal", 240, "payment"),
    cell("equal.part", "equal_principal", 1, "principal"),
    cell("equal.int_1", "equal_principal", 1, "interest"),
    cell("equal.int_2", "equal_principal", 2, "interest"),
    cell("equal.second", "equal_principal", 2, "payment"),
    // Partial grace.
    cell("partial.grace_pay", "grace_partial", 1, "payment"),
    cell("partial.close_12", "grace_partial", 12, "closing"),
    cell("partial.after", "grace_partial", 13, "payment"),
    stepsFact("partial.steps", "600000", "4.8", 228),
    leftFact("left_228", 240, 12),
    // Full grace.
    cell("full.int_1", "grace_full", 1, "interest"),
    cell("full.close_1", "grace_full", 1, "closing"),
    cell("full.int_2", "grace_full", 2, "interest"),
    gFullClose,
    compound("full.formula_12", "600000", "0.4", 12),
    cell("full.after", "grace_full", 13, "payment"),
    stepsFact("full.steps", gFullClose.value as string, "4.8", 228),
    difference("full.added", gFullClose, loan),
    // Bullet.
    cell("bp.pay", "bullet_partial", 1, "payment"),
    cell("bp.last", "bullet_partial", 240, "payment"),
    bfLast,
    compound("bf.formula", "600000", "0.4", 240),
    // Totals (illustration's guided tasks).
    repTotalPaid("spitzer.paid", "spitzer", ...L),
    sInterest,
    eInterest,
    gpInterest,
    gfInterest,
    bpInterest,
    bfInterest,
    difference("gap.partial", gpInterest, sInterest),
    difference("gap.full", gfInterest, sInterest),
    difference("gap.bf", bfInterest, sInterest),

    // Worked example.
    wLoan,
    monthlyFact("worked.monthly", "5.4", 2),
    baseFact("worked.base", "5.4"),
    repMonths("worked.months", 20),
    leftFact("worked.left", 240, 6),
    repCell("worked.int_1", "grace_full", ...W, 1, "interest", 6),
    repCell("worked.close_1", "grace_full", ...W, 1, "closing", 6),
    wClose6,
    compound("worked.formula_6", "400000", "0.45", 6),
    difference("worked.added", wClose6, wLoan),
    stepsFact("worked.steps", wClose6.value as string, "5.4", 234),
    wAfter,
    wSpitzer,
    difference("worked.pay_gap", wAfter, wSpitzer),
    wFullInterest,
    wSpInterest,
    difference("worked.interest_gap", wFullInterest, wSpInterest),

    // Half-worked: 20,000 ₪ at 6% for 4 months, 2 months of partial grace.
    repSchedule("half.rows", "grace_partial", "20000", "6", 4, 2),
    repPayment("half.after", "20000", "6", 2),

    // Exercise 2.
    x2Part,
    x2Int,
    repSum("ex2.answer_sum", [x2Part, x2Int]),
    monthlyFact("ex2.monthly", "6", 2),
    repMonths("ex2.months", 15),
    repCell("ex2.answer", "equal_principal", "180000", "6", 180, 1, "payment"),
    repPayment("ex2.err_spitzer", "180000", "6", 180),
    // Exercise 3.
    repCell("ex3.grace_pay", "grace_partial", "300000", "4.2", 240, 1, "payment", 24),
    repCell("ex3.answer", "grace_partial", "300000", "4.2", 240, 25, "payment", 24),
    repPayment("ex3.err_no_grace", "300000", "4.2", 240),
    stepsFact("ex3.steps", "300000", "4.2", 216),
    leftFact("ex3.left", 240, 24),
    baseFact("ex3.base", "4.2"),
    // Exercise 4.
    repCell("ex4.answer", "grace_full", "200000", "6", 120, 6, "closing", 6),
    simple("ex4.err_simple", "200000", "0.5", 6),
    compound("ex4.formula", "200000", "0.5", 6),
    baseFact("ex4.base", "6"),
    monthlyFact("ex4.monthly", "6", 2),
    // Exercise 5.
    repCell("ex5.answer", "bullet_full", "150000", "4.8", 120, 120, "payment"),
    compound("ex5.formula", "150000", "0.4", 120),
    simple("ex5.err_simple", "150000", "4.8", 10),
    compound("ex5.err_yearly", "150000", "4.8", 10),
    baseFact("ex5.base", "4.8"),
    baseFact("ex5.yearly_base", "4.8", 1),
    repMonths("ex5.months", 10),
    // Exercise 6.
    x6Bp,
    x6Sp,
    difference("ex6.answer", x6Bp, x6Sp),
    repCell("ex6.bp_pay", "bullet_partial", "150000", "4.8", 120, 1, "payment"),
    monthlyFact("ex6.monthly", "4.8", 2),
    x6SpPay,
    x6SpTotal,
    x6Loan,
    x6SpRough,
    difference("ex6.rough_answer", x6Bp, x6SpRough),
  ];

  return {
    lesson: "3.4",
    title: "לוחות של קרן שווה, גרייס ובולט",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12; each month's interest rounded to the agora; grace inside the term; the last month takes what is left.",
    facts,
  };
}
