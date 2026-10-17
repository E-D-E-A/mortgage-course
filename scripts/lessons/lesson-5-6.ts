/**
 * Lesson 5.6 — the three goals of a mix: a low monthly payment, a low total, little exposure. Which
 * month "low" is measured in, which scenario "total" and "exposure" are measured under, and why no
 * mix wins all three. Every number the page, its exercises and its video show is a fact here; the
 * page reads data/lessons/5-6.json, and checks/kinds/sensitivity.py (and schedule.py, affordability.py,
 * regulation.py, ltv.py) recompute each one.
 *
 * Case A (נועם ושירה) gets its mix here: src/data/case-a-mix.ts, the one place its numbers live. The
 * ratio is computed through affordability.ts (never typed), the limits through regulation.ts. Rates are
 * the course's price list — teaching assumptions, not market data and not an offer. The three goals are
 * Mogi's J-090 design, not a fact about the market.
 */
import Decimal from "decimal.js";
import { ltvPercent } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { paymentToIncome } from "../../src/lib/calc/affordability.ts";
import { maxPaymentAt } from "../../src/lib/calc/regulation.ts";
import { qualifyingTotal } from "../../src/lib/calc/sensitivity.ts";
import { CANDIDATES, CASE_A, INITIAL_MIX, PRICE_LIST, PRIME_TODAY, SCENARIOS, candidate, caseAPasses } from "../../src/data/case-a-mix.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, givenMoney, mixFact, rankFact, tableFact, type Mix } from "./_sensitivity-facts.ts";

const base = SCENARIOS.base;
const stress = SCENARIOS.stress;
const mixOf = (id: string): Mix => ({ tracks: candidate(id).tracks, scenario: base });
const mixUnder = (id: string, scenario: typeof base): Mix => ({ tracks: candidate(id).tracks, scenario });

export const PAY_MONTHS = [1, 27, 61, 121, 241, 360] as const;
export const PAY_IDS = ["initial", "half", "linked"] as const;
export const ALLOWED = CANDIDATES.filter((c) => caseAPasses(c.tracks)).map((c) => c.id);
export const HALF_IDS = ["initial", "half", "fixed", "linked", "short"] as const;

export default function lesson56(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  // ── Case A, as the course map gives it ──
  const price = add(givenMoney("a.price", CASE_A.price));
  const equity = add(givenMoney("a.equity", CASE_A.equity));
  const loan = add(difference("a.loan", price, equity));
  add({ id: "a.ltv", kind: "ltv_percent", inputs: { loan: CASE_A.loan, value: CASE_A.price }, value: percentString(ltvPercent(CASE_A.loan, CASE_A.price)) });
  const recognised = add(givenMoney("a.recognised", CASE_A.recognisedIncome));
  const car = add(givenMoney("a.car", CASE_A.car.monthly));
  add(given("a.car_months", CASE_A.car.monthsLeft));
  const disposable = add(difference("a.disposable", recognised, car));
  void loan;

  // ── The initial mix, track by track ──
  INITIAL_MIX.forEach((t, k) => {
    add(givenMoney(`init.amount_${k + 1}`, t.amount as string));
    add(given(`init.rate_${k + 1}`, t.rate as string));
  });
  add(given("init.years", CASE_A.termMonths / 12));
  const primeToday = add(given("prime.today", PRIME_TODAY));
  const primeRate = add(given("prime.rate", PRICE_LIST.prime));
  add({ ...difference("prime.spread", primeToday, primeRate) });
  for (const k of ["fixed_unlinked", "variable_unlinked", "fixed_linked", "variable_linked"] as const) add(given(`price.${k}`, PRICE_LIST[k]));

  const init = { tracks: INITIAL_MIX, scenario: base };
  const initFirst = add(mixFact("init.first", init, "first"));
  const initMax = add(mixFact("init.max", init, "max"));
  const initTotal = add(mixFact("init.total", init, "total"));
  const initQualifying = add(mixFact("init.qualifying", init, "qualifying"));
  add(mixFact("init.ratio", init, "ratio"));
  const maxAt40 = add({ id: "init.max_at_40", kind: "reg_max_payment", inputs: { income: disposable.value as string, percent: "40" }, value: moneyString(maxPaymentAt(disposable.value as string, "40")) });
  add(difference("init.over_40", initQualifying, maxAt40));
  add(mixFact("init.variable", init, "variable"));
  add(mixFact("init.variable_share", init, "variable_share"));
  add(mixFact("init.variable_room", init, "variable_room"));
  const initStress = { tracks: INITIAL_MIX, scenario: stress };
  const initStressMax = add(mixFact("init.stress_max", initStress, "max"));
  add(mixFact("init.stress_total", initStress, "total"));
  add(difference("init.rise", initStressMax, initFirst));
  add(mixFact("init.left_1", init, "left", { month: 1 }));
  add(mixFact("init.left_27", init, "left", { month: 27 }));
  add(mixFact("init.pay_27", init, "payment", { month: 27 }));

  // ── The seven candidates, and who wins which goal ──
  add(tableFact("cand.table", CANDIDATES, base, stress));
  add(rankFact("rank.payment", { goal: "payment" }, CANDIDATES, { base, stress }, ALLOWED));
  add(rankFact("rank.highest", { goal: "payment", month: "highest" }, CANDIDATES, { base, stress }, ALLOWED));
  add(rankFact("rank.total", { goal: "total" }, CANDIDATES, { base, stress }, ALLOWED));
  add(rankFact("rank.exposure", { goal: "exposure" }, CANDIDATES, { base, stress }, ALLOWED));
  add(rankFact("rank.payment_free", { goal: "payment" }, CANDIDATES, { base, stress }, CANDIDATES.map((c) => c.id)));
  add(rankFact("rank.total_free", { goal: "total" }, CANDIDATES, { base, stress }, CANDIDATES.map((c) => c.id)));

  // ── "Low payment", in which month ──
  for (const id of PAY_IDS) for (const m of PAY_MONTHS) add(mixFact(`pay.${id}.${m}`, mixOf(id), "payment", { month: m }));
  add(mixFact("pay.linked.max_month", mixOf("linked"), "max_month"));

  // ── The worked example: the linked mix against the initial one ──
  const linked = mixOf("linked");
  const lFirst = add(mixFact("linked.first", linked, "first"));
  const lMax = add(mixFact("linked.max", linked, "max"));
  const lTotal = add(mixFact("linked.total", linked, "total"));
  const lStressMax = add(mixFact("linked.stress_max", mixUnder("linked", stress), "max"));
  add(difference("linked.rise", lStressMax, lFirst));
  add(mixFact("linked.ratio", linked, "ratio"));
  add(mixFact("linked.qualifying", linked, "qualifying"));
  add(mixFact("linked.variable_room", linked, "variable_room"));
  add(difference("linked.first_gap", initFirst, lFirst));
  add(difference("linked.max_gap", lMax, initMax));
  add(difference("linked.total_gap", lTotal, initTotal));

  // ── The builder's guided tasks: one change at a time to the initial mix ──
  // 1: the last track (fixed unlinked, 547,000) becomes fixed linked at the price list's rate.
  const t1: Mix = { tracks: [INITIAL_MIX[0], INITIAL_MIX[1], { ...INITIAL_MIX[2], kind: "fixed_linked", rate: PRICE_LIST.fixed_linked }], scenario: base };
  for (const m of ["first", "max", "total"] as const) add(mixFact(`task1.${m}`, t1, m));
  // 2: all three tracks over 25 years instead of 30.
  const t2: Mix = { tracks: INITIAL_MIX.map((t) => ({ ...t, months: 300 })), scenario: base };
  for (const m of ["first", "max", "total"] as const) add(mixFact(`task2.${m}`, t2, m));

  // ── The half-worked example: ranks among the five mixes that pass ──
  // (the values come from cand.table and rank.payment / rank.total; nothing new is computed)

  // ── Exercises ──
  // 4: the fixed-only mix costs how much more in total than the initial one.
  const fixed = mixOf("fixed");
  const fFirst = add(mixFact("ex4.fixed_first", fixed, "first"));
  const fTotal = add(mixFact("ex4.fixed_total", fixed, "total"));
  add(difference("ex4.total_gap", fTotal, initTotal));
  const firstGap = add(difference("ex4.first_gap", fFirst, initFirst));
  add({ id: "ex4.err_times", kind: "met_times", inputs: { of: firstGap.id, count: 360 }, value: moneyString(new Decimal(firstGap.value as string).mul(360)) });
  // 3: what the 25-year mix costs in the first payment.
  const shortFirst = add(mixFact("ex3.short_first", mixOf("short"), "first"));
  add(difference("ex3.first_gap", shortFirst, initFirst));
  const shortStress = add(mixFact("ex3.short_stress_max", mixUnder("short", stress), "max"));
  add(difference("ex3.short_rise", shortStress, shortFirst));
  // 7: the ratio of the linked mix, and the two usual slips.
  add({ id: "ex7.err_recognised", kind: "aff_ratio", inputs: { payment: moneyString(qualifyingTotal(linked.tracks)), disposable: recognised.value as string }, value: percentString(paymentToIncome(moneyString(qualifyingTotal(linked.tracks)), recognised.value as string)) });
  add({ id: "ex7.err_first", kind: "aff_ratio", inputs: { payment: lFirst.value as string, disposable: disposable.value as string }, value: percentString(paymentToIncome(lFirst.value as string, disposable.value as string)) });
  // 6: the linked mix's payment in the last month, against its first.
  const lLast = add(mixFact("linked.pay_360", linked, "payment", { month: 360 }));
  add(difference("ex6.climb", lLast, lFirst));

  return {
    lesson: "5.6",
    title: "שלושת יעדי התמהיל",
    note: "Case A's mix: src/data/case-a-mix.ts. Teaching numbers: the rates are the course's price list, an assumption (not market data, not an offer); the scenarios are teaching scenarios (base: the index rises 2% a year; stress: 4% a year, prime and every anchor +2 points from year 2; never forecasts). The three goals are Mogi's design, not a fact about the market. Monthly rate = annual ÷ 12; schedules follow the statement convention.",
    facts,
  };
}
