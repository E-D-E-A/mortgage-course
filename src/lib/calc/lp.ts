/**
 * A tiny linear programme in TWO variables, solved by looking at its corners.
 * Lesson 8.16. It exists only to show what the method IS. It is not a solver,
 * it is not what Mogi runs, and it takes nothing from a real mortgage market.
 *
 * The problem it knows: find x ≥ 0 and y ≥ 0 that minimise (or maximise)
 * c₁·x + c₂·y, among all the pairs that satisfy a list of conditions of the
 * form  a₁·x + a₂·y ≤ b. (A condition "at least" is written with minus signs.)
 *
 * The fact it uses (general maths, source "כללי"): the allowed pairs form a
 * polygon whose sides are the lines a₁·x + a₂·y = b. A straight-line objective
 * reaches its best value at a corner of the polygon. So: take every pair of
 * boundary lines, find the point where they cross, keep the crossings that obey
 * every condition, and read the objective at each. The best one wins.
 *
 *   solveLp(...)        status "optimal" | "infeasible" | "unbounded", the
 *                       feasible corners, and the best corner(s)
 *   allCrossings(...)   every crossing of two boundary lines (the axes included),
 *                       feasible or not, with the conditions it breaks: the table
 *                       the lesson shows
 *
 * Numbers are Decimals at 50 digits; a crossing is found by Cramer's rule and
 * shown rounded to two decimals (half up). A crossing counts as obeying a
 * condition if it breaks it by less than 1e-30 (the checks/ side uses exact
 * fractions, where the question does not arise). Recomputed independently in
 * checks/kinds/lp.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
const EPS = new D("1e-30");
const ZERO = new D(0);

/** a[0]·x + a[1]·y ≤ b. The label is what the lesson calls the condition. */
export interface Condition {
  label: string;
  a: [Numeric, Numeric];
  b: Numeric;
}

export interface Corner {
  /** Shekels (or whatever the lesson's variables are), two decimals. */
  x: string;
  y: string;
  /** The objective at this corner, two decimals. */
  value: string;
  /** Which conditions pass through this corner (it lies exactly on their line). */
  active: string[];
}

export interface Crossing extends Corner {
  /** The two lines that cross here. */
  lines: [string, string];
  feasible: boolean;
  /** The conditions it breaks, by label (empty when feasible). */
  breaks: string[];
}

export interface LpResult {
  status: "optimal" | "infeasible" | "unbounded";
  /** Feasible corners, in the order the crossings were found. */
  corners: Corner[];
  /** The corner(s) with the best objective (several on a tie). Empty unless "optimal". */
  best: Corner[];
}

export interface LpProblem {
  c: [Numeric, Numeric];
  goal: "min" | "max";
  conditions: Condition[];
}

const AXIS_X: Condition = { label: "x ≥ 0", a: [-1, 0], b: 0 };
const AXIS_Y: Condition = { label: "y ≥ 0", a: [0, -1], b: 0 };

const withAxes = (conditions: Condition[]): Condition[] => [...conditions, AXIS_X, AXIS_Y];

const dot = (a: [Numeric, Numeric], x: Decimal, y: Decimal) => new D(a[0]).mul(x).plus(new D(a[1]).mul(y));
const fmt = (v: Decimal) => {
  const r = v.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return r.isZero() ? "0.00" : r.toFixed(2);
};

/** Where two lines cross, or null when they are parallel. */
function cross(p: Condition, q: Condition): [Decimal, Decimal] | null {
  const det = new D(p.a[0]).mul(q.a[1]).minus(new D(p.a[1]).mul(q.a[0]));
  if (det.isZero()) return null;
  const x = new D(p.b).mul(q.a[1]).minus(new D(p.a[1]).mul(q.b)).div(det);
  const y = new D(p.a[0]).mul(q.b).minus(new D(p.b).mul(q.a[0])).div(det);
  return [x, y];
}

const breaks = (all: Condition[], x: Decimal, y: Decimal) => all.filter((k) => dot(k.a, x, y).minus(k.b).gt(EPS)).map((k) => k.label);
const onLine = (all: Condition[], x: Decimal, y: Decimal) => all.filter((k) => dot(k.a, x, y).minus(k.b).abs().lte(EPS)).map((k) => k.label);

type Raw = Crossing & { exact: Decimal };

function rawCrossings(problem: LpProblem): Raw[] {
  const all = withAxes(problem.conditions);
  const out: Raw[] = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const at = cross(all[i], all[j]);
      if (!at) continue;
      const [x, y] = at;
      const broken = breaks(all, x, y);
      out.push({
        x: fmt(x),
        y: fmt(y),
        value: fmt(dot(problem.c, x, y)),
        exact: dot(problem.c, x, y),
        active: onLine(all, x, y),
        lines: [all[i].label, all[j].label],
        feasible: broken.length === 0,
        breaks: broken,
      });
    }
  }
  return out;
}

/** Every crossing of two boundary lines, the axes included, in a fixed order (pairs by position in the list). */
export function allCrossings(problem: LpProblem): Crossing[] {
  return rawCrossings(problem).map(({ exact: _exact, ...c }) => c);
}

/** True when the feasible region goes on for ever in a direction that improves the objective. */
function improvesForever(problem: LpProblem): boolean {
  const all = withAxes(problem.conditions);
  const dirs: [Decimal, Decimal][] = [[new D(1), ZERO], [ZERO, new D(1)]];
  for (const k of all) {
    const a0 = new D(k.a[0]);
    const a1 = new D(k.a[1]);
    dirs.push([a1.neg(), a0], [a1, a0.neg()]);
  }
  const sign = problem.goal === "min" ? 1 : -1;
  return dirs.some(([dx, dy]) => {
    if (dx.isZero() && dy.isZero()) return false;
    // A direction the region can run along for ever: no condition gets worse along it.
    if (!all.every((k) => dot(k.a, dx, dy).lte(EPS))) return false;
    return dot(problem.c, dx, dy).mul(sign).lt(EPS.neg());
  });
}

export function solveLp(problem: LpProblem): LpResult {
  const feasible = rawCrossings(problem).filter((c) => c.feasible);
  // Exact duplicates (three lines through one point) are one corner.
  const seen = new Set<string>();
  const corners: Corner[] = [];
  const exact: Decimal[] = [];
  for (const c of feasible) {
    const key = `${c.x}|${c.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    corners.push({ x: c.x, y: c.y, value: c.value, active: c.active });
    exact.push(c.exact);
  }
  if (corners.length === 0) return { status: "infeasible", corners, best: [] };
  if (improvesForever(problem)) return { status: "unbounded", corners, best: [] };
  const target = exact.reduce((a, b) => (problem.goal === "min" ? (b.lt(a) ? b : a) : b.gt(a) ? b : a));
  return { status: "optimal", corners, best: corners.filter((_, k) => exact[k].minus(target).abs().lte(EPS)) };
}

/** The objective at a point, two decimals: what the lesson's guided tasks read off at a chosen split. */
export function objectiveAt(c: [Numeric, Numeric], x: Numeric, y: Numeric): string {
  return fmt(dot(c, new D(x), new D(y)));
}

/** Whether a point obeys every condition, and the labels of those it breaks. */
export function checkPoint(conditions: Condition[], x: Numeric, y: Numeric): { ok: boolean; breaks: string[] } {
  const b = breaks(withAxes(conditions), new D(x), new D(y));
  return { ok: b.length === 0, breaks: b };
}

// ── One variable, many valleys: local and global ───────────────────────────
// A cost listed at equally spaced choices (say, the fixed share 0%, 10%, … 100%). "Local minimum": lower than
// the neighbours it has. "Global minimum": the lowest of all. Walking downhill from a start stops at a local one.

export interface Valleys {
  /** Positions (0-based) lower than every neighbour, the ends compared with their one neighbour. A flat stretch counts its first position. */
  localMinima: number[];
  /** The position with the lowest value (the first, on a tie). */
  globalMin: number;
  /** The walk from `start`: step to the lower neighbour (the left one on a tie) until neither is lower. */
  path: number[];
}

export function valleys(values: Numeric[], start: number): Valleys {
  if (values.length === 0) throw new RangeError("no values");
  if (!Number.isInteger(start) || start < 0 || start >= values.length) throw new RangeError("the start is a position in the list");
  const v = values.map((x) => new D(x));
  const localMinima: number[] = [];
  for (let k = 0; k < v.length; k++) {
    const leftOk = k === 0 || v[k].lt(v[k - 1]);
    const rightOk = k === v.length - 1 || v[k].lte(v[k + 1]);
    if (leftOk && rightOk) localMinima.push(k);
  }
  let globalMin = 0;
  for (let k = 1; k < v.length; k++) if (v[k].lt(v[globalMin])) globalMin = k;
  const path = [start];
  let at = start;
  for (;;) {
    const left = at > 0 ? v[at - 1] : null;
    const right = at < v.length - 1 ? v[at + 1] : null;
    let next = at;
    if (left && left.lt(v[at]) && (!right || left.lte(right))) next = at - 1;
    else if (right && right.lt(v[at])) next = at + 1;
    if (next === at) break;
    path.push(next);
    at = next;
  }
  return { localMinima, globalMin, path };
}
