/**
 * Splits — the arithmetic behind lesson 8.23 (training and testing: labels, out-of-sample error,
 * the time split, the error measures) and, for the claim test, lesson 8.25. Stage 8, author D. ALL
 * SYNTHETIC AND ILLUSTRATIVE: the series is drift.ts's (an invented bank, an invented month-37
 * jump in its spread); nothing here is a Mogi decision or a bank's behaviour. The maths is general
 * knowledge.
 *
 * ── The idea in code ──────────────────────────────────────────────────────
 * A model is judged on cases it has NOT seen. Which cases it has not seen is a choice, and the choice
 * can flatter it:
 *   random split   some months chosen at random are held out; the rest are used for fitting. The held-out
 *                  months have neighbours in time among the training months (the leak of information
 *                  from the future into the past).
 *   time split     the first months are used for fitting and the LAST months are held out: the test
 *                  looks like the real use, where a model meets months that come after its training.
 *
 * Two models, both deliberately simple:
 *   spread   drift.ts's fitSpread: the offer is the anchor plus one fixed spread (mean of y − x).
 *   memory   "the offer of the closest month in the training set" (k = 1; k nearest in general,
 *            averaged). A month's closest training month is itself when it is in the training set, so
 *            its error on its own training months is exactly 0: training error says nothing. Ties in
 *            distance go to the EARLIER month. The memory model ignores x on purpose: it stands for
 *            any flexible model that can find "a neighbour in time" through features that move
 *            slowly with time.
 *
 * ── The API ───────────────────────────────────────────────────────────────
 *   shuffle(n, seed) → number[]               a permutation of 0 … n−1: Fisher–Yates, i from n−1 down to 1,
 *                                             j = u mod (i + 1) with u from drift.ts's Lcg(seed)
 *   randomSplit(n, testCount, seed)           test = the first testCount entries of the permutation,
 *                                             train = the rest; both sorted → {train, test} (0-based)
 *   timeSplit(n, trainCount)                  train = 0 … trainCount−1, test = the rest
 *   memoryPredict(train, t, k)                the mean of y over the k closest training months to t
 *   evaluate(series, split, k)                {spread: {train, test}, memory: {train, test}} — the
 *                                             mean absolute error (MAE) of each model on each part —
 *                                             plus rmse and bias (mean of prediction − truth) on test
 *   errorMeasures(errors)                     MAE, RMSE (square root of the mean of squares) and bias
 *                                             from signed errors (prediction − truth)
 *   groupCompare(a, b)                        mean, spread (population standard deviation) and size of
 *                                             two groups of numbers and the difference of the means
 *                                             (lesson 8.25: testing a field claim on data)
 *
 * The sizes of the split (60 months, 18 held out) are an illustration, not a recommendation.
 */
import Decimal from "decimal.js";
import { absErrors, fitSpread, Lcg, meanOf, type Point, predict, r4 } from "./drift.ts";

const D = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
type Num = Decimal.Value;

export interface Split {
  /** 0-based indices into the series, ascending. */
  train: number[];
  test: number[];
}

export function shuffle(n: number, seed: number): number[] {
  const rng = new Lcg(seed);
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i >= 1; i--) {
    const j = rng.next() % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randomSplit(n: number, testCount: number, seed: number): Split {
  const p = shuffle(n, seed);
  const test = p.slice(0, testCount).sort((x, y) => x - y);
  const train = p.slice(testCount).sort((x, y) => x - y);
  return { train, test };
}

export function timeSplit(n: number, trainCount: number): Split {
  return {
    train: Array.from({ length: trainCount }, (_, i) => i),
    test: Array.from({ length: n - trainCount }, (_, i) => trainCount + i),
  };
}

/** The mean of y over the k training points closest in time to month t (ties: the earlier month). */
export function memoryPredict(train: Point[], t: number, k = 1): Decimal {
  const near = [...train].sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t) || a.t - b.t).slice(0, k);
  return meanOf(near.map((p) => p.y));
}

export interface ErrorMeasures {
  mae: Decimal;
  rmse: Decimal;
  bias: Decimal;
}

/** Signed errors (prediction − truth) → MAE, RMSE and bias. */
export function errorMeasures(signed: Num[]): ErrorMeasures {
  const n = signed.length;
  if (n === 0) throw new RangeError("no errors");
  const abs = signed.map((e) => new D(e).abs());
  const sq = signed.map((e) => new D(e).mul(e));
  return { mae: meanOf(abs), rmse: meanOf(sq).sqrt(), bias: meanOf(signed) };
}

export interface PartScores {
  mae: Decimal;
  rmse: Decimal;
  bias: Decimal;
}

export interface Evaluation {
  spread: { train: PartScores; test: PartScores };
  memory: { train: PartScores; test: PartScores };
}

export function evaluate(series: Point[], split: Split, k = 1): Evaluation {
  const train = split.train.map((i) => series[i]);
  const test = split.test.map((i) => series[i]);
  const model = fitSpread(train);
  const spreadSigned = (pts: Point[]) => pts.map((p) => predict(model, p.x).minus(p.y));
  const memSigned = (pts: Point[]) => pts.map((p) => memoryPredict(train, p.t, k).minus(p.y));
  return {
    spread: { train: errorMeasures(spreadSigned(train)), test: errorMeasures(spreadSigned(test)) },
    memory: { train: errorMeasures(memSigned(train)), test: errorMeasures(memSigned(test)) },
  };
}

export interface GroupSummary {
  n: number;
  mean: Decimal;
  /** Population standard deviation: the square root of the mean squared distance from the mean. */
  sd: Decimal;
}

export function summarize(values: Num[]): GroupSummary {
  const mean = meanOf(values);
  const sd = meanOf(values.map((v) => new D(v).minus(mean).pow(2))).sqrt();
  return { n: values.length, mean, sd };
}

export function groupCompare(a: Num[], b: Num[]): { a: GroupSummary; b: GroupSummary; diff: Decimal } {
  const sa = summarize(a);
  const sb = summarize(b);
  return { a: sa, b: sb, diff: sa.mean.minus(sb.mean) };
}

export { absErrors, r4 };
