/**
 * Calibration — is "70%" really 7 times out of 10? Lesson 8.19.
 *
 * A model that outputs a probability of approval (a number between 0 and 1) is
 * calibrated when, among all the cases it gave about 0.7, about 7 in 10 really
 * happened. This module builds the check: cut the predictions into bins by
 * their predicted value, and in each bin compare the average prediction with
 * the share of cases that happened (the observed rate). The table of those
 * rows is a reliability table; the lesson's curve draws it.
 *
 * General maths and machine-learning knowledge (source "כללי"). Nothing here is
 * a Mogi model: Mogi has no approvals data yet, so every prediction and outcome
 * the lessons feed in is synthetic (made by a seeded generator).
 *
 *   logistic(z)               1 ÷ (1 + e^−z): turns any number into a probability
 *   reliabilityTable(...)     the bins: how many, average predicted, observed rate, gap
 *   brierScore(...)           the average of (predicted − outcome)², lower is better
 *   calibrationGap(...)       the average |gap|, weighted by the number in each bin (from the unrounded values)
 *   binCalibrator(...)        a map from bin to observed rate; applyCalibrator uses it
 *   recalibrate(...)          build the map on the first `trainN` cases and judge it on the rest: the gap and the Brier score
 *                             of the held-out cases before and after
 *
 * A prediction is a decimal string in [0, 1]; an outcome is 0 (did not happen)
 * or 1 (happened). Rates come out as decimal strings at four decimals, half up.
 * A bin is [lo, hi) except the last, which includes 1. A bin with nobody in it
 * has no average and no observed rate (null). Recomputed independently in
 * checks/kinds/calibration.py.
 */
import Decimal from "decimal.js";
import { makeRng } from "./montecarlo.ts";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);

export interface Scored {
  /** Predicted probability, 0–1. */
  p: string;
  /** 1 if it happened. */
  outcome: 0 | 1;
}

export interface Bin {
  lo: string;
  hi: string;
  /** How many predictions fell in the bin. */
  n: number;
  /** How many of them happened. */
  happened: number;
  /** The average predicted probability in the bin, four decimals; null when n = 0. */
  predicted: string | null;
  /** happened ÷ n, four decimals; null when n = 0. */
  observed: string | null;
  /** observed − predicted, four decimals (negative: the model promised more than happened); null when n = 0. */
  gap: string | null;
}

const four = (v: Numeric) => {
  const r = new D(v).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
  return r.isZero() ? "0.0000" : r.toFixed(4);
};

/** 1 ÷ (1 + e^−z), the S-shaped curve from any number to a probability. Six decimals. */
export function logistic(z: Numeric): string {
  const v = new D(1).div(new D(1).plus(new D(z).neg().exp()));
  return v.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toFixed(6);
}

/** Equal-width edges: edges(5) → 0, 0.2, 0.4, 0.6, 0.8, 1. */
export function equalEdges(bins: number): string[] {
  return Array.from({ length: bins + 1 }, (_, k) => new D(k).div(bins).toString());
}

interface Raw {
  lo: string;
  hi: string;
  n: number;
  happened: number;
  predicted: Decimal | null;
  observed: Decimal | null;
}

function rawBins(data: Scored[], edges: string[]): Raw[] {
  const rows: Raw[] = [];
  for (let k = 0; k + 1 < edges.length; k++) {
    const lo = new D(edges[k]);
    const hi = new D(edges[k + 1]);
    const last = k + 2 === edges.length;
    const inBin = data.filter((d) => {
      const p = new D(d.p);
      return p.gte(lo) && (last ? p.lte(hi) : p.lt(hi));
    });
    const n = inBin.length;
    const happened = inBin.reduce((s, d) => s + d.outcome, 0);
    rows.push({
      lo: edges[k],
      hi: edges[k + 1],
      n,
      happened,
      predicted: n === 0 ? null : inBin.reduce((s, d) => s.plus(d.p), ZERO).div(n),
      observed: n === 0 ? null : new D(happened).div(n),
    });
  }
  return rows;
}

export function reliabilityTable(data: Scored[], edges: string[]): Bin[] {
  return rawBins(data, edges).map((r) => ({
    lo: r.lo,
    hi: r.hi,
    n: r.n,
    happened: r.happened,
    predicted: r.predicted && four(r.predicted),
    observed: r.observed && four(r.observed),
    gap: r.predicted && r.observed ? four(r.observed.minus(r.predicted)) : null,
  }));
}

/** The average of (p − outcome)²: 0 is perfect, 0.25 is what saying "0.5" every time scores. Four decimals. */
export function brierScore(data: Scored[]): string {
  if (data.length === 0) throw new RangeError("no predictions");
  const sum = data.reduce((s, d) => s.plus(new D(d.p).minus(d.outcome).pow(2)), ZERO);
  return four(sum.div(data.length));
}

/** Σ n × |observed − predicted| ÷ Σ n over the bins that have anyone in them: how far off the table is, on average. Four decimals. */
export function calibrationGap(data: Scored[], edges: string[]): string {
  const used = rawBins(data, edges).filter((r) => r.n > 0);
  const total = used.reduce((s, r) => s + r.n, 0);
  if (total === 0) throw new RangeError("no predictions");
  const sum = used.reduce((s, r) => s.plus((r.observed as Decimal).minus(r.predicted as Decimal).abs().mul(r.n)), ZERO);
  return four(sum.div(total));
}

export interface Calibrator {
  edges: string[];
  /** The observed rate per bin, or null when the bin is too thin to trust (then the prediction stays as it was). */
  rates: (string | null)[];
}

/** Replace a prediction by the observed rate of its bin, but only for bins with at least `minPerBin` cases. */
export function binCalibrator(rows: Bin[], minPerBin: number): Calibrator {
  const edges = [rows[0].lo, ...rows.map((r) => r.hi)];
  return { edges, rates: rows.map((r) => (r.n >= minPerBin ? r.observed : null)) };
}

export function applyCalibrator(c: Calibrator, p: Numeric): string {
  const v = new D(p);
  for (let k = 0; k + 1 < c.edges.length; k++) {
    const last = k + 2 === c.edges.length;
    if (v.gte(c.edges[k]) && (last ? v.lte(c.edges[k + 1]) : v.lt(c.edges[k + 1]))) return c.rates[k] ?? four(v);
  }
  throw new RangeError(`prediction ${p} is outside 0..1`);
}

// ── Synthetic applicants (the data of lesson 8.19) ─────────────────────────
// Mogi has NO approvals data yet. The lessons therefore make up applicants with a seeded generator
// (montecarlo.ts makeRng): a financing ratio (30–75) and a payment ratio (20–50), whole numbers; a TRUE chance of
// approval  logistic(a + b·(40 − pti)/10 + c·(60 − ltv)/10); and a MODEL that is over-confident: it predicts
// logistic(k × that same number) with k above 1, so its 0.9 is really less. The outcome is drawn with the true
// chance. All parameters are invented, for illustration. Draw order per applicant: ltv, pti, outcome.
// The three draws are 32-bit numbers x; a whole number from 0 to n−1 is floor(x·n ÷ 2^32); the outcome is 1 when
// x < truth × 2^32. Recomputed independently in checks/kinds/calibration.py (the Python copy of the generator is
// checks/kinds/rng.py).

export interface ApprovalParams {
  a: string;
  b: string;
  c: string;
  /** Over-confidence: the model's score is k times the true score. */
  k: string;
}

export const DEMO_APPROVAL: ApprovalParams = { a: "0.4", b: "0.5", c: "0.3", k: "1.6" };

export interface Applicant {
  ltv: number;
  pti: number;
  /** The true chance of approval (six decimals). */
  truth: string;
  /** The model's predicted probability (six decimals). */
  p: string;
  outcome: 0 | 1;
}

export function syntheticApplicants(seed: number, n: number, params: ApprovalParams = DEMO_APPROVAL): Applicant[] {
  const next = makeRng(seed);
  const whole = (m: number) => Math.floor((next() * m) / 4294967296);
  const out: Applicant[] = [];
  for (let i = 0; i < n; i++) {
    const ltv = 30 + whole(46);
    const pti = 20 + whole(31);
    const x = next();
    const z = new D(params.a).plus(new D(params.b).mul(40 - pti).div(10)).plus(new D(params.c).mul(60 - ltv).div(10));
    const truth = logistic(z);
    out.push({ ltv, pti, truth, p: logistic(z.mul(params.k)), outcome: new D(x).lt(new D(truth).mul(4294967296)) ? 1 : 0 });
  }
  return out;
}

export const toScored = (a: Applicant[]): Scored[] => a.map((x) => ({ p: x.p, outcome: x.outcome }));

export interface Recalibration {
  trained: number;
  tested: number;
  before: { gap: string; brier: string };
  after: { gap: string; brier: string };
  /** The held-out cases' reliability tables, before and after. */
  tableBefore: Bin[];
  tableAfter: Bin[];
}

/** Learn the bin map from the first `trainN` cases (bins with fewer than `minPerBin` stay as they were) and judge it on the others. */
export function recalibrate(data: Scored[], trainN: number, edges: string[], minPerBin: number): Recalibration {
  if (trainN < 1 || trainN >= data.length) throw new RangeError("train on some cases and test on others");
  const train = data.slice(0, trainN);
  const test = data.slice(trainN);
  const map = binCalibrator(reliabilityTable(train, edges), minPerBin);
  const fixed: Scored[] = test.map((d) => ({ p: applyCalibrator(map, d.p), outcome: d.outcome }));
  return {
    trained: train.length,
    tested: test.length,
    before: { gap: calibrationGap(test, edges), brier: brierScore(test) },
    after: { gap: calibrationGap(fixed, edges), brier: brierScore(fixed) },
    tableBefore: reliabilityTable(test, edges),
    tableAfter: reliabilityTable(fixed, edges),
  };
}
