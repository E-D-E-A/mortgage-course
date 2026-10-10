/**
 * Lesson 3.3 — the balance at any point in time: read off the schedule, or as
 * the value today of the payments still to come. Every number the lesson, its
 * exercises and its illustration's guided tasks show is declared here as a
 * fact, recomputed independently by checks/kinds/amortization.py (payment by
 * payment) and repayment.py.
 *
 * Inputs are teaching numbers, not market rates. Monthly rate = annual ÷ 12.
 */
import { firstMonthBelow } from "../../src/lib/calc/amortization.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, repCell, repMonths, repPayment, slice } from "./lesson-2-9.ts";
import { baseFact, factorFact, leftFact, monthlyFact, paymentsTotal, pvFact, remainingFact, shownSumFact, statementFact, stepsFact, sumFact } from "./lesson-3-1.ts";
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";

/** The page prints "C × S = B" with S the calculator's S; make sure that product is the balance fact it shows. */
function assertProduct(payment: Fact, shownSum: Fact, balance: Fact): void {
  const product = moneyString(new Decimal(payment.value as string).mul(shownSum.value as string));
  if (product !== balance.value) throw new Error(`lesson 3.3: ${payment.id} × ${shownSum.id} = ${product}, but ${balance.id} = ${balance.value}`);
}

const belowFact = (id: string, principal: string, annual: string, months: number, threshold: string): Fact => ({
  id,
  kind: "amort_month_below",
  inputs: { principal, rate_percent: annual, months, threshold },
  value: firstMonthBelow(principal, annual, months, threshold),
});

/** The payment that repays `balance` over `months` at the rate: balance ÷ S (3.1's C = P ÷ S, on a balance). */
const paymentOnBalance = (id: string, balance: string, annual: string, months: number): Fact => repPayment(id, balance, annual, months);

export default function lesson33(): LessonData {
  // ── Prediction and the illustration: 900,000 ₪ at 5.4% for 30 years; after 15 years. ──
  const R = ["900000", "5.4", 360] as const;
  const rPay = repPayment("pred.pay", ...R);
  const rPaid180 = paymentsTotal("pred.paid_180", rPay.value as string, 180);
  const rPv = pvFact("pred.pv", rPay.value as string, "5.4", 180);
  const rAnswer = statementFact("pred.answer", ...R, 180);

  // ── Explanation, small: lesson 2.9's 60,000 ₪ at 6% for three months. ──
  const T = ["60000", "6", 3] as const;
  const tPay = repPayment("small.pay", ...T);

  // ── Explanation, long: 600,000 ₪ at 4.8% for 20 years; after 5 years (60 payments). ──
  const L = ["600000", "4.8", 240] as const;
  const lPay = repPayment("long.pay", ...L);
  const lTable60 = statementFact("long.table_60", ...L, 60);
  const lPv60 = pvFact("long.pv_60", lPay.value as string, "4.8", 180);
  const lShown = shownSumFact("long.S_180_shown", "4.8", 180);
  assertProduct(lPay, lShown, lPv60);

  // ── Worked example: ענבל ורועי, 500,000 ₪ at 4.5% for 20 years; they sell after 7 years. ──
  const W = ["500000", "4.5", 240] as const;
  const wPay = repPayment("worked.pay", ...W);
  const wPv = pvFact("worked.pv", wPay.value as string, "4.5", 156);
  const wPaid = paymentsTotal("worked.paid_84", wPay.value as string, 84);
  const wLoan = given("worked.loan", "500000.00");
  const wTable = statementFact("worked.table_84", ...W, 84);
  const wShown = shownSumFact("worked.S_156_shown", "4.5", 156);
  assertProduct(wPay, wShown, wPv);

  // ── Half-worked: 40,000 ₪ at 6% (0.5% a month), four months. ──
  const H = ["40000", "6", 4] as const;
  const hPay = repPayment("half.pay", ...H);
  const hS = [1, 2, 3].map((k) => sumFact(`half.S_${k}`, "6", 4 - k));
  const hB = [1, 2, 3].map((k) => pvFact(`half.balance_${k}`, hPay.value as string, "6", 4 - k));
  const halfRows = [1, 2, 3].map((k) => ({ period: String(k), left: String(4 - k), s: hS[k - 1].value as string, balance: hB[k - 1].value as string }));

  // ── Exercises. ──
  // 3: 250,000 ₪ at 4.8% for 25 years, after 5 years (240 payments left).
  const X = ["250000", "4.8", 300] as const;
  const xPay = repPayment("ex3.pay", ...X);
  const x3Paid = paymentsTotal("ex3.paid_60", xPay.value as string, 60);
  const xLoan = given("ex3.loan", "250000.00");
  // 4: 900,000 ₪ at 5.4% for 30 years, after 20 years.
  const ex4Answer = pvFact("ex4.answer", rPay.value as string, "5.4", 120);
  const ex4Table = statementFact("ex4.table", ...R, 240);
  // 5: exercise 3's loan — how much of the principal was repaid in the first ten years.
  const x5Balance = pvFact("ex5.balance", xPay.value as string, "4.8", 180);
  assertProduct(xPay, shownSumFact("ex5.check", "4.8", 180), x5Balance);
  const lLoan = given("long.loan", "600000.00");
  const x5Table = statementFact("ex5.table", ...X, 120);
  // 6: הילה's balance from 3.2 after 36 months, 264 months left at 4.2%: back to the payment.
  const dBalance = given("ex6.balance", "324675.50");

  const facts: Fact[] = [
    // Prediction.
    rPay,
    rPaid180,
    slice("pred.half", "900000", "1", "2"),
    remainingFact("pred.formula", ...R, 180),
    monthlyFact("pred.monthly", "5.4", 2),
    sumFact("pred.S_180", "5.4", 180),
    rPv,
    rAnswer,
    difference("pred.gap", rPv, rAnswer),

    // Explanation, small.
    tPay,
    monthlyFact("small.monthly", "6", 2),
    baseFact("small.base", "6"),
    statementFact("small.table_1", ...T, 1),
    statementFact("small.table_2", ...T, 2),
    factorFact("small.f1", "6", 1),
    factorFact("small.f2", "6", 2),
    sumFact("small.S_2", "6", 2),
    pvFact("small.pv_1", tPay.value as string, "6", 2),
    remainingFact("small.exact_1", ...T, 1),
    pvFact("small.pv_2", tPay.value as string, "6", 1),

    // Explanation, long.
    lLoan,
    leftFact("long.left_60", 240, 60),
    monthlyFact("long.monthly", "4.8", 2),
    lPay,
    stepsFact("long.steps_180", ...L.slice(0, 2) as [string, string], 180),
    sumFact("long.S_180", "4.8", 180),
    lShown,
    baseFact("long.base", "4.8"),
    lPv60,
    lTable60,
    difference("long.gap_60", lTable60, lPv60),
    remainingFact("long.exact_60", ...L, 60),
    statementFact("long.table_120", ...L, 120),
    statementFact("long.table_180", ...L, 180),
    belowFact("long.half_month", ...L, "300000"),
    statementFact("long.table_below", ...L, firstMonthBelow(...L, "300000") as number),
    difference("long.repaid_60", lLoan, lTable60),
    paymentsTotal("long.paid_60", lPay.value as string, 60),
    slice("long.straight_60", "600000", "180", "240"),

    // Worked example.
    monthlyFact("worked.monthly", "4.5"),
    wPay,
    repMonths("worked.months", 20),
    repMonths("worked.paid_months", 7),
    leftFact("worked.left", 240, 84),
    stepsFact("worked.steps_156", "500000", "4.5", 156),
    sumFact("worked.S_156", "4.5", 156),
    wShown,
    baseFact("worked.base", "4.5"),
    wPv,
    wTable,
    wLoan,
    wPaid,
    difference("worked.repaid", wLoan, wTable),

    // Half-worked.
    hPay,
    { id: "half.rows", kind: "given", inputs: {}, value: halfRows },
    ...hS,
    ...hB,
    ...[1, 2, 3].map((k) => statementFact(`half.table_${k}`, ...H, k)),

    // Exercise 2: one payment left of lesson 2.9's loan.
    repCell("ex2.payment", "spitzer", ...T, 3, "payment"),

    // Exercise 3.
    xPay,
    xLoan,
    sumFact("ex3.S_240", "4.8", 240),
    leftFact("ex3.left", 300, 60),
    pvFact("ex3.answer", xPay.value as string, "4.8", 240),
    x3Paid,
    difference("ex3.err_subtract", xLoan, x3Paid),
    slice("ex3.err_straight", "250000", "240", "300"),
    statementFact("ex3.table", ...X, 60),

    // Exercise 4.
    sumFact("ex4.S_120", "5.4", 120),
    baseFact("ex4.base", "5.4"),
    stepsFact("ex4.steps", "900000", "5.4", 120),
    ex4Answer,
    ex4Table,
    difference("ex4.gap", ex4Answer, ex4Table),
    leftFact("ex4.left", 360, 240),
    slice("ex4.err_straight", "900000", "120", "360"),
    pvFact("ex4.err_left_180", rPay.value as string, "5.4", 240),

    // Exercise 5.
    leftFact("ex5.left", 300, 120),
    x5Balance,
    difference("ex5.answer", xLoan, x5Balance),
    x5Table,
    difference("ex5.table_repaid", xLoan, x5Table),
    paymentsTotal("ex5.err_paid", xPay.value as string, 120),
    slice("ex5.err_straight", "250000", "120", "300"),

    // Exercise 6.
    dBalance,
    monthlyFact("ex6.monthly", "4.2", 2),
    sumFact("ex6.S_264", "4.2", 264),
    baseFact("ex6.base", "4.2"),
    leftFact("ex6.left", 300, 36),
    stepsFact("ex6.steps", "324675.50", "4.2", 264),
    paymentOnBalance("ex6.answer", "324675.50", "4.2", 264),
    paymentOnBalance("ex6.err_full_term", "324675.50", "4.2", 300),
  ];

  return {
    lesson: "3.3",
    title: "יתרת החוב בכל נקודת זמן",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12. Balances from a statement round each month's interest and the payment to the agora; balances from the formula round once, so the two can differ by a few agorot.",
    facts,
  };
}
