import { describe, expect, it } from "vitest";
import {
  argMin,
  bestRatePerTrack,
  canChange,
  changingAmount,
  checkMix,
  contractEffective,
  longestTerm,
  type MixTrack,
  mixLoan,
  mixMeasures,
  ratioPayment,
  stressTracks,
  withRates,
} from "./mixcheck.ts";
import { moneyString } from "./money.ts";
import { percentString } from "./percent.ts";

const t = (type: MixTrack["type"], amount: string, ratePercent: string, months = 360): MixTrack => ({ label: type, type, amount, ratePercent, months });

// The opening mix of the main case (course/stage-5-brief.md): three tracks over 360 months.
const CASE_MIX: MixTrack[] = [t("fixed_unlinked", "546000", "4.60"), t("prime", "547000", "4.10"), t("variable_unlinked", "547000", "4.40")];

describe("what a mix adds up to", () => {
  it("adds the amounts and takes the longest term", () => {
    expect(mixLoan(CASE_MIX).toString()).toBe("1640000");
    expect(longestTerm([t("prime", "1", "4", 120), t("prime", "1", "4", 300)])).toBe(300);
  });

  it("counts as changing the prime and the variable tracks, not a fixed linked one", () => {
    expect(canChange("prime")).toBe(true);
    expect(canChange("variable_unlinked")).toBe(true);
    expect(canChange("variable_linked")).toBe(true);
    expect(canChange("fixed_unlinked")).toBe(false);
    expect(canChange("fixed_linked")).toBe(false);
    expect(changingAmount(CASE_MIX).toString()).toBe("1094000");
  });

  it("refuses an empty mix", () => {
    expect(() => mixLoan([])).toThrow(RangeError);
  });
});

describe("the payment that goes into the ratio", () => {
  it("adds the three tracks' payments unrounded: 8,181.30, 40.4% of 20,250", () => {
    const pay = ratioPayment(CASE_MIX);
    expect(moneyString(pay)).toBe("8181.30");
    // Rounding each track first would give 2,799.04 + 2,643.10 + 2,739.16 = 8,181.30 too; the exact sum is what is kept.
    expect(pay.toDecimalPlaces(4).toString()).toBe("8181.2955");
    const lines = checkMix(CASE_MIX, { deal: "only_home", value: "2200000", disposableIncome: "20250" }).lines;
    expect(percentString(lines[1].actual)).toBe("40.4");
  });

  it("adds payments on earlier loans that count (the same-property rule)", () => {
    const withAdded = checkMix(CASE_MIX, { deal: "only_home", value: "2200000", disposableIncome: "20250", addedPayment: "1000" });
    expect(moneyString(withAdded.payment)).toBe("9181.30");
  });
});

describe("the five lines on a whole mix", () => {
  const ctx = { deal: "only_home" as const, value: "2200000", disposableIncome: "20250" };

  it("finds the case mix above the capital line, and over the variable line if its tracks are typed so", () => {
    const r = checkMix(CASE_MIX, ctx);
    expect(r.lines.map((l) => l.status)).toEqual(["within", "within", "above", "over", "within"]);
    expect(r.withinBans).toBe(false);
  });

  it("sees the variable line crossed by 666.67 when 1,094,000 of 1,640,000 can change", () => {
    const r = checkMix(CASE_MIX, ctx);
    const v = r.lines.find((l) => l.id === "variable")!;
    // Two thirds of 1,640,000 is 1,093,333.33 (cut down); 1,094,000 is 666.67 more.
    expect(moneyString(v.room)).toBe("-666.67");
  });

  it("is within every ban when a third is fixed and the term is 30 years", () => {
    const ok = [t("fixed_unlinked", "600000", "4.9"), t("prime", "400000", "3.9"), t("variable_unlinked", "200000", "4.5")];
    const r = checkMix(ok, { deal: "only_home", value: "1700000", disposableIncome: "16000" });
    expect(r.withinBans).toBe(true);
    expect(r.termMonths).toBe(360);
  });

  it("measures the term by the longest track", () => {
    const r = checkMix([t("fixed_unlinked", "500000", "4.9", 240), t("prime", "500000", "3.9", 372)], { deal: "only_home", value: "2000000", disposableIncome: "30000" });
    expect(r.lines.find((l) => l.id === "term")!.status).toBe("over");
  });
});

describe("the teaching scenario", () => {
  it("leaves fixed tracks alone and raises changing ones at their first reset", () => {
    const tr = stressTracks(CASE_MIX, "2");
    expect(tr[0].rates).toEqual(["4.60"]);
    expect(tr[1].rates).toEqual(["4.10", "6.1"]);
    expect(tr[1].blockMonths).toBe(12);
    expect(tr[2].rates).toEqual(["4.40", "6.4"]);
    expect(tr[2].blockMonths).toBe(60);
  });

  it("does not price a linked track", () => {
    expect(() => stressTracks([t("fixed_linked", "100000", "3")], 0)).toThrow(RangeError);
  });

  it("gives the first payment of 100,000 at 6% over 120 months: 1,110.21", () => {
    const m = mixMeasures([t("fixed_unlinked", "100000", "6", 120)]);
    expect(moneyString(m.first)).toBe("1110.21");
    // Level payments of 1,110.21 for 120 months, the last clearing the balance.
    expect(m.total.toNumber()).toBeGreaterThan(133224);
    expect(m.total.toNumber()).toBeLessThan(133226);
  });

  it("makes the highest payment higher when the changing rates rise", () => {
    const flat = mixMeasures(CASE_MIX, "0");
    const up = mixMeasures(CASE_MIX, "2");
    expect(up.first.toString()).toBe(flat.first.toString());
    expect(up.highest.gt(flat.highest)).toBe(true);
    expect(up.total.gt(flat.total)).toBe(true);
  });
});

describe("effective rates", () => {
  it("compounds the monthly rate: a nominal 12% is 12.6825% effective", () => {
    expect(contractEffective("12").toDecimalPlaces(4).toString()).toBe("12.6825");
  });
  it("is above the nominal rate for any positive rate", () => {
    expect(contractEffective("4.9").gt("4.9")).toBe(true);
    expect(contractEffective("4.9").toDecimalPlaces(4).toString()).toBe("5.0116");
  });
});

describe("rates across offers", () => {
  const offers = [
    { bank: "a", rates: ["4.90", "3.95", "4.50"] },
    { bank: "b", rates: ["4.70", "4.10", "4.40"] },
  ];
  it("takes the lowest rate of each track, from whichever offer has it", () => {
    expect(bestRatePerTrack(offers)).toEqual(["4.70", "3.95", "4.40"]);
  });
  it("needs offers on the same tracks", () => {
    expect(() => bestRatePerTrack([offers[0], { bank: "c", rates: ["4"] }])).toThrow(RangeError);
    expect(() => bestRatePerTrack([])).toThrow(RangeError);
  });
  it("puts other rates on the same tracks", () => {
    const mix = withRates(CASE_MIX, ["1", "2", "3"]);
    expect(mix.map((x) => x.ratePercent)).toEqual(["1", "2", "3"]);
    expect(mix.map((x) => x.amount)).toEqual(CASE_MIX.map((x) => x.amount));
    expect(() => withRates(CASE_MIX, ["1"])).toThrow(RangeError);
  });
  it("finds the smallest, the first on a tie", () => {
    expect(argMin(["3", "1", "1", "2"])).toBe(1);
  });
});
