/**
 * Fact builders for lessons 4.1–4.3 (and any later lesson that shows
 * recognised income, obligations or the payment-to-income ratio). Each builder
 * computes its value with src/lib/calc/affordability.ts and records the inputs
 * that checks/kinds/affordability.py recomputes it from. Not a lesson module
 * itself: build-data.ts loads only lesson-*.ts and check-*.ts.
 */
import Decimal from "decimal.js";
import {
  addedToPayment,
  assessmentMonthly,
  type AssessmentMethod,
  averageMonthly,
  classifyObligation,
  deductedObligations,
  disposableIncome,
  monthlyFromAnnual,
  monthsUntilDrop,
  type Obligation,
  obligationsToInput,
  paymentToIncome,
  payslipNet,
  payslipNetToPay,
  type QualifyingTrack,
  qualifyingPayment,
  ratioPayment,
} from "../../src/lib/calc/affordability.ts";
import { monthlyTotal } from "../../src/lib/calc/household.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString, sharePercent } from "../../src/lib/calc/percent.ts";
import type { Fact } from "../build-data.ts";

const list = (xs: (string | number)[]) => xs.map(String).join("|");

export const given = (id: string, value: string | number): Fact => ({ id, kind: "given", inputs: {}, value });

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export const sum = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "hh_sum",
  inputs: { amounts: list(amounts) },
  value: moneyString(monthlyTotal(amounts)),
});

/** part as a percent of whole, two decimals (percent.ts). */
export const share = (id: string, part: string, whole: string): Fact => ({
  id,
  kind: "share_percent",
  inputs: { part, whole },
  value: percentString(sharePercent(part, whole)),
});

export const net = (id: string, gross: string, mandatory: string[]): Fact => ({
  id,
  kind: "aff_payslip_net",
  inputs: { gross, mandatory: list(mandatory) },
  value: moneyString(payslipNet(gross, mandatory)),
});

export const netToPay = (id: string, netPay: string, other: string[]): Fact => ({
  id,
  kind: "aff_net_to_pay",
  inputs: { net: netPay, other: list(other) },
  value: moneyString(payslipNetToPay(netPay, other)),
});

export const average = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "aff_average",
  inputs: { amounts: list(amounts) },
  value: moneyString(averageMonthly(amounts)),
});

export const monthly = (id: string, annual: string): Fact => ({
  id,
  kind: "aff_annual_to_monthly",
  inputs: { annual },
  value: moneyString(monthlyFromAnnual(annual)),
});

export const assessment = (id: string, annuals: string[], method: AssessmentMethod): Fact => ({
  id,
  kind: "aff_assessment_monthly",
  inputs: { annuals: list(annuals), method },
  value: moneyString(assessmentMonthly(annuals, method)),
});

export const placement = (id: string, o: Obligation): Fact => ({
  id,
  kind: "aff_placement",
  inputs: { obligation: obligationsToInput([o]) },
  value: classifyObligation(o).placement,
});

export const deducted = (id: string, obs: Obligation[]): Fact => ({
  id,
  kind: "aff_deducted",
  inputs: { obligations: obligationsToInput(obs) },
  value: moneyString(deductedObligations(obs)),
});

export const added = (id: string, obs: Obligation[]): Fact => ({
  id,
  kind: "aff_added",
  inputs: { obligations: obligationsToInput(obs) },
  value: moneyString(addedToPayment(obs)),
});

export const disposable = (id: string, recognised: string, obs: Obligation[]): Fact => ({
  id,
  kind: "aff_disposable",
  inputs: { recognised, obligations: obligationsToInput(obs) },
  value: moneyString(disposableIncome(recognised, obs)),
});

export const payment = (id: string, newPayment: string, obs: Obligation[]): Fact => ({
  id,
  kind: "aff_ratio_payment",
  inputs: { new_payment: newPayment, obligations: obligationsToInput(obs) },
  value: moneyString(ratioPayment(newPayment, obs)),
});

/** The ratio, percent with two decimals, from a payment and a disposable income as printed. */
export const ratio = (id: string, pay: string, disp: string): Fact => ({
  id,
  kind: "aff_ratio",
  inputs: { payment: pay, disposable: disp },
  value: percentString(paymentToIncome(pay, disp)),
});

export const ratioFromParts = (id: string, recognised: string, obs: Obligation[], newPayment: string): Fact => ({
  id,
  kind: "aff_ratio_from_parts",
  inputs: { recognised, obligations: obligationsToInput(obs), new_payment: newPayment },
  value: percentString(paymentToIncome(ratioPayment(newPayment, obs), disposableIncome(recognised, obs))),
});

export const untilDrop = (id: string, monthsLeft: number): Fact => ({
  id,
  kind: "aff_months_until_drop",
  inputs: { months_left: monthsLeft },
  value: monthsUntilDrop(monthsLeft),
});

export const qualifying = (id: string, t: QualifyingTrack): Fact => {
  const inputs: Record<string, string | number> = {
    amount: String(t.amount),
    rate_percent: String(t.ratePercent),
    months: t.months,
    method: t.method ?? "spitzer",
  };
  if (t.graceMonths) inputs.grace_months = t.graceMonths;
  if (t.grace) inputs.grace = t.grace;
  if (t.bullet) inputs.bullet = "yes";
  return { id, kind: "aff_qualifying_payment", inputs, value: moneyString(qualifyingPayment(t)) };
};

export interface PayslipMonth {
  name: string;
  gross: string;
  mandatory: string[];
  other: string[];
}

export const payslipTable = (id: string, months: PayslipMonth[]): Fact => ({
  id,
  kind: "aff_payslip_table",
  inputs: Object.fromEntries(
    months.flatMap((m, k) => [
      [`name_${k + 1}`, m.name],
      [`gross_${k + 1}`, m.gross],
      [`mandatory_${k + 1}`, list(m.mandatory)],
      [`other_${k + 1}`, list(m.other)],
    ]),
  ),
  value: months.map((m) => {
    const n = payslipNet(m.gross, m.mandatory);
    return {
      period: m.name,
      gross: moneyString(m.gross),
      mandatory: moneyString(monthlyTotal(m.mandatory)),
      net: moneyString(n),
      other: moneyString(monthlyTotal(m.other)),
      net_to_pay: moneyString(payslipNetToPay(n, m.other)),
    };
  }),
});

export const obligationTable = (id: string, items: { name: string; ob: Obligation }[]): Fact => ({
  id,
  kind: "aff_obligation_table",
  inputs: {
    obligations: obligationsToInput(items.map((x) => x.ob)),
    ...Object.fromEntries(items.map((x, k) => [`name_${k + 1}`, x.name])),
  },
  value: items.map(({ name, ob }) => {
    const where = classifyObligation(ob).placement;
    return {
      period: name,
      monthly: moneyString(ob.monthly),
      months: ob.monthsLeft === null ? "-" : ob.monthsLeft,
      counted: moneyString(where === "income" ? ob.monthly : 0),
      placement: where,
    };
  }),
});

export const ratioTable = (id: string, rows: { name: string; recognised: string; obligations: Obligation[]; newPayment: string }[]): Fact => ({
  id,
  kind: "aff_ratio_table",
  inputs: Object.fromEntries(
    rows.flatMap((r, k) => [
      [`name_${k + 1}`, r.name],
      [`recognised_${k + 1}`, r.recognised],
      [`obligations_${k + 1}`, obligationsToInput(r.obligations)],
      [`new_payment_${k + 1}`, r.newPayment],
    ]),
  ),
  value: rows.map((r) => {
    const disp = disposableIncome(r.recognised, r.obligations);
    const pay = ratioPayment(r.newPayment, r.obligations);
    return {
      period: r.name,
      recognised: moneyString(r.recognised),
      deducted: moneyString(deductedObligations(r.obligations)),
      disposable: moneyString(disp),
      payment: moneyString(pay),
      ratio: percentString(paymentToIncome(pay, disp)),
    };
  }),
});
