import { describe, expect, it } from "vitest";
import { BANKS, bank, caseAFile } from "../../data/case-a-positioning.ts";
import { evaluate, listTracks, reasonLines, type BankPolicy, type LoanFile } from "./bankpolicy.ts";
import { percentString } from "./percent.ts";

const A = bank("a");
const C = bank("c");

describe("a policy applied to a file", () => {
  it("measures the ratio at the bank's list rates: case A at בנק ג׳ is 8,181.30 over 20,250", () => {
    // Hand-checked: 546,000 at 4.60 + 547,000 at 4.10 + 547,000 at 4.40, 360 months, level payments, = 8,181.2955…
    const v = evaluate(C, caseAFile("initial"));
    expect(v.listPayment.toFixed(2)).toBe("8181.30");
    expect(v.disposable.toString()).toBe("20250");
    expect(percentString(v.ratio)).toBe("40.4");
  });

  it("refuses strictly above a refusal point: 40.40 is above בנק ג׳'s 40", () => {
    const v = evaluate(C, caseAFile("initial"));
    expect(v.decision).toBe("refuse");
    expect(reasonLines(v).map((l) => l.id)).toEqual(["ratio"]);
    expect(v.points.toString()).toBe("0");
  });

  it("is not above a line it sits exactly on", () => {
    // A single track whose ratio is exactly the line cannot be built from real rates; use a policy whose refusal point is the ratio itself.
    const file = caseAFile("initial");
    const exact = evaluate(C, file).ratio.toString();
    const same: BankPolicy = { ...C, ratioMax: exact };
    expect(evaluate(same, file).decision).toBe("approve");
    const below: BankPolicy = { ...C, ratioMax: "40.40", ratioStep: "40.4014593538127668602", ratioStepPoints: "0.3" };
    expect(evaluate(below, file).decision).toBe("refuse");
  });

  it("adds the steps of both lines to every track, and none when the bank refuses", () => {
    const v = evaluate(A, caseAFile("initial"));
    expect(v.decision).toBe("approve");
    expect(v.lines.map((l) => [l.id, l.outcome])).toEqual([["ratio", "step"], ["ltv", "step"]]);
    expect(v.points.toString()).toBe("0.25");
    expect(v.finalTracks.map((t) => t.rate)).toEqual(["4.85", "4.4", "4.6"]);
    expect(v.finalTracks.map((t) => t.rate)).not.toEqual(listTracks(A, caseAFile("initial").tracks).map((t) => t.rate));
  });

  it("half and half crosses below 40% at בנק א׳: only the financing step is left", () => {
    const v = evaluate(A, caseAFile("half"));
    expect(percentString(v.ratio)).toBe("39.84");
    expect(v.points.toString()).toBe("0.1");
  });

  it("בנק ד׳ refuses case A on the financing ratio whatever the mix", () => {
    for (const id of ["initial", "half", "linked", "fixed"] as const) {
      const v = evaluate(bank("d"), caseAFile(id));
      expect(v.decision).toBe("refuse");
      expect(reasonLines(v).map((l) => l.id)).toEqual(["ltv"]);
    }
  });

  it("closing the car loan from the equity lowers the ratio and breaks the 75% line, at every bank", () => {
    for (const b of BANKS) {
      const v = evaluate(b, caseAFile("initial", { closeCar: true }));
      expect(percentString(v.ltv)).toBe("76.15");
      expect(percentString(v.ratio)).not.toBe("40.4");
      expect(v.decision).toBe("refuse");
    }
    expect(percentString(evaluate(A, caseAFile("initial", { closeCar: true })).ratio)).toBe("38.51");
  });

  it("the 18-month rule decides what the file shows: 18 payments left and the car loan stops counting", () => {
    const waiting: LoanFile = caseAFile("initial", { carMonthsLeft: 18 });
    expect(percentString(evaluate(A, waiting).ratio)).toBe("37.7");
    expect(evaluate(C, waiting).decision).toBe("approve");
    const still = caseAFile("initial", { carMonthsLeft: 19 });
    expect(percentString(evaluate(A, still).ratio)).toBe("40.4");
  });
});
