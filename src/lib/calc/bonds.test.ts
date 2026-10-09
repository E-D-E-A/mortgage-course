import { describe, expect, it } from "vitest";
import {
  bondPayments,
  bondPrice,
  curvePrice,
  curveShape,
  deflatedAmount,
  impliedRate,
  indexedAmount,
  inflationGap,
  percentOff,
  percentString,
  presentValue,
  pricedPayments,
  simpleDiscount,
  singlePaymentYield,
  totalPayments,
} from "./bonds.ts";
import { moneyString } from "./money.ts";

describe("presentValue", () => {
  it("discounts one year", () => {
    // 110 ÷ 1.10 = 100 exactly.
    expect(presentValue(110, "10", 1).toString()).toBe("100");
  });

  it("discounts two years by the square", () => {
    // 100 ÷ 1.04² = 100 ÷ 1.0816 = 92.4556...
    expect(moneyString(presentValue(100, "4", 2))).toBe("92.46");
  });

  it("keeps an amount paid now as it is", () => {
    expect(presentValue(250, "7", 0).toString()).toBe("250");
  });

  it("refuses a fractional or negative number of years", () => {
    expect(() => presentValue(100, "5", 1.5)).toThrow(RangeError);
    expect(() => presentValue(100, "5", -1)).toThrow(RangeError);
  });
});

describe("the two mistakes the exercises explain", () => {
  it("simple discounting divides by 1 + r × years", () => {
    // 100 ÷ 1.08 = 92.5925...
    expect(moneyString(simpleDiscount(100, "4", 2))).toBe("92.59");
  });

  it("taking a percentage off multiplies by 1 − r", () => {
    // 110 × 0.96 = 105.60
    expect(percentOff(110, "4").toString()).toBe("105.6");
  });
});

describe("bondPayments", () => {
  it("pays the yearly amount and the face with the last payment", () => {
    const p = bondPayments(100, "5", 3);
    expect(p.map((x) => [x.year, x.payment.toString()])).toEqual([
      [1, "5"],
      [2, "5"],
      [3, "105"],
    ]);
  });

  it("adds up to what a holder receives by keeping it to the end", () => {
    // 4 + 4 + 4 + 104 = 116
    expect(totalPayments(100, "4", 4).toString()).toBe("116");
  });

  it("refuses a bond of zero years", () => {
    expect(() => bondPayments(100, "5", 0)).toThrow(RangeError);
  });
});

describe("bondPrice", () => {
  it("is the face when the yield equals the yearly payment rate", () => {
    expect(moneyString(bondPrice(100, "5", 3, "5"))).toBe("100.00");
    expect(moneyString(bondPrice(100, "5", 10, "5"))).toBe("100.00");
  });

  it("falls when the yield rises, and rises when it falls (the seesaw)", () => {
    // 5/1.06 + 5/1.06² + 105/1.06³ = 4.71698 + 4.44998 + 88.15996 = 97.3269...
    expect(moneyString(bondPrice(100, "5", 3, "6"))).toBe("97.33");
    // 5/1.04 + 5/1.04² + 105/1.04³ = 4.80769 + 4.62278 + 93.34460 = 102.7750...
    expect(moneyString(bondPrice(100, "5", 3, "4"))).toBe("102.78");
  });

  it("moves more for a longer bond", () => {
    // 20 years at 6%: 5 × 11.46992 + 100 ÷ 3.20714 = 57.3496 + 31.1805 = 88.53
    expect(moneyString(bondPrice(100, "5", 20, "6"))).toBe("88.53");
    expect(moneyString(bondPrice(100, "5", 10, "6"))).toBe("92.64");
    expect(moneyString(bondPrice(100, "5", 2, "6"))).toBe("98.17");
  });

  it("rounds each row on its own, so a table can end one agora off the formula", () => {
    const rows = pricedPayments(100, "5", 3, "4").map((r) => moneyString(r.presentValue));
    expect(rows).toEqual(["4.81", "4.62", "93.34"]); // they add up to 102.77
  });
});

describe("curvePrice", () => {
  it("discounts each payment at the yield for its own length", () => {
    // 5/1.03 + 5/1.04² + 105/1.05³ = 4.85437 + 4.62278 + 90.70295 = 100.1801
    expect(moneyString(curvePrice(100, "5", ["3", "4", "5"]))).toBe("100.18");
  });

  it("matches bondPrice on a flat curve", () => {
    expect(curvePrice(100, "5", ["6", "6", "6"]).eq(bondPrice(100, "5", 3, "6"))).toBe(true);
  });

  it("refuses a curve shorter than the bond", () => {
    expect(() => pricedPayments(100, "5", 3, ["3", "4"])).toThrow(RangeError);
  });
});

describe("singlePaymentYield", () => {
  it("is the gain over the price for one year", () => {
    expect(percentString(singlePaymentYield(110, 100, 1))).toBe("10.00");
    // 5 ÷ 105 = 4.7619...%
    expect(percentString(singlePaymentYield(110, 105, 1))).toBe("4.76");
    expect(percentString(singlePaymentYield(110, 110, 1))).toBe("0.00");
  });

  it("is a yearly rate over several years", () => {
    // 100 → 121 in two years is 10% a year (1.1² = 1.21).
    expect(singlePaymentYield(121, 100, 2).toDecimalPlaces(10).toString()).toBe("10");
  });

  it("refuses a price of zero", () => {
    expect(() => singlePaymentYield(110, 0, 1)).toThrow(RangeError);
  });
});

describe("indexation", () => {
  it("multiplies a payment in today's prices by the index's change", () => {
    // 102 × 1.03 = 105.06
    expect(indexedAmount(102, "3").toString()).toBe("105.06");
  });

  it("turns a nominal amount back into today's prices", () => {
    // 105 ÷ 1.03 = 101.9417...
    expect(moneyString(deflatedAmount(105, "3"))).toBe("101.94");
  });
});

describe("inflationGap", () => {
  it("compounds, so it sits a little below the plain subtraction", () => {
    // 1.04 ÷ 1.015 − 1 = 2.4630...%, not 2.5%
    expect(percentString(inflationGap("4", "1.5"))).toBe("2.46");
    // 1.04 ÷ 1.02 − 1 = 1.9607...%
    expect(percentString(inflationGap("4", "2"))).toBe("1.96");
  });
});

describe("impliedRate", () => {
  it("finds the second year's rate between a one-year and a two-year yield", () => {
    // 1.04² ÷ 1.03 = 1.0816 ÷ 1.03 = 1.050097 → 5.01%
    expect(percentString(impliedRate("3", 1, "4", 2))).toBe("5.01");
    // 1.03² ÷ 1.02 = 1.0609 ÷ 1.02 = 1.040098 → 4.01%
    expect(percentString(impliedRate("2", 1, "3", 2))).toBe("4.01");
  });

  it("is the same rate again on a flat curve", () => {
    expect(impliedRate("4", 5, "4", 10).toDecimalPlaces(10).toString()).toBe("4");
  });

  it("takes a root over a longer stretch", () => {
    // (1.0425^10 ÷ 1.0375^5)^(1/5) − 1 = 4.7524...%
    expect(percentString(impliedRate("3.75", 5, "4.25", 10))).toBe("4.75");
  });

  it("refuses a long length that is not longer", () => {
    expect(() => impliedRate("3", 2, "4", 2)).toThrow(RangeError);
  });
});

describe("curveShape", () => {
  const pts = (...ys: string[]) => [1, 2, 5, 10, 20].map((years, i) => ({ years, yieldPercent: ys[i] }));

  it("names the three textbook shapes", () => {
    expect(curveShape(pts("3", "3.25", "3.75", "4.25", "4.75"))).toBe("rising");
    expect(curveShape(pts("5", "4.5", "4", "3.75", "3.5"))).toBe("falling");
    expect(curveShape(pts("4", "4", "4", "4", "4"))).toBe("flat");
  });

  it("calls a curve that goes up and then down mixed", () => {
    expect(curveShape(pts("3", "4", "5", "4", "3"))).toBe("mixed");
  });

  it("ignores steps within the tolerance", () => {
    expect(curveShape(pts("4", "4.02", "4", "4.01", "4"))).toBe("flat");
  });
});
