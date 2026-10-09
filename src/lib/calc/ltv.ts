/**
 * A loan against a property — the arithmetic behind lessons 1.1 (collateral:
 * what a sale of the pledged home pays, and to whom) and 1.2 (equity and the
 * financing ratio, LTV).
 *
 * Amounts are shekels as strings or Decimals; a percentage is a string ("75"
 * means 75%). Results are exact Decimals: money is rounded to the agora only
 * for display (money.ts), a percentage only by percentString (percent.ts).
 * Recomputed independently in checks/kinds/ltv.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);

function nonNegative(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.isNeg()) throw new RangeError(`${name} cannot be negative, got ${d.toString()}`);
  return d;
}

function positive(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.lte(0)) throw new RangeError(`${name} must be more than zero, got ${d.toString()}`);
  return d;
}

// ── Lesson 1.1: the pledged home is sold ────────────────────────────────────

export interface SaleSplit {
  /** What the lender takes from the sale: the debt, or the whole sale if it is smaller. */
  toLender: Decimal;
  /** What is left for the borrower after the debt is paid. */
  toBorrower: Decimal;
  /** The part of the debt the sale did not cover. The borrower still owes it. */
  stillOwed: Decimal;
}

/**
 * The sale of a home that secures a debt, before the costs of the process:
 * the debt is paid first from the sale, the rest goes to the borrower, and a
 * sale smaller than the debt leaves the difference still owed.
 */
export function saleSplit(salePrice: Numeric, debt: Numeric): SaleSplit {
  const sale = nonNegative(salePrice, "the sale price");
  const owed = nonNegative(debt, "the debt");
  const toLender = Decimal.min(sale, owed);
  return { toLender, toBorrower: sale.minus(toLender), stillOwed: owed.minus(toLender) };
}

/**
 * By how many percent the home's value can fall before a sale no longer covers
 * the debt: (value − debt) ÷ value × 100. Zero when the debt is the value or more.
 */
export function cushionPercent(value: Numeric, debt: Numeric): Decimal {
  const v = positive(value, "the value");
  const room = v.minus(nonNegative(debt, "the debt"));
  return room.isNeg() ? new Decimal(0) : room.div(v).mul(HUNDRED);
}

// ── Lesson 1.2: price = equity + loan, and the financing ratio ─────────────

/** The loan needed when the buyer brings `equity` of their own: price − equity. */
export function loanNeeded(price: Numeric, equity: Numeric): Decimal {
  const p = nonNegative(price, "the price");
  const e = nonNegative(equity, "the equity");
  if (e.gt(p)) throw new RangeError("the equity is larger than the price; no loan is needed");
  return p.minus(e);
}

/** The financing ratio (LTV): the loan as a percent of the property's value, loan ÷ value × 100. */
export function ltvPercent(loan: Numeric, value: Numeric): Decimal {
  return nonNegative(loan, "the loan").div(positive(value, "the value")).mul(HUNDRED);
}

/** The largest loan a ceiling allows: value × ceiling ÷ 100. */
export function maxLoan(value: Numeric, ceilingPercent: Numeric): Decimal {
  const c = nonNegative(ceilingPercent, "the ceiling");
  if (c.gt(HUNDRED)) throw new RangeError("a ceiling above 100% is not a ceiling on a part of the value");
  return nonNegative(value, "the value").mul(c).div(HUNDRED);
}

/**
 * The least equity a purchase needs under a ceiling: the price, minus the
 * largest loan the ceiling allows on the property's value. When the value is
 * the price, this is price × (100 − ceiling) ÷ 100.
 */
export function minEquity(price: Numeric, value: Numeric, ceilingPercent: Numeric): Decimal {
  const need = nonNegative(price, "the price").minus(maxLoan(value, ceilingPercent));
  return need.isNeg() ? new Decimal(0) : need;
}

/**
 * The most expensive home some equity can buy under a ceiling, when the value
 * is the price: equity is the part the loan may not cover, (100 − ceiling)%,
 * so price = equity ÷ (100 − ceiling) × 100.
 */
export function maxPrice(equity: Numeric, ceilingPercent: Numeric): Decimal {
  const own = HUNDRED.minus(nonNegative(ceilingPercent, "the ceiling"));
  if (own.lte(0)) throw new RangeError("with a ceiling of 100% or more, equity does not limit the price");
  return nonNegative(equity, "the equity").div(own).mul(HUNDRED);
}

/** Lender's shekels for each shekel of the buyer's own: loan ÷ equity. */
export function loanPerEquityShekel(loan: Numeric, equity: Numeric): Decimal {
  return nonNegative(loan, "the loan").div(positive(equity, "the equity"));
}
