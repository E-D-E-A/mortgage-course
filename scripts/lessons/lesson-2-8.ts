/**
 * Lesson 2.8 — eligibility tracks and special tracks: the eligibility loan and
 * its certificate, the target-price programme, foreign-currency tracks and
 * "other". Every number the lesson and its exercises show is declared here as
 * a fact; checks/kinds/repayment.py (and mix.py, percent.py for the kinds they
 * own) recompute each one.
 *
 * The official figures (the rate rule, the amounts, the target-price discount
 * and cap) are `given` facts: they come from search summaries of official
 * sources and are marked "לא אומת" in the lesson. Every other input is a
 * teaching number (rates, prices, exchange rates), not market data.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { cappedDiscount, cappedRateBelowAverage, exchangeLinkedBalance } from "../../src/lib/calc/repayment.ts";
import { remainder } from "../../src/lib/calc/mix.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, percentOfFact, share } from "./lesson-2-9.ts";

const rate = (id: string, average: string, below: string, cap: string): Fact => ({
  id,
  kind: "rep_capped_rate",
  inputs: { average_percent: average, below_points: below, cap_percent: cap },
  value: cappedRateBelowAverage(average, below, cap).toString(),
});

/** A rate moved by some points, without the cap (the learner's mistakes, and the step before the cap). */
const plusPoints = (id: string, ratePercent: string, points: string): Fact => ({
  id,
  kind: "rep_rate_plus_points",
  inputs: { rate_percent: ratePercent, points },
  value: new Decimal(ratePercent).plus(points).toString(),
});

const discount = (id: string, price: string, percent: string, cap: string): Fact => ({
  id,
  kind: "rep_capped_discount",
  inputs: { price, percent, cap },
  value: moneyString(cappedDiscount(price, percent, cap)),
});

const fx = (id: string, amount: string, rateAtStart: string, rateNow: string): Fact => ({
  id,
  kind: "rep_fx_balance",
  inputs: { amount, rate_at_start: rateAtStart, rate_now: rateNow },
  value: moneyString(exchangeLinkedBalance(amount, rateAtStart, rateNow)),
});

const units = (id: string, amount: string, rateNow: string): Fact => ({
  id,
  kind: "rep_fx_units",
  inputs: { amount, rate: rateNow },
  value: moneyString(new Decimal(amount).div(rateNow)),
});

const rest = (id: string, loan: string, others: string[]): Fact => ({
  id,
  kind: "mix_remainder",
  inputs: { loan, ...Object.fromEntries(others.map((a, n) => [`amount_${n + 1}`, a])) },
  value: moneyString(remainder(loan, others)),
});

/** One row of the target-price table: the price, 20% of it, the discount after the cap, the price after it. */
function targetRow(prefix: string, price: string): Fact[] {
  const p = given(`${prefix}.price`, moneyString(price));
  const pct = percentOfFact(`${prefix}.pct`, price, "20");
  const d = discount(`${prefix}.discount`, price, "20", "300000");
  return [p, pct, d, difference(`${prefix}.after`, p, d)];
}

export default function lesson28(): LessonData {
  // The worked example: a 1,600,000 ₪ flat, 400,000 ₪ of equity, a 120,000 ₪ eligibility loan.
  const price = given("worked.price", "1600000.00");
  const equity = given("worked.equity", "400000.00");
  const loan = difference("worked.loan", price, equity);
  const eligibility = given("worked.eligibility", "120000.00");
  const withEligibilityOnTop: Fact = {
    id: "worked.err_on_top",
    kind: "rep_sum",
    inputs: { facts: `${loan.id}|${eligibility.id}` },
    value: moneyString(new Decimal(loan.value as string).plus(eligibility.value as string)),
  };

  const fxUp = fx("fx.up", "375000", "3.75", "3.9");
  const fxAmount = given("fx.amount", "375000.00");

  const facts: Fact[] = [
    // The official figures (לא אומת; search summaries, read 2026-10-09).
    given("rule.below_points", "0.5"),
    given("rule.cap", "3"),
    given("rule.min_years", "10"),
    given("rule.max_years", "30"),
    given("rule.base_low_2023", "54240.00"),
    given("rule.base_high_2023", "161665.00"),
    given("rule.ltv_cap", "75"),
    given("rule.no_forecast_cap", "3"),
    given("target.percent", "20"),
    given("target.cap", "300000.00"),

    // The rate rule with teaching averages.
    rate("explain.rate_low", "3.2", "0.5", "3"),
    plusPoints("explain.minus_low", "3.2", "-0.5"),
    rate("explain.rate_high", "4", "0.5", "3"),
    plusPoints("explain.minus_high", "4", "-0.5"),

    // Target price: two prices in the explanation.
    ...targetRow("target.a", "1200000"),
    ...targetRow("target.b", "2000000"),

    // Foreign currency: 375,000 ₪ when a dollar is 3.75 ₪.
    units("fx.units", "375000", "3.75"),
    fxUp,
    fx("fx.down", "375000", "3.75", "3.6"),
    fxAmount,
    difference("fx.up_gap", fxUp, fxAmount),

    // Worked example.
    price,
    equity,
    loan,
    share("worked.ltv", loan.value as string, "1600000"),
    eligibility,
    rest("worked.rest", loan.value as string, ["120000"]),
    share("worked.share", "120000", loan.value as string),
    rate("worked.rate", "3.2", "0.5", "3"),
    withEligibilityOnTop,
    share("worked.err_ltv", withEligibilityOnTop.value as string, "1600000"),

    // Half-worked table: three prices.
    ...targetRow("half.r1", "1000000"),
    ...targetRow("half.r2", "1500000"),
    ...targetRow("half.r3", "1800000"),

    // Exercise 2: average 3.4 → 2.9.
    rate("ex2.answer", "3.4", "0.5", "3"),
    plusPoints("ex2.err_plus", "3.4", "0.5"),
    // Exercise 3: average 3.8 → the cap.
    rate("ex3.answer", "3.8", "0.5", "3"),
    plusPoints("ex3.err_uncapped", "3.8", "-0.5"),
    // Exercise 4: target price below the cap.
    ...targetRow("ex4", "1350000"),
    // Exercise 5: target price above the cap.
    ...targetRow("ex5", "2200000"),
    // Exercise 6: a dollar-linked debt of 480,000 ₪ at 4.00, the dollar falls to 3.70.
    units("ex6.units", "480000", "4"),
    fx("ex6.answer", "480000", "4", "3.7"),
    fx("ex6.err_inverse", "480000", "3.7", "4"),
    given("ex6.amount", "480000.00"),
  ];

  // ex5's wrong answer: 20% taken off without the cap.
  const ex5 = facts.find((x) => x.id === "ex5.price")!;
  const ex5pct = facts.find((x) => x.id === "ex5.pct")!;
  facts.push(difference("ex5.err_no_cap", ex5, ex5pct));
  // ex4's wrong answer: the cap taken off instead of 20%.
  facts.push(difference("ex4.err_cap", facts.find((x) => x.id === "ex4.price")!, facts.find((x) => x.id === "target.cap")!));

  return {
    lesson: "2.8",
    title: "מסלולי זכאות ומסלולים מיוחדים",
    note: "Official figures are given facts from search summaries (לא אומת, 2026-10-09). Rates, prices and exchange rates in examples are teaching numbers.",
    facts,
  };
}
