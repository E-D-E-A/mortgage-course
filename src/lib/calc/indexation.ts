/**
 * Prices, the consumer price index and indexation — the arithmetic behind
 * lessons 0.7 (inflation and the CPI) and 0.8 (indexation, real and nominal).
 *
 * Every number those lessons show is computed here, written to a data file by
 * scripts/build-data.ts, and recomputed independently in checks/kinds/indexation.py.
 *
 * Index values and rates are exact Decimals. Percentages are given as strings
 * ("3" means 3%), so a rate never passes through a binary float. Rounding
 * happens only for display: money to the agora (money.ts), percentages and
 * index points to two decimal places (`plainNumber`).
 *
 * The index series in the lessons are invented round teaching numbers, never
 * real CPI values.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const ONE = new Decimal(1);
const HUNDRED = new Decimal(100);

export interface BasketItem {
  quantity: Numeric;
  price: Numeric;
}

/** What a basket costs: the sum of quantity × price over its items. */
export function basketCost(items: BasketItem[]): Decimal {
  return items.reduce((sum, item) => sum.plus(new Decimal(item.quantity).mul(item.price)), new Decimal(0));
}

/** The index of a period: what the basket costs now relative to the base period, where the index is 100. */
export function indexValue(cost: Numeric, baseCost: Numeric): Decimal {
  const base = new Decimal(baseCost);
  if (base.lte(0)) throw new RangeError("the base period's cost must be more than zero");
  return new Decimal(cost).div(base).mul(HUNDRED);
}

/** The percent change between two index values (or two prices): (new ÷ old − 1) × 100. */
export function changePercent(oldValue: Numeric, newValue: Numeric): Decimal {
  const old = new Decimal(oldValue);
  if (old.lte(0)) throw new RangeError("the starting value must be more than zero");
  return new Decimal(newValue).div(old).minus(1).mul(HUNDRED);
}

/** The change in index points: new − old. Not a percentage. */
export function indexPoints(oldValue: Numeric, newValue: Numeric): Decimal {
  return new Decimal(newValue).minus(oldValue);
}

/** The index after successive periods of inflation, each given in percent. */
export function chainIndex(baseIndex: Numeric, inflationPercents: Numeric[]): Decimal {
  return inflationPercents.reduce<Decimal>((index, p) => index.mul(ONE.plus(new Decimal(p).div(HUNDRED))), new Decimal(baseIndex));
}

/** An indexed amount: it moves by the same proportion as the index, amount × new index ÷ base index. */
export function indexedAmount(amount: Numeric, baseIndex: Numeric, newIndex: Numeric): Decimal {
  const base = new Decimal(baseIndex);
  if (base.lte(0)) throw new RangeError("the base index must be more than zero");
  return new Decimal(amount).mul(newIndex).div(base);
}

/** An indexed amount after `years` years of the same yearly inflation: amount × (1 + i)^years. */
export function indexedBalance(amount: Numeric, inflationPercent: Numeric, years: number): Decimal {
  assertYears(years);
  return new Decimal(amount).mul(ONE.plus(new Decimal(inflationPercent).div(HUNDRED)).pow(years));
}

/**
 * What a fixed amount of shekels, received after `years` years, is worth in
 * today's shekels when prices rise by the same percent each year: amount ÷ (1 + i)^years.
 */
export function realValue(amount: Numeric, inflationPercent: Numeric, years: number): Decimal {
  assertYears(years);
  return new Decimal(amount).div(ONE.plus(new Decimal(inflationPercent).div(HUNDRED)).pow(years));
}

/** The real rate, exactly: ((1 + nominal) ÷ (1 + inflation) − 1) × 100. */
export function realRate(nominalPercent: Numeric, inflationPercent: Numeric): Decimal {
  const n = ONE.plus(new Decimal(nominalPercent).div(HUNDRED));
  const i = ONE.plus(new Decimal(inflationPercent).div(HUNDRED));
  return n.div(i).minus(1).mul(HUNDRED);
}

/** The approximation people use in their heads: nominal − inflation. */
export function approxRealRate(nominalPercent: Numeric, inflationPercent: Numeric): Decimal {
  return new Decimal(nominalPercent).minus(inflationPercent);
}

/** The nominal rate that gives a wanted real rate: ((1 + real) × (1 + inflation) − 1) × 100. */
export function nominalRate(realPercent: Numeric, inflationPercent: Numeric): Decimal {
  const r = ONE.plus(new Decimal(realPercent).div(HUNDRED));
  const i = ONE.plus(new Decimal(inflationPercent).div(HUNDRED));
  return r.mul(i).minus(1).mul(HUNDRED);
}

export interface IndexationRow {
  /** 1-based year. */
  period: number;
  opening: Decimal;
  /** What indexation adds this year: opening × inflation, rounded to the agora. */
  indexation: Decimal;
  closing: Decimal;
}

/**
 * Year-by-year table of an indexed amount, the way a statement shows it: each
 * year's indexation is rounded to the agora before it is added, so every row
 * adds up. Its last balance can differ from indexedBalance (rounded once) by agorot.
 */
export function indexationTable(amount: Numeric, inflationPercent: Numeric, years: number): IndexationRow[] {
  assertYears(years);
  const rate = new Decimal(inflationPercent).div(HUNDRED);
  const rows: IndexationRow[] = [];
  let balance = new Decimal(amount);
  for (let period = 1; period <= years; period++) {
    const indexation = balance.mul(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    rows.push({ period, opening: balance, indexation, closing: balance.plus(indexation) });
    balance = balance.plus(indexation);
  }
  return rows;
}

// The common mistakes the exercises name, computed so their feedback can quote them.

/** Change measured against the NEW value — the mistake: (new − old) ÷ new × 100. */
export function changeOnNew(oldValue: Numeric, newValue: Numeric): Decimal {
  const next = new Decimal(newValue);
  if (next.lte(0)) throw new RangeError("the new value must be more than zero");
  return next.minus(oldValue).div(next).mul(HUNDRED);
}

/** How much a price fell, as a positive percent: (old − new) ÷ old × 100. */
export function dropPercent(oldValue: Numeric, newValue: Numeric): Decimal {
  return changePercent(oldValue, newValue).neg();
}

/** Dividing by the index ratio instead of multiplying — the mistake: amount × base index ÷ new index. */
export function deflatedAmount(amount: Numeric, baseIndex: Numeric, newIndex: Numeric): Decimal {
  const next = new Decimal(newIndex);
  if (next.lte(0)) throw new RangeError("the new index must be more than zero");
  return new Decimal(amount).mul(baseIndex).div(next);
}

/** Dividing the gap by the nominal growth — the mistake: (1 − (1 + inflation) ÷ (1 + nominal)) × 100. */
export function realRateOverNominal(nominalPercent: Numeric, inflationPercent: Numeric): Decimal {
  const n = ONE.plus(new Decimal(nominalPercent).div(HUNDRED));
  const i = ONE.plus(new Decimal(inflationPercent).div(HUNDRED));
  return ONE.minus(i.div(n)).mul(HUNDRED);
}

/** A percentage or index value for display: at most two decimals, no trailing zeros ("3", "2.94", "109.2"). */
export function plainNumber(value: Numeric): string {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
}

function assertYears(years: number): void {
  if (!Number.isInteger(years) || years < 0) {
    throw new RangeError(`years must be a whole number of at least 0, got ${years}`);
  }
}
