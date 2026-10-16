/**
 * Early repayment — what it costs to leave a mortgage track before its end.
 * The arithmetic behind lessons 7.1–7.3 (the five fees, the discounting fee in
 * both versions and "the lower of the two", the reductions for time served,
 * exit points and the notice window, the index fee and the 16th), and the
 * building block of 7.4 (the refinance test) and 7.8 (case C).
 *
 * SOURCE AND STATUS. The Banking Order on early repayment of a housing loan
 * (צו הבנקאות, פירעון מוקדם של הלוואה לדיור, 2002; its only amendment is
 * 2014) is known to the course ONLY through the team's transcription in the
 * Brain (page 7798786, read by the team on 2026-08-02/03). Nobody on the
 * course has opened the Order. Every rule below is "תעתיק של הצוות, לא נבדק
 * מחדש מול הצו". The three readings that are ours, not the Order's, are marked
 * OUR READING where they occur.
 *
 * ─── THE API (stable; B and C import it — add, don't rename) ─────────────────
 *
 *  Types of rate — NEVER mixed (the classic mistake):
 *    nominal("5.90")   the contract's rate: a nominal annual rate; monthly = ÷ 12.
 *    effective("4.82") a published average (ריבית ממוצעת): an effective annual
 *                      rate; monthly = the twelfth root of (1 + e) − 1.
 *    monthlyFraction(rate)        either one → the monthly rate as a fraction (0.0049…)
 *    effectiveOfNominal(nominal)  5.90 nominal → 6.06 effective (the check of the mix-up)
 *
 *  Dates are ISO strings "2026-08-02". Payments fall on the grant's day of the
 *  month, the first one a month after the grant (CALCULATION ASSUMPTION: a
 *  contract sets its own dates). Helpers: daysBetween, addMonths,
 *  addDays, wholeMonthsBetween, paymentsMade.
 *
 *  The remaining stream:
 *    remainingStream(loan, paid)  → { paid, remaining, balance, payments[] }  (exact, unrounded)
 *
 *  The discounting fee on explicit numbers (the Order's §3(3), §3(4), §3(5)):
 *    discountingFee({ payments, monthsToReset, contract, contractAtGrant,
 *                     averageToday, averageAtGrant })
 *      → { pvToday, pvContract, pvGrant, v1, v2, v1Applies, v2Applies, lower, binding }
 *      v1 = PV(A) − PV            §3(3), applies if A < R       (monthly rates)
 *      v2 = PV(A) − PV(C)         §3(4), applies if C < R0      (monthly rates)
 *      lower                      §3(5): the lower of those that apply; null if none
 *      A average today, C average on the grant day, R the contract rate now,
 *      R0 the contract rate at grant. Fixed track: monthsToReset = null.
 *
 *  Everything else the Order sets:
 *    discountingFeeApplies(track)         fixed yes · variable only if it resets less than yearly · prime no
 *    timeServedReduction(grantedOn, repaidOn)  0% / 20% / 30% of the discounting fee
 *    operationalFee()                     ≤ ₪60, once per repayment, not per track
 *    noticeStatus(noticeGivenOn, repaidOn)  "none" | "early" | "ok" | "short" (+ days)
 *    noNoticeFee(amount, status)          0.1% of the amount repaid
 *    averageMonthlyChange(indices)        OUR READING of "the last twelve published indices"
 *    indexFee({amount, avgMonthlyChangePercent, repaidOn, linkage})  ½ × change × amount, 1st–15th only
 *    nextReset(grantedOn, resetEveryMonths, repaidOn)  → { date, monthsToReset, isExitPoint }
 *    bucketFor(months, linkage)           which published-average bucket (edges flagged, not decided)
 *
 *  The whole fee, with every intermediate value (for the calculator):
 *    earlyRepaymentFee(input) → FeeResult
 *    feeOverTime(input, dates) → { date, fee }[]   (the axis of lesson 7.3)
 *
 *  Fixture: WORKED_EXAMPLE (case C's loan; the team's own computation) —
 *  the tests reproduce it to the agora; B and C use it as a known result.
 *
 * ─── RULES AS THE TEAM TRANSCRIBED THEM, AND WHAT THE CODE DOES ──────────────
 *  - Five fees; one dominates (the discounting fee). A directed loan (הלוואה
 *    מוכוונת) carries none of them: all zero.
 *  - Money is exact (Decimal) here and rounded only when shown (money.ts).
 *  - A negative discounting fee is set off against the other fees (the Order,
 *    §7). OUR READING: the total never goes below zero, and a time-served
 *    reduction applies only to a positive fee. The Order, as transcribed,
 *    says neither; both are open questions.
 *  - On an exit point (the reset day of a variable track) only the operational
 *    fee is charged (§4(3), as transcribed). Whether the no-notice and the
 *    index fee also apply there is not stated: this code follows "only".
 *  - Periods: the PV counts the first remaining payment one month after the
 *    repayment (the team's example ignores the interest of the few days since
 *    the last payment; `accrued` adds it if a caller has it).
 *  - NOT MODELLED (labelled "לא אומת" or open): the complementary-loan scale
 *    (up to 40%); loans granted before 2015-02-23 (pre-amendment formula);
 *    the exemption for realising a mortgage on a single dwelling; the foreign
 *    currency fee's amount; a variable track whose rate has already reset
 *    (pass `balance` from the statement); which bucket C is read from (the
 *    remaining-term bucket is OUR READING); whether the bucket edges are
 *    inclusive.
 *
 * Recomputed independently in checks/kinds/earlyrepay.py (plain Decimal,
 * nothing imported from here).
 */
import Decimal from "decimal.js";
import { annuityBalance, annuityPayment } from "./amortization.ts";

export type Numeric = Decimal.Value;
export type ISODate = string;

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const ONE = new D(1);
const HUNDRED = new D(100);
const TWELVE = new D(12);

// ── The two kinds of annual rate, typed apart ─────────────────────────────────

/** A nominal annual rate in percent — what a loan contract names. Monthly: ÷ 12. */
export interface Nominal {
  readonly kind: "nominal";
  readonly percent: string;
}
/** An effective annual rate in percent — what the Bank of Israel's averages are. Monthly: the twelfth root. */
export interface Effective {
  readonly kind: "effective";
  readonly percent: string;
}
export const nominal = (percent: Numeric): Nominal => ({ kind: "nominal", percent: new D(percent).toString() });
export const effective = (percent: Numeric): Effective => ({ kind: "effective", percent: new D(percent).toString() });

/** The monthly rate as a FRACTION (0.5% → 0.005): nominal ÷ 12, effective by the twelfth root. */
export function monthlyFraction(rate: Nominal | Effective): Decimal {
  const p = new D(rate.percent).div(HUNDRED);
  if (rate.kind === "nominal") return p.div(TWELVE);
  const base = ONE.plus(p);
  if (base.lte(0)) throw new RangeError("an effective rate of −100% or less has no monthly rate");
  return base.pow(ONE.div(12)).minus(ONE);
}

/** The effective annual rate (percent) of a nominal one: ((1 + n ÷ 12)^12 − 1) × 100. 5.90 → 6.0617… */
export function effectiveOfNominal(rate: Nominal): Effective {
  return effective(ONE.plus(monthlyFraction(rate)).pow(12).minus(ONE).mul(HUNDRED));
}

// ── Dates (ISO strings, UTC, no time zones) ───────────────────────────────────

function parseDate(d: ISODate): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) throw new RangeError(`a date is written YYYY-MM-DD, got "${d}"`);
  const [y, mo, da] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, da));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== da) throw new RangeError(`not a date: "${d}"`);
  return [y, mo, da];
}
const dayNumber = (d: ISODate): number => {
  const [y, m, da] = parseDate(d);
  return Math.round(Date.UTC(y, m - 1, da) / 86400000);
};
const iso = (y: number, m: number, d: number) => `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return dayNumber(to) - dayNumber(from);
}

/** The date `k` months after `d`, on the same day of the month (cut to the month's last day when it is shorter). */
export function addMonths(d: ISODate, k: number): ISODate {
  const [y, m, da] = parseDate(d);
  const index = y * 12 + (m - 1) + k;
  const ny = Math.floor(index / 12);
  const nm = (index % 12) + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return iso(ny, nm, Math.min(da, last));
}

/** The date `k` calendar days after `d` (k may be negative). */
export function addDays(d: ISODate, k: number): ISODate {
  const t = new Date((dayNumber(d) + k) * 86400000);
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** Whole months elapsed from `from` to `to`: the largest k with addMonths(from, k) ≤ to. */
export function wholeMonthsBetween(from: ISODate, to: ISODate): number {
  const [y1, m1] = parseDate(from);
  const [y2, m2] = parseDate(to);
  let k = (y2 - y1) * 12 + (m2 - m1);
  while (k > 0 && addMonths(from, k) > to) k--;
  while (addMonths(from, k + 1) <= to) k++;
  return k;
}

/** Payments made by the repayment date: one per whole month since the grant, never more than the term. */
export function paymentsMade(grantedOn: ISODate, repaidOn: ISODate, termMonths: number): number {
  if (repaidOn < grantedOn) throw new RangeError("the repayment date is before the grant date");
  return Math.min(termMonths, wholeMonthsBetween(grantedOn, repaidOn));
}

// ── The remaining stream of one fixed-rate (or constant-rate) track ───────────

export type Method = "spitzer" | "equal_principal";

export interface TrackTerms {
  /** The amount granted. */
  principal: Numeric;
  /** The contract's nominal annual rate (the rate now, R). */
  contract: Nominal;
  termMonths: number;
  method?: Method;
}

export interface Stream {
  paid: number;
  remaining: number;
  /** The balance after `paid` payments (principal repaid, before any linkage or accrued interest). */
  balance: Decimal;
  /** The payments still to come, B₁…B_N, interest included, exact (unrounded). */
  payments: Decimal[];
}

/** The payments left after `paid` payments of a constant-rate schedule. Exact; round only for display. */
export function remainingStream(track: TrackTerms, paid: number): Stream {
  const { termMonths } = track;
  if (!Number.isInteger(paid) || paid < 0 || paid > termMonths) throw new RangeError(`paid must be a whole number from 0 to ${termMonths}, got ${paid}`);
  const remaining = termMonths - paid;
  const rate = track.contract.percent;
  const m = monthlyFraction(track.contract);
  if ((track.method ?? "spitzer") === "spitzer") {
    const c = new D(annuityPayment(track.principal, rate, termMonths));
    return { paid, remaining, balance: new D(annuityBalance(track.principal, rate, termMonths, paid)), payments: Array.from({ length: remaining }, () => c) };
  }
  const part = new D(track.principal).div(termMonths);
  let bal = new D(track.principal).mul(remaining).div(termMonths);
  const start = bal;
  const payments: Decimal[] = [];
  for (let k = 1; k <= remaining; k++) {
    payments.push(k === remaining ? bal.plus(bal.mul(m)) : part.plus(bal.mul(m)));
    bal = bal.minus(part);
  }
  return { paid, remaining, balance: start, payments };
}

/** The value today of payments at a monthly rate (a fraction): Σ Bᵢ ÷ (1 + q)^i, i from 1. */
export function streamValue(payments: Numeric[], monthly: Numeric): Decimal {
  const v = ONE.div(ONE.plus(monthly));
  let factor = ONE;
  let sum = new D(0);
  for (const b of payments) {
    factor = factor.mul(v);
    sum = sum.plus(factor.mul(b));
  }
  return sum;
}

// ── Which tracks carry a discounting fee ──────────────────────────────────────

export type TrackKind = "fixed" | "variable" | "prime";

/**
 * Fixed: yes. Variable: only if its rate resets LESS often than once a year
 * (every 24, 30, 36, 60 months…); yearly or more often: no (§4(2)). Prime: no.
 * Whether a directed loan is exempt from everything is `directed` in the fee input.
 */
export function discountingFeeApplies(track: { kind: TrackKind; resetEveryMonths?: number }): boolean {
  if (track.kind === "fixed") return true;
  if (track.kind === "prime") return false;
  if (!track.resetEveryMonths) throw new RangeError("a variable track needs resetEveryMonths");
  return track.resetEveryMonths > 12;
}

// ── The discounting fee itself (§3(3), §3(4), §3(5)) ──────────────────────────

export interface DiscountingInput {
  /** The remaining payments B₁…B_N, interest included. */
  payments: Numeric[];
  /** n: payments until the next rate reset; null for a fixed track (the second term drops). */
  monthsToReset: number | null;
  /** R: the contract's rate now. Always the DISCOUNT rate of the part after the reset. */
  contract: Nominal;
  /** R₀: the contract's rate on the grant day. */
  contractAtGrant: Nominal;
  /** A: the published average today, for the bucket of the remaining term (or the time to the reset). */
  averageToday: Effective;
  /** C: the published average on the grant day. null: none was published → C := R₀, so §3(4) does not exist. */
  averageAtGrant: Effective | null;
}

export interface DiscountingResult {
  /** Monthly rates, as fractions: R (÷12), A and C (twelfth root). */
  monthly: { contract: Decimal; today: Decimal; atGrant: Decimal | null };
  /** PV(A): the stream (with the part after the reset at R) discounted at A. */
  pvToday: Decimal;
  /** PV at the loan's own rate: for a constant-rate stream, the balance itself. */
  pvContract: Decimal;
  /** PV(C): the same stream discounted at C. null when no C was published. */
  pvGrant: Decimal | null;
  v1Applies: boolean;
  v2Applies: boolean;
  /** §3(3): PV(A) − PV. null if A is not below R. */
  v1: Decimal | null;
  /** §3(4): PV(A) − PV(C). null if C does not exist or is not below R₀. May be negative. */
  v2: Decimal | null;
  /** §3(5): the lower of those that exist. null when neither does (no discounting fee). */
  lower: Decimal | null;
  binding: "v1" | "v2" | null;
}

/** Value today at `monthly`, the part after the reset always taken back to the reset day at R. */
function pvWithReset(payments: Decimal[], n: number, monthly: Decimal, contractMonthly: Decimal): Decimal {
  const first = payments.slice(0, n);
  const tail = payments.slice(n);
  let value = streamValue(first, monthly);
  if (tail.length) value = value.plus(streamValue(tail, contractMonthly).div(ONE.plus(monthly).pow(n)));
  return value;
}

export function discountingFee(input: DiscountingInput): DiscountingResult {
  const payments = input.payments.map((p) => new D(p));
  const n = input.monthsToReset === null ? payments.length : Math.min(input.monthsToReset, payments.length);
  if (n < 0 || !Number.isInteger(n)) throw new RangeError("monthsToReset must be a whole number of at least 0");
  const mR = monthlyFraction(input.contract);
  const mR0 = monthlyFraction(input.contractAtGrant);
  const mA = monthlyFraction(input.averageToday);
  const mC = input.averageAtGrant ? monthlyFraction(input.averageAtGrant) : null;

  const pvToday = pvWithReset(payments, n, mA, mR);
  const pvContract = pvWithReset(payments, n, mR, mR);
  const pvGrant = mC ? pvWithReset(payments, n, mC, mR) : null;

  // Both comparisons are between MONTHLY rates: the Order says all rates are periodic.
  const v1Applies = mA.lt(mR);
  const v2Applies = mC !== null && mC.lt(mR0);
  const v1 = v1Applies ? pvToday.minus(pvContract) : null;
  const v2 = v2Applies && pvGrant ? pvToday.minus(pvGrant) : null;
  let lower: Decimal | null = null;
  let binding: "v1" | "v2" | null = null;
  if (v1 && v2) {
    binding = v2.lte(v1) ? "v2" : "v1";
    lower = binding === "v2" ? v2 : v1;
  } else if (v1) {
    lower = v1;
    binding = "v1";
  } else if (v2) {
    lower = v2;
    binding = "v2";
  }
  return { monthly: { contract: mR, today: mA, atGrant: mC }, pvToday, pvContract, pvGrant, v1Applies, v2Applies, v1, v2, lower, binding };
}

// ── The reductions for time served (§8(b)), the discounting fee only ──────────

export interface Reduction {
  percent: 0 | 20 | 30;
  /** True on the exact anniversary (3 or 5 years to the day): the table's wording does not settle the day itself. */
  onBoundary: boolean;
}

/** < 3 years: 0%; 3 to < 5: 20%; ≥ 5: 30%. Counted from the grant day to the repayment day. */
export function timeServedReduction(grantedOn: ISODate, repaidOn: ISODate): Reduction {
  if (repaidOn < grantedOn) throw new RangeError("the repayment date is before the grant date");
  const three = addMonths(grantedOn, 36);
  const five = addMonths(grantedOn, 60);
  const onBoundary = repaidOn === three || repaidOn === five;
  // The table reads "3 to < 5 years" and "≥ 5 years": the anniversary itself goes to the higher step.
  const percent = repaidOn >= five ? 30 : repaidOn >= three ? 20 : 0;
  return { percent, onBoundary };
}

// ── The other four fees ───────────────────────────────────────────────────────

/** §3(1): up to ₪60. The course (and this code) uses the ceiling; a bank may charge less. */
export const OPERATIONAL_FEE = "60.00";
/** The Supervisor of Banks' ruling of 2021-09-13 (team transcription): once per repayment, not per track. */
export function operationalFee(): Decimal {
  return new D(OPERATIONAL_FEE);
}

export const NO_NOTICE_PERCENT = "0.1";
export const NOTICE_MIN_DAYS = 10;
export const NOTICE_MAX_DAYS = 45;
/** Anti-gaming (team transcription): an unused notice → another notice on the same loan within six months does not count. */
export const NOTICE_COOLDOWN_MONTHS = 6;

export interface NoticeStatus {
  status: "none" | "early" | "ok" | "short" | "after";
  /** Calendar days between the notice and the repayment (null without a notice). */
  days: number | null;
  /** Does a no-notice fee follow? Yes unless the notice was given 10 to 45 days ahead. */
  feeCharged: boolean;
}

/**
 * Notice in writing, 10 to 45 days before the repayment. Fewer than 10 days, or none: the no-notice fee.
 * More than 45 days ahead the notice may not be given: OUR READING is that it then does not count,
 * so the fee follows. How the days are counted (calendar, business, the day itself) is not
 * settled by the transcription; the course stays away from days 10 and 45.
 */
export function noticeStatus(noticeGivenOn: ISODate | null | undefined, repaidOn: ISODate): NoticeStatus {
  if (!noticeGivenOn) return { status: "none", days: null, feeCharged: true };
  const days = daysBetween(noticeGivenOn, repaidOn);
  if (days < 0) return { status: "after", days, feeCharged: true };
  if (days > NOTICE_MAX_DAYS) return { status: "early", days, feeCharged: true };
  if (days < NOTICE_MIN_DAYS) return { status: "short", days, feeCharged: true };
  return { status: "ok", days, feeCharged: false };
}

/** Does a second notice count? Not if an earlier one on the same loan was given less than six months before and not acted on. */
export function noticeCounts(earlierUnusedNoticeOn: ISODate | null | undefined, newNoticeOn: ISODate): boolean {
  if (!earlierUnusedNoticeOn) return true;
  return newNoticeOn >= addMonths(earlierUnusedNoticeOn, NOTICE_COOLDOWN_MONTHS);
}

/** §3(2): 0.1% of the amount repaid, when there was no valid notice. */
export function noNoticeFee(amountRepaid: Numeric, status: NoticeStatus): Decimal {
  return status.feeCharged ? new D(amountRepaid).mul(NO_NOTICE_PERCENT).div(HUNDRED) : new D(0);
}

/**
 * The average monthly change of the index, in percent, from published index values in order (oldest first):
 * the mean of the month-to-month changes. OUR READING of "the average monthly change over the last twelve
 * published indices" — twelve values give eleven changes; whether the Order means eleven or twelve, and an
 * arithmetic or a geometric mean, is an open question.
 */
export function averageMonthlyChange(indices: Numeric[]): Decimal {
  if (indices.length < 2) throw new RangeError("at least two index values are needed");
  let sum = new D(0);
  for (let i = 1; i < indices.length; i++) sum = sum.plus(new D(indices[i]).div(indices[i - 1]).minus(ONE));
  return sum.div(indices.length - 1).mul(HUNDRED);
}

export const INDEX_FEE_LAST_DAY = 15;

/**
 * §5: a CPI-linked loan repaid between the 1st and the 15th of the month: amount × ½ × the average monthly
 * index change. From the 16th: none. Not computed when the change is zero or negative (the transcription is
 * silent; OUR READING is no fee).
 */
export function indexFee(input: { amount: Numeric; avgMonthlyChangePercent: Numeric; repaidOn: ISODate; linkage: "linked" | "unlinked" }): Decimal {
  if (input.linkage !== "linked") return new D(0);
  const day = parseDate(input.repaidOn)[2];
  if (day > INDEX_FEE_LAST_DAY) return new D(0);
  const change = new D(input.avgMonthlyChangePercent);
  if (change.lte(0)) return new D(0);
  return new D(input.amount).mul(change).div(HUNDRED).div(2);
}

// ── Exit points and the published-average buckets ─────────────────────────────

export interface Reset {
  /** The next reset date on or after the repayment date. */
  date: ISODate;
  /** Payments between the repayment and that date (0 on the reset day itself). */
  monthsToReset: number;
  /** Repaying on the reset day: only the operational fee. */
  isExitPoint: boolean;
}

/** A variable track resets every `resetEveryMonths` months from the grant; dates come from the contract, not from regulation. */
export function nextReset(grantedOn: ISODate, resetEveryMonths: number, repaidOn: ISODate): Reset {
  if (!Number.isInteger(resetEveryMonths) || resetEveryMonths < 1) throw new RangeError("resetEveryMonths must be a whole number of at least 1");
  let k = Math.max(1, Math.floor(wholeMonthsBetween(grantedOn, repaidOn) / resetEveryMonths));
  while (addMonths(grantedOn, k * resetEveryMonths) < repaidOn) k++;
  const date = addMonths(grantedOn, k * resetEveryMonths);
  const isExitPoint = date === repaidOn;
  const paid = wholeMonthsBetween(grantedOn, repaidOn);
  return { date, monthsToReset: isExitPoint ? 0 : k * resetEveryMonths - paid, isExitPoint };
}

export interface Bucket {
  /** The published band, in years: "15–20", "≤1", ">25". */
  label: string;
  /** Zero-based position in the file's list of bands. */
  index: number;
  /** The time sits exactly on a band's edge: whether the edge belongs to the lower or the upper band is not verified. */
  onEdge: boolean;
}

const UNLINKED_EDGES = [1, 5, 10, 15, 20, 25];
const LINKED_EDGES = [5, 10, 15, 20, 25];

/**
 * Which band of the Bank of Israel's monthly average file a time falls in. The time is the REMAINING
 * time (a fixed track: to the last payment; a variable track: to the day before the next reset), not the
 * original term. Unlinked shekel: ≤1 · 1–5 · 5–10 · 10–15 · 15–20 · 20–25 · >25; CPI-linked: ≤5 · 5–10 · … · >25.
 * Edges are reported (`onEdge`), not decided.
 */
export function bucketFor(months: number, linkage: "linked" | "unlinked"): Bucket {
  const edges = linkage === "linked" ? LINKED_EDGES : UNLINKED_EDGES;
  const years = months / 12;
  const index = edges.filter((e) => years > e).length;
  const onEdge = edges.some((e) => years === e);
  const label = index === 0 ? `≤${edges[0]}` : index === edges.length ? `>${edges[edges.length - 1]}` : `${edges[index - 1]}–${edges[index]}`;
  return { label, index, onEdge };
}

// ── The whole fee ─────────────────────────────────────────────────────────────

export interface FeeInput {
  loan: TrackTerms & {
    grantedOn: ISODate;
    kind?: TrackKind;
    /** A variable track: months between resets (12, 24, 36, 60…). */
    resetEveryMonths?: number;
    /** R₀ when it differs from `contract` (a variable track after a reset). Default: `contract`. */
    contractAtGrant?: Nominal;
    linkage?: "linked" | "unlinked";
  };
  repaidOn: ISODate;
  averageToday: Effective;
  /** null or absent: no average was published for the grant day. */
  averageAtGrant?: Effective | null;
  /** The date the written notice was given; null or absent: no notice. */
  noticeGivenOn?: ISODate | null;
  /** The average monthly change of the index, percent (a linked loan only). */
  indexChangeAvgPercent?: Numeric;
  /** The balance from the statement, when the course's constant-rate schedule would be wrong (a rate already reset). */
  balance?: Numeric;
  /** Interest accrued since the last payment, added to the amount repaid and to the value of what is repaid. Default 0. */
  accrued?: Numeric;
  /** A directed loan (הלוואה מוכוונת): no fee of any kind (§2). */
  directed?: boolean;
}

export interface FeeResult {
  /** Why there is no discounting fee, when there is none. */
  status: "ok" | "directed" | "track_exempt" | "exit_point" | "repaid_already";
  paid: number;
  remaining: number;
  /** The first remaining payment (all of them for spitzer). */
  payment: Decimal;
  balance: Decimal;
  /** Payments until the next reset; null on a fixed track. */
  monthsToReset: number | null;
  bucket: Bucket;
  discounting: DiscountingResult | null;
  /** The lower of the two, before the reduction (null when there is no discounting fee). */
  lower: Decimal | null;
  reduction: Reduction;
  /** The discounting fee after the reduction. */
  discount: Decimal;
  operational: Decimal;
  notice: NoticeStatus;
  noNotice: Decimal;
  index: Decimal;
  /** The four parts added, before the floor at zero: can be negative. */
  sum: Decimal;
  /** What the borrower pays: the sum, never below zero (OUR READING). */
  total: Decimal;
  floored: boolean;
}

const zero = () => new D(0);

export function earlyRepaymentFee(input: FeeInput): FeeResult {
  const { loan } = input;
  const kind = loan.kind ?? (loan.resetEveryMonths ? "variable" : "fixed");
  const linkage = loan.linkage ?? "unlinked";
  const paid = paymentsMade(loan.grantedOn, input.repaidOn, loan.termMonths);
  const stream = remainingStream(loan, paid);
  const balance = new D(input.balance ?? stream.balance);
  const amount = balance.plus(input.accrued ?? 0);
  const notice = noticeStatus(input.noticeGivenOn, input.repaidOn);
  const reduction = timeServedReduction(loan.grantedOn, input.repaidOn);
  const reset = kind === "variable" && loan.resetEveryMonths ? nextReset(loan.grantedOn, loan.resetEveryMonths, input.repaidOn) : null;
  const monthsToReset = reset ? reset.monthsToReset : null;
  const bucket = bucketFor(monthsToReset ?? stream.remaining, linkage);
  const base = { paid, remaining: stream.remaining, payment: stream.payments[0] ?? zero(), balance, monthsToReset, bucket, reduction, notice };
  const operational = operationalFee();

  if (input.directed) {
    return { ...base, status: "directed", discounting: null, lower: null, discount: zero(), operational: zero(), noNotice: zero(), index: zero(), sum: zero(), total: zero(), floored: false };
  }
  if (stream.remaining === 0) {
    return { ...base, status: "repaid_already", discounting: null, lower: null, discount: zero(), operational: zero(), noNotice: zero(), index: zero(), sum: zero(), total: zero(), floored: false };
  }
  if (reset?.isExitPoint) {
    return { ...base, status: "exit_point", discounting: null, lower: null, discount: zero(), operational, noNotice: zero(), index: zero(), sum: operational, total: operational, floored: false };
  }

  const noNotice = noNoticeFee(amount, notice);
  const index = indexFee({ amount, avgMonthlyChangePercent: input.indexChangeAvgPercent ?? 0, repaidOn: input.repaidOn, linkage });
  const carries = discountingFeeApplies({ kind, resetEveryMonths: loan.resetEveryMonths });
  const discounting = carries
    ? discountingFee({
        payments: stream.payments,
        monthsToReset,
        contract: loan.contract,
        contractAtGrant: loan.contractAtGrant ?? loan.contract,
        averageToday: input.averageToday,
        averageAtGrant: input.averageAtGrant ?? null,
      })
    : null;
  const lower = discounting?.lower ?? null;
  // OUR READING: a reduction takes a percentage off a positive fee only.
  const discount = lower === null ? zero() : lower.gt(0) ? lower.mul(HUNDRED.minus(reduction.percent)).div(HUNDRED) : lower;
  const sum = discount.plus(operational).plus(noNotice).plus(index);
  const floored = sum.lt(0);
  return { ...base, status: carries ? "ok" : "track_exempt", discounting, lower, discount, operational, noNotice, index, sum, total: floored ? zero() : sum, floored };
}

/** The fee for each repayment date, everything else held still (A and C stay what they are: a teaching assumption). */
export function feeOverTime(input: Omit<FeeInput, "repaidOn">, dates: ISODate[]): { date: ISODate; result: FeeResult }[] {
  return dates.map((date) => ({ date, result: earlyRepaymentFee({ ...input, repaidOn: date }) }));
}

// ── The fixture: case C's loan, the team's own computation ────────────────────

/**
 * A single fixed unlinked track, ₪700,000, granted 2023-07-01, 20 years, 5.90% nominal, repaid 2026-08-02
 * with notice. Case C's loan (map section 8). The published averages are "values the team read on 2026-08-02,
 * not verified": C = 5.09% effective (15–20 years); A is written 4.823% in the team's page, but the team's
 * present value (694,721.98) corresponds to A = 4.823049% — with exactly 4.823% the fee comes out ₪2.40
 * higher (56,767.64 and 12,884.84). The fixture uses the value that reproduces the team's table to the agora.
 */
export const WORKED_EXAMPLE: FeeInput = {
  loan: { principal: "700000", contract: nominal("5.90"), termMonths: 240, grantedOn: "2023-07-01", kind: "fixed", linkage: "unlinked" },
  repaidOn: "2026-08-02",
  averageToday: effective("4.823049"),
  averageAtGrant: effective("5.09"),
  noticeGivenOn: "2026-07-03",
};
