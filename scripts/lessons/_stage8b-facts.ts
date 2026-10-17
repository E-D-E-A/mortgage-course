/**
 * Fact builders for stage-8 lessons 8.8-8.14 (author B). Not a lesson module: build-data.ts loads only lesson-*.ts.
 * Each builder computes its value with the stage-8 modules (objectives, engine, scenarios, montecarlo, search) and names a kind
 * that checks/kinds/{objectives,engine,scenarios,montecarlo,search}.py recomputes on its own.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { assess, evaluate, fingerprint } from "../../src/lib/calc/engine.ts";
import { objectiveValues, scoreRows, scoreText, weightLattice, winnersOnLattice } from "../../src/lib/calc/objectives.ts";
import { type Scenario, mixInputs, type TrackSpec } from "../../src/lib/calc/schedule.ts";
import { atLeast, DEFAULT_MODEL, type FutureModel, makeRng, drawDiscrete, simulate, summary } from "../../src/lib/calc/montecarlo.ts";
import { MACRO, forecast451Scenario, macroScenario, primePath, inflationPath, stressScenario } from "../../src/lib/calc/scenarios.ts";
import { CURVES } from "../../src/data/curves.ts";
import { SCENARIOS } from "../../src/data/case-a-mix.ts";
import { BRAIN_SPACE, countSpace, type GridSpec, coarseToFine, searchGrid, type SearchContext } from "../../src/lib/calc/search.ts";
import type { Fact } from "../build-data.ts";
import { encodeCandidate } from "./_constraints-facts.ts";
import type { Candidate } from "../../src/lib/calc/constraints.ts";

export const plainText = (x: Decimal.Value): string => {
  const s = new Decimal(x).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed();
  return s;
};
/** Plain text with trailing zeros dropped, like the Python checks' `plain`. */
export const plain = (x: Decimal.Value): string => new Decimal(x).toString();
const plain2 = (x: Decimal.Value): string => new Decimal(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();

// ── engine ────────────────────────────────────────────────────────────────

export type EngMeasure = "first" | "max" | "max_month" | "total" | "months" | "loan" | "interest" | "indexation" | "residual" | "payment" | "fingerprint" | "interest_at" | "principal_at" | "closing_at";

export function engFact(id: string, tracks: TrackSpec[], scenario: Scenario, measure: EngMeasure, month?: number): Fact {
  const e = evaluate(tracks, scenario);
  const sc: Scenario = { ...scenario, rounding: scenario.rounding ?? "statement" };
  let value: string | number;
  switch (measure) {
    case "first": value = moneyString(e.first); break;
    case "max": value = moneyString(e.max); break;
    case "max_month": value = e.maxMonth; break;
    case "total": value = moneyString(e.total); break;
    case "months": value = e.months; break;
    case "loan": value = moneyString(e.loan); break;
    case "interest": value = moneyString(e.interest); break;
    case "indexation": value = moneyString(e.indexation); break;
    case "residual": value = moneyString(e.total.minus(e.loan).minus(e.interest).minus(e.indexation)); break;
    case "fingerprint": value = fingerprint(e); break;
    case "interest_at":
    case "principal_at":
    case "closing_at": {
      const flow = mixFlow(tracks, sc);
      const m = (month as number) - 1;
      const pick = (r: { interest: Decimal; principalPaid: Decimal; closing: Decimal }) => (measure === "interest_at" ? r.interest : measure === "principal_at" ? r.principalPaid : r.closing);
      value = moneyString(flow.tracks.reduce((a, t) => (m < t.rows.length ? a.plus(pick(t.rows[m])) : a), new Decimal(0)));
      break;
    }
    case "payment": {
      const flow = evaluateFlow(tracks, sc);
      value = (month as number) <= flow.length ? moneyString(flow[(month as number) - 1]) : "0.00";
      break;
    }
  }
  return { id, kind: "eng_eval", inputs: { ...mixInputs(tracks, sc), measure, ...(month ? { month } : {}) }, value };
}

import { mixFlow } from "../../src/lib/calc/engine.ts";
const evaluateFlow = (tracks: TrackSpec[], sc: Scenario): Decimal[] => mixFlow(tracks, sc).payments;

export const engSumFact = (id: string, ids: string[], total: string): Fact => ({ id, kind: "eng_sum", inputs: { ids: ids.join("|") }, value: total });

// ── objectives ────────────────────────────────────────────────────────────

export interface TableRow { id: string; first: string; total: string; rise: string }

/** Rows for objectives.ts from a sens_table fact's value. */
const rowsOf = (table: { id: string; first: string; total: string; rise: string }[], allowed: string[]) =>
  table.map((r) => ({ id: r.id, values: [r.first, r.total, r.rise], feasible: allowed.includes(r.id) }));

export function objTableFact(id: string, tableId: string, table: TableRow[], allowed: string[], weights: number[], over: "feasible" | "all" = "feasible"): Fact {
  const s = scoreRows(rowsOf(table, allowed), weights, { over });
  return {
    id,
    kind: "obj_table",
    inputs: { table: tableId, allowed: allowed.join("|"), weights: weights.join(","), over },
    value: s.map((x) => ({ id: x.id, n_first: plain(x.normalised[0]), n_total: plain(x.normalised[1]), n_exposure: plain(x.normalised[2]), score: scoreText(x.score), rank: x.rank })),
  };
}

export function objLatticeFact(id: string, tableId: string, table: TableRow[], allowed: string[], step: number): Fact {
  const r = winnersOnLattice(rowsOf(table, allowed), step);
  return { id, kind: "obj_lattice", inputs: { table: tableId, allowed: allowed.join("|"), step }, value: { distinct: r.distinct.join("|"), n_distinct: r.distinct.length, count: weightLattice(step).length } };
}

export function objNormFact(id: string, values: string[]): Fact {
  const rows = values.map((v, k) => ({ id: String(k), values: [v], feasible: true }));
  const s = scoreRows(rows, [1]);
  return { id, kind: "obj_norm", inputs: { values: values.join("|") }, value: s.map((x) => plain(x.normalised[0])) };
}

export const mulFact = (id: string, x: string, y: string | number): Fact => ({ id, kind: "obj_mul", inputs: { x, y: String(y) }, value: plain(new Decimal(x).mul(y)) });

export function sumFact(id: string, values: string[], by: number): Fact {
  const t = values.reduce((s, v) => s.plus(v), new Decimal(0)).div(by);
  return { id, kind: "obj_sum", inputs: { values: values.join("|"), by }, value: t.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toFixed(6) };
}

// ── scenarios ─────────────────────────────────────────────────────────────

const curveText = (c: string[]) => c.join(",");
const scenarioInputs = (sid: "forecast451" | "stress" | "macro") => ({
  scenario: sid,
  nominal: curveText(CURVES.A.nominal),
  real: curveText(CURVES.A.real),
  reset_years: 5,
  stress_inflation: SCENARIOS.stress.inflation,
  stress_prime_shift: SCENARIOS.stress.primeShift,
  stress_anchor_shift: SCENARIOS.stress.anchorShift,
  macro_policy: MACRO.policy.join(","),
  macro_inflation: MACRO.inflation.join(","),
});
const scenarioOf = (sid: "forecast451" | "stress" | "macro"): Scenario => (sid === "forecast451" ? forecast451Scenario() : sid === "stress" ? stressScenario() : macroScenario());

/** A mix's flat inputs WITHOUT scenario fields (the scenario is named instead). */
const flatTracks = (tracks: TrackSpec[]) => {
  const all = mixInputs(tracks, {});
  return Object.fromEntries(Object.entries(all).filter(([k]) => k === "tracks" || /^t\d/.test(k)));
};

export function scnEvalFact(id: string, sid: "forecast451" | "stress" | "macro", tracks: TrackSpec[], measure: "first" | "max" | "max_month" | "total" | "payment", month?: number): Fact {
  const sc = scenarioOf(sid);
  const e = evaluate(tracks, sc);
  const flow = mixFlow(tracks, { ...sc, rounding: "statement" }).payments;
  const value = measure === "first" ? moneyString(e.first) : measure === "max" ? moneyString(e.max) : measure === "max_month" ? e.maxMonth : measure === "total" ? moneyString(e.total) : (month as number) <= flow.length ? moneyString(flow[(month as number) - 1]) : "0.00";
  return { id, kind: "scn_eval", inputs: { ...scenarioInputs(sid), ...flatTracks(tracks), measure, ...(month ? { month } : {}) }, value };
}

export function scnPathFact(id: string, sid: "forecast451" | "stress" | "macro", what: "prime" | "inflation", years: number, today: string): Fact {
  const sc = scenarioOf(sid);
  const xs = what === "prime" ? primePath(sc, years, today) : inflationPath(sc, years);
  return { id, kind: "scn_path", inputs: { ...scenarioInputs(sid), what, years, today }, value: xs.map(plain2) };
}

// ── Monte Carlo ───────────────────────────────────────────────────────────

const weightsText = (o: { value: string; weight: number }[]) => o.map((x) => `${x.value}:${x.weight}`).join(",");

export const mcRngFact = (id: string, seed: number, count: number): Fact => {
  const r = makeRng(seed);
  return { id, kind: "mc_rng", inputs: { seed, count }, value: Array.from({ length: count }, () => r()) };
};

export const mcStepsFact = (id: string, seed: number, count: number, model: FutureModel = DEFAULT_MODEL): Fact => {
  const r = makeRng(seed);
  return { id, kind: "mc_steps", inputs: { seed, count, outcomes: weightsText(model.primeSteps) }, value: Array.from({ length: count }, () => drawDiscrete(model.primeSteps, r())) };
};

export type McMeasure = "count_at_least" | "p_at_least" | "p_pct" | "se_pct" | "se" | "mean_max" | "p5_max" | "p50_max" | "p95_max" | "min_max" | "max_max" | "mean_total" | "first" | "list_max";

export function mcFact(id: string, tracks: TrackSpec[], seed: number, n: number, model: FutureModel, measure: McMeasure, threshold?: string): Fact {
  // The simulation runs once per (seed, n, model, tracks); results are cached by the caller through `mcRun`.
  const sim = mcRun(tracks, seed, n, model);
  const q = (x: Decimal.Value, p: number) => new Decimal(x).toDecimalPlaces(p, Decimal.ROUND_HALF_UP).toFixed(p);
  const a = threshold !== undefined ? atLeast(sim.max, threshold) : undefined;
  const s = summary(sim.max);
  const value: string | number | string[] =
    measure === "list_max" ? sim.max.map((v) => q(v, 2))
    : measure === "count_at_least" ? (a as NonNullable<typeof a>).count
    : measure === "p_at_least" ? q((a as NonNullable<typeof a>).p, 4)
    : measure === "p_pct" ? q((a as NonNullable<typeof a>).p.mul(100), 1)
    : measure === "se_pct" ? q((a as NonNullable<typeof a>).se.mul(100), 1)
    : measure === "se" ? q((a as NonNullable<typeof a>).se, 6)
    : measure === "mean_max" ? q(s.mean, 2)
    : measure === "p5_max" ? q(s.p5, 2)
    : measure === "p50_max" ? q(s.p50, 2)
    : measure === "p95_max" ? q(s.p95, 2)
    : measure === "min_max" ? q(s.min, 2)
    : measure === "max_max" ? q(s.max, 2)
    : measure === "first" ? q(sim.first[0], 2)
    : q(summary(sim.total).mean, 2);
  return {
    id,
    kind: "mc_run",
    inputs: {
      seed, n, years: model.years, scale: model.scale, min_shift: model.minShift,
      prime_steps: weightsText(model.primeSteps), inflation: weightsText(model.inflation),
      ...flatTracks(tracks), measure, ...(threshold !== undefined ? { threshold } : {}),
    },
    value,
  };
}

const mcCache = new Map<string, ReturnType<typeof simulate>>();
export function mcRun(tracks: TrackSpec[], seed: number, n: number, model: FutureModel) {
  const key = JSON.stringify([tracks, seed, n, model]);
  let hit = mcCache.get(key);
  if (!hit) {
    hit = simulate(tracks, seed, n, model);
    mcCache.set(key, hit);
  }
  return hit;
}

// ── search ────────────────────────────────────────────────────────────────

export const countFact = (id: string, spec: typeof BRAIN_SPACE): Fact => ({
  id,
  kind: "srch_count",
  inputs: { kinds: spec.kinds, step: spec.stepPercent, terms: spec.terms, mode: spec.termMode },
  value: countSpace(spec).toString(),
});

const SCEN = (s: Scenario) => ({
  base_inflation: String((s.inflation as string[])[0]),
  base_anchor: String((s.anchorShift as string[])[0]),
});

export function gridInputs(spec: GridSpec, request: Candidate, ctx: SearchContext, prune: boolean) {
  const encoded = encodeCandidate(request).replace(/;tracks=.*$/, "");
  const b = SCEN(ctx.scenarios.base);
  const st = ctx.scenarios.stress;
  return {
    loan: new Decimal(spec.loan).toString(),
    kinds: spec.kinds.join("|"),
    step: spec.stepPercent,
    terms: spec.termsMonths.join("|"),
    mode: spec.termMode,
    rates: spec.kinds.map((k) => `${k}=${spec.rates[k]}`).join("|"),
    request: encoded,
    ...b,
    stress_inflation: String((st.inflation as string[])[0]),
    stress_prime: String((st.primeShift as string[])[1]),
    stress_anchor: String((st.anchorShift as string[])[0]),
    weights: ctx.weights.join(","),
    prune: prune ? "1" : "0",
  };
}

const reasonCounts = (entries: { reasons: string[] }[]): string => {
  const why: Record<string, number> = {};
  for (const e of entries) for (const r of new Set(e.reasons)) why[r] = (why[r] ?? 0) + 1;
  return Object.keys(why).sort().map((k) => `${k}=${why[k]}`).join("|");
};

export function gridFact(id: string, spec: GridSpec, request: Candidate, ctx: SearchContext, prune: boolean): Fact {
  const r = searchGrid(spec, ctx, { prune });
  const count = (s: string) => r.entries.filter((e) => e.status === s).length;
  return {
    id,
    kind: "srch_grid",
    inputs: gridInputs(spec, request, ctx, prune),
    value: { size: r.size, engine_calls: r.engineCalls, pruned: count("pruned"), rejected: count("rejected"), feasible: count("feasible"), best: r.best?.id ?? "", best_score: r.best ? scoreText(r.best.score) : "", reasons: reasonCounts(r.entries) },
  };
}

export function c2fFact(id: string, spec: GridSpec, request: Candidate, ctx: SearchContext, coarse: number, prune: boolean): Fact {
  const r = coarseToFine(spec, ctx, coarse, { prune });
  const p = r.pool;
  const count = (s: string) => p.entries.filter((e) => e.status === s).length;
  return {
    id,
    kind: "srch_c2f",
    inputs: { ...gridInputs(spec, request, ctx, prune), coarse },
    value: { size: p.size, engine_calls: r.engineCalls, pruned: count("pruned"), rejected: count("rejected"), feasible: count("feasible"), best: p.best?.id ?? "", best_score: p.best ? scoreText(p.best.score) : "", coarse_calls: r.coarse.engineCalls, fine_calls: r.fine === r.coarse ? 0 : r.fine.engineCalls, reasons: reasonCounts(p.entries) },
  };
}

export const legalFact = (id: string, kinds: string[], step: number, value: { legal: number; all: number }): Fact => ({ id, kind: "srch_legal", inputs: { kinds: kinds.join("|"), step }, value });
export const yearsFact = (id: string, countId: string, ms: number, years: string): Fact => ({ id, kind: "srch_years", inputs: { count: countId, ms }, value: years });

export { assess, objectiveValues };

export interface NormRow { id: string; n_first: string; n_total: string; n_exposure: string; score: string; rank: number | null }
export const normRows = (v: unknown): NormRow[] => v as NormRow[];

/** A share of cases (count of total) as a percent, with the error a same-size sample gives: sqrt(p(1-p)/n) (kind mc_share). */
export function shareFact(id: string, count: number, total: number): Fact {
  const p = new Decimal(count).div(total);
  const se = p.mul(new Decimal(1).minus(p)).div(total).sqrt();
  return { id, kind: "mc_share", inputs: { count, total }, value: { p_pct: p.mul(100).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1), se_pct: se.mul(100).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1) } };
}

export const minutesFact = (id: string, countId: string, ms: number, count: bigint): Fact => ({
  id,
  kind: "srch_minutes",
  inputs: { count: countId, ms },
  value: new Decimal(count.toString()).mul(ms).div(1000).div(60).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toFixed(1),
});

export const powFact = (id: string, base: number, exp: number): Fact => ({ id, kind: "srch_pow", inputs: { base, exp }, value: (BigInt(base) ** BigInt(exp)).toString() });

// ── engine table (kind eng_table): the same inputs as sens_table, the engine's measures ──
import { CASE_A, caseAPasses, type CaseACandidate } from "../../src/data/case-a-mix.ts";
import { scenarioFrom, type ScenarioSpec } from "../../src/lib/calc/sensitivity.ts";

const encodeTracks = (tracks: TrackSpec[]) => tracks.map((t) => [t.kind, t.amount, t.rate, t.months].join("|")).join(";");

export function engTableFact(id: string, cands: CaseACandidate[], base: ScenarioSpec, stress: ScenarioSpec): Fact {
  const inputs: Record<string, string | number> = {
    candidates: cands.length,
    base_inflation: String(base.inflation), base_prime_shift: String(base.primeShift), base_anchor_shift: String(base.anchorShift),
    stress_inflation: String(stress.inflation), stress_prime_shift: String(stress.primeShift), stress_anchor_shift: String(stress.anchorShift),
    price: CASE_A.price,
    income: CASE_A.recognisedIncome, obligation_monthly: CASE_A.car.monthly, obligation_months: CASE_A.car.monthsLeft as number,
  };
  cands.forEach((c, k) => {
    inputs[`c${k + 1}_id`] = c.id;
    inputs[`c${k + 1}_tracks`] = encodeTracks(c.tracks);
  });
  const ctx = { base: scenarioFrom(base), stress: scenarioFrom(stress) };
  return {
    id,
    kind: "eng_table",
    inputs,
    value: cands.map((c) => {
      const a = assess(c.tracks, ctx);
      return { id: c.id, first: moneyString(a.base.first), max: moneyString(a.base.max), max_month: a.base.maxMonth, total: moneyString(a.base.total), stress_max: moneyString(a.stress.max), rise: moneyString(a.rise), passes: caseAPasses(c.tracks) ? "yes" : "no" };
    }),
  };
}
