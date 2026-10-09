/**
 * Lesson 2.6 — the prime track: the rate is prime plus a fixed margin, and it
 * moves whenever the Bank of Israel rate moves. Every number the lesson and its
 * exercises show is declared here as a fact; the page reads data/lessons/2-6.json,
 * and checks/kinds/amortization.py (with lending.py for prime = rate + 1.5)
 * recomputes each one.
 *
 * Data, not teaching numbers: the Bank of Israel rate of 3.25% (decided
 * 2026-09-01, in force from 2026-09-03), its 2026 decisions, the next decision on
 * 2026-10-21, and prime = rate + 1.5 points. All from research/notes/official-sources.md
 * §6 (search-index summaries of Bank of Israel pages, 2026-10-09), so "לא אומת".
 * Everything else — loans, margins, prime paths — is an invented teaching number.
 *
 * The level payment comes from amortization.ts and is shown as a computed result
 * (taught in 3.1). On a rate change the payment is recalculated on the balance
 * left over the months left: the course's calculation assumption.
 */
import Decimal from "decimal.js";
import { annuityBalance, annuityPayment, blockPath, monthInterest, pathSchedule, primeTrackRate, yearlySummary } from "../../src/lib/calc/amortization.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { PRIME_ADDITION, primeFromPolicy, yearInterest } from "../../src/lib/calc/lending.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";

const given = (id: string, value: unknown): Fact => ({ id, kind: "given", inputs: {}, value });

const prime = (id: string, policy: string): Fact => ({
  id,
  kind: "lend_prime",
  inputs: { policy_rate: policy, addition: PRIME_ADDITION },
  value: plainNumber(primeFromPolicy(policy)),
});

const trackRate = (id: string, primePercent: string, margin: string): Fact => ({
  id,
  kind: "amort_prime_track_rate",
  inputs: { prime: primePercent, margin },
  value: plainNumber(primeTrackRate(primePercent, margin)),
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

/** A track whose rate is held for blocks of `block` months: rates[0] for the first block, and so on. */
const pathInputs = (principal: string, months: number, block: number, rates: string[]) => ({
  principal,
  months,
  block_months: block,
  ...Object.fromEntries(rates.map((r, i) => [`rate_${i + 1}`, r])),
});
const rowsOf = (principal: string, months: number, block: number, rates: string[]) => pathSchedule(principal, blockPath(rates, block, months));

const series = (id: string, principal: string, months: number, block: number, rates: string[]): Fact => ({
  id,
  kind: "amort_path_series",
  inputs: pathInputs(principal, months, block, rates),
  value: yearlySummary(rowsOf(principal, months, block, rates)).map((y) => ({ year: y.year, payment: moneyString(y.payment), balance: moneyString(y.balance) })),
});

const pathPayment = (id: string, principal: string, months: number, block: number, rates: string[], month: number): Fact => ({
  id,
  kind: "amort_path_payment",
  inputs: { ...pathInputs(principal, months, block, rates), month },
  value: moneyString(rowsOf(principal, months, block, rates)[month - 1].payment),
});

const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

const rateChange = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_rate_change",
  inputs: { before, after },
  value: plainNumber(new Decimal(after).minus(before)),
});

/** The 2026 decisions as a table: Bank of Israel rate, prime, and a prime track's rate at a margin. */
const primeTable = (id: string, margin: string, decisions: { date: string; policy: string }[]): Fact => ({
  id,
  kind: "amort_prime_table",
  inputs: { addition: PRIME_ADDITION, margin, ...Object.fromEntries(decisions.flatMap((d, i) => [[`date_${i + 1}`, d.date], [`policy_${i + 1}`, d.policy]])) },
  value: decisions.map((d, i) => {
    const p = primeFromPolicy(d.policy);
    return { period: i + 1, date: d.date, policy: plainNumber(d.policy), prime: plainNumber(p), track: plainNumber(primeTrackRate(p, margin)) };
  }),
});

const v = (f: Fact) => f.value as string;

export default function lesson26(): LessonData {
  // Today's data (official-sources.md §6; not verified).
  const policy = given("boi.rate", "3.25");
  const primeNow = prime("boi.prime", "3.25");

  // Explanation: P−0.5 on 600,000 ₪ for 20 years.
  const P = "600000";
  const N = 240;
  const rateNow = trackRate("explain.rate", v(primeNow), "-0.5");
  const pay = payment("explain.payment", P, v(rateNow), N);
  const firstInterest = interest("explain.first_interest", P, v(rateNow));
  const small = { prime: prime("explain.small_prime", "3.5") };
  const smallRate = trackRate("explain.small_rate", v(small.prime), "-0.5");
  // After 60 payments, prime rises one point: 5.75 → the track at 5.25.
  const left = balance("explain.left_60", P, v(rateNow), N, 60);
  const primeUp = given("explain.prime_up", "5.75");
  const rateUp = trackRate("explain.rate_up", "5.75", "-0.5");
  const newPay = payment("explain.new_payment", v(left), v(rateUp), 180);
  const interestBefore = interest("explain.interest_before", v(left), v(rateNow));
  const interestAfter = interest("explain.interest_after", v(left), v(rateUp));

  // The illustration: prime held per five-year block, P−0.5.
  const base = ["4.25", "4.25", "4.25", "4.25"];
  const first = ["5.25", "4.25", "4.25", "4.25"];
  const third = ["4.25", "4.25", "5.25", "4.25"];
  const lower = ["3.25", "3.25", "3.25", "3.25"];

  // Worked example: case A considers 500,000 ₪ in a prime track at P−0.6 for 25 years.
  const W = "500000";
  const WN = 300;
  const wRate = trackRate("worked.rate", v(primeNow), "-0.6");
  const wPay = payment("worked.payment", W, v(wRate), WN);
  const wLeft = balance("worked.left_12", W, v(wRate), WN, 12);
  const wUpPrime = prime("worked.prime_up", "3.75");
  const wUpRate = trackRate("worked.rate_up", v(wUpPrime), "-0.6");
  const wUpPay = payment("worked.payment_up", v(wLeft), v(wUpRate), WN - 12);
  const wDownPrime = prime("worked.prime_down", "2.75");
  const wDownRate = trackRate("worked.rate_down", v(wDownPrime), "-0.6");
  const wDownPay = payment("worked.payment_down", v(wLeft), v(wDownRate), WN - 12);
  const wStay = payment("worked.payment_stay", v(wLeft), v(wRate), WN - 12);

  // Exercise 6: one point up on 400,000 ₪, with 20 years or 5 years left.
  const longBefore = payment("ex6.long_before", "400000", "4.25", 240);
  const longAfter = payment("ex6.long_after", "400000", "5.25", 240);
  const shortBefore = payment("ex6.short_before", "400000", "4.25", 60);
  const shortAfter = payment("ex6.short_after", "400000", "5.25", 60);

  const facts: Fact[] = [
    policy,
    given("boi.decided", "2026-09-01"),
    given("boi.effective", "2026-09-03"),
    given("boi.next", "2026-10-21"),
    given("boi.as_of", "2026-10-09"),
    given("boi.addition", PRIME_ADDITION),
    primeNow,

    // Explanation.
    given("case.amount", "600000.00"),
    rateNow,
    small.prime,
    smallRate,
    rateChange("explain.small_change", v(rateNow), v(smallRate)),
    firstInterest,
    pay,
    left,
    primeUp,
    rateUp,
    newPay,
    difference("explain.payment_rise", newPay, pay),
    interestBefore,
    interestAfter,
    difference("explain.interest_rise", interestAfter, interestBefore),
    // Rule of thumb: one point of prime on 100,000 ₪ for a month.
    interest("rule.per_100k", "100000", "1"),
    // The same change, computed month by month by the path engine (equal to new_payment).
    pathPayment("explain.path_month_61", P, N, 60, [v(rateNow), v(rateUp)], 61),
    series("explain.path_up", P, N, 60, [v(rateNow), v(rateUp)]),
    series("explain.path_flat", P, N, N, [v(rateNow)]),

    // The illustration's guided tasks.
    series("slider.base", P, N, 60, base),
    series("slider.first_up", P, N, 60, first),
    series("slider.third_up", P, N, 60, third),
    series("slider.lower", P, N, 60, lower),

    // Worked example.
    given("worked.amount", "500000.00"),
    wRate,
    wPay,
    wLeft,
    wUpPrime,
    wUpRate,
    wUpPay,
    wStay,
    difference("worked.rise", wUpPay, wStay),
    wDownPrime,
    wDownRate,
    wDownPay,
    difference("worked.fall", wStay, wDownPay),

    // Half-worked table: the 2026 decisions, a track at P−0.5.
    primeTable("half.table", "-0.5", [
      { date: "2026-01-05", policy: "4" },
      { date: "2026-05-25", policy: "3.75" },
      { date: "2026-07-06", policy: "3.5" },
      { date: "2026-09-01", policy: "3.25" },
    ]),

    // Exercise 2: prime 4.75, P−0.6.
    trackRate("ex2.answer", v(primeNow), "-0.6"),
    trackRate("ex2.added", v(primeNow), "0.6"),
    // Exercise 3: the rate rises to 3.75; a track at P+0.4.
    prime("ex3.prime", "3.75"),
    trackRate("ex3.answer", primeFromPolicy("3.75").toString(), "0.4"),
    trackRate("ex3.no_addition", "3.75", "0.4"),
    trackRate("ex3.old_prime", v(primeNow), "0.4"),
    // Exercise 4: 500,000 ₪ left; the rate up 0.25 point: the month's extra interest.
    interest("ex4.answer", "500000", "0.25"),
    { id: "ex4.year", kind: "lend_year_interest", inputs: { amount: "500000", rate_percent: "0.25" }, value: moneyString(yearInterest("500000", "0.25")) },
    interest("ex4.no_hundred", "500000", "25"),
    // Exercise 5: prime 5.25 before three cuts of 0.25 point; a track at P−0.7.
    trackRate("ex5.prime_after", "5.25", "-0.75"),
    trackRate("ex5.answer", primeTrackRate("5.25", "-0.75").toString(), "-0.7"),
    trackRate("ex5.one_cut", primeTrackRate("5.25", "-0.25").toString(), "-0.7"),
    trackRate("ex5.no_cut", "5.25", "-0.7"),
    // Exercise 6.
    longBefore,
    longAfter,
    difference("ex6.long_rise", longAfter, longBefore),
    shortBefore,
    shortAfter,
    difference("ex6.short_rise", shortAfter, shortBefore),
  ];

  return {
    lesson: "2.6",
    title: "מסלול הפריים",
    note: "The Bank of Israel rate, its 2026 decisions and prime = rate + 1.5 points are from search-index summaries (official-sources.md §6, 2026-10-09), not verified. Loans, margins and prime paths are invented teaching numbers. Level payments from amortization.ts; on a rate change the payment is recalculated on the balance left over the months left.",
    facts,
  };
}
