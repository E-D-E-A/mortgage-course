import { describe, expect, it } from "vitest";
import { cards } from "../../data/factor-cards.ts";
import { mapUpTo } from "./index.ts";
import { links, nodes } from "./stage-4.ts";

const full = mapUpTo("4.15");
const ids = new Set(full.nodes.map((n) => n.id));

describe("stage 4 on the big-picture map", () => {
  it("has unique node ids that do not collide with earlier stages", () => {
    const mine = nodes.map((n) => n.id);
    expect(new Set(mine).size).toBe(mine.length);
    const others = full.nodes.filter((n) => !n.lesson.startsWith("4.")).map((n) => n.id);
    for (const id of mine) expect(others.includes(id), id).toBe(false);
  });
  it("links only existing nodes, and never before both ends are on the map", () => {
    const lesson = new Map(full.nodes.map((n) => [n.id, n.lesson]));
    const order = (id: string) => id.split(".").map(Number);
    const notAfter = (a: string, b: string) => order(a)[0] < order(b)[0] || (order(a)[0] === order(b)[0] && order(a)[1] <= order(b)[1]);
    for (const l of links) {
      expect(ids.has(l.from), `${l.from} → ${l.to}`).toBe(true);
      expect(ids.has(l.to), `${l.from} → ${l.to}`).toBe(true);
      expect(notAfter(lesson.get(l.from)!, l.lesson), `${l.from} → ${l.to} at ${l.lesson}`).toBe(true);
      expect(notAfter(lesson.get(l.to)!, l.lesson), `${l.from} → ${l.to} at ${l.lesson}`).toBe(true);
    }
  });
  it("gives every factor card a node on the map", () => {
    for (const c of cards) expect(ids.has(c.node), `${c.id} → ${c.node}`).toBe(true);
  });
  it("shows no stage-4 node before 4.1", () => {
    expect(mapUpTo("3.12").nodes.some((n) => n.lesson.startsWith("4."))).toBe(false);
  });
});
