/**
 * Lesson 3.7 — from a mix to one cash flow: each track with its own term
 * (Mogi decision DEC-2), each computed by its own rules (3.5, 3.6), and the
 * mix's monthly payment as their sum, month by month. The first version of
 * the brief's "בונה תמהיל" (src/components/MixBuilder.vue) shows the first
 * payment, the highest payment under a stated scenario, all payments together
 * and the exposure.
 *
 * Every number the page and its exercises show is a fact here; the page reads
 * data/lessons/3-7.json and checks/kinds/schedule.py recomputes each one. The
 * mixes are invented (not case A, which gets its mix in stage 5); index and
 * prime paths are teaching scenarios, not forecasts.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import {
  exposure,
  mixCashFlow,
  mixInputs,
  mixSummary,
  oneFormulaPayment,
  type Scenario,
  type TrackSpec,
} from "../../src/lib/calc/schedule.ts";
import { plainNumber } from "../../src/lib/calc/indexation.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, given, payment } from "./lesson-3-5.ts";

const mixFact = (id: string, kind: string, tracks: TrackSpec[], scenario: Scenario, extra: Record<string, string | number>, value: unknown): Fact => ({
  id,
  kind,
  inputs: { ...mixInputs(tracks, scenario), ...extra },
  value,
});

const at = (id: string, tracks: TrackSpec[], scenario: Scenario, month: number) =>
  mixFact(id, "sch_mix_payment", tracks, scenario, { month }, moneyString(mixCashFlow(tracks, scenario)[month - 1].payment));

const trackAt = (id: string, tracks: TrackSpec[], scenario: Scenario, track: number, month: number) => {
  const flow = mixCashFlow(tracks, scenario);
  return mixFact(id, "sch_mix_track_payment", tracks, scenario, { track, month }, moneyString(month <= flow.length ? flow[month - 1].byTrack[track - 1] : 0));
};

/** First, highest (and its month) and total, under one scenario. */
const summary = (prefix: string, tracks: TrackSpec[], scenario: Scenario): Fact[] => {
  const s = mixSummary(mixCashFlow(tracks, scenario));
  return [
    mixFact(`${prefix}.first`, "sch_mix_first", tracks, scenario, {}, moneyString(s.firstPayment)),
    mixFact(`${prefix}.max`, "sch_mix_max", tracks, scenario, {}, moneyString(s.maxPayment)),
    mixFact(`${prefix}.max_month`, "sch_mix_max_month", tracks, scenario, {}, String(s.maxMonth)),
    mixFact(`${prefix}.total`, "sch_mix_total", tracks, scenario, {}, moneyString(s.totalPaid)),
  ];
};

const share = (id: string, tracks: TrackSpec[], group: "prime" | "linked" | "fixed_for_term" | "resetting") => {
  const e = exposure(tracks).share;
  const value = { prime: e.prime, linked: e.linked, fixed_for_term: e.fixedForTerm, resetting: e.resetting }[group];
  return mixFact(id, "sch_mix_share", tracks, {}, { group }, plainNumber(value));
};

const sum = (id: string, terms: string[]): Fact => ({
  id,
  kind: "sch_sum",
  inputs: Object.fromEntries(terms.map((t, k) => [`term_${k + 1}`, t])),
  value: moneyString(terms.reduce((s, t) => s.plus(t), new Decimal(0))),
});

/** The half-worked table: the explanation's mix, nothing moving, at a few months. */
const halfTable = (tracks: TrackSpec[], months: number[]): Fact => {
  const flow = mixCashFlow(tracks);
  return {
    id: "half.table",
    kind: "sch_mix_rows",
    inputs: { ...mixInputs(tracks), ...Object.fromEntries(months.map((m, k) => [`month_${k + 1}`, m])) },
    value: months.map((m) => ({
      period: m,
      t1: moneyString(flow[m - 1].byTrack[0]),
      t2: moneyString(flow[m - 1].byTrack[1]),
      t3: moneyString(flow[m - 1].byTrack[2]),
      total: moneyString(flow[m - 1].payment),
    })),
  };
};

export default function lesson37(): LessonData {
  // The explanation: Michal and Uri (invented), 900,000 ₪ in three tracks, each with its own term.
  const MIX: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "300000", rate: "4.8", months: 360 },
    { kind: "prime", amount: "300000", rate: "4.25", months: 144 },
    { kind: "fixed_linked", amount: "300000", rate: "3", months: 240 },
  ];
  const FLAT: Scenario = {};
  // The stated scenario (a teaching scenario, not a forecast): the index rises 2% a year, evenly; prime is 1 point higher from year 2.
  const SC: Scenario = { inflation: ["2"], primeShift: ["0", "1"] };
  const t1 = payment("explain.t1", "300000", "4.8", 360);
  const t2 = payment("explain.t2", "300000", "4.25", 144);
  const t3 = payment("explain.t3", "300000", "3", 240);
  const flat1 = at("flat.m1", MIX, FLAT, 1);
  const flat145 = at("flat.m145", MIX, FLAT, 145);
  const flatTotal = summary("flat", MIX, FLAT);
  const sc = summary("sc", MIX, SC);
  const one = mixFact("wrong.one_formula", "sch_one_formula", MIX, {}, {}, moneyString(oneFormulaPayment(MIX)));

  // The illustration's tasks.
  const LONG_PRIME = MIX.map((t, k) => (k === 1 ? { ...t, months: 300 } : t));
  const VARIABLE = MIX.map((t, k) => (k === 2 ? { ...t, kind: "variable_linked" as const, rate: "3.25" } : t));
  const SCV: Scenario = { ...SC, anchorShift: ["1"] };

  // Worked example: Lior (invented), 700,000 ₪ in three tracks.
  const W: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "350000", rate: "5", months: 300 },
    { kind: "prime", amount: "200000", rate: "4.5", months: 180 },
    { kind: "variable_unlinked", amount: "150000", rate: "4.6", months: 240, resetMonths: 60 },
  ];
  const WS: Scenario = { primeShift: ["0", "0.5"], anchorShift: ["1"] };
  const w1 = payment("worked.t1", "350000", "5", 300);
  const w2 = payment("worked.t2", "200000", "4.5", 180);
  const w3 = payment("worked.t3", "150000", "4.6", 240);

  // Exercises.
  const EX3: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "400000", rate: "5", months: 300 },
    { kind: "prime", amount: "250000", rate: "4", months: 120 },
    { kind: "fixed_linked", amount: "150000", rate: "3.2", months: 240 },
  ];
  const EX5: TrackSpec[] = [
    { kind: "fixed_unlinked", amount: "400000", rate: "5", months: 300 },
    { kind: "prime", amount: "200000", rate: "4", months: 120 },
  ];
  const ex5a = payment("ex5.t1", "400000", "5", 300);
  const ex5b = payment("ex5.t2", "200000", "4", 120);
  const EX6: Scenario = { inflation: ["3"] };

  const facts: Fact[] = [
    given("case.loan", "900000.00"),
    given("case.track", "300000.00"),

    // Each track, then the mix with nothing moving.
    t1,
    t2,
    t3,
    flat1,
    flat145,
    difference("flat.drop_145", flat1, flat145),
    at("flat.m241", MIX, FLAT, 241),
    ...flatTotal,

    // Under the stated scenario.
    ...sc,
    at("sc.m12", MIX, SC, 12),
    at("sc.m13", MIX, SC, 13),
    trackAt("sc.t2_13", MIX, SC, 2, 13),
    trackAt("sc.t3_12", MIX, SC, 3, 12),
    trackAt("sc.t2_144", MIX, SC, 2, 144),
    trackAt("sc.t3_144", MIX, SC, 3, 144),
    at("sc.m145", MIX, SC, 145),
    difference("sc.max_over_first", sc[1], sc[0]),
    difference("sc.total_over_flat", sc[3], flatTotal[3]),

    // Exposure.
    share("exp.prime", MIX, "prime"),
    share("exp.linked", MIX, "linked"),
    share("exp.fixed", MIX, "fixed_for_term"),
    share("exp.resetting", MIX, "resetting"),

    // One formula for the whole mix: the mistake.
    one,
    difference("wrong.gap", flat1, one),

    // Illustration tasks.
    ...summary("long", LONG_PRIME, SC),
    ...summary("var", VARIABLE, SCV),
    share("var.exp_fixed", VARIABLE, "fixed_for_term"),
    share("var.exp_resetting", VARIABLE, "resetting"),

    // Worked example.
    given("worked.loan", "700000.00"),
    w1,
    w2,
    w3,
    at("worked.m1", W, WS, 1),
    trackAt("worked.t2_13", W, WS, 2, 13),
    at("worked.m13", W, WS, 13),
    trackAt("worked.t3_61", W, WS, 3, 61),
    at("worked.m61", W, WS, 61),
    at("worked.m181", W, WS, 181),
    at("worked.m241", W, WS, 241),
    ...summary("worked", W, WS),
    share("worked.exp_prime", W, "prime"),
    share("worked.exp_fixed", W, "fixed_for_term"),
    share("worked.exp_resetting", W, "resetting"),

    // Half-worked table.
    halfTable(MIX, [1, 144, 145, 240, 241]),

    // Exercise 2: two tracks' payments in one month.
    sum("ex2.answer", ["2140.55", "1385.20"]),
    // Exercise 3: the exercise mix in month 150 (the prime track has ended), nothing moving.
    at("ex3.answer", EX3, FLAT, 150),
    at("ex3.month1", EX3, FLAT, 1),
    trackAt("ex3.t1", EX3, FLAT, 1, 150),
    trackAt("ex3.t2", EX3, FLAT, 2, 1),
    trackAt("ex3.t3", EX3, FLAT, 3, 150),
    // Exercise 4: the prime share of that mix.
    share("ex4.answer", EX3, "prime"),
    sum("ex4.loan", ["400000", "250000", "150000"]),
    share("ex4.fixed", EX3, "fixed_for_term"),
    // Exercise 5: month 1 of a two-track mix, against one formula.
    ex5a,
    ex5b,
    at("ex5.answer", EX5, FLAT, 1),
    mixFact("ex5.one_formula", "sch_one_formula", EX5, {}, {}, moneyString(oneFormulaPayment(EX5))),
    // Exercise 6: the exercise-3 mix in month 12, with the index rising 3% a year.
    at("ex6.answer", EX3, EX6, 12),
    at("ex6.no_index", EX3, FLAT, 12),
    trackAt("ex6.t3", EX3, EX6, 3, 12),
    trackAt("ex6.t2", EX3, EX6, 2, 12),
  ];

  return {
    lesson: "3.7",
    title: "מתמהיל לתזרים אחד",
    note: "Invented mixes (not case A, whose mix comes in stage 5). Each track has its own term (DEC-2); a variable track resets every 60 months (DEC-3's first-simulation assumption). The scenario — index 2% a year, evenly; prime +1 point from year 2 — is a teaching scenario, not a forecast. Cash flows from src/lib/calc/schedule.ts.",
    facts,
  };
}
