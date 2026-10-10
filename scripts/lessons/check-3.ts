/**
 * The stage-3 completion check (src/pages/checks/3.mdx): every number its
 * questions, answers and common wrong answers show, including the questions it
 * repeats from stages 0, 1 and 2. Each fact reuses a kind a lesson already
 * defined, mostly through the lessons' own exported builders, so
 * checks/independent_check.py rechecks it with no new Python.
 *
 * Teaching numbers only: new inputs, not a lesson's worked example or exercise.
 * Monthly rate = annual ÷ 12 (lesson 0.4; Brain ENG-223). Invented loans and
 * mixes, none of them case A (נועם ושירה get a mix only in stage 5). The
 * variable track's later rates in q12 are an invented path, not a forecast.
 */
import Decimal from "decimal.js";
import { annuityStatement } from "../../src/lib/calc/amortization.ts";
import { compoundBalance, simpleBalance } from "../../src/lib/calc/compound.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import type { Track } from "../../src/lib/calc/metrics.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentOffMistake } from "../../src/lib/calc/present-value.ts";
import { mixCashFlow, mixInputs, recalculatedPayment, recalculationSteps, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { PRIME_ADDITION, primeRate, primeTrackRate, rateFromAnchor } from "../../src/lib/calc/tracks.ts";
import { type HandMistake, handMistake } from "../../src/lib/calc/workshop.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, repCell, repMonths, repPayment, slice } from "./lesson-2-9.ts";
import { leftFact, monthlyFact, paymentsTotal, pvFact, statementFact, sumFact, todayFact } from "./lesson-3-1.ts";
import { balance, indexed, payment } from "./lesson-3-5.ts";
import { above, effective, first, highest, pvList, share, threshold, times, x12 } from "./lesson-3-8.ts";

// ── Builders for kinds whose lesson builders are not exported (same kinds, same inputs). ──

/** amount × (1 + r)^n (lessons 0.3, 0.5, 3.4). */
const compound = (id: string, principal: string, ratePercent: string, periods: number): Fact => ({
  id,
  kind: "compound_balance",
  inputs: { principal, rate_percent: ratePercent, periods },
  value: moneyString(compoundBalance(principal, ratePercent, periods)),
});

/** amount × (1 + r × n) (lessons 0.2, 3.4). */
const simple = (id: string, principal: string, ratePercent: string, periods: number): Fact => ({
  id,
  kind: "simple_balance",
  inputs: { principal, rate_percent: ratePercent, periods },
  value: moneyString(simpleBalance(principal, ratePercent, periods)),
});

/** The interest alone at simple interest (lesson 3.9's mistake). */
const simpleInterest = (id: string, principal: string, ratePercent: string, periods: number): Fact => ({
  id,
  kind: "simple_interest",
  inputs: { principal, rate_percent: ratePercent, periods },
  value: moneyString(simpleBalance(principal, ratePercent, periods).minus(principal)),
});

/** Taking r% off n times instead of dividing (lesson 0.5's mistake). */
const percentOff = (id: string, amount: string, ratePercent: string, periods: number): Fact => ({
  id,
  kind: "percent_off_mistake",
  inputs: { amount, rate_percent: ratePercent, periods },
  value: moneyString(percentOffMistake(amount, ratePercent, periods)),
});

/** Lesson 2.1's kinds: prime from the Bank of Israel rate, a prime track, and anchor + spread. */
const prime = (id: string, policy: string): Fact => ({
  id,
  kind: "trk_prime",
  inputs: { policy, addition: PRIME_ADDITION },
  value: plainNumber(primeRate(policy)),
});
const primeTrack = (id: string, policy: string, spread: string): Fact => ({
  id,
  kind: "trk_prime_track",
  inputs: { policy, addition: PRIME_ADDITION, spread },
  value: plainNumber(primeTrackRate(policy, spread)),
});
const fromAnchor = (id: string, anchor: string, spread: string): Fact => ({
  id,
  kind: "trk_rate",
  inputs: { anchor, spread },
  value: plainNumber(rateFromAnchor(anchor, spread)),
});

/** a + b in percentage points (lesson 2.6's kind). */
const rateSum = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "lend_rate_sum",
  inputs: { a, b },
  value: plainNumber(new Decimal(a).plus(b)),
});

/** Lesson 3.6's kinds: the recalculated payment, and the formula's r and (1 + r)^−n. */
const dec6 = (x: Decimal) => x.toDecimalPlaces(6).toString();
const recalc = (id: string, bal: string, rate: string, left: number): Fact => ({
  id,
  kind: "sch_recalc_payment",
  inputs: { balance: bal, rate_percent: rate, months_left: left },
  value: moneyString(recalculatedPayment(bal, rate, left)),
});
const monthlyDecimal = (id: string, rate: string): Fact => ({
  id,
  kind: "sch_monthly_decimal",
  inputs: { rate_percent: rate },
  value: dec6(recalculationSteps("1", rate, 1).r),
});
const power = (id: string, rate: string, left: number): Fact => ({
  id,
  kind: "sch_power",
  inputs: { rate_percent: rate, months: left },
  value: dec6(recalculationSteps("1", rate, left).power),
});

/** Lesson 3.7's kinds: the mix's payment in a month, and a sum of payments. */
const mixAt = (id: string, tracks: TrackSpec[], month: number): Fact => ({
  id,
  kind: "sch_mix_payment",
  inputs: { ...mixInputs(tracks), month },
  value: moneyString(mixCashFlow(tracks)[month - 1].payment),
});
const sum = (id: string, terms: string[]): Fact => ({
  id,
  kind: "sch_sum",
  inputs: Object.fromEntries(terms.map((t, k) => [`term_${k + 1}`, t])),
  value: moneyString(terms.reduce((s, t) => s.plus(t), new Decimal(0))),
});

/** Workshop 3.12's kinds: a cell of the statement schedule, and a named hand mistake. */
type Loan = readonly [string, string, number];
const ROW_FIELDS = { opening: "opening", payment: "payment", interest: "interest", principal_paid: "principalPaid", closing: "closing" } as const;
const cell = (id: string, loan: Loan, period: number, field: keyof typeof ROW_FIELDS): Fact => ({
  id,
  kind: "ws_statement_cell",
  inputs: { principal: loan[0], rate_percent: loan[1], months: loan[2], period, field },
  value: moneyString(annuityStatement(...loan)[period - 1][ROW_FIELDS[field]]),
});
const plainExact = (d: Decimal) => {
  const s = d.toFixed();
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};
const mistake = (id: string, loan: Loan, period: number, name: HandMistake): Fact => ({
  id,
  kind: "ws_hand_mistake",
  inputs: { principal: loan[0], rate_percent: loan[1], months: loan[2], period, field: "closing", mistake: name },
  value: plainExact(handMistake(...loan, period, "closing", name)),
});

export default function check3(): LessonData {
  // q4 (3.3): 300,000 ₪ at 6% for 20 years; after 10 years.
  const q4Pay = repPayment("q4.pay", "300000", "6", 240);
  const q4Paid = paymentsTotal("q4.paid_total", q4Pay.value as string, 120);
  const q4Loan = given("q4.loan", "300000.00");

  // q7 (3.5): a payment of 3,450 ₪ in the unlinked schedule, base index 102.5, index now 104.1.
  const q7Answer = indexed("q7.answer", "3450", "102.5", "104.1");
  const q7C = given("q7.c", "3450.00");

  // q9 (3.6): 400,000 ₪ at 4.2% for 20 years; after 10 years the rate becomes 5.4%.
  const q9B = balance("q9.b120", "400000", "4.2", 240, 120);

  // q10 (3.7): three tracks, each with its own term; nothing moves.
  const MIX: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "350000", rate: "5.2", months: 300 },
    { kind: "prime", amount: "200000", rate: "4.4", months: 120 },
    { kind: "fixed_linked", amount: "150000", rate: "3.4", months: 240 },
  ];
  const q10T1 = payment("q10.t1", "350000", "5.2", 300);
  const q10T2 = payment("q10.t2", "200000", "4.4", 120);
  const q10T3 = payment("q10.t3", "150000", "3.4", 240);

  // q12 (3.8): a variable track of 480,000 ₪ for 20 years, reset every 5 years, on an invented path.
  const V: Track = { principal: "480000", rates: ["4.4", "5.6", "6.2", "5.8"], blockMonths: 60, months: 240 };
  const q12First = first("q12.first", [V]);
  const q12Max = highest("q12.max", [V]);
  const q12Gap = difference("q12.gap", q12Max, q12First);

  // q14 (3.9): 36,000 ₪ at 6% for 36 months, by the learner's route (payment × months − loan).
  const q14Pay = first("q14.pay", [{ principal: "36000", rates: ["6"], months: 36 }]);
  const q14Total = times("q14.total", q14Pay, 36);
  const q14Loan = given("q14.loan", "36000.00");

  // q19 (3.12): by hand, 20,000 ₪ at 4.8% for 12 months — the balance after month 2.
  const H: Loan = ["20000", "4.8", 12];

  const facts: Fact[] = [
    // r1 (0.5): 20,000 ₪ in three years, at 4% a year — its value today.
    todayFact("r1.answer", "20000", "4", 3),
    compound("r1.forward", "20000", "4", 3),
    percentOff("r1.percent_off", "20000", "4", 3),

    // r3 (2.1): the Bank of Israel rate 4% (supposed), a track at prime − 0.7.
    given("r3.addition", PRIME_ADDITION),
    prime("r3.prime", "4"),
    primeTrack("r3.answer", "4", "-0.7"),
    primeTrack("r3.added", "4", "0.7"),
    fromAnchor("r3.from_boi", "4", "-0.7"),

    // q1 (3.1): 15,000 ₪ at 7.2% a year (0.6% a month), four months, Spitzer.
    monthlyFact("q1.monthly", "7.2", 1),
    monthlyDecimal("q1.r", "7.2"),
    repPayment("q1.answer", "15000", "7.2", 4),
    repCell("q1.equal_first", "equal_principal", "15000", "7.2", 4, 1, "payment"),
    slice("q1.part", "15000", "1", "4"),
    repPayment("q1.annual", "15000", "86.4", 4),

    // q3 (3.2): 320,000 ₪ at 4.5% for 25 years — month 1's principal part.
    repPayment("q3.pay", "320000", "4.5", 300),
    monthlyFact("q3.monthly", "4.5", 3),
    repCell("q3.interest", "spitzer", "320000", "4.5", 300, 1, "interest"),
    repCell("q3.answer", "spitzer", "320000", "4.5", 300, 1, "principal"),
    slice("q3.part", "320000", "1", "300"),

    // q4 (3.3): the balance after 10 years, C × S over the 120 payments left.
    q4Pay,
    monthlyFact("q4.monthly", "6", 1),
    repMonths("q4.paid", 10),
    leftFact("q4.left", 240, 120),
    sumFact("q4.S", "6", 120, 6),
    pvFact("q4.answer", q4Pay.value as string, "6", 120),
    statementFact("q4.table", "300000", "6", 240, 120),
    slice("q4.straight", "300000", "120", "240"),
    q4Loan,
    q4Paid,
    difference("q4.subtract", q4Loan, q4Paid),
    pvFact("q4.full", q4Pay.value as string, "6", 240),

    // q5 (3.4): 250,000 ₪ at 6% for 20 years, four months of full grace — the balance after the grace.
    monthlyFact("q5.monthly", "6", 1),
    repCell("q5.answer", "grace_full", "250000", "6", 240, 4, "closing", 4),
    compound("q5.formula", "250000", "0.5", 4),
    simple("q5.simple", "250000", "0.5", 4),
    given("q5.loan", "250000.00"),

    // q6 (3.4): 12 months of partial grace on a 240-month track.
    leftFact("q6.left", 240, 12),

    // q7 (3.5): C × M ÷ M₀.
    q7C,
    q7Answer,
    indexed("q7.base100", "3450", "100", "104.1"),
    difference("q7.extra", q7Answer, q7C),

    // q9 (3.6): the payment recalculated on the balance, over the months left, at the new rate.
    payment("q9.c0", "400000", "4.2", 240),
    q9B,
    leftFact("q9.left", 240, 120),
    monthlyDecimal("q9.r", "5.4"),
    power("q9.power", "5.4", 120),
    recalc("q9.answer", q9B.value as string, "5.4", 120),
    payment("q9.one_formula", "400000", "5.4", 240),
    payment("q9.principal_left", "400000", "5.4", 120),
    recalc("q9.full_term", q9B.value as string, "5.4", 240),

    // q10 (3.7): the mix in month 150 — the prime track has ended.
    q10T1,
    q10T2,
    q10T3,
    mixAt("q10.answer", MIX, 150),
    sum("q10.sum", [q10T1.value as string, q10T3.value as string]),
    mixAt("q10.m1", MIX, 1),
    sum("q10.t1_t2", [q10T1.value as string, q10T2.value as string]),

    // q12 (3.8): by how many percent the projected maximum is above the payment under current terms.
    q12First,
    q12Max,
    q12Gap,
    above("q12.answer", q12Max, q12First, 1),
    share("q12.of_max", q12Gap, q12Max, 1),
    rateSum("q12.points", "6.2", "-4.4"),
    threshold("q12.highlight_at", q12First, "10"),

    // q14 (3.9): the interest, by the learner's route.
    q14Pay,
    q14Total,
    q14Loan,
    difference("q14.answer", q14Total, q14Loan),
    simpleInterest("q14.simple", "36000", "6", 3),

    // q15 (3.10): three payments of 4,000 ₪, at 0.6% a month — their value today.
    pvList("q15.answer", ["4000", "4000", "4000"], "0.6"),
    pvList("q15.sum", ["4000", "4000", "4000"], "0"),
    todayFact("q15.all_at_end", "12000", "0.6", 3),

    // q17 (3.10): an IRR of 0.55% a month, to a year.
    effective("q17.answer", "0.55", 2),
    x12("q17.x12", "0.55", 2),

    // q19 (3.12): the hand schedule's first two months, and the named mistakes in month 2's closing balance.
    repPayment("q19.pay", ...H),
    monthlyFact("q19.monthly", "4.8", 1),
    cell("q19.int_1", H, 1, "interest"),
    cell("q19.close_1", H, 1, "closing"),
    cell("q19.int_2", H, 2, "interest"),
    cell("q19.prin_2", H, 2, "principal_paid"),
    cell("q19.answer", H, 2, "closing"),
    mistake("q19.whole_payment", H, 2, "whole_payment"),
    mistake("q19.equal_part", H, 2, "equal_part"),
    mistake("q19.on_original", H, 2, "interest_on_original"),
    mistake("q19.annual", H, 2, "annual_rate"),
  ];

  return {
    lesson: "check-3",
    title: "בדיקת סיום שלב 3",
    note: "Teaching numbers only, new inputs. Each fact reuses a lesson's kind. Monthly rate = annual ÷ 12.",
    facts,
  };
}
