import { describe, expect, it } from "vitest";
import {
  approxRealRate,
  basketCost,
  chainIndex,
  changePercent,
  indexedAmount,
  indexedBalance,
  indexationTable,
  indexPoints,
  indexValue,
  nominalRate,
  plainNumber,
  realRate,
  realValue,
} from "./indexation.ts";
import { moneyString } from "./money.ts";

describe("basketCost and indexValue", () => {
  it("adds quantity × price over the basket", () => {
    // 4 × 10 + 10 × 6 + 10 × 10 + 40 × 5 = 40 + 60 + 100 + 200 = 400 (by hand).
    const base = [
      { quantity: 4, price: "10" },
      { quantity: 10, price: "6" },
      { quantity: 10, price: "10" },
      { quantity: 40, price: "5" },
    ];
    expect(basketCost(base).toString()).toBe("400");
  });

  it("gives the base period 100 and a basket 5% dearer 105", () => {
    // 44 + 66 + 90 + 220 = 420; 420 ÷ 400 × 100 = 105.
    const now = [
      { quantity: 4, price: "11" },
      { quantity: 10, price: "6.6" },
      { quantity: 10, price: "9" },
      { quantity: 40, price: "5.5" },
    ];
    expect(indexValue(400, 400).toString()).toBe("100");
    expect(indexValue(basketCost(now), 400).toString()).toBe("105");
  });

  it("refuses a base that costs nothing", () => {
    expect(() => indexValue(10, 0)).toThrow(RangeError);
  });
});

describe("changePercent and indexPoints", () => {
  it("tells points from percent", () => {
    // 120 → 126: 6 points, but 6 ÷ 120 = 5%.
    expect(indexPoints(120, 126).toString()).toBe("6");
    expect(changePercent(120, 126).toString()).toBe("5");
    // 110 → 113.3: 3.3 points, 3%.
    expect(changePercent(110, "113.3").toString()).toBe("3");
  });

  it("chains two years of inflation by multiplying", () => {
    // 100 × 1.04 × 1.05 = 109.2, not 109.
    expect(chainIndex(100, ["4", "5"]).toString()).toBe("109.2");
  });
});

describe("indexation", () => {
  it("moves an amount with the index", () => {
    expect(indexedAmount(100000, 100, 103).toString()).toBe("103000");
    // 108.15 ÷ 105 = 1.03, so 80,000 → 82,400.
    expect(indexedAmount(80000, 105, "108.15").toString()).toBe("82400");
  });

  it("compounds a constant yearly inflation", () => {
    // 100,000 × 1.03 × 1.03 = 106,090.
    expect(indexedBalance(100000, "3", 2).toString()).toBe("106090");
    expect(indexedBalance(100000, "3", 0).toString()).toBe("100000");
  });

  it("deflates a fixed amount into today's shekels", () => {
    // 1.02^5 = 1.1040808032; 100,000 ÷ 1.1040808032 = 90,573.0807...
    expect(moneyString(realValue(100000, "2", 5))).toBe("90573.08");
  });

  it("refuses a fractional number of years", () => {
    expect(() => indexedBalance(1, "3", 1.5)).toThrow(RangeError);
    expect(() => realValue(1, "3", -1)).toThrow(RangeError);
  });
});

describe("real and nominal rates", () => {
  it("divides growth factors, it does not subtract", () => {
    // 1.05 ÷ 1.02 = 1.0294117...; the shortcut says 3.
    expect(plainNumber(realRate("5", "2"))).toBe("2.94");
    expect(approxRealRate("5", "2").toString()).toBe("3");
    // 1.06 ÷ 1.04 = 1.0192307...
    expect(plainNumber(realRate("6", "4"))).toBe("1.92");
    // 1.04 ÷ 1.03 = 1.0097087...
    expect(plainNumber(realRate("4", "3"))).toBe("0.97");
  });

  it("multiplies growth factors to get the nominal rate", () => {
    // 1.03 × 1.02 = 1.0506.
    expect(nominalRate("3", "2").toString()).toBe("5.06");
  });

  it("goes there and back", () => {
    expect(plainNumber(realRate(nominalRate("3", "2"), "2"))).toBe("3");
  });
});

describe("plainNumber", () => {
  it("drops trailing zeros and keeps two decimals at most", () => {
    expect(plainNumber("3.00")).toBe("3");
    expect(plainNumber("109.200")).toBe("109.2");
    expect(plainNumber("23.529411")).toBe("23.53");
  });
});

describe("indexationTable", () => {
  it("rounds each year's indexation to the agora and adds it", () => {
    // 50,000 at 2%: +1,000 → 51,000; +1,020 → 52,020; +1,040.40 → 53,060.40 (by hand).
    const rows = indexationTable(50000, "2", 3).map((r) => [r.opening.toFixed(2), r.indexation.toFixed(2), r.closing.toFixed(2)]);
    expect(rows).toEqual([
      ["50000.00", "1000.00", "51000.00"],
      ["51000.00", "1020.00", "52020.00"],
      ["52020.00", "1040.40", "53060.40"],
    ]);
  });
});
