import { describe, expect, it } from "vitest";
import { mapUpTo } from "./index.ts";
import { LAYER, links, nodes } from "./stage-8.ts";

const full = mapUpTo("8.99");
const ids = new Set(full.nodes.map((n) => n.id));
const order = (id: string) => id.split(".").map(Number);
const notAfter = (a: string, b: string) => order(a)[0] < order(b)[0] || (order(a)[0] === order(b)[0] && order(a)[1] <= order(b)[1]);

describe("stage 8 on the big-picture map", () => {
  it("has unique node ids that do not collide with earlier stages", () => {
    const mine = nodes.map((n) => n.id);
    expect(new Set(mine).size).toBe(mine.length);
    const others = full.nodes.filter((n) => !n.lesson.startsWith("8.")).map((n) => n.id);
    for (const id of mine) expect(others.includes(id), id).toBe(false);
  });

  it("puts every node at a lesson of stage 8", () => {
    for (const n of nodes) expect(n.lesson.startsWith("8."), n.id).toBe(true);
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

  it("names, on every stage-8 card, which of the three it is (היום, הוחלט or עתיד) and states no figure", () => {
    for (const n of nodes) {
      const note = n.card.note ?? "";
      expect(/Mogi היום|הוחלט|עתיד/.test(note), n.id).toBe(true);
      expect(/\d/.test(`${n.card.what} ${n.card.role}`.replace(/הוראה \d+/g, "")), n.id).toBe(false);
    }
  });

  it("gives every node of the map a role in the layer, and the layer names no node that is not on the map", () => {
    for (const n of full.nodes) {
      const l = LAYER[n.id];
      expect(l, n.id).toBeDefined();
      expect(l.roles.length, n.id).toBeGreaterThan(0);
      expect(l.roles.every(Boolean), n.id).toBe(true);
      expect(l.control, n.id).toBeTruthy();
    }
    for (const id of Object.keys(LAYER)) expect(ids.has(id), id).toBe(true);
  });

  it("keeps the layer's decision variables on the client's side and the market's variables as inputs", () => {
    for (const [id, l] of Object.entries(LAYER)) {
      if (l.roles.includes("decision")) expect(["client", "other"].includes(l.control), id).toBe(true);
    }
    for (const id of ["prime", "boi_rate", "inflation", "anchor"]) expect(LAYER[id].roles).toEqual(["input"]);
  });

  it("keeps a bank's own answers and acts as inputs or outside, never as the algorithm's output", () => {
    for (const id of ["approval", "counter_offer", "personal_offer"]) expect(LAYER[id].roles, id).toEqual(["input"]);
    expect(LAYER.pre_approval.roles).toEqual(["outside"]);
    expect(LAYER.proposed_basket.control).toBe("bank");
  });

  it("shows no stage-8 node before 8.6", () => {
    expect(mapUpTo("7.8").nodes.some((n) => n.lesson.startsWith("8."))).toBe(false);
  });
});
