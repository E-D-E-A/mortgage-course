/**
 * Lesson 8.17 — a pricing model: anchor plus margin, with steps around thresholds.
 *
 * The SHAPE is the lesson; every number is synthetic and for illustration. The model of src/lib/calc/pricingmodel.ts
 * (DEMO_MODEL: base 0.80; financing over 40% +0.10, over 60% +0.35; payment ratio over 40% +0.25; the anchor 4.20%).
 * Facts: the margin and rate of deals and what-ifs (pm_*, checks/kinds/pricingmodel.py); a separate example deal (not case A)
 * whose rate steps down when extra equity brings the financing ratio to 60%, and what that does to the payment (stage-3
 * module, checked by metrics.py); sixty synthetic offers from the course's seeded generator, with the error of three models.
 */
import { DEMO_ANCHOR, DEMO_MODEL, type PricingModel } from "../../src/lib/calc/pricingmodel.ts";
import type { Fact, LessonData } from "../build-data.ts";
import { difference, first, total, given as given38 } from "./lesson-3-8.ts";
import { ltv as ltvFact } from "./regulation-facts.ts";
import { GEN, NO_STEPS, START } from "../../src/data/pricing-demo.ts";
import { pmFit, pmMargin, pmOffers, pmRate, pmStepSize, pmWhatIf } from "./_s8c-facts.ts";

export const YEARS = 25;

export default function lesson817(): LessonData {
  const facts: Fact[] = [];
  const push = (...f: Fact[]) => facts.push(...f);
  const byId = (id: string) => facts.find((x) => x.id === id) as Fact;
  const v = (id: string) => byId(id).value as string;
  const M = DEMO_MODEL;

  push(given38("anchor", DEMO_ANCHOR), given38("base", M.base), given38("pti.threshold", M.pti[0].above), given38("th.40", M.ltv[0].above), given38("th.60", M.ltv[1].above));
  push(given38("step.40", M.ltv[0].add), given38("step.60", M.ltv[1].add), given38("step.pti", M.pti[0].add));

  // ── An example deal (NOT case A): price 1,800,000 ₪, a loan at 64% financing, a payment ratio of 36%. ──
  push(given38("d.price", "1800000"), given38("d.loan1", "1152000"), given38("d.loan2", "1080000"), given38("d.pti", "36"), given38("d.years", String(YEARS)));
  push(ltvFact("d.ltv1", v("d.loan1"), v("d.price")), ltvFact("d.ltv2", v("d.loan2"), v("d.price")));
  push(difference("d.equity_added", byId("d.loan1"), byId("d.loan2")));
  push(
    pmMargin("d.margin1", M, v("d.ltv1"), v("d.pti")),
    pmMargin("d.margin2", M, v("d.ltv2"), v("d.pti")),
    pmRate("d.rate1", v("anchor"), M, v("d.ltv1"), v("d.pti")),
    pmRate("d.rate2", v("anchor"), M, v("d.ltv2"), v("d.pti")),
    pmWhatIf("d.whatif", v("anchor"), M, { ltv: 64, pti: 36 }, { ltv: 60 }),
    pmStepSize("d.stepsize", M.ltv, 64, 60),
  );
  const months = YEARS * 12;
  const track = (loan: string, rate: string) => ({ principal: loan, rates: [rate], months });
  push(
    first("d.pay1", [track(v("d.loan1"), v("d.rate1"))]),
    first("d.pay_loan_only", [track(v("d.loan2"), v("d.rate1"))]),
    first("d.pay2", [track(v("d.loan2"), v("d.rate2"))]),
    total("d.total1", [track(v("d.loan1"), v("d.rate1"))]),
    total("d.total2", [track(v("d.loan2"), v("d.rate2"))]),
  );
  push(
    difference("d.pay_drop", byId("d.pay1"), byId("d.pay2")),
    difference("d.pay_drop_loan", byId("d.pay1"), byId("d.pay_loan_only")),
    difference("d.pay_drop_rate", byId("d.pay_loan_only"), byId("d.pay2")),
    difference("d.total_drop", byId("d.total1"), byId("d.total2")),
  );

  // ── Hand tasks: the margin at three deals (one exactly on a threshold). ──
  push(
    pmMargin("ex.m1", M, 45, 42),
    pmMargin("ex.m2", M, 61, 38),
    pmMargin("ex.m2_wrong", M, 61, 45),
    pmMargin("ex.m3", M, 60, 40),
    pmRate("ex.r1", v("anchor"), M, 61, 38),
    pmWhatIf("ex.w", v("anchor"), M, { ltv: 70, pti: 45 }, { ltv: 60 }),
    pmMargin("ex.m4", M, 35, 45),
    pmMargin("ex.m5", M, 35, 30),
    pmWhatIf("ex.w_pti", v("anchor"), M, { ltv: 55, pti: 42 }, { pti: 40 }),
  );

  // ── Sixty synthetic offers and three models' errors against them. ──
  push(
    pmOffers("data.offers", M, GEN),
    pmFit("fit.truth", M, GEN, M),
    pmFit("fit.start", M, GEN, START),
    pmFit("fit.flat", M, GEN, NO_STEPS),
    given38("flat.base", NO_STEPS.base),
  );
  push(given38("gen.n", String(GEN.n)), given38("gen.noise", String(GEN.noiseBp)));

  return {
    lesson: "8.17",
    title: "מודל תמחור: עוגן ועוד מרווח, ומדרגות סביב ספים",
    note: "Synthetic. A teaching SHAPE, not a bank's pricing and not a Mogi model: margin = base 0.80 + a step for the financing ratio (over 40%: +0.10, over 60%: +0.35) + a step for the payment ratio (over 40%: +0.25), strictly above each threshold; the anchor is 4.20%. The example deal (1,800,000 ₪, 64% then 60% financing, payment ratio 36%, 25 years) is separate from case A. The sixty offers are made by the course's seeded generator (mulberry32) from the demo model plus noise of up to 6 basis points; the three models' errors are mean absolute differences.",
    facts,
  };
}
