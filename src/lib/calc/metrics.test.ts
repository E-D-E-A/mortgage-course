import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { annuityBalance, annuityPayment, annuityStatement } from "./amortization.ts";
import {
  annualByMultiplication,
  bisectionSteps,
  breakdown,
  effectiveAnnual,
  firstPayment,
  highestPayment,
  irrMonthly,
  mixPayments,
  paymentInMonth,
  percentAbove,
  presentValue,
  presentValueAtAnnual,
  presentValueRows,
  ratePath,
  totalPaid,
  trackPayments,
  trackRows,
} from "./metrics.ts";
import { moneyString } from "./money.ts";

const money = (d: Decimal) => moneyString(d);
const near = (d: Decimal, x: Decimal.Value, eps = "1e-10") => expect(d.minus(x).abs().lte(eps)).toBe(true);

describe("presentValue", () => {
  it("brings each payment back on its own and adds (lesson 0.6)", () => {
    // 1,100 after one period and 1,210 after two, at 10%: 1,000 + 1,000.
    expect(presentValue([1100, 1210], "10").toString()).toBe("2000");
  });

  it("is the loan itself at the loan's own monthly rate", () => {
    // 30,000 at 6% a year (0.5% a month) for three months.
    const p = trackPayments({ principal: "30000", rates: ["6"], months: 3 });
    near(presentValue(p, "0.5"), 30000);
    near(presentValueAtAnnual(p, "6"), 30000);
  });

  it("is more than the loan at a lower rate, and less at a higher one", () => {
    const p = trackPayments({ principal: "30000", rates: ["6"], months: 3 });
    expect(presentValue(p, "0.4").gt(30000)).toBe(true);
    expect(presentValue(p, "0.6").lt(30000)).toBe(true);
  });

  it("lists each payment's value today", () => {
    const rows = presentValueRows([1100, 1210], "10");
    expect(rows.map((r) => r.growth.toString())).toEqual(["1.1", "1.21"]);
    expect(rows.map((r) => r.valueToday.toString())).toEqual(["1000", "1000"]);
  });
});

describe("the level payment and its schedule", () => {
  it("is 10,100.17 a month for 30,000 at 6% over three months", () => {
    // Hand: 1/1.005 + 1/1.005² + 1/1.005³ = 0.99502488 + 0.99007450 + 0.98514876 = 2.97024814;
    // 30,000 ÷ 2.97024814 = 10,100.166…
    const p = trackPayments({ principal: "30000", rates: ["6"], months: 3 });
    expect(p.map(money)).toEqual(["10100.17", "10100.17", "10100.17"]);
    expect(money(totalPaid(p))).toBe("30300.50");
  });

  it("is recalculated at a reset on the balance left, over the months left", () => {
    // 600,000 for 240 months, 4.6% for 60 months, then 5.1%.
    const track = { principal: "600000", rates: ["4.6", "5.1"], blockMonths: 60, months: 240 };
    const p = trackPayments(track);
    const balance60 = annuityBalance("600000", "4.6", 240, 60);
    near(paymentInMonth(p, 61), annuityPayment(balance60, "5.1", 180), "1e-20");
    expect(money(firstPayment(p))).toBe(money(annuityPayment("600000", "4.6", 240)));
  });

  it("reads a rate path block by block, the last carrying on", () => {
    const path = ratePath({ principal: 1, rates: ["4", "5"], blockMonths: 2, months: 5 });
    expect(path.map(String)).toEqual(["4", "4", "5", "5", "5"]);
  });
});

describe("highest, first and above", () => {
  it("finds the highest payment and the first month it is paid", () => {
    const h = highestPayment([3, 5, 5, 4]);
    expect([h.month, h.payment.toString()]).toEqual([2, "5"]);
  });

  it("finds the highest payment of a forecast path in the block with the highest rate", () => {
    // Rates 4.6, 5.1, 5.5, 5.3 by five-year blocks: 3,828.36 → 3,957.11 → 4,030.31 → 4,010.87.
    const p = trackPayments({ principal: "600000", rates: ["4.6", "5.1", "5.5", "5.3"], blockMonths: 60, months: 240 });
    const h = highestPayment(p);
    expect(h.month).toBe(121);
    expect(money(h.payment)).toBe("4030.31");
  });

  it("measures how far above, in percent", () => {
    expect(percentAbove(110, 100).toString()).toBe("10");
    expect(percentAbove(95, 100).toString()).toBe("-5");
  });
});

describe("mixPayments", () => {
  it("adds the tracks month by month; a track that has ended adds nothing", () => {
    const short = { principal: "1200", rates: ["0"], months: 2 };
    const long = { principal: "300", rates: ["0"], months: 3 };
    // 600 + 100, 600 + 100, then 100.
    expect(mixPayments([short, long]).map(String)).toEqual(["700", "700", "100"]);
  });
});

describe("breakdown", () => {
  it("splits an unlinked track's payments into the loan and the interest", () => {
    // 12,000 at 6% for 12 months: the payment is 1,032.797156… (12,000 × 0.005 ÷ (1 − 1.005^−12)),
    // twelve of them 12,393.5659 — 393.57 of interest.
    const b = breakdown({ principal: "12000", rates: ["6"], months: 12 });
    expect(b.indexation.toString()).toBe("0");
    near(b.total, b.principal.plus(b.interest), "1e-20");
    expect(money(b.total)).toBe("12393.57");
    expect(money(b.interest)).toBe("393.57");
  });

  it("adds what the index added to the debt on a linked track: total = loan + interest + indexation", () => {
    const b = breakdown({ principal: "600000", rates: ["3"], months: 240, inflationPercent: "2" });
    expect(b.indexation.gt(0)).toBe(true);
    near(b.total, b.principal.plus(b.interest).plus(b.indexation), "1e-20");
  });

  it("indexes the balance by the twelfth root each month", () => {
    // One month at 12% a year inflation: the factor is 1.12^(1/12); the balance moves by it before the payment.
    const rows = trackRows({ principal: "1000", rates: ["0"], months: 1, inflationPercent: "12" });
    near(rows[0].opening.div(1000).pow(12), "1.12", "1e-30");
  });
});

describe("grace", () => {
  it("keeps the value today at the loan's own rate equal to the loan, partial or full", () => {
    for (const method of ["grace_partial", "grace_full"] as const) {
      const p = trackPayments({ principal: "400000", rates: ["6"], months: 180, method, graceMonths: 12 });
      near(presentValueAtAnnual(p, "6"), 400000, "1e-20");
    }
  });

  it("pays only the interest in partial grace: 0.5% of 400,000 is 2,000", () => {
    const p = trackPayments({ principal: "400000", rates: ["6"], months: 180, method: "grace_partial", graceMonths: 12 });
    expect(p[0].toString()).toBe("2000");
    const f = trackPayments({ principal: "400000", rates: ["6"], months: 180, method: "grace_full", graceMonths: 12 });
    expect(f[11].toString()).toBe("0");
  });
});

describe("irrMonthly", () => {
  it("is 10% a month when 100 received comes back as 110 a month later", () => {
    near(irrMonthly([110], 100), 10, "1e-11");
  });

  it("is 10% a month when 100 comes back as 121 two months later", () => {
    near(irrMonthly([0, 121], 100), 10, "1e-11");
  });

  it("is the loan's own monthly rate when nothing is taken off what was lent", () => {
    const p = trackPayments({ principal: "600000", rates: ["4.8"], months: 240 });
    near(irrMonthly(p, 600000), "0.4", "1e-11");
    const e = trackPayments({ principal: "600000", rates: ["4.8"], months: 240, method: "equal_principal" });
    near(irrMonthly(e, 600000), "0.4", "1e-11");
  });

  it("rises when a fee is taken off the day the money is paid out", () => {
    const p = trackPayments({ principal: "30000", rates: ["6"], months: 3 });
    const r = irrMonthly(p, 29700);
    expect(r.gt("0.5")).toBe(true);
    // At that rate the payments are worth exactly what was received.
    near(presentValue(p, r), 29700, "1e-6");
  });

  it("refuses payments that are not a loan's", () => {
    expect(() => irrMonthly([], 100)).toThrow();
    expect(() => irrMonthly([-1, 200], 100)).toThrow();
    expect(() => irrMonthly([100], 0)).toThrow();
  });
});

describe("bisectionSteps", () => {
  it("halves the bracket toward the rate", () => {
    // 110 after a month for 100: at 10% the value today is exactly 100 (not above), so 10 is "high";
    // then 5% gives 104.76…, above 100, so 5 is "low".
    const s = bisectionSteps([110], 100, "0", "20", 2);
    expect(s.map((x) => [x.mid.toString(), x.verdict])).toEqual([
      ["10", "high"],
      ["5", "low"],
    ]);
  });
});

describe("annual conversions of a monthly rate (lesson 0.4)", () => {
  it("multiplies by 12, or compounds twelve times", () => {
    expect(annualByMultiplication("0.4").toString()).toBe("4.8");
    // 1.005^12 = 1.06167781186449956…
    expect(effectiveAnnual("0.5").toDecimalPlaces(10).toString()).toBe("6.1677811864");
  });
});

describe("the statement convention (rounding: \"statement\")", () => {
  it("gives the same rows as annuityStatement on a flat unlinked track, so 3.9 agrees with 2.9 and 3.12", () => {
    const rows = trackRows({ principal: "12000", rates: ["6"], months: 12, rounding: "statement" });
    const statement = annuityStatement("12000", "6", 12);
    expect(rows.map((r) => money(r.payment))).toEqual(statement.map((r) => money(r.payment)));
    // Hand: payment 1,032.80; month 1 interest 60.00; the last payment clears the balance: 1,032.78.
    expect(money(rows[0].interest)).toBe("60.00");
    expect(money(rows[11].payment)).toBe("1032.78");
    expect(money(totalPaid(rows.map((r) => r.payment)))).toBe("12393.58");
  });

  it("totals the interest of 600,000 at 4.8% over 20 years as 2.9 does", () => {
    const b = breakdown({ principal: "600000", rates: ["4.8"], months: 240, rounding: "statement" });
    const statement = annuityStatement("600000", "4.8", 240);
    const interest = statement.reduce((s, r) => s.plus(r.interest), new Decimal(0));
    expect(money(b.interest)).toBe(money(interest));
    expect(money(b.interest)).toBe("334499.54");
  });

  it("rounds each month's interest in a full grace, then pays the statement level payment", () => {
    const rows = trackRows({ principal: "400000", rates: ["6"], months: 180, method: "grace_full", graceMonths: 12, rounding: "statement" });
    // Month 1: 400,000 × 0.5% = 2,000.00, nothing paid; month 2: 402,000 × 0.5% = 2,010.00.
    expect(rows.slice(0, 2).map((r) => money(r.interest))).toEqual(["2000.00", "2010.00"]);
    expect(rows[0].payment.isZero()).toBe(true);
    expect(rows.every((r) => r.payment.equals(r.payment.toDecimalPlaces(2)))).toBe(true);
    expect(rows[179].closing.isZero()).toBe(true);
  });

  it("carries a linked track's set payment with the index: the first payment already has one month of it", () => {
    const linked = { principal: "600000", rates: ["3"], months: 240, inflationPercent: "2", rounding: "statement" as const };
    const set = annuityPayment("600000", "3", 240).toDecimalPlaces(2);
    const factor = new Decimal(1.02).pow(new Decimal(1).div(12));
    expect(money(trackPayments(linked)[0])).toBe(money(set.mul(factor)));
    expect(trackPayments({ ...linked, inflationPercent: "0" })[0].toString()).toBe(set.toString());
  });

  it("keeps the value today at the loan's own rate within agorot of the loan", () => {
    const p = trackPayments({ principal: "400000", rates: ["6"], months: 180, rounding: "statement" });
    expect(presentValue(p, "0.5").minus(400000).abs().lt("0.05")).toBe(true);
  });
});
