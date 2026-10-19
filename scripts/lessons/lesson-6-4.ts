/**
 * Lesson 6.4 — every lever has a price in shekels. A lever is a pair: what the client gains (a lower
 * payment-to-income ratio, a lower monthly payment) and what the client pays, in four currencies that
 * are not added together (cash now, interest over the whole loan, exposure to a harsh scenario,
 * months of waiting), and sometimes a wall (a ban of Directive 329 that the lever crosses).
 *
 * Two cases. A small invented one with one track (1,000,000 ₪ at 5%: 25 years or 30) for the idea,
 * and case A (נועם ושירה, src/data/case-a-levers.ts on case-a-mix.ts) for the levers: more equity,
 * closing the car loan from the savings or from the equity, waiting for the 18-month rule, a
 * parent as a second borrower, a longer term, a different split between tracks.
 *
 * Every number the page, its exercises, its calculator and its video show is a fact here. The
 * arithmetic is src/lib/calc/levers.ts (on sensitivity.ts, schedule.ts, affordability.ts and
 * regulation.ts); checks/kinds/levers.py (with schedule.py, sensitivity.py and common.py) recomputes
 * each fact, and affordability.py / regulation.py the borrowed ones.
 *
 * Teaching assumptions, all labelled on the page: the reserve (40,000 ₪), the car loan's payoff
 * (36,000 ₪), the parent's income (4,000 ₪ a month), the rates (the course's price list), the base
 * and harsh scenarios. The 40% line is the course's example threshold (lesson 6.2).
 */
import { BORROWER_INCOME, CAR_PAYOFF, CASE_A_POSITION as A, EQUITY_STEP, RESERVE, TARGET_RATIO } from "../../src/data/case-a-levers.ts";
import { CASE_A } from "../../src/data/case-a-mix.ts";
import { type LeverMove, type PositionCase, pull } from "../../src/lib/calc/levers.ts";
import type { TrackSpec } from "../../src/lib/calc/schedule.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { untilDrop } from "./affordability-facts.ts";
import { difference, divFact, given, givenMoney, levFact, type LevMeasure, stepFact } from "./_lever-facts.ts";
import { maxPayment, maxVar } from "./regulation-facts.ts";

/** The small case: one track, 1,000,000 ₪ at 5%, a household that brings 20,000 ₪ a month. */
const flatTrack = (months: number): TrackSpec => ({ kind: "fixed_unlinked", amount: "1000000", rate: "5", months });
export const MINI: PositionCase = {
  deal: "only_home",
  price: "1250000",
  equity: "250000",
  reserve: "50000",
  tracks: [flatTrack(300)],
  base: { inflation: "0", primeShift: "0", anchorShift: "0" },
  stress: { inflation: "0", primeShift: "0", anchorShift: "0" },
  incomes: ["20000"],
  obligations: [],
};

/** The levers of case A, in the order of the page's table. The key names the facts: l.<key>.<measure>. */
export interface Pulled {
  key: string;
  name: string;
  move: LeverMove;
}
export const MORTGAGE_TRACK = { fixed: 3, variable: 2 } as const;
const MINI_TERM = 60;
const MIX_POINTS = "10";
const WAIT = 9; // 17 payments left: below the line under any reading (at exactly 18 the official text already says the loan is not counted)

export function pulled(equityStep: string): Pulled[] {
  return [
    { key: "eq", name: "עוד הון עצמי מהחסכונות", move: { lever: "equity", add: equityStep } },
    { key: "carR", name: "סגירת הלוואת הרכב מהחסכונות", move: { lever: "close_loan", payoff: CAR_PAYOFF, from: "reserve" } },
    { key: "carE", name: "סגירת הלוואת הרכב מההון העצמי", move: { lever: "close_loan", payoff: CAR_PAYOFF, from: "equity" } },
    { key: "wait", name: "המתנה עד שנשארים 18 תשלומים", move: { lever: "wait", months: WAIT } },
    { key: "bor", name: "לווה נוסף: הורה", move: { lever: "borrower", income: BORROWER_INCOME } },
    { key: "term", name: "הארכת התקופה ב־5 שנים", move: { lever: "term", months: MINI_TERM } },
    { key: "mix", name: "הזזת 10 נקודות מהקבועה אל המשתנה", move: { lever: "mix", from: MORTGAGE_TRACK.fixed, to: MORTGAGE_TRACK.variable, points: MIX_POINTS } },
  ];
}

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;
  const lev = (id: string, c: PositionCase, measure: LevMeasure, move?: LeverMove) => add(levFact(id, c, measure, move));

  // ── The small case: one track, 25 years or 30 ──
  add(givenMoney("m.loan", "1000000"));
  add(given("m.rate", "5"));
  add(given("m.years_a", 25));
  add(given("m.years_b", 30));
  add(givenMoney("m.income", MINI.incomes[0] as string));
  const termMove: LeverMove = { lever: "term", months: MINI_TERM };
  lev("m.a.first", MINI, "first");
  lev("m.b.first", MINI, "first", termMove);
  lev("m.a.total", MINI, "total");
  lev("m.b.total", MINI, "total", termMove);
  lev("m.a.ratio", MINI, "ratio");
  lev("m.b.ratio", MINI, "ratio", termMove);
  add(difference("m.gain_pay", get("m.a.first"), get("m.b.first")));
  add(difference("m.gain_ratio", get("m.a.ratio"), get("m.b.ratio")));
  add(difference("m.extra", get("m.b.total"), get("m.a.total")));
  add(divFact("m.pp", get("m.extra"), get("m.gain_ratio")));

  // ── Case A, before any lever ──
  add(givenMoney("a.price", CASE_A.price));
  add(givenMoney("a.equity", CASE_A.equity));
  add(givenMoney("a.reserve", RESERVE));
  add(givenMoney("a.recognised", CASE_A.recognisedIncome));
  add(givenMoney("a.car_monthly", CASE_A.car.monthly));
  add(given("a.car_months", CASE_A.car.monthsLeft as number));
  add(givenMoney("in.payoff", CAR_PAYOFF));
  add(givenMoney("in.borrower", BORROWER_INCOME));
  add(given("in.target", TARGET_RATIO));
  add(given("in.term_months", MINI_TERM));
  add(given("in.term_years", MINI_TERM / 12));
  add(given("in.mix_points", MIX_POINTS));
  add(given("in.ltv_ceiling", "75"));
  add(given("in.max_months", 360));
  add(givenMoney("in.step", EQUITY_STEP));
  for (const [m, id] of [
    ["loan", "a.loan"],
    ["ltv", "a.ltv"],
    ["qualifying", "a.qual"],
    ["disposable", "a.disp"],
    ["ratio", "a.ratio"],
    ["first", "a.first"],
    ["total", "a.total"],
    ["stress_max", "a.stress"],
    ["left_first", "a.left"],
    ["variable", "a.variable"],
    ["months", "a.months"],
  ] as [LevMeasure, string][]) lev(id, A, m);
  add(maxPayment("a.max40", get("a.disp").value as string, TARGET_RATIO));
  add(difference("a.over40", get("a.qual"), get("a.max40")));
  add(maxVar("a.maxvar", get("a.loan").value as string));
  add(difference("a.var_room", get("a.maxvar"), get("a.variable")));
  add(untilDrop("a.wait", CASE_A.car.monthsLeft as number));

  // The smallest whole thousand of extra equity that brings the ratio to the target.
  const step = add(stepFact("a.step", A, TARGET_RATIO, EQUITY_STEP));
  if (step.value === "none") throw new Error("the reserve does not reach the target: the lesson's levers need rethinking");
  const equityStep = String(Number(step.value));
  // The previous step, to show that one thousand less is not enough.
  const equityShort = String(Number(equityStep) - Number(EQUITY_STEP));
  lev("a.eq_short.ratio", A, "ratio", { lever: "equity", add: equityShort });
  add(givenMoney("a.eq_short.add", equityShort));

  // ── Each lever: the case after it, and what it gained and cost ──
  const list = pulled(equityStep);
  for (const { key, move } of list) {
    const p = (m: string) => `l.${key}.${m}`;
    for (const m of ["loan", "ltv", "qualifying", "disposable", "ratio", "total", "stress_max", "reserve", "variable", "bans", "left_first"] as LevMeasure[]) lev(p(m), A, m, move);
    add(difference(p("gain_ratio"), get("a.ratio"), get(p("ratio"))));
    add(difference(p("gain_pay"), get("a.qual"), get(p("qualifying"))));
    add(difference(p("extra"), get(p("total")), get("a.total")));
    add(difference(p("stress_rise"), get(p("stress_max")), get("a.stress")));
    add(difference(p("saving"), get("a.total"), get(p("total"))));
    // The cash the lever takes out of the family's pocket (levers.ts: pull().cost.cashNow): the equity added, the loan closed, or nothing.
    add(givenMoney(p("cash"), pull(A, move).cost.cashNow.toString()));
  }
  // The fall in the total of all payments is part principal never borrowed (the equity added) and part interest.
  add(difference("l.eq.interest", get("l.eq.saving"), get("l.eq.cash")));
  // More equity also lowers the harshest payment: by how much.
  add(difference("l.eq.stress_drop", get("a.stress"), get("l.eq.stress_max")));
  // The price of one percentage point, for the two levers that cost cash and pass.
  add(divFact("l.eq.pp", get("l.eq.cash"), get("l.eq.gain_ratio")));
  add(divFact("l.carR.pp", get("l.carR.cash"), get("l.carR.gain_ratio")));
  // The financing ratio when the car loan is closed from the equity: over the ceiling by this many points.
  add(difference("l.carE.ltv_over", get("l.carE.ltv"), get("in.ltv_ceiling")));
  // The mix move: how far the variable part goes, and by how much it passes the line.
  add(difference("l.mix.moved", get("l.mix.variable"), get("a.variable")));
  add(difference("l.mix.over", get("l.mix.variable"), get("a.maxvar")));
  // The same lever, the other way: a term of 25 years instead of 30.
  const shorter: LeverMove = { lever: "term", months: -MINI_TERM };
  lev("l.short.ratio", A, "ratio", shorter);
  lev("l.short.total", A, "total", shorter);
  lev("l.short.qualifying", A, "qualifying", shorter);
  add(difference("l.short.rise", get("l.short.ratio"), get("a.ratio")));
  add(difference("l.short.saving", get("a.total"), get("l.short.total")));
  // The wait costs no shekels. After 7 months 19 payments are left and the loan still counts; after 8, exactly 18 (not counted: the rule says "more than 18 months"); after 9, 17.
  add(given("in.wait", WAIT));
  lev("l.wait.months_left", A, "months_left", { lever: "wait", months: WAIT });
  for (const months of [7, 8]) {
    add(given(`l.wait${months}.months`, months));
    lev(`l.wait${months}.left`, A, "months_left", { lever: "wait", months });
    lev(`l.wait${months}.disposable`, A, "disposable", { lever: "wait", months });
    lev(`l.wait${months}.ratio`, A, "ratio", { lever: "wait", months });
  }

  // ── The family left with what, after the two ways of closing the loan ──
  add(difference("l.carR.left_gain", get("l.carR.left_first"), get("a.left")));

  return {
    lesson: "6.4",
    title: "לכל מנוף יש מחיר בשקלים",
    note: "A small invented case (one track) and case A. The reserve, the car loan's payoff and the parent's income are teaching assumptions; the 40% line is the course's example threshold. Levers: levers.ts on sensitivity.ts, affordability.ts, regulation.ts.",
    facts,
  };
}
