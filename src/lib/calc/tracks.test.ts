import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import {
  annuityFactor,
  breakEvenInflation,
  discountFactor,
  effectiveFromStated,
  equalPayment,
  equalPaymentPath,
  equalPrincipalMonth,
  indexedAmount,
  indexedPayment,
  indexedYearOwed,
  monthInterest,
  monthlyByDivision,
  plainYearOwed,
  primeRate,
  primeTrackRate,
  rateBeforeInflation,
  rateFromAnchor,
  realRate,
  spreadFromRate,
  yearInterest,
} from "./tracks.ts";

const r2 = (d: Decimal) => d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();

describe("2.1: prime, anchor and spread", () => {
  it("adds 1.5 points to the Bank of Israel rate for prime", () => {
    expect(primeRate("3.25").toString()).toBe("4.75");
    expect(primeRate("1").toString()).toBe("2.5"); // the explainer's own example
  });

  it("builds a track's rate from its anchor and a signed spread", () => {
    // 4.75 − 0.8 = 3.95; 3.5 + 1 = 4.5 (by hand).
    expect(rateFromAnchor("4.75", "-0.8").toString()).toBe("3.95");
    expect(rateFromAnchor("3.5", "1").toString()).toBe("4.5");
    expect(primeTrackRate("3.25", "-0.8").toString()).toBe("3.95");
    expect(primeTrackRate("3", "-0.8").toString()).toBe("3.7");
  });

  it("recovers a spread as rate − anchor, negative below the anchor", () => {
    expect(spreadFromRate("4.2", "4.75").toString()).toBe("-0.55");
    expect(spreadFromRate("3.95", "3.25").toString()).toBe("0.7");
  });

  it("takes a month's interest by dividing the annual rate by 12", () => {
    // 600,000 × 3.95% ÷ 12 = 23,700 ÷ 12 = 1,975.
    expect(monthInterest(600000, "3.95").toString()).toBe("1975");
    expect(monthInterest(480000, "0.25").toString()).toBe("100");
    expect(yearInterest(480000, "0.25").toString()).toBe("1200");
  });
});

describe("2.2: a fixed rate is not a fixed payment", () => {
  it("lowers the payment month by month under equal principal at a fixed rate", () => {
    // 360,000 over 360 months at 4.8%: 1,000 of principal; month 1: 1,440 interest; month 121: 240,000 × 0.4% = 960.
    const m1 = equalPrincipalMonth(360000, 360, "4.8", 1);
    expect(m1.principal.toString()).toBe("1000");
    expect(m1.interest.toString()).toBe("1440");
    expect(m1.payment.toString()).toBe("2440");
    expect(equalPrincipalMonth(360000, 360, "4.8", 121).payment.toString()).toBe("1960");
    expect(equalPrincipalMonth(360000, 360, "4.8", 360).payment.toString()).toBe("1004");
    expect(() => equalPrincipalMonth(360000, 360, "4.8", 361)).toThrow(RangeError);
  });

  it("finds the equal payment from the discount factors (lesson 0.6)", () => {
    // 1/1.05 = 0.952381, 1/1.05² = 0.907029, 1/1.05³ = 0.863838; sum 2.723248; 42,000 ÷ 2.723248 = 15,422.76.
    expect(discountFactor("5", 1).toFixed(6)).toBe("0.952381");
    expect(annuityFactor("5", 3).toFixed(6)).toBe("2.723248");
    expect(equalPayment(42000, "5", 3).toFixed(2)).toBe("15422.76");
    // 20,000 over 2 years at 6%: 20,000 ÷ (0.943396 + 0.889996) = 10,908.74.
    expect(equalPayment(20000, "6", 2).toFixed(2)).toBe("10908.74");
  });

  it("keeps the payment while the rate stays, and closes at zero", () => {
    const rows = equalPaymentPath(42000, ["5", "5", "5"]);
    expect(rows.map((r) => r.payment.toFixed(2))).toEqual(["15422.76", "15422.76", "15422.76"]);
    expect(rows.map((r) => r.interest.toFixed(2))).toEqual(["2100.00", "1433.86", "734.42"]);
    expect(rows[2].closing.toFixed(2)).toBe("0.00");
  });

  it("re-sets the payment when the rate moves", () => {
    // After year 1: 42,000 + 2,100 − 15,422.76 = 28,677.24; at 7% over 2 years: 15,861.15.
    const rows = equalPaymentPath(42000, ["5", "7", "7"]);
    expect(rows[0].closing.toFixed(2)).toBe("28677.24");
    expect(rows[1].payment.toFixed(2)).toBe("15861.15");
    expect(rows[2].payment.toFixed(2)).toBe("15861.15");
    expect(rows[2].closing.toFixed(2)).toBe("0.00");
    // 20,000 at 6% then 8%: 10,291.26 × 1.08 = 11,114.56.
    expect(equalPaymentPath(20000, ["6", "8"])[1].payment.toFixed(2)).toBe("11114.56");
  });

  it("moves an indexed payment with the index", () => {
    // 15,422.76 × 1.02 = 15,731.2152.
    expect(indexedPayment("15422.76", "2", 1).toFixed(2)).toBe("15731.22");
    expect(indexedPayment("15422.76", "2", 0).toFixed(2)).toBe("15422.76");
  });
});

describe("2.3: indexed against not indexed", () => {
  it("indexes first, then charges the real rate on the indexed debt", () => {
    // 100,000 × 1.02 = 102,000; × 1.03 = 105,060. Not indexed at 5%: 105,000.
    expect(indexedAmount(100000, "2").toString()).toBe("102000");
    expect(indexedYearOwed(100000, "3", "2").toString()).toBe("105060");
    expect(plainYearOwed(100000, "5").toString()).toBe("105000");
  });

  it("finds the inflation at which both cost the same", () => {
    // 1.05 ÷ 1.03 − 1 = 1.9417…%; not the 2 points of the rough subtraction.
    expect(r2(breakEvenInflation("5", "3"))).toBe("1.94");
    expect(r2(breakEvenInflation("4.5", "2.5"))).toBe("1.95");
  });

  it("turns a real rate into one before inflation and back", () => {
    // 1.03 × 1.02 − 1 = 5.06%; 1.06 ÷ 1.02 − 1 = 3.92%.
    expect(r2(rateBeforeInflation("3", "2"))).toBe("5.06");
    expect(r2(realRate("6", "2"))).toBe("3.92");
    expect(r2(realRate(rateBeforeInflation("3", "2"), "2"))).toBe("3");
  });
});

describe("2.4: stated, effective, before and after inflation", () => {
  it("divides by 12 for the monthly rate and compounds for the effective rate", () => {
    expect(monthlyByDivision("6").toString()).toBe("0.5");
    // 1.005^12 = 1.0616778; 1.004916…^12 for 5.9% = 1.0606… (Brain page 7798786: 6.06%).
    expect(r2(effectiveFromStated("6"))).toBe("6.17");
    expect(r2(effectiveFromStated("5.9"))).toBe("6.06");
    expect(r2(effectiveFromStated("3"))).toBe("3.04");
  });

  it("compares a stated rate and an indexed stated rate only after both conversions", () => {
    // 5% stated → 5.12% effective; 3% indexed → 3.04% effective real → 5.10% with 2% inflation.
    expect(r2(effectiveFromStated("5"))).toBe("5.12");
    expect(r2(rateBeforeInflation(effectiveFromStated("3"), "2"))).toBe("5.1");
    expect(r2(breakEvenInflation(effectiveFromStated("5"), effectiveFromStated("3")))).toBe("2.01");
  });
});
