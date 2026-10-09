import { describe, expect, it } from "vitest";
import { daysLeft, disposableIncome, disposableTable, monthlyTotal } from "./household.ts";

describe("monthlyTotal", () => {
  it("adds monthly amounts", () => {
    // 12,400 + 9,300 = 21,700 (by hand).
    expect(monthlyTotal(["12400", "9300"]).toString()).toBe("21700");
    expect(monthlyTotal([900, 600]).toString()).toBe("1500");
  });

  it("is 0 for no amounts", () => {
    expect(monthlyTotal([]).toString()).toBe("0");
  });
});

describe("disposableIncome", () => {
  it("takes the fixed payments off the total income", () => {
    // 6,000 + 4,000 − 1,000 = 9,000; 12,400 + 9,300 − 1,450 = 20,250 (by hand).
    expect(disposableIncome([6000, 4000], [1000]).toString()).toBe("9000");
    expect(disposableIncome(["12400", "9300"], ["1450"]).toString()).toBe("20250");
  });

  it("subtracts every payment once", () => {
    // 10,800 + 7,600 = 18,400; 900 + 600 = 1,500; 18,400 − 1,500 = 16,900.
    expect(disposableIncome([10800, 7600], [900, 600]).toString()).toBe("16900");
  });

  it("is the total income when there are no fixed payments", () => {
    expect(disposableIncome([12400, 9300], []).toString()).toBe("21700");
  });

  it("can be negative, and says so rather than hiding it", () => {
    expect(disposableIncome([3000], [3500]).toString()).toBe("-500");
  });
});

describe("daysLeft", () => {
  it("counts the days left in a window", () => {
    // 24 − 11 = 13; a 12-day window after 11 days leaves 1.
    expect(daysLeft(24, 11)).toBe(13);
    expect(daysLeft(12, 11)).toBe(1);
  });

  it("never goes below zero", () => {
    expect(daysLeft(12, 15)).toBe(0);
  });

  it("refuses fractions and negatives", () => {
    expect(() => daysLeft(24.5, 1)).toThrow(RangeError);
    expect(() => daysLeft(24, -1)).toThrow(RangeError);
  });
});

describe("disposableTable", () => {
  it("fills each household's row", () => {
    const [row] = disposableTable([{ household: "1", incomes: [8000, 7000], fixedPayments: [900] }]);
    expect(row.payments.toString()).toBe("900");
    expect(row.disposable.toString()).toBe("14100");
  });

  it("keeps a second income of 0 for a one-earner household", () => {
    const [row] = disposableTable([{ household: "3", incomes: [14800, 0], fixedPayments: [1100, 650] }]);
    expect(row.payments.toString()).toBe("1750");
    expect(row.disposable.toString()).toBe("13050");
  });

  it("refuses a row without exactly two incomes", () => {
    expect(() => disposableTable([{ household: "1", incomes: [1000], fixedPayments: [] }])).toThrow(RangeError);
  });
});
