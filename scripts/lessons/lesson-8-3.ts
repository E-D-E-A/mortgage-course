/**
 * Lesson 8.3 — distribution, spread and percentile. General maths. The data are SYNTHETIC payment ratios (src/data/s8-datasets.ts).
 * The percentile method the course teaches is linear interpolation (the spreadsheet's PERCENTILE.INC), stated in stats.ts's header;
 * the nearest-rank method is named once, to say that it differs. The standard deviation is the population one (÷ n), with the
 * sample one (÷ n − 1, STDEV.S) named once.
 */
import { RATIOS_11, RATIOS_30 } from "../../src/data/s8-datasets.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given } from "./lesson-3-8.ts";
import { countIn, hist, lin, mean, percentOf, percentile, position, prod, std, total, variance } from "./_stats-facts.ts";

export default function lesson83(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const sortedAsc = [...RATIOS_11].sort((a, b) => a - b);
  push(given("r.n", String(RATIOS_11.length)), given("r.sorted", sortedAsc.join(", ")));

  // ── The eleven ratios. ──
  push(total("r.sum", RATIOS_11, 0), mean("r.mean", RATIOS_11, 2), percentile("r.median", RATIOS_11, 50, 2), percentile("r.min", RATIOS_11, 0, 0), percentile("r.max", RATIOS_11, 100, 0));
  push(position("r.pos50", 11, 50), position("r.pos25", 11, 25), position("r.pos75", 11, 75), position("r.pos90", 11, 90), position("r.pos10", 11, 10));
  push(percentile("r.p10", RATIOS_11, 10, 2), percentile("r.p25", RATIOS_11, 25, 2), percentile("r.p75", RATIOS_11, 75, 2), percentile("r.p90", RATIOS_11, 90, 2));
  push(percentile("r.p75_nearest", RATIOS_11, 75, 2, "nearest"), percentile("r.p25_nearest", RATIOS_11, 25, 2, "nearest"));
  push(variance("r.var", RATIOS_11, 2), std("r.std", RATIOS_11, 2), std("r.std_sample", RATIOS_11, 2, true));

  // ── One extreme file: 47 becomes 70. ──
  const moved = RATIOS_11.map((x) => (x === 47 ? 70 : x));
  push(given("o.new", "70"), mean("o.mean", moved, 2), percentile("o.median", moved, 50, 2), std("o.std", moved, 2));

  // ── A small deviation example: five ratios. ──
  const five = [30, 34, 35, 38, 43];
  push(given("d.values", five.join(", ")), mean("d.mean", five, 0));
  const devs = five.map((x) => x - 36);
  five.forEach((x, k) => push(lin(`d.dev${k}`, 1, -36, x, 0), prod(`d.sq${k}`, devs[k], devs[k], 0)));
  push(total("d.sumsq", devs.map((x) => x * x), 0), variance("d.var", five, 1), std("d.std", five, 2));

  // ── The histogram of thirty ratios. ──
  push(
    mean("h.mean", RATIOS_30, 1), percentile("h.median", RATIOS_30, 50, 1), percentile("h.p90", RATIOS_30, 90, 1), std("h.std", RATIOS_30, 1),
    hist("h.counts", RATIOS_30, 24, 4, 7), hist("h.counts2", RATIOS_30, 24, 2, 13),
    countIn("h.over40", RATIOS_30, "40.1", "100"), percentOf("h.over40_pct", String(RATIOS_30.filter((x) => x > 40).length), "30", 1), given("h.n", "30"),
  );

  // ── Exercises. ──
  const ex2 = [32, 29, 41, 35, 38, 30, 44];
  push(percentile("ex.median", ex2, 50, 0), position("ex.pos", 7, 50), mean("x.mean1", [33, 35, 37], 0), mean("x.mean2", [20, 35, 50], 0));
  const ex5 = [2, 4, 4, 4, 5, 5, 7, 9];
  push(mean("ex.mean5", ex5, 0), variance("ex.var5", ex5, 0), std("ex.std5", ex5, 0), std("ex.std5_sample", ex5, 2, true));
  push(mean("ex.mean_a", [26, 31, 33, 35, 40], 0));

  return { lesson: "8.3", title: "התפלגות, פיזור ואחוזון", note: "General maths; the ratios are synthetic.", facts };
}
