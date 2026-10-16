/**
 * Objective functions, weights and the weighted score — lesson 8.8 ("preferences and weights;
 * feasible versus optimal"), and what 8.14-8.21 rank candidates with.
 *
 * LABEL (course/stage-8-brief.md): the three goals (a low payment, a low total, little exposure) are
 * Mogi's product design (the Brain's mix-construction page, updated 2026-10-08); turning them into one
 * score with weights is the COURSE's illustration of how a search could choose, not a Mogi decision and
 * not a bank's policy. Every weight in stage 8 is "for illustration". Mogi today has no such code.
 *
 * ── The idea, in the order the lesson teaches it ───────────────────────────
 *  1. An objective function turns a candidate into a number (8.1: input -> rule -> output). Smaller is
 *     better, for all three. They are in different units (a payment a month, a total over the loan, a
 *     rise), so they cannot be added as they are.
 *  2. normalise: for each objective, over the candidates being compared,
 *        n = (value - smallest) / (largest - smallest),  rounded to 4 decimals (half up).
 *     0 is the best candidate on that objective, 1 the worst. If all values are equal, n = 0 for all.
 *     The result depends on WHICH candidates are in the set: add or remove one and n changes.
 *  3. weights: how much each objective counts. Given as whole numbers (percent) that need not add to
 *     100; weights are first divided by their sum ("normaliseWeights"), so (2,1,1) = (50,25,25).
 *  4. weighted score = (w1*n1 + w2*n2 + w3*n3) / (w1 + w2 + w3) (lesson 8.2's weighted mean, applied to
 *     the normalised values). One division at the end; the score is rounded to 6 decimals only to print it. Smallest score wins; a tie keeps the order of the list.
 *  5. feasible versus optimal (8.7 vs 8.8): "feasible" = passes every hard constraint (a yes/no per
 *     candidate, from constraints.ts); "optimal" = the feasible candidate with the smallest score among
 *     the candidates SEARCHED. A constraint is a wall, a weight is a price: never express a hard rule as
 *     a weight.
 *
 * ── The API ────────────────────────────────────────────────────────────────
 *
 *   OBJECTIVES                       the three objectives: first (payment in month 1, base scenario),
 *                                    total (total paid, base), exposure (engine's `rise`)
 *   objectiveValues(assessment)      [first, total, exposure] as Decimals, in OBJECTIVES order
 *   normaliseWeights(raw)            raw whole numbers -> exact fractions that add to 1 (throws on
 *                                    negative, or all zero)
 *   minMax(values)                   the 4-decimal normalisation above
 *   scoreRows(rows, weights, opts)   rows = [{id, values, feasible}]; scores every row.
 *                                      opts.over "feasible" (default): min and max are taken over the
 *                                      feasible rows only (infeasible rows are scored on the same scale,
 *                                      possibly outside 0..1, so you can see what they WOULD score);
 *                                      "all": over every row (what happens if you forget the constraints
 *                                      when you normalise)
 *                                    returns [{id, values, normalised, score, feasible, rank}] where rank
 *                                    is 1 for the best FEASIBLE row and null for infeasible rows
 *   best(rows, weights, opts)        the rank-1 row, or undefined when nothing is feasible
 *   bestAnyway(rows, weights)        the best row if feasibility were ignored (normalised over all)
 *   weightLattice(stepPercent)       every triple of whole-number percents that add to 100, in steps
 *   winnersOnLattice(rows, step)     for each triple of the lattice, who wins; and the set of distinct
 *                                    winners (how much the choice depends on the weights)
 *
 * Money in, Decimal out. Recomputed independently in checks/kinds/objectives.py (kinds obj_*).
 * Exports are stable: other stage-8 modules import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import type { Assessment } from "./engine.ts";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);

export type Numeric = Decimal.Value;
export type ObjectiveId = "first" | "total" | "exposure";

export interface Objective {
  id: ObjectiveId;
  nameHe: string;
  /** How the value reads, for a table heading. */
  unitHe: string;
}

export const OBJECTIVES: Objective[] = [
  { id: "first", nameHe: "החזר ראשון", unitHe: "₪ בחודש" },
  { id: "total", nameHe: "סך תשלומים", unitHe: "₪ בסך הכול" },
  { id: "exposure", nameHe: "חשיפה", unitHe: "₪ מעל ההחזר הראשון" },
];

/** [first, total, exposure] of an assessment, all "smaller is better". */
export function objectiveValues(a: Assessment): Decimal[] {
  return [a.base.first, a.base.total, a.rise];
}

/** Whole-number weights to exact fractions that add to 1. */
export function normaliseWeights(raw: number[]): Decimal[] {
  if (raw.some((w) => !Number.isFinite(w) || w < 0)) throw new RangeError("a weight is a number from zero up");
  const sum = raw.reduce((s, w) => s + w, 0);
  if (sum === 0) throw new RangeError("at least one weight must be more than zero");
  return raw.map((w) => new D(w).div(sum));
}

/** Rounded to four decimals, half up: the lesson's rule, so a hand calculation lands on the same numbers. */
export const round4 = (x: Numeric): Decimal => new D(x).toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

/** (v - smallest) / (largest - smallest) for each value, to 4 decimals; all equal -> all zero. */
export function minMax(values: Numeric[], over: Numeric[] = values): Decimal[] {
  if (over.length === 0) throw new RangeError("nothing to compare");
  const lo = over.reduce<Decimal>((m, v) => (new D(v).lt(m) ? new D(v) : m), new D(over[0]));
  const hi = over.reduce<Decimal>((m, v) => (new D(v).gt(m) ? new D(v) : m), new D(over[0]));
  const range = hi.minus(lo);
  return values.map((v) => (range.isZero() ? ZERO : round4(new D(v).minus(lo).div(range))));
}

export interface Row {
  id: string;
  /** One value per objective, in OBJECTIVES order. */
  values: Numeric[];
  feasible: boolean;
}

export interface Scored {
  id: string;
  values: Decimal[];
  normalised: Decimal[];
  /** The weighted score, exact (weights are fractions of the weight total; shown to 6 decimals). */
  score: Decimal;
  feasible: boolean;
  /** 1 for the best feasible row; null for a row that is not feasible. */
  rank: number | null;
}

export interface ScoreOptions {
  over?: "feasible" | "all";
}

export const scoreText = (score: Numeric): string => new D(score).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toFixed(6);

export function scoreRows(rows: Row[], rawWeights: number[], opts: ScoreOptions = {}): Scored[] {
  const w = normaliseWeights(rawWeights); // validates the weights
  const k = w.length;
  const total = rawWeights.reduce((a, b) => a + b, 0);
  for (const r of rows) if (r.values.length !== k) throw new RangeError(`row ${r.id}: ${r.values.length} values for ${k} weights`);
  const over = opts.over ?? "feasible";
  const pool = over === "all" ? rows : rows.filter((r) => r.feasible);
  // If nothing is feasible, there is no scale to normalise on: use every row so the table still reads.
  const scale = pool.length > 0 ? pool : rows;
  const normalisedColumns = Array.from({ length: k }, (_, j) =>
    minMax(
      rows.map((r) => r.values[j]),
      scale.map((r) => r.values[j]),
    ),
  );
  const scored: Scored[] = rows.map((r, i) => {
    const normalised = normalisedColumns.map((col) => col[i]);
    // (w1*n1 + w2*n2 + ...) / (w1 + w2 + ...): one division at the end, so equal numerators give equal scores.
    const score = normalised.reduce((s, n, j) => s.plus(n.mul(rawWeights[j])), ZERO).div(total);
    return { id: r.id, values: r.values.map((v) => new D(v)), normalised, score, feasible: r.feasible, rank: null };
  });
  scored
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.feasible)
    .sort((a, b) => a.s.score.cmp(b.s.score) || a.i - b.i)
    .forEach(({ s }, n) => (s.rank = n + 1));
  return scored;
}

/** The best feasible row, or undefined when none is feasible. */
export function best(rows: Row[], rawWeights: number[], opts: ScoreOptions = {}): Scored | undefined {
  return scoreRows(rows, rawWeights, opts).find((s) => s.rank === 1);
}

/** The best row if every row were feasible, normalised over all of them: what a search that forgot the constraints would announce. */
export function bestAnyway(rows: Row[], rawWeights: number[]): Scored | undefined {
  return best(
    rows.map((r) => ({ ...r, feasible: true })),
    rawWeights,
    { over: "all" },
  );
}

/** Every triple of whole-number percents that add to 100 in steps of `stepPercent` (100 must be a multiple of the step). */
export function weightLattice(stepPercent: number, parts = 3): number[][] {
  if (!Number.isInteger(stepPercent) || stepPercent < 1 || 100 % stepPercent !== 0) throw new RangeError("the step must divide 100");
  const units = 100 / stepPercent;
  const out: number[][] = [];
  const walk = (left: number, slots: number, acc: number[]) => {
    if (slots === 1) {
      out.push([...acc, left * stepPercent]);
      return;
    }
    for (let u = 0; u <= left; u++) walk(left - u, slots - 1, [...acc, u * stepPercent]);
  };
  walk(units, parts, []);
  return out;
}

export interface LatticeWinner {
  weights: number[];
  winner: string;
}

export function winnersOnLattice(rows: Row[], stepPercent: number): { winners: LatticeWinner[]; distinct: string[] } {
  const winners: LatticeWinner[] = [];
  for (const weights of weightLattice(stepPercent, rows[0]?.values.length ?? 3)) {
    const b = best(rows, weights);
    if (b) winners.push({ weights, winner: b.id });
  }
  const seen = new Set<string>();
  const distinct: string[] = [];
  for (const w of winners)
    if (!seen.has(w.winner)) {
      seen.add(w.winner);
      distinct.push(w.winner);
    }
  return { winners, distinct };
}
