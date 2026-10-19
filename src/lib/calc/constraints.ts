/**
 * The hard constraints on a candidate, as small functions, with EVERY reason a candidate is rejected (lessons 8.7 and, for
 * the later groups, the search of 8.14, the frontier of 8.15 and the pipeline of 8.21; the same list is the "reasons for
 * rejecting candidates" of the stage's workshop). Stage-8 author A. Authors B, C and D import it: add, don't rename.
 *
 * ── What this is, and what it is not ─────────────────────────────────────
 *
 * It is a TEACHING MODEL of how an algorithm could separate a feasible candidate from an infeasible one. Nothing here is
 * implemented in Mogi's code ("Mogi היום": no mix calculation exists in code; the engine call is frozen). The constraints
 * come in four families, each with its own source and label:
 *
 *   identity  the request is consistent: the tracks add up to the loan, every track is above zero      (arithmetic)
 *   law       the five lines of Directive 329 that apply to a request — financing ceiling, payment ratio ceiling
 *             (50%), at least a third fixed, at most 30 years                                          (regulation.ts, mixcheck.ts)
 *   bank      the refusal points of ONE bank — in the course a FICTIONAL bank's invented lines          (bankpolicy.ts)
 *   client    what the client set: the largest payment, the ratio the client wants to stay under,
 *             and the equity the client really has                                                      (the request)
 *
 * The 40% line (the payment ratio above which a bank holds more capital) is NOT a constraint: it is a flag in `notes`
 * (lesson 4.5: allowed, but it costs the bank). A client who wants to stay under 40% says so in `targetRatio`, and then
 * the client constraint rejects.
 *
 * ── The types ────────────────────────────────────────────────────────────
 *
 *   Request    the first level of decision variables ("מיצוב הבקשה", lesson 8.6) plus the data it rests on: the deal, the
 *              property's value (`price`), the equity put in, the most equity the family has (`equityAvailable`), the
 *              borrowers' recognised net incomes, the obligations still open, the client's own limits (`maxPayment`,
 *              `targetRatio`, both nullable) and the bank asked (`bank`, a bankpolicy.ts BankPolicy, or null for none).
 *   Candidate  { id, request, tracks }: a full request AND a mix (schedule.ts TrackSpec[] — the second level of
 *              variables, with their rates already set, at the asked bank's list prices).
 *   Check      one constraint applied: {id, family, passed, actual, limit, unit, room}. `actual` and `limit` are in `unit`
 *              ("percent", "shekels", "months"; "none" for the two identity checks); `room` = limit − actual for a ceiling
 *              (positive: room left; negative: by how much it is over), and null where the idea does not apply.
 *              `actual` is null when it cannot be computed (a disposable income at or below zero: every ratio check fails).
 *   Evaluation { candidate, checks (ALL of them, in CONSTRAINTS order), reasons (the failed ones — every one, not only the
 *              first), feasible, notes }.
 *
 * ── The API ──────────────────────────────────────────────────────────────
 *
 *   CONSTRAINTS                    the list, in the order the course shows it (11 entries, each {id, family, labelHe,
 *                                  ruleHe, check(candidate)}): sum_equals_loan, positive_tracks, equity_available, ltv,
 *                                  pti, variable_share, term, bank_ratio, bank_ltv, client_max_payment, client_target_ratio
 *   FAMILY_HE                      the family names in Hebrew
 *   evaluate(candidate, constraints?)       the Evaluation. A constraint that does not apply (no bank asked, no client limit)
 *                                  is a Check with passed true and `actual: null, limit: null` ("not asked").
 *   rejectionReasons(candidate, constraints?)   the ids of the failed checks, in order: [] means feasible
 *   isFeasible(candidate, constraints?)
 *   feasibleSet(candidates, constraints?)       the feasible candidates, in the order given
 *   rejectionCounts(candidates, constraints?)   for each constraint, how many candidates it rejects (a candidate that fails
 *                                  three constraints is counted under each of the three)
 *   measures(candidate)            the numbers the checks read, exact: {loan, ltv, disposable, payment, ratio, variable,
 *                                  variablePercent, termMonths}; `ratio` is null when the disposable income is not above zero
 *   toMixTracks(tracks)            TrackSpec[] → mixcheck.ts MixTrack[]
 *
 * Money and percents are Decimal, exact; round when showing. How the numbers are read (all of them the course's earlier
 * lessons'): the payment is the "qualifying" payment — each track's first payment on its full amount, added (lesson 4.3,
 * through mixcheck.ts → affordability.ts); the disposable income is the recognised income minus the obligations the
 * 18-month rule counts (affordability.ts); the same-property payment is added to the payment (affordability.ts); the bank
 * lines are bankpolicy.ts's `evaluate`, which prices the tracks at the bank's LIST rates. "Over" is strict everywhere: exactly
 * on a line has not crossed it.
 *
 * Recomputed independently in checks/kinds/constraints.py.
 */
import Decimal from "decimal.js";
import { addedToPayment, disposableIncome, type Obligation } from "./affordability.ts";
import { type BankPolicy, evaluate as evaluateBank } from "./bankpolicy.ts";
import { checkMix, type MixTrack } from "./mixcheck.ts";
import { type DealType, type LineResult, MAX_TERM_MONTHS } from "./regulation.ts";
import type { TrackSpec } from "./schedule.ts";

export type Numeric = Decimal.Value;

const ZERO = new Decimal(0);

// ── The types ──────────────────────────────────────────────────────────────

export interface Request {
  deal: DealType;
  /** The property's value the financing ratio is measured against, shekels. */
  price: Numeric;
  /** The equity the purchase uses, shekels; the loan the tracks must add up to is price − equity. */
  equity: Numeric;
  /** The most equity the family can put in, shekels (its savings, less whatever it spends closing a loan first). */
  equityAvailable: Numeric;
  /** The recognised net monthly income of each borrower, shekels. */
  incomes: Numeric[];
  /** Obligations still open after the request's own moves (a loan the request closes is not in the list). */
  obligations: Obligation[];
  /** The largest first monthly payment the client accepts, shekels; null: the client set none. */
  maxPayment: Numeric | null;
  /** The payment ratio the client wants to stay at or under, percent; null: none. */
  targetRatio: Numeric | null;
  /** The bank asked (a fictional bank's policy); null: no bank's lines are applied. */
  bank: BankPolicy | null;
}

export interface Candidate {
  id: string;
  request: Request;
  /** The mix, with its rates set. */
  tracks: TrackSpec[];
}

export type ConstraintId =
  | "sum_equals_loan"
  | "positive_tracks"
  | "equity_available"
  | "ltv"
  | "pti"
  | "variable_share"
  | "term"
  | "bank_ratio"
  | "bank_ltv"
  | "client_max_payment"
  | "client_target_ratio";

export type Family = "identity" | "law" | "bank" | "client";
export type Unit = "percent" | "shekels" | "months" | "none";

export interface Check {
  id: ConstraintId;
  family: Family;
  passed: boolean;
  actual: Decimal | null;
  limit: Decimal | null;
  unit: Unit;
  room: Decimal | null;
}

export interface Constraint {
  id: ConstraintId;
  family: Family;
  /** What the constraint says, as a short Hebrew name for tables. */
  labelHe: string;
  /** The rule in one Hebrew sentence. */
  ruleHe: string;
  check(c: Candidate): Check;
}

export interface Evaluation {
  candidate: Candidate;
  checks: Check[];
  reasons: Check[];
  feasible: boolean;
  /** Things that are allowed but worth knowing: "above_capital" (the ratio is above the 40% line; lesson 4.5). */
  notes: "above_capital"[];
}

export const FAMILY_HE: Record<Family, string> = {
  identity: "עקביות",
  law: "רגולציה",
  bank: "מדיניות הבנק",
  client: "הלקוח",
};

// ── What the checks read ───────────────────────────────────────────────────

/** TrackSpec[] as mixcheck.ts reads a mix. */
export function toMixTracks(tracks: TrackSpec[]): MixTrack[] {
  return tracks.map((t, k) => ({ label: `${t.kind}-${k + 1}`, type: t.kind, amount: new Decimal(t.amount).toString(), ratePercent: new Decimal(t.rate).toString(), months: t.months }));
}

export interface Measures {
  /** The tracks added up. */
  loan: Decimal;
  /** Loan ÷ price × 100. */
  ltv: Decimal;
  /** Recognised income − the obligations that count. */
  disposable: Decimal;
  /** The payment the ratio uses: the qualifying payments added, plus the same-property payments. */
  payment: Decimal;
  /** payment ÷ disposable × 100; null when the disposable income is not above zero. */
  ratio: Decimal | null;
  /** The part of the loan at a rate that can change. */
  variable: Decimal;
  variablePercent: Decimal;
  termMonths: number;
}

function incomeTotal(c: Candidate): Decimal {
  return c.request.incomes.reduce<Decimal>((s, x) => s.plus(x), ZERO);
}

/** Every number the checks read, exact. Needs at least one track. */
export function measures(c: Candidate): Measures {
  const r = c.request;
  const disposable = disposableIncome(incomeTotal(c), r.obligations);
  const mix = toMixTracks(c.tracks);
  const loan = mix.reduce<Decimal>((s, t) => s.plus(t.amount), ZERO);
  const ctxIncome = disposable.gt(0) ? disposable : new Decimal(1);
  // checkMix wants an income above zero; with none the ratio is reported as null and the payment is read directly.
  const m = checkMix(mix, { deal: r.deal, value: r.price, disposableIncome: ctxIncome, addedPayment: addedToPayment(r.obligations) });
  const line = (id: string): LineResult => m.lines.find((l) => l.id === id) as LineResult;
  return {
    loan: m.loan,
    ltv: line("ltv").actual,
    disposable,
    payment: m.payment,
    ratio: disposable.gt(0) ? m.payment.div(disposable).mul(100) : null,
    variable: m.variable,
    variablePercent: m.variable.div(m.loan).mul(100),
    termMonths: m.termMonths,
  };
}

const ceilingCheck = (id: ConstraintId, family: Family, unit: Unit, actual: Decimal | null, limit: Decimal, passed: boolean, room: Decimal | null): Check => ({ id, family, passed, actual, limit, unit, room });
const notAsked = (id: ConstraintId, family: Family, unit: Unit): Check => ({ id, family, passed: true, actual: null, limit: null, unit, room: null });

/** The bank's two lines, read by bankpolicy.ts on the candidate's request (the tracks priced at the bank's list rates). Null when the file cannot be read. */
function bankVerdict(c: Candidate) {
  const r = c.request;
  if (!r.bank) return null;
  if (disposableIncome(incomeTotal(c), r.obligations).lte(0)) return null;
  return evaluateBank(r.bank, {
    value: r.price,
    income: incomeTotal(c),
    obligations: r.obligations,
    tracks: c.tracks.map((t) => ({ kind: t.kind, amount: t.amount, months: t.months })),
  });
}

const regLine = (c: Candidate, id: "ltv" | "pti" | "variable" | "term"): LineResult | null => {
  const r = c.request;
  const d = disposableIncome(incomeTotal(c), r.obligations);
  if (d.lte(0)) return null;
  return checkMix(toMixTracks(c.tracks), { deal: r.deal, value: r.price, disposableIncome: d, addedPayment: addedToPayment(r.obligations) }).lines.find((l) => l.id === id) ?? null;
};

// ── The constraints ────────────────────────────────────────────────────────

export const CONSTRAINTS: Constraint[] = [
  {
    id: "sum_equals_loan",
    family: "identity",
    labelHe: "סכום המסלולים שווה לסכום ההלוואה",
    ruleHe: "המסלולים מצטברים בדיוק למחיר הנכס פחות ההון העצמי.",
    check(c) {
      const loan = new Decimal(c.request.price).minus(c.request.equity);
      const sum = c.tracks.reduce<Decimal>((s, t) => s.plus(t.amount), ZERO);
      return { id: "sum_equals_loan", family: "identity", passed: sum.eq(loan), actual: sum, limit: loan, unit: "shekels", room: null };
    },
  },
  {
    id: "positive_tracks",
    family: "identity",
    labelHe: "כל מסלול בסכום חיובי ובתקופה שלמה",
    ruleHe: "אין מסלול ריק או שלילי, והתקופה של כל מסלול היא מספר שלם של חודשים.",
    check(c) {
      const bad = c.tracks.filter((t) => new Decimal(t.amount).lte(0) || !Number.isInteger(t.months) || t.months < 1).length;
      return { id: "positive_tracks", family: "identity", passed: c.tracks.length > 0 && bad === 0, actual: new Decimal(bad), limit: ZERO, unit: "none", room: null };
    },
  },
  {
    id: "equity_available",
    family: "client",
    labelHe: "ההון העצמי קיים",
    ruleHe: "ההון העצמי שנכנס לעסקה אינו עולה על מה שיש ללקוח.",
    check(c) {
      const actual = new Decimal(c.request.equity);
      const limit = new Decimal(c.request.equityAvailable);
      return ceilingCheck("equity_available", "client", "shekels", actual, limit, actual.lte(limit), limit.minus(actual));
    },
  },
  {
    id: "ltv",
    family: "law",
    labelHe: "שיעור מימון עד התקרה",
    ruleHe: "ההלוואה אינה עולה על התקרה של סוג העסקה באחוז משווי הנכס. נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 02/2026, סעיף 2).",
    check(c) {
      const l = regLine(c, "ltv");
      if (!l) return ceilingCheck("ltv", "law", "percent", null, ZERO, false, null);
      return ceilingCheck("ltv", "law", "percent", l.actual, l.limit, l.status !== "over", l.limit.minus(l.actual));
    },
  },
  {
    id: "pti",
    family: "law",
    labelHe: "יחס החזר עד 50%",
    ruleHe: "יחס ההחזר אינו עולה על 50%. נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 02/2026, סעיף 5).",
    check(c) {
      const l = regLine(c, "pti");
      if (!l) return ceilingCheck("pti", "law", "percent", null, new Decimal(50), false, null);
      return ceilingCheck("pti", "law", "percent", l.actual, l.limit, l.status !== "over", l.limit.minus(l.actual));
    },
  },
  {
    id: "variable_share",
    family: "law",
    labelHe: "לפחות שליש בריבית קבועה",
    ruleHe: "החלק בריבית שיכולה להשתנות אינו עולה על שני שלישים מההלוואה. נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 02/2026, סעיף 7).",
    check(c) {
      const m = measures(c);
      const l = regLine(c, "variable");
      // The line's own result carries the limit in shekels; the check reads it in percent of the loan.
      const limit = new Decimal(200).div(3);
      const passed = l ? l.status !== "over" : m.variable.mul(3).lte(m.loan.mul(2));
      return ceilingCheck("variable_share", "law", "percent", m.variablePercent, limit, passed, limit.minus(m.variablePercent));
    },
  },
  {
    id: "term",
    family: "law",
    labelHe: "עד 30 שנה",
    ruleHe: "התקופה של המסלול הארוך ביותר אינה עולה על 30 שנה. נקרא מהנוסח הרשמי של בנק ישראל (הוראה 329, גרסת 02/2026, סעיף 8).",
    check(c) {
      const months = new Decimal(Math.max(...c.tracks.map((t) => t.months)));
      const limit = new Decimal(MAX_TERM_MONTHS);
      return ceilingCheck("term", "law", "months", months, limit, months.lte(limit), limit.minus(months));
    },
  },
  {
    id: "bank_ratio",
    family: "bank",
    labelHe: "יחס ההחזר עד נקודת הסירוב של הבנק",
    ruleHe: "יחס ההחזר, במחירון של הבנק, אינו עולה על הקו שמעליו הבנק (הבדוי) מסרב.",
    check(c) {
      if (!c.request.bank) return notAsked("bank_ratio", "bank", "percent");
      const v = bankVerdict(c);
      const limit = new Decimal(c.request.bank.ratioMax);
      if (!v) return ceilingCheck("bank_ratio", "bank", "percent", null, limit, false, null);
      const line = v.lines.find((l) => l.id === "ratio");
      return ceilingCheck("bank_ratio", "bank", "percent", v.ratio, limit, line?.outcome !== "refuse", limit.minus(v.ratio));
    },
  },
  {
    id: "bank_ltv",
    family: "bank",
    labelHe: "שיעור המימון עד נקודת הסירוב של הבנק",
    ruleHe: "שיעור המימון אינו עולה על הקו שמעליו הבנק (הבדוי) מסרב.",
    check(c) {
      if (!c.request.bank) return notAsked("bank_ltv", "bank", "percent");
      const v = bankVerdict(c);
      const limit = new Decimal(c.request.bank.ltvMax);
      if (!v) return ceilingCheck("bank_ltv", "bank", "percent", null, limit, false, null);
      const line = v.lines.find((l) => l.id === "ltv");
      return ceilingCheck("bank_ltv", "bank", "percent", v.ltv, limit, line?.outcome !== "refuse", limit.minus(v.ltv));
    },
  },
  {
    id: "client_max_payment",
    family: "client",
    labelHe: "ההחזר החודשי עד המרבי שהלקוח קבע",
    ruleHe: "ההחזר הראשון אינו עולה על הסכום שהלקוח אמר שהוא יכול לשלם בחודש.",
    check(c) {
      if (c.request.maxPayment === null) return notAsked("client_max_payment", "client", "shekels");
      const limit = new Decimal(c.request.maxPayment);
      const actual = measures(c).payment;
      return ceilingCheck("client_max_payment", "client", "shekels", actual, limit, actual.lte(limit), limit.minus(actual));
    },
  },
  {
    id: "client_target_ratio",
    family: "client",
    labelHe: "יחס ההחזר עד היעד של הלקוח",
    ruleHe: "יחס ההחזר אינו עולה על היעד שהלקוח קבע (למשל להישאר מתחת ל־40%).",
    check(c) {
      if (c.request.targetRatio === null) return notAsked("client_target_ratio", "client", "percent");
      const limit = new Decimal(c.request.targetRatio);
      const ratio = measures(c).ratio;
      if (ratio === null) return ceilingCheck("client_target_ratio", "client", "percent", null, limit, false, null);
      return ceilingCheck("client_target_ratio", "client", "percent", ratio, limit, ratio.lte(limit), limit.minus(ratio));
    },
  },
];

// ── Evaluating ─────────────────────────────────────────────────────────────

export function evaluate(c: Candidate, constraints: Constraint[] = CONSTRAINTS): Evaluation {
  if (c.tracks.length === 0) throw new RangeError("a candidate needs at least one track");
  // A check that cannot even be computed (a zero loan, an income that does not cover the obligations) fails, with actual null.
  const safe = (k: Constraint): Check => {
    try {
      return k.check(c);
    } catch (e) {
      if (e instanceof RangeError) return { id: k.id, family: k.family, passed: false, actual: null, limit: null, unit: "none", room: null };
      throw e;
    }
  };
  const checks = constraints.map(safe);
  let notes: Evaluation["notes"] = [];
  try {
    const m = measures(c);
    if (m.ratio !== null && m.ratio.gt(40)) notes = ["above_capital"];
  } catch (e) {
    if (!(e instanceof RangeError)) throw e;
  }
  return { candidate: c, checks, reasons: checks.filter((x) => !x.passed), feasible: checks.every((x) => x.passed), notes };
}

export function rejectionReasons(c: Candidate, constraints: Constraint[] = CONSTRAINTS): ConstraintId[] {
  return evaluate(c, constraints).reasons.map((x) => x.id);
}

export const isFeasible = (c: Candidate, constraints: Constraint[] = CONSTRAINTS): boolean => evaluate(c, constraints).feasible;

export function feasibleSet(candidates: Candidate[], constraints: Constraint[] = CONSTRAINTS): Candidate[] {
  return candidates.filter((c) => isFeasible(c, constraints));
}

export function rejectionCounts(candidates: Candidate[], constraints: Constraint[] = CONSTRAINTS): Record<ConstraintId, number> {
  const counts = Object.fromEntries(CONSTRAINTS.map((k) => [k.id, 0])) as Record<ConstraintId, number>;
  for (const c of candidates) for (const id of rejectionReasons(c, constraints)) counts[id]++;
  return counts;
}
