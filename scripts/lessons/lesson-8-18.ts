/**
 * Lesson 8.18 — estimating from data: regression, the uncertainty of an estimate, and little data (a prior that updates).
 *
 * Data: sixty SYNTHETIC offers from the course's seeded generator (pricingmodel.ts, mulberry32), made by a model with ONE
 * clear step (financing over 60% adds 0.40 to a base of 0.80) plus noise of up to 8 basis points. We know the truth only
 * because we made it; the lesson says so. Facts: a hand-sized interval for a mean; the interval's width against the number
 * of observations; the least-squares slope with its interval; a line against a step model; the step estimated from the first
 * 8, 12, 20, 30 and 60 offers, with its interval and the posterior of an invented prior (est_*, checks/kinds/estimate.py,
 * which writes the generator again in Python).
 */
import { GEN2, HAND, HAND_ABOVE, HAND_BELOW, ONE_STEP, PRIOR } from "../../src/data/pricing-demo.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { given as given38 } from "./lesson-3-8.ts";
import { estLineVsStep, estMean, estPosterior, estSlopeData, estStep, estUpdate, estWidth, pmOffers } from "./_s8c-facts.ts";

export const NS = [8, 12, 20, 30, 60];

export default function lesson818(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);

  push(given38("t.limit", "1.960"), given38("truth.step", ONE_STEP.ltv[0].add), given38("truth.base", ONE_STEP.base), given38("thr", "60"));
  push(given38("prior.mean", PRIOR.mean), given38("prior.sd", PRIOR.sd), given38("gen.noise", String(GEN2.noiseBp)), given38("gen.n", String(GEN2.n)));
  push(pmOffers("data.offers", ONE_STEP, GEN2));

  // A hand-sized interval: five margins.
  push(estMean("hand.mean", HAND));
  push(estStep("hand.step", HAND_BELOW, HAND_ABOVE));
  // How the width falls with the number of observations (the spread fixed at 0.10).
  push(given38("w.sd", "0.10"));
  for (const n of [5, 20, 100, 400]) push(estWidth(`w.${n}`, "0.10", n));
  // The slope of the whole data set, and the line against the step model.
  push(estSlopeData("slope", ONE_STEP, GEN2), estLineVsStep("line_vs_step", ONE_STEP, GEN2, 60));
  // The step from the first n offers, with the prior.
  for (const n of NS) push(estPosterior(`chain.${n}`, ONE_STEP, GEN2, n, 60, PRIOR));
  // The prior's weight at four equal-quality data sets (a clean illustration of the weights).
  push(estUpdate("upd.0", PRIOR, 0, "0.40", "0.20"), estUpdate("upd.4", PRIOR, 4, "0.40", "0.20"), estUpdate("upd.16", PRIOR, 16, "0.40", "0.20"), estUpdate("upd.64", PRIOR, 64, "0.40", "0.20"));
  push(given38("upd.data_mean", "0.40"), given38("upd.data_sd", "0.20"));

  return {
    lesson: "8.18",
    title: "אמידה מנתונים: רגרסיה, אי־ודאות של אומדן, ודאטה מועטה",
    note: "Synthetic. Sixty offers made by the course's seeded generator from a model with one step (financing over 60%: +0.40, base 0.80) plus noise of up to 8 basis points; we know the true step only because we made it. 95% two-sided t values (df 1-10, 15, 20, 30, 60, 120, infinity; between two rows the lower row is used: cautious). The prior (mean 0.25, sd 0.08) is an invented assumption standing for 'a published average'. The data enters the update as one observation whose spread is the estimate's standard error.",
    facts,
  };
}
