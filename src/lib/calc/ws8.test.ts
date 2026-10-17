import { describe, expect, it } from "vitest";
import { BASE_CHOICE } from "../../data/case-s8.ts";
import { checkAgainstOffer, explainWinner, gridShapes, runWorkshop, workshopCase, WS_WEIGHTS } from "./ws8.ts";

const POSITIONED = { ...BASE_CHOICE, extraEquity: "20000" };

describe("the workshop's grid", () => {
  it("holds every [fixed, prime, variable] triple in 10-point steps that adds to 100: C(12, 2) = 66, by hand", () => {
    const g = gridShapes(10);
    expect(g).toHaveLength(66);
    expect(g.every((s) => s[0] + s[1] + s[2] === 100)).toBe(true);
    expect(new Set(g.map((s) => s.join("-"))).size).toBe(66);
    expect(g[0]).toEqual([0, 0, 100]);
    expect(g[g.length - 1]).toEqual([100, 0, 0]);
  });
  it("a coarser step has fewer: 25-point steps give C(6, 2) = 15", () => {
    expect(gridShapes(25)).toHaveLength(15);
  });
});

describe("runWorkshop", () => {
  const r = runWorkshop(POSITIONED, WS_WEIGHTS);
  it("counts the space by combinatorics, and has a row per candidate", () => {
    expect(r.spaceSize).toBe(66n);
    expect(r.rows).toHaveLength(66);
  });
  it("a loan of price − equity: 2,200,000 − 560,000 − 20,000 = 1,620,000", () => {
    expect(r.loan.toString()).toBe("1620000");
  });
  it("the all-variable candidate is out because more than two thirds is variable, and that is among its reasons", () => {
    const row = r.rows.find((x) => x.id === "g0-0-100");
    expect(row?.feasible).toBe(false);
    expect(row?.reasons).toContain("variable_share");
  });
  it("a candidate failing several constraints lists every one of them, not only the first", () => {
    expect(r.rows.some((x) => x.reasons.length >= 2)).toBe(true);
  });
  it("the rejection counts add the reasons of every row", () => {
    const sum = Object.values(r.rejectionCounts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(r.rows.reduce((a, x) => a + x.reasons.length, 0));
  });
  it("only a feasible row is efficient, and the winner is feasible, efficient and ranked first", () => {
    expect(r.rows.filter((x) => x.efficient).every((x) => x.feasible)).toBe(true);
    expect(r.winner?.rank).toBe(1);
    expect(r.winner?.feasible).toBe(true);
    expect(r.winner?.efficient).toBe(true);
  });
  it("the winner has the smallest score among the feasible", () => {
    const min = r.rows.filter((x) => x.feasible).reduce((a, x) => (x.score.lt(a) ? x.score : a), r.rows.find((x) => x.feasible)!.score);
    expect(r.winner?.score.eq(min)).toBe(true);
  });
  it("same input, same output", () => {
    const again = runWorkshop(POSITIONED, WS_WEIGHTS);
    expect(again.rows.map((x) => [x.id, x.values.map(String), x.reasons])).toEqual(r.rows.map((x) => [x.id, x.values.map(String), x.reasons]));
  });
  it("positioning matters: more equity leaves more feasible candidates than the request as it stands", () => {
    expect(r.feasibleCount).toBeGreaterThan(runWorkshop(BASE_CHOICE).feasibleCount);
  });
  it("spending the savings twice leaves nothing feasible: closing the car loan and adding 20,000 of equity", () => {
    expect(runWorkshop({ ...POSITIONED, closeCar: true }).feasibleCount).toBe(0);
  });
  it("explains with the engine's numbers: the gap to the runner-up is the runner-up's value minus the winner's", () => {
    const e = explainWinner(r);
    expect(e?.runnerUp?.rank).toBe(2);
    e?.gaps?.forEach((g, i) => expect(g.eq((e.runnerUp as (typeof r.rows)[number]).values[i].minus(e.winner.values[i]))).toBe(true));
  });
});

describe("the sample offer", () => {
  const o = checkAgainstOffer();
  it("differs from the estimate only in the rates: the same amounts and terms", () => {
    expect(o.offerTracks.map((t) => [t.kind, t.amount, t.months])).toEqual(o.estimateTracks.map((t) => [t.kind, t.amount, t.months]));
    expect(o.offerTracks.map((t) => t.rate)).not.toEqual(o.estimateTracks.map((t) => t.rate));
  });
  it("the gap is the offer minus the estimate", () => {
    expect(o.firstGap.eq(o.offer.base.first.minus(o.estimate.base.first))).toBe(true);
    expect(o.totalGap.eq(o.offer.base.total.minus(o.estimate.base.total))).toBe(true);
  });
});

describe("the case as plain data", () => {
  const c = workshopCase();
  it("carries the four banks, both scenarios and the rules from the course's own modules", () => {
    expect(Object.keys(c.banks)).toEqual(["a", "b", "c", "d"]);
    expect(c.scenarios.stress.prime_shift).toBe("2");
    expect(c.rules.max_term_months).toBe(360);
    expect(c.rules.ltv_ceiling).toBe("75");
  });
});
