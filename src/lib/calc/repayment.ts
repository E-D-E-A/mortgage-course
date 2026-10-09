/**
 * Repayment methods — the arithmetic behind lessons 2.9 (Spitzer and equal
 * principal), 2.10 (grace, bullet and balloon) and the special tracks of 2.8.
 *
 * Conventions (the course's calculation assumptions, stated to the learner):
 *  - A contract rate is a nominal annual rate; the monthly rate is the annual
 *    rate ÷ 12 (lesson 0.4; matched to the agora against two banks' published
 *    tables, Brain ENG-223). Rates are percent strings: "4.8" means 4.8% a year.
 *  - Statement convention: each month's interest is the opening balance times
 *    the monthly rate, rounded to the agora. A Spitzer payment is rounded to
 *    the agora once; an equal-principal part is the principal ÷ months, rounded
 *    to the agora. The last month takes whatever is left, so every schedule
 *    ends at exactly zero.
 *  - Grace sits inside the loan's term (Mogi decision, Brain 67436545, Q11):
 *    a 240-month loan with 12 months of grace has 228 months of Spitzer after it.
 *  - Full grace and a full bullet add each month's rounded interest to the debt.
 *
 * Recomputed independently in checks/kinds/repayment.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ZERO = new D(0);
const ONE = new D(1);
const TWELVE = new D(12);
const HUNDRED = new D(100);

const agora = (x: Numeric) => new D(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

function assertMonths(months: number, min = 1): void {
  if (!Number.isInteger(months) || months < min) throw new RangeError(`months must be a whole number of at least ${min}, got ${months}`);
}

/** The monthly rate in percent: the annual rate ÷ 12. "4.8" → 0.4. */
export function monthlyRatePercent(annualPercent: Numeric): Decimal {
  return new D(annualPercent).div(TWELVE);
}

const monthlyFraction = (annualPercent: Numeric) => monthlyRatePercent(annualPercent).div(HUNDRED);

/**
 * The equal monthly payment that brings the loan to exactly zero after `months`
 * payments (lesson 3.1 derives it). Exact, unrounded. At a zero rate: principal ÷ months.
 */
export function spitzerPayment(principal: Numeric, annualPercent: Numeric, months: number): Decimal {
  assertMonths(months);
  const p = new D(principal);
  const m = monthlyFraction(annualPercent);
  if (m.isZero()) return p.div(months);
  return p.mul(m).div(ONE.minus(ONE.plus(m).pow(-months)));
}

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

/** Same payment every month; the last month pays off exactly what is left. */
export function spitzerSchedule(principal: Numeric, annualPercent: Numeric, months: number, firstPeriod = 1): ScheduleRow[] {
  assertMonths(months);
  const m = monthlyFraction(annualPercent);
  const pay = agora(spitzerPayment(principal, annualPercent, months));
  const rows: ScheduleRow[] = [];
  let balance = agora(principal);
  for (let k = 1; k <= months; k++) {
    const interest = agora(balance.mul(m));
    const payment = k === months ? balance.plus(interest) : pay;
    const r = row(firstPeriod + k - 1, balance, interest, payment);
    rows.push(r);
    balance = r.closing;
  }
  return rows;
}

/** Same part of the principal every month, plus interest on what is left; the last month takes the rest. */
export function equalPrincipalSchedule(principal: Numeric, annualPercent: Numeric, months: number): ScheduleRow[] {
  assertMonths(months);
  const m = monthlyFraction(annualPercent);
  const part = agora(new D(principal).div(months));
  const rows: ScheduleRow[] = [];
  let balance = agora(principal);
  for (let k = 1; k <= months; k++) {
    const interest = agora(balance.mul(m));
    const principalPart = k === months ? balance : part;
    const r = row(k, balance, interest, principalPart.plus(interest));
    rows.push(r);
    balance = r.closing;
  }
  return rows;
}

export type DeferralKind = "partial" | "full";

/**
 * Grace at the start, inside the term. Partial: only the interest is paid, the
 * debt stays. Full: nothing is paid, the interest joins the debt. Then Spitzer
 * on the debt as it stands, over the months that are left.
 */
export function graceSchedule(principal: Numeric, annualPercent: Numeric, months: number, graceMonths: number, kind: DeferralKind): ScheduleRow[] {
  assertMonths(months);
  assertMonths(graceMonths, 0);
  if (graceMonths >= months) throw new RangeError("the grace must be shorter than the loan");
  const m = monthlyFraction(annualPercent);
  const rows: ScheduleRow[] = [];
  let balance = agora(principal);
  for (let k = 1; k <= graceMonths; k++) {
    const interest = agora(balance.mul(m));
    const r = row(k, balance, interest, kind === "partial" ? interest : ZERO);
    rows.push(r);
    balance = r.closing;
  }
  return [...rows, ...spitzerSchedule(balance, annualPercent, months - graceMonths, graceMonths + 1)];
}

/**
 * Bullet and balloon: the whole principal comes back at the end. Partial: the
 * interest is paid every month. Full: nothing until the end; the interest joins
 * the debt, and the last month pays everything.
 */
export function bulletSchedule(principal: Numeric, annualPercent: Numeric, months: number, kind: DeferralKind): ScheduleRow[] {
  assertMonths(months);
  const m = monthlyFraction(annualPercent);
  const rows: ScheduleRow[] = [];
  let balance = agora(principal);
  for (let k = 1; k <= months; k++) {
    const interest = agora(balance.mul(m));
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
      return spitzerSchedule(principal, annualPercent, months);
    case "equal_principal":
      return equalPrincipalSchedule(principal, annualPercent, months);
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
  const spitzer = spitzerSchedule(principal, annualPercent, months);
  const equal = equalPrincipalSchedule(principal, annualPercent, months);
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
