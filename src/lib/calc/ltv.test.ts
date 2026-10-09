import { describe, expect, it } from "vitest";
import { cushionPercent, loanNeeded, loanPerEquityShekel, ltvPercent, maxLoan, maxPrice, minEquity, saleSplit } from "./ltv.ts";
import { percentString } from "./percent.ts";

const split = (sale: string, debt: string) => {
  const s = saleSplit(sale, debt);
  return [s.toLender.toString(), s.toBorrower.toString(), s.stillOwed.toString()];
};

describe("the pledged home is sold (lesson 1.1)", () => {
  it("pays the debt first, and the rest to the borrower", () => {
    // 1,200,000 sale, 500,000 debt: the lender takes 500,000, 700,000 is left (by hand).
    expect(split("1200000", "500000")).toEqual(["500000", "700000", "0"]);
  });

  it("leaves the uncovered part of the debt still owed", () => {
    // 550,000 sale, 600,000 debt: all 550,000 to the lender, 50,000 still owed.
    expect(split("550000", "600000")).toEqual(["550000", "0", "50000"]);
  });

  it("covers the debt exactly at the edge", () => {
    expect(split("600000", "600000")).toEqual(["600000", "0", "0"]);
  });

  it("refuses negative amounts", () => {
    expect(() => saleSplit("-1", "0")).toThrow(RangeError);
    expect(() => saleSplit("1", "-1")).toThrow(RangeError);
  });

  it("measures how far the value can fall before the sale stops covering the debt", () => {
    // (1,000,000 − 600,000) ÷ 1,000,000 = 40%; (1,500,000 − 780,000) ÷ 1,500,000 = 48%.
    expect(cushionPercent("1000000", "600000").toString()).toBe("40");
    expect(cushionPercent("1500000", "780000").toString()).toBe("48");
    expect(cushionPercent("500000", "600000").toString()).toBe("0");
    expect(() => cushionPercent("0", "1")).toThrow(RangeError);
  });
});

describe("equity and the financing ratio (lesson 1.2)", () => {
  it("finds the loan from the price and the equity", () => {
    // 2,200,000 − 560,000 = 1,640,000 (case A).
    expect(loanNeeded("2200000", "560000").toString()).toBe("1640000");
    expect(() => loanNeeded("100", "200")).toThrow(RangeError);
  });

  it("computes the financing ratio", () => {
    // 750,000 ÷ 1,000,000 = 75%. 1,640,000 ÷ 2,200,000 = 74.5454...% → 74.55 (two decimals), 74.5 (one).
    expect(ltvPercent("750000", "1000000").toString()).toBe("75");
    const a = ltvPercent("1640000", "2200000");
    expect(percentString(a)).toBe("74.55");
    expect(a.toDecimalPlaces(1).toString()).toBe("74.5");
    // Just over the ceiling, yet "75" when shown with two decimals.
    expect(percentString(ltvPercent("1500050", "2000000"))).toBe("75");
    expect(ltvPercent("1500050", "2000000").gt(75)).toBe(true);
    expect(() => ltvPercent("1", "0")).toThrow(RangeError);
  });

  it("finds the largest loan and the least equity under a ceiling", () => {
    // 1,000,000 at 75 / 70 / 50%: loans 750,000 / 700,000 / 500,000; equity 250,000 / 300,000 / 500,000.
    expect(maxLoan("1000000", "75").toString()).toBe("750000");
    expect(maxLoan("1000000", "70").toString()).toBe("700000");
    expect(minEquity("1000000", "1000000", "50").toString()).toBe("500000");
    // Case A: 2,200,000 × 75% = 1,650,000; equity at least 550,000.
    expect(maxLoan("2200000", "75").toString()).toBe("1650000");
    expect(minEquity("2200000", "2200000", "75").toString()).toBe("550000");
    // A value below the price: 1,000,000 price, 950,000 value, 75% → loan 712,500, equity 287,500.
    expect(maxLoan("950000", "75").toString()).toBe("712500");
    expect(minEquity("1000000", "950000", "75").toString()).toBe("287500");
    expect(() => maxLoan("1", "101")).toThrow(RangeError);
  });

  it("finds the dearest home some equity can buy", () => {
    // 560,000 is 25% of 2,240,000.
    expect(maxPrice("560000", "75").toString()).toBe("2240000");
    expect(() => maxPrice("1", "100")).toThrow(RangeError);
  });

  it("counts the lender's shekels per shekel of equity", () => {
    // 750,000 ÷ 250,000 = 3.
    expect(loanPerEquityShekel("750000", "250000").toString()).toBe("3");
    expect(() => loanPerEquityShekel("1", "0")).toThrow(RangeError);
  });
});
