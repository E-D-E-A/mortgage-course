import { describe, expect, it } from "vitest";
import { moneyString } from "./money.ts";
import {
  discountFactor,
  loanBalanceTable,
  percentOffCompoundMistake,
  percentOffMistake,
  streamPercentOffMistake,
  streamTable,
  streamValueToday,
  valueLater,
  valueToday,
} from "./present-value.ts";

describe("valueLater", () => {
  it("grows an amount with compound interest", () => {
    // 1,000 at 10% for 2 years: 1,000 → 1,100 → 1,210 (worked by hand).
    expect(valueLater(1000, "10", 2).toString()).toBe("1210");
  });
});

describe("valueToday", () => {
  it("undoes one year of growth", () => {
    // 1,100 next year at 10% is 1,000 today: 1,100 ÷ 1.1.
    expect(valueToday(1100, "10", 1).toString()).toBe("1000");
    expect(valueToday(1210, "10", 2).toString()).toBe("1000");
  });

  it("is 909.09 for 1,000 next year at 10%", () => {
    // 1,000 ÷ 1.1 = 909.0909...
    expect(moneyString(valueToday(1000, "10", 1))).toBe("909.09");
    // 1,000 ÷ 1.21 = 826.4462...
    expect(moneyString(valueToday(1000, "10", 2))).toBe("826.45");
  });

  it("is 4,444.98 for 5,000 in three years at 4%", () => {
    // 1.04³ = 1.124864; 5,000 ÷ 1.124864 = 4,444.9818...
    expect(moneyString(valueToday(5000, "4", 3))).toBe("4444.98");
  });

  it("is the amount itself over zero periods", () => {
    expect(valueToday(750, "5", 0).toString()).toBe("750");
  });

  it("refuses a rate that leaves nothing to divide by", () => {
    expect(() => valueToday(1, "-100", 1)).toThrow(RangeError);
  });
});

describe("discountFactor", () => {
  it("is 1 ÷ (1 + r)^n", () => {
    expect(discountFactor("25", 1).toString()).toBe("0.8");
    expect(discountFactor("25", 2).toString()).toBe("0.64");
  });
});

describe("percentOffMistake", () => {
  it("takes r% off per period, which is not the value today", () => {
    // 1,100 − 10% × 1,100 = 990, not 1,000.
    expect(percentOffMistake(1100, "10", 1).toString()).toBe("990");
    // 5,000 × (1 − 0.12) = 4,400.
    expect(percentOffMistake(5000, "4", 3).toString()).toBe("4400");
  });
});

describe("streamValueToday", () => {
  it("adds each payment's value today", () => {
    // 1,000 ÷ 1.1 + 1,000 ÷ 1.21 + 1,000 ÷ 1.331 = 909.0909 + 826.4463 + 751.3148 = 2,486.8520
    expect(moneyString(streamValueToday(1000, "10", 3))).toBe("2486.85");
  });

  it("is worth less than the payments added up when the rate is positive", () => {
    expect(streamValueToday(500, "5", 4).lt(2000)).toBe(true);
    expect(moneyString(streamValueToday(500, "5", 4))).toBe("1772.98");
  });

  it("is the plain sum at a rate of zero", () => {
    expect(streamValueToday(300, "0", 5).toString()).toBe("1500");
  });

  it("refuses an empty stream", () => {
    expect(() => streamValueToday(1, "5", 0)).toThrow(RangeError);
  });
});

describe("streamTable", () => {
  it("has one row per payment, each smaller than the one before", () => {
    const rows = streamTable(1000, "10", 3);
    expect(rows.map((r) => moneyString(r.valueToday))).toEqual(["909.09", "826.45", "751.31"]);
    expect(rows[2].factor.lt(rows[1].factor)).toBe(true);
  });
});

describe("loanBalanceTable", () => {
  it("ends at zero when the loan is the value today of its payments", () => {
    // 2,486.85 at 10%, 1,000 a year: interest 248.69 → 1,735.54; 173.55 → 909.09; 90.91 → 0.00 (worked by hand).
    const rows = loanBalanceTable("2486.85", "10", 1000, 3);
    expect(rows.map((r) => moneyString(r.interest))).toEqual(["248.69", "173.55", "90.91"]);
    expect(rows.map((r) => moneyString(r.closing))).toEqual(["1735.54", "909.09", "0.00"]);
  });
});

describe("percentOffCompoundMistake", () => {
  it("takes r% off n times in a row", () => {
    // 5,000 × 0.96³ = 5,000 × 0.884736 = 4,423.68 (worked by hand).
    expect(percentOffCompoundMistake(5000, "4", 3).toString()).toBe("4423.68");
  });
});

describe("streamPercentOffMistake", () => {
  it("adds the percent-off values of each payment", () => {
    // simple: 5,000 × 0.96 + 5,000 × 0.92 = 4,800 + 4,600 = 9,400
    expect(streamPercentOffMistake(5000, "4", 2, "simple").toString()).toBe("9400");
    // compound: 5,000 × 0.96 + 5,000 × 0.9216 = 4,800 + 4,608 = 9,408
    expect(streamPercentOffMistake(5000, "4", 2, "compound").toString()).toBe("9408");
  });
});
