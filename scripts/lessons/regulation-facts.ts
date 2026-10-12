/**
 * Fact builders shared by lessons 4.4, 4.5 and 4.6 (author B). Each builder
 * computes its value with src/lib/calc (regulation.ts, affordability.ts,
 * ltv.ts) and names a kind that checks/kinds/ recomputes on its own.
 * Not a lesson module: build-data.ts only loads lesson-*.ts and check-*.ts.
 */
import Decimal from "decimal.js";
import { disposableIncome, type Obligation, obligationsToInput, paymentToIncome } from "../../src/lib/calc/affordability.ts";
import { ltvPercent } from "../../src/lib/calc/ltv.ts";
import { moneyString } from "../../src/lib/calc/money.ts";
import { percentString } from "../../src/lib/calc/percent.ts";
import {
  budgetMargin,
  checkRegulation,
  type DealType,
  largestPaymentForBudget,
  leftForLiving,
  maxLoanAt,
  maxPaymentAt,
  maxVariable,
  minFixed,
  perPerson,
  reducedPriceValue,
  variableSharePercent,
} from "../../src/lib/calc/regulation.ts";
import type { Fact } from "../build-data.ts";

const numbered = (prefix: string, values: string[]) => Object.fromEntries(values.map((v, n) => [`${prefix}_${n + 1}`, v]));

/** A teaching input in shekels: "1000000" → "1000000.00". */
export const given = (id: string, amount: string): Fact => ({ id, kind: "given", inputs: {}, value: moneyString(amount) });
/** A teaching input shown as written: a percent ("75"), a count, years. */
export const givenNumber = (id: string, value: string): Fact => ({ id, kind: "given", inputs: {}, value });

export const difference = (id: string, minuend: Fact, subtrahend: Fact): Fact => ({
  id,
  kind: "difference",
  inputs: { minuend: minuend.id, subtrahend: subtrahend.id },
  value: moneyString(new Decimal(minuend.value as string).minus(subtrahend.value as string)),
});

export const ltv = (id: string, loan: string, value: string): Fact => ({
  id,
  kind: "ltv_percent",
  inputs: { loan, value },
  value: percentString(ltvPercent(loan, value)),
});

export const maxLoan = (id: string, value: string, deal: DealType): Fact => ({
  id,
  kind: "reg_max_loan",
  inputs: { value, deal },
  value: moneyString(maxLoanAt(value, deal)),
});

export const reducedValue = (id: string, price: string, appraisal: string): Fact => ({
  id,
  kind: "reg_reduced_value",
  inputs: { price, appraisal },
  value: moneyString(reducedPriceValue(price, appraisal)),
});

export const maxPayment = (id: string, income: string, percent: string): Fact => ({
  id,
  kind: "reg_max_payment",
  inputs: { income, percent },
  value: moneyString(maxPaymentAt(income, percent)),
});

export const ratio = (id: string, payment: string, income: string): Fact => ({
  id,
  kind: "reg_ratio",
  inputs: { payment, income },
  value: percentString(paymentToIncome(payment, income)),
});

export const maxVar = (id: string, loan: string): Fact => ({
  id,
  kind: "reg_max_variable",
  inputs: { loan },
  value: moneyString(maxVariable(loan)),
});

export const minFix = (id: string, loan: string): Fact => ({
  id,
  kind: "reg_min_fixed",
  inputs: { loan },
  value: moneyString(minFixed(loan)),
});

export const varShare = (id: string, variable: string, loan: string): Fact => ({
  id,
  kind: "reg_variable_share",
  inputs: { variable, loan },
  value: percentString(variableSharePercent(variable, loan)),
});

export const months = (id: string, years: number): Fact => ({ id, kind: "reg_months", inputs: { years }, value: years * 12 });

/** Part of an amount at a percent, in money: 1,000,000 at 66.66% → 666,600. Checked by ltv.py's ltv_max_loan. */
export const atPercent = (id: string, value: string, ceiling: string): Fact => ({
  id,
  kind: "ltv_max_loan",
  inputs: { value, ceiling },
  value: moneyString(new Decimal(value).mul(ceiling).div(100)),
});

export interface CheckInput {
  deal: DealType;
  value: string;
  loan: string;
  payment: string;
  income: string;
  variable: string;
  termMonths: number;
}

/** All five lines at once. Rows: {id, kind, limit, actual, status, room}, as strings. */
export const check = (id: string, i: CheckInput): Fact => {
  const lines = checkRegulation({
    deal: i.deal,
    value: i.value,
    loan: i.loan,
    payment: i.payment,
    disposableIncome: i.income,
    variable: i.variable,
    termMonths: i.termMonths,
  });
  return {
    id,
    kind: "reg_check",
    inputs: { deal: i.deal, value: i.value, loan: i.loan, payment: i.payment, income: i.income, variable: i.variable, term_months: i.termMonths },
    value: lines.map((l) => ({
      id: l.id,
      kind: l.kind,
      limit: l.id === "term" ? l.limit.toFixed(0) : percentString(l.limit),
      actual: l.id === "term" ? l.actual.toFixed(0) : percentString(l.actual),
      status: l.status,
      room: l.id === "term" ? l.room.toFixed(0) : moneyString(l.room),
    })),
  };
};

/** amount × weight ÷ 100: the part of a loan a risk weight counts. */
export const weighted = (id: string, amount: string, weight: string): Fact => ({
  id,
  kind: "reg_weighted",
  inputs: { amount, weight },
  value: moneyString(new Decimal(amount).mul(weight).div(100)),
});

export const total = (id: string, amounts: string[]): Fact => ({
  id,
  kind: "reg_total",
  inputs: numbered("amount", amounts),
  value: moneyString(amounts.reduce((s, a) => s.plus(a), new Decimal(0))),
});

export const left = (id: string, net: string, out: string[]): Fact => ({
  id,
  kind: "reg_left",
  inputs: { net, ...numbered("out", out) },
  value: moneyString(leftForLiving(net, out)),
});

export const each = (id: string, amount: string, people: number): Fact => ({
  id,
  kind: "reg_per_person",
  inputs: { amount, people },
  value: moneyString(perPerson(amount, people)),
});

export const margin = (id: string, leftAmount: string, budget: string): Fact => ({
  id,
  kind: "reg_margin",
  inputs: { left: leftAmount, budget },
  value: moneyString(budgetMargin(leftAmount, budget)),
});

export const budgetMax = (id: string, net: string, out: string[], budget: string): Fact => ({
  id,
  kind: "reg_budget_max_payment",
  inputs: { net, ...numbered("out", out), budget },
  value: moneyString(largestPaymentForBudget(net, out, budget)),
});

export const monthlyFromYearly = (id: string, yearly: string): Fact => ({
  id,
  kind: "reg_monthly_from_yearly",
  inputs: { yearly },
  value: moneyString(new Decimal(yearly).div(12)),
});

/** A table of disposable incomes and the largest payment at each percent: columns at_1, at_2, … */
export const paymentTable = (id: string, incomes: string[], percents: string[]): Fact => ({
  id,
  kind: "reg_payment_table",
  inputs: { ...numbered("income", incomes), ...numbered("percent", percents) },
  value: incomes.map((inc, n) => ({
    period: n + 1,
    income: moneyString(inc),
    ...Object.fromEntries(percents.map((p, k) => [`at_${k + 1}`, moneyString(maxPaymentAt(inc, p))])),
  })),
});

export const variableTable = (id: string, loans: string[]): Fact => ({
  id,
  kind: "reg_variable_table",
  inputs: numbered("loan", loans),
  value: loans.map((loan, n) => ({
    period: n + 1,
    loan: moneyString(loan),
    max_variable: moneyString(maxVariable(loan)),
    min_fixed: moneyString(minFixed(loan)),
  })),
});

/** Rows [net income, all monthly payments out, people]: what is left, and per person. */
export const livingTable = (id: string, rows: [string, string, number][]): Fact => ({
  id,
  kind: "reg_living_table",
  inputs: Object.fromEntries(rows.flatMap(([net, out, people], n) => [[`net_${n + 1}`, net], [`out_${n + 1}`, out], [`people_${n + 1}`, people]])),
  value: rows.map(([net, out, people], n) => {
    const rest = leftForLiving(net, [out]);
    return { period: n + 1, net: moneyString(net), out: moneyString(out), left: moneyString(rest), people: String(people), per_person: moneyString(perPerson(rest, people)) };
  }),
});

/** Disposable income as lesson 4.2 counts it (affordability.ts): recognised income minus the obligations that count against it. Checked by affordability.py. */
export const disposable = (id: string, recognised: string, obligations: Obligation[]): Fact => ({
  id,
  kind: "aff_disposable",
  inputs: { recognised, obligations: obligationsToInput(obligations) },
  value: moneyString(disposableIncome(recognised, obligations)),
});
