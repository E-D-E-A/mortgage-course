/**
 * Case A (נועם ושירה) as a positioning decision (lessons 6.4 and 6.5): the case of stage 5
 * (case-a-mix.ts: price, equity, the initial mix, the incomes, the car loan, the two
 * teaching scenarios), plus the few extra teaching assumptions that the levers of lesson 6.4
 * need. Defined once here; the lesson, the calculator and the checks import it.
 *
 * EVERY number added here is a TEACHING ASSUMPTION, never data about a real family, a
 * bank's offer or the market ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת
 * בנק או נתוני שוק עדכניים"):
 *   - RESERVE: savings kept outside the equity, after the deal. Invented.
 *   - CAR_PAYOFF: what the lender would ask today to close the car loan. Invented (the
 *     26 payments of 1,450 add up to 37,700; the payoff here is lower, as a closing
 *     usually is — the course does not know how a lender prices an early closing).
 *   - BORROWER_INCOME: a parent's net monthly income, if the parent joins as a borrower.
 *     Invented; the parent's own obligations are not modelled.
 *
 * The 40% line used as the TARGET is the course's example threshold (lesson 6.2), the
 * capital threshold of Directive 329 as the team transcribed it (lesson 4.5) — not a
 * claim about how any bank decides.
 */
import { CASE_A, INITIAL_MIX, SCENARIOS } from "./case-a-mix.ts";
import type { PositionCase } from "../lib/calc/levers.ts";

export const RESERVE = "40000";
export const CAR_PAYOFF = "36000";
export const BORROWER_INCOME = "4000";
/** The ratio the example threshold sits at, percent. */
export const TARGET_RATIO = "40";
/** The step the extra-equity search moves in, shekels. */
export const EQUITY_STEP = "1000";

export const CASE_A_POSITION: PositionCase = {
  deal: CASE_A.deal,
  price: CASE_A.price,
  equity: CASE_A.equity,
  reserve: RESERVE,
  tracks: INITIAL_MIX,
  base: SCENARIOS.base,
  stress: SCENARIOS.stress,
  incomes: CASE_A.netIncomes,
  obligations: [CASE_A.car],
};
