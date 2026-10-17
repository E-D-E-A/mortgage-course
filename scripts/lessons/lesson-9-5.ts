/**
 * Unit 9.5 — the final exam (stage-9 author C). Every number the exam page, its model answers, its rubric and its video show is a
 * fact here. Two parts: (A) case A (נועם ושירה), the whole file of 9.1–9.4, on numbers that src/lib/calc/casefile.ts and the earlier
 * stages' modules compute; (B) two short closed questions from each of the stages 0–8, on NEW teaching numbers (not a lesson's
 * worked example or exercise) built through the fact builders the stages already use, so that checks/independent_check.py rechecks
 * every one of them with no new Python except the points (checks/kinds/exam.py, kind exam_points).
 *
 * Nothing here is advice and nothing says what a bank would do: case A, the four banks, their lines and prices, the scenarios and the
 * family's living budget are the course's own invented or illustrative assumptions (same labels as 9.1–9.4). The pass mark (80%) is a
 * PROPOSAL, pending Dvir. The exam is graded by code (closed) and by the learner against a rubric (open); a language model grades
 * nothing and computes nothing.
 *
 * Teaching numbers of part B and what they test (all invented; none is a market figure):
 *   s0a 15,000 ₪ at 3% for 8 years (compound against simple) · s0b a rate from 4.5% to 5.25% (points against relative change)
 *   s1a a sale at 1,310,000 against a debt of 1,420,000 · s2a 150,000 ₪, 3.6%, 60 months, equal principal (month 1)
 *   s3a 250,000 ₪, 3.9%, 180 months, spitzer (total interest) · s4a income 19,500 with two obligations (the 18-month rule)
 *   s5a a nominal 3.8% as an effective annual rate · s6a net 18,000, an obligation of 900, a living budget of 10,500
 *   s7a an effective average of 4.2% as a monthly rate · s8a scores 70, 50, 90 with weights 50, 30, 20 (illustrative)
 */
import Decimal from "decimal.js";
import { compoundBalance, simpleBalance } from "../../src/lib/calc/compound.ts";
import { monthsUntilDrop, type Obligation } from "../../src/lib/calc/affordability.ts";
import { fileOf, householdIncome, incomeSheet, planOf } from "../../src/lib/calc/casefile.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentagePoints, percentOf, percentString, relativeChangePercent } from "../../src/lib/calc/percent.ts";
import { FILE, PAYSLIPS, STATEMENT } from "../../src/data/case-a-final.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { bank } from "../../src/data/case-a-positioning.ts";
import { PTI_CAPITAL_THRESHOLD, PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import { CHOICE, THRESHOLD_PTI } from "../../src/data/case-a-recommendation.ts";
import { CLOSED, OPEN, PASS_PERCENT } from "../../src/data/exam-9-5.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable as disposableFact, net as netFact, netToPay as netToPayFact } from "./affordability-facts.ts";
import { claimStateFact, countStatesFact, equityFact, incomeFact } from "./_casefile-facts.ts";
import { monthlyPercent } from "./_earlyrepay-facts.ts";
import { effectiveOf } from "./_mix-judge.ts";
import { allCandidates, countFact, ctx } from "./_recommend-facts.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { wmean, mean, intDiff } from "./_stats-facts.ts";
import { totalFact } from "./_bankpolicy-facts.ts";
import { untilDrop } from "./affordability-facts.ts";
import { budgetMax, left as leftFact, ltv as ltvFact, maxLoan, maxPayment } from "./regulation-facts.ts";
import { repCell, repPayment } from "./lesson-2-9.ts";
import * as M from "./lesson-3-8.ts";

const BASE = SCENARIOS.base;

export default function lesson95(): LessonData {
  const facts: Fact[] = [];
  const c = ctx(facts);
  const { add, get } = c;
  const num = (id: string) => new Decimal(get(id).value as string);
  const claim = (ok: boolean, what: string) => {
    if (!ok) throw new Error(`lesson 9.5: ${what}`);
  };
  const diff = (id: string, a: string, b: string) => add(difference(id, get(a), get(b)));

  // ═══ The exam's points (kind exam_points) ═══
  const rubric = OPEN.map((o) => o.lines).join("|");
  for (const measure of ["closed", "open_questions", "open_lines", "total", "pass"] as const) {
    const closed = CLOSED.length;
    const lines = OPEN.map((o) => o.lines);
    const total = closed + lines.reduce((a, b) => a + b, 0);
    const value = measure === "closed" ? closed : measure === "open_questions" ? lines.length : measure === "open_lines" ? lines.reduce((a, b) => a + b, 0) : measure === "total" ? total : Math.ceil((total * PASS_PERCENT) / 100);
    add({ id: `exam.${measure}`, kind: "exam_points", inputs: { closed, rubric, pass_percent: PASS_PERCENT, measure }, value });
  }
  add(given("exam.pass_percent", PASS_PERCENT));

  // ═══ Part A: case A ═══
  const plan = planOf();
  const sheet = incomeSheet();
  add(givenMoney("in.price", FILE.price));
  add(givenMoney("in.loan", plan.loan.toString()));
  add(givenMoney("in.reserve_after", plan.reserveAfter.toString()));
  add(givenMoney("in.recognised", householdIncome().recognised.toString()));
  add(givenMoney("in.car", FILE.car.monthly));
  add(given("in.car_left", FILE.car.monthsLeft as number));
  add(given("in.line40", THRESHOLD_PTI));
  add(given("in.ceiling", "75"));

  // a1 (9.1): the recognised income of one person, with a one-off payment in one of three payslips
  add(incomeFact("a1.answer", "shira", "recognised"));
  add(incomeFact("a1.naive", "shira", "naive"));
  add(givenMoney("a1.declared", FILE.incomes.shira));
  add(incomeFact("a1.oneoffs", "shira", "oneoffs"));
  for (const [k, id] of [[0, "jul"], [1, "aug"], [2, "sep"]] as const) {
    const slip = PAYSLIPS.shira[k];
    add(givenMoney(`a1.${id}_gross`, slip.gross));
    add(netFact(`a1.${id}`, slip.gross, slip.mandatory.map((d) => d.amount)));
  }
  claim(num("a1.naive").gt(num("a1.answer")) && num("a1.sep").gt(num("a1.naive")), "a1: the one-off lifts the plain average above the recognised income, and the September net above the average");

  // a2 (9.1): the state of the evidence for the gift and for the fund
  add(claimStateFact("a2.gift", "equity_gift"));
  add(claimStateFact("a2.fund", "equity_fund"));
  add(givenMoney("a2.gift_amount", "200000"));
  claim(get("a2.gift").value === "partial" && get("a2.fund").value === "missing", "a2: the gift is partial and the fund is missing in the file");

  // a3 (9.1): only what the documents prove completely counts: how far over the ceiling would the loan be
  add(equityFact("a3.declared", "declared"));
  add(equityFact("a3.documented", "documented"));
  add(equityFact("a3.verified", "verified"));
  diff("a3.loan", "in.price", "a3.verified");
  add(maxLoan("a3.max_loan", FILE.price, "only_home"));
  diff("a3.answer", "a3.loan", "a3.max_loan");
  diff("a3.loan_doc", "in.price", "a3.documented");
  diff("a3.err_documented", "a3.loan_doc", "a3.max_loan");
  diff("a3.loan_decl", "in.price", "a3.declared");
  diff("a3.room_declared", "a3.max_loan", "a3.loan_decl");
  claim(num("a3.answer").gt(0) && num("a3.err_documented").gt(0) && num("a3.room_declared").gte(0), "a3: the verified equity breaks the ceiling, the declared one does not");

  // the candidates of 9.2–9.3: three alternatives at four banks, read under the base scenario of 8.10 (Directive 451)
  const cand = allCandidates(c);
  const B = CHOICE.bank;
  const ch = `g.${CHOICE.alt}.${B}`;
  const chOffer = cand[`${CHOICE.alt}.${B}`];
  claim(!!chOffer.approved && !!chOffer.tracks, "the chosen pair is approved");
  const pairs = (["payment", "total", "exposure"] as const).flatMap((a) => (["a", "b", "c", "d"] as const).map((b) => `${a}.${b}`));
  const stages = pairs.map((k) => String(get(`g.${k}.stage`).value));
  add(countFact("fn.refused", stages, "refused"));
  add(countFact("fn.budget", stages, "budget"));
  add(countFact("fn.ok", stages, "ok"));
  add(given("fn.pairs", pairs.length));
  add(given("rule.d_ceiling", bank("d").ltvMax));
  claim(["payment", "total", "exposure"].every((a) => get(`g.${a}.d.stage`).value === "refused"), "bank ד׳ refuses every alternative");
  claim(num("g.exposure.d.ltv").gt(num("rule.d_ceiling")), "bank ד׳ refuses because the financing ratio is over its ceiling");

  // a4 (9.3): the room under the 40% line of the chosen offer
  add(given("a4.months", FILE.car.monthsLeft as number));
  add(disposableFact("a4.disp", householdIncome().recognised.toString(), [FILE.car as Obligation]));
  add(maxPayment("a4.line", String(get("a4.disp").value), THRESHOLD_PTI));
  add(totalFact("a4.qual", chOffer.verdict.listTracks, BASE, "qualifying"));
  diff("a4.answer", "a4.line", "a4.qual");
  add(maxPayment("a4.err_line", String(get("in.recognised").value), THRESHOLD_PTI));
  diff("a4.err_room", "a4.err_line", "a4.qual");
  {
    const room = sheet.max40.minus(chOffer.verdict.listPayment);
    claim(moneyString(room) === get("a4.answer").value, "a4: the room differs from casefile.ts");
  }
  claim(num("a4.answer").gt(0) && num("a4.err_room").gt(num("a4.answer")), "a4: the chosen offer is under the 40% line, and a mistaken line would leave more room");

  // a5 (9.4): what separates a hard filter from a priority
  claim(get("g.payment.b.stage").value === "ok" && get("g.exposure.d.stage").value === "refused", "a5: the linked alternative at bank ב׳ passes the hard filters, bank ד׳ refuses");

  // a6 (9.4): the price of certainty against the 25-year alternative at the same bank, base scenario
  diff("a6.answer", `g.exposure.${B}.total`, `g.total.${B}.total`);
  diff("a6.err_monthly", `g.total.${B}.first`, `${ch}.first`);
  claim(num("a6.answer").gt(0) && num("a6.err_monthly").gt(0), "a6: the fixed loan costs more in total, and the 25-year one has a higher first payment");
  claim(num(`g.total.${B}.margin60`).lt(num(`${ch}.margin60`)), "a6: the 25-year alternative leaves a thinner margin");

  // a7 (9.3): the appraisal at which the loan sits exactly on the ceiling
  add({ id: "a7.answer", kind: "ltv_min_value", inputs: { loan: moneyString(plan.loan), ceiling: "75" }, value: moneyString(plan.loan.mul(100).div(75)) });
  add({ id: "a7.err_125", kind: "percent_of", inputs: { amount: moneyString(plan.loan), rate_percent: "125" }, value: moneyString(percentOf(plan.loan, "125")) });
  diff("a7.slack", "in.price", "a7.answer");
  add(ltvFact("a7.ltv_price", moneyString(plan.loan), moneyString(FILE.price)));
  claim(num("a7.slack").gt(0), "a7: the break-even appraisal is under the price");

  // a8 (9.2–9.3): the kind of number a figure is — the numbers of the chosen pair, for the text
  add(given("a8.kinds", 4));
  add(untilDrop("rv.until_drop", FILE.car.monthsLeft as number));
  claim(monthsUntilDrop(FILE.car.monthsLeft as number) === Number(get("rv.until_drop").value), "rv.until_drop agrees with affordability.ts");

  // the model answers of the open questions
  add(givenMoney("eq.savings", "260000"));
  add(givenMoney("eq.fund", "100000"));
  add(givenMoney("eq.gift", "200000"));
  add(countStatesFact("st.count"));
  add(given("st.docs", 10));
  add(intDiff("st.not_ok", 10, (get("st.count").value as { ok: number }).ok));
  add(given("in.years", plan.request[0].months / 12));
  diff("pc.total_vs_total", `${ch}.total`, `g.total.${B}.total`);
  diff("pc.first_vs_total", `g.total.${B}.first`, `${ch}.first`);
  diff("pc.margin_vs_total", `${ch}.margin60`, `g.total.${B}.margin60`);
  diff("pc.total_vs_payment", `g.payment.${B}.total`, `${ch}.total`);
  diff("pc.first_vs_payment", `${ch}.first`, `g.payment.${B}.first`);
  claim(num("pc.total_vs_payment").gt(0) && num("pc.first_vs_payment").gt(0), "the linked alternative has the lower first payment and the higher total");
  add(givenMoney("in.budget", sheet.livingBudget.toString()));
  add({ id: "sens.limit.exposure", kind: "sum_of_facts", inputs: { terms: `in.budget,${ch}.margin60` }, value: moneyString(num("in.budget").plus(num(`${ch}.margin60`))) });
  add(intDiff("fn.priority", Number(get("fn.ok").value) as number, 1));
  // Noam's August deposit against the net to pay on his payslip (the open item of 9.1)
  {
    const slip = PAYSLIPS.noam[1];
    add(givenMoney("o3.aug_gross", slip.gross));
    add(netFact("o3.aug_net", slip.gross, slip.mandatory.map((d) => d.amount)));
    add(netToPayFact("o3.aug_pay", String(get("o3.aug_net").value), slip.other.map((d) => d.amount)));
    add(givenMoney("o3.aug_deposit", STATEMENT[1].deposit.noam));
    diff("o3.aug_gap", "o3.aug_pay", "o3.aug_deposit");
    claim(num("o3.aug_gap").eq(240), "the August deposit is 240 under the net to pay");
  }
  claim(get(`g.exposure.a.flag40`).value === "over" && get(`${ch}.flag40`).value === "under", "only the fixed alternative at bank א׳ is over the 40% line");
  void fileOf;

  // ═══ Part B: two closed questions from every stage ═══
  // Stage 0 (0.1, 0.3): compound interest against simple; a change in a rate, in points and in relation to what it was
  add(given("s0a.principal", "15000.00"));
  add(given("s0a.rate", "3"));
  add(given("s0a.years", "8"));
  add({ id: "s0a.answer", kind: "compound_balance", inputs: { principal: "15000", rate_percent: "3", periods: 8 }, value: moneyString(compoundBalance("15000", "3", 8)) });
  add({ id: "s0a.err_simple", kind: "simple_balance", inputs: { principal: "15000", rate_percent: "3", periods: 8 }, value: moneyString(simpleBalance("15000", "3", 8)) });
  claim(num("s0a.answer").gt(num("s0a.err_simple")), "s0a: compound is above simple");
  add(given("s0b.from", "4.5"));
  add(given("s0b.to", "5.25"));
  add({ id: "s0b.answer", kind: "percentage_point_change", inputs: { from_percent: "4.5", to_percent: "5.25" }, value: percentString(percentagePoints("4.5", "5.25")) });
  add({ id: "s0b.err_relative", kind: "relative_change_percent", inputs: { from: "4.5", to: "5.25" }, value: percentString(relativeChangePercent("4.5", "5.25")) });

  // Stage 1 (1.1): a pledged home sold for less than the debt
  add(givenMoney("s1a.debt", "1420000"));
  add(givenMoney("s1a.sale", "1310000"));
  diff("s1a.answer", "s1a.debt", "s1a.sale");

  // Stage 2 (2.9): the first payment in equal principal; the spitzer payment as the mistake
  add(givenMoney("s2a.principal", "150000"));
  add(given("s2a.rate", "3.6"));
  add(given("s2a.months", "60"));
  add(repCell("s2a.answer", "equal_principal", "150000", "3.6", 60, 1, "payment"));
  add(repPayment("s2a.err_spitzer", "150000", "3.6", 60));
  add(repCell("s2a.principal_part", "equal_principal", "150000", "3.6", 60, 1, "principal"));
  claim(num("s2a.answer").gt(num("s2a.err_spitzer")), "s2a: the first equal-principal payment is above the spitzer payment");

  // Stage 3 (3.9): the interest of a whole loan in spitzer: the total paid minus the loan
  const loan3 = { principal: "250000", rates: ["3.9"], months: 180 };
  add(givenMoney("s3a.principal", "250000"));
  add(given("s3a.rate", "3.9"));
  add(given("s3a.years", "15"));
  add(given("s3a.months", "180"));
  add(M.total("s3a.total", [loan3]));
  add(M.first("s3a.first", [loan3]));
  add({ id: "s3a.times", kind: "met_times", inputs: { of: "s3a.first", count: 180 }, value: moneyString(num("s3a.first").mul(180)) });
  add(M.difference("s3a.answer", get("s3a.total"), get("s3a.principal")));

  // Stage 4 (4.2): the 18-month rule: only obligations with more than 18 payments left come off the income
  const car4: Obligation = { kind: "loan", monthly: "1200", monthsLeft: 22 };
  const study4: Obligation = { kind: "loan", monthly: "800", monthsLeft: 12 };
  add(givenMoney("s4a.income", "19500"));
  add(givenMoney("s4a.car", "1200"));
  add(given("s4a.car_months", "22"));
  add(givenMoney("s4a.study", "800"));
  add(given("s4a.study_months", "12"));
  add(disposableFact("s4a.answer", "19500", [car4, study4]));
  add(disposableFact("s4a.err_both", "19500", [car4, { ...study4, monthsLeft: 24 }]));
  add(disposableFact("s4a.err_none", "19500", []));
  claim(num("s4a.answer").lt(num("s4a.err_none")) && num("s4a.answer").gt(num("s4a.err_both")), "s4a: only the car loan comes off");

  // The caps of the team's transcription of Directive 329 (the course marks them "לא אומת"): the ratio no loan may cross, and the capital threshold
  add(given("s4b.ratio", "44"));
  add(given("s4b.limit", PTI_LIMIT));
  add(given("s4b.threshold", PTI_CAPITAL_THRESHOLD));
  claim(num("s4b.ratio").gt(num("s4b.threshold")) && num("s4b.ratio").lt(num("s4b.limit")), "s4b: the ratio is between the capital threshold and the limit");

  // Stage 5 (5.9 / 0.4): a contract rate is nominal: the effective annual rate is higher
  add(given("s5a.nominal", "3.8"));
  add(effectiveOf("s5a.answer", "3.8", 2));
  claim(num("s5a.answer").gt(num("s5a.nominal")), "s5a: the effective rate is above the nominal");

  // Stage 6 (4.6 / 6.x): the largest payment the family's own budget allows
  add(givenMoney("s6a.net", "18000"));
  add(givenMoney("s6a.other", "900"));
  add(givenMoney("s6a.budget", "10500"));
  add(budgetMax("s6a.answer", "18000", ["900"], "10500"));
  add(leftFact("s6a.err_no_other", "18000", ["10500"]));
  add(leftFact("s6a.err_no_budget", "18000", ["900"]));
  claim(num("s6a.answer").gt(0) && num("s6a.err_no_other").gt(num("s6a.answer")), "s6a: the budget caps the payment");

  // Stage 7 (7.3): the monthly rate of an effective annual average is the twelfth root, not a division by 12
  add(given("s7a.avg", "4.2"));
  add(monthlyPercent("s7a.answer", "effective", "4.2", 3));
  add(monthlyPercent("s7a.err_div12", "nominal", "4.2", 3));
  claim(num("s7a.answer").lt(num("s7a.err_div12")), "s7a: the root gives a smaller monthly rate");

  // Stage 8 (8.8 / 8.2): a weighted score, the weights and the scores being illustrations
  add(given("s8a.w1", "50"));
  add(given("s8a.w2", "30"));
  add(given("s8a.w3", "20"));
  add(given("s8a.v1", "70"));
  add(given("s8a.v2", "50"));
  add(given("s8a.v3", "90"));
  add(wmean("s8a.answer", [70, 50, 90], [50, 30, 20], 1));
  add(mean("s8a.err_mean", [70, 50, 90], 1));
  claim(num("s8a.answer").lt(num("s8a.err_mean")), "s8a: the weighted mean is below the plain mean");

  return {
    lesson: "9.5",
    title: "המבחן המסכם",
    note: "The final exam: case A (the whole file of 9.1-9.4; every number from src/lib/calc/casefile.ts and the earlier stages' modules) and two short closed questions from each of the stages 0-8 on new teaching numbers (all invented, none a market figure). Closed questions are graded by code, open questions by the learner against a rubric after reading a model answer; a language model grades nothing. The pass mark of 80% is a proposal pending Dvir. Case A, its banks, the lines and prices of the banks, the scenarios and the family's living budget are the course's own invented or illustrative assumptions.",
    facts,
  };
}
