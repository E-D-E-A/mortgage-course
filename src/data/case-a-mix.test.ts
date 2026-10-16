import { describe, expect, it } from "vitest";
import { percentString } from "../lib/calc/percent.ts";
import { loanOf, rankCandidates, variableAmount, winner } from "../lib/calc/sensitivity.ts";
import { ALTERNATIVE_IDS, CANDIDATES, candidate, caseADisposable, caseALimits, caseAPasses, caseARatio, CASE_A, GOAL_CONTEXT, INITIAL_MIX, PRICE_LIST, PRIME_TODAY } from "./case-a-mix.ts";

describe("case A's initial mix", () => {
  it("is the course map's: 546,000 at 4.60, 547,000 at 4.10, 547,000 at 4.40, 360 months", () => {
    expect(INITIAL_MIX.map((t) => [t.amount, t.rate, t.months])).toEqual([
      ["546000", "4.60", 360],
      ["547000", "4.10", 360],
      ["547000", "4.40", 360],
    ]);
    expect(loanOf(INITIAL_MIX).toString()).toBe(CASE_A.loan);
  });

  it("has a payment of 40.4% of the disposable income, through affordability.ts", () => {
    expect(caseADisposable().toString()).toBe("20250");
    expect(percentString(caseARatio(INITIAL_MIX))).toBe("40.4");
  });

  it("passes every ban of 329, the one-third-fixed line by 333 shekels; only the 40% capital threshold is crossed", () => {
    const lines = Object.fromEntries(caseALimits(INITIAL_MIX).map((l) => [l.id, l]));
    expect(percentString(lines.ltv.actual)).toBe("74.55");
    expect(lines.variable.room.toString()).toBe("333.33");
    expect(variableAmount(INITIAL_MIX).toString()).toBe("1093000");
    expect(lines.pti.status).toBe("within");
    expect(lines.capital.status).toBe("above");
    expect(caseAPasses(INITIAL_MIX)).toBe(true);
  });

  it("uses the price list: each rate belongs to its kind, prime is 4.75 − 0.15", () => {
    expect(PRICE_LIST.prime).toBe("4.60");
    expect(Number(PRIME_TODAY) - Number(PRICE_LIST.prime)).toBeCloseTo(0.15, 10);
    for (const c of CANDIDATES) for (const t of c.tracks) expect(t.rate).toBe(PRICE_LIST[t.kind]);
  });
});

describe("the candidate set", () => {
  const allowed = (c: { tracks: Parameters<typeof caseAPasses>[0] }) => caseAPasses(c.tracks);
  it("every candidate is the same loan", () => {
    for (const c of CANDIDATES) expect(loanOf(c.tracks).toString()).toBe(CASE_A.loan);
  });
  it("two candidates break a ban on purpose: too much variable, a payment over 50%", () => {
    const failed = CANDIDATES.filter((c) => !caseAPasses(c.tracks)).map((c) => c.id);
    expect(failed).toEqual(["linked_heavy", "fixed_20"]);
    expect(caseALimits(candidate("linked_heavy").tracks).find((l) => l.id === "variable")?.status).toBe("over");
    expect(caseALimits(candidate("fixed_20").tracks).find((l) => l.id === "pti")?.status).toBe("over");
  });
  it("each goal has its own winner among the allowed, and the limits change two of them", () => {
    const w = (goal: Parameters<typeof winner>[1], ok?: typeof allowed) => winner(CANDIDATES, goal, GOAL_CONTEXT, ok)?.id;
    expect(w({ goal: "payment" }, allowed)).toBe(ALTERNATIVE_IDS.payment);
    expect(w({ goal: "total" }, allowed)).toBe(ALTERNATIVE_IDS.total);
    expect(w({ goal: "exposure" }, allowed)).toBe(ALTERNATIVE_IDS.exposure);
    expect(w({ goal: "payment" })).toBe("linked_heavy");
    expect(w({ goal: "total" })).toBe("fixed_20");
  });
  it("'low payment' in the first month and 'low payment' at the highest month name different mixes", () => {
    const top = winner(CANDIDATES, { goal: "payment", month: "highest" }, GOAL_CONTEXT, allowed);
    expect(top?.id).toBe("half");
    expect(rankCandidates(CANDIDATES, { goal: "payment", month: "highest" }, GOAL_CONTEXT, allowed).find((r) => r.id === "linked")?.rank).toBe(5);
  });
});
