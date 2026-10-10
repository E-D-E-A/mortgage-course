/**
 * Lesson 3.1 — where the level payment (שפיצר) comes from. Every number the
 * lesson, its exercises, its illustration's guided tasks and its video show is
 * declared here as a fact; checks/kinds/amortization.py recomputes each one by
 * the long road (factors summed one by one, payments discounted one by one).
 *
 * Inputs are teaching numbers, not market rates. Monthly rate = annual ÷ 12
 * (lesson 0.4; Brain ENG-223). The fact builders below are shared with lessons
 * 3.2–3.4, which import them from this file.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  annuitySteps,
  discountSum,
  flatInterestTrialLeft,
  growthBase,
  halfInterestRate,
  interpolationStep,
  monthlyDiscountFactor,
  monthlyRate,
  paymentTrial,
  paymentsValueToday,
  principalOvertakesInterest,
  remainingBalance,
  shownDiscountSum,
  statementBalance,
} from "../../src/lib/calc/amortization.ts";
import { valueToday } from "../../src/lib/calc/present-value.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, percentOfFact, repCell, repMonthly, repMonths, repPayment, repSum, slice } from "./lesson-2-9.ts";

/** 1 ÷ (1 + m)^k, shown to `decimals` places. */
export const factorFact = (id: string, annual: string, month: number, decimals = 8): Fact => ({
  id,
  kind: "amort_discount_factor",
  inputs: { rate_percent: annual, month, decimals },
  value: monthlyDiscountFactor(annual, month).toFixed(decimals),
});

/** S, the sum of n monthly discount factors, shown to `decimals` places. */
export const sumFact = (id: string, annual: string, months: number, decimals = 8): Fact => ({
  id,
  kind: "amort_discount_sum",
  inputs: { rate_percent: annual, months, decimals },
  value: discountSum(annual, months).toFixed(decimals),
});

/** The value today of n equal monthly payments: C × S, to the agora. */
export const pvFact = (id: string, payment: string, annual: string, months: number): Fact => ({
  id,
  kind: "amort_payments_value_today",
  inputs: { payment, rate_percent: annual, months },
  value: moneyString(paymentsValueToday(payment, annual, months)),
});

/** What one payment of `amount`, made at the end of month k, is worth today (lesson 0.6's kind, the monthly rate as the period's rate). */
export const todayFact = (id: string, amount: string, monthlyPercent: string, month: number): Fact => ({
  id,
  kind: "value_today",
  inputs: { amount, rate_percent: monthlyPercent, periods: month },
  value: moneyString(valueToday(amount, monthlyPercent, month)),
});

/** A trial: the same payment every month, interest rounded monthly, nothing forced to zero. */
export const trialTable = (id: string, principal: string, annual: string, payment: string, months: number): Fact => ({
  id,
  kind: "amort_trial_table",
  inputs: { principal, rate_percent: annual, payment, months },
  value: paymentTrial(principal, annual, payment, months).map((r) => ({
    period: r.month,
    opening: r.opening.toFixed(2),
    interest: r.interest.toFixed(2),
    payment: r.payment.toFixed(2),
    closing: r.closing.toFixed(2),
  })),
});

/** What a trial leaves after its last month: positive = still owed, negative = overpaid. */
export const trialLast = (id: string, principal: string, annual: string, payment: string, months: number): Fact => ({
  id,
  kind: "amort_trial_last",
  inputs: { principal, rate_percent: annual, payment, months },
  value: paymentTrial(principal, annual, payment, months)[months - 1].closing.toFixed(2),
});

/** The level payment's formula step by step (m, (1 + m)^n, its inverse, 1 − it, P × m, C). */
export const stepsFact = (id: string, principal: string, annual: string, months: number, decimals = 8): Fact => {
  const s = annuitySteps(principal, annual, months);
  return {
    id,
    kind: "amort_formula_steps",
    inputs: { principal, rate_percent: annual, months, decimals },
    value: {
      m: s.m.toFixed(decimals),
      growth: s.growth.toFixed(decimals),
      discount: s.discount.toFixed(decimals),
      one_minus: s.oneMinus.toFixed(decimals),
      top: moneyString(s.top),
      payment: moneyString(s.payment),
    },
  };
};

/** The balance after k payments, as the value today of the payments still to come (exact payment). */
export const remainingFact = (id: string, principal: string, annual: string, months: number, paid: number): Fact => ({
  id,
  kind: "amort_remaining_balance",
  inputs: { principal, rate_percent: annual, months, paid },
  value: moneyString(remainingBalance(principal, annual, months, paid)),
});

/** The balance a statement shows after k payments. */
export const statementFact = (id: string, principal: string, annual: string, months: number, paid: number): Fact => ({
  id,
  kind: "amort_statement_balance",
  inputs: { principal, rate_percent: annual, months, paid },
  value: statementBalance(principal, annual, months, paid).toFixed(2),
});

/** The first month whose principal part is larger than its interest part. */
export const overtakeFact = (id: string, principal: string, annual: string, months: number): Fact => ({
  id,
  kind: "amort_principal_overtakes",
  inputs: { principal, rate_percent: annual, months },
  value: principalOvertakesInterest(principal, annual, months),
});

/** The monthly rate in percent, annual ÷ 12, to `decimals` places (lesson 0.4's kind): 5.1 → 0.425. */
export const monthlyFact = (id: string, annual: string, decimals = 3): Fact => ({
  id,
  kind: "monthly_rate_by_division",
  inputs: { annual_percent: annual, periods_per_year: 12, decimals },
  value: monthlyRate(annual).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toString(),
});

/** How many payments are left after `paid` of `months`: months − paid. */
export const leftFact = (id: string, months: number, paid: number): Fact => ({
  id,
  kind: "amort_months_left",
  inputs: { months, paid },
  value: months - paid,
});

/** A sum of payments in shekels, n × C (lesson 0.6's kind). */
export const paymentsTotal = (id: string, payment: string, periods: number): Fact => ({
  id,
  kind: "payments_total",
  inputs: { payment, periods },
  value: moneyString(new Decimal(payment).mul(periods)),
});

/** 1 + the rate per period, as a decimal: (4.8, 12) → "1.004"; (4.8, 1) → "1.048". */
export const baseFact = (id: string, annual: string, periodsPerYear = 12): Fact => ({
  id,
  kind: "amort_growth_base",
  inputs: { rate_percent: annual, periods_per_year: periodsPerYear },
  value: growthBase(annual, periodsPerYear).toString(),
});

/** The step from a too-small trial payment toward a too-large one, by the ratio of what each leaves (lesson 3.1). */
export const interpolationFact = (id: string, principal: string, annual: string, months: number, low: string, high: string): Fact => ({
  id,
  kind: "amort_interpolation_step",
  inputs: { principal, rate_percent: annual, months, low, high },
  value: moneyString(interpolationStep(principal, annual, months, low, high)),
});

/** What a trial leaves when every month's interest is charged on the whole loan (a slip). */
export const flatTrialFact = (id: string, principal: string, annual: string, payment: string, months: number): Fact => ({
  id,
  kind: "amort_flat_interest_trial",
  inputs: { principal, rate_percent: annual, payment, months },
  value: moneyString(flatInterestTrialLeft(principal, annual, payment, months)),
});

/** S the calculator way: (1 − (1 + m)^−n, kept to `decimals`) ÷ m, kept to `decimals` (lesson 3.3). */
export const shownSumFact = (id: string, annual: string, months: number, decimals = 8): Fact => ({
  id,
  kind: "amort_shown_sum",
  inputs: { rate_percent: annual, months, decimals },
  value: shownDiscountSum(annual, months, decimals).toFixed(decimals),
});

/** The annual rate at which the first month's interest is half the level payment over `months` (lesson 3.2). */
export const halfRateFact = (id: string, months: number): Fact => ({
  id,
  kind: "amort_half_interest_rate",
  inputs: { months },
  value: halfInterestRate(months).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString(),
});

export default function lesson31(): LessonData {
  // ── The explanation: 2,000 ₪ for two months at 12% a year (1% a month). ──
  const E = ["2000", "12", 2] as const;
  const ePay = repPayment("explain.pay", ...E);
  const zeroFact = given("explain.zero", "0.00");
  const last1020 = trialLast("explain.last_1020", "2000", "12", "1020.00", 2);
  const long4000 = trialLast("long.try_4000", "600000", "4.8", "4000.00", 240);
  const pHalf = slice("pred.half", "2000", "1", "2");
  const pInt1 = percentOfFact("pred.int_half", "1000", "1");
  // The third try, by the ratio of what the first two left.
  const left1000 = trialLast("explain.left_1000", "2000", "12", "1000.00", 2);
  const lowFact = given("explain.low", "1000.00");
  const highFact = given("explain.high", "1020.00");
  const over1020 = difference("explain.over_1020", zeroFact, last1020);
  const stepFact = interpolationFact("explain.step", "2000", "12", 2, "1000.00", "1020.00");
  const pIntAll = percentOfFact("pred.int_all", "2000", "1");

  // ── Lesson 2.9's loan: 60,000 ₪ at 6% a year (0.5% a month), three months. ──
  const T = ["60000", "6", 3] as const;

  // ── The long loan of 2.9: 600,000 ₪ at 4.8% a year, 240 months. ──
  const L = ["600000", "4.8", 240] as const;
  const lPart = slice("bound.part", "600000", "1", "240");
  const lInt = percentOfFact("bound.interest", "600000", "0.4");
  const longTryPay = trialLast("long.try_pay", "600000", "4.8", "3893.74", 240);
  const longTryUp = trialLast("long.try_up", "600000", "4.8", "3893.75", 240);
  const longPay = repPayment("long.pay", ...L);
  const longLastPay = repCell("long.last_pay", "spitzer", ...L, 240, "payment");
  const eLastPay = repCell("explain.last_pay", "spitzer", ...E, 2, "payment");

  // ── Worked example: 450,000 ₪ at 5.1% a year (0.425% a month), 25 years. ──
  const W = ["450000", "5.1", 300] as const;
  const wPay = repPayment("worked.pay", ...W);
  const wInt1 = repCell("worked.int_1", "spitzer", ...W, 1, "interest");
  const wPart = slice("worked.part", "450000", "1", "300");

  // ── Half-worked: 30,000 ₪ at 4.8% (0.4% a month), three months — check by present value. ──
  const H = ["30000", "4.8", 3] as const;
  const hPay = repPayment("half.pay", ...H);
  const hPayValue = hPay.value as string;
  const hToday = [1, 2, 3].map((k) => todayFact(`half.today_${k}`, hPayValue, "0.4", k));
  const hFactors = [1, 2, 3].map((k) => factorFact(`half.factor_${k}`, "4.8", k));
  const hTotal = repSum("half.total", hToday);
  const halfRows = [
    ...[0, 1, 2].map((i) => ({ period: String(i + 1), factor: hFactors[i].value as string, today: hToday[i].value as string })),
    { period: "ביחד", factor: "", today: hTotal.value as string },
  ];

  // ── Exercises. ──
  // 2: a trial of 1,010 ₪ on the explanation's loan.
  const x2Try = trialTable("ex2.table", "2000", "12", "1010.00", 2);
  // 3: 10,000 ₪ at 6% a year for two months, by present value.
  const x3Pay = repPayment("ex3.answer", "10000", "6", 2);
  const x3Part = slice("ex3.err_part", "10000", "1", "2");
  const x3IntAll = percentOfFact("ex3.int_all", "10000", "0.5");
  const x3IntPart = percentOfFact("ex3.int_part", "5000", "0.5");
  // 4: 300,000 ₪ at 4.2% for 20 years, by the formula.
  const x4 = stepsFact("ex4.steps", "300000", "4.2", 240);
  // 5: 400,000 ₪ at 5.4% for 15 years — 2.9's offer, now computed.
  const x5 = stepsFact("ex5.steps", "400000", "5.4", 180);
  // 6: how much 4,000 ₪ a month repays over 25 years at 4.5%.
  const x6 = pvFact("ex6.answer", "4000.00", "4.5", 300);

  const facts: Fact[] = [
    // Prediction.
    given("pred.loan", "2000.00"),
    pHalf,
    pInt1,
    pIntAll,
    repSum("pred.half_plus", [pHalf, pInt1]),
    repSum("pred.first_equal", [pHalf, pIntAll]),

    // Explanation, by trying.
    given("explain.loan", "2000.00"),
    repMonthly("explain.monthly", "12"),
    trialTable("explain.try_1000", "2000", "12", "1000.00", 2),
    trialTable("explain.try_1020", "2000", "12", "1020.00", 2),
    zeroFact,
    last1020,
    over1020,
    left1000,
    lowFact,
    highFact,
    difference("explain.span", highFact, lowFact),
    repSum("explain.swing", [left1000, over1020]),
    stepFact,
    repSum("explain.try3", [lowFact, stepFact]),
    trialTable("explain.try_pay", "2000", "12", ePay.value as string, 2),
    trialTable("explain.try_up", "2000", "12", "1015.03", 2),
    ePay,
    eLastPay,
    difference("explain.last_gap", eLastPay, ePay),
    baseFact("explain.base", "12"),
    // By present value.
    factorFact("explain.f1", "12", 1),
    factorFact("explain.f2", "12", 2),
    sumFact("explain.S", "12", 2),
    sumFact("explain.S6", "12", 2, 6),
    stepsFact("explain.steps", ...E),
    // Lesson 2.9's three-month loan.
    repMonthly("three.monthly", "6"),
    baseFact("three.base", "6"),
    factorFact("three.f1", "6", 1),
    factorFact("three.f2", "6", 2),
    factorFact("three.f3", "6", 3),
    sumFact("three.S", "6", 3),
    repPayment("three.pay", ...T),
    // 240 payments.
    sumFact("long.S", "4.8", 240),
    longPay,
    stepsFact("long.steps", ...L),
    longLastPay,
    difference("long.last_gap", longLastPay, longPay),
    baseFact("long.base", "4.8"),
    trialLast("long.try_3500", "600000", "4.8", "3500.00", 240),
    longTryPay,
    longTryUp,
    long4000,
    difference("long.over_4000", zeroFact, long4000),
    difference("long.agora_effect", longTryPay, longTryUp),
    monthlyFact("long.monthly", "4.8"),
    // The bounds: P ÷ n and P × m below the payment, their sum above it.
    lPart,
    lInt,
    repSum("bound.upper", [lPart, lInt]),
    given("bound.months", "240"),

    // Worked example.
    stepsFact("worked.steps", ...W),
    wPay,
    wInt1,
    difference("worked.prin_1", wPay, wInt1),
    wPart,
    repSum("worked.upper", [wPart, wInt1]),
    monthlyFact("worked.monthly", "5.1"),
    baseFact("worked.base", "5.1"),
    repMonths("worked.months", 25),

    // Half-worked.
    hPay,
    baseFact("half.base", "4.8"),
    ...hFactors,
    ...hToday,
    hTotal,
    { id: "half.rows", kind: "given", inputs: {}, value: halfRows },

    // Exercise 2.
    x2Try,
    trialLast("ex2.answer", "2000", "12", "1010.00", 2),
    given("ex2.err_zero", "0.00"),
    flatTrialFact("ex2.err_flat", "2000", "12", "1010.00", 2),
    // Exercise 3.
    x3Pay,
    x3Part,
    x3IntAll,
    x3IntPart,
    repMonthly("ex3.monthly", "6"),
    baseFact("ex3.base", "6"),
    factorFact("ex3.f1", "6", 1),
    factorFact("ex3.f2", "6", 2),
    sumFact("ex3.S", "6", 2),
    repSum("ex3.err_first_equal", [x3Part, x3IntAll]),
    repSum("ex3.err_half_plus", [x3Part, x3IntPart]),
    // Exercise 4.
    x4,
    repPayment("ex4.answer", "300000", "4.2", 240),
    repPayment("ex4.err_annual", "300000", "50.4", 240),
    repPayment("ex4.err_years", "300000", "4.2", 20),
    repMonths("ex4.months", 20),
    repPayment("ex4.err_percent", "300000", "420", 240),
    monthlyFact("ex4.monthly", "4.2"),
    baseFact("ex4.base", "4.2"),
    // Exercise 5.
    x5,
    repPayment("ex5.answer", "400000", "5.4", 180),
    repPayment("ex5.err_years", "400000", "5.4", 15),
    repPayment("ex5.err_annual", "400000", "64.8", 180),
    monthlyFact("ex5.monthly", "5.4"),
    baseFact("ex5.base", "5.4"),
    repMonths("ex5.months", 15),
    // Exercise 6.
    x6,
    sumFact("ex6.S", "4.5", 300),
    paymentsTotal("ex6.err_no_discount", "4000.00", 300),
    pvFact("ex6.err_annual", "4000.00", "54", 300),
    monthlyFact("ex6.monthly", "4.5"),
    baseFact("ex6.base", "4.5"),
    pvFact("ex6.err_years", "4000.00", "4.5", 25),
    repMonths("ex6.months", 25),
    stepsFact("ex6.steps", "4000", "4.5", 300),
  ];

  return {
    lesson: "3.1",
    title: "מאיפה בא החזר השפיצר",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12; each month's interest rounded to the agora; the level payment rounded once; the last month takes what is left.",
    facts,
  };
}
