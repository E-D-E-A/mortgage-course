import { describe, expect, it } from "vitest";
import { DEMO_ANCHOR, DEMO_MODEL, fitError, marginOf, rateOf, stepAt, stepSize, syntheticOffers, whatIf } from "./pricingmodel.ts";

// By hand, with the demo model (base 0.80; financing over 40: +0.10, over 60: +0.35; payment over 40: +0.25):
//   financing 55, payment 35  → 0.80 + 0.10 + 0 = 0.90
//   financing 65, payment 45  → 0.80 + 0.35 + 0.25 = 1.40
describe("steps are flat between thresholds and jump just above them", () => {
  it("strictly above: exactly 40 is still in the lower band", () => {
    expect(stepAt(DEMO_MODEL.ltv, 40)).toBe("0.00");
    expect(stepAt(DEMO_MODEL.ltv, "40.01")).toBe("0.10");
    expect(stepAt(DEMO_MODEL.ltv, 60)).toBe("0.10");
    expect(stepAt(DEMO_MODEL.ltv, 61)).toBe("0.35");
    expect(stepAt(DEMO_MODEL.ltv, 75)).toBe("0.35");
  });
  it("the margin and the rate", () => {
    expect(marginOf(DEMO_MODEL, { ltv: 55, pti: 35 })).toBe("0.90");
    expect(marginOf(DEMO_MODEL, { ltv: 65, pti: 45 })).toBe("1.40");
    expect(rateOf(DEMO_ANCHOR, DEMO_MODEL, { ltv: 65, pti: 45 })).toBe("5.60");
  });
  it("stepSize between two values", () => {
    expect(stepSize(DEMO_MODEL.ltv, 55, 65)).toBe("0.25"); // 0.35 − 0.10
    expect(stepSize(DEMO_MODEL.ltv, 65, 55)).toBe("-0.25");
    expect(stepSize(DEMO_MODEL.ltv, 50, 58)).toBe("0.00"); // same band
  });
});

describe("whatIf", () => {
  it("more equity: from 65% financing to 60% drops the 0.25 step", () => {
    const w = whatIf(DEMO_ANCHOR, DEMO_MODEL, { ltv: 65, pti: 35 }, { ltv: 60 });
    expect(w.before).toEqual({ margin: "1.15", rate: "5.35" });
    expect(w.after).toEqual({ margin: "0.90", rate: "5.10" });
    expect(w.change).toBe("-0.25");
  });
});

describe("syntheticOffers", () => {
  // A fake source that returns 0, 1, 2, ... modulo n, so the draws can be followed by hand.
  const counter = () => {
    let k = 0;
    return { int: (n: number) => k++ % n };
  };
  it("draws ltv, pti, noise in that order; margin = model + noise/100", () => {
    const offers = syntheticOffers(DEMO_MODEL, 2, counter(), 5);
    // offer 1: draws 0,1,2 → ltv 30, pti 21, noise 2−5 = −3 → 0.80 − 0.03 = 0.77
    // offer 2: draws 3,4,5 → ltv 33, pti 24, noise 5−5 = 0 → 0.80
    expect(offers).toEqual([
      { ltv: "30", pti: "21", margin: "0.77" },
      { ltv: "33", pti: "24", margin: "0.80" },
    ]);
  });
  it("fitError is the mean absolute difference", () => {
    const offers = syntheticOffers(DEMO_MODEL, 2, counter(), 5);
    expect(fitError(DEMO_MODEL, offers)).toBe("0.0150"); // (0.03 + 0) / 2
    expect(fitError({ ...DEMO_MODEL, base: "0.90" }, offers)).toBe("0.1150"); // (0.13 + 0.10) / 2
  });
});
