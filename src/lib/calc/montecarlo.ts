/**
 * Monte Carlo from zero — lessons 8.11 ("a thousand futures") and 8.12 (when a probability may be attached).
 *
 * LABEL: general method (maths); the FUTURE MODEL below (steps of prime, inflation draws and their weights)
 * is an invented ASSUMPTION "for illustration": a simulation turns assumptions about a distribution into
 * numbers, it does not make the assumptions true ("זו הנחה, לא עובדה"). Mogi today has no such code.
 *
 * Randomness: ONLY the seeded generator below (mulberry32, 32-bit integers). No Math.random, so a seed
 * gives the same futures in TypeScript and in the Python check (checks/kinds/montecarlo.py), bit for bit.
 *
 * ── The API ────────────────────────────────────────────────────────────────
 *   makeRng(seed)                    () => uint32 (0 .. 2^32-1); the sequence for a seed is fixed
 *   unit(x)                          x / 2^32 as an exact Decimal in [0, 1)
 *   drawDiscrete(outcomes, x)        outcomes = [{value, weight}] (whole weights): the first outcome whose
 *                                    cumulative weight is above x/2^32 of the total. Integer arithmetic.
 *   FutureModel / DEFAULT_MODEL      {years, primeSteps, inflation, scale, minShift}: each year after the
 *                                    first, prime moves by a drawn step (points) times `scale`, never below
 *                                    `minShift` in total; each year's inflation is drawn. Anchors of variable
 *                                    tracks follow prime's cumulative move (assumption).
 *                                    Draw order, per future, per year y = 1..years: one draw for the prime step,
 *                                    one for inflation (always both, even if a mix has no linked track).
 *   futures(seed, n, model)          n futures, each a schedule.ts Scenario (statement rounding, 12-month blocks)
 *   simulate(tracks, seed, n, model) the engine's first / max / total for each future
 *   atLeast(values, threshold)       {count, n, p, se}: how many futures reach the threshold, the share p =
 *                                    count / n, and the simulation's OWN error se = sqrt(p (1 - p) / n)
 *   summary(values)                  mean, 5th / 50th / 95th percentile (stats.ts, the LINEAR method), min, max
 * Exports are stable. Recomputed independently in checks/kinds/montecarlo.py (kinds mc_*).
 */
import Decimal from "decimal.js";
import { evaluate } from "./engine.ts";
import type { Scenario, TrackSpec } from "./schedule.ts";
import { mean, percentile } from "./stats.ts";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const TWO32 = 4294967296;

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}

export const unit = (x: number): Decimal => new D(x).div(TWO32);

export interface DiscreteOutcome {
  value: string;
  weight: number;
}

export function drawDiscrete(outcomes: DiscreteOutcome[], x: number): string {
  const total = outcomes.reduce((s, o) => s + o.weight, 0);
  let cum = 0;
  for (const o of outcomes) {
    cum += o.weight;
    if (x * total < cum * TWO32) return o.value;
  }
  return outcomes[outcomes.length - 1].value;
}

export interface FutureModel {
  years: number;
  /** Prime's yearly move, in percentage points. */
  primeSteps: DiscreteOutcome[];
  /** A year's inflation, percent. */
  inflation: DiscreteOutcome[];
  /** Multiplies every prime step (a calmer or a wilder world). */
  scale: number;
  /** The lowest total move of prime from today's, in points. */
  minShift: string;
}

export const DEFAULT_MODEL: FutureModel = {
  years: 20,
  primeSteps: [
    { value: "-0.50", weight: 10 },
    { value: "-0.25", weight: 20 },
    { value: "0", weight: 40 },
    { value: "0.25", weight: 20 },
    { value: "0.50", weight: 10 },
  ],
  inflation: [
    { value: "1", weight: 15 },
    { value: "1.5", weight: 20 },
    { value: "2", weight: 30 },
    { value: "2.5", weight: 20 },
    { value: "3", weight: 15 },
  ],
  scale: 1,
  minShift: "-3",
};

export function futures(seed: number, n: number, model: FutureModel = DEFAULT_MODEL): Scenario[] {
  const rng = makeRng(seed);
  const out: Scenario[] = [];
  for (let i = 0; i < n; i++) {
    const shifts: string[] = [];
    const infl: string[] = [];
    let cum = new D(0);
    for (let y = 1; y <= model.years; y++) {
      const step = new D(drawDiscrete(model.primeSteps, rng())).mul(model.scale);
      const inf = drawDiscrete(model.inflation, rng());
      if (y > 1) {
        cum = cum.plus(step);
        if (cum.lt(model.minShift)) cum = new D(model.minShift);
      }
      shifts.push(cum.toString());
      infl.push(inf);
    }
    out.push({ inflation: infl, primeShift: shifts, anchorShift: shifts, blockMonths: 12, rounding: "statement" });
  }
  return out;
}

export interface Simulation {
  first: Decimal[];
  max: Decimal[];
  total: Decimal[];
}

export function simulate(tracks: TrackSpec[], seed: number, n: number, model: FutureModel = DEFAULT_MODEL): Simulation {
  const sims = futures(seed, n, model).map((s) => evaluate(tracks, s));
  return { first: sims.map((e) => e.first), max: sims.map((e) => e.max), total: sims.map((e) => e.total) };
}

export function atLeast(values: Decimal.Value[], threshold: Decimal.Value): { count: number; n: number; p: Decimal; se: Decimal } {
  const count = values.filter((v) => new D(v).gte(threshold)).length;
  const n = values.length;
  const p = new D(count).div(n);
  return { count, n, p, se: p.mul(new D(1).minus(p)).div(n).sqrt() };
}

export function summary(values: Decimal.Value[]) {
  const s = values.map((v) => new D(v)).sort((a, b) => a.cmp(b));
  return { mean: mean(values), p5: percentile(values, 5), p50: percentile(values, 50), p95: percentile(values, 95), min: s[0], max: s[s.length - 1] };
}
