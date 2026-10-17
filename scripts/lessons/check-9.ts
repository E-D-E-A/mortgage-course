/**
 * The stage-9 completion check (src/pages/checks/9.mdx), stage-9 author C: every number its questions, answers and common wrong
 * answers show. The questions are about the CONTENT of the stage (units 9.1–9.5), and differ from the final exam's (lesson 9.5): they
 * use other parts of case A's file. Each fact is built by the fact builders of 9.1–9.4 (_casefile-facts, _recommend-facts,
 * _outreach-facts, _bankpolicy-facts, regulation-facts, affordability-facts), so checks/independent_check.py rechecks it with the
 * kinds those units already have; no new Python.
 *
 * Case A, its banks, their lines and prices, the scenarios and the family's living budget are the course's own invented or
 * illustrative assumptions (the label "דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק עדכניים").
 * Nothing here says what a real bank would do and nothing is advice. What the questions say about the advisor's fee and about
 * conflicts of interest is a QUESTION for the lawyer and for Mogi's policy: the course states no answer.
 *
 * Questions (id → unit): q1 9.1 what a land-registry extract proves · q2 9.1 the largest payment the living budget allows · q3 9.1 what a credit summary proves
 *   q4 9.2 the three goals and their winners · q5 9.2 the rise of the payment under stress · q6 9.2 the three scenarios and their labels
 *   q7 9.3 when to ask for another round of negotiation · q8 9.3 what is known between the approval and the drawdown · q9 9.3 what a round of negotiation saves
 *   q10 9.4 what only the reviewer's version holds · q11 9.4 the line of the rejected-candidates list · q12 9.4 a red line (the car loan)
 *   q13 9.4 a rise of the fixed rate before signing · q14 9.1 consent and personal data
 * No number, remedy or conclusion is shared with the final exam (lesson 9.5): the exam keeps case A's income, equity, room under the
 * 40% line, price of certainty, break-even appraisal and gaps list; this check keeps the others.
 */
import Decimal from "decimal.js";
import { fileOf, householdIncome, incomeSheet, planOf } from "../../src/lib/calc/casefile.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { PTI_LIMIT } from "../../src/lib/calc/regulation.ts";
import { FILE, LIVING_BUDGET, PAYSLIPS, STATEMENT } from "../../src/data/case-a-final.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { NEGOTIATION } from "../../src/data/case-a-offers.ts";
import { APPRAISAL_CASES, CHOICE, RATE_MOVES, THRESHOLD_PTI } from "../../src/data/case-a-recommendation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { net as netFact, netToPay as netToPayFact } from "./affordability-facts.ts";
import { allCandidates, ctx, rateMoveFacts } from "./_recommend-facts.ts";
import { effectFact } from "./_outreach-facts.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { scnEvalFact } from "./_stage8b-facts.ts";
import { budgetMax, left as leftFact, ltv as ltvFact, maxLoan, maxPayment } from "./regulation-facts.ts";
import { disposable as disposableFact } from "./affordability-facts.ts";

const BASE = SCENARIOS.base;

export default function check9(): LessonData {
  const facts: Fact[] = [];
  const c = ctx(facts);
  const { add, get } = c;
  const num = (id: string) => new Decimal(get(id).value as string);
  const claim = (ok: boolean, what: string) => {
    if (!ok) throw new Error(`check-9: ${what}`);
  };
  const diff = (id: string, a: string, b: string) => add(difference(id, get(a), get(b)));

  // ═══ The file, as 9.1–9.3 leave it ═══
  const plan = planOf();
  const sheet = incomeSheet();
  add(givenMoney("in.price", FILE.price));
  add(givenMoney("in.loan", plan.loan.toString()));
  add(givenMoney("in.reserve_after", plan.reserveAfter.toString()));
  add(givenMoney("in.recognised", householdIncome().recognised.toString()));
  add(givenMoney("in.car", FILE.car.monthly));
  add(givenMoney("in.budget", LIVING_BUDGET));
  add(given("in.line40", THRESHOLD_PTI));
  add(given("in.ceiling", "75"));
  add(given("in.ceiling_pti", PTI_LIMIT));
  add(given("in.years", plan.request[0].months / 12));
  add(given("in.car_left", FILE.car.monthsLeft as number));
  const cand = allCandidates(c);
  const B = CHOICE.bank;
  const ch = `g.${CHOICE.alt}.${B}`;
  const chOffer = cand[`${CHOICE.alt}.${B}`];
  claim(!!chOffer.approved && !!chOffer.tracks, "the chosen pair is approved");

  // q2 (9.1): the largest payment the family's own budget allows, against the largest the 40% line allows
  add(budgetMax("q2.answer", householdIncome().recognised.toString(), [FILE.car.monthly], LIVING_BUDGET));
  add(disposableFact("q2.disp", householdIncome().recognised.toString(), [FILE.car as never]));
  add(leftFact("q2.err_nocar", householdIncome().recognised.toString(), [LIVING_BUDGET]));
  claim(num("q2.answer").gt(0) && num("q2.err_nocar").gt(num("q2.answer")), "q2: the budget allows a positive payment, and forgetting the car loan gives more");

  // q4 (9.2): the winner of each of the three goals at bank ב׳: the lowest first payment, the lowest total, the smallest rise
  for (const a of ["payment", "total", "exposure"] as const) claim(get(`g.${a}.${B}.decision`).value === "approve", `q4: ${a} is approved at bank ${B}`);
  claim(num(`g.payment.${B}.first`).lt(num(`g.total.${B}.first`)) && num(`g.payment.${B}.first`).lt(num(`g.exposure.${B}.first`)), "q4: the linked alternative has the lowest first payment");
  claim(num(`g.total.${B}.total`).lt(num(`g.exposure.${B}.total`)) && num(`g.total.${B}.total`).lt(num(`g.payment.${B}.total`)), "q4: the 25-year alternative has the lowest total");
  claim(num(`g.exposure.${B}.rise`).lt(num(`g.total.${B}.rise`)) && num(`g.exposure.${B}.rise`).lt(num(`g.payment.${B}.rise`)), "q4: the fixed alternative has the smallest rise");

  // q5 (9.2): how much the highest payment in the stress scenario is above the first payment, for the linked alternative
  claim(num(`g.payment.${B}.rise`).gt(0), "q5: the linked alternative's payment rises in stress");

  // q9 (9.3): what the first round of the negotiation saves in total payments (0.10 off every track of the chosen offer)
  const edits = NEGOTIATION.rounds;
  add(given("q9.points", new Decimal(edits[0].points).abs().toString()));
  add(effectFact("q9.answer", chOffer.tracks!, BASE, edits[0], "total_gain"));
  add(effectFact("q9.first_gain", chOffer.tracks!, BASE, edits[0], "first_gain"));
  add(givenMoney("q9.threshold", NEGOTIATION.threshold));
  claim(num("q9.answer").gt(num("q9.threshold")), "q9: the first round saves more than the family's line");

  // q11 (9.4): the line of the rejected-candidates list for 25 years at bank ג׳: a hard filter (the budget), with its number
  claim(get("g.total.c.stage").value === "budget" && num("g.total.c.short").gt(0), "q11: 25 years at bank ג׳ breaks the budget");

  // q13 (9.4): a rise of the fixed rate before signing: the ratio the file would show, against the 40% line
  const listTracks = chOffer.verdict.listTracks;
  const moves = RATE_MOVES.map((pts, k) => {
    rateMoveFacts(c, "q13", k, pts, listTracks, chOffer.tracks!, BASE);
    return pts;
  });
  claim(num("q13.1.first_up").gt(0) && num("q13.1.total_up").gt(num("q13.1.first_up")), "q13: a rise of the rate raises the first payment and, more, the total");
  void fileOf;

  return {
    lesson: "check-9",
    title: "בדיקת סיום שלב 9",
    note: "The completion check of stage 9: questions about the content of units 9.1-9.5 (documents and what they prove, the largest payment, the three goals, the scenarios, the appraisal, a round of negotiation, the two versions of the explanation, conflict of interest as a question, how the exam is graded). Case A, its banks, their lines and prices, the scenarios and the family's living budget are the course's own invented or illustrative assumptions; nothing says what a bank would do. The advisor's fee and conflicts of interest are questions for the lawyer and for Mogi's policy, not decided here.",
    facts,
  };
}
