import { describe, expect, it } from "vitest";
import { allCrossings, checkPoint, objectiveAt, solveLp, valleys, type LpProblem } from "./lp.ts";

// By hand: maximise 3x + 2y with x + y ≤ 4 and x ≤ 3 (and x, y ≥ 0).
// The corners are (0,0)=0, (3,0)=9, (3,1)=11, (0,4)=8, so the best is (3,1) = 11.
const SIMPLE: LpProblem = {
  c: [3, 2],
  goal: "max",
  conditions: [
    { label: "sum", a: [1, 1], b: 4 },
    { label: "cap", a: [1, 0], b: 3 },
  ],
};

describe("solveLp — corners of a small polygon", () => {
  const r = solveLp(SIMPLE);
  it("finds the four corners and the best one", () => {
    expect(r.status).toBe("optimal");
    expect(r.corners.map((c) => `${c.x},${c.y}=${c.value}`).sort()).toEqual(["0.00,0.00=0.00", "0.00,4.00=8.00", "3.00,0.00=9.00", "3.00,1.00=11.00"]);
    expect(r.best).toHaveLength(1);
    expect(r.best[0]).toMatchObject({ x: "3.00", y: "1.00", value: "11.00" });
  });
  it("lists every crossing, the infeasible ones with what they break", () => {
    const all = allCrossings(SIMPLE);
    // 4 lines (sum, cap, x=0, y=0): 6 pairs, none parallel except x=0 with cap.
    expect(all).toHaveLength(5);
    const bad = all.find((c) => c.x === "4.00" && c.y === "0.00");
    expect(bad?.feasible).toBe(false);
    expect(bad?.breaks).toEqual(["cap"]);
  });
  it("a tie keeps both corners", () => {
    const r2 = solveLp({ c: [1, 1], goal: "min", conditions: [{ label: "cover", a: [-1, -1], b: -4 }] });
    expect(r2.status).toBe("optimal");
    expect(r2.best.map((c) => `${c.x},${c.y}`).sort()).toEqual(["0.00,4.00", "4.00,0.00"]);
  });
  it("a corner at a third of something is rounded to two decimals", () => {
    // x + y ≤ 1 and 2x − y ≤ 0: they cross at (1/3, 2/3).
    const r3 = solveLp({ c: [1, 1], goal: "max", conditions: [{ label: "a", a: [1, 1], b: 1 }, { label: "b", a: [2, -1], b: 0 }] });
    expect(r3.corners.some((c) => c.x === "0.33" && c.y === "0.67")).toBe(true);
  });
});

describe("solveLp — the two ways it can fail", () => {
  it("infeasible: x ≤ 1 and x ≥ 2", () => {
    const r = solveLp({ c: [1, 1], goal: "min", conditions: [{ label: "low", a: [1, 0], b: 1 }, { label: "high", a: [-1, 0], b: -2 }] });
    expect(r.status).toBe("infeasible");
    expect(r.best).toEqual([]);
  });
  it("unbounded: maximise x + y with only x − y ≤ 1", () => {
    const r = solveLp({ c: [1, 1], goal: "max", conditions: [{ label: "gap", a: [1, -1], b: 1 }] });
    expect(r.status).toBe("unbounded");
  });
  it("a region that goes on for ever is fine when the objective does not improve that way", () => {
    const r = solveLp({ c: [1, 1], goal: "min", conditions: [{ label: "gap", a: [1, -1], b: 1 }] });
    expect(r.status).toBe("optimal");
    expect(r.best[0]).toMatchObject({ x: "0.00", y: "0.00" });
  });
});

describe("helpers", () => {
  it("objectiveAt and checkPoint", () => {
    expect(objectiveAt([3, 2], 3, 1)).toBe("11.00");
    expect(checkPoint(SIMPLE.conditions, 3, 1)).toEqual({ ok: true, breaks: [] });
    expect(checkPoint(SIMPLE.conditions, 4, 1)).toEqual({ ok: false, breaks: ["sum", "cap"] });
  });
});

describe("valleys — local and global minima", () => {
  // Two valleys: positions 3 (value 83) and 8 (value 79). Walking downhill from the left stops at the first.
  const COST = [100, 92, 85, 83, 88, 94, 90, 84, 79, 82, 91];
  it("finds both local minima and the global one", () => {
    const v = valleys(COST, 0);
    expect(v.localMinima).toEqual([3, 8]);
    expect(v.globalMin).toBe(8);
  });
  it("a walk downhill ends in the valley it starts above", () => {
    expect(valleys(COST, 0).path).toEqual([0, 1, 2, 3]);
    expect(valleys(COST, 6).path).toEqual([6, 7, 8]);
    expect(valleys(COST, 5).path).toEqual([5, 4, 3]); // the peak: the lower neighbour is on the left
    expect(valleys(COST, 10).path).toEqual([10, 9, 8]);
  });
  it("one valley only: every walk reaches the global minimum", () => {
    const one = [9, 6, 4, 5, 8];
    expect(valleys(one, 0).path.at(-1)).toBe(2);
    expect(valleys(one, 4).path.at(-1)).toBe(2);
    expect(valleys(one, 0).localMinima).toEqual([2]);
  });
});
