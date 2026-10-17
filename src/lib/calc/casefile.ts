/**
 * The whole file of case A (נועם ושירה) — stage 9, units 9.1–9.4 (stage-9 author A). It COMPOSES the modules of the
 * earlier stages and re-implements none of them: affordability.ts (payslips, the 18-month rule, the ratio),
 * regulation.ts (the financing ceiling, the largest payment), levers.ts / case-a-positioning.ts (the plan of lesson 6.11),
 * bankpolicy.ts (the four fictional banks' invented rules), engine.ts and scenarios.ts (the cash flow and the three
 * scenarios), sensitivity.ts (the three goals) and offers.ts (when a price comparison is allowed). The data of the file
 * (the documents, the payslips, the statement, the states of the evidence) is src/data/case-a-final.ts.
 *
 * LABEL. Case A, every document and every bank are FICTIONAL ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת
 * בנק או נתוני שוק עדכניים"). The banks' rules are the exercise's (bankpolicy.ts); the scenarios are the course's (scenarios.ts:
 * the 451 forecast is a prescribed calculation, the stress scenario a chosen "what if", the macro path an invented table).
 * Nothing here says what a real bank would do. Nothing computed here is advice to a real client.
 *
 * ── The API (stable: units 9.3, 9.4 and 9.5 import it. Add, don't rename.) ────────────────────────────────────────────
 *
 * THE DOCUMENTS (9.1)
 *   payslipRow(p)                       one payslip: gross, mandatory deductions, שכר נטו, other deductions, נטו לתשלום, the
 *                                       one-off's net effect, and the month's net without it (affordability.ts payslipNet / payslipNetToPay)
 *   incomeOf(person)                    the three payslips of a person, the plain average of their nets, the one-offs, the
 *                                       recognised monthly income (the average of the nets WITHOUT the one-offs), the declared income
 *   householdIncome()                   declared, recognised and the naive (one-offs left in) totals of the two borrowers
 *   statementRows()                     the account statement: opening, deposits, debits, closing per month (the balance at the end
 *                                       is the savings in the equity + the savings kept outside it: tested)
 *   depositChecks()                     per month and borrower: the net to pay on the payslip, the deposit, and the gap between them
 *   docStates() / claimStates()         the state of every document / claim: the WORST of its pieces of evidence (ok < question <
 *                                       partial < missing), derived from EVIDENCE
 *   equityOf(view)                      the equity that counts, by view: "declared" (all), "documented" (what ok and partial
 *                                       evidence shows), "verified" (only what is ok)
 *   gapList()                           the open items with what to ask for (GAPS) and the shekels each one holds up
 *   countStates()                       how many documents are in each state
 *
 * THE SHEET OF FEASIBILITY (9.1: "דף היתכנות")
 *   incomeSheet()                       recognised income, obligations deducted (the 18-month rule), disposable income, the largest
 *                                       payment at 50% and 40%, payments until the car loan stops counting, the family's own budget
 *   financingSheet(view)                the loan, the financing ratio and the room to the 75% ceiling for the equity of a view
 *   startingMix()                       the stage-5 starting mix against the sheet: payment, ratio, what is left for living
 *   appraisalTable()                    the financing ratio of the declared loan at the appraisals the file plans for
 *   breakEvenAppraisal(loan)            the appraisal at which a loan sits exactly on the 75% ceiling: loan × 100 ÷ 75
 *
 * THE PLAN, THE OFFERS AND THE THREE ALTERNATIVES (9.2)
 *   planOf()                            lesson 6.11's plan on this file: the extra equity, the loan, the financing ratio, the
 *                                       savings left, the request's tracks (whole shekels)
 *   ALTERNATIVES                        the three alternatives of lesson 5.8, one per goal ("payment" · "total" · "exposure"), scaled to
 *                                       the plan's loan: tracks as {kind, amount, months}
 *   requestOffers()                     the plan's request read by the four banks
 *   offerAt(alt, bank)                  an alternative (or "request") read by one bank: the decision, the ratio, the financing ratio,
 *                                       the relief, the final rates, and, if approved, the reading under each of the three scenarios
 *   grid()                              offerAt for every alternative at every bank
 *   bestBank(alt)                       the approved bank with the lowest total under the base scenario (null if none)
 *   goalWinner(goal, bank)              which alternative wins a goal at a bank (payment: the lowest first payment; total: the lowest
 *                                       total; exposure: the lowest rise = stress highest payment − base first payment)
 *   basisOf(alt, bank)                  what keeps these offers from being compared by price (offers.ts basisDifferences)
 *   SCENARIOS3                          [{id: "forecast451", base}, {id: "stress"}, {id: "macro"}] with their Hebrew names
 *
 * THE RECOMMENDATION'S NUMBERS (9.3, 9.4)
 *   numbersFor(alt, bank)               everything one chosen pair needs in one object: the loan, rates, payment, ratio and its room to
 *                                       the 40% threshold and to the bank's relief line, the financing ratio and its room to the
 *                                       ceiling, the appraisal break-even, the savings left, the total and the highest payment under
 *                                       each scenario, the rise, the family-budget margins
 *   NUMBER_KINDS                        "which number is this": estimate · scenario · offer · executed deal
 *
 * Conventions: money is Decimal, exact, shown through money.ts; percents are exact Decimals (percentString to show). The base scenario
 * of stage 9 is the Directive 451 forecast (forecast451Scenario, lesson 8.10): stages 5–6 used a simpler teaching base (prime flat,
 * the index +2%), so totals here differ from lesson 6.11's; ratios, the loan and the financing ratio do not depend on a scenario.
 * "max60" is the highest payment in the first 60 months — the first five years, where a family budget is tested — because the highest
 * payment of a whole 30-year linked loan is dominated by its last years and by an income that, in this file, stays flat (a harsh
 * assumption, a calculation assumption).
 *
 * Recomputed independently in checks/kinds/casefile.py (the new arithmetic: recognised income with one-offs, equity by state, the
 * budget margin, the highest payment inside a window, the lowest of several facts); every other number comes through fact kinds
 * the earlier stages already check.
 */
import Decimal from "decimal.js";
import {
  averageMonthly,
  type Obligation,
  payslipNet,
  payslipNetToPay,
  monthsUntilDrop,
  paymentToIncome,
} from "./affordability.ts";
import { evaluate as policyEvaluate, type LoanFile, type Verdict } from "./bankpolicy.ts";
import { evaluate as engineEvaluate, mixFlow } from "./engine.ts";
import { type Offer as BasisOffer, basisDifferences, type BasisDifference } from "./offers.ts";
import { ltvPercentOf, maxLoanAt, maxPaymentAt, LTV_CEILINGS, PTI_CAPITAL_THRESHOLD, PTI_LIMIT, largestPaymentForBudget } from "./regulation.ts";
import { moneyString } from "./money.ts";
import { NAMED_SCENARIOS, type ScenarioId } from "./scenarios.ts";
import type { Scenario, TrackKind, TrackSpec } from "./schedule.ts";
import { qualifyingTotal } from "./sensitivity.ts";
import { BANKS, planEquity } from "../../data/case-a-positioning.ts";
import { CASE_A, INITIAL_MIX } from "../../data/case-a-mix.ts";
import { BANK_IDS, type BankId } from "../../data/case-a-offers.ts";
import { RESERVE } from "../../data/case-a-levers.ts";
import {
  APPRAISALS,
  CLAIMS,
  type ClaimId,
  type DocId,
  DOCUMENTS,
  EQUITY_PIECES,
  EVIDENCE,
  FILE,
  GAPS,
  LIVING_BUDGET,
  PAYSLIPS,
  type Payslip,
  type PersonId,
  STATE_ORDER,
  STATEMENT,
  STATEMENT_OPENING,
  type State,
  type Gap,
} from "../../data/case-a-final.ts";

const ZERO = new Decimal(0);
const HUNDRED = new Decimal(100);
const sumOf = (xs: Decimal.Value[]): Decimal => xs.reduce<Decimal>((s, x) => s.plus(x), ZERO);

// ── The documents ──────────────────────────────────────────────────────────

export interface PayslipRow {
  month: string;
  gross: Decimal;
  mandatory: Decimal;
  /** שכר נטו: gross − the mandatory deductions. */
  net: Decimal;
  other: Decimal;
  /** נטו לתשלום: the net − the other deductions. */
  netToPay: Decimal;
  /** The net effect of a payment that does not repeat (0 in a regular month). */
  oneOffNet: Decimal;
  /** The month's net without the one-off. */
  recognisedNet: Decimal;
}

export function payslipRow(p: Payslip): PayslipRow {
  const mandatoryList = p.mandatory.map((d) => d.amount);
  const net = payslipNet(p.gross, mandatoryList);
  return {
    month: p.month,
    gross: new Decimal(p.gross),
    mandatory: sumOf(mandatoryList),
    net,
    other: sumOf(p.other.map((d) => d.amount)),
    netToPay: payslipNetToPay(net, p.other.map((d) => d.amount)),
    oneOffNet: new Decimal(p.oneOffNet),
    recognisedNet: net.minus(p.oneOffNet),
  };
}

export interface IncomeOf {
  person: PersonId;
  rows: PayslipRow[];
  /** What the client declared (the net of case A). */
  declared: Decimal;
  /** The plain average of the three nets, one-offs left in. */
  naive: Decimal;
  /** The one-offs, added up. */
  oneOffs: Decimal;
  /** The recognised monthly income: the average of the nets without the one-offs. */
  recognised: Decimal;
}

export function incomeOf(person: PersonId): IncomeOf {
  const rows = PAYSLIPS[person].map(payslipRow);
  return {
    person,
    rows,
    declared: new Decimal(FILE.incomes[person]),
    naive: averageMonthly(rows.map((r) => r.net)),
    oneOffs: sumOf(rows.map((r) => r.oneOffNet)),
    recognised: averageMonthly(rows.map((r) => r.recognisedNet)),
  };
}

export function householdIncome() {
  const n = incomeOf("noam");
  const s = incomeOf("shira");
  return {
    declared: n.declared.plus(s.declared),
    recognised: n.recognised.plus(s.recognised),
    naive: n.naive.plus(s.naive),
  };
}

export interface StatementRow {
  month: string;
  opening: Decimal;
  deposits: Record<PersonId, Decimal>;
  depositsTotal: Decimal;
  debits: Decimal;
  closing: Decimal;
}

export function statementRows(): StatementRow[] {
  let balance = new Decimal(STATEMENT_OPENING);
  return STATEMENT.map((m) => {
    const deposits = { noam: new Decimal(m.deposit.noam), shira: new Decimal(m.deposit.shira) };
    const depositsTotal = deposits.noam.plus(deposits.shira);
    const opening = balance;
    balance = balance.plus(depositsTotal).minus(m.debits);
    return { month: m.month, opening, deposits, depositsTotal, debits: new Decimal(m.debits), closing: balance };
  });
}

export interface DepositCheck {
  person: PersonId;
  month: string;
  netToPay: Decimal;
  deposit: Decimal;
  /** net to pay − the deposit: positive when less reached the account than the payslip says. */
  gap: Decimal;
}

export function depositChecks(): DepositCheck[] {
  const rows = statementRows();
  return (["noam", "shira"] as const).flatMap((person) => {
    const pays = PAYSLIPS[person].map(payslipRow);
    return rows.map((r, k) => ({ person, month: r.month, netToPay: pays[k].netToPay, deposit: r.deposits[person], gap: pays[k].netToPay.minus(r.deposits[person]) }));
  });
}

// ── States of the evidence ─────────────────────────────────────────────────

const worst = (states: State[]): State => states.reduce<State>((w, s) => (STATE_ORDER.indexOf(s) > STATE_ORDER.indexOf(w) ? s : w), "ok");

export function docStates(): Record<DocId, State> {
  return Object.fromEntries(DOCUMENTS.map((d) => [d.id, worst(EVIDENCE.filter((e) => e.doc === d.id).map((e) => e.state))])) as Record<DocId, State>;
}

export function claimStates(): Record<ClaimId, State> {
  return Object.fromEntries(CLAIMS.map((c) => [c.id, worst(EVIDENCE.filter((e) => e.claim === c.id).map((e) => e.state))])) as Record<ClaimId, State>;
}

export function countStates(): Record<State, number> {
  const out: Record<State, number> = { ok: 0, question: 0, partial: 0, missing: 0 };
  for (const s of Object.values(docStates())) out[s] += 1;
  return out;
}

/** The claims a document can support (all of its pieces of evidence, whatever their state). */
export function claimsOfDoc(id: DocId): ClaimId[] {
  return EVIDENCE.filter((e) => e.doc === id).map((e) => e.claim);
}

export type View = "declared" | "documented" | "verified";

export interface EquityRow {
  id: (typeof EQUITY_PIECES)[number]["id"];
  label: string;
  declared: Decimal;
  state: State;
  /** Counts under "documented" (ok or partial)? */
  documented: boolean;
  /** Counts under "verified" (ok)? */
  verified: boolean;
}

export function equityRows(): EquityRow[] {
  const states = claimStates();
  return EQUITY_PIECES.map((p) => ({
    id: p.id,
    label: p.label,
    declared: new Decimal(p.declared),
    state: states[p.id],
    documented: states[p.id] === "ok" || states[p.id] === "partial",
    verified: states[p.id] === "ok",
  }));
}

/** The equity that counts under a view: declared (all of it), documented (ok and partial), verified (ok only). */
export function equityOf(view: View): Decimal {
  return sumOf(equityRows().filter((r) => view === "declared" || (view === "documented" ? r.documented : r.verified)).map((r) => r.declared));
}

export interface GapRow extends Gap {
  /** Shekels the open item holds up, and what the number is. */
  amount: Decimal;
  amountKind: "equity" | "monthly" | "price";
}

/** The open items. The amount: the equity a missing piece would add; the gap in a month's deposit; a month's income the one-off would inflate; the price. */
export function gapList(): GapRow[] {
  const income = incomeOf("shira");
  const aug = depositChecks().filter((c) => c.person === "noam").reduce((m, c) => (c.gap.abs().gt(m) ? c.gap.abs() : m), ZERO);
  return GAPS.map((g) => {
    const open = EVIDENCE.find((e) => e.doc === g.doc && e.claim === g.claim);
    if (!open || open.state === "ok") throw new Error(`gap ${g.doc}/${g.claim} is not an open piece of evidence`);
    const equity = EQUITY_PIECES.find((p) => p.id === g.claim);
    if (equity) return { ...g, amount: new Decimal(equity.declared), amountKind: "equity" as const };
    if (g.claim === "income_noam") return { ...g, amount: aug, amountKind: "monthly" as const };
    if (g.claim === "income_shira") return { ...g, amount: income.naive.minus(income.recognised), amountKind: "monthly" as const };
    return { ...g, amount: new Decimal(FILE.price), amountKind: "price" as const };
  });
}

// ── The sheet of feasibility ───────────────────────────────────────────────

export interface IncomeSheet {
  declared: Decimal;
  recognised: Decimal;
  /** Obligations that count under the 18-month rule, deducted from the income. */
  deducted: Decimal;
  disposable: Decimal;
  /** The largest payment at the ceiling of 50% and at the 40% threshold. */
  max50: Decimal;
  max40: Decimal;
  /** Payments still to make before the car loan stops counting (26 left, the rule is "more than 18"). */
  untilDrop: number;
  /** The disposable income and the 40% payment once the car loan stops counting. */
  disposableAfter: Decimal;
  max40After: Decimal;
  /** The family's own budget for living, and the largest payment it allows while the car loan runs. */
  livingBudget: Decimal;
  maxForBudget: Decimal;
}

export function incomeSheet(): IncomeSheet {
  const h = householdIncome();
  const car = FILE.car;
  const disposable = h.recognised.minus(car.monthly);
  const disposableAfter = h.recognised;
  return {
    declared: h.declared,
    recognised: h.recognised,
    deducted: new Decimal(car.monthly),
    disposable,
    max50: maxPaymentAt(disposable, PTI_LIMIT),
    max40: maxPaymentAt(disposable, PTI_CAPITAL_THRESHOLD),
    untilDrop: monthsUntilDrop(car.monthsLeft as number),
    disposableAfter,
    max40After: maxPaymentAt(disposableAfter, PTI_CAPITAL_THRESHOLD),
    livingBudget: new Decimal(LIVING_BUDGET),
    maxForBudget: largestPaymentForBudget(h.recognised, [car.monthly], LIVING_BUDGET),
  };
}

export interface FinancingSheet {
  view: View;
  equity: Decimal;
  loan: Decimal;
  ltv: Decimal;
  ceiling: string;
  maxLoan: Decimal;
  /** maxLoan − loan: negative when the loan is above the ceiling. */
  room: Decimal;
  within: boolean;
  /** The least equity at which the ceiling holds: price − maxLoan. */
  minEquity: Decimal;
}

export function financingSheet(view: View): FinancingSheet {
  const equity = equityOf(view);
  const price = new Decimal(FILE.price);
  const loan = price.minus(equity);
  const maxLoan = maxLoanAt(price, CASE_A.deal);
  return {
    view,
    equity,
    loan,
    ltv: ltvPercentOf(loan, price),
    ceiling: LTV_CEILINGS[CASE_A.deal],
    maxLoan,
    room: maxLoan.minus(loan),
    within: loan.lte(maxLoan),
    minEquity: price.minus(maxLoan),
  };
}

/** The stage-5 starting mix against the sheet. */
export function startingMix() {
  const sheet = incomeSheet();
  const payment = qualifyingTotal(INITIAL_MIX);
  const left = sheet.recognised.minus(payment).minus(FILE.car.monthly);
  return {
    tracks: INITIAL_MIX,
    payment,
    ratio: paymentToIncome(payment, sheet.disposable),
    left,
    marginToBudget: left.minus(LIVING_BUDGET),
    roomTo40: sheet.max40.minus(payment),
  };
}

export const breakEvenAppraisal = (loan: Decimal.Value): Decimal => new Decimal(loan).mul(HUNDRED).div(LTV_CEILINGS[CASE_A.deal]);

/** The financing ratio of a loan at several appraisals: the value used is the lower of the appraisal and the price (lesson 4.9, as the team transcribed it). */
export function appraisalTable(loan: Decimal.Value = financingSheet("declared").loan) {
  const price = new Decimal(FILE.price);
  return APPRAISALS.map((a) => {
    const used = Decimal.min(a, price);
    const ltv = ltvPercentOf(loan, used);
    return { appraisal: new Decimal(a), used, ltv, maxLoan: maxLoanAt(used, CASE_A.deal), within: new Decimal(loan).lte(maxLoanAt(used, CASE_A.deal)) };
  });
}

// ── The plan and the three alternatives ────────────────────────────────────

export interface TrackShape {
  kind: TrackKind;
  amount: string;
  months: number;
}

export interface Plan {
  extraEquity: Decimal;
  equity: Decimal;
  loan: Decimal;
  ltv: Decimal;
  /** The savings kept outside the equity, before and after. */
  reserve: Decimal;
  reserveAfter: Decimal;
  /** The request: the starting mix's three kinds, whole shekels, 30 years. */
  request: TrackShape[];
}

const THOUSAND = new Decimal(1000);

/** Lesson 6.11's plan on this file: the extra equity of the plan, the loan it leaves, and the request in whole shekels. */
export function planOf(): Plan {
  const extra = planEquity();
  const equity = new Decimal(FILE.equity).plus(extra);
  const price = new Decimal(FILE.price);
  const loan = price.minus(equity);
  const { third, rest } = shapesOf(loan);
  if (!rest.isInteger()) throw new Error("the plan's loan does not split into whole shekels");
  const m = 360;
  return {
    extraEquity: extra,
    equity,
    loan,
    ltv: ltvPercentOf(loan, price),
    reserve: new Decimal(RESERVE),
    reserveAfter: new Decimal(RESERVE).minus(extra),
    request: [
      { kind: "prime", amount: third.toString(), months: m },
      { kind: "variable_unlinked", amount: rest.toString(), months: m },
      { kind: "fixed_unlinked", amount: rest.toString(), months: m },
    ],
  };
}

/** The family's own request of lessons 5.8–6.11, before the plan: the starting mix's three kinds and amounts (546,000 · 547,000 · 547,000), 30 years. */
export function originalRequest(): TrackShape[] {
  return INITIAL_MIX.map((t) => ({ kind: t.kind, amount: String(t.amount), months: t.months }));
}

/** A like-for-like reference for the "stability" alternative: the same fixed track, 25 years like the "total" alternative (a measure for 9.2's comparison only). */
export function fixed25Request(): TrackShape[] {
  return [{ kind: "fixed_unlinked", amount: planOf().loan.toString(), months: 300 }];
}

/**
 * The whole-thousand cuts of a loan that the request and the alternatives use: `third` is the largest whole thousand within a third
 * of the loan, `rest` is half of what remains (so the request is third · rest · rest); `variable` is the largest whole thousand
 * within two-thirds (the one-third-fixed rule), `fixed` is the rest. Recomputed by cf_shapes in casefile.py.
 */
export function shapesOf(loan: Decimal.Value) {
  const l = new Decimal(loan);
  const third = l.div(3).div(THOUSAND).floor().mul(THOUSAND);
  const variable = l.mul(2).div(3).div(THOUSAND).floor().mul(THOUSAND);
  return { third, rest: l.minus(third).div(2), variable, fixed: l.minus(variable) };
}

export type GoalId = "payment" | "total" | "exposure";
export type AltId = GoalId;
export type OfferSource = AltId | "request" | "original" | "fixed25";

export interface Alternative {
  id: AltId;
  goal: GoalId;
  /** The goal in Hebrew, and the alternative's name. */
  goalHe: string;
  nameHe: string;
  noteHe: string;
  tracks: TrackShape[];
}

/**
 * The three alternatives of lesson 5.8 (payment: "linked", total: "short", exposure: "fixed"), on the plan's loan. The variable part is
 * the largest whole thousand within two-thirds of the loan (Directive 329's one-third-fixed rule, as the team transcribed it); the rest
 * is fixed. Same loan, three goals, three different prices to pay.
 */
export const alternativesOf = (loan: Decimal): Alternative[] => {
  const { variable, fixed: fixedPart } = shapesOf(loan);
  return [
    {
      id: "payment",
      goal: "payment",
      goalHe: "החזר חודשי נמוך",
      nameHe: "צמוד",
      noteHe: "משתנה צמודה וקבועה צמודה, 30 שנה",
      tracks: [
        { kind: "variable_linked", amount: variable.toString(), months: 360 },
        { kind: "fixed_linked", amount: fixedPart.toString(), months: 360 },
      ],
    },
    {
      id: "total",
      goal: "total",
      goalHe: "סך תשלומים נמוך",
      nameHe: "25 שנה",
      noteHe: "משתנה לא צמודה וקבועה לא צמודה, 25 שנה",
      tracks: [
        { kind: "variable_unlinked", amount: variable.toString(), months: 300 },
        { kind: "fixed_unlinked", amount: fixedPart.toString(), months: 300 },
      ],
    },
    {
      id: "exposure",
      goal: "exposure",
      goalHe: "יציבות",
      nameHe: "קבועה בלבד",
      noteHe: "הכול קבועה לא צמודה, 30 שנה",
      tracks: [{ kind: "fixed_unlinked", amount: loan.toString(), months: 360 }],
    },
  ];
};

export const ALTERNATIVES: Alternative[] = alternativesOf(planOf().loan);
export const alternative = (id: AltId): Alternative => {
  const a = ALTERNATIVES.find((x) => x.id === id);
  if (!a) throw new Error(`no alternative "${id}"`);
  return a;
};

export interface ScenarioDef {
  id: ScenarioId;
  /** The short name used in stage 9: base is the Directive 451 forecast. */
  nameHe: string;
  scenario: Scenario;
}
const NAMES9: Record<ScenarioId, string> = { forecast451: "בסיס (תחזית 451)", stress: "לחץ", macro: "מקרו" };
export const SCENARIOS3: ScenarioDef[] = NAMED_SCENARIOS().map((n) => ({ id: n.id, nameHe: NAMES9[n.id], scenario: n.scenario }));
export const scenarioDef = (id: ScenarioId): ScenarioDef => SCENARIOS3.find((s) => s.id === id) as ScenarioDef;

/** The window of "the first five years", months. */
export const WINDOW_MONTHS = 60;

export interface ScenarioReading {
  id: ScenarioId;
  first: Decimal;
  /** The highest payment over the whole term (engine.ts: the clearing payment of the last month is replaced by the one that was due). */
  max: Decimal;
  maxMonth: number;
  total: Decimal;
  /** The highest payment in the first 60 months, and the first month it is paid. */
  max60: Decimal;
  max60Month: number;
  /** What is left for living in the first month and in the month of max60: net income − the payment − the car loan while it runs. */
  leftFirst: Decimal;
  left60: Decimal;
  /** What is left over the family's own budget in those two months (negative: the budget breaks). */
  marginFirst: Decimal;
  margin60: Decimal;
}

/** The highest payment inside the first `months` months, and the first month it is paid (compared to the agora). */
export function windowMax(payments: Decimal[], months: number): { value: Decimal; month: number } {
  const slice = payments.slice(0, months).map((p) => p.toDecimalPlaces(2, Decimal.ROUND_HALF_UP));
  let best = 0;
  for (let k = 1; k < slice.length; k++) if (slice[k].gt(slice[best])) best = k;
  return { value: slice[best], month: best + 1 };
}

/** What is left for living in a month: the recognised net income, less the payment, less the car loan while it still runs. */
export function leftIn(payment: Decimal.Value, month: number): Decimal {
  const car = FILE.car;
  return householdIncome().recognised.minus(payment).minus(month <= (car.monthsLeft as number) ? car.monthly : 0);
}

export function readingOf(tracks: TrackSpec[], def: ScenarioDef): ScenarioReading {
  const e = engineEvaluate(tracks, def.scenario);
  const payments = mixFlow(tracks, def.scenario).payments;
  const w = windowMax(payments, WINDOW_MONTHS);
  const leftFirst = leftIn(payments[0], 1);
  const left60 = leftIn(payments[w.month - 1], w.month);
  return {
    id: def.id,
    first: e.first,
    max: e.max,
    maxMonth: e.maxMonth,
    total: e.total,
    max60: w.value,
    max60Month: w.month,
    leftFirst,
    left60,
    marginFirst: leftFirst.minus(LIVING_BUDGET),
    margin60: left60.minus(LIVING_BUDGET),
  };
}

// ── An offer: one alternative (or the request) read by one bank ────────────

export interface CaseOffer {
  source: OfferSource;
  bank: BankId;
  /** The tracks as the client asks for them (no rate). */
  asked: TrackShape[];
  verdict: Verdict;
  approved: boolean;
  /** The final tracks (rates after relief) when approved; null when the bank refuses. */
  tracks: TrackSpec[] | null;
  /** The reading under each scenario, when approved. */
  readings: Record<ScenarioId, ScenarioReading> | null;
  /** The stress scenario's highest payment above the base scenario's first payment ("exposure", lesson 5.6 on the stage-9 scenarios). */
  rise: Decimal | null;
}

export function fileOf(tracks: TrackShape[]): LoanFile {
  return {
    value: FILE.price,
    income: householdIncome().recognised.toString(),
    obligations: [FILE.car as Obligation],
    tracks: tracks.map((t) => ({ kind: t.kind, amount: t.amount, months: t.months })),
  };
}

const bankPolicy = (id: BankId) => {
  const b = BANKS.find((x) => x.id === id);
  if (!b) throw new Error(`no bank "${id}"`);
  return b;
};

const cache = new Map<string, CaseOffer>();

export function offerAt(source: OfferSource, bank: BankId): CaseOffer {
  const key = `${source}/${bank}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const asked = source === "request" ? planOf().request : source === "original" ? originalRequest() : source === "fixed25" ? fixed25Request() : alternative(source).tracks;
  const verdict = policyEvaluate(bankPolicy(bank), fileOf(asked));
  const approved = verdict.decision === "approve";
  const tracks = approved ? verdict.finalTracks : null;
  const readings = tracks
    ? (Object.fromEntries(SCENARIOS3.map((s) => [s.id, readingOf(tracks, s)])) as Record<ScenarioId, ScenarioReading>)
    : null;
  const out: CaseOffer = {
    source,
    bank,
    asked,
    verdict,
    approved,
    tracks,
    readings,
    rise: readings ? readings.stress.max.minus(readings.forecast451.first) : null,
  };
  cache.set(key, out);
  return out;
}

export const requestOffers = (): CaseOffer[] => BANK_IDS.map((b) => offerAt("request", b));
export const grid = (): CaseOffer[] => ALTERNATIVES.flatMap((a) => BANK_IDS.map((b) => offerAt(a.id, b)));

/** The approved bank with the lowest total under the base scenario (a tie keeps the first). */
export function bestBank(source: OfferSource): BankId | null {
  const offers = BANK_IDS.map((b) => offerAt(source, b)).filter((o) => o.approved);
  if (offers.length === 0) return null;
  return offers.reduce((best, o) => (o.readings!.forecast451.total.lt(best.readings!.forecast451.total) ? o : best)).bank;
}

/** The measure a goal reads, lower is better: the first payment, the total (both on the base scenario), or the rise. */
export function goalScore(goal: GoalId, o: CaseOffer): Decimal | null {
  if (!o.readings) return null;
  return goal === "payment" ? o.readings.forecast451.first : goal === "total" ? o.readings.forecast451.total : o.rise;
}

/** The alternative that wins a goal at one bank among the alternatives that bank approves (a tie keeps the first). */
export function goalWinner(goal: GoalId, bank: BankId): AltId | null {
  let best: { id: AltId; score: Decimal } | null = null;
  for (const a of ALTERNATIVES) {
    const s = goalScore(goal, offerAt(a.id, bank));
    if (s !== null && (best === null || s.lt(best.score))) best = { id: a.id, score: s };
  }
  return best?.id ?? null;
}

// ── When a price comparison is allowed (offers.ts) ─────────────────────────

const BASIS_MONTH = "2026-10";
const BASIS_FORECAST = "forecast451";

/** An offer.ts Offer carrying the offer's STRUCTURE (kinds, amounts, terms, the month and the forecast); its rates are not used by the basis check. */
export function basisOffer(o: CaseOffer): BasisOffer {
  return {
    name: `${o.bank}/${o.source}`,
    month: BASIS_MONTH,
    forecast: BASIS_FORECAST,
    upfront: "0.00",
    tracks: o.asked.map((t) =>
      t.kind === "fixed_unlinked" || t.kind === "fixed_linked" ? { kind: t.kind, amount: moneyString(t.amount), months: t.months, rate: "0.00" } : { kind: t.kind, amount: moneyString(t.amount), months: t.months, margin: "0.00" },
    ),
  };
}

/** What keeps these offers from being compared by price: the amount, the mix, the month, the forecast. Empty: the same basis. */
export function basisOf(sources: [OfferSource, BankId][]): BasisDifference[] {
  return basisDifferences(sources.map(([s, b]) => basisOffer(offerAt(s, b))));
}

// ── The recommendation's numbers ───────────────────────────────────────────

export const NUMBER_KINDS = [
  { id: "estimate", he: "אומדן", who: "מי שחישב", note: "מספר שמחשבים בשיטה, על הנחות, כשאף בנק עוד לא ענה. הוא נכון בתוך ההנחות ואינו התחייבות של אף אחד." },
  { id: "scenario", he: "תרחיש", who: "מי שבחר אותו", note: "״מה אם״ שבוחרים לבדוק: תחזית 451, לחץ, מקרו. הוא אינו תחזית ואינו מחיר." },
  { id: "offer", he: "הצעה אישית", who: "הבנק, בכתב, לתקופה מוגבלת", note: "מחיר לתיק ולתמהיל המדויקים, כפי שהבנק נתן אותו. הוא מחליף את האומדן." },
  { id: "executed", he: "עסקה שבוצעה", who: "החוזה", note: "התנאים שנחתמו. מה נקבע בחתימה ומה ממשיך לזוז אחריה: שאלה פתוחה לאילון ולבנק." },
] as const;

export interface Numbers {
  alt: AltId;
  bank: BankId;
  approved: boolean;
  loan: Decimal;
  rates: string[];
  relief: Decimal;
  /** The payment the ratio uses, at the bank's LIST rates (bankpolicy.ts), and the ratio on it. */
  listPayment: Decimal;
  ratio: Decimal;
  /** The 40% threshold: the room in shekels a month (positive: under it). */
  roomTo40: Decimal;
  /** The bank's relief line on the ratio (null: none) and the room to it. */
  reliefLine: string | null;
  roomToRelief: Decimal | null;
  ltv: Decimal;
  ltvCeiling: string;
  /** maxLoan − loan at the price, and the appraisal at which the loan sits on the ceiling. */
  ltvRoom: Decimal;
  breakEvenAppraisal: Decimal;
  reserveAfter: Decimal;
  readings: Record<ScenarioId, ScenarioReading> | null;
  rise: Decimal | null;
}

export function numbersFor(alt: AltId, bank: BankId): Numbers {
  const o = offerAt(alt, bank);
  const plan = planOf();
  const policy = bankPolicy(bank);
  const sheet = incomeSheet();
  const price = new Decimal(FILE.price);
  return {
    alt,
    bank,
    approved: o.approved,
    loan: o.verdict.loan,
    rates: o.tracks ? o.tracks.map((t) => String(t.rate)) : [],
    relief: o.verdict.relief,
    listPayment: o.verdict.listPayment,
    ratio: o.verdict.ratio,
    roomTo40: sheet.max40.minus(o.verdict.listPayment),
    reliefLine: policy.ratioReliefLine,
    roomToRelief: policy.ratioReliefLine === null ? null : maxPaymentAt(sheet.disposable, policy.ratioReliefLine).minus(o.verdict.listPayment),
    ltv: o.verdict.ltv,
    ltvCeiling: LTV_CEILINGS[CASE_A.deal],
    ltvRoom: maxLoanAt(price, CASE_A.deal).minus(o.verdict.loan),
    breakEvenAppraisal: breakEvenAppraisal(o.verdict.loan),
    reserveAfter: plan.reserveAfter,
    readings: o.readings,
    rise: o.rise,
  };
}
