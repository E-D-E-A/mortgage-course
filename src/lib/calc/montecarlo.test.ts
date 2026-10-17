import { describe, expect, it } from "vitest";
import { PRICE_LIST } from "../../data/case-a-mix.ts";
import { atLeast, DEFAULT_MODEL, drawDiscrete, futures, makeRng, simulate, summary, unit } from "./montecarlo.ts";
import type { TrackSpec } from "./schedule.ts";

describe("the seeded generator", () => {
  it("gives the sequence an independent Python implementation gives", () => {
    const r = makeRng(1);
    expect([r(), r(), r(), r()]).toEqual([2693262067, 11749833, 2265367787, 4213581821]);
    const s = makeRng(12345);
    expect([s(), s(), s()]).toEqual([4207900869, 1317490944, 2079646450]);
  });
  it("same seed, same sequence; another seed, another", () => {
    expect(makeRng(7)()).toBe(makeRng(7)());
    expect(makeRng(7)()).not.toBe(makeRng(8)());
  });
  it("unit is exact: 2^31 / 2^32 = 0.5", () => {
    expect(unit(2147483648).toString()).toBe("0.5");
  });
});

describe("a discrete draw", () => {
  const o = [{ value: "a", weight: 1 }, { value: "b", weight: 3 }];
  it("splits the range by weights: below a quarter is a, the rest is b", () => {
    expect(drawDiscrete(o, 0)).toBe("a");
    expect(drawDiscrete(o, 1073741823)).toBe("a");
    expect(drawDiscrete(o, 1073741824)).toBe("b");
    expect(drawDiscrete(o, 4294967295)).toBe("b");
  });
});

describe("futures", () => {
  it("are reproducible and never take prime below the floor", () => {
    const a = futures(3, 5);
    const b = futures(3, 5);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a[0].primeShift?.[0]).toBe("0");
    for (const f of futures(9, 50, { ...DEFAULT_MODEL, scale: 4 })) for (const s of f.primeShift ?? []) expect(Number(s)).toBeGreaterThanOrEqual(-3);
  });
});

describe("simulate and count", () => {
  const prime: TrackSpec = { kind: "prime", amount: "400000", rate: PRICE_LIST.prime, months: 240 };
  it("the first payment is the same in every future (nothing has moved yet)", () => {
    const s = simulate([prime], 1, 20);
    expect(new Set(s.first.map(String)).size).toBe(1);
  });
  it("counting: 3 of 4 values at least 10 -> p 0.75, se sqrt(0.75*0.25/4)", () => {
    const r = atLeast([10, 12, 9, 11], 10);
    expect(r.count).toBe(3);
    expect(r.p.toString()).toBe("0.75");
    expect(r.se.toFixed(6)).toBe("0.216506");
  });
  it("summary uses the linear percentile", () => {
    const s = summary([1, 2, 3, 4, 5]);
    expect(s.mean.toString()).toBe("3");
    expect(s.p50.toString()).toBe("3");
    expect(s.p5.toString()).toBe("1.2");
  });
});
