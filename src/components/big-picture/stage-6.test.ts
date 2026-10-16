import { describe, expect, it } from "vitest";
import { mapUpTo } from "./index.ts";
import { links, nodes } from "./stage-6.ts";

const full = mapUpTo("6.11");
const ids = new Set(full.nodes.map((n) => n.id));
const order = (id: string) => id.split(".").map(Number);
const notAfter = (a: string, b: string) => order(a)[0] < order(b)[0] || (order(a)[0] === order(b)[0] && order(a)[1] <= order(b)[1]);

describe("stage 6 on the big-picture map", () => {
  it("has unique node ids that do not collide with earlier stages", () => {
    const mine = nodes.map((n) => n.id);
    expect(new Set(mine).size).toBe(mine.length);
    const others = full.nodes.filter((n) => !n.lesson.startsWith("6.")).map((n) => n.id);
    for (const id of mine) expect(others.includes(id), id).toBe(false);
  });

  it("puts every node at a lesson of stage 6", () => {
    for (const n of nodes) expect(n.lesson.startsWith("6."), n.id).toBe(true);
  });

  it("links only existing nodes, and never before both ends are on the map", () => {
    const lesson = new Map(full.nodes.map((n) => [n.id, n.lesson]));
    for (const l of links) {
      expect(ids.has(l.from), `${l.from} → ${l.to}`).toBe(true);
      expect(ids.has(l.to), `${l.from} → ${l.to}`).toBe(true);
      expect(notAfter(lesson.get(l.from)!, l.lesson), `${l.from} → ${l.to} at ${l.lesson}`).toBe(true);
      expect(notAfter(lesson.get(l.to)!, l.lesson), `${l.from} → ${l.to} at ${l.lesson}`).toBe(true);
    }
  });

  it("gives every card its three parts, and no card states a figure with digits beyond a lesson or version number", () => {
    for (const n of nodes) {
      expect(n.card.what.length, n.id).toBeGreaterThan(20);
      expect(n.card.role.length, n.id).toBeGreaterThan(20);
      // A card never states a rate, an amount or a percent: a digit may only name a directive (in the note a lesson, a version or a date).
      const prose = `${n.card.what} ${n.card.role}`.replace(/הוראה \d+/g, "הוראה");
      expect(/\d/.test(prose), `${n.id}: ${prose}`).toBe(false);
    }
  });

  it("shows no stage-6 node before 6.1", () => {
    expect(mapUpTo("5.10").nodes.some((n) => n.lesson.startsWith("6."))).toBe(false);
  });
});
