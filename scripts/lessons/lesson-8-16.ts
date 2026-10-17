/**
 * Lesson 8.16 — a first look at linear programming, and "optimal relative to what?".
 *
 * The tiniest mortgage programme: two fixed tracks at the course's price list of case A (4.40%): a LONG one (30 years) and a
 * SHORT one (15 years); the amounts x (long) and y (short) in units of 100,000 ₪. The cost of a track per unit is the total
 * paid on 100,000 ₪ and its payment per unit the first payment (facts of the stage-3 module metrics.ts, statement rounding).
 * Three straight-line conditions: cover the loan, at least 40% in the long track (a wish of the client), and a largest monthly
 * payment. The corners are lp.ts' (checks/kinds/lp.py, exact fractions). The same problem with the client's cap raised shows
 * another corner. A second part: a cost listed at eleven fixed shares with two valleys (a local and a global minimum).
 * Everything is SYNTHETIC and for illustration.
 */
import { CURVE } from "../../src/data/lp-demo.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, first, total, given as given38 } from "./lesson-3-8.ts";
import { lpCrossings, lpFeasibleCount, lpSolve, lpValleys, lpValue } from "./_s8c-facts.ts";

export const UNIT = "100000";
export const NEED_UNITS = "10";
export const CAP = "6000";
export const CAP2 = "6600";
export const LONG = { principal: UNIT, rates: ["4.40"], months: 360 };
export const SHORT = { principal: UNIT, rates: ["4.40"], months: 180 };

export default function lesson816(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;
  const v = (id: string) => byId(id).value as string;

  push(given38("unit", UNIT), given38("need", NEED_UNITS), given38("cap", CAP), given38("cap2", CAP2), given38("loan", "1000000"));
  push(first("lg.pay", [LONG]), total("lg.cost", [LONG]), first("sh.pay", [SHORT]), total("sh.cost", [SHORT]));
  const conds = (cap: string) => [
    { label: "כיסוי ההלוואה", a: ["-1", "-1"] as [string, string], b: `-${NEED_UNITS}` },
    { label: "לפחות 40% בארוכה", a: ["-3", "2"] as [string, string], b: "0" },
    { label: "ההחזר החודשי", a: [v("lg.pay"), v("sh.pay")] as [string, string], b: cap },
  ];
  const cost: [string, string] = [v("lg.cost"), v("sh.cost")];
  const pay: [string, string] = [v("lg.pay"), v("sh.pay")];
  push(
    lpSolve("a", cost, "min", conds(CAP), 10),
    lpSolve("b", cost, "min", conds(CAP2), 10),
    lpCrossings("cross", cost, "min", conds(CAP), 10),
    lpFeasibleCount("cross.feasible", cost, "min", conds(CAP), 10),
  );
  const bestA = (byId("a").value as { best: { x: string; y: string }[] }).best[0];
  const bestB = (byId("b").value as { best: { x: string; y: string }[] }).best[0];
  push(
    lpValue("a.long_shek", [UNIT, "0"], bestA.x, bestA.y, 0),
    lpValue("a.short_shek", ["0", UNIT], bestA.x, bestA.y, 0),
    lpValue("a.pay", pay, bestA.x, bestA.y, 2),
    lpValue("a.cost", cost, bestA.x, bestA.y, 2),
    lpValue("b.long_shek", [UNIT, "0"], bestB.x, bestB.y, 0),
    lpValue("b.short_shek", ["0", UNIT], bestB.x, bestB.y, 0),
    lpValue("b.pay", pay, bestB.x, bestB.y, 2),
    lpValue("b.cost", cost, bestB.x, bestB.y, 2),
    lpValue("alllong.pay", pay, "10", "0"),
    lpValue("alllong.cost", cost, "10", "0"),
    lpValue("allshort.pay", pay, "0", "10"),
    lpValue("allshort.cost", cost, "0", "10"),
    // A feasible point inside the region, for the hand tasks: 8 and 2 units.
    lpValue("mid.pay", pay, "8", "2"),
    lpValue("mid.cost", cost, "8", "2"),
    // The corner where the 40% line meets the cover line: 4 and 6 units, and what it costs to reach for more short.
    lpValue("c40.pay", pay, "4", "6"),
  );
  push(
    difference("a.saving_vs_long", byId("alllong.cost"), byId("a.cost")),
    difference("b.saving_vs_a", byId("a.cost"), byId("b.cost")),
    difference("b.more_pay", byId("b.pay"), byId("a.pay")),
    difference("alllong.room", byId("cap"), byId("alllong.pay")),
    difference("c40.over", byId("c40.pay"), byId("cap")),
    difference("allshort.over", byId("allshort.pay"), byId("cap")),
    difference("pay.gap", byId("sh.pay"), byId("lg.pay")),
  );
  push(given38("curve.local", CURVE[3]), given38("curve.global", CURVE[8]));
  push(difference("curve.gap", byId("curve.local"), byId("curve.global")));
  push(lpValleys("valley.0", CURVE, 0), lpValleys("valley.6", CURVE, 6), lpValleys("valley.10", CURVE, 10));
  return {
    lesson: "8.16",
    title: "היכרות עם תכנון לינארי, ומתי כל שיטה מתאימה",
    note: "Synthetic. Two fixed tracks of the course's price list (4.40%), 30 and 15 years; the cost per unit of 100,000 ₪ is the total paid and the payment per unit the first payment (stage-3 module, statement rounding). The conditions (cover the loan; at least 40% in the long track, a wish of the client; the largest monthly payment 6,000 ₪, then 6,600 ₪) are teaching inputs. The corners are found by crossing the boundary lines (lp.ts) and checked with exact fractions. The eleven-value cost curve with two valleys is invented.",
    facts,
  };
}
