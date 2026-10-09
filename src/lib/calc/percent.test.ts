import { describe, expect, it } from "vitest";
import {
  afterChange,
  addedPercents,
  afterChanges,
  combinedFactor,
  percentAsDecimal,
  product,
  changeFactor,
  onePercent,
  percentagePoints,
  percentOf,
  percentString,
  relativeChangePercent,
  sharePercent,
} from "./percent.ts";
import { simpleBalance } from "./compound.ts";
import { quotient, simpleInterest, simpleInterestTable } from "./simple.ts";

describe("percentOf", () => {
  it("takes hundredths of an amount", () => {
    // 3% of 200: one hundredth is 2, three of them are 6 (worked by hand).
    expect(percentOf(200, "3").toString()).toBe("6");
    expect(percentOf(5000, "3").toString()).toBe("150");
    expect(onePercent(5000).toString()).toBe("50");
  });

  it("handles a fractional percent without a float error", () => {
    // 2.5% of 12,000 = 300; 0.1 + 0.2 style float noise must not appear.
    expect(percentOf(12000, "2.5").toString()).toBe("300");
    expect(percentOf(64, "25").toString()).toBe("16");
  });
});

describe("afterChange and afterChanges", () => {
  it("adds 10% by multiplying by 1.1", () => {
    expect(changeFactor("10").toString()).toBe("1.1");
    expect(afterChange(200, "10").toString()).toBe("220");
  });

  it("does not come back after +10% then −10%", () => {
    // 200 → 220 → 220 − 22 = 198 (worked by hand).
    expect(afterChanges(200, ["10", "-10"]).toString()).toBe("198");
  });

  it("gives the same result in either order", () => {
    expect(afterChanges(200, ["-10", "10"]).eq(afterChanges(200, ["10", "-10"]))).toBe(true);
  });

  it("stacks two discounts by multiplying, not adding", () => {
    // 600 × 0.75 = 450, × 0.9 = 405: 32.5% off, not 35%.
    expect(afterChanges(600, ["-25", "-10"]).toString()).toBe("405");
  });
});

describe("sharePercent and relativeChangePercent", () => {
  it("finds what percent a part is", () => {
    expect(sharePercent(30, 200).toString()).toBe("15");
    expect(sharePercent(195, 600).toString()).toBe("32.5");
  });

  it("measures a change from where it started", () => {
    expect(relativeChangePercent(4, 5).toString()).toBe("25");
    expect(relativeChangePercent(5, 4).toString()).toBe("-20");
    expect(relativeChangePercent(200, 198).toString()).toBe("-1");
  });

  it("refuses a share of zero", () => {
    expect(() => sharePercent(1, 0)).toThrow(RangeError);
  });
});

describe("percentagePoints", () => {
  it("is the plain difference between two percentages", () => {
    expect(percentagePoints("4", "5").toString()).toBe("1");
    expect(percentagePoints("5", "4").toString()).toBe("-1");
  });
});

describe("percentString", () => {
  it("rounds to two decimals and drops trailing zeros", () => {
    expect(percentString(25)).toBe("25");
    expect(percentString("32.50")).toBe("32.5");
    expect(percentString(sharePercent(50, 300))).toBe("16.67");
    expect(percentString(100)).toBe("100");
  });
});

describe("simple interest", () => {
  it("is the same every year and adds up to principal × r × n", () => {
    // 100 at 5% for 3 years: 5 a year, 15 in all (worked by hand).
    expect(simpleInterest(100, "5", 3).toString()).toBe("15");
    expect(simpleInterest(12000, "3", 4).toString()).toBe("1440");
    const rows = simpleInterestTable(4000, "6", 4);
    expect(rows.map((r) => r.interest.toString())).toEqual(["240", "240", "240", "240"]);
    expect(rows.map((r) => r.totalInterest.toString())).toEqual(["240", "480", "720", "960"]);
  });

  it("agrees with simpleBalance", () => {
    expect(simpleInterest(30000, "4", 3).plus(30000).eq(simpleBalance(30000, "4", 3))).toBe(true);
  });

  it("refuses a fractional number of years", () => {
    expect(() => simpleInterestTable(100, "5", 1.5)).toThrow(RangeError);
  });

  it("divides for 'how many years' questions", () => {
    expect(quotient(5000, 1000).toString()).toBe("5");
    expect(() => quotient(1, 0)).toThrow(RangeError);
  });
});

describe("combinedFactor and addedPercents", () => {
  it("multiplies the factors exactly", () => {
    expect(combinedFactor(["10", "-10"]).toString()).toBe("0.99");
    expect(combinedFactor(["-25", "-10"]).toString()).toBe("0.675");
  });

  it("adds the percentages, the way the common mistake does", () => {
    expect(addedPercents(["30", "20"]).toString()).toBe("50");
  });
});

describe("percentAsDecimal and product", () => {
  it("moves the point two places", () => {
    expect(percentAsDecimal("10").toString()).toBe("0.1");
    expect(percentAsDecimal("5").toString()).toBe("0.05");
    expect(percentAsDecimal("2.5").toString()).toBe("0.025");
  });

  it("multiplies", () => {
    expect(product(400, 3).toString()).toBe("1200");
  });
});
