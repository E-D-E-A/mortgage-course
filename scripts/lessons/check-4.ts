/**
 * The stage-4 completion check (src/pages/checks/4.mdx): every number its
 * questions, answers and common wrong answers show, including the four
 * questions it repeats from stages 0, 1, 2 and 3 (lessons 0.10, 1.4, 2.2, 3.7).
 * Each fact reuses a kind a lesson already defined, mostly through the
 * lessons' own fact builders (affordability-facts, regulation-facts,
 * _underwriting-facts, _factor-facts), so checks/independent_check.py rechecks
 * every computed one with no new Python.
 *
 * Teaching numbers only: new inputs, not a lesson's worked example or exercise.
 * Every household and every bank here is invented ("בנק א׳"); none of them is
 * case A (נועם ושירה get a mix only in stage 5) or case B. The rules the
 * questions lean on (50% payment ratio, 40% capital threshold, 70% ceiling for
 * a replacement home, the 18-month line, prime = Bank of Israel rate + 1.5)
 * are the team's transcription of Directive 329 and search summaries: they are
 * stated as given facts below, labelled in the page as unverified. The prime
 * addition and the policy rates in q19 are exercise inputs, not a forecast.
 * Monthly rate = annual ÷ 12 (lesson 0.4; Brain ENG-223).
 */
import Decimal from "decimal.js";
import { annuityPayment, paymentsValueToday, primeTrackRate } from "../../src/lib/calc/amortization.ts";
import { PRIME_ADDITION, primeFromPolicy, relativeDrop, relativeDropOnNew } from "../../src/lib/calc/lending.ts";
import { childrenUnder, householdSize } from "../../src/lib/calc/forms.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { mixCashFlow, mixInputs, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { OBLIGATION_MONTHS, type Obligation } from "../../src/lib/calc/affordability.ts";
import { LTV_CEILINGS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import { shareOf, remainder } from "../../src/lib/calc/mix.ts";
import type { Fact, LessonData } from "../build-data.ts";
import * as aff from "./affordability-facts.ts";
import * as reg from "./regulation-facts.ts";
import * as uw from "./_underwriting-facts.ts";
import { FactBag } from "./_factor-facts.ts";
import { payment as amortPayment } from "./lesson-3-5.ts";

// ── Builders for kinds whose lesson builders are not exported (same kinds, same inputs). ──

/** Lesson 0.10's kinds: the fall in points, and the fall as a percent of the old rate (and of the new one). */
const rateDrop = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_rate_drop",
  inputs: { before, after },
  value: plainNumber(new Decimal(before).minus(after)),
});
const relDrop = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_relative_drop",
  inputs: { before, after },
  value: plainNumber(relativeDrop(before, after)),
});
const relDropOnNew = (id: string, before: string, after: string): Fact => ({
  id,
  kind: "lend_relative_drop_on_new",
  inputs: { before, after },
  value: plainNumber(relativeDropOnNew(before, after)),
});

/** Lesson 1.4's kinds: what is left of the loan, and an amount as a percent of the loan. */
const rest = (id: string, loan: string, others: string[]): Fact => ({
  id,
  kind: "mix_remainder",
  inputs: { loan, ...Object.fromEntries(others.map((a, n) => [`amount_${n + 1}`, a])) },
  value: moneyString(remainder(loan, others)),
});
const mixShare = (id: string, amount: string, loan: string): Fact => ({
  id,
  kind: "mix_share",
  inputs: { amount, loan },
  value: plainNumber(shareOf(amount, loan)),
});
const mixAmountSum = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "mix_amount_sum",
  inputs: Object.fromEntries(amounts.map((a, n) => [`amount_${n + 1}`, a])),
  value: moneyString(amounts.reduce((s, a) => s.plus(a), new Decimal(0))),
});

/** Lesson 3.7's kind: the mix's payment in a month. */
const mixAt = (id: string, tracks: TrackSpec[], month: number): Fact => ({
  id,
  kind: "sch_mix_payment",
  inputs: { ...mixInputs(tracks), month },
  value: moneyString(mixCashFlow(tracks)[month - 1].payment),
});

/** Lesson 3.7's kind: a sum of payments already rounded to the agora. */
const schSum = (id: string, terms: string[]): Fact => ({
  id,
  kind: "sch_sum",
  inputs: Object.fromEntries(terms.map((t, k) => [`term_${k + 1}`, t])),
  value: moneyString(terms.reduce((s, t) => s.plus(t), new Decimal(0))),
});

/** Lesson 4.13's kinds: how many children a form counts, and how many people live at home. */
const childrenFact = (id: string, ages: number[], limitAge: number): Fact => ({
  id,
  kind: "forms_children_under",
  inputs: { ages: ages.join("|"), limit_age: limitAge },
  value: childrenUnder(ages, limitAge),
});
const householdFact = (id: string, adults: number, ages: number[]): Fact => ({
  id,
  kind: "forms_household_size",
  inputs: { adults, ages: ages.join("|") },
  value: householdSize(adults, ages),
});

/** Lesson 4.14's kinds: the prime from the Bank of Israel rate, a prime track's rate, and a level payment. */
const primeFact = (id: string, policy: string): Fact => ({
  id,
  kind: "lend_prime",
  inputs: { policy_rate: policy, addition: PRIME_ADDITION },
  value: plainNumber(primeFromPolicy(policy)),
});
const primeTrackFact = (id: string, prime: string, margin: string): Fact => ({
  id,
  kind: "amort_prime_track_rate",
  inputs: { prime, margin },
  value: plainNumber(primeTrackRate(prime, margin)),
});
const levelPayment = (id: string, principal: string, rate: string, months: number): Fact => ({
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

/** Lesson 4.15's kinds: the loan a payment carries at an assumed rate and term (C × S), and a payment times a count. */
const carried = (id: string, pay: Fact, rate: string, months: number): Fact => ({
  id,
  kind: "amort_payments_value_today",
  inputs: { payment: pay.value as string, rate_percent: rate, months },
  value: moneyString(paymentsValueToday(pay.value as string, rate, months)),
});
const times = (id: string, of: Fact, count: number): Fact => ({
  id,
  kind: "met_times",
  inputs: { of: of.id, count },
  value: moneyString(new Decimal(of.value as string).mul(count)),
});

const g = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

export default function check4(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const v = (f: Fact) => f.value as string;

  // ── The rules the questions lean on, as the team transcribed them (unverified), as facts ──
  add(g("rule.pti_limit", PTI_LIMIT));
  add(g("rule.capital", PTI_CAPITAL_THRESHOLD));
  add(g("rule.ceiling_single", LTV_CEILINGS.only_home));
  add(g("rule.ceiling_replacement", LTV_CEILINGS.replacement));
  add(g("rule.ceiling_investment", LTV_CEILINGS.investment));
  add(g("rule.months_line", OBLIGATION_MONTHS));
  add(g("rule.prime_addition", PRIME_ADDITION));

  // r1 (0.10): the Bank of Israel rate falls from 4.8% to 4.2% — an exercise, not a decision.
  add(g("r1.before", "4.8"));
  add(g("r1.after", "4.2"));
  add(rateDrop("r1.points", "4.8", "4.2"));
  add(relDrop("r1.answer", "4.8", "4.2"));
  add(relDropOnNew("r1.on_new", "4.8", "4.2"));

  // r2 (1.4): 1,500,000 ₪ in three tracks; the first two are 640,000 and 410,000.
  add(g("r2.loan", "1500000"));
  add(g("r2.first", "640000"));
  add(g("r2.second", "410000"));
  const r2Rest = add(rest("r2.rest", "1500000", ["640000", "410000"]));
  add(mixShare("r2.answer", v(r2Rest), "1500000"));
  const r2Two = add(mixAmountSum("r2.two", ["640000", "410000"]));
  add(mixShare("r2.two_share", v(r2Two), "1500000"));

  // r3 (2.2): a fixed indexed track at 3.1% a year.
  add(g("r3.rate", "3.1"));

  // r4 (3.7): two tracks, each with its own term; at month 150 the prime track (10 years) has ended.
  const MIX: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "380000", rate: "5", months: 240 },
    { kind: "prime", amount: "220000", rate: "4.1", months: 120 },
  ];
  add(g("r4.amount_1", "380000"));
  add(g("r4.amount_2", "220000"));
  const r4t1 = add(amortPayment("r4.t1", "380000", "5", 240));
  const r4t2 = add(amortPayment("r4.t2", "220000", "4.1", 120));
  add(mixAt("r4.answer", MIX, 150));
  // Month 1 by the course's statement rule: each track's payment rounded to the agora, then summed (lesson 3.7).
  add(schSum("r4.month1", [v(r4t1), v(r4t2)]));

  // q1 (4.1): three payslips; the monthly income is the average of the net pay (שכר נטו).
  const slips = [
    { gross: "13600", parts: ["1420", "1090", "816"] },
    { gross: "14900", parts: ["1780", "1200", "894"] },
    { gross: "13900", parts: ["1480", "1110", "834"] },
  ];
  const nets: Fact[] = [];
  slips.forEach((s, k) => {
    const n = k + 1;
    add(g(`q1.gross_${n}`, s.gross));
    const mand = add(aff.sum(`q1.mand_${n}`, s.parts));
    nets.push(add(aff.net(`q1.net_${n}`, s.gross, [v(mand)])));
  });
  add(aff.average("q1.answer", nets.map(v)));
  add(aff.average("q1.avg_gross", slips.map((s) => s.gross)));
  add(aff.sum("q1.sum_net", nets.map(v)));

  // q2 (4.2): the 18-month rule — 19 payments left counts, 17 does not; rent that goes on counts whatever is left.
  const loanLong: Obligation = { kind: "loan", monthly: "1150", monthsLeft: 19 };
  const loanShort: Obligation = { kind: "loan", monthly: "870", monthsLeft: 17 };
  const rent: Obligation = { kind: "rent", monthly: "3300", monthsLeft: 5, rentContinues: true };
  add(g("q2.income", "19400"));
  add(g("q2.loan_long", "1150"));
  add(g("q2.loan_short", "870"));
  add(g("q2.rent", "3300"));
  add(g("q2.left_long", 19));
  add(g("q2.left_short", 17));
  add(g("q2.left_rent", 5));
  add(aff.disposable("q2.answer", "19400", [loanLong, loanShort, rent]));
  add(aff.disposable("q2.err_short", "19400", [loanLong, { ...loanShort, monthsLeft: 30 }, rent]));
  add(aff.disposable("q2.err_rent", "19400", [loanLong, loanShort, { ...rent, rentContinues: false }]));
  add(aff.disposable("q2.err_long", "19400", [{ ...loanLong, monthsLeft: 12 }, loanShort, rent]));

  // q3 (4.3): an existing mortgage on the same property goes to the payment, not off the income.
  const car: Obligation = { kind: "loan", monthly: "1000", monthsLeft: 30 };
  const mortgage: Obligation = { kind: "mortgage", monthly: "1800", monthsLeft: 84, mortgage: "same_property" };
  add(g("q3.income", "21500"));
  add(g("q3.car", "1000"));
  add(g("q3.mortgage", "1800"));
  add(g("q3.new", "5200"));
  add(g("q3.car_months", 30));
  add(g("q3.mortgage_months", 84));
  add(aff.disposable("q3.disposable", "21500", [car, mortgage]));
  add(aff.payment("q3.payment", "5200", [car, mortgage]));
  add(aff.ratioFromParts("q3.answer", "21500", [car, mortgage], "5200"));
  add(aff.ratioFromParts("q3.err_other", "21500", [car, { ...mortgage, mortgage: "other_property" }], "5200"));
  add(aff.ratioFromParts("q3.err_ignored", "21500", [car], "5200"));
  add(aff.ratio("q3.err_income", "7000", "21500"));

  // q4 (4.3): the payment the ratio uses on a loan with partial grace is the payment after the grace.
  add(g("q4.amount", "720000"));
  add(g("q4.rate", "4.8"));
  add(g("q4.months", 300));
  add(g("q4.grace", 24));
  add(uw.countDifference("q4.left", "q4.months", "q4.grace", facts));
  add(aff.qualifying("q4.answer", { amount: "720000", ratePercent: "4.8", months: 300, graceMonths: 24, grace: "partial" }));
  add(aff.qualifying("q4.err_during", { amount: "720000", ratePercent: "4.8", months: 300, bullet: true }));
  add(aff.qualifying("q4.err_no_grace", { amount: "720000", ratePercent: "4.8", months: 300 }));

  // q5 (4.4): the ceiling for replacing a home is 70%, not 75% (a single home) or 50% (a further home).
  const q5Value = add(reg.given("q5.value", "2350000"));
  const q5Max = add(reg.maxLoan("q5.answer", "2350000", "replacement"));
  add(reg.maxLoan("q5.err_single", "2350000", "only_home"));
  add(reg.maxLoan("q5.err_investment", "2350000", "investment"));
  add(reg.difference("q5.equity", q5Value, q5Max));

  // q6 (4.4): the ratio shows 50% only because it is rounded; the exact payment is 40 agorot above the line.
  add(reg.given("q6.income", "16000"));
  const q6Payment = add(reg.given("q6.payment", "8000.40"));
  add(reg.ratio("q6.shown", "8000.40", "16000"));
  const q6Max = add(reg.maxPayment("q6.max", "16000", "50"));
  add(reg.difference("q6.over", q6Payment, q6Max));

  // q7 (4.5): a bank's own line (36%) is neither a regulatory limit nor the capital threshold.
  add(g("q7.policy", "36"));

  // q8 (4.5): between the capital threshold (40%) and the ceiling (50%), against a bank's own 35%.
  add(reg.given("q8.income", "18600"));
  add(g("q8.policy", "35"));
  const q8Max50 = add(reg.maxPayment("q8.max50", "18600", "50"));
  const q8Max40 = add(reg.maxPayment("q8.max40", "18600", "40"));
  const q8Max35 = add(reg.maxPayment("q8.max35", "18600", "35"));
  add(reg.difference("q8.answer", q8Max50, q8Max40));
  add(reg.difference("q8.err_policy", q8Max50, q8Max35));

  // q9 (4.6): the payment the family's own budget allows, against the regulatory line.
  const loan12: Obligation = { kind: "loan", monthly: "1250", monthsLeft: 12 };
  add(reg.given("q9.net", "16800"));
  add(reg.given("q9.loan", "1250"));
  add(g("q9.months", 12));
  add(reg.given("q9.budget", "10200"));
  add(reg.budgetMax("q9.answer", "16800", ["1250"], "10200"));
  add(reg.budgetMax("q9.err_forgot", "16800", [], "10200"));
  const q9Disp = add(reg.disposable("q9.disposable", "16800", [loan12]));
  add(reg.maxPayment("q9.err_limit", v(q9Disp), "50"));

  // q10 (4.7): the verified income of a self-employed borrower, from two assessments, against the declared one.
  add(g("q10.declared", "13500"));
  add(g("q10.assess_old", "118800"));
  add(g("q10.assess_latest", "141600"));
  const q10Verified = add(aff.assessment("q10.verified", ["118800", "141600"], "average"));
  const q10Latest = add(aff.assessment("q10.latest", ["118800", "141600"], "latest"));
  add(uw.shortfall("q10.answer", "13500", v(q10Verified)));
  add(uw.shortfall("q10.err_latest", "13500", v(q10Latest)));
  add(uw.ratio("q10.err_over_verified", "2650.00", v(q10Verified)));
  add(uw.ratio("q10.err_share", v(q10Verified), "13500"));

  // q11 (4.7): the loan is the lower of two ceilings — the ratio's (on the recognised income) and the financing ratio's.
  const q11Price = "1480000";
  add(reg.given("q11.price", q11Price));
  add(reg.given("q11.pti_loan", "1036000"));
  add(reg.given("q11.declared_loan", "1190000"));
  const q11Cap = add(reg.maxLoan("q11.fin_cap", q11Price, "only_home"));
  add(uw.lower("q11.answer", "1036000", v(q11Cap)));

  // q13 (4.9): the debt the life insurance has to cover after 96 payments, on two tracks.
  const tr1 = { principal: "430000", ratePercent: "4.4", months: 300 };
  const tr2 = { principal: "310000", ratePercent: "3.8", months: 240 };
  add(g("q13.principal_1", "430000"));
  add(g("q13.principal_2", "310000"));
  add(g("q13.paid", 96));
  add(uw.sum("q13.loan", ["430000", "310000"]));
  add(uw.balance("q13.answer", [tr1, tr2], 96));
  add(uw.balance("q13.err_one", [tr1], 96));

  // q18 (4.13): how many children a form counts, by the form's own age limit.
  const ages = [3, 11, 19, 20, 22];
  add(g("q18.limit_a", 18));
  add(g("q18.limit_b", 21));
  add(childrenFact("q18.answer", ages, 21));
  add(childrenFact("q18.err_eighteen", ages, 18));
  add(householdFact("q18.err_household", 2, ages));

  // q19 (4.14): a prime track of 540,000 ₪ with 190 payments left; the Bank of Israel rate falls from 4% to 3.5% (an exercise).
  add(g("q19.before", "4"));
  add(g("q19.after", "3.5"));
  add(g("q19.margin", "-0.4"));
  add(g("q19.margin_points", "0.4"));
  add(g("q19.balance", "540000"));
  add(g("q19.months", 190));
  add(primeFact("q19.prime_before", "4"));
  add(primeFact("q19.prime_after", "3.5"));
  add(primeTrackFact("q19.rate_before", plainNumber(primeFromPolicy("4")), "-0.4"));
  add(primeTrackFact("q19.rate_after", plainNumber(primeFromPolicy("3.5")), "-0.4"));
  const q19Before = add(levelPayment("q19.pay_before", "540000", plainNumber(primeTrackRate(primeFromPolicy("4"), "-0.4")), 190));
  const q19After = add(levelPayment("q19.pay_after", "540000", plainNumber(primeTrackRate(primeFromPolicy("3.5"), "-0.4")), 190));
  add(difference("q19.answer", q19Before, q19After));
  const q19NoBefore = add(levelPayment("q19.nomargin_before", "540000", plainNumber(primeFromPolicy("4")), 190));
  const q19NoAfter = add(levelPayment("q19.nomargin_after", "540000", plainNumber(primeFromPolicy("3.5")), 190));
  add(difference("q19.err_nomargin", q19NoBefore, q19NoAfter));

  // q20 (4.15): the feasibility page of an invented household — the loan a 40% payment would carry (an assumption: 4.5%, 30 years).
  add(g("q20.income_1", "8900"));
  add(g("q20.income_2", "7600"));
  add(g("q20.car", "1150"));
  add(g("q20.car_months", 22));
  add(g("q20.rate", "4.5"));
  add(g("q20.months", 360));
  const q20Car: Obligation = { kind: "loan", monthly: "1150", monthsLeft: 22 };
  const q20Rec = add(aff.sum("q20.recognised", ["8900", "7600"]));
  const q20Disp = add(aff.disposable("q20.disposable", v(q20Rec), [q20Car]));
  const q20Max40 = add(reg.maxPayment("q20.max40", v(q20Disp), "40"));
  const q20Max50 = add(reg.maxPayment("q20.max50", v(q20Disp), "50"));
  const q20MaxRec = add(reg.maxPayment("q20.max40_recognised", v(q20Rec), "40"));
  add(carried("q20.answer", q20Max40, "4.5", 360));
  add(carried("q20.err_fifty", q20Max50, "4.5", 360));
  add(carried("q20.err_car", q20MaxRec, "4.5", 360));
  add(times("q20.err_sum", q20Max40, 360));

  // q15, q16 (4.11, 4.12): level payments, annual rate ÷ 12, through the factor-card calculator.
  const b = new FactBag();
  // q15: 900,000 ₪ at 4.2% — twenty years against thirty.
  b.given("q15.loan", "900000");
  b.given("q15.rate", "4.2");
  b.given("q15.m20", "240");
  b.given("q15.m30", "360");
  b.calc("q15.pay20", { op: "payment", principal: "q15.loan", rate: "q15.rate", months: "q15.m20" });
  b.calc("q15.answer", { op: "payment", principal: "q15.loan", rate: "q15.rate", months: "q15.m30" });
  b.calc("q15.total20", { op: "times", a: "q15.pay20", b: "q15.m20" });
  b.calc("q15.err_scaled", { op: "divide", a: "q15.total20", b: "q15.m30" });
  // q16: 750,000 ₪ for 25 years, anchor 3.9, spread 0.45 against 0.8.
  b.given("q16.loan", "750000");
  b.given("q16.anchor", "3.9");
  b.given("q16.low", "0.45");
  b.given("q16.high", "0.8");
  b.given("q16.months", "300");
  b.given("q16.years", "25");
  b.calc("q16.gap", { op: "minus", a: "q16.high", b: "q16.low" });
  b.calc("q16.rate_low", { op: "sum", of: ["q16.anchor", "q16.low"] });
  b.calc("q16.rate_high", { op: "sum", of: ["q16.anchor", "q16.high"] });
  b.calc("q16.pay_low", { op: "payment", principal: "q16.loan", rate: "q16.rate_low", months: "q16.months" });
  b.calc("q16.pay_high", { op: "payment", principal: "q16.loan", rate: "q16.rate_high", months: "q16.months" });
  b.calc("q16.month_diff", { op: "minus", a: "q16.pay_high", b: "q16.pay_low" });
  b.calc("q16.answer", { op: "times", a: "q16.month_diff", b: "q16.months" });
  b.calc("q16.year_one", { op: "share", amount: "q16.loan", percent: "q16.gap" });
  b.calc("q16.err_naive", { op: "times", a: "q16.year_one", b: "q16.years" });
  // q14: a number in the text of the choice questions.
  b.given("q14.share", "20");
  facts.push(...b.facts);

  return {
    lesson: "check-4",
    title: "בדיקת סיום שלב 4",
    note: "Teaching numbers only, new inputs. Each fact reuses a lesson's kind. Monthly rate = annual ÷ 12. The limits are the team's transcription of Directive 329 (unverified); no case A or B numbers.",
    facts,
  };
}
