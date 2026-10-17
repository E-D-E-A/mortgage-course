/**
 * Estimating from data, with an honest interval — lesson 8.18. GENERAL STATISTICS ("כללי"), built on stats.ts.
 * Nothing here is a Mogi model: the data the lessons feed in is SYNTHETIC (pricingmodel.ts's seeded offers), and a
 * prior is an assumption, "זו הנחה, לא עובדה".
 *
 * ── What it teaches, in order ──────────────────────────────────────────────
 *  1. An estimate is a number computed from a sample; another sample gives another number. The size of that
 *     wobble is the standard error: sd ÷ √n for a mean. It shrinks as the data grows, but only like √n.
 *  2. A 95% interval = estimate ± t × standard error, t from the t table below (it is larger with little data:
 *     with 3 observations t is 4.303, with 30 it is 2.042, at the limit 1.960). "95%" is a statement about the
 *     METHOD over many samples, valid if the data is a fair random sample with the usual bell-shaped noise; the
 *     course says so and does not prove it.
 *  3. A step in the margin = the average margin above a threshold minus the average below it. Its interval uses
 *     the unpooled standard error  √(s₁²/n₁ + s₂²/n₂)  and t with min(n₁, n₂) − 1 degrees of freedom (a cautious
 *     choice: it never gives a narrower interval than the textbook's more exact one).
 *  4. A straight line fitted to data that really has a STEP fits badly: stats.ts' least squares line against the
 *     step model, compared by the mean absolute error.
 *  5. A PRIOR that updates: before any data, a starting belief about the number (mean μ₀, spread τ₀); the data (n
 *     observations, average x̄, spread s) pull it. With the normal-normal rule the posterior mean is the average of
 *     μ₀ and x̄ weighted by their precisions (1/τ₀² and n/s²): priorWeight = (1/τ₀²) ÷ (1/τ₀² + n/s²). With n = 0
 *     the prior stays; with a lot of data the data wins. The data spread s is taken as known (the sample's), an
 *     approximation the lesson names.
 *
 * ── The API (all results are strings at four decimals, half up) ────────────
 *   T95, tCritical(df)           the 95% two-sided t values for df 1…10, 15, 20, 30, 60, 120, ∞; a df between two
 *                                listed values uses the LOWER listed one (cautious: a wider interval)
 *   meanInterval(values)         {n, mean, sd (sample), se, t, low, high}
 *   stepEstimate(below, above)   {nBelow, nAbove, meanBelow, meanAbove, step, se, df, t, low, high}
 *   slopeInterval(points)        {n, slope, intercept, se, t, low, high} (df = n − 2)
 *   lineVersusStep(offers, thr)  mean absolute error of the least-squares line of margin on ltv, and of the
 *                                two-level step model (a mean below and a mean above `thr`)
 *   updateNormal(prior, n, dataMean, dataSd)   {priorWeight, mean, sd}
 *   shrinkTable(prior, dataMean, dataSd, ns)   the posterior for each n in `ns`
 *   intervalWidth(sd, n)         the full width of the 95% interval for a mean: 2 × t × sd ÷ √n
 *   stepFromOffers(offers, thr, prior)   the lesson's whole chain on a list of offers {ltv, margin}: the groups at or below and above
 *                                `thr`, the step estimate and its interval (null when a group has fewer than two offers: there is
 *                                no data about the step), and the posterior of the prior after the data. The data enters the
 *                                update as ONE observation whose spread is the estimate's standard error (both at four decimals,
 *                                as shown): the prior's weight is (1/τ²) ÷ (1/τ² + 1/se²).
 * Recomputed independently in checks/kinds/estimate.py.
 */
import Decimal from "decimal.js";
import { errors, linearFit, mean, predict, sampleStd } from "./stats.ts";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type Numeric = Decimal.Value;

const four = (v: Numeric) => {
  const r = new D(v).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
  return r.isZero() ? "0.0000" : r.toFixed(4);
};

/** [df, t] for the 95% two-sided interval; the last row is the limit (the normal curve's 1.960). */
export const T95: [number, string][] = [
  [1, "12.706"], [2, "4.303"], [3, "3.182"], [4, "2.776"], [5, "2.571"], [6, "2.447"], [7, "2.365"], [8, "2.306"], [9, "2.262"], [10, "2.228"],
  [15, "2.131"], [20, "2.086"], [30, "2.042"], [60, "2.000"], [120, "1.980"], [Number.POSITIVE_INFINITY, "1.960"],
];

export function tCritical(df: number): string {
  if (!Number.isInteger(df) || df < 1) throw new RangeError("degrees of freedom: a whole number from 1");
  let t = T95[0][1];
  for (const [d, v] of T95) if (d <= df) t = v;
  return t;
}

export interface MeanInterval {
  n: number;
  mean: string;
  sd: string;
  se: string;
  t: string;
  low: string;
  high: string;
}

export function meanInterval(values: Numeric[]): MeanInterval {
  if (values.length < 2) throw new RangeError("an interval needs at least two observations");
  const n = values.length;
  const m = mean(values);
  const sd = sampleStd(values);
  const se = sd.div(new D(n).sqrt());
  const t = tCritical(n - 1);
  return { n, mean: four(m), sd: four(sd), se: four(se), t, low: four(m.minus(se.mul(t))), high: four(m.plus(se.mul(t))) };
}

export interface StepEstimate {
  nBelow: number;
  nAbove: number;
  meanBelow: string;
  meanAbove: string;
  step: string;
  se: string;
  df: number;
  t: string;
  low: string;
  high: string;
}

export function stepEstimate(below: Numeric[], above: Numeric[]): StepEstimate {
  if (below.length < 2 || above.length < 2) throw new RangeError("each group needs at least two observations");
  const mb = mean(below);
  const ma = mean(above);
  const vb = sampleStd(below).pow(2);
  const va = sampleStd(above).pow(2);
  const se = vb.div(below.length).plus(va.div(above.length)).sqrt();
  const df = Math.min(below.length, above.length) - 1;
  const t = tCritical(df);
  const step = ma.minus(mb);
  return { nBelow: below.length, nAbove: above.length, meanBelow: four(mb), meanAbove: four(ma), step: four(step), se: four(se), df, t, low: four(step.minus(se.mul(t))), high: four(step.plus(se.mul(t))) };
}

export interface SlopeInterval {
  n: number;
  slope: string;
  intercept: string;
  se: string;
  t: string;
  low: string;
  high: string;
}

export function slopeInterval(points: { x: Numeric; y: Numeric }[]): SlopeInterval {
  if (points.length < 3) throw new RangeError("a slope interval needs at least three points");
  const line = linearFit(points);
  const n = points.length;
  const mx = mean(points.map((p) => p.x));
  const sxx = points.reduce<Decimal>((s, p) => s.plus(new D(p.x).minus(mx).pow(2)), new D(0));
  const sse = errors(points, line).sse;
  const se = sse.div(n - 2).div(sxx).sqrt();
  const t = tCritical(n - 2);
  return { n, slope: four(line.a), intercept: four(line.b), se: four(se), t, low: four(line.a.minus(se.mul(t))), high: four(line.a.plus(se.mul(t))) };
}

/** Offers are {ltv, margin}. The step model: the mean margin at or below `thr`, and the mean above it. */
export function lineVersusStep(offers: { ltv: Numeric; margin: Numeric }[], thr: Numeric): { lineMae: string; stepMae: string } {
  const pts = offers.map((o) => ({ x: o.ltv, y: o.margin }));
  const line = linearFit(pts);
  const lo = offers.filter((o) => new D(o.ltv).lte(thr));
  const hi = offers.filter((o) => new D(o.ltv).gt(thr));
  const mlo = mean(lo.map((o) => o.margin));
  const mhi = mean(hi.map((o) => o.margin));
  const stepErr = offers.reduce<Decimal>((s, o) => s.plus(new D(o.margin).minus(new D(o.ltv).lte(thr) ? mlo : mhi).abs()), new D(0)).div(offers.length);
  void predict;
  return { lineMae: four(errors(pts, line).mae), stepMae: four(stepErr) };
}

export interface Prior {
  mean: Numeric;
  sd: Numeric;
}

export interface Posterior {
  n: number;
  /** The share of the answer that still comes from the prior, 0–1. */
  priorWeight: string;
  mean: string;
  sd: string;
}

export function updateNormal(prior: Prior, n: number, dataMean: Numeric, dataSd: Numeric): Posterior {
  const pPrec = new D(1).div(new D(prior.sd).pow(2));
  if (n === 0) return { n, priorWeight: "1.0000", mean: four(prior.mean), sd: four(prior.sd) };
  const dPrec = new D(n).div(new D(dataSd).pow(2));
  const total = pPrec.plus(dPrec);
  const m = pPrec.mul(prior.mean).plus(dPrec.mul(dataMean)).div(total);
  return { n, priorWeight: four(pPrec.div(total)), mean: four(m), sd: four(new D(1).div(total).sqrt()) };
}

export function shrinkTable(prior: Prior, dataMean: Numeric, dataSd: Numeric, ns: number[]): Posterior[] {
  return ns.map((n) => updateNormal(prior, n, dataMean, dataSd));
}

export function intervalWidth(sd: Numeric, n: number): string {
  return four(new D(2).mul(tCritical(n - 1)).mul(sd).div(new D(n).sqrt()));
}

export interface StepChain {
  nBelow: number;
  nAbove: number;
  estimate: StepEstimate | null;
  posterior: Posterior;
}

export function stepFromOffers(offers: { ltv: Numeric; margin: Numeric }[], thr: Numeric, prior: Prior): StepChain {
  const below = offers.filter((o) => new D(o.ltv).lte(thr)).map((o) => o.margin);
  const above = offers.filter((o) => new D(o.ltv).gt(thr)).map((o) => o.margin);
  if (below.length < 2 || above.length < 2) {
    return { nBelow: below.length, nAbove: above.length, estimate: null, posterior: updateNormal(prior, 0, 0, 1) };
  }
  const estimate = stepEstimate(below, above);
  return { nBelow: below.length, nAbove: above.length, estimate, posterior: updateNormal(prior, 1, estimate.step, estimate.se) };
}
