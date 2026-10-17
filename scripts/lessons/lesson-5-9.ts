/**
 * Lesson 5.9 — is the mix good? A mix is judged against four yardsticks: the
 * client's goals, the Bank of Israel's average rate per track, the uniform
 * baskets, and other banks' offers. Every number the page, its exercises, its
 * judge component and its video show is declared here as a fact; the Python
 * checks recompute each one (metrics.py for the measures, mixcheck.py for the
 * rest, common.py for the differences).
 *
 * The household and every rate are invented (see _mix-judge.ts). The averages
 * are invented too and labelled "להמחשה": real numbers from the Bank of
 * Israel's series are not available to the course's authors. The "rise" of 2
 * points is a teaching scenario, not a forecast.
 */
import { MIX_A, MIX_B, BASKET_3, AVERAGES, TERM, RISE, TRACK_LABELS, measureFacts, withTerm, given, difference, effectiveOf, monthlyOf, pointsGap, loanOf, changingOf, argMinFact } from "./_mix-judge.ts";
import { highest } from "./lesson-3-8.ts";
import { stressTracks } from "../../src/lib/calc/mixcheck.ts";
import { varShare } from "./regulation-facts.ts";
import type { Fact, LessonData } from "../build-data.ts";

export default function lesson(): LessonData {
  const facts: Fact[] = [];
  const add = <T extends Fact>(f: T): T => (facts.push(f), f);
  const adds = (fs: Fact[]) => fs.map(add);
  const get = (id: string) => facts.find((f) => f.id === id) as Fact;

  // The household's loan and the mix at bank א׳.
  add(given("term.months", String(TERM)));
  add(given("term.years", String(TERM / 12)));
  add(given("term.long_months", "360"));
  add(given("term.long_years", "30"));
  add(given("rise", RISE));
  MIX_A.forEach((t, k) => {
    add(given(`x.a${k + 1}`, t.amount));
    add(given(`x.r${k + 1}`, t.ratePercent));
  });
  add(loanOf("x.loan", MIX_A));
  add(changingOf("x.changing", MIX_A));
  add(varShare("x.changing_share", "700000", "1200000"));
  adds(measureFacts("x", MIX_A));

  // A small example with numbers for the head: 6% contract rate against an average of 6.05% (effective).
  add(given("mini.nominal", "6"));
  add(given("mini.avg", "6.05"));
  add(monthlyOf("mini.monthly", "6", 4));
  add(effectiveOf("mini.eff", "6", 4));
  add(pointsGap("mini.gap_nom", get("mini.nominal"), get("mini.avg"), 2));
  add(pointsGap("mini.gap_eff", get("mini.eff"), get("mini.avg"), 4));

  // Yardstick 1 — the client's goals. A first-payment ceiling, and a ceiling on the highest payment under the rise.
  add(given("goal.first_max", "6700"));
  add(given("goal.high_max", "7400"));
  add(difference("goal.first_room", get("goal.first_max"), get("x.first")));
  add(difference("goal.high_over", get("x.high"), get("goal.high_max")));
  // Without the scenario, the same ceiling looks safe: the basis broken.
  add(highest("x.high_flat", stressTracks(MIX_A, 0)));
  add(difference("goal.flat_room", get("goal.high_max"), get("x.high_flat")));

  // Yardstick 2 — the average, on the same basis: effective annual rates.
  MIX_A.forEach((t, k) => {
    const n = k + 1;
    add(given(`avg.${n}`, AVERAGES[k]));
    add(effectiveOf(`eff.${n}`, t.ratePercent, 4));
    add(pointsGap(`gap.eff.${n}`, get(`eff.${n}`), get(`avg.${n}`), 4));
    add(pointsGap(`gap.nom.${n}`, get(`x.r${n}`), get(`avg.${n}`), 2));
  });

  // Yardstick 3 — the uniform basket (half fixed unlinked, half prime), same loan, same term, same scenario.
  add(given("b.r1", BASKET_3[0].ratePercent));
  add(given("b.r2", BASKET_3[1].ratePercent));
  adds(measureFacts("b", BASKET_3));
  add(difference("bx.first", get("b.first"), get("x.first")));
  add(difference("bx.total", get("b.total"), get("x.total")));
  add(difference("bx.high", get("x.high"), get("b.high")));
  add(difference("bx.total_s", get("x.total_s"), get("b.total_s")));
  // The same basket over a longer term: a different basis.
  adds(measureFacts("b360", withTerm(BASKET_3, 360)));
  add(difference("b360.first_gap", get("x.first"), get("b360.first")));
  add(difference("b360.total_gap", get("b360.total"), get("x.total")));

  // Yardstick 4 — another bank's offer on the same mix (same amounts, same terms).
  MIX_B.forEach((t, k) => add(given(`y.r${k + 1}`, t.ratePercent)));
  adds(measureFacts("y", MIX_B));
  add(difference("yx.first", get("x.first"), get("y.first")));
  add(difference("yx.high", get("x.high"), get("y.high")));
  add(difference("yx.total", get("x.total"), get("y.total")));
  add(difference("yx.total_s", get("x.total_s"), get("y.total_s")));
  add(difference("goal.y_room", get("goal.high_max"), get("y.high")));
  // The same offer over a longer term: a different basis.
  adds(measureFacts("y360", withTerm(MIX_B, 360)));
  add(difference("y360.first_gap", get("x.first"), get("y360.first")));
  add(difference("y360.total_gap", get("y360.total"), get("x.total")));

  // Which candidate wins which goal: three simple measures over bank א׳, bank ב׳ and the basket.
  add(argMinFact("win.first", [get("x.first"), get("y.first"), get("b.first")]));
  add(argMinFact("win.high", [get("x.high"), get("y.high"), get("b.high")]));
  add(argMinFact("win.total", [get("x.total"), get("y.total"), get("b.total")]));

  void TRACK_LABELS;
  return {
    lesson: "5.9",
    title: "האם התמהיל טוב?",
    note: "Invented household, invented rates and invented averages (labelled illustrative). The rise of the changing rates is a teaching scenario, not a forecast. Measures via metrics.ts on the statement convention.",
    facts,
  };
}
