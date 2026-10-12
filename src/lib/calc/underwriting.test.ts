import { describe, expect, it } from "vitest";
import {
  average,
  lowerOf,
  maxLoanAtRatio,
  mixBalance,
  mixPayment,
  paymentsUntilBalanceAtMost,
  ratioPercent,
  scaleMix,
  shortfallPercent,
  total,
  trackPayment,
} from "./underwriting.ts";

const flat = (principal: string, months: number) => ({ principal, ratePercent: "0", months });

describe("payments of a mix (lessons 4.7, 4.9)", () => {
  it("matches the Brain's worked examples for one track", () => {
    // 700,000 at 5.90% for 20 years: 4,974.72 (Brain, the course map's check value).
    expect(trackPayment({ principal: "700000", ratePercent: "5.90", months: 240 }).toString()).toBe("4974.72");
    // 1,000,000 at 3% for 25 years: about 4,742.
    expect(trackPayment({ principal: "1000000", ratePercent: "3", months: 300 }).toFixed(0)).toBe("4742");
  });

  it("adds the tracks' payments, each rounded to the agora first", () => {
    // 0% rate: 600,000 over 120 months = 5,000; 400,000 over 100 months = 4,000 (by hand).
    expect(mixPayment([flat("600000", 120), flat("400000", 100)]).toString()).toBe("9000");
  });
});

describe("ratios and shortfalls", () => {
  it("divides a part by a whole, in percent", () => {
    expect(ratioPercent("1000", "4000").toString()).toBe("25");
    expect(ratioPercent("0", "4000").toString()).toBe("0");
    expect(() => ratioPercent("1", "0")).toThrow(RangeError);
  });

  it("measures how far the verified amount is below the declared one", () => {
    // (11,000 − 7,500) ÷ 11,000 = 31.818…% (by hand: 3,500 ÷ 11,000).
    expect(shortfallPercent("11000", "7500").toFixed(2)).toBe("31.82");
    expect(shortfallPercent("1000", "1000").toString()).toBe("0");
    // A verified amount above the declared one is a negative shortfall, not an error.
    expect(shortfallPercent("1000", "1100").toString()).toBe("-10");
  });

  it("takes the lower of two values and refuses negatives", () => {
    expect(lowerOf("1650000", "1560000").toString()).toBe("1560000");
    expect(lowerOf("100", "100").toString()).toBe("100");
    expect(() => lowerOf("-1", "5")).toThrow(RangeError);
  });

  it("totals and averages", () => {
    expect(total(["9000", "6200", "7300"]).toString()).toBe("22500");
    expect(average(["9000", "6200", "7300"]).toString()).toBe("7500");
    expect(() => average([])).toThrow(RangeError);
  });
});

describe("the largest loan under a cap on the repayment ratio (lesson 4.7)", () => {
  it("is the allowed payment divided by the payment per shekel of loan", () => {
    // At 0%, 1,200,000 over 120 months pays 10,000. Income 20,000, cap 50% allows 10,000: the whole loan.
    expect(maxLoanAtRatio([flat("1200000", 120)], "20000", "50").toString()).toBe("1200000");
    // Cap 40% allows 8,000 = 80% of 10,000 → 960,000.
    expect(maxLoanAtRatio([flat("1200000", 120)], "20000", "40").toString()).toBe("960000");
  });

  it("rounds down to the step, so the payment never passes the cap", () => {
    // Cap 41% allows 8,200 → 984,000 exactly; cap 41.05% allows 8,210 → 985,200, which rounds down to 985,000.
    expect(maxLoanAtRatio([flat("1200000", 120)], "20000", "41.05").toString()).toBe("985000");
    expect(maxLoanAtRatio([flat("1200000", 120)], "20000", "41.05", 1).toString()).toBe("985200");
  });

  it("is proportional to income when the mix stays the same", () => {
    const mix = [{ principal: "565000", ratePercent: "4.60", months: 300 }, { principal: "565000", ratePercent: "4.10", months: 300 }];
    const a = maxLoanAtRatio(mix, "10000", "40", 1);
    const b = maxLoanAtRatio(mix, "20000", "40", 1);
    expect(b.div(a).toDecimalPlaces(3).toString()).toBe("2");
  });

  it("scales a mix to a new loan keeping the shares", () => {
    const scaled = scaleMix([flat("600000", 120), flat("400000", 100)], "500000");
    expect(scaled.map((t) => t.principal.toString())).toEqual(["300000", "200000"]);
    expect(() => scaleMix([flat("1", 1)], "0")).toThrow(RangeError);
  });
});

describe("balances and the point where cover is no longer needed (lesson 4.9)", () => {
  it("adds the tracks' balances", () => {
    // 0% rate, 100,000 over 100 months pays 1,000 a month: after 10 payments, 90,000 (by hand).
    expect(mixBalance([flat("100000", 100)], 10).toString()).toBe("90000");
    // A shorter track that has ended owes nothing.
    expect(mixBalance([flat("100000", 100), flat("12000", 12)], 12).toString()).toBe("88000");
  });

  it("finds the first payment after which the balance is at most the threshold", () => {
    // 100,000 − 1,000 × k ≤ 30,000 → k = 70.
    expect(paymentsUntilBalanceAtMost([flat("100000", 100)], "30000")).toBe(70);
    expect(paymentsUntilBalanceAtMost([flat("20000", 100)], "30000")).toBe(0);
  });
});
