import { describe, expect, it } from "vitest";
import { CASE_A, INITIAL_MIX, SCENARIOS, candidate, caseADisposable, caseALimits, caseARatio } from "../../data/case-a-mix.ts";
import { checkBuilderMix, rescaleToLoan, summaryDelta } from "./mixbuilder.ts";
import { mixCashFlow, mixSummary } from "./schedule.ts";
import { applyLever, scenarioFrom } from "./sensitivity.ts";

const ctx = { deal: CASE_A.deal, value: CASE_A.price, disposableIncome: caseADisposable() };

describe("rescaleToLoan", () => {
  it("keeps the proportions and adds up to the new loan", () => {
    const out = rescaleToLoan(["546000", "547000", "547000"], 1600000);
    expect(out.map((x) => x.toFixed(2)).slice(0, 2)).toEqual(["532682.93", "533658.54"]);
    expect(out[0].plus(out[1]).plus(out[2]).toString()).toBe("1600000");
  });

  it("is the amount lever of sensitivity.ts", () => {
    const moved = applyLever({ tracks: INITIAL_MIX, scenario: SCENARIOS.base }, { lever: "amount", change: "-40000" });
    expect(rescaleToLoan(INITIAL_MIX.map((t) => t.amount), 1600000).map((x) => x.toFixed(2))).toEqual(moved.tracks.map((t) => t.amount));
  });

  it("leaves a track at zero at zero, and gives an all-zero mix's loan to the last track", () => {
    expect(rescaleToLoan(["100", "0", "300"], 800).map((x) => x.toString())).toEqual(["200", "0", "600"]);
    expect(rescaleToLoan([0, 0], 500).map((x) => x.toString())).toEqual(["0", "500"]);
  });

  it("refuses a loan of zero or less", () => {
    expect(() => rescaleToLoan([1, 2], 0)).toThrow(RangeError);
  });
});

describe("checkBuilderMix", () => {
  it("gives case A's ratio and lines exactly as the case file does", () => {
    const r = checkBuilderMix(INITIAL_MIX, ctx);
    expect(r.ratio.toString()).toBe(caseARatio(INITIAL_MIX).toString());
    expect(r.lines.map((l) => [l.id, l.status])).toEqual(caseALimits(INITIAL_MIX).map((l) => [l.id, l.status]));
    expect(r.withinBans).toBe(true);
    expect(r.ratio.toNumber()).toBeGreaterThan(40);
  });

  it("counts a same-property mortgage with the new payment", () => {
    const plain = checkBuilderMix(INITIAL_MIX, ctx);
    const withMortgage = checkBuilderMix(INITIAL_MIX, { ...ctx, obligations: [{ kind: "mortgage", monthly: "500", monthsLeft: 100, mortgage: "same_property" }] });
    expect(withMortgage.payment.minus(plain.payment).toString()).toBe("500");
  });

  it("gives only the ratio when no property value is given", () => {
    const r = checkBuilderMix(INITIAL_MIX, { deal: CASE_A.deal, disposableIncome: caseADisposable() });
    expect(r.ratio.toString()).toBe(caseARatio(INITIAL_MIX).toString());
    expect(r.lines).toEqual([]);
    expect(r.withinBans).toBeNull();
  });

  it("flags a ban: a mix that is too variable", () => {
    const r = checkBuilderMix(candidate("linked_heavy").tracks, ctx);
    expect(r.withinBans).toBe(false);
    expect(r.lines.find((l) => l.id === "variable")?.status).toBe("over");
  });
});

describe("summaryDelta", () => {
  it("is mix a minus mix b on the three headline figures", () => {
    const s = (id: string) => mixSummary(mixCashFlow(id === "initial" ? INITIAL_MIX : candidate(id).tracks, scenarioFrom(SCENARIOS.base)));
    const a = s("short");
    const b = s("initial");
    const d = summaryDelta(a, b);
    expect(d.first.toString()).toBe(a.firstPayment.minus(b.firstPayment).toString());
    expect(d.first.gt(0)).toBe(true);
    expect(d.total.lt(0)).toBe(true);
    expect(summaryDelta(b, b).total.isZero()).toBe(true);
  });
});
