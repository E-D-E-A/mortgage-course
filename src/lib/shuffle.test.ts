import { describe, expect, it } from "vitest";
import { shuffledWithIndex } from "./shuffle.ts";

const opts = ["א", "ב", "ג", "ד"];

describe("shuffledWithIndex", () => {
  it("is deterministic for the same id", () => {
    expect(shuffledWithIndex(opts, "1.2-x")).toEqual(shuffledWithIndex(opts, "1.2-x"));
  });
  it("is a permutation that keeps each item with its authored index", () => {
    const s = shuffledWithIndex(opts, "3.1-q");
    expect(s.map(([, i]) => i).sort()).toEqual([0, 1, 2, 3]);
    for (const [o, i] of s) expect(opts[i]).toBe(o);
  });
  it("keeps the written order when asked", () => {
    expect(shuffledWithIndex(opts, "any", true).map(([, i]) => i)).toEqual([0, 1, 2, 3]);
  });
  it("does not leave the authored first option first for most ids", () => {
    let first = 0;
    for (let k = 0; k < 200; k++) if (shuffledWithIndex(opts, `ex-${k}`)[0][1] === 0) first++;
    expect(first).toBeLessThan(90); // about 50 expected; always-first would be 200
  });
  it("different ids give different orders", () => {
    const orders = new Set(Array.from({ length: 30 }, (_, k) => shuffledWithIndex(opts, `e${k}`).map(([, i]) => i).join()));
    expect(orders.size).toBeGreaterThan(5);
  });
});
