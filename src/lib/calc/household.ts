/**
 * A household's monthly money — the arithmetic behind lessons 1.9 (what the
 * advisor finds out before talking about rates) and 1.10 (the workshop).
 *
 * Disposable income here is the introductory version of lesson 1.9: every
 * monthly income the family reports, minus every fixed monthly payment it
 * reports. Which incomes and which payments a bank actually counts is stage 4.
 *
 * Amounts are strings or Decimals in shekels; results are exact Decimals,
 * rounded to the agora only for display (money.ts). Recomputed independently
 * in checks/kinds/household.py.
 */
import Decimal from "decimal.js";

export type Numeric = Decimal.Value;

/** The sum of several monthly amounts: 12,400 + 9,300 → 21,700. An empty list is 0. */
export function monthlyTotal(amounts: Numeric[]): Decimal {
  return amounts.reduce<Decimal>((sum, a) => sum.plus(a), new Decimal(0));
}

/** Introductory disposable income: all monthly incomes minus all fixed monthly payments. */
export function disposableIncome(incomes: Numeric[], fixedPayments: Numeric[]): Decimal {
  return monthlyTotal(incomes).minus(monthlyTotal(fixedPayments));
}

/** Whole days left in a window of `windowDays` after `usedDays` of it have gone (never below 0). */
export function daysLeft(windowDays: number, usedDays: number): number {
  if (!Number.isInteger(windowDays) || !Number.isInteger(usedDays) || windowDays < 0 || usedDays < 0) {
    throw new RangeError("days are whole, non-negative numbers");
  }
  return Math.max(0, windowDays - usedDays);
}

export interface HouseholdRow {
  /** The row's name in the table: "1", "2", … */
  household: string;
  incomes: Numeric[];
  fixedPayments: Numeric[];
}

/** A half-worked table: each household's two incomes, its fixed payments, and its disposable income. */
export function disposableTable(rows: HouseholdRow[]) {
  return rows.map((r) => {
    if (r.incomes.length !== 2) throw new RangeError("the table shows exactly two incomes per household");
    return {
      household: r.household,
      income_1: new Decimal(r.incomes[0]),
      income_2: new Decimal(r.incomes[1]),
      payments: monthlyTotal(r.fixedPayments),
      disposable: disposableIncome(r.incomes, r.fixedPayments),
    };
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;
const parseDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new RangeError(`not an ISO date: ${iso}`);
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
};

/** A date `days` calendar days after an ISO date: 2026-11-24 + 7 → 2026-12-01. */
export function addCalendarDays(iso: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError("days are whole numbers");
  return new Date(parseDate(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Calendar days from one ISO date to a later one: 2026-11-10 → 2026-12-02 is 22. */
export function calendarDaysBetween(from: string, to: string): number {
  return Math.round((parseDate(to) - parseDate(from)) / DAY_MS);
}

/** The highest price that a given amount of equity covers at a financing cap: equity ÷ (1 − cap). 510,000 at 75% → 2,040,000. */
export function maxPriceForEquity(equity: Numeric, capPercent: Numeric): Decimal {
  const own = new Decimal(100).minus(capPercent);
  if (own.lte(0)) throw new RangeError("the cap must be below 100%");
  return new Decimal(equity).mul(100).div(own);
}
