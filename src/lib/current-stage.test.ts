import { describe, expect, it } from "vitest";
import { pickStage } from "./current-stage.ts";

const storage = (entries: Record<string, unknown>) => {
  const m = new Map(Object.entries(entries).map(([k, v]) => [k, JSON.stringify(v)]));
  return { get length() { return m.size; }, key: (i: number) => [...m.keys()][i] ?? null, getItem: (k: string) => m.get(k) ?? null };
};

describe("pickStage", () => {
  it("opens stage 0 for someone with no progress", () => {
    expect(pickStage(storage({}), "")).toBe(0);
  });

  it("follows a #stage-N link before anything else", () => {
    expect(pickStage(storage({ "mogi-course:last-lesson": { id: "5.2" } }), "#stage-3")).toBe(3);
  });

  it("opens the stage of the lesson opened last", () => {
    expect(pickStage(storage({ "mogi-course:last-lesson": { id: "5.2", at: "x" } }), "")).toBe(5);
  });

  it("falls back to the lesson opened most recently when there is no last-lesson", () => {
    const s = storage({
      "mogi-course:lesson:0.1": { at: "2026-10-01T10:00:00Z" },
      "mogi-course:lesson:4.3": { at: "2026-10-05T10:00:00Z" },
      "mogi-course:lesson:2.9": { at: "2026-10-03T10:00:00Z" },
      "mogi-course:exercise:9.1": { correct: true },
    });
    expect(pickStage(s, "")).toBe(4);
  });

  it("is stage 0 when storage is unusable, and works as a printed inline script", () => {
    expect(pickStage({ length: 0, key: () => null, getItem: () => { throw new Error("blocked"); } }, "")).toBe(0);
    const printed = new Function(`return (${pickStage.toString()})`)() as typeof pickStage;
    expect(printed(storage({ "mogi-course:last-lesson": { id: "7.1" } }), "")).toBe(7);
  });
});
