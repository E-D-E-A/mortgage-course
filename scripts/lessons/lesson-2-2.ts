/**
 * Lesson 2.2 — fixed and variable rates, and "a fixed rate is not a fixed
 * payment". Every number the lesson and its exercises show is declared here as
 * a fact; the page reads data/lessons/2-2.json, and checks/kinds/tracks.py
 * recomputes each computed one.
 *
 * All amounts, rates and the inflation are invented teaching numbers. The
 * yearly examples pay once a year so they can be done in the head; the
 * monthly ones use the division rule (annual ÷ 12, lesson 0.4). Equal-payment
 * tables round each year's interest to the agora, as a statement does.
 */
import Decimal from "decimal.js";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  annuityFactor,
  discountFactor,
  equalPayment,
  equalPaymentPath,
  equalPrincipalMonth,
  indexedPayment,
  monthlyByDivision,
  yearInterest,
} from "../../src/lib/calc/tracks.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

type Part = "balance" | "principal" | "interest" | "payment";

/** Yearly equal principal: loan ÷ years of principal each year, plus a year's interest on what is still owed. */
function epYear(loan: string, years: number, rate: string, year: number) {
  const principal = new Decimal(loan).div(years);
  const balance = new Decimal(loan).minus(principal.mul(year - 1));
  const interest = yearInterest(balance, rate);
  return { balance, principal, interest, payment: principal.plus(interest) };
}

const epYearFact = (id: string, loan: string, years: number, rate: string, year: number, part: Part): Fact => ({
  id,
  kind: "trk_ep_year",
  inputs: { loan, years, rate, year, part },
  value: moneyString(epYear(loan, years, rate, year)[part]),
});

const epYearTable = (id: string, loan: string, years: number, rate: string): Fact => ({
  id,
  kind: "trk_ep_year_table",
  inputs: { loan, years, rate },
  value: Array.from({ length: years }, (_, i) => {
    const r = epYear(loan, years, rate, i + 1);
    return {
      period: i + 1,
      opening: moneyString(r.balance),
      interest: moneyString(r.interest),
      principal: moneyString(r.principal),
      payment: moneyString(r.payment),
    };
  }),
});

const epMonth = (id: string, loan: string, months: number, rate: string, month: number, part: Part): Fact => ({
  id,
  kind: "trk_ep_month",
  inputs: { loan, months, rate, month, part },
  value: moneyString(equalPrincipalMonth(loan, months, rate, month)[part]),
});

const epMonthTable = (id: string, loan: string, months: number, rate: string, list: number[]): Fact => ({
  id,
  kind: "trk_ep_month_table",
  inputs: { loan, months, rate, ...Object.fromEntries(list.map((m, n) => [`month_${n + 1}`, m])) },
  value: list.map((m) => {
    const r = equalPrincipalMonth(loan, months, rate, m);
    return { period: m, opening: moneyString(r.balance), interest: moneyString(r.interest), payment: moneyString(r.payment) };
  }),
});

const discount = (id: string, rate: string, period: number, decimals = 6): Fact => ({
  id,
  kind: "trk_discount",
  inputs: { rate, period, decimals },
  value: discountFactor(rate, period).toFixed(decimals, Decimal.ROUND_HALF_UP),
});

const factor = (id: string, rate: string, periods: number, decimals = 6): Fact => ({
  id,
  kind: "trk_annuity_factor",
  inputs: { rate, periods, decimals },
  value: annuityFactor(rate, periods).toFixed(decimals, Decimal.ROUND_HALF_UP),
});

const payment = (id: string, loan: string, rate: string, periods: number): Fact => ({
  id,
  kind: "trk_equal_payment",
  inputs: { loan, rate, periods },
  value: moneyString(equalPayment(loan, rate, periods)),
});

const path = (id: string, loan: string, rates: string[]): Fact => ({
  id,
  kind: "trk_payment_path",
  inputs: { loan, ...Object.fromEntries(rates.map((r, n) => [`rate_${n + 1}`, r])) },
  value: equalPaymentPath(loan, rates).map((r) => ({
    period: r.period,
    rate: plainNumber(r.ratePercent),
    opening: moneyString(r.opening),
    interest: moneyString(r.interest),
    principal: moneyString(r.principal),
    payment: moneyString(r.payment),
    closing: moneyString(r.closing),
  })),
});

const indexed = (id: string, base: string, inflation: string, years: number): Fact => ({
  id,
  kind: "trk_indexed_payment",
  inputs: { payment: base, inflation, years },
  value: moneyString(indexedPayment(base, inflation, years)),
});

const monthly = (id: string, annual: string): Fact => ({
  id,
  kind: "trk_monthly",
  inputs: { annual, decimals: 4 },
  value: monthlyByDivision(annual).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toString(),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export default function lesson22(): LessonData {
  const LOAN = "42000";

  // Way B: equal payments at a fixed 5%.
  const bPay = payment("b.payment", LOAN, "5", 3);
  const bPath = path("b.table", LOAN, ["5", "5", "5"]);
  // Way C: equal payments, the rate rises to 7% from year 2.
  const cPath = path("c.table", LOAN, ["5", "7", "7"]);
  const cRows = cPath.value as { payment: string; closing: string }[];
  const cPay2 = payment("c.payment_2", cRows[0].closing, "7", 2);
  // Way D: equal payments at a fixed 5% on an indexed debt, the index rising 2% a year.
  const base = bPay.value as string;

  // Worked example: a 360,000 ₪ track over 360 months at a fixed 4.8%, equal principal.
  const w1 = epMonth("worked.m1_payment", "360000", 360, "4.8", 1, "payment");
  const w2 = epMonth("worked.m2_payment", "360000", 360, "4.8", 2, "payment");
  const w61 = epMonth("worked.m61_payment", "360000", 360, "4.8", 61, "payment");
  const w61Up = epMonth("worked.m61_payment_up", "360000", 360, "6", 61, "payment");

  // Exercise 6: equal payments on 20,000 ₪, 6% in year 1 and 8% in year 2.
  const ex6 = path("ex6.path", "20000", ["6", "8"]);

  const facts: Fact[] = [
    given("ex.loan", LOAN),
    given("ex.years", "3"),
    given("ex.rate", "5"),
    given("ex.rate_up", "7"),
    given("ex.inflation", "2"),

    // Way A: equal principal at a fixed 5%.
    epYearTable("a.table", LOAN, 3, "5"),

    // Way B.
    discount("b.factor_1", "5", 1),
    discount("b.factor_2", "5", 2),
    discount("b.factor_3", "5", 3),
    factor("b.factor_sum", "5", 3),
    bPay,
    bPath,

    // Way C.
    cPath,
    cPay2,
    difference("c.rise", cPay2, bPay),

    // Way D.
    indexed("d.payment_1", base, "2", 1),
    indexed("d.payment_2", base, "2", 2),
    indexed("d.payment_3", base, "2", 3),

    // Worked example.
    given("worked.loan", "360000"),
    given("worked.months", "360"),
    given("worked.rate", "4.8"),
    given("worked.rate_up", "6"),
    monthly("worked.monthly_rate", "4.8"),
    monthly("worked.monthly_rate_up", "6"),
    epMonth("worked.principal", "360000", 360, "4.8", 1, "principal"),
    epMonth("worked.m1_interest", "360000", 360, "4.8", 1, "interest"),
    w1,
    epMonth("worked.m2_balance", "360000", 360, "4.8", 2, "balance"),
    epMonth("worked.m2_interest", "360000", 360, "4.8", 2, "interest"),
    w2,
    difference("worked.m2_drop", w1, w2),
    epMonth("worked.m121_balance", "360000", 360, "4.8", 121, "balance"),
    epMonth("worked.m121_interest", "360000", 360, "4.8", 121, "interest"),
    epMonth("worked.m121_payment", "360000", 360, "4.8", 121, "payment"),
    epMonth("worked.m360_balance", "360000", 360, "4.8", 360, "balance"),
    epMonth("worked.m360_payment", "360000", 360, "4.8", 360, "payment"),
    epMonth("worked.m61_balance", "360000", 360, "4.8", 61, "balance"),
    epMonth("worked.m61_interest", "360000", 360, "4.8", 61, "interest"),
    w61,
    epMonth("worked.m61_interest_up", "360000", 360, "6", 61, "interest"),
    w61Up,
    difference("worked.m61_rise", w61Up, w61),

    // Half-worked table: 240,000 ₪ over 240 months at a fixed 6%, equal principal.
    given("half.loan", "240000"),
    given("half.months", "240"),
    given("half.rate", "6"),
    monthly("half.monthly_rate", "6"),
    epMonth("half.principal", "240000", 240, "6", 1, "principal"),
    epMonthTable("half.table", "240000", 240, "6", [1, 2, 13, 121]),

    // Exercise 2: yearly equal principal, 60,000 ₪, 4 years, 6% — the payment in year 2.
    epYearFact("ex2.answer", "60000", 4, "6", 2, "payment"),
    epYearFact("ex2.year1", "60000", 4, "6", 1, "payment"),
    epYearFact("ex2.principal", "60000", 4, "6", 2, "principal"),
    epYearFact("ex2.interest", "60000", 4, "6", 2, "interest"),
    epYearFact("ex2.balance", "60000", 4, "6", 2, "balance"),

    // Exercise 4: monthly equal principal on 180,000 ₪ left over 180 months; the rate moves from 5.4% to 6%.
    epMonth("ex4.before", "180000", 180, "5.4", 1, "payment"),
    epMonth("ex4.answer", "180000", 180, "6", 1, "payment"),
    epMonth("ex4.interest", "180000", 180, "6", 1, "interest"),
    epMonth("ex4.principal", "180000", 180, "6", 1, "principal"),
    monthly("ex4.monthly", "6"),

    // Exercise 5: equal payments on 20,000 ₪ over 2 years at 6%.
    payment("ex5.answer", "20000", "6", 2),
    epYearFact("ex5.ep_year1", "20000", 2, "6", 1, "payment"),
    epYearFact("ex5.no_interest", "20000", 2, "6", 1, "principal"),
    { id: "ex5.half_plus", kind: "trk_plain_owed", inputs: { amount: "10000", rate: "6" }, value: moneyString(new Decimal("10000").mul("1.06")) },
    // Eight places, so the two printed factors add up to the printed sum (0.94339623 + 0.88999644 = 1.83339267).
    discount("ex5.factor_1", "6", 1, 8),
    discount("ex5.factor_2", "6", 2, 8),
    factor("ex5.factor_sum", "6", 2, 8),

    // Exercise 6.
    ex6,
  ];

  return {
    lesson: "2.2",
    title: "קבועה מול משתנה, ו״ריבית קבועה מול תשלום קבוע״",
    note: "Invented teaching numbers. Yearly examples for head arithmetic; monthly ones by annual ÷ 12. Equal-payment tables round each period's interest to the agora; the payment is re-set when the rate changes.",
    facts,
  };
}
