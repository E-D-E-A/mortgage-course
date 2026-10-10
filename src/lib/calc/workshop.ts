/**
 * Workshop 3.12 — a schedule by hand and in a spreadsheet, checked against the
 * course's calculator (amortization.ts, the statement convention).
 *
 * Two things live here, both built on annuityStatement and never replacing it:
 *  - handMistake: the number a learner writes in one month of a hand-made
 *    schedule when they make one named mistake in that month (the months
 *    before it right). The page names each mistake when its number is typed.
 *  - sheetFigures: what a spreadsheet shows for a level-payment loan under one
 *    of four rounding conventions. "statement" is the course's own (and a bank
 *    statement's): the payment rounded to the agora once, each month's interest
 *    rounded to the agora, the last payment closing what is left. The other
 *    three are the usual ways a home-made sheet drifts from it by agorot.
 *
 * Exact Decimals throughout; money is rounded to the agora only where the
 * convention says so (and by money.ts when shown). Recomputed independently in
 * checks/kinds/workshop.py.
 */
import Decimal from "decimal.js";
import { type AmortizationRow, annuityPayment, annuityStatement, monthInterest, type Numeric } from "./amortization.ts";

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const agorot = (x: Numeric) => new D(x).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

export type HandField = "opening" | "interest" | "principal" | "closing";

/**
 * The named mistakes of a hand-made level-payment schedule:
 *  - interest_on_original: this month's interest on the original loan, not on the balance.
 *  - annual_rate: the interest at the annual rate, not the monthly one (not ÷ 12).
 *  - unrounded: the interest, or the closing balance built on it, left unrounded.
 *  - truncated: the interest cut to the agora instead of rounded.
 *  - whole_payment: the whole payment taken off the balance, as if it were all principal.
 *  - equal_part: the loan ÷ the months as this month's principal (equal principal, not Spitzer).
 *  - stale_opening: last month's opening balance carried over unchanged.
 *  - loan_again: the original loan written as this month's opening balance.
 */
export type HandMistake =
  | "interest_on_original"
  | "annual_rate"
  | "unrounded"
  | "truncated"
  | "whole_payment"
  | "equal_part"
  | "stale_opening"
  | "loan_again";

/** Which mistakes can show in which field (the others are not defined there). */
export const HAND_MISTAKES: Record<HandField, HandMistake[]> = {
  opening: ["stale_opening", "loan_again"],
  interest: ["interest_on_original", "annual_rate", "unrounded", "truncated"],
  principal: ["whole_payment", "equal_part", "interest_on_original", "annual_rate"],
  closing: ["whole_payment", "equal_part", "unrounded", "interest_on_original", "annual_rate"],
};

function row(rows: AmortizationRow[], period: number): AmortizationRow {
  if (!Number.isInteger(period) || period < 1 || period > rows.length) throw new RangeError(`period must be 1 to ${rows.length}, got ${period}`);
  return rows[period - 1];
}

/** The interest a learner writes under `mistake`, on this month's (right) opening balance. */
function wrongInterest(principal: Numeric, annualPercent: Numeric, opening: Decimal, mistake: HandMistake): Decimal {
  switch (mistake) {
    case "interest_on_original":
      return agorot(monthInterest(principal, annualPercent));
    case "annual_rate":
      return agorot(opening.mul(annualPercent).div(100));
    case "unrounded":
      return new D(monthInterest(opening, annualPercent));
    case "truncated":
      return new D(monthInterest(opening, annualPercent)).toDecimalPlaces(2, Decimal.ROUND_DOWN);
    default:
      throw new RangeError(`${mistake} is not an interest mistake`);
  }
}

/**
 * The value in month `period`, column `field`, of a hand-made level-payment
 * schedule when the learner makes `mistake` there and every earlier month is
 * right. A closing balance carries the mistake through: the payment, minus the
 * wrong interest (or the wrong principal), off the opening balance.
 */
export function handMistake(principal: Numeric, annualPercent: Numeric, months: number, period: number, field: HandField, mistake: HandMistake): Decimal {
  if (!HAND_MISTAKES[field].includes(mistake)) throw new RangeError(`${mistake} is not a mistake in ${field}`);
  const rows = annuityStatement(principal, annualPercent, months);
  const r = row(rows, period);
  const payment = r.payment;
  if (field === "opening") {
    if (mistake === "loan_again") return agorot(principal);
    if (period < 2) throw new RangeError("stale_opening needs an earlier month");
    return row(rows, period - 1).opening;
  }
  if (field === "interest") return wrongInterest(principal, annualPercent, r.opening, mistake);
  // principal and closing
  let principalPaid: Decimal;
  if (mistake === "whole_payment") principalPaid = payment;
  else if (mistake === "equal_part") principalPaid = agorot(new D(principal).div(months));
  else principalPaid = payment.minus(wrongInterest(principal, annualPercent, r.opening, mistake));
  return field === "principal" ? principalPaid : r.opening.minus(principalPaid);
}

/** How a spreadsheet rounds: the course's statement convention, or one of three home-made drifts from it. */
export type SheetConvention =
  /** The course's: payment rounded once, each interest rounded, the last payment closes the balance. */
  | "statement"
  /** No ROUND anywhere: the exact level payment every month; totals rounded only when shown. */
  | "exact"
  /** Interest rounded, the payment not (=-PMT(…) without ROUND); the last payment closes the balance. */
  | "payment_unrounded"
  /** Everything rounded, but the last month pays the regular payment too: a few agorot stay on the balance. */
  | "no_last_adjust";

export const SHEET_CONVENTIONS: SheetConvention[] = ["statement", "exact", "payment_unrounded", "no_last_adjust"];

export interface SheetFigures {
  /** The payment in month 1. */
  regular: Decimal;
  /** The payment in the last month. */
  last: Decimal;
  totalPaid: Decimal;
  totalInterest: Decimal;
  /** The balance after the last payment (zero unless the last month is not adjusted). */
  finalClosing: Decimal;
}

/**
 * What a spreadsheet built under `convention` shows for a level-payment loan:
 * month 1's payment, the last month's payment, the totals and the balance left.
 * Totals are exact sums; they are rounded to the agora only when shown, as a
 * sheet's two-decimal format does.
 */
export function sheetFigures(principal: Numeric, annualPercent: Numeric, months: number, convention: SheetConvention): SheetFigures {
  const p = new D(principal);
  if (convention === "statement") {
    const rows = annuityStatement(principal, annualPercent, months);
    const totalPaid = rows.reduce((s, r) => s.plus(r.payment), new D(0));
    const totalInterest = rows.reduce((s, r) => s.plus(r.interest), new D(0));
    return { regular: rows[0].payment, last: rows[months - 1].payment, totalPaid, totalInterest, finalClosing: rows[months - 1].closing };
  }
  if (convention === "exact") {
    const c = new D(annuityPayment(principal, annualPercent, months));
    const totalPaid = c.mul(months);
    return { regular: c, last: c, totalPaid, totalInterest: totalPaid.minus(p), finalClosing: new D(0) };
  }
  const payment = convention === "payment_unrounded" ? new D(annuityPayment(principal, annualPercent, months)) : agorot(annuityPayment(principal, annualPercent, months));
  let balance = agorot(principal);
  let totalPaid = new D(0);
  let totalInterest = new D(0);
  let last = payment;
  for (let k = 1; k <= months; k++) {
    const interest = agorot(monthInterest(balance, annualPercent));
    const pay = k === months && convention === "payment_unrounded" ? balance.plus(interest) : payment;
    totalPaid = totalPaid.plus(pay);
    totalInterest = totalInterest.plus(interest);
    balance = balance.minus(pay.minus(interest));
    last = pay;
  }
  return { regular: payment, last, totalPaid, totalInterest, finalClosing: balance };
}

/** The sum of the statement's interest from month `from` to month `to`, both included. */
export function interestBetween(principal: Numeric, annualPercent: Numeric, months: number, from: number, to: number): Decimal {
  const rows = annuityStatement(principal, annualPercent, months);
  row(rows, from);
  row(rows, to);
  if (from > to) throw new RangeError("from must not be after to");
  return rows.slice(from - 1, to).reduce((s, r) => s.plus(r.interest), new D(0));
}

/** The mistake of reading a balance as the loan minus the payments made: P − k × payment. */
export function naiveBalance(principal: Numeric, annualPercent: Numeric, months: number, paid: number): Decimal {
  const payment = agorot(annuityPayment(principal, annualPercent, months));
  return agorot(principal).minus(payment.mul(paid));
}

/** The mistake of using the annual rate as if it were the monthly one: the level payment at m = annual % per month. */
export function paymentAnnualAsMonthly(principal: Numeric, annualPercent: Numeric, months: number): Decimal {
  return new D(annuityPayment(principal, new D(annualPercent).mul(12), months));
}
