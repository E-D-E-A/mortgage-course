/**
 * The stage-6 completion check (src/pages/checks/6.mdx): every number its questions, answers and common
 * wrong answers show, including the four questions it repeats from stages 2, 3, 4 and 5 (lessons 2.6, 3.3,
 * 4.3, 5.3). Each fact reuses a kind a lesson already defined, through the stage's own fact builders
 * (_positioning-facts, _lever-facts, _outreach-facts, _bankpolicy-facts, _offer-facts, _forecast-facts,
 * lesson-3-8, affordability-facts, regulation-facts), so checks/independent_check.py rechecks every computed
 * one with no new Python.
 *
 * Teaching numbers only: new inputs, not a lesson's worked example or exercise. Every family is invented and
 * named as the stage-6 lessons name them (ליאור ועדי, דנה ורועי, יעל ואלון, הדס ואיתי, אבי ומיכל, נועם ושירה);
 * every bank is the course's fictional "בנק א׳ … ד׳", with the price lists of lessons 6.6–6.8
 * (src/data/case-a-offers.ts) and the RULES of lesson 6.9 (src/data/case-a-positioning.ts), which are the
 * exercise's own, never a real bank's. A question that leans on such a rule states it in its own text.
 *
 * What is a premise and what is a fact. Directive 329's lines (75% financing, 40% capital threshold, 50% ratio,
 * the 18-month rule) and Directive 451's clocks (24 or 12 calendar days) are the team's transcription, not
 * checked against the directives; the questions state them as premises ("לפי תעתיק הצוות; לא אומת"), they never
 * ask the learner to produce them. The prime convention (Bank of Israel rate + 1.5) is lesson 2.1's, also
 * unverified. How many rounds a re-pricing takes (3 business days, 7 calendar days to keep after the answer),
 * what a bank moves in a round, the bank's invented cost of funds and every line of the four fictional banks
 * are RULES OF THE EXERCISE, written into the question. Field-knowledge claims (thresholds of 30%–35%, what a
 * bank does with a line, whether a competing offer sharpens a price) are never asked: the questions ask what the
 * lessons teach about them ("unknown", "a hypothesis", "the price of a lever"). No question uses a real bank's
 * behaviour, a real average, a real client, or an unverified field claim as a fact.
 */
import Decimal from "decimal.js";
import { BANKS as OFFER_BANKS, FORECASTS, uniformOffer } from "../../src/data/offer-examples.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BANK_PRICES, EXERCISE_COST_OF_FUNDS, priced, ROUND_RULE, type MixShape } from "../../src/data/case-a-offers.ts";
import { bank } from "../../src/data/case-a-positioning.ts";
import { basketById } from "../../src/lib/calc/offers.ts";
import { PRIME_ADDITION, primeFromPolicy } from "../../src/lib/calc/lending.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import { primeTrackRate } from "../../src/lib/calc/amortization.ts";
import { LTV_CEILINGS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import { OBLIGATION_MONTHS } from "../../src/lib/calc/affordability.ts";
import { bankClocks, type MixEdit } from "../../src/lib/calc/outreach.ts";
import { CALENDAR_2026 } from "../../src/lib/calc/process.ts";
import type { PositionCase } from "../../src/lib/calc/levers.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Track } from "../../src/lib/calc/metrics.ts";
import type { Fact, LessonData } from "../build-data.ts";
import * as M from "./lesson-3-8.ts";
import * as F from "./_forecast-facts.ts";
import * as AF from "./affordability-facts.ts";
import * as reg from "./regulation-facts.ts";
import * as P from "./_positioning-facts.ts";
import * as L from "./_lever-facts.ts";
import * as O from "./_outreach-facts.ts";
import { maxLoanAt, totalFact, verdictFacts } from "./_bankpolicy-facts.ts";
import { basis, measure } from "./_offer-facts.ts";

/** A claim the questions make about computed numbers: the build fails if the data say otherwise. */
const claim = (ok: boolean, what: string) => {
  if (!ok) throw new Error(`check-6: ${what}`);
};

const BASE = SCENARIOS.base;
const STRESS = SCENARIOS.stress;
const ZERO_SCENARIO = { inflation: "0", primeShift: "0", anchorShift: "0" };
const { roundDays, reserve: ROUND_RESERVE } = ROUND_RULE;
const cal = CALENDAR_2026;

export default function check6(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const v = (id: string) => get(id).value as string;
  const num = (id: string) => Number(v(id));
  const lev = (id: string, c: PositionCase, measureName: L.LevMeasure, move?: Parameters<typeof L.levFact>[3]) => add(L.levFact(id, c, measureName, move));

  // ═══ Review r1 (2.6): a prime track after the Bank of Israel moves its rate ═══
  add(F.num("r1.policy", "4.00"));
  add(F.num("r1.cut", "0.25"));
  add(F.num("r1.margin", "-0.60"));
  add(F.points("r1.policy_after", "minus", get("r1.policy"), get("r1.cut"), 2));
  add({ id: "r1.prime", kind: "lend_prime", inputs: { policy_rate: v("r1.policy_after"), addition: PRIME_ADDITION }, value: plainNumber(primeFromPolicy(v("r1.policy_after"))) });
  add({ id: "r1.answer", kind: "amort_prime_track_rate", inputs: { prime: v("r1.prime"), margin: v("r1.margin") }, value: plainNumber(primeTrackRate(v("r1.prime"), v("r1.margin"))) });
  // The slips: forgetting the 1.5 points, and forgetting the cut.
  add(F.points("r1.err_no_addition", "plus", get("r1.policy_after"), get("r1.margin"), 2));
  add({ id: "r1.prime_before", kind: "lend_prime", inputs: { policy_rate: v("r1.policy"), addition: PRIME_ADDITION }, value: plainNumber(primeFromPolicy(v("r1.policy"))) });
  add({ id: "r1.err_no_cut", kind: "amort_prime_track_rate", inputs: { prime: v("r1.prime_before"), margin: v("r1.margin") }, value: plainNumber(primeTrackRate(v("r1.prime_before"), v("r1.margin"))) });
  add(F.num("r1.addition", PRIME_ADDITION));

  // ═══ Review r2 (3.3): the balance after seven years of a level-payment loan ═══
  const r2: Track = { principal: "850000", rates: ["4.1"], months: 300 };
  add(M.given("r2.principal", "850000"));
  add(M.given("r2.rate", "4.1"));
  add(M.given("r2.years", "25"));
  add(M.given("r2.paid_years", "7"));
  add(M.months("r2.paid", 7));
  add(M.first("r2.payment", [r2]));
  add(M.balanceAfter("r2.answer", r2, 84));
  add(M.times("r2.paid_total", get("r2.payment"), 84));
  add(M.difference("r2.err_straight", get("r2.principal"), get("r2.paid_total")));

  // ═══ Review r3 (4.3): the payment ratio, with a loan that still counts ═══
  const r3Loan = { kind: "loan" as const, monthly: "1100", monthsLeft: 22 };
  add(M.given("r3.recognised", "19800"));
  add(AF.given("r3.loan_monthly", "1100"));
  add(AF.given("r3.loan_months", 22));
  add(AF.given("r3.line_months", OBLIGATION_MONTHS));
  add(M.given("r3.payment", "6350"));
  add(AF.disposable("r3.disposable", "19800", [r3Loan]));
  add(AF.ratio("r3.answer", "6350", v("r3.disposable")));
  add(AF.ratio("r3.err_recognised", "6350", "19800"));

  // ═══ Review r4 (5.3): two offers on different amounts are not on one basis ═══
  const bk = (id: "a" | "b" | "c") => OFFER_BANKS.find((b) => b.id === id)!;
  const u2 = (id: "a" | "b" | "c", loan: string) => uniformOffer(bk(id), basketById("uniform_2"), "forecast_a", loan);
  const r4b = u2("b", "750000.00");
  const r4c = u2("c", "1200000.00");
  add(M.given("r4.b_loan", "750000.00"));
  add(M.given("r4.c_loan", "1200000.00"));
  for (const [id, o] of [["b", r4b], ["c", r4c]] as const) {
    add(measure(`r4.${id}.total`, o, FORECASTS, "total"));
    add(measure(`r4.${id}.rate`, o, FORECASTS, "rate", 2));
    add(measure(`r4.${id}.first`, o, FORECASTS, "first"));
  }
  add(basis("r4.basis", [r4b, r4c]));
  add(basis("r4.basis_same", [u2("b", "1200000.00"), u2("c", "1200000.00")]));
  add(measure("r4.b.total_same", u2("b", "1200000.00"), FORECASTS, "total"));
  claim((get("r4.basis").value as string[]).join() === "amount", "r4: the two offers must differ only in the amount");
  claim((get("r4.basis_same").value as string[]).length === 0, "r4: the same amount at both banks is one basis");
  claim(num("r4.b.total") < num("r4.c.total") && num("r4.b.rate") > num("r4.c.rate"), "r4: bank ב׳ has the lower total and bank ג׳ the lower rate");

  // ═══ 6.1 ═══
  // q1: the three kinds of arrow. The calculable one, on invented numbers.
  add(P.givenMoney("q1.price", "1900000"));
  add(P.givenMoney("q1.equity", "600000"));
  add(P.difference("q1.loan", get("q1.price"), get("q1.equity")));

  // q2: closing a loan from the equity makes the loan bigger, and the financing ratio crosses the ceiling.
  add(P.givenMoney("q2.price", "1700000"));
  add(P.givenMoney("q2.equity", "440000"));
  add(P.difference("q2.loan", get("q2.price"), get("q2.equity")));
  add(P.givenNumber("q2.ceiling", LTV_CEILINGS.only_home));
  add(reg.ltv("q2.ltv0", v("q2.loan"), v("q2.price")));
  add(reg.maxLoan("q2.max_loan", v("q2.price"), "only_home"));
  add(P.loanRoomFact("q2.room", v("q2.price"), v("q2.loan"), LTV_CEILINGS.only_home));
  add(P.givenMoney("q2.payoff", "45000"));
  add(P.sumOf("q2.loan_closed", [get("q2.loan"), get("q2.payoff")]));
  add(reg.ltv("q2.ltv1", v("q2.loan_closed"), v("q2.price")));
  add(P.equityNeededFact("q2.answer", v("q2.price"), v("q2.loan_closed"), LTV_CEILINGS.only_home));
  claim(num("q2.ltv0") < 75 && num("q2.ltv1") > 75, "q2: the loan is under the ceiling before, over it after the closing");
  claim(num("q2.room") < num("q2.payoff") && num("q2.answer") !== num("q2.room"), "q2: the three wrong answers are three different numbers");

  // ═══ 6.2 ═══
  // q3: a payment ratio just above the capital threshold.
  add(P.givenNumber("q3.line", PTI_CAPITAL_THRESHOLD));
  add(P.givenNumber("q3.limit", PTI_LIMIT));
  add(P.givenMoney("q3.disposable", "16000"));
  add(P.givenMoney("q3.payment", "6800"));
  add(AF.ratio("q3.ratio", "6800", "16000"));
  add(P.points("q3.points", v("q3.ratio"), PTI_CAPITAL_THRESHOLD));
  claim(num("q3.points") < 0, "q3: the ratio is over the line");

  // q4: the price of a longer term shows in the total.
  add(P.givenMoney("q4.principal", "800000"));
  add(P.givenNumber("q4.rate", "4.2"));
  add(P.givenNumber("q4.from_years", 15));
  add(P.givenNumber("q4.to_years", 20));
  add(P.termRouteFact("q4.from_payment", v("q4.principal"), "4.2", 180, 240, "from_payment"));
  add(P.termRouteFact("q4.to_payment", v("q4.principal"), "4.2", 180, 240, "to_payment"));
  add(P.termRouteFact("q4.from_total", v("q4.principal"), "4.2", 180, 240, "from_total"));
  add(P.termRouteFact("q4.to_total", v("q4.principal"), "4.2", 180, 240, "to_total"));
  add(P.termRouteFact("q4.answer", v("q4.principal"), "4.2", 180, 240, "extra_total"));
  add(P.termRouteFact("q4.err_drop", v("q4.principal"), "4.2", 180, 240, "payment_drop"));
  claim(num("q4.answer") > 0 && num("q4.err_drop") > 0, "q4: the longer term lowers the payment and raises the total");

  // ═══ 6.3 ═══
  // q5: how much more recognised income puts the payment on the line.
  add(P.givenMoney("q5.disposable", "14500"));
  add(P.givenMoney("q5.payment", "6400"));
  add(P.givenNumber("q5.line", PTI_CAPITAL_THRESHOLD));
  add(P.incomeRoomFact("q5.answer", "14500", "6400", PTI_CAPITAL_THRESHOLD));
  add(P.sumOf("q5.err_total", [get("q5.disposable"), get("q5.answer")]));
  add(P.paymentCutFact("q5.err_cut", "14500", "6400", PTI_CAPITAL_THRESHOLD));
  add(AF.ratio("q5.ratio", "6400", "14500"));
  claim(num("q5.ratio") > 40, "q5: the family is over the line");

  // q6: waiting for the 18-month rule. Its price is time and risk, not shekels. A car loan of 1,300 a month, 30 payments left; 13 months of waiting leave 17.
  const c5: PositionCase = {
    deal: "only_home",
    price: "1700000",
    equity: "500000",
    reserve: "40000",
    tracks: [{ kind: "fixed_unlinked", amount: "1200000", rate: "4.5", months: 300 }],
    base: ZERO_SCENARIO,
    stress: ZERO_SCENARIO,
    incomes: ["10500", "9500"],
    obligations: [{ kind: "loan", monthly: "1300", monthsLeft: 30 }],
  };
  add(L.given("q6.left", 30));
  add(L.given("q6.line_months", OBLIGATION_MONTHS));
  add(L.givenMoney("q6.monthly", "1300"));
  add(L.given("q6.wait", 13));
  lev("q6.remaining", c5, "months_left", { lever: "wait", months: 13 });
  add(M.times("q6.err_paid", get("q6.monthly"), 13));
  claim(num("q6.remaining") === 17, "q6: the wait leaves 17 payments, clearly under the 18-month line");

  // ═══ 6.4 ═══
  // q7: what one percentage point costs. One track, 1,050,000 at 4.8% for 25 years, a household bringing 16,500 a month.
  const c7: PositionCase = {
    deal: "only_home",
    price: "1500000",
    equity: "450000",
    reserve: "100000",
    tracks: [{ kind: "fixed_unlinked", amount: "1050000", rate: "4.8", months: 300 }],
    base: ZERO_SCENARIO,
    stress: ZERO_SCENARIO,
    incomes: ["16500"],
    obligations: [],
  };
  add(L.givenMoney("q7.loan", "1050000"));
  add(L.given("q7.rate", "4.8"));
  add(L.givenMoney("q7.income", "16500"));
  add(L.givenMoney("q7.cash", "60000"));
  lev("q7.ratio0", c7, "ratio");
  lev("q7.ratio1", c7, "ratio", { lever: "equity", add: "60000" });
  add(L.difference("q7.gain", get("q7.ratio0"), get("q7.ratio1")));
  add(L.divFact("q7.answer", get("q7.cash"), get("q7.gain")));
  add(L.divFact("q7.err_ratio", get("q7.cash"), get("q7.ratio0")));

  // q8: three levers in three currencies. A household over the 40% line, with a loan that counts.
  const c8: PositionCase = {
    deal: "only_home",
    price: "1800000",
    equity: "540000",
    reserve: "80000",
    tracks: [{ kind: "fixed_unlinked", amount: "1260000", rate: "4.5", months: 300 }],
    base: BASE,
    stress: STRESS,
    incomes: ["9500", "8500"],
    obligations: [{ kind: "loan", monthly: "1000", monthsLeft: 20 }],
  };
  add(L.givenMoney("q8.loan", "1260000"));
  add(L.given("q8.rate", "4.5"));
  add(L.givenMoney("q8.income", "18000"));
  add(L.givenMoney("q8.car", "1000"));
  add(L.given("q8.car_months", 20));
  add(L.given("q8.line", "40"));
  lev("q8.ratio0", c8, "ratio");
  const q8step = add(L.stepFact("q8.equity", c8, "40", "1000"));
  const eqMove = { lever: "equity", add: v(q8step.id) } as const;
  lev("q8.eq.ratio", c8, "ratio", eqMove);
  lev("q8.eq.total", c8, "total", eqMove);
  lev("q8.total0", c8, "total");
  const termMove = { lever: "term", months: 60 } as const;
  lev("q8.term.ratio", c8, "ratio", termMove);
  lev("q8.term.total", c8, "total", termMove);
  add(L.difference("q8.term.extra", get("q8.term.total"), get("q8.total0")));
  add(L.difference("q8.eq.saving", get("q8.total0"), get("q8.eq.total")));
  const waitMove = { lever: "wait", months: 3 } as const;
  lev("q8.wait.ratio", c8, "ratio", waitMove);
  lev("q8.wait.left", c8, "months_left", waitMove);
  add(L.given("q8.wait", 3));
  claim(num("q8.ratio0") > 40, "q8: the household starts over the line");
  claim(num("q8.eq.ratio") <= 40 && num("q8.term.ratio") <= 40 && num("q8.wait.ratio") <= 40, "q8: each of the three levers reaches the line");
  claim(Number(v("q8.equity")) > 0 && Number(v("q8.equity")) < num("q8.term.extra"), "q8: the cash is a smaller number than the extra interest, which is the tempting wrong comparison");
  claim(Number(v("q8.wait.left")) < 18, "q8: after the wait the loan is clearly not counted");

  // ═══ 6.5 ═══
  // q9: a position the bank accepts and the family's own budget does not.
  add(P.givenNumber("q9.line", PTI_CAPITAL_THRESHOLD));
  add(reg.given("q9.net", "21000"));
  add(reg.given("q9.budget", "13800"));
  add(reg.maxPayment("q9.bank_max", "21000", PTI_CAPITAL_THRESHOLD));
  add(reg.left("q9.left", "21000", [v("q9.bank_max")]));
  add(L.difference("q9.short", get("q9.budget"), get("q9.left")));
  add(reg.budgetMax("q9.answer", "21000", [], "13800"));
  claim(num("q9.short") > 0 && num("q9.answer") < num("q9.bank_max"), "q9: the line allows a payment the budget does not");

  // q10: the same ratio from two roads. A family with a personal loan of 1,200 a month, 28 payments left.
  const c9: PositionCase = {
    deal: "only_home",
    price: "1900000",
    equity: "520000",
    reserve: "50000",
    tracks: [{ kind: "fixed_unlinked", amount: "1380000", rate: "4.5", months: 300 }],
    base: ZERO_SCENARIO,
    stress: ZERO_SCENARIO,
    incomes: ["11200", "8600"],
    obligations: [{ kind: "loan", monthly: "1200", monthsLeft: 28 }],
  };
  const c9Omitted: PositionCase = { ...c9, obligations: [] };
  add(L.given("q10.line", PTI_CAPITAL_THRESHOLD));
  add(L.givenMoney("q10.loan_monthly", "1200"));
  add(L.given("q10.loan_months", 28));
  add(L.givenMoney("q10.reserve", "50000"));
  add(L.givenMoney("q10.payoff", "28000"));
  add(L.givenMoney("q10.raise", "2000"));
  lev("q10.ratio_real", c9, "ratio");
  lev("q10.ratio_closed", c9, "ratio", { lever: "close_loan", payoff: "28000", from: "reserve" });
  lev("q10.ratio_form", c9Omitted, "ratio");
  lev("q10.reserve_after", c9, "reserve", { lever: "close_loan", payoff: "28000", from: "reserve" });
  add(L.difference("q10.gap", get("q10.ratio_real"), get("q10.ratio_form")));
  claim(v("q10.ratio_closed") === v("q10.ratio_form"), "q10: closing the loan and leaving it out of the form print the same ratio");
  claim(num("q10.ratio_real") > 40 && num("q10.ratio_form") < 40, "q10: the omission would take the ratio under the 40% line");

  // ═══ 6.6 ═══
  // q11: which bank's terms end first. A has the answer first, B (no new lien: 12 days) governs, C answers last.
  const request = "2026-11-08";
  add(O.given("q11.request", request));
  const q11Banks = [
    { id: "a", after: 2, newLien: true },
    { id: "b", after: 4, newLien: false },
    { id: "c", after: 5, newLien: true },
  ];
  const q11Clocks = q11Banks.map((b) => {
    const r = { name: b.id, requested: request, answeredAfter: b.after, newLien: b.newLien };
    add(O.given(`q11.${b.id}.after`, b.after));
    add(O.clocksFact(`q11.${b.id}.approved`, r, cal, "approved"));
    add(O.clocksFact(`q11.${b.id}.valid_until`, r, cal, "valid_until"));
    return bankClocks(r, cal);
  });
  add(O.governingFact("q11.governing", q11Clocks));
  add(O.given("q11.window", 24));
  add(O.given("q11.window_no_lien", 12));
  claim(v("q11.governing") === "b", "q11: the governing bank is the one with no new lien, neither the first nor the last to answer");

  // q12: how many re-pricing rounds still fit before the terms end.
  const q12Start = "2026-11-16";
  const q12End = "2026-12-03";
  add(O.given("q12.start", q12Start));
  add(O.given("q12.end", q12End));
  add(O.given("q12.round_days", roundDays));
  add(O.given("q12.reserve", ROUND_RESERVE));
  add(O.roundsFitFact("q12.answer", q12Start, q12End, roundDays, ROUND_RESERVE, cal, "count"));
  add(O.roundsFitFact("q12.err_no_reserve", q12Start, q12End, roundDays, 0, cal, "count"));
  add(O.roundsFitFact("q12.last_answer", q12Start, q12End, roundDays, ROUND_RESERVE, cal, "last_answer"));
  add(O.daysUntilFact("q12.left_after", v("q12.last_answer"), q12End));
  add(O.roundAnswerFact("q12.fourth_answer", v("q12.last_answer"), roundDays, cal));
  add(O.daysUntilFact("q12.fourth_left", v("q12.fourth_answer"), q12End));
  claim(num("q12.err_no_reserve") > num("q12.answer"), "q12: ignoring the reserve counts more rounds");
  claim(num("q12.left_after") >= ROUND_RESERVE && num("q12.fourth_left") < ROUND_RESERVE, "q12: the third round leaves the reserve, a fourth would not");

  // ═══ 6.7 ═══
  // q13: what a notch is worth. Two tracks at one invented bank; the bank moves only the fixed one, by 0.15 point.
  const q13: TrackSpec[] = [
    { kind: "prime", amount: "500000", rate: "4.65", months: 360 },
    { kind: "fixed_unlinked", amount: "600000", rate: "4.35", months: 360 },
  ];
  add(O.given("q13.prime_amount", "500000"));
  add(O.given("q13.prime_rate", "4.65"));
  add(O.given("q13.fixed_amount", "600000"));
  add(O.given("q13.fixed_rate", "4.35"));
  add(O.given("q13.points", "0.15"));
  const q13edit: MixEdit = { target: "fixed_unlinked", points: "-0.15" };
  add(O.effectFact("q13.first_before", q13, BASE, q13edit, "first_before"));
  add(O.effectFact("q13.total_before", q13, BASE, q13edit, "total_before"));
  add(O.effectFact("q13.answer", q13, BASE, q13edit, "total_gain"));
  add(O.effectFact("q13.err_first", q13, BASE, q13edit, "first_gain"));
  add(O.effectFact("q13.err_all", q13, BASE, { target: "all", points: "-0.15" }, "total_gain"));
  claim(num("q13.answer") > 0 && num("q13.err_all") > num("q13.answer"), "q13: moving every track saves more than moving one");

  // q14: which offer of another bank is a competing offer. The family asked for the same three tracks at every bank.
  const shape14: MixShape = [["prime", 400000], ["variable_unlinked", 300000], ["fixed_unlinked", 300000]];
  const mix14 = (id: "a" | "b" | "c" | "d", months = 360) => priced(id, shape14, months);
  add(O.given("q14.prime_amount", "400000"));
  add(O.given("q14.variable_amount", "300000"));
  add(O.given("q14.fixed_amount", "300000"));
  for (const id of ["a", "b"] as const) add(O.mixFact(`q14.${id}.total`, { tracks: mix14(id), scenario: BASE }, "total"));
  add(O.difference("q14.gap_b", get("q14.a.total"), get("q14.b.total")));
  // The offer "built from the best rate of each bank": the prime of ג׳, the variable and the fixed of ב׳.
  const composed: TrackSpec[] = [
    { kind: "prime", amount: "400000", rate: BANK_PRICES.c.prime, months: 360 },
    { kind: "variable_unlinked", amount: "300000", rate: BANK_PRICES.b.variable_unlinked, months: 360 },
    { kind: "fixed_unlinked", amount: "300000", rate: BANK_PRICES.b.fixed_unlinked, months: 360 },
  ];
  add(O.mixFact("q14.composed.total", { tracks: composed, scenario: BASE }, "total"));
  add(O.difference("q14.gap_composed", get("q14.a.total"), get("q14.composed.total")));
  add(O.given("q14.prime_c", BANK_PRICES.c.prime));
  add(O.given("q14.fixed_b", BANK_PRICES.b.fixed_unlinked));
  add(O.given("q14.variable_b", BANK_PRICES.b.variable_unlinked));
  // Bank ד׳'s offer for 20 years: a lower total because the loan is shorter, not because the price is lower.
  add(O.mixFact("q14.d20.total", { tracks: mix14("d", 240), scenario: BASE }, "total"));
  add(O.difference("q14.gap_d20", get("q14.a.total"), get("q14.d20.total")));
  claim(num("q14.gap_b") > 0 && num("q14.gap_composed") > num("q14.gap_b") && num("q14.gap_d20") > num("q14.gap_composed"), "q14: B is a little cheaper, the composed offer and the 20-year offer look cheaper still");

  // ═══ 6.8 ═══
  // q15, q16: a counter-offer at one fictional bank (ב׳): the family asked for three equal tracks, the bank came back with half prime, half fixed.
  const reqShape: MixShape = [["prime", 300000], ["variable_unlinked", 300000], ["fixed_unlinked", 300000]];
  const ctrShape: MixShape = [["prime", 450000], ["fixed_unlinked", 450000]];
  const req8 = priced("b", reqShape);
  const ctr8 = priced("b", ctrShape);
  add(O.given("c8.loan", "900000"));
  add(O.given("c8.req_amount", "300000"));
  add(O.given("c8.ctr_amount", "450000"));
  for (const [id, tracks] of [["req", req8], ["ctr", ctr8]] as const) {
    add(O.mixFact(`c8.${id}.first`, { tracks, scenario: BASE }, "first"));
    add(O.mixFact(`c8.${id}.total`, { tracks, scenario: BASE }, "total"));
    add(O.mixFact(`c8.${id}.max`, { tracks, scenario: STRESS }, "max"));
    add(O.difference(`c8.${id}.rise`, get(`c8.${id}.max`), get(`c8.${id}.first`)));
    add(O.marginFact(`c8.${id}.margin`, tracks, EXERCISE_COST_OF_FUNDS));
  }
  add(O.difference("c8.first_diff", get("c8.ctr.first"), get("c8.req.first")));
  add(O.difference("c8.total_diff", get("c8.ctr.total"), get("c8.req.total")));
  add(O.difference("c8.margin_diff", get("c8.ctr.margin"), get("c8.req.margin")));
  add(O.difference("c8.answer", get("c8.req.rise"), get("c8.ctr.rise")));
  add(O.difference("c8.err_max", get("c8.req.max"), get("c8.ctr.max")));
  for (const [k, cost] of Object.entries(EXERCISE_COST_OF_FUNDS)) add(O.given(`c8.cost.${k}`, cost));
  for (const k of ["prime", "variable_unlinked", "fixed_unlinked"] as const) {
    add(O.given(`c8.price.${k}`, BANK_PRICES.b[k]));
  }
  claim(num("c8.first_diff") > 0 && num("c8.total_diff") > 0 && num("c8.answer") > 0, "q15/q16: the counter costs more at the start and in total, and carries less exposure");
  claim(num("c8.margin_diff") > 0, "q16: in the exercise's invented costs the bank earns more from the counter");
  claim(num("c8.err_max") !== num("c8.answer") && num("c8.first_diff") !== num("c8.answer"), "q15: the wrong answers differ from the right one");

  // ═══ 6.9 ═══
  // q17: a bank whose financing ceiling is under the file's. Bank ד׳: refuses above a financing ratio of 70.
  const D = bank("d");
  const q18File = {
    value: "2000000",
    income: "24000",
    obligations: [],
    tracks: [
      { kind: "prime" as const, amount: "500000", months: 360 },
      { kind: "variable_unlinked" as const, amount: "500000", months: 360 },
      { kind: "fixed_unlinked" as const, amount: "500000", months: 360 },
    ],
  };
  const v18 = verdictFacts(add, "q17", D, q18File, { scenario: BASE });
  add(O.given("q17.ltv_max", D.ltvMax));
  add(O.given("q17.ratio_max", D.ratioMax));
  add(O.given("q17.value", "2000000"));
  add(O.given("q17.income", "24000"));
  add(L.givenMoney("q17.reserve", "35000"));
  add(maxLoanAt("q17.max_loan", "2000000", D.ltvMax));
  add(L.difference("q17.short", get("q17.loan"), get("q17.max_loan")));
  add(L.difference("q17.short_after", get("q17.short"), get("q17.reserve")));
  claim(v18.decision === "refuse" && v18.lines.find((l) => l.id === "ltv")?.outcome === "refuse" && v18.lines.find((l) => l.id === "ratio")?.outcome !== "refuse", "q17: refused on the financing ratio alone");
  claim(num("q17.short_after") > 0, "q17: even all the savings do not reach the ceiling");

  // q18: applying a bank's invented rules to a file. Bank ג׳: relief 0.20 at a ratio of 38 or less, 0.10 at a financing ratio of 72 or less.
  const C = bank("c");
  const q17Tracks = (months: number) => ({
    value: "1900000",
    income: "18300",
    obligations: [{ kind: "loan" as const, monthly: "1300", monthsLeft: months }],
    tracks: [
      { kind: "prime" as const, amount: "450000", months: 360 },
      { kind: "variable_unlinked" as const, amount: "450000", months: 360 },
      { kind: "fixed_unlinked" as const, amount: "450000", months: 360 },
    ],
  });
  const v17 = verdictFacts(add, "q18", C, q17Tracks(17), { scenario: BASE });
  const v17c = verdictFacts(add, "q17c", C, q17Tracks(22), { scenario: BASE });
  add(O.given("q18.income", "18300"));
  add(O.given("q18.car_monthly", "1300"));
  add(O.given("q18.car_months", 17));
  add(O.given("q18.line_months", OBLIGATION_MONTHS));
  add(O.given("q18.value", "1900000"));
  add(O.given("q18.ratio_max", C.ratioMax));
  add(O.given("q18.ratio_line", C.ratioReliefLine as string));
  add(O.given("q18.ratio_points", C.ratioReliefPoints));
  add(O.given("q18.ltv_max", C.ltvMax));
  add(O.given("q18.ltv_line", C.ltvReliefLine as string));
  add(O.given("q18.ltv_points", C.ltvReliefPoints));
  for (const k of ["prime", "variable_unlinked", "fixed_unlinked"] as const) add(O.given(`q18.price.${k}`, C.prices[k]));
  add(O.given("q18.err_list", C.prices.fixed_unlinked));
  add(O.given("q18.track_amount", "450000"));
  add({ id: "q18.err_ratio_only", kind: "bp_rate", inputs: { list_rate: C.prices.fixed_unlinked, relief: C.ratioReliefPoints }, value: new Decimal(C.prices.fixed_unlinked).minus(C.ratioReliefPoints).toFixed(2) });
  claim(v17.decision === "approve" && v17c.decision === "approve", "q18: bank ג׳ approves the file either way");
  claim(Number(v17.relief) === 0.3 && Number(v17c.relief) === 0.1, "q18: both reliefs when the loan is not counted, only the financing relief when it is");
  claim(new Set([v("q18.rate_3"), v("q17c.rate_3"), v("q18.err_list"), v("q18.err_ratio_only")]).size === 4, "q18: the four rates are different numbers");

  // ═══ 6.10 ═══
  // q19: the Bank of Israel moves 0.25 point before the signature. The offer: three equal tracks.
  const offer19: TrackSpec[] = [
    { kind: "prime", amount: "350000", rate: "4.60", months: 360 },
    { kind: "variable_unlinked", amount: "350000", rate: "4.10", months: 360 },
    { kind: "fixed_unlinked", amount: "350000", rate: "4.40", months: 360 },
  ];
  add(O.given("q19.amount", "350000"));
  add(O.given("q19.points", "0.25"));
  add(O.given("q19.prime_rate", "4.60"));
  add(O.effectFact("q19.first", offer19, BASE, { target: "prime", points: "0" }, "first_before"));
  add(O.effectFact("q19.answer", offer19, BASE, { target: "prime", points: "0.25" }, "first_delta"));
  add(O.effectFact("q19.err_all", offer19, BASE, { target: "all", points: "0.25" }, "first_delta"));
  add(O.simpleMonthlyFact("q19.err_simple", "350000", "0.25"));
  claim(num("q19.answer") < num("q19.err_all") && num("q19.answer") > 0, "q19: moving only the prime track raises the first payment less than moving all three");

  // ═══ 6.11 ═══
  // q20: the plan of a family at bank א׳ (relief of 0.15 point at a ratio of 40 or less; the file stays above its financing relief line of 70).
  const A = bank("a");
  const mk20 = (loan: number) => {
    const a = Math.round(loan / 3 / 1000) * 1000;
    return [
      { kind: "prime" as const, amount: String(a), months: 360 },
      { kind: "variable_unlinked" as const, amount: String(a), months: 360 },
      { kind: "fixed_unlinked" as const, amount: String(loan - 2 * a), months: 360 },
    ];
  };
  const f0 = { value: "2000000", income: "18000", obligations: [], tracks: mk20(1480000) };
  const f1 = { ...f0, tracks: mk20(1440000) };
  const v0 = verdictFacts(add, "q20.b", A, f0, { scenario: BASE });
  const v1 = verdictFacts(add, "q20.a", A, f1, { scenario: BASE });
  add(O.given("q20.value", "2000000"));
  add(O.given("q20.income", "18000"));
  add(O.given("q20.add", "40000"));
  add(O.given("q20.ratio_line", A.ratioReliefLine as string));
  add(O.given("q20.ratio_points", A.ratioReliefPoints));
  add(O.given("q20.ltv_line", A.ltvReliefLine as string));
  for (const k of ["prime", "variable_unlinked", "fixed_unlinked"] as const) add(O.given(`q20.price.${k}`, A.prices[k]));
  add(totalFact("q20.a.list_total", v1.listTracks, BASE));
  add(O.difference("q20.answer", get("q20.a.list_total"), get("q20.a.total")));
  add(O.difference("q20.err_loan", get("q20.b.total"), get("q20.a.list_total")));
  add(O.difference("q20.err_whole", get("q20.b.total"), get("q20.a.total")));
  claim(v0.decision === "approve" && v1.decision === "approve", "q20: approved before and after");
  claim(Number(v0.relief) === 0 && Number(v1.relief) === 0.15, "q20: no relief before, the ratio relief after, and no financing relief at either point");
  claim(num("q20.answer") > 0 && num("q20.err_loan") > 0, "q20: the saving has two parts");

  return {
    lesson: "check-6",
    title: "בדיקת סיום שלב 6",
    note: "Teaching numbers only, new inputs. Each fact reuses a lesson's kind. Families, banks, prices and every bank rule (lines, reliefs, round length, cost of funds) are the course's invented ones; Directive 329's lines, Directive 451's clocks and the prime convention are the team's transcription (unverified) and are stated as premises. Nothing here is a bank's offer, market data, or how a real bank decides.",
    facts,
  };
}
