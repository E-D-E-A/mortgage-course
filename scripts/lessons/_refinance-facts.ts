/**
 * Fact builders shared by lessons 7.4 and 7.5 (stage-7 author B; lesson 7.8 may import them). Not a lesson module:
 * build-data.ts loads only lesson-*.ts and check-*.ts. Every builder records the text forms
 * (checks/kinds/refinance.py reads them): the existing loan as metrics.py's track code plus the payments made, the
 * fees and the shared charge; the new loan as an offers.py offer pack.
 */
import Decimal from "decimal.js";
import type { Track } from "../../src/lib/calc/metrics.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import type { Forecast, Offer } from "../../src/lib/calc/offers.ts";
import { roundedString } from "../../src/lib/calc/rates.ts";
import {
  existingLoan,
  monthsAtPayment,
  newLoanOf,
  refinanceTest,
  stayStream,
  switchStream,
  switchSummary,
  tailOf,
  trajectory,
} from "../../src/lib/calc/refinance.ts";
import type { Fact } from "../build-data.ts";
import { enc } from "./lesson-3-8.ts";
import { forecastsCode, pack } from "./_offer-facts.ts";

/** An existing loan: its tracks (each with rounding set), the payments made on each, T for each, and a shared charge. */
export interface ExistingSpec {
  tracks: Track[];
  paid: number[];
  fees: string[];
  shared?: string;
}

export type Scope = "whole" | number;

const stayInputs = (s: ExistingSpec, scope: Scope) => ({
  tracks: enc(s.tracks.map((t) => ({ ...t, rounding: t.rounding ?? "exact" }))),
  paid: s.paid.join(";"),
  fees: s.fees.join(";"),
  shared: s.shared ?? "0",
  scope: String(scope),
});

const loanOf = (s: ExistingSpec) =>
  existingLoan(
    s.tracks.map((track, i) => ({ track: { ...track, rounding: track.rounding ?? "exact" }, paymentsMade: s.paid[i], fee: s.fees[i] })),
    s.shared ?? "0",
  );

const figuresOf = (s: ExistingSpec, scope: Scope) => {
  const loan = loanOf(s);
  return scope === "whole" ? loan.whole : loan.tracks[scope];
};

export type StayMeasure = "balance" | "fee" | "financed" | "months" | "first" | "total" | "irr_without" | "irr_with" | "rate_without" | "rate_with";

/** One figure of the existing loan, per track or whole. */
export const stay = (id: string, s: ExistingSpec, scope: Scope, measure: StayMeasure, decimals = 2): Fact => {
  const f = figuresOf(s, scope);
  const value =
    measure === "months"
      ? f.months
      : measure === "balance"
        ? moneyString(f.balance)
        : measure === "fee"
          ? moneyString(f.fee)
          : measure === "financed"
            ? moneyString(f.financed)
            : measure === "first"
              ? moneyString(f.first)
              : measure === "total"
                ? moneyString(f.total)
                : roundedString(measure === "irr_without" ? f.irrWithout : measure === "irr_with" ? f.irrWith : measure === "rate_without" ? f.expectedTotalRate : f.comparisonRate, decimals);
  return { id, kind: "ref_stay", inputs: { ...stayInputs(s, scope), measure, decimals }, value };
};

export type SwitchMeasure =
  | "new_first"
  | "new_total"
  | "new_months"
  | "new_loan"
  | "new_rate"
  | "monthly_gap"
  | "stay_total"
  | "switch_total"
  | "total_saving"
  | "cash_break_even"
  | "position_break_even"
  | "cash_at"
  | "gap_at"
  | "position_at"
  | "pv_saving"
  | "margin"
  | "worthwhile";

export interface SwitchOptions {
  /** Paid out of pocket on day 0 (the new loan's up-front charges; the exit fee too when it is not financed). */
  cash: string;
  /** "comparison": discount at the comparison rate (monthly IRR with T). A monthly percent otherwise. */
  disc?: "comparison" | string;
  /** The month, for cash_at / gap_at / position_at. */
  k?: number;
  decimals?: number;
}

/** One figure about staying versus switching to a new offer. */
export const sw = (id: string, s: ExistingSpec, scope: Scope, offer: Offer, forecasts: Forecast[], measure: SwitchMeasure, o: SwitchOptions): Fact => {
  const forecast = forecasts.find((f) => f.id === offer.forecast);
  if (!forecast) throw new Error(`no forecast ${offer.forecast}`);
  const loan = loanOf(s);
  const fig = scope === "whole" ? loan.whole : loan.tracks[scope];
  const tail = scope === "whole" ? { payments: loan.whole.payments, balances: loan.balances } : tailOf({ ...s.tracks[scope], rounding: s.tracks[scope].rounding ?? "exact" }, s.paid[scope]);
  const stayS = stayStream(fig.balance, tail.payments, tail.balances);
  const n = newLoanOf(offer, forecast);
  const next = switchStream(n);
  const sum = switchSummary(stayS, next, o.cash, o.disc === undefined ? undefined : o.disc === "comparison" ? fig.irrWith : o.disc);
  const path = trajectory(stayS, next, o.cash);
  const decimals = o.decimals ?? 2;
  const test = refinanceTest(fig.comparisonRate, n.expectedTotalRate);
  const money = (d: Decimal) => moneyString(d);
  const values: Record<SwitchMeasure, () => unknown> = {
    new_first: () => money(n.first),
    new_total: () => money(n.total),
    new_months: () => n.months,
    new_loan: () => money(n.loan),
    new_rate: () => roundedString(n.expectedTotalRate, decimals),
    monthly_gap: () => money(sum.monthlyGap),
    stay_total: () => money(sum.stayTotal),
    switch_total: () => money(sum.switchTotal),
    total_saving: () => money(sum.totalSaving),
    cash_break_even: () => sum.cashBreakEven,
    position_break_even: () => sum.positionBreakEven,
    cash_at: () => money(path[o.k ?? 0].cash),
    gap_at: () => money(path[o.k ?? 0].balanceGap),
    position_at: () => money(path[o.k ?? 0].position),
    pv_saving: () => (sum.presentValueSaving ? money(sum.presentValueSaving) : null),
    margin: () => roundedString(test.margin, decimals),
    worthwhile: () => test.worthwhile,
  };
  return {
    id,
    kind: "ref_switch",
    inputs: { ...stayInputs(s, scope), offer: pack(offer), forecasts: forecastsCode(forecasts), cash: o.cash, disc: o.disc ?? "", k: o.k ?? 0, measure, decimals },
    value: values[measure](),
  };
};

/** The months a new loan lasts when the payment stays what it is today. */
export const monthsKept = (id: string, amount: string, rate: string, payment: string): Fact => ({
  id,
  kind: "ref_months_at_payment",
  inputs: { amount, rate, payment },
  value: monthsAtPayment(amount, rate, payment),
});
