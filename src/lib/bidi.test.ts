import { describe, expect, it } from "vitest";
import { numberPieces } from "./bidi.ts";

describe("numberPieces", () => {
  it("leaves Hebrew without numbers whole", () => {
    expect(numberPieces("קבועה צמודה")).toEqual([{ text: "קבועה צמודה", ltr: false }]);
  });
  it("makes a bare range one left-to-right piece", () => {
    expect(numberPieces("6–10")).toEqual([{ text: "6–10", ltr: true }]);
  });
  it("splits a range inside Hebrew, and keeps the full stop with the Hebrew", () => {
    expect(numberPieces("שיעורים 3.2–3.6; בונים.")).toEqual([
      { text: "שיעורים ", ltr: false },
      { text: "3.2–3.6", ltr: true },
      { text: "; בונים.", ltr: false },
    ]);
    expect(numberPieces("שיעור 3.10.")).toEqual([
      { text: "שיעור ", ltr: false },
      { text: "3.10", ltr: true },
      { text: ".", ltr: false },
    ]);
  });
  it("keeps signed numbers, percents and dates whole", () => {
    expect(numberPieces("−1 ₪").map((p) => p.text)).toEqual(["−1", " ₪"]);
    expect(numberPieces("ב־2026-10-07").map((p) => p.text)).toEqual(["ב־", "2026-10-07"]);
    expect(numberPieces("+1.2 נקודות").map((p) => p.text)).toEqual(["+1.2", " נקודות"]);
    expect(numberPieces("12.5%")).toEqual([{ text: "12.5%", ltr: true }]);
  });
});
