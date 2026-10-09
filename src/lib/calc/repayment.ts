/**
 * Deferred repayment — the arithmetic behind lesson 2.10 (grace, bullet and
 * balloon) and the special tracks of lesson 2.8, plus a thin layer over
 * amortization.ts for lesson 2.9 (one row shape for every method, totals, and
 * the month equal principal falls below the level payment).
 *
 * The level payment (שפיצר) and equal principal come from amortization.ts,
 * statement convention (annuityStatement, equalPrincipalStatement): the payment
 * or the principal part rounded to the agora, each month's interest rounded to
 * the agora, the last month clearing what is left. This file adds:
 *  - Grace inside the loan's term (Mogi decision, Brain 67436545, Q11): a
 *    240-month loan with 12 months of grace has 228 months of Spitzer after it.
 *    Partial: only the interest is paid. Full: nothing is paid, and each
 *    month's rounded interest joins the debt.
 *  - Bullet and balloon: the whole principal at the end. Partial: interest
 *    every month. Full: nothing until the end, interest joining the debt.
 *
 * Recomputed independently in checks/kinds/repayment.py.
 */
import Decimal from "decimal.js";
import { type AmortizationRow, annuityStatement, equalPrincipalStatement, monthInterest, monthlyRate } from "./amortization.ts";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);
const HUNDRED = new D(100);

const agora = (x: Numeric) => new D(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

function assertMonths(months: number, min = 1): void {
  if (!Number.isInteger(months) || months < min) throw new RangeError(`months must be a whole number of at least ${min}, got ${months}`);
}

/** The monthly rate in percent (annual ÷ 12), re-exported for the components. */
export { monthlyRate };

export interface ScheduleRow {
  /** 1-based month. */
  period: number;
  opening: Decimal;
  /** opening × monthly rate, rounded to the agora. */
  interest: Decimal;
  /** payment − interest: the part of the payment that repays the debt. Negative when unpaid interest is added to the debt. */
  principal: Decimal;
  payment: Decimal;
  /** opening − principal. */
  closing: Decimal;
}

function row(period: number, opening: Decimal, interest: Decimal, payment: Decimal): ScheduleRow {
  const principal = payment.minus(interest);
  return { period, opening, interest, principal, payment, closing: opening.minus(principal) };
}

const fromAmortization = (rows: AmortizationRow[], offset = 0): ScheduleRow[] =>
  rows.map((r) => ({ period: r.month + offset, opening: r.opening, interest: r.interest, principal: r.principalPaid, payment: r.payment, closing: r.closing }));

export type DeferralKind = "partial" | "full";

/**
 * Grace at the start, inside the term. Partial: only the interest is paid, the
 * debt stays. Full: nothing is paid, the interest joins the debt. Then Spitzer
 * (annuityStatement) on the debt as it stands, over the months that are left.
 */
export function graceSchedule(principal: Numeric, annualPercent: Numeric, months: number, graceMonths: number, kind: DeferralKind): ScheduleRow[] {
  assertMonths(months);
  assertMonths(graceMonths, 0);
  if (graceMonths >= months) throw new RangeError("the grace must be shorter than the loan");
  const rows: ScheduleRow[] = [];
  let balance = agora(principal);
  for (let k = 1; k <= graceMonths; k++) {
    const interest = agora(monthInterest(balance, annualPercent));
    const r = row(k, balance, interest, kind === "partial" ? interest : ZERO);
    rows.push(r);
    balance = r.closing;
  }
  return [...rows, ...fromAmortization(annuityStatement(balance, annualPercent, months - graceMonths), graceMonths)];
}

/**
 * Bullet and balloon: the whole principal comes back at the end. Partial: the
 * interest is paid every month. Full: nothing until the end; the interest joins
 * the debt, and the last month pays everything.
 */
export function bulletSchedule(principal: Numeric, annualPercent: Numeric, months: number, kind: DeferralKind): ScheduleRow[] {
  assertMonths(months);
  const rows: ScheduleRow[] = [];
  let balance = agora(principal);
  for (let k = 1; k <= months; k++) {
    const interest = agora(monthInterest(balance, annualPercent));
    const payment = k === months ? balance.plus(interest) : kind === "partial" ? interest : ZERO;
    const r = row(k, balance, interest, payment);
    rows.push(r);
    balance = r.closing;
  }
  return rows;
}

export type Method = "spitzer" | "equal_principal" | "grace_partial" | "grace_full" | "bullet_partial" | "bullet_full";

export interface Loan {
  principal: Numeric;
  annualPercent: Numeric;
  months: number;
  /** Grace methods only. */
  graceMonths?: number;
}

/** One entry point for every method, so a fact can name its method and the check can follow it. */
export function schedule(method: Method, loan: Loan): ScheduleRow[] {
  const { principal, annualPercent, months, graceMonths = 0 } = loan;
  switch (method) {
    case "spitzer":
      return fromAmortization(annuityStatement(principal, annualPercent, months));
    case "equal_principal":
      return fromAmortization(equalPrincipalStatement(principal, annualPercent, months));
    case "grace_partial":
      return graceSchedule(principal, annualPercent, months, graceMonths, "partial");
    case "grace_full":
      return graceSchedule(principal, annualPercent, months, graceMonths, "full");
    case "bullet_partial":
      return bulletSchedule(principal, annualPercent, months, "partial");
    case "bullet_full":
      return bulletSchedule(principal, annualPercent, months, "full");
  }
}

/** Everything paid over the schedule. */
export function totalPaid(rows: ScheduleRow[]): Decimal {
  return rows.reduce((s, r) => s.plus(r.payment), new D(0));
}

/** All the interest over the schedule (paid on time or added to the debt and paid later). */
export function totalInterest(rows: ScheduleRow[]): Decimal {
  return rows.reduce((s, r) => s.plus(r.interest), new D(0));
}

/** The first month in which the equal-principal payment is lower than the Spitzer payment. */
export function crossoverMonth(principal: Numeric, annualPercent: Numeric, months: number): number {
  const spitzer = annuityStatement(principal, annualPercent, months);
  const equal = equalPrincipalStatement(principal, annualPercent, months);
  const k = equal.findIndex((r, i) => r.payment.lt(spitzer[i].payment));
  if (k < 0) throw new RangeError("the equal-principal payment never falls below the Spitzer payment");
  return k + 1;
}

/**
 * A rate set by rule as "the published average less some points, but no more
 * than a cap" (the eligibility loan's rule, lesson 2.8): min(average − points, cap).
 */
export function cappedRateBelowAverage(averagePercent: Numeric, belowPoints: Numeric, capPercent: Numeric): Decimal {
  return D.min(new D(averagePercent).minus(belowPoints), capPercent);
}

/** A discount of a percent of the price, but no more than a cap in shekels: min(price × percent, cap). */
export function cappedDiscount(price: Numeric, percent: Numeric, cap: Numeric): Decimal {
  return D.min(new D(price).mul(percent).div(HUNDRED), cap);
}

/**
 * A debt linked to an exchange rate, in shekels: the shekel amount at the start
 * becomes so many units of the foreign currency, and those units are worth the
 * new rate. amount ÷ rate then × rate now.
 */
export function exchangeLinkedBalance(amount: Numeric, rateAtStart: Numeric, rateNow: Numeric): Decimal {
  const start = new D(rateAtStart);
  if (start.lte(0)) throw new RangeError("the starting exchange rate must be more than zero");
  return new D(amount).div(start).mul(rateNow);
}
