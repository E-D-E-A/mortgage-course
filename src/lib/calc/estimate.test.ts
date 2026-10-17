import { describe, expect, it } from "vitest";
import { stepFromOffers, intervalWidth, lineVersusStep, meanInterval, shrinkTable, slopeInterval, stepEstimate, tCritical, updateNormal } from "./estimate.ts";

describe("t table", () => {
  it("exact rows, and the lower row in between", () => {
    expect(tCritical(2)).toBe("4.303");
    expect(tCritical(10)).toBe("2.228");
    expect(tCritical(12)).toBe("2.228"); // between 10 and 15: the cautious (larger) value
    expect(tCritical(500)).toBe("1.980");
    expect(() => tCritical(0)).toThrow();
  });
});

describe("meanInterval — by hand: 2, 4, 6, 8 → mean 5, sample sd √(20/3)", () => {
  const r = meanInterval([2, 4, 6, 8]);
  it("mean, sd, se", () => {
    expect(r.mean).toBe("5.0000");
    expect(r.sd).toBe("2.5820"); // √6.6667
    expect(r.se).toBe("1.2910"); // 2.5820 ÷ 2
  });
  it("t for 3 degrees of freedom is 3.182: 5 ± 3.182 × 1.29099 (unrounded)", () => {
    expect(r.t).toBe("3.182");
    expect(r.low).toBe("0.8921");
    expect(r.high).toBe("9.1079");
  });
});

describe("stepEstimate — below 1,1,3 (mean 1.6667) and above 5,7,9 (mean 7)", () => {
  const r = stepEstimate([1, 1, 3], [5, 7, 9]);
  it("the step is the difference of means", () => {
    expect(r.meanBelow).toBe("1.6667");
    expect(r.meanAbove).toBe("7.0000");
    expect(r.step).toBe("5.3333");
  });
  it("se = √(s²/n + s²/n): variances 1.3333 and 4 → √(0.4444 + 1.3333) = 1.3333; df 2, t 4.303", () => {
    expect(r.se).toBe("1.3333");
    expect(r.df).toBe(2);
    expect(r.low).toBe("-0.4040");
    expect(r.high).toBe("11.0707");
  });
});

describe("slopeInterval — points on y = 2x + 1 with small errors", () => {
  it("slope 2 with a narrow interval around it", () => {
    const r = slopeInterval([{ x: 1, y: 3.1 }, { x: 2, y: 4.9 }, { x: 3, y: 7.1 }, { x: 4, y: 8.9 }, { x: 5, y: 11.0 }]);
    expect(r.slope).toBe("1.9800");
    expect(Number(r.low)).toBeLessThan(1.98);
    expect(Number(r.high)).toBeGreaterThan(1.98);
    expect(Number(r.high) - Number(r.low)).toBeLessThan(0.5);
  });
});

describe("lineVersusStep — data that really steps", () => {
  it("the step model fits a step exactly, the line cannot", () => {
    const offers = [30, 40, 50, 60, 70, 80].map((ltv) => ({ ltv, margin: ltv <= 55 ? 1 : 2 }));
    const r = lineVersusStep(offers, 55);
    expect(r.stepMae).toBe("0.0000");
    expect(Number(r.lineMae)).toBeGreaterThan(0.1);
  });
});

describe("updateNormal — the prior and the data pull", () => {
  it("no data: the prior stays", () => {
    expect(updateNormal({ mean: "0.30", sd: "0.10" }, 0, "0.50", "0.20")).toEqual({ n: 0, priorWeight: "1.0000", mean: "0.3000", sd: "0.1000" });
  });
  it("by hand: prior precision 100, data precision 4/0.04 = 100 → equal weights, mean 0.40, sd √(1/200)", () => {
    const r = updateNormal({ mean: "0.30", sd: "0.10" }, 4, "0.50", "0.20");
    expect(r).toEqual({ n: 4, priorWeight: "0.5000", mean: "0.4000", sd: "0.0707" });
  });
  it("more data, less prior", () => {
    const t = shrinkTable({ mean: "0.30", sd: "0.10" }, "0.50", "0.20", [0, 4, 16, 64]);
    expect(t.map((x) => x.priorWeight)).toEqual(["1.0000", "0.5000", "0.2000", "0.0588"]);
  });
  it("interval width falls like 1/√n", () => {
    expect(intervalWidth("1", 4)).toBe("3.1820"); // 2 × 3.182 × 1 ÷ 2
  });
});

describe("stepFromOffers", () => {
  const offers = [
    { ltv: 40, margin: 1 }, { ltv: 50, margin: 1 }, { ltv: 60, margin: 3 }, // at or below 60: 1, 1, 3
    { ltv: 70, margin: 5 }, { ltv: 80, margin: 7 }, { ltv: 90, margin: 9 }, // above: 5, 7, 9
  ];
  it("the same numbers as stepEstimate by hand, then the prior's pull", () => {
    const c = stepFromOffers(offers, 60, { mean: "0", sd: "1.3333" });
    expect(c.nBelow).toBe(3);
    expect(c.nAbove).toBe(3);
    expect(c.estimate?.step).toBe("5.3333");
    expect(c.estimate?.se).toBe("1.3333");
    // Prior sd 1.3333 and data se 1.3333: equal precision, so the prior weighs half and the mean is half of 5.3333.
    expect(c.posterior.priorWeight).toBe("0.5000");
    expect(Number(c.posterior.mean)).toBeCloseTo(2.6667, 3);
  });
  it("no data about the step: the prior stays", () => {
    const c = stepFromOffers(offers.slice(0, 3), 60, { mean: "0.25", sd: "0.08" });
    expect(c.estimate).toBeNull();
    expect(c.posterior).toEqual({ n: 0, priorWeight: "1.0000", mean: "0.2500", sd: "0.0800" });
  });
});
