import { describe, expect, it } from "vitest";
import { approvalProbability, explain, rankRows, runBank } from "./pipeline.ts";

describe("approvalProbability — by hand", () => {
  // ratio 40, ltv 60: z = 0.4 + 0 + 0 = 0.4; logistic(0.4) = 0.598688
  it("the reference applicant", () => {
    expect(approvalProbability("40", "60", "approve")).toBe("0.598688");
  });
  // ratio 30, ltv 50: z = 0.4 + 0.5·10/10 + 0.3·10/10 = 1.2; logistic(1.2) = 0.768525
  it("a better applicant has a higher chance", () => {
    expect(approvalProbability("30", "50", "approve")).toBe("0.768525");
  });
  it("a refusal is zero", () => {
    expect(approvalProbability("30", "50", "refuse")).toBe("0.000000");
  });
});

describe("rankRows", () => {
  const rows = [
    { id: "א", decision: "approve" as const, total: "100", p: "0.60" },
    { id: "ב", decision: "approve" as const, total: "90", p: "0.50" }, // dearer? no: cheaper, but below the threshold
    { id: "ג", decision: "refuse" as const, total: "0", p: "0.000000" },
    { id: "ד", decision: "approve" as const, total: "95", p: "0.70" },
  ];
  it("approved with enough chance first, by total; then approved below the threshold; refusals have no rank", () => {
    const r = rankRows(rows, "0.55");
    expect(r.map((x) => [x.id, x.group, x.rank])).toEqual([["א", 1, 2], ["ב", 2, 3], ["ג", 3, null], ["ד", 1, 1]]);
  });
  it("a tie keeps the order of the list", () => {
    const r = rankRows([{ id: "x", decision: "approve", total: "5", p: "0.9" }, { id: "y", decision: "approve", total: "5", p: "0.9" }], "0.55");
    expect(r.map((x) => x.rank)).toEqual([1, 2]);
  });
  it("explain names the reason", () => {
    const ranked = rankRows(rows, "0.55");
    expect(explain(rows, ranked).map((e) => e.why)).toEqual(["dearer", "below_threshold", "refused", "first"]);
  });
});

describe("runBank — case A (the facts of the lesson)", () => {
  it("bank ב׳ with a parent: relief 0.25, a chance above 0.55; bank ד׳ refuses (its financing line is 70%)", () => {
    const b = runBank("b", "parent");
    expect(b.verdict?.decision).toBe("approve");
    expect(b.verdict?.relief.toString()).toBe("0.25");
    expect(Number(b.p)).toBeGreaterThan(0.55);
    const d = runBank("d", "parent");
    expect(d.bestId).toBeNull(); // no candidate passes the bank's own financing line
  });
  it("the same family as asked is below the threshold at every bank", () => {
    for (const bank of ["a", "b", "c"] as const) expect(Number(runBank(bank, "asked").p)).toBeLessThan(0.55);
  });
}, 60000);
