/**
 * Case A (נועם ושירה) in stage 6: four fictional banks, the requests the family could make, and the
 * levers of lesson 6.11's positioning plan — defined once. Lessons 6.9, 6.10 and 6.11 import it
 * (stage-6 author D); nobody retypes these numbers.
 *
 * Everything here is a TEACHING ASSUMPTION, not market data, not a bank's offer and not how a real
 * bank decides ("דוגמה לימודית — נתוני הלקוח והריביות להמחשה בלבד; אינם הצעת בנק או נתוני שוק
 * עדכניים"). The banks are fictional ("בנק א׳" … "בנק ד׳"): no logo, no brand. The RULES of each
 * bank (its refusal points, its steps, its financing ceiling) are the exercise's invented rules,
 * written on the page as such; the course does not know a real bank's lines (field knowledge
 * FK-H-050…055, awaiting Eylon). The arithmetic is src/lib/calc/bankpolicy.ts.
 *
 * The design, so that the case has something to teach (the course map, section 8: case A stands on
 * the edge of two lines at once, a ratio of 40.4% and a financing ratio of 74.55%):
 *   - בנק א׳  refuses above a ratio of 45%; above 40% it adds 0.15 point to every track; above a
 *             financing ratio of 70% it adds 0.10 point.
 *   - בנק ב׳  refuses above 50% (and 75% financing); above a ratio of 35% it adds 0.25 point.
 *             Cheapest list. No step on the financing ratio.
 *   - בנק ג׳  refuses above a ratio of 40% (a strict line), and adds nothing for the ratio; above a
 *             financing ratio of 72% it adds 0.20 point. Its list is the course's price list.
 *   - בנק ד׳  refuses above a financing ratio of 70%: it cannot serve case A (74.55%) at any ratio.
 * The prime track's rate is "prime minus a discount" at each bank (prime 4.75 in the course's
 * convention, case-a-mix.ts): א׳ minus 0.15, ב׳ minus 0.20, ג׳ minus 0.15, ד׳ minus 0.10.
 *
 * The requests are lesson 5.6's candidate mixes, for the same loan of 1,640,000: the initial mix,
 * half and half (all unlinked, half fixed, half variable), linked, and fixed only. Each is measured
 * by each bank at that bank's own price list.
 *
 * The car loan: 1,450 a month for 26 more months (case-a-mix.ts). To close it from the equity the
 * family would pay what is still owed: the value today of the 26 payments at the loan's own rate,
 * which the case does not state — the exercise assumes 6% a year (CAR_LOAN_RATE), a teaching
 * assumption. The money comes out of the equity, so the loan grows by the same amount.
 */
import Decimal from "decimal.js";
import { moneyString } from "../lib/calc/money.ts";
import { paymentsValueToday } from "../lib/calc/amortization.ts";
import { splitByWeights } from "../lib/calc/mix.ts";
import type { BankPolicy, LoanFile, RequestedTrack } from "../lib/calc/bankpolicy.ts";
import { CASE_A, candidate } from "./case-a-mix.ts";

const policy = (p: BankPolicy): BankPolicy => p;

export const BANKS: BankPolicy[] = [
  policy({
    id: "a",
    name: "בנק א׳",
    prices: { fixed_unlinked: "4.35", prime: "4.60", variable_unlinked: "4.15", fixed_linked: "2.95", variable_linked: "2.55" },
    ratioMax: "45",
    ratioStep: "40",
    ratioStepPoints: "0.15",
    ltvMax: "75",
    ltvStep: "70",
    ltvStepPoints: "0.10",
  }),
  policy({
    id: "b",
    name: "בנק ב׳",
    prices: { fixed_unlinked: "4.30", prime: "4.55", variable_unlinked: "4.05", fixed_linked: "2.85", variable_linked: "2.45" },
    ratioMax: "50",
    ratioStep: "35",
    ratioStepPoints: "0.25",
    ltvMax: "75",
    ltvStep: null,
    ltvStepPoints: "0",
  }),
  policy({
    id: "c",
    name: "בנק ג׳",
    prices: { fixed_unlinked: "4.40", prime: "4.60", variable_unlinked: "4.10", fixed_linked: "2.90", variable_linked: "2.50" },
    ratioMax: "40",
    ratioStep: null,
    ratioStepPoints: "0",
    ltvMax: "75",
    ltvStep: "72",
    ltvStepPoints: "0.20",
  }),
  policy({
    id: "d",
    name: "בנק ד׳",
    prices: { fixed_unlinked: "4.45", prime: "4.65", variable_unlinked: "4.20", fixed_linked: "3.00", variable_linked: "2.60" },
    ratioMax: "50",
    ratioStep: "40",
    ratioStepPoints: "0.10",
    ltvMax: "70",
    ltvStep: null,
    ltvStepPoints: "0",
  }),
];

export const bank = (id: string): BankPolicy => {
  const b = BANKS.find((x) => x.id === id);
  if (!b) throw new Error(`no bank "${id}"`);
  return b;
};

/** The requests case A could make (lesson 5.6's candidates, the ones this stage uses). */
export const REQUEST_IDS = ["initial", "half", "linked", "fixed"] as const;
export type RequestId = (typeof REQUEST_IDS)[number];

/** A Hebrew name for each request, for tables. */
export const REQUEST_NAME_HE: Record<RequestId, string> = {
  initial: "הראשוני",
  half: "חצי־חצי",
  linked: "צמוד",
  fixed: "קבועה בלבד",
};

const requested = (id: RequestId): RequestedTrack[] => candidate(id).tracks.map((t) => ({ kind: t.kind, amount: t.amount, months: t.months }));

/** The assumption of the exercise: the car loan's own rate, percent a year (the case does not state it). */
export const CAR_LOAN_RATE = "6";

/** What the family would pay to close the car loan today: the value today of the 26 payments left, rounded to the agora. */
export function carPayoff() {
  return paymentsValueToday(CASE_A.car.monthly, CAR_LOAN_RATE, CASE_A.car.monthsLeft as number);
}

/**
 * Case A's file for a request. With `closeCar` the family pays the car loan from the equity: the
 * loan grows by the payoff (each track in proportion) and the obligation is gone. With
 * `carMonthsLeft` the same file as it stands when that many payments of the car loan are left
 * (waiting: 18 left and it no longer counts, lesson 4.2).
 */
export function caseAFile(id: RequestId, opts: { closeCar?: boolean; carMonthsLeft?: number } = {}): LoanFile {
  const tracks = requested(id);
  const base = { value: CASE_A.price, income: CASE_A.recognisedIncome };
  if (opts.closeCar) {
    const loan = tracks.reduce((s, t) => s.plus(t.amount), new Decimal(0));
    const newLoan = loan.plus(moneyString(carPayoff()));
    const amounts = splitByWeights(newLoan, tracks.map((t) => t.amount));
    return { ...base, obligations: [], tracks: tracks.map((t, i) => ({ ...t, amount: amounts[i].toFixed(2) })) };
  }
  const car = opts.carMonthsLeft === undefined ? CASE_A.car : { ...CASE_A.car, monthsLeft: opts.carMonthsLeft };
  return { ...base, obligations: [car], tracks };
}

/**
 * The plan of lesson 6.11, as data: the request that goes to every bank that can serve the case, and the banks in the order the
 * plan asks them. All the banks get the SAME request, so the offers that come back are comparable (lesson 5.3).
 */
export const PLAN = {
  request: "half" as RequestId,
  /** The banks the plan asks, in order. Bank ד׳ is left out: its financing ceiling is below the case's. */
  banks: ["a", "b", "c"] as const,
  left: "d",
};
