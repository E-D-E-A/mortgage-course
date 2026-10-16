/**
 * The stage-7 completion check (src/pages/checks/7.mdx): every number its questions, answers and common
 * wrong answers show, including the four questions it repeats from stages 2, 3, 4 and 5 (lessons 2.10, 3.10,
 * 4.6, 5.5). Each fact reuses a kind a lesson already defined, through the stage's own fact builders
 * (_earlyrepay-facts for lessons 7.1-7.3, _refinance-facts for 7.4-7.5, regulation-facts for 7.6-7.7, the
 * workshop's own data in src/data/case-c.ts for 7.8) and the older ones (lesson-3-8, regulation-facts,
 * _forecast-facts), so checks/independent_check.py rechecks every computed one with no new Python.
 *
 * Teaching numbers only: new inputs, not a lesson's worked example or exercise. The one exception is the
 * workshop (questions q19, q20): case C IS the stage's fixture (lesson 7.8), and the questions ask about a part
 * of it that the lesson shows but its exercises do not ask. Every family is invented (דנה ורועי, יעל ואלון,
 * אבי ומיכל, הדס ואיתי, ליאור ועדי; case C is עדי וירון), every bank is the course's fictional "בנק א׳ ... ד׳".
 *
 * What is a premise and what is a fact. The Banking Order on early repayment (2002) and section 15א of
 * Directive 451 are known to the course only through the team's transcription; the questions state each rule
 * they lean on as a premise ("לפי תעתיק הצוות; לא אומת") and ask the learner to apply it, never to produce it.
 * The values A = 4.823% and C = 5.09% of case C are "values the team read on 2026-08-02, לא אומת". The three
 * readings that are ours, not the Order's (a negative fee, a notice more than 45 days ahead, the bucket of the
 * average) are labelled "קריאה שלנו". The ceilings of Directive 329 used in the introductions (70% for a
 * replacement home, 75% for a single home) are the team's transcription (lesson 4.4), unverified.
 * Lessons 7.6 and 7.7 are introductions: their questions test the line between what the course knows and
 * what it does not, and never state a rule, a rate or a procedure of a bridge loan, builder financing,
 * self-build, a second-degree mortgage, pari passu or a reverse mortgage as fact. The two numeric ones are
 * conditional calculations on stated premises. Every bank, rate, term, cost and income is invented.
 */
import Decimal from "decimal.js";
import { addDays } from "../../src/lib/calc/earlyrepay.ts";
import { effectiveAnnualRate, roundedString } from "../../src/lib/calc/rates.ts";
import type { Track } from "../../src/lib/calc/metrics.ts";
import { fixedOffer } from "../../src/lib/calc/refinance.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { EXTERNAL_COSTS, INTERNAL_COSTS, NEW_LOAN_COSTS, REFINANCE_FORECAST } from "../../src/data/refinance-examples.ts";
import { CASE_C_DISCOUNT_FEE, CASE_C_LOAN, CASE_C_PAID, FEE_CASE, OPERATIONAL_FEE, TOP_UP, bank } from "../../src/data/case-c.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { type Case, afterReduction, datePlusMonths, daysBetweenFact, fee, minOf, monthlyPercent, percentOf, percentOfAmount, times as erTimes, totalOf } from "./_earlyrepay-facts.ts";
import { type ExistingSpec, monthsKept, stay, sw } from "./_refinance-facts.ts";
import * as M from "./lesson-3-8.ts";
import * as reg from "./regulation-facts.ts";
import * as AF from "./affordability-facts.ts";
import * as F from "./_forecast-facts.ts";

/** A claim the questions make about computed numbers: the build fails if the data say otherwise. */
const claim = (ok: boolean, what: string) => {
  if (!ok) throw new Error(`check-7: ${what}`);
};

const FC = [REFINANCE_FORECAST];

/** Repayment on `repaid` with a written notice 30 days before, unless another number of days (or none) is given. */
const on = (c: Case, repaid: string, noticeDaysBefore: number | null = 30): Case => ({ ...c, repaid, noticeOn: noticeDaysBefore === null ? undefined : addDays(repaid, -noticeDaysBefore) });

export default function check7(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const v = (id: string) => get(id).value as string;
  const num = (id: string) => Number(v(id));

  // ═══ Review r1 (2.10): a grace period delays payments, it does not lower the cost ═══
  const grace: Track = { principal: "600000", rates: ["4.5"], months: 300, method: "grace_partial", graceMonths: 24 };
  const plain: Track = { principal: "600000", rates: ["4.5"], months: 300 };
  add(M.given("r1.principal", "600000.00"));
  add(F.num("r1.rate", "4.5"));
  add(F.num("r1.grace", "24"));
  add(M.first("r1.first_plain", [plain]));
  add(M.first("r1.first_grace", [grace]));
  add(M.payment("r1.after_grace", [grace], 25));
  add(M.total("r1.total_plain", [plain]));
  add(M.total("r1.total_grace", [grace]));
  add(M.difference("r1.answer", get("r1.total_grace"), get("r1.total_plain")));
  add(M.difference("r1.err_first", get("r1.first_plain"), get("r1.first_grace")));
  claim(num("r1.answer") > 0 && num("r1.err_first") > 0 && num("r1.after_grace") > num("r1.first_plain"), "r1: the grace lowers the first payment, raises the later ones and the total");

  // ═══ Review r2 (3.10): a fee taken on the day the loan is given raises the rate that explains the payments ═══
  const small: Track = { principal: "60000", rates: ["4.8"], months: 12 };
  add(M.given("r2.principal", "60000.00"));
  add(F.num("r2.rate", "4.8"));
  add(M.given("r2.fee", "600.00"));
  add(M.difference("r2.received", get("r2.principal"), get("r2.fee")));
  add(M.first("r2.payment", [small]));
  add(M.irrEffective("r2.no_fee", [small], v("r2.principal"), 2));
  add(M.irrEffective("r2.answer", [small], v("r2.received"), 2));
  add(M.irrX12("r2.err_x12", [small], v("r2.received"), 2));
  claim(num("r2.answer") > num("r2.no_fee") && num("r2.err_x12") < num("r2.answer") && num("r2.err_x12") !== num("r2.no_fee"), "r2: the fee raises the rate; the x12 slip and the no-fee rate are different from the answer");

  // ═══ Review r3 (4.6): what is left for living, and the largest payment a budget allows ═══
  add(reg.given("r3.net", "19800"));
  add(reg.given("r3.other", "1150"));
  add(reg.given("r3.budget", "11600"));
  add(reg.budgetMax("r3.answer", "19800", [v("r3.other")], "11600"));
  add(reg.budgetMax("r3.err_no_other", "19800", [], "11600"));
  add(reg.left("r3.left_if_paid", "19800", [v("r3.other"), v("r3.answer")]));
  claim(num("r3.answer") < num("r3.err_no_other") && num("r3.left_if_paid") === num("r3.budget"), "r3: the largest payment leaves exactly the budget");

  // ═══ Review r4 (5.5): an average (effective) against an offer (contract rate) ═══
  add(F.num("r4.avg", "5.10"));
  add(F.num("r4.offer", "5.0"));
  add({ id: "r4.offer_eff", kind: "effective_annual_rate", inputs: { annual_percent: "5.0", periods_per_year: 12, decimals: 2 }, value: roundedString(effectiveAnnualRate("5.0", 12), 2) });
  claim(num("r4.offer_eff") > num("r4.avg") && num("r4.offer") < num("r4.avg"), "r4: the offer looks below the average as written and is above it once both are effective");

  // ═══ 7.1: the five fees ═══
  // q1: the small fees of a linked loan with a yearly reset (no discounting fee): the operational fee, the no-notice fee, the index fee.
  const Q1: Case = { principal: "600000", rate: "3.8", term: 300, granted: "2022-05-01", repaid: "2026-11-11", reset: 12, linkage: "linked", avgToday: "3.2", avgGrant: "3.0", noticeOn: "2026-11-05", indexChange: "0.3", balance: "410000" };
  add(M.given("q1.balance", "410000.00"));
  add(F.num("q1.index_change", "0.3"));
  add(fee("q1.notice_days", Q1, "notice_days"));
  add(fee("q1.op", Q1, "operational"));
  add(fee("q1.nn", Q1, "no_notice"));
  add(fee("q1.ix", Q1, "index"));
  add(fee("q1.sum", Q1, "total"));
  add(percentOfAmount("q1.ix_no_half", "410000", "0.3"));
  add(totalOf("q1.err_no_half", [get("q1.op"), get("q1.nn"), get("q1.ix_no_half")]));
  add(totalOf("q1.err_no_op", [get("q1.nn"), get("q1.ix")]));
  add(totalOf("q1.err_no_nn", [get("q1.op"), get("q1.ix")]));
  claim(num("q1.sum") === num("q1.op") + num("q1.nn") + num("q1.ix") && num("q1.notice_days") < 10 && num("q1.nn") > 0 && num("q1.ix") > 0, "q1: the three fees all apply and add up");

  // q2: the operational fee is charged once per repayment, not per track (four tracks).
  add(M.given("q2.balance", "380000.00"));
  add(fee("q2.op", Q1, "operational"));
  add(erTimes("q2.err_per_track", get("q2.op"), 4));
  add(percentOfAmount("q2.err_pct", "380000", "0.1"));
  claim(num("q2.err_per_track") === 4 * num("q2.op"), "q2: four times the fee");

  // ═══ 7.2: the discounting fee ═══
  // q3: an effective average becomes a monthly rate by the twelfth root, not by dividing by 12.
  add(F.num("q3.avg", "3.9"));
  add(monthlyPercent("q3.answer", "effective", "3.9", 3));
  add(monthlyPercent("q3.err_div12", "nominal", "3.9", 3));
  claim(num("q3.answer") < num("q3.err_div12"), "q3: dividing the effective average by 12 gives a bigger monthly rate than the twelfth root");

  // q4: the lower of the two formulas, the reduction for time served, the operational fee.
  add(M.given("q4.v1", "41300.00"));
  add(M.given("q4.v2", "26850.00"));
  add(minOf("q4.lower", [get("q4.v1"), get("q4.v2")]));
  add(F.num("q4.reduction", "20"));
  add(afterReduction("q4.discount", get("q4.lower"), 20));
  add(fee("q4.op", Q1, "operational"));
  add(totalOf("q4.answer", [get("q4.discount"), get("q4.op")]));
  add(afterReduction("q4.high_discount", get("q4.v1"), 20));
  add(totalOf("q4.err_high", [get("q4.high_discount"), get("q4.op")]));
  add(totalOf("q4.err_no_reduction", [get("q4.lower"), get("q4.op")]));
  add(afterReduction("q4.discount_30", get("q4.lower"), 30));
  add(totalOf("q4.err_30", [get("q4.discount_30"), get("q4.op")]));

  // q5: the second formula comes out negative (the grant average is below today's).
  const Q5: Case = { principal: "480000", rate: "5.7", term: 240, granted: "2023-02-01", repaid: "2026-08-03", avgToday: "4.9", avgGrant: "4.3", noticeOn: "2026-07-04" };
  add(fee("q5.paid", Q5, "paid"));
  add(fee("q5.v1", Q5, "v1"));
  add(fee("q5.v2", Q5, "v2"));
  add(fee("q5.lower", Q5, "lower"));
  add(fee("q5.op", Q5, "operational"));
  add(fee("q5.sum", Q5, "sum"));
  add(fee("q5.total", Q5, "total"));
  add(F.num("q5.avg_today", "4.9"));
  add(F.num("q5.avg_grant", "4.3"));
  claim(num("q5.v1") > 0 && num("q5.v2") < 0 && num("q5.sum") < 0 && num("q5.total") === 0, "q5: the second formula is negative and the sum is below zero");

  // ═══ 7.3: exit points, notice, the fee over time ═══
  // q6: a notice given 7 days ahead is too short: the no-notice fee follows (days 10 and 45 are left alone).
  const Q6: Case = { principal: "450000", rate: "5.1", term: 240, granted: "2022-11-01", repaid: "2026-12-09", avgToday: "4.5", avgGrant: "5.0", noticeOn: "2026-12-02", balance: "380000" };
  add(M.given("q6.balance", "380000.00"));
  add(fee("q6.notice_days", Q6, "notice_days"));
  add(fee("q6.answer", Q6, "no_notice"));
  add(M.given("q6.err_zero", "0.00"));
  add(percentOfAmount("q6.err_1pct", "380000", "1"));
  add(percentOfAmount("q6.err_10pct", "380000", "10"));
  claim(num("q6.notice_days") === 7 && num("q6.answer") === 380, "q6: a 7-day notice, 0.1% of 380,000");

  // q7: the exit point of a variable track: the reset day itself.
  const V7: Case = { principal: "350000", rate: "4.4", term: 300, granted: "2022-09-10", repaid: "2027-09-10", reset: 60, avgToday: "3.7", avgGrant: "4.2" };
  const v7exit = on(V7, "2027-09-10");
  const v7before = on(V7, "2027-09-09");
  const v7four = on(V7, "2027-05-10");
  add(datePlusMonths("q7.reset_date", V7.granted, 60));
  add(fee("q7.exit_status", v7exit, "status"));
  add(fee("q7.exit_total", v7exit, "total"));
  add(fee("q7.exit_op", v7exit, "operational"));
  add(fee("q7.before_total", v7before, "total"));
  add(fee("q7.four_total", v7four, "total"));
  add(fee("q7.four_months", v7four, "months_to_reset"));
  claim(v("q7.exit_status") === "exit_point" && num("q7.exit_total") === num("q7.exit_op") && num("q7.before_total") > num("q7.exit_total") && num("q7.four_total") > num("q7.before_total"), "q7: only the operational fee on the reset day, more the day before");

  // q8: the step of the reductions: three years from the grant, 1.2.2027. The fee before the reduction is held still for the question.
  const S8: Case = { principal: "640000", rate: "5.5", term: 300, granted: "2024-02-01", repaid: "2027-01-29", avgToday: "4.4", avgGrant: "5.0" };
  const s8a = on(S8, "2027-01-29");
  const s8b = on(S8, "2027-02-03");
  add(datePlusMonths("q8.anniversary", S8.granted, 36));
  add(fee("q8.reduction_a", s8a, "reduction_percent"));
  add(fee("q8.reduction_b", s8b, "reduction_percent"));
  add(fee("q8.lower_a", s8a, "lower"));
  add(fee("q8.total_a", s8a, "total"));
  add(fee("q8.total_b", s8b, "total"));
  add(percentOf("q8.answer", get("q8.lower_a"), "20"));
  add(M.difference("q8.full_saving", get("q8.total_a"), get("q8.total_b")));
  add(afterReduction("q8.err_after", get("q8.lower_a"), 20));
  claim(num("q8.reduction_a") === 0 && num("q8.reduction_b") === 20 && num("q8.full_saving") > num("q8.answer"), "q8: no reduction before the third anniversary, 20% after; the full saving is more than 20% of the held fee");

  // ═══ 7.4: the test of 15א; a lower payment is not a lower total ═══
  // The existing loan E (invented): 520,000 ₪, fixed unlinked, 5.30% nominal, 25 years, granted 1.11.2022, repaid 2.11.2026 with notice.
  const E: Case = { principal: "520000", rate: "5.30", term: 300, granted: "2022-11-01", repaid: "2026-11-02", avgToday: "4.60", avgGrant: "5.15", noticeOn: "2026-10-03" };
  const eDiscount = add(fee("e.fee_discount", E, "discount"));
  const eOp = add(fee("e.fee_op", E, "operational"));
  add(fee("e.paid", E, "paid"));
  const track: Track = { principal: E.principal, rates: [E.rate], months: E.term, rounding: "exact" };
  const paid = Number(v("e.paid"));
  const S: ExistingSpec = { tracks: [track], paid: [paid], fees: [eDiscount.value as string], shared: eOp.value as string };
  add(M.given("e.contract", "5.30"));
  add(stay("e.balance", S, "whole", "balance"));
  add(stay("e.months", S, "whole", "months"));
  add(stay("e.first", S, "whole", "first"));
  add(stay("e.total", S, "whole", "total"));
  add(stay("e.fee", S, "whole", "fee"));
  add(stay("e.financed", S, "whole", "financed"));
  add(stay("e.rate0", S, "whole", "rate_without", 2));
  add(stay("e.rate1", S, "whole", "rate_with", 2));
  add(M.given("e.costs", moneyString(NEW_LOAN_COSTS)));
  const financed = v("e.financed");
  const offer = (rate: string, months: number, upfront: string = NEW_LOAN_COSTS) => fixedOffer({ name: "הצעה", amount: financed, months, rate, upfront }, REFINANCE_FORECAST);
  const swm = (id: string, o: ReturnType<typeof offer>, m: Parameters<typeof sw>[5], cash: string = NEW_LOAN_COSTS, decimals = 2) => add(sw(id, S, "whole", o, FC, m, { cash, decimals }));
  claim(num("e.rate1") < num("e.rate0"), "e: the rate for comparison is below the expected total rate");

  // q9: why the rate for comparison is lower than the expected total rate (facts: e.rate0, e.rate1, e.fee).
  // q10: which of three offers passes the test.
  for (const [tag, rate] of [["a", "4.7"], ["b", "5.1"], ["c", "5.4"]] as const) {
    const o = offer(rate, 252);
    add(F.num(`q10.${tag}.input`, rate));
    swm(`q10.${tag}.rate`, o, "new_rate");
    swm(`q10.${tag}.margin`, o, "margin");
    swm(`q10.${tag}.worth`, o, "worthwhile");
    swm(`q10.${tag}.first`, o, "new_first");
  }
  claim(get("q10.a.worth").value === true && get("q10.b.worth").value === false && get("q10.c.worth").value === false, "q10: only offer a passes");
  claim(num("q10.b.rate") < num("e.contract") && num("q10.b.rate") < num("e.rate0") && num("q10.c.rate") > num("e.rate0") && num("q10.a.rate") < num("e.rate1") && num("q10.b.rate") > num("e.rate1"), "q10: offer b is under the loan's own rates and over the rate for comparison");

  // q11: keep paying today's payment on a cheaper new loan: how many months does it last?
  add(F.num("q11.rate", "4.3"));
  add(monthsKept("q11.answer", financed, "4.3", v("e.first")));
  add(monthsKept("q11.same_rate", financed, "5.3", v("e.first")));
  claim(num("q11.answer") < num("e.months"), "q11: a cheaper loan paid at today's payment ends sooner");

  // q12: a lower payment, a bigger total (the same rate as a passing offer, stretched to 25 years).
  const O12 = offer("4.7", 300);
  add(F.num("q12.rate", "4.7"));
  add(F.num("q12.months", "300"));
  swm("q12.first", O12, "new_first");
  swm("q12.gap", O12, "monthly_gap");
  swm("q12.rate_new", O12, "new_rate");
  swm("q12.worth", O12, "worthwhile");
  swm("q12.switch_total", O12, "switch_total");
  swm("q12.cash_be", O12, "cash_break_even");
  add(M.difference("q12.extra", get("q12.switch_total"), get("e.total")));
  add(M.times("q12.naive", get("q12.gap"), num("e.months")));
  claim(get("q12.worth").value === true && num("q12.gap") > 0 && num("q12.extra") > 0 && num("q12.naive") > 0, "q12: the offer passes, lowers the payment and raises the total");

  // ═══ 7.5: internal and external refinance ═══
  // q13: the same rate and term from another bank (costs 2,400) and from the bank the loan is with (costs 900, INVENTED).
  const oExt = offer("4.7", 252, EXTERNAL_COSTS);
  const oInt = offer("4.7", 252, INTERNAL_COSTS);
  add(M.given("q13.costs_ext", moneyString(EXTERNAL_COSTS)));
  add(M.given("q13.costs_int", moneyString(INTERNAL_COSTS)));
  add(F.num("q13.rate", "4.7"));
  swm("q13.ext.saving", oExt, "total_saving", EXTERNAL_COSTS);
  swm("q13.int.saving", oInt, "total_saving", INTERNAL_COSTS);
  swm("q13.ext.first", oExt, "new_first", EXTERNAL_COSTS);
  swm("q13.int.first", oInt, "new_first", INTERNAL_COSTS);
  add(M.difference("q13.answer", get("q13.int.saving"), get("q13.ext.saving")));
  add(M.difference("q13.cost_gap", get("q13.costs_ext"), get("q13.costs_int")));
  claim(v("q13.answer") === v("q13.cost_gap") && v("q13.ext.first") === v("q13.int.first"), "q13: with the same rate and term the saving differs by exactly the difference in costs");

  // q14: which claim the course can make about the two kinds of refinance: no numbers.

  // ═══ 7.6: complex deals, part one (introduction) ═══
  // q15: an upgrader's purchase under the team's transcription of Directive 329 (70% for a replacement home, 75% for a single home).
  add(reg.given("q15.price", "2900000"));
  add(reg.givenNumber("q15.pct_rep", "70"));
  add(reg.givenNumber("q15.pct_only", "75"));
  add(reg.maxLoan("q15.max_rep", "2900000", "replacement"));
  add(reg.maxLoan("q15.max_only", "2900000", "only_home"));
  add(reg.difference("q15.equity_rep", get("q15.price"), get("q15.max_rep")));
  add(reg.difference("q15.equity_only", get("q15.price"), get("q15.max_only")));
  add(reg.given("q15.sale", "2100000"));
  add(reg.given("q15.old_loan", "650000"));
  add(reg.difference("q15.left", get("q15.sale"), get("q15.old_loan")));
  add(reg.difference("q15.answer", get("q15.left"), get("q15.equity_rep")));
  add(reg.difference("q15.err_single", get("q15.left"), get("q15.equity_only")));
  claim(num("q15.answer") > 0 && num("q15.err_single") > num("q15.answer"), "q15: the replacement-home ceiling leaves less spare than the single-home one");

  // q16: a bridge loan: what the course knows and does not. No numbers.

  // ═══ 7.7: complex deals, part two (introduction) ═══
  // q17: pari passu against a second-degree mortgage: no numbers.
  // q18: two lenders on one property, IF the summary of Directive 329 is right that the financing ratio counts every loan on the property.
  add(reg.given("q18.value", "2400000"));
  add(reg.givenNumber("q18.pct_a", "45"));
  add(reg.givenNumber("q18.pct_b", "25"));
  add(reg.givenNumber("q18.cap_pct", "75"));
  add(reg.atPercent("q18.a", "2400000", "45"));
  add(reg.atPercent("q18.b", "2400000", "25"));
  add(AF.sum("q18.both", [v("q18.a"), v("q18.b")]));
  add(reg.ltv("q18.ltv", v("q18.both"), "2400000"));
  add(reg.maxLoan("q18.cap", "2400000", "only_home"));
  add(reg.difference("q18.answer", get("q18.cap"), get("q18.both")));
  add(reg.difference("q18.err_one", get("q18.cap"), get("q18.a")));
  claim(num("q18.answer") > 0 && num("q18.err_one") > num("q18.answer"), "q18: counted together, the room is smaller than counted bank by bank");

  // ═══ 7.8: the workshop, case C ═══
  // The fee is the fixture's (lesson 7.2); the build stops if it drifts from the input the refinance module takes.
  const cC: Case = { ...FEE_CASE };
  add(fee("c.fee_discount", cC, "discount"));
  add(fee("c.fee_op", cC, "operational"));
  claim(v("c.fee_discount") === moneyString(CASE_C_DISCOUNT_FEE) && v("c.fee_op") === moneyString(OPERATIONAL_FEE), "case C: the fee of lesson 7.2 drifted from the refinance module's input");
  const SC: ExistingSpec = { tracks: [CASE_C_LOAN], paid: [CASE_C_PAID], fees: [CASE_C_DISCOUNT_FEE], shared: OPERATIONAL_FEE };
  add(stay("c.balance", SC, "whole", "balance"));
  add(stay("c.financed", SC, "whole", "financed"));
  add(stay("c.first", SC, "whole", "first"));
  add(M.given("c.top_up", moneyString(TOP_UP)));
  add(F.num("c.rate", bank("b").rate));
  add(F.num("c.term", String(bank("b").months)));
  const cFinanced = v("c.financed");
  const cOffer = (amount: string) => fixedOffer({ name: bank("b").name, amount, months: bank("b").months, rate: bank("b").rate, upfront: NEW_LOAN_COSTS }, REFINANCE_FORECAST);
  const cWithTop = moneyString(new Decimal(cFinanced).plus(TOP_UP));
  const cm = (id: string, o: ReturnType<typeof cOffer>, m: Parameters<typeof sw>[5]) => add(sw(id, SC, "whole", o, FC, m, { cash: NEW_LOAN_COSTS, decimals: 2 }));
  cm("c.new_loan", cOffer(cFinanced), "new_loan");
  cm("c.first_plain", cOffer(cFinanced), "new_first");
  cm("c.total_plain", cOffer(cFinanced), "new_total");
  cm("c.top_loan", cOffer(cWithTop), "new_loan");
  cm("c.top_first", cOffer(cWithTop), "new_first");
  cm("c.top_total", cOffer(cWithTop), "new_total");
  cm("c.rate_plain", cOffer(cFinanced), "new_rate");
  cm("c.worth", cOffer(cFinanced), "worthwhile");
  add(stay("c.rate1", SC, "whole", "rate_with", 2));
  add(M.difference("c.add_first", get("c.top_first"), get("c.first_plain")));
  add(M.difference("c.add_total", get("c.top_total"), get("c.total_plain")));
  add(M.difference("c.top_interest", get("c.add_total"), get("c.top_up")));
  claim(v("c.top_loan") === moneyString(new Decimal(v("c.new_loan")).plus(TOP_UP)) && get("c.worth").value === true && num("c.top_interest") > 0, "case C: the top-up enlarges the new loan by exactly its amount and costs interest");

  return {
    lesson: "check-7",
    title: "בדיקת סיום שלב 7",
    note: "Teaching numbers only, new inputs (case C, in the last two questions, is the stage's own fixture). Each fact reuses a lesson's kind. Families, banks, rates, terms, costs and incomes are the course's invented ones; the Banking Order on early repayment (2002) and section 15א of Directive 451 are the team's transcription (unverified) and are stated as premises; the averages A and C of case C are values the team read on 2026-08-02, unverified. Nothing here is a bank's offer, market data, or how a real bank decides; nothing states a rule of a bridge loan, builder financing, self-build, a second-degree mortgage, pari passu or a reverse mortgage.",
    facts,
  };
}
