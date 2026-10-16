import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { CURVES } from "../../data/curves.ts";
import {
  expectedIndex,
  expectedIndexBySubtraction,
  expectedInflation,
  forecastInputs,
  forecastTrack,
  forwardAnchors,
  forwardFromYields,
  forwardInflation,
  forwardRate,
  shiftCurve,
  simpleGap,
  summarize,
  yearlyInflation,
  zeroYield,
} from "./forecast.ts";
import { highestPayment, trackPayments } from "./metrics.ts";

const close = (a: Decimal.Value, b: Decimal.Value, places = 8) => expect(new Decimal(a).minus(b).abs().lt(new Decimal(10).pow(-places))).toBe(true);
const A = CURVES.A;
const B = CURVES.B;

describe("forward rates", () => {
  it("lesson 0.12's example: 3% for one year and 4% for two years imply 5.0097% for the second year", () => {
    // 1.04² ÷ 1.03 − 1 = 1.0816 ÷ 1.03 − 1 = 0.0500970873…
    close(forwardFromYields("3", 1, "4", 2), "5.00970873786408", 10);
  });

  it("matches the Brain's worked example: 3.5221% at 5 years and 3.8817% at 10 give 4.2425% for years 5-10", () => {
    // Brain 7831553 (research reader reproduced 4.2425%): 1.038817^10 = 1.463483, 1.035221^5 = 1.188955.
    expect(forwardFromYields("3.5221", 5, "3.8817", 10).toDecimalPlaces(4).toString()).toBe("4.2425");
  });

  it("a flat curve implies the same rate everywhere", () => {
    const flat = Array.from({ length: 30 }, () => "4");
    close(forwardRate(flat, 5, 10), "4", 20);
    close(forwardRate(flat, 0, 7), "4", 20);
  });

  it("from zero years it is the zero yield", () => {
    close(forwardRate(A.nominal, 0, 10), A.nominal[9], 15);
  });

  it("on the illustrative curve A, the 5-to-10 forward is 4.4872% (hand: 1.040901^10 ÷ 1.036945^5, then the fifth root)", () => {
    expect(forwardRate(A.nominal, 5, 10).toDecimalPlaces(4).toString()).toBe("4.4872");
  });

  it("refuses a longer start than end, and a length past the curve", () => {
    expect(() => forwardFromYields("3", 2, "4", 2)).toThrow(RangeError);
    expect(() => zeroYield(A.nominal, 31)).toThrow(RangeError);
    expect(() => zeroYield(A.nominal, 0)).toThrow(RangeError);
  });
});

describe("expected inflation", () => {
  it("is the compounded gap: 4% and 2% give 1.9608%, not 2%", () => {
    expect(expectedInflation("4", "2").toDecimalPlaces(4).toString()).toBe("1.9608");
    expect(simpleGap("4", "2").toString()).toBe("2");
  });

  it("the cumulative index after 10 years is the one-year rate compounded: 1.0196^10 on 4% and 2%", () => {
    // ((1.04 ÷ 1.02))^10 = 1.2127…, by hand 1.0196078^10
    close(expectedIndex(Array(30).fill("4"), Array(30).fill("2"), 10), new Decimal("1.04").div("1.02").pow(10), 15);
    expect(expectedIndex(A.nominal, A.real, 0).toString()).toBe("1");
  });

  it("the shortcut overstates the index: 4% and 2% over 10 years, 1.02^10 against 1.0196^10", () => {
    const n = Array(30).fill("4");
    const r = Array(30).fill("2");
    close(expectedIndexBySubtraction(n, r, 10), new Decimal("1.02").pow(10), 15);
    expect(expectedIndexBySubtraction(n, r, 10).gt(expectedIndex(n, r, 10))).toBe(true);
  });

  it("a forward inflation over one year from zero is that year's expected inflation", () => {
    close(forwardInflation(A.nominal, A.real, 0, 1), expectedInflation(A.nominal[0], A.real[0]), 20);
  });

  it("yearly inflation is rounded to two decimals; with a constant gap every year is the same", () => {
    const n = Array(30).fill("4.04");
    const r = Array(30).fill("2");
    expect(yearlyInflation(n, r, 3).map(String)).toEqual(["2", "2", "2"]);
  });

  it("the rounded yearly inflations chain back to the cumulative index within rounding", () => {
    const yearly = yearlyInflation(A.nominal, A.real, 10);
    const chained = yearly.reduce((p, f) => p.mul(new Decimal(1).plus(f.div(100))), new Decimal(1));
    close(chained, expectedIndex(A.nominal, A.real, 10), 3);
  });
});

describe("anchors", () => {
  it("block 0 is today's anchor, the curve at the reset length; later blocks are forwards", () => {
    const a = forwardAnchors(A.nominal, 5, 4).map(String);
    expect(a).toEqual(["3.69", "4.49", "4.81", "4.91"]);
  });

  it("a block past the end of the curve is refused", () => {
    expect(() => forwardAnchors(A.nominal, 12, 3)).toThrow(RangeError);
  });
});

describe("which forecast each track type needs (the reference table, as transcribed)", () => {
  it("matches the table", () => {
    expect(forecastInputs("fixed_unlinked")).toEqual({ rate: null, linkage: false, forecastable: true });
    expect(forecastInputs("fixed_linked")).toEqual({ rate: null, linkage: true, forecastable: true });
    expect(forecastInputs("prime")).toEqual({ rate: "nominal", linkage: false, forecastable: true });
    expect(forecastInputs("variable_unlinked")).toEqual({ rate: "nominal", linkage: false, forecastable: true });
    expect(forecastInputs("variable_linked")).toEqual({ rate: "real", linkage: true, forecastable: true });
    expect(forecastInputs("fx").forecastable).toBe(false);
    expect(forecastInputs("other").forecastable).toBe(false);
  });
});

describe("forecastTrack", () => {
  const base = { principal: "100000", months: 240, nominal: A.nominal, real: A.real };

  it("a fixed unlinked track pays the same every month: 100,000 at 6% for 20 years is 716.43 (hand-checked)", () => {
    const f = forecastTrack({ ...base, kind: "fixed_unlinked", rate: "6" });
    expect(f.payments?.[0].toFixed(2)).toBe("716.43");
    expect(f.payments?.[238].toFixed(2)).toBe("716.43");
    expect(f.blocks).toHaveLength(1);
    expect(f.spread).toBeNull();
    expect(f.inflation).toBeNull();
  });

  it("a variable unlinked track on a flat curve stays at its rate", () => {
    const flat = Array(30).fill("4.5");
    const f = forecastTrack({ ...base, kind: "variable_unlinked", rate: "4.5", nominal: flat, resetYears: 5 });
    expect(f.blocks.map((b) => b.rate.toString())).toEqual(["4.5", "4.5", "4.5", "4.5"]);
    const flatPay = forecastTrack({ ...base, kind: "fixed_unlinked", rate: "4.5" }).payments as Decimal[];
    expect(f.payments?.map(String)).toEqual(flatPay.map(String));
  });

  it("a variable unlinked track on a rising curve: spread kept, rate = forward anchor + spread, highest later than first", () => {
    const f = forecastTrack({ ...base, kind: "variable_unlinked", rate: "4.2", resetYears: 5 });
    expect(f.spread?.toString()).toBe("0.51"); // 4.2 − 3.69
    expect(f.blocks.map((b) => b.anchor?.toString())).toEqual(["3.69", "4.49", "4.81", "4.91"]);
    expect(f.blocks.map((b) => b.rate.toString())).toEqual(["4.2", "5", "5.32", "5.42"]);
    expect(f.blocks.map((b) => [b.fromMonth, b.toMonth])).toEqual([[1, 60], [61, 120], [121, 180], [181, 240]]);
    const top = highestPayment(f.payments as Decimal[]);
    expect(top.month).toBeGreaterThan(180); // the last block, at the highest rate
  });

  it("the first payment of a variable track does not depend on the curve; later ones do", () => {
    const a = forecastTrack({ ...base, kind: "variable_unlinked", rate: "4.2" }).payments as Decimal[];
    const b = forecastTrack({ ...base, kind: "variable_unlinked", rate: "4.2", nominal: B.nominal }).payments as Decimal[];
    expect(a[0].toString()).toBe(b[0].toString());
    expect(a[60].toString()).not.toBe(b[60].toString());
  });

  it("a fixed linked track on a constant 2% expected inflation equals metrics.ts's linked track at 2%", () => {
    // nominal 4.04% and real 2%: 1.0404 ÷ 1.02 = 1.02 exactly.
    const f = forecastTrack({ ...base, kind: "fixed_linked", rate: "3", nominal: Array(30).fill("4.04"), real: Array(30).fill("2") });
    const m = trackPayments({ principal: "100000", rates: ["3"], months: 240, inflationPercent: "2", rounding: "statement" });
    expect((f.payments as Decimal[]).map(String)).toEqual(m.map(String));
  });

  it("with no expected inflation, a linked track pays like an unlinked one", () => {
    const same = Array(30).fill("3");
    const linked = forecastTrack({ ...base, kind: "fixed_linked", rate: "3", nominal: same, real: same }).payments as Decimal[];
    const plain = forecastTrack({ ...base, kind: "fixed_unlinked", rate: "3" }).payments as Decimal[];
    expect(linked.map(String)).toEqual(plain.map(String));
  });

  it("a variable linked track uses the REAL curve for its anchor and the gap for its index", () => {
    const f = forecastTrack({ ...base, kind: "variable_linked", rate: "2.5", resetYears: 5 });
    expect(f.blocks.map((b) => b.anchor?.toString())).toEqual(["1.65", "2.2", "2.43", "2.5"]);
    expect(f.spread?.toString()).toBe("0.85");
    expect(f.inflation).toHaveLength(20);
  });

  it("prime is treated as a track that resets every year, on the nominal curve (course assumption)", () => {
    const f = forecastTrack({ ...base, kind: "prime", rate: "4.2", months: 120 });
    expect(f.resetYears).toBe(1);
    expect(f.blocks).toHaveLength(10);
    expect(f.blocks[0].anchor?.toString()).toBe("3.2");
    expect(f.spread?.toString()).toBe("1");
    // block 1 anchor: the 1-to-2 forward = 1.033427² ÷ 1.032 − 1 = 3.4856%
    expect(f.blocks[1].anchor?.toString()).toBe("3.49");
  });

  it("foreign-currency and other tracks have no forecast at all: nothing is invented, and a missing number is not zero", () => {
    const f = forecastTrack({ ...base, kind: "fx", rate: "5" });
    expect(f.hasForecast).toBe(false);
    expect(f.payments).toBeNull();
    expect(summarize(f)).toBeNull();
  });

  it("asks for the curves a track needs", () => {
    expect(() => forecastTrack({ principal: "1", months: 12, kind: "variable_unlinked", rate: "4" })).toThrow(RangeError);
    expect(() => forecastTrack({ principal: "1", months: 12, kind: "fixed_linked", rate: "4", nominal: A.nominal })).toThrow(RangeError);
  });

  it("a rate that would fall below zero is refused", () => {
    const falling = Array.from({ length: 30 }, (_, i) => String(Math.max(0.01, 5 - i * 0.5)));
    expect(() => forecastTrack({ ...base, kind: "variable_unlinked", rate: "0.5", nominal: falling })).toThrow(RangeError);
  });

  it("summarize gives the first payment, the highest with its month, and the total", () => {
    const f = forecastTrack({ ...base, kind: "fixed_linked", rate: "3" });
    const s = summarize(f);
    expect(s?.first.toFixed(2)).toBe((f.payments as Decimal[])[0].toFixed(2));
    expect(s?.highestMonth).toBe(240); // a linked track under a positive expected inflation peaks at the end
    expect(s?.total.gt(s.first.mul(240))).toBe(true);
  });
});

describe("shiftCurve", () => {
  it("shifts every yield and rounds to two decimals", () => {
    expect(shiftCurve(["3.20", "3.30"], "0.4").map(String)).toEqual(["3.6", "3.7"]);
    expect(shiftCurve(A.nominal, "-0.5").map(String)[0]).toBe("2.7");
  });
});
