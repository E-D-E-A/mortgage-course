import { describe, expect, it } from "vitest";
import { evaluate } from "../lib/calc/bankpolicy.ts";
import { loanOf } from "../lib/calc/sensitivity.ts";
import { BANKS, CAR_LOAN_RATE, PLAN, REQUEST_IDS, bank, caseAFile, carPayoff } from "./case-a-positioning.ts";
import { DAY_BANK, DAY_FILES } from "./underwriter-day.ts";

describe("the four fictional banks", () => {
  it("are named א׳ … ד׳, keep every refusal point at or below the law's lines, and price every kind of track", () => {
    expect(BANKS.map((b) => b.name)).toEqual(["בנק א׳", "בנק ב׳", "בנק ג׳", "בנק ד׳"]);
    for (const b of BANKS) {
      expect(Number(b.ratioMax)).toBeLessThanOrEqual(50);
      expect(Number(b.ltvMax)).toBeLessThanOrEqual(75);
      expect(Object.keys(b.prices).sort()).toEqual(["fixed_linked", "fixed_unlinked", "prime", "variable_linked", "variable_unlinked"]);
    }
  });
});

describe("case A's requests", () => {
  it("every request is the same loan of 1,640,000", () => {
    for (const id of REQUEST_IDS) expect(loanOf(caseAFile(id).tracks.map((t) => ({ ...t, rate: "1" }))).toString()).toBe("1640000");
  });

  it("the car loan's payoff is the value today of 26 payments of 1,450 at the assumed 6%", () => {
    expect(CAR_LOAN_RATE).toBe("6");
    // Hand-checked: 1,450 × (1 − 1.005^−26) ÷ 0.005 = 35,269.83
    expect(carPayoff().toFixed(2)).toBe("35269.83");
  });

  it("the plan's request goes to the banks that can serve the case, and every one of them approves it", () => {
    for (const id of PLAN.banks) expect(evaluate(bank(id), caseAFile(PLAN.request)).decision).toBe("approve");
    expect(evaluate(bank(PLAN.left), caseAFile(PLAN.request)).decision).toBe("refuse");
  });
});

describe("the files of the underwriter's day", () => {
  const policy = bank(DAY_BANK);
  const outcome = (i: number) => {
    const v = evaluate(policy, DAY_FILES[i].file);
    return [v.decision, v.points.toString()];
  };
  it("give five different outcomes at בנק א׳: clean, a ratio step, a financing step, a refusal, both steps", () => {
    expect(outcome(0)).toEqual(["approve", "0"]);
    expect(outcome(1)).toEqual(["approve", "0.15"]);
    expect(outcome(2)).toEqual(["approve", "0.1"]);
    expect(outcome(3)).toEqual(["refuse", "0"]);
    expect(outcome(4)).toEqual(["approve", "0.25"]);
  });
});
