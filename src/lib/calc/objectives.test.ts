import { describe, expect, it } from "vitest";
import { best, bestAnyway, minMax, normaliseWeights, OBJECTIVES, scoreRows, scoreText, weightLattice, winnersOnLattice } from "./objectives.ts";

// Three candidates, three objectives (all "smaller is better"), small round numbers.
//        first  total  exposure
//   A     100    300     50
//   B     200    100     10
//   C     150    200     30
// Normalised: first A 0, B 1, C 0.5 | total A 1, B 0, C 0.5 | exposure A 1, B 0, C 0.5
const ROWS = [
  { id: "A", values: [100, 300, 50], feasible: true },
  { id: "B", values: [200, 100, 10], feasible: true },
  { id: "C", values: [150, 200, 30], feasible: true },
];

describe("normalising", () => {
  it("min-max, by hand", () => {
    expect(minMax([100, 200, 150]).map(String)).toEqual(["0", "1", "0.5"]);
    expect(minMax([300, 100, 200]).map(String)).toEqual(["1", "0", "0.5"]);
  });
  it("rounds to four decimals, half up", () => {
    expect(minMax([0, 1, 3]).map(String)).toEqual(["0", "0.3333", "1"]);
    expect(minMax([0, 2, 3]).map(String)).toEqual(["0", "0.6667", "1"]);
  });
  it("all equal: all zero", () => {
    expect(minMax([5, 5, 5]).map(String)).toEqual(["0", "0", "0"]);
  });
  it("can take its scale from a different set (the feasible ones)", () => {
    expect(minMax([50, 150, 250], [100, 200]).map(String)).toEqual(["-0.5", "0.5", "1.5"]);
  });
});

describe("weights", () => {
  it("are divided by their sum", () => {
    expect(normaliseWeights([2, 1, 1]).map(String)).toEqual(["0.5", "0.25", "0.25"]);
  });
  it("refuse a negative weight, and all zeros", () => {
    expect(() => normaliseWeights([1, -1, 1])).toThrow();
    expect(() => normaliseWeights([0, 0, 0])).toThrow();
  });
});

describe("the weighted score, by hand", () => {
  it("weights 1:1:2 -> B wins with 0.25", () => {
    const s = scoreRows(ROWS, [1, 1, 2]);
    expect(s.map((x) => scoreText(x.score))).toEqual(["0.750000", "0.250000", "0.500000"]);
    expect(s.map((x) => x.rank)).toEqual([3, 1, 2]);
  });
  it("weights 3:1:0 -> A wins", () => {
    expect(best(ROWS, [3, 1, 0])?.id).toBe("A");
  });
  it("weights 2:1:1 -> all three tie at 0.5, and the first in the list wins", () => {
    const s = scoreRows(ROWS, [2, 1, 1]);
    expect(s.map((x) => scoreText(x.score))).toEqual(["0.500000", "0.500000", "0.500000"]);
    expect(best(ROWS, [2, 1, 1])?.id).toBe("A");
  });
  it("multiplying every weight by the same number changes nothing", () => {
    const a = scoreRows(ROWS, [1, 1, 2]).map((x) => scoreText(x.score));
    const b = scoreRows(ROWS, [10, 10, 20]).map((x) => scoreText(x.score));
    expect(b).toEqual(a);
  });
});

describe("feasible versus optimal", () => {
  const rows = [...ROWS.slice(0, 2), { id: "C", values: [150, 200, 30], feasible: false }, { id: "D", values: [90, 90, 5], feasible: false }];
  it("an infeasible row has no rank and cannot win", () => {
    const s = scoreRows(rows, [1, 1, 1]);
    expect(s.filter((x) => !x.feasible).every((x) => x.rank === null)).toBe(true);
    expect(best(rows, [1, 1, 1])?.id).not.toBe("D");
  });
  it("forgetting the constraints announces the infeasible D", () => {
    expect(bestAnyway(rows, [1, 1, 1])?.id).toBe("D");
  });
  it("the scale comes from the feasible rows by default: an infeasible row can score below zero", () => {
    const s = scoreRows(rows, [1, 0, 0]);
    expect(String(s[3].normalised[0])).toBe("-0.1"); // (90 - 100) / (200 - 100)
  });
  it("nothing feasible: no best", () => {
    expect(best(ROWS.map((r) => ({ ...r, feasible: false })), [1, 1, 1])).toBeUndefined();
  });
});

describe("the weight lattice", () => {
  it("has C(units + 2, 2) triples that add to 100", () => {
    const l = weightLattice(10);
    expect(l.length).toBe(66);
    expect(l.every((w) => w[0] + w[1] + w[2] === 100)).toBe(true);
    expect(weightLattice(25).length).toBe(15);
  });
  it("lists who wins at each triple, and the distinct winners", () => {
    const r = winnersOnLattice(ROWS, 50);
    expect(r.winners.length).toBe(6);
    expect(r.winners.find((w) => w.weights.join() === "100,0,0")?.winner).toBe("A");
    expect(r.winners.find((w) => w.weights.join() === "0,100,0")?.winner).toBe("B");
  });
  it("the objectives are named", () => {
    expect(OBJECTIVES.map((o) => o.id)).toEqual(["first", "total", "exposure"]);
  });
});
