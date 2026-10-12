import { describe, expect, it } from "vitest";
import { childrenUnder, householdSize, monthlyFromYearly } from "./forms.ts";

describe("childrenUnder", () => {
  it("counts the children below the form's age limit", () => {
    // Ages 4, 19, 20: below 18 only the 4-year-old; below 21 all three (by hand).
    expect(childrenUnder([4, 19, 20], 18)).toBe(1);
    expect(childrenUnder([4, 19, 20], 21)).toBe(3);
    // Ages 2, 16, 19, 20: two below 18, four below 21.
    expect(childrenUnder([2, 16, 19, 20], 18)).toBe(2);
    expect(childrenUnder([2, 16, 19, 20], 21)).toBe(4);
  });

  it("does not count a child at the limit itself", () => {
    expect(childrenUnder([18], 18)).toBe(0);
  });

  it("is 0 for no children", () => {
    expect(childrenUnder([], 18)).toBe(0);
  });

  it("refuses an age that is not a whole number", () => {
    expect(() => childrenUnder([3.5], 18)).toThrow(RangeError);
    expect(() => childrenUnder([-1], 18)).toThrow(RangeError);
  });
});

describe("householdSize", () => {
  it("adds the adults and the children at home", () => {
    // Two parents and four children: 6 (by hand).
    expect(householdSize(2, [2, 16, 19, 20])).toBe(6);
    expect(householdSize(1, [])).toBe(1);
  });

  it("refuses a household without an adult", () => {
    expect(() => householdSize(0, [3])).toThrow(RangeError);
  });
});

describe("monthlyFromYearly", () => {
  it("divides a yearly amount by 12, exactly", () => {
    // 210,000 ÷ 12 = 17,500; 192,000 ÷ 12 = 16,000 (by hand).
    expect(monthlyFromYearly("210000").toString()).toBe("17500");
    expect(monthlyFromYearly(192000).toString()).toBe("16000");
    // 100,000 ÷ 12 = 8,333.33… — not rounded here.
    expect(monthlyFromYearly(100000).toFixed(4)).toBe("8333.3333");
  });

  it("refuses a negative amount", () => {
    expect(() => monthlyFromYearly(-1)).toThrow(RangeError);
  });
});
