import { describe, expect, it } from "vitest";
import { glueShekelSign, numberPieces, splitVerdict, withMinus } from "./bidi.ts";

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

describe("withMinus and glueShekelSign", () => {
  it("writes a negative amount with the course's minus, dropping Intl's direction mark", () => {
    expect(withMinus("‎-2,950.00 ₪")).toBe("−2,950.00 ₪");
    expect(withMinus("-0.5%")).toBe("−0.5%");
    expect(withMinus("2,950.00 ₪")).toBe("2,950.00 ₪");
  });
  it("glues the shekel sign to its number", () => {
    expect(glueShekelSign("1,200.00 ₪")).toBe("1,200.00 ₪");
    expect(glueShekelSign("12%")).toBe("12%");
  });
});

describe("splitVerdict", () => {
  it("adds the verdict when the feedback has none", () => {
    expect(splitVerdict("כי הריבית משתנה.", true)).toEqual({ lead: "נכון.", rest: "כי הריבית משתנה." });
    expect(splitVerdict("הפוך. החיווי הוא התמצית.", false)).toEqual({ lead: "לא בדיוק.", rest: "הפוך. החיווי הוא התמצית." });
  });
  it("does not say נכון twice", () => {
    expect(splitVerdict("נכון. זה בדיוק מה שהבנק עושה.", true)).toEqual({ lead: "נכון.", rest: "זה בדיוק מה שהבנק עושה." });
    expect(splitVerdict("נכון, לפי תקצירים: המאגר.", true)).toEqual({ lead: "נכון,", rest: "לפי תקצירים: המאגר." });
    expect(splitVerdict("נכון.", true)).toEqual({ lead: "נכון.", rest: "" });
  });
  it("does not take a longer word for the verdict", () => {
    expect(splitVerdict("נכונות הבנק גבוהה.", true).lead).toBe("נכון.");
  });
  it("does not say לא בדיוק twice", () => {
    expect(splitVerdict("לא בדיוק. זה הפוך.", false)).toEqual({ lead: "לא בדיוק.", rest: "זה הפוך." });
    expect(splitVerdict("לא. כל הבנקים.", false)).toEqual({ lead: "לא.", rest: "כל הבנקים." });
    expect(splitVerdict("לא ניתן לדעת.", false).lead).toBe("לא בדיוק.");
  });
});
