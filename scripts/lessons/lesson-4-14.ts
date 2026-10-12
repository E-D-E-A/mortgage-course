/**
 * Lesson 4.14 — the market and the world: the chain of influence from the Bank
 * of Israel's rate, inflation expectations, bond yields, housing demand,
 * security events and regulation to what a borrower pays. Every number the
 * lesson, its exercises and its video show is declared here as a fact; the page
 * and the video read data/lessons/4-14.json, and checks/independent_check.py
 * recomputes each one (lending.py, amortization.py, bonds.py, percent.py).
 *
 * The dated market data are quotations, shown as "לא אומת":
 *  - Bank of Israel rate decisions (2020-04-06, 2023-05-22, 2024-01-01, 2026-07-06,
 *    2026-09-01): search-index summaries of the Bank of Israel's press releases,
 *    searched 2026-10-10 (research/notes/official-sources.md §6 for 2026), not the
 *    releases themselves.
 *  - February 2026 system averages of new-loan rates (4.74% fixed unindexed, 3.25%
 *    fixed indexed) and the July 2026 yield points (3.5221% at 5 years, 3.8817% at
 *    10): the team's reading of Bank of Israel data on 2026-08-03 (Brain 7831553, via
 *    research/notes/brain-calculation.md). Not opened at the source.
 *  - New mortgage volume (NIS 8.8bn a month on average in 2025, NIS 10bn in January-
 *    February 2026): a search summary of a Bank of Israel publication, 2026-10-10.
 * The prime is the policy rate plus 1.5 points (Bank of Israel explainer, search
 * summary). Teaching loans and teaching rates are invented.
 */
import Decimal from "decimal.js";
import { annuityPayment, primeTrackRate } from "../../src/lib/calc/amortization.ts";
import { impliedRate, inflationGap, percentString } from "../../src/lib/calc/bonds.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { PRIME_ADDITION, primeFromPolicy, rateChange } from "../../src/lib/calc/lending.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { relativeChangePercent } from "../../src/lib/calc/percent.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });
const givenMoney = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });

const prime = (id: string, policy: string): Fact => ({
  id,
  kind: "lend_prime",
  inputs: { policy_rate: policy, addition: PRIME_ADDITION },
  value: plainNumber(primeFromPolicy(policy)),
});

const change = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_rate_change",
  inputs: { before, after },
  value: plainNumber(rateChange(before, after)),
});

const trackRate = (id: string, primeRate: string, margin: string): Fact => ({
  id,
  kind: "amort_prime_track_rate",
  inputs: { prime: primeRate, margin },
  value: plainNumber(primeTrackRate(primeRate, margin)),
});

const payment = (id: string, principal: string, rate: string, months: number): Fact => ({
  id,
  kind: "amort_payment",
  inputs: { principal, rate_percent: rate, months },
  value: moneyString(annuityPayment(principal, rate, months)),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const gap = (id: string, nominal: string, real: string): Fact => ({
  id,
  kind: "bond_inflation_gap",
  inputs: { nominal_percent: nominal, real_percent: real },
  value: percentString(inflationGap(nominal, real)),
});

const implied = (id: string, short: string, shortYears: number, long: string, longYears: number): Fact => ({
  id,
  kind: "bond_implied_rate",
  inputs: { short_percent: short, short_years: shortYears, long_percent: long, long_years: longYears },
  value: percentString(impliedRate(short, shortYears, long, longYears)),
});

/** The Bank of Israel rate decisions of the lesson, with the rate after each (search-index summaries, 2026-10-10). */
const DECISIONS = [
  { key: "d2020", date: "2020-04-06", rate: "0.1" },
  { key: "d2023", date: "2023-05-22", rate: "4.75" },
  { key: "d2024", date: "2024-01-01", rate: "4.5" },
  { key: "d2026a", date: "2026-07-06", rate: "3.5" },
  { key: "d2026b", date: "2026-09-01", rate: "3.25" },
] as const;

const MARGIN = "-0.5";
const LOAN = "500000";
const MONTHS = 300;

export default function lesson(): LessonData {
  const facts: Fact[] = [];

  // The decisions: rate, prime, the track at prime minus 0.5, and what a new loan would cost.
  const pay: Record<string, Fact> = {};
  for (const d of DECISIONS) {
    facts.push(given(`${d.key}.rate`, d.rate), prime(`${d.key}.prime`, d.rate));
    const prm = plainNumber(primeFromPolicy(d.rate));
    facts.push(trackRate(`${d.key}.track`, prm, MARGIN));
    pay[d.key] = payment(`${d.key}.payment`, LOAN, plainNumber(primeTrackRate(prm, MARGIN)), MONTHS);
    facts.push(pay[d.key]);
  }
  facts.push(change("cut.points", "3.5", "3.25"));
  facts.push({ id: "cut.drop", kind: "lend_rate_drop", inputs: { before: "3.5", after: "3.25" }, value: plainNumber(new Decimal("3.5").minus("3.25")) });
  facts.push(givenMoney("loan.amount", LOAN), given("loan.months", MONTHS), given("loan.margin", MARGIN));
  // 2023-05-22 against 2020-04-06 (the same new loan), and the last cut against the one before it.
  facts.push(difference("span.payment_gap", pay.d2023, pay.d2020));
  facts.push(difference("cut.payment_gap", pay.d2026a, pay.d2026b));

  // Inflation expectations: the gap between an unindexed and an indexed rate.
  facts.push(gap("gap.teach", "4", "2"));
  facts.push(given("gap.teach_nominal", "4"), given("gap.teach_real", "2"));
  facts.push(given("feb.nominal", "4.74"), given("feb.real", "3.25"));
  facts.push(gap("feb.gap", "4.74", "3.25"));
  facts.push(given("exp.five", "1.80"), given("exp.ten", "1.85"));

  // The yield curve of July 2026 (4 decimals as the team read them) and the rate it implies between 5 and 10 years.
  facts.push(given("curve.y1", "3.4012"), given("curve.y5", "3.5221"), given("curve.y10", "3.8817"), given("curve.y15", "4.1427"));
  facts.push(implied("curve.implied", "3.5221", 5, "3.8817", 10));

  // Housing demand: new mortgage volume.
  facts.push(given("vol.y2025", "8.8"), given("vol.early2026", "10"));
  facts.push({ id: "vol.change", kind: "relative_change_percent", inputs: { from: "8.8", to: "10" }, value: plainNumber(relativeChangePercent("8.8", "10")) });

  // Exercises.
  facts.push(given("ex2.rate", "3"), prime("ex2.answer", "3"));
  facts.push(givenMoney("ex3.balance", "400000"), given("ex3.months", 200), given("ex3.margin", "-0.5"));
  facts.push(trackRate("ex3.rate_before", "5", "-0.5"), trackRate("ex3.rate_after", "4.75", "-0.5"));
  const before = payment("ex3.pay_before", "400000", "4.5", 200);
  const after = payment("ex3.pay_after", "400000", "4.25", 200);
  facts.push(before, after, difference("ex3.answer", before, after));
  // The mistake of leaving out the margin: the prime itself (5% then 4.75%) as the track's rate.
  const noMarginBefore = payment("ex3.nomargin_before", "400000", "5", 200);
  const noMarginAfter = payment("ex3.nomargin_after", "400000", "4.75", 200);
  facts.push(noMarginBefore, noMarginAfter, difference("ex3.err_nomargin", noMarginBefore, noMarginAfter));
  facts.push(given("ex4.nominal", "5"), given("ex4.real", "3"), gap("ex4.answer", "5", "3"));
  facts.push({ id: "ex4.err_subtract", kind: "lend_rate_drop", inputs: { before: "5", after: "3" }, value: plainNumber(new Decimal("5").minus("3")) });
  facts.push(given("ex6.five", "3"), given("ex6.ten", "3.6"), implied("ex6.answer", "3", 5, "3.6", 10));

  return {
    lesson: "4.14",
    title: "השוק והעולם",
    note: "Dated market quotations are unverified (search summaries 2026-10-10; team readings 2026-08-03). Teaching loans and rates are invented.",
    facts,
  };
}
