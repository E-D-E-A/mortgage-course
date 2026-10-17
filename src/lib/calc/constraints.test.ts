import { describe, expect, it } from "vitest";
import { CANDIDATES, CANDIDATE_NAMES, LEVEL2, S8_CASE, candidateById, candidateOf, BASE_CHOICE, countChoices, countShapes, entryOf, loanOfChoice, sampleOfferTracks } from "../../data/case-s8.ts";
import { CONSTRAINTS, evaluate, feasibleSet, measures, rejectionCounts, rejectionReasons } from "./constraints.ts";
import { loanOf } from "./sensitivity.ts";

const reasons = (id: string) => rejectionReasons(candidateById(id));

describe("constraints on the curated candidates (numbers by hand in the comments)", () => {
  it("c01: the family's own request breaks only the client's 40% target (ratio 40.40)", () => {
    expect(reasons("c01")).toEqual(["client_target_ratio"]);
    expect(measures(candidateById("c01")).ratio?.toFixed(2)).toBe("40.40");
    expect(evaluate(candidateById("c01")).notes).toEqual(["above_capital"]);
  });
  it("c02: 70% variable is over two thirds (law) and the ratio is over the client's target", () => {
    expect(reasons("c02")).toEqual(["variable_share", "client_target_ratio"]);
  });
  it("c03: every reason is listed, not only the first: law, bank and client at once", () => {
    expect(reasons("c03")).toEqual(["pti", "bank_ratio", "client_max_payment", "client_target_ratio"]);
  });
  it("c06: 46.41% is visibly over the bank's 45% line (not a boundary case)", () => {
    expect(measures(candidateById("c06")).ratio?.toFixed(2)).toBe("46.41");
    expect(reasons("c06")).toEqual(["bank_ratio", "client_max_payment", "client_target_ratio"]);
  });
  it("c08: spends more than the family has: equity 600,000 > 560,000 + 0 left after the car payoff", () => {
    expect(reasons("c08")).toEqual(["equity_available"]);
  });
  it("c09: a parent's income lowers the ratio to 33.8%, but 70% variable breaks the law line", () => {
    expect(reasons("c09")).toEqual(["variable_share"]);
  });
  it("c10: bank ד׳ refuses a financing ratio above 70% (74.55)", () => {
    expect(reasons("c10")).toContain("bank_ltv");
  });
  it("two candidates are feasible; the rest are rejected for at least one reason", () => {
    expect(feasibleSet(CANDIDATES).map((c) => c.id)).toEqual(["c07", "c11"]);
  });
  it("every family rejects at least one candidate", () => {
    const counts = rejectionCounts(CANDIDATES);
    for (const id of ["variable_share", "pti", "bank_ratio", "bank_ltv", "client_max_payment", "client_target_ratio", "equity_available"] as const) expect(counts[id]).toBeGreaterThan(0);
  });
});

describe("identity and edge cases", () => {
  const base = candidateById("c01");
  it("tracks that do not add up to price − equity fail the identity check", () => {
    const off = { ...base, tracks: base.tracks.map((t, k) => (k === 0 ? { ...t, amount: "1" } : t)) };
    expect(rejectionReasons(off)).toContain("sum_equals_loan");
  });
  it("a zero track fails positive_tracks", () => {
    const zero = { ...base, tracks: [...base.tracks, { ...base.tracks[0], amount: "0" }] };
    expect(rejectionReasons(zero)).toContain("positive_tracks");
  });
  it("a term of 31 years fails the law's term line", () => {
    const long = { ...base, tracks: base.tracks.map((t) => ({ ...t, months: 372 })) };
    expect(rejectionReasons(long)).toContain("term");
  });
  it("without a bank or client limits the constraints that need them are 'not asked' and pass", () => {
    const free = { ...base, request: { ...base.request, bank: null, maxPayment: null, targetRatio: null } };
    const e = evaluate(free);
    expect(e.feasible).toBe(true);
    expect(e.checks.find((c) => c.id === "bank_ratio")?.limit).toBeNull();
  });
  it("income that does not cover the obligations fails every ratio check, without throwing", () => {
    const poor = { ...base, request: { ...base.request, incomes: ["1000"] } };
    const r = rejectionReasons(poor);
    expect(r).toContain("pti");
    expect(r).toContain("bank_ratio");
  });
  it("evaluates every constraint, in order", () => {
    expect(evaluate(base).checks.map((c) => c.id)).toEqual(CONSTRAINTS.map((c) => c.id));
  });
  it("exactly on the 2/3 line is allowed (strict 'over')", () => {
    const exact = candidateOf("x", { ...BASE_CHOICE, extraEquity: "40000" }, [{ kind: "prime", share: 60, years: 30 }, { kind: "fixed_unlinked", share: 40, years: 30 }]);
    expect(rejectionReasons(exact)).not.toContain("variable_share");
  });
});

describe("case-s8", () => {
  it("every curated candidate is a loan of price − equity", () => {
    for (const c of CANDIDATES) {
      const { choice } = entryOf(c.id);
      expect(loanOf(c.tracks).toString()).toBe(loanOfChoice(choice).toString());
      expect(rejectionReasons(c)).not.toContain("sum_equals_loan");
    }
  });
  it("names exist", () => expect(Object.keys(CANDIDATE_NAMES).length).toBe(12));
  it("the base request is case A's: loan 1,640,000, ltv 74.55", () => {
    expect(loanOfChoice(BASE_CHOICE).toString()).toBe("1640000");
    expect(S8_CASE.price).toBe("2200000");
    expect(measures(candidateById("c01")).ltv.toFixed(2)).toBe("74.55");
  });
  it("the sample offer is a loan of 1,640,000 with its own rates", () => {
    const t = sampleOfferTracks();
    expect(loanOf(t).toString()).toBe("1640000");
    expect(t.map((x) => x.rate)).toEqual(["4.35", "4.65"]);
  });
});

describe("counting the small space (lesson 8.6)", () => {
  it("level 1: 5 × 2 × 2 × 4 = 80", () => expect(countChoices()).toBe(80));
  it("level 2: 3 kinds, steps of 10%, 3 terms → 3×3 + 3×9×9 + 36×27 = 9 + 243 + 972 = 1,224", () => {
    expect(countShapes(LEVEL2.kinds.length, LEVEL2.shareStep, LEVEL2.years.length)).toBe(1224);
  });
  it("two kinds, one term, steps of 10%: 2 + 9 = 11", () => expect(countShapes(2, 10, 1)).toBe(11));
});
