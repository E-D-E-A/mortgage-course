import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import {
  annuityBalance,
  annuityPayment,
  annuitySchedule,
  annuityStatement,
  annuitySteps,
  blockPath,
  discountSum,
  firstMonthBelow,
  equalPrincipalSchedule,
  equalPrincipalStatement,
  indexPath,
  monthInterest,
  monthlyIndexFactor,
  monthlyDiscountFactor,
  monthlyRate,
  monthsToNextUpdate,
  nextUpdateMonth,
  pathSchedule,
  paymentTrial,
  paymentsValueToday,
  primeTrackRate,
  principalOvertakesInterest,
  remainingBalance,
  statementBalance,
  updateMonths,
  yearlySummary,
} from "./amortization.ts";
import { moneyString } from "./money.ts";

// Default Decimal keeps 20 significant digits, so compare shekel amounts to 1e-10.
const close = (a: Decimal.Value, b: Decimal.Value, places = 10) =>
  expect(new Decimal(a).minus(b).abs().lt(new Decimal(10).pow(-places))).toBe(true);

describe("the level payment (שפיצר)", () => {
  it("matches the worked examples in the Brain", () => {
    // Page 7798786: 700,000 ₪ at 5.90% for 20 years → 4,974.72 ₪.
    expect(moneyString(annuityPayment("700000", "5.90", 240))).toBe("4974.72");
    // ENG-223 comments: 1,000,000 ₪ at 3% for 25 years → about 4,742 ₪.
    expect(moneyString(annuityPayment("1000000", "3", 300))).toBe("4742.11");
  });

  it("is checked by hand on two months at 1% a month", () => {
    // 1,000 at 12% a year: m = 1%. C = 10 ÷ (1 − 1.01^−2) = 507.5124…
    expect(moneyString(annuityPayment("1000", "12", 2))).toBe("507.51");
    // After one payment: 1,000 × 1.01 − 507.5124… = 502.4875…
    expect(moneyString(annuityBalance("1000", "12", 2, 1))).toBe("502.49");
  });

  it("is principal ÷ months at a rate of zero", () => {
    expect(annuityPayment("120000", "0", 120).toString()).toBe("1000");
    expect(annuityBalance("120000", "0", 120, 30).toString()).toBe("90000");
  });

  it("leaves exactly the principal before the first payment and zero after the last", () => {
    expect(annuityBalance("600000", "4.25", 240, 0).toString()).toBe("600000");
    close(annuityBalance("600000", "4.25", 240, 240), 0);
  });

  it("agrees with the month-by-month schedule", () => {
    const rows = annuitySchedule("600000", "5", 240);
    expect(rows).toHaveLength(240);
    close(rows[35].closing, annuityBalance("600000", "5", 240, 36));
    close(rows[0].interest, "2500");
    close(rows[0].payment, annuityPayment("600000", "5", 240));
  });

  it("uses the annual rate ÷ 12", () => {
    expect(monthlyRate("6").toString()).toBe("0.5");
    expect(moneyString(monthInterest("500000", "0.25"))).toBe("104.17");
  });
});

describe("statement schedules (rounded rows that add up)", () => {
  it("rounds the level payment and each month's interest to the agora", () => {
    const rows = annuityStatement("1000", "12", 2);
    expect(rows.map((r) => [r.payment, r.interest, r.principalPaid, r.closing].map((v) => v.toFixed(2)))).toEqual([
      ["507.51", "10.00", "497.51", "502.49"],
      ["507.51", "5.02", "502.49", "0.00"],
    ]);
  });

  it("clears the balance on the last row", () => {
    const rows = annuityStatement("600000", "4.25", 240);
    expect(rows[239].closing.toFixed(2)).toBe("0.00");
    for (const r of rows) expect(r.opening.minus(r.principalPaid).eq(r.closing)).toBe(true);
  });

  it("splits equal principal by hand: 1,200 at 1% a month for 3 months", () => {
    const rows = equalPrincipalStatement("1200", "12", 3);
    expect(rows.map((r) => r.payment.toFixed(2))).toEqual(["412.00", "408.00", "404.00"]);
    const exact = equalPrincipalSchedule("1200", "12", 3);
    expect(exact.map((r) => r.interest.toString())).toEqual(["12", "8", "4"]);
  });

  it("gives the last equal-principal month what rounding left", () => {
    const rows = equalPrincipalStatement("1000", "6", 3);
    expect(rows.map((r) => r.principalPaid.toFixed(2))).toEqual(["333.33", "333.33", "333.34"]);
  });
});

describe("a track whose rate or index moves", () => {
  it("is the plain level payment when nothing moves", () => {
    const rows = pathSchedule("600000", blockPath(["5"], 60, 240));
    close(rows[100].payment, annuityPayment("600000", "5", 240));
    close(rows[239].closing, 0);
  });

  it("recalculates the payment on the balance left when the rate changes, keeping the term", () => {
    // P−0.5 with prime 4.75 for 3 years, then prime 5.75: 4.25% then 5.25%.
    const rates = blockPath(["4.25", "5.25"], 36, 240);
    const rows = pathSchedule("600000", rates);
    const left = annuityBalance("600000", "4.25", 240, 36);
    close(rows[35].closing, left);
    close(rows[36].payment, annuityPayment(left, "5.25", 204));
    close(rows[239].closing, 0);
  });

  it("indexes a linked track: payment and balance follow the index", () => {
    const months = 240;
    const rows = pathSchedule("600000", blockPath(["3"], months, months), indexPath(["2"], months, months));
    const plain = annuityPayment("600000", "3", months);
    // Twelve months of a 2% year make exactly 1.02.
    close(rows[11].payment, plain.mul("1.02"));
    close(rows[119].payment, plain.mul(new Decimal("1.02").pow(10)));
    close(rows[59].closing, annuityBalance("600000", "3", months, 60).mul(new Decimal("1.02").pow(5)));
  });

  it("can owe more shekels than were borrowed when inflation is high", () => {
    // 3% for 20 years with 5% inflation a year: after five years of payments the balance is above 600,000.
    const rows = pathSchedule("600000", blockPath(["3"], 240, 240), indexPath(["5"], 240, 240));
    expect(rows[59].closing.gt(600000)).toBe(true);
  });

  it("takes a twelfth root for the monthly index", () => {
    close(monthlyIndexFactor("2").pow(12), "1.02", 30); // the module keeps 40 digits
    expect(() => monthlyIndexFactor("-100")).toThrow(RangeError);
  });

  it("holds each block's value and carries the last one on", () => {
    expect(blockPath(["1", "2"], 2, 5).map(String)).toEqual(["1", "1", "2", "2", "2"]);
  });

  it("summarises each year by its last month", () => {
    const years = yearlySummary(annuitySchedule("120000", "0", 24));
    expect(years.map((y) => [y.year, y.payment.toString(), y.balance.toString()])).toEqual([
      [1, "5000", "60000"],
      [2, "5000", "0"],
    ]);
  });
});

describe("prime and reset points", () => {
  it("adds a signed margin to prime", () => {
    expect(primeTrackRate("4.75", "-0.5").toString()).toBe("4.25");
    expect(primeTrackRate("4.75", "0.3").toString()).toBe("5.05");
  });

  it("lists the resets strictly inside the term", () => {
    expect(updateMonths(240, 60)).toEqual([60, 120, 180]);
    expect(updateMonths(300, 60)).toEqual([60, 120, 180, 240]);
    expect(updateMonths(240, 30)).toHaveLength(7);
    expect(updateMonths(60, 60)).toEqual([]);
  });

  it("finds the next reset after a given month", () => {
    expect(nextUpdateMonth(240, 60, 38)).toBe(60);
    expect(nextUpdateMonth(240, 60, 60)).toBe(120);
    expect(nextUpdateMonth(240, 60, 0)).toBe(60);
    expect(nextUpdateMonth(240, 60, 200)).toBeNull();
    expect(monthsToNextUpdate(240, 60, 38)).toBe(22);
    expect(monthsToNextUpdate(360, 30, 40)).toBe(20);
    expect(monthsToNextUpdate(240, 60, 200)).toBeNull();
  });

  it("refuses a term of zero months", () => {
    expect(() => annuityPayment("1000", "5", 0)).toThrow(RangeError);
    expect(() => annuityBalance("1000", "5", 12, 13)).toThrow(RangeError);
  });
});

describe("stage 3: where the level payment comes from", () => {
  it("sums the discount factors by hand: two months at 1% a month", () => {
    // 1 ÷ 1.01 = 0.990099…, 1 ÷ 1.0201 = 0.980296…; together 1.970395…
    expect(monthlyDiscountFactor("12", 1).toFixed(8)).toBe("0.99009901");
    expect(monthlyDiscountFactor("12", 2).toFixed(8)).toBe("0.98029605");
    expect(discountSum("12", 2).toFixed(8)).toBe("1.97039506");
    close(discountSum("12", 2), monthlyDiscountFactor("12", 1).plus(monthlyDiscountFactor("12", 2)), 30);
  });

  it("agrees with the long sum over 240 months, and is n at a rate of zero", () => {
    let s = new Decimal(0);
    for (let k = 1; k <= 240; k++) s = s.plus(monthlyDiscountFactor("4.8", k));
    close(discountSum("4.8", 240), s, 15);
    expect(discountSum("0", 36).toString()).toBe("36");
  });

  it("finds the payment as the loan divided by S (2,000 ₪, 1% a month, two months: 1,015.02)", () => {
    expect(moneyString(new Decimal(2000).div(discountSum("12", 2)))).toBe("1015.02");
    expect(moneyString(annuityPayment("2000", "12", 2))).toBe("1015.02");
    // Lesson 2.9's three-month loan: 60,000 ₪ at 6% → 20,200.33.
    expect(moneyString(annuityPayment("60000", "6", 3))).toBe("20200.33");
  });

  it("gives back the loan as the value today of its payments", () => {
    close(paymentsValueToday(annuityPayment("600000", "4.8", 240), "4.8", 240), 600000, 15);
    expect(moneyString(paymentsValueToday("1000", "0", 12))).toBe("12000.00");
  });
});

describe("stage 3: trying a payment", () => {
  it("leaves a debt when the payment is too small and overpays when it is too large", () => {
    const close2 = (pay: string) => paymentTrial("2000", "12", pay, 2).map((r) => r.closing.toFixed(2));
    expect(close2("1000")).toEqual(["1020.00", "30.20"]);
    expect(close2("1020")).toEqual(["1000.00", "-10.00"]);
    expect(close2("1015")).toEqual(["1005.00", "0.05"]);
    // The rounded level payment leaves one agora: the last payment of a statement clears it.
    expect(close2("1015.02")).toEqual(["1004.98", "0.01"]);
  });

  it("rounds each month's interest to the agora, like a statement", () => {
    const rows = paymentTrial("60000", "6", "20200.33", 3);
    expect(rows.map((r) => r.interest.toFixed(2))).toEqual(["300.00", "200.50", "100.50"]);
    expect(rows[2].closing.toFixed(2)).toBe("0.01");
  });
});

describe("stage 3: the balance at any month", () => {
  it("is the value today of the payments still to come, the same as rolling the debt forward", () => {
    for (const k of [0, 1, 60, 120, 239, 240]) close(remainingBalance("600000", "4.8", 240, k), annuityBalance("600000", "4.8", 240, k), 12);
    expect(remainingBalance("600000", "4.8", 240, 240).toString()).toBe("0");
    expect(moneyString(remainingBalance("60000", "6", 3, 1))).toBe("40099.67");
  });

  it("differs from the statement's balance only by rounding", () => {
    expect(statementBalance("60000", "6", 3, 0).toFixed(2)).toBe("60000.00");
    expect(statementBalance("60000", "6", 3, 1).toFixed(2)).toBe("40099.67");
    expect(statementBalance("60000", "6", 3, 3).toFixed(2)).toBe("0.00");
    for (const k of [12, 60, 120, 200]) {
      const gap = statementBalance("600000", "4.8", 240, k).minus(remainingBalance("600000", "4.8", 240, k)).abs();
      expect(gap.lt(3)).toBe(true);
    }
  });

  it("finds the month the principal part first passes the interest part", () => {
    // 600,000 ₪ at 4.8% for 20 years: (C − P × m) × 1.004^(k − 1) > C ÷ 2 first at k = 68.
    expect(principalOvertakesInterest("600000", "4.8", 240)).toBe(68);
    expect(principalOvertakesInterest("60000", "6", 3)).toBe(1);
  });

  it("refuses a month outside the loan", () => {
    expect(() => remainingBalance("1000", "5", 12, 13)).toThrow(RangeError);
    expect(() => statementBalance("1000", "5", 12, -1)).toThrow(RangeError);
  });
});

describe("stage 3: the formula step by step", () => {
  it("builds 2,000 ₪ at 1% a month for two months", () => {
    const s = annuitySteps("2000", "12", 2);
    expect(s.m.toString()).toBe("0.01");
    expect(s.growth.toString()).toBe("1.0201");
    expect(s.discount.toFixed(8)).toBe("0.98029605");
    expect(s.oneMinus.toFixed(8)).toBe("0.01970395");
    expect(s.top.toString()).toBe("20");
    expect(moneyString(s.payment)).toBe("1015.02");
    close(s.payment, annuityPayment("2000", "12", 2), 25);
  });
});

describe("stage 3: when the balance falls below a level", () => {
  it("finds the first month the balance is below half the loan", () => {
    const k = firstMonthBelow("600000", "4.8", 240, "300000");
    expect(k).not.toBeNull();
    const rows = annuityStatement("600000", "4.8", 240);
    expect(rows[(k as number) - 1].closing.lt(300000)).toBe(true);
    expect(rows[(k as number) - 2].closing.gte(300000)).toBe(true);
    expect(k).toBeGreaterThan(120);
    expect(firstMonthBelow("600000", "4.8", 240, "0")).toBeNull();
  });
});
