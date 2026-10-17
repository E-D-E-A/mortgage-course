/**
 * Fact builders for lessons 8.22–8.25 (stage 8, author D): each records the inputs that
 * checks/kinds/drift.py recomputes the value from, and takes the value from src/lib/calc/drift.ts and splits.ts.
 * Not a lesson module: build-data.ts loads only lesson-*.ts and check-*.ts.
 */
import {
  agreement,
  captureLagDays,
  DEFAULT_MONITOR,
  DEFAULT_SPEC,
  monitorRun,
  type MonitorOptions,
  r4,
  r6,
  type SeriesSpec,
  syntheticSeries,
} from "../../src/lib/calc/drift.ts";
import Decimal from "decimal.js";
import { stepEstimate } from "../../src/lib/calc/estimate.ts";
import { errorMeasures, evaluate, groupCompare, randomSplit, timeSplit } from "../../src/lib/calc/splits.ts";
import type { Fact } from "../build-data.ts";

export const SPEC = DEFAULT_SPEC;
export const SERIES = syntheticSeries(SPEC);

export const specInputs = (s: SeriesSpec = SPEC) => ({
  seed: s.seed,
  months: s.months,
  x0: s.x0,
  xmin: s.xMin,
  xmax: s.xMax,
  change_at: s.changeAt,
  a1: s.before.intercept,
  b1: s.before.slope,
  a2: s.after.intercept,
  b2: s.after.slope,
  noise: s.noiseStep,
  creep: s.creep ?? "0",
});

export const seriesFact = (id: string, t: number, field: "x" | "y"): Fact => ({
  id,
  kind: "dr_series",
  inputs: { ...specInputs(), t, field },
  value: SERIES[t - 1][field],
});

export type MonitorMeasure = "spread1" | "baseline" | "baseline6" | "threshold" | "threshold6" | "alarm_month" | "delay" | "spread2" | "v1_after" | "v2_after" | "v1_healthy";

export function monitorFact(id: string, measure: MonitorMeasure, o: MonitorOptions = DEFAULT_MONITOR): Fact {
  const run = monitorRun(SERIES, SPEC.changeAt, o);
  const pick = {
    spread1: run.v1.spread,
    baseline: run.baseline,
    baseline6: run.baseline,
    threshold: run.threshold,
    threshold6: run.threshold,
    alarm_month: run.alarmMonth,
    delay: run.delay,
    spread2: run.v2?.spread,
    v1_after: run.v1After,
    v2_after: run.v2After,
    v1_healthy: run.v1Healthy,
  }[measure];
  if (pick === null || pick === undefined) throw new Error(`${id}: no value`);
  const value = measure === "alarm_month" || measure === "delay" ? (pick as number) : measure.endsWith("6") ? r6(pick as never) : r4(pick as never);
  return {
    id,
    kind: "dr_monitor",
    inputs: { ...specInputs(), train_to: o.trainTo, factor: String(o.factor), window: o.window, retrain_window: o.retrainWindow, measure },
    value,
  };
}

export type SplitKind = { split: "random"; seed: number } | { split: "time" };

export function splitFact(id: string, s: SplitKind, model: "spread" | "memory", part: "train" | "test", measure: "mae" | "rmse" | "bias", trainCount = 42, testCount = 18, spec: SeriesSpec = SPEC): Fact {
  const series = spec === SPEC ? SERIES : syntheticSeries(spec);
  const n = series.length;
  const sp = s.split === "random" ? randomSplit(n, testCount, s.seed) : timeSplit(n, trainCount);
  const ev = evaluate(series, sp, 1);
  return {
    id,
    kind: "dr_split",
    inputs: {
      ...specInputs(spec),
      split: s.split,
      split_seed: s.split === "random" ? s.seed : 0,
      test_count: testCount,
      train_count: trainCount,
      model,
      part,
      measure,
      k: 1,
    },
    value: r4(ev[model][part][measure]),
  };
}

export const agreementFact = (id: string, pairs: [string, string][], measure: "agree" | "total" | "rate"): Fact => {
  const a = agreement(pairs);
  return {
    id,
    kind: "dr_agreement",
    inputs: { pairs: pairs.map(([x, y]) => `${x}:${y}`).join("|"), measure },
    value: measure === "agree" ? a.agree : measure === "total" ? a.total : a.ratePercent,
  };
};

export const lagFact = (id: string, occurred: string, recorded: string): Fact => ({
  id,
  kind: "dr_lag",
  inputs: { occurred, recorded },
  value: captureLagDays(occurred, recorded),
});

export type GroupMeasure = "mean_a" | "mean_b" | "sd_a" | "sd_b" | "diff" | "n_a" | "n_b" | "sum_a";
export function groupFact(id: string, a: string[], b: string[], measure: GroupMeasure): Fact {
  const g = groupCompare(a, b);
  const value = { mean_a: r4(g.a.mean), mean_b: r4(g.b.mean), sd_a: r4(g.a.sd), sd_b: r4(g.b.sd), diff: r4(g.diff), n_a: g.a.n, n_b: g.b.n, sum_a: r4(g.a.mean.mul(g.a.n)) }[measure];
  return { id, kind: "dr_group", inputs: { a: a.join("|"), b: b.join("|"), measure }, value };
}

export const totalFact = (id: string, values: number[]): Fact => ({
  id,
  kind: "dr_total",
  inputs: { values: values.join("|") },
  value: values.reduce((s, v) => s + v, 0),
});

export const errFact = (id: string, errors: string[], measure: "mae" | "rmse" | "bias" | "sumabs" | "msq"): Fact => {
  const m = errorMeasures(errors);
  const sumabs = errors.reduce((s, e) => s.plus(new Decimal(e).abs()), new Decimal(0));
  const msq = errors.reduce((s, e) => s.plus(new Decimal(e).pow(2)), new Decimal(0)).div(errors.length);
  const v = { mae: m.mae, rmse: m.rmse, bias: m.bias, sumabs, msq }[measure];
  return { id, kind: "dr_errmeasure", inputs: { errors: errors.join("|"), measure }, value: r4(v) };
};

export const percentFact = (id: string, part: number, whole: number): Fact => ({
  id,
  kind: "dr_percent",
  inputs: { part, whole },
  value: new Decimal(part).div(whole).mul(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2),
});

/** a − b of two facts that hold four-decimal numbers, to four decimals. */
export const diffFact = (id: string, a: Fact, b: Fact): Fact => ({
  id,
  kind: "dr_diff",
  inputs: { minuend: a.id, subtrahend: b.id },
  value: r4(new Decimal(a.value as string).minus(b.value as string)),
});

/** The 95% interval of the difference of two group means (estimate.ts, lesson 8.18's method): above − below. */
export function intervalFact(id: string, below: string[], above: string[], measure: "step" | "se" | "df" | "t" | "low" | "high"): Fact {
  const e = stepEstimate(below, above);
  return { id, kind: "dr_interval", inputs: { below: below.join("|"), above: above.join("|"), measure }, value: e[measure] };
}
