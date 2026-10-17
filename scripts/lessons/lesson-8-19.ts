/**
 * Lesson 8.19 — the probability of approval, and calibration.
 *
 * Mogi has NO approvals data. The lesson therefore uses 2,000 SYNTHETIC applicants made by calibration.ts's seeded
 * generator: a made-up TRUE chance of approval from the financing ratio and the payment ratio, and an over-confident MODEL
 * (its score is 1.6 times the true one). The reliability table (bins of predicted probability against what happened), the
 * scores, the same table from 100 applicants (to show how noisy a thin table is), and a recalibration learned on the first
 * half and judged on the second are the facts (cal_*, checks/kinds/calibration.py, which writes the generator again).
 */
import { APPROVALS } from "../../src/data/pricing-demo.ts";
import { DEMO_APPROVAL } from "../../src/lib/calc/calibration.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given as given38 } from "./lesson-3-8.ts";
import { calApplicants, calBrier, calBrierData, calGap, calGapData, calLogistic, calRecal, calTable, calTableData } from "./_s8c-facts.ts";

export default function lesson819(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const { seed, n } = APPROVALS;

  push(given38("k", DEMO_APPROVAL.k), given38("n", String(n)), given38("seed", String(seed)));
  // One applicant by hand: financing 55%, payment ratio 35%: true score 0.4 + 0.5·(40−35)/10 + 0.3·(60−55)/10 = 0.80; the model's is 1.6 times that.
  push(
    given38("ex.ltv", "55"),
    given38("ex.pti", "35"),
    given38("ex.z", "0.80"),
    given38("ex.zm", "1.28"),
    calLogistic("ex.truth", "0.80"),
    calLogistic("ex.pred", "1.28"),
    calLogistic("log.0", "0"),
    calLogistic("log.2", "2"),
    calLogistic("log.m2", "-2"),
  );
  push(calApplicants("people", seed, n, 6));
  push(calTable("table10", seed, n, 10), calBrier("brier", seed, n), calGap("gap10", seed, n, 10));
  push(calTable("table5", seed, n, 5), calGap("gap5", seed, n, 5));
  // The same model on only 100 applicants: a thin table.
  push(calTable("thin5", seed, 100, 5), calGap("thin_gap5", seed, 100, 5));
  // Recalibration: learn on the first 1,000, judge on the next 1,000 (bins of 0.1, at least 30 cases per bin to trust it).
  push(calRecal("recal", seed, n, 10, 1000, 30), calRecal("recal_small", seed, 300, 10, 100, 30));
  push(given38("recal.min", "30"));
  // A hand-sized set: ten predictions, five of 0.8 (three approved) and five of 0.4 (two approved).
  const HAND: [string, 0 | 1][] = [["0.8", 1], ["0.8", 1], ["0.8", 1], ["0.8", 0], ["0.8", 0], ["0.4", 1], ["0.4", 0], ["0.4", 0], ["0.4", 1], ["0.4", 0]];
  push(calTableData("hand.table", HAND, 5), calBrierData("hand.brier", HAND), calGapData("hand.gap", HAND, 5));
  return {
    lesson: "8.19",
    title: "הסתברות לאישור, וכיול",
    note: "Synthetic. 2,000 applicants made by the course's seeded generator (mulberry32): financing 30-75%, payment ratio 20-50%; the TRUE chance of approval is logistic(0.4 + 0.5·(40 − payment ratio)/10 + 0.3·(60 − financing)/10); the MODEL's chance is logistic of 1.6 times the same score (over-confident). Mogi has no approvals data; a calibrated probability needs data Mogi does not have yet. Bins are [lo, hi) except the last; rates at four decimals.",
    facts,
  };
}
