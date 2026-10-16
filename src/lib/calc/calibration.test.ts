import { describe, expect, it } from "vitest";
import { applyCalibrator, binCalibrator, brierScore, calibrationGap, equalEdges, logistic, reliabilityTable, type Scored } from "./calibration.ts";

// By hand: five predictions of 0.8 of which 4 happened, and four of 0.2 of which 1 happened.
const DATA: Scored[] = [
  ...[1, 1, 1, 1, 0].map((o) => ({ p: "0.8", outcome: o as 0 | 1 })),
  ...[1, 0, 0, 0].map((o) => ({ p: "0.2", outcome: o as 0 | 1 })),
];

describe("reliabilityTable", () => {
  const rows = reliabilityTable(DATA, equalEdges(5));
  it("cuts into five bins of width 0.2; the last includes 1", () => {
    expect(equalEdges(5)).toEqual(["0", "0.2", "0.4", "0.6", "0.8", "1"]);
    expect(rows.map((r) => r.n)).toEqual([0, 4, 0, 0, 5]);
  });
  it("average predicted, observed rate and gap, per bin", () => {
    expect(rows[1]).toMatchObject({ predicted: "0.2000", observed: "0.2500", gap: "0.0500", happened: 1 });
    expect(rows[4]).toMatchObject({ predicted: "0.8000", observed: "0.8000", gap: "0.0000", happened: 4 });
  });
  it("an empty bin has nothing to say", () => {
    expect(rows[0]).toMatchObject({ n: 0, predicted: null, observed: null, gap: null });
  });
  it("a prediction of exactly 1 lands in the last bin, a 0.2 in the second", () => {
    const r = reliabilityTable([{ p: "1", outcome: 1 }, { p: "0.2", outcome: 0 }], equalEdges(5));
    expect(r.map((x) => x.n)).toEqual([0, 1, 0, 0, 1]);
  });
});

describe("scores", () => {
  it("brier: (4 × 0.2² + 1 × 0.8² + 3 × 0.2² + 1 × 0.8²) ÷ 9 = 1.56 ÷ 9 ≈ 0.1733", () => {
    expect(brierScore(DATA)).toBe("0.1733");
  });
  it("saying 0.5 every time scores 0.25", () => {
    expect(brierScore([{ p: "0.5", outcome: 1 }, { p: "0.5", outcome: 0 }])).toBe("0.2500");
  });
  it("the weighted gap: (4 × 0.05 + 5 × 0) ÷ 9 ≈ 0.0222", () => {
    expect(calibrationGap(DATA, equalEdges(5))).toBe("0.0222");
  });
});

describe("calibrator", () => {
  it("replaces a prediction by its bin's observed rate, but only where there are enough cases", () => {
    const rows = reliabilityTable(DATA, equalEdges(5));
    const c = binCalibrator(rows, 5);
    expect(applyCalibrator(c, "0.85")).toBe("0.8000"); // 5 cases in the bin: trusted
    expect(applyCalibrator(c, "0.25")).toBe("0.2500"); // only 4 cases: stays what it was
    expect(applyCalibrator(binCalibrator(rows, 4), "0.25")).toBe("0.2500");
    expect(() => applyCalibrator(c, "1.2")).toThrow();
  });
});

describe("logistic", () => {
  it("0 → 0.5, large → near 1, symmetric", () => {
    expect(logistic(0)).toBe("0.500000");
    expect(logistic("2.197224577336219")).toBe("0.900000"); // ln 9
    expect(logistic(-2)).toBe("0.119203");
    expect(logistic(2)).toBe("0.880797");
  });
});
