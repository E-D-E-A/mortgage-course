/**
 * Lesson 2.7 — the variable tracks, linked and unlinked: the rate is an anchor
 * plus a fixed spread, set again at update points every few years. Every number
 * the lesson and its exercises show is declared here as a fact; the page reads
 * data/lessons/2-7.json, and checks/kinds/amortization.py (with lending.py for an
 * anchor plus a spread) recomputes each one.
 *
 * Teaching numbers: loans, anchors, spreads and anchor paths are invented.
 * Dated data, not verified ("לא אומת"): the average anchor, spread and rate of new
 * CPI-linked variable loans in February 2026 (Bank of Israel series as recorded in
 * the Brain, page 67469313), and the ₪60 cap on the operational charge at an exit
 * point (the Banking Order on early repayment as transcribed in the Brain, 7798786).
 *
 * The level payment comes from amortization.ts and is shown as a computed result
 * (taught in 3.1). At an update the payment is recalculated on the balance left
 * over the months left: the course's calculation assumption.
 */
import Decimal from "decimal.js";
import {
  annuityBalance,
  annuityPayment,
  blockPath,
  indexPath,
  monthInterest,
  monthsToNextUpdate,
  nextUpdateMonth,
  pathSchedule,
  primeTrackRate,
  updateMonths,
} from "../../src/lib/calc/amortization.ts";
import { indexedBalance, plainNumber } from "../../src/lib/calc/indexation.ts";
import { yearInterest } from "../../src/lib/calc/lending.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

/** An anchor plus a (signed) spread: the rate of a variable track. */
const rateOf = (id: string, anchor: string, spread: string): Fact => ({
  id,
  kind: "lend_rate_sum",
  inputs: { a: anchor, b: spread },
  value: plainNumber(primeTrackRate(anchor, spread)),
});

const payment = (id: string, principal: string, rate: string, months: number): Fact => ({
  id,
  kind: "amort_payment",
  inputs: { principal, rate_percent: rate, months },
  value: moneyString(annuityPayment(principal, rate, months)),
});

const balance = (id: string, principal: string, rate: string, months: number, paid: number): Fact => ({
  id,
  kind: "amort_balance",
  inputs: { principal, rate_percent: rate, months, paid },
  value: moneyString(annuityBalance(principal, rate, months, paid)),
});

const interest = (id: string, amount: string, rate: string): Fact => ({
  id,
  kind: "amort_month_interest",
  inputs: { balance: amount, rate_percent: rate },
  value: moneyString(monthInterest(amount, rate)),
});

const points = (id: string, term: number, interval: number): Fact => ({
  id,
  kind: "amort_update_points",
  inputs: { term_months: term, interval_months: interval },
  value: updateMonths(term, interval),
});

const years = (id: string, term: number, interval: number): Fact => ({
  id,
  kind: "amort_update_years",
  inputs: { term_months: term, interval_months: interval },
  value: updateMonths(term, interval).map((m) => plainNumber(new Decimal(m).div(12))),
});

const count = (id: string, term: number, interval: number): Fact => ({
  id,
  kind: "amort_update_count",
  inputs: { term_months: term, interval_months: interval },
  value: String(updateMonths(term, interval).length),
});

const toNext = (id: string, term: number, interval: number, now: number): Fact => ({
  id,
  kind: "amort_months_to_update",
  inputs: { term_months: term, interval_months: interval, now },
  value: String(monthsToNextUpdate(term, interval, now)),
});

/** A linked variable track: the rate held per block of `block` months, the index rising `inflation` a year. */
const linkedPath = (principal: string, months: number, block: number, rates: string[], inflation: string) => ({
  inputs: { principal, months, block_months: block, ...Object.fromEntries(rates.map((r, i) => [`rate_${i + 1}`, r])), inflation_1: inflation, inflation_block_months: months },
  rows: pathSchedule(principal, blockPath(rates, block, months), indexPath([inflation], months, months)),
});

const linkedPayment = (id: string, principal: string, months: number, block: number, rates: string[], inflation: string, month: number): Fact => {
  const p = linkedPath(principal, months, block, rates, inflation);
  return { id, kind: "amort_path_payment", inputs: { ...p.inputs, month }, value: moneyString(p.rows[month - 1].payment) };
};

const grown = (id: string, amount: string, inflation: string, years: number): Fact => ({
  id,
  kind: "infl_indexed_balance",
  inputs: { amount, inflation_percent: inflation, years },
  value: moneyString(indexedBalance(amount, inflation, years)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

/** A variable track's rate at each update: anchor plus spread. */
const anchorTable = (id: string, spread: string, rows: { year: number; anchor: string }[]): Fact => ({
  id,
  kind: "amort_anchor_table",
  inputs: { spread, ...Object.fromEntries(rows.flatMap((r, i) => [[`year_${i + 1}`, r.year], [`anchor_${i + 1}`, r.anchor]])) },
  value: rows.map((r) => ({ period: r.year, anchor: plainNumber(r.anchor), rate: plainNumber(primeTrackRate(r.anchor, spread)) })),
});

const v = (f: Fact) => f.value as string;

export default function lesson27(): LessonData {
  // Explanation: an unlinked variable track, 500,000 ₪ for 20 years, updated every 5 years.
  const P = "500000";
  const N = 240;
  const rate = rateOf("explain.rate", "3.5", "1.2");
  const pay = payment("explain.payment", P, v(rate), N);
  const left = balance("explain.left_60", P, v(rate), N, 60);
  const rateUp = rateOf("explain.rate_up", "4.5", "1.2");
  const payUp = payment("explain.payment_up", v(left), v(rateUp), 180);

  // The linked variable track: anchor 1.8 + spread 1.45, the index up 2% a year; at year 5 the anchor is 2.3.
  const lRate = rateOf("linked.rate", "1.8", "1.45");
  const lRateUp = rateOf("linked.rate_up", "2.3", "1.45");
  const lRates = [v(lRate), v(lRateUp)];
  // Worked the way 2.5 teaches: the original schedule's payment, times the index.
  const lPlain = payment("linked.plain_payment", P, v(lRate), N);
  const lYear1 = grown("linked.year1", v(lPlain), "2", 1);
  const lYear5 = grown("linked.year5", v(lPlain), "2", 5);
  const lLeftPlain = balance("linked.left_60_plain", P, v(lRate), N, 60);
  const lLeft = grown("linked.left_60", v(lLeftPlain), "2", 5);
  const lNew = payment("linked.new_payment", v(lLeft), v(lRateUp), 180);
  // The month-by-month engine gives the same end-of-year payments (checks, not shown).
  const l12 = linkedPayment("linked.path_12", P, N, 60, lRates, "2", 12);
  const l60 = linkedPayment("linked.path_60", P, N, 60, lRates, "2", 60);

  // Worked example (a separate exercise, not case A): Ori and Maya consider 400,000 ₪ unlinked variable every 5 years, 25 years.
  const W = "400000";
  const WN = 300;
  const wRate = rateOf("worked.rate", "3.5", "1.2");
  const wPay = payment("worked.payment", W, v(wRate), WN);
  const wLeft = balance("worked.left_60", W, v(wRate), WN, 60);
  const wUp = rateOf("worked.rate_up", "4.5", "1.2");
  const wUpPay = payment("worked.payment_up", v(wLeft), v(wUp), WN - 60);
  const wDown = rateOf("worked.rate_down", "2.5", "1.2");
  const wDownPay = payment("worked.payment_down", v(wLeft), v(wDown), WN - 60);

  const facts: Fact[] = [
    // Explanation.
    given("explain.anchor", "3.5"),
    given("explain.spread", "1.2"),
    rate,
    given("case.amount", "500000.00"),
    pay,
    points("explain.points", N, 60),
    count("explain.count", N, 60),
    { id: "explain.intervals", kind: "amort_update_count_with_end", inputs: { term_months: N, interval_months: 60 }, value: String(Math.floor(N / 60)) },
    years("explain.point_years", N, 60),
    left,
    given("explain.anchor_up", "4.5"),
    rateUp,
    payUp,
    difference("explain.payment_rise", payUp, pay),
    interest("explain.interest_before", v(left), v(rate)),
    interest("explain.interest_after", v(left), v(rateUp)),

    // February 2026 averages for new CPI-linked variable loans (Brain 67469313; not verified).
    given("market.month", "2026-02"),
    given("market.anchor", "1.81"),
    given("market.spread", "1.45"),
    given("market.rate", "3.26"),

    // The linked variable track.
    lRate,
    lRateUp,
    lPlain,
    lYear1,
    lYear5,
    lLeftPlain,
    lLeft,
    lNew,
    difference("linked.rate_part", lNew, lYear5),
    l12,
    l60,

    // Published update intervals in years, by track, from the Brain appendix (67436545, public sites, 2026-10-07; not verified).
    given("survey.date", "2026-10-07"),
    given("survey.linked", ["1", "2", "2.5", "3", "5", "6", "7", "10"]),
    given("survey.unlinked", ["1", "2", "3", "5", "7", "10"]),
    given("survey.single", "5"),
    given("survey.assumed", "5"),

    // Exit point (Banking Order, as transcribed; not verified).
    given("exit.max", "60"),
    given("exit.notice_min", "10"),
    given("exit.notice_max", "45"),

    // The illustration's guided tasks.
    points("slider.points_20_5", 240, 60),
    count("slider.count_20_5", 240, 60),
    count("slider.count_20_2_5", 240, 30),
    years("slider.years_20_2_5", 240, 30),
    toNext("slider.next_38", 240, 60, 38),
    count("slider.count_25_5", 300, 60),

    // Worked example.
    given("worked.amount", "400000.00"),
    wRate,
    wPay,
    years("worked.point_years", WN, 60),
    wLeft,
    wUp,
    wUpPay,
    difference("worked.rise", wUpPay, wPay),
    wDown,
    wDownPay,
    difference("worked.fall", wPay, wDownPay),

    // Half-worked table: a linked variable track, spread 1.45, anchors at each update.
    anchorTable("half.table", "1.45", [
      { year: 0, anchor: "1.8" },
      { year: 5, anchor: "2.3" },
      { year: 10, anchor: "1.6" },
      { year: 15, anchor: "2.05" },
    ]),

    // Exercise 2: anchor 3.9, spread 0.95; the mistake of subtracting the spread.
    rateOf("ex2.subtracted", "3.9", "-0.95"),
    rateOf("ex2.answer", "3.9", "0.95"),
    // Exercise 3: 25 years, every 5 years.
    count("ex3.answer", 300, 60),
    // The mistakes: counting the last day as an update, or the first and the last.
    { id: "ex3.with_end", kind: "amort_update_count_with_end", inputs: { term_months: 300, interval_months: 60 }, value: String(Math.floor(300 / 60)) },
    { id: "ex3.with_ends", kind: "amort_update_count_with_ends", inputs: { term_months: 300, interval_months: 60 }, value: String(Math.floor(300 / 60) + 1) },
    // Exercise 4: every 2.5 years, 40 months since the loan began.
    toNext("ex4.answer", 360, 30, 40),
    { id: "ex4.next", kind: "amort_next_update", inputs: { term_months: 360, interval_months: 30, now: 40 }, value: String(nextUpdateMonth(360, 30, 40)) },
    // The mistake: answering how long ago the last update was.
    {
      id: "ex4.since_last",
      kind: "amort_months_since_update",
      inputs: { term_months: 360, interval_months: 30, now: 40 },
      value: String(40 - Math.max(0, ...updateMonths(360, 30).filter((k) => k <= 40))),
    },
    // Prediction: two years in, the next update (every 5 years) is this many months away.
    toNext("prediction.wait", 240, 60, 24),
    // New exercise: next month's interest at an update, 300,000 ₪ at 5.4%.
    interest("ex7.answer", "300000", "5.4"),
    { id: "ex7.year", kind: "lend_year_interest", inputs: { amount: "300000", rate_percent: "5.4" }, value: moneyString(yearInterest("300000", "5.4")) },
    interest("ex7.tenfold", "300000", "54"),
    // New exercise: the spread mistake (today's anchor subtracted from an old rate).
    { id: "ex8.wrong_spread", kind: "lend_rate_change", inputs: { before: "3.9", after: "4.85" }, value: plainNumber(new Decimal("4.85").minus("3.9")) },
    // Exercise 5: the anchor 3.5 → 4.25 at the update, spread 1.2.
    rateOf("ex5.answer", "4.25", "1.2"),
    rateOf("ex5.old", "3.5", "1.2"),
  ];

  return {
    lesson: "2.7",
    title: "משתנה צמודה ולא צמודה",
    note: "Invented teaching numbers: loans, anchors, spreads and anchor paths are illustrations, not market data or a forecast. February 2026 averages (Brain 67469313) and the exit-point charge and notice (Brain 7798786) are not verified. Level payments from amortization.ts; at an update the payment is recalculated on the balance left over the months left.",
    facts,
  };
}
