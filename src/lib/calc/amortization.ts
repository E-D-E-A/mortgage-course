/**
 * Amortization — how a loan track is repaid month by month. The arithmetic
 * behind lessons 2.5–2.7 (fixed, prime and variable tracks) and 2.9 (the
 * level payment against equal principal), and later stage 3.
 *
 * Conventions, the same everywhere in the course:
 *  - Rates are a contract's nominal annual rate, in percent, as strings
 *    ("4.75" means 4.75% a year). The monthly rate is the annual rate ÷ 12
 *    (lesson 0.4; checked against two banks' schedules, Brain ENG-223).
 *  - Payments are monthly, at the end of each month.
 *  - The level payment (שפיצר) is the payment that brings the balance to
 *    exactly zero after the last month: P × m ÷ (1 − (1 + m)^−n).
 *  - When a track's rate changes (prime, a variable track's reset), the
 *    payment is recalculated on the balance left, over the months left; the
 *    term stays. That is the course's calculation assumption; a contract may
 *    say otherwise.
 *  - An index-linked track (צמוד) moves its balance by the index each month
 *    before the payment; the payment is the scheduled one times the index
 *    ratio (lesson 0.8: amount × M₁ ÷ M₀).
 *
 * Every function returns exact Decimals; money is rounded to the agora only
 * when shown (money.ts), except in the *Statement functions, which follow a
 * bank statement: each month's figures rounded to the agora so every row adds
 * up. Recomputed independently in checks/kinds/amortization.py.
 *
 * Exports are stable: other lessons import them. Add, don't rename.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

/** A private Decimal with room for long powers and roots; results mix freely with the default Decimal. */
const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ONE = new D(1);
const HUNDRED = new D(100);
const TWELVE = new D(12);

function assertMonths(months: number): void {
  if (!Number.isInteger(months) || months < 1) throw new RangeError(`months must be a whole number of at least 1, got ${months}`);
}

function agorot(value: Numeric): Decimal {
  return new D(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** The monthly rate in percent, from a nominal annual rate: annual ÷ 12. "6" → 0.5. */
export function monthlyRate(annualPercent: Numeric): Decimal {
  return new D(annualPercent).div(TWELVE);
}

/** One month's interest on a balance at a nominal annual rate: balance × annual ÷ 12 ÷ 100. Exact. */
export function monthInterest(balance: Numeric, annualPercent: Numeric): Decimal {
  return new D(balance).mul(annualPercent).div(TWELVE).div(HUNDRED);
}

/**
 * The level monthly payment (שפיצר) that repays `principal` in `months`
 * payments at a nominal annual rate: P × m ÷ (1 − (1 + m)^−n), m = annual ÷ 12.
 * At a rate of zero, principal ÷ months. Exact, unrounded.
 */
export function annuityPayment(principal: Numeric, annualPercent: Numeric, months: number): Decimal {
  assertMonths(months);
  const m = monthlyRate(annualPercent).div(HUNDRED);
  const p = new D(principal);
  if (m.isZero()) return p.div(months);
  return p.mul(m).div(ONE.minus(ONE.plus(m).pow(-months)));
}

/**
 * The balance left after `paid` level payments: P × (1 + m)^k − C × ((1 + m)^k − 1) ÷ m.
 * `paid` from 0 (the principal) to `months` (zero). Exact, unrounded.
 */
export function annuityBalance(principal: Numeric, annualPercent: Numeric, months: number, paid: number): Decimal {
  assertMonths(months);
  if (!Number.isInteger(paid) || paid < 0 || paid > months) throw new RangeError(`paid must be a whole number from 0 to ${months}, got ${paid}`);
  const p = new D(principal);
  const c = annuityPayment(principal, annualPercent, months);
  const m = monthlyRate(annualPercent).div(HUNDRED);
  if (m.isZero()) return p.minus(c.mul(paid));
  const g = ONE.plus(m).pow(paid);
  return p.mul(g).minus(c.mul(g.minus(ONE)).div(m));
}

/** One month of a schedule. */
export interface AmortizationRow {
  /** 1-based month. */
  month: number;
  /** The balance at the start of the month (after indexation, on a linked track). */
  opening: Decimal;
  payment: Decimal;
  /** This month's interest: opening × monthly rate. */
  interest: Decimal;
  /** The part of the payment that lowers the balance: payment − interest. */
  principalPaid: Decimal;
  /** The balance after this month's payment. */
  closing: Decimal;
}

/** Month-by-month schedule of the level payment, exact (round only for display). */
export function annuitySchedule(principal: Numeric, annualPercent: Numeric, months: number): AmortizationRow[] {
  assertMonths(months);
  return pathSchedule(principal, Array.from({ length: months }, () => annualPercent));
}

/** Month-by-month schedule with an equal part of the principal each month (קרן שווה), exact. */
export function equalPrincipalSchedule(principal: Numeric, annualPercent: Numeric, months: number): AmortizationRow[] {
  assertMonths(months);
  const part = new D(principal).div(months);
  const rows: AmortizationRow[] = [];
  let balance = new D(principal);
  for (let month = 1; month <= months; month++) {
    const interest = monthInterest(balance, annualPercent);
    const principalPaid = month === months ? balance : part;
    rows.push({ month, opening: balance, payment: principalPaid.plus(interest), interest, principalPaid, closing: balance.minus(principalPaid) });
    balance = balance.minus(principalPaid);
  }
  return rows;
}

/**
 * The level-payment schedule the way a bank statement shows it: the payment
 * rounded to the agora; each month's interest rounded to the agora; the rest
 * of the payment lowers the balance. The last payment is whatever clears the
 * balance, so it can differ from the others by a few agorot.
 */
export function annuityStatement(principal: Numeric, annualPercent: Numeric, months: number): AmortizationRow[] {
  assertMonths(months);
  const payment = agorot(annuityPayment(principal, annualPercent, months));
  const rows: AmortizationRow[] = [];
  let balance = agorot(principal);
  for (let month = 1; month <= months; month++) {
    const interest = agorot(monthInterest(balance, annualPercent));
    const principalPaid = month === months ? balance : payment.minus(interest);
    rows.push({ month, opening: balance, payment: principalPaid.plus(interest), interest, principalPaid, closing: balance.minus(principalPaid) });
    balance = balance.minus(principalPaid);
  }
  return rows;
}

/**
 * The equal-principal schedule the way a statement shows it: the principal
 * part rounded to the agora (the last month takes what is left), each month's
 * interest rounded to the agora.
 */
export function equalPrincipalStatement(principal: Numeric, annualPercent: Numeric, months: number): AmortizationRow[] {
  assertMonths(months);
  const part = agorot(new D(principal).div(months));
  const rows: AmortizationRow[] = [];
  let balance = agorot(principal);
  for (let month = 1; month <= months; month++) {
    const interest = agorot(monthInterest(balance, annualPercent));
    const principalPaid = month === months ? balance : part;
    rows.push({ month, opening: balance, payment: principalPaid.plus(interest), interest, principalPaid, closing: balance.minus(principalPaid) });
    balance = balance.minus(principalPaid);
  }
  return rows;
}

/** One month of a track whose rate or index can move. */
export interface PathRow extends AmortizationRow {
  /** The nominal annual rate in force this month, in percent. */
  rate: Decimal;
  /** How much the index moved during this month (1 = not at all; 1.002 = up 0.2%). */
  indexFactor: Decimal;
}

/**
 * A level-payment track whose rate (and, on a linked track, index) can change
 * month by month: prime, a variable track at its reset, a fixed linked track.
 *
 * `rates[t]` is the annual rate in month t + 1; the term is rates.length
 * months. `indexFactors[t]` (default 1) is how much the index moved during
 * month t + 1; the balance is indexed by it before that month's payment.
 *
 * Each month: index the balance; if the rate changed (or it is the first
 * month), recalculate the level payment on that balance over the months left;
 * otherwise keep last month's payment, indexed. Exact, unrounded.
 */
export function pathSchedule(principal: Numeric, rates: Numeric[], indexFactors?: Numeric[]): PathRow[] {
  const months = rates.length;
  assertMonths(months);
  if (indexFactors && indexFactors.length !== months) throw new RangeError("indexFactors must have one entry per month");
  const rows: PathRow[] = [];
  let balance = new D(principal);
  let payment = new D(0);
  let rate = new D(rates[0]);
  for (let t = 0; t < months; t++) {
    const factor = new D(indexFactors ? indexFactors[t] : 1);
    const opening = balance.mul(factor);
    const thisRate = new D(rates[t]);
    if (t === 0 || !thisRate.eq(rate)) payment = annuityPayment(opening, thisRate, months - t);
    else payment = payment.mul(factor);
    rate = thisRate;
    const interest = monthInterest(opening, thisRate);
    const principalPaid = payment.minus(interest);
    const closing = t === months - 1 ? new D(0) : opening.minus(principalPaid);
    rows.push({ month: t + 1, opening, payment, interest, principalPaid, closing, rate: thisRate, indexFactor: factor });
    balance = closing;
  }
  return rows;
}

/**
 * A month-by-month path from values held for blocks of months: block 1 for
 * months 1…blockMonths, block 2 for the next blockMonths, and so on. The last
 * value carries on to the end. Used for a prime path (one prime level per
 * block), a variable track's anchor between resets, or yearly inflation.
 */
export function blockPath(values: Numeric[], blockMonths: number, months: number): Decimal[] {
  assertMonths(months);
  assertMonths(blockMonths);
  if (values.length === 0) throw new RangeError("a path needs at least one value");
  return Array.from({ length: months }, (_, t) => new D(values[Math.min(Math.floor(t / blockMonths), values.length - 1)]));
}

/**
 * How much the index moves in one month when it rises by `annualPercent` over
 * a year at an even pace: (1 + π)^(1/12), a twelfth root (lesson 0.4). Twelve
 * such months make exactly 1 + π.
 */
export function monthlyIndexFactor(annualPercent: Numeric): Decimal {
  const base = ONE.plus(new D(annualPercent).div(HUNDRED));
  if (base.lte(0)) throw new RangeError("an index cannot fall by 100% or more");
  return base.pow(ONE.div(TWELVE));
}

/** Monthly index factors from a yearly inflation per block: blockPath, then monthlyIndexFactor. */
export function indexPath(inflationPercents: Numeric[], blockMonths: number, months: number): Decimal[] {
  const perBlock = inflationPercents.map((p) => monthlyIndexFactor(p));
  return blockPath(perBlock, blockMonths, months);
}

/** One year of a schedule: the payment in its last month, and the balance at its end. */
export interface YearPoint {
  year: number;
  payment: Decimal;
  balance: Decimal;
}

/** Year by year: for each whole year of the schedule, its last month's payment and closing balance. */
export function yearlySummary(rows: AmortizationRow[]): YearPoint[] {
  const years: YearPoint[] = [];
  for (let k = 12; k <= rows.length; k += 12) years.push({ year: k / 12, payment: rows[k - 1].payment, balance: rows[k - 1].closing });
  return years;
}

/** A prime track's rate: the prime plus its margin from prime (signed, "-0.5" for P−0.5). */
export function primeTrackRate(primePercent: Numeric, marginPercent: Numeric): Decimal {
  return new D(primePercent).plus(marginPercent);
}

/**
 * When a variable track's rate is reset: every `intervalMonths` from the start,
 * strictly before the term ends (no reset on the last day). 240 months every
 * 60 → [60, 120, 180].
 */
export function updateMonths(termMonths: number, intervalMonths: number): number[] {
  assertMonths(termMonths);
  assertMonths(intervalMonths);
  const points: number[] = [];
  for (let k = intervalMonths; k < termMonths; k += intervalMonths) points.push(k);
  return points;
}

/** The first reset strictly after month `now` (0 = the day the loan starts), or null when none is left. */
export function nextUpdateMonth(termMonths: number, intervalMonths: number, now: number): number | null {
  return updateMonths(termMonths, intervalMonths).find((k) => k > now) ?? null;
}

/** Months from `now` to the next reset, or null when none is left. */
export function monthsToNextUpdate(termMonths: number, intervalMonths: number, now: number): number | null {
  const next = nextUpdateMonth(termMonths, intervalMonths, now);
  return next === null ? null : next - now;
}

// ── Stage 3: where the level payment comes from, and the balance at any month. ──
// Added for lessons 3.1–3.4; lessons 3.5–3.7 build on remainingBalance. Stable.

function assertPaid(months: number, paid: number): void {
  if (!Number.isInteger(paid) || paid < 0 || paid > months) throw new RangeError(`paid must be a whole number from 0 to ${months}, got ${paid}`);
}

/**
 * S, the sum of `months` monthly discount factors at a nominal annual rate:
 * 1 ÷ (1 + m) + 1 ÷ (1 + m)² + … + 1 ÷ (1 + m)^n, by its short form
 * (1 − (1 + m)^−n) ÷ m (lesson 3.1). What n payments of one shekel, one at the
 * end of each month, are worth today. At a rate of zero, n. Exact.
 */
export function discountSum(annualPercent: Numeric, months: number): Decimal {
  assertMonths(months);
  const m = monthlyRate(annualPercent).div(HUNDRED);
  if (m.isZero()) return new D(months);
  return ONE.minus(ONE.plus(m).pow(-months)).div(m);
}

/** One monthly discount factor, 1 ÷ (1 + m)^k: what one shekel paid at the end of month k is worth today. Exact. */
export function monthlyDiscountFactor(annualPercent: Numeric, month: number): Decimal {
  if (!Number.isInteger(month) || month < 0) throw new RangeError(`month must be a whole number of at least 0, got ${month}`);
  return ONE.div(ONE.plus(monthlyRate(annualPercent).div(HUNDRED)).pow(month));
}

/**
 * The value today of `months` equal monthly payments of `payment`, one at the
 * end of each month, at a nominal annual rate: C × S. The inverse of
 * annuityPayment: paymentsValueToday(annuityPayment(P, a, n), a, n) = P. Exact.
 */
export function paymentsValueToday(payment: Numeric, annualPercent: Numeric, months: number): Decimal {
  return new D(payment).mul(discountSum(annualPercent, months));
}

/**
 * The balance after `paid` level payments, as the value today of the payments
 * still to come: C × (1 − (1 + m)^−(n − k)) ÷ m, C the exact (unrounded) level
 * payment (lesson 3.3). The same number as annuityBalance, which rolls the debt
 * forward instead. `paid` from 0 (the principal) to `months` (zero). Exact.
 * A statement's balance (statementBalance) can differ by a few agorot, because
 * it rounds the payment and each month's interest.
 */
export function remainingBalance(principal: Numeric, annualPercent: Numeric, months: number, paid: number): Decimal {
  assertMonths(months);
  assertPaid(months, paid);
  if (paid === months) return new D(0);
  return paymentsValueToday(annuityPayment(principal, annualPercent, months), annualPercent, months - paid);
}

/** The balance a statement shows after `paid` months of the level payment: annuityStatement's closing balance (0 paid: the principal). */
export function statementBalance(principal: Numeric, annualPercent: Numeric, months: number, paid: number): Decimal {
  assertMonths(months);
  assertPaid(months, paid);
  if (paid === 0) return agorot(principal);
  return annuityStatement(principal, annualPercent, months)[paid - 1].closing;
}

/**
 * A trial (lesson 3.1): pay the same `payment` every month and see what is left.
 * Statement convention: each month's interest rounded to the agora, the
 * payment taken off as it is. The balance is NOT forced to zero: what is left
 * after the last month is positive when the payment was too small, negative
 * when it was too large (overpaid). Once the debt is cleared, a balance below
 * zero earns no interest: what is left at the end is then simply the shekels
 * paid beyond the debt.
 */
export function paymentTrial(principal: Numeric, annualPercent: Numeric, payment: Numeric, months: number): AmortizationRow[] {
  assertMonths(months);
  const pay = new D(payment);
  const rows: AmortizationRow[] = [];
  let balance = agorot(principal);
  for (let month = 1; month <= months; month++) {
    const interest = balance.gt(0) ? agorot(monthInterest(balance, annualPercent)) : new D(0);
    const principalPaid = pay.minus(interest);
    rows.push({ month, opening: balance, payment: pay, interest, principalPaid, closing: balance.minus(principalPaid) });
    balance = balance.minus(principalPaid);
  }
  return rows;
}

/**
 * The first month in which the principal part of the level payment is larger
 * than the interest part (statement convention), or null when it never is.
 */
export function principalOvertakesInterest(principal: Numeric, annualPercent: Numeric, months: number): number | null {
  const k = annuityStatement(principal, annualPercent, months).findIndex((r) => r.principalPaid.gt(r.interest));
  return k < 0 ? null : k + 1;
}

/** The level payment's formula, one step at a time, for a worked example (lesson 3.1). Exact. */
export interface AnnuitySteps {
  /** The monthly rate as a decimal: annual ÷ 12 ÷ 100. */
  m: Decimal;
  /** (1 + m)^n */
  growth: Decimal;
  /** (1 + m)^−n = 1 ÷ (1 + m)^n */
  discount: Decimal;
  /** 1 − (1 + m)^−n */
  oneMinus: Decimal;
  /** P × m: the first month's interest */
  top: Decimal;
  /** P × m ÷ (1 − (1 + m)^−n) */
  payment: Decimal;
}
export function annuitySteps(principal: Numeric, annualPercent: Numeric, months: number): AnnuitySteps {
  assertMonths(months);
  const m = monthlyRate(annualPercent).div(HUNDRED);
  if (m.isZero()) throw new RangeError("the steps need a rate above zero; at zero the payment is principal ÷ months");
  const growth = ONE.plus(m).pow(months);
  const discount = ONE.div(growth);
  const oneMinus = ONE.minus(discount);
  const top = new D(principal).mul(m);
  return { m, growth, discount, oneMinus, top, payment: top.div(oneMinus) };
}

/** The first month after which a statement's level-payment balance is below `threshold` (lesson 3.3: "when is half the debt repaid?"), or null. */
export function firstMonthBelow(principal: Numeric, annualPercent: Numeric, months: number, threshold: Numeric): number | null {
  const k = annuityStatement(principal, annualPercent, months).findIndex((r) => r.closing.lt(threshold));
  return k < 0 ? null : k + 1;
}

// ── Stage 3 fix round (2026-10-10): small helpers so every number a lesson prints is a fact. ──

/** 1 + the rate per period, as a decimal: 1 + annual ÷ (100 × periodsPerYear). (4.8, 12) → 1.004; (4.8, 1) → 1.048. Exact. */
export function growthBase(annualPercent: Numeric, periodsPerYear = 12): Decimal {
  if (!Number.isInteger(periodsPerYear) || periodsPerYear < 1) throw new RangeError(`periodsPerYear must be a whole number of at least 1, got ${periodsPerYear}`);
  return ONE.plus(new D(annualPercent).div(HUNDRED).div(periodsPerYear));
}

/**
 * Lesson 3.1's third try, between two trials: a payment `low` that leaves a
 * debt and a payment `high` that overpays. What is left at the end moves (up to
 * the rounding) by the same amount for each shekel of payment, so the step from
 * `low` is (high − low) × left ÷ (left + over), where left is what `low` leaves
 * and over what `high` overpays. Returns that step, exact.
 */
export function interpolationStep(principal: Numeric, annualPercent: Numeric, months: number, low: Numeric, high: Numeric): Decimal {
  const left = paymentTrial(principal, annualPercent, low, months)[months - 1].closing;
  const over = paymentTrial(principal, annualPercent, high, months)[months - 1].closing.neg();
  if (left.lte(0) || over.lte(0)) throw new RangeError("low must leave a debt and high must overpay");
  return new D(high).minus(low).mul(left).div(left.plus(over));
}

/**
 * The classic slip in a trial (lesson 3.1, exercise 2): charging every month's
 * interest on the original principal instead of on the balance. What is left
 * after `months` payments of `payment`: P + months × (P × m, to the agora) − months × payment.
 */
export function flatInterestTrialLeft(principal: Numeric, annualPercent: Numeric, payment: Numeric, months: number): Decimal {
  assertMonths(months);
  const interest = agorot(monthInterest(principal, annualPercent));
  return agorot(principal).plus(interest.mul(months)).minus(new D(payment).mul(months));
}

/**
 * S the way a learner with a calculator gets it (lesson 3.3): 1 − (1 + m)^−n
 * kept to `decimals` places, then divided by m, kept to `decimals` places.
 * It can differ from discountSum in the last places; the lessons print this one
 * beside the division that produces it.
 */
export function shownDiscountSum(annualPercent: Numeric, months: number, decimals = 8): Decimal {
  assertMonths(months);
  const m = monthlyRate(annualPercent).div(HUNDRED);
  if (m.isZero()) throw new RangeError("the shown sum needs a rate above zero");
  const oneMinus = ONE.minus(ONE.plus(m).pow(-months)).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
  return oneMinus.div(m).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP);
}

/**
 * The annual rate (percent, nominal, ÷ 12 monthly) at which the first month's
 * interest is exactly half of the level payment over `months` months (lesson 3.2).
 * The interest share of the first payment is 1 − (1 + m)^−n, so it is half
 * when (1 + m)^n = 2: m = 2^(1/n) − 1. Above this rate the first payment is
 * mostly interest; below it, mostly principal. Exact.
 */
export function halfInterestRate(months: number): Decimal {
  assertMonths(months);
  return new D(2).pow(ONE.div(months)).minus(ONE).mul(TWELVE).mul(HUNDRED);
}
