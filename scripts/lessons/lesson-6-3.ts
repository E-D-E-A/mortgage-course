/**
 * Lesson 6.3 — the lever map. A lever (מנוף) is something the client can really change that moves a file
 * toward or away from a line. The lesson lists nine, and for case A (נועם ושירה) shows how far each one
 * is, along its own axis, from the 40% payment-ratio line and the 75% financing ceiling, using only the
 * modules that already exist (regulation.ts, affordability.ts, sensitivity.ts, positioning.ts). It prices no
 * lever fully (that is lesson 6.4's) and never calls a lever free. Every number the page, the lever map's
 * notes, the exercises and the video show is a fact here; checks/kinds/positioning.py (with sensitivity.py,
 * ltv.py, affordability.py and regulation.py) recomputes each one.
 *
 * LABELS. The 75% ceiling, the 40% threshold and the 18-month rule are the team's transcription of directive
 * 329 (Brain 7503881, 67436545), not checked against the directive. The car loan's payoff (36,000 ₪) is a
 * calculation assumption shared with lesson 6.1: the 26 remaining payments sum to 37,700 ₪ without interest and
 * the payoff is lower. The price list behind the "half" mix is the course's (one rate per track kind), which a
 * bank's package pricing need not follow (lesson 5.10). "יעל ואלון" and the exercise family are invented.
 */
import Decimal from "decimal.js";
import { CANDIDATES, CASE_A } from "../../src/data/case-a-mix.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { LTV_CEILINGS, MAX_TERM_MONTHS, PTI_CAPITAL_THRESHOLD } from "../../src/lib/calc/regulation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { disposable, ratio as affRatio, untilDrop } from "./affordability-facts.ts";
import {
  MIX_A,
  difference,
  equityNeededFact,
  givenMoney,
  givenNumber,
  incomeRoomFact,
  leverFact,
  loanCutFact,
  loanRoomFact,
  mixFact,
  paymentCutFact,
  sumOf,
} from "./_positioning-facts.ts";
import { ltv, maxLoan } from "./regulation-facts.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => {
    facts.push(f);
    return f;
  };
  const v = (f: Fact) => f.value as string;
  /** A money fact times a whole count (kind met_times, checked in metrics.py). */
  const times = (id: string, of: Fact, count: number): Fact => ({ id, kind: "met_times", inputs: { of: of.id, count }, value: moneyString(new Decimal(of.value as string).mul(count)) });

  // ── Case A: where it stands ──
  const price = add(givenMoney("c.price", CASE_A.price));
  const loan = add(mixFact("c.loan", MIX_A, "loan"));
  const line = add(givenNumber("c.line", PTI_CAPITAL_THRESHOLD));
  const ceiling = add(givenNumber("c.ceiling", LTV_CEILINGS.only_home));
  add(maxLoan("c.max_loan", CASE_A.price, "only_home"));
  add(loanRoomFact("c.room", CASE_A.price, v(loan), LTV_CEILINGS.only_home));
  add(ltv("c.ltv", v(loan), v(price)));
  const income = add(givenMoney("c.income", CASE_A.recognisedIncome));
  const car = add(givenMoney("c.car", CASE_A.car.monthly as string));
  add(givenNumber("c.car_months", CASE_A.car.monthsLeft as number));
  const disp = add(disposable("c.disp", CASE_A.recognisedIncome, [CASE_A.car]));
  const pay = add(mixFact("c.pay", MIX_A, "qualifying"));
  const ratio0 = add(mixFact("c.ratio", MIX_A, "ratio"));
  add(difference("c.over", ratio0, line));
  add(givenNumber("c.months", CASE_A.termMonths));
  add(givenNumber("c.max_months", MAX_TERM_MONTHS));

  // ── Lever 1: more equity, a smaller loan ──
  const cut = add(loanCutFact("l1.cut", MIX_A.tracks, v(disp), PTI_CAPITAL_THRESHOLD));
  const l1lever = { lever: "amount", change: `-${v(cut)}` } as const;
  const l1loan = add(leverFact("l1.loan", MIX_A, l1lever, "loan"));
  add(leverFact("l1.ratio", MIX_A, l1lever, "ratio"));
  add(ltv("l1.ltv", v(l1loan), v(price)));
  add(paymentCutFact("l1.paycut", v(disp), v(pay), PTI_CAPITAL_THRESHOLD));

  // ── Lever 2: the term. Case A is at the longest term already; a shorter one raises the ratio ──
  add(leverFact("l2.ratio_25", MIX_A, { lever: "term", track: "all", months: -60 }, "ratio"));

  // ── Lever 3: closing the car loan before the request, from the equity ──
  const payoff = add(givenMoney("l3.payoff", "36000"));
  add(times("l3.sum_left", car, CASE_A.car.monthsLeft as number));
  const closed = add(sumOf("l3.loan_closed", [loan, payoff]));
  const l3ltv = add(ltv("l3.ltv", v(closed), v(price)));
  add(difference("l3.over", l3ltv, ceiling));
  const l3pay = add(leverFact("l3.pay", MIX_A, { lever: "amount", change: v(payoff) }, "qualifying"));
  add(affRatio("l3.ratio", v(l3pay), v(income)));
  add(equityNeededFact("l3.equity_back", CASE_A.price, v(closed), LTV_CEILINGS.only_home));

  // ── Lever 5: documented income. How much more recognised income puts the payment on the line ──
  add(incomeRoomFact("l5.need40", v(disp), v(pay), PTI_CAPITAL_THRESHOLD));
  add(incomeRoomFact("l5.need35", v(disp), v(pay), "35"));

  // ── Lever 7: the mix. The same loan, 50-50 between fixed and variable (5.8's candidate "half") ──
  const half = CANDIDATES.find((c) => c.id === "half");
  if (!half) throw new Error("case A has no candidate 'half'");
  const HALF = { tracks: half.tracks, scenario: SCENARIOS.base };
  const payHalf = add(mixFact("l7.pay", HALF, "qualifying"));
  add(mixFact("l7.ratio", HALF, "ratio"));
  add(difference("l7.gain", pay, payHalf));
  const totalInit = add(mixFact("l7.total_init", MIX_A, "total"));
  const totalHalf = add(mixFact("l7.total_half", HALF, "total"));
  add(difference("l7.total_gap", totalInit, totalHalf));

  // ── Lever 9: timing. The car loan leaves the ratio after these payments, at the same payment ──
  add(untilDrop("l9.months", CASE_A.car.monthsLeft as number));
  add(times("l9.paid", car, 8));
  add(affRatio("l9.ratio", v(pay), v(income)));

  // ── Exercises: an invented family, יעל ואלון ──
  const e2Income = add(givenMoney("e2.income", "16000"));
  const e2Pay = add(givenMoney("e2.pay", "7000"));
  add(paymentCutFact("e2.paycut", v(e2Income), v(e2Pay), PTI_CAPITAL_THRESHOLD));
  const e2Need = add(incomeRoomFact("e2.need", v(e2Income), v(e2Pay), PTI_CAPITAL_THRESHOLD));
  add(sumOf("e2.total", [e2Income, e2Need]));

  add(givenNumber("e3.left", 30));
  add(untilDrop("e3.months", 30));

  const e4Price = add(givenMoney("e4.price", "1800000"));
  const e4Loan = add(givenMoney("e4.loan", "1300000"));
  add(maxLoan("e4.max_loan", v(e4Price), "only_home"));
  add(loanRoomFact("e4.room", v(e4Price), v(e4Loan), LTV_CEILINGS.only_home));

  return {
    lesson: "6.3",
    title: "מפת המנופים",
    note: "Case A is stage 5's; 75%, 40% and the 18-month rule are the team's transcription of directive 329 (not checked); the car-loan payoff of 36,000 is a calculation assumption; the 'half' mix uses the course's one-rate-per-track price list; the second family is invented.",
    facts,
  };
}
