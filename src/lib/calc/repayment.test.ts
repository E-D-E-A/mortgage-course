import { describe, expect, it } from "vitest";
import { moneyString } from "./money.ts";
import {
  bulletSchedule,
  cappedDiscount,
  cappedRateBelowAverage,
  crossoverMonth,
  equalPrincipalSchedule,
  exchangeLinkedBalance,
  graceSchedule,
  monthlyRatePercent,
  schedule,
  spitzerPayment,
  spitzerSchedule,
  totalInterest,
  totalPaid,
} from "./repayment.ts";

const m = (x: { toString(): string }) => moneyString(x.toString());

describe("monthlyRatePercent", () => {
  it("divides the annual rate by 12", () => {
    expect(monthlyRatePercent("4.8").toString()).toBe("0.4");
    expect(monthlyRatePercent("6").toString()).toBe("0.5");
  });
});

describe("spitzerPayment", () => {
  it("matches the Brain's worked examples to the agora", () => {
    // Brain 7798786: 700,000 at 5.90% for 20 years → 4,974.72.
    expect(m(spitzerPayment(700000, "5.9", 240))).toBe("4974.72");
    // ENG-223 Q1: 1,000,000 at 3% for 25 years → about 4,742 (4,742.11).
    expect(m(spitzerPayment(1000000, "3", 300))).toBe("4742.11");
  });

  it("is principal ÷ months at a zero rate", () => {
    expect(spitzerPayment(12000, "0", 12).toString()).toBe("1000");
  });
});

describe("spitzerSchedule", () => {
  // 60,000 at 6% a year (0.5% a month) for 3 months, worked by hand:
  // payment 20,200.33; interest 300.00, then 0.5% of 40,099.67 = 200.50, then 0.5% of 20,099.84 = 100.50.
  const rows = spitzerSchedule(60000, "6", 3);

  it("keeps the payment equal and moves it from interest to principal", () => {
    expect(rows.map((r) => m(r.payment))).toEqual(["20200.33", "20200.33", "20200.34"]);
    expect(rows.map((r) => m(r.interest))).toEqual(["300.00", "200.50", "100.50"]);
    expect(rows.map((r) => m(r.principal))).toEqual(["19900.33", "19999.83", "20099.84"]);
  });

  it("ends at exactly zero, the last payment taking the agora left by rounding", () => {
    expect(rows[2].closing.isZero()).toBe(true);
    expect(m(totalPaid(rows))).toBe("60601.00");
    expect(m(totalInterest(rows))).toBe("601.00");
  });

  it("ends at zero on a long loan too", () => {
    const long = spitzerSchedule(600000, "4.8", 240);
    expect(long).toHaveLength(240);
    expect(long[239].closing.isZero()).toBe(true);
    expect(m(long[0].payment)).toBe("3893.74");
  });
});

describe("equalPrincipalSchedule", () => {
  it("repays the same principal and pays less interest each month", () => {
    // 60,000 ÷ 3 = 20,000 a month; interest 300, 200, 100.
    const rows = equalPrincipalSchedule(60000, "6", 3);
    expect(rows.map((r) => m(r.payment))).toEqual(["20300.00", "20200.00", "20100.00"]);
    expect(m(totalInterest(rows))).toBe("600.00");
  });

  it("lets the last month take the agorot a third leaves", () => {
    const rows = equalPrincipalSchedule(100000, "6", 3);
    expect(rows.map((r) => m(r.principal))).toEqual(["33333.33", "33333.33", "33333.34"]);
    expect(rows[2].closing.isZero()).toBe(true);
  });

  it("pays less interest in total than Spitzer on the same loan", () => {
    const s = totalInterest(spitzerSchedule(600000, "4.8", 240));
    const e = totalInterest(equalPrincipalSchedule(600000, "4.8", 240));
    expect(e.lt(s)).toBe(true);
  });
});

describe("graceSchedule", () => {
  it("matches the Brain's grace example: 1,000,000 at 4.5%, 25 years, 12 months partial grace", () => {
    // ENG-223 Q11: about 3,750 during the grace, about 5,680 after (5,684.25 over 288 months).
    const rows = graceSchedule(1000000, "4.5", 300, 12, "partial");
    expect(m(rows[0].payment)).toBe("3750.00");
    expect(m(rows[11].closing)).toBe("1000000.00");
    expect(m(rows[12].payment)).toBe("5684.25");
    expect(rows).toHaveLength(300);
    expect(rows[299].closing.isZero()).toBe(true);
  });

  it("adds the interest to the debt in full grace, interest on interest included", () => {
    // 100,000 at 6%: 100,500.00 → 101,002.50 → 101,507.51 (0.5% of 101,002.50 = 505.0125).
    const rows = graceSchedule(100000, "6", 240, 3, "full");
    expect(rows.slice(0, 3).map((r) => m(r.payment))).toEqual(["0.00", "0.00", "0.00"]);
    expect(rows.slice(0, 3).map((r) => m(r.closing))).toEqual(["100500.00", "101002.50", "101507.51"]);
    expect(rows[3].period).toBe(4);
  });

  it("refuses a grace as long as the loan", () => {
    expect(() => graceSchedule(1000, "5", 12, 12, "partial")).toThrow(RangeError);
  });
});

describe("bulletSchedule", () => {
  it("partial: interest every month, the principal with the last one", () => {
    const rows = bulletSchedule(100000, "6", 12, "partial");
    expect(m(rows[0].payment)).toBe("500.00");
    expect(m(rows[11].payment)).toBe("100500.00");
    expect(m(totalInterest(rows))).toBe("6000.00");
  });

  it("full: nothing until the end, then everything with interest on interest", () => {
    // Each month's interest rounded to the agora, then added: 106,167.79. The formula
    // 100,000 × 1.005^12 = 106,167.78 rounds once; the agora between them is the statement convention.
    const rows = bulletSchedule(100000, "6", 12, "full");
    expect(m(rows[0].payment)).toBe("0.00");
    expect(m(rows[11].payment)).toBe("106167.79");
    expect(rows[11].closing.isZero()).toBe(true);
  });
});

describe("schedule", () => {
  it("routes each method", () => {
    expect(m(schedule("equal_principal", { principal: 60000, annualPercent: "6", months: 3 })[0].payment)).toBe("20300.00");
    expect(m(schedule("grace_full", { principal: 100000, annualPercent: "6", months: 240, graceMonths: 3 })[2].closing)).toBe("101507.51");
  });
});

describe("crossoverMonth", () => {
  it("finds the first month equal principal pays less than Spitzer", () => {
    // 60,000 over 3 months: 20,300 / 20,200 / 20,100 against 20,200.33 — month 2.
    expect(crossoverMonth(60000, "6", 3)).toBe(2);
  });
});

describe("the special tracks of 2.8", () => {
  it("caps a rate set below an average", () => {
    expect(cappedRateBelowAverage("3.2", "0.5", "3").toString()).toBe("2.7");
    expect(cappedRateBelowAverage("4", "0.5", "3").toString()).toBe("3");
  });

  it("caps a percent discount in shekels", () => {
    expect(cappedDiscount(1200000, "20", 300000).toString()).toBe("240000");
    expect(cappedDiscount(2000000, "20", 300000).toString()).toBe("300000");
  });

  it("moves an exchange-linked debt with the exchange rate", () => {
    // 375,000 ₪ at 3.75 = 100,000 units; at 3.9 they are 390,000 ₪.
    expect(exchangeLinkedBalance(375000, "3.75", "3.9").toString()).toBe("390000");
  });
});
