/**
 * Drift — the arithmetic behind lessons 8.22 (where the data comes from), 8.24 (a model that goes
 * stale: drift, retraining, versions, monitoring) and 8.25 (agreement with the advisor). Lesson
 * 8.23 builds on the same series through splits.ts. Stage 8, author D. EVERYTHING HERE IS A TEACHING
 * ILLUSTRATION ON SYNTHETIC DATA: nothing in it is a Mogi decision, a bank's policy or a market
 * figure. Maths is general knowledge; the series is invented.
 *
 * ── The synthetic series ──────────────────────────────────────────────────
 * One invented bank ("בנק א׳") offers a fixed-rate track every month. Month t has
 *   x_t   the anchor rate, in percent: a random walk in steps of 0.05, kept inside [xMin, xMax]
 *   y_t   the rate the bank offers, in percent:   y_t = intercept + slope × x_t + creep × t + e_t
 *   e_t   noise: a multiple of `noiseStep` between −5 and +5 steps, equally likely
 * Until month changeAt − 1 the "before" regime holds; from month changeAt the "after" regime.
 * `creep` is a slow drift per month (0 by default); splits.ts uses it for lesson 8.23.
 *
 * Randomness: ONE tiny generator, written the same in checks/kinds/drift.py so the numbers match to
 * the digit. No Math.random. A linear congruential generator on 32 bits:
 *     s ← (s × 1664525 + 1013904223) mod 2^32 ;  output u = ⌊s ÷ 65536⌋   (0 … 65535)
 * Each month draws twice: the first draw moves x  (step = (u mod 5 − 2) × 0.05), the second makes
 * the noise (e = (u mod 11 − 5) × noiseStep). The seed is the first state.
 *
 * ── The API ───────────────────────────────────────────────────────────────
 *   Lcg(seed).next()                          the generator above
 *   syntheticSeries(spec) → Point[]           {t, x, y, regime}   (t from 1; strings, exact)
 *   fitSpread(points) → Model                 the model of lessons 8.23–8.24, deliberately tiny: it
 *                                             believes the offer is the anchor plus one fixed spread, and
 *                                             estimates the spread as the mean of (y − x) over its
 *                                             training months. (That is the least-squares line of 8.5
 *                                             with the slope fixed at 1.) Exact to 50 digits; rounded half
 *                                             up only when a fact is written (r4).
 *   predict(model, x)                         x + spread
 *   absErrors(model, points)                  |y − predict(x)| for each point
 *   meanOf(values) / mae(values)              the mean; the mean absolute error
 *   rollingMae(errors, window)                from the window-th value on: the mean of the last `window`
 *                                             errors (null before)
 *   firstAlarm(rolling, threshold, from)      the first index ≥ from where the rolling error is ABOVE
 *                                             the threshold, or null
 *   monitorRun(series, opts) → MonitorRun     the whole story of 8.24: fit on months 1…trainTo; the
 *                                             baseline error; the threshold (factor × baseline); the
 *                                             error month by month; the alarm month and its delay after
 *                                             the change; a refit on the last `retrainWindow` months up
 *                                             to the alarm (the second version); both versions' errors
 *                                             after the alarm
 *   agreement(pairs) → {agree, total, ratePercent}    the share of cases where the software's choice
 *                                             equals the advisor's (8.22, 8.25)
 *   captureLagDays(occurred, recorded)        whole days between two ISO dates (the log's two clocks)
 *
 * What is not decided: the alarm factor, the window sizes and the number of months are choices of this
 * illustration. Mogi has decided none of them (course map, stage 8: weights, thresholds and sizes are
 * "להדגמה").
 */
import Decimal from "decimal.js";

const D = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
type Num = Decimal.Value;

export const r4 = (v: Num): string => new D(v).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed(4);
export const r2 = (v: Num): string => new D(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);

/** 32-bit linear congruential generator; mirrored in checks/kinds/drift.py. */
export class Lcg {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0;
  }
  /** 0 … 65535. */
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) % 4294967296;
    return Math.floor(this.s / 65536);
  }
}

export interface Regime {
  intercept: string;
  slope: string;
}

export interface SeriesSpec {
  seed: number;
  months: number;
  x0: string;
  xMin: string;
  xMax: string;
  /** The first month of the "after" regime (1-based). Beyond `months` means: never. */
  changeAt: number;
  before: Regime;
  after: Regime;
  noiseStep: string;
  /** A slow drift per month added to y (default "0"). */
  creep?: string;
}

export interface Point {
  t: number;
  x: string;
  y: string;
  regime: 1 | 2;
}

/** The whole model: the offer is the anchor plus this spread (percentage points). */
export interface Model {
  spread: Decimal;
}

/** The series of lessons 8.22–8.24: 60 months, the bank's spread over the anchor jumps from 1.00 to 1.25 at month 37. */
export const DEFAULT_SPEC: SeriesSpec = {
  seed: 20261,
  months: 60,
  x0: "4.00",
  xMin: "3.00",
  xMax: "5.00",
  changeAt: 37,
  before: { intercept: "1.00", slope: "1.00" },
  after: { intercept: "1.25", slope: "1.00" },
  noiseStep: "0.02",
  creep: "0",
};

export function syntheticSeries(spec: SeriesSpec): Point[] {
  const rng = new Lcg(spec.seed);
  const lo = new D(spec.xMin);
  const hi = new D(spec.xMax);
  const creep = new D(spec.creep ?? "0");
  let x = new D(spec.x0);
  const out: Point[] = [];
  for (let t = 1; t <= spec.months; t++) {
    const step = new D((rng.next() % 5) - 2).mul("0.05");
    x = D.min(hi, D.max(lo, x.plus(step)));
    const e = new D((rng.next() % 11) - 5).mul(spec.noiseStep);
    const regime = t >= spec.changeAt ? 2 : 1;
    const r = regime === 2 ? spec.after : spec.before;
    const y = new D(r.intercept).plus(new D(r.slope).mul(x)).plus(creep.mul(t)).plus(e);
    out.push({ t, x: x.toFixed(), y: y.toFixed(), regime });
  }
  return out;
}

export function meanOf(values: Num[]): Decimal {
  if (values.length === 0) throw new RangeError("the mean of nothing is not defined");
  return values.reduce<Decimal>((s, v) => s.plus(v), new D(0)).div(values.length);
}

export const mae = (values: Num[]): Decimal => meanOf(values);

export function fitSpread(points: { x: Num; y: Num }[]): Model {
  if (points.length < 1) throw new RangeError("a spread needs at least one month");
  return { spread: meanOf(points.map((p) => new D(p.y).minus(p.x))) };
}

export const predict = (model: Model, x: Num): Decimal => new D(x).plus(model.spread);

export const absErrors = (model: Model, points: { x: Num; y: Num }[]): Decimal[] =>
  points.map((p) => predict(model, p.x).minus(p.y).abs());

/** From the window-th value on: the mean of the last `window` values. Earlier entries are null. */
export function rollingMae(errors: Num[], window: number): (Decimal | null)[] {
  return errors.map((_, i) => (i + 1 < window ? null : meanOf(errors.slice(i + 1 - window, i + 1))));
}

/** The first index at or after `from` whose rolling error is above the threshold; null if none. */
export function firstAlarm(rolling: (Decimal | null)[], threshold: Num, from = 0): number | null {
  const th = new D(threshold);
  for (let i = from; i < rolling.length; i++) {
    const v = rolling[i];
    if (v !== null && v.gt(th)) return i;
  }
  return null;
}

export interface MonitorOptions {
  /** The model is fitted on months 1 … trainTo. */
  trainTo: number;
  /** The alarm is raised when the rolling error is above `factor` × the baseline error. */
  factor: Num;
  /** The number of months in the rolling error. */
  window: number;
  /** After an alarm: the new version is fitted on this many months, the last one being the alarm month. */
  retrainWindow: number;
}

export interface MonitorRun {
  v1: Model;
  /** The v1 error on its own training months. */
  baseline: Decimal;
  threshold: Decimal;
  /** v1's absolute error for months trainTo+1 … end (index 0 is month trainTo+1). */
  errors: Decimal[];
  rolling: (Decimal | null)[];
  /** The month in which the alarm is raised (the first month the rolling error is above the threshold), or null. */
  alarmMonth: number | null;
  /** alarmMonth − changeAt: how many months after the change the alarm came (negative: a false alarm). */
  delay: number | null;
  /** v2 is fitted on the retrainWindow months up to the alarm month. */
  v2: Model | null;
  /** From the month after the alarm to the end: v1's mean error and v2's. */
  v1After: Decimal | null;
  v2After: Decimal | null;
  /** v1's mean error on the healthy months between the end of training and the change. */
  v1Healthy: Decimal | null;
}

export function monitorRun(series: Point[], changeAt: number, opts: MonitorOptions): MonitorRun {
  const train = series.filter((p) => p.t <= opts.trainTo);
  const v1 = fitSpread(train);
  const baseline = mae(absErrors(v1, train));
  const threshold = baseline.mul(opts.factor);
  const later = series.filter((p) => p.t > opts.trainTo);
  const errors = absErrors(v1, later);
  const rolling = rollingMae(errors, opts.window);
  const idx = firstAlarm(rolling, threshold, 0);
  const alarmMonth = idx === null ? null : opts.trainTo + 1 + idx;
  let v2: Model | null = null;
  let v1After: Decimal | null = null;
  let v2After: Decimal | null = null;
  if (alarmMonth !== null) {
    const from = Math.max(1, alarmMonth - opts.retrainWindow + 1);
    v2 = fitSpread(series.filter((p) => p.t >= from && p.t <= alarmMonth));
    const after = series.filter((p) => p.t > alarmMonth);
    if (after.length > 0) {
      v1After = mae(absErrors(v1, after));
      v2After = mae(absErrors(v2, after));
    }
  }
  const healthy = later.filter((p) => p.t < changeAt);
  return {
    v1,
    baseline,
    threshold,
    errors,
    rolling,
    alarmMonth,
    delay: alarmMonth === null ? null : alarmMonth - changeAt,
    v2,
    v1After,
    v2After,
    v1Healthy: healthy.length ? mae(absErrors(v1, healthy)) : null,
  };
}

/** The defaults of lesson 8.24. */
export const DEFAULT_MONITOR: MonitorOptions = { trainTo: 24, factor: 3, window: 6, retrainWindow: 6 };

/** How often the software's choice equals the advisor's: pairs of [advisor, software]. */
export function agreement(pairs: [string, string][]): { agree: number; total: number; ratePercent: string } {
  if (pairs.length === 0) throw new RangeError("no cases");
  const agree = pairs.filter(([a, s]) => a === s).length;
  return { agree, total: pairs.length, ratePercent: new D(agree).div(pairs.length).mul(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed() };
}

/** Whole days from `occurred` to `recorded` (ISO dates "2026-03-02"): the capture lag. */
export function captureLagDays(occurred: string, recorded: string): number {
  const ms = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return Date.UTC(y, m - 1, day);
  };
  return Math.round((ms(recorded) - ms(occurred)) / 86400000);
}
