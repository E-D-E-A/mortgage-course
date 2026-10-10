import { describe, expect, it } from "vitest";
import { annuityStatement } from "./amortization.ts";
import { moneyString } from "./money.ts";
import { HAND_MISTAKES, handMistake, interestBetween, naiveBalance, SHEET_CONVENTIONS, sheetFigures } from "./workshop.ts";

// The hand loan of workshop 3.12: 12,000 ₪ at 6% a year (0.5% a month) for 12 months.
const H = ["12000", "6", 12] as const;

describe("a hand-made schedule, month by month", () => {
  it("is the statement the course's calculator prints, checked by hand", () => {
    const rows = annuityStatement(...H);
    // Month 1: 0.5% of 12,000 = 60; 1,032.80 − 60 = 972.80; 12,000 − 972.80 = 11,027.20.
    expect(moneyString(rows[0].payment)).toBe("1032.80");
    expect(moneyString(rows[0].interest)).toBe("60.00");
    expect(moneyString(rows[0].closing)).toBe("11027.20");
    // Month 2: 0.5% of 11,027.20 = 55.136 → 55.14.
    expect(moneyString(rows[1].interest)).toBe("55.14");
    expect(moneyString(rows[1].closing)).toBe("10049.54");
  });

  it("names what each mistake writes in month 2", () => {
    const m = (field: Parameters<typeof handMistake>[4], mistake: Parameters<typeof handMistake>[5]) => handMistake(...H, 2, field, mistake).toFixed();
    expect(m("interest", "interest_on_original")).toBe("60");
    expect(m("interest", "unrounded")).toBe("55.136");
    expect(m("interest", "truncated")).toBe("55.13");
    // 11,027.20 × 6% = 661.632 → 661.63
    expect(m("interest", "annual_rate")).toBe("661.63");
    // 11,027.20 − 1,032.80
    expect(m("closing", "whole_payment")).toBe("9994.4");
    expect(m("closing", "unrounded")).toBe("10049.536");
    expect(m("principal", "equal_part")).toBe("1000");
    expect(m("opening", "stale_opening")).toBe("12000");
  });

  it("refuses a mistake in a field where it cannot happen", () => {
    expect(() => handMistake(...H, 2, "opening", "unrounded")).toThrow(RangeError);
    expect(() => handMistake(...H, 1, "opening", "stale_opening")).toThrow(RangeError);
    expect(Object.keys(HAND_MISTAKES)).toEqual(["opening", "interest", "principal", "closing"]);
  });
});

describe("what a spreadsheet shows under each rounding convention", () => {
  it("the course's convention is annuityStatement's totals", () => {
    const s = sheetFigures(...H, "statement");
    expect(moneyString(s.regular)).toBe("1032.80");
    // The last payment closes the balance: 1,027.64 + 5.14.
    expect(moneyString(s.last)).toBe("1032.78");
    expect(moneyString(s.totalPaid)).toBe("12393.58");
    expect(moneyString(s.totalInterest)).toBe("393.58");
    expect(moneyString(s.finalClosing)).toBe("0.00");
  });

  it("without ROUND, the totals are the exact payment × 12", () => {
    const s = sheetFigures(...H, "exact");
    // 1,032.79717… × 12 = 12,393.566…
    expect(moneyString(s.totalPaid)).toBe("12393.57");
    expect(moneyString(s.totalInterest)).toBe("393.57");
  });

  it("without the last-month adjustment, a few agorot stay on the balance", () => {
    const s = sheetFigures(...H, "no_last_adjust");
    expect(moneyString(s.last)).toBe("1032.80");
    expect(moneyString(s.finalClosing)).toBe("-0.02");
    expect(moneyString(s.totalPaid)).toBe("12393.60");
  });

  it("every convention repays the whole loan: paid − interest = principal (less what is left)", () => {
    for (const c of SHEET_CONVENTIONS) {
      const s = sheetFigures("400000", "5.4", 180, c);
      expect(moneyString(s.totalPaid.minus(s.totalInterest).plus(s.finalClosing))).toBe("400000.00");
    }
  });
});

describe("readings of the schedule", () => {
  it("adds the interest over a stretch of months", () => {
    // 60 + 55.14 + 50.25
    expect(moneyString(interestBetween(...H, 1, 3))).toBe("165.39");
    expect(moneyString(interestBetween(...H, 1, 12))).toBe("393.58");
  });

  it("the naive balance takes whole payments off the loan", () => {
    expect(moneyString(naiveBalance(...H, 2))).toBe("9934.40");
  });
});
