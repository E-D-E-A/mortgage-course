import { describe, expect, it } from "vitest";
import { primeFromPolicy, rateAfterCuts, rateChange, rateForSpreadIncome, ratePath, relativeDrop, spread, yearInterest } from "./lending.ts";

describe("spread and a year's interest", () => {
  it("subtracts rates in percentage points", () => {
    expect(spread("5", "2").toString()).toBe("3");
    expect(spread("4.5", "2.75").toString()).toBe("1.75");
  });

  it("computes one year's interest", () => {
    // 100,000 × 5% = 5,000; 400,000 × 2.75% = 11,000 (by hand).
    expect(yearInterest(100000, "5").toString()).toBe("5000");
    expect(yearInterest(400000, "2.75").toString()).toBe("11000");
  });

  it("finds the loan rate for a wanted spread income", () => {
    // 6,000 ÷ 300,000 = 2%, plus a 2.5% cost of funds = 4.5%.
    expect(rateForSpreadIncome(300000, 6000, "2.5").toString()).toBe("4.5");
    expect(() => rateForSpreadIncome(0, 1, "1")).toThrow(RangeError);
  });
});

describe("the Bank of Israel rate", () => {
  it("adds 1.5 points for the prime", () => {
    expect(primeFromPolicy("3.25").toString()).toBe("4.75");
    expect(primeFromPolicy("1").toString()).toBe("2.5");
  });

  it("tells percentage points from percent", () => {
    // 4.25 → 3.25: one point down, which is 1 ÷ 4.25 = 23.529...% of the rate.
    expect(rateChange("4.25", "3.25").toString()).toBe("-1");
    expect(relativeDrop("4.25", "3.25").toDecimalPlaces(2).toString()).toBe("23.53");
  });

  it("walks a path of decisions", () => {
    const rows = ratePath("4.25", [
      { date: "2026-01-05", rate: "4" },
      { date: "2026-02-23", rate: "4" },
    ]);
    expect(rows.map((r) => [r.before.toString(), r.rate.toString(), r.change.toString(), r.prime.toString()])).toEqual([
      ["4.25", "4", "-0.25", "5.5"],
      ["4", "4", "0", "5.5"],
    ]);
  });
});

describe("rateAfterCuts", () => {
  it("subtracts equal cuts in percentage points", () => {
    // 3.25 − 2 × 0.25 = 2.75.
    expect(rateAfterCuts("3.25", "0.25", 2).toString()).toBe("2.75");
    expect(() => rateAfterCuts("3", "0.25", 1.5)).toThrow(RangeError);
  });
});
