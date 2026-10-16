/**
 * Lesson 6.10 — case simulations: five conversations along the process of case A (נועם ושירה): the
 * introduction call, an offer arrives, a bank refuses, a rate moves midway, a competing offer. Every
 * number the page, its exercises, its conversation tree and its video show is a fact here.
 *
 * The case, the levers and the banks are those of the stage: the levers are lesson 6.4's
 * (src/data/case-a-levers.ts, levers.ts), the four fictional banks' price lists are lessons 6.6–6.8's
 * (src/data/case-a-offers.ts), the clocks are lesson 6.6's (outreach.ts, the same request date and
 * answer times), and the banks' RULES are lesson 6.9's invented ones (bankpolicy.ts). What a real bank
 * does when the Bank of Israel moves, whether a second round improves an offer, and what a bank says
 * to a competing offer are NOT known to the course; the tree's outcomes are labelled "בהנחת התרגיל".
 *
 * Checked by checks/kinds/bankpolicy.py, sensitivity.py, ltv.py, regulation.py, outreach.py and
 * affordability.py.
 */
import { moneyString } from "../../src/lib/calc/money.ts";
import { ROUND_RULE } from "../../src/data/case-a-offers.ts";
import { CAR_PAYOFF, RESERVE } from "../../src/data/case-a-levers.ts";
import { CASE_A, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { ANSWER_AFTER, BANKS, bank, caseAFile, movesFor, planEquity, REQUEST_DATE, WAIT_MONTHS } from "../../src/data/case-a-positioning.ts";
import { bankClocks, type BankRequest, WINDOW_DAYS } from "../../src/lib/calc/outreach.ts";
import { CALENDAR_2026 } from "../../src/lib/calc/process.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { share, sum } from "./affordability-facts.ts";
import { clocksFact, daysUntilFact, effectFact, eventsInsideFact, roundAnswerFact, roundFitsFact, simpleMonthlyFact } from "./_outreach-facts.ts";
import { maxLoanAt, verdictFacts } from "./_bankpolicy-facts.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import lesson010 from "./lesson-0-10.ts";

const cal = CALENDAR_2026;
const BASE = SCENARIOS.base;
const A = bank("a");
const C = bank("c");
const TODAY = "2026-11-09";
const { roundDays, reserve: roundReserve } = ROUND_RULE;

export default function lesson610(): LessonData {
  const decisions = (lesson010().facts.find((f) => f.id === "decision.upcoming")?.value ?? []) as string[];
  if (decisions.length < 2) throw new Error("lesson 0.10 no longer lists two upcoming decisions");
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const opts = { scenario: BASE };

  add(given("data_date", "2026-10-16"));
  add(givenMoney("a.price", CASE_A.price));
  add(givenMoney("a.reserve", RESERVE));
  add(givenMoney("t.payoff", CAR_PAYOFF));
  add(given("t.car_months", CASE_A.car.monthsLeft as number));
  add(givenMoney("t.car_monthly", CASE_A.car.monthly));
  add(given("t.line", A.ratioReliefLine as string));

  // ── Scene 1: the introduction call — the family's idea, and the levers (all from lesson 6.4's menu) ──
  verdictFacts(add, "t.base", A, caseAFile(), opts);
  verdictFacts(add, "t.carE", A, caseAFile([{ lever: "close_loan", payoff: CAR_PAYOFF, from: "equity" }]), opts);
  verdictFacts(add, "t.carR", A, caseAFile(movesFor({ car: true })), opts);
  verdictFacts(add, "t.carR.c", C, caseAFile(movesFor({ car: true })), opts);
  verdictFacts(add, "t.wait", A, caseAFile(movesFor({ wait: true })), opts);
  add(difference("t.reserve_after_car", get("a.reserve"), get("t.payoff")));
  add(given("t.wait_months", WAIT_MONTHS));
  add(given("t.wait_left", (CASE_A.car.monthsLeft as number) - WAIT_MONTHS));

  // ── The plan's levers, read by the four banks (the same file as lesson 6.11) ──
  const equity = planEquity().toString();
  add(givenMoney("t.equity", equity));
  add(difference("t.reserve_after", get("a.reserve"), get("t.equity")));
  const planFile = caseAFile(movesFor({ equity }));
  const verdicts = Object.fromEntries(BANKS.map((b) => [b.id, verdictFacts(add, `t.p.${b.id}`, b, planFile, opts)]));

  // ── The clocks of the same request as lessons 6.6 and 6.7 ──
  add(given("t.request", REQUEST_DATE));
  add(given("t.today", TODAY));
  add(given("t.decision", decisions[1]));
  const requests: Record<string, BankRequest> = Object.fromEntries(
    BANKS.map((b) => [b.id, { name: b.name, requested: REQUEST_DATE, answeredAfter: ANSWER_AFTER[b.id as "a"], extended: b.id === "d", newLien: true }]),
  );
  for (const b of BANKS) {
    add(given(`t.${b.id}.after`, ANSWER_AFTER[b.id as "a"]));
    add(clocksFact(`t.${b.id}.approved`, requests[b.id], cal, "approved"));
    add(clocksFact(`t.${b.id}.valid_until`, requests[b.id], cal, "valid_until"));
    add(daysUntilFact(`t.${b.id}.left`, TODAY, bankClocks(requests[b.id], cal).validUntil));
  }
  add(given("t.window", WINDOW_DAYS));

  // ── Scene 3: a refusal — bank ד׳ (the financing ceiling, whatever the mix) ──
  const loanD = add(givenMoney("t.p.loan", moneyString(verdicts.d.loan)));
  const capD = add(maxLoanAt("t.d.max_loan", CASE_A.price, bank("d").ltvMax));
  const shortD = add(difference("t.d.short", loanD, capD));
  add(difference("t.d.short_after", shortD, get("t.reserve_after")));

  // ── Scene 4: the rate moves — the Bank of Israel's decision falls inside bank א׳'s terms ──
  const aTracks = verdicts.a.finalTracks;
  add(eventsInsideFact("t.decision_inside", [decisions[1]], TODAY, bankClocks(requests.a, cal).validUntil));
  add(daysUntilFact("t.decision_in", TODAY, decisions[1]));
  add(given("t.move.points", "0.25"));
  add(givenMoney("t.move.prime_amount", String(aTracks[0].amount)));
  add(share("t.prime_share", String(aTracks[0].amount), moneyString(verdicts.a.loan)));
  for (const [key, target] of [["prime", "prime"], ["all", "all"]] as const) {
    add(effectFact(`t.move.${key}.first`, aTracks, BASE, { target, points: "0.25" }, "first_delta"));
    add(effectFact(`t.move.${key}.total`, aTracks, BASE, { target, points: "0.25" }, "total_delta"));
  }
  add(simpleMonthlyFact("t.move.simple", String(aTracks[0].amount), "0.25"));

  // ── Scene 5: the competing offer — the three whole offers for the same request, and a second round against the clock ──
  add(difference("t.gap_b", get("t.p.b.total"), get("t.p.a.total")));
  add(difference("t.gap_c", get("t.p.c.total"), get("t.p.a.total")));
  add(difference("t.gap_first_b", get("t.p.b.first"), get("t.p.a.first")));
  add(difference("t.vs_base_b", get("t.base.first"), get("t.p.a.first")));
  add(given("t.round.days", roundDays));
  add(given("t.round.reserve", roundReserve));
  const aUntil = bankClocks(requests.a, cal).validUntil;
  add(roundFitsFact("t.round.fits", TODAY, aUntil, roundDays, roundReserve, cal));
  add(roundAnswerFact("t.round.answer", TODAY, roundDays, cal));

  // ── Exercises ──
  add(sum("ex.err_sum", [CAR_PAYOFF, RESERVE]));

  return {
    lesson: "6.10",
    title: "סימולציות תיק",
    note: "Case A along the process. Levers: lesson 6.4's (reserve 40,000, car payoff 36,000, 9 months of waiting). Banks: lessons 6.6–6.8's four fictional banks with their price lists, and lesson 6.9's INVENTED rules (bankpolicy.ts). Clocks: lesson 6.6's request date and answer times; 24 calendar days of terms from each approval (the team's transcription of Directive 451, not verified). The Bank of Israel decision date is lesson 0.10's (search summaries, not verified), and a rise of 0.25 point is the exercise's assumption. Nothing here says how a real bank answers a refusal, a rate that moves or a competing offer. Base scenario: the index rises 2% a year, prime does not move.",
    facts,
  };
}
