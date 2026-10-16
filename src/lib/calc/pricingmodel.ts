/**
 * A small pricing model — "anchor plus margin, with steps around thresholds".
 * Lesson 8.17 (the model), and 8.18–8.21 (estimating, calibrating, using it).
 *
 * WHAT THIS IS. A SHAPE the course teaches, with SYNTHETIC numbers. It is not a
 * bank's pricing and not a Mogi model. How a bank really prices is unknown to
 * the course: the field says the margin used to be the same for every file and
 * once varied with the customer and the financing ratio (FK-H-050), and that a
 * change in the mix can change the rates a bank offers (FK-H-057); both are
 * hypotheses awaiting Eylon. Every base, step and threshold below is invented
 * for illustration (להדגמה). Where a threshold sits at a number the
 * regulation uses (40, 60, 75) it is there because the lessons about those
 * lines already exist, not because any bank prices at them.
 *
 * THE MODEL. A track's rate is  r = A + s  (the letters of lessons 2.1–4.12:
 * A the anchor, s the spread, here called the margin), and the margin is
 *
 *     margin = base + (step for the financing ratio) + (step for the payment ratio)
 *
 * Each step is a table of thresholds: the margin gets the amount of the HIGHEST
 * threshold the value is strictly above (above 40 means 40.01, not 40), and 0
 * when it is above none. So the margin is flat between thresholds and jumps at
 * them. All margins and rates are percent / percentage points, as strings with
 * two decimals ("1.15").
 *
 *   marginOf(model, deal)            the margin for a financing ratio and a payment ratio
 *   rateOf(anchor, model, deal)      anchor + margin
 *   stepSize(steps, from, to)        how much a step table adds going from one value to another
 *   whatIf(anchor, model, deal, change)   before, after and the difference: "what if more equity"
 *   syntheticOffers(model, n, rng, noiseBp)   n made-up offers (margin = model + noise)
 *   fitError(model, offers)          mean absolute error of the model against the offers
 *
 * The generator takes any random source with int(n) (a whole number from 0 to
 * n − 1); the lessons pass the course's one seeded generator, so a run is
 * reproducible. Noise is a whole number of basis points (0.01 of a percentage
 * point). Recomputed independently in checks/kinds/pricingmodel.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);

export interface Step {
  /** The value the threshold sits at; the step applies strictly above it. */
  above: string;
  /** The margin (percentage points) in this band, counted from zero, not on top of the band below. */
  add: string;
}

export interface PricingModel {
  /** The margin when no step applies, percentage points. */
  base: string;
  /** Financing ratio (percent of the property's value), thresholds ascending. */
  ltv: Step[];
  /** Payment ratio (percent of disposable income), thresholds ascending. */
  pti: Step[];
}

export interface Deal {
  ltv: Numeric;
  pti: Numeric;
}

const two = (v: Numeric) => {
  const r = new D(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  return r.isZero() ? "0.00" : r.toFixed(2);
};

/** What a step table adds at a value: the highest threshold it is strictly above, else 0. */
export function stepAt(steps: Step[], value: Numeric): string {
  const v = new D(value);
  let add = ZERO;
  for (const s of steps) if (v.gt(s.above)) add = new D(s.add);
  return two(add);
}

export function marginOf(model: PricingModel, deal: Deal): string {
  return two(new D(model.base).plus(stepAt(model.ltv, deal.ltv)).plus(stepAt(model.pti, deal.pti)));
}

export function rateOf(anchor: Numeric, model: PricingModel, deal: Deal): string {
  return two(new D(anchor).plus(marginOf(model, deal)));
}

/** How much a step table adds on going from `from` to `to` (negative when it falls). */
export function stepSize(steps: Step[], from: Numeric, to: Numeric): string {
  return two(new D(stepAt(steps, to)).minus(stepAt(steps, from)));
}

export interface WhatIf {
  before: { margin: string; rate: string };
  after: { margin: string; rate: string };
  /** after − before, percentage points. */
  change: string;
}

export function whatIf(anchor: Numeric, model: PricingModel, deal: Deal, change: Partial<Deal>): WhatIf {
  const after = { ...deal, ...change };
  const b = marginOf(model, deal);
  const a = marginOf(model, after);
  return {
    before: { margin: b, rate: rateOf(anchor, model, deal) },
    after: { margin: a, rate: rateOf(anchor, model, after) },
    change: two(new D(a).minus(b)),
  };
}

/** The random source the generator needs: a whole number from 0 to n − 1. */
export interface IntSource {
  int(n: number): number;
}

export interface Offer {
  ltv: string;
  pti: string;
  /** Observed margin, percentage points, two decimals. */
  margin: string;
}

/**
 * n made-up offers. For each: financing ratio a whole number from `ltvRange[0]` to `ltvRange[1]`,
 * payment ratio likewise, noise a whole number of basis points in [−noiseBp, +noiseBp].
 * The draws go in this order for every offer: ltv, pti, noise (so the checker can repeat them).
 */
export function syntheticOffers(
  model: PricingModel,
  n: number,
  rng: IntSource,
  noiseBp: number,
  ltvRange: [number, number] = [30, 75],
  ptiRange: [number, number] = [20, 50],
): Offer[] {
  const out: Offer[] = [];
  for (let k = 0; k < n; k++) {
    const ltv = ltvRange[0] + rng.int(ltvRange[1] - ltvRange[0] + 1);
    const pti = ptiRange[0] + rng.int(ptiRange[1] - ptiRange[0] + 1);
    const noise = rng.int(2 * noiseBp + 1) - noiseBp;
    out.push({ ltv: String(ltv), pti: String(pti), margin: two(new D(marginOf(model, { ltv, pti })).plus(new D(noise).div(100))) });
  }
  return out;
}

/** Mean of |model − observed| over the offers, in percentage points, four decimals. */
export function fitError(model: PricingModel, offers: Offer[]): string {
  if (offers.length === 0) throw new RangeError("no offers");
  const sum = offers.reduce((s, o) => s.plus(new D(marginOf(model, o)).minus(o.margin).abs()), ZERO);
  return sum.div(offers.length).toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed(4);
}

/** The model of the lessons, in one place so lessons, components and checks agree. Invented. */
export const DEMO_MODEL: PricingModel = {
  base: "0.80",
  ltv: [
    { above: "40", add: "0.10" },
    { above: "60", add: "0.35" },
  ],
  pti: [{ above: "40", add: "0.25" }],
};

/** The anchor of the lessons' example (percent a year). Invented. */
export const DEMO_ANCHOR = "4.20";
