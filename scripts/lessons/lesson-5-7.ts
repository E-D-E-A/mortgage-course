/**
 * Lesson 5.7 — sensitivity: what moves when ONE lever moves (the percent of the loan in a track, the
 * amount, the term, the rate, the index), what does not, and where a move runs into a limit. Case A's
 * initial mix is the subject (src/data/case-a-mix.ts); the levers are src/lib/calc/sensitivity.ts's.
 *
 * Every number the page, its exercises, its builder tasks and its video show is a fact here. A lever
 * fact carries the BEFORE mix and the lever; checks/kinds/sensitivity.py applies the lever on its own
 * and recomputes the schedule (through schedule.py). Teaching numbers: the rates are the course's price
 * list (an assumption, not market data), the scenario is the base scenario (the index rises 2% a year,
 * prime and anchors do not move), never a forecast.
 */
import Decimal from "decimal.js";
import { ltvPercent } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import { maxPaymentAt, maxVariable } from "../../src/lib/calc/regulation.ts";
import { applyLever, type Lever } from "../../src/lib/calc/sensitivity.ts";
import { CASE_A, INITIAL_MIX, PRICE_LIST, SCENARIOS, candidate } from "../../src/data/case-a-mix.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, givenMoney, leverFact, type Mix, mixFact, perStep, sumOf } from "./_sensitivity-facts.ts";

const base = SCENARIOS.base;
const init: Mix = { tracks: INITIAL_MIX, scenario: base };

export interface LeverDef {
  id: string;
  lever: Lever;
}

/** The levers of the page, in order, each applied alone to the initial mix. */
export const LEVERS: LeverDef[] = [
  { id: "pct_pf", lever: { lever: "percent", from: 1, to: 3, points: "10" } },
  { id: "pct_pv", lever: { lever: "percent", from: 1, to: 2, points: "10" } },
  { id: "pct_pv20", lever: { lever: "percent", from: 1, to: 2, points: "20" } },
  { id: "pct_fv", lever: { lever: "percent", from: 3, to: 2, points: "10" } },
  { id: "amount", lever: { lever: "amount", change: "-100000" } },
  { id: "amount2", lever: { lever: "amount", change: "-200000" } },
  { id: "amount40", lever: { lever: "amount", change: "-40000" } },
  { id: "term", lever: { lever: "term", track: "all", months: -60 } },
  { id: "term_t1", lever: { lever: "term", track: 1, months: -60 } },
  { id: "term_t3", lever: { lever: "term", track: 3, months: -60 } },
  { id: "term10", lever: { lever: "term", track: "all", months: -120 } },
  { id: "rate_all", lever: { lever: "rate", track: "all", points: "0.25" } },
  { id: "rate_t1", lever: { lever: "rate", track: 1, points: "0.25" } },
  { id: "rate_t2", lever: { lever: "rate", track: 2, points: "0.25" } },
  { id: "rate_t3", lever: { lever: "rate", track: 3, points: "0.25" } },
  { id: "rate_down", lever: { lever: "rate", track: "all", points: "-0.15" } },
  { id: "market", lever: { lever: "market", points: "1" } },
  { id: "index", lever: { lever: "index", points: "1" } },
];

export default function lesson57(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);

  // ── Case A and the initial mix ──
  const recognised = add(givenMoney("a.recognised", CASE_A.recognisedIncome));
  const car = add(givenMoney("a.car", CASE_A.car.monthly));
  add(given("a.car_months", CASE_A.car.monthsLeft));
  add(difference("a.disposable", recognised, car));
  const loan = add(givenMoney("a.loan", CASE_A.loan));
  add(givenMoney("a.price", CASE_A.price));
  add(givenMoney("a.equity", CASE_A.equity));
  add({ id: "a.ltv", kind: "ltv_percent", inputs: { loan: CASE_A.loan, value: CASE_A.price }, value: percentString(ltvPercent(CASE_A.loan, CASE_A.price)) });
  const first0 = add(mixFact("init.first", init, "first"));
  const max0 = add(mixFact("init.max", init, "max"));
  const total0 = add(mixFact("init.total", init, "total"));
  add(mixFact("init.ratio", init, "ratio"));
  add(mixFact("init.qualifying", init, "qualifying"));
  add(mixFact("init.variable", init, "variable"));
  add(mixFact("init.variable_share", init, "variable_share"));
  add(mixFact("init.variable_room", init, "variable_room"));
  const bal60 = add(mixFact("init.bal60", init, "balance", { month: 60 }));
  INITIAL_MIX.forEach((t, k) => {
    add(givenMoney(`init.amount_${k + 1}`, t.amount as string));
    add(given(`init.rate_${k + 1}`, t.rate as string));
  });

  // ── Every lever alone, on the initial mix ──
  for (const { id, lever } of LEVERS) {
    const first = add(leverFact(`lv.${id}.first`, init, lever, "first"));
    const max = add(leverFact(`lv.${id}.max`, init, lever, "max"));
    const total = add(leverFact(`lv.${id}.total`, init, lever, "total"));
    add(leverFact(`lv.${id}.ratio`, init, lever, "ratio"));
    add(difference(`lv.${id}.d_first`, first, first0));
    add(difference(`lv.${id}.d_max`, max, max0));
    add(difference(`lv.${id}.d_total`, total, total0));
  }
  // the loan, the variable part and the balance after five years, for the levers that move them
  for (const id of ["pct_pf", "pct_pv", "pct_pv20", "pct_fv", "amount", "amount2", "amount40"]) {
    const lever = LEVERS.find((l) => l.id === id)!.lever;
    add(leverFact(`lv.${id}.variable_share`, init, lever, "variable_share"));
    add(leverFact(`lv.${id}.variable_room`, init, lever, "variable_room"));
    const afterLoan = add(leverFact(`lv.${id}.loan`, init, lever, "loan"));
    add({ id: `lv.${id}.ltv`, kind: "ltv_percent", inputs: { loan: afterLoan.value as string, value: CASE_A.price }, value: percentString(ltvPercent(afterLoan.value as string, CASE_A.price)) });
  }
  for (const id of ["amount", "term", "rate_all", "term10"]) {
    const lever = LEVERS.find((l) => l.id === id)!.lever;
    add(leverFact(`lv.${id}.bal60`, init, lever, "balance", { month: 60 }));
  }
  // the tracks' new amounts after a move of percent (for the builder's guided task)
  const moved = applyLever(init, LEVERS.find((l) => l.id === "pct_pv")!.lever);
  moved.tracks.forEach((t, k) => add(givenMoney(`task1.amount_${k + 1}`, t.amount as string)));
  const moved20 = applyLever(init, LEVERS.find((l) => l.id === "pct_pv20")!.lever);
  moved20.tracks.forEach((t, k) => add(givenMoney(`w.amount_${k + 1}`, t.amount as string)));
  // the payment that 40% of the disposable income allows, and how far the initial mix is above it
  const maxAt40 = add({ id: "w.max_at_40", kind: "reg_max_payment", inputs: { income: "20250.00", percent: "40" }, value: moneyString(maxPaymentAt("20250", "40")) } as Fact);
  add(difference("w.over_40", facts.find((f) => f.id === "init.qualifying") as Fact, maxAt40));
  // the new rate of the prime track in the rate task
  add(given("task2.rate_1", "4.85"));

  // the prediction: what moving 10 points from prime to fixed does to the first payment, as a drop
  add(difference("ex1.drop", first0, facts.find((f) => f.id === "lv.pct_pf.first") as Fact));
  add(difference("ex1.shift", facts.find((f) => f.id === "init.amount_1") as Fact, facts.find((f) => f.id === "task1.amount_1") as Fact));
  add(difference("ex1.gap", facts.find((f) => f.id === "init.rate_1") as Fact, facts.find((f) => f.id === "init.rate_3") as Fact));
  // 2: what each 100,000 of loan is worth in the first payment
  add(difference("ex2.per_100k", first0, facts.find((f) => f.id === "lv.amount.first") as Fact));
  // 5: two thirds of the loan, the variable part after moving 10 points from fixed to variable, and how far over
  const limit = add({ id: "ex5.limit", kind: "reg_max_variable", inputs: { loan: CASE_A.loan }, value: moneyString(maxVariable(CASE_A.loan)) } as Fact);
  const varAfter = add(leverFact("ex5.variable_after", init, LEVERS.find((l) => l.id === "pct_fv")!.lever, "variable"));
  add(difference("ex5.over", varAfter, limit));

  // ── Sensitivity as a division ──
  add(perStep("lv.rate_all.per_point", facts.find((f) => f.id === "lv.rate_all.d_first") as Fact, "0.25"));
  add(perStep("lv.rate_all.per_point_total", facts.find((f) => f.id === "lv.rate_all.d_total") as Fact, "0.25"));
  add(sumOf("lv.rate_parts.d_first", ["rate_t1", "rate_t2", "rate_t3"].map((id) => facts.find((f) => f.id === `lv.${id}.d_first`) as Fact)));
  add(sumOf("lv.rate_parts.d_total", ["rate_t1", "rate_t2", "rate_t3"].map((id) => facts.find((f) => f.id === `lv.${id}.d_total`) as Fact)));

  // ── Two levers together are not the sum of the two alone ──
  const afterRate = applyLever(init, LEVERS.find((l) => l.id === "rate_all")!.lever);
  const comboFirst = add(leverFact("combo.first", afterRate, LEVERS.find((l) => l.id === "term")!.lever, "first"));
  const comboD = add(difference("combo.d_first", comboFirst, first0));
  const comboSum = add(sumOf("combo.sum", [facts.find((f) => f.id === "lv.rate_all.d_first") as Fact, facts.find((f) => f.id === "lv.term.d_first") as Fact]));
  add(difference("combo.gap", comboD, comboSum));

  // ── The same lever on a mix that has a linked track ──
  const linked: Mix = { tracks: candidate("linked").tracks, scenario: base };
  const lFirst = add(mixFact("lk.first", linked, "first"));
  const lMax = add(mixFact("lk.max", linked, "max"));
  const lTotal = add(mixFact("lk.total", linked, "total"));
  for (const [id, lever] of [
    ["index_up", { lever: "index", points: "1" }],
    ["index_down", { lever: "index", points: "-1" }],
    ["market", { lever: "market", points: "1" }],
  ] as [string, Lever][]) {
    const first = add(leverFact(`lk.${id}.first`, linked, lever, "first"));
    const max = add(leverFact(`lk.${id}.max`, linked, lever, "max"));
    const total = add(leverFact(`lk.${id}.total`, linked, lever, "total"));
    add(difference(`lk.${id}.d_first`, first, lFirst));
    add(difference(`lk.${id}.d_max`, max, lMax));
    add(difference(`lk.${id}.d_total`, total, lTotal));
  }

  // ── Builder task 3: the last track becomes fixed linked, then the index moves ──
  const t3: Mix = { tracks: [INITIAL_MIX[0], INITIAL_MIX[1], { ...INITIAL_MIX[2], kind: "fixed_linked", rate: PRICE_LIST.fixed_linked }], scenario: base };
  const t3Max = add(mixFact("task3.max", t3, "max"));
  const t3Total = add(mixFact("task3.total", t3, "total"));
  const t3Up = add(leverFact("task3.max_up", t3, { lever: "index", points: "1" }, "max"));
  const t3UpTotal = add(leverFact("task3.total_up", t3, { lever: "index", points: "1" }, "total"));
  add(difference("task3.d_max", t3Up, t3Max));
  add(difference("task3.d_total", t3UpTotal, t3Total));

  // ── Exercises ──
  // 3: what is still owed after five years, and the slip of "payments × months".
  const paid = add({ id: "ex3.paid", kind: "met_times", inputs: { of: first0.id, count: 60 }, value: moneyString(new Decimal(first0.value as string).mul(60)) } as Fact);
  add(difference("ex3.err_naive", loan, paid));
  const principal60 = add(difference("ex3.principal_60", loan, bal60));
  add(difference("ex3.interest_in_60", paid, principal60));
  // 4: what 0.25 points on every track add to the total, and the slip of "monthly difference × 360".
  const dFirst = facts.find((f) => f.id === "lv.rate_all.d_first") as Fact;
  add({ id: "ex4.err_times", kind: "met_times", inputs: { of: dFirst.id, count: 360 }, value: moneyString(new Decimal(dFirst.value as string).mul(360)) } as Fact);

  return {
    lesson: "5.7",
    title: "רגישות: מה משתנה כשמזיזים אחוז, סכום, תקופה, ריבית או מדד",
    note: "Case A's initial mix (src/data/case-a-mix.ts). Teaching numbers: the rates are the course's price list, an assumption (not market data, not an offer); the base scenario (the index rises 2% a year; prime and anchors do not move) and the market lever (prime and every anchor +1 point from year 2) are teaching scenarios, never forecasts. Monthly rate = annual ÷ 12; schedules follow the statement convention. A lever moves one input and nothing else; the amount lever scales every track in proportion.",
    facts,
  };
}
