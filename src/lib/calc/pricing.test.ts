import { describe, expect, it } from "vitest";
import { towerRate, towerSpread } from "./pricing.ts";

describe("towerRate", () => {
  it("adds the parts to the anchor without binary-float noise", () => {
    expect(towerRate("4", ["0.1", "0.2"])).toBe("4.3");
    expect(towerRate("4.75", ["-0.8"])).toBe("3.95");
    expect(towerRate("3", [])).toBe("3");
  });
  it("sums a spread", () => {
    expect(towerSpread(["0.1", "0.2", "0.05"])).toBe("0.35");
    expect(towerSpread([])).toBe("0");
  });
});
