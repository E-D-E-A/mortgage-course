/**
 * Lesson 6.11 — the workshop: the positioning plan of the main case (case A, נועם ושירה). The product
 * is three things: the positioning plan (which levers, what each costs, what it should achieve), the
 * outreach plan (which banks, in what order, against which clocks) and the focused questions for each
 * bank. Every number the page, its exercises, its planner and its video show is a fact here.
 *
 * Built from the stage's modules, retyping nothing: the case and its levers are lesson 6.4's
 * (src/data/case-a-levers.ts, src/lib/calc/levers.ts), the lines of regulation are lesson 4.4's
 * (regulation.ts), the clocks are lesson 6.6's (outreach.ts, the same request date and answer times), the
 * four fictional banks' price lists are lessons 6.6–6.8's (src/data/case-a-offers.ts), and the banks' RULES
 * are lesson 6.9's invented ones (bankpolicy.ts, src/data/case-a-positioning.ts). Nothing here says how a
 * real bank decides: the plan's outcomes are the exercise's. Teaching assumptions, all labelled on the
 * page: the savings (40,000 ₪), the car loan's payoff (36,000 ₪), the parent's income (4,000 ₪ a month),
 * the margin of 0.1 point under the 40% line, the rates, the scenarios, the days a re-pricing round takes.
 *
 * Checked by checks/kinds/bankpolicy.py, levers.py, outreach.py, sensitivity.py, ltv.py, regulation.py and
 * affordability.py.
 */
import { BORROWER_INCOME, CAR_PAYOFF, CASE_A_POSITION as POS, EQUITY_STEP, RESERVE, TARGET_RATIO } from "../../src/data/case-a-levers.ts";
import { CASE_A, SCENARIOS } from "../../src/data/case-a-mix.ts";
import { ROUND_RULE } from "../../src/data/case-a-offers.ts";
import {
  ANSWER_AFTER,
  BANKS,
  bank,
  caseAFile,
  LEFT_OUT,
  MARGIN,
  movesFor,
  PLAN_BANKS,
  PLAN_RATIO,
  planEquity,
  REQUEST_DATE,
  WAIT_MONTHS,
} from "../../src/data/case-a-positioning.ts";
import type { LeverMove } from "../../src/lib/calc/levers.ts";
import { bankClocks, type BankRequest, WINDOW_DAYS } from "../../src/lib/calc/outreach.ts";
import { addCalendarDays, CALENDAR_2026 } from "../../src/lib/calc/process.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { sum, untilDrop } from "./affordability-facts.ts";
import { type LevMeasure, levFact, stepFact } from "./_lever-facts.ts";
import { maxLoanAt, totalFact, verdictFacts } from "./_bankpolicy-facts.ts";
import { clocksFact, daysUntilFact, eventsInsideFact, governingFact, latestStartFact, roundAnswerFact, roundFitsFact, roundsFitFact } from "./_outreach-facts.ts";
import { difference, given, givenMoney } from "./_sensitivity-facts.ts";
import { maxPayment } from "./regulation-facts.ts";
import { EXAMPLE_THRESHOLDS } from "../../src/lib/calc/positioning.ts";
import lesson010 from "./lesson-0-10.ts";

const cal = CALENDAR_2026;
const BASE = SCENARIOS.base;
const TODAY = "2026-11-09";
const { roundDays, reserve: roundReserve } = ROUND_RULE;

export default function lesson611(): LessonData {
  const decisions = (lesson010().facts.find((f) => f.id === "decision.upcoming")?.value ?? []) as string[];
  if (decisions.length < 2) throw new Error("lesson 0.10 no longer lists two upcoming decisions");
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const opts = { scenario: BASE };
  const lev = (id: string, m: LevMeasure, move?: LeverMove) => add(levFact(id, POS, m, move));

  // ── The case, as lessons 4.15, 5.8 and 6.4 give it ──
  add(givenMoney("a.price", CASE_A.price));
  add(givenMoney("a.equity", CASE_A.equity));
  add(givenMoney("a.reserve", RESERVE));
  add(givenMoney("a.recognised", CASE_A.recognisedIncome));
  add(givenMoney("a.car_monthly", CASE_A.car.monthly));
  add(given("a.car_months", CASE_A.car.monthsLeft as number));
  add(givenMoney("in.payoff", CAR_PAYOFF));
  add(givenMoney("in.borrower", BORROWER_INCOME));
  add(given("in.margin", MARGIN));
  add(given("in.target", TARGET_RATIO));
  add(given("in.plan_ratio", PLAN_RATIO));
  add(given("in.wait", WAIT_MONTHS));
  add(given("in.ltv_ceiling", "75"));
  for (const [m, id] of [
    ["loan", "a.loan"],
    ["ltv", "a.ltv"],
    ["qualifying", "a.qual"],
    ["disposable", "a.disp"],
    ["ratio", "a.ratio"],
    ["first", "a.first"],
    ["total", "a.total"],
    ["stress_max", "a.stress"],
  ] as [LevMeasure, string][]) lev(id, m);
  add(untilDrop("a.wait", CASE_A.car.monthsLeft as number));

  // ── Where the case stands against the lines (the four banks' lines are lesson 6.9's, invented), each at its own price list ──
  const disp = get("a.disp").value as string;
  const base = caseAFile();
  for (const b of BANKS) {
    const v = verdictFacts(add, `b.${b.id}`, b, base, opts);
    add(totalFact(`b.${b.id}.qualifying`, v.listTracks, BASE, "qualifying"));
    if (b.ratioReliefLine !== null) {
      const line = add(maxPayment(`s.${b.id}.line_payment`, disp, b.ratioReliefLine));
      add(difference(`s.${b.id}.over`, get(`b.${b.id}.qualifying`), line));
      add(given(`s.${b.id}.line`, b.ratioReliefLine));
    }
  }
  // The course's example lines of lesson 6.2 (positioning.ts), and how far case A is from each.
  for (const t of EXAMPLE_THRESHOLDS) {
    add(given(`s.t.${t.id}.line`, t.percent));
    add(difference(`s.t.${t.id}.gap`, get(t.metric === "pti" ? "a.ratio" : "a.ltv"), get(`s.t.${t.id}.line`)));
  }
  add(maxLoanAt("s.d.max_loan", CASE_A.price, bank(LEFT_OUT).ltvMax));
  add(difference("s.d.short", get("a.loan"), get("s.d.max_loan")));
  add(maxLoanAt("s.ltv_cap", CASE_A.price, "75"));
  add(difference("s.ltv_room", get("s.ltv_cap"), get("a.loan")));
  add(difference("s.d.short_after_reserve", get("s.d.short"), get("a.reserve")));

  // ── The levers, each priced by lesson 6.4's module ──
  const step17 = add(stepFact("a.step40", POS, TARGET_RATIO, EQUITY_STEP));
  const step = add(stepFact("a.step", POS, PLAN_RATIO, EQUITY_STEP));
  const equity = planEquity().toString();
  if (step.value === "none" || moneyString(equity) !== step.value) throw new Error("the plan's equity is not the module's smallest step");
  const menu: { key: string; move: LeverMove }[] = [
    { key: "eq17", move: { lever: "equity", add: String(Number(step17.value)) } },
    { key: "eq", move: { lever: "equity", add: equity } },
    { key: "carR", move: { lever: "close_loan", payoff: CAR_PAYOFF, from: "reserve" } },
    { key: "carE", move: { lever: "close_loan", payoff: CAR_PAYOFF, from: "equity" } },
    { key: "wait", move: { lever: "wait", months: WAIT_MONTHS } },
    { key: "bor", move: { lever: "borrower", income: BORROWER_INCOME } },
    { key: "term", move: { lever: "term", months: 60 } },
    { key: "mix", move: { lever: "mix", from: 3, to: 2, points: "10" } },
  ];
  add(givenMoney("l.eq17.add", String(Number(step17.value))));
  add(givenMoney("l.eq.add", equity));
  for (const { key, move } of menu) {
    const p = (m: string) => `l.${key}.${m}`;
    for (const m of ["ratio", "ltv", "qualifying", "total", "stress_max", "reserve", "bans", "loan"] as LevMeasure[]) lev(p(m), m, move);
    add(difference(p("gain_ratio"), get("a.ratio"), get(p("ratio"))));
    add(difference(p("gain_pay"), get("a.qual"), get(p("qualifying"))));
    add(difference(p("extra_total"), get(p("total")), get("a.total")));
    add(difference(p("stress_rise"), get(p("stress_max")), get("a.stress")));
  }
  add(given("l.term.months", 60));
  add(given("l.mix.points", "10"));

  // ── The plan: the equity lever alone, read by the four banks, against the family's own request ──
  const planned = caseAFile(movesFor({ equity }));
  const verdicts: Record<string, ReturnType<typeof verdictFacts>> = {};
  for (const b of BANKS) verdicts[b.id] = verdictFacts(add, `p.${b.id}`, b, planned, opts);
  add(totalFact("p.a.list_total", verdicts.a.listTracks, BASE));
  add(difference("p.a.equity_gain", get("b.a.total"), get("p.a.list_total")));
  add(difference("p.a.relief_gain", get("p.a.list_total"), get("p.a.total")));
  add(difference("p.a.gain", get("b.a.total"), get("p.a.total")));
  add(totalFact("p.a.qualifying", verdicts.a.listTracks, BASE, "qualifying"));
  const lineA = add(maxPayment("p.a.line_payment", disp, bank("a").ratioReliefLine as string));
  add(difference("p.a.room", lineA, get("p.a.qualifying")));
  add(difference("p.reserve_after", get("a.reserve"), get("l.eq.add")));
  add(difference("p.reserve_after17", get("a.reserve"), get("l.eq17.add")));
  // The smallest step (17,000) leaves the case a hair under the line: the payment room, at bank א׳.
  const planned17 = caseAFile(movesFor({ equity: String(Number(step17.value)) }));
  const v17 = verdictFacts(add, "p17.a", bank("a"), planned17, opts);
  add(totalFact("p17.a.qualifying", v17.listTracks, BASE, "qualifying"));
  add(difference("p17.a.room", lineA, get("p17.a.qualifying")));
  add(difference("p.extra_cash", get("l.eq.add"), get("l.eq17.add")));

  // ── The alternatives the plan did not take, read by the banks ──
  const alt = (key: string, moves: LeverMove[], banks: string[]) => {
    const file = caseAFile(moves);
    for (const id of banks) verdictFacts(add, `${key}.${id}`, bank(id), file, opts);
  };
  alt("w", movesFor({ wait: true }), ["a", "b", "c", "d"]);
  alt("ew", movesFor({ equity, wait: true }), ["a", "b", "c", "d"]);
  alt("cr", movesFor({ car: true }), ["a", "c"]);
  alt("bo", movesFor({ parent: true }), ["a", "b", "c"]);
  add(difference("ew.c_vs_plan", get("p.a.total"), get("ew.c.total")));
  add(difference("bo.b_vs_plan", get("p.a.total"), get("bo.b.total")));
  add(difference("cr.c_vs_plan", get("p.a.total"), get("cr.c.total")));

  // ── The outreach plan: the clocks of lesson 6.6's request, in parallel and one after the other ──
  add(given("o.request", REQUEST_DATE));
  add(given("o.today", TODAY));
  add(given("o.window", WINDOW_DAYS));
  add(given("o.round_days", roundDays));
  add(given("o.round_reserve", roundReserve));
  add(given("o.decision", decisions[1]));
  const requests: Record<string, BankRequest> = Object.fromEntries(
    BANKS.map((b) => [b.id, { name: b.name, requested: REQUEST_DATE, answeredAfter: ANSWER_AFTER[b.id as "a"], extended: b.id === LEFT_OUT, newLien: true }]),
  );
  const clocks = PLAN_BANKS.map((id) => {
    add(given(`o.${id}.after`, ANSWER_AFTER[id]));
    add(clocksFact(`o.${id}.approved`, requests[id], cal, "approved"));
    add(clocksFact(`o.${id}.valid_until`, requests[id], cal, "valid_until"));
    add(daysUntilFact(`o.${id}.left`, TODAY, bankClocks(requests[id], cal).validUntil));
    return bankClocks(requests[id], cal);
  });
  add(governingFact("o.governing", clocks));
  const validA = bankClocks(requests.a, cal).validUntil;
  add(roundFitsFact("o.round.fits", TODAY, validA, roundDays, roundReserve, cal));
  add(roundAnswerFact("o.round.answer", TODAY, roundDays, cal));
  add(roundsFitFact("o.rounds_count", TODAY, validA, roundDays, roundReserve, cal, "count"));
  add(latestStartFact("o.round.latest", validA, roundDays, roundReserve, TODAY, cal));
  add(eventsInsideFact("o.decision_inside", [decisions[1]], REQUEST_DATE, validA));
  add(daysUntilFact("o.decision_in", TODAY, decisions[1]));
  // The same three requests sent one after the other: each starts the day the previous answer arrives.
  let at = REQUEST_DATE;
  PLAN_BANKS.forEach((id) => {
    const r: BankRequest = { ...requests[id], requested: at };
    add(given(`o.seq.${id}.request`, at));
    add(clocksFact(`o.seq.${id}.approved`, r, cal, "approved"));
    add(clocksFact(`o.seq.${id}.valid_until`, r, cal, "valid_until"));
    at = bankClocks(r, cal).approved;
  });
  const lastPar = bankClocks(requests.c, cal).approved;
  add(daysUntilFact("o.seq.late", lastPar, at));
  add(daysUntilFact("o.seq.left_a", at, validA));
  add(sum("ex.err_sum", [RESERVE, equity]));
  add(addDays("o.sign_by", decisions[1], -1));

  return {
    lesson: "6.11",
    title: "סדנה: תוכנית המיצוב של התיק המרכזי",
    note: "Case A (src/data/case-a-levers.ts, case-a-mix.ts) with lesson 6.4's levers (savings 40,000, car payoff 36,000, parent's income 4,000, 8 months of waiting) priced by src/lib/calc/levers.ts; the four fictional banks of lessons 6.6–6.8 with lesson 6.9's INVENTED rules (bankpolicy.ts, src/data/case-a-positioning.ts); the clocks of lesson 6.6 (24 calendar days of terms from each approval, the team's transcription of Directive 451, not verified) and the exercise's re-pricing round (3 business days, 7 days left after the answer). The plan's equity is the smallest whole thousand that leaves the ratio at most 0.1 point under the 40% line (a rule of the workshop). Nothing here says how a real bank decides or prices. Base scenario: the index rises 2% a year, prime does not move.",
    facts,
  };
}

const addDays = (id: string, start: string, days: number): Fact => ({ id, kind: "proc_add_calendar_days", inputs: { start, days }, value: addCalendarDays(start, days) });
