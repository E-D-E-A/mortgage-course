import { describe, expect, it } from "vitest";
import {
  compoundBalance,
  compoundTable,
  exactPeriodsToDouble,
  periodsToDouble,
  ruleOf72,
  simpleBalance,
} from "./compound.ts";
import { formatShekels, moneyString } from "./money.ts";

describe("compoundBalance", () => {
  it("adds interest on interest", () => {
    // 1,000 at 10% for 2 years: 1,000 → 1,100 → 1,210 (worked by hand).
    expect(compoundBalance(1000, "10", 2).toString()).toBe("1210");
  });

  it("matches the lesson's prediction question to the agora", () => {
    // 10,000 × 1.05^10 = 16,288.946267...
    expect(moneyString(compoundBalance(10000, "5", 10))).toBe("16288.95");
  });

  it("leaves the principal alone over zero periods", () => {
    expect(compoundBalance(5000, "7", 0).toString()).toBe("5000");
  });

  it("refuses a fractional or negative number of periods", () => {
    expect(() => compoundBalance(1, "5", 1.5)).toThrow(RangeError);
    expect(() => compoundBalance(1, "5", -1)).toThrow(RangeError);
  });
});

describe("simpleBalance", () => {
  it("pays interest on the principal only", () => {
    expect(simpleBalance(10000, "5", 10).toString()).toBe("15000");
  });

  it("agrees with compound interest for one period", () => {
    expect(simpleBalance(8000, "4", 1).eq(compoundBalance(8000, "4", 1))).toBe(true);
  });
});

describe("compoundTable", () => {
  const rows = compoundTable(10000, "5", 3);

  it("splits each year's interest into interest on principal and interest on interest", () => {
    expect(rows.map((r) => r.interest.toString())).toEqual(["500", "525", "551.25"]);
    expect(rows.map((r) => r.interestOnInterest.toString())).toEqual(["0", "25", "51.25"]);
  });

  it("chains each closing balance into the next opening balance", () => {
    expect(rows[1].opening.eq(rows[0].closing)).toBe(true);
    expect(rows[2].closing.eq(compoundBalance(10000, "5", 3))).toBe(true);
  });

  it("rounds each period's interest to the agora, so every row adds up", () => {
    const five = compoundTable(10000, "5", 5);
    for (const row of five) {
      expect(row.opening.plus(row.interest).eq(row.closing)).toBe(true);
      expect(row.interest.decimalPlaces()).toBeLessThanOrEqual(2);
    }
    // The statement ends one agora below the formula rounded once at the end.
    expect(moneyString(five[4].closing)).toBe("12762.81");
    expect(moneyString(compoundBalance(10000, "5", 5))).toBe("12762.82");
  });
});

describe("doubling", () => {
  it("finds the first whole year the balance has doubled", () => {
    // 1.06^11 = 1.898..., 1.06^12 = 2.012...
    expect(periodsToDouble("6")).toBe(12);
  });

  it("keeps the rule of 72 close to the exact answer", () => {
    expect(ruleOf72("6").toString()).toBe("12");
    expect(exactPeriodsToDouble("6").toDecimalPlaces(2).toString()).toBe("11.9");
  });
});

describe("formatShekels", () => {
  it("shows thousands separators and agorot", () => {
    expect(formatShekels("16288.946")).toBe("16,288.95 ₪");
  });
});
