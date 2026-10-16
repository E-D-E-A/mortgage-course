import { describe, expect, it } from "vitest";
import {
  distribution,
  distributionStd,
  distributionVariance,
  errors,
  expectation,
  formatPlain,
  histogram,
  linearFit,
  mean,
  median,
  percentile,
  percentileNearestRank,
  percentilePosition,
  predict,
  probabilityBetween,
  residuals,
  sampleVariance,
  std,
  sum,
  variance,
  weightedMean,
} from "./stats.ts";

// Eleven synthetic payment ratios (percent), the lesson 8.3 example. Hand sums: 394; Σx² = 14,428.
const RATIOS = [34, 28, 40, 31, 47, 35, 30, 38, 33, 42, 36];

describe("sums and means", () => {
  it("adds and averages by hand: 394 ÷ 11", () => {
    expect(sum(RATIOS).toString()).toBe("394");
    expect(formatPlain(mean(RATIOS), 3)).toBe("35.818");
  });
  it("weights a mean: 4.60, 4.10, 4.40 on 546,000 / 547,000 / 547,000 → 7,161.1 ÷ 1,640 (thousands)", () => {
    expect(formatPlain(weightedMean(["4.60", "4.10", "4.40"], [546, 547, 547]), 4)).toBe("4.3665");
    expect(weightedMean(["4.60", "4.10", "4.40"], [546, 547, 547]).mul(1640).toFixed(1)).toBe("7161.1");
  });
  it("equal weights give the plain mean; the scale of the weights does not matter", () => {
    expect(weightedMean([1, 2, 6], [1, 1, 1]).toString()).toBe("3");
    expect(weightedMean([1, 2, 6], [10, 20, 20]).toString()).toBe(weightedMean([1, 2, 6], [1, 2, 2]).toString());
    expect(weightedMean([10, 20], [3, 1]).toString()).toBe("12.5");
  });
  it("refuses empty input, a length mismatch, negative or all-zero weights", () => {
    expect(() => mean([])).toThrow();
    expect(() => weightedMean([1, 2], [1])).toThrow();
    expect(() => weightedMean([1, 2], [0, 0])).toThrow();
    expect(() => weightedMean([1, 2], [-1, 2])).toThrow();
  });
});

describe("histogram", () => {
  it("puts the lower edge in the bin and the top edge in the last bin", () => {
    const h = histogram([1, 2, 2, 3, 5, 10], { start: 0, width: 5, count: 2 });
    expect(h.bins.map((b) => b.count)).toEqual([4, 2]);
    expect(h.below + h.above).toBe(0);
  });
  it("counts what falls outside instead of losing it", () => {
    const h = histogram([-1, 0, 4.99, 5, 11], { start: 0, width: 5, count: 2 });
    expect(h.bins.map((b) => b.count)).toEqual([2, 1]);
    expect([h.below, h.above]).toEqual([1, 1]);
  });
  it("the counts plus the outside add up to the number of values", () => {
    const h = histogram(RATIOS, { start: 25, width: 5, count: 4 });
    expect(h.bins.reduce((s, b) => s + b.count, 0) + h.below + h.above).toBe(RATIOS.length);
    // 28,30,31,33,34 | 35,36,38 | 40,42 | 47 above 45 → [25,30): 28; [30,35): 30,31,33,34; [35,40): 35,36,38; [40,45]: 40,42
    expect(h.bins.map((b) => b.count)).toEqual([1, 4, 3, 2]);
    expect(h.above).toBe(1);
  });
});

describe("spread", () => {
  it("population variance = Σx² ÷ n − mean² = 3,472 ÷ 121 (by hand)", () => {
    expect(variance(RATIOS).mul(121).toFixed(6)).toBe("3472.000000");
    expect(formatPlain(std(RATIOS), 3)).toBe("5.357");
  });
  it("the sample variance divides by n − 1: 3,472 ÷ 121 × 11 ÷ 10", () => {
    expect(sampleVariance(RATIOS).mul(110).toFixed(6)).toBe("3472.000000");
    expect(() => sampleVariance([5])).toThrow();
  });
  it("a constant series has no spread", () => {
    expect(std([7, 7, 7]).toString()).toBe("0");
  });
});

describe("percentiles (linear method, the spreadsheet's PERCENTILE.INC)", () => {
  it("positions: 1 + (n − 1)·p/100", () => {
    expect(percentilePosition(11, 50).toString()).toBe("6");
    expect(percentilePosition(11, 25).toString()).toBe("3.5");
    expect(percentilePosition(11, 90).toString()).toBe("10");
  });
  it("on the sorted eleven (28 30 31 33 34 35 36 38 40 42 47)", () => {
    expect(median(RATIOS).toString()).toBe("35");
    expect(percentile(RATIOS, 10).toString()).toBe("30");
    expect(percentile(RATIOS, 25).toString()).toBe("32");
    expect(percentile(RATIOS, 75).toString()).toBe("39");
    expect(percentile(RATIOS, 90).toString()).toBe("42");
    expect(percentile(RATIOS, 0).toString()).toBe("28");
    expect(percentile(RATIOS, 100).toString()).toBe("47");
  });
  it("the median of an even count is the mean of the two middle values", () => {
    expect(median([1, 2, 3, 10]).toString()).toBe("2.5");
  });
  it("one outlier moves the mean and leaves the median", () => {
    const moved = [...RATIOS.slice(0, 4), 150, ...RATIOS.slice(5)];
    expect(median(moved).toString()).toBe("35");
    expect(mean(moved).gt(mean(RATIOS).plus(9))).toBe(true);
  });
  it("nearest rank is a different method: 25th percentile of the eleven is the 3rd value, 31", () => {
    expect(percentileNearestRank(RATIOS, 25).toString()).toBe("31");
    expect(percentileNearestRank(RATIOS, 0).toString()).toBe("28");
  });
  it("refuses a percent outside 0–100", () => {
    expect(() => percentile(RATIOS, 101)).toThrow();
  });
});

describe("a discrete distribution", () => {
  const die = [1, 2, 3, 4, 5, 6].map((value) => ({ value, count: 1 }));
  const twoDice = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value, k) => ({ value, count: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][k] }));
  it("a fair die: expectation 3.5, variance 35/12", () => {
    expect(expectation(die).toString()).toBe("3.5");
    expect(distributionVariance(die).mul(12).toFixed(10)).toBe("35.0000000000");
  });
  it("two dice: 36 cases, expectation 7, P(sum ≥ 10) = 6/36", () => {
    expect(twoDice.reduce((s, o) => s + o.count, 0)).toBe(36);
    expect(expectation(twoDice).toString()).toBe("7");
    expect(probabilityBetween(twoDice, 10, 12).mul(36).toFixed(10)).toBe("6.0000000000");
    expect(distributionStd(twoDice).pow(2).mul(6).toFixed(8)).toBe("35.00000000");
  });
  it("probabilities add up to 1", () => {
    expect(distribution(twoDice).reduce((s, r) => s.plus(r.probability), sum([])).toFixed(20)).toBe("1.00000000000000000000");
  });
  it("the expectation need not be a possible outcome", () => {
    expect(die.some((o) => o.value === 3.5)).toBe(false);
  });
  it("refuses zero total count", () => {
    expect(() => expectation([{ value: 1, count: 0 }])).toThrow();
  });
});

describe("the least-squares line", () => {
  // (1,2) (2,3) (3,5) (4,4) (5,6): x̄ = 3, ȳ = 4, Σ(x−x̄)(y−ȳ) = 9, Σ(x−x̄)² = 10 → a = 0.9, b = 1.3 (by hand)
  const pts = [
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 4 },
    { x: 5, y: 6 },
  ];
  it("fits y = 0.9x + 1.3", () => {
    const line = linearFit(pts);
    expect(line.a.toFixed(6)).toBe("0.900000");
    expect(line.b.toFixed(6)).toBe("1.300000");
    expect(predict(line, 6).toFixed(2)).toBe("6.70");
  });
  it("residuals: −0.2, −0.1, 1.0, −0.9, 0.2; MAE 0.48; SSE 1.9; RMSE √0.38", () => {
    const line = linearFit(pts);
    expect(residuals(pts, line).map((r) => r.toFixed(2))).toEqual(["-0.20", "-0.10", "1.00", "-0.90", "0.20"]);
    const e = errors(pts, line);
    expect(e.mae.toFixed(4)).toBe("0.4800");
    expect(e.sse.toFixed(4)).toBe("1.9000");
    expect(e.rmse.toFixed(4)).toBe("0.6164");
  });
  it("the fitted line has the smallest SSE: a nearby line is worse", () => {
    const line = linearFit(pts);
    const best = errors(pts, line).sse;
    for (const [da, db] of [[0.1, 0], [-0.1, 0], [0, 0.2], [0, -0.2]]) {
      expect(errors(pts, { a: line.a.plus(da), b: line.b.plus(db) }).sse.gt(best)).toBe(true);
    }
  });
  it("the residuals of the fitted line add up to zero", () => {
    expect(sum(residuals(pts, linearFit(pts))).abs().lt("1e-30")).toBe(true);
  });
  it("RMSE is never below MAE, and one big miss widens the gap", () => {
    const a = errors(pts, { a: 1, b: 1 });
    expect(a.rmse.gte(a.mae)).toBe(true);
    const wild = errors([...pts, { x: 6, y: 20 }], { a: 1, b: 1 });
    expect(wild.rmse.minus(wild.mae).gt(a.rmse.minus(a.mae))).toBe(true);
  });
  it("refuses one point, or all x equal", () => {
    expect(() => linearFit([{ x: 1, y: 1 }])).toThrow();
    expect(() => linearFit([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toThrow();
  });
});

describe("formatPlain", () => {
  it("rounds half up and strips zeros", () => {
    expect(formatPlain("35.8181818", 1)).toBe("35.8");
    expect(formatPlain("3.0000", 2)).toBe("3");
    expect(formatPlain("0.125", 2)).toBe("0.13");
    expect(formatPlain("-0.001", 2)).toBe("0");
  });
});
