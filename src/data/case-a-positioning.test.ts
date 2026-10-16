import { describe, expect, it } from "vitest";
import { BANK_PRICES } from "./case-a-offers.ts";
import { evaluate } from "../lib/calc/bankpolicy.ts";
import { positionOf } from "../lib/calc/levers.ts";
import { BANKS, LEFT_OUT, LEVER_NAME_HE, PLAN_BANKS, bank, caseAFile, caseAfter, movesFor, planEquity, planMoves } from "./case-a-positioning.ts";
import { DAY_BANK, DAY_FILES } from "./underwriter-day.ts";

describe("the four fictional banks", () => {
  it("are lessons 6.6–6.8's banks with their price lists, and keep every refusal point at or below the law's lines", () => {
    expect(BANKS.map((b) => b.name)).toEqual(["בנק א׳", "בנק ב׳", "בנק ג׳", "בנק ד׳"]);
    for (const b of BANKS) {
      expect(b.prices).toEqual(BANK_PRICES[b.id as "a"]);
      expect(Number(b.ratioMax)).toBeLessThanOrEqual(50);
      expect(Number(b.ltvMax)).toBeLessThanOrEqual(75);
    }
  });
});

describe("case A's levers", () => {
  it("with no lever the file is the family's own request: 1,640,000, the initial mix, the car loan still counting", () => {
    const p = positionOf(caseAfter([]));
    expect(p.loan.toString()).toBe("1640000");
    expect(caseAFile().obligations.length).toBe(1);
  });

  it("the plan's equity is 21,000: the smallest whole thousand that leaves the ratio 0.1 point under 40", () => {
    expect(planEquity().toString()).toBe("21000");
    expect(positionOf(caseAfter(planMoves())).ratio.toFixed(2)).toBe("39.88");
    expect(positionOf(caseAfter(movesFor({ equity: "20000" }))).ratio.gt("39.9")).toBe(true);
  });

  it("the menu has four levers, and closing the car loan on top of the plan's equity needs more savings than there are", () => {
    expect(Object.keys(LEVER_NAME_HE)).toEqual(["equity", "car", "wait", "parent"]);
    expect(() => caseAfter(movesFor({ equity: planEquity().toString(), car: true }))).toThrow();
  });

  it("the plan asks the three banks that can serve the case and leaves out בנק ד׳", () => {
    expect(PLAN_BANKS).toEqual(["a", "b", "c"]);
    expect(LEFT_OUT).toBe("d");
    for (const id of PLAN_BANKS) expect(evaluate(bank(id), caseAFile(planMoves())).decision).toBe("approve");
    expect(evaluate(bank(LEFT_OUT), caseAFile(planMoves())).decision).toBe("refuse");
  });
});

describe("the files of the underwriter's day", () => {
  const policy = bank(DAY_BANK);
  const outcome = (i: number) => {
    const v = evaluate(policy, DAY_FILES[i].file);
    return [v.decision, v.relief.toString()];
  };
  it("give five different outcomes at בנק א׳: both reliefs, the financing relief only, the ratio relief only, a refusal, the list price", () => {
    expect(outcome(0)).toEqual(["approve", "0.25"]);
    expect(outcome(1)).toEqual(["approve", "0.1"]);
    expect(outcome(2)).toEqual(["approve", "0.15"]);
    expect(outcome(3)).toEqual(["refuse", "0"]);
    expect(outcome(4)).toEqual(["approve", "0"]);
  });
});
