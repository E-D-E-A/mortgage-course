/**
 * Directive 329's limits as one checker, and the living budget — the
 * arithmetic behind lessons 4.4 (the five lines), 4.5 (three kinds of number)
 * and 4.6 (what is left for the family). Lesson 4.15 (the feasibility page)
 * imports it too.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 *   LTV_CEILINGS, PTI_LIMIT, PTI_CAPITAL_THRESHOLD, VARIABLE_SHARE,
 *   MAX_TERM_MONTHS          the numbers, as the team transcribed them (below)
 *   RULES                    the five lines, each with its kind and its label
 *   ltvCeiling(deal)         the financing ceiling of a deal type, "75"
 *   maxLoanAt(value, deal)   the largest loan the ceiling allows, floored to the agora
 *   reducedPriceValue(...)   the value a reduced-price home may be measured against
 *   maxPaymentAt(disp, pct)  the largest payment a ratio allows, floored to the agora
 *   maxVariable(loan)        the most of a loan that may carry a changing rate, floored
 *   variableSharePercent(v, loan)   the variable part as a percent of the loan
 *   checkRegulation(input)   all five lines at once: a LineResult per line
 *   leftForLiving(net, out)  what stays each month after every payment the family makes
 *   perPerson(amount, n)     an amount per member of the household
 *   withMinus(text)          a formatted number with the course's minus sign "−" in place of the hyphen-minus (and the LRM mark Intl adds)
 *   largestPaymentForBudget(net, other, budget)   the payment the family's own budget allows
 *
 * The payment-to-income ratio itself is lesson 4.3's, and lives in
 * affordability.ts (author A): this module imports it rather than repeating it.
 *
 * ── The numbers, and how sure we are of them ─────────────────────────────
 *
 * Directive 329 of the Bank of Israel, "מגבלות למתן הלוואות לדיור". None of it
 * was read in the directive itself: the official sites are blocked in the
 * course's environment. The team's transcription is Brain page 7503881 (J-090,
 * updated 2026-10-08); search summaries of versions 11 and 12 and of the
 * English text say the same (research/notes/official-sources.md, section 1).
 *
 *   financing ratio   ≤ 75% only home · ≤ 70% replacement home · ≤ 50% a further home
 *                     ≤ 50% a loan for any purpose (the base rule; a 2025 relief
 *                     is read two ways in the summaries, so the course does not use it)
 *   payment ratio     a bank does not approve a loan whose ratio "exceeds" 50%:
 *                     exactly 50.00% is allowed (Brain, ENG-223 research)
 *   capital threshold above 40% the bank gives the loan a 100% risk weight —
 *                     not a ban (Brain 7503881; the summaries cite Directive 203)
 *   variable share    at most two-thirds of the loan at a rate that can change,
 *                     so at least a third fixed. Two-thirds exactly, not 66.66%:
 *                     the check is variable × 3 ≤ loan × 2, with no rounding
 *   term              at most 30 years to the final repayment
 *
 * Amounts are shekels as strings or Decimals; percents are strings ("75").
 * Results are exact Decimals, except the "largest allowed" amounts, which are
 * rounded DOWN to the agora: a maximum rounded up would cross its own line.
 * Recomputed independently in checks/kinds/regulation.py.
 */
import Decimal from "decimal.js";
import { paymentToIncome } from "./affordability.ts";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);

function nonNegative(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.isNeg()) throw new RangeError(`${name} cannot be negative, got ${d.toString()}`);
  return d;
}

function positive(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.lte(0)) throw new RangeError(`${name} must be more than zero, got ${d.toString()}`);
  return d;
}

/** Rounded down to the agora: the safe side of a maximum. */
export function floorAgora(value: Numeric): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_DOWN);
}

/** The course writes a negative amount with "−" (U+2212), not the hyphen-minus Intl uses: "−2,950.00 ₪". Display only. */
export function withMinus(text: string): string {
  return text.replace(/^[\u200e\u200f]?-/, "−").replace(/(\s)[\u200e\u200f]?-(?=\d)/g, "$1−");
}

// ── The numbers ────────────────────────────────────────────────────────────

/** The deal types the financing ceiling depends on. */
export type DealType = "only_home" | "replacement" | "investment" | "any_purpose";

/** Financing ceilings, percent of the value (see the header for the source). */
export const LTV_CEILINGS: Record<DealType, string> = {
  only_home: "75",
  replacement: "70",
  investment: "50",
  any_purpose: "50",
};

/** The payment ratio a bank may not exceed, percent. */
export const PTI_LIMIT = "50";
/** Above this payment ratio the loan carries a 100% risk weight; percent. A capital threshold, not a ban. */
export const PTI_CAPITAL_THRESHOLD = "40";
/** The risk weight above the threshold, percent. */
export const RISK_WEIGHT_ABOVE_THRESHOLD = "100";
/** The most of the loan that may be at a changing rate: two-thirds, as a fraction. */
export const VARIABLE_SHARE = { numerator: 2, denominator: 3 } as const;
/** The longest term to the final repayment: 30 years. */
export const MAX_TERM_YEARS = 30;
export const MAX_TERM_MONTHS = MAX_TERM_YEARS * 12;

/** What kind of number a line is (lesson 4.5): a ban, or a line where the bank's capital cost rises. */
export type LineKind = "regulatory_limit" | "capital_threshold";
export type LineId = "ltv" | "pti" | "capital" | "variable" | "term";

export interface Rule {
  id: LineId;
  kind: LineKind;
  /** The line's name in Hebrew, as the course writes it. */
  label: string;
  /** What crossing it means, in Hebrew. */
  crossing: string;
}

/** The five lines, in the order the course shows them. */
export const RULES: readonly Rule[] = [
  { id: "ltv", kind: "regulatory_limit", label: "שיעור מימון", crossing: "אסור: הבנק לא נותן הלוואה מעל התקרה" },
  { id: "pti", kind: "regulatory_limit", label: "יחס החזר — התקרה", crossing: "אסור: הבנק לא מאשר יחס החזר מעל 50%" },
  { id: "capital", kind: "capital_threshold", label: "יחס החזר — סף ההון", crossing: "מותר, אבל הבנק מחזיק יותר הון כנגד ההלוואה" },
  { id: "variable", kind: "regulatory_limit", label: "החלק בריבית משתנה", crossing: "אסור: לפחות שליש מההלוואה בריבית קבועה" },
  { id: "term", kind: "regulatory_limit", label: "תקופה", crossing: "אסור: עד 30 שנה לפירעון הסופי" },
];

// ── The financing ratio ────────────────────────────────────────────────────

export function ltvCeiling(deal: DealType): string {
  const c = LTV_CEILINGS[deal];
  if (c === undefined) throw new RangeError(`unknown deal type: ${deal}`);
  return c;
}

/** The loan as a percent of the value: loan ÷ value × 100 (exact). */
export function ltvPercentOf(loan: Numeric, value: Numeric): Decimal {
  return nonNegative(loan, "the loan").div(positive(value, "the value")).mul(HUNDRED);
}

/** The largest loan a deal's ceiling allows on a value: value × ceiling ÷ 100, floored to the agora. */
export function maxLoanAt(value: Numeric, deal: DealType): Decimal {
  return floorAgora(nonNegative(value, "the value").mul(ltvCeiling(deal)).div(HUNDRED));
}

/**
 * A reduced-price home (מחיר למשתכן, דירה בהנחה): the bank may measure the
 * financing ratio against an appraiser's value instead of the discounted
 * price, up to a cap the directive sets. The cap's amount is not known to the
 * course; pass it when it is, or leave it out and the appraisal is used as is.
 * Never below the price: the rule lets the value be higher, not lower.
 */
export function reducedPriceValue(price: Numeric, appraisal: Numeric, cap?: Numeric): Decimal {
  const p = positive(price, "the price");
  let a = positive(appraisal, "the appraisal");
  if (cap !== undefined) a = Decimal.min(a, positive(cap, "the cap"));
  return Decimal.max(p, a);
}

// ── The payment ratio ──────────────────────────────────────────────────────

/** The largest payment a ratio allows on a disposable income: income × percent ÷ 100, floored to the agora. */
export function maxPaymentAt(disposableIncome: Numeric, percent: Numeric): Decimal {
  return floorAgora(positive(disposableIncome, "the disposable income").mul(nonNegative(percent, "the percent")).div(HUNDRED));
}

// ── The variable share ─────────────────────────────────────────────────────

/** The most of a loan that may be at a changing rate: two-thirds, floored to the agora. */
export function maxVariable(loan: Numeric): Decimal {
  return floorAgora(nonNegative(loan, "the loan").mul(VARIABLE_SHARE.numerator).div(VARIABLE_SHARE.denominator));
}

/** The least of a loan that must be fixed: the loan minus the most that may vary. */
export function minFixed(loan: Numeric): Decimal {
  return nonNegative(loan, "the loan").minus(maxVariable(loan));
}

/** The variable part as a percent of the loan (exact). */
export function variableSharePercent(variable: Numeric, loan: Numeric): Decimal {
  return nonNegative(variable, "the variable part").div(positive(loan, "the loan")).mul(HUNDRED);
}

/** Within two-thirds exactly: variable × 3 ≤ loan × 2. */
export function variableWithin(variable: Numeric, loan: Numeric): boolean {
  return nonNegative(variable, "the variable part")
    .mul(VARIABLE_SHARE.denominator)
    .lte(nonNegative(loan, "the loan").mul(VARIABLE_SHARE.numerator));
}

// ── All five lines ─────────────────────────────────────────────────────────

export interface RegulationInput {
  deal: DealType;
  /** The value the financing ratio is measured against (the price, unless the lesson says otherwise). */
  value: Numeric;
  loan: Numeric;
  /** The payment that goes into the ratio (lesson 4.3), and the disposable income it is divided by. */
  payment: Numeric;
  disposableIncome: Numeric;
  /** The part of the loan at a rate that can change during the loan — any track that is not fixed for its whole life. */
  variable: Numeric;
  /** The longest track's term, in months: the final repayment. */
  termMonths: number;
}

/** "within": on the allowed side. "over": a ban is crossed. "above": the capital threshold is crossed — allowed. */
export type LineStatus = "within" | "over" | "above";

export interface LineResult {
  id: LineId;
  kind: LineKind;
  /** The line, in its own unit: percent for the ratios, months for the term. */
  limit: Decimal;
  /** The case's number in the same unit (exact; round for display). */
  actual: Decimal;
  status: LineStatus;
  /**
   * How far the case is from the line, in money or months: positive is room
   * left, negative is how much over. ltv: shekels of loan; pti, capital:
   * shekels of monthly payment; variable: shekels of variable loan; term: months.
   */
  room: Decimal;
}

export function checkRegulation(input: RegulationInput): LineResult[] {
  const value = positive(input.value, "the value");
  const loan = positive(input.loan, "the loan");
  const payment = nonNegative(input.payment, "the payment");
  const income = positive(input.disposableIncome, "the disposable income");
  const variable = nonNegative(input.variable, "the variable part");
  if (variable.gt(loan)) throw new RangeError("the variable part is larger than the loan");
  if (!Number.isInteger(input.termMonths) || input.termMonths <= 0) throw new RangeError("the term is a whole number of months");

  const ceiling = new Decimal(ltvCeiling(input.deal));
  const ltv = ltvPercentOf(loan, value);
  const ratio = paymentToIncome(payment, income);
  const pti = new Decimal(PTI_LIMIT);
  const threshold = new Decimal(PTI_CAPITAL_THRESHOLD);

  return [
    {
      id: "ltv",
      kind: "regulatory_limit",
      limit: ceiling,
      actual: ltv,
      status: ltv.gt(ceiling) ? "over" : "within",
      room: maxLoanAt(value, input.deal).minus(loan),
    },
    {
      id: "pti",
      kind: "regulatory_limit",
      limit: pti,
      actual: ratio,
      status: ratio.gt(pti) ? "over" : "within",
      room: maxPaymentAt(income, pti).minus(payment),
    },
    {
      id: "capital",
      kind: "capital_threshold",
      limit: threshold,
      actual: ratio,
      status: ratio.gt(threshold) ? "above" : "within",
      room: maxPaymentAt(income, threshold).minus(payment),
    },
    {
      id: "variable",
      kind: "regulatory_limit",
      limit: new Decimal(VARIABLE_SHARE.numerator).div(VARIABLE_SHARE.denominator).mul(HUNDRED),
      actual: variableSharePercent(variable, loan),
      status: variableWithin(variable, loan) ? "within" : "over",
      room: maxVariable(loan).minus(variable),
    },
    {
      id: "term",
      kind: "regulatory_limit",
      limit: new Decimal(MAX_TERM_MONTHS),
      actual: new Decimal(input.termMonths),
      status: input.termMonths > MAX_TERM_MONTHS ? "over" : "within",
      room: new Decimal(MAX_TERM_MONTHS - input.termMonths),
    },
  ];
}

/** True when no ban is crossed. The capital threshold does not count: crossing it is allowed. */
export function passesAllLimits(lines: LineResult[]): boolean {
  return lines.every((l) => l.status !== "over");
}

// ── The living budget (lesson 4.6) ─────────────────────────────────────────

/**
 * What stays each month after every payment the family actually makes: the
 * net income minus the mortgage payment and every other loan or fixed payment —
 * including the ones the ratio leaves out (an obligation with 18 months or less
 * to run is still paid until it ends). Negative when the payments are more than the income.
 */
export function leftForLiving(netIncome: Numeric, paymentsOut: Numeric[]): Decimal {
  return paymentsOut.reduce<Decimal>((left, p) => left.minus(nonNegative(p, "a payment")), nonNegative(netIncome, "the net income"));
}

/** An amount per member of the household (exact; round for display). */
export function perPerson(amount: Numeric, people: number): Decimal {
  if (!Number.isInteger(people) || people <= 0) throw new RangeError("the household has a whole number of people, at least one");
  return new Decimal(amount).div(people);
}

/** What is left after the living budget: positive is a margin, negative a shortfall. */
export function budgetMargin(left: Numeric, livingBudget: Numeric): Decimal {
  return new Decimal(left).minus(nonNegative(livingBudget, "the living budget"));
}

/**
 * The largest mortgage payment the family's own budget allows: the net income,
 * minus the other payments, minus the living budget. Zero when nothing is left.
 */
export function largestPaymentForBudget(netIncome: Numeric, otherPayments: Numeric[], livingBudget: Numeric): Decimal {
  const room = budgetMargin(leftForLiving(netIncome, otherPayments), livingBudget);
  return room.isNeg() ? new Decimal(0) : room;
}
