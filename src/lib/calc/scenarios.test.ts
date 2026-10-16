import { describe, expect, it } from "vitest";
import { PRICE_LIST, PRIME_TODAY, SCENARIOS } from "../../data/case-a-mix.ts";
import { CURVES } from "../../data/curves.ts";
import { evaluate, trackFlow } from "./engine.ts";
import { forecastTrack, type ForecastKind } from "./forecast.ts";
import { compareScenarios, forecast451Scenario, inflationPath, MACRO, macroScenario, NAMED_SCENARIOS, primePath, stressScenario } from "./scenarios.ts";
import { TRACK_KINDS, type TrackKind, type TrackSpec } from "./schedule.ts";

const track = (kind: TrackKind, months = 360): TrackSpec => ({ kind, amount: "300000", rate: PRICE_LIST[kind], months });

describe("the Directive 451 scenario reproduces forecast.ts, track by track, to the agora", () => {
  for (const kind of TRACK_KINDS) {
    it(kind, () => {
      const sc = forecast451Scenario();
      const mine = trackFlow(track(kind), sc).payments.map((p) => p.toFixed(2));
      const theirs = forecastTrack({
        kind: kind as ForecastKind,
        principal: "300000",
        rate: PRICE_LIST[kind],
        months: 360,
        resetYears: 5,
        nominal: CURVES.A.nominal,
        real: CURVES.A.real,
      }).payments?.map((p) => p.toFixed(2));
      expect(mine).toEqual(theirs);
    });
  }
  it("also for a shorter track and another curve", () => {
    const sc = forecast451Scenario({ curves: CURVES.B });
    const t = track("variable_unlinked", 240);
    const theirs = forecastTrack({ kind: "variable_unlinked", principal: "300000", rate: PRICE_LIST.variable_unlinked, months: 240, resetYears: 5, nominal: CURVES.B.nominal, real: CURVES.B.real });
    expect(trackFlow(t, sc).payments.map(String)).toEqual((theirs.payments ?? []).map(String));
  });
});

describe("the flat curve: the forecast equals today's terms", () => {
  it("every shift is zero, so the payment never moves", () => {
    const sc = forecast451Scenario({ curves: CURVES.flat });
    expect(sc.primeShift?.every((x) => String(x) === "0")).toBe(true);
    expect(sc.anchorShift?.every((x) => String(x) === "0")).toBe(true);
    const flows = trackFlow(track("prime"), sc).payments;
    expect(flows[0].toString()).toBe(flows[200].toString());
  });
});

describe("the stress scenario", () => {
  it("is the course's own: inflation 4%, prime and anchors up 2 points", () => {
    const s = stressScenario();
    expect(s.inflation).toEqual([SCENARIOS.stress.inflation]);
    expect(primePath(s, 3).map(String)).toEqual([PRIME_TODAY, "6.75", "6.75"]);
  });
});

describe("the macro table", () => {
  const m = macroScenario();
  it("prime's shift is the policy rate's change from year 1 (3.25 -> 3.00 -> 2.75 ...)", () => {
    expect(m.primeShift?.slice(0, 4)).toEqual(["0", "-0.25", "-0.5", "-0.5"]);
    expect(m.primeShift?.[9]).toBe("0.25");
    expect(m.primeShift?.[29]).toBe("0.25"); // the last year carries on
  });
  it("an anchor follows the mean policy rate over its 5-year window: year 6 window 3.25,3.25,3.50,3.50,3.50 = 3.40; first window 3.25,3.00,2.75,2.75,3.00 = 2.95; shift 0.45", () => {
    expect(m.anchorShift?.[0]).toBe("0");
    expect(m.anchorShift?.[5]).toBe("0.45");
  });
  it("inflation is the table's, then carries on", () => {
    expect(inflationPath(m, 12).map(String)).toEqual([...MACRO.inflation.map(String).map((x) => String(Number(x))), "2", "2"]);
  });
  it("a negative rate would throw: the macro scenario never goes below today's prime by that much", () => {
    expect(Math.min(...primePath(m, 30).map(Number))).toBeGreaterThan(0);
  });
});

describe("comparing one mix under the three", () => {
  it("returns one evaluation per scenario, deterministic", () => {
    const tracks = [track("prime", 360), track("fixed_unlinked", 360)];
    const a = compareScenarios(tracks);
    const b = compareScenarios(tracks);
    expect(a.map((r) => r.id)).toEqual(["forecast451", "stress", "macro"]);
    expect(a.map((r) => r.evaluation.total.toString())).toEqual(b.map((r) => r.evaluation.total.toString()));
    // stress is the harshest of the three for a prime track
    const by = Object.fromEntries(a.map((r) => [r.id, r.evaluation.max]));
    expect(by.stress.gt(by.forecast451)).toBe(true);
    expect(by.stress.gt(by.macro)).toBe(true);
  });
  it("names the three", () => {
    expect(NAMED_SCENARIOS().map((n) => n.nameHe)).toEqual(["תחזית לפי הוראה 451", "תרחיש לחץ", "תחזית מקרו"]);
  });
  it("evaluate under a scenario does not depend on object identity", () => {
    const t = [track("variable_unlinked")];
    expect(evaluate(t, forecast451Scenario()).total.toString()).toBe(evaluate(t, forecast451Scenario()).total.toString());
  });
});
