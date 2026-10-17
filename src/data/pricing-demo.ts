/** Lesson 8.17's demo settings (author C): the generator's settings and the learner's starting model. Synthetic; illustration only. */
import type { PricingModel } from "../lib/calc/pricingmodel.ts";

export interface GenSpec {
  seed: number;
  n: number;
  noiseBp: number;
}
/** Sixty offers, seed 17, noise up to 6 basis points. */
export const GEN: GenSpec = { seed: 17, n: 60, noiseBp: 6 };
/** Where the sliders of the pricing illustration start: a model that is wrong on purpose. */
export const START: PricingModel = {
  base: "0.90",
  ltv: [{ above: "40", add: "0.05" }, { above: "60", add: "0.15" }],
  pti: [{ above: "40", add: "0.05" }],
};
/** A model with no steps at all, to show what steps buy. */
export const NO_STEPS: PricingModel = { base: "1.10", ltv: [{ above: "40", add: "0.00" }, { above: "60", add: "0.00" }], pti: [{ above: "40", add: "0.00" }] };

/** Lesson 8.18's data: ONE clear step (financing over 60% adds 0.40), nothing else; sixty offers, seed 23, noise up to 8 basis points. */
export const ONE_STEP: PricingModel = { base: "0.80", ltv: [{ above: "60", add: "0.40" }], pti: [] };
export const GEN2: GenSpec = { seed: 23, n: 60, noiseBp: 8 };
/** The starting belief about the step, before any data (an invented assumption, "from market averages"). */
export const PRIOR = { mean: "0.25", sd: "0.08" };

/** Lesson 8.19's applicants: 2,000 synthetic applicants from seed 31 (calibration.ts's generator, an over-confident model). */
export const APPROVALS = { seed: 31, n: 2000 };

/** Lesson 8.18, the hand-sized examples: five margins for a mean, and three offers each side of the threshold for a step. */
export const HAND = ["0.84", "0.90", "0.88", "0.93", "0.85"];
export const HAND_BELOW = ["0.80", "0.82", "0.78"];
export const HAND_ABOVE = ["1.18", "1.22", "1.25"];
