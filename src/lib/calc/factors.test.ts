import { describe, expect, it } from "vitest";
import { addDays, daysBetween, evaluateSteps, plain } from "./factors.ts";
import { cards } from "../../data/factor-cards.ts";

describe("plain", () => {
  it("rounds half away from zero and drops trailing zeros", () => {
    expect(plain("42.000")).toBe("42");
    expect(plain("78.9473684")).toBe("78.95");
    expect(plain("0.125", 2)).toBe("0.13");
    expect(plain("0.1215", 3)).toBe("0.122");
    expect(plain("-0.001")).toBe("0");
  });
});

describe("dates", () => {
  it("adds calendar days across months and years", () => {
    expect(addDays("2026-10-11", 60)).toBe("2026-12-10");
    expect(addDays("2026-12-20", 24)).toBe("2027-01-13");
    expect(daysBetween("2026-10-20", "2026-10-30")).toBe(10);
  });
});

describe("the card examples", () => {
  const value = (id: string, name: string) => {
    const card = cards.find((c) => c.id === id)!;
    return evaluateSteps(card.example.steps).find((s) => s.name === name)!.value;
  };
  it("computes by hand-checked values", () => {
    expect(value("pti", "ratio")).toBe("42");
    expect(value("pti", "max_cap")).toBe("10000");
    expect(value("pti", "max_capital")).toBe("8000");
    expect(value("equity", "share")).toBe("25");
    expect(value("income_source", "monthly")).toBe("12000");
    expect(value("obligations", "disposable")).toBe("14800");
    expect(value("credit_history", "until")).toBe("2026-12-10");
    expect(value("account_conduct", "average")).toBe("11933.33");
    expect(value("family", "c1")).toBe("2");
    expect(value("family", "c2")).toBe("3");
    expect(value("value_appraisal", "on_price")).toBe("75");
    expect(value("value_appraisal", "on_value")).toBe("78.95");
    expect(value("registration", "gap")).toBe("60");
    expect(value("timing", "until")).toBe("2026-11-13");
    expect(value("fees", "share")).toBe("0.121");
    expect(value("mix", "min_fixed")).toBe("400000");
  });
  it("matches the level payment of two terms (1,000,000 at 5%)", () => {
    expect(value("term_age", "pay20")).toBe("6599.56");
    expect(value("term_age", "pay30")).toBe("5368.22");
  });
  it("refuses a step that uses a value not yet known", () => {
    expect(() => evaluateSteps([{ name: "a", calc: { op: "sum", of: ["b"] } }])).toThrow();
  });
});

describe("the cards", () => {
  it("are 22, numbered 1 to 22, with unique ids", () => {
    expect(cards.map((c) => c.n).sort((a, b) => a - b)).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
    expect(new Set(cards.map((c) => c.id)).size).toBe(22);
  });
  it("label every threshold and give each card a source", () => {
    for (const c of cards) {
      expect(c.thresholds.length, c.id).toBeGreaterThan(0);
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      for (const t of c.thresholds) expect(t.kind && t.source, c.id).toBeTruthy();
    }
  });
  it("use only placeholders that the example computes", () => {
    for (const c of cards) {
      const names = new Set(c.example.steps.map((s) => s.name));
      for (const m of c.example.text.matchAll(/\{(\w+)\}/g)) expect(names.has(m[1]), `${c.id}: ${m[1]}`).toBe(true);
    }
  });
});
