import { describe, expect, it } from "vitest";
import {
  balanceAfterYear,
  balanceTable,
  indexationAdded,
  interestOn,
  interestOnIndexation,
  rateChangeInterest,
  yearInterest,
  yearParts,
} from "./balance.ts";
import { moneyString } from "./money.ts";

describe("the two forces, one at a time", () => {
  it("interest is the rate times the balance", () => {
    // 500,000 × 5% = 25,000 (by hand).
    expect(moneyString(interestOn("500000", "5"))).toBe("25000.00");
  });

  it("a rate change adds interest, not balance: 500,000 × (6% − 5%) = 5,000", () => {
    expect(moneyString(rateChangeInterest("500000", "5", "6"))).toBe("5000.00");
    // A fall gives a negative extra: 500,000 × (4.5% − 5%) = −2,500.
    expect(moneyString(rateChangeInterest("500000", "5", "4.5"))).toBe("-2500.00");
  });

  it("indexation moves the balance itself: 500,000 × 2% = 10,000", () => {
    expect(moneyString(indexationAdded("500000", "2"))).toBe("10000.00");
  });

  it("interest on an indexed balance: 510,000 × 3% = 15,300 = 15,000 + 300", () => {
    expect(moneyString(yearInterest("500000", "3", "2"))).toBe("15300.00");
    expect(moneyString(interestOnIndexation("500000", "3", "2"))).toBe("300.00");
    // Unindexed: π = 0.
    expect(moneyString(yearInterest("500000", "5"))).toBe("25000.00");
  });
});

describe("balanceAfterYear", () => {
  it("the lesson's indexed example: 500,000 + 10,000 + 15,300 − 30,000 = 495,300", () => {
    expect(moneyString(balanceAfterYear("500000", "3", "2", "30000"))).toBe("495300.00");
  });

  it("unindexed at 5% and at 6% with a 30,000 payment: 495,000 and 500,000", () => {
    expect(moneyString(balanceAfterYear("500000", "5", "0", "30000"))).toBe("495000.00");
    expect(moneyString(balanceAfterYear("500000", "6", "0", "30000"))).toBe("500000.00");
  });

  it("equals P × (1 + π) × (1 + r) − C", () => {
    // 600,000 × 1.025 × 1.03 − 36,000 = 633,450 − 36,000 = 597,450 (by hand).
    expect(moneyString(balanceAfterYear("600000", "3", "2.5", "36000"))).toBe("597450.00");
  });
});

describe("yearParts", () => {
  it("splits the year into its forces, and they add up to the change", () => {
    const y = yearParts({ balance: "500000", ratePercent: "3", newRatePercent: "3.5", inflationPercent: "2", payment: "30000" });
    // 10,000 indexation; 15,000 base interest; 2,500 from the change; 510,000... the addition's interest 10,000 × 3.5% = 350.
    expect(moneyString(y.indexation)).toBe("10000.00");
    expect(moneyString(y.interestBase)).toBe("15000.00");
    expect(moneyString(y.interestFromChange)).toBe("2500.00");
    expect(moneyString(y.interestOnIndexation)).toBe("350.00");
    expect(moneyString(y.interest)).toBe("17850.00");
    // 500,000 + 10,000 + 17,850 − 30,000 = 497,850.
    expect(moneyString(y.closing)).toBe("497850.00");
    expect(moneyString(y.change)).toBe("-2150.00");
    // Of the 30,000 paid, 30,000 − 17,850 − 10,000 = 2,150 reduced the balance.
    expect(moneyString(y.principalPaid)).toBe("2150.00");
    // The interest is the same as charging the new rate on the indexed balance.
    expect(moneyString(y.interest)).toBe(moneyString(yearInterest("500000", "3.5", "2")));
  });

  it("with nothing but interest, the change is interest minus payment", () => {
    const y = yearParts({ balance: "300000", ratePercent: "4", payment: "24000" });
    expect(moneyString(y.closing)).toBe("288000.00");
    expect(moneyString(y.indexation)).toBe("0.00");
    expect(moneyString(y.interestFromChange)).toBe("0.00");
  });
});

describe("balanceTable", () => {
  it("rounds each year's parts to the agora, and each row adds up", () => {
    const rows = balanceTable("100000", "3", "2", "8000", 3);
    // Year 1: 2,000; 3% × 102,000 = 3,060; 102,000 + 3,060 − 8,000 = 97,060.
    expect(rows[0].indexation.toFixed(2)).toBe("2000.00");
    expect(rows[0].interest.toFixed(2)).toBe("3060.00");
    expect(rows[0].closing.toFixed(2)).toBe("97060.00");
    // Year 2: 97,060 × 2% = 1,941.20; 3% × 99,001.20 = 2,970.036 → 2,970.04; 99,001.20 + 2,970.04 − 8,000 = 93,971.24.
    expect(rows[1].indexation.toFixed(2)).toBe("1941.20");
    expect(rows[1].interest.toFixed(2)).toBe("2970.04");
    expect(rows[1].closing.toFixed(2)).toBe("93971.24");
    // Year 3: 93,971.24 × 2% = 1,879.4248 → 1,879.42; 3% × 95,850.66 = 2,875.5198 → 2,875.52; − 8,000 → 90,726.18.
    expect(rows[2].indexation.toFixed(2)).toBe("1879.42");
    expect(rows[2].interest.toFixed(2)).toBe("2875.52");
    expect(rows[2].closing.toFixed(2)).toBe("90726.18");
    for (const r of rows) expect(r.opening.plus(r.indexation).plus(r.interest).minus(8000).eq(r.closing)).toBe(true);
  });

  it("refuses a table of no years", () => {
    expect(() => balanceTable("1000", "3", "2", "100", 0)).toThrow(RangeError);
  });
});
