/**
 * The statistics of stage 8's first group (lessons 8.1–8.5): sums and means, a weighted mean, histogram bins,
 * variance and standard deviation, percentiles, the expectation of a discrete distribution, and the least-squares
 * line with its errors. Authors B, C and D import it (8.11 Monte Carlo, 8.18 estimation, 8.19 calibration, 8.23
 * error measures, 8.24 drift): add, don't rename.
 *
 * This is GENERAL MATHS ("ידע מתמטי כללי"). Nothing here is a Mogi decision or a bank's behaviour.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 *   sum(values)                     Σ x
 *   mean(values)                    Σ x ÷ n
 *   weightedMean(values, weights)   Σ x·w ÷ Σ w  (weights need not add to 1; they must not all be zero)
 *   sorted(values)                  a sorted copy, ascending
 *   median(values)                  the 50th percentile by the LINEAR method below (= the middle value for odd n,
 *                                   the mean of the two middle values for even n)
 *
 *   histogram(values, {start, width, count})
 *       Equal-width bins. Bin k (k = 0 … count−1) is [start + k·width, start + (k+1)·width): the lower edge is IN the
 *       bin, the upper edge is in the next bin — except the LAST bin, which also takes its upper edge. Values outside
 *       [start, start + count·width] are counted in `below` / `above`, never lost.
 *       Returns {bins: {lo, hi, count}[], below, above}.
 *
 *   variance(values)                POPULATION variance: Σ (x − mean)² ÷ n   (what the course calls "שונות" / spread squared)
 *   sampleVariance(values)          Σ (x − mean)² ÷ (n − 1)   (the spreadsheet's VAR.S; the course names it, does not teach why)
 *   std(values)                     √ variance(values)   (the spreadsheet's STDEV.P)
 *   sampleStd(values)               √ sampleVariance(values)   (STDEV.S)
 *
 *   percentile(values, p)           THE COURSE'S METHOD — linear interpolation between the closest ranks, the method of the
 *                                   spreadsheet's PERCENTILE.INC. Sort the n values; the position is 1 + (n − 1)·p/100
 *                                   (1 = the smallest, n = the largest); if the position is a whole number k, the answer is
 *                                   the k-th value; otherwise it lies between the k-th and the (k+1)-th: answer = x_k +
 *                                   (position − k) · (x_{k+1} − x_k). p is a percent from 0 to 100.
 *   percentilePosition(n, p)        1 + (n − 1)·p/100, exact
 *   percentileNearestRank(values,p) The "nearest rank" method, named only to say that it differs: the value at rank
 *                                   ceil(p/100 · n) (rank 1 at least). A spreadsheet does NOT give this. Not used in the lessons'
 *                                   numbers except where a lesson says so out loud.
 *
 *   Outcomes of a discrete distribution are {value, count}: how many equally likely cases give that value (a fair die:
 *   six outcomes with count 1; the sum of two dice: 2…12 with counts 1,2,3,4,5,6,5,4,3,2,1). Counts, not probabilities, so
 *   that nothing like 1/6 has to be stored in decimals; the probability of an outcome is count ÷ Σ counts.
 *   distribution(outcomes)          [{value, count, probability}] with probability an exact Decimal in [0, 1]
 *   expectation(outcomes)           Σ value·count ÷ Σ count   (the expected value, תוחלת)
 *   distributionVariance(outcomes)  Σ count·(value − E)² ÷ Σ count
 *   distributionStd(outcomes)       √ of that
 *   probabilityBetween(outcomes, from, to)   the probability that the value is from … to, both ends INCLUDED, as a Decimal in [0, 1]
 *
 *   linearFit(points)               the least-squares line y = a·x + b through {x, y} points:
 *                                     a = Σ (x − x̄)(y − ȳ) ÷ Σ (x − x̄)²      b = ȳ − a·x̄
 *                                   Needs at least 2 points and not all x equal.
 *   predict(line, x)                a·x + b
 *   residuals(points, line)         y − (a·x + b) for each point (positive: the point is above the line)
 *   errors(points, line)            {mae, rmse, sse, n}: mean absolute error  Σ|e| ÷ n,  root mean squared error √(Σ e² ÷ n),
 *                                   sum of squared errors Σ e²
 *   formatPlain(value, decimals)    a number rounded half-up to `decimals` places, trailing zeros removed: "35.8", "3". The
 *                                   same convention as the other modules' facts; the Python check has its own copy.
 *
 * All arithmetic is decimal.js with 40 digits, rounding half up; nothing is rounded inside a calculation, only by
 * formatPlain / toDecimalPlaces at display. A square root is decimal.js's `sqrt` at 40 digits. Recomputed independently
 * in checks/kinds/stats.py (Python Decimal, no import from src/).
 */
import Decimal from "decimal.js";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type Numeric = Decimal.Value;

const ZERO = new D(0);

function nonEmpty(values: readonly unknown[], what = "values"): void {
  if (values.length === 0) throw new RangeError(`${what}: at least one value is needed`);
}

export function sum(values: readonly Numeric[]): Decimal {
  return values.reduce<Decimal>((s, v) => s.plus(v), ZERO);
}

export function mean(values: readonly Numeric[]): Decimal {
  nonEmpty(values);
  return sum(values).div(values.length);
}

export function weightedMean(values: readonly Numeric[], weights: readonly Numeric[]): Decimal {
  nonEmpty(values);
  if (values.length !== weights.length) throw new RangeError("one weight per value");
  const w = sum(weights);
  if (weights.some((x) => new D(x).isNeg())) throw new RangeError("a weight cannot be negative");
  if (w.isZero()) throw new RangeError("the weights cannot all be zero");
  return values.reduce<Decimal>((s, v, k) => s.plus(new D(v).mul(weights[k])), ZERO).div(w);
}

export function sorted(values: readonly Numeric[]): Decimal[] {
  return values.map((v) => new D(v)).sort((a, b) => a.cmp(b));
}

// ── Histogram ──────────────────────────────────────────────────────────────

export interface BinSpec {
  start: Numeric;
  width: Numeric;
  count: number;
}

export interface Bin {
  lo: Decimal;
  hi: Decimal;
  count: number;
}

export interface Histogram {
  bins: Bin[];
  below: number;
  above: number;
}

export function histogram(values: readonly Numeric[], spec: BinSpec): Histogram {
  const width = new D(spec.width);
  if (width.lte(0)) throw new RangeError("a bin must have a width above zero");
  if (!Number.isInteger(spec.count) || spec.count < 1) throw new RangeError("at least one bin");
  const start = new D(spec.start);
  const end = start.plus(width.mul(spec.count));
  const bins: Bin[] = Array.from({ length: spec.count }, (_, k) => ({ lo: start.plus(width.mul(k)), hi: start.plus(width.mul(k + 1)), count: 0 }));
  let below = 0;
  let above = 0;
  for (const raw of values) {
    const v = new D(raw);
    if (v.lt(start)) below++;
    else if (v.gt(end)) above++;
    else {
      // The bin index is floor((v − start) ÷ width); the top edge belongs to the last bin.
      const k = Math.min(v.minus(start).div(width).floor().toNumber(), spec.count - 1);
      bins[k].count++;
    }
  }
  return { bins, below, above };
}

// ── Spread ─────────────────────────────────────────────────────────────────

function squaredDeviations(values: readonly Numeric[]): Decimal {
  const m = mean(values);
  return values.reduce<Decimal>((s, v) => s.plus(new D(v).minus(m).pow(2)), ZERO);
}

export function variance(values: readonly Numeric[]): Decimal {
  nonEmpty(values);
  return squaredDeviations(values).div(values.length);
}

export function sampleVariance(values: readonly Numeric[]): Decimal {
  if (values.length < 2) throw new RangeError("the sample variance needs at least two values");
  return squaredDeviations(values).div(values.length - 1);
}

export const std = (values: readonly Numeric[]): Decimal => variance(values).sqrt();
export const sampleStd = (values: readonly Numeric[]): Decimal => sampleVariance(values).sqrt();

// ── Percentiles ────────────────────────────────────────────────────────────

function checkPercent(p: Numeric): Decimal {
  const x = new D(p);
  if (x.lt(0) || x.gt(100)) throw new RangeError(`a percentile is from 0 to 100, got ${x.toString()}`);
  return x;
}

/** 1 + (n − 1)·p/100: where in the sorted list (counting from 1) the p-th percentile sits. Exact. */
export function percentilePosition(n: number, p: Numeric): Decimal {
  if (!Number.isInteger(n) || n < 1) throw new RangeError("n is a count of at least 1");
  return new D(n - 1).mul(checkPercent(p)).div(100).plus(1);
}

export function percentile(values: readonly Numeric[], p: Numeric): Decimal {
  nonEmpty(values);
  const xs = sorted(values);
  const pos = percentilePosition(xs.length, p);
  const k = pos.floor().toNumber();
  const frac = pos.minus(k);
  if (frac.isZero() || k >= xs.length) return xs[k - 1];
  return xs[k - 1].plus(frac.mul(xs[k].minus(xs[k - 1])));
}

export const median = (values: readonly Numeric[]): Decimal => percentile(values, 50);

export function percentileNearestRank(values: readonly Numeric[], p: Numeric): Decimal {
  nonEmpty(values);
  const xs = sorted(values);
  const rank = Math.max(1, new D(xs.length).mul(checkPercent(p)).div(100).ceil().toNumber());
  return xs[rank - 1];
}

// ── A discrete distribution ────────────────────────────────────────────────

export interface Outcome {
  value: Numeric;
  /** How many equally likely cases give this value. */
  count: number;
}

export interface OutcomeRow {
  value: Decimal;
  count: number;
  /** count ÷ Σ counts, exact. */
  probability: Decimal;
}

function totalCount(outcomes: readonly Outcome[]): number {
  nonEmpty(outcomes, "outcomes");
  let total = 0;
  for (const o of outcomes) {
    if (!Number.isInteger(o.count) || o.count < 0) throw new RangeError("a count is a whole number from 0");
    total += o.count;
  }
  if (total === 0) throw new RangeError("the counts cannot all be zero");
  return total;
}

export function distribution(outcomes: readonly Outcome[]): OutcomeRow[] {
  const total = totalCount(outcomes);
  return outcomes.map((o) => ({ value: new D(o.value), count: o.count, probability: new D(o.count).div(total) }));
}

export function expectation(outcomes: readonly Outcome[]): Decimal {
  const total = totalCount(outcomes);
  return outcomes.reduce<Decimal>((s, o) => s.plus(new D(o.value).mul(o.count)), ZERO).div(total);
}

export function distributionVariance(outcomes: readonly Outcome[]): Decimal {
  const total = totalCount(outcomes);
  const e = expectation(outcomes);
  return outcomes.reduce<Decimal>((s, o) => s.plus(new D(o.value).minus(e).pow(2).mul(o.count)), ZERO).div(total);
}

export const distributionStd = (outcomes: readonly Outcome[]): Decimal => distributionVariance(outcomes).sqrt();

/** The probability that the value is from `from` to `to`, both ends included. */
export function probabilityBetween(outcomes: readonly Outcome[], from: Numeric, to: Numeric): Decimal {
  const total = totalCount(outcomes);
  const lo = new D(from);
  const hi = new D(to);
  const hit = outcomes.filter((o) => new D(o.value).gte(lo) && new D(o.value).lte(hi)).reduce((s, o) => s + o.count, 0);
  return new D(hit).div(total);
}

// ── The least-squares line ─────────────────────────────────────────────────

export interface Point {
  x: Numeric;
  y: Numeric;
}

export interface Line {
  /** The slope: how much y changes when x grows by 1. */
  a: Decimal;
  /** The intercept: y where x is 0. */
  b: Decimal;
}

export function linearFit(points: readonly Point[]): Line {
  if (points.length < 2) throw new RangeError("a line needs at least two points");
  const mx = mean(points.map((p) => p.x));
  const my = mean(points.map((p) => p.y));
  let sxy = ZERO;
  let sxx = ZERO;
  for (const p of points) {
    const dx = new D(p.x).minus(mx);
    sxy = sxy.plus(dx.mul(new D(p.y).minus(my)));
    sxx = sxx.plus(dx.pow(2));
  }
  if (sxx.isZero()) throw new RangeError("all x are the same: no line has a slope");
  const a = sxy.div(sxx);
  return { a, b: my.minus(a.mul(mx)) };
}

export function predict(line: { a: Numeric; b: Numeric }, x: Numeric): Decimal {
  return new D(line.a).mul(x).plus(line.b);
}

export function residuals(points: readonly Point[], line: { a: Numeric; b: Numeric }): Decimal[] {
  return points.map((p) => new D(p.y).minus(predict(line, p.x)));
}

export interface LineErrors {
  n: number;
  mae: Decimal;
  rmse: Decimal;
  sse: Decimal;
}

export function errors(points: readonly Point[], line: { a: Numeric; b: Numeric }): LineErrors {
  nonEmpty(points, "points");
  const e = residuals(points, line);
  const sse = e.reduce<Decimal>((s, x) => s.plus(x.pow(2)), ZERO);
  return { n: e.length, mae: e.reduce<Decimal>((s, x) => s.plus(x.abs()), ZERO).div(e.length), rmse: sse.div(e.length).sqrt(), sse };
}

// ── Display ────────────────────────────────────────────────────────────────

/** Rounded half up to `decimals` places, trailing zeros and a bare point removed: "35.8", "3", "0.5". */
export function formatPlain(value: Numeric, decimals: number): string {
  const s = new D(value).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toFixed(decimals);
  const t = s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
  return t === "-0" || t === "" ? "0" : t;
}
