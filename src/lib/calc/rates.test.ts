import { describe, expect, it } from "vitest";
import { effectiveAnnualRate, growthFactor, periodicRateByDivision, periodicRateFromEffective, roundedString } from "./rates.ts";

describe("periodicRateByDivision", () => {
  it("divides the annual rate by 12", () => {
    // 6 ÷ 12 = 0.5; 4.8 ÷ 12 = 0.4; 3 ÷ 12 = 0.25 (worked by hand).
    expect(periodicRateByDivision("6").toString()).toBe("0.5");
    expect(periodicRateByDivision("4.8").toString()).toBe("0.4");
    expect(periodicRateByDivision("3").toString()).toBe("0.25");
  });

  it("divides by another number of periods when asked", () => {
    expect(periodicRateByDivision("8", 4).toString()).toBe("2");
  });

  it("refuses a non-whole number of periods per year", () => {
    expect(() => periodicRateByDivision("6", 0)).toThrow(RangeError);
    expect(() => periodicRateByDivision("6", 1.5)).toThrow(RangeError);
  });
});

describe("effectiveAnnualRate", () => {
  it("is higher than the stated rate when interest is added monthly", () => {
    // 1.005^12 = 1.0616778118644995687897076174316... → 6.16778...%
    expect(effectiveAnnualRate("6").toString()).toBe("6.1677811864499568789707617431640625");
    expect(roundedString(effectiveAnnualRate("6"), 2)).toBe("6.17");
  });

  it("gives 12.68% for 12% a year added monthly", () => {
    // 1.01^12 = 1.126825030131969720661201 (by repeated squaring: 1.01² = 1.0201, ^4 = 1.04060401, ...)
    expect(effectiveAnnualRate("12").toString()).toBe("12.6825030131969720661201");
  });

  it("equals the stated rate when interest is added once a year", () => {
    expect(effectiveAnnualRate("6", 1).toString()).toBe("6");
  });

  it("gives 4.91% for 4.8% a year added monthly", () => {
    // 1.004^12 = 1.04907020753480571262606...
    expect(roundedString(effectiveAnnualRate("4.8"), 2)).toBe("4.91");
  });
});

describe("periodicRateFromEffective", () => {
  it("takes the twelfth root", () => {
    // 1.06^(1/12) = 1.00486755056534303754... → 0.48675...% a month
    expect(roundedString(periodicRateFromEffective("6"), 6)).toBe("0.486755");
    expect(roundedString(periodicRateFromEffective("6"), 4)).toBe("0.4868");
  });

  it("is a little less than division by 12", () => {
    expect(periodicRateFromEffective("6").lt(periodicRateByDivision("6"))).toBe(true);
  });

  it("undoes the effective-rate conversion", () => {
    const back = periodicRateFromEffective(effectiveAnnualRate("6"));
    expect(roundedString(back, 20)).toBe("0.5");
  });

  it("compounds back to the effective rate", () => {
    const m = periodicRateFromEffective("6");
    expect(roundedString(growthFactor(m, 12), 20)).toBe("1.06");
  });
});

describe("growthFactor", () => {
  it("raises 1 + r to the power n", () => {
    expect(growthFactor("10", 2).toString()).toBe("1.21");
    expect(growthFactor("0.5", 0).toString()).toBe("1");
  });

  it("refuses a fractional number of periods", () => {
    expect(() => growthFactor("5", 1.5)).toThrow(RangeError);
  });
});

describe("roundedString", () => {
  it("rounds half away from zero and drops trailing zeros", () => {
    expect(roundedString("6.165", 2)).toBe("6.17");
    expect(roundedString("6.10", 2)).toBe("6.1");
    expect(roundedString("0.5", 4)).toBe("0.5");
  });
});
