import { describe, expect, it } from "vitest";
import { CLOSED, OPEN, PASS_PERCENT, SECTION_IDS } from "./exam-9-5.ts";

describe("the final exam (unit 9.5)", () => {
  it("has unique question ids, each in a known section", () => {
    const ids = [...CLOSED.map((q) => q.id), ...OPEN.map((q) => q.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of [...CLOSED, ...OPEN]) expect(SECTION_IDS).toContain(q.section);
  });

  it("asks at least two closed questions from every stage 0 to 8", () => {
    for (let stage = 0; stage <= 8; stage++) {
      const n = CLOSED.filter((q) => q.section === String(stage)).length;
      expect(n, `stage ${stage}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("has a case-A section with closed and open questions", () => {
    expect(CLOSED.filter((q) => q.section === "A").length).toBeGreaterThan(0);
    expect(OPEN.filter((q) => q.section === "A").length).toBeGreaterThan(0);
  });

  it("gives every open question a rubric of at least three lines", () => {
    for (const q of OPEN) expect(q.lines).toBeGreaterThanOrEqual(3);
  });

  it("proposes a pass mark of 80 percent, which is a proposal and not a rule", () => {
    expect(PASS_PERCENT).toBe(80);
  });
});
