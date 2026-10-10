/**
 * Lesson 3.2 — splitting a payment into its principal part and its interest
 * part. Every number the lesson, its exercises and its illustration's guided
 * tasks show is declared here as a fact, recomputed independently by
 * checks/kinds/amortization.py, repayment.py, percent.py and compound.py.
 *
 * Inputs are teaching numbers, not market rates. Monthly rate = annual ÷ 12.
 */
import { periodsToDouble, ruleOf72 } from "../../src/lib/calc/compound.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { afterChange } from "../../src/lib/calc/percent.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, percentOfFact, repCell, repMonths, repPayment, repSchedule, repSum, repTotalInterest, repTotalPaid, slice } from "./lesson-2-9.ts";
import { monthlyFact, overtakeFact, paymentsTotal, stepsFact } from "./lesson-3-1.ts";

/** amount × (1 + p%), to the agora (lesson 0.1's kind). */
const grown = (id: string, amount: string, percent: string): Fact => ({
  id,
  kind: "after_percent_change",
  inputs: { amount, changes_percent: percent },
  value: moneyString(afterChange(amount, percent)),
});

export default function lesson32(): LessonData {
  // ── The explanation, small: lesson 2.9's 60,000 ₪ at 6% a year for three months. ──
  const T = ["60000", "6", 3] as const;
  const [sP1, sP2, sP3] = [1, 2, 3].map((m) => repCell(`small.prin_${m}`, "spitzer", ...T, m, "principal"));
  // ── The explanation, long, and the illustration's defaults: 600,000 ₪ at 4.8% for 20 years. ──
  const L = ["600000", "4.8", 240] as const;
  const lInt1 = repCell("long.int_1", "spitzer", ...L, 1, "interest");
  const lPrin1 = repCell("long.prin_1", "spitzer", ...L, 1, "principal");
  const lPay = repPayment("long.pay", ...L);
  const lInt2 = repCell("long.int_2", "spitzer", ...L, 2, "interest");
  const overtake = overtakeFact("long.overtake", ...L);
  const k = overtake.value as number;
  const lPaid = repTotalPaid("long.paid", "spitzer", ...L);
  const lInterest = repTotalInterest("long.interest", "spitzer", ...L);

  // ── Worked example: דנה's track, 350,000 ₪ at 4.2% for 25 years; month 37. ──
  const W = ["350000", "4.2", 300] as const;
  const wOpen = repCell("worked.open_37", "spitzer", ...W, 37, "opening");
  const wInt = repCell("worked.int_37", "spitzer", ...W, 37, "interest");
  const wPrin = repCell("worked.prin_37", "spitzer", ...W, 37, "principal");
  const wPay = repPayment("worked.pay", ...W);

  // ── Exercises 2–6: 250,000 ₪ at 4.8% for 25 years. ──
  const X = ["250000", "4.8", 300] as const;
  const xPay = repPayment("ex.pay", ...X);
  const xInt1 = repCell("ex2.answer", "spitzer", ...X, 1, "interest");
  const xPrin1 = repCell("ex3.answer", "spitzer", ...X, 1, "principal");
  const xOpen121 = repCell("ex5.open", "spitzer", ...X, 121, "opening");
  const xInt121 = repCell("ex5.interest", "spitzer", ...X, 121, "interest");
  const xPaid = repTotalPaid("ex6.paid", "spitzer", ...X);
  const xNC = paymentsTotal("ex6.n_times_c", xPay.value as string, 300);
  const xLoan = given("ex6.loan", "250000.00");

  const facts: Fact[] = [
    // Prediction.
    overtake,
    repMonths("pred.half", 10),

    // Explanation, small.
    repSchedule("small.rows", "spitzer", ...T),
    sP1,
    sP2,
    sP3,
    repSum("small.prin_sum", [sP1, sP2, sP3]),
    repCell("long30.prin_1", "spitzer", "600000", "4.8", 360, 1, "principal"),
    repPayment("long30.pay", "600000", "4.8", 360),
    repPayment("small.pay", ...T),
    repTotalInterest("small.interest", "spitzer", ...T),
    repTotalPaid("small.paid", "spitzer", ...T),
    monthlyFact("small.monthly", "6", 2),

    // Explanation, long.
    monthlyFact("long.monthly", "4.8", 2),
    lPay,
    lInt1,
    lPrin1,
    repCell("long.open_2", "spitzer", ...L, 2, "opening"),
    lInt2,
    repCell("long.prin_2", "spitzer", ...L, 2, "principal"),
    grown("long.prin_1_grown", lPrin1.value as string, "0.4"),
    difference("long.int_drop", lInt1, lInt2),
    repCell("long.int_k", "spitzer", ...L, k, "interest"),
    repCell("long.prin_k", "spitzer", ...L, k, "principal"),
    repCell("long.int_k1", "spitzer", ...L, k - 1, "interest"),
    repCell("long.prin_k1", "spitzer", ...L, k - 1, "principal"),
    repCell("long.int_last", "spitzer", ...L, 240, "interest"),
    repCell("long.prin_last", "spitzer", ...L, 240, "principal"),
    repCell("long.pay_last", "spitzer", ...L, 240, "payment"),
    lPaid,
    lInterest,
    difference("long.principal_sum", lPaid, lInterest),
    stepsFact("long.steps", ...L),
    // A rule of thumb: the principal part grows by the monthly rate, so it doubles in about 72 ÷ annual % years.
    { id: "head.rule72", kind: "rule_of_72", inputs: { rate_percent: "4.8" }, value: ruleOf72("4.8").toString() },
    { id: "head.months_to_double", kind: "periods_to_double", inputs: { rate_percent: "0.4" }, value: periodsToDouble("0.4") },
    repCell("head.prin_double", "spitzer", ...L, 1 + periodsToDouble("0.4"), "principal"),
    repSum("head.prin_twice", [lPrin1, lPrin1]),

    // Worked example.
    monthlyFact("worked.monthly", "4.2"),
    wPay,
    wOpen,
    wInt,
    wPrin,
    repCell("worked.close_37", "spitzer", ...W, 37, "closing"),
    stepsFact("worked.steps", ...W),
    difference("worked.check", wPay, wInt),

    // Half-worked: 90,000 ₪ at 4.8% (0.4% a month), three months.
    repSchedule("half.rows", "spitzer", "90000", "4.8", 3),
    repPayment("half.pay", "90000", "4.8", 3),

    // Exercises.
    xPay,
    stepsFact("ex.steps", ...X),
    monthlyFact("ex.monthly", "4.8", 2),
    xInt1,
    percentOfFact("ex2.err_annual", "250000", "4.8"),
    xPrin1,
    slice("ex3.err_equal", "250000", "1", "300"),
    repCell("ex4.answer", "spitzer", ...X, 2, "interest"),
    repCell("ex4.open", "spitzer", ...X, 2, "opening"),
    xOpen121,
    xInt121,
    repCell("ex5.answer", "spitzer", ...X, 121, "principal"),
    repCell("ex5.err_prin1", "spitzer", ...X, 1, "principal"),
    xPaid,
    repTotalInterest("ex6.answer", "spitzer", ...X),
    xNC,
    difference("ex6.formula_interest", xNC, xLoan),
    xLoan,
    repCell("ex6.last_pay", "spitzer", ...X, 300, "payment"),
  ];

  return {
    lesson: "3.2",
    title: "פירוק תשלום לקרן ולריבית",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12; each month's interest rounded to the agora; the level payment rounded once; the last month takes what is left.",
    facts,
  };
}
