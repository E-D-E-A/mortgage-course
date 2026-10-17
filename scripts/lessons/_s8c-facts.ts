/**
 * Fact builders for stage 8, author C (lessons 8.15–8.21). Each builder computes its value with the module in
 * src/lib/calc and names a kind that a file in checks/kinds recomputes on its own (lp.py, frontier.py,
 * pricingmodel.py, estimate.py, calibration.py, pipeline.py). Not a lesson module: build-data.ts loads only
 * lesson-*.ts and check-*.ts.
 */
import Decimal from "decimal.js";
import { recalibrate, type ApprovalParams, DEMO_APPROVAL, equalEdges, logistic, reliabilityTable, brierScore, calibrationGap, syntheticApplicants, toScored, applyCalibrator, binCalibrator } from "../../src/lib/calc/calibration.ts";
import { frontier, pickByWeights, reachable } from "../../src/lib/calc/frontier.ts";
import { type Condition, solveLp, allCrossings, objectiveAt, valleys } from "../../src/lib/calc/lp.ts";
import type { Row } from "../../src/lib/calc/objectives.ts";
import { type PricingModel, marginOf, rateOf, stepSize, whatIf, syntheticOffers, fitError, seededInts, type Step } from "../../src/lib/calc/pricingmodel.ts";
import { stepFromOffers, intervalWidth, lineVersusStep, meanInterval, slopeInterval, stepEstimate, updateNormal } from "../../src/lib/calc/estimate.ts";
import type { Fact } from "../build-data.ts";

export const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

// ── lp.py ──────────────────────────────────────────────────────────────────
const condText = (cs: Condition[]) => cs.map((c) => `${c.label}:${c.a[0]}:${c.a[1]}:${c.b}`).join(";");
const lpInputs = (c: [string, string], goal: "min" | "max", cs: Condition[], decimals = 2) => ({ c1: c[0], c2: c[1], goal, conditions: condText(cs), ...(decimals !== 2 ? { decimals } : {}) });

export const lpSolve = (id: string, c: [string, string], goal: "min" | "max", cs: Condition[], decimals = 2): Fact => ({ id, kind: "lp_solve", inputs: lpInputs(c, goal, cs, decimals), value: solveLp({ c, goal, conditions: cs, decimals }) });
export const lpCrossings = (id: string, c: [string, string], goal: "min" | "max", cs: Condition[], decimals = 2): Fact => ({ id, kind: "lp_crossings", inputs: lpInputs(c, goal, cs, decimals), value: allCrossings({ c, goal, conditions: cs, decimals }) });
export const lpFeasibleCount = (id: string, c: [string, string], goal: "min" | "max", cs: Condition[], decimals = 2): Fact => ({
  id,
  kind: "lp_feasible_count",
  inputs: lpInputs(c, goal, cs, decimals),
  value: allCrossings({ c, goal, conditions: cs, decimals }).filter((x) => x.feasible).length,
});
export const lpValue = (id: string, c: [string, string], x: string, y: string, decimals = 2): Fact => ({ id, kind: "lp_value", inputs: { c1: c[0], c2: c[1], x, y, ...(decimals !== 2 ? { decimals } : {}) }, value: objectiveAt(c, x, y, decimals) });
export const lpValleys = (id: string, values: string[], start: number): Fact => ({ id, kind: "lp_valleys", inputs: { values: values.join(","), start }, value: valleys(values, start) });

// ── frontier.py ────────────────────────────────────────────────────────────
export const rowsText = (rows: Row[]) => rows.map((r) => `${r.id}:${r.values.map((v) => new Decimal(v).toString()).join(":")}:${r.feasible ? 1 : 0}`).join(";");
export const frFront = (id: string, rows: Row[], use?: number[]): Fact => ({
  id,
  kind: "fr_front",
  inputs: { rows: rowsText(rows), ...(use ? { use: use.join(",") } : {}) },
  value: frontier(rows, use).map((r) => ({ id: r.id, efficient: r.efficient, dominatedBy: r.dominatedBy, dominatesCount: r.dominatesCount })),
});
export const frCount = (id: string, rows: Row[], what: "efficient" | "dominated" | "feasible", use?: number[]): Fact => {
  const fr = frontier(rows, use);
  const value = what === "efficient" ? fr.filter((r) => r.efficient).length : what === "dominated" ? fr.filter((r) => r.feasible && !r.efficient).length : rows.filter((r) => r.feasible).length;
  return { id, kind: "fr_count", inputs: { rows: rowsText(rows), what, ...(use ? { use: use.join(",") } : {}) }, value };
};
export const frPick = (id: string, rows: Row[], weights: number[]): Fact => {
  const p = pickByWeights(rows, weights);
  return { id, kind: "fr_pick", inputs: { rows: rowsText(rows), weights: weights.join(",") }, value: { id: p?.id, efficient: p?.efficient } };
};
export const frReach = (id: string, rows: Row[], step: number): Fact => {
  const r = reachable(rows, step);
  return { id, kind: "fr_reach", inputs: { rows: rowsText(rows), step }, value: { wins: r.wins, never: r.never } };
};

export const frNeverCount = (id: string, rows: Row[], step: number): Fact => ({ id, kind: "fr_never_count", inputs: { rows: rowsText(rows), step }, value: reachable(rows, step).never.length });

// ── pricingmodel.py ────────────────────────────────────────────────────────
const stepsText = (s: Step[]) => s.map((x) => `${x.above}:${x.add}`).join(";");
export const modelInputs = (m: PricingModel) => ({ base: m.base, ltv_steps: stepsText(m.ltv), pti_steps: stepsText(m.pti) });
export const pmMargin = (id: string, m: PricingModel, ltv: number | string, pti: number | string): Fact => ({ id, kind: "pm_margin", inputs: { ...modelInputs(m), ltv, pti }, value: marginOf(m, { ltv, pti }) });
export const pmRate = (id: string, anchor: string, m: PricingModel, ltv: number | string, pti: number | string): Fact => ({ id, kind: "pm_rate", inputs: { ...modelInputs(m), anchor, ltv, pti }, value: rateOf(anchor, m, { ltv, pti }) });
export const pmStepSize = (id: string, steps: Step[], frm: number, to: number): Fact => ({ id, kind: "pm_stepsize", inputs: { steps: stepsText(steps), frm, to }, value: stepSize(steps, frm, to) });
export const pmWhatIf = (id: string, anchor: string, m: PricingModel, deal: { ltv: number; pti: number }, change: { ltv?: number; pti?: number }): Fact => ({
  id,
  kind: "pm_whatif",
  inputs: { ...modelInputs(m), anchor, ltv: deal.ltv, pti: deal.pti, ...(change.ltv !== undefined ? { new_ltv: change.ltv } : {}), ...(change.pti !== undefined ? { new_pti: change.pti } : {}) },
  value: whatIf(anchor, m, deal, change),
});
export interface GenSpec {
  seed: number;
  n: number;
  noiseBp: number;
}
export const offersOf = (m: PricingModel, g: GenSpec) => syntheticOffers(m, g.n, seededInts(g.seed), g.noiseBp);
export const pmFit = (id: string, truth: PricingModel, g: GenSpec, model: PricingModel): Fact => ({
  id,
  kind: "pm_fit",
  // The offers are made with `truth` and the error is measured for `model`: the checker reads both.
  inputs: { ...modelInputs(model), truth_base: truth.base, truth_ltv_steps: stepsText(truth.ltv), truth_pti_steps: stepsText(truth.pti), seed: g.seed, n: g.n, noise_bp: g.noiseBp },
  value: fitError(model, offersOf(truth, g)),
});
export const pmOffers = (id: string, truth: PricingModel, g: GenSpec): Fact => ({
  id,
  kind: "pm_offers",
  inputs: { ...modelInputs(truth), seed: g.seed, n: g.n, noise_bp: g.noiseBp },
  value: offersOf(truth, g),
});

// ── estimate.py ────────────────────────────────────────────────────────────
export const estMean = (id: string, values: string[]): Fact => ({ id, kind: "est_mean_interval", inputs: { values: values.join(",") }, value: meanInterval(values) });
export const estStep = (id: string, below: string[], above: string[]): Fact => ({ id, kind: "est_step", inputs: { below: below.join(","), above: above.join(",") }, value: stepEstimate(below, above) });
export const estSlope = (id: string, pts: { x: string; y: string }[]): Fact => ({ id, kind: "est_slope", inputs: { xs: pts.map((p) => p.x).join(","), ys: pts.map((p) => p.y).join(",") }, value: slopeInterval(pts) });
export const estUpdate = (id: string, prior: { mean: string; sd: string }, n: number, dataMean: string, dataSd: string): Fact => ({
  id,
  kind: "est_update",
  inputs: { prior_mean: prior.mean, prior_sd: prior.sd, n, data_mean: dataMean, data_sd: dataSd },
  value: updateNormal(prior, n, dataMean, dataSd),
});
export const estWidth = (id: string, sd: string, n: number): Fact => ({ id, kind: "est_width", inputs: { sd, n }, value: intervalWidth(sd, n) });
export const estLineVsStep = (id: string, truth: PricingModel, g: GenSpec, thr: number): Fact => ({
  id,
  kind: "est_line_vs_step",
  inputs: { ...modelInputs(truth), seed: g.seed, n: g.n, noise_bp: g.noiseBp, thr },
  value: lineVersusStep(offersOf(truth, g), thr),
});

// ── calibration.py ─────────────────────────────────────────────────────────
export const calLogistic = (id: string, z: string): Fact => ({ id, kind: "cal_logistic", inputs: { z }, value: logistic(z) });
const genInputs = (seed: number, n: number, p: ApprovalParams = DEMO_APPROVAL) => ({ seed, n, a: p.a, b: p.b, c: p.c, k: p.k });
export const calTable = (id: string, seed: number, n: number, bins: number): Fact => ({
  id,
  kind: "cal_table",
  inputs: { ...genInputs(seed, n), bins },
  value: reliabilityTable(toScored(syntheticApplicants(seed, n)), equalEdges(bins)),
});
export const calBrier = (id: string, seed: number, n: number): Fact => ({ id, kind: "cal_brier", inputs: genInputs(seed, n), value: brierScore(toScored(syntheticApplicants(seed, n))) });
export const calGap = (id: string, seed: number, n: number, bins: number): Fact => ({ id, kind: "cal_gap", inputs: { ...genInputs(seed, n), bins }, value: calibrationGap(toScored(syntheticApplicants(seed, n)), equalEdges(bins)) });
export { applyCalibrator, binCalibrator, equalEdges, reliabilityTable, syntheticApplicants, toScored };

// ── est_posterior, est_slope_data ──────────────────────────────────────────
export const estPosterior = (id: string, truth: PricingModel, g: GenSpec, n: number, thr: number, prior: { mean: string; sd: string }): Fact => ({
  id,
  kind: "est_posterior",
  inputs: { ...modelInputs(truth), seed: g.seed, n, noise_bp: g.noiseBp, thr, prior_mean: prior.mean, prior_sd: prior.sd },
  value: stepFromOffers(offersOf(truth, { ...g, n }), thr, prior),
});
export const estSlopeData = (id: string, truth: PricingModel, g: GenSpec): Fact => ({
  id,
  kind: "est_slope_data",
  inputs: { ...modelInputs(truth), seed: g.seed, n: g.n, noise_bp: g.noiseBp },
  value: slopeInterval(offersOf(truth, g).map((o) => ({ x: o.ltv, y: o.margin }))),
});

export const calRecal = (id: string, seed: number, n: number, bins: number, train: number, minPerBin: number): Fact => {
  const r = recalibrate(toScored(syntheticApplicants(seed, n)), train, equalEdges(bins), minPerBin);
  return { id, kind: "cal_recal", inputs: { ...genInputs(seed, n), bins, train, min_per_bin: minPerBin }, value: { trained: r.trained, tested: r.tested, before: r.before, after: r.after } };
};
export const calApplicants = (id: string, seed: number, n: number, show: number): Fact => ({
  id,
  kind: "cal_applicants",
  inputs: { ...genInputs(seed, n), show },
  value: syntheticApplicants(seed, n)
    .slice(0, show)
    .map((a) => ({ ltv: a.ltv, pti: a.pti, truth: a.truth, p: a.p, outcome: a.outcome })),
});

// Hand-sized data sets: "p:o,p:o,…" inline (the checker parses the same text).
const dataText = (d: [string, 0 | 1][]) => d.map(([p, o]) => `${p}:${o}`).join(",");
const scoredOf = (d: [string, 0 | 1][]) => d.map(([p, outcome]) => ({ p, outcome }));
export const calTableData = (id: string, d: [string, 0 | 1][], bins: number): Fact => ({ id, kind: "cal_table", inputs: { data: dataText(d), bins }, value: reliabilityTable(scoredOf(d), equalEdges(bins)) });
export const calBrierData = (id: string, d: [string, 0 | 1][]): Fact => ({ id, kind: "cal_brier", inputs: { data: dataText(d) }, value: brierScore(scoredOf(d)) });
export const calGapData = (id: string, d: [string, 0 | 1][], bins: number): Fact => ({ id, kind: "cal_gap", inputs: { data: dataText(d), bins }, value: calibrationGap(scoredOf(d), equalEdges(bins)) });

// ── pipeline.py ────────────────────────────────────────────────────────────
import { approvalProbability, CALIBRATED, explain, rankRows, type RankInput } from "../../src/lib/calc/pipeline.ts";
export const pipeProb = (id: string, ratio: string, ltv: string, decision: "approve" | "refuse"): Fact => ({
  id,
  kind: "pipe_prob",
  inputs: { ratio, ltv, decision, a: CALIBRATED.a, b: CALIBRATED.b, c: CALIBRATED.c, k: CALIBRATED.k },
  value: approvalProbability(ratio, ltv, decision),
});
export const pipeRank = (id: string, rows: RankInput[], threshold: string): Fact => ({
  id,
  kind: "pipe_rank",
  inputs: { rows: rows.map((r) => `${r.id}:${r.decision}:${r.total}:${r.p}`).join(";"), threshold },
  value: rankRows(rows, threshold),
});
export { explain, rankRows };
