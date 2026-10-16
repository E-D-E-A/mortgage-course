/**
 * Lesson 6.1 — the whole picture: how the factors affect one another. Case A (נועם ושירה) stands at the edge
 * of two lines at once (financing ratio 74.55% against the 75% ceiling; payment ratio 40.4% against the 40%
 * capital threshold), and one action, closing the car loan from the equity, moves the two ratios in opposite
 * directions. Every number the page, the exercises and the video show is a fact here; the page and the video
 * read data/lessons/6-1.json, and checks/kinds/positioning.py (with sensitivity.py, ltv.py, affordability.py
 * and regulation.py) recomputes each one.
 *
 * Case A's price, equity, loan, incomes, car loan and initial mix are stage 5's (src/data/case-a-mix.ts). The
 * 75% ceiling and the 40% threshold are the team's transcription of directive 329 (Brain 7503881), not
 * checked against the directive. The payoff of the car loan (36,000 ₪) is a CALCULATION ASSUMPTION of this
 * stage: the 26 remaining payments of 1,450 ₪ add up to 37,700 ₪ without interest, and the sum needed to close
 * the loan today is lower; the course picks 36,000 ₪ and says so. "מיכל ועידו" are an invented family for the
 * exercises, not case A.
 */
import { CASE_A } from "../../src/data/case-a-mix.ts";
import { LTV_CEILINGS, PTI_CAPITAL_THRESHOLD } from "../../src/lib/calc/regulation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable, ratio as affRatio, untilDrop } from "./affordability-facts.ts";
import { MIX_A, difference, equityNeededFact, given, givenMoney, givenNumber, leverFact, loanRoomFact, mixFact, points, sumOf } from "./_positioning-facts.ts";
import { ltv, maxLoan } from "./regulation-facts.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => {
    facts.push(f);
    return f;
  };
  const v = (f: Fact) => f.value as string;

  // ── Case A: where it stands ──
  const price = add(givenMoney("c.price", CASE_A.price));
  const equity = add(givenMoney("c.equity", CASE_A.equity));
  const loan = add(difference("c.loan", price, equity));
  const ceiling = add(givenNumber("c.ceiling", LTV_CEILINGS.only_home));
  add(maxLoan("c.max_loan", CASE_A.price, "only_home"));
  const room = add(loanRoomFact("c.room", CASE_A.price, v(loan), LTV_CEILINGS.only_home));
  const ltv0 = add(ltv("c.ltv", v(loan), CASE_A.price));
  add(points("c.ltv_gap", v(ltv0), LTV_CEILINGS.only_home));
  const line = add(givenNumber("c.line", PTI_CAPITAL_THRESHOLD));
  add(givenMoney("c.income", CASE_A.recognisedIncome));
  add(givenMoney("c.car", CASE_A.car.monthly as string));
  add(givenNumber("c.car_months", CASE_A.car.monthsLeft as number));
  add(disposable("c.disp", CASE_A.recognisedIncome, [CASE_A.car]));
  const pay = add(mixFact("c.pay", MIX_A, "qualifying"));
  const ratio0 = add(mixFact("c.ratio", MIX_A, "ratio"));
  add(difference("c.over", ratio0, line)); // how far over the line: ratio − line, in percentage points
  add(untilDrop("c.until_drop", CASE_A.car.monthsLeft as number));

  // ── Closing the car loan from the equity: the loan grows by what leaves the equity ──
  const payoff = add(givenMoney("c.payoff", "36000"));
  const loanClosed = add(sumOf("c.loan_closed", [loan, payoff]));
  const ltvClosed = add(ltv("c.ltv_closed", v(loanClosed), CASE_A.price));
  add(difference("c.ltv_over", ltvClosed, ceiling)); // how far over the ceiling, in percentage points
  add(equityNeededFact("c.equity_back", CASE_A.price, v(loanClosed), LTV_CEILINGS.only_home));
  const payClosed = add(leverFact("c.pay_closed", MIX_A, { lever: "amount", change: v(payoff) }, "qualifying"));
  // After closing, the car loan is no longer taken off the income: the whole recognised income is the denominator.
  add(affRatio("c.ratio_closed", v(payClosed), CASE_A.recognisedIncome));
  // Waiting instead: the same payment, the car loan gone from the ratio after these payments (lesson 4.2's line).
  add(affRatio("c.ratio_wait", v(pay), CASE_A.recognisedIncome));

  // ── More equity: the loan shrinks, both ratios fall ──
  for (const [k, cut] of [["a1", "20000"], ["a2", "50000"]] as const) {
    add(givenMoney(`${k}.cut`, cut));
    const l = add(leverFact(`${k}.loan`, MIX_A, { lever: "amount", change: `-${cut}` }, "loan"));
    add(ltv(`${k}.ltv`, v(l), CASE_A.price));
    add(leverFact(`${k}.ratio`, MIX_A, { lever: "amount", change: `-${cut}` }, "ratio"));
  }

  // ── Exercises: an invented family, מיכל ועידו ──
  const mPrice = add(givenMoney("m.price", "1800000"));
  const mLoan = add(givenMoney("m.loan", "1300000"));
  const mUse = add(givenMoney("m.use", "20000"));
  const mAfter = add(sumOf("m.loan_after", [mLoan, mUse]));
  add(ltv("m.ltv0", v(mLoan), v(mPrice)));
  add(ltv("m.ltv1", v(mAfter), v(mPrice)));

  return {
    lesson: "6.1",
    title: "התמונה הכוללת",
    note: "Case A's stage-5 numbers; the 75% and 40% lines are the team's transcription of directive 329 (not checked); the car-loan payoff of 36,000 is a calculation assumption; the second family is invented.",
    facts,
  };
}
