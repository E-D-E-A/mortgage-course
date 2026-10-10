/**
 * Lesson 2.9 — Spitzer and equal principal: the intuition. Every number the
 * lesson, its exercises, its illustration's guided tasks and its video show is
 * declared here as a fact; checks/kinds/repayment.py recomputes each one.
 *
 * Inputs are teaching numbers, not market rates. Monthly rate = annual ÷ 12
 * (lesson 0.4; Brain ENG-223). The helpers below are shared with lessons 2.8
 * and 2.10, which import them from this file.
 */
import Decimal from "decimal.js";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { shareOf, sliceAmount } from "../../src/lib/calc/mix.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentOf } from "../../src/lib/calc/percent.ts";
import { annuityPayment, annuityStatement, equalPrincipalStatement, monthlyRate } from "../../src/lib/calc/amortization.ts";
import { crossoverMonth, type Method, type ScheduleRow, schedule, totalInterest, totalPaid } from "../../src/lib/calc/repayment.ts";
import type { Fact, LessonData } from "../build-data.ts";

export const given = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

const loanInputs = (method: Method, principal: string, annual: string, months: number, grace?: number) => ({
  method,
  principal,
  annual_percent: annual,
  months,
  ...(grace === undefined ? {} : { grace_months: grace }),
});
const rowsOf = (method: Method, principal: string, annual: string, months: number, grace?: number) =>
  schedule(method, { principal, annualPercent: annual, months, graceMonths: grace });

const rowStrings = (r: ScheduleRow) => ({
  period: r.period,
  opening: moneyString(r.opening),
  interest: moneyString(r.interest),
  principal: moneyString(r.principal),
  payment: moneyString(r.payment),
  closing: moneyString(r.closing),
});

export type Field = "opening" | "interest" | "principal" | "payment" | "closing";

/**
 * The whole month-by-month table. Spitzer and equal principal are the shared
 * statement kinds of amortization.ts (amort_annuity_statement,
 * amort_equal_statement); grace and bullet are this lesson group's rep_schedule.
 */
export const repSchedule = (id: string, method: Method, principal: string, annual: string, months: number, grace?: number): Fact => {
  if (method === "spitzer" || method === "equal_principal") {
    const rows = method === "spitzer" ? annuityStatement(principal, annual, months) : equalPrincipalStatement(principal, annual, months);
    return {
      id,
      kind: method === "spitzer" ? "amort_annuity_statement" : "amort_equal_statement",
      inputs: { principal, rate_percent: annual, months },
      value: rows.map((r) => ({
        period: r.month,
        opening: moneyString(r.opening),
        payment: moneyString(r.payment),
        interest: moneyString(r.interest),
        principal_paid: moneyString(r.principalPaid),
        closing: moneyString(r.closing),
      })),
    };
  }
  return {
    id,
    kind: "rep_schedule",
    inputs: loanInputs(method, principal, annual, months, grace),
    value: rowsOf(method, principal, annual, months, grace).map(rowStrings),
  };
};

/** One cell of the table: month `period`, column `field`. */
export const repCell = (id: string, method: Method, principal: string, annual: string, months: number, period: number, field: Field, grace?: number): Fact => ({
  id,
  kind: "rep_cell",
  inputs: { ...loanInputs(method, principal, annual, months, grace), period, field },
  value: rowStrings(rowsOf(method, principal, annual, months, grace)[period - 1])[field],
});

export const repTotalPaid = (id: string, method: Method, principal: string, annual: string, months: number, grace?: number): Fact => ({
  id,
  kind: "rep_total_paid",
  inputs: loanInputs(method, principal, annual, months, grace),
  value: moneyString(totalPaid(rowsOf(method, principal, annual, months, grace))),
});

export const repTotalInterest = (id: string, method: Method, principal: string, annual: string, months: number, grace?: number): Fact => ({
  id,
  kind: "rep_total_interest",
  inputs: loanInputs(method, principal, annual, months, grace),
  value: moneyString(totalInterest(rowsOf(method, principal, annual, months, grace))),
});

/** The level payment, amortization.ts's kind. */
export const repPayment = (id: string, principal: string, annual: string, months: number): Fact => ({
  id,
  kind: "amort_payment",
  inputs: { principal, rate_percent: annual, months },
  value: moneyString(annuityPayment(principal, annual, months)),
});

/** The monthly rate by division (lesson 0.4's kind), to two decimals. */
export const repMonthly = (id: string, annual: string): Fact => ({
  id,
  kind: "monthly_rate_by_division",
  inputs: { annual_percent: annual, periods_per_year: 12, decimals: 2 },
  value: monthlyRate(annual).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString(),
});

export const repMonths = (id: string, years: number): Fact => ({ id, kind: "rep_months_in_years", inputs: { years }, value: years * 12 });

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

/** A sum of money facts. */
export const repSum = (id: string, parts: Fact[]): Fact => ({
  id,
  kind: "rep_sum",
  inputs: { facts: parts.map((p) => p.id).join("|") },
  value: moneyString(parts.reduce((s, p) => s.plus(p.value as string), new Decimal(0))),
});

export const percentOfFact = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "percent_of",
  inputs: { amount, rate_percent: rate },
  value: moneyString(percentOf(amount, rate)),
});

export const slice = (id: string, loan: string, weight: string, total: string): Fact => ({
  id,
  kind: "mix_slice",
  inputs: { loan, weight, total_weight: total },
  value: moneyString(sliceAmount(loan, weight, total)),
});

export const share = (id: string, amount: string, loan: string): Fact => ({
  id,
  kind: "mix_share",
  inputs: { amount, loan },
  value: plainNumber(shareOf(amount, loan)),
});

export default function lesson29(): LessonData {
  // ── The explanation: 60,000 ₪ at 6% a year (0.5% a month), three months. ──
  const E = ["60000", "6", 3] as const;
  const eSpitzerInterest = repTotalInterest("explain.spitzer_interest", "spitzer", ...E);
  const eEqualInterest = repTotalInterest("explain.equal_interest", "equal_principal", ...E);
  const eSpitzerClose1 = repCell("explain.spitzer_close_1", "spitzer", ...E, 1, "closing");
  const eEqualClose1 = repCell("explain.equal_close_1", "equal_principal", ...E, 1, "closing");
  const eSpitzerInt2 = repCell("explain.spitzer_int_2", "spitzer", ...E, 2, "interest");
  const eEqualInt2 = repCell("explain.equal_int_2", "equal_principal", ...E, 2, "interest");
  const eSpitzerPay = repPayment("explain.spitzer_pay", ...E);
  const eInt1 = repCell("explain.int_1", "spitzer", ...E, 1, "interest");
  const eSpitzerPrin1 = repCell("explain.spitzer_prin_1", "spitzer", ...E, 1, "principal");

  // ── The illustration's defaults (and the video): 600,000 ₪, 4.8% a year, 20 years. ──
  const S = ["600000", "4.8", 240] as const;
  const sSpitzerInterest = repTotalInterest("slider.spitzer_interest", "spitzer", ...S);
  const sEqualInterest = repTotalInterest("slider.equal_interest", "equal_principal", ...S);
  const sSpitzerFirst = repCell("slider.spitzer_first", "spitzer", ...S, 1, "payment");
  const sEqualFirst = repCell("slider.equal_first", "equal_principal", ...S, 1, "payment");
  const sSpitzerInterest30 = repTotalInterest("slider.spitzer_interest_30", "spitzer", "600000", "4.8", 360);
  const sEqualPart = repCell("slider.equal_part", "equal_principal", ...S, 1, "principal");
  const sEqualDrop = percentOfFact("slider.equal_drop", sEqualPart.value as string, monthlyRate("4.8").toString());
  const sEqualLast = repCell("slider.equal_last", "equal_principal", ...S, 240, "payment");

  // ── Worked example: 400,000 ₪ at 5.4% (0.45% a month) for 15 years. ──
  const W = ["400000", "5.4", 180] as const;
  const wEqualFirst = repCell("worked.equal_first", "equal_principal", ...W, 1, "payment");
  const wSpitzerPay = repPayment("worked.spitzer_pay", ...W);
  const wInt1 = repCell("worked.int_1", "spitzer", ...W, 1, "interest");
  const wSpitzerInterest = repTotalInterest("worked.spitzer_interest", "spitzer", ...W);
  const wEqualInterest = repTotalInterest("worked.equal_interest", "equal_principal", ...W);

  // ── Exercises. ──
  // 2–4: 120,000 ₪ over 10 years (120 months) in equal principal, at 6% a year.
  const x = ["120000", "6", 120] as const;
  const x3Interest1 = repCell("ex3.interest_1", "equal_principal", ...x, 1, "interest");
  const x3Part = repCell("ex2.answer", "equal_principal", ...x, 1, "principal");
  const x3Annual = percentOfFact("ex3.annual_interest", "120000", "6");
  // 5: Spitzer, 200,000 ₪ at 3.6% (0.3% a month) for 20 years.
  const x5Pay = repPayment("ex5.payment", "200000", "3.6", 240);
  const x5Interest = repCell("ex5.interest_1", "spitzer", "200000", "3.6", 240, 1, "interest");

  const ex6First = repCell("ex6.interest_1", "equal_principal", "12000", "6", 12, 1, "interest");
  const ex6Last = repCell("ex6.interest_12", "equal_principal", "12000", "6", 12, 12, "interest");

  const facts: Fact[] = [
    given("explain.loan", "60000.00"),
    repMonthly("explain.monthly", "6"),
    repSchedule("explain.equal", "equal_principal", ...E),
    repSchedule("explain.spitzer", "spitzer", ...E),
    repCell("explain.equal_part", "equal_principal", ...E, 1, "principal"),
    eInt1,
    eSpitzerPay,
    eSpitzerPrin1,
    eSpitzerClose1,
    eEqualClose1,
    difference("explain.close_gap_1", eSpitzerClose1, eEqualClose1),
    eSpitzerInt2,
    eEqualInt2,
    eSpitzerInterest,
    eEqualInterest,
    difference("explain.interest_gap", eSpitzerInterest, eEqualInterest),
    repTotalPaid("explain.spitzer_paid", "spitzer", ...E),
    repTotalPaid("explain.equal_paid", "equal_principal", ...E),

    // Illustration and video.
    repMonths("slider.months", 20),
    repMonthly("slider.monthly", "4.8"),
    repCell("slider.int_1", "spitzer", ...S, 1, "interest"),
    sSpitzerFirst,
    sEqualFirst,
    difference("slider.first_gap", sEqualFirst, sSpitzerFirst),
    repCell("slider.spitzer_prin_1", "spitzer", ...S, 1, "principal"),
    sEqualPart,
    sEqualDrop,
    sEqualLast,
    repCell("slider.spitzer_last_int", "spitzer", ...S, 240, "interest"),
    repCell("slider.spitzer_last", "spitzer", ...S, 240, "payment"),
    repCell("slider.spitzer_half", "spitzer", ...S, 120, "closing"),
    repCell("slider.equal_half", "equal_principal", ...S, 120, "closing"),
    { id: "slider.crossover", kind: "rep_crossover_month", inputs: { principal: "600000", annual_percent: "4.8", months: 240 }, value: crossoverMonth(...S) },
    sSpitzerInterest,
    sEqualInterest,
    difference("slider.interest_gap", sSpitzerInterest, sEqualInterest),
    repTotalPaid("slider.spitzer_paid", "spitzer", ...S),
    repTotalPaid("slider.equal_paid", "equal_principal", ...S),
    repCell("slider.spitzer_first_30", "spitzer", "600000", "4.8", 360, 1, "payment"),
    sSpitzerInterest30,
    difference("slider.interest_30_gap", sSpitzerInterest30, sSpitzerInterest),
    repSchedule("video.spitzer", "spitzer", ...S),
    repSchedule("video.equal", "equal_principal", ...S),

    // Worked example.
    given("worked.loan", "400000.00"),
    repMonths("worked.months", 15),
    repMonthly("worked.monthly", "5.4"),
    repCell("worked.equal_part", "equal_principal", ...W, 1, "principal"),
    wInt1,
    wEqualFirst,
    wSpitzerPay,
    repCell("worked.spitzer_prin_1", "spitzer", ...W, 1, "principal"),
    difference("worked.first_gap", wEqualFirst, wSpitzerPay),
    wSpitzerInterest,
    wEqualInterest,
    difference("worked.interest_gap", wSpitzerInterest, wEqualInterest),
    repCell("worked.spitzer_half", "spitzer", ...W, 90, "closing"),

    // Half-worked table: 90,000 ₪ at 4.8% (0.4% a month), three months, equal principal.
    repSchedule("half.equal", "equal_principal", "90000", "4.8", 3),
    repCell("half.part", "equal_principal", "90000", "4.8", 3, 1, "principal"),

    // Exercise 2: the monthly principal part, and the mistake of dividing by years.
    x3Part,
    slice("ex2.err_per_year", "120000", "1", "10"),
    // Exercise 3: the first payment at 6% a year.
    repCell("ex3.answer", "equal_principal", ...x, 1, "payment"),
    x3Interest1,
    x3Annual,
    repSum("ex3.err_annual", [x3Part, x3Annual]),
    // Exercise 4: month 61.
    repCell("ex4.answer", "equal_principal", ...x, 61, "payment"),
    repCell("ex4.balance", "equal_principal", ...x, 61, "opening"),
    repCell("ex4.interest", "equal_principal", ...x, 61, "interest"),
    // Exercise 5: Spitzer's first principal part.
    x5Pay,
    x5Interest,
    repMonthly("ex5.monthly", "3.6"),
    repCell("ex5.answer", "spitzer", "200000", "3.6", 240, 1, "principal"),
    slice("ex5.err_equal", "200000", "1", "240"),
    // Exercise 6: total interest in equal principal, by hand.
    repTotalInterest("ex6.answer", "equal_principal", "12000", "6", 12),
    repCell("ex6.part", "equal_principal", "12000", "6", 12, 1, "principal"),
    ex6First,
    ex6Last,
    repSum("ex6.pair", [ex6First, ex6Last]),
    repTotalInterest("ex6.err_spitzer", "spitzer", "12000", "6", 12),
    repTotalInterest("ex6.err_bullet", "bullet_partial", "12000", "6", 12),
    repMonths("ex2.months", 10),
    repMonthly("ex3.monthly", "6"),
    percentOfFact("ex6.drop", "1000.00", "0.5"),
    repCell("ex6.interest_2", "equal_principal", "12000", "6", 12, 2, "interest"),
    repCell("ex6.interest_11", "equal_principal", "12000", "6", 12, 11, "interest"),
  ];

  return {
    lesson: "2.9",
    title: "שפיצר וקרן שווה: האינטואיציה",
    note: "Teaching numbers, not market rates. Monthly rate = annual ÷ 12; each month's interest rounded to the agora; the last month takes what is left.",
    facts,
  };
}
