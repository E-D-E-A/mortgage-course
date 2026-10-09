import { describe, expect, it } from "vitest";
import {
  balanceAtStart,
  combinations,
  cutTo,
  interestPart,
  principalPart,
  remainder,
  shareFraction,
  shareOf,
  sliceAmount,
  splitByWeights,
  sum,
  weightShare,
  yearPayment,
} from "./mix.ts";

const strings = (ds: { toFixed: (n: number) => string }[]) => ds.map((d) => d.toFixed(2));

describe("splitting a loan into slices", () => {
  it("takes a percent of the loan", () => {
    // 60% of 100,000 = 60,000; 30% of 800,000 = 240,000 (by hand).
    expect(sliceAmount(100000, 60).toString()).toBe("60000");
    expect(sliceAmount(800000, 30).toString()).toBe("240000");
  });

  it("splits by percents and adds up to the loan", () => {
    // 1,640,000 at 40/35/25: 656,000 + 574,000 + 410,000 = 1,640,000 (by hand).
    const parts = splitByWeights(1640000, [40, 35, 25]);
    expect(strings(parts)).toEqual(["656000.00", "574000.00", "410000.00"]);
    expect(sum(parts).toString()).toBe("1640000");
  });

  it("splits into exact thirds: the last slice takes the rounding", () => {
    // 1,640,000 ÷ 3 = 546,666.666…: two slices of 546,666.67, and 1,640,000 − 1,093,333.34 = 546,666.66.
    const parts = splitByWeights(1640000, [1, 1, 1]);
    expect(strings(parts)).toEqual(["546666.67", "546666.67", "546666.66"]);
    expect(sum(parts).toFixed(2)).toBe("1640000.00");
    // The division goes on: 546,666.6666… cut, not rounded, to four places.
    expect(cutTo(sliceAmount(1640000, 1, 3), 4).toFixed(4)).toBe("546666.6666");
    // 1,000,000 ÷ 3: 333,333.33 twice, then 333,333.34.
    expect(strings(splitByWeights(1000000, [1, 1, 1]))).toEqual(["333333.33", "333333.33", "333333.34"]);
  });

  it("refuses an empty or a non-positive split", () => {
    expect(() => splitByWeights(1000, [])).toThrow(RangeError);
    expect(() => splitByWeights(1000, [50, 0])).toThrow(RangeError);
  });

  it("finds a slice's share and the slice that is left", () => {
    // 300,000 of 1,000,000 = 30%; 700,000 of 1,200,000 = 58.333…%.
    expect(shareOf(300000, 1000000).toString()).toBe("30");
    expect(shareOf(700000, 1200000).toDecimalPlaces(2).toString()).toBe("58.33");
    expect(shareFraction(300000, 1000000).toString()).toBe("0.3");
    // 1,200,000 − 500,000 − 380,000 = 320,000.
    expect(remainder(1200000, [500000, 380000]).toString()).toBe("320000");
    expect(() => shareOf(1, 0)).toThrow(RangeError);
    // Two of three equal tracks: 66.666…% → 66.67.
    expect(weightShare(2, 3).toDecimalPlaces(2).toString()).toBe("66.67");
  });
});

describe("independent questions multiply", () => {
  it("counts combinations", () => {
    expect(combinations([2, 2, 2])).toBe(8);
    expect(combinations([3, 2])).toBe(6);
    expect(() => combinations([2, 0])).toThrow(RangeError);
  });
});

describe("two ways to return the principal, year by year", () => {
  it("equal principal: 120,000 over 10 years at 5%", () => {
    // Year 1: 12,000 principal + 6,000 interest = 18,000. Year 2: debt 108,000; at 5% 5,400, at 6% 6,480.
    expect(principalPart(120000, 10, "equal_principal", 1).toString()).toBe("12000");
    expect(interestPart(120000, 10, "equal_principal", 1, "5").toString()).toBe("6000");
    expect(yearPayment(120000, 10, "equal_principal", 1, "5").toString()).toBe("18000");
    expect(balanceAtStart(120000, 10, "equal_principal", 2).toString()).toBe("108000");
    expect(yearPayment(120000, 10, "equal_principal", 2, "5").toString()).toBe("17400");
    expect(yearPayment(120000, 10, "equal_principal", 2, "6").toString()).toBe("18480");
  });

  it("interest only: the principal waits for the last year", () => {
    // Year 2: 120,000 × 5% = 6,000, or × 6% = 7,200. Year 10: 120,000 + 6,000 = 126,000.
    expect(yearPayment(120000, 10, "interest_only", 2, "5").toString()).toBe("6000");
    expect(yearPayment(120000, 10, "interest_only", 2, "6").toString()).toBe("7200");
    expect(yearPayment(120000, 10, "interest_only", 10, "5").toString()).toBe("126000");
  });

  it("200,000 over 20 years: year 2 at 5% after a 4% first year", () => {
    // 10,000 principal; debt 190,000 × 5% = 9,500; payment 19,500.
    expect(yearPayment(200000, 20, "equal_principal", 2, "5").toString()).toBe("19500");
    expect(() => principalPart(1000, 10, "equal_principal", 11)).toThrow(RangeError);
  });
});
