/**
 * The efficient frontier — lesson 8.15 ("there is no good without a trade-off"), and what lesson 8.21's ranking
 * works on. GENERAL MATHS ("כללי") applied to the stage's candidates. Nothing here is a Mogi decision: the weights a
 * lesson passes in are for illustration, and Mogi today has no such code ("Mogi היום").
 *
 * ── The idea, in the order the lesson teaches it ───────────────────────────
 *  1. Several objectives, every one "smaller is better" (objectives.ts: the first payment, the total, the exposure).
 *  2. Candidate A DOMINATES candidate B when A is no worse than B on every objective and strictly better on at
 *     least one. Equal on everything: neither dominates the other.
 *  3. A feasible candidate that nobody dominates is EFFICIENT (Pareto-efficient). The efficient ones are the
 *     FRONTIER: to improve one objective on any of them you must give up another. A dominated candidate can be
 *     dropped before anyone's preferences are asked: someone else is at least as good on everything.
 *  4. Only feasible candidates compete (8.7): an infeasible candidate is not on the frontier, and does not
 *     dominate anything. (Dropping it first is what makes the frontier a set of ANSWERS.)
 *  5. The frontier depends on WHICH objectives are looked at. A candidate dominated on two objectives may be
 *     efficient on three: a picture of two objectives can hide a point that the three-objective frontier keeps.
 *     `frontier(rows, [0, 1])` reads only the objectives at those positions.
 *  6. Choosing a point by weights (objectives.ts' weighted score, normalised over the feasible set) always lands
 *     on the frontier when every weight is above zero; it is the same lesson 8.8 taught, now seen as a walk along
 *     the frontier. With a weight of zero the winner can be a tied, dominated point: `pickByWeights` says so.
 *  7. Not every efficient point can be won by a weighted score: a point in a "dent" of the frontier is efficient
 *     and still loses to a neighbour or a mix of its neighbours for EVERY weight. `reachable` finds them by
 *     trying every weight triple on a lattice (a lattice is a finite check, not a proof; the lesson says so).
 *
 * ── The API ────────────────────────────────────────────────────────────────
 *
 *   dominates(a, b)                  a, b: Numeric[] of the same length (smaller is better)
 *   frontier(rows, use?)             rows: objectives.ts Row[] ({id, values, feasible}); `use`: the objective
 *                                    positions to read (default all). Returns, for every row in order:
 *                                    {id, values, feasible, efficient, dominatedBy (ids of feasible rows that dominate it,
 *                                    in row order), dominates (how many feasible rows it dominates)}
 *   frontIds(rows, use?)             the ids of the efficient rows, in row order
 *   pickByWeights(rows, weights, use?) the winner of the weighted score over the feasible rows, with
 *                                    {id, score, efficient, tied: ids of other rows with an equal score}
 *   reachable(rows, stepPercent)     over the weight lattice (3 positive-or-zero weights adding to 100, `stepPercent`
 *                                    apart): which efficient rows win for at least one triple, and which never do
 *   giveUp(from, to)                 the trade-off between two rows: the difference per objective (to − from)
 *   sortedFront(rows, by)            the efficient rows ordered by one objective, ascending (the line the chart draws)
 *
 * Exact Decimal comparisons; nothing is rounded. Recomputed independently in checks/kinds/frontier.py.
 */
import Decimal from "decimal.js";
import { best, type Numeric, type Row, scoreRows, weightLattice } from "./objectives.ts";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

/** a dominates b: no worse everywhere, strictly better somewhere (smaller is better). */
export function dominates(a: Numeric[], b: Numeric[]): boolean {
  if (a.length !== b.length) throw new RangeError("two candidates with different numbers of objectives");
  let strictly = false;
  for (let k = 0; k < a.length; k++) {
    const c = new D(a[k]).cmp(b[k]);
    if (c > 0) return false;
    if (c < 0) strictly = true;
  }
  return strictly;
}

export interface FrontRow {
  id: string;
  values: Decimal[];
  feasible: boolean;
  efficient: boolean;
  /** Ids of the feasible rows that dominate this one, in row order. */
  dominatedBy: string[];
  /** How many feasible rows this one dominates. */
  dominatesCount: number;
}

const pick = (values: Numeric[], use?: number[]) => (use ? use.map((k) => values[k]) : values);

export function frontier(rows: Row[], use?: number[]): FrontRow[] {
  const feasible = rows.filter((r) => r.feasible);
  return rows.map((r) => {
    const mine = pick(r.values, use);
    const by = r.feasible ? feasible.filter((o) => o !== r && dominates(pick(o.values, use), mine)).map((o) => o.id) : [];
    const count = r.feasible ? feasible.filter((o) => o !== r && dominates(mine, pick(o.values, use))).length : 0;
    return { id: r.id, values: r.values.map((v) => new D(v)), feasible: r.feasible, efficient: r.feasible && by.length === 0, dominatedBy: by, dominatesCount: count };
  });
}

export function frontIds(rows: Row[], use?: number[]): string[] {
  return frontier(rows, use)
    .filter((r) => r.efficient)
    .map((r) => r.id);
}

export interface Pick {
  id: string;
  score: Decimal;
  efficient: boolean;
  /** Other feasible rows with exactly the same score (the first in row order is the one picked). */
  tied: string[];
}

export function pickByWeights(rows: Row[], weights: number[], use?: number[]): Pick | undefined {
  const sub = use ? rows.map((r) => ({ ...r, values: pick(r.values, use) })) : rows;
  const w = use ? use.map((k) => weights[k]) : weights;
  if (w.every((x) => x === 0)) return undefined;
  const winner = best(sub, w);
  if (!winner) return undefined;
  const scored = scoreRows(sub, w);
  const tied = scored.filter((s) => s.feasible && s.id !== winner.id && s.score.eq(winner.score)).map((s) => s.id);
  const fr = frontier(rows, use).find((r) => r.id === winner.id) as FrontRow;
  return { id: winner.id, score: winner.score, efficient: fr.efficient, tied };
}

export interface Reach {
  /** Efficient rows that win for at least one weight triple of the lattice, in row order. */
  reached: string[];
  /** Efficient rows that win for none. */
  never: string[];
  /** How many triples were tried. */
  tried: number;
  /** For each efficient row, how many triples it wins (row order). */
  wins: { id: string; wins: number }[];
}

export function reachable(rows: Row[], stepPercent: number): Reach {
  const front = frontIds(rows);
  const wins = new Map<string, number>(front.map((id) => [id, 0]));
  const lattice = weightLattice(stepPercent, rows[0]?.values.length ?? 3);
  let tried = 0;
  for (const w of lattice) {
    const b = best(rows, w);
    if (!b) continue;
    tried++;
    wins.set(b.id, (wins.get(b.id) ?? 0) + 1);
  }
  const efficientWins = front.map((id) => ({ id, wins: wins.get(id) ?? 0 }));
  return { reached: efficientWins.filter((w) => w.wins > 0).map((w) => w.id), never: efficientWins.filter((w) => w.wins === 0).map((w) => w.id), tried, wins: efficientWins };
}

/** The trade-off from one row to another: to − from, per objective (negative: to is better there). */
export function giveUp(from: Row, to: Row): Decimal[] {
  return to.values.map((v, k) => new D(v).minus(from.values[k]));
}

export function sortedFront(rows: Row[], by: number, use?: number[]): Row[] {
  const ids = new Set(frontIds(rows, use));
  return rows.filter((r) => ids.has(r.id)).sort((a, b) => new D(a.values[by]).cmp(b.values[by]));
}
