import { describe, expect, it } from "vitest";
import { parseAnswer } from "./progress.ts";

describe("parseAnswer", () => {
  it("reads the ways a learner writes a number", () => {
    expect(parseAnswer("1210")).toBe(1210);
    expect(parseAnswer("1,210")).toBe(1210);
    expect(parseAnswer("1,032.80")).toBe(1032.8);
    expect(parseAnswer("1210 ₪")).toBe(1210);
    expect(parseAnswer("₪ 1,210.5")).toBe(1210.5);
    expect(parseAnswer("1210 ש״ח")).toBe(1210);
    expect(parseAnswer('1210 ש"ח')).toBe(1210);
    expect(parseAnswer("5.4%")).toBe(5.4);
    expect(parseAnswer(" 12 ")).toBe(12);
    expect(parseAnswer(".5")).toBe(0.5);
    expect(parseAnswer("12.")).toBe(12);
    expect(parseAnswer("+3")).toBe(3);
  });

  it("reads a minus sign, the ASCII one and the Unicode one", () => {
    expect(parseAnswer("-1")).toBe(-1);
    expect(parseAnswer("−1.00")).toBe(-1);
    expect(parseAnswer("−3,247.15 ₪")).toBe(-3247.15);
    expect(parseAnswer("⁦-1⁩")).toBe(-1);
  });

  it("refuses what is not a number instead of deleting letters", () => {
    for (const text of ["", " ", "-", ".", "abc", "12abc", "abc12", "1e1", "1e3", "1.2.3", "5-", "1-2", "Infinity", "NaN", "0x10", "--1", "₪"]) {
      expect(parseAnswer(text), text).toBeNull();
    }
  });
});
