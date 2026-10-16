import { describe, expect, it } from "vitest";
import type { TrackSpec } from "./schedule.ts";
import {
  applyLever,
  balanceAt,
  balancesAt,
  type Candidate,
  goalScore,
  leftAt,
  leverEffect,
  loanOf,
  measuresOf,
  paymentAt,
  qualifyingTotal,
  rankCandidates,
  scenarioFrom,
  stressRise,
  variableAmount,
  winner,
} from "./sensitivity.ts";

const FLAT = { inflation: "0", primeShift: "0", anchorShift: "0" };
// 120,000 at 12% a year (1% a month) for 12 months, equal principal: 10,000 of principal a month and 1% of what is left.
// First payment 10,000 + 1,200 = 11,200; last 10,000 + 100 = 10,100; interest 1% × (120,000 + 110,000 + … + 10,000) = 7,800.
const EP: TrackSpec = { kind: "fixed_unlinked", amount: "120000", rate: "12", months: 12, method: "equal_principal" };
const scen = scenarioFrom(FLAT);

describe("scenarioFrom", () => {
  it("writes the builder's arrays: prime moves from the given year, statement rounding", () => {
    const s = scenarioFrom({ inflation: "2", primeShift: "1.5", anchorShift: "0.5", primeFromYear: 3 });
    expect(s.inflation).toEqual(["2"]);
    expect(s.primeShift).toEqual(["0", "0", "1.5"]);
    expect(s.anchorShift).toEqual(["0.5"]);
    expect(s.blockMonths).toBe(12);
    expect(s.rounding).toBe("statement");
  });
});

describe("measures of a mix", () => {
  it("first, highest and total of an equal-principal track, by hand", () => {
    const m = measuresOf([EP], scen);
    expect(m.first.toString()).toBe("11200");
    expect(m.max.toString()).toBe("11200");
    expect(m.maxMonth).toBe(1);
    expect(m.total.toString()).toBe("127800");
    expect(m.months).toBe(12);
  });

  it("payment and balance at chosen months", () => {
    expect(paymentAt([EP], scen, 12).toString()).toBe("10100");
    expect(paymentAt([EP], scen, 13).toString()).toBe("0");
    expect(balanceAt([EP], scen, 0).toString()).toBe("120000");
    expect(balanceAt([EP], scen, 6).toString()).toBe("60000");
    expect(balanceAt([EP], scen, 12).toString()).toBe("0");
    expect(balanceAt([EP], scen, 40).toString()).toBe("0");
    expect(balancesAt([EP], scen, [3, 6]).map(String)).toEqual(["90000", "60000"]);
  });

  it("a mix adds its tracks; a finished track adds nothing", () => {
    const short: TrackSpec = { ...EP, amount: "60000", months: 6 };
    // month 1: 11,200 + (10,000 + 600); month 7: only the long track, 10,000 − 6×0 … = principal 10,000 + 1% of 60,000.
    expect(paymentAt([EP, short], scen, 1).toString()).toBe("21800");
    expect(paymentAt([EP, short], scen, 7).toString()).toBe("10600");
    expect(loanOf([EP, short]).toString()).toBe("180000");
  });

  it("the ratio's payment ignores the index; the variable part ignores fixed tracks", () => {
    const linked: TrackSpec = { kind: "fixed_linked", amount: "120000", rate: "12", months: 12, method: "equal_principal" };
    expect(qualifyingTotal([linked]).toString()).toBe("11200");
    const prime: TrackSpec = { ...EP, kind: "prime", amount: "30000" };
    expect(variableAmount([EP, prime]).toString()).toBe("30000");
  });

  it("what is left for living drops the other payment only while it runs", () => {
    const car = { monthly: "1000", monthsLeft: 3 };
    expect(leftAt([EP], scen, 1, "20000", [car]).toString()).toBe("7800");
    // month 4 of the long track: principal 10,000 + 1% of 90,000 = 10,900 … the car loan has ended: 20,000 − 10,900.
    expect(paymentAt([EP], scen, 4).toString()).toBe("10900");
    expect(leftAt([EP], scen, 4, "20000", [car]).toString()).toBe("9100");
  });
});

describe("levers", () => {
  const mix = { tracks: [EP], scenario: FLAT };
  const two = { tracks: [EP, { ...EP, kind: "prime" as const, amount: "60000", rate: "10" }], scenario: FLAT };

  it("rate: one point on a 12% track adds 1% ÷ 12 of the balance to the first payment", () => {
    const e = leverEffect(mix, { lever: "rate", track: 1, points: "1" });
    // 13% a year = 1.08333…% a month; 120,000 × that = 1,300; the first payment is 11,300.
    expect(e.after.first.toString()).toBe("11300");
    expect(e.delta.first.toString()).toBe("100");
  });

  it("term: twice the months halves the principal part", () => {
    const e = leverEffect(mix, { lever: "term", track: 1, months: 12 });
    expect(e.after.first.toString()).toBe("6200");
    expect(e.after.months).toBe(24);
    expect(e.delta.first.toString()).toBe("-5000");
  });

  it("amount: half the loan, half the first payment", () => {
    const e = leverEffect(mix, { lever: "amount", change: "-60000" });
    expect(e.after.first.toString()).toBe("5600");
    expect(loanOf(e.mix.tracks).toString()).toBe("60000");
  });

  it("amount: tracks keep their proportions and still add up to the new loan", () => {
    const moved = applyLever(two, { lever: "amount", change: "-18000" });
    expect(moved.tracks.map((t) => t.amount)).toEqual(["108000.00", "54000.00"]);
    expect(loanOf(moved.tracks).toString()).toBe("162000");
  });

  it("percent: points of the loan move between tracks, the loan stays", () => {
    const moved = applyLever(two, { lever: "percent", from: 1, to: 2, points: "10" });
    expect(moved.tracks.map((t) => t.amount)).toEqual(["102000.00", "78000.00"]);
    expect(loanOf(moved.tracks).toString()).toBe("180000");
  });

  it("index and market move the scenario only; an unlinked mix does not feel the index", () => {
    const e = leverEffect(mix, { lever: "index", points: "3" });
    expect(e.delta.first.toString()).toBe("0");
    expect(e.delta.total.toString()).toBe("0");
    const moved = applyLever(mix, { lever: "market", points: "1" });
    expect(moved.scenario.primeShift).toBe("1");
    expect(moved.scenario.anchorShift).toBe("1");
    // a fixed track does not feel the market either
    expect(leverEffect(mix, { lever: "market", points: "2" }).delta.total.toString()).toBe("0");
  });

  it("does not change what it was given", () => {
    applyLever(two, { lever: "rate", track: "all", points: "1" });
    expect(two.tracks[0].rate).toBe("12");
    expect(two.scenario.inflation).toBe("0");
  });

  it("refuses moves that make no sense", () => {
    expect(() => applyLever(two, { lever: "percent", from: 1, to: 1, points: "5" })).toThrow();
    expect(() => applyLever(two, { lever: "percent", from: 2, to: 1, points: "50" })).toThrow();
    expect(() => applyLever(two, { lever: "rate", track: 3, points: "1" })).toThrow();
    expect(() => applyLever(two, { lever: "amount", change: "-180000" })).toThrow();
    expect(() => applyLever(two, { lever: "term", track: 1, months: -12 })).toThrow();
  });
});

describe("the three goals", () => {
  const ctx = { base: scen, stress: scenarioFrom({ inflation: "0", primeShift: "2", anchorShift: "0" }) };
  const fixed: Candidate = { id: "fixed", tracks: [EP] };
  const prime: Candidate = { id: "prime", tracks: [{ ...EP, kind: "prime" }] };
  const long: Candidate = { id: "long", tracks: [{ ...EP, months: 24 }] };

  it("scores: the payment in a month, the highest payment, the total, the rise under stress", () => {
    expect(goalScore({ goal: "payment" }, [EP], ctx).toString()).toBe("11200");
    expect(goalScore({ goal: "payment", month: 12 }, [EP], ctx).toString()).toBe("10100");
    expect(goalScore({ goal: "payment", month: "highest" }, [EP], ctx).toString()).toBe("11200");
    expect(goalScore({ goal: "total" }, [EP], ctx).toString()).toBe("127800");
    expect(goalScore({ goal: "exposure" }, [EP], ctx).toString()).toBe("0");
    // A level-payment prime track over 24 months: when prime rises 2 points in year 2, the payment is recalculated higher.
    const level: TrackSpec = { kind: "prime", amount: "120000", rate: "12", months: 24 };
    expect(stressRise([level], ctx).gt(0)).toBe(true);
    expect(stressRise([level], { base: scen, stress: scen }).toString()).toBe("0");
  });

  it("one goal, one winner; another goal, another winner", () => {
    const cands = [fixed, prime, long];
    expect(winner(cands, { goal: "payment" }, ctx)?.id).toBe("long"); // first payment 6,200
    expect(winner(cands, { goal: "total" }, ctx)?.id).toBe("fixed"); // 127,800 against 24 months of interest
    expect(winner(cands, { goal: "exposure" }, ctx)?.id).toBe("fixed"); // ties with `long` at 0: the first on the list wins
  });

  it("a mix that is not allowed has a score but no rank", () => {
    // `fixed` and `prime` pay the same in month 1 under the base scenario (a tie: list order); `long` pays least but is not allowed.
    const rows = rankCandidates([fixed, prime, long], { goal: "payment" }, ctx, (c) => c.id !== "long");
    expect(rows.map((r) => [r.id, r.allowed, r.rank])).toEqual([
      ["fixed", true, 1],
      ["prime", true, 2],
      ["long", false, null],
    ]);
    expect(rows[2].score.toString()).toBe("6200");
    expect(winner([fixed], { goal: "total" }, ctx, () => false)).toBeUndefined();
  });
});
