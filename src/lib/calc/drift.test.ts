import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import {
  absErrors,
  agreement,
  captureLagDays,
  DEFAULT_MONITOR,
  DEFAULT_SPEC,
  fitSpread,
  firstAlarm,
  Lcg,
  mae,
  monitorRun,
  predict,
  r4,
  rollingMae,
  syntheticSeries,
} from "./drift.ts";

describe("the generator", () => {
  it("is the 32-bit LCG: seed 0 gives 15470, 18256, 53708, 43769 (checked in Python with big integers)", () => {
    const g = new Lcg(0);
    expect([g.next(), g.next(), g.next(), g.next()]).toEqual([15470, 18256, 53708, 43769]);
  });
  it("is deterministic: the same seed, the same series", () => {
    expect(syntheticSeries(DEFAULT_SPEC)).toEqual(syntheticSeries(DEFAULT_SPEC));
    expect(syntheticSeries({ ...DEFAULT_SPEC, seed: 1 })).not.toEqual(syntheticSeries(DEFAULT_SPEC));
  });
});

describe("the synthetic series", () => {
  const spec = { ...DEFAULT_SPEC, seed: 0, months: 3, changeAt: 3, after: { intercept: "1.25", slope: "1.00" } };
  const s = syntheticSeries(spec);
  it("month 1 by hand: draws 15470 and 18256 → step (0 − 2) × 0.05 = −0.10, noise (7 − 5) × 0.02 = +0.04", () => {
    // x: 4.00 − 0.10 = 3.90; y = 1.00 + 3.90 + 0.04 = 4.94
    expect(s[0]).toEqual({ t: 1, x: "3.9", y: "4.94", regime: 1 });
  });
  it("month 2 by hand: draws 53708 and 43769 → step (3 − 2) × 0.05 = +0.05, noise (0 − 5) × 0.02 = −0.10", () => {
    // x: 3.95; y = 1.00 + 3.95 − 0.10 = 4.85
    expect(s[1]).toEqual({ t: 2, x: "3.95", y: "4.85", regime: 1 });
  });
  it("the after regime starts at changeAt", () => {
    expect(s[2].regime).toBe(2);
    // month 3 uses the spread 1.25 instead of 1.00: y − x − noise = 1.25
    expect(new Decimal(s[2].y).minus(s[2].x).toNumber()).toBeGreaterThan(1.25 - 0.1001);
  });
  it("x stays inside its bounds and y is exact to four decimals", () => {
    for (const p of syntheticSeries(DEFAULT_SPEC)) {
      expect(new Decimal(p.x).gte(3) && new Decimal(p.x).lte(5)).toBe(true);
      expect(new Decimal(p.y).decimalPlaces()).toBeLessThanOrEqual(4);
    }
  });
});

describe("the one-spread model", () => {
  const pts = [
    { x: "4", y: "5" },
    { x: "4.5", y: "5.7" },
  ];
  it("estimates the spread as the mean of y − x: (1 + 1.2) ÷ 2 = 1.1", () => {
    expect(fitSpread(pts).spread.toString()).toBe("1.1");
  });
  it("predicts x + spread, and its absolute errors are |prediction − y|: 0.1 and 0.1", () => {
    const m = fitSpread(pts);
    expect(predict(m, "4").toString()).toBe("5.1");
    expect(absErrors(m, pts).map(String)).toEqual(["0.1", "0.1"]);
    expect(mae(absErrors(m, pts)).toString()).toBe("0.1");
  });
  it("refuses an empty training set", () => {
    expect(() => fitSpread([])).toThrow();
  });
});

describe("monitoring", () => {
  it("rolling error: windows of 2 over 1, 2, 3, 4 give null, 1.5, 2.5, 3.5", () => {
    expect(rollingMae(["1", "2", "3", "4"], 2).map((v) => (v === null ? null : v.toString()))).toEqual([null, "1.5", "2.5", "3.5"]);
  });
  it("the first alarm is the first value strictly above the threshold, from the given index", () => {
    const r = rollingMae(["1", "2", "3", "4"], 2);
    expect(firstAlarm(r, "2.5")).toBe(3);
    expect(firstAlarm(r, "2.4")).toBe(2);
    expect(firstAlarm(r, "2.4", 3)).toBe(3);
    expect(firstAlarm(r, "9")).toBeNull();
  });
  it("a run on a constant-spread series with no change never raises an alarm", () => {
    const series = syntheticSeries({ ...DEFAULT_SPEC, changeAt: 999 });
    const run = monitorRun(series, 999, DEFAULT_MONITOR);
    expect(run.alarmMonth).toBeNull();
    expect(run.v2).toBeNull();
    expect(run.delay).toBeNull();
  });
  it("the default run: a jump of 0.25 in the spread at month 37 is noticed after the change, and a refit helps", () => {
    const series = syntheticSeries(DEFAULT_SPEC);
    const run = monitorRun(series, DEFAULT_SPEC.changeAt, DEFAULT_MONITOR);
    expect(run.alarmMonth).not.toBeNull();
    expect(run.alarmMonth as number).toBeGreaterThanOrEqual(37); // never before the change
    expect(run.delay as number).toBeGreaterThanOrEqual(0);
    expect((run.v1After as Decimal).gt(run.v2After as Decimal)).toBe(true);
    // the model's old belief (spread near 1.00) misses by about the jump on every new month
    expect(Number(r4(run.v1After as Decimal))).toBeGreaterThan(0.2);
    expect(Number(r4(run.v1Healthy as Decimal))).toBeLessThan(0.1);
  });
  it("the default numbers (checked by the Python mirror): spread 0.9892, baseline 0.0492, threshold 0.1475, alarm at month 39", () => {
    const run = monitorRun(syntheticSeries(DEFAULT_SPEC), 37, DEFAULT_MONITOR);
    expect(r4(run.v1.spread)).toBe("0.9892");
    expect(r4(run.baseline)).toBe("0.0492");
    expect(r4(run.threshold)).toBe("0.1475");
    expect(run.alarmMonth).toBe(39);
    expect(run.delay).toBe(2);
  });
});

describe("agreement and the log's two clocks", () => {
  it("3 of 4 equal choices is 75%", () => {
    expect(agreement([["a", "a"], ["b", "b"], ["c", "a"], ["d", "d"]])).toEqual({ agree: 3, total: 4, ratePercent: "75" });
  });
  it("2 of 3 is 66.67%, rounded half up", () => {
    expect(agreement([["a", "a"], ["b", "b"], ["c", "a"]]).ratePercent).toBe("66.67");
  });
  it("refuses an empty list", () => {
    expect(() => agreement([])).toThrow();
  });
  it("capture lag: 2 March to 5 March is 3 days; 27 February to 2 March 2026 is 3 days (not a leap year)", () => {
    expect(captureLagDays("2026-03-02", "2026-03-05")).toBe(3);
    expect(captureLagDays("2026-02-27", "2026-03-02")).toBe(3);
    expect(captureLagDays("2026-03-02", "2026-03-02")).toBe(0);
  });
});
