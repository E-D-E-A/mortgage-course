import { describe, expect, it } from "vitest";
import { CANDIDATES, GOAL_CONTEXT, INITIAL_MIX } from "../../data/case-a-mix.ts";
import { assess, clearEngineCache, evaluate, fingerprint, fnv1a, inputKey, mixFlow, trackFlow } from "./engine.ts";
import { stressRise } from "./sensitivity.ts";
import { scenarioFrom } from "./sensitivity.ts";
import type { TrackSpec } from "./schedule.ts";

const FLAT = scenarioFrom({ inflation: "0", primeShift: "0", anchorShift: "0" });
// 120,000 at 12% a year (1% a month), 12 months, equal principal: 10,000 of principal a month and 1% of what is left.
// First payment 10,000 + 1,200 = 11,200; last 10,000 + 100 = 10,100; interest 1% x (120,000 + ... + 10,000) = 7,800.
const EP: TrackSpec = { kind: "fixed_unlinked", amount: "120000", rate: "12", months: 12, method: "equal_principal" };

describe("one track and a mix", () => {
  it("an equal-principal track, by hand", () => {
    const f = trackFlow(EP, FLAT);
    expect(f.payments[0].toString()).toBe("11200");
    expect(f.payments[11].toString()).toBe("10100");
    expect(f.total.toString()).toBe("127800");
    expect(f.interest.toString()).toBe("7800");
    expect(f.indexation.toString()).toBe("0");
  });

  it("a mix is the sum of its tracks, month by month; a finished track adds nothing", () => {
    const short: TrackSpec = { ...EP, amount: "60000", months: 6 };
    const m = mixFlow([EP, short], FLAT);
    // month 1: 11,200 + (10,000 + 600) = 21,800; month 7 only the long track: 10,000 + 1% x 60,000 = 10,600
    expect(m.payments[0].toString()).toBe("21800");
    expect(m.payments[6].toString()).toBe("10600");
    expect(m.months).toBe(12);
    expect(m.balance[11].toString()).toBe("0");
    expect(m.balance[5].toString()).toBe("60000"); // 120,000 - 6 x 10,000; the short track is repaid
  });

  it("total paid = loan + interest + indexation, to the agora, on every case-A candidate", () => {
    for (const c of CANDIDATES) {
      const base = evaluate(c.tracks, GOAL_CONTEXT.base);
      expect(base.total.minus(base.loan).minus(base.interest).minus(base.indexation).abs().lte("0.05"), c.id).toBe(true);
    }
  });
});

describe("same input, same output", () => {
  it("running twice gives the very same figures and fingerprint", () => {
    clearEngineCache();
    const a = evaluate(INITIAL_MIX, GOAL_CONTEXT.base);
    clearEngineCache();
    const b = evaluate(INITIAL_MIX, GOAL_CONTEXT.base);
    expect(a.first.toString()).toBe(b.first.toString());
    expect(a.total.toString()).toBe(b.total.toString());
    expect(fingerprint(a)).toBe(fingerprint(b));
    expect(fingerprint(a)).toMatch(/^[0-9a-f]{8}$/);
  });

  it("the memo does not change a result", () => {
    clearEngineCache();
    const cold = evaluate(INITIAL_MIX, GOAL_CONTEXT.stress);
    const warm = evaluate(INITIAL_MIX, GOAL_CONTEXT.stress);
    expect(fingerprint(cold)).toBe(fingerprint(warm));
  });

  it("the order of the tracks does not change any measure", () => {
    const a = evaluate(INITIAL_MIX, GOAL_CONTEXT.stress);
    const b = evaluate([...INITIAL_MIX].reverse(), GOAL_CONTEXT.stress);
    expect(fingerprint(a)).toBe(fingerprint(b));
    expect(inputKey(INITIAL_MIX, GOAL_CONTEXT.stress)).not.toBe(inputKey([...INITIAL_MIX].reverse(), GOAL_CONTEXT.stress));
  });

  it("a different input gives a different fingerprint", () => {
    const a = evaluate(INITIAL_MIX, GOAL_CONTEXT.base);
    const b = evaluate(INITIAL_MIX, GOAL_CONTEXT.stress);
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });
});

describe("assess", () => {
  it("rise is sensitivity.ts's stressRise apart from the clearing payment's rounding: within a few shekels", () => {
    for (const c of CANDIDATES) {
      const mine = assess(c.tracks, GOAL_CONTEXT).rise;
      const theirs = stressRise(c.tracks, GOAL_CONTEXT);
      expect(theirs.minus(mine).abs().lt(30), c.id).toBe(true);
    }
  });
});

describe("fnv1a", () => {
  it("matches the published test vectors", () => {
    expect(fnv1a("")).toBe("811c9dc5");
    expect(fnv1a("a")).toBe("e40c292c");
    expect(fnv1a("foobar")).toBe("bf9cf968");
  });
});

import { projectedLast, projectedPayments } from "./engine.ts";

describe("the highest payment leaves out the clearing payment", () => {
  it("a fixed 20-year loan has the same highest payment under any scenario: the last month's rounding is not a rise", () => {
    const t: TrackSpec = { kind: "fixed_unlinked", amount: "1640000", rate: "4.4", months: 240 };
    const a = assess([t], GOAL_CONTEXT);
    expect(a.rise.toString()).toBe("0");
    expect(a.base.max.toString()).toBe(a.base.first.toString());
    // the payment actually made in the last month does differ by a few agorot or shekels: it is rounding
    expect(mixFlow([t], GOAL_CONTEXT.base).payments[239].toString()).not.toBe(a.base.first.toString());
  });
  it("the stress peak of case A's initial mix is month 61's, not month 360's", () => {
    const e = evaluate(INITIAL_MIX, GOAL_CONTEXT.stress);
    expect(e.maxMonth).toBe(61);
    expect(e.max.toString()).toBe(mixFlow(INITIAL_MIX, GOAL_CONTEXT.stress).payments[60].toString());
  });
  it("by hand: a one-month change leaves a track of two months as is; an equal-principal track pays what it pays", () => {
    const ep = trackFlow({ kind: "fixed_unlinked", amount: "120000", rate: "12", months: 12, method: "equal_principal" }, FLAT);
    expect(projectedLast(ep).toString()).toBe("10100");
    expect(projectedPayments(mixFlow([{ kind: "fixed_unlinked", amount: "120000", rate: "12", months: 12, method: "equal_principal" }], FLAT))[11].toString()).toBe("10100");
  });
  it("a linked track's due last payment keeps the index's rise (it is a real rise)", () => {
    const t: TrackSpec = { kind: "fixed_linked", amount: "500000", rate: "2.9", months: 240 };
    const f = trackFlow(t, GOAL_CONTEXT.base);
    const due = projectedLast(f);
    expect(due.gt(f.payments[238])).toBe(true);
    expect(due.minus(f.payments[239]).abs().lt(20)).toBe(true);
  });
});
