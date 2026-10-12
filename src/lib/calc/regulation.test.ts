import { describe, expect, it } from "vitest";
import {
  budgetMargin,
  checkRegulation,
  floorAgora,
  largestPaymentForBudget,
  leftForLiving,
  ltvCeiling,
  maxLoanAt,
  maxPaymentAt,
  maxVariable,
  minFixed,
  passesAllLimits,
  perPerson,
  reducedPriceValue,
  RULES,
  variableSharePercent,
  variableWithin,
} from "./regulation.ts";
import { percentString } from "./percent.ts";

describe("the numbers, as transcribed", () => {
  it("has the four financing ceilings", () => {
    expect([ltvCeiling("only_home"), ltvCeiling("replacement"), ltvCeiling("investment"), ltvCeiling("any_purpose")]).toEqual(["75", "70", "50", "50"]);
  });

  it("names five lines, four bans and one capital threshold", () => {
    expect(RULES.map((r) => r.id)).toEqual(["ltv", "pti", "capital", "variable", "term"]);
    expect(RULES.filter((r) => r.kind === "regulatory_limit")).toHaveLength(4);
    expect(RULES.filter((r) => r.kind === "capital_threshold").map((r) => r.id)).toEqual(["capital"]);
  });
});

describe("the largest amounts round down, never up", () => {
  it("floors to the agora", () => {
    expect(floorAgora("666666.6666").toFixed(2)).toBe("666666.66");
    expect(floorAgora("5.999").toFixed(2)).toBe("5.99");
  });

  it("gives the largest loan at the deal's ceiling", () => {
    // 1,600,000 × 75 ÷ 100 = 1,200,000; at 70%: 1,120,000 (by hand).
    expect(maxLoanAt("1600000", "only_home").toFixed(2)).toBe("1200000.00");
    expect(maxLoanAt("1600000", "replacement").toFixed(2)).toBe("1120000.00");
    // 1,234,567.89 × 0.75 = 925,925.9175 → 925,925.91, not .92.
    expect(maxLoanAt("1234567.89", "only_home").toFixed(2)).toBe("925925.91");
  });

  it("gives the largest payment a ratio allows", () => {
    // 14,500 × 50% = 7,250; × 40% = 5,800 (by hand).
    expect(maxPaymentAt("14500", "50").toFixed(2)).toBe("7250.00");
    expect(maxPaymentAt("14500", "40").toFixed(2)).toBe("5800.00");
    // 10,000.05 × 50% = 5,000.025 → 5,000.02.
    expect(maxPaymentAt("10000.05", "50").toFixed(2)).toBe("5000.02");
  });

  it("splits a loan into the most that may vary and the least that must be fixed", () => {
    expect(maxVariable("1200000").toFixed(2)).toBe("800000.00");
    expect(minFixed("1200000").toFixed(2)).toBe("400000.00");
    // A million: two-thirds is 666,666.666…, floored to .66, so the fixed part is 333,333.34.
    expect(maxVariable("1000000").toFixed(2)).toBe("666666.66");
    expect(minFixed("1000000").toFixed(2)).toBe("333333.34");
  });
});

describe("the variable share is two-thirds exactly", () => {
  it("allows exactly two-thirds and nothing above it", () => {
    expect(variableWithin("800000", "1200000")).toBe(true);
    expect(variableWithin("800000.01", "1200000")).toBe(false);
  });

  it("is not a rounded percent: 66.67% of a loan is over the line, 66.66% is within", () => {
    // 66.67% of 900,000 = 600,030 > 600,000; 66.66% = 599,940 is within.
    expect(variableWithin("600030", "900000")).toBe(false);
    expect(variableWithin("599940", "900000")).toBe(true);
  });

  it("shows the share in percent", () => {
    expect(percentString(variableSharePercent("840000", "1200000"))).toBe("70");
  });
});

describe("a reduced-price home", () => {
  it("may be measured against the appraisal, never below the price", () => {
    expect(reducedPriceValue("1400000", "1800000").toFixed(0)).toBe("1800000");
    expect(reducedPriceValue("1400000", "1300000").toFixed(0)).toBe("1400000");
  });

  it("stops at the cap when one is given", () => {
    expect(reducedPriceValue("1400000", "1800000", "1600000").toFixed(0)).toBe("1600000");
  });
});

describe("all five lines at once", () => {
  // The checker's opening family: value 1,700,000, loan 1,200,000 (70.59%), only home;
  // payment 7,000 on 16,000 (43.75%); 840,000 variable (70%); 30 years.
  const lines = checkRegulation({
    deal: "only_home",
    value: "1700000",
    loan: "1200000",
    payment: "7000",
    disposableIncome: "16000",
    variable: "840000",
    termMonths: 360,
  });
  const byId = Object.fromEntries(lines.map((l) => [l.id, l]));

  it("is within the financing ceiling, with 75,000 of loan to spare", () => {
    expect(byId.ltv.status).toBe("within");
    expect(percentString(byId.ltv.actual)).toBe("70.59");
    expect(byId.ltv.room.toFixed(2)).toBe("75000.00");
  });

  it("is under 50% but above the 40% capital threshold", () => {
    expect(percentString(byId.pti.actual)).toBe("43.75");
    expect(byId.pti.status).toBe("within");
    expect(byId.pti.room.toFixed(2)).toBe("1000.00");
    expect(byId.capital.status).toBe("above");
    expect(byId.capital.room.toFixed(2)).toBe("-600.00");
  });

  it("is 40,000 over two-thirds variable", () => {
    expect(byId.variable.status).toBe("over");
    expect(byId.variable.room.toFixed(2)).toBe("-40000.00");
    expect(percentString(byId.variable.limit)).toBe("66.67");
  });

  it("is exactly at 30 years", () => {
    expect(byId.term.status).toBe("within");
    expect(byId.term.room.toNumber()).toBe(0);
  });

  it("fails on the ban it crosses, not on the capital threshold", () => {
    expect(passesAllLimits(lines)).toBe(false);
    const fixed = checkRegulation({ deal: "only_home", value: "1700000", loan: "1200000", payment: "7000", disposableIncome: "16000", variable: "800000", termMonths: 360 });
    expect(passesAllLimits(fixed)).toBe(true);
  });

  it("allows a ratio of exactly 50.00%", () => {
    const edge = checkRegulation({ deal: "only_home", value: "1000000", loan: "750000", payment: "5000", disposableIncome: "10000", variable: "0", termMonths: 300 });
    expect(edge.find((l) => l.id === "pti")?.status).toBe("within");
    expect(edge.find((l) => l.id === "ltv")?.status).toBe("within");
  });

  it("refuses inputs that make no sense", () => {
    const base = { deal: "only_home" as const, value: "1000000", loan: "700000", payment: "4000", disposableIncome: "10000", variable: "0", termMonths: 300 };
    expect(() => checkRegulation({ ...base, variable: "800000" })).toThrow(RangeError);
    expect(() => checkRegulation({ ...base, termMonths: 0 })).toThrow(RangeError);
    expect(() => checkRegulation({ ...base, disposableIncome: "0" })).toThrow(RangeError);
  });
});

describe("the living budget (lesson 4.6)", () => {
  it("leaves the net income minus every payment the family makes", () => {
    // 19,000 − 6,800 − 1,200 = 11,000 (by hand).
    expect(leftForLiving("19000", ["6800", "1200"]).toFixed(0)).toBe("11000");
  });

  it("divides what is left by the household", () => {
    expect(perPerson("11000", 5).toFixed(0)).toBe("2200");
    expect(() => perPerson("100", 0)).toThrow(RangeError);
  });

  it("shows a margin or a shortfall against the living budget", () => {
    expect(budgetMargin("11000", "11800").toFixed(0)).toBe("-800");
    expect(budgetMargin("12200", "11800").toFixed(0)).toBe("400");
  });

  it("gives the largest payment the budget allows, never below zero", () => {
    // 22,000 − 1,000 − 13,500 = 7,500.
    expect(largestPaymentForBudget("22000", ["1000"], "13500").toFixed(0)).toBe("7500");
    expect(largestPaymentForBudget("10000", ["1000"], "13500").toFixed(0)).toBe("0");
  });
});
