/**
 * Helpers that turn src/lib/calc/earlyrepay.ts into facts, shared by lessons 7.1–7.3
 * (and importable by 7.4–7.8). Each fact kind starts with er_ and is recomputed by
 * checks/kinds/earlyrepay.py from the same flat inputs, by its own route.
 *
 * A "case" is one loan and one repayment, written flat so the Python check can read it.
 */
import Decimal from "decimal.js";
import {
  type FeeInput,
  type FeeResult,
  type ISODate,
  type TrackKind,
  addMonths,
  bucketFor,
  daysBetween,
  earlyRepaymentFee,
  effective,
  effectiveOfNominal,
  monthlyFraction,
  nominal,
  wholeMonthsBetween,
} from "../../src/lib/calc/earlyrepay.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { streamValue, remainingStream } from "../../src/lib/calc/earlyrepay.ts";
import type { Fact } from "../build-data.ts";

export interface Case {
  principal: string;
  /** The contract's NOMINAL annual percent. */
  rate: string;
  term: number;
  method?: "spitzer" | "equal_principal";
  granted: ISODate;
  repaid: ISODate;
  track?: TrackKind;
  /** Months between resets (variable tracks). */
  reset?: number;
  linkage?: "linked" | "unlinked";
  /** A: an EFFECTIVE annual percent. */
  avgToday: string;
  /** C: an EFFECTIVE annual percent; absent = none published. */
  avgGrant?: string;
  noticeOn?: ISODate;
  indexChange?: string;
  directed?: boolean;
  balance?: string;
}

export const toInput = (c: Case): FeeInput => ({
  loan: {
    principal: c.principal,
    contract: nominal(c.rate),
    termMonths: c.term,
    method: c.method ?? "spitzer",
    grantedOn: c.granted,
    kind: c.track ?? (c.reset ? "variable" : "fixed"),
    resetEveryMonths: c.reset || undefined,
    linkage: c.linkage ?? "unlinked",
  },
  repaidOn: c.repaid,
  averageToday: effective(c.avgToday),
  averageAtGrant: c.avgGrant === undefined ? null : effective(c.avgGrant),
  noticeGivenOn: c.noticeOn ?? null,
  indexChangeAvgPercent: c.indexChange ?? "0",
  balance: c.balance,
  directed: c.directed,
});

export const flat = (c: Case): Record<string, string | number> => ({
  principal: c.principal,
  rate: c.rate,
  term: c.term,
  method: c.method ?? "spitzer",
  granted: c.granted,
  repaid: c.repaid,
  track: c.track ?? (c.reset ? "variable" : "fixed"),
  reset: c.reset ?? 0,
  linkage: c.linkage ?? "unlinked",
  avg_today: c.avgToday,
  avg_grant: c.avgGrant ?? "",
  notice_on: c.noticeOn ?? "",
  index_change: c.indexChange ?? "0",
  directed: c.directed ? 1 : 0,
  balance: c.balance ?? "",
});

export type MoneyField = "balance" | "payment" | "pv_today" | "pv_contract" | "pv_grant" | "v1" | "v2" | "lower" | "discount" | "operational" | "no_notice" | "index" | "sum" | "total" | "total_v1_only" | "pv_today_nominal_mistake" | "v1_nominal_mistake";
export type CountField = "paid" | "remaining" | "months_to_reset" | "notice_days" | "reduction_percent";
export type TextField = "bucket" | "binding" | "status";
export type Field = MoneyField | CountField | TextField;

const moneyFields = new Set<string>(["balance", "payment", "pv_today", "pv_contract", "pv_grant", "v1", "v2", "lower", "discount", "operational", "no_notice", "index", "sum", "total", "total_v1_only", "pv_today_nominal_mistake", "v1_nominal_mistake"]);

function valueOf(r: FeeResult, c: Case, field: Field): string | number {
  const m = (x: Decimal | null) => {
    if (x === null) throw new Error(`field ${field} has no value for this case`);
    return moneyString(x);
  };
  switch (field) {
    case "balance": return m(r.balance);
    case "payment": return m(r.payment);
    case "pv_today": return m(r.discounting?.pvToday ?? null);
    case "pv_contract": return m(r.discounting?.pvContract ?? null);
    case "pv_grant": return m(r.discounting?.pvGrant ?? null);
    case "v1": return m(r.discounting?.v1 ?? null);
    case "v2": return m(r.discounting?.v2 ?? null);
    case "lower": return m(r.lower);
    case "discount": return m(r.discount);
    case "operational": return m(r.operational);
    case "no_notice": return m(r.noNotice);
    case "index": return m(r.index);
    case "sum": return m(r.sum);
    case "total": return m(r.total);
    case "total_v1_only": {
      const other = r.operational.plus(r.noNotice).plus(r.index);
      if (!r.discounting?.v1) return m(other);
      const disc = r.discounting.v1.mul(100 - r.reduction.percent).div(100);
      return m(Decimal.max(0, disc.plus(other)));
    }
    case "pv_today_nominal_mistake":
    case "v1_nominal_mistake": {
      const input = toInput(c);
      const stream = remainingStream(input.loan, r.paid);
      const q = monthlyFraction(nominal(c.avgToday)); // the mistake: an effective average divided by 12
      const n = r.monthsToReset === null ? stream.payments.length : Math.min(r.monthsToReset, stream.payments.length);
      const R = monthlyFraction(input.loan.contract);
      const first = streamValue(stream.payments.slice(0, n), q);
      const tail = stream.payments.slice(n);
      const value = tail.length ? first.plus(streamValue(tail, R).div(new Decimal(1).plus(q).pow(n))) : first;
      return m(field === "pv_today_nominal_mistake" ? value : value.minus(r.discounting!.pvContract));
    }
    case "paid": return r.paid;
    case "remaining": return r.remaining;
    case "months_to_reset": return r.monthsToReset ?? (() => { throw new Error("no reset"); })();
    case "notice_days": return r.notice.days ?? (() => { throw new Error("no notice"); })();
    case "reduction_percent": return r.reduction.percent;
    case "bucket": return r.bucket.label;
    case "binding": return r.discounting?.binding ?? "";
    case "status": return r.status;
  }
}

/** One field of the whole fee for a case. Shown with f.shekels / f.plain / f.raw. */
export const fee = (id: string, c: Case, field: Field): Fact => ({
  id,
  kind: "er_fee",
  inputs: { ...flat(c), field },
  value: valueOf(earlyRepaymentFee(toInput(c)), c, field),
});

/** The whole result, for the tests of the lesson scripts. */
export const run = (c: Case): FeeResult => earlyRepaymentFee(toInput(c));

export const monthlyPercent = (id: string, kind: "nominal" | "effective", rate: string, decimals: number): Fact => ({
  id,
  kind: "er_monthly_percent",
  inputs: { kind, rate, decimals },
  value: trim(monthlyFraction(kind === "nominal" ? nominal(rate) : effective(rate)).mul(100), decimals),
});

export const effectiveOf = (id: string, rate: string, decimals: number): Fact => ({
  id,
  kind: "er_effective_of_nominal",
  inputs: { rate, decimals },
  value: trim(new Decimal(effectiveOfNominal(nominal(rate)).percent), decimals),
});

/** A percent as the course shows it: rounded half away from zero, trailing zeros dropped. */
export function trim(x: Decimal.Value, decimals: number): string {
  const s = new Decimal(x).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toFixed();
  return s === "-0" ? "0" : s;
}

/** One payment, `years` away, taken back at an annual rate. */
export const pvSingle = (id: string, payment: string, rate: string, years: number): Fact => ({
  id,
  kind: "er_pv_single",
  inputs: { payment, rate, years },
  value: moneyString(new Decimal(payment).div(new Decimal(1).plus(new Decimal(rate).div(100)).pow(years))),
});

export const percentOf = (id: string, amount: Fact, percent: string): Fact => ({
  id,
  kind: "er_percent_of",
  inputs: { amount: amount.value as string, percent, of_fact: amount.id },
  value: moneyString(new Decimal(amount.value as string).mul(percent).div(100)),
});

/** A percent of a plain number given here (no fact behind it). */
export const percentOfAmount = (id: string, amount: string, percent: string): Fact => ({
  id,
  kind: "er_percent_of",
  inputs: { amount, percent },
  value: moneyString(new Decimal(amount).mul(percent).div(100)),
});

export const times = (id: string, of: Fact, count: number): Fact => ({
  id,
  kind: "er_times",
  inputs: { of: of.id, count },
  value: moneyString(new Decimal(of.value as string).mul(count)),
});

export const totalOf = (id: string, parts: Fact[]): Fact => ({
  id,
  kind: "er_total",
  inputs: { facts: parts.map((p) => p.id).join("|") },
  value: moneyString(parts.reduce((s, p) => s.plus(p.value as string), new Decimal(0))),
});

export const minOf = (id: string, parts: Fact[]): Fact => ({
  id,
  kind: "er_min",
  inputs: { facts: parts.map((p) => p.id).join("|") },
  value: moneyString(Decimal.min(...parts.map((p) => new Decimal(p.value as string)))),
});

/** a ÷ b, rounded to `decimals`, trailing zeros dropped ("4.4"). */
export const ratioOf = (id: string, a: Fact, b: Fact, decimals: number): Fact => ({
  id,
  kind: "er_ratio",
  inputs: { a: a.id, b: b.id, decimals },
  value: trim(new Decimal(a.value as string).div(b.value as string), decimals),
});

/** One day's interest, taken as a thirtieth of a month's: balance × annual rate ÷ 12 ÷ days. */
export const dayInterest = (id: string, balance: string, rate: string, days: number): Fact => ({
  id,
  kind: "er_day_interest",
  inputs: { balance, rate, days },
  value: moneyString(new Decimal(balance).mul(rate).div(100).div(12).div(days)),
});

/** One month's interest on a balance fact: balance × annual rate ÷ 12. */
export const monthInterest = (id: string, balance: Fact, rate: string): Fact => ({
  id,
  kind: "er_month_interest",
  inputs: { balance_fact: balance.id, rate },
  value: moneyString(new Decimal(balance.value as string).mul(rate).div(100).div(12)),
});

export const afterReduction = (id: string, of: Fact, percent: number): Fact => ({
  id,
  kind: "er_after_reduction",
  inputs: { of: of.id, percent },
  value: moneyString(new Decimal(of.value as string).mul(100 - percent).div(100)),
});

export const indexFeeOf = (id: string, amount: string, changePercent: string): Fact => ({
  id,
  kind: "er_index_fee",
  inputs: { amount, change: changePercent },
  value: moneyString(new Decimal(amount).mul(changePercent).div(100).div(2)),
});

export const monthsBetween = (id: string, from: ISODate, to: ISODate): Fact => ({
  id,
  kind: "er_months_between",
  inputs: { from, to },
  value: wholeMonthsBetween(from, to),
});

export const daysBetweenFact = (id: string, from: ISODate, to: ISODate): Fact => ({
  id,
  kind: "er_days_between",
  inputs: { from, to },
  value: daysBetween(from, to),
});

export const datePlusMonths = (id: string, from: ISODate, months: number): Fact => ({
  id,
  kind: "er_date_plus_months",
  inputs: { from, months },
  value: addMonths(from, months),
});

export const datePlusDays = (id: string, from: ISODate, days: number): Fact => {
  const [y, m, d] = from.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return { id, kind: "er_date_plus_days", inputs: { from, days }, value: t.toISOString().slice(0, 10) };
};

export const bucketOf = (months: number, linkage: "linked" | "unlinked") => bucketFor(months, linkage);
