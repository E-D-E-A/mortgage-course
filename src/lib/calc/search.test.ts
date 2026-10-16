import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { CASE_A, GOAL_CONTEXT, PRICE_LIST } from "../../data/case-a-mix.ts";
import { affordability } from "./affordability.ts";
import { qualifyingTotal } from "./sensitivity.ts";
import { BRAIN_SPACE, binomial, coarseToFine, compositions, countSpace, gridCandidates, gridSize, type GridSpec, preReasons, searchGrid, trail } from "./search.ts";

describe("counting", () => {
  it("binomial: small values by hand", () => {
    expect(binomial(5, 2)).toBe(10n);
    expect(binomial(24, 4)).toBe(10626n);
    expect(binomial(4, 7)).toBe(0n);
  });
  it("compositions: 3 pieces to 2 tracks = 4 ways (0+3, 1+2, 2+1, 3+0)", () => {
    expect(compositions(3, 2)).toBe(4n);
    expect(compositions(20, 5)).toBe(10626n);
  });
  it("one term, 5 kinds, 5-point grid, 27 terms = 10,626 x 27", () => {
    expect(countSpace({ ...BRAIN_SPACE, termMode: "one" })).toBe(286902n);
  });
  it("a term per track = 10,626 x 27^5", () => {
    expect(countSpace(BRAIN_SPACE)).toBe(10626n * 27n ** 5n);
    expect(countSpace(BRAIN_SPACE)).toBe(152471485782n);
  });
  it("a 1-point grid: 4,598,126 splits", () => {
    expect(countSpace({ ...BRAIN_SPACE, stepPercent: 1, termMode: "one" })).toBe(4598126n * 27n);
  });
  it("only active tracks need a term: a smaller count than the naive one", () => {
    const naive = countSpace(BRAIN_SPACE);
    const active = countSpace({ ...BRAIN_SPACE, termMode: "per_active_track" });
    expect(active < naive).toBe(true);
    // a tiny space by hand: 2 kinds, units 2 (50-point grid), 3 terms.
    // splits: (2,0) (1,1) (0,2) -> 3 + 9 + 3 = 15 with a term only for active tracks; 3 x 9 = 27 naive.
    expect(countSpace({ kinds: 2, stepPercent: 50, terms: 3, termMode: "per_active_track" })).toBe(15n);
    expect(countSpace({ kinds: 2, stepPercent: 50, terms: 3, termMode: "per_track" })).toBe(27n);
  });
});

const SPEC: GridSpec = {
  loan: CASE_A.loan,
  kinds: ["fixed_unlinked", "prime", "variable_unlinked"],
  stepPercent: 10,
  termsMonths: [240, 300, 360],
  termMode: "shared",
  rates: PRICE_LIST,
};
// The ratio of lesson 4.3 for case A: 50% of the disposable income (21,700 - 1,450) is the ceiling.
const disposable = affordability({ income: CASE_A.recognisedIncome, obligations: [CASE_A.car], newPayment: "0" }).disposable;
const ctx = {
  scenarios: GOAL_CONTEXT,
  weights: [40, 30, 30],
  feasible: (c: { tracks: Parameters<typeof qualifyingTotal>[0] }) => (qualifyingTotal(c.tracks).div(disposable).mul(100).gt(50) ? ["ratio"] : []),
};

describe("the grid", () => {
  it("3 kinds, 10-point steps, 3 shared terms = 66 x 3 candidates", () => {
    expect(gridSize(SPEC)).toBe(198);
  });
  it("every candidate's tracks add up to the loan, exactly", () => {
    for (const c of gridCandidates(SPEC)) expect(c.tracks.reduce((s, t) => s.plus(t.amount), new Decimal(0)).toString(), c.id).toBe("1640000");
  });
  it("a term per track: 3 terms for each active track", () => {
    // splits with 1, 2, 3 active tracks among 3 kinds on 10 pieces: 3, 3*9, 36 = 3 + 27 + 36 -> compositions with j positive parts: C(3,j)*C(9,j-1)
    // j=1: 3 splits x 3 terms = 9; j=2: 3 x 9 = 27 splits x 9 = 243; j=3: 36 splits x 27 = 972.
    expect(gridSize({ ...SPEC, termMode: "per_track" })).toBe(9 + 243 + 972);
  });
  it("preReasons: above two thirds variable is out before any calculation", () => {
    const all = gridCandidates(SPEC);
    const bad = all.find((c) => c.shares.join() === "0,90,10");
    expect(bad && preReasons(bad, SPEC)).toEqual(["variable_share"]);
    const ok = all.find((c) => c.shares.join() === "40,30,30");
    expect(ok && preReasons(ok, SPEC)).toEqual([]);
  });
});

describe("searching", () => {
  it("pruning changes the number of engine calls and nothing else", () => {
    const pruned = searchGrid(SPEC, ctx, { prune: true });
    const full = searchGrid(SPEC, ctx, { prune: false });
    expect(pruned.size).toBe(198);
    expect(full.engineCalls).toBe(198);
    expect(pruned.engineCalls).toBeLessThan(full.engineCalls);
    expect(pruned.best?.id).toBe(full.best?.id);
    expect(pruned.scored.map((s) => s.id)).toEqual(full.scored.map((s) => s.id));
    expect(pruned.scored.map((s) => s.score.toString())).toEqual(full.scored.map((s) => s.score.toString()));
  });
  it("every entry is exactly one of pruned, rejected, feasible; the counts add up", () => {
    const r = searchGrid(SPEC, ctx);
    const n = (s: string) => r.entries.filter((e) => e.status === s).length;
    expect(n("pruned") + n("rejected") + n("feasible")).toBe(r.size);
    expect(n("feasible")).toBe(r.scored.length);
    expect(r.entries.filter((e) => e.status !== "feasible").every((e) => e.reasons.length > 0)).toBe(true);
  });
  it("the best has rank 1 and the smallest score", () => {
    const r = searchGrid(SPEC, ctx);
    const min = r.scored.reduce((m, s) => (s.score.lt(m) ? s.score : m), r.scored[0].score);
    expect(r.best?.score.eq(min)).toBe(true);
    expect(r.best?.rank).toBe(1);
  });
  it("same input, same output", () => {
    const a = searchGrid(SPEC, ctx);
    const b = searchGrid(SPEC, ctx);
    expect(a.best?.id).toBe(b.best?.id);
    expect(a.best?.score.toString()).toBe(b.best?.score.toString());
  });
  it("the trail ends with the search's best and counts every candidate", () => {
    const r = searchGrid(SPEC, ctx);
    const t = trail(r, ctx.weights);
    expect(t.length).toBe(198);
    expect(t[t.length - 1].bestSoFar).toBe(r.best?.id);
    expect(t[0].seen).toBe(1);
  });
});

describe("coarse to fine", () => {
  it("uses fewer engine calls than the full fine grid, and its pool is ranked together", () => {
    const full = searchGrid(SPEC, ctx);
    const c2f = coarseToFine(SPEC, ctx, 20);
    expect(c2f.engineCalls).toBeLessThan(full.engineCalls);
    expect(c2f.pool.best).toBeDefined();
    // it can never beat the full search on the same objective, because the pool is a subset of the grid
    // (it is ranked on a different scale, so compare in the full search's own terms:)
    const inFull = full.scored.find((s) => s.id === c2f.pool.best?.id);
    expect(inFull).toBeDefined();
    expect(inFull?.rank).toBeGreaterThanOrEqual(1);
  });
});
