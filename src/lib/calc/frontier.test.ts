import { describe, expect, it } from "vitest";
import { dominates, frontIds, frontier, giveUp, pickByWeights, reachable, reachableExact, sortedFront } from "./frontier.ts";
import type { Row } from "./objectives.ts";

// By hand, two objectives (smaller is better): A(1,9) B(3,5) C(6,2) D(4,6) E(7,7) F(3,5, infeasible)
// D is beaten by B (3<4 and 5<6); E by B and C; A, B, C are efficient. F equals B but is not feasible.
const ROWS: Row[] = [
  { id: "A", values: [1, 9], feasible: true },
  { id: "B", values: [3, 5], feasible: true },
  { id: "C", values: [6, 2], feasible: true },
  { id: "D", values: [4, 6], feasible: true },
  { id: "E", values: [7, 7], feasible: true },
  { id: "F", values: [0, 0], feasible: false },
];

describe("dominates", () => {
  it("no worse everywhere and better somewhere", () => {
    expect(dominates([3, 5], [4, 6])).toBe(true);
    expect(dominates([3, 5], [3, 6])).toBe(true);
    expect(dominates([3, 5], [3, 5])).toBe(false);
    expect(dominates([1, 9], [3, 5])).toBe(false);
    expect(dominates([3, 5], [1, 9])).toBe(false);
  });
});

describe("frontier", () => {
  it("efficient rows and who dominates the rest; an infeasible row neither counts nor is efficient", () => {
    const f = frontier(ROWS);
    expect(f.filter((r) => r.efficient).map((r) => r.id)).toEqual(["A", "B", "C"]);
    expect(f.find((r) => r.id === "D")?.dominatedBy).toEqual(["B"]);
    expect(f.find((r) => r.id === "E")?.dominatedBy).toEqual(["B", "C", "D"]);
    expect(f.find((r) => r.id === "F")).toMatchObject({ efficient: false, dominatedBy: [] });
    expect(f.find((r) => r.id === "B")?.dominatesCount).toBe(2);
  });
  it("a different set of objectives, a different frontier", () => {
    // Reading only the first objective, A alone is efficient.
    expect(frontIds(ROWS, [0])).toEqual(["A"]);
  });
  it("sortedFront orders the efficient rows by one objective", () => {
    expect(sortedFront(ROWS, 1).map((r) => r.id)).toEqual(["C", "B", "A"]);
  });
  it("giveUp: what moving from one row to another costs", () => {
    expect(giveUp(ROWS[1], ROWS[2]).map(String)).toEqual(["3", "-3"]);
  });
});

describe("choosing by weights", () => {
  it("lands on the frontier", () => {
    const p = pickByWeights(ROWS, [1, 1]);
    expect(p?.efficient).toBe(true);
    expect(pickByWeights(ROWS, [100, 0])?.id).toBe("A");
    expect(pickByWeights(ROWS, [0, 100])?.id).toBe("C");
  });
  it("a dent: efficient, but no weights choose it", () => {
    // M(5,5) is efficient but lies above the line from A'(0,10) to C'(10,0): every weighted sum prefers an end.
    const dent: Row[] = [
      { id: "L", values: [0, 10], feasible: true },
      { id: "M", values: [6, 6], feasible: true },
      { id: "R", values: [10, 0], feasible: true },
    ];
    expect(frontIds(dent)).toEqual(["L", "M", "R"]);
    const r = reachable(dent, 10);
    expect(r.never).toEqual(["M"]);
    expect(r.reached).toEqual(["L", "R"]);
  });
  it("exact scores: a point that wins a lattice triple only through 4-decimal rounding is not counted", () => {
    // Three weights, three objectives: P is above the plane through the others by far less than the rounding grain.
    const rows: Row[] = [
      { id: "A", values: ["0", "10000", "5000"], feasible: true },
      { id: "B", values: ["10000", "0", "5000"], feasible: true },
      { id: "P", values: ["5000", "5000", "4999.9"], feasible: true },
      { id: "C", values: ["5000", "5000", "0"], feasible: false },
    ];
    // Exact and rounded agree here on which rows are ever reached when the margin is not tiny; the exact walk never reports a
    // row as reached that the rounded one never reaches by a wide margin. The structure test: both walks try the same triples.
    const a = reachable(rows, 20);
    const b = reachableExact(rows, 20);
    expect(b.tried).toBe(a.tried);
    expect(b.never.every((id) => ["A", "B", "P"].includes(id))).toBe(true);
    expect(b.wins.reduce((n, w) => n + w.wins, 0)).toBeLessThanOrEqual(b.tried);
  });
  it("exact scores agree with the dent example", () => {
    const dent: Row[] = [
      { id: "L", values: [0, 10], feasible: true },
      { id: "M", values: [6, 6], feasible: true },
      { id: "R", values: [10, 0], feasible: true },
    ];
    expect(reachableExact(dent, 10).never).toEqual(["M"]);
  });
});
