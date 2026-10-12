/**
 * Fact builders shared by lessons 4.7, 4.8 and 4.9 (stage-4 author C). Not a
 * lesson module: build-data.ts loads only lesson-*.ts and check-*.ts, so this
 * file is imported by those three and nothing else. Every builder records the
 * inputs that checks/kinds/underwriting.py recomputes it from.
 */
import Decimal from "decimal.js";
import { moneyString } from "../../src/lib/calc/money.ts";
import { addCalendarDays, calendarDaysBetween } from "../../src/lib/calc/process.ts";
import {
  average,
  lowerOf,
  maxLoanAtRatio,
  mixBalance,
  mixPayment,
  paymentsUntilBalanceAtMost,
  ratioPercent,
  scaleMix,
  shortfallPercent,
  total,
  type Track,
  trackPayment,
} from "../../src/lib/calc/underwriting.ts";
import type { Fact } from "../build-data.ts";

/** At most `decimals` places, half away from zero, trailing zeros dropped: "32.22", "75". */
export function plain(x: Decimal.Value, decimals = 2): string {
  return new Decimal(x).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toString();
}

export const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

const trackInputs = (tracks: Track[]) =>
  Object.fromEntries(
    tracks.flatMap((t, k) => [
      [`principal_${k + 1}`, String(t.principal)],
      [`rate_${k + 1}`, String(t.ratePercent)],
      [`months_${k + 1}`, t.months],
    ]),
  );

const numbered = (prefix: string, values: (string | number)[]) =>
  Object.fromEntries(values.map((v, k) => [`${prefix}_${k + 1}`, String(v)]));

export const trackPay = (id: string, t: Track): Fact => ({
  id,
  kind: "uw_track_payment",
  inputs: { principal: String(t.principal), rate_percent: String(t.ratePercent), months: t.months },
  value: moneyString(trackPayment(t)),
});

export const mixPay = (id: string, tracks: Track[]): Fact => ({
  id,
  kind: "uw_mix_payment",
  inputs: trackInputs(tracks),
  value: moneyString(mixPayment(tracks)),
});

export const sum = (id: string, amounts: (string | number)[]): Fact => ({
  id,
  kind: "uw_total",
  inputs: numbered("amount", amounts),
  value: moneyString(total(amounts.map(String))),
});

export const mean = (id: string, amounts: (string | number)[]): Fact => ({
  id,
  kind: "uw_average",
  inputs: numbered("amount", amounts),
  value: moneyString(average(amounts.map(String))),
});

export const ratio = (id: string, part: string, whole: string, decimals = 2): Fact => ({
  id,
  kind: "uw_ratio",
  inputs: { part, whole, decimals },
  value: plain(ratioPercent(part, whole), decimals),
});

export const shortfall = (id: string, declared: string, verified: string, decimals = 2): Fact => ({
  id,
  kind: "uw_shortfall",
  inputs: { declared, verified, decimals },
  value: plain(shortfallPercent(declared, verified), decimals),
});

export const lower = (id: string, a: string, b: string): Fact => ({
  id,
  kind: "uw_lower",
  inputs: { a, b },
  value: moneyString(lowerOf(a, b)),
});

export const timesPercent = (id: string, amount: string, percent: string): Fact => ({
  id,
  kind: "uw_times_percent",
  inputs: { amount, percent },
  value: moneyString(new Decimal(amount).mul(percent).div(100)),
});

export const maxLoanRatio = (id: string, tracks: Track[], income: string, cap: string, step = 1000): Fact => ({
  id,
  kind: "uw_max_loan_at_ratio",
  inputs: { ...trackInputs(tracks), income, cap, step },
  value: moneyString(maxLoanAtRatio(tracks, income, cap, step)),
});

export const scaledPay = (id: string, tracks: Track[], newLoan: string): Fact => ({
  id,
  kind: "uw_scaled_mix_payment",
  inputs: { ...trackInputs(tracks), new_loan: newLoan },
  value: moneyString(mixPayment(scaleMix(tracks, newLoan))),
});

export const balance = (id: string, tracks: Track[], paid: number): Fact => ({
  id,
  kind: "uw_mix_balance",
  inputs: { ...trackInputs(tracks), paid },
  value: moneyString(mixBalance(tracks, paid)),
});

export const untilAtMost = (id: string, tracks: Track[], threshold: string): Fact => ({
  id,
  kind: "uw_payments_until_at_most",
  inputs: { ...trackInputs(tracks), threshold },
  value: paymentsUntilBalanceAtMost(tracks, threshold),
});

export const addDays = (id: string, start: string, days: number): Fact => ({
  id,
  kind: "uw_add_days",
  inputs: { start, days },
  value: addCalendarDays(start, days),
});

export const daysBetween = (id: string, from: string, to: string): Fact => ({
  id,
  kind: "uw_days_between",
  inputs: { from, to },
  value: calendarDaysBetween(from, to),
});

export const difference = (id: string, minuend: string, subtrahend: string, a: Fact[], ): Fact => {
  const find = (x: string) => a.find((f) => f.id === x)?.value;
  const m = find(minuend);
  const s = find(subtrahend);
  if (m === undefined || s === undefined) throw new Error(`difference ${id}: ${minuend} or ${subtrahend} is not a fact yet`);
  return { id, kind: "difference", inputs: { minuend, subtrahend }, value: moneyString(new Decimal(String(m)).minus(String(s))) };
};

/** Rows of a three-month comparison: the payslip's net against the deposit in the account. */
export const depositTable = (id: string, rows: { month: string; net: string; deposit: string }[]): Fact => ({
  id,
  kind: "uw_deposit_table",
  inputs: Object.fromEntries(rows.flatMap((r, k) => [[`month_${k + 1}`, r.month], [`net_${k + 1}`, r.net], [`deposit_${k + 1}`, r.deposit]])),
  value: rows.map((r, k) => ({
    period: k + 1,
    month: r.month,
    net: moneyString(r.net),
    deposit: moneyString(r.deposit),
    gap: moneyString(new Decimal(r.net).minus(r.deposit)),
  })),
});

/** Rows of a file: each line declared and verified, and the gap. */
export const verifyTable = (id: string, rows: { line: string; declared: string; verified: string }[]): Fact => ({
  id,
  kind: "uw_verify_table",
  inputs: Object.fromEntries(rows.flatMap((r, k) => [[`line_${k + 1}`, r.line], [`declared_${k + 1}`, r.declared], [`verified_${k + 1}`, r.verified]])),
  value: rows.map((r, k) => ({
    period: k + 1,
    line: r.line,
    declared: moneyString(r.declared),
    verified: moneyString(r.verified),
    gap: moneyString(new Decimal(r.declared).minus(r.verified)),
  })),
});

/** Rows: an appraisal, the value used (the lower of it and the price), the ratio, the largest loan under the ceiling. */
export const appraisalTable = (id: string, price: string, loan: string, ceiling: string, appraisals: string[]): Fact => ({
  id,
  kind: "uw_appraisal_table",
  inputs: { price, loan, ceiling, ...numbered("appraisal", appraisals) },
  value: appraisals.map((a, k) => {
    const used = lowerOf(a, price);
    return {
      period: k + 1,
      appraisal: moneyString(a),
      used: moneyString(used),
      ltv: plain(ratioPercent(loan, used)),
      max_loan: moneyString(used.mul(ceiling).div(100)),
    };
  }),
});

/** A difference of two whole counts (months, days), kept a whole number: "4", not "4.00". */
export const countDifference = (id: string, minuend: string, subtrahend: string, a: Fact[]): Fact => {
  const find = (x: string) => a.find((f) => f.id === x)?.value;
  const m = find(minuend);
  const s = find(subtrahend);
  if (m === undefined || s === undefined) throw new Error(`countDifference ${id}: ${minuend} or ${subtrahend} is not a fact yet`);
  return { id, kind: "uw_count_difference", inputs: { minuend, subtrahend }, value: Number(m) - Number(s) };
};

/** An amount divided by a percent: amount × 100 ÷ percent (the appraisal at which a loan is exactly at the ceiling). */
export const dividePercent = (id: string, amount: string, percent: string): Fact => ({
  id,
  kind: "uw_divide_percent",
  inputs: { amount, percent },
  value: moneyString(new Decimal(amount).mul(100).div(percent)),
});
