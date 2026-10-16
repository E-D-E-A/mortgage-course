/**
 * The space of mixes and a search over it — lessons 8.13 ("the space of mixes; why not check
 * everything: 150 billion combinations") and 8.14 ("a grid search, and shrinking the space").
 *
 * LABEL (course/stage-8-brief.md): this is an ILLUSTRATION of how a search could work. Mogi today has
 * no mix search in code (the engine call is frozen). The counts come from combinatorics, in code; the
 * sizes the Brain records ("about 287,000 combinations with one term, about 150 billion with a term per
 * track, on a 5-point split grid") are REPRODUCED here from a stated reading (see BRAIN_SPACE); whether
 * Mogi counts them this way is a question for Eylon (research/stage-8-raw/eylon-8-B.md).
 *
 * ── Part 1: counting (BigInt, exact) ───────────────────────────────────────
 *
 *   binomial(n, k)                  "n choose k"
 *   compositions(units, parts)      the ways to split `units` equal pieces among `parts` tracks, each
 *                                   getting zero or more: binomial(units + parts - 1, parts - 1)
 *   countSpace(spec)                the number of candidates of a SpaceSpec
 *       SpaceSpec = {kinds, stepPercent, terms, termMode}
 *         kinds        how many kinds of track may be in the mix (the course has five)
 *         stepPercent  the split grid: each kind gets a multiple of this many percent of the loan
 *         terms        how many terms (lengths) a track may have
 *         termMode     "one"              one term for the whole mix
 *                      "per_track"        every kind has its own term, even a kind with a zero share
 *                                         (this is how the Brain's 150 billion adds up: see BRAIN_SPACE)
 *                      "per_active_track" only a kind with a positive share has a term
 *   BRAIN_SPACE                     {kinds: 5, stepPercent: 5, terms: 27 (4 to 30 years), ...}: the
 *                                   reading under which the Brain's two figures come out
 *
 * ── Part 2: a grid and a search ────────────────────────────────────────────
 *
 *   GridSpec = {loan, kinds, stepPercent, termsMonths, termMode: "shared" | "per_track", rates}
 *   gridSize(spec)                  how many candidates the grid holds (a number, for the demo's small grids)
 *   gridCandidates(spec)            every candidate, in a fixed order: a SearchCandidate
 *       SearchCandidate = {id, tracks: TrackSpec[], shares: number[] (percent per kind, spec order),
 *                          termsMonths: number[] (per kind; 0 when the kind has no share)}
 *   preReasons(c, termLimit)        reasons a candidate is out BEFORE any calculation, from its shares
 *                                   and terms alone (variable share above two thirds; a term above the
 *                                   limit): the cheap checks, run first when "pruning" is on
 *   searchGrid(spec, ctx, options)  runs the grid:
 *       ctx = {scenarios: {base, stress}, weights, feasible?(candidate, assessment) -> reasons[]}
 *       options = {prune: boolean}
 *     pruning on:  a candidate with a pre-reason is skipped without calling the engine;
 *     pruning off: every candidate goes to the engine, and the same reason is found afterwards.
 *     The two give the same best candidate (tested) and differ only in `engineCalls`.
 *     Returns {size, engineCalls, entries (every candidate with status "pruned" | "rejected" |
 *     "feasible" and its list of reasons), scored (objectives.ts scores of the feasible ones), best}.
 *   trail(result)                   the replay of a search: after each candidate, how many were looked
 *                                   at, how many are out, which feasible one is best SO FAR
 *   coarseToFine(spec, ctx, coarseStep, options)
 *                                   first the grid at `coarseStep`; then a finer grid (spec.stepPercent)
 *                                   only in a box of +-coarseStep points around the coarse best; the
 *                                   finalists are ranked TOGETHER. Fewer engine calls; NOT guaranteed to
 *                                   find what the full fine grid finds (the lesson shows a case and
 *                                   says so).
 *
 * "Best" here is: the feasible candidate with the smallest weighted score (objectives.ts) AMONG THE
 * CANDIDATES THE GRID CONTAINS. Never "the best possible mix".
 *
 * The engine is engine.ts (memoised per track, so a grid that reuses the same track many times stays
 * fast). Recomputed independently in checks/kinds/search.py (kinds srch_*).
 * Exports are stable: other stage-8 modules import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { type Assessment, assess, type ScenarioPair } from "./engine.ts";
import { splitByWeights } from "./mix.ts";
import { best as bestRow, type Row, type Scored, scoreRows } from "./objectives.ts";
import { MAX_TERM_MONTHS, variableWithin } from "./regulation.ts";
import { isFixedForTerm, type TrackKind, type TrackSpec } from "./schedule.ts";
import { objectiveValues } from "./objectives.ts";

export type Numeric = Decimal.Value;

// ── Part 1: counting ───────────────────────────────────────────────────────

export function binomial(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0) throw new RangeError("binomial takes whole numbers from zero");
  if (k > n) return 0n;
  const kk = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= kk; i++) r = (r * BigInt(n - kk + i)) / BigInt(i);
  return r;
}

/** Ways to give `units` equal pieces to `parts` tracks (zero allowed): C(units + parts - 1, parts - 1). */
export function compositions(units: number, parts: number): bigint {
  if (parts < 1) throw new RangeError("at least one track");
  return binomial(units + parts - 1, parts - 1);
}

export type TermMode = "one" | "per_track" | "per_active_track";

export interface SpaceSpec {
  kinds: number;
  stepPercent: number;
  terms: number;
  termMode: TermMode;
}

export function countSpace(spec: SpaceSpec): bigint {
  if (100 % spec.stepPercent !== 0) throw new RangeError("the step must divide 100");
  const units = 100 / spec.stepPercent;
  const terms = BigInt(spec.terms);
  switch (spec.termMode) {
    case "one":
      return compositions(units, spec.kinds) * terms;
    case "per_track":
      return compositions(units, spec.kinds) * terms ** BigInt(spec.kinds);
    case "per_active_track": {
      // j kinds in the mix: choose which, split the units so each has at least one piece, give each a term.
      let sum = 0n;
      for (let j = 1; j <= Math.min(spec.kinds, units); j++) sum += binomial(spec.kinds, j) * binomial(units - 1, j - 1) * terms ** BigInt(j);
      return sum;
    }
  }
}

/**
 * The reading under which the Brain's figures come out (page "Choices and costs - mix construction",
 * updated 2026-10-08, as recorded in the course's research notes): five kinds of track, a split grid of
 * 5 points, and 27 terms (the course reads them as 4 to 30 years, one year apart: this is the course's
 * reconstruction, not stated on the page). One term: about 287,000. A term per track: about 150 billion.
 * At a 1-point grid: about 124 million and about 66 trillion.
 */
export const BRAIN_SPACE: SpaceSpec = { kinds: 5, stepPercent: 5, terms: 27, termMode: "per_track" };

// ── Part 2: a grid and a search ────────────────────────────────────────────

export interface GridSpec {
  loan: Numeric;
  kinds: TrackKind[];
  stepPercent: number;
  /** The terms to try, in months. */
  termsMonths: number[];
  /** "shared": one term for the whole mix. "per_track": every track with a share has its own term. */
  termMode: "shared" | "per_track";
  /** The rate of each kind, percent a year: the course's price list (teaching assumption). */
  rates: Record<TrackKind, string>;
}

export interface SearchCandidate {
  id: string;
  tracks: TrackSpec[];
  /** Percent of the loan in each kind of `spec.kinds`, in order. */
  shares: number[];
  /** Term in months of each kind; 0 when the kind has no share. */
  termsMonths: number[];
}

const SHORT: Record<TrackKind, string> = { fixed_unlinked: "ק", fixed_linked: "קצ", prime: "פ", variable_unlinked: "מ", variable_linked: "מצ" };

function splits(units: number, parts: number): number[][] {
  const out: number[][] = [];
  const walk = (left: number, slots: number, acc: number[]) => {
    if (slots === 1) return void out.push([...acc, left]);
    for (let u = 0; u <= left; u++) walk(left - u, slots - 1, [...acc, u]);
  };
  walk(units, parts, []);
  return out;
}

/** Every term assignment for the active kinds (a list of terms per active kind). */
function termAssignments(spec: GridSpec, active: number): number[][] {
  if (spec.termMode === "shared") return spec.termsMonths.map((t) => Array.from({ length: active }, () => t));
  let acc: number[][] = [[]];
  for (let i = 0; i < active; i++) acc = acc.flatMap((a) => spec.termsMonths.map((t) => [...a, t]));
  return acc;
}

export function gridCandidates(spec: GridSpec): SearchCandidate[] {
  if (100 % spec.stepPercent !== 0) throw new RangeError("the step must divide 100");
  const units = 100 / spec.stepPercent;
  const out: SearchCandidate[] = [];
  for (const split of splits(units, spec.kinds.length)) {
    const shares = split.map((u) => u * spec.stepPercent);
    const activeIdx = shares.map((s, i) => (s > 0 ? i : -1)).filter((i) => i >= 0);
    const amounts = splitByWeights(spec.loan, activeIdx.map((i) => shares[i]));
    for (const terms of termAssignments(spec, activeIdx.length)) {
      const tracks: TrackSpec[] = activeIdx.map((kindIndex, a) => {
        const kind = spec.kinds[kindIndex];
        return { kind, amount: amounts[a].toFixed(2), rate: spec.rates[kind], months: terms[a] };
      });
      const termsMonths = spec.kinds.map(() => 0);
      activeIdx.forEach((kindIndex, a) => (termsMonths[kindIndex] = terms[a]));
      const id = activeIdx.map((kindIndex, a) => `${SHORT[spec.kinds[kindIndex]]}${shares[kindIndex]}/${terms[a] / 12}`).join(" ");
      out.push({ id, tracks, shares, termsMonths });
    }
  }
  return out;
}

export function gridSize(spec: GridSpec): number {
  return gridCandidates(spec).length;
}

/** Reasons a candidate is out from its shares and terms alone, before any calculation. */
export function preReasons(c: SearchCandidate, spec: Pick<GridSpec, "kinds" | "loan">): string[] {
  const reasons: string[] = [];
  const loan = new Decimal(spec.loan);
  const variable = c.tracks.filter((t) => !isFixedForTerm(t.kind)).reduce((s, t) => s.plus(t.amount), new Decimal(0));
  if (!variableWithin(variable, loan)) reasons.push("variable_share");
  if (c.tracks.some((t) => t.months > MAX_TERM_MONTHS)) reasons.push("term");
  return reasons;
}

export interface SearchContext {
  scenarios: ScenarioPair;
  /** Raw weights for objectives.ts: [first, total, exposure]. */
  weights: number[];
  /** The hard constraints that need a calculated number (the ratio, say): reasons it is out, [] when it passes. */
  feasible?: (c: SearchCandidate, a: Assessment) => string[];
}

export interface SearchOptions {
  prune: boolean;
}

export type EntryStatus = "pruned" | "rejected" | "feasible";

export interface Entry {
  candidate: SearchCandidate;
  status: EntryStatus;
  reasons: string[];
  assessment?: Assessment;
}

export interface SearchResult {
  size: number;
  /** How many candidates went to the engine (each is two schedules: the base and the stress scenario). */
  engineCalls: number;
  entries: Entry[];
  scored: Scored[];
  best?: Scored;
}

function finish(entries: Entry[], size: number, engineCalls: number, weights: number[]): SearchResult {
  const feasibleEntries = entries.filter((e) => e.status === "feasible");
  const rows: Row[] = feasibleEntries.map((e) => ({ id: e.candidate.id, values: objectiveValues(e.assessment as Assessment), feasible: true }));
  const scored = rows.length > 0 ? scoreRows(rows, weights) : [];
  return { size, engineCalls, entries, scored, best: rows.length > 0 ? bestRow(rows, weights) : undefined };
}

function run(candidates: SearchCandidate[], spec: GridSpec, ctx: SearchContext, options: SearchOptions): { entries: Entry[]; engineCalls: number } {
  const entries: Entry[] = [];
  let engineCalls = 0;
  for (const c of candidates) {
    const pre = preReasons(c, spec);
    if (options.prune && pre.length > 0) {
      entries.push({ candidate: c, status: "pruned", reasons: pre });
      continue;
    }
    const a = assess(c.tracks, ctx.scenarios);
    engineCalls++;
    const reasons = [...pre, ...(ctx.feasible ? ctx.feasible(c, a) : [])];
    entries.push({ candidate: c, status: reasons.length > 0 ? "rejected" : "feasible", reasons, assessment: a });
  }
  return { entries, engineCalls };
}

export function searchGrid(spec: GridSpec, ctx: SearchContext, options: SearchOptions = { prune: true }): SearchResult {
  const candidates = gridCandidates(spec);
  const { entries, engineCalls } = run(candidates, spec, ctx, options);
  return finish(entries, candidates.length, engineCalls, ctx.weights);
}

export interface TrailStep {
  /** How many candidates have been looked at, this one included. */
  seen: number;
  id: string;
  status: EntryStatus;
  reasons: string[];
  /** Among the feasible candidates seen so far, the best one so far (undefined before the first). */
  bestSoFar?: string;
}

export function trail(result: SearchResult, weights: number[]): TrailStep[] {
  const rows: Row[] = [];
  let currentBest: string | undefined;
  return result.entries.map((e, i) => {
    if (e.status === "feasible") {
      rows.push({ id: e.candidate.id, values: objectiveValues(e.assessment as Assessment), feasible: true });
      currentBest = bestRow(rows, weights)?.id;
    }
    return { seen: i + 1, id: e.candidate.id, status: e.status, reasons: e.reasons, bestSoFar: currentBest };
  });
}

export interface CoarseToFine {
  coarse: SearchResult;
  fine: SearchResult;
  /** Both rounds' engine calls added up (the fine round skips what the coarse round already did). */
  engineCalls: number;
  /** The finalists of both rounds, ranked together. */
  pool: SearchResult;
}

/** A candidate's shares are within `box` points of the centre's on every kind. */
const inBox = (c: SearchCandidate, centre: number[], box: number): boolean => c.shares.every((s, i) => Math.abs(s - centre[i]) <= box);

export function coarseToFine(spec: GridSpec, ctx: SearchContext, coarseStepPercent: number, options: SearchOptions = { prune: true }): CoarseToFine {
  const coarseSpec: GridSpec = { ...spec, stepPercent: coarseStepPercent };
  const coarse = searchGrid(coarseSpec, ctx, options);
  if (!coarse.best) return { coarse, fine: coarse, engineCalls: coarse.engineCalls, pool: coarse };
  const centre = (coarse.entries.find((e) => e.candidate.id === coarse.best?.id) as Entry).candidate;
  // Only candidates the coarse round has not already calculated.
  const done = new Set(coarse.entries.map((e) => e.candidate.id));
  const fineAll = gridCandidates(spec).filter((c) => inBox(c, centre.shares, coarseStepPercent) && !done.has(c.id));
  const { entries, engineCalls } = run(fineAll, spec, ctx, options);
  const fine = finish(entries, fineAll.length, engineCalls, ctx.weights);
  // The finalists of both rounds, de-duplicated by id, ranked together on one scale.
  const seen = new Set<string>();
  const merged: Entry[] = [];
  for (const e of [...coarse.entries, ...entries]) {
    if (seen.has(e.candidate.id)) continue;
    seen.add(e.candidate.id);
    merged.push(e);
  }
  const pool = finish(merged, merged.length, coarse.engineCalls + engineCalls, ctx.weights);
  return { coarse, fine, engineCalls: coarse.engineCalls + engineCalls, pool };
}
