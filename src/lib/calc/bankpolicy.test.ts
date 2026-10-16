import { describe, expect, it } from "vitest";
import { BANKS, bank, caseAFile, movesFor, planEquity } from "../../data/case-a-positioning.ts";
import { evaluate, listTracks, reasonLines, type BankPolicy } from "./bankpolicy.ts";
import { percentString } from "./percent.ts";

const A = bank("a");
const C = bank("c");
const base = caseAFile();

describe("a policy applied to a file", () => {
  it("measures the ratio at the bank's list rates: case A at בנק א׳ is 8,181.30 over 20,250", () => {
    // Hand-checked: 546,000 at 4.60 + 547,000 at 4.10 + 547,000 at 4.40, 360 months, level payments = 8,181.0539…, over 21,700 − 1,450.
    const v = evaluate(A, base);
    expect(v.listPayment.toFixed(2)).toBe("8181.30");
    expect(v.disposable.toString()).toBe("20250");
    expect(percentString(v.ratio)).toBe("40.4");
    expect(percentString(v.ltv)).toBe("74.55");
  });

  it("gives case A's request the list price at the three banks that serve it, as lessons 6.6–6.8 offer it", () => {
    for (const id of ["a", "b", "c"]) {
      const v = evaluate(bank(id), base);
      expect(v.decision).toBe("approve");
      expect(v.relief.toString()).toBe("0");
      expect(v.finalTracks.map((t) => t.rate)).toEqual(v.listTracks.map((t) => t.rate));
    }
  });

  it("refuses strictly above a refusal point: בנק ד׳'s financing ceiling is 70 and the case sits at 74.55", () => {
    const v = evaluate(bank("d"), base);
    expect(v.decision).toBe("refuse");
    expect(reasonLines(v).map((l) => l.id)).toEqual(["ltv"]);
    expect(v.relief.toString()).toBe("0");
  });

  it("is not above a line it sits exactly on: the relief line takes a file that is on it, the refusal line lets it through", () => {
    const exact = evaluate(A, base).ratio.toString();
    const onRelief: BankPolicy = { ...A, ratioReliefLine: exact };
    expect(evaluate(onRelief, base).lines[0].outcome).toBe("relief");
    const onMax: BankPolicy = { ...A, ratioMax: exact };
    expect(evaluate(onMax, base).decision).toBe("approve");
  });

  it("takes the relief of both lines off every track, and none when the bank refuses", () => {
    const strong = { value: "1800000", income: "24000", obligations: [], tracks: [{ kind: "prime" as const, amount: "300000", months: 360 }, { kind: "fixed_unlinked" as const, amount: "600000", months: 360 }] };
    const v = evaluate(A, strong);
    expect(v.lines.map((l) => [l.id, l.outcome])).toEqual([["ratio", "relief"], ["ltv", "relief"]]);
    expect(v.relief.toString()).toBe("0.25");
    expect(v.finalTracks.map((t) => t.rate)).toEqual(["4.35", "4.15"]);
    expect(listTracks(A, strong.tracks).map((t) => t.rate)).toEqual(["4.60", "4.40"]);
    const refusing = evaluate({ ...A, ratioMax: "10" }, strong);
    expect(refusing.decision).toBe("refuse");
    expect(refusing.relief.toString()).toBe("0");
  });

  it("the plan's equity brings case A under בנק א׳'s 40 line, and only that bank's", () => {
    expect(planEquity().toString()).toBe("21000");
    const planned = caseAFile(movesFor({ equity: planEquity().toString() }));
    const byBank = Object.fromEntries(BANKS.map((b) => [b.id, evaluate(b, planned)]));
    expect(percentString(byBank.a.ratio)).toBe("39.88");
    expect(byBank.a.relief.toString()).toBe("0.15");
    expect(byBank.b.relief.toString()).toBe("0");
    expect(byBank.c.relief.toString()).toBe("0");
    expect(byBank.d.decision).toBe("refuse");
  });

  it("closing the car loan from the equity (not the savings) breaks the 75% line at every bank: the loan grows by the payoff", () => {
    const file = caseAFile([{ lever: "close_loan", payoff: "36000", from: "equity" }]);
    for (const b of BANKS) {
      const v = evaluate(b, file);
      expect(percentString(v.ltv)).toBe("76.18");
      expect(v.decision).toBe("refuse");
    }
  });
});
