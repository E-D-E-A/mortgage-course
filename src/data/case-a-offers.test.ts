import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import { loanOf } from "../lib/calc/sensitivity.ts";
import { BANK_IDS, BANK_PRICES, COUNTERS, counterTracks, better, readMix, requestedAt } from "./case-a-offers.ts";
import { CASE_A, INITIAL_MIX, PRICE_LIST } from "./case-a-mix.ts";

describe("the invented offers of case A", () => {
  it("prices the family's request at bank א׳ exactly as stage 5's initial mix and price list", () => {
    expect(requestedAt("a")).toEqual(INITIAL_MIX);
    expect(BANK_PRICES.a).toEqual(PRICE_LIST);
  });

  it("asks for the same loan at every bank, and every counter is the same loan", () => {
    for (const b of BANK_IDS) expect(loanOf(requestedAt(b)).toFixed(2)).toBe(new Decimal(CASE_A.loan).toFixed(2));
    for (const c of COUNTERS) expect(loanOf(counterTracks(c.id)).toFixed(2)).toBe(new Decimal(CASE_A.loan).toFixed(2));
  });

  it("gives no bank the cheapest rate on every kind of track", () => {
    const kinds = ["prime", "variable_unlinked", "fixed_unlinked"] as const;
    const winners = kinds.map((k) => BANK_IDS.reduce((best, b) => (new Decimal(BANK_PRICES[b][k]).lt(BANK_PRICES[best][k]) ? b : best), BANK_IDS[0]));
    expect(new Set(winners).size).toBeGreaterThan(1);
  });

  it("reads a mix by the goals of lesson 5.6 and the 40% line", () => {
    // Same numbers as the facts of lesson 6.8 (rechecked in Python): the request at bank ב׳ is 40.25% of the disposable income.
    const req = readMix(requestedAt("b"));
    expect(req.first.toFixed(2)).toBe("8150.17");
    expect(req.ratio.toFixed(2)).toBe("40.25");
    expect(req.aboveThreshold).toBe(true);
    const swap = readMix(counterTracks("swap_linked"));
    expect(swap.ratio.toFixed(2)).toBe("38.52");
    expect(swap.aboveThreshold).toBe(false);
    expect(swap.total.toFixed(2)).toBe("3107086.13");
    expect(req.passes && swap.passes).toBe(true);
  });

  it("names who is better on each measure, and calls an agora-equal result the same", () => {
    const req = readMix(requestedAt("b"));
    const swap = readMix(counterTracks("swap_linked"));
    expect(better(req, swap, "first")).toBe("counter");
    expect(better(req, swap, "total")).toBe("requested");
    expect(better(req, swap, "rise")).toBe("requested");
    expect(better(req, req, "total")).toBe("same");
  });
});
