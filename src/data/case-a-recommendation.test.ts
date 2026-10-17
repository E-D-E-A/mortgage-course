import { describe, expect, it } from "vitest";
import Decimal from "decimal.js";
import { ALTERNATIVES, type AltId, offerAt } from "../lib/calc/casefile.ts";
import { BANK_IDS } from "./case-a-offers.ts";
import { CHOICE, OTHER_PRIORITY, RUNNER_UP, releaseChecklist, THRESHOLD_PTI } from "./case-a-recommendation.ts";

/** The rule of choice of lesson 9.3, written again from scratch: hard filters, then the priority (the smallest rise), then the lowest total. */
function chosenByTheRule(): { alt: AltId; bank: string } {
  const ok = ALTERNATIVES.flatMap((a) =>
    BANK_IDS.map((b) => ({ alt: a.id, bank: b, o: offerAt(a.id, b) })).filter((c) => c.o.approved && c.o.readings!.stress.margin60.gte(0)),
  );
  const minRise = ok.reduce((m, c) => (c.o.rise!.lt(m) ? c.o.rise! : m), ok[0].o.rise!);
  const certain = ok.filter((c) => c.o.rise!.eq(minRise));
  const best = certain.reduce((m, c) => (c.o.readings!.forecast451.total.lt(m.o.readings!.forecast451.total) ? c : m));
  return { alt: best.alt, bank: best.bank };
}

describe("the recommendation of case A", () => {
  it("is what the stated rule gives: no refusal, a budget that holds in the worst month, the smallest rise, then the lowest total", () => {
    expect(chosenByTheRule()).toEqual(CHOICE);
  });

  it("is approved, sits under the 40% line, and its runner-up is the next bank for the same alternative", () => {
    const o = offerAt(CHOICE.alt, CHOICE.bank);
    expect(o.approved).toBe(true);
    expect(o.verdict.ratio.lte(THRESHOLD_PTI)).toBe(true);
    const others = BANK_IDS.filter((b) => b !== CHOICE.bank && offerAt(CHOICE.alt, b).approved);
    const next = others.reduce((m, b) => (offerAt(CHOICE.alt, b).readings!.forecast451.total.lt(offerAt(CHOICE.alt, m).readings!.forecast451.total) ? b : m));
    expect(next).toBe(RUNNER_UP.bank);
    expect(RUNNER_UP.alt).toBe(CHOICE.alt);
  });

  it("names the other priority's alternative: the lowest first payment among the approved candidates", () => {
    const first = (a: AltId, b: (typeof BANK_IDS)[number]) => offerAt(a, b).readings!.forecast451.first;
    const lowest = ALTERNATIVES.flatMap((a) => BANK_IDS.filter((b) => offerAt(a.id, b).approved).map((b) => ({ a: a.id, b, v: first(a.id, b) }))).reduce((m, c) => (c.v.lt(m.v) ? c : m));
    expect({ alt: lowest.a, bank: lowest.b }).toEqual(OTHER_PRIORITY);
  });
});

describe("the pre-release checklist", () => {
  const n = {
    validUntil: "29 בנובמבר",
    daysLeft: "20",
    loan: "1,619,000 ₪",
    ltvCeiling: "75",
    breakEven: "2,158,667 ₪",
    reserve: "19,000 ₪",
    ratio: "39.57%",
    roomTo40: "88.03 ₪",
    margin: "738.03 ₪",
    carLeft: "26",
  };
  const groups = releaseChecklist(n);

  it("has unique ids inside each group and a source on every item", () => {
    expect(groups.length).toBeGreaterThanOrEqual(5);
    for (const g of groups) {
      const ids = g.items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const i of g.items) expect(i.source && i.source.length > 3).toBe(true);
    }
  });

  it("shows no internal id to the learner (no FK or J codes, no DEC-n)", () => {
    const text = JSON.stringify(groups);
    expect(text).not.toMatch(/FK-[A-Z]-\d+|\bJ-\d{3}\b|DEC-\d/);
  });

  it("takes every number from its argument", () => {
    const text = JSON.stringify(groups);
    for (const v of ["29 בנובמבר", "2,158,667 ₪", "19,000 ₪", "39.57%", "88.03 ₪", "738.03 ₪"]) expect(text).toContain(v);
    expect(new Decimal(THRESHOLD_PTI).toString()).toBe("40");
  });
});
