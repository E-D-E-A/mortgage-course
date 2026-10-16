import { describe, expect, it } from "vitest";
import { CASE_A, INITIAL_MIX, caseADisposable } from "../../data/case-a-mix.ts";
import { percentString } from "./percent.ts";
import {
  band,
  equityToReach,
  EXAMPLE_THRESHOLDS,
  incomeRoom,
  KIND_INFO,
  loanCut,
  loanRoom,
  ltvAfterCut,
  ltvAfterUse,
  paymentCut,
  paymentRoom,
  pointsTo,
  ratioAfterCut,
  shortestTerm,
  standing,
  standings,
  statusOf,
  termRoute,
  thresholdsOf,
  tracksAfterCut,
} from "./positioning.ts";
import { qualifyingTotal } from "./sensitivity.ts";

const t = (id: string) => EXAMPLE_THRESHOLDS.find((x) => x.id === id)!;

describe("thresholds and their kinds", () => {
  it("has the four kinds, each with a name and a label", () => {
    expect(Object.keys(KIND_INFO).sort()).toEqual(["bank_policy", "capital_threshold", "field_hypothesis", "regulatory_limit"]);
    for (const k of Object.values(KIND_INFO)) {
      expect(k.name.length).toBeGreaterThan(0);
      expect(k.label.length).toBeGreaterThan(0);
    }
  });

  it("takes the directive's own lines from regulation.ts, not from this file", () => {
    expect(t("pti.50").percent).toBe("50");
    expect(t("pti.40").percent).toBe("40");
    expect(t("ltv.75").percent).toBe("75");
    expect(t("pti.50").kind).toBe("regulatory_limit");
    expect(t("pti.40").kind).toBe("capital_threshold");
  });

  it("labels what the course only heard as a field hypothesis", () => {
    expect(EXAMPLE_THRESHOLDS.filter((x) => x.kind === "field_hypothesis").map((x) => x.id)).toEqual(["pti.30", "pti.35", "ltv.40", "ltv.60"]);
  });

  it("lists the lines of one metric, lowest first", () => {
    expect(thresholdsOf("pti").map((x) => x.percent)).toEqual(["30", "35", "40", "50"]);
    expect(thresholdsOf("ltv").map((x) => x.percent)).toEqual(["40", "60", "75"]);
  });
});

describe("where a ratio stands", () => {
  it("is over a line only when strictly above it", () => {
    expect(statusOf("39.9", "40")).toBe("within");
    expect(statusOf("40", "40")).toBe("at");
    expect(statusOf("40.01", "40")).toBe("over");
  });

  it("gives the points to the line: positive is room, negative is how far over", () => {
    expect(pointsTo("39.5", "40").toString()).toBe("0.5");
    expect(pointsTo("42", "40").toString()).toBe("-2");
    const s = standing("40.4", t("pti.40"));
    expect(s.status).toBe("over");
    expect(s.points.toString()).toBe("-0.4");
  });

  it("lists the standings lowest line first", () => {
    const s = standings("37", thresholdsOf("pti"));
    expect(s.map((x) => [x.threshold.percent, x.status])).toEqual([
      ["30", "over"],
      ["35", "over"],
      ["40", "within"],
      ["50", "within"],
    ]);
  });

  it("finds the band: the lines crossed and the next one up", () => {
    const b = band("37", thresholdsOf("pti"));
    expect(b.crossed.map((x) => x.percent)).toEqual(["30", "35"]);
    expect(b.next?.percent).toBe("40");
    expect(b.pointsToNext?.toString()).toBe("3");
    const past = band("55", thresholdsOf("pti"));
    expect(past.next).toBeNull();
    expect(past.pointsToNext).toBeNull();
  });

  it("counts a ratio exactly on a line as not crossed", () => {
    const b = band("40", thresholdsOf("pti"));
    expect(b.next?.percent).toBe("40");
    expect(b.pointsToNext?.toString()).toBe("0");
  });
});

describe("the distance in shekels", () => {
  it("is the largest payment the line allows, minus the payment (20,250 × 40% = 8,100)", () => {
    expect(paymentRoom("20250", "8181.30", "40").toFixed(2)).toBe("-81.30");
    expect(paymentRoom("20250", "8000", "40").toFixed(2)).toBe("100.00");
    expect(paymentRoom("20250", "8100", "40").toFixed(2)).toBe("0.00");
  });

  it("floors the line's payment to the agora", () => {
    // 10,001 × 33.33% = 3,333.3333 → 3,333.33
    expect(paymentRoom("10001", "3000", "33.33").toFixed(2)).toBe("333.33");
  });

  it("is the largest loan the line allows, minus the loan (2,200,000 × 75% = 1,650,000)", () => {
    expect(loanRoom("2200000", "1640000", "75").toFixed(2)).toBe("10000.00");
    expect(loanRoom("2200000", "1660000", "75").toFixed(2)).toBe("-10000.00");
  });

  it("is the income a payment needs to sit on the line, rounded up: 8,181.30 × 100 ÷ 40 = 20,453.25", () => {
    expect(incomeRoom("20250", "8181.30", "40").toFixed(2)).toBe("203.25");
    // 100 ÷ 3 per hundred: 100 × 100 ÷ 30 = 333.3333 → 333.34 (up, so the payment is within the line)
    expect(incomeRoom("300", "100", "30").toFixed(2)).toBe("33.34");
  });

  it("is zero when the payment is already within the line", () => {
    expect(incomeRoom("20250", "7000", "40").toFixed(2)).toBe("0.00");
    expect(incomeRoom("20250", "8100", "40").toFixed(2)).toBe("0.00");
  });

  it("refuses an income of zero or less, and a line of zero", () => {
    expect(() => paymentRoom("0", "100", "40")).toThrow(RangeError);
    expect(() => incomeRoom("1000", "100", "0")).toThrow(RangeError);
  });
});

describe("the price of moving away from a line (case A)", () => {
  const disp = caseADisposable();

  it("starts from the stage-5 numbers: loan 1,640,000, ratio a little over 40%", () => {
    expect(percentString(ratioAfterCut(INITIAL_MIX, disp, "0"))).toBe("40.4");
    expect(percentString(ltvAfterCut(INITIAL_MIX, CASE_A.price, "0"))).toBe("74.55");
  });

  it("needs 17,000 ₪ off the loan to get to 40%: 16,000 is still over, 17,000 is under", () => {
    expect(ratioAfterCut(INITIAL_MIX, disp, "16000").gt(40)).toBe(true);
    expect(ratioAfterCut(INITIAL_MIX, disp, "17000").lte(40)).toBe(true);
    expect(loanCut(INITIAL_MIX, disp, "40").toFixed(0)).toBe("17000");
  });

  it("needs much more to get to 35%: the price grows with the distance", () => {
    const to35 = loanCut(INITIAL_MIX, disp, "35");
    const to30 = loanCut(INITIAL_MIX, disp, "30");
    expect(to35.gt(200000)).toBe(true);
    expect(to30.gt(to35)).toBe(true);
    // The cut found is the first whole step under the line.
    expect(ratioAfterCut(INITIAL_MIX, disp, to35).lte(35)).toBe(true);
    expect(ratioAfterCut(INITIAL_MIX, disp, to35.minus(1000)).gt(35)).toBe(true);
  });

  it("is zero when the ratio is already within, and honours the step", () => {
    expect(loanCut(INITIAL_MIX, disp, "45").toFixed(0)).toBe("0");
    expect(loanCut(INITIAL_MIX, disp, "40", "5000").toFixed(0)).toBe("20000");
  });

  it("keeps the tracks in proportion and the loan smaller by the cut", () => {
    const after = tracksAfterCut(INITIAL_MIX, "17000");
    const loan = after.reduce((s, x) => s + Number(x.amount), 0);
    expect(loan).toBeCloseTo(1623000, 2);
    expect(qualifyingTotal(after).lt(qualifyingTotal(INITIAL_MIX))).toBe(true);
  });

  it("does not change the mix it is given", () => {
    const before = JSON.stringify(INITIAL_MIX);
    tracksAfterCut(INITIAL_MIX, "17000");
    loanCut(INITIAL_MIX, disp, "40");
    expect(JSON.stringify(INITIAL_MIX)).toBe(before);
  });

  it("shows the financing ratio crossing 75% when 20,000 ₪ of equity go to a debt (the loan grows by as much)", () => {
    expect(ltvAfterUse("2200000", "1640000", "10000").toString()).toBe("75");
    expect(percentString(ltvAfterUse("2200000", "1640000", "20000"))).toBe("75.45");
    expect(() => ltvAfterUse("2200000", "1640000", "-1")).toThrow(RangeError);
  });

  it("the ratio and the financing ratio move together when the loan is cut", () => {
    const r1 = ratioAfterCut(INITIAL_MIX, disp, "50000");
    const r0 = ratioAfterCut(INITIAL_MIX, disp, "0");
    expect(r1.lt(r0)).toBe(true);
    expect(ltvAfterCut(INITIAL_MIX, CASE_A.price, "50000").lt(ltvAfterCut(INITIAL_MIX, CASE_A.price, "0"))).toBe(true);
  });
});

describe("the price of a longer term (one level-payment loan)", () => {
  // The closed form, written again here with plain numbers: P × m ÷ (1 − (1 + m)^−n), m = rate ÷ 12.
  const level = (p: number, annual: number, n: number) => {
    const m = annual / 12 / 100;
    return (p * m) / (1 - (1 + m) ** -n);
  };

  it("lowers the payment and raises the total", () => {
    const r = termRoute("1000000", "4.5", 240, 360);
    expect(Number(r.fromPayment)).toBeCloseTo(Math.round(level(1e6, 4.5, 240) * 100) / 100, 2);
    expect(Number(r.toPayment)).toBeCloseTo(Math.round(level(1e6, 4.5, 360) * 100) / 100, 2);
    expect(r.fromPayment.toFixed(2)).toBe("6326.49");
    expect(r.toPayment.toFixed(2)).toBe("5066.85");
    expect(r.paymentDrop.toFixed(2)).toBe("1259.64");
    expect(r.fromTotal.toFixed(2)).toBe("1518357.60");
    expect(r.toTotal.toFixed(2)).toBe("1824066.00");
    expect(r.extraTotal.toFixed(2)).toBe("305708.40");
  });

  it("goes the other way for a shorter term: the payment rises and the total falls", () => {
    const r = termRoute("1000000", "4.5", 360, 240);
    expect(r.paymentDrop.isNeg()).toBe(true);
    expect(r.extraTotal.isNeg()).toBe(true);
  });

  it("finds the shortest whole-year term whose payment fits a cap", () => {
    expect(shortestTerm("1000000", "4.5", "5600", 240)).toBe(300);
    expect(shortestTerm("1000000", "4.5", "6400", 240)).toBe(240);
    expect(shortestTerm("1000000", "4.5", "4000", 240)).toBeNull();
    // It never answers a term that is not a step from `from`.
    expect(((shortestTerm("1000000", "4.5", "5500", 240) as number) - 240) % 12).toBe(0);
  });
});

describe("what must give to reach a line", () => {
  it("is the payment that must fall, or zero when within", () => {
    expect(paymentCut("20250", "8181.30", "40").toFixed(2)).toBe("81.30");
    expect(paymentCut("20250", "8000", "40").toFixed(2)).toBe("0.00");
  });

  it("is the equity that must replace the loan to reach a financing line (60% of 2,200,000 = 1,320,000)", () => {
    expect(equityToReach("2200000", "1640000", "60").toFixed(2)).toBe("320000.00");
    expect(equityToReach("2200000", "1640000", "75").toFixed(2)).toBe("0.00");
  });
});
