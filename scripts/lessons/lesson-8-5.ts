/**
 * Lesson 8.5 — trend line and error. General maths: the least-squares line through points, and its errors (MAE, RMSE). The points are
 * SYNTHETIC: ten invented offers of an invented bank, financing ratio against margin over the anchor (src/data/s8-datasets.ts). The line
 * describes THESE points only; how real banks price is unknown to the course (lesson 8.17 teaches a step shape, also on synthetic data).
 */
import { MARGIN_POINTS } from "../../src/data/s8-datasets.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given } from "./lesson-3-8.ts";
import { err, fit, fitErr, lin, mean, prod, quot, resid, total } from "./_stats-facts.ts";

export default function lesson85(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);

  // ── Five points, by hand. ──
  const five = [[50, "1.12"], [55, "1.14"], [60, "1.22"], [65, "1.25"], [70, "1.30"]] as const;
  const P5 = five.map(([x, y]) => ({ x, y }));
  push(mean("h.xbar", five.map((p) => p[0]), 0), mean("h.ybar", five.map((p) => p[1]), 3));
  const dx = five.map(([x], k) => lin(`h.dx${k}`, 1, -60, x, 0));
  const dy = five.map(([, y], k) => lin(`h.dy${k}`, 1, "-1.206", y, 3));
  const dxy = five.map((_, k) => prod(`h.dxy${k}`, dx[k].value as string, dy[k].value as string, 3));
  const dxx = five.map((_, k) => prod(`h.dxx${k}`, dx[k].value as string, dx[k].value as string, 0));
  push(...dx, ...dy, ...dxy, ...dxx);
  const sxy = total("h.sxy", dxy.map((f) => f.value as string), 3);
  const sxx = total("h.sxx", dxx.map((f) => f.value as string), 0);
  push(sxy, sxx, quot("h.slope", sxy.value as string, sxx.value as string, 4), fit("h.fit_a", P5, "a", 4), fit("h.fit_b", P5, "b", 3));
  push(lin("h.icpt", -0.0094, "1.206", 60, 3));
  const line5 = { a: "0.0094", b: "0.642" };
  push(resid("h.resid", P5, line5, 3), err("h.mae", P5, line5, "mae", 4), err("h.rmse", P5, line5, "rmse", 4), fitErr("h.fit_mae", P5, "mae", 4), fitErr("h.fit_rmse", P5, "rmse", 4));
  push(lin("h.pred65", "0.0094", "0.642", 65, 3));

  // ── Ten points. ──
  push(fit("t.a", MARGIN_POINTS, "a", 4), fit("t.b", MARGIN_POINTS, "b", 3), fitErr("t.mae", MARGIN_POINTS, "mae", 3), fitErr("t.rmse", MARGIN_POINTS, "rmse", 3));
  push(lin("t.pred62", "0.0123", "0.491", 62, 3));
  // my own guess line
  const guess = { a: "0.012", b: "0.55" };
  push(given("g.a", guess.a), given("g.b", guess.b), err("g.mae", MARGIN_POINTS, guess, "mae", 3), err("g.rmse", MARGIN_POINTS, guess, "rmse", 3));
  // outside the data
  push(lin("x.pred90", "0.0123", "0.491", 90, 2), given("x.lo", "40"), given("x.hi", "75"));
  // one extreme offer: (78, 2.5)
  const withOutlier = [...MARGIN_POINTS, { x: 78, y: 2.5 }];
  push(fit("o.a", withOutlier, "a", 4), fit("o.b", withOutlier, "b", 3), fitErr("o.mae", withOutlier, "mae", 3), fitErr("o.rmse", withOutlier, "rmse", 3));

  // ── Exercises. ──
  const lineEx = { a: "0.01", b: "0.6" };
  push(err("ex.mae", P5, lineEx, "mae", 3), err("ex.rmse", P5, lineEx, "rmse", 3), lin("ex.pred", "0.0094", "0.642", 55, 3), prod("ex.pred_nob", "0.0094", "55", 3), prod("x.pred90_nob", "0.0123", "90", 3));
  return { lesson: "8.5", title: "קו מגמה ושגיאה", note: "General maths on synthetic points; the line describes the points, not banks.", facts };
}
