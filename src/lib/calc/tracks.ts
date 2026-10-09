/**
 * How a track's interest rate is built and how it behaves — the arithmetic
 * behind lessons 2.1 (the Bank of Israel rate, prime, anchor and spread),
 * 2.2 (a fixed rate is not a fixed payment), 2.3 (indexed against not indexed)
 * and 2.4 (the two meanings of "nominal").
 *
 * Rates are percentages given as strings ("5" means 5%); a spread is in
 * percentage points and may be negative ("-0.8"). Results are exact Decimals;
 * money is rounded to the agora only where a statement would round it (each
 * period's interest in a repayment table) or for display (money.ts). Roots and
 * powers run at 40 significant digits. Recomputed independently in
 * checks/kinds/tracks.py.
 */
import Decimal from "decimal.js";
import { PRIME_ADDITION } from "./lending.ts";

export type Numeric = Decimal.Value;
export { PRIME_ADDITION };

/** A private Decimal with room for powers; results convert freely to the default Decimal. */
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ONE = new D(1);
const HUNDRED = new D(100);
const TWELVE = new D(12);

const agora = (x: Decimal) => new D(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

function wholeAtLeast(n: number, min: number, what: string): void {
  if (!Number.isInteger(n) || n < min) throw new RangeError(`${what} must be a whole number of at least ${min}, got ${n}`);
}

// ---------------------------------------------------------------- 2.1

/** Prime: the Bank of Israel rate plus the addition (1.5 points, as of 2026-10-09; see lending.ts). */
export function primeRate(policyPercent: Numeric, additionPoints: Numeric = PRIME_ADDITION): Decimal {
  return new D(policyPercent).plus(additionPoints);
}

/** A track's rate from its anchor and its contractual spread: anchor + spread (the spread may be negative). */
export function rateFromAnchor(anchorPercent: Numeric, spreadPoints: Numeric): Decimal {
  return new D(anchorPercent).plus(spreadPoints);
}

/** A prime-anchored track's rate from the Bank of Israel rate: rate + addition + spread. */
export function primeTrackRate(policyPercent: Numeric, spreadPoints: Numeric, additionPoints: Numeric = PRIME_ADDITION): Decimal {
  return rateFromAnchor(primeRate(policyPercent, additionPoints), spreadPoints);
}

/** The spread a rate stands at from an anchor, in points: rate − anchor (negative below the anchor). */
export function spreadFromRate(ratePercent: Numeric, anchorPercent: Numeric): Decimal {
  return new D(ratePercent).minus(anchorPercent);
}

/** One month's interest on a balance at a stated annual rate, by the division rule: balance × annual ÷ 12 ÷ 100. Exact. */
export function monthInterest(balance: Numeric, annualPercent: Numeric): Decimal {
  return new D(balance).mul(annualPercent).div(TWELVE).div(HUNDRED);
}

/** One year's interest on a balance: balance × rate ÷ 100. Exact. */
export function yearInterest(balance: Numeric, ratePercent: Numeric): Decimal {
  return new D(balance).mul(ratePercent).div(HUNDRED);
}

// ---------------------------------------------------------------- 2.2

export interface EqualPrincipalMonth {
  month: number;
  /** The debt at the start of the month. */
  balance: Decimal;
  principal: Decimal;
  /** balance × annual ÷ 12, exact. */
  interest: Decimal;
  payment: Decimal;
}

/**
 * Equal principal, paid monthly: every month the same part of the principal
 * (loan ÷ months), plus a month's interest on what is still owed at the start
 * of that month. `annualPercent` is the rate in force that month.
 */
export function equalPrincipalMonth(loan: Numeric, months: number, annualPercent: Numeric, month: number): EqualPrincipalMonth {
  wholeAtLeast(months, 1, "months");
  wholeAtLeast(month, 1, "month");
  if (month > months) throw new RangeError(`month must be at most ${months}, got ${month}`);
  const principal = new D(loan).div(months);
  const balance = new D(loan).minus(principal.mul(month - 1));
  const interest = monthInterest(balance, annualPercent);
  return { month, balance, principal, interest, payment: principal.plus(interest) };
}

/** The sum of the discount factors 1 ÷ (1 + r)^k for k = 1 … n (lesson 0.6). */
export function annuityFactor(ratePercent: Numeric, periods: number): Decimal {
  wholeAtLeast(periods, 1, "periods");
  const g = ONE.plus(new D(ratePercent).div(HUNDRED));
  let total = new D(0);
  for (let k = 1; k <= periods; k++) total = total.plus(ONE.div(g.pow(k)));
  return total;
}

/** One discount factor, 1 ÷ (1 + r)^k. */
export function discountFactor(ratePercent: Numeric, period: number): Decimal {
  wholeAtLeast(period, 0, "period");
  return ONE.div(ONE.plus(new D(ratePercent).div(HUNDRED)).pow(period));
}

/**
 * The equal payment that repays `loan` over `periods` payments, one at the end
 * of each period: the loan is the value today of the payments (lesson 0.6), so
 * payment = loan ÷ the sum of the discount factors. Exact; round to the agora to book it.
 */
export function equalPayment(loan: Numeric, ratePercent: Numeric, periods: number): Decimal {
  return new D(loan).div(annuityFactor(ratePercent, periods));
}

export interface PaymentRow {
  period: number;
  opening: Decimal;
  ratePercent: Decimal;
  /** opening × rate, rounded to the agora (statement convention). */
  interest: Decimal;
  payment: Decimal;
  /** payment − interest. */
  principal: Decimal;
  closing: Decimal;
}

/**
 * Equal payments, re-set whenever the rate changes: in each period the payment
 * is the equal payment (rounded to the agora) that would repay what is still
 * owed over the periods left, at that period's rate. With one rate for every
 * period this is a plain fixed-rate equal-payment table; with a new rate it
 * shows the payment moving. Each period's interest is rounded to the agora.
 */
export function equalPaymentPath(loan: Numeric, ratesPercent: Numeric[]): PaymentRow[] {
  if (ratesPercent.length < 1) throw new RangeError("at least one period is needed");
  const rows: PaymentRow[] = [];
  let balance = new D(loan);
  let payment = new D(0);
  let previous: Decimal | null = null;
  ratesPercent.forEach((r, i) => {
    const rate = new D(r);
    const left = ratesPercent.length - i;
    if (previous === null || !rate.eq(previous)) payment = agora(equalPayment(balance, rate, left));
    previous = rate;
    const interest = agora(balance.mul(rate).div(HUNDRED));
    const closing = balance.plus(interest).minus(payment);
    rows.push({ period: i + 1, opening: balance, ratePercent: rate, interest, payment, principal: payment.minus(interest), closing });
    balance = closing;
  });
  return rows;
}

/** A payment that moves with the index: base payment × (1 + inflation)^years, as when the debt is indexed. Exact. */
export function indexedPayment(payment: Numeric, inflationPercent: Numeric, years: number): Decimal {
  wholeAtLeast(years, 0, "years");
  return new D(payment).mul(ONE.plus(new D(inflationPercent).div(HUNDRED)).pow(years));
}

// ---------------------------------------------------------------- 2.3

/** What an indexed debt comes to after one year, interest paid at the end: amount × (1 + π) × (1 + r). Exact. */
export function indexedYearOwed(amount: Numeric, realPercent: Numeric, inflationPercent: Numeric): Decimal {
  const indexed = new D(amount).mul(ONE.plus(new D(inflationPercent).div(HUNDRED)));
  return indexed.mul(ONE.plus(new D(realPercent).div(HUNDRED)));
}

/** The indexed debt alone after one year, before interest: amount × (1 + π). Exact. */
export function indexedAmount(amount: Numeric, inflationPercent: Numeric): Decimal {
  return new D(amount).mul(ONE.plus(new D(inflationPercent).div(HUNDRED)));
}

/** What a debt that is not indexed comes to after one year, interest paid at the end: amount × (1 + i). Exact. */
export function plainYearOwed(amount: Numeric, ratePercent: Numeric): Decimal {
  return new D(amount).mul(ONE.plus(new D(ratePercent).div(HUNDRED)));
}

/**
 * The inflation at which an indexed rate r and a rate i that is not indexed
 * cost the same over a year: (1 + i) ÷ (1 + r) − 1, in percent (lessons 0.8, 0.12).
 */
export function breakEvenInflation(plainPercent: Numeric, indexedPercent: Numeric): Decimal {
  const r = ONE.plus(new D(indexedPercent).div(HUNDRED));
  return ONE.plus(new D(plainPercent).div(HUNDRED)).div(r).minus(ONE).mul(HUNDRED);
}

/** A real rate turned into a rate before inflation: (1 + r) × (1 + π) − 1, in percent. */
export function rateBeforeInflation(realPercent: Numeric, inflationPercent: Numeric): Decimal {
  return ONE.plus(new D(realPercent).div(HUNDRED)).mul(ONE.plus(new D(inflationPercent).div(HUNDRED))).minus(ONE).mul(HUNDRED);
}

/** A rate before inflation turned into a real rate: (1 + i) ÷ (1 + π) − 1, in percent. */
export function realRate(nominalPercent: Numeric, inflationPercent: Numeric): Decimal {
  const p = ONE.plus(new D(inflationPercent).div(HUNDRED));
  return ONE.plus(new D(nominalPercent).div(HUNDRED)).div(p).minus(ONE).mul(HUNDRED);
}

// ---------------------------------------------------------------- 2.4

/** The monthly rate of a stated annual rate, by division: annual ÷ 12 (lesson 0.4). */
export function monthlyByDivision(annualPercent: Numeric): Decimal {
  return new D(annualPercent).div(TWELVE);
}

/** The effective annual rate of a stated annual rate whose interest is added monthly: (1 + annual ÷ 12)^12 − 1, in percent. */
export function effectiveFromStated(annualPercent: Numeric): Decimal {
  return ONE.plus(new D(annualPercent).div(TWELVE).div(HUNDRED)).pow(12).minus(ONE).mul(HUNDRED);
}
