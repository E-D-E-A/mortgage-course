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
