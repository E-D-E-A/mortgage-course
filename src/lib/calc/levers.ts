/**
 * Levers — what pulling each one gains and what it costs, in shekels (lesson 6.4;
 * the same arithmetic stands behind the red-line lesson 6.5 and the workshops
 * of stage 6).
 *
 * A lever is something the client can really change before the request goes to
 * the bank: more equity, closing a loan first, waiting until an obligation
 * stops counting, adding a borrower, a longer term, a different split between
 * tracks. This file does not invent a new calculation. It builds the case
 * twice — before and after one lever — with the modules that already exist
 * (sensitivity.ts for the mix and its schedule, affordability.ts for the ratio
 * and the 18-month rule, regulation.ts for the five lines of Directive 329 as the
 * team transcribed them), and reports the difference as a pair:
 *
 *  - the gain: how many percentage points the payment-to-income ratio falls, and
 *    how many shekels a month the payment the ratio uses falls;
 *  - the price, in four currencies that must not be added together:
 *      cashNow     shekels taken out of the family's pocket today (equity added,
 *                  a loan closed);
 *      extraTotal  shekels more (or, negative, fewer) paid over the whole loan,
 *                  base scenario;
 *      stressRise  shekels a month more at the highest payment of the harsh
 *                  scenario (the exposure);
 *      months      months of waiting;
 *    and the walls: a ban of Directive 329 that the lever crosses (the financing
 *    ratio above its ceiling, the variable share above two-thirds, a term above 30
 *    years, a ratio above 50%).
 *
 * Conventions:
 *  - The ratio is lesson 4.3's: each track's first payment on its full amount,
 *    added up (qualifyingTotal), over the recognised income minus the
 *    obligations that count (more than 18 months left). The family's recognised
 *    income here is the sum of its net incomes, the same simplification as in
 *    lesson 4.15 and case-a-mix.ts.
 *  - "Base" and "stress" are teaching scenarios (sensitivity.ts), never forecasts.
 *  - The case's reserve is money kept outside the equity. Whatever the lever
 *    takes from it is cashNow; the reserve left is reported, because the cushion
 *    is the price of an equity lever (brief, part 3). A lever never takes more
 *    than the reserve holds: it throws.
 *  - The living budget (lesson 4.6) is optional. With it, a position says how far
 *    above or below the family's own budget the month-one and the harshest month
 *    leave it. A position that passes the bank's lines and not the family's
 *    budget is a failure of positioning, not a success (brief, part 3).
 *
 * Positioning chooses among TRUE data (which equity, which loan to close first,
 * which borrowers, which mix). Nothing here models leaving a fact out: a lever
 * changes the deal, never what the bank is told about it.
 *
 * Recomputed independently in checks/kinds/levers.py. Exports are stable: other
 * lessons may import them. Add, don't rename.
 */
import Decimal from "decimal.js";
import { affordability, type Obligation } from "./affordability.ts";

import { checkRegulation, type DealType, type LineId, type LineResult, PTI_CAPITAL_THRESHOLD } from "./regulation.ts";
import { loanCut } from "./positioning.ts";
import type { TrackSpec } from "./schedule.ts";
import {
  applyLever,
  leftAt,
  loanOf,
  measuresOf,
  qualifyingTotal,
  type ScenarioSpec,
  scenarioFrom,
  variableAmount,
} from "./sensitivity.ts";

export type Numeric = Decimal.Value;

const ZERO = new Decimal(0);
const HUNDRED = new Decimal(100);
/** A month count that no obligation reaches: an obligation with no end date keeps paying. */
const FOREVER = 99999;

/** A case as a positioning decision sees it. The tracks add up to the price minus the equity. */
export interface PositionCase {
  deal: DealType;
  price: Numeric;
  /** The equity the purchase uses (it is part of the price). */
  equity: Numeric;
  /** Savings kept outside the equity: the cushion. */
  reserve: Numeric;
  tracks: TrackSpec[];
  /** The scenario the total is measured under, and the harsh one the exposure is measured under. */
  base: ScenarioSpec;
  stress: ScenarioSpec;
  /** The recognised net monthly incomes, one per borrower. */
  incomes: Numeric[];
  obligations: Obligation[];
  /** What the family needs for living each month (lesson 4.6). Optional. */
  livingBudget?: Numeric;
}

/** Everything one case is, at one moment. Exact: round when showing. */
export interface Position {
  equity: Decimal;
  reserve: Decimal;
  loan: Decimal;
  /** Financing ratio, percent. */
  ltv: Decimal;
  /** The payment the ratio uses (qualifyingTotal). */
  qualifying: Decimal;
  /** Recognised income minus the obligations that count. */
  disposable: Decimal;
  /** Payment-to-income ratio, percent. */
  ratio: Decimal;
  /** The payment in month 1, base scenario. */
  first: Decimal;
  /** Every payment added up, base scenario. */
  total: Decimal;
  /** The highest payment under the harsh scenario, and the first month it is reached. */
  stressMax: Decimal;
  stressMonth: number;
  /** What is left for living in month 1 (base) and in the harsh scenario's highest month. */
  leftFirst: Decimal;
  leftStress: Decimal;
  /** The living budget's margin in those two months (left − budget); null when the case has no budget. */
  marginFirst: Decimal | null;
  marginStress: Decimal | null;
  /** The part of the loan at a rate that can change (prime and every resetting track). */
  variable: Decimal;
  /** The longest track, in months. */
  months: number;
  /** Directive 329's five lines (regulation.ts). */
  lines: LineResult[];
  /** The bans crossed: lines with status "over" (the capital threshold is not a ban). */
  bans: LineId[];
  /** True when the ratio is above the capital threshold (40%): allowed, but the bank holds more capital. */
  aboveCapital: boolean;
}

function netTotal(incomes: Numeric[]): Decimal {
  return incomes.reduce<Decimal>((s, x) => s.plus(x), ZERO);
}

function assertCase(c: PositionCase): void {
  const loan = loanOf(c.tracks);
  const expected = new Decimal(c.price).minus(c.equity);
  if (!loan.eq(expected)) throw new RangeError(`the tracks add up to ${loan.toString()}, not to the price minus the equity (${expected.toString()})`);
  if (new Decimal(c.reserve).isNeg()) throw new RangeError("the reserve cannot be negative");
  if (c.incomes.length === 0) throw new RangeError("a case needs at least one income");
}

/** Where a case stands: ratio, financing ratio, payments, exposure, what is left, and the lines it crosses. */
export function positionOf(c: PositionCase): Position {
  assertCase(c);
  const loan = loanOf(c.tracks);
  const qualifying = qualifyingTotal(c.tracks);
  const income = netTotal(c.incomes);
  const aff = affordability({ income, obligations: c.obligations, newPayment: qualifying });
  if (aff.ratioPercent === null) throw new RangeError("the disposable income is not above zero");
  const base = measuresOf(c.tracks, scenarioFrom(c.base));
  const stress = measuresOf(c.tracks, scenarioFrom(c.stress));
  const others = c.obligations.filter((o) => new Decimal(o.monthly).gt(0)).map((o) => ({ monthly: o.monthly, monthsLeft: o.monthsLeft ?? FOREVER }));
  const leftFirst = leftAt(c.tracks, scenarioFrom(c.base), 1, income, others);
  const leftStress = leftAt(c.tracks, scenarioFrom(c.stress), stress.maxMonth, income, others);
  const budget = c.livingBudget === undefined ? null : new Decimal(c.livingBudget);
  const lines = checkRegulation({
    deal: c.deal,
    value: c.price,
    loan,
    payment: qualifying,
    disposableIncome: aff.disposable,
    variable: variableAmount(c.tracks),
    termMonths: Math.max(...c.tracks.map((t) => t.months)),
  });
  return {
    equity: new Decimal(c.equity),
    reserve: new Decimal(c.reserve),
    loan,
    ltv: loan.div(c.price).mul(HUNDRED),
    qualifying,
    disposable: aff.disposable,
    ratio: aff.ratioPercent,
    first: base.first,
    total: base.total,
    stressMax: stress.max,
    stressMonth: stress.maxMonth,
    leftFirst,
    leftStress,
    marginFirst: budget && leftFirst.minus(budget),
    marginStress: budget && leftStress.minus(budget),
    variable: variableAmount(c.tracks),
    months: base.months,
    lines,
    bans: lines.filter((l) => l.status === "over").map((l) => l.id),
    aboveCapital: aff.ratioPercent.gt(PTI_CAPITAL_THRESHOLD),
  };
}

// ── The levers ─────────────────────────────────────────────────────────────

/** One thing the client can change. */
export type LeverMove =
  /** Put more of the family's savings into the purchase: the loan shrinks by the same amount. */
  | { lever: "equity"; add: Numeric }
  /** Close an existing loan before the request. `from` says where the money comes from. */
  | { lever: "close_loan"; payoff: Numeric; from: "equity" | "reserve"; index?: number }
  /** Apply later, when fewer payments are left on an obligation (lesson 4.2's 18-month rule). */
  | { lever: "wait"; months: number }
  /** Add a borrower with a recognised income (their own obligations are not modelled here). */
  | { lever: "borrower"; income: Numeric }
  /** Change every track's term by this many months (negative: shorter). */
  | { lever: "term"; months: number }
  /** Move `points` of the loan from track `from` to track `to` (1-based). */
  | { lever: "mix"; from: number; to: number; points: Numeric };

/** The case after one lever. The input is not changed. Throws when the lever cannot be pulled at all (more reserve than there is). */
export function applyMove(c: PositionCase, move: LeverMove): PositionCase {
  const next: PositionCase = { ...c, tracks: c.tracks.map((t) => ({ ...t })), obligations: c.obligations.map((o) => ({ ...o })), incomes: [...c.incomes] };
  const withLoan = (change: Numeric): TrackSpec[] => applyLever({ tracks: next.tracks, scenario: c.base }, { lever: "amount", change }).tracks;
  switch (move.lever) {
    case "equity": {
      const add = new Decimal(move.add);
      if (add.isNeg()) throw new RangeError("equity is added, not taken: use a positive amount");
      if (add.gt(c.reserve)) throw new RangeError("the reserve holds less than the equity to add");
      next.equity = new Decimal(c.equity).plus(add);
      next.reserve = new Decimal(c.reserve).minus(add);
      next.tracks = withLoan(add.neg());
      return next;
    }
    case "close_loan": {
      const payoff = new Decimal(move.payoff);
      if (payoff.isNeg()) throw new RangeError("a payoff is not negative");
      const index = move.index ?? next.obligations.findIndex((o) => o.kind === "loan");
      if (index < 0 || index >= next.obligations.length) throw new RangeError("there is no loan to close");
      next.obligations.splice(index, 1);
      if (move.from === "reserve") {
        if (payoff.gt(c.reserve)) throw new RangeError("the reserve holds less than the loan's payoff");
        next.reserve = new Decimal(c.reserve).minus(payoff);
      } else {
        // The payoff comes out of the equity the purchase would have used: the loan has to be that much larger.
        next.equity = new Decimal(c.equity).minus(payoff);
        next.tracks = withLoan(payoff);
      }
      return next;
    }
    case "wait":
      if (!Number.isInteger(move.months) || move.months < 0) throw new RangeError("waiting is a whole number of months, not negative");
      next.obligations = next.obligations.map((o) => (o.monthsLeft === null ? o : { ...o, monthsLeft: Math.max(0, o.monthsLeft - move.months) }));
      return next;
    case "borrower":
      if (new Decimal(move.income).isNeg()) throw new RangeError("an income is not negative");
      next.incomes = [...next.incomes, move.income];
      return next;
    case "term":
      next.tracks = applyLever({ tracks: next.tracks, scenario: c.base }, { lever: "term", track: "all", months: move.months }).tracks;
      return next;
    case "mix":
      next.tracks = applyLever({ tracks: next.tracks, scenario: c.base }, { lever: "percent", from: move.from, to: move.to, points: move.points }).tracks;
      return next;
  }
}

/** What a lever gains and costs. */
export interface LeverPrice {
  move: LeverMove;
  before: Position;
  after: Position;
  gain: {
    /** Percentage points the payment-to-income ratio falls (negative when it rises). */
    ratioPoints: Decimal;
    /** Shekels a month the payment the ratio uses falls. */
    paymentMonthly: Decimal;
    /** Percentage points the financing ratio falls. */
    ltvPoints: Decimal;
  };
  cost: {
    /** Shekels out of the family's pocket now. */
    cashNow: Decimal;
    /** Shekels more over the whole loan, base scenario (negative: fewer). */
    extraTotal: Decimal;
    /** Shekels a month more at the harsh scenario's highest payment. */
    stressRise: Decimal;
    /** Months of waiting. */
    months: number;
    /** The reserve that remains. */
    reserveAfter: Decimal;
  };
  /** Bans the lever crosses that the case did not cross before. */
  newBans: LineId[];
  /** True when the case after the lever crosses no ban at all. */
  allowed: boolean;
}

const cashOf = (move: LeverMove): Decimal => (move.lever === "equity" ? new Decimal(move.add) : move.lever === "close_loan" ? new Decimal(move.payoff) : ZERO);

/** Pull one lever and say what it gained and what it cost. */
export function pull(c: PositionCase, move: LeverMove): LeverPrice {
  const before = positionOf(c);
  const after = positionOf(applyMove(c, move));
  const newBans = after.bans.filter((b) => !before.bans.includes(b));
  return {
    move,
    before,
    after,
    gain: {
      ratioPoints: before.ratio.minus(after.ratio),
      paymentMonthly: before.qualifying.minus(after.qualifying),
      ltvPoints: before.ltv.minus(after.ltv),
    },
    cost: {
      cashNow: cashOf(move),
      extraTotal: after.total.minus(before.total),
      stressRise: after.stressMax.minus(before.stressMax),
      months: move.lever === "wait" ? move.months : 0,
      reserveAfter: after.reserve,
    },
    newBans,
    allowed: after.bans.length === 0,
  };
}

/**
 * The price of one percentage point of ratio: an amount divided by the points it bought.
 * Null when the lever did not lower the ratio (a price per point of nothing is not a number).
 */
export function perPoint(amount: Numeric, ratioPoints: Numeric): Decimal | null {
  const points = new Decimal(ratioPoints);
  return points.gt(0) ? new Decimal(amount).div(points) : null;
}

/**
 * The smallest amount, in whole steps, of extra equity that brings the ratio to the target or
 * below: positioning.ts's loanCut (the least that must come off the loan, which is also the extra
 * equity), checked against the reserve. Zero when the ratio is already there; null when even the
 * whole reserve does not reach it.
 */
export function smallestEquityStep(c: PositionCase, targetRatioPercent: Numeric, step: Numeric): Decimal | null {
  let cut: Decimal;
  try {
    cut = loanCut(c.tracks, positionOf(c).disposable, targetRatioPercent, step);
  } catch (e) {
    if (e instanceof RangeError && /no cut short/.test(e.message)) return null;
    throw e;
  }
  return cut.gt(c.reserve) ? null : cut;
}
