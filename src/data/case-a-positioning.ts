/**
 * Case A (נועם ושירה) in lessons 6.9–6.11 (stage-6 author D): the four fictional banks' RULES, the
 * levers the plan can pull, and the plan itself — defined once. The lessons, the simulation, the
 * planner and the checks import it; nobody retypes these numbers.
 *
 * Everything here is a TEACHING ASSUMPTION, not market data, not a bank's offer and not how a real
 * bank decides ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק
 * עדכניים"). The banks are the fictional "בנק א׳" … "בנק ד׳" of lessons 6.6–6.8 and use THEIR price
 * lists (src/data/case-a-offers.ts, BANK_PRICES): the price a bank put on the family's request, the
 * initial mix. What this file adds is the exercise's invented RULES, which say how that price
 * changes when the file sits in a better place, and when the bank refuses. The arithmetic is
 * src/lib/calc/bankpolicy.ts. The course does not know a real bank's lines (field knowledge
 * FK-H-050…055, awaiting Eylon); the page says so wherever the rules appear.
 *
 * The rules of each bank (percent; "relief" is taken off the rate of every track):
 *   - בנק א׳  refuses above a ratio of 45; relief of 0.15 point at a ratio of 40 or less; relief of
 *             0.10 point at a financing ratio of 70 or less; refuses above a financing ratio of 75.
 *   - בנק ב׳  refuses above a ratio of 50; relief of 0.25 point at a ratio of 35 or less; no relief on
 *             the financing ratio; refuses above 75.
 *   - בנק ג׳  refuses above a ratio of 50; relief of 0.20 point at a ratio of 38 or less; relief of
 *             0.10 point at a financing ratio of 72 or less; refuses above 75.
 *   - בנק ד׳  refuses above a ratio of 50; relief of 0.10 point at a ratio of 40 or less; refuses
 *             above a financing ratio of 70: case A (74.55%) cannot be served there at any ratio.
 * With these rules the initial mix, which sits above every relief line at every bank, is priced at
 * the list — exactly the offers of lessons 6.6–6.8 — and bank ד׳ refuses it.
 *
 * The levers are lesson 6.4's (src/data/case-a-levers.ts and src/lib/calc/levers.ts): more equity
 * from the savings, closing the car loan from the savings, waiting until fewer than 18 payments are left, a
 * parent as a second borrower. Their amounts (the 40,000 ₪ of savings, the 36,000 ₪ payoff, the
 * parent's 4,000 ₪) are that lesson's teaching assumptions. The plan's equity is the smallest whole
 * thousand that leaves the ratio at least a tenth of a point under the 40% line (a rule of the
 * workshop, so that a small move of the rates does not push the family back over it).
 */
import Decimal from "decimal.js";
import { applyMove, type LeverMove, type PositionCase, positionOf, smallestEquityStep } from "../lib/calc/levers.ts";
import type { BankPolicy, LoanFile } from "../lib/calc/bankpolicy.ts";
import { BANK_IDS, BANK_NAME, BANK_PRICES, type BankId } from "./case-a-offers.ts";
import { BORROWER_INCOME, CAR_PAYOFF, CASE_A_POSITION, EQUITY_STEP, TARGET_RATIO } from "./case-a-levers.ts";
import { CASE_A } from "./case-a-mix.ts";

type Rules = Omit<BankPolicy, "id" | "name" | "prices">;

const RULES: Record<BankId, Rules> = {
  a: { ratioMax: "45", ratioReliefLine: "40", ratioReliefPoints: "0.15", ltvMax: "75", ltvReliefLine: "70", ltvReliefPoints: "0.10" },
  b: { ratioMax: "50", ratioReliefLine: "35", ratioReliefPoints: "0.25", ltvMax: "75", ltvReliefLine: null, ltvReliefPoints: "0" },
  c: { ratioMax: "50", ratioReliefLine: "38", ratioReliefPoints: "0.20", ltvMax: "75", ltvReliefLine: "72", ltvReliefPoints: "0.10" },
  d: { ratioMax: "50", ratioReliefLine: "40", ratioReliefPoints: "0.10", ltvMax: "70", ltvReliefLine: null, ltvReliefPoints: "0" },
};

/** The four fictional banks: lesson 6.6–6.8's names and price lists, with this lesson's rules. */
export const BANKS: BankPolicy[] = BANK_IDS.map((id) => ({ id, name: BANK_NAME[id], prices: BANK_PRICES[id], ...RULES[id] }));

export const bank = (id: string): BankPolicy => {
  const b = BANKS.find((x) => x.id === id);
  if (!b) throw new Error(`no bank "${id}"`);
  return b;
};

// ── The levers ─────────────────────────────────────────────────────────────

/** The margin the plan leaves under the 40% line, in percentage points (a rule of the workshop). */
export const MARGIN = "0.1";
/** The ratio the plan aims at: the line minus the margin. */
export const PLAN_RATIO = new Decimal(TARGET_RATIO).minus(MARGIN).toString();
/** How many payments of the car loan the family waits out: 26 left, 17 after the wait: below the open edge of 18 (lessons 4.2 and 6.4). */
export const WAIT_MONTHS = 9;

/** The smallest whole thousand of the savings that puts the ratio at most PLAN_RATIO (lesson 6.4's search, at a stricter target). */
export function planEquity(): Decimal {
  const e = smallestEquityStep(CASE_A_POSITION, PLAN_RATIO, EQUITY_STEP);
  if (e === null) throw new Error("the savings do not reach the plan's ratio");
  return e;
}

export type LeverKey = "equity" | "car" | "wait" | "parent";

/** The four levers of the workshop's menu, with the move each one makes. `equity` takes its amount from the caller. */
export const LEVER_NAME_HE: Record<LeverKey, string> = {
  equity: "עוד הון עצמי מהחסכונות",
  car: "סגירת הלוואת הרכב מהחסכונות",
  wait: "המתנה עד שהלוואת הרכב מפסיקה להיספר",
  parent: "הורה כלווה נוסף",
};

export function movesFor(chosen: { equity?: Numeric; car?: boolean; wait?: boolean; parent?: boolean }): LeverMove[] {
  const moves: LeverMove[] = [];
  if (chosen.equity && new Decimal(chosen.equity).gt(0)) moves.push({ lever: "equity", add: chosen.equity });
  if (chosen.car) moves.push({ lever: "close_loan", payoff: CAR_PAYOFF, from: "reserve" });
  if (chosen.wait) moves.push({ lever: "wait", months: WAIT_MONTHS });
  if (chosen.parent) moves.push({ lever: "borrower", income: BORROWER_INCOME });
  return moves;
}
type Numeric = Decimal.Value;

/** Case A after some levers: the case itself (levers.ts), which positionOf reads. Throws when the savings do not cover the levers. */
export function caseAfter(moves: LeverMove[]): PositionCase {
  return moves.reduce(applyMove, CASE_A_POSITION);
}

/** The file a bank reads for a case: the value, the recognised income, what still counts against it, and the tracks asked for. */
export function fileOf(c: PositionCase): LoanFile {
  return {
    value: String(c.price),
    income: c.incomes.reduce<Decimal>((s, x) => s.plus(x), new Decimal(0)).toString(),
    obligations: c.obligations,
    tracks: c.tracks.map((t) => ({ kind: t.kind, amount: String(t.amount), months: t.months })),
  };
}

/** Case A's file after some levers; with none, the family's own request. */
export const caseAFile = (moves: LeverMove[] = []): LoanFile => fileOf(caseAfter(moves));

/** The plan of lesson 6.11: the levers it pulls (the equity to add, in shekels, from planEquity()). */
export function planMoves(): LeverMove[] {
  return movesFor({ equity: planEquity().toString() });
}

/** The banks the plan asks, in order. Bank ד׳ is left out: its financing ceiling is below the case's, and no lever the case has reaches it. */
export const PLAN_BANKS: BankId[] = ["a", "b", "c"];
export const LEFT_OUT: BankId = "d";

/** The day the plan's requests go out, and how many business days each bank takes to answer (lesson 6.6's worked example, with the same four banks). */
export const REQUEST_DATE = "2026-11-01";
export const ANSWER_AFTER: Record<BankId, number> = { a: 2, b: 4, c: 5, d: 7 };

export { CASE_A, positionOf };
