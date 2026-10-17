/**
 * The ranking rules of lesson 8.21's pipeline, and the probability model it uses: small, pure, and light enough for the
 * page's illustration to run in the browser. (pipeline.ts runs the heavy stages and re-exports these.)
 *
 * LABEL: a TEACHING MODEL, "עתיד": Mogi has no such code. The probability is lesson 8.19's SYNTHETIC model taken as if
 * calibrated (k = 1; Mogi has no approvals data); the threshold and the ranking rule are the course's, for illustration.
 *
 *   approvalProbability(ratio, ltv, decision, params?)   logistic(k · (a + b·(40 − ratio)/10 + c·(60 − ltv)/10)), six decimals; 0 when the bank refuses
 *   rankRows(rows, threshold)   rows {id, decision, total, p}: group 1 = approved with p at or above the threshold, 2 = approved below it,
 *                               3 = refused; rank by group, then total paid (lower first), then the order of the list; a refusal has none
 *   explain(rows, ranked)       "first" | "dearer" | "below_threshold" | "refused" for each row
 *
 * Recomputed independently in checks/kinds/pipeline.py.
 */
import Decimal from "decimal.js";
import { type ApprovalParams, DEMO_APPROVAL, logistic } from "./calibration.ts";

export const RANK_THRESHOLD = "0.55";
/** The "calibrated" model: lesson 8.19's true-chance function (k = 1), standing for a probability that has been calibrated on data. */
export const CALIBRATED: ApprovalParams = { ...DEMO_APPROVAL, k: "1" };

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

/** logistic(k × (a + b·(40 − ratio)/10 + c·(60 − ltv)/10)); the bank's refusal makes it 0. Ratio and ltv are percent strings as shown. */
export function approvalProbability(ratio: Decimal.Value, ltv: Decimal.Value, decision: "approve" | "refuse", params: ApprovalParams = CALIBRATED): string {
  if (decision === "refuse") return "0.000000";
  const z = new D(params.a).plus(new D(params.b).mul(new D(40).minus(ratio)).div(10)).plus(new D(params.c).mul(new D(60).minus(ltv)).div(10));
  return logistic(z.mul(params.k));
}

export interface RankInput {
  id: string;
  decision: "approve" | "refuse";
  /** Total paid, shekels, under the base scenario. */
  total: string;
  p: string;
}
export interface RankOutput {
  id: string;
  /** 1: approved with a chance at or above the threshold; 2: approved below it; 3: refused. */
  group: 1 | 2 | 3;
  rank: number | null;
}

/** Group, then total paid (lower first), then the order of the list. A refusal has no rank. */
export function rankRows(rows: RankInput[], threshold: Decimal.Value = RANK_THRESHOLD): RankOutput[] {
  const group = (r: RankInput): 1 | 2 | 3 => (r.decision === "refuse" ? 3 : new D(r.p).gte(threshold) ? 1 : 2);
  const order = rows
    .map((r, i) => ({ r, i, g: group(r) }))
    .filter((x) => x.g !== 3)
    .sort((a, b) => a.g - b.g || new D(a.r.total).cmp(b.r.total) || a.i - b.i);
  const rank = new Map(order.map((x, k) => [x.r.id, k + 1]));
  return rows.map((r) => ({ id: r.id, group: group(r), rank: rank.get(r.id) ?? null }));
}

export type Why = "refused" | "below_threshold" | "dearer" | "first";
/** For each row: why it is where it is, relative to the first. */
export function explain(rows: RankInput[], ranked: RankOutput[]): { id: string; why: Why }[] {
  return ranked.map((r) => ({ id: r.id, why: r.rank === 1 ? "first" : r.group === 3 ? "refused" : r.group === 2 ? "below_threshold" : "dearer" }));
}

