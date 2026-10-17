/**
 * Affordability — the arithmetic behind lessons 4.1 (recognised income), 4.2
 * (obligations and disposable income) and 4.3 (the payment-to-income ratio).
 * Lesson 4.4 (regulation.ts), the 4.15 feasibility page and stage 6 import it.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 * Recognised income (4.1)
 *   payslipNet(gross, mandatory[])        שכר נטו = ברוטו − ניכויי החובה
 *   payslipNetToPay(net, other[])         נטו לתשלום = שכר נטו − הניכויים האחרים
 *   averageMonthly(amounts[])             the mean of several months, exact
 *   monthlyFromAnnual(annual)             an annual amount ÷ 12
 *   assessmentMonthly(annualNets[], how)  a self-employed person's monthly income
 *                                         from tax assessments, oldest first:
 *                                         "latest" (the last one ÷ 12) or
 *                                         "average" (all of them ÷ 12 × count)
 *   IncomeLine {label, declared, recognised, status}   one income, as Mogi keeps it
 *   declaredIncome(lines)                 Σ declared
 *   recognisedIncome(lines, {countReview}) Σ recognised of the "included" lines
 *                                         (and "review" ones only when asked)
 *
 * Obligations (4.2)
 *   OBLIGATION_MONTHS = 18                the line: more than 18 months left
 *   SAME_PROPERTY_RULE_FROM = "2026-10-01"
 *   Obligation {label?, kind, monthly, monthsLeft, rentContinues?, mortgage?}
 *   overMonthsLine(monthsLeft)            true when more than 18 months are left;
 *                                         an unknown end (null) counts, flagged
 *   classifyObligation(o)                 where a payment goes: "income" (taken off
 *                                         the income), "payment" (added to the new
 *                                         payment) or "none", with the reason
 *   monthsUntilDrop(monthsLeft)           payments still to make before an
 *                                         obligation stops counting (0 if it doesn't)
 *   deductedObligations(list)             Σ of the obligations taken off the income
 *   addedToPayment(list)                  Σ of the obligations added to the payment
 *   disposableIncome(recognised, list)    recognised income − deducted obligations
 *   obligationsToInput(list) / obligationsFromInput(text)
 *                                         the "kind,monthly,months[,flag]|…" text a
 *                                         fact stores, so a lesson's facts and the
 *                                         Python check read the same list
 *
 * The ratio (4.3)
 *   QualifyingTrack {amount, ratePercent, months, method?, graceMonths?, grace?, bullet?}
 *   qualifyingPayment(track)              the payment the ratio uses for one track:
 *                                         ordinary → the first payment on the full
 *                                         amount; with grace → the payment after it;
 *                                         bullet or balloon → the monthly interest
 *   ratioPayment(newPayment, list)        the new payment + same-property payments
 *   paymentToIncome(payment, disposable)  payment ÷ disposable × 100, exact percent
 *   affordability({income, obligations, newPayment})   the whole calculation at once
 *
 * The rules, and how sure we are of them
 *   - Recognised income: Mogi's decision (Brain 67436545, Eylon 2026-10-07, Eden
 *     2026-10-08): keep the declared amount, the recognised amount and a status
 *     (included / requires review / excluded); an annual net amount ÷ 12; a gross
 *     amount alone is never converted to net. How a self-employed person's income
 *     is recognised has no settled rule: both methods here are teaching options
 *     (field knowledge awaiting Eylon; one bank's public questionnaire).
 *   - Obligations: more than 18 months left → taken off the income; rent counts
 *     whatever is left on the lease when the borrower will not live in the home
 *     bought; an unknown end date counts (and is flagged); never counted twice.
 *     Directive 329, Appendix A, as the team transcribed it —
 *     not checked against the directive. Exactly 18 months is NOT counted here
 *     ("more than"); one bank's questionnaire says "a year and a half or more",
 *     so the edge is an open question.
 *   - An existing mortgage: repaid → not counted; on the same property as the new
 *     loan (kept, or moved there — גרירה) → its payment is added to the new
 *     payment if more than 18 months are left (from 2026-10-01, as transcribed);
 *     on another property → taken off the income like any obligation.
 *   - The ratio = the relevant monthly payment ÷ recognised disposable income ×
 *     100 (Mogi's decision Q10, same page). The limits on it (50%, 40%) are
 *     regulation.ts's, lesson 4.4.
 *
 * Amounts are shekels as strings or Decimals; percents are strings ("4.6").
 * Results are exact Decimals: money is rounded to the agora only for display
 * (money.ts), a percent only by percentString (percent.ts). Recomputed
 * independently in checks/kinds/affordability.py. Exports are stable: other
 * lessons import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { annuityPayment, monthInterest } from "./amortization.ts";

export type Numeric = Decimal.Value;

const HUNDRED = new Decimal(100);
const TWELVE = new Decimal(12);

function nonNegative(value: Numeric, name: string): Decimal {
  const d = new Decimal(value);
  if (d.isNeg()) throw new RangeError(`${name} cannot be negative, got ${d.toString()}`);
  return d;
}

function sum(amounts: Numeric[]): Decimal {
  return amounts.reduce<Decimal>((s, a) => s.plus(a), new Decimal(0));
}

// ── Recognised income (4.1) ─────────────────────────────────────────────────

/** שכר נטו: gross pay minus the mandatory deductions (income tax, national insurance, health tax, the employee's pension). */
export function payslipNet(gross: Numeric, mandatory: Numeric[]): Decimal {
  return nonNegative(gross, "gross pay").minus(sum(mandatory));
}

/** נטו לתשלום: the net pay minus the other deductions on the payslip (an employer loan, union dues). */
export function payslipNetToPay(net: Numeric, other: Numeric[]): Decimal {
  return new Decimal(net).minus(sum(other));
}

/** The mean of several monthly amounts: (8,150 + 8,200 + 8,250) ÷ 3 = 8,200. Exact. */
export function averageMonthly(amounts: Numeric[]): Decimal {
  if (amounts.length === 0) throw new RangeError("an average needs at least one month");
  return sum(amounts).div(amounts.length);
}

/** An annual amount as a monthly one: annual ÷ 12. */
export function monthlyFromAnnual(annual: Numeric): Decimal {
  return new Decimal(annual).div(TWELVE);
}

export type AssessmentMethod = "latest" | "average";

/**
 * A self-employed person's monthly income from net annual amounts in tax
 * assessments, oldest first. "latest": the last assessment ÷ 12. "average":
 * all of them together ÷ (12 × how many). Neither is a settled rule.
 */
export function assessmentMonthly(annualNets: Numeric[], method: AssessmentMethod): Decimal {
  if (annualNets.length === 0) throw new RangeError("at least one assessment is needed");
  if (method === "latest") return monthlyFromAnnual(annualNets[annualNets.length - 1]);
  return sum(annualNets).div(TWELVE.mul(annualNets.length));
}

/** Mogi's three statuses for an income: counted, needs checking, not counted. */
export type IncomeStatus = "included" | "review" | "excluded";

/** One monthly income, as Mogi keeps it: what the borrower said, what is recognised, and the status. */
export interface IncomeLine {
  label: string;
  declared: Numeric;
  recognised: Numeric;
  status: IncomeStatus;
}

export function declaredIncome(lines: IncomeLine[]): Decimal {
  return sum(lines.map((l) => l.declared));
}

/** Σ recognised amounts of the included lines; "review" lines count only with countReview. */
export function recognisedIncome(lines: IncomeLine[], options: { countReview?: boolean } = {}): Decimal {
  return sum(
    lines
      .filter((l) => l.status === "included" || (options.countReview === true && l.status === "review"))
      .map((l) => l.recognised),
  );
}

// ── Obligations (4.2) ───────────────────────────────────────────────────────

/** An obligation counts when MORE than this many months of payments are left. */
export const OBLIGATION_MONTHS = 18;

/** The same-property rule applies from this date (as the team transcribed it; not verified). */
export const SAME_PROPERTY_RULE_FROM = "2026-10-01";

export type ObligationKind = "loan" | "leasing" | "alimony" | "rent" | "mortgage" | "other";

/** Where an existing mortgage stands after the new loan. */
export type MortgagePosition = "repaid" | "same_property" | "other_property";

export interface Obligation {
  label?: string;
  kind: ObligationKind;
  /** The monthly payment, shekels. */
  monthly: Numeric;
  /** Payments still to make; null when the end date is not known. */
  monthsLeft: number | null;
  /** Rent only: true when the borrowers keep paying it after the purchase (they will not live in the home bought). */
  rentContinues?: boolean;
  /** Mortgage only: where it stands after the new loan. Default "other_property". */
  mortgage?: MortgagePosition;
}

export type Placement = "income" | "payment" | "none";

export type ObligationReason =
  | "over_months" // more than 18 months left: counts
  | "within_months" // 18 months or fewer: does not count
  | "no_end_date" // end unknown: counts, conservatively, and is flagged
  | "rent_continues" // rent that goes on after the purchase: counts, whatever is left on the lease
  | "rent_ends" // rent that stops when they move into the home bought: does not count
  | "repaid" // an existing mortgage repaid in the deal
  | "same_property"; // an existing mortgage on the same property: goes to the payment side

export interface ObligationVerdict {
  placement: Placement;
  reason: ObligationReason;
  /** True when the verdict rests on an assumption the advisor should check (no end date). */
  flagged: boolean;
}

/** More than 18 months left. An unknown end (null) is treated as more, conservatively. */
export function overMonthsLine(monthsLeft: number | null): boolean {
  if (monthsLeft === null) return true;
  if (!Number.isInteger(monthsLeft) || monthsLeft < 0) throw new RangeError(`months left must be a whole number ≥ 0, got ${monthsLeft}`);
  return monthsLeft > OBLIGATION_MONTHS;
}

/** How many more payments until an obligation stops counting: 26 left → 8. Zero when it already does not count. */
export function monthsUntilDrop(monthsLeft: number): number {
  if (!Number.isInteger(monthsLeft) || monthsLeft < 0) throw new RangeError(`months left must be a whole number ≥ 0, got ${monthsLeft}`);
  return Math.max(0, monthsLeft - OBLIGATION_MONTHS);
}

/** Where one obligation goes in the calculation, and why. */
export function classifyObligation(o: Obligation): ObligationVerdict {
  nonNegative(o.monthly, "a monthly payment");
  if (o.kind === "rent") {
    return o.rentContinues
      ? { placement: "income", reason: "rent_continues", flagged: false }
      : { placement: "none", reason: "rent_ends", flagged: false };
  }
  if (o.kind === "mortgage" && o.mortgage === "repaid") return { placement: "none", reason: "repaid", flagged: false };
  const flagged = o.monthsLeft === null;
  if (!overMonthsLine(o.monthsLeft)) return { placement: "none", reason: "within_months", flagged: false };
  if (o.kind === "mortgage" && o.mortgage === "same_property") return { placement: "payment", reason: "same_property", flagged };
  return { placement: "income", reason: flagged ? "no_end_date" : "over_months", flagged };
}

function placed(list: Obligation[], where: Placement): Decimal {
  return sum(list.filter((o) => classifyObligation(o).placement === where).map((o) => o.monthly));
}

/** Σ of the obligations taken off the income. */
export function deductedObligations(list: Obligation[]): Decimal {
  return placed(list, "income");
}

/** Σ of the existing payments added to the new payment (a mortgage on the same property). */
export function addedToPayment(list: Obligation[]): Decimal {
  return placed(list, "payment");
}

/** Disposable income as the bank counts it: recognised income − the obligations that count against it. */
export function disposableIncome(recognised: Numeric, list: Obligation[]): Decimal {
  return new Decimal(recognised).minus(deductedObligations(list));
}

/**
 * The text a fact stores for a list of obligations, one per "|":
 * "kind,monthly,monthsLeft[,flag]" — monthsLeft "-" when unknown; flag
 * "continues" for rent that goes on, or a mortgage position.
 */
export function obligationsToInput(list: Obligation[]): string {
  return list
    .map((o) => {
      const parts = [o.kind, new Decimal(o.monthly).toString(), o.monthsLeft === null ? "-" : String(o.monthsLeft)];
      if (o.kind === "rent" && o.rentContinues) parts.push("continues");
      if (o.kind === "mortgage" && o.mortgage) parts.push(o.mortgage);
      return parts.join(",");
    })
    .join("|");
}

export function obligationsFromInput(text: string): Obligation[] {
  if (text === "") return [];
  return text.split("|").map((item) => {
    const [kind, monthly, months, flag] = item.split(",");
    const o: Obligation = { kind: kind as ObligationKind, monthly, monthsLeft: months === "-" ? null : Number(months) };
    if (kind === "rent") o.rentContinues = flag === "continues";
    if (kind === "mortgage" && flag) o.mortgage = flag as MortgagePosition;
    return o;
  });
}

// ── The ratio (4.3) ─────────────────────────────────────────────────────────

export interface QualifyingTrack {
  amount: Numeric;
  /** Nominal annual rate, percent. */
  ratePercent: Numeric;
  /** The whole term, grace included. */
  months: number;
  /** Default "spitzer". */
  method?: "spitzer" | "equal_principal";
  /** Grace months at the start, inside the term. */
  graceMonths?: number;
  /** "partial": interest paid during grace (default); "full": nothing paid, interest added to the debt. */
  grace?: "partial" | "full";
  /** Bullet or balloon: only interest each month, the principal at the end. */
  bullet?: boolean;
}

/**
 * The monthly payment the ratio uses for one track (Brain 67436545, Q9):
 *  - ordinary: the first payment on the full amount;
 *  - with grace: the payment after the grace (partial grace: on the full amount
 *    over the months left; full grace: on the amount grown by the unpaid interest);
 *  - bullet or balloon: the monthly interest, even where it is not paid monthly.
 * No rate shock is added. Exact, unrounded.
 */
export function qualifyingPayment(track: QualifyingTrack): Decimal {
  const amount = nonNegative(track.amount, "the amount");
  if (track.bullet) return monthInterest(amount, track.ratePercent);
  const grace = track.graceMonths ?? 0;
  if (!Number.isInteger(grace) || grace < 0 || grace >= track.months) throw new RangeError("grace must be whole months, shorter than the term");
  const left = track.months - grace;
  const owed =
    grace > 0 && track.grace === "full"
      ? amount.mul(new Decimal(1).plus(new Decimal(track.ratePercent).div(1200)).pow(grace))
      : amount;
  if ((track.method ?? "spitzer") === "spitzer") return annuityPayment(owed, track.ratePercent, left);
  return owed.div(left).plus(monthInterest(owed, track.ratePercent));
}

/** The payment the ratio measures: the new loan's payment + existing payments on the same property. */
export function ratioPayment(newPayment: Numeric, list: Obligation[] = []): Decimal {
  return new Decimal(newPayment).plus(addedToPayment(list));
}

/** The payment-to-income ratio, percent: payment ÷ disposable income × 100. Exact. */
export function paymentToIncome(payment: Numeric, disposable: Numeric): Decimal {
  const d = new Decimal(disposable);
  if (d.lte(0)) throw new RangeError("the ratio needs a disposable income above zero");
  return new Decimal(payment).div(d).mul(HUNDRED);
}

export interface AffordabilityInput {
  /** Recognised monthly income: a number, or Mogi's income lines (included ones count). */
  income: Numeric | IncomeLine[];
  obligations: Obligation[];
  /** The new loan's qualifying monthly payment. */
  newPayment: Numeric;
  countReview?: boolean;
}

export interface AffordabilityResult {
  recognised: Decimal;
  deducted: Decimal;
  disposable: Decimal;
  newPayment: Decimal;
  added: Decimal;
  payment: Decimal;
  /** Exact percent; null when the disposable income is zero or less. */
  ratioPercent: Decimal | null;
}

/** The whole 4.1–4.3 calculation at once. */
export function affordability(input: AffordabilityInput): AffordabilityResult {
  const recognised = Array.isArray(input.income)
    ? recognisedIncome(input.income, { countReview: input.countReview })
    : new Decimal(input.income);
  const deducted = deductedObligations(input.obligations);
  const disposable = recognised.minus(deducted);
  const newPayment = new Decimal(input.newPayment);
  const added = addedToPayment(input.obligations);
  const payment = newPayment.plus(added);
  return {
    recognised,
    deducted,
    disposable,
    newPayment,
    added,
    payment,
    ratioPercent: disposable.gt(0) ? paymentToIncome(payment, disposable) : null,
  };
}
