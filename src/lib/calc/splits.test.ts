import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { DEFAULT_SPEC, r4, syntheticSeries } from "./drift.ts";
import { errorMeasures, evaluate, groupCompare, memoryPredict, randomSplit, shuffle, timeSplit } from "./splits.ts";

describe("splits", () => {
  it("shuffle is a permutation, the same for the same seed and different for another", () => {
    const p = shuffle(20, 5);
    expect([...p].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i));
    expect(shuffle(20, 5)).toEqual(p);
    expect(shuffle(20, 6)).not.toEqual(p);
  });
  it("a random split keeps every month exactly once, test and train sorted, with the size asked for", () => {
    const s = randomSplit(60, 18, 3);
    expect(s.test).toHaveLength(18);
    expect(s.train).toHaveLength(42);
    expect([...s.train, ...s.test].sort((a, b) => a - b)).toEqual(Array.from({ length: 60 }, (_, i) => i));
    expect([...s.test].sort((a, b) => a - b)).toEqual(s.test);
  });
  it("a time split puts the first months in training and the last in the test", () => {
    expect(timeSplit(5, 3)).toEqual({ train: [0, 1, 2], test: [3, 4] });
  });
});

describe("the memory model", () => {
  const train = [1, 2, 4].map((t) => ({ t, x: "4", y: String(t), regime: 1 as const }));
  it("a training month's closest month is itself", () => {
    expect(memoryPredict(train, 2, 1).toString()).toBe("2");
  });
  it("a tie in distance goes to the earlier month: month 3 is as far from 2 as from 4", () => {
    expect(memoryPredict(train, 3, 1).toString()).toBe("2");
  });
  it("k = 2 averages the two closest: month 3 → (2 + 4) ÷ 2", () => {
    expect(memoryPredict(train, 3, 2).toString()).toBe("3");
  });
  it("after the last training month it repeats the last months (no trend is learned)", () => {
    expect(memoryPredict(train, 9, 1).toString()).toBe("4");
  });
});

describe("error measures", () => {
  it("signed errors −1, 1, 3: MAE 5/3, bias 1, RMSE sqrt(11/3) = 1.9149", () => {
    const m = errorMeasures(["-1", "1", "3"]);
    expect(r4(m.mae)).toBe("1.6667");
    expect(m.bias.toString()).toBe("1");
    expect(r4(m.rmse)).toBe("1.9149");
  });
  it("RMSE is never below MAE, and equal when all errors have the same size", () => {
    expect(errorMeasures(["2", "-2", "2"]).rmse.toString()).toBe("2");
    expect(errorMeasures(["0", "0", "9"]).rmse.gt(errorMeasures(["0", "0", "9"]).mae)).toBe(true);
  });
});

describe("evaluate: the random split flatters the memory model", () => {
  const series = syntheticSeries(DEFAULT_SPEC);
  const rand = evaluate(series, randomSplit(60, 18, 3));
  const time = evaluate(series, timeSplit(60, 42));
  it("the memory model's error on its own training months is exactly 0", () => {
    expect(rand.memory.train.mae.toString()).toBe("0");
    expect(time.memory.train.mae.toString()).toBe("0");
  });
  it("on held-out months it is far worse under the time split than under the random split", () => {
    expect(time.memory.test.mae.gt(rand.memory.test.mae.mul(2))).toBe(true);
  });
  it("the time split is deterministic: spread-model error 0.2290, memory-model error 0.3561 (Python mirror)", () => {
    expect(r4(time.spread.test.mae)).toBe("0.2290");
    expect(r4(time.memory.test.mae)).toBe("0.3561");
  });
});

describe("groupCompare", () => {
  it("[1,2,3] against [2,4,6]: means 2 and 4, difference −2, standard deviation sqrt(2/3) = 0.8165", () => {
    const g = groupCompare(["1", "2", "3"], ["2", "4", "6"]);
    expect(g.a.mean.toString()).toBe("2");
    expect(g.b.mean.toString()).toBe("4");
    expect(g.diff.toString()).toBe("-2");
    expect(r4(g.a.sd)).toBe("0.8165");
    expect(new Decimal(g.b.n).toString()).toBe("3");
  });
});
